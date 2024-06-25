<template>
    <div class="product-detail-in-hold">
        <!-- 基金基本信息卡片 -->
        <product-in-hold-card
            ref="accountCard"
            class="outter-product-card"
            list
            :info="info"
            :canJump="false"
            @assetsStatus="onAssetsStatus"
            @on-change-currency="changeCurrencyHandler"
            :isProfessional="isProfessional"
            :needLatestProfit="needLatestProfit"
            :currency="info && info.productCurrency"
        ></product-in-hold-card>
        <!-- 收益明细 -->
        <div class="profit-detail" v-if="isAlterInvestment && holdingsComposition.length > 0">
            <div class="header">
                <h2 class="title">{{ $t('holdingDetail') }}</h2>
            </div>
            <ul class="list">
                <li class="header" :class="{ between: hiddenProfit }">
                    <span>{{ $t('trade.querenjine') }}</span>
                    <span>{{ $t('trade.confirmDate') }}</span>
                    <span v-if="!hiddenProfit">{{ $t('expireProfit') }}</span>
                </li>
                <div class="content">
                    <li v-for="(i, index) in holdingsComposition" :key="index" :class="{ between: hiddenProfit }">
                        <span v-riseFall="{ value: i.filledAmount, riseFall: false, rate: false, sign: false }"></span>
                        <span>{{ i.confirmDate | confirmDateFilter }}</span>
                        <span v-riseFall="{ value: i.estimateMaturityGain, rate: false }" v-if="!hiddenProfit">{{ i }}</span>
                    </li>
                </div>
                <li class="total border-top-1px" v-if="!hiddenProfit">
                    <span class="label">{{ $t('expireProfitSummary') }}</span>
                    <span class="value" v-riseFall="{ value: info.estimateMaturityGain, rate: false }"></span>
                </li>
            </ul>
        </div>

        <!-- 只有票据展示观察事项、订单记录 -->
        <div v-if="hasTab">
            <!-- 观察事项、订单记录 tab -->
            <div class="tab">
                <span :class="{ 'henader-checker': activeHeader === 1 }" @click="activeHeader = 1">{{ $t('observations') }}</span>
                <span :class="{ 'henader-checker': activeHeader === 2 }" @click="activeHeader = 2">{{ $t('orderRecord') }}</span>
            </div>
            <!-- 观察事项 -->
            <div v-if="activeHeader === 1">
                <section class="observations">
                    <div>
                        <observations-card class="content" :eventDate="eventDate"></observations-card>
                    </div>
                </section>
            </div>
        </div>

        <!-- 订单记录 -->
        <div class="holding" :class="{ 'holding-tip': tip }" v-if="!hasTab || (hasTab && activeHeader === 2)">
            <div class="header" v-if="!hasTab">
                <h2 class="title">{{ $t('orderRecord') }}</h2>
            </div>
            <div class="holding-content">
                <ul class="order-list" @click="goOrderDetail">
                    <Empty v-if="finished && !orderList.length" showImg></Empty>
                    <van-list :loading="loading" @load="onLoad" :finished="finished">
                        <li class="order-list-item mask" v-for="item in orderList" :key="item.id" :data-id="item.orderNumber">
                            <div class="top">
                                <span class="direction">{{ item.orderDirection | orderDirectionFilter }}</span>
                                <!-- 公募 私募卖出显示份额 -->
                                <span class="amount" v-if="(isPublic || isPrivate) && item.orderDirection === ORDER_DIRECTION_MAP.keysMap.REDEEM">
                                    <span>{{ item | quantityFilter | hideFilter(assetsStatus) }}</span>
                                    <span v-show="assetsStatus">{{ $t('trade.part') }}</span>
                                </span>
                                <span class="amount" v-else>
                                    <span>{{ item | checkGrossAmount | thousandsFilter | hideFilter(assetsStatus) }}</span>
                                    <span v-show="assetsStatus">{{ item.currency | currencyFilter }}</span>
                                </span>
                            </div>
                            <div class="bottom">
                                <span class="date">{{ item.submitTime | submitTimeFilter }}</span>
                                <span class="status">{{ item.orderStatus | orderStatusFilter }}</span>
                            </div>
                        </li>
                    </van-list>
                </ul>
            </div>
        </div>

        <ProfitDesc :class="{ 'holding-tip': tip }" v-if="!isAlterInvestment"></ProfitDesc>

        <footer class="footer">
            <p class="tip" :class="{ 'tip-warn': isAlterInvestment }" v-if="tip">{{ tip }}</p>
            <div class="btns" @click="onBtnClick">
                <button class="buy" data-type="buy" :disabled="!disabled.buy" v-if="!hiddSell">{{ $t('addToBuy') }}</button>
                <button class="sell" data-type="sell" :disabled="!disabled.sell" v-if="!hiddSell">{{ $t('redeem') }}</button>
                <button class="onlyBuy" data-type="buy" :disabled="!billDisabledBuy" v-if="hiddSell">{{ $t('addToBuy') }}</button>
                <button class="service mask" data-type="service">
                    <multi-img name="icon_service" directory="common"></multi-img>
                    <span>{{ $t('kefu') }}</span>
                </button>
            </div>
        </footer>
    </div>
</template>

<script>
import Empty from '@/components/Empty.vue'
import { Overlay, List, Field } from 'vant'
import { orderList, getHoldingsDetail } from '@/apis/wealth/index.js'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { compareVersion, getAppVersion } from '../../utils/tools.js'
import { floatToRatio, keepDecimals, milliFormat, isEmpty } from '@/utils'
import { getRunEnv } from '../../utils/env.js'
import { FUND_MODE_MAP } from '@/views/fund/config/common'
import { getPiApplyDetail } from '@/apis/client.js'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import ProductInHoldCard from './components/ProductInHoldCard.vue'
import ObservationsCard from './components/ObservationsCard.vue'
import { getEventDate } from '@/apis/fund/note.js'
import { CURRENCY_MAP, ORDER_DIRECTION_MAP, ORDER_STATUS_MAP, PRODUCT_TYPE_MAP } from './config/common'
import dayjs from 'dayjs'
import Table from '@/components/Table.vue'
import ProfitDesc from './components/ProfitDesc.vue'
import { getBasicInfo } from '@/apis/fund/fund.js'
import { isNull, isUndefined } from '@/utils'

const productKeyMap = PRODUCT_TYPE_MAP.keysMap
const fundModeKeysMap = FUND_MODE_MAP.keysMap

export default {
    name: 'product-detail-in-hold',
    components: {
        [Overlay.name]: Overlay,
        ProductInHoldCard,
        ObservationsCard,
        [List.name]: List,
        [Empty.name]: Empty,
        Table,
        ProfitDesc,
    },
    mixins: [riskAssessmentMixin, checkPIMixin],
    data() {
        return {
            activeHeader: 1,
            ORDER_DIRECTION_MAP,
            currency: this.$route.query.currency,
            modeTypeMap: {
                [fundModeKeysMap.PUBLIC]: 'public',
                [fundModeKeysMap.PRIVATE]: 'private',
                [fundModeKeysMap.BOND]: 'bond',
                [fundModeKeysMap.BILL]: 'bill',
            },
            assetsStatus: true,
            isPersonalAccount: true, // 是否是个人账户
            orderList: [],
            loading: false,
            finished: false,
            pageSize: 10,
            currentPage: 1,
            info: {},
            eventDate: {},
            basicInfo: {},
            parentInfo: {},
        }
    },
    computed: {
        // 票据持有明细
        holdingsComposition() {
            return this.info?.holdingsComposition || []
        },

        assetType() {
            return this.$route.query.assetType
        },
        // 另类
        isAlterInvestment() {
            return this.assetType === 'alterInvestment'
        },
        // 债券
        isBond() {
            return this.assetType === 'bond'
        },
        // 公募
        isPublic() {
            return this.assetType === 'publicFund'
        },
        // 私募
        isPrivate() {
            return this.assetType === 'privateFund'
        },
        // 是否有观察事项tab
        hasTab() {
            return this.isAlterInvestment && this.info.noteProperty === 3
        },
        isFCN() {
            return this.info.noteProperty === 3
        },
        isMarketingBill() {
            return this.info.noteProperty === 4
        },
        hiddenProfit() {
            return this.isFCN || this.isMarketingBill
        },
        disabled() {
            const { buyable, sellable, active } = this.info || {}
            const buy = active && !!buyable
            const sell = !!sellable && Number(this.info?.assets) // 有持仓 && seallable 可以卖出
            return {
                buy,
                sell,
            }
        },
        billDisabledBuy() {
            //票据有母产品时，是否下架or不可交易要用母产品的active来判断
            if (!(isNull(this.parentInfo.isActive) || isUndefined(this.parentInfo.isActive))) {
                return this.parentInfo.isActive
            }
            return this.info.active
        },
        hiddSell() {
            return this.isAlterInvestment
        },
        tip() {
            if (isEmpty(this.info)) return ''
            // 票据无法线上卖出
            const msg = this.$t('autoSettle') // 自动结算
            const msg1 = this.$t('soldOut') // 已下架
            const msg2 = this.$t('stopSelling') // 暂停销售
            if (this.info?.productType === PRODUCT_TYPE_MAP.keysMap.BILL) return msg
            if (!this.info?.active) {
                if (this.info?.productType === PRODUCT_TYPE_MAP.keysMap.BOND) {
                    const productMaturityDate = this.info?.productMaturityDate // 产品到期时间
                    if (productMaturityDate && dayjs(productMaturityDate).valueOf() < new Date().valueOf()) {
                        return this.$t('bondExpiredTip') // // 债券已过期
                    }
                    return this.$t('bondDisabledTip') // 债券已下架
                }
                return msg1
            }
            // 公募基金
            if (this.info?.productType === PRODUCT_TYPE_MAP.keysMap.PUBLIC) {
                const { buyable, sellable } = this.info || {}
                if (buyable && !sellable) {
                    return this.$t('trade.onlySubscribeFund')
                } else if (!buyable && sellable) {
                    return this.$t('onlySellForProduct')
                }
                return ''
            }

            // 公募基金和星财宝基金不可买卖显示该产品暂不支持交易
            if ([PRODUCT_TYPE_MAP.keysMap.PUBLIC, PRODUCT_TYPE_MAP.keysMap.CASHBOX].includes(this.info?.productType)) {
                const { buyable, sellable } = this.info || {}
                if (!buyable && !sellable) {
                    return this.$t('stopTrade')
                }
            }

            // 公募基金
            if (this.info?.productType === PRODUCT_TYPE_MAP.keysMap.PUBLIC) {
                const { buyable, sellable } = this.info || {}
                if (buyable && !sellable) {
                    return this.$t('trade.onlySubscribeFund')
                } else if (!buyable && sellable) {
                    return this.$t('onlySellForProduct')
                }
                return ''
            }
            if (!this.info?.buyable) return msg2
            return ''
        },

        needLatestProfit() {
            return ['publicFund', 'privateFund'].includes(this.assetType)
        },

        symbol() {
            return this.$route.query.symbol
        },
        // 票据symbol
        billsymbol() {
            return this.$route.query.billsymbol
        },
    },
    filters: {
        hideFilter(v, amountStatus, text = '****') {
            const placeholder = text
            return amountStatus ? v : placeholder
        },
        // 份额
        quantityFilter(row = {}) {
            // 订单状态:确认份额 | 已完成; 取 filledQuantity 其他取 applyQuantity
            // 公募份额不格式小数位， 由后台控制
            const isPublic = row.productType === PRODUCT_TYPE_MAP.keysMap.PUBLIC
            const quantity = [ORDER_STATUS_MAP.keysMap.PRICED, ORDER_STATUS_MAP.keysMap.SETTLED].includes(row.orderStatus)
                ? row.filledQuantity
                : row.applyQuantity
            return quantity ? milliFormat(isPublic ? quantity : keepDecimals(quantity, 4)) : '--'
        },

        // 检查总金额
        checkGrossAmount(item) {
            const { keysMap } = ORDER_STATUS_MAP
            // 已完成  || 债券 已确认份额   返回filledGrossAmount
            return item.orderStatus === keysMap.SETTLED || (item.productType === productKeyMap.BOND && item.orderStatus === keysMap.PRICED)
                ? item.filledGrossAmount
                : item.applyGrossAmount
        },

        floatToRatioFilter(v, rate) {
            return floatToRatio(v, { rate })
        },

        orderStatusFilter(v) {
            return ORDER_STATUS_MAP.options.findLabel(v, '--')
        },

        currencyFilter(v) {
            return CURRENCY_MAP.options.findLabel(v, '--')
        },

        orderDirectionFilter(v) {
            return ORDER_DIRECTION_MAP.options.findLabel(v, '--')
        },

        submitTimeFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
        },
        confirmDateFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD') : ''
        },
    },
    watch: {},
    created() {
        this.getPersonType()
        this.getHoldingsDetail()

        if (this.isAlterInvestment) {
            //票据需要请求母产品信息
            this.getBasicInfo(this.symbol)
            this.getNoteEventDate()
        }
    },
    mounted() {
        if (this.$jsBridge) {
            this.$jsBridge?.enabelPageRefreshFunction()
            this.$jsBridge.watchPageVisible(() => {
                this.getHoldingsDetail()
                this.resetList()
                if (this.isAlterInvestment) {
                    //票据需要请求母产品信息
                    this.getBasicInfo(this.symbol)
                }
            })
        }
    },
    methods: {
        // 重置列表
        resetList() {
            this.orderList = []
            this.loading = false
            this.finished = false
            this.currentPage = 1
        },
        async onLoad() {
            try {
                console.log(`Feng.chen:: 16:01:37 onLoad ===> `, 'onLoad')
                this.loading = true
                const params = { count: this.pageSize, start: (this.currentPage - 1) * this.pageSize, symbol: this.$route.query.symbol }
                const { result } = await orderList(params)
                const list = result?.list || []
                this.orderList = this.orderList.concat(list)
                this.finished = list.length < this.pageSize || this.orderList.length >= result?.total
                this.currentPage += 1
            } catch (e) {
                this.finished = true
                console.error(e)
            } finally {
                this.loading = false
            }
        },
        async getPersonType() {
            try {
                // 判断用户是否是个人账户 1个人户/2Esop/3联名户/4公司户/5机构户
                const subAcctId = this.$route.query.sub || this.$store.getters['user/getSubAccountId']
                const params = { data: { subAcctId: subAcctId || undefined } }
                const { result } = await getPiApplyDetail(params)
                const PERSON_FLAG = 1 // 个人账户
                this.isPersonalAccount = result?.clientType === PERSON_FLAG
            } catch (e) {
                console.error(e)
            }
        },
        // 初始化列表的更多功能展示状态
        initShowStatus(list = []) {
            return list.map((i, idx) => ({ ...i, show: false, _index: idx }))
        },

        // 初始化详情、认购、赎回按钮展示状态
        initBtnShowStatus(list = []) {
            const getShowBuyBtnStatus = item => {
                return !item.isNotBuyable
            }
            const getShowSellBtnStatus = item => {
                return !item.isNotSellable
            }
            const getShowShareBtnStatus = item => {
                return getRunEnv() === 1 && item.fundMode === 0 && compareVersion(getAppVersion(), '1.3.0') >= 0 && !item.isEcash
            }
            // 详情按钮控制
            const getDetialBtnStatus = item => {
                return item.isActive
            }
            return list.map(i => ({
                ...i,
                detailBtn: getDetialBtnStatus(i),
                buyBtn: getShowBuyBtnStatus(i),
                sellBtn: getShowSellBtnStatus(i),
                shareBtn: getShowShareBtnStatus(i),
            }))
        },

        onAssetsStatus(status) {
            this.assetsStatus = status
        },

        getClass(value) {
            if (!this.assetsStatus) {
                return { hide: true }
            }
            return { rise: value > 0, fall: value < 0, flat: value === 0 }
        },
        onBtnClick(e, data) {
            try {
                const { type } = e.target.dataset || {}
                if (!type) return
                const methodName = type
                this[methodName] && this[methodName](data)
            } catch (e) {
                console.error(e)
            }
        },

        sell() {
            if (this.isPrivate || this.isAlterInvestment) {
                console.warn('私募或票据产品不可卖出')
                return
            }
            if (this.isPublic) {
                this.$goPage(`/redeem/${this.symbol}`)
            } else if (this.isBond) {
                this.$goPage(`/bond-buy/${this.symbol}`, {
                    direction: ORDER_DIRECTION_MAP.keysMap.REDEEM,
                })
            }
        },

        buy() {
            if (this.isPublic || this.isPrivate) {
                this.$goPage(`/subscribe/${this.symbol}`)
            } else if (this.isBond) {
                console.warn('buy-bond:', this.symbol)
                this.$goPage(`/bond-buy/${this.symbol}`)
            } else if (this.isAlterInvestment) {
                let buySymbol = this.symbol
                if (this.basicInfo.parentSymbol) {
                    //票据买入需要传入母产品信息
                    buySymbol = this.basicInfo.parentSymbol
                }
                this.$goPage(`/bills/buy`, {
                    symbol: buySymbol,
                })
            }
        },

        service() {
            this.$goPage('/services')
        },
        changeCurrencyHandler(currency) {
            this.currency = currency
            this.getHoldingsDetail()
        },
        //获取票据信息
        async getBasicInfo(symbol, isParent = false) {
            try {
                const { result = {} } = await getBasicInfo({ symbol: symbol })
                console.log('getBasicInfo ===>', isParent, symbol, result)
                if (result) {
                    if (isParent) {
                        this.parentInfo = result?.list?.[0] || {}
                    } else {
                        this.basicInfo = result?.list?.[0] || {}
                        //获取母产品信息
                        if (this.basicInfo.parentSymbol) {
                            this.getBasicInfo(this.basicInfo.parentSymbol, true)
                        }
                    }
                }
            } catch (e) {
                console.log('getBasicInfo error ==>', e)
            }
        },

        async getHoldingsDetail() {
            try {
                const params = {
                    symbol: this.symbol,
                }
                const { result = {} } = await getHoldingsDetail(params)

                // result.estimateMaturityGain = '0.26'
                // result.holdingsComposition = [{ filledAmount: '0.64', confirmDate: '2023/01/02', estimateMaturityGain: '12' }]
                this.info = result || {}
                this.$set(this.info, 'billsymbol', this.billsymbol)
            } catch (e) {
                console.error('getHoldingsDetail===>e:', e)
            }
        },
        async getNoteEventDate() {
            try {
                const params = {
                    symbol: this.symbol,
                }
                const { result = {} } = await getEventDate(params)

                this.eventDate = result || {}

                console.log('etEventDate===> r', this.eventDate)
                this.$set(this.info, 'billsymbol', this.billsymbol)
            } catch (e) {
                console.error('getEventDate===>e:', e)
            }
        },
        goOrderDetail(e) {
            const { id } = e.target?.dataset || {}
            if (id) {
                this.$goPage('/order-detail', {
                    orderNumber: id,
                })
            }
        },
    },
}
</script>

<style lang="less">
html {
    background: #f9f9f9;
}
</style>

<style scoped lang="less">
@import url('~@/assets/css/mixins.less');
@black: #1f1f1f;
@white: #fff;

.product-detail-in-hold {
    padding-bottom: 66px;
    overflow: auto;

    .history-module {
        padding: 0 12px;
    }

    .card {
        margin-top: 12px;
        background: @white;
        border-radius: 8px;
    }

    .mask {
        position: relative;

        &::after {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1;
            display: block;
            content: '';
        }
    }

    .outter-product-card {
        margin: 12px;
    }

    .profit-detail {
        margin: 12px 12px 14px;
        padding: 0 12px;
        background: #fff;
        border-radius: 8px;

        & > .header {
            padding: 16px 0 8px;

            .title {
                color: @fontBlackColor;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }
        }

        .list {
            .header {
                color: @fontGreyColor;
                font-size: 12px;
                line-height: 16px;
            }

            .content {
                color: @fontBlackColor;
                font-size: 14px;
                line-height: 20px;

                .between {
                    display: flex;
                    justify-content: space-between;

                    span {
                        &:nth-of-type(2) {
                            text-align: right;
                        }
                    }
                }
            }

            .header,
            .content > li {
                display: flex;
                padding: 8px 0;

                span {
                    width: 98px;
                    font-weight: 500;

                    &:not(:first-child) {
                        margin-left: 17px;
                    }

                    &:nth-of-type(2) {
                        text-align: center;
                    }

                    &:nth-of-type(3) {
                        text-align: right;
                    }
                }
            }

            .between {
                display: flex;
                justify-content: space-between;

                span {
                    &:nth-of-type(2) {
                        text-align: right;
                    }
                }
            }
        }

        .total {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 4px;
            padding: 14px 0;

            .label {
                color: @fontLightColor;
                font-size: 12px;
                line-height: 16px;
            }

            .value {
                color: @fontBlackColor;
                font-weight: 500;
                font-size: 14px;
                line-height: 20px;
            }
        }
    }

    .tab {
        display: flex;
        align-items: center;
        padding: 4px 12px 0;
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

    .holdDetails {
        margin: 12px;
        padding: 16px 12px 0;
        background: #fff;
        border-radius: 8px;

        .table-content__worth {
            min-height: 0;

            /deep/ .scroll {
                .scroll-title-container {
                    left: 130px;
                }
            }
        }

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;

            .title {
                color: @fontBlackColor;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }
        }

        .footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 44px;

            .title {
                color: @fontLightColor;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }

            .holding-percent {
                color: @fontLightColor;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .observations {
        margin: 12px;
        padding: 16px 12px 0;
        background: #fff;
        border-radius: 8px;

        .content {
            padding: 0 0 16px;
        }
    }

    .holding {
        margin: 12px;
        padding: 3px 12px;
        background: #fff;
        border-radius: 8px;

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;

            .title {
                color: @fontBlackColor;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }
        }

        &-content {
            .order-list {
                &-item {
                    position: relative;
                    padding: 7px 0;

                    &::before {
                        position: absolute;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        height: 1px;
                        background: #efefef;
                        transform: scaleY(0.5);
                        content: '';
                    }

                    &:nth-last-of-type(1) {
                        &::before {
                            display: none;
                        }
                    }

                    .top,
                    .bottom {
                        display: flex;
                        justify-content: space-between;
                    }

                    .top {
                        .direction {
                            color: @fontBlackColor;
                            font-weight: 500;
                            font-size: 14px;
                            line-height: 20px;
                        }

                        .amount {
                            color: @fontBlackColor;
                            font-weight: 400;
                            font-size: 14px;
                            line-height: 20px;

                            span:first-child {
                                font-weight: 700;
                            }
                        }
                    }

                    .bottom {
                        margin-top: 4px;

                        .date,
                        .status {
                            color: #9c9c9c;
                            font-size: 12px;
                            line-height: 16px;
                        }

                        .date {
                            font-size: 11px;
                        }
                    }
                }
            }
        }
    }

    .profit-desc {
        &.holding-tip {
            margin-bottom: 64px;
        }
    }

    footer {
        position: fixed;
        bottom: 0;
        z-index: 999;
        width: 375px;
        background: #fff;
        #iosBottom();

        .tip {
            padding: 8px 0;
            color: #9d252a;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
            background: #ffe5e7;
        }

        .tip-warn {
            color: #af7213 !important;
            background: #fff6e8 !important;
        }

        .btns {
            display: flex;
            padding: 6px 12px;
            box-shadow: inset 0 0.5px 0 #efefef;

            button {
                background: none;
                border: none;
                outline: none;
            }

            .buy,
            .sell {
                width: 134px;
                color: #fff;
                font-weight: 500;
                font-size: 16px;
                line-height: 36px;
            }

            .buy {
                background: linear-gradient(90.13deg, #ff8d07 2.3%, #ff6907 99.86%);
                border-radius: 18px 0 0 18px;

                &:disabled {
                    color: rgba(#fff, 0.5);
                }
            }

            .sell {
                background: linear-gradient(90deg, #ffa724 0%, #ffba07 100%);
                border-radius: 0 18px 18px 0;

                &:disabled {
                    color: rgba(#fff, 0.5);
                }
            }

            .onlyBuy {
                width: 268px;
                color: #fff;
                font-weight: 500;
                font-size: 16px;
                line-height: 36px;
                background: linear-gradient(90.13deg, #ff8d07 2.3%, #ff6907 99.86%);
                border-radius: 18px;

                &:disabled {
                    color: rgba(#fff, 0.5);
                }
            }

            .service {
                display: flex;
                flex-direction: column;
                justify-content: center;
                margin-left: 39px;

                img {
                    width: 24px;
                }

                span {
                    color: #9c9c9c;
                    font-size: 10px;
                    line-height: 14px;
                }
            }
        }
    }
}
</style>
