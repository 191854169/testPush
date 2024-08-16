<template>
    <div class="detail">
        <detail-info :confirmColumns="confirmColumns" :orderColumns="orderColumns" :orderInfo="detail"></detail-info>
        <template v-if="isPublicFund || isCashBox || isBond || isBill">
            <div class="withdraw" v-if="detail.orderStatus == orderStatusKeysMap.SUBMITTED" @click="withdraw">{{ $t('trade.withdraw') }}</div>
            <div class="withdraw" v-if="detail.orderStatus == orderStatusKeysMap.CREATING" @click="getDetail('refresh')">
                {{ $t('trade.refreshStatus') }}
            </div>
        </template>
        <loading />
    </div>
</template>
<script>
import { orderDetail, OrderCancel } from '@/apis/wealth/index.js'
import { thousandsFilter } from '@/config/filters.js'
import { Toast, Dialog } from 'vant'
import * as dayjs from 'dayjs'
import DetailInfo from './detailInfo.vue'
import { floatToRatio } from '@/utils'
import { i18n } from '@/i18n/fund/index'
import NP from 'number-precision'
import { keepDecimals } from '@/utils'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { mapState } from 'vuex'

dayjs.extend(require('dayjs/plugin/duration'))
import { CURRENCY_MAP, ORDER_DIRECTION_MAP, ORDER_STATUS_MAP, PRODUCT_TYPE_MAP, SOURCE_TYPE_MAP } from '@/views/fund/config/common'
import { accountTypeMap as ACCOUNT_TYPE_MAP } from '@/config/common'
import { isInOutsideH5 } from '@/utils'
const sourceTypeKeysMap = SOURCE_TYPE_MAP.keysMap

const accountTypeMap = ACCOUNT_TYPE_MAP.keyValueMap
const directionMap = {
    1: i18n.t('trade.buy'),
    2: i18n.t('trade.sell'),
}
const amountFilter = function (v) {
    return ['', undefined, null, NaN].includes(v) ? '--' : thousandsFilter(v)
}
const currencyFilter = function (v) {
    return CURRENCY_MAP.options.findLabel(v)
}

const MAX_ORDER_STATUS_TIMES = 60

export default {
    components: {
        DetailInfo,
    },
    filters: {
        amountFilter,
        currencyFilter,
    },
    data() {
        return {
            myLinkTradeLogin: null,
            direction: {
                1: this.$t('subscribe'),
                2: this.$t('redeem'),
            },
            orderId: this.$route.query.orderId,
            orderNumber: this.$route.query.orderNumber,
            status: ORDER_STATUS_MAP.keyValueMap,
            orderStatusKeysMap: ORDER_STATUS_MAP.keysMap,
            detail: {},
            bondColumnsMap: {
                confirm: [
                    {
                        // 交易金额
                        key: 'filledGrossAmount',
                        label: this.$t('trade.tradeAmount'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认价格
                        key: 'filledPrice',
                        label: this.$t('orderDetailCols.filledPrice'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 3))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 票面面值
                        key: 'filledParValue',
                        label: this.$t('trade.parAmount'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 应计利息
                        key: 'filledAccruedInterest',
                        label: this.$t('orderDetailCols.accruedInterest'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认费用
                        key: 'filledFeeAmount',
                        label: this.$t('trade.confirmCash'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认时间
                        key: 'confirmTime',
                        label: this.$t('orderDetailCols.settleDate'),
                        filter(v) {
                            return v ? dayjs(v).format('YYYY/MM/DD') : '--'
                        },
                    },
                ],
                order: [
                    {
                        // 产品名称
                        key: 'productName',
                        label: this.$t('productName'),
                    },
                    {
                        // 委托类型
                        key: 'orderDirection',
                        label: this.$t('orderDetailCols.orderDirection'),
                        filter: (v, data) => {
                            return directionMap[data.orderDirection] || ''
                        },
                    },
                    {
                        // 意向价格
                        key: 'applyPrice',
                        label: this.$t('trade.intentPrice'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 3))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 票面面值
                        key: 'applyParValue',
                        label: this.$t('trade.parAmount'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 预估应计利息
                        key: 'applyAccruedInterest',
                        label: this.$t('trade.estInterest'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 预估费用
                        key: 'applyFeeAmount',
                        label: this.$t('trade.estPrice'),
                        filter(v, data) {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 预估交易金额
                        key: 'applyNetAmount',
                        label: this.$t('ygAmount'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 预估交付金额
                        key: 'applyGrossAmount',
                        label: this.$t('ygjfAmount'),
                        filter(v, data) {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 交易账户
                        key: 'account',
                        label: this.$t('trade.tradeAccount'),
                        filter: (v, data) => {
                            return `${accountTypeMap[data.accountType]}(${v})`
                        },
                    },
                    {
                        // 下单时间
                        key: 'submitTime',
                        label: this.$t('orderDetailCols.submitTime'),
                        filter(v) {
                            return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                        },
                    },
                    {
                        // 订单标号
                        key: 'orderNumber',
                        label: this.$t('trade.orderNumber'),
                    },
                ],
            },
            billColumnsMap: {
                confirm: [
                    {
                        // 产品名称
                        key: 'isin',
                        label: this.$t('productISIN'),
                    },
                    {
                        // 确认金额
                        key: 'filledGrossAmount',
                        label: this.$t('orderDetailCols.filledGrossAmount'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认费用
                        key: 'filledFeeAmount',
                        label: this.$t('trade.confirmCash'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认时间
                        key: 'settleDate',
                        label: this.$t('orderDetailCols.settleDate'),
                        filter(v) {
                            return v ? dayjs(v).format('YYYY/MM/DD') : '--'
                        },
                    },
                ],
                order: [
                    {
                        // 产品名称
                        key: 'productName',
                        label: this.$t('productName'),
                    },
                    {
                        // 委托类型
                        key: 'orderDirection',
                        label: this.$t('orderDetailCols.orderDirection'),
                        filter: (v, data) => {
                            return directionMap[data.orderDirection] || ''
                        },
                    },
                    {
                        // 到期日期
                        key: 'productPeriod',
                        label: this.$t('orderDetailCols.productPeriod'),
                        filter: (val, data) => dayjs(data.productMaturityDate).format('YYYY/MM/DD'),
                    },
                    {
                        // 年化利率
                        key: 'productYield',
                        label: this.$t('orderDetailCols.productYield'),
                        filter: (val, data) => {
                            let value = ''
                            if (data['productMinYield'] && data['productMaxYield']) {
                                value = `${floatToRatio(data['productMinYield'], { pow: 2, sign: false })}~${floatToRatio(data['productMaxYield'], {
                                    pow: 2,
                                    sign: false,
                                })}`
                            } else {
                                value = floatToRatio(val, { pow: 2, sign: false })
                            }
                            return value
                        },
                    },
                    {
                        // 买入金额
                        key: 'applyFeeAmount',
                        label: this.$t('trade.applyAmount'),
                        filter: (v, data) => {
                            const applyGrossAmount = data.applyGrossAmount
                            const value = NP.minus(applyGrossAmount, v)
                            return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 预估费用
                        key: 'applyFeeAmount',
                        label: this.$t('trade.estPrice'),
                        filter(v, data) {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 交易账户
                        key: 'account',
                        label: this.$t('trade.tradeAccount'),
                        filter: (v, data) => {
                            return `${accountTypeMap[data.accountType]}(${v})`
                        },
                    },
                    {
                        // 下单时间
                        key: 'submitTime',
                        label: this.$t('orderDetailCols.submitTime'),
                        filter(v) {
                            return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                        },
                    },
                    {
                        // 订单编号
                        key: 'orderNumber',
                        label: this.$t('trade.orderNumber'),
                    },
                ],
            },
            privateFundColumnsMap: {
                confirm: [
                    {
                        // 确认金额
                        key: 'filledNetAmount',
                        label: this.$t('orderDetailCols.filledGrossAmount'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认份额
                        key: 'filledQuantity',
                        label: this.$t('confirmShare'),
                        filter: v => {
                            return amountFilter(keepDecimals(v, 4)) + this.$t('trade.part')
                        },
                    },
                    {
                        // 确认净值
                        key: 'filledPrice',
                        label: this.$t('trade.confirmPrice'),
                        filter: v => {
                            return `${amountFilter(keepDecimals(v, 4))}`
                        },
                    },
                    {
                        // 确认费用
                        key: 'filledFeeAmount',
                        label: this.$t('trade.confirmCash'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认时间
                        key: 'settleDate',
                        label: this.$t('orderDetailCols.settleDate'),
                        filter(v) {
                            return v ? dayjs(v).format('YYYY/MM/DD') : '--'
                        },
                    },
                ],
                order: [
                    {
                        // 产品名称
                        key: 'productName',
                        label: this.$t('productName'),
                    },
                    {
                        // 委托类型
                        key: 'orderDirection',
                        label: this.$t('orderDetailCols.orderDirection'),
                        filter: (v, data) => {
                            return directionMap[data.orderDirection] || ''
                        },
                    },
                    {
                        // 买入金额
                        key: 'applyFeeAmount',
                        label: this.$t('trade.applyAmount'),
                        filter: (v, data) => {
                            const applyGrossAmount = data.applyGrossAmount
                            const value = NP.minus(applyGrossAmount, v)
                            return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 预估费用
                        key: 'applyFeeAmount',
                        label: this.$t('trade.estPrice'),
                        filter(v, data) {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 交易账户
                        key: 'account',
                        label: this.$t('trade.tradeAccount'),
                        filter: (v, data) => {
                            return `${accountTypeMap[data.accountType]}(${v})`
                        },
                    },
                    {
                        // 下单时间
                        key: 'submitTime',
                        label: this.$t('orderDetailCols.submitTime'),
                        filter(v) {
                            return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                        },
                    },
                    {
                        // 订单编号
                        key: 'orderNumber',
                        label: this.$t('trade.orderNumber'),
                    },
                ],
            },
            publicFundColumnsMap: {
                confirm: [
                    {
                        // 确认金额
                        key: 'filledNetAmount',
                        label: this.$t('orderDetailCols.filledGrossAmount'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认份额
                        key: 'filledQuantity',
                        label: this.$t('confirmShare'),
                        filter: v => {
                            return amountFilter(v) + this.$t('trade.part')
                        },
                    },
                    {
                        // 确认净值
                        key: 'filledPrice',
                        label: this.$t('trade.confirmPrice'),
                        filter: v => {
                            return `${amountFilter(keepDecimals(v, 4))}`
                        },
                    },
                    {
                        // 确认费用
                        key: 'filledFeeAmount',
                        label: this.$t('trade.confirmCash'),
                        filter: (v, data) => {
                            return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                        },
                    },
                    {
                        // 确认时间
                        key: 'settleDate',
                        label: this.$t('orderDetailCols.settleDate'),
                        filter(v) {
                            return v ? dayjs(v).format('YYYY/MM/DD') : '--'
                        },
                    },
                ],
                order: [
                    {
                        // 产品名称
                        key: 'productName',
                        label: this.$t('productName'),
                    },
                    {
                        // 委托类型
                        key: 'orderDirection',
                        label: this.$t('orderDetailCols.orderDirection'),
                        filter: (v, data) => {
                            const { sourceType } = data
                            return `${sourceType === +sourceTypeKeysMap.AUTO ? i18n.t('auto') : ''}${ORDER_DIRECTION_MAP.options.findLabel(v)}`
                        },
                    },
                    {
                        // 买入金额
                        key: 'applyFeeAmount',
                        label: this.$t('trade.applyAmount'),
                        filter: (v, data) => {
                            const applyGrossAmount = data.applyGrossAmount
                            const value = NP.minus(applyGrossAmount, v)
                            return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                        },
                        showConfig: data => data.orderDirection === 1,
                    },
                    {
                        //卖出份额
                        key: 'applyQuantity',
                        label: this.$t('trade.sellQuantity'),
                        filter: v => {
                            return `${amountFilter(v)}${this.$t('trade.part')}`
                        },
                        showConfig: data => data.orderDirection === 2,
                    },
                    {
                        // 交易账户/回款账户
                        key: 'account',
                        label: this.$t('trade.tradeAccount'),
                        filter: (v, data) => {
                            return `${accountTypeMap[data.accountType]}(${v})`
                        },
                        labelFormat: data => {
                            const map = {
                                1: this.$t('trade.trade'),
                                2: this.$t('trade.return'),
                            }
                            const direction = map[data.orderDirection]
                            return `${direction}${this.$t('trade.account')}`
                        },
                    },
                    {
                        // 下单时间
                        key: 'submitTime',
                        label: this.$t('orderDetailCols.submitTime'),
                        filter(v) {
                            return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                        },
                    },
                    {
                        // 订单编号
                        key: 'orderNumber',
                        label: this.$t('trade.orderNumber'),
                    },
                ],
            },
            timer: null,
            orderStatusTimes: 0,
            loadingTimes: 0,
            loadingFinishTimes: 0,
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        statusIcon() {
            const { orderStatus } = this.detail
            console.log(`Feng.chen:: 15:01:42 orderStatus ===> `, orderStatus)
            const { keysMap } = ORDER_STATUS_MAP
            if (orderStatus === keysMap.SUBMITTED) return 'wait'

            if (orderStatus === keysMap.SETTLED) return 'success'
            if ([keysMap.PRICED, keysMap.DEDUCTED, keysMap.PROCESSING].includes(orderStatus)) return 'accept'
            if (orderStatus === keysMap.REJECTED) return 'fail'
            if (orderStatus === keysMap.CANCELLED) return 'cancel'
            return 'wait'
        },
        isPublicFund() {
            const keysMap = PRODUCT_TYPE_MAP.keysMap
            return [keysMap.PUBLIC].includes(this.detail.productType)
        },
        isCashBox() {
            const keysMap = PRODUCT_TYPE_MAP.keysMap
            return [keysMap.CASHBOX].includes(this.detail.productType)
        },
        isPrivateFund() {
            const keysMap = PRODUCT_TYPE_MAP.keysMap
            return keysMap.PRIVATE === this.detail.productType
        },
        isBond() {
            const keysMap = PRODUCT_TYPE_MAP.keysMap
            return [keysMap.BOND].includes(this.detail.productType)
        },
        isBill() {
            const keysMap = PRODUCT_TYPE_MAP.keysMap
            return [keysMap.BILL].includes(this.detail.productType)
        },
        isBillFNC() {
            return this.isBill && this.detail.noteProperty === 3
        },
        isMarketingBill() {
            return this.isBill && this.detail.noteProperty === 4
        },
        confirmColumns() {
            const bondColumns = this.bondColumnsMap.confirm
            const billColumns = this.billColumnsMap.confirm
            const privateFundColumns = this.privateFundColumnsMap.confirm
            const publicFundColumns = this.publicFundColumnsMap.confirm
            if (this.isBond) return bondColumns
            if (this.isBill) return billColumns
            if (this.isPrivateFund) return privateFundColumns
            if (this.isPublicFund || this.isCashBox) return publicFundColumns
            return []
        },
        orderColumns() {
            const bondColumns = this.bondColumnsMap.order
            let billColumns = this.billColumnsMap.order
            const privateFundColumns = this.privateFundColumnsMap.order
            const publicFundColumnsMap = this.publicFundColumnsMap.order
            const index = billColumns.findIndex(i => {
                return i.key === 'productYield'
            })
            if (this.isBillFNC && index) {
                billColumns[index].label = this.$t('fcn.coupon')
            }
            if (this.isMarketingBill) {
                billColumns = billColumns.filter(item => item.key !== 'productYield')
            }
            if (this.isBond) return bondColumns
            if (this.isBill) return billColumns
            if (this.isPrivateFund) return privateFundColumns
            if (this.isPublicFund || this.isCashBox) return publicFundColumnsMap
            return []
        },
    },
    async mounted() {
        // 获取用户信息，保证getDetail 能取到正确的请求头配置
        await this.$store.dispatch('user/getUserInfo')
        this.$nextTick(() => {
            this.getDetail()
        })
    },
    beforeDestroy() {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
    },
    methods: {
        //获取详情
        getDetail(fromType = 'normal') {
            const needLoading = ['normal', 'refresh'].includes(fromType)
            const needTimeout = ['normal', 'timeout'].includes(fromType)
            if (needLoading) {
                this.$store.commit('app/updateShowLoading', true)
            }
            orderDetail({
                orderId: this.orderId,
                orderNumber: this.orderNumber,
            })
                .then(res => {
                    this.detail = res.result

                    // 处理中订单 轮询检查状态
                    if (this.detail.orderStatus === this.orderStatusKeysMap.CREATING) {
                        // 60次状态不变更则不在自动轮询
                        if (this.orderStatusTimes <= MAX_ORDER_STATUS_TIMES && needTimeout) {
                            this.orderStatusTimes++
                            this.timer = setTimeout(() => {
                                this.getDetail('timeout')
                            }, 1000)
                        }
                    } else {
                        if (this.timer) {
                            clearTimeout(this.timer)
                            this.timer = null
                        }
                    }
                })
                .catch(() => {})
                .finally(() => {
                    if (needLoading) {
                        this.$store.commit('app/updateShowLoading', false)
                    }
                })
        },
        //撤单
        async withdraw() {
            try {
                if (this.$jsBridge) {
                    await this.$jsBridge.tradeLogin()
                } else if (isInOutsideH5()) {
                    if (!this.myLinkTradeLogin) {
                        this.myLinkTradeLogin = new TradeLogin({
                            propsData: {
                                subAcctId: this.accts.subAcctId,
                                callBack: () => {
                                    this.showWithDrawDialog()
                                },
                                showCloseIcon: isInOutsideH5(),
                            },
                        })
                    }
                    this.myLinkTradeLogin.show = true
                    return
                }
                this.showWithDrawDialog()
            } catch (e) {
                console.log('输入交易密码失败===>error:', e)
            }
        },

        // 显示撤单dialog
        showWithDrawDialog() {
            let message = `${this.$t('trade.qrysh')}${this.direction[this.detail.orderDirection]}${this.$t('trade.ma')}`

            // 现金宝赎回出金提示
            if (this.detail.sourceType === 4) {
                message = this.$t('trade.confirmCashBoxBankWithdarw')
            }

            Dialog.confirm({
                title: '',
                confirmButtonText: this.$t('trade.queding'),
                showCancelButton: true,
                messageAlign: 'center',
                message,
            })
                .then(() => {
                    this.cancelAction()
                })
                .catch(() => {
                    // on cancel
                })
        },

        // 撤单API
        async cancelAction() {
            const trackObj = {
                operation_type: this.$t('recall'),
                deal_type: this.detail.orderDirection == 1 ? this.$t('subscribe') : this.$t('redeem'),
                fund_type: this.detail.type || '',
                fund_code: this.detail.isin,
                fund_name: this.detail.fundName,
                currency: this.detail.currency,
            }
            if (this.detail.orderDirection == 1) {
                trackObj['subscribe_amount'] = this.detail.applyGrossAmount
            } else {
                trackObj['redeem_num'] = this.detail.applyQuantity
            }
            try {
                this.$loading.show = true
                const { result } = await OrderCancel({
                    orderNumber: this.orderNumber,
                })
                this.$loading.show = false
                console.warn('orderCancel ==> result:', result)
                Toast.success({
                    message: this.$t('trade.tijiaochenggong'),
                    forbidClick: true,
                    onClose: () => {
                        console.warn('修改订单状态')
                        this.detail.orderStatus = 2
                    },
                })
            } catch (e) {
                this.$loading.show = false
                console.log('OrderCancel===>e:', e)
                const error = e.error || {}
                if (error?.data?.tips) {
                    return Toast(error?.data?.tips)
                }
                Toast(this.$t('serviceError'))
            }
        },
    },
}
</script>
<style lang="less" scoped>
.detail {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100%;
    padding: 12px 0;

    .order-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 12px;
        padding: 16px 0;
        background-color: #fff;
        border-radius: 8px;
    }

    .orderResult {
        display: flex;
        align-items: center;
        margin-bottom: 7px;

        img {
            width: 12px;
            height: 12px;
            margin-right: 8px;
        }

        span {
            font-weight: 700;
            font-size: 14px;
            line-height: 20px;
        }

        .wait {
            color: #2f9bff;
        }

        .success {
            color: #3fbd55;
        }

        .fail {
            color: #f31414;
        }

        .cancel {
            color: #9c9c9c;
        }
    }

    .orderTime {
        color: #9c9c9c;
        font-size: 12px;
        line-height: 17px;
        text-align: center;
    }

    .box {
        margin: 12px;
        padding: 0 12px;
        background: #fff;
        border-radius: 8px;

        .title {
            margin-bottom: 8px;
            padding-top: 14px;
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        .scrollTitle {
            margin-left: 12px;
        }

        .row {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            line-height: 20px;

            .left {
                color: #666;
            }

            .right {
                color: #2f2f2f;
            }
        }
    }

    .withdraw {
        box-sizing: border-box;
        width: 287px;
        height: 40px;
        margin: 34px 44px;
        font-size: 16px;
        line-height: 40px;
        text-align: center;
        border: 0.5px solid #9c9c9c;
        border-radius: 20px;
    }
}
</style>
