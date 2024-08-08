<template>
    <div ref="chart" class="chart" :style="chartStyle"></div>
</template>

<script>
// import * as echarts from 'echarts'; // 全量引入
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent, DatasetComponent } from 'echarts/components'
import { LineChart, BarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { getPerfTrend } from '@/apis/fund/fund.js'
import { throttle } from 'lodash'
import colors from '@/utils/color.js'
import { colorToRGB } from '@/utils/tools.js'

const plugins = [GridComponent, TooltipComponent, LineChart, BarChart, CanvasRenderer, UniversalTransition, DatasetComponent]

echarts.use(plugins)

export default {
    name: 'fund-chart',
    props: {
        height: {
            type: String,
        },
        data: {
            type: Object,
            default: () => ({}),
        },
        // 是否延迟渲染，延迟渲染需要用户手动调用initChart函数
        delay: {
            type: Boolean,
            default: false,
        },
        //
        symbol: {
            type: String,
            required: true,
        },
        // 涨跌幅
        chgRate: {
            type: [String, Number],
            default: '0',
        },
        // 业绩周期： m1：近1个月，m3：近3个月，m6：近6个月，y1：近1年，y3：近3年，y5：近5年，缺省为y1
        period: {
            type: String,
            default: 'y1',
        },
    },
    data() {
        return {
            loaded: false,
            list: [],
        }
    },
    computed: {
        chartStyle() {
            return {
                height: this.height,
            }
        },
    },
    mounted() {
        this.judgePosition()
    },
    methods: {
        init() {
            this.getPerformanceTrend().then(() => {
                if (!this.delay) {
                    this.initChart()
                }
            })
        },
        async getPerformanceTrend() {
            try {
                const params = {
                    symbol: this.symbol,
                    period: this.period,
                }
                let { result } = (await getPerfTrend(params)) || {}
                result = result || {}
                const list = (result || {}).data || []
                this.list = list
            } catch (e) {
                console.error(e)
            }
        },
        initChart() {
            if (this.loaded) return

            const chartDom = this.$refs.chart
            // debugger // eslint-disable-line
            const myChart = echarts.init(chartDom)
            this.chart = myChart
            const test = {
                xData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 19],
                yData: [820, 932, 901, 934, 1290, 1130, 1320, 1420, 20, 120, 190],
            }
            let xData = []
            let yData = []
            this.list.forEach(i => {
                xData.push(i.date)
                yData.push(+i.return)
            })
            const isTesting = false
            if (isTesting) {
                xData = test.xData
                yData = test.yData
            }
            const { fallColor, riseColor } = colors
            const baseColor = this.chgRate < 0 ? fallColor : riseColor
            const riseColors = [
                {
                    offset: 0.7,
                    color: colorToRGB(riseColor, { opa: 0.15 }), // 0% 处的颜色
                },
                {
                    offset: 1,
                    color: colorToRGB(riseColor, { opa: 0 }), // 100% 处的颜色
                },
            ]
            const fallColors = [
                {
                    offset: 0.7,
                    color: colorToRGB(fallColor, { opa: 0.15 }), // 0% 处的颜色
                },
                {
                    offset: 1,
                    color: colorToRGB(fallColor, { opa: 0 }), // 100% 处的颜色
                },
            ]

            const option = {
                dataset: {
                    source: [xData, yData],
                },
                color: [
                    {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        // background: linear-gradient(18.08deg, rgba(255, 105, 7, 0) 22.28%, rgba(255, 105, 7, 0.4) 101.22%);
                        colorStops: [...(this.chgRate >= 0 ? riseColors : fallColors)],
                        global: false, // 缺省为 false
                    },
                ],
                grid: {
                    right: '0%',
                    left: '0%',
                    top: '1%',
                    bottom: 0,
                },
                xAxis: {
                    type: 'category',
                    show: false,
                    boundaryGap: false,
                },
                yAxis: {
                    type: 'value',
                    show: false,
                    boundaryGap: false,
                    // axisLabel: {
                    //     show: false
                    // },
                    // axisLine: {
                    //     show: false
                    // },
                    // splitLine: {
                    //     show: false
                    // }
                },
                series: [
                    {
                        type: 'line',
                        // smooth: true,
                        areaStyle: {
                            origin: 'start',
                        },
                        showSymbol: false,
                        lineStyle: {
                            color: baseColor,
                            width: 1,
                        },
                        seriesLayoutBy: 'row',
                        encode: {
                            x: 0,
                            y: 1,
                        },
                        animationDuration: 400,
                    },
                ],
            }

            option && myChart.setOption(option)
            this.loaded = true
        },
        /**
         * 是否滚动到视图中
         */
        judgePosition() {
            const scrollFnc = () => {
                const container = this.$refs.chart
                if (container.getBoundingClientRect().top < window.screen.height - 50) {
                    this.init()
                    document.removeEventListener('scroll', this.throttleScrollFnc)
                }
            }
            this.throttleScrollFnc = throttle(scrollFnc, 120)
            document.addEventListener('scroll', this.throttleScrollFnc, { passive: true })
            scrollFnc()
        },
    },
    beforeDestroy() {
        document.removeEventListener('scroll', this.throttleScrollFnc)
    },
}
</script>

<style>
.chart {
    width: 100%;
    height: 100%;
}
</style>
