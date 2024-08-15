<template>
    <div class="card performance-trend">
        <van-skeleton row="10" :loading="!isFundType">
            <template>
                <!-- 货币基金 -->
                <div id="performance-trend" v-if="isCurrencyFund">
                    <header>
                        <span
                            v-for="item in activeHeaderList"
                            :key="item.key"
                            :class="{ 'henader-checker': activeHeader === item.key }"
                            @click="activeHeader = item.key"
                        >
                            {{ item.label }}
                        </span>
                    </header>
                    <!-- 净值走势 -->
                    <div v-if="isPerformanceTrend" class="custom_">
                        <div class="date-content item">
                            <p class="top">{{ $t('date') }}</p>
                            <p class="date">{{ tooltips.date.value || '--' }}</p>
                        </div>
                        <div class="dwjz item">
                            <p class="top">{{ tooltips.acumNav.label }}</p>
                            <p class="date">{{ tooltips.acumNav.value }}</p>
                        </div>
                        <div class="systy item">
                            <p class="top">{{ $t('profit') }}</p>
                            <p
                                class="value"
                                v-riseFall="{ value: tooltips.performance.value, base: getBase(tooltips.performance.value), rate: true, sign: true }"
                            ></p>
                        </div>
                    </div>
                    <!-- 七日年化|万元收益 -->
                    <div v-else class="custom-sty">
                        <div>
                            <p class="label">{{ $t('date') }}</p>
                            <p class="date">{{ tooltips.date.value || '--' }}</p>
                        </div>

                        <div class="content text-r">
                            <p class="label">{{ $t(isDay7Annual ? 'jqrnhIncome' : 'wfIncome') }}</p>
                            <p
                                class="value"
                                v-riseFall="{
                                    value: tooltips.performance.value,
                                    base: getBase(tooltips.performance.value),
                                    rate: isDay7Annual,
                                    sign: isDay7Annual,
                                }"
                            ></p>
                        </div>
                    </div>
                </div>

                <!-- 非货币基金 -->
                <div id="performance-trend" v-else>
                    <h3 class="title">{{ $t('performanceTrend') }}</h3>
                    <div class="custom_">
                        <div class="date-content item">
                            <p class="top">{{ $t('date') }}</p>
                            <p class="date">{{ tooltips.date.value || '--' }}</p>
                        </div>
                        <div class="dwjz item">
                            <p class="top">{{ tooltips.acumNav.label }}</p>
                            <p class="date">{{ tooltips.acumNav.value }}</p>
                        </div>
                        <div class="systy item">
                            <p class="top">{{ $t('profit') }}</p>
                            <p
                                class="value"
                                v-riseFall="{
                                    value: tooltips.performance.value,
                                    base: getBase(tooltips.performance.value),
                                    rate: true,
                                    sign: true,
                                }"
                            ></p>
                        </div>
                    </div>
                </div>
                <!-- 趋势图标展示模块 -->
                <template>
                    <div class="chart-trend">
                        <div class="trend" ref="chart"></div>
                        <img class="full" @click="fullScreen" src="~@/assets/images/fund/Ellipse51.png" />
                        <div v-show="loading" class="loading">{{ $t('loading') }}...</div>
                    </div>
                </template>
                <!-- 区间模块 -->
                <ul class="btns" @click="onBtnClick">
                    <li class="btn mask" :class="{ selected: item.key === activeTab }" v-for="item in btns" :key="item.key" :data-key="item.key">
                        <button>{{ item.label }}</button>
                    </li>
                    <van-popover v-model="showMore" trigger="click" :get-container="getCurrencyPopoverContainer">
                        <ul class="more-list" @click.stop="onBtnClick">
                            <li
                                class="mask"
                                v-for="item in moreBtns"
                                :class="{ 'more-selected': item.key === activeTab }"
                                :key="item.key"
                                :data-key="item.key"
                            >
                                <span>{{ item.label }}</span>
                            </li>
                        </ul>
                        <template #reference>
                            <li class="btn more-btn mask" :class="{ selected: moreBtnsKeys.includes(activeTab) }">
                                <button>{{ moreBtnsKeys.includes(activeTab) ? getMoreBtnText(activeTab) : moreBtn.label }}</button>
                                <multi-img v-show="!moreBtnsKeys.includes(activeTab)" class="arrow" name="angle_trigger" directory="fund"></multi-img>
                                <multi-img
                                    v-show="moreBtnsKeys.includes(activeTab)"
                                    class="arrow"
                                    name="angle_trigger_active"
                                    directory="fund"
                                ></multi-img>
                            </li>
                            <div ref="trigger" class="trigger-container"></div>
                        </template>
                    </van-popover>
                </ul>
            </template>
        </van-skeleton>
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, TooltipComponent, DatasetComponent, MarkLineComponent, MarkPointComponent } from 'echarts/components'
import { LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { getCurrencyTrend, getPerfTrend } from '@/apis/fund/fund.js'
import { floatToRatio } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
import { getFundQuote } from '@/apis/fund/fund'
import { FUND_TYPE_MAP, CURRENCY_FUND_TREND_TYPE } from '../../config/common'
import { Skeleton } from 'vant'
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
        [Skeleton.name]: Skeleton,
    },
    filters: {
        thousandsFilter,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    computed: {
        isPublic() {
            return this.$route.query.type === 'public'
        },
        symbol() {
            return this.$route.query.symbol
        },
        moreBtnsKeys() {
            return this.moreBtns.map(item => item.key)
        },
        isCurrencyFund() {
            return this.isFundType === FUND_TYPE_MAP.keysMap.currency
        },
        activeHeaderList() {
            return CURRENCY_FUND_TREND_TYPE.options
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
            showMore: false,
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
            moreBtn: {
                key: 'more',
                value: '0',
                label: this.$t('more'),
            },
            moreBtns: [
                {
                    key: 'y2',
                    value: '24',
                    label: this.$t('nearTwoYear'),
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
            activeTab: 'm1',
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
                acumNav: {
                    key: 'acumNavProfit',
                    label: this.$t('currencyNet'),
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
            activeHeader: CURRENCY_FUND_TREND_TYPE.keysMap.DAY7_ANNUAL,
            showFull: true,
            isFundType: '',
            loading: true, // 是否处于切换净值趋势|万元中
        }
    },
    async mounted() {
        this.isFundType = Number(this.$route.query.fundType)
        await this.getQuote()
        this.init()
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
                const resultKey = this.isPublic ? 'pubQuote' : 'priQuote'
                if (res.result && res.result[resultKey]) {
                    this.isFundType = Number(res.result[resultKey]['type'])
                }
            } catch (e) {
                console.log('getQuote===>e:', e)
            }
        },
        fullScreen() {
            const url = `${location.origin}/wealth/fund.html#/full-page?type=private&symbol=${this.$route.query.symbol}&fundType=${this.isFundType}&isPublic=${this.isPublic}&activeHeader=${this.activeHeader}&activeTab=${this.activeTab}&showClose=1`
            JSBridge
                ? JSBridge.open({ url: encodeURIComponent(url), title: this.$t('historyNet'), navbar: false })
                : this.$router.push({
                      path: '/full-page',
                      query: {
                          symbol: this.$route.query.symbol,
                          type: 'private',
                          fundType: this.isFundType,
                          activeHeader: this.activeHeader,
                          activeTab: this.activeTab,
                          isPublic: this.isPublic,
                          showClose: '1',
                      },
                  })
        },
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
                const params = {
                    symbol: this.symbol,
                    period: this.activeTab,
                }
                const params_ = {
                    symbol: this.symbol,
                    type: this.isDay7Annual ? 1 : 2, //type为1: 单独获取七日年化 2: 单独获取万份收益
                    period: this.activeTab,
                }
                let resData
                // 非货币基金
                if (!this.isCurrencyFund || this.isPerformanceTrend) {
                    resData = (await getPerfTrend(params)) || {}
                } else {
                    resData = (await getCurrencyTrend(params_)) || {}
                }
                const result = resData.result || {}
                performance = result.data || result.list || []

                performance.forEach(i => {
                    performanceRes.xData.push(i.date.replace(/-/g, '/'))
                    performanceRes.acumNavList.push(i.acumNav)
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
                }
                this.list[this.activeTab] = res
                return res
            } catch (e) {
                console.error('getPerfTrend===>error:', e)
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
                ],
            }
            const setLastestData = () => {
                const len = performance.xData.length - 1
                const latestDate = performance.xData[len]

                const lastestData = {
                    date: latestDate,
                    performance: performance.profit[len],
                    acumNav: performance.acumNavList[len],
                }
                Object.keys(this.tooltips).forEach(key => {
                    this.tooltips[key].value = lastestData[key]
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
                const data = self.list[self.activeTab]
                // 如果加载新的activeTab的内容中，会导致中间态的情况下data为空
                if (!data) return
                const performance = data.performance // 本基金业绩走势
                const tempData = {
                    date: performance.xData[dataIndex],
                    performance: performance.profit[dataIndex],
                    acumNav: performance.acumNavList[dataIndex],
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
            const key = e?.target?.dataset.key
            if (!key) return
            this.showMore && (this.showMore = false)
            this.activeTab = key
            this.init()
        },
        getCurrencyPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },

        getMoreBtnText(key) {
            const instance = this.moreBtns.find(item => item.key === key)
            return instance ? instance.label : ''
        },

        getBase(v) {
            return (v || '').split('.')[1]?.length || 2
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
            color: @fontBlackColor;
            font-weight: 700;
            font-size: 16px;
        }

        span {
            margin-right: 28px;
        }
    }

    .title {
        padding: 0 12px;
        color: @fontBlackColor;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    .custom-sty {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 12px 12px 16px;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 4px;

        .date {
            color: @fontGreyColor;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .label {
            margin-bottom: 8px;
            color: @fontBlackColor;
            font-weight: bold;
            font-size: 12px;
            line-height: 16px;
        }

        .value {
            font-weight: 500;
            font-size: 12px;
        }
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
            color: @fontGreyColor;
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
                width: 112px;
                margin-left: 12px;
                color: @fontBlackColor;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;

                .label {
                    color: @fontBlackColor;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
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

            .content-item:first-of-type::before {
                background-color: #278aff;
            }
        }

        .item {
            flex: 0 0 50px;

            .label {
                color: @fontBlackColor;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;
            }

            .value {
                margin-top: 4px;
                color: @fontGreyColor;
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
        color: @fontBlackColor;
        font-weight: 700;
        line-height: 16px;
        background: #f9f9f9;
        border-radius: 4px;

        .date {
            color: @fontGreyColor;
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
                font-size: 12px;
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
        width: 100%;
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
            display: flex;
            flex: 1 1 auto;
            align-items: center;
            justify-content: center;
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

            .arrow {
                width: 6px;
                margin-left: 5px;
            }
        }

        .more-btn {
            width: 56px;
        }
    }
}

.more-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;

    li {
        width: 69px;
        padding: 8px 12px;
        color: @fontBlackColor;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
        box-shadow: inset 0 -0.5px 0 #efefef;
    }

    li:last-of-type {
        box-shadow: none;
    }

    .more-selected {
        color: @theme;
    }
}

.trigger-container {
    /deep/ .van-popover {
        .van-popover__arrow {
            #arrow_color();
        }

        .van-popover__content {
            background-color: unset;
            border-radius: 4px;
            box-shadow: 0 -1px 10px rgba(50, 50, 51, 0.15);
        }
    }
}
</style>
