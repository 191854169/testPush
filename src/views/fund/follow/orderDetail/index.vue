<template>
    <div class="order-detail" v-show="!isLoading">
        <section class="header">
            <div class="order-name border-bottom-1px" @click="goFollowDetail">
                <div class="left">
                    <span class="product-name line-elipsis">{{ orderInfo.productName }}</span>
                    <portfolio-tag :portfolioType="portfolio"></portfolio-tag>
                    <multi-img name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
                </div>
                <div class="info-row__status">
                    <multi-img
                        v-if="orderInfo.tradeStatus"
                        :name="tradeStatusIconMap[orderInfo.tradeStatus]"
                        directory="common/orderStatus"
                    ></multi-img>
                    <span :class="tradeStatusTextMap[orderInfo.tradeStatus]">{{ orderInfo.tradeStatus | tradeStatusTextFilter(orderInfo) }}</span>
                </div>
            </div>
            <div class="order-basic-info">
                <div class="info-row" v-for="(item, index) in orderInfo.buyInfoEstimate" :key="index">
                    <span>{{ index == 0 ? $t('follow.estimateBuy') : '' }}</span>
                    <span>{{ item.amount | amountFilter }}{{ item.currency | currencyFilter }}</span>
                </div>
                <div v-if="orderInfo.tradeStatus == 20">
                    <div class="info-row" v-for="(item, index) in orderInfo.buyInfoActual" :key="index">
                        <span>{{ index == 0 ? $t('follow.actuallyBuy') : '' }}</span>
                        <span>{{ item.amount | amountFilter }}{{ item.currency | currencyFilter }}</span>
                    </div>
                </div>
                <div class="info-row">
                    <span>{{ $t('orderDetailCols.submitTime') }}</span>
                    <span>{{ orderInfo.submitTime | timeFilter }}</span>
                </div>

                <div class="info-row">
                    <span>{{ $t('orderDetailCols.orderWay') }}</span>
                    <span>{{ orderInfo.simulated | orderWayFilter }}</span>
                </div>

                <div class="info-row">
                    <span>{{ $t('orderDetailCols.orderSource') }}</span>
                    <div class="order-source" @click="goFollowDetail">
                        <span>{{ orderInfo.orderSource || '--' }}</span>
                        <multi-img class="arrow" name="icon-right-arrow" directory="common"></multi-img>
                    </div>
                </div>
            </div>
        </section>
        <section class="order-list">
            <template v-if="isFundTrade">
                <fund-order-info
                    class="list-item"
                    v-for="(item, index) in orderRecords"
                    :key="index"
                    :info="item"
                    @recall="recallHandler"
                ></fund-order-info>
            </template>
            <template v-else>
                <stock-order-info
                    class="list-item"
                    v-for="(item, index) in orderRecords"
                    :key="index"
                    :info="item"
                    @recall="recallHandler"
                ></stock-order-info>
            </template>
        </section>
    </div>
</template>
<script>
import stockOrderInfo from './stockOrderInfo.vue'
import fundOrderInfo from './fundOrderInfo.vue'
import portfolioTag from '../components/portfolioTag.vue'
import { getPortfolioOrderDetail } from '@/apis/followInvest'
import { isEmpty, keepDecimals } from '@/utils'
import { thousandsFilter } from '@/config/filters'
import { FOLLOW_TRADE_STATUS_MAP, PORTFOLIO_TYPE_MAP, CURRENCY_MAP } from '@/views/fund/config/common'
import dayjs from 'dayjs'
import { i18n } from '@/i18n/fund'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'

const $t = text => i18n.t(text)

const tradeStatusIconMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: 'icon-wait',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: 'icon-success',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: 'icon-error',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: 'icon-error',
}

const tradeStatusTextMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: 'status_text_wait',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: 'status_text_success',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: 'status_text_error',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: 'status_text_error',
}

const tradeStatusKeyValueMap = FOLLOW_TRADE_STATUS_MAP.keyValueMap
const tradeStatusTextCommonMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.wait],
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.success],
}
const currencyKeyValueMap = CURRENCY_MAP.keyValueMap

export default {
    name: 'orderDetail',
    mixins: [gotoFollowDetailsMixin],
    components: {
        portfolioTag,
        stockOrderInfo,
        fundOrderInfo,
    },
    filters: {
        amountFilter(v, base = 2) {
            return v ? thousandsFilter(keepDecimals(v, base)) : '--'
        },
        timeFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
        },
        orderWayFilter(v) {
            return (
                {
                    1: $t('simulation.page'),
                    10: $t('follow.quitBuy'),
                }[v] || '--'
            )
        },
        tradeStatusTextFilter(v, info = {}) {
            const commonMap = tradeStatusTextCommonMap
            let typeMap = {}
            if (info.productType === 3) {
                // 基金 撤单/终止
                typeMap = {
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: $t('follow.cancelEnding'),
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: $t('follow.cancelEnding'),
                }
            } else {
                // 股票 撤单/失败
                typeMap = {
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: $t('follow.cancelFail'),
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: $t('follow.cancelFail'),
                }
            }
            return { ...commonMap, ...typeMap }[v] || '--'
        },
        currencyFilter(v) {
            return v ? currencyKeyValueMap[v] || '' : ''
        },
    },
    props: {},
    data() {
        return {
            isLoading: false,
            tradeStatusIconMap,
            tradeStatusTextMap,
            orderId: this.$route.query.id || '',
            orderInfo: {},
        }
    },
    computed: {
        showOrderTypeText() {
            return [PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK, PORTFOLIO_TYPE_MAP.keysMap.US_STOCK].includes(this.orderInfo.productType)
        },
        isFundTrade() {
            return this.orderInfo.portfolioType === 3
        },
        orderRecords() {
            return this.orderInfo?.records || []
        },
        isNoEmptyOrderInfo() {
            return !isEmpty(this.orderInfo)
        },
        portfolio() {
            return this.orderInfo.portfolioType
        },
        records() {
            return this.isNoEmptyOrderInfo ? this.orderInfo.records : []
        },
    },
    async mounted() {
        this.$jsBridge?.enabelPageRefreshFunction()
        await this.getOrderDetail()
        console.log('tradeStatusTextMap', this.tradeStatusTextMap)
    },
    methods: {
        async getOrderDetail() {
            try {
                this.isLoading = true
                this.$loading.show = true
                const { result } = await getPortfolioOrderDetail({ orderId: Number(this.orderId) })
                this.orderInfo = result || {}
            } catch (e) {
                console.log('getPortfolioOrderDetail===>e:', e)
            } finally {
                this.$loading.show = false
                this.isLoading = false
            }
        },
        // 基金撤单
        async recallHandler() {
            console.log('基金撤单完成')
            this.orderInfo = {}
            await this.getOrderDetail()
        },
        // 去跟投详情
        goFollowDetail() {
            const portfolioId = this.orderInfo.portfolioId
            console.log('info.portfolioId', portfolioId)
            this.gotoFollowDetail(portfolioId)
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

        &__status {
            display: flex;
            align-items: center;

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
