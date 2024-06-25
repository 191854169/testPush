<template>
    <div class="performance-trend-ry">
        <div id="performance-trend">
            <div class="chart-trend">
                <div class="trend" ref="chart"></div>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, DatasetComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { getCurrencyTrend } from '@/apis/fund/fund.js'

const plugins = [GridComponent, LineChart, CanvasRenderer, UniversalTransition, DatasetComponent]

echarts.use(plugins)

export default {
    name: 'performance-trend',
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        symbol: {
            type: String,
            default: 'mf0P0001HPDQ',
        },
    },
    data() {
        return {
            activeTab: 'y1',
            list: {
                m1: null,
                m3: null,
                m6: null,
                y1: null,
                y3: null,
                y6: null,
            },
            loading: true, // 是否处于切换净值趋势|万元中
        }
    },
    async mounted() {
        this.init()
    },
    methods: {
        async init() {
            try {
                this.loading = true
                await this.getTrend().then(data => {
                    return this.initChart(data)
                })
            } finally {
                this.loading = false
            }
        },
        async getTrend() {
            const performanceRes = {
                xData: [],
                yData: [],
                profit: [],
                acumNavList: [],
            }
            try {
                const data = this.list[this.activeTab]
                if (data) return data
                let performance = data ? data.performance : []
                const params_ = {
                    symbol: this.symbol,
                    type: 1, //type为1: 单独获取七日年化 2: 单独获取万份收益
                    period: 'y1',
                }
                const resData = (await getCurrencyTrend(params_)) || {}

                const result = resData.result || {}
                performance = result.data || result.list || []
                performance.forEach(i => {
                    performanceRes.xData.push(i.date.replace(/-/g, '/'))
                    performanceRes.yData.push(i.returnD7ToY1)
                })

                const res = {
                    performance: performanceRes,
                }
                this.list[this.activeTab] = res
                return res
            } catch (e) {
                console.error('getPerfTrendV2===>error:', e)
                return {
                    performance: performanceRes,
                }
            }
        },
        initChart(data = {}) {
            console.log(`Feng.chen:: 11:17:52 initChart data ===> `, data)
            const performance = data.performance // 本基金业绩走势
            const chartDom = this.$refs.chart
            // debugger // eslint-disable-line
            const myChart = this.chart || echarts.init(chartDom)
            this.chart = myChart
            const xData = Array.from(new Set([...performance.xData])) || []
            const yData = (Array.from(new Set([...performance.yData])) || []).map(i => +i)
            const xInterval = Math.ceil((xData.length - 3) / 2) // X轴的间距
            const min = Math.min(...yData)
            const max = Math.max(...yData)
            const yInterval = (max - min) / 4
            const option = {
                color: [
                    {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        // background: linear-gradient(18.08deg, rgba(255, 105, 7, 0) 22.28%, rgba(255, 105, 7, 0.4) 101.22%);
                        colorStops: [
                            {
                                offset: 0.7,
                                color: 'rgba(255, 105, 7, 0.3)', // 0% 处的颜色
                            },
                            {
                                offset: 1,
                                color: 'rgba(255, 105, 7, 0)', // 100% 处的颜色
                            },
                        ],
                        global: false, // 缺省为 false
                    },
                ],
                axisPointer: {
                    zLevel: 1,
                },
                grid: {
                    right: '2',
                    left: '12%',
                    top: '4%',
                    bottom: '12%',
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    show: false,
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
                        show: false,
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
                        data: performance.yData,
                        // smooth: true,
                        animation: false, // 动画关闭
                        areaStyle: {
                            origin: 'start',
                        },
                        showSymbol: false,
                        lineStyle: {
                            color: '#ff6907',
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
                    },
                ],
            }

            option && myChart.setOption(option)
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

.performance-trend-ry {
    width: 80px;
    height: 60px;

    .text-r {
        text-align: right;
    }

    header {
        display: flex;
        align-items: center;
        padding: 12px 12px 7px;
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;

        .henader-checker {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
        }

        span {
            margin-right: 28px;
        }
    }

    .title {
        padding: 0 12px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    .chart-trend {
        position: relative;
        width: 108px;
        height: 40px;
    }

    .loading {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 444;
        display: flex;
        align-items: center;
        justify-content: center;
        color: @fontGreyColor;
        font-size: 12px;
        text-align: center;
        background: #fff;
    }

    .trend {
        width: 100%;
        height: 40px;
    }
}
</style>
