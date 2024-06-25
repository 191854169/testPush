<template>
    <div class="account-card in-account-hold invest-advisory">
        <!-- 背景图 -->
        <div class="bg">
            <multi-img name="invest-advisory" directory="fund/assets"></multi-img>
        </div>
        <!-- 账户基本信息卡片 -->
        <div class="account in-asset-page">
            <div class="total-assets">
                <van-popover v-model="currencySwitch" trigger="click" :get-container="getCurrencyPopoverContainer" ref="currencyList">
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
                        <label for="">
                            <span>{{ $t('holdlingAmount') }}</span>
                            <span>({{ currency | currencyFilter(currencyList) }})</span>
                            <multi-img name="angle_trigger" directory="fund" class="trigger" :verifyTheme="verifyTheme" alt="select"></multi-img>
                            <div ref="trigger" class="trigger-container"></div>
                            <multi-img
                                @click.stop="switchAmountStatus"
                                :name="iconEye"
                                :verifyTheme="verifyTheme"
                                directory="fund"
                                alt="amount-switch"
                            ></multi-img>
                            <multi-img
                                v-if="isProfessional"
                                @click.stop="() => {}"
                                name="icon_PI"
                                directory="common"
                                :verifyTheme="verifyTheme"
                                alt="pi-flag"
                                class="pi-flag"
                            ></multi-img>
                            <span style="flex: 1 1 auto">&nbsp;</span>
                        </label>
                    </template>
                </van-popover>
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
                        hideObj: { text: '*****', color: hideColorMap.color1 },
                    }"
                ></h3>
            </div>
        </div>
        <!-- 进行中资产展示区（未确认认购、赎回订单） -->
        <template v-if="showonLineAssets">
            <div class="unshow-assets-tip">
                <ul>
                    <li v-if="!!buyAmountOnWay">
                        <span class="label">{{ $t('buyOnWay') }}</span>
                        <span
                            class="value"
                            ref="buyOnWay"
                            v-riseFall="{
                                value: buyAmountOnWay,
                                riseFall: false,
                                rate: false,
                                sign: false,
                                hide: !amountStatus,
                                hideObj: { text: '****', color: hideColorMap.color2 },
                            }"
                        ></span>
                    </li>
                    <li v-if="!!sellAmountOnWay">
                        <span class="label">{{ $t('sellOnWay') }}</span>
                        <span
                            class="value"
                            ref="sellOnWay"
                            v-riseFall="{
                                value: sellAmountOnWay,
                                riseFall: false,
                                rate: false,
                                sign: false,
                                hide: !amountStatus,
                                hideObj: { text: '****', color: hideColorMap.color2 },
                            }"
                        ></span>
                    </li>
                </ul>
            </div>
        </template>
        <!-- 持有收益属性展示区 -->
        <ul class="prop-list asset-prop-list">
            <li class="prop-list-item hold-profit">
                <p class="label">{{ $t('holdProfit') }}</p>
                <p
                    class="value"
                    ref="onlineAsset"
                    v-riseFall="{
                        value: totalHoldingsProfitloss,
                        normal: false,
                        rate: false,
                        hide: !amountStatus,
                        hideObj: { text: '****', color: hideColorMap.color2 },
                    }"
                ></p>
            </li>
            <li class="prop-list-item total-profit">
                <p class="label">{{ $t('accumulatedProfit') }}</p>
                <p
                    class="value"
                    ref="totalProfit"
                    v-riseFall="{
                        value: accumulatedProfitloss,
                        normal: false,
                        rate: false,
                        hide: !amountStatus,
                        hideObj: { text: '****', color: hideColorMap.color2 },
                    }"
                ></p>
            </li>
        </ul>
    </div>
</template>

<script>
import { Overlay } from 'vant'
import { FUND_ACCOUNT } from '@/entries/Fund.js'
import { floatToRatio, addOrUpdateQuery, getAppVersion, compareVersion, dynamicFontSize } from '@/utils'
import AccountChoose from '@/components/AccountChoose'
import { WEALTH_ACCOUNT_MAP, WEALTH_AMOUNT_STATUS_kEY } from '@/config/common.js'
import dayjs from 'dayjs'
import { getThemeType } from '@/utils/env'
// ftd
import { ORDER_STATUS_MAP } from '@/views/fixedDepositTreasure/config/common'
import pathnames from '@/config/H5Pathname'

const USD = 'USD'
const HKD = 'HKD'
const CNH = 'CNH'

export default {
    name: 'account-card',
    props: {
        totalAsset: {
            type: Object,
            default: () => {},
        },
        // 是否是PI用户
        isProfessional: {
            type: Boolean,
            default: false,
        },
        // 是否加载中
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        [Overlay.name]: Overlay,
        AccountChoose,
    },
    data() {
        return {
            amountStatus: true, // true - 展示资金内容 false - 隐藏资金内容
            amountStatusKey: WEALTH_AMOUNT_STATUS_kEY,

            totalProfit: 0,
            currency: HKD,
            currencyList: [
                { value: HKD, text: this.$t('HKD') },
                { value: USD, text: this.$t('USD') },
                { value: CNH, text: this.$t('CNH') },
            ],
            currencySwitch: false,
            queryCurrency: 'HKD', // 参数传入的币种
            assetsSummary: {
                allAccount: {
                    cnh: {},
                    hkd: {},
                    usd: {},
                },
                hkdAccount: {
                    cnh: {},
                    hkd: {},
                    usd: {},
                },
                usdAccount: {
                    cnh: {},
                    hkd: {},
                    usd: {},
                },
            },
        }
    },
    computed: {
        // TODO: 是否校验主题 (目前只有首页校验)
        verifyTheme() {
            return this.$route.path === '/'
        },
        hideColorMap() {
            const theme = getThemeType()
            const whiteThemeColorMap = {
                color1: '#2F2F2F',
                color2: '#666666',
            }
            const blackThemeColorMap = {
                color1: '#D8D8D8',
                color2: '#9C9C9C',
            }
            return !this.verifyTheme || theme === 'white' ? whiteThemeColorMap : blackThemeColorMap
        },
        iconEye() {
            return this.amountStatus ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
        customStyle() {
            return {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }
        },
        // 昨日收益日期
        yesterdayProfitlossDate() {
            return this.totalAsset.yesterdayProfitLossDate
        },
        // 昨日收益
        yesterdayProfitloss() {
            return this.totalAsset[`yesterdayProfitLoss${this.currency}`]
        },
        // 总持有收益
        totalHoldingsProfitloss() {
            return this.totalAsset[`profitLoss${this.currency}`]
        },
        // 累计收益
        accumulatedProfitloss() {
            return this.totalAsset[`accumulatedProfitLoss${this.currency}`]
        },
        // 总资产
        totalAssets() {
            return this.totalAsset[`Assets${this.currency}`]
        },
        buyAmountOnWay() {
            return this.totalAsset[`buyAmountOnWay${this.currency}`]
        },
        sellAmountOnWay() {
            return this.totalAsset[`sellAmountOnWay${this.currency}`]
        },
        // 是否展示在资产提示
        showonLineAssets() {
            return this.buyAmountOnWay || this.sellAmountOnWay
        },
    },
    watch: {
        amountStatus(v) {
            if (v) {
                this.resetFontSize()
            }
        },
        totalAssets(v) {
            if (!this.isLoading && v) {
                this.resetFontSize()
            }
        },
        isLoading(v) {
            if (!v) {
                this.resetFontSize()
            }
        },
        buyOnWay() {
            this.resetFontSize()
        },
        sellOnWay() {
            this.resetFontSize()
        },
    },
    filters: {
        amountFilter(v, amountStatus) {
            const placeholder = '*****'
            return amountStatus ? v : placeholder
        },
        currencyFilter(v, list) {
            return ((list || []).find(i => i.value === v) || {}).text
        },
        floatToRatioFilter(v, options = {}) {
            return floatToRatio(v, { rate: false, ...options })
        },
        latestProfitDateFilter(v) {
            return v ? `(${dayjs(v.replace(/-/g, '/')).format('MM/DD')})` : ''
        },
        accountTypeFilter(v) {
            return WEALTH_ACCOUNT_MAP.options.findLabel(v, '')
        },
    },
    created() {
        this.initCurrency()
    },
    async mounted() {
        this.initAssetsWatching()
        await this.setAmountStatus()
        this.emitStatus(this.amountStatus)
    },
    methods: {
        // 初始化币种
        async initCurrency() {
            this.currency = this.queryCurrency
            this.$emit('init-currency', this.currency)
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
        resetFontSize() {
            this.$nextTick(() => {
                if (this.showonLineAssets) {
                    if (this.buyAmountOnWay) {
                        dynamicFontSize({ dom: 'buyOnWay', minFontSize: 9, context: this })
                    }
                    if (this.sellAmountOnWay) {
                        dynamicFontSize({ dom: 'sellOnWay', minFontSize: 9, context: this })
                    }
                }
                // 公共动态修改
                const commonKeys = ['amountAssets', 'yesterdayProfit', 'yesterdayProfitBottom', 'onlineAsset', 'totalProfit']
                // 动态设置金额的字体大小
                const keys = commonKeys
                keys.forEach(dom => {
                    let minFontSize = 12
                    if (dom === 'amountAssets') {
                        minFontSize = 24
                    }
                    if (dom === 'yesterdayProfit') {
                        minFontSize = 16
                    }
                    dynamicFontSize({ dom, minFontSize, context: this })
                })
            })
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
        onCurrencyChoose(e) {
            this.currency = e.target.dataset.key
            this.$emit('on-currency-change', this.currency)
        },
        getCurrencyPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },
        emitStatus(status) {
            this.$emit('assetsStatus', status)
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
    },
}
</script>

<style lang="less" scoped>
// WARN: 改动该页面布局后, 要复查新手引导位置是否偏移
.trigger-container {
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
</style>

<style scoped lang="less">
[data-theme='black'] .account-type {
    background: linear-gradient(89.99deg, #242323 0.59%, #1f1f1e 101.42%);
    box-shadow: inset -0.5px 0.5px 0 #302f2f;
}

[data-theme='white'] .account-type {
    background: linear-gradient(89.98deg, #fff2eb 0.59%, #fff4ee 101.42%);
    box-shadow: inset -0.5px 0.5px 0 #ffe9dd;
}

.account-card {
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-radius: 8px;

    .account-type {
        position: relative;
        border-radius: 8px 8px 0 0;

        label {
            display: flex;
            align-items: center;
            padding: 10px 12px 19px;

            span {
                margin: 0 6px;
                font-weight: 500;
                font-size: 15px;
                line-height: 21px;
                #font_h1();
            }

            img {
                &.type {
                    width: 16px;
                }

                &.arrow {
                    width: 6px;
                }
            }
        }
    }

    .unshow-assets-tip {
        display: flex;
        justify-content: center;
        padding-top: 6px;

        ul {
            position: relative;
            z-index: 1;
            display: flex;
            padding: 8px 12px;
            background: linear-gradient(106deg, rgba(255, 141, 7, 0.09) 0%, rgba(255, 111, 7, 0.05) 100%);
            border-radius: 44px;

            &::after {
                position: absolute;
                top: 0;
                left: 50%;
                z-index: 1;
                width: 0;
                height: 0;
                border-right: 5px solid;
                border-right-color: transparent;
                border-bottom: 5px solid;
                border-bottom-color: #fff3e6;
                border-left: 5px solid;
                border-left-color: transparent;
                transform: translate(-50%, -100%);
                content: '';
            }

            li {
                #font_h2();

                display: flex;
                max-width: 144px;
                font-size: 12px;
                line-height: 16px;
                white-space: nowrap;

                span {
                    flex: 1 0 auto;
                }

                .value {
                    max-width: 72px;
                    overflow: hidden;
                    font-weight: bold;
                    text-overflow: ellipsis;
                }

                & + li {
                    margin-left: 16px;
                }
            }
        }
    }

    &.in-account-hold {
        position: relative;
        margin: 12px 12px 0;
        background: @white;
        // overflow: hidden;
        .bg {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 0;

            img {
                width: 100%;
                height: 100%;
            }
        }

        .account {
            position: relative;
            padding-top: 8px;
        }

        .account-type {
            background: none;
            box-shadow: none;

            label {
                padding: 16px 12px;
            }
        }

        /* stylelint-disable-next-line no-duplicate-selectors */
        .account {
            position: relative;
            margin-top: 0;
            padding: 0;
            background: transparent;

            .total-assets {
                text-align: center;
            }
        }
    }

    &.invest-advisory {
        padding-top: 20px;
    }

    &.invest-advisory,
    &.privateFund,
    &.publicFund,
    &.bond,
    &.alterInvestment {
        .bg {
            bottom: unset;
            left: unset;

            img {
                width: 102px;
                height: 103px;
            }
        }
    }

    &.alterInvestment {
        .account .total-assets {
            text-align: left;
        }

        .unshow-assets-tip {
            margin-bottom: 20px;
        }
    }
}

.account {
    #foreground();

    position: relative;
    display: flex;
    justify-content: space-between;
    margin-top: -8px;
    padding: 20px 12px 18px;
    border-radius: 8px;

    &.in-asset-page {
        justify-content: center;

        .total-assets {
            width: 100%;
        }

        .amount {
            font-size: 30px;
        }

        &.alter-investment {
            justify-content: space-between;
            padding-right: 12px;
            padding-left: 12px;

            .amount {
                text-align: left;
            }
        }
    }

    .amount {
        margin: 8px 0 0;
        font-weight: 700;
        font-size: 32px;
        line-height: 44px;
        #font_h1();
    }

    label {
        #font_h2();

        display: inline-block;
        font-size: 14px;
        line-height: 20px;
    }

    .total-assets {
        flex: 0 1 auto;
        width: 196px;
        text-align: left;

        & + .latest-profit {
            margin-left: 16px;
        }

        label {
            display: flex;
            align-items: center;

            & > span {
                flex: 1 0 auto;
            }

            img {
                width: 16px;
                margin-left: 16px;

                &.trigger {
                    width: 6px;
                    margin-left: 4px;
                }
            }

            .pi-flag {
                width: 20px;
                height: 20px;
                margin-left: 12px;
            }

            .trigger-container {
                position: relative;
            }
        }

        .amount.hide {
            font-size: 28px !important;
        }
    }
}

.prop-list {
    position: relative;
    display: flex;
    justify-content: space-between;
    margin: 20px 12px 16px;

    .prop-list-item {
        flex-shrink: 0;
        width: 162px;
        overflow: hidden;
        text-align: center;

        .label {
            font-size: 12px;
            line-height: 16px;
            #font_h3();
        }

        .value {
            width: 100%;
            margin-top: 4px;
            overflow: hidden;
            color: @fontGreyColor;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        &.total-profit {
            &.hide {
                #font_h1();
            }
        }
    }
}
</style>
