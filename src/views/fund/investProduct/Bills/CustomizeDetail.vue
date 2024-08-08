<!--定制票据订单详情-->
<template>
    <div class="main-wrapper">
        <div class="pad-12 main-content" :class="{ 'limit-height': showBottomButton }">
            <div class="f16 lh-22 mar-b12 c-main bold" v-if="showListFlag">{{ $t('bills.customObjects') }}</div>
            <div class="pos-r bg-white pad-t22 pad-l12 border-radius-8px" :class="{ 'pad-b8': !isPending, 'pad-b22': isPending }">
                <div class="status flex-c" :class="`${tradeStatusIconMap[form.orderStatus]}`">
                    <multi-img
                        :name="tradeStatusIconMap[form.orderStatus] || 'icon-wait'"
                        directory="common/orderStatus"
                        width="12"
                        height="12"
                    ></multi-img>
                    <span class="mar-14 f14">{{ form.orderStatus | tradeStatusTextFilter }}</span>
                </div>
                <div class="flex-c" @click="handleProductClick(form.parentSymbol)">
                    <span class="f16 lh-22 bold">{{ form.parentProductName }}</span>
                    <multi-img name="icon-right-arrow" directory="common" width="12" height="12" class="mar-14"></multi-img>
                </div>
                <div class="flex-c mar-t16">
                    <!-- 意向买入金额 -->
                    <div class="w-123">
                        <div class="f12 lh-16 c-gray mar-b8">{{ $t('bills.intendedPurchaseAmount') }}</div>
                        <div class="lh-22 f16 c-main">{{ form.applyAmount | amountFilter }}{{ form.parentCurrency | currencyFilter }}</div>
                    </div>
                    <!-- 期望投资期限 -->
                    <div class="w-102">
                        <div class="f12 lh-16 c-gray mar-b8">{{ $t('bills.expectedInvestmentPeriod') }}</div>
                        <div class="lh-22 f16 c-main" v-if="form.productPeriodUnit === 2">
                            {{ this.$t('orderDetailFields.months', { num: form.productPeriod }) }}
                        </div>
                        <div class="lh-22 f16 c-main" v-else>{{ form.productPeriod }} {{ BILL_UNIT_MAP.keyValueMap[form.productPeriodUnit] }}</div>
                    </div>
                    <!-- 固定利率 期望年化利率 -->
                    <div v-if="form.parentIsFixed === 1">
                        <div class="f12 lh-16 c-gray mar-b8">{{ $t('bills.expectedRatio') }}</div>
                        <div class="lh-22 f16 c-theme">{{ form.parentYield }}%</div>
                    </div>
                    <!-- 浮动利率 -->
                    <div v-else>
                        <div class="f12 lh-16 c-gray mar-b8">{{ $t('bills.floatRateText') }}</div>
                        <div class="lh-22 f16 c-theme">{{ form.parentYieldMin }}% ~ {{ form.parentYieldMax }}%</div>
                    </div>
                </div>

                <div class="pad-t12 pad-r12" v-if="!isPending && !isRejected">
                    <div class="product-item flex-s">
                        <span class="f14 lh-20 h2-white">{{ $t('bills.submitTime') }}</span>
                        <span class="f14 lh-20 c-main">{{ form.submitTime | dateTimeFilter }}</span>
                    </div>
                    <div class="product-item flex-s">
                        <span class="f14 lh-20 h2-white">{{ $t('trade.orderNumber') }}</span>
                        <span class="f14 lh-20 c-main">{{ form.orderNumber }}</span>
                    </div>
                </div>
            </div>

            <div class="error-content" v-if="isRejected && form.rejectReason">{{ $t('bills.rejectionReasons') }} {{ form.rejectReason }}</div>

            <!-- 待处理或已驳回 -->
            <div class="bg-white pad-rl12 pad-tb4 border-radius-8px mar-t12" v-if="isPending || isRejected">
                <div class="product-item flex-s">
                    <span class="f14 lh-20 h2-white">{{ $t('bills.submitTime') }}</span>
                    <span class="f14 lh-20 c-main">{{ form.submitTime | dateTimeFilter }}</span>
                </div>
                <div class="product-item flex-s">
                    <span class="f14 lh-20 h2-white">{{ $t('trade.orderNumber') }}</span>
                    <span class="f14 lh-20 c-main">{{ form.orderNumber }}</span>
                </div>
            </div>

            <template v-if="showListFlag">
                <!-- 定制结果 -->
                <div class="f16 lh-22 mar-t20 mar-b12 c-main bold">{{ $t('bills.customizeResult') }}</div>
                <div class="bg-white pad-t20 pad-l12 border-radius-8px pad-b8">
                    <div class="flex-c" @click="handleProductClick(form.symbol)">
                        <span class="f16 lh-22 bold">{{ form.productName }}</span>
                        <multi-img name="icon-right-arrow" directory="common" width="12" height="12" class="mar-14"></multi-img>
                    </div>
                    <div class="flex-c mar-t16">
                        <div class="w-123">
                            <div class="f12 lh-16 c-gray mar-b8">{{ $t('bills.intendedPurchaseAmount') }}</div>
                            <div class="lh-22 f16 c-main">{{ form.applyAmount | amountFilter }}{{ form.currency | currencyFilter }}</div>
                        </div>
                        <!-- 到期日 -->
                        <div class="w-102">
                            <div class="f12 lh-16 c-gray mar-b8">{{ $t('bills.expiryDate') }}</div>
                            <div class="lh-22 f16 c-main">{{ form.maturityDate | dateFilter }}</div>
                        </div>
                        <div>
                            <div class="f12 lh-16 c-gray mar-b8">
                                <!-- 固定票据 年化利率 -->
                                <span v-if="isFixed">{{ $t('bills.annualizedYTM') }}</span>
                                <!-- 浮动票据 -->
                                <span v-else>{{ $t('bills.floatRateText') }}</span>
                            </div>
                            <div class="lh-22 f16 c-theme" v-if="isFixed">{{ form.productYield }}%</div>
                            <div class="lh-22 f16 c-theme" v-else>{{ form.productYieldMin }}% ~ {{ form.productYieldMax }}%</div>
                        </div>
                    </div>
                    <!-- 确认截至时间 -->
                    <div class="flex-s tips" @click="handlePrompt" v-if="isUnConfirm">
                        <span class="text">{{ $t('bills.confirmDeadline') }}：{{ form.confirmDeadline | dateTimeFilter }}</span>
                        <multi-img name="icon_prompt" directory="common" width="16" height="16"></multi-img>
                    </div>

                    <div class="pad-t12 pad-r12">
                        <!-- 发行人 -->
                        <div class="product-item flex-s">
                            <span class="f14 lh-20 h2-white">{{ $t('publisher') }}</span>
                            <span class="f14 lh-20 c-main">{{ form.issuer || '--' }}</span>
                        </div>
                        <!-- 担保人 -->
                        <div class="product-item flex-s">
                            <span class="f14 lh-20 h2-white">{{ $t('bills.guarantor') }}</span>
                            <span class="f14 lh-20 c-main">{{ form.surety || '--' }}</span>
                        </div>
                        <!-- 指定货币 -->
                        <div class="product-item flex-s" v-if="isFixed">
                            <span class="f14 lh-20 h2-white">{{ $t('bills.specifyCurrency') }}</span>
                            <span class="f14 lh-20 c-main">{{ form.currency | currencyFilter }}</span>
                        </div>
                        <!-- 产品到期交付日 -->
                        <div class="product-item flex-s">
                            <span class="f14 lh-20 h2-white">{{ $t('bills.expirationDeliveryDate') }}</span>
                            <span class="f14 lh-20 c-main align-r w-196">{{ form.deliveryDay || '--' }}</span>
                        </div>

                        <!-- 计息天数 flex-start-->
                        <div class="product-item flex-s" v-if="isFixed">
                            <span class="f14 lh-20 h2-white nowrap">{{ $t('bills.accrueDays') }}</span>
                            <span class="f14 lh-20 c-main align-r w-196">
                                <span>{{ form.needDates }}</span>
                                <!-- <span>{{ $t('day') }}</span> -->
                            </span>
                        </div>
                        <!-- 日计算分数 -->
                        <div class="product-item flex-s" v-if="!isFixed">
                            <span class="f14 lh-20 h2-white nowrap">{{ $t('bills.calculatDayScores') }}</span>
                            <span class="f14 lh-20 c-main align-r w-196">{{ form.dayScore || '--' }}</span>
                        </div>
                        <!-- 浮动利息 -->
                        <!-- <div class="product-item flex-s" v-if="!isFixed">
                            <span class="f14 lh-20 h2-white nowrap">{{ $t('bills.floatingInterest') }}</span>
                            <span class="f14 lh-20 c-main align-r w-196">{{ [null, undefined, '', NaN].includes(form.floatYield) ? '--' : form.floatYield + '%' }}</span>
                        </div> -->
                        <!-- 复杂产品 -->
                        <div class="product-item flex-s">
                            <span class="f14 lh-20 h2-white">{{ $t('complexProduct') }}</span>
                            <span class="f14 lh-20 c-main">{{ form.isComplexProduct | complexFilter }}</span>
                        </div>
                        <!-- 产品风险等级 -->
                        <div class="product-item flex-s">
                            <span class="f14 lh-20 h2-white">{{ $t('bills.productRiskLevel') }}</span>
                            <span class="f14 lh-20 c-main">{{ form.riskRating | riskRatingFilter }}</span>
                        </div>
                    </div>
                </div>
            </template>
            <!-- 温馨提示 -->
            <div class="mar-t24 f12 c-gray" v-if="isUnConfirm">
                <div class="lh-16 mar-b8">{{ $t('piGuide.warmTip') }}</div>
                <div class="lh-18">{{ $t('bills.customConfirmTips') }}</div>
            </div>
        </div>
        <BottomButton v-if="showBottomButton">
            <!--待处理-->
            <div class="flex-s pad-rl12 pad-t8 h-56" v-if="isPending">
                <button class="button" @click="handleStatus('cancel')">{{ $t('cancel') }}</button>
                <button class="button" @click="handleStatus('modify')">{{ $t('bills.modify') }}</button>
            </div>
            <!--待确认-->
            <div class="flex-s pad-rl28 pad-t8 h-56" v-if="isUnConfirm">
                <button class="button w-110" @click="refuseFlag = true">{{ $t('bills.refuse') }}</button>
                <button class="button theme-button" @click="handleStatus('accept')">{{ $t('bills.acceptAndBuy') }}</button>
            </div>
        </BottomButton>
        <van-dialog
            v-model="refuseFlag"
            :title="$t('bills.refuse')"
            show-cancel-button
            className="custom-dialog"
            :confirmButtonText="$t('trade.queding')"
            :before-close="handleConfirm"
        >
            <div class="pad-rl16 pad-b28">
                <div class="f14 lh-20 c-main mar-b16">{{ $t('bills.confirmRefuseCustomizeTips') }}</div>
                <van-radio-group v-model="radio" direction="horizontal">
                    <van-radio name="1" class="mar-r40">
                        <template v-slot:icon="{ checked }">
                            <multi-img
                                :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                directory="fund"
                                width="16"
                                height="16"
                            ></multi-img>
                        </template>
                        <span class="f14 lh-20 c-main">{{ $t('bills.submitAgain') }}</span>
                    </van-radio>
                    <van-radio name="2">
                        <template v-slot:icon="{ checked }">
                            <multi-img
                                :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                directory="fund"
                                width="16"
                                height="16"
                            ></multi-img>
                        </template>
                        <span class="f14 lh-20 c-main">{{ $t('bills.noCustomize') }}</span>
                    </van-radio>
                </van-radio-group>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import BottomButton from './components/BottomButton.vue'
import dayjs from 'dayjs'
import {
    noteCustomizationOrderDetail,
    noteCustomizationOrderCancel,
    noteCustomizationOrderConfirm,
    noteCustomizationOrderReject,
} from '@/apis/wealth/index'
import { thousandsFilter } from '@/config/filters'
import { CURRENCY_MAP, BILL_CUSTOMIZE_STATUS_MAP, RISK_RATING_MAP, BILL_COMPLEX_MAP, BILL_UNIT_MAP } from '@/views/fund/config/common'
import { Toast } from 'vant'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'

const tradeStatusKeyValueMap = BILL_CUSTOMIZE_STATUS_MAP.keyValueMap

const tradeStatusIconMap = {
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.pending]: 'icon-queuing',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.accepted]: 'icon-wait',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.unconfirm]: 'icon-unconfirm',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.declined]: 'icon-fail',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.rejected]: 'icon-error',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.canceled]: 'icon-canceled',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.completed]: 'icon-success',
}

export default {
    name: 'CustomizeOrders',
    components: {
        BottomButton,
    },
    data() {
        return {
            tradeStatusIconMap,
            BILL_UNIT_MAP,
            status: 'unConfirmed',
            refuseFlag: false,
            radio: '1',
            form: {},
            orderId: Number(this.$route.query.orderId),
        }
    },
    computed: {
        // 待处理状态
        isPending() {
            return this.form.orderStatus === BILL_CUSTOMIZE_STATUS_MAP.keysMap.pending
        },
        // 待确认
        isUnConfirm() {
            return this.form.orderStatus === BILL_CUSTOMIZE_STATUS_MAP.keysMap.unconfirm
        },
        // 已驳回
        isRejected() {
            return this.form.orderStatus === BILL_CUSTOMIZE_STATUS_MAP.keysMap.rejected
        },
        // 已拒绝，待确认，已完成
        showListFlag() {
            return (
                this.isUnConfirm ||
                [BILL_CUSTOMIZE_STATUS_MAP.keysMap.declined, BILL_CUSTOMIZE_STATUS_MAP.keysMap.completed].includes(this.form.orderStatus)
            )
        },
        // 定制产品1 ： 固定利率2 ： 浮动利率
        isFixed() {
            return this.form.isFixed === 1
        },
        // 是否显示底部按钮
        showBottomButton() {
            return this.isUnConfirm || this.isPending
        },
    },
    filters: {
        tradeStatusTextFilter(v) {
            return tradeStatusKeyValueMap[v] || '--'
        },
        currencyFilter(v) {
            return CURRENCY_MAP.keyValueMap[v] || ''
        },
        riskRatingFilter(v) {
            return RISK_RATING_MAP.keyValueMap[v] || ''
        },
        complexFilter(v) {
            return BILL_COMPLEX_MAP.keyValueMap[v] || ''
        },
        fulleDateFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD') : ''
        },
        dateFilter(v) {
            return v ? dayjs(v).format('YY/MM/DD') : ''
        },
        timeFilter(v) {
            return v ? dayjs(v).format('HH:mm:ss') : ''
        },
        dateTimeFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : ''
        },
        amountFilter(v) {
            return v ? thousandsFilter(v) : '--'
        },
    },
    mounted() {
        this.getData()
    },
    methods: {
        // 提示
        handlePrompt() {
            this.$dialog.confirm({
                title: this.$t('tipTitle'),
                message: this.$t('bills.confirmDeadlineTips'),
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
            })
        },

        // 处理订单状态
        handleStatus(type) {
            const self = this
            switch (type) {
                case 'cancel':
                    this.$dialog.confirm({
                        title: '',
                        message: this.$t('bills.cancelCustomizeTips'),
                        messageAlign: 'center',
                        showCancelButton: true,
                        confirmButtonText: this.$t('trade.queding'),
                        className: 'custom-dialog custom-cancel-dialog',
                        beforeClose(action, done) {
                            if (action === 'confirm') {
                                self.cancelOrder(done)
                            } else {
                                done()
                            }
                        },
                    })
                    break
                case 'modify':
                    this.$goPage('/bill-customize-edit', {
                        orderId: this.orderId,
                        type: 'modify',
                    })
                    break
                case 'accept':
                    this.acceptAndGo()
                    break
                default:
                    break
            }
        },

        // 获取数据
        async getData() {
            try {
                const { result } = await noteCustomizationOrderDetail({ orderId: this.orderId })
                this.form = result
            } catch (e) {
                console.log('noteCustomizationOrderDetail===>e:', e)
                this.form = {}
            }
        },

        // 取消
        async cancelOrder(callBack) {
            this.$store.commit('app/updateShowLoading', true)
            try {
                const { result } = await noteCustomizationOrderCancel({ orderId: this.orderId })
                this.$store.commit('app/updateShowLoading', false)
                if (result) {
                    // this.closePage()
                    this.getData()
                    Toast(this.$t('bills.success'))
                    this.closePage()
                    callBack && callBack()
                } else {
                    Toast(this.$t('serviceError'))
                    callBack && callBack(false)
                }
            } catch (e) {
                console.log('noteCustomizationOrderCancel', e)
                this.$store.commit('app/updateShowLoading', false)
                Toast(this.$t('serviceError'))
                callBack && callBack(false)
            }
        },

        // 拒绝
        async rejectOrder(callBack) {
            this.$store.commit('app/updateShowLoading', true)
            try {
                const { result } = await noteCustomizationOrderReject({ orderId: this.orderId })
                this.$store.commit('app/updateShowLoading', false)
                if (result) {
                    // this.closePage()
                    this.getData()
                    callBack && callBack()
                    if (this.radio === 1) {
                        this.$goPage('/bill-customize-add', {
                            orderId: this.orderId,
                            type: 'reject',
                        })
                    } else {
                        Toast(this.$t('bills.success'))
                        this.closePage()
                    }
                } else {
                    Toast(this.$t('serviceError'))
                    callBack && callBack(false)
                }
            } catch (e) {
                console.log('noteCustomizationOrderReject', e)
                this.$store.commit('app/updateShowLoading', false)
                Toast(this.$t('serviceError'))
                callBack && callBack(false)
            }
        },

        // 接受并买入
        async acceptAndGo() {
            this.$store.commit('app/updateShowLoading', true)
            try {
                const { result } = await noteCustomizationOrderConfirm({ orderId: this.orderId })
                this.$store.commit('app/updateShowLoading', false)
                if (result) {
                    this.getData()
                    Toast(this.$t('bills.success'))
                    this.$goPage('/bills/buy', {
                        symbol: this.form.symbol,
                        amount: this.form.applyAmount,
                    })
                } else {
                    Toast(this.$t('serviceError'))
                }
            } catch (e) {
                console.log('noteCustomizationOrderConfirm===>e:', e)
                this.$store.commit('app/updateShowLoading', false)
            }
        },

        closePage() {
            JSBridge ? JSBridge.close() : this.$router.go(-1)
        },

        handleProductClick(symbol) {
            this.$goPage('/bills/detail', {
                symbol,
            })
        },

        handleConfirm(action, done) {
            if (action === 'confirm') {
                this.rejectOrder(done)
            } else {
                done()
            }
        },
    },
}
</script>

<style lang="less" scoped>
.w-123 {
    width: 123px;
}

.w-102 {
    width: 102px;
}

.w-196 {
    width: 196px;
}

.main-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;

    .main-content {
        height: 100%;
        overflow-y: auto;

        &.limit-height {
            height: calc(100% - 72px);
        }
    }

    .tips {
        width: 327px;
        height: 28px;
        margin-top: 12px;
        padding: 0 8px;
        background: #fff9f4;
        border-radius: 4px;

        .text {
            color: #ff751b;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .status {
        position: absolute;
        top: 0;
        right: 0;
        width: 70px;
        height: 22px;
        padding: 0 4px;
        border-radius: 0 8px;

        &.icon-queuing {
            color: #ff9f2f;
            background: rgba(255, 159, 47, 0.15);
        }

        &.icon-wait {
            color: #2f9bff;
            background: rgba(47, 155, 255, 0.15);
        }

        &.icon-unconfirm {
            color: #ad6dff;
            background: rgba(173, 109, 255, 0.15);
        }

        &.icon-canceled {
            color: #9c9c9c;
            background: rgba(156, 156, 156, 0.15);
        }

        &.icon-error,
        &.icon-fail {
            color: #f31414;
            background: rgba(243, 20, 20, 0.15);
        }

        &.icon-success {
            color: #3fbd55;
            background: rgba(63, 189, 85, 0.15);
        }
    }

    .button {
        display: block;
        width: 169px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        background: none;
        border: none;
        border: 0.5px solid #9c9c9c;
        border-radius: 31px;
        outline: none;

        &.w-110 {
            width: 110px;
        }

        &.theme-button {
            width: 197px;
            color: #fff;
            background: #ff6907;
            border: none;
        }
    }

    .error-content {
        margin: 12px 0 16px;
        color: #f31414;
        font-size: 12px;
        line-height: 18px;
        word-break: break-all;
    }

    .product-item {
        align-items: flex-start;
        padding: 8px 0;
    }
}
</style>

<style lang="less">
.custom-cancel-dialog {
    .van-dialog__cancel {
        .van-button__text {
            font-weight: 700;
        }
    }
}
</style>
