<template>
    <div class="order-detail">
        <section class="order-status">
            <section class="header" :class="[statusIcon === 'accept' ? 'wait' : statusIcon]">
                <multi-img :name="`icon-${statusIcon === 'accept' ? 'wait' : statusIcon}`" directory="common/orderStatus" />
                <span :class="[statusIcon === 'accept' ? 'wait' : statusIcon]">{{ orderInfo.orderStatus | orderStatusFilter }}</span>
            </section>
            <!-- 公募卖出 显示份额 -->
            <section class="center" v-if="isPublicRedeem">
                <span>{{ showRedeemQuantity }}{{ $t('trade.part') }}</span>
            </section>
            <section class="center" v-else>
                <span>{{ orderAmount | thousandsFilter }}</span>
                <span>{{ orderInfo.currency | currencyFilter }}</span>
            </section>
            <section class="footer" @click="goDetail">
                <P>
                    <span class="direct">{{ orderInfo.orderDirection | directionFilter }}</span>
                    <span>{{ orderInfo.productName }}</span>
                </P>
                <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
            </section>
        </section>
        <p v-if="showBondQuanityTip" class="order-supple-tip">{{ $t('orderDetailCols.bondQuanityTip') }}</p>
        <p v-if="showBillDelayTip" class="order-supple-tip">{{ $t('billDelayTip') }}</p>
        <p v-if="showRejectReason" class="reject-reason">{{ $t('orderRejectReason') }}{{ orderInfo.rejectReason }}</p>
        <section class="process" v-if="showTradeProcess">
            <trade-process :orderInfo="orderInfo"></trade-process>
        </section>
        <section class="status-list" v-if="isSettled || isPriced">
            <p class="title">{{ $t('orderDetailFields.confirmInfo') }}</p>
            <ul>
                <li v-for="(item, index) in confirmList" :key="index">
                    <span class="label">{{ item.label }}</span>
                    <span class="value">{{ item.key | valueFilter(orderInfo, item) }}</span>
                </li>
            </ul>
        </section>
        <section class="status-list">
            <p v-if="isSettled || isPriced" class="title">{{ $t('orderDetailFields.orderInfo') }}</p>
            <ul>
                <li v-for="(item, index) in orderList" :key="index" v-show="item.showConfig ? item.showConfig(orderInfo) : true">
                    <span class="label">{{ item.labelFormat ? item.labelFormat(orderInfo) : item.label }}</span>
                    <span class="value">{{ item.key | valueFilter(orderInfo, item) }}</span>
                </li>
            </ul>
        </section>
        <section class="cash-box__tip" v-if="$parent.isCashBox || $parent.isPublicFund">
            <p>{{ $t('orderDetailCols.cashOrderDesc') }}</p>
        </section>
    </div>
</template>
<script>
import TradeProcess from '@/components/TradeProcess.vue'
import { thousandsFilter } from '@/config/filters.js'
import { ORDER_STATUS_MAP, PRODUCT_TYPE_MAP, CURRENCY_MAP, ORDER_DIRECTION_MAP } from '@/views/fund/config/common'
import { i18n } from '@/i18n/fund/index'

const directionMap = {
    1: i18n.t('trade.buy'),
    2: i18n.t('trade.sell'),
}

export default {
    name: 'orderDetail',
    props: {
        orderInfo: {
            type: Object,
            default: () => ({}),
            required: true,
        },
        confirmColumns: {
            type: Array,
            default: () => [], // { key: '', label: '' }
            required: true,
        },
        orderColumns: {
            type: Array,
            default: () => [], // { key: '', label: '' }
            required: true,
        },
    },
    components: {
        TradeProcess,
    },
    filters: {
        directionFilter(v) {
            return directionMap[v]
        },
        thousandsFilter,
        currencyFilter(v) {
            return CURRENCY_MAP.keyValueMap[v] || ''
        },
        valueFilter(k, data, item) {
            let v = data[k]
            if (item.filter) {
                v = item.filter(v, data)
            }
            if ([null, undefined, '', NaN].includes(v)) {
                v = '--'
            }
            return v
        },
        orderStatusFilter(v) {
            return ORDER_STATUS_MAP.options.findLabel(v, '--')
        },
    },
    data() {
        return {}
    },
    computed: {
        // 是公募卖出
        isPublicRedeem() {
            return this.$parent.isPublicFund && this.orderInfo?.orderDirection === ORDER_DIRECTION_MAP.keysMap.REDEEM
        },
        // 公募卖出份额
        showRedeemQuantity() {
            let quantity = ''
            if (this.isPublicRedeem) {
                quantity = this.isSettled || this.isPriced ? this.orderInfo.filledQuantity : this.orderInfo.applyQuantity
            }
            return quantity ? thousandsFilter(quantity) : '--'
        },
        confirmList() {
            return this.confirmColumns
        },
        orderList() {
            return this.orderColumns.map(i => {
                if (i.getLabel && typeof i.getLabel === 'function') {
                    i.label = i.getLabel(this.orderInfo)
                }
                return i
            })
        },
        statusIcon() {
            const { orderStatus } = this.orderInfo
            const { keysMap } = ORDER_STATUS_MAP
            if ([keysMap.CREATING, keysMap.SUBMITTED].includes(orderStatus)) return 'wait'

            if (orderStatus === keysMap.SETTLED) return 'success'
            if ([keysMap.PRICED, keysMap.DEDUCTED, keysMap.PROCESSING].includes(orderStatus)) return 'accept'
            if (orderStatus === keysMap.REJECTED) return 'fail'
            if (orderStatus === keysMap.CANCELLED) return 'cancel'
            return 'wait'
        },
        orderAmount() {
            if (this.isSettled || this.isPriced) return this.orderInfo.filledGrossAmount
            return this.orderInfo.applyGrossAmount
        },
        // 是否是“已完成”状态
        isSettled() {
            return this.orderInfo?.orderStatus === ORDER_STATUS_MAP.keysMap.SETTLED
        },
        // 是否为“确认份额”状态
        isPriced() {
            return this.orderInfo?.orderStatus === ORDER_STATUS_MAP.keysMap.PRICED
        },
        // “债券”买入订单需要增加用户提示
        showBondQuanityTip() {
            return this.$parent.isBond && this.isPriced && this.orderInfo?.orderDirection === ORDER_DIRECTION_MAP.keysMap.SUBSCRIBE
        },
        // 票据 确认份额提醒延迟显示
        showBillDelayTip() {
            return this.$parent.isBill && this.orderInfo?.orderStatus === ORDER_STATUS_MAP.keysMap.PRICED
        },
        // 票据 显示被拒绝原因
        showRejectReason() {
            return this.$parent.isBill && this.orderInfo?.orderStatus === ORDER_STATUS_MAP.keysMap.REJECTED
        },
        // 显示交易进度
        showTradeProcess() {
            const { CREATING, SUBMITTED, PROCESSING, PRICED, SETTLED } = ORDER_STATUS_MAP.keysMap
            // 待受理 已受理 等待处理 已确认份额 已完成
            return (
                CREATING === this.orderInfo?.orderStatus ||
                ((this.$parent.isPublicFund || this.$parent.isCashBox) &&
                    [SUBMITTED, PROCESSING, PRICED, SETTLED].includes(this.orderInfo?.orderStatus))
            )
        },
    },
    methods: {
        goDetail() {
            const { productType, productSymbol } = this.orderInfo
            const goPage = v =>
                this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(v), title: '' }) : (location.href = this.$addCurParamsForUrl(v))
            let url = ''
            switch (productType) {
                case PRODUCT_TYPE_MAP.keysMap.PRIVATE:
                    url = `${location.origin}/wealth/fund.html#/detail?type=private&symbol=${productSymbol}`
                    break
                case PRODUCT_TYPE_MAP.keysMap.CASHBOX: // eslint-disable-line
                    url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${productSymbol}`
                    break
                case PRODUCT_TYPE_MAP.keysMap.PUBLIC: // eslint-disable-line
                    url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${productSymbol}`
                    break
                case PRODUCT_TYPE_MAP.keysMap.BOND:
                    url = `${location.origin}/wealth/fund.html#/bond-detail?symbol=${productSymbol}`
                    break
                case PRODUCT_TYPE_MAP.keysMap.BILL:
                    url = `${location.origin}/wealth/fund.html#/bills/detail?symbol=${encodeURIComponent(productSymbol)}`
                    break
                default:
                    break
            }
            goPage(url)
        },
    },
}
</script>

<style scoped lang="less">
.order-detail {
    height: 100%;
    padding: 0 12px;
    overflow: auto;
}

.mg-b12 {
    margin-bottom: 12px;
}

.order-status {
    padding: 0 12px;
    background: #fff;
    border-radius: 8px;
    .mg-b12();

    .header {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px 0 10px;

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

    .center {
        padding-bottom: 10px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 22px;
        line-height: 31px;
        text-align: center;
    }

    .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        color: #666;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        background: #fff;
        box-shadow: inset 0 0.5px 0 #efefef;

        p {
            .direct {
                display: inline-block;
                margin-right: 4px;
                padding: 0 4px;
                color: #666;
                font-weight: 400;
                font-size: 10px;
                line-height: 14px;
                background-color: #f9f9f9;
            }
        }

        .next {
            width: 12px;
            height: 12px;
        }
    }
}

.order-supple-tip {
    margin: 12px 0 16px;
    color: #9c9c9c;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
}

.reject-reason {
    margin: 12px 0 16px;
    padding: 0 5px;
    color: #f31414;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
}

.process {
    margin-bottom: 12px;
    padding: 16px 28px;
    background: #fff;
    border-radius: 8px;
}

.status-list {
    .mg-b12();

    padding: 8px 12px;
    background: #fff;
    border-radius: 8px;

    .title {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    ul {
        li {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            .label {
                flex: 0 0 110px;
                color: #666;
                text-align: left;
            }

            .value {
                flex: 1;
                color: #1f1f1f;
                text-align: right;
            }
        }
    }
}

.cash-box__tip {
    color: #9c9c9c;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
}
</style>
