<template>
    <!-- 时间筛选 -->
    <div class="swipe-chart">
        <div ref="chart" class="chart"></div>
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, DatasetComponent } from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { floatToRatio, milliFormat, isNull, isUndefined } from '@/utils'
import colors from '@/utils/color.js'

const plugins = [GridComponent, BarChart, CanvasRenderer, UniversalTransition, DatasetComponent]
echarts.use(plugins)

export default {
    name: 'swipe-chart',
    mixins: [],
    components: {},
    props: {
        datas: {
            type: Array,
            default: () => {
                return []
            },
        },
        selectIndex: {
            type: Number,
            default: -1,
        },
    },
    data() {
        return {
            lastOption: {},
            lastMax: 0,
        }
    },
    computed: {},
    watch: {
        datas: {
            async handler(v) {
                this.initChart()
            },
            immediate: true,
        },
        selectIndex: {
            async handler(v) {
                this.initChart()
            },
        },
    },
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        initChart() {
            const list = this.datas
            if (list.length === 0) {
                return
            }
            if (isNull(this.chart) || isUndefined(this.chart)) {
                const chartDom = this.$refs.chart
                const myChart = echarts.init(chartDom)
                this.chart = myChart
            }
            let yData = []
            let yRiseData = []
            let yFallData = []
            let yBackData = []

            list.forEach(item => {
                // 转换为整型，不然echarts处理会有问题
                yData.push(+item)
                yBackData.push(0)
                if (item >= 0) {
                    yRiseData.push(+item)
                    yFallData.push(0)
                } else {
                    yRiseData.push(0)
                    yFallData.push(+item)
                }
            })

            const isTesting = false
            if (isTesting) {
                // --- 测试数据 ---
                yData = [820, -932, 901, -934, 1290, 820, -932, 901, -934, 1290, 820, -932]
                yRiseData = []
                yFallData = []
                yBackData = []
                yData.forEach(value => {
                    // 转换为整型，不然echarts处理会有问题
                    yBackData.push(0)
                    if (value >= 0) {
                        yRiseData.push(value)
                        yFallData.push(0)
                    } else {
                        yRiseData.push(0)
                        yFallData.push(value)
                    }
                })
            }

            const yIndex = this.selectIndex
            if (yIndex >= 0 && this.lastMax > 0) {
                const isRise = yData[yIndex] >= 0
                yBackData[yIndex] = isRise ? this.lastMax : -this.lastMax
                const barGap = isRise ? '-70%' : '-80%'
                this.lastOption.series[0].data = yBackData
                this.lastOption.series[0].barGap = barGap
                this.lastOption && this.chart.setOption(this.lastOption)
                return
            }

            let max = Math.max(...yData)
            let min = Math.min(...yData)
            if (Math.abs(max) < Math.abs(min)) {
                max = Math.abs(min)
                min = -max
            } else {
                max = Math.abs(max)
                min = -max
            }

            if (max === 0 && min === 0) {
                max = 0.01
                min = -0.01
            }
            const isRise = yData[yIndex] >= 0
            yBackData[yIndex] = isRise ? max : min
            const barGap = isRise ? '-70%' : '-80%'
            const yFontSize = max > 99999 ? 8 : 9

            const yInterval = (max - min) / 2

            const { fallColor, riseColor } = colors

            console.log('yData ===> ', yData)
            // --- end ---
            const option = {
                animation: false,
                grid: {
                    right: '0',
                    left: '14%',
                    top: '4px',
                    bottom: '4px',
                },
                xAxis: {
                    type: 'category',
                    // boundaryGap: true,
                    splitLine: {
                        show: false,
                    },
                    show: false,
                    axisLabel: {
                        color: '#9c9c9c',
                        fontSize: 9,
                        lineHeight: 12,
                        showMaxLabel: true,
                        showMinLabel: true,
                        interval: 0,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#f6f6f6',
                            width: 0.5,
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                },
                yAxis: {
                    type: 'value',
                    show: true,
                    boundaryGap: false,
                    min: min,
                    max: max,
                    interval: yInterval,
                    axisLabel: {
                        show: true,
                        formatter: v => {
                            return milliFormat(floatToRatio(v, { rate: false, sign: false }))
                        },
                        color: '#9c9c9c',
                        fontSize: yFontSize,
                        margin: 0,
                        inside: false,
                        padding: [0, 4, 0, 0],
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
                    splitNumber: 2,
                },
                series: [
                    {
                        name: 'background',
                        type: 'bar',
                        data: yBackData,
                        barWidth: '14',
                        z: '-1',
                        barGap: barGap,
                        label: {
                            show: false,
                        },
                        seriesLayoutBy: 'row',
                        itemStyle: {
                            color: 'rgba(255, 105, 7, 0.1)',
                        },
                    },
                    {
                        name: 'rise',
                        type: 'bar',
                        data: yRiseData,
                        barWidth: '6',
                        label: {
                            show: false,
                        },
                        seriesLayoutBy: 'row',
                        itemStyle: {
                            color: riseColor,
                            borderRadius: [2, 2, 0, 0],
                        },
                    },
                    {
                        name: 'fall',
                        type: 'bar',
                        data: yFallData,
                        barWidth: '6',
                        label: {
                            show: false,
                        },
                        seriesLayoutBy: 'row',
                        itemStyle: {
                            color: fallColor,
                            borderRadius: [0, 0, 2, 2],
                        },
                    },
                ],
            }
            option && this.chart.setOption(option)
            this.lastMax = max
            this.lastOption = option
        },
    },
}
</script>

<style lang="less" scoped>
.swipe-chart {
    width: 100%;
    background-color: #fff;

    .chart {
        height: 90px;
        padding: 4px 6px 0;
    }
}
</style>
