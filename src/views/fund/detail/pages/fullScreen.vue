<template>
    <div class="full-screen">
        <div class="performance-trend card" id="performance-trend" v-if="isCurrencyFund">
            <header>
                <div>
                    <div class="identification">
                        <h4 class="name" ref="nameRef">{{ name_ }}</h4>
                    </div>
                    <div class="bottom" ref="bottomRef">
                        <p class="code">
                            <span class="market" :class="[`currency-${currency_}`]"></span>
                            <span class="value" v-if="isPublic">{{ ISIN }}</span>
                        </p>
                    </div>
                </div>
                <div class="vcross" v-if="showClose">
                    <img class="iclose" @click="goback" src="~@/assets/images/fund/iclose.png" />
                </div>
            </header>
            <div class="tool-tips" v-if="isPerformanceTrend">
                <div class="content">
                    <div>
                        <span class="wgb">{{ $t('date') }}</span>
                        <span class="date">{{ tooltips.date.value || '--' }}</span>
                    </div>
                    <div class="content-item first_">
                        <p class="label">{{ tooltips.performance.label }}</p>
                        <p
                            class="value"
                            v-riseFall="{ value: tooltips.performance.value, base: getBase(tooltips.performance.value), rate: true, sign: true }"
                        ></p>
                    </div>
                </div>
            </div>
            <div class="tool-tips" v-else>
                <div class="content">
                    <div>
                        <span class="wgb">{{ $t('date') }}</span>
                        <span class="date">{{ tooltips.date.value || '--' }}</span>
                    </div>
                    <div class="content-item">
                        <p class="label">{{ $t(isDay7Annual ? 'jqrnhIncome' : 'wfIncome') }}</p>
                        <p
                            class="value"
                            v-riseFall="{
                                value: tooltips.performance.value,
                                base: getBase(tooltips.performance.value),
                                rate: isDay7Annual,
                                normal: false,
                            }"
                        ></p>
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
        <div class="performance-trend card" id="performance-trend" v-else>
            <header>
                <div>
                    <div class="identification">
                        <h4 class="name" ref="nameRef">{{ name_ }}</h4>
                    </div>
                    <div class="bottom" ref="bottomRef">
                        <p class="code">
                            <span class="market" :class="[`currency-${currency_}`]"></span>
                            <span class="value" v-if="isPublic">{{ ISIN }}</span>
                        </p>
                    </div>
                </div>
                <div class="vcross" v-if="showClose">
                    <img class="iclose" @click="goback" src="~@/assets/images/fund/iclose.png" />
                </div>
            </header>
            <div class="tool-tips">
                <div class="content">
                    <div>
                        <span class="wgb">{{ $t('date') }}</span>
                        <span class="date">{{ tooltips.date.value || '--' }}</span>
                    </div>
                    <div class="content-item first_">
                        <p class="label">{{ tooltips.performance.label }}</p>
                        <p
                            class="value"
                            v-riseFall="{ value: tooltips.performance.value, base: getBase(tooltips.performance.value), rate: true, sign: true }"
                        ></p>
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
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent, DatasetComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { getCurrencyTrend, getPerfTrend, getFundQuote } from '@/apis/fund/fund.js'
import { floatToRatio } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
import { CURRENCY_FUND_TREND_TYPE, FUND_TYPE_MAP } from '../../config/common'
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
    props: {},
    computed: {
        //获取当前基金类型
        isFundType() {
            return Number(this.$route.query.fundType)
        },
        isPublic() {
            return this.$route.query.isPublic
        },
        isCurrencyFund() {
            return this.isFundType === FUND_TYPE_MAP.keysMap.currency
        },
        isDay7Annual() {
            return this.activeHeader === CURRENCY_FUND_TREND_TYPE.keysMap.DAY7_ANNUAL
        },
        isIncome10k() {
            return this.activeHeader === CURRENCY_FUND_TREND_TYPE.keysMap.INCOME_10K
        },
        isPerformanceTrend() {
            return this.activeHeader === CURRENCY_FUND_TREND_TYPE.keysMap.PERFORMANCE_TREND
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
                    key: 'y2',
                    value: '24',
                    label: this.$t('nearTwoYear'),
                },
                {
                    key: 'y3',
                    value: '36',
                    label: this.$t('nearThreeYear'),
                },
                {
                    key: 'y4',
                    value: '48',
                    label: this.$t('nearFourYear'),
                },
                {
                    key: 'y5',
                    value: '60',
                    label: this.$t('nearFiveYear'),
                },
            ],
            activeTab: this.$route.query.activeTab || 'm1',
            tooltips: {
                date: {
                    key: 'date',
                    label: this.$t('date'),
                    value: '',
                },
                performance: {
                    key: 'performanceProfit',
                    label: this.$t('selfFund'),
                    value: '',
                },
                average: {
                    key: 'averageProfit',
                    label: this.$t('sameAverage'),
                    value: '',
                },
            },
            list: {
                m1: null,
                m3: null,
                m6: null,
                y1: null,
                y3: null,
                y6: null,
            },
            activeHeader: Number(this.$route.query.activeHeader),
            name_: '',
            currency_: '',
            ISIN: '',
            loading: true,
            showClose: this.$route.query.showClose === '1', // 是否显示关闭按钮
        }
    },
    mounted() {
        this.init()
        this.getQuote()
    },
    watch: {
        activeHeader: {
            handler() {
                Object.keys(this.list).forEach(item => {
                    this.list[item] = null
                })
                this.init()
            },
        },
    },
    methods: {
        async getQuote() {
            try {
                const res = await getFundQuote({ symbol: this.$route.query.symbol })
                const resultKey = this.$route.query.isPublic ? 'pubQuote' : 'priQuote'
                if (res.result && res.result[resultKey]) {
                    this.name_ = res.result[resultKey].name
                    this.currency_ = res.result[resultKey].currency
                    this.ISIN = res.result[resultKey].ISIN
                }
            } catch (e) {
                console.log('getQuote===>e:', e)
            }
        },
        goback() {
            if (JSBridge) {
                JSBridge.close()
            } else {
                this.$router.go(-1)
            }
        },
        init() {
            this.loading = true
            this.getTrend()
                .then(data => {
                    this.initChart(data)
                })
                .finally(() => {
                    this.loading = false
                })
        },
        async getTrend() {
            const performanceRes = {
                xData: [],
                yData: [],
                profit: [],
            }
            const averageRes = {
                xData: [],
                yData: [],
                profit: [],
            }
            try {
                const data = this.list[this.activeTab]
                if (data) return data
                let performance = data ? data.performance : []
                let average = data ? data.average : []
                const params = {
                    symbol: this.$route.query.symbol,
                    period: this.activeTab,
                }
                const params_ = {
                    symbol: this.$route.query.symbol,
                    type: this.isDay7Annual ? 1 : 2, //type为1: 单独获取七日年化 2: 单独获取万份收益
                    period: this.activeTab,
                }
                let resData
                if (!this.isCurrencyFund || this.isPerformanceTrend) {
                    resData = (await getPerfTrend(params)) || {}
                } else {
                    resData = (await getCurrencyTrend(params_)) || {}
                }
                const result = resData.result || {}
                performance = result.data || result.list || []
                average = result.sameAverage || []
                performance.forEach(i => {
                    performanceRes.xData.push(i.date.replace(/-/g, '/'))
                    let key = ''
                    if (!this.isCurrencyFund || this.isPerformanceTrend) {
                        key = 'return'
                    } else {
                        if (this.isDay7Annual) {
                            key = 'returnD7ToY1'
                        } else if (this.isIncome10k) {
                            key = 'income10k'
                        }
                    }
                    performanceRes.yData.push(i[key])
                    performanceRes.profit.push(i[key])
                })
                const res = {
                    performance: performanceRes,
                    average: averageRes,
                }
                this.list[this.activeTab] = res
                return res
            } catch (e) {
                console.error('getPerfTrend===>error:', e)
                return {
                    performance: performanceRes,
                    average: averageRes,
                }
            }
        },
        initChart(data = {}) {
            console.log(`Feng.chen:: 11:17:52 initChart data ===> `, data)
            const performance = data.performance // 本基金业绩走势
            const average = data.average // 同类平均
            const chartDom = this.$refs.chart
            // debugger // eslint-disable-line
            const myChart = this.chart || echarts.init(chartDom)
            this.chart = myChart
            const xData = Array.from(new Set([...performance.xData, ...average.xData])) || []
            const yData = (Array.from(new Set([...performance.yData, ...average.yData])) || []).map(i => +i)
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
                    right: '2',
                    left: '8%',
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
                            return floatToRatio(v, {
                                rate: this.isCurrencyFund && this.isIncome10k ? false : true,
                                base: 2,
                                toFixed: true,
                                sign: false,
                            })
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
                        data: performance.yData,
                        // smooth: true,
                        animation: false, // 动画关闭
                        areaStyle: {
                            origin: 'start',
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
                    {
                        type: 'line',
                        animation: false,
                        data: average.yData,
                        lineStyle: {
                            color: '#FFA800',
                            width: 1,
                        },
                        showSymbol: false,
                    },
                ],
            }
            const setLastestData = () => {
                // 默认 同类平均数据不会比本基金数据长
                const len = performance.xData.length - 1
                const aveLen = average.xData.length - 1
                const latestDate = performance.xData[len]
                let averageData = average.profit[len]
                // 当同类平均比本基金数据少 但是最后一条日期一样
                if (aveLen < len && average.xData[average.xData.length - 1] === latestDate) {
                    averageData = average.profit[average.xData.length - 1]
                }
                const lastestData = { date: latestDate, performance: performance.profit[len], average: averageData }
                Object.keys(this.tooltips).forEach(key => {
                    this.tooltips[key].value = lastestData[key]
                })
            }

            setLastestData()

            option && myChart.setOption(option)

            const moveHandler = e => {
                e.preventDefault()
            }
            myChart.getZr().on('mousemove', () => {
                document.addEventListener('touchmove', moveHandler, { passive: false })
            })
            // let params = null
            myChart.getZr().on('mouseup', () => {
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
                const data = self.list[self.activeTab]
                const performance = data.performance // 本基金业绩走势
                const average = data.average // 同类平均
                const tempData = {
                    date: performance.xData[dataIndex],
                    performance: performance.profit[dataIndex],
                    average: average.profit[dataIndex],
                }
                Object.keys(this.tooltips).forEach(key => {
                    this.tooltips[key].value = tempData[key]
                })
                const y = performance.yData[dataIndex]

                const options = myChart.getOption()
                options.series[0].markLine.data = [
                    {
                        name: 'Avg',
                        yAxis: y,
                        lineStyle: { color: '#278AFF', type: 'dashed', width: 0.5 },
                        label: {
                            position: 'start',
                            backgroundColor: '#278AFF',
                            fontSize: this.isCurrencyFund && this.isDay7Annual ? 7 : 9,
                            lineHeight: 13,
                            color: '#fff',
                            padding: [0, 3, 0, 3],
                            borderRadius: 2,
                            formatter: params => {
                                return this.isCurrencyFund && this.isIncome10k ? params.data.value : params.data.value + '%'
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

        getBase(v) {
            return (v || '').split('.')[1]?.length || 2
        },
    },
}
</script>

<style scoped lang="less">
.full-screen {
    position: absolute;
    top: 0;
    left: 100vw;
    width: 100vh;
    height: 100vw;
    transform: rotate(90deg);
    transform-origin: 0% 0%;
}

.card {
    background: #fff;
    border-radius: 8px;
}

.performance-trend {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-left: 13px;

    header {
        display: flex;
        flex: 0 0 57px;
        align-items: center;
        justify-content: space-between;
        padding: 12px 22px 7px 35px;
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;

        .henader-checker {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
        }

        .identification {
            .name {
                color: #1f1f1f;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }
        }

        .bottom {
            display: flex;
            justify-content: space-between;

            .code {
                display: flex;
                align-items: center;
                padding: 2px 0 0;

                .market {
                    margin-right: 5px;
                }

                .value {
                    color: #666;
                    font-size: 11px;
                    line-height: 14px;
                }
            }
        }

        span {
            margin-right: 28px;
        }

        .vcross {
            padding-right: 6px;
            font-size: 24px;

            .iclose {
                width: 24px;
                height: 24px;
            }
        }
    }

    .title {
        padding: 0 12px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    .custom-sty {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 12px 12px 16px;
        padding: 6px;
        background: #f9f9f9;
        border-radius: 4px;

        .date {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .label {
            margin-bottom: 8px;
        }
    }

    .tool-tips {
        display: flex;
        flex: 0 0 34px;
        flex-direction: column;
        justify-content: space-between;
        padding: 0 25px;
        // margin: 12px 12px 16px;

        border-radius: 4px;

        .date {
            margin: 0 16px 0 12px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .content {
            display: flex;
            flex-direction: row;
            height: 100%;
            padding: 9px 0 9px 10px;
            background: #f9f9f9;
            border-radius: 4px;

            .wgb {
                font-weight: 700;
            }

            .content-item {
                position: relative;
                display: flex;
                min-width: 112px;
                margin-left: 16px;
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
                    margin-left: 16px;
                }
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

            .first_::before {
                background-color: #278aff;
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
        flex-grow: 1;
        width: 100%;
        height: 100%;
    }

    .trend {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0 24px 0 0;

        .full {
            position: absolute;
            right: 10px;
            bottom: -20px;
        }
    }

    .btns {
        display: flex;
        flex: 0 0 47px;
        padding: 6px 24px 14px 35px;
        user-select: none;

        .btn {
            flex: 1 1 auto;
            height: 27px;
            line-height: 27px;
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
                background: @tabBackground;
                border-radius: 18px;

                button {
                    color: @theme;
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
