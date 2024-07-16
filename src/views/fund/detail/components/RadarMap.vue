// 基础雷达图 - 可能会兼容基金雷达图和用户雷达图（未来通过）
<template>
    <div class="radar-map card" v-if="!isAllEmpty">
        <header>
            <h3 class="title">{{ $t('radar.comprehensivePerformance') }}</h3>
            <multi-img name="icon-remind" directory="fund" @click="onRemind"></multi-img>
            <div class="view-more-box" v-if="showMoreBtn" @click="onViewMore">
                <button class="view-more">{{ $t('radar.viewDetail') }}</button>
                <multi-img name="icon_arrow_left" directory="fund"></multi-img>
            </div>
        </header>
        <p class="summary">
            <label>{{ activeTab | periodFilter(tabs) }}</label>
            <label
                v-html="
                    $t('radar.greatThanAverage', {
                        percent: `<span>${isOnlyOneFundInCategory || isEmpty ? '--' : radarData.scoreBeyond || '--'}%</span>`,
                    })
                "
            ></label>
        </p>
        <div class="tool-tips">
            <div class="content">
                <div class="content-item">
                    <p class="label">{{ $t('selfFund') }}</p>
                    <p class="value">{{ isEmpty ? '--' : radarData.score ? radarData.score + $t('radar.score') : '--' }}</p>
                </div>
                <div class="content-item">
                    <p class="label">{{ $t('sameAverage') }}</p>
                    <p class="value">{{ isEmpty ? '--' : categoryRadarData.score ? categoryRadarData.score + $t('radar.score') : '--' }}</p>
                </div>
            </div>
        </div>
        <p class="empty" v-if="isEmpty">
            <multi-img name="noData" directory="common"></multi-img>
            <span>{{ $t('noData') }}</span>
        </p>
        <div class="chart" v-else ref="chart"></div>
        <ul class="tabs" v-if="showTabs" @click="onTabChange">
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
import { getRadarData } from '@/apis/fund/fund.js'
import { FUND_RADAR_MAP, PERIOD_MAP } from '../../config/common'
import { isEmpty } from '../../../../utils'
import { accMul, accDiv } from '@/utils/accurate'
import pathnames from '@/config/H5Pathname.js'
const plugins = [GridComponent, RadarChart, CanvasRenderer, UniversalTransition, DatasetComponent, RadarComponent]

echarts.use(plugins)

export default {
    name: 'radar-map',
    props: {
        showMoreBtn: {
            type: Boolean,
            default: true,
        },
        initPeriod: {
            type: String,
            default: '',
        },
        showTabs: {
            type: Boolean,
            default: true,
        },
        period: {
            type: String,
            default: 'y3',
        },
    },
    data() {
        return {
            tabs: PERIOD_MAP.YEAR_OPTIONS,
            activeTab: 'y3',
            loaded: false,
            periodMap: {
                y1: {
                    radarData: {},
                    categoryRadarData: {},
                    isEmpty: false,
                },
                y3: {
                    radarData: {},
                    categoryRadarData: {},
                    isEmpty: false,
                },
                y5: {
                    radarData: {},
                    categoryRadarData: {},
                    isEmpty: false,
                },
            },
        }
    },
    filters: {
        periodFilter(v, tabs) {
            return tabs.find(i => i.key === v)?.label || '--'
        },
    },
    computed: {
        radarData() {
            return this.periodMap[this.activeTab].radarData || {}
        },
        categoryRadarData() {
            return this.periodMap[this.activeTab].categoryRadarData || {}
        },
        isEmpty() {
            return this.periodMap[this.activeTab].isEmpty
        },
        isOnlyOneFundInCategory() {
            const { categorySize } = this.categoryRadarData
            return !!(categorySize && categorySize === 1)
        },
        isAllEmpty() {
            const periods = Object.keys(this.periodMap)
            const emptyList = periods.map(period => {
                return this.checkPeriodEmpty(period)
            })
            return emptyList.every(item => item)
        },
    },
    watch: {
        period(val) {
            if (val && !this.showTabs) {
                this.activeTab = val
                this.initChart()
            }
        },
    },
    created() {
        this.initPeriod && (this.activeTab = this.initPeriod)
    },
    mounted() {
        this.initChart()
    },
    methods: {
        onTabChange(e) {
            const { key } = e.target.dataset
            if (!key || key === this.activeTab) return
            this.activeTab = key
            this.$emit('period-change', this.activeTab)
            this.initChart()
        },
        async getData() {
            try {
                if (this.loaded) {
                    return
                }
                const params = {
                    symbol: this.$route.query.symbol,
                }
                const { result } = (await getRadarData(params)) || {}
                const radarList = result?.radarList || []
                Object.keys(this.periodMap).forEach(period => {
                    const data = radarList.find(item => item.period === period)
                    if (data) {
                        const { radar, categoryRadar } = data || {}
                        this.periodMap[period].radarData = radar || {}
                        this.periodMap[period].categoryRadarData = categoryRadar || {}
                    }
                })
                this.loaded = true
                // 没有强调年份，且如近1年有数据，而近3年无数据，则雷达图默认显示近1年数据。
                if (!this.initPeriod && isEmpty(this.periodMap['y3'].radarData)) {
                    this.activeTab = 'y1'
                }
            } catch (e) {
                console.error('getRadarData===>e:', e)
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

        /**
         * 校验是否为空
         * @params period
         * @returns { Boolean } true-为空，false-非空
         */
        checkPeriodEmpty(period) {
            const radarData = this.periodMap[period].radarData || {}
            const categoryRadarData = this.periodMap[period].categoryRadarData || {}
            if (isEmpty(radarData) || isEmpty(categoryRadarData)) return true
            for (const key of Object.keys(FUND_RADAR_MAP.keysMap)) {
                const radar = radarData[key] || {}
                const categoryRadar = categoryRadarData[key] || {}
                if (!(radar.quintile && categoryRadar.quintile)) {
                    return true
                }
            }
            return false
        },
        async initChart() {
            await this.getData()
            const colors = ['#FFA800', '#278AFF']
            const areaColors = colors.map(color => colorToRGB(color, { opa: 0.1 }))
            const selfFundData = []
            const simliarFundData = []
            const tabList = FUND_RADAR_MAP.options
                .map((i, idx) => {
                    const res = {
                        key: i.key,
                        label: i.value,
                        rich: ['text'].map(i => `${i}${idx + 1}`),
                        cur: '',
                        average: '',
                    }

                    const radar = this.radarData[i.key] || {}
                    const categoryRadar = this.categoryRadarData[i.key] || {}
                    selfFundData.push((res.cur = radar.quintile))
                    simliarFundData.push((res.average = categoryRadar.quintile))
                    if (!(res.cur && res.average)) {
                        this.periodMap[this.activeTab].isEmpty = true
                    }
                    return res
                })
                .reverse()
            // 跟tabList的顺序保持一致
            selfFundData.reverse()
            simliarFundData.reverse()
            if (this.periodMap[this.activeTab].isEmpty) return

            const chartDom = this.$refs.chart
            // debugger // eslint-disable-line
            const myChart = this.chart || echarts.init(chartDom)
            const textClass = { color: '#9c9c9c', fontSize: this.getRemFontSize(12), lineHeight: 17, align: 'center' }
            const option = {
                color: colors,
                radar: {
                    radius: [0, this.getRemFontSize(80)],
                    startAngle: 120,
                    splitNumber: 5,
                    splitArea: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: '#eee',
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
                        fontFamily:
                            '-apple-system, BlinkMacSystemFont, "PingFang SC","Helvetica Neue",STHeiti,"Microsoft Yahei",Tahoma,Simsun,sans-serif',
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
                        name: 'Budget vs spending',
                        type: 'radar',
                        lineStyle: {
                            width: 1,
                        },
                        data: [
                            {
                                value: simliarFundData,
                                name: 'similar-fund',
                                areaStyle: {
                                    color: areaColors[0],
                                },
                                symbol: 'none',
                            },
                            {
                                value: selfFundData,
                                name: 'self-fund',
                                areaStyle: {
                                    color: areaColors[1],
                                },
                                symbol: 'none',
                            },
                        ],
                    },
                ],
            }
            myChart.setOption(option)
        },
        onViewMore() {
            // const querys = [
            //     ['symbol', this.$route.query.symbol],
            //     ['type', this.$route.query.type],
            //     ['period', this.activeTab],
            // ]
            // const base_hash = '/comprehensive-performance'
            // const hash = querys.reduce((str, [k, v], idx) => {
            //     str += `${k}=${v}${idx !== querys.length - 1 ? '&' : ''}`
            //     return str
            // }, base_hash + '?')
            // let url = `${location.origin}${location.pathname}#${hash}`
            const base_hash = '/comprehensive-performance'
            const queryObj = {
                symbol: this.$route.query.symbol,
                type: this.$route.query.type,
                period: this.activeTab,
            }
            const url = `${location.origin}/wealth/fund.html#${base_hash}?type=${queryObj.type}&symbol=${queryObj.symbol}&period=${queryObj.period}`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            this.$router.push({
                path: `${base_hash}`,
                query: { ...queryObj },
            })
        },

        onRemind() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=FUNDRADAR-DIRECTIONS`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px 12px 0;
    padding: 15px 12px 26px;
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

        /deep/ span {
            color: @theme;
            font-weight: @fontBold;
        }
    }

    .tool-tips {
        margin: 18px 0 24px;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 4px;

        .content {
            display: flex;
            justify-content: space-between;

            .content-item {
                position: relative;
                display: flex;
                justify-content: space-between;
                width: 112px;
                margin-left: 12px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;

                .label {
                    color: #2f2f2f;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
                }

                .value {
                    color: @theme;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .content-item::before {
                position: absolute;
                top: 50%;
                left: -12px;
                width: 6px;
                height: 6px;
                background-color: #ffa800;
                border-radius: 50%;
                transform: translateY(-50%);
                content: '';
            }

            .content-item:first-of-type::before {
                background-color: #278aff;
            }
        }
    }

    .chart {
        height: 184px;
    }

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 184px;
        color: #9c9c9c;
        font-size: 14px;
        line-height: 20px;

        img {
            width: 104px;
            margin-bottom: 12px;
        }
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
                color: @theme;
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
}
</style>
