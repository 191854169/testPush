<!--
 * @Description: 个人主页、实盘交易记录小卡片
-->
<template>
    <div class="card" v-if="list.length != 0">
        <div class="title-container" @click="gotoOrderRecordPage">
            <span class="title">{{ $t('customerDetail.realOrderRecond') }}</span>
            <multi-img class="arrow" name="icon-right-arrow" directory="common"></multi-img>
        </div>
        <div class="list-title">
            <span class="list-title-direction-status">{{ $t('follow.directionStatus') }}</span>
            <span class="list-title-combination-name">{{ $t('follow.combinationName') }}</span>
            <span class="list-title-amount">{{ $t('follow.amount') }}</span>
        </div>

        <div class="list">
            <div class="list-item" v-for="(item, index) in list.slice(0, 2)" :key="`${index}_${item.id}`" @click="listClickHander(item)">
                <div class="direction-status-content">
                    <p class="opt-type">{{ item.optType | optTypeFilter }}</p>
                    <p class="order-status">
                        <multi-img
                            v-if="tradeStatusIconMap[item.tradeStatus]"
                            :name="tradeStatusIconMap[item.tradeStatus]"
                            directory="common/orderStatus"
                        ></multi-img>
                        <span>{{ item.tradeStatus | tradeStatusTextFilter(item) }}</span>
                    </p>
                </div>

                <div class="combination-name line-elipsis">{{ item.portfolioName }}</div>

                <div class="amount-content">
                    <div class="row" v-for="(buyInfoItem, index) in item.estimateBuyInfo" :key="`${index}_estimateBuyInfo`">
                        <dynamic-font
                            class="amount"
                            :value="formatAmountWithCurrency(buyInfoItem.amount, buyInfoItem.currency)"
                            :options="{ maxFontSize: 14, minFontSize: 10 }"
                        ></dynamic-font>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import DynamicFont from '@/components/FosunDynamicFont.vue'
import { getPortfolioOrders } from '@/apis/followInvest/index.js'
import { i18n } from '@/i18n/fund'
import { FOLLOW_TRADE_STATUS_MAP } from '@/views/fund/config/common'
import { keepDecimals } from '@/utils'
import { thousandsFilter } from '@/config/filters'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'

const $t = text => i18n.t(text)

const tradeStatusKeyValueMap = FOLLOW_TRADE_STATUS_MAP.keyValueMap
const tradeStatusTextCommonMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.wait],
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.success],
}

const tradeStatusIconMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: 'icon-wait',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: 'icon-success',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: 'icon-error',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: 'icon-error',
}

export default {
    name: 'real-order-records-card',
    mixins: [watchPageVisibleMixin],
    components: {
        DynamicFont,
    },
    data() {
        return {
            list: [
                // {
                //     id: 1,
                //     portfolioId: 12221,
                //     portfolioName: '港股策略112',
                //     portfolioType: 1,
                //     optType: 1,
                //     estimateBuyAmount: '12345.67',
                //     estimateBuyInfo: [
                //         {
                //             amount: '89405.00',
                //             currency: 'HKD',
                //         },
                //     ],
                //     currency: 'HKD',
                //     tradeStatus: 10,
                //     submitTime: 1675701314916,
                // },
                // {
                //     id: 2,
                //     portfolioId: 12222,
                //     portfolioName: '港股策略112',
                //     portfolioType: 1,
                //     optType: 1,
                //     estimateBuyAmount: '1111111112345.67',
                //     estimateBuyInfo: [
                //         {
                //             amount: '89405.00',
                //             currency: 'HKD',
                //         },
                //         {
                //             amount: '9405.00',
                //             currency: 'USD',
                //         },
                //     ],
                //     currency: 'HKD',
                //     tradeStatus: 90,
                //     submitTime: 1675701314916,
                // },
            ],
            tradeStatusIconMap,
        }
    },
    computed: {
        hasMoreOrder() {
            return this.list.length > 2
        },
    },
    filters: {
        optTypeFilter(v) {
            // 买入/卖出  1：买，2：卖
            return (
                {
                    1: $t('subscribe'),
                    2: $t('redeem'),
                }[v] || '--'
            )
        },
        tradeStatusTextFilter(v, info = {}) {
            const commonMap = tradeStatusTextCommonMap
            let typeMap = {}
            if (info.portfolioType === 3) {
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
            return (
                {
                    HKD: $t('HKD'),
                    USD: $t('USD'),
                    CNH: $t('yuan'),
                    CNY: $t('yuan'),
                    EUR: $t('EUR'),
                }[v] || '--'
            )
        },
        amountFilter(v, base = 2) {
            return v ? thousandsFilter(keepDecimals(v, base)) : '--'
        },
    },
    mounted() {
        this.watch(() => {
            this.getPortfolioOrders()
        })
    },
    created() {
        this.getPortfolioOrders()
    },
    methods: {
        gotoOrderRecordPage() {
            if (this.$jsBridge) {
                const url = `${location.origin}${location.pathname}#/follow-order-records?type=${0}`
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/follow-order-records',
                    query: {
                        type: 0,
                    },
                })
            }
        },
        listClickHander(rowData) {
            const id = rowData.id
            const url = `${location.origin}/wealth/fund.html#/follow-order-detail?id=${id}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/follow-order-detail',
                    query: {
                        id,
                    },
                })
            }
        },

        formatAmountWithCurrency(amount, currency) {
            const formattedAmount = this.$options.filters.amountFilter(amount)
            return `${formattedAmount} ${currency}`
        },

        async getPortfolioOrders() {
            try {
                const params = {
                    type: 0, // 0 全部
                    submitTimeBegin: new Date(2022, 0, 1).valueOf(),
                    submitTimeEnd: new Date().valueOf(),
                    count: 3,
                }
                console.log('getPortfolioOrders-params:', params)
                const { result } = await getPortfolioOrders(params)
                this.list = result.records || []
            } catch (e) {
                console.log('getPortfolioOrders===>e:', e)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.card {
    padding-top: 8px;
    background-color: #fff;
    border-radius: 8px;
}

.title-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 36;
    padding: 7px 12px;

    .title {
        color: #2f2f2f;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
    }

    .arrow {
        width: 12px;
        height: 12px;
    }
}

.list-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 28px;
    padding: 0 12px;

    span {
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
    }

    &-direction-status {
        width: 80px;
    }

    &-combination-name {
        width: 120px;
        margin-left: 12px;
    }

    &-amount {
        width: 110px;
        margin-left: 12px;
        text-align: right;
    }
}

.list-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 64px;
    margin: 0 12px;
    border-bottom: 0.5px solid #efefef;

    &:last-child {
        border-bottom: none;
    }

    .direction-status-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 80px;

        .opt-type {
            margin-bottom: 2px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        .order-status {
            display: flex;
            align-items: center;
            color: #9c9c9c;
            font-weight: 500;
            font-size: 12px;
            line-height: 16px;

            img {
                width: 12px;
                height: 12px;
                margin-right: 3px;
            }
        }
    }

    .combination-name {
        width: 120px;
        margin-left: 12px;
        color: #2f2f2f;
        font-size: 15px;
        line-height: 21px;
    }
}

.amount-content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 110px; /* 指定宽度为 110px */
    margin-left: 12px;
    font-size: 14px;

    .row {
        display: flex;
        align-items: center;
        height: 20px;

        .amount {
            white-space: nowrap;
        }
    }
}
</style>
