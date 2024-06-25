// 交易进度
<template>
    <ul class="trade-process">
        <li class="step">
            <div class="left">
                <div :class="[`circle-${statusMap.firstStep}`]"></div>
                <div :class="[`line-${statusMap.line}`]"></div>
            </div>
            <div v-if="orderStatus === orderStatusKeysMap.CREATING" class="right">
                <p class="title">{{ $t('orderCreating') }}</p>
                <p class="message">{{ $t('estimateCreatingTime') }}</p>
            </div>
            <div v-else class="right">
                <p class="title">{{ isBuy ? $t('confirmBuyQuantity') : $t('confirmSellAmount') }}</p>
                <p class="message">{{ statusMap.firstStep === 'success' ? '' : `${$t('estimate')} ` }}{{ timeMap?.startTime | dateFormat }}</p>
            </div>
        </li>
        <li class="step">
            <div class="left">
                <div :class="[`circle-${statusMap.secondStep}`]"></div>
            </div>
            <div v-if="orderStatus === orderStatusKeysMap.CREATING" class="right">
                <p class="title">{{ $t('submitted') }}</p>
            </div>
            <div v-else class="right">
                <p class="title">{{ isBuy ? $t('viewProfitAndLoss') : $t('capitalInto') }}</p>
                <p class="message" v-if="showEstSeven">{{ $t('estimate') }}{{ $t('numInWeekday', { num: 7 }) }}</p>
                <p class="message" v-else>{{ statusMap.secondStep === 'success' ? '' : `${$t('estimate')} ` }}{{ timeMap?.endTime | dateFormat }}</p>
            </div>
        </li>
    </ul>
</template>
<script>
import { ORDER_STATUS_MAP, PRODUCT_TYPE_MAP } from '@/views/fund/config/common'
import dayjs from 'dayjs'
const orderStatusKeysMap = ORDER_STATUS_MAP.keysMap
const productTypeKeysMap = PRODUCT_TYPE_MAP.keysMap
export default {
    name: 'tradeProcess',
    components: {},
    filters: {
        dateFormat(v) {
            return v ? dayjs(v).format('YYYY-MM-DD') : '--'
        },
    },
    props: {
        orderInfo: {
            // 订单信息
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            orderStatusKeysMap,
        }
    },
    computed: {
        orderDirection() {
            return this.orderInfo.orderDirection
        },
        orderStatus() {
            return this.orderInfo.orderStatus
        },
        productType() {
            return this.orderInfo.productType
        },
        isBuy() {
            return this.orderDirection === 1
        },
        isCashBox() {
            return this.productType === productTypeKeysMap.CASHBOX
        },
        // 实现预估7个工作日 卖出 & 非货基 + 未完成
        showEstSeven() {
            return !this.isBuy && !this.isCashBox && this.orderStatus !== orderStatusKeysMap.SETTLED
        },
        statusMap() {
            const firstStep =
                {
                    [orderStatusKeysMap.CREATING]: 'pending', // 处理中
                    [orderStatusKeysMap.SUBMITTED]: 'pending', // 待受理
                    [orderStatusKeysMap.PROCESSING]: 'pending', // 等待受理
                    [orderStatusKeysMap.PRICED]: 'success', // 已确认份额
                    [orderStatusKeysMap.SETTLED]: 'success', // 已完成
                }[this.orderStatus] || ''
            const secondStep =
                {
                    [orderStatusKeysMap.CREATING]: 'none', // 待受理
                    [orderStatusKeysMap.SUBMITTED]: 'none', // 待受理
                    [orderStatusKeysMap.PROCESSING]: 'none', // 等待受理
                    [orderStatusKeysMap.PRICED]: 'pending', // 已确认份额
                    [orderStatusKeysMap.SETTLED]: 'success', // 已完成
                }[this.orderStatus] || ''

            const maps = {
                firstStep,
                secondStep,
                line: secondStep,
            }
            return maps
        },
        // 预计时间
        timeMap() {
            return {
                startTime: this.orderInfo?.timeLineConfirmDate ?? '',
                endTime: (this.isBuy ? this.orderInfo?.timeLineProfitLossDate : this.orderInfo?.timeLineArrivalDate) ?? '',
            }
        },
    },
    methods: {},
}
</script>
<style scoped lang="less">
.trade-process {
    display: flex;
    flex-direction: column;

    .step {
        display: flex;
        margin-bottom: 20px;

        .left {
            position: relative;
            margin-top: 2px;

            .circle {
                width: 10px;
                height: 10px;
                background-color: #fff;
                border: 2px solid #ff6907;
                border-radius: 50%;
            }

            .circle-none {
                width: 16px;
                height: 16px;
                background-color: #fff;
                border: 1.5px solid #dcdcdc;
                border-radius: 50%;
            }

            .circle-pending {
                width: 16px;
                height: 16px;
                background-color: #ff6907;
                border: 4px solid #ffe1cd;
                border-radius: 50%;
            }

            .circle-success {
                width: 16px;
                height: 16px;
                background: url('~@/assets/images/common/process-success@3x.png') center no-repeat;
                background-size: 100%;
                border-radius: 50%;
            }

            .line-none {
                position: absolute;
                top: 20px;
                left: 7px;
                width: 2px;
                height: 36px;
                background-image: linear-gradient(to bottom, #dcdcdc 0%, #dcdcdc 50%, transparent 50%);
                background-repeat: repeat-y;
                background-size: 2px 8px;
                transform: scaleX(0.7);
            }

            .line-pending {
                position: absolute;
                top: 20px;
                left: 7px;
                width: 2px;
                height: 36px;
                background-image: linear-gradient(to bottom, #ff6907 0%, #ff6907 50%, transparent 50%);
                background-repeat: repeat-y;
                background-size: 2px 8px;
                transform: scaleX(0.7);
            }

            .line-success {
                position: absolute;
                top: 20px;
                left: 7px;
                width: 2px;
                height: 36px;
                background-color: #ff6907;
                transform: scaleX(0.7);
            }
        }

        .right {
            margin-left: 20px;

            .title {
                margin-bottom: 4px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 14px;
                line-height: 20px;
            }

            .message {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .step:last-of-type {
        margin-bottom: 0;
    }
}
</style>
