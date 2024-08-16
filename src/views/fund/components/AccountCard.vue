// 基金首页
<template>
    <div class="account-card" :class="{ 'in-account-hold': inAccountHold, [assetType]: !!assetType }">
        <!-- 背景图 -->
        <div class="bg" v-if="isInAssetPage">
            <multi-img :name="bgName" directory="fund/assets"></multi-img>
        </div>
        <!-- 账户类型 -->
        <div class="account-type" v-if="!isInvestAdvisory">
            <label for="accountType" @click.stop="showAccountType = true">
                <multi-img :name="'account-type__' + accountType" directory="common" class="type"></multi-img>
                <span>{{ accountType | accountTypeFilter }}</span>
                <multi-img name="angle_trigger" directory="fund" class="arrow"></multi-img>
            </label>
            <account-choose v-model="showAccountType" @choose="onAccountTypeChange" :type="accountType"></account-choose>
        </div>
        <!-- 账户基本信息卡片 -->
        <div class="account" :class="{ 'in-asset-page': isInAssetPage, 'alter-investment': isAlterInvestment }">
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
                            <span>{{ $t('totalAssets') }}</span>
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
                            <span @click.stop="onAccountClick" style="flex: 1 1 auto">&nbsp;</span>
                        </label>
                    </template>
                </van-popover>
                <h3
                    class="amount elipsis"
                    id="amountAssets"
                    @click="onAccountClick"
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
            <div class="latest-profit" v-if="!isInAssetPage" @click="onAccountClick">
                <template v-if="showProfit">
                    <label for="">{{ $t('yesterdayProfit') }}{{ yesterdayProfitlossDate | latestProfitDateFilter }}</label>
                    <h3
                        class="profit-amount elipsis"
                        @click="onLatestProfitClick"
                        ref="yesterdayProfit"
                        v-riseFall="{
                            value: yesterdayProfitloss,
                            rate: false,
                            normal: false,
                            hide: !amountStatus,
                            hideObj: { text: '****', color: hideColorMap.color2 },
                        }"
                    ></h3>
                </template>
                <template v-else>
                    <label for="">{{ $t('accumulatedProfit') }}</label>
                    <h3
                        class="profit-amount elipsis"
                        ref="totalProfit"
                        v-riseFall="{
                            value: accumulatedProfitloss,
                            normal: false,
                            rate: false,
                            hide: !amountStatus,
                            hideObj: { text: '****', color: hideColorMap.color2 },
                        }"
                        id="totalProfit"
                    ></h3>
                </template>
            </div>
            <div class="latest-profit" v-if="isAlterInvestment">
                <label for="">{{ $t('accumulatedProfit') }}</label>
                <h3
                    class="profit-amount elipsis"
                    ref="totalProfit"
                    v-riseFall="{
                        value: accumulatedProfitloss,
                        normal: false,
                        rate: false,
                        hide: !amountStatus,
                        hideObj: { text: '****', color: hideColorMap.color2 },
                    }"
                    id="totalProfit"
                ></h3>
            </div>
        </div>
        <!-- 进行中资产展示区（未确认认购、赎回订单） -->
        <template v-if="showonLineAssets && inAccountHold">
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
        <ul class="prop-list" :class="{ 'asset-prop-list': assetType }" v-if="showProfit && inAccountHold">
            <li class="prop-list-item yesterday-profit">
                <p class="label">{{ $t('yesterdayProfit') }}{{ yesterdayProfitlossDate | latestProfitDateFilter }}</p>
                <p
                    class="value"
                    ref="yesterdayProfitBottom"
                    v-riseFall="{
                        value: yesterdayProfitloss,
                        rate: false,
                        normal: false,
                        hide: !amountStatus,
                        hideObj: { text: '****', color: hideColorMap.color2 },
                    }"
                ></p>
            </li>
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
        <!-- 理财订单 -->
        <div class="doing-order" v-if="showOrder && haveDoingOrder">
            <div class="divide"></div>
            <div class="content" @click="jumpOrderList">
                <div class="content-msg" v-html="doingOrderMsg"></div>
                <multi-img name="icon_arrow_left" directory="fund"></multi-img>
            </div>
        </div>
    </div>
</template>

<script>
import { Overlay } from 'vant'
import { getAssetsSummary, getOrderStatistics } from '@/apis/wealth/index.js'
import { FUND_ACCOUNT } from '@/entries/Fund.js'
import { floatToRatio, addOrUpdateQuery, dynamicFontSize } from '@/utils'
import AccountChoose from '@/components/AccountChoose'
import { WEALTH_ACCOUNT_MAP, WEALTH_AMOUNT_STATUS_kEY } from '@/config/common.js'
import dayjs from 'dayjs'
import { ASSET_TYPE_MAP } from '@/views/fund/config/common'
import { getThemeType } from '@/utils/env'

const USD = 'USD'
const HKD = 'HKD'
const CNH = 'CNH'

export default {
    name: 'account-card',
    props: {
        // 是否展示底部更多收益内容
        list: {
            type: Boolean,
            default: false,
        },
        canJump: {
            type: Boolean,
            default: true,
        },
        // 展示进行中订单
        showOrder: {
            type: Boolean,
            default: true,
        },
        showOnWayAssets: {
            type: Boolean,
            default: true,
        },
        // 是否是PI用户
        isProfessional: {
            type: Boolean,
            default: false,
        },
        // 是否处理持仓页
        inAccountHold: {
            type: Boolean,
            default: false,
        },
        // 是否加载中
        isLoading: {
            type: Boolean,
            default: false,
        },
        // 展示到期回款订单
        showRepayment: {
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
            cashBalance: 0,
            totalProfit: 0,
            currency: HKD,
            currencyList: [
                { value: HKD, text: this.$t('HKD') },
                { value: USD, text: this.$t('USD') },
                { value: CNH, text: this.$t('CNH') },
            ],
            currencySwitch: false,
            showAccountType: false,
            accountType: this.$route.query.accountType || 'ALL',
            queryCurrency: this.$route.query.currency || '', // 参数传入的币种
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
            initError: false,
            doingOrderMap: {},
        }
    },
    computed: {
        isAllAccount() {
            return this.accountType === 'ALL'
        },
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
        dongingNum() {
            const map = {
                all: 'all',
                publicFund: 'pubFund',
                privateFund: 'priFund',
                bond: 'bond',
                cashBox: 'ecash',
                alterInvestment: 'other',
            }
            const lng = this.doingOrderMap[this.accountType] ? this.doingOrderMap[this.accountType][map[this.assetType || 'all']] : 0
            return lng
        },
        // 订单进行中描述语
        doingOrderMsg() {
            const lng = this.dongingNum
            const text = this.amountStatus ? (lng >= 999 ? '999+' : lng) : '*'
            return lng > 0 ? this.$t('doingOrderMsg', { num: `<span class="msg-number">${text}</span>` }) : ''
        },
        // 是否有进行中订单
        haveDoingOrder() {
            return this.dongingNum > 0
        },
        repaymentNum() {
            const lng = this.doingOrderMap[this.accountType] ? this.doingOrderMap[this.accountType].ftdSettled : 0
            return lng
        },
        // 是否有到期回款的订单
        haveRepayment() {
            return this.repaymentNum > 0
        },
        // 订单回款描述语
        repaymentOrderMsg() {
            const lng = this.repaymentNum
            const text = this.amountStatus ? lng : '*'
            return lng > 0 ? this.$t('fixed.repaymentOrderText', { repaymentLength: text }) : ''
        },
        xcbRepaymentNum() {
            const lng = this.doingOrderMap[this.accountType]?.xjbSettled ?? 0
            return lng
        },
        // 是否有现金宝专户到期回款的订单
        haveXcbRepayment() {
            return this.xcbRepaymentNum > 0
        },
        // 现金宝专户订单回款描述语
        xcbRepaymentOrderMsg() {
            const lng = this.xcbRepaymentNum
            const text = this.amountStatus ? lng : '*'
            return lng > 0 ? this.$t('starSpecialAccountScope.repaymentOrderText', { repaymentLength: text }) : ''
        },

        // 资产类型
        assetType() {
            return this.$route.query.assetType
        },

        bgName() {
            return this.assetType || 'account_bg'
        },

        showProfit() {
            let res = true
            if (['alterInvestment'].includes(this.assetType)) {
                res = false
            }
            return res
        },
        buyAmountOnWay() {
            return this.assetDetailWithAccountAndCurrency?.buyAmountOnWay
        },
        sellAmountOnWay() {
            return this.assetDetailWithAccountAndCurrency?.sellAmountOnWay
        },
        // 是否展示在资产提示
        showonLineAssets() {
            return this.showOnWayAssets && (this.buyAmountOnWay || this.sellAmountOnWay)
        },

        assetDetailWithAccountAndCurrency() {
            const accountType = `${this.accountType.toLowerCase()}Account`
            const currency = this.currency.toLowerCase()
            return this.assetsSummary[accountType]?.[currency]
        },
        // 昨日收益日期
        yesterdayProfitlossDate() {
            return this.assetDetailWithAccountAndCurrency?.yesterdayProfitlossDate
        },
        // 昨日收益
        yesterdayProfitloss() {
            return this.assetDetailWithAccountAndCurrency?.yesterdayProfitloss || '--'
        },
        // 总持有收益
        totalHoldingsProfitloss() {
            return this.assetDetailWithAccountAndCurrency?.totalHoldingsProfitloss || '--'
        },
        // 总持有收益率
        totalHoldingsProfitlossRate() {
            return this.assetDetailWithAccountAndCurrency?.totalHoldingsProfitlossRate || ''
        },
        // 累计收益
        accumulatedProfitloss() {
            return this.assetDetailWithAccountAndCurrency?.accumulatedProfitloss || '--'
        },
        // 在途资产
        assetsOnWay() {
            return this.assetDetailWithAccountAndCurrency?.assetsOnWay || '--'
        },
        // 总资产
        totalAssets() {
            return this.assetDetailWithAccountAndCurrency?.totalAssets || '--'
        },
        // 是否在资产详情页（一级资产页|二级资产页）
        isInAssetPage() {
            return this.inAccountHold || !!this.assetType
        },
        isAlterInvestment() {
            return this.assetType === 'alterInvestment'
        },
        // 投顾
        isInvestAdvisory() {
            return this.assetType === 'invest-advisory'
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

        haveDoingOrder: {
            handler(v) {
                this.$emit('on-doing-orderNum-change', v)
            },
            immediate: true,
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
        this.getOrderStatistics()
    },
    async mounted() {
        if (this.$jsBridge && !this.inAccountHold) {
            // 首页需要监听币种切换
            this.$jsBridge.watchPageVisible(() => {
                this.getCurrencyByTradePage()
            })
        }
        this.initAssetsWatching()
        this.getAssetsSummary()
        await this.setAmountStatus()
        this.emitStatus(this.amountStatus)
    },
    methods: {
        // 初始化币种
        async initCurrency() {
            this.currency = this.queryCurrency || (this.isAllAccount ? 'HKD' : this.accountType)
            await this.getCurrencyByTradePage()
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
        async getAssetsSummary() {
            try {
                const params = {
                    toCurrency: this.currency,
                    assetsType: ASSET_TYPE_MAP.keysMap[this.assetType],
                    account: this.accountType,
                }
                const { result = {} } = await getAssetsSummary(params)
                const r = result || {}
                this.assetsSummary = r
            } catch (e) {
                console.error('error ===>', e)
                this.initError = true
            }
        },

        resetFontSize() {
            this.$nextTick(() => {
                // 具体资产下需要动态修改的字体大小
                const assetKeys = ['onlineAsset', 'onlineAssetRate', 'totalProfit']
                // 公共动态修改
                const commonKeys = ['amountAssets', 'yesterdayProfit', 'cashBalance', 'yesterdayProfitBottom', 'onlineAsset', 'totalProfit']
                // 动态设置金额的字体大小
                const keys = this.assetType ? [...assetKeys, ...commonKeys] : commonKeys
                if (this.showonLineAssets && this.inAccountHold) {
                    if (this.buyAmountOnWay) {
                        dynamicFontSize({ dom: 'buyOnWay', minFontSize: 9, context: this })
                    }
                    if (this.sellAmountOnWay) {
                        dynamicFontSize({ dom: 'sellOnWay', minFontSize: 9, context: this })
                    }
                }
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
            this.syncSetCurrency()
        },

        // 同步设置币种 全部账户tab下才同步设置
        syncSetCurrency() {
            this.$emit('on-currency-change', this.currency)
            // 全部账户tab下才同步设置
            this.isAllAccount && this.setTradePageCurrency(this.currency)
        },

        // 同步设置交易主页币种
        async setTradePageCurrency(currency = 'HKD') {
            try {
                if (this.$jsBridge) {
                    await this.setTradeSyncCurrency(currency)
                }
            } catch (e) {
                console.log('setTradePageCurrency===>error:', e)
            }
        },

        getCurrencyPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },

        onAccountClick() {
            if (!this.canJump) return
            if (!this.$root.getAccountStatus(FUND_ACCOUNT)) {
                return
            }
            const url = `${location.origin}${location.pathname}#/account-hold?accountType=${this.accountType}&currency=${this.currency}`

            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/account-hold',
                    query: {
                        accountType: this.accountType,
                        currency: this.currency,
                    },
                })
            }
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

        jumpOrderList() {
            this.$goPage('/order-list', {
                haveDoing: this.haveDoingOrder ? 1 : 0,
                accountType: this.accountType,
                productType: this.assetType === 'alterInvestment' ? 4 : ASSET_TYPE_MAP.keysMap[this.assetType] || '',
            })
        },
        // 根据账户同步币种
        async syncCurrencyByAccountType() {
            if (!this.isAllAccount) {
                // 非全部账户 不去同步交易主页币种
                this.currency = this.accountType
            } else {
                await this.getCurrencyByTradePage()
            }
            this.syncSetCurrency()
        },
        // 根据交易主页同步币种
        async getCurrencyByTradePage() {
            try {
                // 全部账户tab下 && app内部
                if (this.isAllAccount && this.$jsBridge) {
                    await this.getTradeSyncCurrency()
                }
            } catch (e) {
                console.log('getCurrencyByTradePage===>error:', e)
            }
        },

        // 同步获取币种
        async getTradeSyncCurrency() {
            // 获取 "totalCurrency": 总账户币种
            const key = 'totalCurrency'
            const result = (await this.$jsBridge.getAssetsCurrency()) || {}
            result[key] && (this.currency = result[key])
            console.log('getTradeSyncCurrency-result', result, this.currency)
        },

        // 同步设置币种
        async setTradeSyncCurrency(currency = 'HKD') {
            // 设置 "totalCurrency": 总账户币种
            const key = 'totalCurrency'
            const currencyInfo = (await this.$jsBridge.getAssetsCurrency()) || {}
            // 币种不一致才去存储
            currency !== currencyInfo[key] && this.$jsBridge.setSssetsCurrency({ ...currencyInfo, [key]: currency })
        },

        onAccountTypeChange(v) {
            this.accountType = v
            this.inAccountHold && addOrUpdateQuery('accountType', v)
            this.showAccountType = false
            this.syncCurrencyByAccountType()
            this.getOrderStatistics()
            this.$emit('on-account-change', { value: this.accountType })
        },

        onLatestProfitClick() {
            const isAccountHold = this.$route.name === 'accountHold'
            if (isAccountHold) {
                this.$goPage('/latest-profit', {
                    accountType: this.accountType,
                })
            }
        },

        async getOrderStatistics(reflash = false) {
            try {
                if (reflash) {
                    this.doingOrderMap = {}
                }
                if (this.doingOrderMap[this.accountType]) return
                const params = { account: this.accountType }
                const { result } = await getOrderStatistics(params)
                this.$set(this.doingOrderMap, this.accountType, result?.numOfOrdersInProceessing || {})
            } catch (e) {
                console.error('error ==> ', e)
            }
        },
    },
}
</script>

<style lang="less" scoped>
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
            z-index: 111;
            display: flex;
            padding: 8px 12px;
            background: linear-gradient(106deg, rgba(255, 141, 7, 0.09) 0%, rgba(255, 111, 7, 0.05) 100%);
            border-radius: 44px;

            &::after {
                position: absolute;
                top: 0;
                left: 50%;
                z-index: 111;
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
                    font-weight: 500;
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
            justify-content: flex-start;
            margin-bottom: 20px;
            margin-left: 12px;

            ul {
                &::after {
                    left: 15%;
                }
            }
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

    .latest-profit {
        width: 115px;
        text-align: right;

        & > label {
            font-size: 12px;
            line-height: 20px;
            text-align: right;
        }

        & > .profit-amount {
            margin-top: 8px;
            font-weight: 700;
            font-size: 20px;
            line-height: 44px;

            &.hide {
                #font_h1();

                font-size: 24px !important;
            }
        }

        ul {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: center;
            height: 44px;
            margin-top: 8px;

            & > li {
                font-size: 12px;
                line-height: 16px;
            }
        }
    }
}

.asset-prop-list {
    .prop-list-item {
        width: 107px !important;
    }
}

.prop-list {
    position: relative;
    display: flex;
    justify-content: space-between;
    margin: 20px 12px 16px;

    .prop-list-item {
        // width: calc(100% / 3);
        flex-shrink: 0;
        width: 104px;
        overflow: hidden;

        &:nth-of-type(2) {
            text-align: center;
        }

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

        // &.hold-profit {
        // }

        &.hold-profit-rate {
            text-align: center;
        }

        &.total-profit {
            text-align: right;

            &.hide {
                #font_h1();
            }
        }
    }
}

.doing-order {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 8px;

    .divide {
        height: 1px;
        margin: 0 12px;
        transform: scaleY(0.5);
        #divider_back_gound();
    }

    .content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px;

        .content-msg {
            #font_h1();

            font-size: 12px;
        }

        .next {
            font-size: 12px;
            line-height: 16px;
            #font_h1();
        }

        img {
            width: 12px;
        }
    }

    &:nth-last-of-type(1) {
        .content {
            padding-bottom: 2px;
        }
    }
}
</style>
<style lang="less">
.account-card {
    .msg-number {
        #font_theme();

        font-weight: 500;
    }
}
</style>
