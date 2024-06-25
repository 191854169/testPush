<template>
    <div class="stock-order-info" @click="goOrderDetail">
        <header>
            <p class="order-name line-elipsis">
                <span>{{ info.productName }}</span>
                <span>{{ info.productCode | productCodeFilter(info) }}</span>
            </p>
            <button class="header-button" v-if="canRecall" @click.stop="recallHandler">{{ $t('recall') }}</button>
        </header>
        <ul class="order-info__list">
            <li v-for="(item, index) in rowList" :key="index">
                <div v-if="item.key == 'divide'" class="divide"></div>
                <div v-else class="ele">
                    <span>{{ item.label }}</span>
                    <span>{{ item.filter(info[item.key]) }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
import { OrderCancel } from '@/apis/trade/index.js'
import dayjs from 'dayjs'
import { thousandsFilter } from '@/config/filters'
import { keepDecimals } from '@/utils'
import { STOCK_ORDER_STATUS_MAP, STOCK_ORDER_TYPE_MAP } from '@/views/fund/config/common'

const stockOrderStatusMap = STOCK_ORDER_STATUS_MAP.keyValueMap
const stockOrderTypeMap = STOCK_ORDER_TYPE_MAP.keyValueMap

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
    filters: {
        productCodeFilter(v, info) {
            const market =
                {
                    1: 'HK',
                    2: 'US',
                }[info.productType] || ''
            return `(${v}.${market})`
        },
    },
    data() {
        return {}
    },
    computed: {
        // 是否可撤单
        canRecall() {
            return this.info?.canCancel || false
        },
        rowList() {
            return [
                {
                    label: this.$t('follow.orderType'),
                    key: 'stockOrderType',
                    filter: v => {
                        return v ? stockOrderTypeMap[v] || '--' : '--'
                    },
                },
                {
                    label: this.$t('orderDetailCols.orderStatus'),
                    key: 'orderStatus',
                    filter: v => {
                        return v ? stockOrderStatusMap[v] || '--' : '--'
                    },
                },
                {
                    label: this.$t('trade.tradeDirection'),
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
                    label: this.$t('trade.transactDate'),
                    key: 'confirmTime',
                    filter: v => {
                        return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
                    },
                },
                {
                    key: 'divide',
                },
                {
                    label: this.$t('trade.entrustQuantity'),
                    key: 'quantity',
                    filter: v => {
                        return v ? amountFilter(v) : '--'
                    },
                },
                {
                    label: this.$t('trade.entrustPrice'),
                    key: 'price',
                    filter: v => {
                        return v ? amountFilter(v, 3) : '--'
                    },
                },
                {
                    key: 'divide',
                },
                {
                    label: this.$t('trade.transactQuantity'),
                    key: 'tradeQuantity',
                    filter: v => {
                        return v ? amountFilter(v) : '--'
                    },
                },
                {
                    label: this.$t('trade.transactAverage'),
                    key: 'tradePrice',
                    filter: v => {
                        return v ? amountFilter(v, 3) : '--'
                    },
                },
                {
                    key: 'divide',
                },
                {
                    label: this.$t('trade.entrustAmount'),
                    key: 'applyAmount',
                    filter: v => {
                        return v ? amountFilter(v, 2) : '--'
                    },
                },
                {
                    label: this.$t('trade.transactAmount'),
                    key: 'tradeAmount',
                    filter: v => {
                        return v ? amountFilter(v, 2) : '--'
                    },
                },
            ]
        },
    },
    methods: {
        // 前往股票订单详情
        goOrderDetail() {
            const id = this.info.tradeOrderId
            if (!id || !this.$jsBridge) return
            // TODO: app目前不支持跳转到股票订单详情页
            // this.$jsBridge.goPage('orderRecord')
        },

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
                    if (this.$jsBridge) {
                        this.$jsBridge.tradeLogin().then(() => {
                            this.cancelAction()
                        })
                    } else {
                        this.cancelAction()
                    }
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
                    orderId: this.info.tradeOrderId,
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

    .order-name {
        color: #2f2f2f;
        font-weight: 500;
        font-size: 15px;
        line-height: 21px;
    }

    .header-button {
        flex: 0 0 auto;
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
        .divide {
            margin: 8px 0;
            // height: 1px;
            border: 0.5px solid #efefef;
        }

        .ele {
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
}
</style>
