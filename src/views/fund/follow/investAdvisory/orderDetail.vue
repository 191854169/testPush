<template>
    <div class="order-detail" v-show="!isLoading">
        <section class="header">
            <div class="order-name border-bottom-1px">
                <div class="left">
                    <span class="product-name line-elipsis">{{ orderInfo.portfolioName }}</span>
                    <portfolio-tag :portfolioType="portfolio" :tagObj="tagObj"></portfolio-tag>
                    <!-- <multi-img name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img> -->
                </div>
                <div class="right" v-if="!isAddtionalBuy(orderInfo)">
                    <multi-img
                        v-if="orderInfo.orderStatus"
                        :name="tradeStatusIconMap[orderInfo.orderStatus]"
                        directory="common/orderStatus"
                    ></multi-img>
                    <span :class="tradeStatusTextMap[orderInfo.orderStatus]">
                        {{ orderInfo.orderStatus | tradeStatusTextFilter }}
                    </span>
                </div>
            </div>
            <div class="order-basic-info">
                <div class="info-row" v-if="showFirstTransfer">
                    <span>{{ $t('investAdvisory.firstTransferAmount') }}</span>
                    <span>{{ orderInfo.firstTransferAmount | amountFilter }}{{ firstTransferCurrency | currencyFilter }}</span>
                </div>
                <div v-if="showClearance">
                    <div class="info-row" v-for="(item, index) in getClearanceItems(orderInfo)" :key="index + 'clear'">
                        <span>{{ index == 0 ? $t('investAdvisory.estimatedClearance') : '' }}</span>
                        <span>{{ item.amount | amountFilter }}{{ item.currency | currencyFilter }}</span>
                    </div>
                </div>
                <div class="info-row" v-for="(item, index) in getAmountItems(orderInfo)" :key="index + 'amount'">
                    <span>{{ index == 0 ? $t('orderDetailCols.applyGrossAmount') : '' }}</span>
                    <span>{{ item.amount | amountFilter }}{{ item.currency | currencyFilter }}</span>
                </div>
                <div class="info-row">
                    <span>{{ $t('orderDetailCols.submitTime') }}</span>
                    <span>{{ orderInfo.orderGenTime | timeFilter }}</span>
                </div>
                <div class="info-row">
                    <span>{{ $t('trade.orderNumber') }}</span>
                    <span>{{ orderInfo.customerOrderId ?? '--' }}</span>
                </div>
            </div>
        </section>
        <section class="order-list">
            <div v-for="(item, index) in orderRecords" :key="index">
                <orderInfo class="list-item" :info="item" :productType="item.productType || 1"></orderInfo>
            </div>
        </section>
    </div>
</template>

<script>
import orderInfo from './components/orderInfo.vue'
import portfolioTag from '../components/portfolioTag.vue'
import { keepDecimals } from '@/utils'
import { thousandsFilter } from '@/config/filters'
import { INVEST_ADVISORY_TRADE_STATUS_MAP, CURRENCY_MAP } from '@/views/fund/config/common'
import dayjs from 'dayjs'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'
import { investAdvisoryStatusIconMap, investAdvisoryStatusClassTextMap } from '../utils/followConfig.js'
import { getOrderDetail } from '@/apis/portfolioFollow'
import { getAmountItems } from './utils/order-utils.js'
import { tgProductTypeMap } from '../utils/filters'

const currencyKeyValueMap = CURRENCY_MAP.keyValueMap

export default {
    name: 'orderDetail',
    mixins: [gotoFollowDetailsMixin],
    components: {
        portfolioTag,
        orderInfo,
    },
    filters: {
        amountFilter(v, base = 2) {
            return v ? thousandsFilter(keepDecimals(v, base)) : '--'
        },
        timeFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
        },
        tradeStatusTextFilter(v) {
            return INVEST_ADVISORY_TRADE_STATUS_MAP.keyValueMap[v] || '--'
        },
        currencyFilter(v) {
            return v ? currencyKeyValueMap[v] || '' : ''
        },
    },
    props: {},
    data() {
        return {
            isLoading: false,
            orderId: this.$route.query.id || '',
            orderInfo: {},
            tradeStatusIconMap: investAdvisoryStatusIconMap,
            tradeStatusTextMap: investAdvisoryStatusClassTextMap,
            getAmountItems,
            tagObj: tgProductTypeMap.keyValueMap,
        }
    },
    computed: {
        firstTransferCurrency() {
            const map = { 1: 'HKD', 2: 'USD', 3: 'CNH' }
            return map[this.orderInfo?.firstTransferCurrency ?? 1] ?? 'HKD'
        },
        orderRecords() {
            const list = this.orderInfo?.productOrderList || []
            const cashList = []
            const otherList = []
            list.forEach(item => {
                if (item.productType === 4) {
                    //现金
                    cashList.push(item)
                } else {
                    otherList.push(item)
                }
            })
            return cashList.concat(otherList)
        },
        portfolio() {
            return this.orderInfo.market
        },
        showFirstTransfer() {
            return this.orderInfo.firstTransferAmount && this.orderInfo.firstTransferAmount.length > 0
        },
        showClearance() {
            // let canClear = false
            // if (this.orderInfo?.estimatedClearanceAmountHKD && this.orderInfo.estimatedClearanceAmountHKD.length > 0) {
            //     canClear = true
            // }

            // if (this.orderInfo?.estimatedClearanceAmountUSD && this.orderInfo.estimatedClearanceAmountUSD.length > 0) {
            //     canClear = true
            // }

            // if (this.orderInfo?.estimatedClearanceAmountCNH && this.orderInfo.estimatedClearanceAmountCNH.length > 0) {
            //     canClear = true
            // }
            //下单方式（1:客户买入2:客户赎回3:系统调仓4:中台下单5:追加买入6:转出资金7:客户清仓
            const isSell = this.orderInfo.placeType === 2 || this.orderInfo.placeType === 6
            return isSell
        },
    },
    mounted() {
        this.fetchData()
        console.log('tradeStatusTextMap', this.tradeStatusTextMap)
    },
    methods: {
        isAddtionalBuy(item) {
            //下单方式（1:客户买入2:客户赎回3:系统调仓4:中台下单5:追加买入6:转出资金7:客户清仓）
            return item.placeType === 5 //追加买入
        },

        async fetchData() {
            try {
                this.isLoading = true
                this.$loading.show = true
                const { result } = await getOrderDetail({ portfolioOrderId: Number(this.orderId) })
                this.orderInfo = result || {}
                if (this.orderInfo.productOrderList && this.orderInfo.productOrderList.length > 0) {
                    this.orderInfo.productOrderList.forEach(item => {
                        item.subAcctId = this.orderInfo.subAcctId
                        item.applyAccountId = this.orderInfo.applyAccountId
                    })
                }
            } catch (e) {
                console.log('getOrderDetail===>e:', e)
            } finally {
                this.$loading.show = false
                this.isLoading = false
            }
        },

        getClearanceItems(item) {
            const result = []
            if (item.estimatedClearanceAmountHKD && item.estimatedClearanceAmountHKD.length > 0) {
                result.push({ amount: item.estimatedClearanceAmountHKD, currency: 'HKD' })
            }
            if (item.estimatedClearanceAmountUSD && item.estimatedClearanceAmountUSD.length > 0) {
                result.push({ amount: item.estimatedClearanceAmountUSD, currency: 'USD' })
            }
            if (item.estimatedClearanceAmountCNH && item.estimatedClearanceAmountCNH.length > 0) {
                result.push({ amount: item.estimatedClearanceAmountCNH, currency: 'CNH' })
            }
            if (result.length === 0) {
                result.push({ amount: null, currency: null })
            }
            return result
        },
    },
}
</script>
<style scoped lang="less">
.order-detail {
    min-height: 100vh;
    padding: 12px;
}

.header {
    padding: 0 12px;
    background-color: #fff;
    border-radius: 8px;

    .order-name {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 13.5px 0;

        .left {
            display: flex;
            align-items: center;

            .product-name {
                flex-wrap: wrap;
                margin-right: 4px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 15px;
                line-height: 21px;
            }

            img {
                width: 12px;
                height: 12px;
                margin-left: 4px;
            }
        }

        .right {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #2f2f2f;
            font-weight: 700;
            font-size: 14px;
            line-height: 20px;

            img {
                width: 12px;
                height: 12px;
                margin-right: 3px;
                color: #9c9c9c;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .order-basic-info {
        padding: 14px 0 4px;
    }

    .status_text_wait {
        color: #2f9bff;
    }

    .status_text_error {
        color: #f31414;
    }

    .status_text_success {
        color: #3fbd55;
    }

    .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        color: #2f2f2f;
        font-weight: normal;
        font-size: 14px;
        line-height: 20px;

        .order-source {
            display: flex;
            align-items: center;

            .arrow {
                width: 12px;
                height: 12px;
                margin-left: 4px;
            }
        }
    }
}

.order-list {
    display: flex;
    flex-direction: column;
    margin: 12px 0;

    .list-item {
        margin-bottom: 12px;
    }
}
</style>
