// 基金首页
<template>
    <div class="product-in-hold-card">
        <!-- 产品信息 -->
        <div class="product-base-info" @click="goProductDetail(info)">
            <div :class="`currency-${info.productCurrency}`"></div>
            <div class="name">{{ info.productName }}</div>
            <multi-img name="icon_right_arrow_16" directory="common"></multi-img>
        </div>
        <!-- 账户基本信息卡片 -->
        <div class="card shadow account">
            <div class="total-assets">
                <div class="assets-info">
                    <span>{{ $t('holdlingAmount') }}</span>
                    <span>({{ currency | currencyFilter(currencyList) }})</span>
                    <multi-img @click.stop="switchAmountStatus" :name="iconEye" directory="fund" alt="amount-switch"></multi-img>
                </div>
                <h3
                    class="amount"
                    ref="amountAssets"
                    v-hide="{ value: totalAssets, rate: false, hide: !amountStatus, hideObj: { text: '*****', color: '#2f2f2f' } }"
                ></h3>
            </div>
        </div>
        <template v-if="isAlterInvestment">
            <ul class="bond-info border-top-1px">
                <li v-for="item in profitColumns" :key="item.key" class="bond-info-item" :class="{ between: isMarketingBill }">
                    <p class="label">{{ item.label }}</p>
                    <!-- <p class="value">{{ item.value }}</p> -->
                    <dynamic-font class="value" :value="item.value" :options="{ maxFontSize: 12, minFontSize: 8 }"></dynamic-font>
                </li>
            </ul>
        </template>
        <template v-else>
            <ul class="profit-list" v-if="!!profitColumns.length">
                <li v-for="item in profitColumns" :key="item.key" class="profit-list-item">
                    <template>
                        <p v-if="item.key === 'yesterdayProfitloss'" class="label">{{ item.label }}{{ latestProfitDate | latestProfitDateFilter }}</p>
                        <p v-else class="label">{{ item.label }}</p>
                    </template>

                    <p
                        class="value"
                        ref="onlineAsset"
                        v-if="item.riseFall"
                        v-riseFall="{ value: item.value, rate: false, thousand: true, normal: false, hide: !amountStatus, ...item.options }"
                    ></p>
                    <p class="value" ref="onlineAsset" v-else v-hide="{ value: item.value, thousand: true, hide: !amountStatus }"></p>
                </li>
            </ul>
            <div class="more-profit-info">
                <div class="trigger" :class="{ 'trigger-open': !isHideMoreProfitInfo }" @click="onTrigger">
                    <multi-img name="down-16" directory="common" :class="{ rotate: !isHideMoreProfitInfo }"></multi-img>
                </div>
                <div class="profit-info-columns-container" :class="{ hide: isHideMoreProfitInfo }">
                    <ul class="profit-info-columns">
                        <div class="container-arrow" :class="{ 'container-arrow__show': !isHideMoreProfitInfo }"></div>
                        <li class="column" v-for="item in moreProfitInfoConfig" :key="item.key">
                            <span class="label">{{ item.label }}</span>
                            <span
                                class="value"
                                :ref="item.key"
                                v-if="item.config?.riseFall"
                                v-riseFall="{ value: item.value, hide: !amountStatus, ...(item.config || {}) }"
                            ></span>
                            <span class="value" :ref="item.key" v-else v-hide="{ value: item.value, thousand: true, hide: !amountStatus }"></span>
                        </li>
                    </ul>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { isInOutsideH5 } from '@/utils'
import { dynamicFontSize } from '@/utils/utils.js'
import { Overlay } from 'vant'
import { orderList } from '@/apis/wealth/index.js'
import { floatToRatio, milliFormat, keepDecimals } from '@/utils'
import { ORDER_STATUS_MAP, PRODUCT_TYPE_MAP } from '../config/common'
import { WEALTH_ACCOUNT_MAP, WEALTH_AMOUNT_STATUS_kEY } from '@/config/common.js'
import dayjs from 'dayjs'
import DynamicFont from '@/components/FosunDynamicFont.vue'

const USD = 'USD'
const HKD = 'HKD'
const CNH = 'CNH'
const EUR = 'EUR'

const priceFilter = (v, options = {}) => {
    const { base } = { base: 2, ...options }
    return floatToRatio(v, { base, sign: false, rate: false })
}
export default {
    name: 'product-in-hold-card',
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
        // 是否是PI用户
        isProfessional: {
            type: Boolean,
            default: false,
        },
        // 是否需要展示最新收益
        needLatestProfit: {
            type: Boolean,
            default: true,
        },
        info: {
            type: Object,
            default: () => ({}),
        },
        currency: {
            type: String,
            required: true,
            default: HKD,
        },
    },
    components: {
        [Overlay.name]: Overlay,
        DynamicFont,
    },
    data() {
        return {
            amountStatus: true, // true - 展示资金内容 false - 隐藏资金内容
            amountStatusKey: WEALTH_AMOUNT_STATUS_kEY,
            cashBalance: 0,
            onlineAssets: 0,
            totalProfit: 0,
            currencyList: [
                { value: HKD, text: this.$t('HKD') },
                { value: USD, text: this.$t('USD') },
                { value: CNH, text: this.$t('CNH') },
            ],
            doingOrderList: [],
            showAccountType: false,
            accountType: 'ALL',
            isHideMoreProfitInfo: true, // 是否默认隐藏更多信息
        }
    },
    computed: {
        // 睿银资产显示与隐藏状态
        ...mapState('user', ['showAsset']),

        iconEye() {
            return this.amountStatus ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
        isFCN() {
            return this.info.noteProperty === 3
        },
        isMarketingBill() {
            return this.info.noteProperty === 4
        },
        customStyle() {
            return {
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }
        },

        // 资产类型
        assetType() {
            return this.$route.query.assetType
        },

        fundMoreProfitInfoConfig() {
            const isPublic = this.assetType === 'publicFund'
            const { navDate } = this.info || {}
            const date = navDate ? `(${dayjs(navDate).format('MM/DD')})` : ''
            const res = [
                { key: 'unrealizedPL', label: this.$t('unrealizIncome'), config: { riseFall: true, rate: false, thousand: true } }, // 未实现收益
                { key: 'accumulatedProfitloss', label: this.$t('accumulatedProfit'), config: { riseFall: true, rate: false, thousand: true } }, // 累计收益
                { key: 'realizedPL', label: this.$t('realizedIncome'), config: { riseFall: true, rate: false, thousand: true } }, // 已实现收益
                { key: 'averagePrice', label: this.$t('averageBuyPrice'), format: v => (v ? priceFilter(v, { base: 4 }) : '--') }, // 持有成本价
                {
                    key: 'quantity',
                    label: this.$t('holdQuantity'),
                    format: v => (v ? `${milliFormat(isPublic ? v : keepDecimals(v, 4))}${this.$t('trade.part')}` : '--'),
                }, // 持有份额
                { key: 'nav', label: this.$t('latestNav', { date }), format: v => (v ? priceFilter(v, { base: 4 }) : '--') }, // 最新净值
            ]
            res.forEach(i => {
                let value = this.info?.[i.key] || ''
                if (i.format) {
                    value = i.format(value)
                }
                i.value = value || '--'
            })
            return res
        },

        bondMoreProfitInfoConfig() {
            const { navDate } = this.info || {}
            const date = navDate ? `(${dayjs(navDate).format('MM/DD')})` : ''
            const res = [
                { key: 'unrealizedPL', label: this.$t('unrealizIncome'), config: { riseFall: true, rate: false, thousand: true } }, // 未实现收益
                { key: 'accumulatedInterestGain', label: this.$t('interestIncome'), config: { riseFall: true, rate: false, thousand: true } }, // 利息收入
                { key: 'realizedPL', label: this.$t('realizedIncome'), config: { riseFall: true, rate: false, thousand: true } }, // 已实现收益
                { key: 'accumulatedProfitloss', label: this.$t('accumulatedProfit'), config: { riseFall: true, rate: false, thousand: true } }, // 累计收益
                { key: 'accruedInterest', label: this.$t('realizedGain'), format: v => (v ? priceFilter(v, { base: 2 }) : '--') },
                { key: 'averagePrice', label: this.$t('averageBuyPrice'), format: v => (v ? priceFilter(v, { base: 3 }) : '--') },
                { key: 'quantity', label: this.$t('parFaceCash'), format: v => (v ? `${milliFormat(v)}` : '--') },
                { key: 'nav', label: this.$t(`latestClosePrice`, { date }), format: v => (v ? priceFilter(v, { base: 3 }) : '--') },
            ]
            res.forEach(i => {
                let value = this.info?.[i.key] || ''
                if (i.format) {
                    value = i.format(value)
                }
                i.value = value || '--'
            })
            return res
        },

        moreProfitInfoConfig() {
            if (this.assetType === 'bond') return this.bondMoreProfitInfoConfig
            return this.fundMoreProfitInfoConfig
        },

        fundProfitColumns() {
            const res = [
                {
                    key: 'yesterdayProfitloss',
                    label: this.$t('yesterdayProfit'), // 昨日收益
                    riseFall: true,
                },
                {
                    key: 'profitloss',
                    label: this.$t('holdProfit'), // 持有收益
                    riseFall: true,
                },
                {
                    key: 'profitlossRate',
                    label: this.$t('holdProfitRate'), // 持有收益率
                    options: { rate: true },
                    riseFall: true,
                },
                // {
                //     key: 'accumulatedProfitloss',
                //     label: this.$t('accumulatedProfit'), // 累计收益
                //     riseFall: true,
                // },
            ]
            res.forEach(i => {
                let value = this.info?.[i.key] || ''
                if (i.format) {
                    value = i.format(value)
                }
                !i.options && (i.options = {})
                i.value = value || '--'
            })
            return res
        },
        bondProfitColumns() {
            const res = [
                // {
                //     key: 'accumulatedProfitloss',
                //     label: this.$t('accumulatedProfit'), // 累计收益
                //     riseFall: true,
                // },
                // {
                //     key: 'accumulatedInterestGain',
                //     label: this.$t('interestIncome'), // 利息收入
                //     riseFall: true,
                // },
                // {
                //     key: 'accumulatedPriceGain',
                //     label: this.$t('priceGainIncome'), // 价差收入
                //     riseFall: true,
                // },
                {
                    key: 'yesterdayProfitloss',
                    label: this.$t('yesterdayProfit'), // 最新收益
                    riseFall: true,
                },
                {
                    key: 'profitloss',
                    label: this.$t('holdProfit'), // 持有收益
                    riseFall: true,
                },
                {
                    key: 'profitlossRate',
                    label: this.$t('holdProfitRate'), // 持有收益率
                    options: { rate: true },
                    riseFall: true,
                },
            ]
            res.forEach(i => {
                let value = this.info?.[i.key] || ''
                if (i.format) {
                    value = i.format(value)
                }
                !i.options && (i.options = {})
                i.value = value || '--'
            })
            return res
        },

        alterIntestmentProfitColumns() {
            const res = []

            if (this.isFCN) {
                res.push({
                    key: 'periodMonth',
                    label: this.$t('bills.duration'), // 期限
                    format: v => (v ? `${v}个月` : '--'),
                })
            } else {
                res.push({
                    key: 'productMaturityDate',
                    label: this.$t('bills.remainingTerm'), // 到期日期
                    format: v => (v ? dayjs(v).format('YYYY/MM/DD') : '--'),
                })
            }
            if (!this.isMarketingBill) {
                res.push({
                    key: 'productYieldInYear',
                    label: this.isFCN || this.marketingBill ? this.$t('fcn.annualizedCoupon') : this.$t('bills.annualizedYTM'), // 年化利率 .FCN展示「年化票息」并取产品库「年化票息」字段
                    format: (v, item) => {
                        const maxYield = item.productMaxYieldInYear
                        if (!maxYield) {
                            return floatToRatio(v, { pow: 2 })
                        }
                        return maxYield ? `${floatToRatio(v, { pow: 2 })}~${floatToRatio(maxYield, { pow: 2 })}` : floatToRatio(v, { pow: 2 })
                    },
                })
            }

            res.forEach(i => {
                let value = this.info?.[i.key] || ''
                if (i.format) {
                    value = i.format(value, this.info)
                }
                !i.options && (i.options = {})
                i.value = value || '--'
            })
            return res
        },

        profitColumns() {
            if (this.assetType === 'bond') return this.bondProfitColumns
            if (this.assetType === 'alterInvestment') return this.alterIntestmentProfitColumns
            return this.fundProfitColumns
        },

        isAlterInvestment() {
            return this.assetType === 'alterInvestment'
        },

        symbol() {
            return this.$route.query.symbol
        },
        // 总资产
        totalAssets() {
            return this.info?.assets
        },
        // 持有收益
        profit() {
            return this.info?.profitloss
        },
        // 最新收益日期
        latestProfitDate() {
            const date = this.info?.yesterdayProfitlossDate || ''
            return date ? `${dayjs(date.replace(/-/g, '/')).format('MM/DD')}` : ''
        },
        // 昨日收益
        yesterdayProfitloss() {
            return this.info?.yesterdayProfitloss || '--'
        },
    },
    watch: {
        info: {
            handler() {
                this.resetFontSize()
            },
            deep: true,
        },
        amountStatus(v) {
            if (v) {
                this.resetFontSize()
            }
        },
        currency: {
            handler(v) {
                this.$emit('on-change-currency', v)
            },
        },
    },
    filters: {
        currencyFilter(v, list) {
            return ((list || []).find(i => i.value === v) || {}).text
        },
        floatToRatioFilter(v, options = {}) {
            return floatToRatio(v, { rate: false, ...options })
        },
        latestProfitDateFilter(v) {
            return v ? `(${v})` : ''
        },
        accountTypeFilter(v) {
            return WEALTH_ACCOUNT_MAP.options.findLabel(v, '')
        },
    },
    created() {
        let expandCurrency = null
        switch (this.$route.query.currency) {
            case 'EUR':
                expandCurrency = { value: EUR, text: this.$t('EUR') }
                break
            default:
                break
        }
        if (expandCurrency) {
            this.currencyList.push(expandCurrency)
        }
        this.getDoingOrder()
    },
    mounted() {
        this.initAssetsWatching()
        this.setAssetStatus()
            .then(() => {
                this.emitStatus(this.amountStatus)
            })
            .then(() => {
                this.resetFontSize()
            })
    },
    methods: {
        async setAssetStatus() {
            if (this.$jsBridge) {
                const data = await this.$jsBridge.getAssetsShowStatus()
                this.amountStatus = data
            } else if (isInOutsideH5()) {
                // 睿银项目中，票据详情与资产首页显示与隐藏状态保持一致
                this.amountStatus = this.showAsset
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
                // 动态设置金额的字体大小
                const keys = [
                    { key: 'amountAssets', size: 12 },
                    { key: 'yesterdayProfit', size: 12 },
                    { key: 'onlineAsset', size: 12 },
                ]
                keys.push(...this.moreProfitInfoConfig.map(i => ({ key: i.key, size: 10 })))
                const dynamicFn = (dom, size = 12) => {
                    dynamicFontSize({ dom, context: this, minFontSize: size })
                }
                keys.forEach(({ key, size = 12 }) => {
                    const dom = this.$refs[key]
                    if (!dom) return
                    if (Array.isArray(dom) && dom.length > 0) {
                        dom.forEach(el => {
                            dynamicFn(el, size)
                        })
                        return
                    }
                    dynamicFn(dom, size)
                })
            })
        },
        switchAmountStatus() {
            this.amountStatus = !this.amountStatus
            this.emitStatus(this.amountStatus)
            if (this.$jsBridge) {
                this.$jsBridge.setAssetsShowStatus({ showAssets: this.amountStatus })
            } else if (isInOutsideH5()) {
                // 睿银项目中，更改显示与隐藏状态
                this.$store.commit('user/updateShowAsset', this.amountStatus)
            } else {
                localStorage.setItem(this.amountStatusKey, JSON.stringify(this.amountStatus))
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
                    this.getDoingOrder()
                }
                this.$jsBridge?.watchPageVisible(onVisible)
            }
        },

        async getDoingOrder() {
            try {
                const res = await orderList({
                    start: 0,
                    count: 999,
                    orderStatus: ORDER_STATUS_MAP.DOING_STATUS_LIST, // “进行中”订单的状态包含 U,O,D,P
                })
                this.doingOrderList = res?.result?.list || []
            } catch (e) {
                console.log('getDoingOrder===>e:', e)
            }
        },

        onAccountTypeChange(v) {
            this.accountType = v
            this.showAccountType = false
        },

        onTrigger() {
            this.isHideMoreProfitInfo = !this.isHideMoreProfitInfo
        },

        goProductDetail(data = {}) {
            // 不同详情页跳转
            const { keysMap } = PRODUCT_TYPE_MAP
            // 私募、公募
            if (data.productType === keysMap.PUBLIC) {
                this.goFundDetail(data, 'public')
                return
            }
            if (data.productType === keysMap.PRIVATE) {
                this.goFundDetail(data, 'private')
                return
            }
            // 债券
            if (data.productType === keysMap.BOND) {
                this.goBondDetail(data)
                return
            }
            // 票据
            if (data.productType === keysMap.BILL) {
                this.goBillDetail(data)
                return
            }
        },

        goFundDetail(data, type) {
            this.$goPage('/detail', {
                type,
                symbol: data.symbol,
            })
        },

        goBondDetail(data) {
            this.$goPage('/bond-detail', {
                symbol: data.symbol,
            })
        },

        goBillDetail(data) {
            this.$goPage('/bills/detail', {
                symbol: encodeURIComponent(data?.symbol),
            })
        },
    },
}
</script>

<style scoped lang="less">
@black: #1f1f1f;
@white: #fff;

.product-in-hold-card {
    padding-bottom: 0;
    overflow: hidden;
    background: @white;
    border-radius: 8px;

    .product-base-info {
        position: relative;
        display: flex;
        align-items: center;
        height: 42px;
        padding: 0 12px;

        &::after {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            height: 1px;
            background: #efefef;
            transform: scaleY(0.5);
            content: '';
        }

        .name {
            flex: 1 1 auto;
            margin-left: 5px;
            overflow: hidden;
            color: @fontBlackColor;
            font-weight: 700;
            font-size: 14px;
            line-height: 20px;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        img {
            width: 16px;
        }
    }

    .account-type {
        background: linear-gradient(89.98deg, #fff2eb 0.59%, #fff4ee 101.42%);
        border-radius: 8px 8px 0 0;
        box-shadow: inset -0.5px 0.5px 0 #ffe9dd;

        label {
            display: flex;
            align-items: center;
            padding: 10px 12px 19px;

            span {
                margin: 0 6px;
                color: @fontBlackColor;
                font-weight: 500;
                font-size: 15px;
                line-height: 21px;
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
        margin-top: 10px;
        padding: 0 12px;

        ul {
            position: relative;
            display: flex;
            padding: 8px 10px 8px 20px;
            background: #f9f9f9;
            border-radius: 4px;

            &::before {
                position: absolute;
                top: 50%;
                left: 10px;
                width: 4px;
                height: 4px;
                background: @theme;
                border-radius: 50%;
                transform: translateY(-50%);
                opacity: 0.5;
                content: '';
            }

            li {
                color: @fontLightColor;
                font-size: 12px;
                line-height: 22px;
            }

            li:first-of-type {
                margin-right: 24px;
            }
        }
    }
}

.account {
    padding: 20px 0 12px;
    background: @white;
    border-radius: 8px 8px 0 0;

    .amount {
        width: 100%;
        margin: 8px 0 0;
        overflow: hidden;
        color: @fontBlackColor;
        font-weight: 700;
        font-size: 32px;
        line-height: 43px;
        text-overflow: ellipsis;
    }

    label {
        display: inline-block;
        color: @fontLightColor;
        font-size: 14px;
        line-height: 20px;
    }

    .total-assets {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .assets-info {
            display: flex;
            align-items: center;
            color: @fontLightColor;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            img {
                width: 16px;
                margin-left: 16px;
            }
        }

        .amount.hide {
            font-size: 28px !important;
        }
    }

    .latest-profit {
        flex: 1 1 auto;
        min-width: 111px;
        text-align: right;

        & > label {
            font-size: 12px;
            line-height: 20px;
            text-align: right;
        }

        & > .profit-amount {
            margin-top: 8px;
            color: @theme;
            font-weight: 700;
            font-size: 16px;
            line-height: 44px;

            &.hide {
                color: #1f1f1f !important;
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

            .rate {
                margin-top: 2px;
            }
        }
    }
}

.profit-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding: 0 12px;

    &-item {
        flex-shrink: 0;
        overflow: hidden;

        .label {
            color: @fontGreyColor;
            font-size: 12px;
            line-height: 16px;
        }

        .value {
            margin-top: 2px;
            overflow: hidden;
            color: @fontGreyColor;
            font-weight: 700;
            font-size: 14px;
            line-height: 20px;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        &:nth-of-type(1) {
            // flex: 1 0 116px;
            width: 109px;
        }

        &:nth-of-type(2) {
            flex: 1;
            margin-left: 16px;
            text-align: center;
        }

        &:nth-of-type(3) {
            width: 109px;
            margin-left: 16px;
            text-align: right;
        }
    }
}

.bond-info {
    position: relative;
    display: flex;
    justify-content: space-between;
    width: calc(100vw - 48px);
    margin: 16px 12px 0;
    padding: 16px 0;

    &-item {
        display: flex;
        align-items: center;
        width: calc((100vw - 48px - 12px) / 2);

        .label {
            flex-shrink: 0;
            color: @fontGreyColor;
            font-size: 12px;
            line-height: 16px;
        }

        .value {
            width: calc((100vw - 48px - 12px) / 2 - 50px);
            margin-left: 8px;
            color: @fontBlackColor;
            font-weight: 500;
        }
        // &:nth-of-type(2) {
        //     margin-left: 20px;
        // }
    }

    .between {
        display: flex;
        justify-content: space-between;
        width: 100%;

        .value {
            text-align: right;
        }
    }
}

.more-profit-info {
    display: flex;
    flex-direction: column;
    padding: 0 0 8px;
    font-size: 0;
    text-align: center;

    .trigger {
        z-index: 10;
        padding: 8px 0 0;
        transition: all ease-in 0.5s;

        img {
            width: 16px;
            height: 16px;

            &.rotate {
                transform: rotate(180deg);
            }
        }

        &.trigger-open {
            padding-bottom: 0;
        }
    }

    .profit-info-columns-container {
        max-height: 130px;
        transition: all ease-in 0.5s;

        &.hide {
            max-height: 0;
            overflow: hidden;
        }

        .profit-info-columns {
            position: relative;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin: 4px 12px 0;
            padding: 9px 10px;
            text-align: left;
            background: #f9f9f9;
            border-radius: 4px;

            .column {
                display: flex;
                justify-content: space-between;
                width: calc((100% - 24px) / 2);
                color: @fontBlackColor;
                font-size: 12px;
                line-height: 16px;

                & .label {
                    color: @fontGreyColor;
                }

                .value {
                    max-width: 81px;
                    overflow: hidden;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }

            .column:nth-of-type(n + 3) {
                margin-top: 8px;
            }
        }

        .container-arrow {
            position: absolute;
            top: 0;
            left: calc(50% - 7px);
            z-index: 1;
            width: 0;
            height: 0;
            border: 7px solid #f9f9f9;
            border-top-color: transparent;
            border-right-color: transparent;
            border-left-color: transparent;
            transition: all ease-in 0.2s;

            &__show {
                top: -13px;
            }
        }
    }
}
</style>
<style lang="less">
.product-in-hold-card {
    .msg-number {
        color: @theme;
    }
}
</style>
