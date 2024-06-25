<template>
    <div>
        <div class="performance-trend card" id="performance-trend">
            <h3 class="title">{{ $t('follow.performanceTitle') }}</h3>
            <empty v-if="isEmpty"></empty>
            <template v-else>
                <div class="tool-tips">
                    <p class="date">{{ tooltips.date.value | dateFilter }}</p>
                    <div class="content">
                        <div class="content-item">
                            <p class="label">{{ tooltips.portfolio.label }}</p>
                            <p class="value" v-riseFall="{ value: tooltips.portfolio.value }"></p>
                        </div>
                        <div class="content-item">
                            <p class="label">{{ tooltips.hsi.label }}</p>
                            <p class="value" v-riseFall="{ value: tooltips.hsi.value }"></p>
                        </div>
                        <div v-if="isMixinType" class="content-item">
                            <p class="label">{{ tooltips.hstech.label }}</p>
                            <p class="value" v-riseFall="{ value: tooltips.hstech.value }"></p>
                        </div>
                    </div>
                </div>
                <div class="chart-trend" v-trendLoading="loading">
                    <div class="trend" ref="chart"></div>
                </div>
            </template>
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
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent, DatasetComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { floatToRatio } from '@/utils/calc'
import { thousandsFilter } from '@/config/filters.js'
import { PortfolioReturnTrend } from '@/apis/followInvest/index.js'
import Empty from '@/components/Empty'
import { isEmpty } from '@/utils'
import { PORTFOLIO_TYPE_MAP } from '../../config/common'

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
    components: {
        Empty,
    },
    filters: {
        thousandsFilter,
        dateFilter(v) {
            return v ? `${v}`.replace(/-/g, '/') : '--'
        },
    },
    props: {
        obj: {
            type: Object,
            default: () => ({}),
        },
    },
    computed: {
        isPublic() {
            return this.$route.query.type === 'public'
        },
        portfolioId() {
            return this.$route.query.portfolioId
        },
        isEmpty() {
            const data = this.list[this.activeTab]
            const isLoaded = !!data
            const isEmpty = !data?.portfolioData?.xData.length || data?.portfolioData?.xData?.length <= 1
            return isLoaded && isEmpty
        },
        isFund() {
            return this.obj.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        isMixinType() {
            return this.obj.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.mixin
        },
    },
    data() {
        return {
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
            ],
            activeTab: 'y1',
            tooltips: {
                date: {
                    key: 'date',
                    label: this.$t('date'),
                    value: '',
                },
                portfolio: {
                    key: 'trend',
                    label: this.$t('follow.selfIncome'),
                    value: '',
                },
                hsi: {
                    key: 'trend',
                    label: '',
                    value: '',
                },
                hstech: {
                    key: 'trend',
                    label: '',
                    value: '',
                },
            },
            list: {
                m1: null,
                m3: null,
                m6: null,
                y1: null,
                y3: null,
            },
            activeHeader: 0,
            showFull: true,
            isFundType: Number(this.$route.query.fundType),
            sameAverageList: [],
            loading: true, // 是否切换年份
        }
    },
    mounted() {},
    watch: {
        obj: {
            handler(newV, oldV) {
                if (newV != oldV && isEmpty(oldV)) {
                    this.activeTab = this.isFund ? 'y1' : 'm3'
                    this.init(true, false)
                }
            },
        },
    },
    methods: {
        // 组合收益趋势，接口无数据，待处理
        async getTrendData(period = 'm1', reset) {
            let result
            if (!(result = this.list[period]) || reset) {
                const data = await PortfolioReturnTrend({
                    id: this.portfolioId,
                    period,
                })
                result = data?.result || {}
                const { portfolioTrend = {}, benchmarkTrend = [] } = result || {}
                // 两个对标指数 1、港股（股票和基金） 对标 恒生指数和恒生科技指数 2、美股（股票和基金） 对标 道指ETF、纳指100ETF
                const [firstBenchmarking = {}, secondBenchmarking = {}] = benchmarkTrend
                console.log(`getTrendData result ===> `, result)
                const getData = data => {
                    const xData = []
                    const yData = []
                    data?.forEach(i => {
                        xData.push(i.date)
                        yData.push(i.return)
                    })
                    return { xData, yData }
                }
                this.tooltips.hsi.label = firstBenchmarking.name
                this.tooltips.hstech.label = secondBenchmarking.name

                const portfolioData = { ...getData(portfolioTrend.trend) }
                const firstBenchmarkingData = { ...getData(firstBenchmarking.trend) }
                const secondBenchmarkingData = { ...getData(secondBenchmarking.trend) }
                const res = { portfolioData, firstBenchmarkingData, secondBenchmarkingData }
                this.list[period] = res
            }
            return this.list[period]
        },
        init(isInit, reset) {
            this.loading = true
            this.getTrendData(this.activeTab, reset)
                .then(data => {
                    this.initChart(data, isInit)
                })
                .catch(e => {
                    console.log('e ====>', e)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        initChart(data = {}) {
            if (this.isEmpty) return
            const chartDom = this.$refs.chart
            // debugger // eslint-disable-line
            const myChart = this.chart || echarts.init(chartDom, false)
            this.chart = myChart
            const { portfolioData, firstBenchmarkingData, secondBenchmarkingData } = data
            const xData = [...portfolioData?.xData]
            const yData = ([...portfolioData?.yData, ...firstBenchmarkingData?.yData, ...secondBenchmarkingData?.yData] || []).map(i => +i)
            const xInterval = Math.ceil((xData.length - 3) / 2) // X轴的间距
            const min = Math.min(...yData)
            let max = Math.max(...yData)
            if (min === max && min === 0) {
                max = min + 1
            }
            const yInterval = (max - min) / 4

            const option = {
                color: [
                    {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0.7,
                                color: 'rgba(39, 138, 255, 1)', // 0% 处的颜色
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
                    right: '3%',
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
                        data: portfolioData.yData,
                        // smooth: true,
                        animation: false, // 动画关闭
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
                            data: [{}],
                            animation: false,
                        },
                    },
                    {
                        type: 'line',
                        animation: false,
                        data: firstBenchmarkingData.yData,
                        lineStyle: {
                            color: '#FFA800',
                            width: 1,
                        },
                        showSymbol: false,
                    },
                    {
                        type: 'line',
                        animation: false,
                        data: secondBenchmarkingData.yData,
                        lineStyle: {
                            color: '#8F4BE5',
                            width: 1,
                        },
                        showSymbol: false,
                    },
                ],
            }
            const setLastestData = (data = {}, index) => {
                const { portfolioData, firstBenchmarkingData, secondBenchmarkingData } = data
                if (!(portfolioData && firstBenchmarkingData && secondBenchmarkingData)) return
                // 默认 - index 有可能是0|undefined
                const len = index ?? portfolioData.xData.length - 1
                // const hsiLen = firstBenchmarkingData.xData.length - 1
                // const hstechLen = secondBenchmarkingData.xData.length - 1
                const latestDate = portfolioData.xData[len]

                const portfolioValue = portfolioData.yData[len]
                const hsiValue = firstBenchmarkingData.yData[len]
                const hstechValue = secondBenchmarkingData.yData[len]

                const lastestData = { date: latestDate, portfolio: portfolioValue, hsi: hsiValue, hstech: hstechValue }

                Object.keys(this.tooltips).forEach(key => {
                    this.tooltips[key].value = lastestData[key]
                })
            }

            setLastestData({ portfolioData, firstBenchmarkingData, secondBenchmarkingData })

            option && myChart.setOption(option)

            const moveHandler = e => {
                e.preventDefault()
            }
            myChart.getZr().off('mousedown', this.mousedonwHandler)
            this.mousedonwHandler = () => {
                console.log('mousedown')
                clearTimeout(this.timer)
                if (!this.timer) {
                    this.timer = setTimeout(() => {
                        document.addEventListener('touchmove', moveHandler, { passive: false })
                    }, 1000)
                }
            }
            myChart.getZr().on('mousedown', this.mousedonwHandler)

            myChart.getZr().off('mouseup', this.mouseupHandler)
            this.mouseupHandler = () => {
                console.log('mouseup')
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
                setLastestData({ portfolioData, firstBenchmarkingData, secondBenchmarkingData })
            }
            // let params = null
            myChart.getZr().on('mouseup', this.mouseupHandler)

            const self = this
            myChart.on('highlight', { dataIndex: 1 }, params => {
                const { dataIndex } = params.batch[0]
                const data = self.list[self.activeTab] || {}
                const { portfolioData } = data
                setLastestData(data, dataIndex)

                const y = portfolioData.yData[dataIndex]
                const len = `${y}`.length

                const options = myChart.getOption()
                options.series[0].markLine.data = [
                    {
                        name: 'Avg',
                        yAxis: y,
                        lineStyle: { color: '#278AFF', type: 'dashed', width: 0.5 },
                        label: {
                            position: 'start',
                            backgroundColor: '#278AFF',
                            fontSize: len >= 7 ? 7 : len >= 6 ? 8 : 9, // (len === 7 => 1000.11%) (len === 6 => 999.22% ) (len < 6 => 11.xx%)
                            lineHeight: 13,
                            color: '#fff',
                            padding: [0, 0, 0, 3],
                            borderRadius: 2,
                            formatter: params => {
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
            this.init(false, false)
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

    .tool-tips {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin: 12px 12px 16px;
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
                // width: 87px;
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
                    margin-top: 4px;
                }
            }

            .content-item::before {
                position: absolute;
                top: 5px;
                left: -12px;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                content: '';
            }

            .content-item:nth-of-type(1)::before {
                background-color: #278aff;
            }

            .content-item:nth-of-type(2)::before {
                background-color: #ffa800;
            }

            .content-item:nth-of-type(3)::before {
                background-color: #8f4be5;
            }
        }

        .item {
            flex: 0 0 50px;

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

    .custom_ {
        display: flex;
        justify-content: space-between;
        margin: 12px 12px 16px;
        padding: 12px;
        color: #2f2f2f;
        font-weight: 700;
        line-height: 16px;
        background: #f9f9f9;
        border-radius: 4px;

        .date {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .dwjz {
            text-align: center;
        }

        .item {
            .top {
                margin-bottom: 8px;
                font-size: 14px;
            }

            .value {
                font-size: 12px;
            }
        }

        .systy {
            text-align: right;
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
    }

    .trend {
        width: 100%;
        height: 192px;
        padding: 0 12px;
    }

    .full {
        position: absolute;
        right: 20px;
        bottom: 34px;
        width: 16px;
        height: 16px;
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
                    color: #ff6907;
                    font-weight: 500;
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
