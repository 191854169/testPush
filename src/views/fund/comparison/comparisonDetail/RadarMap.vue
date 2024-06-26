// 基础雷达图 - 可能会兼容基金雷达图和用户雷达图（未来通过）
<template>
    <div class="radar-map card">
        <header>
            <h3 class="title">{{ $t('radar.comprehensivePerformance') }}</h3>
        </header>
        <div class="chart" ref="chart"></div>

        <fosun-table
            ref="table"
            class="outter-table"
            :class="{ 'show-shadow': showShadow }"
            :data="list"
            :columns="columns"
            :showEmptyTip="false"
            :canPullDown="false"
            @body-scroll-left="onBodyScrollLeft"
            @dispatchScroll="dispatchScrollHandler"
        >
            <template v-slot:label="props">
                <span class="label-column">{{ props.item.label }}</span>
            </template>
            <template v-slot:[item.symbol]="props" v-for="(item, idx) in fundList">
                <p :key="idx" class="value">
                    <span
                        v-if="['yield', 'upCapture', 'downCapture'].includes(props.item.key) && item[props.item.key]?.value"
                        v-riseFall="{ value: item[props.item.key]?.value || undefined, base: 2 }"
                    ></span>
                    <span v-else-if="props.item.key === 'score'">{{ item[props.item.key] ? item[props.item.key] + $t('radar.score') : '--' }}</span>
                    <span v-else>{{ item[props.item.key]?.value | floatToRatioFilter({ sign: false }) }}</span>
                </p>
            </template>
        </fosun-table>
        <ul class="tabs" @click="onTabChange">
            <li class="tab mask" :class="{ selected: item.key === activeTab }" v-for="item in tabs" :key="item.key" :data-key="item.key">
                {{ item.label }}
            </li>
        </ul>
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, DatasetComponent, RadarComponent } from 'echarts/components'
import { RadarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { colorToRGB } from '@/utils/tools.js'
import FosunTable from '@/components/Table.vue'
import { getCompareRadarData } from '@/apis/fund/fund.js'
import { FUND_RADAR_MAP, PERIOD_MAP } from '../../config/common'
import { floatToRatio, isUndefined } from '@/utils'
import { accMul, accDiv } from '@/utils/accurate'
const plugins = [GridComponent, RadarChart, CanvasRenderer, UniversalTransition, DatasetComponent, RadarComponent]

echarts.use(plugins)

export default {
    name: 'radar-map',
    components: {
        FosunTable,
    },
    props: {
        showMoreBtn: {
            type: Boolean,
            default: true,
        },
        symbols: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            list: [
                {
                    label: this.$t('radar.comprehensiveScore'),
                    key: 'score',
                },
                ...FUND_RADAR_MAP.options.map(i => ({ key: i.key, label: i.value })),
            ],
            tabs: PERIOD_MAP.YEAR_OPTIONS,
            activeTab: 'y3',
            fundList: [],
            showShadow: false, // 是否展示阴影
        }
    },
    watch: {
        symbols: {
            handler() {
                this.initChart()
            },
            deep: true,
        },
    },
    computed: {
        columns() {
            const partColumns = this.fundList.map(i => ({
                title: i.name,
                key: i.symbol + '',
                slot: true,
                className: 'ayalysis-detail right-column',
            }))
            return [
                {
                    title: this.$t('fundName'),
                    key: 'label',
                    fixed: true,
                    slot: true,
                    className: 'fixed-column',
                },
                ...partColumns,
            ]
        },
    },
    filters: {
        floatToRatioFilter(v, options = {}) {
            return isUndefined(v) ? '--' : floatToRatio(v, options)
        },
    },
    mounted() {
        this.collectContext(this.$refs.table)
        this.initChart()
    },
    methods: {
        collectContext(context) {
            this.$emit('collectContext', context)
        },
        dispatchScrollHandler(v) {
            this.$emit('dispatchScroll', v)
        },
        onTabChange(e) {
            const { key } = e.target.dataset
            if (!key || key === this.activeTab) return
            this.activeTab = key
            this.$emit('peroid-change', this.activeTab)
            this.initChart()
        },
        async getDetail() {
            try {
                const params = {
                    symbols: this.symbols,
                    period: this.activeTab,
                }
                const { result } = await getCompareRadarData(params)
                this.fundList = result?.list || []
            } catch (e) {
                console.error(e)
                this.fundList = []
            }
        },
        getRemFontSize(fontSize) {
            const docEl = document.documentElement
            const uiWidth = 375 // 设计稿宽度
            const maxClientWidth = 750 // 手机设备最大宽度
            console.log('docEl.clientWidth' + docEl.clientWidth)
            const clientWidth = docEl.clientWidth

            if (!clientWidth) {
                return
            }
            let scale = 1
            if (clientWidth >= maxClientWidth) {
                scale = accDiv(maxClientWidth, uiWidth)
            } else {
                scale = accDiv(clientWidth, uiWidth)
            }
            return Math.floor(accMul(fontSize, scale))
        },
        async initChart() {
            await this.getDetail()
            const chartDom = this.$refs.chart
            const myChart = this.chart || echarts.init(chartDom)
            const colors = ['#278AFF', '#FFA800', '#8f4be5', '#ff7875']
            const areaColors = colors.map(color => colorToRGB(color, { opa: 0.1 }))
            const tabList = FUND_RADAR_MAP.options
                .map((i, idx) => {
                    const res = {
                        key: i.key,
                        label: i.value,
                        rich: ['text'].map(i => `${i}${idx + 1}`),
                        cur: '',
                        average: '',
                    }
                    return res
                })
                .reverse()
            const seriesData = this.fundList.map((i, idx) => {
                const res = {
                    value: tabList.map(({ key }) => i[key]?.quintile || '0'),
                    name: i.symbol,
                    areaStyle: {
                        color: areaColors[idx],
                    },
                    symbol: 'none',
                }
                return res
            })
            console.log(`Feng.chen:: 15:41:00 seriesData ===> `, seriesData)
            const textClass = {
                color: '#9c9c9c',
                fontSize: this.getRemFontSize(12),
                lineHeight: 17,
            }
            const option = {
                color: colors,
                radar: {
                    // shape: 'circle',
                    radius: [0, this.getRemFontSize(80)],
                    startAngle: 120,
                    splitNumber: 5,
                    splitArea: {
                        show: false,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#eee',
                        },
                    },
                    axisLabel: {
                        lineStyle: {
                            color: 'red',
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#eee',
                        },
                    },
                    indicator: tabList.map(item => {
                        return { name: { ...item }, max: 5 }
                    }),
                    nameGap: 12,
                    axisName: {
                        formatter: function (value) {
                            const { label, rich } = value
                            const [text] = rich
                            return `{${text}|${label}}`
                        },
                        rich: {
                            // 收益明细
                            text1: {
                                padding: [0, 0, 6, 5],
                                ...textClass,
                            },
                            // 市场上行表现
                            text2: {
                                padding: [0, 0, 0, 0],
                                ...textClass,
                            },
                            // 回撤管理
                            text3: {
                                padding: [15, 0, 0, 6],
                                ...textClass,
                            },
                            // 波幅管理
                            text4: {
                                padding: [15, 6, 0, 0],
                                ...textClass,
                            },
                            // 市场下行表现
                            text5: {
                                padding: [0, 0, 0, 0],
                                ...textClass,
                            },
                            // 超越市场能力
                            text6: {
                                padding: [0, 5, 6, 0],
                                ...textClass,
                            },
                        },
                    },
                },
                series: [
                    {
                        name: 'symbols radar',
                        type: 'radar',
                        lineStyle: {
                            width: 1,
                        },
                        data: seriesData,
                    },
                ],
            }
            myChart.setOption(option)
        },
        onBodyScrollLeft({ scrollLeft } = {}) {
            if (typeof scrollLeft === 'number') {
                this.showShadow = scrollLeft !== 0
            }
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px 12px 0;
    padding: 15px 12px 20px !important;
    background: #fff;
    border-radius: 8px;
    user-select: none;
}

.radar-map {
    header {
        display: flex;
        align-items: center;

        .title {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        img {
            width: 16px;
            margin-left: 6px;
        }

        .view-more-box {
            display: flex;
            flex: 1 0 auto;
            align-items: center;
            justify-content: flex-end;
            text-align: right;

            .view-more {
                color: #666;
                font-size: 12px;
                line-height: 16px;
                background: none;
                border: none;
                outline: none;
            }

            img {
                width: 12px;
                margin-left: 4px;
            }
        }
    }

    .summary {
        margin-top: 15px;
        color: #666;
        font-size: 14px;
        line-height: 20px;

        span {
            color: @theme;
        }
    }

    .chart {
        height: 184px;
        margin: 24px 0 21px;
    }

    .tabs {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding: 6px 0;

        .tab {
            width: 112px;
            color: #666;
            font-size: 12px;
            line-height: 24px;
            text-align: center;
            border-radius: 18px;

            &.selected {
                color: #ff6907;
                font-weight: 500;
                background: rgba(255, 99, 7, 0.1);
            }

            &.mask {
                position: relative;

                &::after {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 111;
                    content: '';
                }
            }
        }
    }

    /deep/ .outter-table {
        margin: 0 -12px;

        .content {
            overflow: hidden;
        }

        .fixed {
            flex: 0 0 auto;
            width: 96px;

            .title {
                z-index: 1001;
                width: 84px;
                margin-left: 12px;
                padding: 0;
                overflow: visible;
                color: #666;
                font-size: 12px;
                line-height: 34px;
                // position: relative;
                &::after {
                    position: absolute;
                    right: -312px;
                    bottom: 0;
                    left: -12px;
                    height: 1px;
                    background: #efefef;
                    transform: scaleY(0.5);
                    content: '';
                }
            }
        }

        &.show-shadow {
            .fixed-body {
                &::after {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    z-index: 2222; // 为了覆盖在fixed title内容
                    width: 84px;
                    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
                    content: '';
                }
            }
        }

        .fixed-body {
            margin-left: 12px;

            .label-column {
                margin-top: 20px;
                color: #666;
                font-size: 12px;
                line-height: 16px;
            }
        }

        .scroll {
            .title .titleItem {
                position: relative;
                flex: 1 0 92px;
                justify-content: flex-start;
                max-width: 92px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;

                &::before {
                    position: absolute;
                    top: 50%;
                    left: -8px;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    transform: translateY(-50%);
                    content: '';
                }

                &:nth-child(1) {
                    &::before {
                        background: #278aff;
                    }
                }

                &:nth-child(2) {
                    &::before {
                        background: #ffa800;
                    }
                }

                &:nth-child(3) {
                    &::before {
                        background: #8f4be5;
                    }
                }

                &:nth-child(4) {
                    &::before {
                        background: #ff7875;
                    }
                }
            }

            &-title-container {
                left: 96px;
                height: 34px;

                .title {
                    height: 34px;
                    padding-bottom: 0;
                    line-height: 34px;

                    &::after {
                        position: absolute;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        height: 1px;
                        background: #efefef;
                        transform: scaleY(0.5);
                        content: '';
                    }
                }
            }

            .body {
                .row {
                    margin-top: 20px;

                    .right-column {
                        height: auto;
                    }
                }
            }
        }

        .item {
            height: auto;
        }

        .fixed-column,
        .right-column {
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }

        .right-column {
            flex: 1 0 92px;
            max-width: 92px;
            margin-left: 20px;
            color: #2f2f2f;
            text-align: right;
            text-align: left;

            span {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .value {
                color: #2f2f2f;
                font-size: 14px;
            }
        }
    }
}
</style>
