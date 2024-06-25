<!--
 * @Description: 投资组合下单
-->
<template>
    <div class="c-main" id="order">
        <div class="pad-12 pad-b20 basic-info">
            <div class="top_info container">
                <h5 class="f16 bold mar-r8 lh-22">{{ basicInfo.name ?? '' }}</h5>
                <portfolio-tag :portfolioType="basicInfo.type" :tag-obj="tagObj"></portfolio-tag>
            </div>

            <div class="profit-info container">
                <div class="date-tab">
                    <div class="date-select">
                        <span
                            class="select-item"
                            v-for="(item, index) in dateTabArr"
                            :key="index"
                            :class="{ select: item.value === periodItem.dateType }"
                            @click="selectDateAction(item.value)"
                        >
                            {{ item.label }}
                        </span>
                    </div>
                    <div class="custom" @click="selectDateAction('')">
                        <multi-img
                            class="custom-date"
                            :name="isCustomDate ? 'icon_trade_calendar_sel' : 'icon_trade_calendar_nor'"
                            directory="fund"
                            alt="custom date"
                        ></multi-img>
                    </div>
                </div>
                <div class="profit-detail">
                    <van-popover v-model="currencySwitch" :trigger="popoverTrigger" :get-container="getCurrencyPopoverContainer" ref="currencyList">
                        <ul class="list" @click="onCurrencyChoose">
                            <li
                                class="item"
                                :class="{ selected: item.value === currency }"
                                :data-key="item.value"
                                v-for="item in currencyList"
                                :key="item.value"
                            >
                                {{ item.text }}
                            </li>
                        </ul>
                        <template #reference>
                            <div class="total-assets">
                                <label for="">
                                    <multi-img
                                        class="profit-tips"
                                        name="icon-tips"
                                        directory="common"
                                        alt="alert"
                                        @click.stop="tipsRemind"
                                    ></multi-img>
                                    <span>{{ $t('investAdvisory.accumulateProfitLoss') + '·' }}</span>
                                    <span>{{ currency | currencyFilter(currencyList) }}</span>
                                    <multi-img
                                        v-if="!isInvestmentMigration"
                                        name="angle_trigger"
                                        directory="fund"
                                        class="trigger"
                                        alt="select"
                                    ></multi-img>
                                    <div ref="trigger" class="trigger-container"></div>
                                    <multi-img @click.stop="switchAmountStatus" :name="iconEye" directory="fund" alt="amount-switch"></multi-img>
                                </label>
                            </div>
                        </template>
                    </van-popover>
                </div>
                <div class="profit-total-amount">
                    <h3
                        class="amount elipsis"
                        id="amountAssets"
                        v-riseFall="{
                            value: totalAssets,
                            normal: true,
                            hide: !amountStatus,
                            sign: false,
                            riseFall: false,
                            rate: false,
                            hideObj: { text: '*****', color: '#2F2F2F' },
                        }"
                    ></h3>
                </div>
                <div class="profit-loss-detail">
                    <div class="profit-loss-detail-item">
                        <label for="">{{ $t('investAdvisory.accumulateProfit') }}</label>
                        <h3
                            class="profit-amount elipsis"
                            ref="accumulatedProfit"
                            v-riseFall="{
                                value: accumulatedProfit,
                                rate: false,
                                normal: false,
                                hide: !amountStatus,
                                hideObj: { text: secretDefault, color: '#666666' },
                            }"
                            id="accumulatedProfit"
                        ></h3>
                    </div>
                    <div class="divide"></div>
                    <div class="profit-loss-detail-item">
                        <label for="">{{ $t('investAdvisory.accumulateLoss') }}</label>
                        <h3
                            class="profit-amount elipsis"
                            ref="accumulatedLoss"
                            v-riseFall="{
                                value: accumulatedLoss,
                                normal: false,
                                rate: false,
                                hide: !amountStatus,
                                hideObj: { text: secretDefault, color: '#666666' },
                            }"
                            id="accumulatedLoss"
                        ></h3>
                    </div>
                </div>
                <div class="profit-time">
                    {{ totalCountAndTime }}
                </div>
                <DatePopup
                    v-model="datePopup"
                    :limitDate="minDate"
                    :minDate="minDate"
                    :maxDate="maxDate"
                    :show-tip="true"
                    :types="['All', 'M1', 'M3', 'Y1']"
                    @click="clickDateHandler"
                ></DatePopup>
            </div>

            <div class="calendar-info container">
                <div class="title">{{ $t('investAdvisory.profitCanlendar') }}</div>
                <div class="date-picker">
                    <div class="left" @click="showDatePicker(pickerType)">
                        <span>{{ pickerTitle }}</span>
                        <multi-img name="angle_trigger" directory="fund"></multi-img>
                    </div>
                    <div class="right">
                        <div class="tab" :class="{ 'tab-active': pickerType === 0 }" @click="() => (pickerType = 0)">
                            {{ $t('yue') }}
                        </div>
                        <div
                            class="tab"
                            :class="{ 'tab-active': pickerType === 1 }"
                            @click="
                                () => {
                                    pickerType = 1
                                    $refs.yearCalendar.resize()
                                }
                            "
                        >
                            {{ $t('nian') }}
                        </div>
                    </div>
                </div>
                <!-- 月日历 -->
                <SwipeCalendar
                    v-show="isMonth"
                    class="calendar-choose"
                    :amountStatus="amountStatus"
                    :is-month="true"
                    :current-date="monthPickerDate"
                    :currency="currency"
                    @change="monthChange"
                ></SwipeCalendar>
                <!-- 年日历 -->
                <SwipeCalendar
                    v-show="!isMonth"
                    class="calendar-choose"
                    :amountStatus="amountStatus"
                    :is-month="false"
                    :current-date="yearPickerDate"
                    :currency="currency"
                    ref="yearCalendar"
                    @change="yearChange"
                ></SwipeCalendar>

                <MonthYearPicker
                    v-model="monthYearPopup"
                    :minDate="minDate"
                    :maxDate="maxDate"
                    :is-month="isMonth"
                    :input-date="pickerDate"
                    @click="selectMonthOrYear"
                ></MonthYearPicker>
            </div>
        </div>
    </div>
</template>

<script>
import { amountFilter, amountFormatter } from '@/config/filters.js'
import { mapState } from 'vuex'
import portfolioTag from '../components/portfolioTag.vue'
import { dynamicFontSize, keepDecimals } from '@/utils'
import { CURRENCY_MAP } from '../../config/common'
import SelectCurrency from '../../components/selectCurrency.vue'
import { profitLossSummary } from '@/apis/portfolioFollow/index.js'
import { sourcePageMap } from '../../config/common'
import { i18n } from '@/i18n/fund'
import goPage from '@/config/globalProterties/goPage'
import DatePopup from './components/datePopup.vue'
import dayjs from 'dayjs'
import { getNearMonth, getNearThreeMonth } from '@/utils/utils.js'
import MonthYearPicker from './components/monthYearPopup.vue'
import SwipeCalendar from './components/swipeCalendar.vue'
import investAdvisoryMixin from '../mixins/investAdvisoryMixin'
import { tradingCalendar } from '@/apis/market.js'

const dateFormat = date => dayjs(date).format('YYYY/MM/DD')

export default {
    name: 'place-order',
    components: {
        portfolioTag,
        SelectCurrency,
        DatePopup,
        MonthYearPicker,
        SwipeCalendar,
    },
    mixins: [investAdvisoryMixin],
    data() {
        return {
            dateTabArr: [
                { label: this.$t('fundList.all'), value: 'All' },
                { label: this.$t('nearOneMonth'), value: 'M1' },
                { label: this.$t('nearThreeMonth'), value: 'M3' },
                { label: this.$t('nearOneYear'), value: 'Y1' },
            ],
            currencySwitch: false,
            currencyList: [
                { value: 'HKD', text: i18n.t('HKD') },
                { value: 'USD', text: i18n.t('USD') },
                { value: 'CNH', text: i18n.t('CNH') },
            ],
            amountStatus: true, // true - 展示资金内容 false - 隐藏资金内容
            datePopup: false,
            monthYearPopup: false,
            minDate: new Date('2022-01-01'),
            maxDate: new Date(),
            periodItem: {
                rangeStart: '',
                rangeEnd: '',
                dateType: 'All',
            },
            pickerType: 0, //0-月份， 1-年份
            monthPickerDate: new Date(),
            yearPickerDate: new Date(),
            monthPickerString: '',
            yearPickerString: '',
            secretDefault: '****',
            summaryInfo: {},
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        currencyName() {
            return this.currency ? CURRENCY_MAP.keyValueMap[this.currency] : 'HKD'
        },

        sourcePage() {
            return sourcePageMap.upgradeInvestService
        },
        iconEye() {
            return this.amountStatus ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
        isMonth() {
            return this.pickerType === 0
        },
        totalAssets() {
            const currency = this.currency ?? 'HKD'
            return this.summaryInfo.accumProfitLoss?.[currency] ?? '--'
        },
        totalCountAndTime() {
            const count = this.summaryInfo.accumHoldingCount ? this.summaryInfo.accumHoldingCount + '' : '--'
            const countText = this.amountStatus ? count : this.secretDefault
            let date = '--'
            if (this.summaryInfo.date && !!this.summaryInfo.date) {
                date = this.summaryInfo.date?.replace(new RegExp('-', 'g'), '/') ?? '--'
            }
            return this.$t('investAdvisory.totalNumberAndTime', { count: countText, date: date })
        },
        accumulatedProfit() {
            const currency = this.currency ?? 'HKD'
            return this.summaryInfo.accumProfit?.[currency] ?? '--'
        },
        accumulatedLoss() {
            const currency = this.currency ?? 'HKD'
            return this.summaryInfo.accumLoss?.[currency] ?? '--'
        },

        pickerTitle() {
            return this.isMonth ? this.monthPickerString : this.yearPickerString
        },

        pickerDate() {
            return this.isMonth ? this.monthPickerDate : this.yearPickerDate
        },

        isCustomDate() {
            return !this.periodItem.dateType.length
        },
        isInvestmentMigration() {
            return this.$route.query.isInvestmentMigration == 1
        },
        popoverTrigger() {
            return this.$route.query.isInvestmentMigration == 1 ? '' : 'click'
        },
    },
    filters: {
        amountFilter(v) {
            return amountFormatter(v, { base: 2 })
        },
        currencyFilter(v) {
            return CURRENCY_MAP.keyValueMap[v] || ''
        },
    },
    watch: {
        amountStatus(v) {
            if (v) {
                this.resetFontSize()
            }
        },
    },
    created() {
        //收益日历有延迟，以美股T-2交易日为准
        this.maxDate = this.getPreviousDate(2)
        this.periodItem.rangeStart = dateFormat(this.minDate)
        this.periodItem.rangeEnd = dateFormat(this.maxDate)
        this.fetchTradeCalendar()
    },
    async mounted() {
        this.yearPickerString = dayjs(this.maxDate).format('YYYY')
        this.monthPickerString = dayjs(this.maxDate).format('YYYY/MM')
        await this.getBasicInfo()
        this.initAssetsWatching()
        this.setAmountStatus()
        await this.getAssetSummary()
    },
    beforeDestroy() {},
    methods: {
        amountFormat(v, decimal = 2) {
            v = v + ''
            v = v.replace(/,/g, '')
            return amountFilter(keepDecimals(Number(v), decimal))
        },

        selectDateAction(type) {
            if (type.length > 0) {
                this.periodItem.dateType = type
                this.periodItem.rangeEnd = dateFormat(this.maxDate)
                if (type === 'All') {
                    this.periodItem.rangeStart = dateFormat(this.minDate)
                } else if (type === 'M1') {
                    this.periodItem.rangeStart = getNearMonth(this.maxDate).start
                } else if (type === 'M3') {
                    this.periodItem.rangeStart = getNearThreeMonth(this.maxDate).start
                } else if (type === 'Y1') {
                    const currentDate = new Date(dateFormat(this.maxDate))
                    const lastYearDate = currentDate.setFullYear(currentDate.getFullYear() - 1)
                    this.periodItem.rangeStart = dateFormat(lastYearDate)
                }
                //重新请求数据
                this.getAssetSummary()
            } else {
                this.datePopup = true
            }
        },
        clickDateHandler(item) {
            this.periodItem = { ...item }
            this.periodItem.dateType = ''
            //重新请求数据
            this.getAssetSummary()
        },
        getCurrencyPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },
        onCurrencyChoose(e) {
            this.currency = e.target.dataset.key
        },
        switchAmountStatus() {
            this.amountStatus = !this.amountStatus
            this.emitStatus(this.amountStatus)
            if (this.$jsBridge) {
                this.$jsBridge.setAssetsShowStatus({ showAssets: this.amountStatus })
            } else {
                localStorage.setItem(this.amountStatusKey, JSON.stringify(this.amountStatus))
            }
        },
        emitStatus(status) {
            this.$emit('assetsStatus', status)
        },

        async setAmountStatus() {
            if (this.$jsBridge) {
                const data = await this.$jsBridge.getAssetsShowStatus()
                this.amountStatus = data
            } else {
                try {
                    this.amountStatus = JSON.parse(localStorage.getItem(this.amountStatusKey))
                } catch (e) {
                    this.amountStatus = true
                    localStorage.setItem(this.amountStatusKey, JSON.stringify(this.amountStatus))
                }
            }
        },

        initAssetsWatching() {
            if (this.$jsBridge) {
                const onVisible = () => {
                    this.$jsBridge
                        .getAssetsShowStatus()
                        .then(data => ((this.amountStatus = data), this.emitStatus(data)))
                        .catch(() => ((this.amountStatus = true), this.emitStatus(true)))
                }
                this.$jsBridge?.watchPageVisible(onVisible)
            }
        },

        tipsRemind() {
            // 帮助中心文章
            const href = 'https://h5.fotechwealth.com/faq/#/article/502678496569291776/1'
            goPage(href)
        },

        resetFontSize() {
            this.$nextTick(() => {
                // 公共动态修改
                const commonKeys = ['amountAssets', 'accumulatedLoss', 'accumulatedProfit']
                // 动态设置金额的字体大小
                const keys = commonKeys
                keys.forEach(dom => {
                    let minFontSize = 12
                    if (dom === 'amountAssets') {
                        minFontSize = 24
                    }
                    dynamicFontSize({ dom, minFontSize, context: this })
                })
            })
        },

        showDatePicker(type) {
            this.monthYearPopup = true
            if (type === 0) {
                //展示月份picker
                return
            }
            //展示年份picker
        },

        selectMonthOrYear(pickerDate, pickerDateString) {
            if (this.isMonth) {
                this.monthPickerDate = pickerDate
                this.monthPickerString = pickerDateString
            } else {
                this.yearPickerDate = pickerDate
                this.yearPickerString = pickerDateString
            }
        },

        monthChange(date, monthKey) {
            this.monthPickerDate = date
            this.monthPickerString = monthKey
        },
        yearChange(date, yearKey) {
            this.yearPickerDate = date
            this.yearPickerString = yearKey
        },

        async getAssetSummary() {
            // 下单买入
            try {
                const params = {
                    subAcctId: this.subAccountId,
                    portfolioId: this.portfolioId,
                    applyAccountId: this.applyAccountId,
                    fromDate: this.periodItem.rangeStart.replace(new RegExp('/', 'g'), '-'),
                    toDate: this.periodItem.rangeEnd.replace(new RegExp('/', 'g'), '-'),
                }
                console.log('getAssetSummary===>params:', params)
                const { result } = await profitLossSummary(params)
                console.log('getAssetSummary===>result:', result)
                if (result) {
                    this.summaryInfo = result
                }
            } catch (e) {
                console.error('getAssetSummary===>error:', e)
            }
        },

        //获取前n个交易日日期
        getPreviousDate(days, fromDate = new Date()) {
            const previousDate = new Date()
            previousDate.setDate(fromDate.getDate() - days)
            return previousDate
        },

        async fetchTradeCalendar() {
            try {
                const currentDate = new Date()
                //获取前10天的日期 //兼容圣诞节 + 周末的情况，多请求几天
                const preDate = this.getPreviousDate(10)
                //需求 目前港美股 都按美股处理
                const params = {
                    dir: 1,
                    start: 0,
                    count: 5,
                    s: 'desc',
                    markets: ['us'],
                    startDate: dayjs(preDate).format('YYYYMMDD'),
                    endDate: dayjs(currentDate).format('YYYYMMDD'),
                }
                console.log('fetchTradeCalendar===>params:', params)
                const { result } = await tradingCalendar(params)
                console.log('fetchTradeCalendar===>result:', result)
                const list = result?.list ?? []
                if (list.length > 0) {
                    const dateList = list[0].tradeDateList ?? []
                    let maxDateString = ''
                    if (dateList.length >= 3) {
                        const currentDateStr = dayjs(currentDate).format('YYYY-MM-DD')
                        const currentIsTrading = dateList[0].date?.startsWith(currentDateStr) ?? false
                        if (currentIsTrading) {
                            maxDateString = dateList[2].date ?? ''
                        } else {
                            maxDateString = dateList[1].date ?? ''
                        }
                    }
                    if (maxDateString.length > 0) {
                        this.maxDate = new Date(maxDateString.replace(new RegExp('-', 'g'), '/'))
                        this.yearPickerString = dayjs(this.maxDate).format('YYYY')
                        this.monthPickerString = dayjs(this.maxDate).format('YYYY/MM')
                        this.periodItem.rangeEnd = dateFormat(this.maxDate)
                        this.getAssetSummary()
                    }
                }
            } catch (e) {
                console.error('fetchTradeCalendar===>error:', e)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.basic-info {
    .container {
        display: flex;
        margin-bottom: 12px;
        background: #fff;
        background-color: #fff;
        border-radius: 8px;
    }

    .top_info {
        align-items: center;
        width: 100%;
        padding: 16px 12px;
        color: #2f2f2f;
    }

    .profit-info {
        flex-direction: column;
        padding: 12px 12px 16px;

        .date-tab {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 100%;

            .date-select {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                height: 28px;

                .select-item {
                    display: inline-block;
                    box-sizing: border-box;
                    height: 28px;
                    margin-right: 8px;
                    padding: 0 13px;
                    color: #666;
                    font-weight: 400;
                    font-size: 13px;
                    line-height: 28px;
                    text-align: center;
                    background: #f9f9f9;
                    border-radius: 14px;

                    &.select {
                        // border: 0.5px solid rgba(255, 99, 7, 0.6);
                        box-sizing: border-box;
                        color: #2f2f2f;
                        font-weight: bold;
                        /* stylelint-disable-next-line number-max-precision */
                        background: rgba(255, 105, 7, 0.1);
                    }
                }
            }

            .custom {
                .custom-date {
                    width: 20px;
                    height: 20px;
                }
            }
        }

        .profit-detail {
            position: relative;
            display: flex;
            justify-content: center;
            padding-top: 24px;
            text-align: center;

            .total-assets {
                display: flex;
                justify-content: center;
                width: 100%;

                label {
                    display: flex;
                    align-items: center;
                    color: #666;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;

                    img {
                        width: 16px;
                        margin-left: 12px;

                        &.trigger {
                            width: 6px;
                            margin-left: 4px;
                        }
                    }

                    .profit-tips {
                        margin-right: 4px;
                        margin-left: 0;
                    }
                }

                .trigger-container {
                    position: relative;

                    /deep/ .van-popover {
                        top: 0 !important;
                        left: 0 !important;
                        transform: translate3d(calc(-50% - 36px), 15px, 0) !important;

                        .van-popover__arrow {
                            #arrow_color();
                        }

                        .van-popover__content {
                            background-color: unset;
                            box-shadow: 0 -1px 10px rgba(50, 50, 51, 0.15);
                        }
                    }
                }
            }
        }

        .profit-total-amount {
            .amount {
                margin: 16px 0 0;
                font-weight: 700;
                font-size: 30px !important;
                line-height: 40px;
                text-align: center;
                #font_h1();
            }
        }

        .profit-loss-detail {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: center;
            margin-top: 12px;
            padding: 0 15px;

            .divide {
                width: 1px;
                height: 32px;
                margin-top: 3px;
                background: @divider-white;
            }

            &-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 139px;
                text-align: center;

                label {
                    height: 16px;
                    color: #666;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                }

                .profit-amount {
                    height: 20px;
                    margin-top: 4px;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                }
            }
        }

        .profit-time {
            margin: 20px 0 0;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
            #font_h3();
        }

        .list {
            width: 94px;
            overflow: hidden;
            border-radius: 4px;

            .item {
                font-size: 14px;
                line-height: 36px;
                text-align: center;
                #font_h1();
                #dialog_background();
                #box_shadow_2();

                &.selected {
                    color: #ff6307;
                }
            }
        }
    }

    .calendar-info {
        display: flex;
        flex-direction: column;
        padding: 16px 0 24px;

        .title {
            margin-right: 12px;
            margin-left: 12px;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            #font_h1();
        }

        .date-picker {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 28px;
            margin-top: 9px;
            margin-right: 12px;
            margin-left: 12px;

            .left {
                display: flex;
                align-items: center;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;

                img {
                    width: 8px;
                    margin-left: 6px;
                }
            }

            .right {
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                width: 76px;
                height: 28px;
                background: #f8f8f8;
                border-radius: 14px;

                .tab {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 35px;
                    height: 24px;
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 11px;
                    line-height: 16px;
                    text-align: center;

                    &-active {
                        color: #2f2f2f;
                        font-weight: 400;
                        background-color: #fff;
                        border-radius: 12px;
                    }
                }
            }
        }

        .calendar-choose {
            margin-right: 6px;
            margin-left: 6px;
        }
    }
}
</style>
