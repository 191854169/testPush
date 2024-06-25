<template>
    <div class="table-item">
        <p :class="{ rise: isRise, fall: !isRise }">{{ row.sourceType | sourceTypeFilter }}{{ row.orderDirection | orderDirectionFilter }}</p>
        <p>
            <span class="left">
                <span class="type">
                    <span class="f10">{{ row.productType | productTypeFilter }}</span>
                </span>
                <span class="line-elipsis" :class="{ 'w-176': !isCashBox, 'w-166': isCashBox }">{{ row.productName }}</span>
            </span>
            <span class="right" v-if="showQuantity">
                <span class="amount" ref="dom">{{ showRedeemQuantity }}</span>
                <span>{{ this.$t('trade.part') }}</span>
            </span>
            <span class="right" ref="dom" v-else>
                <span class="amount">{{ row | checkGrossAmount | thousandFilter }}</span>
                <span class="currency">{{ row.currency | currencyFilter }}</span>
            </span>
        </p>
        <p>
            <span>{{ row.submitTime | dateFormat }}</span>
            <span>{{ row.orderStatus | statusFilter }}</span>
        </p>
    </div>
</template>
<script>
import { thousandsFilter } from '@/config/filters.js'
import { ORDER_STATUS_MAP, SOURCE_TYPE_MAP, CURRENCY_MAP, PRODUCT_TYPE_MAP, ORDER_DIRECTION_MAP } from '@/views/fund/config/common'
import dayjs from 'dayjs'
import { i18n } from '@/i18n/fund/index.js'
import { keepDecimals, dynamicFontSize } from '@/utils'

const cuurencyMap = CURRENCY_MAP.keyValueMap
const sourceTypeKeysMap = SOURCE_TYPE_MAP.keysMap

const orderDirectionKeyValueMap = ORDER_DIRECTION_MAP.keyValueMap
const orderDirectionKeysMap = ORDER_DIRECTION_MAP.keysMap
const productKeyMap = PRODUCT_TYPE_MAP.keysMap
const productTypeMap = {
    [productKeyMap.PUBLIC]: i18n.t('publicFund'),
    [productKeyMap.PRIVATE]: i18n.t('privateFund'),
    [productKeyMap.BOND]: i18n.t('bond'),
    [productKeyMap.BILL]: i18n.t('note'),
    [productKeyMap.OHTER]: i18n.t('alterInvestment'),
    [productKeyMap.CASHBOX]: i18n.t('cashBox'),
}

export default {
    name: 'tableItem',
    props: {
        row: {
            type: Object,
            default: () => ({}),
        },
    },
    filters: {
        productTypeFilter(v) {
            return productTypeMap[v] || ''
        },
        // 检查总金额
        checkGrossAmount(item) {
            const { keysMap } = ORDER_STATUS_MAP
            // 已完成  || 已确认份额   返回filledGrossAmount
            return item.orderStatus === keysMap.SETTLED || item.orderStatus === keysMap.PRICED ? item.filledGrossAmount : item.applyGrossAmount
        },
        // 来源类型
        sourceTypeFilter(v) {
            return v === +sourceTypeKeysMap.AUTO ? i18n.t('auto') : ''
        },
        orderDirectionFilter(v) {
            return v ? orderDirectionKeyValueMap[v] : ''
        },
        dateFormat(v) {
            return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
        },
        statusFilter(v) {
            return ORDER_STATUS_MAP.options.findLabel(v)
        },
        thousandFilter(num) {
            if (num == '') {
                return '--'
            }
            return thousandsFilter(num)
        },
        currencyFilter(v) {
            if (v) {
                return cuurencyMap[v]
            }
            return ''
        },
    },
    data() {
        return {
            options: {
                minFontSize: 12,
                maxFontSize: 14,
                interval: 1,
            },
        }
    },
    computed: {
        // 展示份额 公募私募卖出
        showQuantity() {
            return [productKeyMap.PUBLIC, productKeyMap.PRIVATE].includes(this.row.productType) && this.row.orderDirection === 2
        },
        // 卖出份额显示
        showRedeemQuantity() {
            let quantity = ''
            if (this.showQuantity) {
                const isSettled = this.row?.orderStatus === ORDER_STATUS_MAP.keysMap.SETTLED // 已完成
                const isPriced = this.row?.orderStatus === ORDER_STATUS_MAP.keysMap.PRICED // 确认份额
                quantity = isSettled || isPriced ? this.row.filledQuantity : this.row.applyQuantity
            }
            return quantity ? thousandsFilter([productKeyMap.PUBLIC].includes(this.row.productType) ? quantity : keepDecimals(quantity, 4)) : '--'
        },
        // 买入，自动买入为 涨 的颜色
        isRise() {
            return [orderDirectionKeysMap.SUBSCRIBE, orderDirectionKeysMap.AUTO_SUBSCRIBE].includes(this.row.orderDirection)
        },
        // 星财宝
        isCashBox() {
            return this.row.productType === productKeyMap.CASHBOX
        },
    },
    watch: {
        row: {
            handler() {
                if (this._isMounted) {
                    this.$refs['dom'].style.fontSize = '0.14rem'
                    dynamicFontSize({ ...this.options, dom: 'dom', context: this })
                }
            },
            deep: true,
        },
    },
    mounted() {
        dynamicFontSize({ ...this.options, dom: 'dom', context: this })
    },
    methods: {},
}
</script>
<style scoped lang="less">
.w-176 {
    width: 176px;
}

.w-166 {
    width: 166px;
}

.table-item {
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    box-shadow: inset 0 -0.5px 0 #efefef;

    p {
        display: flex;
        flex: 1;
        justify-content: space-between;
    }

    p:first-of-type {
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
    }

    p:nth-of-type(2) {
        display: flex;
        align-items: center;
        padding: 4px 0;
        color: #2f2f2f;
        font-size: 14px;
        line-height: 20px;

        span {
            vertical-align: middle;
        }

        .left {
            // flex: 1;
            display: flex;
            align-items: center;
            // max-width: 199px;
            white-space: nowrap;
            text-align: left;

            span:nth-of-type(2) {
                flex: 1;
            }
        }

        .right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 127px;
            text-align: right;
            word-break: break-all;

            .amount {
                display: inline-block;
                width: 97px;
                white-space: nowrap;
            }

            .currency {
                flex-shrink: 0;
            }
        }

        .type {
            margin-right: 6px;
            padding: 0 0 1px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 10px;
            line-height: 13px;
            text-align: center;
            border: 0.5px solid #9c9c9c;
            border-radius: 2px;

            span {
                display: inline-block;
            }
        }
    }

    p:nth-of-type(3) {
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }
}
</style>
