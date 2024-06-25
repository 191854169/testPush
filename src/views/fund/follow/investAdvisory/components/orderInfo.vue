<template>
    <div class="stock-order-info" :class="{ 'cash-padding': isCash }">
        <header v-if="!isCash">
            <div v-if="isStock" class="header-stock">
                <p class="order-name line-elipsis">
                    <span>{{ info.productName ?? '--' }}</span>
                    <span>{{ getSymbol(info) }}</span>
                </p>
            </div>
            <div v-else class="header-fund">
                <span class="order-name line-elipsis">{{ info.productName }}</span>
                <div class="fund-info">
                    <div :class="`currency-${currencyType}`"></div>
                    <span class="fund-isin">{{ info.symbol }}</span>
                </div>
            </div>
        </header>
        <ul class="order-info__list">
            <li v-for="(item, index) in rowList" :key="index">
                <div v-if="item.key == 'divide'" class="divide"></div>
                <div v-else class="ele" :class="{ 'cash-left': isCash }" v-show="!item.hidden">
                    <span>{{ item.label }}</span>
                    <span>{{ item.filter(info[item.key]) }}</span>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
import { thousandsFilter } from '@/config/filters'
import { keepDecimals } from '@/utils'
import { TG_ORDER_STATUS_MAP, CURRENCY_MAP } from '@/views/fund/config/common'
import { orderRowList } from '../utils/order-utils'

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
        productType: {
            type: Number,
            default: 1,
        },
    },
    filters: {},
    data() {
        return {}
    },
    computed: {
        isStock() {
            return this.productType === 1
        },
        isFund() {
            return this.productType === 2
        },
        isBond() {
            return this.productType === 3
        },
        isCash() {
            return this.productType === 4
        },

        // 是否确认订单
        isConfigOrder() {
            // 已确认份额 ： 5、已完成： 7
            return [
                TG_ORDER_STATUS_MAP.keysMap.confirmShare,
                TG_ORDER_STATUS_MAP.keysMap.finish,
                TG_ORDER_STATUS_MAP.keysMap.complete,
                TG_ORDER_STATUS_MAP.keysMap.settlement,
                TG_ORDER_STATUS_MAP.keysMap.allDone,
            ].includes(this.info.orderStatus)
        },
        currencyType() {
            const map = { 1: 'HKD', 2: 'USD', 3: 'CNH' }
            return map[this.info.currency ?? 1] ?? 'HKD'
        },
        currency() {
            return currencyFilter(this.currencyType)
        },
        rowList() {
            return orderRowList(this.productType, amountFilter, {
                isConfigOrder: this.isConfigOrder,
                currency: this.currency,
                orderType: this.info.orderType,
            })
        },
    },
    methods: {
        getSymbol(info) {
            if (info.symbol) {
                return '(' + info.symbol + ')'
            }
            return ''
        },
    },
}
</script>
<style scoped lang="less">
.stock-order-info {
    padding: 16px 12px 0;
    background-color: #fff;
    border-radius: 8px;

    &.cash-padding {
        padding: 0 12px;
    }
}

header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-stock {
        .order-name {
            color: #2f2f2f;
            font-weight: 500;
            font-size: 15px;
            line-height: 21px;
        }
    }

    .header-fund {
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

            &.cash-left {
                span:first-of-type {
                    color: #2f2f2f;
                    font-weight: 400;
                    font-size: 15px;
                    line-height: 21px;
                }
            }
        }
    }
}
</style>
