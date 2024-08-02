<template>
    <div class="performance-trend card" id="performance-trend">
        <ul class="tabs" @click="onTabClick($event)">
            <li data-key="perf" :class="{ active: activeTitle === 'perf' }">{{ $t('performanceTrend') }}</li>
            <li data-key="drawdown" :class="{ active: activeTitle === 'drawdown' }">{{ $t('dynamicRetrace') }}</li>
        </ul>
        <ul v-show="isPerf" class="tool-tips">
            <li class="item" v-for="item in tooltips" :key="item.key">
                <p class="label">{{ item.label }}</p>
                <p
                    class="value"
                    v-if="item.key === 'profit'"
                    :name="item.key"
                    :class="{ rise: item.value > 0, fall: item.value < 0, flat: item.value == 0 }"
                >
                    {{ item.value > 0 ? '+' : '' }}{{ item.value + '%' }}
                </p>
                <p class="value" v-else-if="item.key === 'amount'">{{ item.value | thousandsFilter }}</p>
                <p class="value" v-else>{{ item.value }}</p>
            </li>
        </ul>
        <ul v-show="!isPerf" class="tool-tips">
            <li class="item" v-for="item in backTooltips" :key="item.key">
                <p class="label">{{ item.label }}</p>
                <p
                    class="value"
                    v-if="item.key === 'profit'"
                    :name="item.key"
                    :class="{ rise: item.value > 0, fall: item.value < 0, flat: item.value == 0 }"
                >
                    {{ item.value > 0 ? '+' : '' }}{{ item.value + '%' }}
                </p>
                <p class="value" v-else>{{ item.value }}</p>
            </li>
        </ul>
        <div class="chart-trend" v-trendLoading="loading">
            <div class="trend" ref="chart"></div>
        </div>
        <div class="drawdown" ref="chartDrawdown"></div>
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
import { getPerfTrend, getDrawdownTrend } from '@/apis/fund/fund.js'
import { floatToRatio } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'

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
    name: 'performance-trend',
    filters: {
        thousandsFilter,
    },
    data() {
        return {
            activeTitle: 'perf',
            btns: [
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
                {
                    key: 'founded',
                    value: '60',
                    label: this.$t('fromFoundedToDay'),
                },
            ],
            activeTab: 'y1',
            tooltips: [
                {
                    key: 'date',
                    label: this.$t('date'),
                    value: '',
                },
                {
                    key: 'amount',
                    label: this.$t('currencyNet'),
                    value: '',
                },
                {
                    key: 'profit',
                    label: this.$t('profit'),
                    value: '',
                },
            ],
            backTooltips: [
                {
                    key: 'date',
                    label: this.$t('date'),
                    value: '',
                },
                {
                    key: 'profit',
                    label: this.$t('selfFund'),
                    value: '',
                },
            ],
            perfList: {
                // 业绩走势
                y1: null,
                y3: null,
                y6: null,
                founded: null,
            },
            backList: {
                // 动态回撤
                y1: null,
                y3: null,
                y6: null,
                founded: null,
            },
            loading: true,
        }
    },
    computed: {
        isPerf() {
            // 是否业绩走势
            return this.activeTitle === 'perf'
        },
        list() {
            return this.isPerf ? this.perfList : this.backList
        },
    },
    mounted() {
        this.init()
    },
    methods: {
        async init() {
            this.loading = true
            const data = this.isPerf ? await this.getPerformanceTrend() : await this.getDrawdownTrend()
            data && this.initChart(data)
            this.loading = false
        },
        async getPerformanceTrend() {
            try {
                let list = this.perfList[this.activeTab]
                if (list) return list
                const params = {
                    symbol: this.$route.query.symbol,
                    period: this.activeTab,
                }
                let { result } = (await getPerfTrend(params)) || {}
                result = result || {}
                list = result.data || []
                const res = {
                    xData: [],
                    yData: [],
                    profit: [],
                }
                list.forEach(i => {
                    res.xData.push(i.date.replace(/-/g, '/'))
                    res.yData.push(i.return)
                    res.profit.push(i.acumNav)
                })
                this.perfList[this.activeTab] = res
                return res
            } catch (e) {
                console.error(e)
            }
        },
        async getDrawdownTrend() {
            try {
                let list = this.backList[this.activeTab]
                if (list) return list
                const params = {
                    symbol: this.$route.query.symbol,
                    period: this.activeTab,
                }
                let { result } = (await getDrawdownTrend(params)) || {}
                result = result || {}
                list = result.data || []

                // let list = [
                //     {
                //         "date": "2022-06-29",
                //         "drawdown": "-1.11"
                //     },
                //     {
                //         "date": "2022-06-30",
                //         "drawdown": "-4.37"
                //     },
                //     {
                //         "date": "2022-07-01",
                //         "drawdown": "-4.47"
                //     },
                //     {
                //         "date": "2022-07-02",
                //         "drawdown": "-4.11"
                //     },
                //     {
                //         "date": "2022-07-03",
                //         "drawdown": "-2.34"
                //     },
                //     {
                //         "date": "2022-07-04",
                //         "drawdown": "-3.17"
                //     },
                //     {
                //         "date": "2022-07-05",
                //         "drawdown": "-4.47"
                //     },
                //     {
                //         "date": "2022-07-06",
                //         "drawdown": "-4.11"
                //     },
                //     {
                //         "date": "2022-07-07",
                //         "drawdown": "-4.34"
                //     },
                //     {
                //         "date": "2022-07-08",
                //         "drawdown": "-3.17"
                //     },
                // ]
                const res = {
                    xData: [],
                    yData: [],
                    profit: [],
                }
                list.forEach(i => {
                    res.xData.push(i.date.replace(/-/g, '/'))
                    res.yData.push(i.drawdown)
                    res.profit.push(i.drawdown)
                })
                this.backList[this.activeTab] = res
                return res
            } catch (e) {
                console.error('getDrawdownTrend==>error:', e)
            }
        },
        initChart(data = {}) {
            console.log(`Feng.chen:: 11:17:52 initChart data ===> `, data)
            const chartDom = this.$refs.chart
            // debugger // eslint-disable-line
            const myChart = this.chart || echarts.init(chartDom)
            this.chart = myChart
            const xData = data.xData || []
            const yData = (data.yData || []).map(i => +i)
            const xInterval = Math.ceil((xData.length - 3) / 2) // X轴的间距
            const min = Math.min(...yData)
            const max = Math.max(...yData)
            const yInterval = (max - min) / 4
            const option = {
                dataset: {
                    source: [xData, yData],
                },
                color: [
                    {
                        type: 'linear',
                        x: 0,
                        y: this.isPerf ? 0 : 1,
                        x2: 0,
                        y2: this.isPerf ? 1 : 0,
                        // background: linear-gradient(18.08deg, rgba(255, 105, 7, 0) 22.28%, rgba(255, 105, 7, 0.4) 101.22%);
                        colorStops: [
                            {
                                offset: 0.7,
                                color: 'rgba(228, 241, 255, 1)', // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: 'rgba(228, 241, 255, 0)', // 100% 处的颜色
                            },
                        ],
                        global: false, // 缺省为 false
                    },
                ],
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
                        crossStyle: {
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
                        hideDelay: 0,
                    },
                    textStyle: {
                        borderColor: 'red',
                        color: 'red',
                    },
                    showContent: false,
                    alwaysShowContent: false,
                },
                grid: {
                    right: '0%',
                    left: '12%',
                    top: '4%',
                    bottom: '12%',
                },
                xAxis: {
                    type: 'category',
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
                            val = val.replace(/-/g, '/')
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
                            return floatToRatio(v, { rate: true, base: 2, toFixed: true, sign: false })
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
                series: [
                    {
                        type: 'line',
                        // smooth: true,
                        animation: false, // 动画关闭
                        areaStyle: {
                            origin: this.isPerf ? 'start' : 'end',
                        },
                        showSymbol: false,
                        lineStyle: {
                            color: '#278AFF',
                            width: 1,
                        },
                        seriesLayoutBy: 'row',
                        encode: {
                            x: 0,
                            y: 1,
                        },
                        emphasis: {
                            disabled: true,
                        },
                        markLine: {
                            symbol: 'none',
                            animation: false,
                            data: [],
                            emphasis: {
                                disabled: true,
                            },
                        },
                        markPoint: {
                            symbol: 'circle',
                            symbolSize: 6,
                            itemStyle: {
                                color: '#278AFF',
                            },
                            label: {
                                show: false,
                            },
                            data: [
                                {
                                    // coord: [10, -0.02]
                                },
                            ],
                            animation: false,
                        },
                    },
                ],
            }
            const setLastestData = () => {
                if (!data.xData || data.xData.length === 0) return
                const len = data.xData.length - 1
                const lastestData = this.isPerf ? [data.xData[len], data.profit[len], data.yData[len]] : [data.xData[len], data.profit[len]]
                this[this.isPerf ? 'tooltips' : 'backTooltips'].forEach((i, idx) => {
                    const val = lastestData[idx]
                    i.value = val
                })
            }

            setLastestData()

            option && myChart.setOption(option)

            const moveHandler = e => {
                e.preventDefault()
            }

            myChart.getZr().on('mousedown', () => {
                if (!this.timer) {
                    this.timer = setTimeout(() => {
                        document.addEventListener('touchmove', moveHandler, { passive: false })
                    }, 1000)
                }
            })

            myChart.getZr().on('mouseup', () => {
                clearTimeout(this.timer)
                this.timer = null
                document.removeEventListener('touchmove', moveHandler, { passive: false })
                // 手动 隐藏 tooltip
                myChart.dispatchAction({
                    type: 'hideTip',
                })
                // 隐藏不会消失的 line - axisPointer
                myChart.dispatchAction({
                    type: 'updateAxisPointer',
                    currTrigger: 'leave',
                })

                const options = myChart.getOption()
                options.series[0].markLine.data = []
                options.series[0].markPoint.data[0].coord = []
                myChart.setOption(options)
                setLastestData()
            })

            const self = this
            myChart.on('highlight', { dataIndex: 1 }, params => {
                const { dataIndex } = params.batch[0]
                console.log()
                const data = self.list[self.activeTab]
                const tempData = this.isPerf ? [data.xData, data.profit, data.yData] : [data.xData, data.profit]
                this[this.isPerf ? 'tooltips' : 'backTooltips'].forEach((i, idx) => {
                    const val = tempData[idx]
                    i.value = val[dataIndex]
                })
                // const x = data.xData[dataIndex]
                const y = data.yData[dataIndex]

                const options = myChart.getOption()
                // const markLineData = options.series[0].markLine.data
                // if (markLineData.length) return
                options.series[0].markLine.data = [
                    {
                        name: 'Avg',
                        yAxis: y,
                        lineStyle: { color: '#278AFF', type: 'dashed', width: 0.5 },
                        label: {
                            position: 'start',
                            backgroundColor: '#278AFF',
                            fontSize: 9,
                            lineHeight: 13,
                            color: '#fff',
                            padding: [0, 3, 0, 3],
                            borderRadius: 2,
                            formatter(params) {
                                return params.data.value + '%'
                            },
                        },
                    },
                ]
                options.series[0].markPoint.data[0].coord = [dataIndex, +y]
                myChart.setOption(options)
            })
        },

        onBtnClick(e) {
            const key = e.target.dataset.key
            if (!key) return
            this.activeTab = key
            this.init()
        },

        onTabClick(e) {
            const key = e.target.dataset.key
            if (!key) return
            this.activeTitle = key
            this.init()
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 0 12px;
    margin-top: 12px;
    padding: 8px 0 20px;
    background: #fff;
    border-radius: 8px;
}

.performance-trend {
    .tabs {
        display: flex;

        li {
            padding: 0 12px;
            color: #666;
            font-weight: 400;
            font-size: 14px;
            line-height: 36px;
        }

        .active {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
        }
    }

    .tool-tips {
        display: flex;
        justify-content: space-between;
        margin: 12px 12px 16px;
        padding: 10px 12px;
        background: #f9f9f9;
        border-radius: 4px;

        .item {
            flex: 0 0 50px;

            &:nth-child(1),
            &:last-child {
                flex-grow: 1;
            }

            &:nth-child(2) {
                flex-basis: auto;
                text-align: center;
            }

            &:last-child {
                text-align: right;
            }

            .label {
                color: #2f2f2f;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;
            }

            .value {
                margin-top: 4px;
                color: #9c9c9c;
                font-size: 12px;
                line-height: 16px;

                &[name='profit'] {
                    font-weight: 700;
                }
            }
        }
    }

    .y-axis {
        display: flex;
        margin: 0 12px 0 34px;
        margin-top: -6px;

        li {
            width: calc(100% / 3);
            color: #666;
            font-size: 8px;
            line-height: 11px;

            &:first-child {
                // margin-left: 18px;
            }

            &:nth-child(2) {
                text-align: center;
            }

            &:last-child {
                text-align: right;
            }
        }
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
                background: #ffe5ce;
                border-radius: 18px;

                button {
                    color: #4c2620;
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
