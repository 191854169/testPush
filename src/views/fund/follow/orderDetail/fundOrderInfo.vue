<template>
    <div class="stock-order-info" @click="goOrderDetail">
        <header>
            <div class="header-left">
                <span class="order-name line-elipsis">{{ info.productName }}</span>
                <div class="fund-info">
                    <div :class="`currency-${info.currency}`"></div>
                    <span class="fund-isin">{{ info.productCode }}</span>
                </div>
            </div>
            <button class="header-right" v-if="canRecall" @click.stop="recallHandler">{{ $t('recall') }}</button>
        </header>
        <ul class="order-info__list">
            <li v-for="(item, index) in rowList" :key="index" v-show="!item.hidden">
                <span>{{ item.label }}</span>
                <span>{{ item.filter(info[item.key], info) }}</span>
            </li>
        </ul>
    </div>
</template>
<script>
import { OrderCancel } from '@/apis/wealth/index.js'
import dayjs from 'dayjs'
import { thousandsFilter } from '@/config/filters'
import { keepDecimals } from '@/utils'
import { ORDER_STATUS_MAP, CURRENCY_MAP } from '@/views/fund/config/common'

const fundOrderStatusMap = ORDER_STATUS_MAP.keyValueMap

const currencyFilter = currency => {
    return CURRENCY_MAP.keyValueMap[currency] || ''
}
const amountFilter = (v, base = 0) => {
    return v ? thousandsFilter(keepDecimals(v, base)) : ''
}
export default {
    name: 'stockOrderInfo',
    components: {},
    props: {
        info: {
            type: Object,
            default: () => ({}),
        },
    },
    filters: {},
    data() {
        return {}
    },
    computed: {
        // 是否可撤单
        canRecall() {
            // 公募待受理： 1
            return ORDER_STATUS_MAP.keysMap.SUBMITTED === this.info.orderStatus
        },
        // 是否确认订单
        isConfigOrder() {
            // 已确认份额 ： 5、已完成： 7
            return [ORDER_STATUS_MAP.keysMap.PRICED, ORDER_STATUS_MAP.keysMap.SETTLED].includes(this.info.orderStatus)
        },
        rowList() {
            return [
                {
                    label: this.$t('orderDetailCols.orderStatus'),
                    key: 'orderStatus',
                    filter: v => {
                        return v ? fundOrderStatusMap[v] || '--' : '--'
                    },
                },
                {
                    label: this.$t('orderDetailCols.filledGrossAmount'),
                    key: 'tradeAmount',
                    filter: (v, info) => {
                        return v ? `${amountFilter(v, 2)}${currencyFilter(info.currency)}` : '--'
                    },
                    hidden: !this.isConfigOrder,
                },
                {
                    label: this.$t('confirmShare'),
                    key: 'tradeQuantity',
                    filter: v => {
                        return v ? `${amountFilter(v, 4)}${this.$t('trade.part')}` : '--'
                    },
                    hidden: !this.isConfigOrder,
                },
                {
                    label: this.$t('trade.confirmPrice'),
                    key: 'tradePrice',
                    filter: v => {
                        return v ? amountFilter(v, 4) : '--'
                    },
                    hidden: !this.isConfigOrder,
                },
                {
                    label: this.$t('trade.confirmCash'),
                    key: 'feeAmount',
                    filter: (v, info) => {
                        return v ? `${amountFilter(v, 2)}${currencyFilter(info.currency)}` : '--'
                    },
                    hidden: !this.isConfigOrder,
                },
                {
                    label: this.$t('orderDetailCols.settleDate'),
                    key: 'confirmTime',
                    filter: v => {
                        return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
                    },
                    hidden: !this.isConfigOrder,
                },
                {
                    label: this.$t('trade.weituoleixing'),
                    key: 'optType',
                    filter: v => {
                        const optTypeMap = {
                            1: this.$t('subscribe'),
                            2: this.$t('redeem'),
                        }
                        return v ? optTypeMap[v] || '--' : '--'
                    },
                },
                {
                    label: this.$t('trade.applyAmount'),
                    key: 'applyAmount',
                    filter: (v, info) => {
                        return v ? `${amountFilter(v, 2)}${currencyFilter(info.currency)}` : '--'
                    },
                },
                {
                    label: this.$t('trade.tradeAccount'),
                    key: 'subAccountId',
                    filter: v => {
                        return v ? v : '--'
                    },
                },
                {
                    label: this.$t('trade.orderNumber'),
                    key: 'tradeOrderId',
                    filter: v => {
                        return v ? v : '--'
                    },
                },
            ]
        },
    },
    methods: {
        recallHandler() {
            this.$dialog
                .confirm({
                    title: this.$t('trade.cancelTip'),
                    confirmButtonText: this.$t('trade.queding'),
                    showCancelButton: true,
                    messageAlign: 'left',
                    message: this.$t('trade.cancelRemindDesc'),
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
            try {
                this.$loading.show = true
                const { result } = await OrderCancel({
                    orderNumber: this.info.tradeOrderId,
                })
                this.$loading.show = false
                console.warn('orderCancel ==> result:', result)
                this.$toast.success({
                    message: this.$t('trade.tijiaochenggong'),
                    forbidClick: true,
                    onClose: () => {
                        this.$emit('recall')
                    },
                })
            } catch (e) {
                this.$loading.show = false
                console.log('OrderCancel===>e:', e)
                const error = e.error || {}
                if (error?.data?.tips) {
                    return this.$toast(error?.data?.tips)
                }
                this.$toast(this.$t('serviceError'))
            }
        },
        // 前往基金订单详情
        goOrderDetail() {
            const id = this.info.tradeOrderId
            if (!id) return
            const url = `${location.origin}/wealth/fund.html#/order-detail?orderNumber=${id}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/order-detail',
                    query: {
                        orderNumber: id,
                    },
                })
            }
        },
    },
}
</script>
<style scoped lang="less">
.stock-order-info {
    padding: 16px 12px 0;
    background-color: #fff;
    border-radius: 8px;
}

header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .order-name {
            max-width: 260px;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 15px;
            line-height: 21px;
        }

        .fund-info {
            display: flex;
            align-items: center;
            margin-top: 4px;

            .fund-isin {
                margin-left: 2px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    button.header-right {
        flex: 0 0 auto;
        align-self: flex-start;
        width: 58px;
        min-width: 58px;
        padding: 4px 0;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        background: #f7f7f7;
        border-width: 0;
        border-radius: 31px;
    }
}

ul.order-info__list {
    display: flex;
    flex-direction: column;
    padding: 8px 0;

    li {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;

        span:first-of-type {
            color: #666;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        span:last-of-type {
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }
    }
}
</style>
