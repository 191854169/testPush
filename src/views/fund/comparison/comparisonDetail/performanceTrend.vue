<template>
    <div class="performance-trend">
        <h3 class="title">{{ $t('performanceTrend') }}</h3>
        <div class="content" :class="{ 'moving-bg': moving }">
            <div class="date">{{ currentDate }}</div>
            <div class="content-body">
                <div class="content-item" v-for="(item, index) in tooltips" :key="item.symbol">
                    <i :style="{ 'background-color': fundColors[index] }"></i>
                    <p class="name line-elipsis">{{ item.name }}</p>
                    <p class="value" v-riseFall="item.value"></p>
                </div>
            </div>
        </div>
        <div class="chart-trend" v-trendLoading="loading">
            <div class="trend" ref="chart"></div>
        </div>
        <ul class="btns" @click="onBtnClick">
            <li
                class="btn mask"
                :class="{ selected: item.key === activeTab }"
                v-for="item in btns"
                :key="item.key"
                :data-key="item.key"
                :data-value="item.value"
            >
                <button>{{ item.label }}</button>
            </li>
        </ul>
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent, DatasetComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { getComparePerfTrend } from '@/apis/fund/fund.js'
import { floatToRatio } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'
import { fundColors } from '@/views/fund/comparison/config/common.js'

const plugins = [
    GridComponent,
    TooltipComponent,
    LineChart,
    CanvasRenderer,
    UniversalTransition,
    DatasetComponent,
    MarkLineComponent,
    MarkPointComponent,
]

echarts.use(plugins)

export default {
    name: 'comparison-performance-trend',
    filters: {
        thousandsFilter,
    },
    props: {
        fundList: {
            type: Array,
            default: () => [],
        },
        symbols: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            fundColors,
            currentDate: '',
            moving: false,
            btns: [
                {
                    key: 'm1',
                    value: '1',
                    label: this.$t('nearOneMonth'),
                },
                {
                    key: 'm3',
                    value: '3',
                    label: this.$t('nearThreeMonth'),
                },
                {
                    key: 'm6',
                    value: '6',
                    label: this.$t('nearSixMonth'),
                },
                {
                    key: 'y1',
                    value: '12',
                    label: this.$t('nearOneYear'),
                },
                {
                    key: 'y3',
                    value: '36',
                    label: this.$t('nearThreeYear'),
                },
                {
                    key: 'y5',
                    value: '60',
                    label: this.$t('nearFiveYear'),
                },
            ],
            activeTab: 'm1',
            tooltips: [], // item: { name, value, symbol }
            list: {
                m1: null,
                m3: null,
                m6: null,
                y1: null,
                y3: null,
                y6: null,
            },
            loading: true,
        }
    },
    computed: {
        fundNameMap() {
            return this.fundList.reduce((pre, cur) => {
                pre[cur.symbol] = cur.name
                return pre
            }, {})
        },
    },
    watch: {
        fundList: {
            handler(v) {
                if (v) {
                    this.tooltips = []
                    for (const item of v) {
                        this.tooltips.push({
                            name: item.name,
                            value: '',
                            symbol: item.symbol,
                        })
                    }
                }
            },
            deep: true,
        },
        symbols: {
            handler() {
                if (this._isMounted) {
                    this.list = {
                        m1: null,
                        m3: null,
                        m6: null,
                        y1: null,
                        y3: null,
                        y6: null,
                    }
                    this.init()
                }
            },
            deep: true,
        },
    },
    mounted() {
        const unWatch = this.$watch(
            'fundList',
            v => {
                if (v) {
                    this.tooltips = []
                    for (const item of v) {
                        this.tooltips.push({
                            name: item.name,
                            value: '',
                            symbol: item.symbol,
                        })
                    }
                    this.init()
                }
                unWatch()
            },
            {
                deep: true,
            }
        )
    },
    methods: {
        init() {
            this.loading = true
            this.getTrend()
                .then(data => {
                    this.initChart(data)
                })
                .catch(e => {
                    console.log('e ====>', e)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        async getTrend() {
            // 已有数据
            let data = this.list[this.activeTab]
            if (data) return data
            const params = {
                symbols: this.symbols,
                period: this.activeTab,
            }
            const { result } = (await getComparePerfTrend(params)) || {}
            const list = result?.list || []
            const dataList = list.map(item => {
                return item.data || []
            })
            const xData = Array.from(new Set(dataList.flat().map(i => i.date)))
            xData.sort((a, b) => {
                return new Date(a).getTime() - new Date(b).getTime()
            })
            const yDataList = []
            for (const item of list) {
                const dataMap = (item.data || []).reduce((pre, cur) => {
                    pre[cur.date] = cur.return
                    return pre
                }, {})
                yDataList.push(
                    xData.map(date => {
                        return dataMap[date] || undefined
                    })
                )
            }
            data = {
                xData: xData.map(i => i.replace(/-/g, '/')),
                yDataList,
            }
            this.list[this.activeTab] = data
            return data
        },

        // 渲染图形
        initChart(options = {}) {
            const {
                xData,
                yDataList, // 数据格式: [ [ value, value, undefined, ... ],... ]
            } = options
            //  x y 数据长度已对齐
            const chartDom = this.$refs.chart
            if (this.chart) {
                this.chart.dispose()
                this.chart = null
            }
            const myChart = echarts.init(chartDom)
            this.chart = myChart
            const yData = Array.from(
                new Set(
                    yDataList
                        .map(list => list.filter(item => item !== undefined))
                        .flat()
                        .map(i => +i)
                )
            )
            const xInterval = Math.ceil((xData.length - 3) / 2) // X轴的间距
            const min = Math.min(...yData)
            const max = Math.max(...yData)
            const yInterval = (max - min) / 4
            // 公共line样式
            const commonLineStyle = {
                type: 'line',
                animation: false,
                lineStyle: {
                    width: 1,
                },
                showSymbol: false,
                symbol: 'circle',
                symbolSize: 3,
            }
            const series = yDataList.map(item => {
                return {
                    ...commonLineStyle,
                    data: item,
                }
            })

            const option = {
                color: fundColors,
                axisPointer: {
                    zLevel: 1,
                },
                tooltip: {
                    trigger: 'axis',
                    triggerOn: 'mousemove',
                    axisPointer: {
                        type: 'line',
                        snap: true,
                        lineStyle: {
                            color: '#278AFF',
                            width: 0.5,
                        },
                        label: {
                            show: true,
                            // width: 30,
                            lineHeight: 13,
                            color: '#fff',
                            fontSize: 9,
                            backgroundColor: '#278AFF',
                            padding: [0, 3, 0, 3],
                        },
                    },
                    showContent: false,
                },
                grid: {
                    right: '0%',
                    left: '12%',
                    top: '4%',
                    bottom: '12%',
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    show: true,
                    boundaryGap: false,
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: '#666',
                        fontSize: 8,
                        // showMinLabel: true,
                        showMaxLabel: true,
                        interval: xInterval,
                        formatter: (val, index) => {
                            if (['m1', 'm3', 'm6'].includes(this.activeTab)) {
                                val = val.replace(/\d{4}\//, '').replace(/-/g, '/')
                            } else {
                                val = val.replace(/-/g, '/')
                            }
                            if (xData.length > 1) {
                                if (index === 0) {
                                    return `{first|${val}}`
                                }
                                // 中间数据
                                if (index + 1 === xData.length) {
                                    return `{last|${val}}`
                                }
                                return `{middle|${val}}`
                            }
                            return ''
                        },
                        rich: {
                            first: {
                                padding: [0, -40, 0, 0],
                                color: '#666',
                                fontSize: 8,
                            },
                            middle: {
                                padding: [0, 10, 0, 0],
                                color: '#666',
                                fontSize: 8,
                            },
                            last: {
                                padding: [0, 55, 0, 0],
                                color: '#666',
                                fontSize: 8,
                            },
                        },
                    },
                    axisTick: {
                        show: false,
                        interval: 2,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#f6f6f6',
                            width: 0.5,
                        },
                    },
                },
                yAxis: {
                    type: 'value',
                    show: true,
                    min,
                    max,
                    interval: yInterval,
                    axisLabel: {
                        show: true,
                        formatter: v => {
                            return floatToRatio(v, { rate: true, base: 2, toFixed: true, sign: true })
                        },
                        color: '#666',
                        fontSize: 8,
                        margin: 2,
                    },
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#f6f6f6',
                            width: 0.5,
                        },
                    },
                },
                series: series,
            }

            const setLastestData = () => {
                // yDataList 每项数据长度已对其
                const maxLng = yDataList[0]?.length || 0
                for (let index = 0; index < yDataList.length; index++) {
                    this.tooltips[index].value = yDataList[index][maxLng - 1]
                    this.currentDate = xData[maxLng - 1]
                }
            }

            setLastestData()

            option && myChart.setOption(option)

            // const moveHandler = (e) => {
            //     e.preventDefault()
            // }
            myChart.getZr().on('mousemove', () => {
                this.moving = true
                // document.addEventListener("touchmove",moveHandler, {passive: false})
            })

            myChart.getZr().on('mouseup', () => {
                this.moving = false
                // document.removeEventListener("touchmove",moveHandler, {passive: false})
                // 手动 隐藏 tooltip
                myChart.dispatchAction({
                    type: 'hideTip',
                })
                // 隐藏不会消失的 line - axisPointer
                myChart.dispatchAction({
                    type: 'updateAxisPointer',
                    currTrigger: 'leave',
                })
                setLastestData()
            })

            myChart.on('highlight', { dataIndex: 1 }, params => {
                const { dataIndex } = params.batch[0]
                for (let index = 0; index < yDataList.length; index++) {
                    this.tooltips[index].value = yDataList[index][dataIndex]
                    this.currentDate = xData[dataIndex]
                }
            })
        },

        onBtnClick(e) {
            const key = e.target.dataset.key
            if (!key) return
            this.activeTab = key
            this.init()
        },
    },
}
</script>

<style scoped lang="less">
.performance-trend {
    .title {
        margin-bottom: 19px;
        padding: 0 12px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    .content {
        margin: 0 10px 16px;
        padding: 12px 0 2px;
        background-color: #f9f9f9;
        border-radius: 4px;

        .date {
            padding: 0 0 8px 12px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .content-body {
            display: flex;
            flex-wrap: wrap;

            .content-item {
                position: relative;
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                width: 50%;
                margin-bottom: 8px;
                padding: 0 8px 0 12px;
                color: #2f2f2f;
                font-weight: 500;
                font-size: 12px;
                line-height: 16px;

                i {
                    flex: 0 0 auto;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                }

                .name {
                    flex: 0 0 auto;
                    width: 83px;
                    margin-left: 4px;
                }

                .value {
                    flex: 1;
                    width: 100%;
                    text-align: right;
                }
            }
        }
    }

    .moving-bg {
        background-color: rgba(39, 138, 255, 0.08);
    }

    .chart-trend {
        position: relative;
        width: 100%;
    }

    .trend {
        width: 100%;
        height: 192px;
        padding: 0 12px;
    }

    .btns {
        display: flex;
        margin-top: 16px;
        padding: 6px 8px;
        user-select: none;

        .btn {
            flex: 1 1 auto;
            text-align: center;

            &.mask {
                position: relative;

                &::after {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1;
                    content: '';
                }
            }

            &.selected {
                background: rgba(255, 99, 7, 0.1);
                border-radius: 18px;

                button {
                    color: @theme;
                    font-weight: 700;
                }
            }

            button {
                color: #666;
                font-size: 12px;
                line-height: 24px;
                text-align: center;
                background: transparent;
                border: none;
                outline: none;
                user-select: none;
            }
        }
    }
}
</style>
