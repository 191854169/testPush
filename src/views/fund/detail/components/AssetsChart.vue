<template>
    <div class="card assets-chart" id="assets">
        <h3 class="title">{{ $t('assetSize') }}</h3>
        <div class="chart-body" v-show="list.length > 0">
            <div class="basic-info">
                <div class="update-time">{{ $t('updateTime') }}{{ updateTime | timeFilter }}</div>
                <div class="currency">{{ $t('currency') }}{{ currency | currencyFilter(transform) }}</div>
            </div>
            <div ref="chart" class="chart"></div>
            <h4 class="legend">{{ $t('assetSize') }}</h4>
        </div>
        <f-empty v-show="list.length === 0"></f-empty>
    </div>
</template>

<script>
import FEmpty from '@/components/Empty.vue'
import * as echarts from 'echarts/core'
import { GridComponent, DatasetComponent } from 'echarts/components'
import { BarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { humanNum } from '@/utils/utils.js'
import { getAssets } from '@/apis/fund/fund.js'

const plugins = [GridComponent, BarChart, CanvasRenderer, UniversalTransition, DatasetComponent]

echarts.use(plugins)

export default {
    name: 'assets-chart',
    components: {
        FEmpty,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            list: [],
            updateTime: '',
            currency: '',
        }
    },
    filters: {
        timeFilter(v) {
            v = v || ''
            return v.replace(/-/g, '/')
        },

        currencyFilter(v, $t) {
            v = v || ''
            return (
                {
                    USD: $t('USD'),
                    HKD: $t('HKD'),
                    CNY: $t('CNY'),
                    CNH: $t('CNH'),
                    EUR: $t('EUR'),
                    JPY: $t('JPY'),
                    GBP: $t('GBP'),
                    AUD: $t('AUD'),
                    SEK: $t('SEK'),
                    CHF: $t('CHF'),
                }[v] || '--'
            )
        },
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.getAssetsData()
                .then(data => {
                    this.initChart(data)
                })
                .catch(e => {
                    console.error(e)
                })
        },

        async getAssetsData() {
            const params = {
                symbol: this.$route.query.symbol,
            }
            let { result } = await getAssets(params)
            result = result || {}
            this.updateTime = result.updateDate
            this.currency = result.currency
            this.list = result.list || []
            return this.list
        },
        initChart(list = []) {
            const chartDom = this.$refs.chart
            const myChart = echarts.init(chartDom)
            this.chart = myChart
            let xData = []
            let yData = []
            // TODO: 测试数据待去除
            // --- start ---
            const test = {
                xData: ['2021/12', '2022/01', '2022/02', '2022/03', '2022/04'],
                yData: [820, 932, 901, 934, 1290],
            }
            // 只展示前五个
            list = list.slice(0, 5)
            list = list.reverse() // 时间转换
            list.forEach(i => {
                xData.push(i.date.replace(/-/g, '/'))
                yData.push(+i.asset) // 转换为整型，不然echarts处理会有问题
            })
            const isTesting = false
            if (isTesting) {
                xData = test.xData
                yData = test.yData
            }
            const min = 0
            const max = Math.max(...yData)
            const yInterval = (max - min) / 2

            console.log('xData ===> ', xData)
            console.log('yData ===> ', yData)
            // --- end ---
            const option = {
                dataset: {
                    source: [xData, yData],
                },
                grid: {
                    right: '0%',
                    left: '14%',
                    top: '10%',
                    bottom: '13%',
                },
                xAxis: {
                    type: 'category',
                    // show: true,
                    // boundaryGap: true,
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        color: '#666',
                        fontSize: 8,
                        lineHeight: 11,
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
                    min,
                    max,
                    interval: yInterval,
                    axisLabel: {
                        show: true,
                        formatter: v => {
                            return humanNum(v)
                        },
                        color: '#666',
                        fontSize: 9,
                        margin: 4,
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
                        type: 'bar',
                        // smooth: true,
                        barWidth: 12,
                        label: {
                            show: true,
                            position: 'top',
                            fontSize: 10,
                            lineHeight: 14,
                            color: '#2f2f2f',
                            distance: 4,
                            formatter: data => {
                                const value = data.value[data.encode.y[0]]
                                // TODO 数据的处理
                                return humanNum(value)
                            },
                        },
                        itemStyle: {
                            color: '#278AFF',
                            borderRadius: [2, 2, 0, 0],
                        },
                        seriesLayoutBy: 'row',
                        encode: {
                            x: 0,
                            y: 1,
                        },
                    },
                ],
            }
            option && myChart.setOption(option)
        },
        transform(k) {
            return this.$t(k)
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px;
    padding: 8px 0 24px;
    background: #fff;
    border-radius: 8px;
}

.assets-chart {
    .title {
        padding: 0 12px;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    .basic-info {
        display: flex;
        justify-content: space-between;
        margin: 9px 0;
        padding: 0 12px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
    }

    .chart {
        height: 167px;
        margin-top: 12px;
        padding: 0 12px;
    }

    .legend {
        margin-top: 16px;
        color: #2f2f2f;
        font-size: 12px;
        line-height: 16px;
        text-align: center;

        &::before {
            display: inline-block;
            width: 6px;
            height: 6px;
            margin-right: 4px;
            vertical-align: middle;
            background: #278aff;
            border-radius: 50%;
            content: '';
        }
    }
}
</style>
