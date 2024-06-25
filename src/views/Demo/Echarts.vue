<template>
    <div id="chart" :style="chartStyle"></div>
</template>

<script>
// import * as echarts from 'echarts'; // 全量引入
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent, DatasetComponent } from 'echarts/components'
import { LineChart, BarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

const plugins = [GridComponent, TooltipComponent, LineChart, BarChart, CanvasRenderer, UniversalTransition, DatasetComponent]

echarts.use(plugins)

export default {
    name: 'chart-demo',
    props: {
        height: {
            type: String,
            default: '300px',
        },
    },
    data() {
        return {}
    },
    computed: {
        chartStyle() {
            return {
                height: this.height,
            }
        },
    },
    mounted() {
        this.initChart()
    },
    methods: {
        initChart() {
            const chartDom = document.getElementById('chart')
            const myChart = echarts.init(chartDom)
            this.chart = myChart

            const option = {
                dataset: {
                    source: [
                        // ['product', '1', '2', '3', '4', '5', '6'],
                        // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        // [820, 932, 901, 934, 1290, 1330, 1320]
                        ['Mon', 820],
                        ['Tue', 932],
                        ['Wed', 901],
                        ['Thu', 934],
                        ['Fri', 1290],
                        ['Sat', 1130],
                        ['Sun', 1320],
                    ],
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                    },
                    textStyle: {
                        // borderColor: 'red',
                        // color: 'red'
                    },
                    // formatter: function(params, ticket, callback) {
                    //     console.log(params)
                    //     console.log(ticket)
                    //     console.log(callback)
                    //     setTimeout(() => {
                    //         callback(ticket, `<input readonly value="123">`)
                    //     }, 2000)
                    //     return 'loading'
                    // }
                },
                xAxis: {
                    type: 'category',
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        type: 'line',
                        smooth: true,
                    },
                    {
                        type: 'bar',
                    },
                ],
            }

            option && myChart.setOption(option)
        },
    },
}
</script>

<style>
#chart {
    /* width: 400px; */
    height: 400px;
}
</style>
