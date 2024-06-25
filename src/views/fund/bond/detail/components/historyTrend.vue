<template>
    <div class="history-trend" id="history-trend">
        <ul class="tool-tips">
            <p class="date">{{ tooltips.date.value || '--' }}</p>
            <div class="content">
                <div class="content-item">
                    <p class="label">{{ tooltips.price.label }}</p>
                    <p class="value">{{ tooltips.price.value ? tooltips.price.value : '--' }}</p>
                </div>
                <div class="content-item">
                    <p class="label">{{ tooltips.ratio.label }}</p>
                    <p class="value" v-riseFall="{ value: tooltips.ratio.value, base: 3 }"></p>
                </div>
            </div>
        </ul>
        <div class="chart-trend" v-trendLoading="loading">
            <div class="trend" ref="chart"></div>
        </div>
        <!-- <ul class="y-axis">
            <li v-for="i in 3" :key="i">{{ i }}</li>
        </ul> -->
        <ul class="btns" @click="onBtnClick">
            <li class="btn mask" :class="{ selected: item.key === activeTab }" v-for="item in btns" :key="item.key" :data-key="item.key">
                <button>{{ item.label }}</button>
            </li>
        </ul>
        <!-- <p class="footer">{{ $t('pbDataOrigin') }}</p> -->
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent, DatasetComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { floatToRatio, keepDecimals } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'
import { getPriceHis } from '@/apis/bond'
import { BOND_TYPE_MAP } from '../../../config/common'
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
    name: 'history-trend',
    filters: {
        thousandsFilter,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            btns: [
                {
                    key: '1M',
                    label: this.$t('nearOneMonth'),
                },
                {
                    key: '3M',
                    label: this.$t('nearThreeMonth'),
                },
                {
                    key: '6M',
                    label: this.$t('nearSixMonth'),
                },
                {
                    key: '1Y',
                    label: this.$t('nearOneYear'),
                },
                {
                    key: '3Y',
                    label: this.$t('nearThreeYear'),
                },
            ],
            activeTab: '',
            tooltips: {
                date: {
                    key: 'date',
                    label: this.$t('date'),
                    value: '',
                },
                price: {
                    key: 'price',
                    label: this.$t('closingPrice'),
                    value: '',
                },
                ratio: {
                    key: 'profit',
                    label: this.$t('expireIncome'),
                    value: '',
                },
            },
            list: {
                '1M': null,
                '3M': null,
                '6M': null,
                '1Y': null,
                '3Y': null,
            },
            loading: true,
        }
    },
    mounted() {
        if (process.env.NODE_ENV === 'development') {
            // 本地调试热刷新使用
            this.init()
        }
    },
    methods: {
        init(data) {
            // 美债 - 1Y 企业债券 - 3Y
            const map = {
                [BOND_TYPE_MAP.keysMap.usaBond]: '1Y',
                [BOND_TYPE_MAP.keysMap.piBOnd]: '3Y',
            }
            let period = '3Y'
            data?.type && (period = map[data?.type] || period)
            this.activeTab = period
            this.fetchDataAndInitChart()
        },

        fetchDataAndInitChart() {
            this.loading = true
            this.getPerformanceTrend(this.activeTab)
                .then(data => {
                    this.initChart(data)
                })
                .finally(() => {
                    this.loading = false
                })
        },

        async getPerformanceTrend(period) {
            let list = this.list[period]
            if (list) return list
            const params = {
                symbol: this.symbol,
                type: this.activeTab,
            }
            const { result = {} } = (await getPriceHis(params)) || {}
            list = result.list || []
            const res = {
                xData: [],
                yData: [],
                profit: [],
            }
            list.forEach(i => {
                res.xData.push(i.date.replace(/-/g, '/'))
                res.yData.push(i.MAY)
                res.profit.push(keepDecimals(i.price, 3))
            })
            this.list[this.activeTab] = res
            return res
        },
        initChart(data = {}) {
            const chartDom = this.$refs.chart
            // debugger // eslint-disable-line
            const myChart = this.chart || echarts.init(chartDom)
            this.chart = myChart
            const xData = data.xData || []
            const yData = (data.yData || []).map(i => +i)
            const profitData = data.profit || []
            const xInterval = Math.ceil((xData.length - 3) / 2) // X轴的间距
            const min = Math.min(...yData)
            const max = Math.max(...yData)
            const maxProfitData = Math.max(...profitData)
            const minProfitData = Math.min(...profitData)
            const yInterval = (max - min) / 4
            const yProfitInterval = (maxProfitData - minProfitData) / 4
            const option = {
                tooltip: {
                    trigger: 'axis',
                    triggerOn: 'mousemove',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            type: 'solid',
                            color: '#9C9C9C',
                            width: 0.5,
                        },
                        label: {
                            show: true,
                            lineHeight: 13,
                            color: '#2F2F2F',
                            fontSize: 9,
                            backgroundColor: '#F9F9F9',
                            padding: [1, 3, 0, 3],
                            borderRadius: 2,
                        },
                    },
                    showContent: false,
                },
                grid: {
                    right: '12%',
                    left: '12%',
                    top: '4%',
                    bottom: '12%',
                },
                xAxis: {
                    type: 'category',
                    show: true,
                    data: xData,
                    boundaryGap: false,
                    splitLine: {
                        show: false,
                    },
                    axisPointer: {
                        snap: false,
                        lineStyle: {
                            type: 'solid',
                        },
                    },
                    axisLabel: {
                        color: '#666',
                        fontSize: 8,
                        showMaxLabel: true,
                        interval: xInterval,
                        formatter: (val, index) => {
                            if (['1M', '3M', '6M'].includes(this.activeTab)) {
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
                            width: 1,
                        },
                    },
                },
                yAxis: [
                    {
                        position: 'right',
                        type: 'value',
                        show: true,
                        min,
                        max,
                        interval: yInterval,
                        axisLabel: {
                            show: true,
                            formatter: v => {
                                // 因为数据小数位过多，导致NP计算时会超出最大整数，提出报警
                                let val = `${v || ''}`
                                val = val.match(/(-?)\d+\.\d{0,5}/g)?.[0] || v
                                return floatToRatio(val, { rate: true, base: 2, toFixed: true, sign: false })
                            },
                            color: '#666',
                            fontSize: 8,
                            margin: 2,
                        },
                        axisPointer: {
                            snap: false,
                            lineStyle: {
                                type: 'solid',
                            },
                            label: {
                                formatter: param => {
                                    // 因为数据小数位过多，导致NP计算时会超出最大整数，提出报警
                                    let value = `${param.value || ''}`
                                    value = value.match(/(-?)\d+\.\d{0,5}/g)?.[0] || param.value
                                    return floatToRatio(value, { rate: true, base: 2, toFixed: true, sign: false })
                                },
                            },
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
                    {
                        position: 'left',
                        type: 'value',
                        show: true,
                        min: minProfitData,
                        max: maxProfitData,
                        interval: yProfitInterval,
                        axisLabel: {
                            show: true,
                            formatter: v => {
                                return keepDecimals(v, 3)
                            },
                            color: '#666',
                            fontSize: 8,
                            margin: 2,
                        },
                        axisPointer: {
                            snap: false,
                            lineStyle: {
                                type: 'solid',
                            },
                            label: {
                                formatter: param => {
                                    return keepDecimals(param.value, 3)
                                },
                            },
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
                ],
                series: [
                    {
                        type: 'line',
                        // smooth: true,
                        animation: false, // 动画关闭
                        data: yData,
                        yAxisIndex: 0,
                        showSymbol: false,
                        symbol: 'none',
                        lineStyle: {
                            color: '#FFA800',
                            width: 1,
                        },
                        seriesLayoutBy: 'row',
                        markLine: {
                            lineStyle: {
                                color: 'red',
                            },
                        },
                    },
                    {
                        type: 'line',
                        animation: false, // 动画关闭
                        data: profitData,
                        yAxisIndex: 1,
                        symbol: 'none',
                        showSymbol: false,
                        lineStyle: {
                            color: '#278AFF',
                            width: 1,
                        },
                    },
                ],
            }
            const setLastestData = () => {
                if (!data?.xData) return
                const len = data.xData.length - 1
                const latestData = { date: data.xData[len], price: data.profit[len], ratio: data.yData[len] }
                Object.keys(this.tooltips).forEach(key => {
                    this.tooltips[key].value = latestData[key]
                })
            }
            setLastestData()
            option && myChart.setOption(option)

            const moveHandler = e => {
                e.preventDefault()
            }
            myChart.getZr().on('mousedown', () => {
                clearTimeout(this.timer)
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
                setLastestData()
            })

            const self = this
            myChart.on('highlight', { dataIndex: 1 }, params => {
                const { dataIndex } = params.batch[0]

                const data = self.list[self.activeTab]
                const tempData = { date: data.xData[dataIndex], price: data.profit[dataIndex], ratio: data.yData[dataIndex] }
                Object.keys(this.tooltips).forEach(key => {
                    this.tooltips[key].value = tempData[key]
                })
            })
        },

        onBtnClick(e) {
            const key = e.target.dataset.key
            if (!key) return
            this.activeTab = key
            this.fetchDataAndInitChart()
        },
    },
}
</script>
<style scoped lang="less">
.history-trend {
    .tool-tips {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin: 12px 0 16px;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 4px;

        .date {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .content {
            display: flex;
            justify-content: space-between;
            padding-top: 8px;

            .content-item {
                position: relative;
                display: flex;
                justify-content: space-between;
                min-width: 112px;
                margin-left: 12px;
                color: #9c9c9c;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;

                .label {
                    color: #2f2f2f;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .content-item:nth-of-type(2) {
                min-width: 150px;
            }

            .content-item::before {
                position: absolute;
                top: 5px;
                left: -12px;
                width: 6px;
                height: 6px;
                background-color: #ffa800;
                border-radius: 50%;
                content: '';
            }

            .content-item:first-of-type::before {
                background-color: #278aff;
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
        height: 213px;
    }

    .btns {
        display: flex;
        margin: 16px -12px 0;
        padding: 0 8px;
        user-select: none;

        .btn {
            flex: 1 1 auto;
            margin: 6px 0;
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
                margin: 4px 0;
                line-height: 28px;
                background: rgba(255, 99, 7, 0.1);
                border-radius: 18px;

                button {
                    // font-weight: 700;
                    color: #ff6907;
                }
            }

            button {
                color: #666;
                font-weight: 400;
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

    .footer {
        padding-top: 4px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 10px;
        line-height: 14px;
        text-align: center;
    }
}
</style>
