// 认购详情
<template>
    <div class="order-detail">
        <!-- 产品信息 -->
        <section class="info card pt0">
            <h3 class="name" @click="gotoDetails">{{ detailInfo.productName || '--' }}</h3>
            <div class="info-second-line border-bottom-1px" @click="gotoDetails">
                <div :class="`currency-${detailInfo.currency}`"></div>
                <span class="product-code">{{ detailInfo.productCode || '--' }}</span>
            </div>
            <div class="holding-amount-area">
                <div class="holding-amount">{{ detailInfo.applyAmount || 0 | formatterFilter }}</div>
                <div class="holding-amount-currency">{{ detailInfo.currency | currencyFilter }}</div>
            </div>
            <div class="info-body" :class="{ 'info-body2': interestStep }">
                <template v-if="interestStep">
                    <div class="rate">
                        <p class="rate-value highlight">{{ detailInfo.todayInterest | amountFormatter }}</p>
                        <div class="flex-c" @click="showToadyTips()">
                            <p class="info-label">{{ $t('orderDetail.todayInterest') }}</p>
                            <multi-img name="icon_tips_big" directory="common" width="16" height="16"></multi-img>
                        </div>
                    </div>
                    <div class="rate text-center">
                        <p class="rate-value highlight">{{ detailInfo.accumInterest | amountFormatter }}</p>
                        <div class="flex-c">
                            <p class="info-label">{{ $t('orderDetail.accumulateInterest') }}</p>
                        </div>
                    </div>
                    <div class="rate text-right">
                        <dynamic-font
                            class="rate-value highlight"
                            :value="displayInterest"
                            :options="{ maxFontSize: 16, minFontSize: 12 }"
                        ></dynamic-font>
                        <div class="flex-c" @click="showTips()">
                            <p class="info-label">{{ $t('orderDetail.interestDue') }}</p>
                            <multi-img name="icon_tips_big" directory="common" width="16" height="16"></multi-img>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="rate info-body-left">
                        <p class="rate-value highlight">{{ displayRate }}</p>
                        <div class="flex-c" @click="showRateTips()">
                            <p class="info-label">
                                {{ $t(showEstimate ? 'orderDetail.estimateAnnualRateAfter' : 'orderDetail.annualRateAfter') }}
                            </p>
                            <multi-img v-if="showEstimate" name="icon_tips_big" directory="common" width="16" height="16"></multi-img>
                        </div>
                    </div>
                    <div class="rate">
                        <dynamic-font
                            class="rate-value highlight"
                            :value="displayInterest"
                            :options="{ maxFontSize: 16, minFontSize: 12 }"
                        ></dynamic-font>
                        <div class="flex-c" @click="showTips()">
                            <p class="info-label">{{ $t(showEstimate ? 'orderDetail.estimateInterestDue' : 'orderDetail.interestDue') }}</p>
                            <multi-img name="icon_tips_big" directory="common" width="16" height="16"></multi-img>
                        </div>
                    </div>
                </template>
            </div>
        </section>

        <!-- 进度 -->
        <div class="card progress-card">
            <ProgressStep class="progress" :class="{ 'three-step': twoStep || threeStep }" :stepList="stepList"></ProgressStep>
            <div class="step-label border-top-1px" v-html="stepLabel"></div>
        </div>

        <!-- 产品信息 -->
        <section class="product-info card">
            <div v-for="(item, index) in productInfo" :key="index">
                <div class="item-info flex-s">
                    <div class="label" :class="{ title: index === 0 }">
                        {{ item.label }}
                        <multi-img
                            v-if="item.icon"
                            name="icon_tips_big"
                            directory="common"
                            width="16"
                            height="16"
                            @click="handleProductItemIconClick(item)"
                        />
                    </div>
                    <div class="value">{{ item.value }}</div>
                </div>
            </div>
        </section>

        <!-- 交易规则 -->
        <section class="rule">
            <div class="rule-title">{{ $t('tradeRule') }}</div>
            <div v-for="(item, index) in tradeRuleList" :key="index">
                <div class="rule-info flex">
                    <div class="title">{{ item.title }}</div>
                    <div v-html="item.desc"></div>
                </div>
            </div>
        </section>

        <FooterAdvisors></FooterAdvisors>

        <van-dialog v-model="showVIPPopup" width="280" :title="$t('orderDetail.vipFees')" :confirm-button-text="$t('iKnow')">
            <div class="vip-dialog">
                <div class="item">
                    <div class="dialog-title">{{ $t('orderDetail.vipDialogTitle1') }}</div>
                    <div class="dialog-desc">{{ $t('orderDetail.vipDialogDesc1', { money: displayTotalVIPFee }) }}</div>
                </div>
                <div class="item mar-t20">
                    <div class="dialog-title">{{ $t('orderDetail.vipDialogTitle2') }}</div>
                    <div class="dialog-desc">{{ $t('orderDetail.vipDialogDesc2') }}</div>
                </div>
                <div class="item mar-t20">
                    <div class="dialog-title">{{ $t('orderDetail.vipDialogTitle3') }}</div>
                    <div class="dialog-desc">{{ $t('orderDetail.vipDialogDesc3') }}</div>
                </div>
                <div class="item mar-t20">
                    <div class="dialog-title">{{ $t('orderDetail.vipDialogTitle4') }}</div>
                    <div class="dialog-desc">{{ $t('orderDetail.vipDialogDesc4', { day: detailInfo.periodValue }) }}</div>
                </div>
            </div>
        </van-dialog>
        <!-- 加息券收益icon提示框 -->
        <van-dialog
            v-model="showAdditionTipDialog"
            width="280"
            :title="$t('coupon.jxqhdsysm')"
            :confirm-button-text="$t('iKnow')"
            class="coupon-dialog"
        >
            <div class="vip-dialog">
                <div class="item">
                    <div class="dialog-title">{{ $t('coupon.syfssm') }}</div>
                    <div class="dialog-desc">{{ $t('coupon.syfssm1') }}</div>
                </div>
                <div class="item mar-t36">
                    <div class="dialog-title">{{ $t('coupon.syjsgz') }}</div>
                    <div class="dialog-desc mar-b8">{{ $t('coupon.syjsgz1') }}</div>
                    <div class="dialog-desc mar-b8">{{ $t('coupon.syjsgz11') }}</div>
                    <div class="dialog-desc mar-b8">{{ $t('coupon.syjsgz2') }}</div>
                    <div class="dialog-desc mar-b8">{{ $t('coupon.syjsgz3') }}</div>
                    <div class="dialog-desc">{{ $t('coupon.syjsgz4') }}</div>
                </div>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import DynamicFont from '@/components/FosunDynamicFont.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import ProgressStep from '@/components/ProgressStep.vue'
import NP from 'number-precision'

import { currencyFilter, thousandsFilter } from '@/config/filters'
import { toFixed } from '@/utils'
import { periodUnitFilter } from '../filters'
import { ORDER_STATUS_MAP } from '@/views/fixedDepositTreasure/config/common.js'

import { ftdOrderDetail } from '@/apis/ftd/order.js'
import { getOrderAdditionalCouponFee } from '@/apis/operation.js'
import { ftdHoldingDetail } from '@/apis/ftd/portfolio.js'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'
import FooterAdvisors from '@/components/FooterAdvisors.vue'
import { amountFormatter as af } from '@/config/filters'

const StatusKeysMap = ORDER_STATUS_MAP.keysMap
const formatterFilter = v => {
    return v ? thousandsFilter(toFixed(v, 2)) : '--'
}
const amountFormatter = v => {
    return v ? af(v, { sign: true }) : '--'
}
const dateFormat = v => {
    return v ? dayjs(v).format('YYYY/MM/DD') : '--'
}
export default {
    name: 'order-detail',
    mixins: [platformDifferenceMixin],
    components: {
        ProgressStep,
        DynamicFont,
        FooterAdvisors,
    },
    props: {},
    data() {
        return {
            showVIPPopup: false,
            showAdditionTipDialog: false,
            detailInfo: {
                orderNumber: '', //	订单编号
                // 订单状态 200-已提交  500-已认购 501-已起息 600-已到期 700-已回款
                // 402-提交失败
                // 401-认购失败 701-已退款
                orderStatus: 0,
                productCode: '', //	产品代码
                productName: '', //	产品名称
                currency: 'HKD', //	币种
                applyAmount: '', //	认购金额
                actualInterest: '', //	到期利息
                estimateActualInterestMin: '', //	到期利息min
                estimateActualInterestMax: '', //	到期利息max
                periodValue: 0, //	投资期限
                periodUnit: 'd', //	投资期限单位 d-按日, w-按周, m-按月, y-按年'
                actualInterestRate: '', //	年利率
                estimateInterestRateMin: '', // 最小预计年利率, 去除百分号, /100 的数据
                estimateInterestRateMax: '', // 最大预计年利率, 去除百分号, /100 的数据
                annualManageFeeRate: '', //	管理费率
                serviceFeeRate: '', //	服务费率
                periodLock: 0, //		产品锁定期
                failReason: '', // 失败原因（已处理语言）
                subAccountId: '', //	交易账户
                submittedTime: '', //	下单时间
                cashStatus: 0, //		资金状态
                collectStartTime: '', //	开始认购时间
                announcedTime: '', //	公布结果时间
                interestAccrualTime: '', //	起息时间
                maturityTime: '', //	到期时间
                settledTime: '', //	回款时间
                refundTime: '', //	退款时间
                settlementDays: 0, //		T+n回款日
                estimateInterestRateDate: '', // 报价更新时间
                vipFee: '', // 会员费
                totalVipFee: '', // 会员费总额
                additionalCouponFee: '', // 定存宝加息券额外加息金额
            },
        }
    },
    computed: {
        productInfo() {
            let list = [{ label: this.$t('orderDetail.productInfo'), value: '' }]
            const info = [
                {
                    label: this.$t('orderDetail.productPeriodValue'),
                    value: periodUnitFilter(this.detailInfo.periodUnit, this.detailInfo.periodValue),
                },
                { label: this.$t('orderDetail.lockPeriod'), value: periodUnitFilter(this.detailInfo.periodUnit, this.detailInfo.periodLock) },
                { label: this.$t('tradeAccount'), value: `${this.$t('orderDetail.securitiesAccount')}(${this.detailInfo.subAccountId?.slice(-4)})` },
            ]

            // 甄享汇会员费与加息券信息均返回
            if (!isEmpty(this.detailInfo.vipFee)) {
                list.push({
                    label: this.$t('orderDetail.vipFees'),
                    value: formatterFilter(this.detailInfo.vipFee) + currencyFilter(this.detailInfo.currency),
                    icon: true,
                    name: 'vip',
                })
            }
            if (!isEmpty(this.detailInfo.additionalCouponFee)) {
                list.push({
                    label: this.$t('coupon.jxqhdsy'),
                    value: formatterFilter(this.detailInfo.additionalCouponFee) + currencyFilter(this.detailInfo.currency),
                    icon: true,
                    name: 'additionalCoupon',
                })
            }
            if (this.interestStep) {
                list.push({
                    label: this.$t('orderDetail.realAnnualRateAfter'),
                    value: this.displayRate,
                })
            }

            list = list.concat(info)

            return list
        },
        displayRate() {
            if (this.showEstimate) {
                const min = formatterFilter(NP.times(this.detailInfo.estimateInterestRateMin || 0, 100))
                const max = formatterFilter(NP.times(this.detailInfo.estimateInterestRateMax || 0, 100))
                return `${min}%~${max}%`
            }
            const min = formatterFilter(NP.times(this.detailInfo.actualInterestRate || 0, 100))
            return `${min}%`
        },
        displayInterest() {
            if (this.showEstimate) {
                const min = formatterFilter(this.detailInfo.estimateActualInterestMin || 0)
                const max = formatterFilter(this.detailInfo.estimateActualInterestMax || 0)
                return `${min}~${max}`
            }
            const min = formatterFilter(this.detailInfo.actualInterest || 0)
            return `${min}`
        },
        // 会员费总额
        displayTotalVIPFee() {
            return formatterFilter(this.detailInfo.totalVipFee) + currencyFilter(this.detailInfo.currency)
        },
        tradeRuleList() {
            const ruleList = [
                {
                    title: this.$t('tradeRuleDetail.interestRate'),
                    desc: this.$t('tradeRuleDetail.interestRateDesc'),
                },
                {
                    title: this.$t('tradeRuleDetail.interestStartDate'),
                    desc: this.$t('tradeRuleDetail.interestStartDateDesc'),
                },
                {
                    title: this.$t('tradeRuleDetail.interestDueDate'),
                    desc: this.$t('tradeRuleDetail.interestDueDateDesc'),
                },
                {
                    title: this.$t('tradeRuleDetail.interestRateStandard'),
                    desc: this.$t('tradeRuleDetail.interestRateStandardDesc'),
                },
                {
                    title: this.$t('tradeRuleDetail.fundSettlementDate'),
                    desc: this.$t('tradeRuleDetail.fundSettlementDateDesc', { settlementDate: this.detailInfo.settlementDays }),
                },
                {
                    title: this.$t('tradeRuleDetail.lockPeriodTitle', {
                        day: periodUnitFilter(this.detailInfo.periodUnit, this.detailInfo.periodLock),
                    }),
                    desc: this.$t('tradeRuleDetail.lockPeriodTitleDesc', {
                        day: periodUnitFilter(this.detailInfo.periodUnit, this.detailInfo.periodLock),
                        settlementDate: this.detailInfo.settlementDays,
                    }),
                },
                {
                    title: this.$t('tradeRuleDetail.noEarlyTermination'),
                    desc: this.$t('tradeRuleDetail.noEarlyTerminationDesc'),
                },
            ]
            return ruleList
        },
        // 展示预计信息
        showEstimate() {
            const map = [
                StatusKeysMap.submitted, //200-已提交
                StatusKeysMap.subscribeFailure, // 401-认购失败
                StatusKeysMap.submitFailure, //402-提交失败
                StatusKeysMap.refunded, //701-已退款
            ]
            return map.includes(this.detailInfo.orderStatus)
        },
        interestStep() {
            return [StatusKeysMap.interest, StatusKeysMap.expired, StatusKeysMap.receivedMoney].includes(this.detailInfo.orderStatus)
        },
        stepList() {
            let list = []
            // 402-提交失败
            if (this.twoStep) {
                list = [
                    {
                        message: this.$t('startSubscribe'),
                        label: dateFormat(this.detailInfo.collectStartTime),
                        active: true,
                        nextActive: true,
                    },
                    {
                        message: '',
                        label: '',
                        hiddenCircle: true,
                        active: true,
                        nextActive: true,
                    },
                    {
                        message: this.$t('status.submitFailure'),
                        label: dateFormat(this.detailInfo.submittedTime),
                        active: true,
                    },
                ]
            } else if (this.threeStep) {
                // 401-认购失败  701-已退款
                list = [
                    {
                        message: this.$t('startSubscribe'),
                        label: dateFormat(this.detailInfo.collectStartTime),
                        active: true,
                        nextActive: true,
                    },
                    {
                        message: this.$t('announceResults'),
                        label: dateFormat(this.detailInfo.announcedTime),
                        active: true,
                        nextActive: this.detailInfo.orderStatus === StatusKeysMap.refunded,
                    },
                    {
                        message: this.$t('refund'),
                        label: dateFormat(this.detailInfo.refundTime),
                        active: this.detailInfo.orderStatus === StatusKeysMap.refunded,
                    },
                ]
            } else {
                // 订单状态 200-已提交 500-已认购 501-已起息 600-已到期 700-已回款
                list = [
                    {
                        message: this.$t('startSubscribe'),
                        label: dateFormat(this.detailInfo.collectStartTime),
                        active: true,
                        nextActive: this.detailInfo.orderStatus >= StatusKeysMap.subscribe,
                        halfActive: this.detailInfo.orderStatus === StatusKeysMap.submitted,
                    },
                    {
                        message: this.$t('announceResults'),
                        label: dateFormat(this.detailInfo.announcedTime),
                        active: this.detailInfo.orderStatus >= StatusKeysMap.subscribe,
                        nextActive: this.detailInfo.orderStatus >= StatusKeysMap.interest,
                    },
                    {
                        message: this.$t('startInterest'),
                        label: dateFormat(this.detailInfo.interestAccrualTime),
                        active: this.detailInfo.orderStatus >= StatusKeysMap.interest,
                        nextActive: this.detailInfo.orderStatus >= StatusKeysMap.expired,
                    },
                    {
                        message: this.$t('expire'),
                        label: dateFormat(this.detailInfo.maturityTime),
                        active: this.detailInfo.orderStatus >= StatusKeysMap.expired,
                        nextActive: this.detailInfo.orderStatus >= StatusKeysMap.receivedMoney,
                    },
                    {
                        message: this.$t('settled'),
                        label: dateFormat(this.detailInfo.settledTime),
                        active: this.detailInfo.orderStatus >= StatusKeysMap.receivedMoney,
                    },
                ]
            }

            return list
        },
        twoStep() {
            return this.detailInfo.orderStatus === StatusKeysMap.submitFailure
        },
        threeStep() {
            return this.detailInfo.orderStatus === StatusKeysMap.subscribeFailure || this.detailInfo.orderStatus === StatusKeysMap.refunded
        },
        stepLabel() {
            const applyAmount = formatterFilter(this.detailInfo.applyAmount) + currencyFilter(this.detailInfo.currency)
            const annualRate = `${formatterFilter(NP.times(this.detailInfo.actualInterestRate || 0, 100))}%`
            const amount = NP.plus(this.detailInfo.applyAmount || 0, this.detailInfo.actualInterest || 0)
            const text = formatterFilter(amount) + currencyFilter(this.detailInfo.currency)
            const map = {
                // 200-已提交
                [StatusKeysMap.submitted]: this.$t('orderDetail.submittedLabel', { date: dateFormat(this.detailInfo.announcedTime) }),
                // 402-提交失败
                [StatusKeysMap.submitFailure]: this.$t('orderDetail.submitFailureLabel', { reason: this.detailInfo.failReason }),
                // 500-已认购
                [StatusKeysMap.subscribe]: this.$t('orderDetail.subscribeLabel', {
                    date: dateFormat(this.detailInfo.interestAccrualTime),
                    annualRate: annualRate,
                }),
                // 501-已起息
                [StatusKeysMap.interest]: this.$t('orderDetail.interestLabel', {
                    date: dateFormat(this.detailInfo.interestAccrualTime),
                    annualRate: annualRate,
                }),
                // 600-已到期
                [StatusKeysMap.expired]: this.$t('orderDetail.expiredLabel', { money: text, date: dateFormat(this.detailInfo.settledTime) }),
                // 700-已回款
                [StatusKeysMap.receivedMoney]: this.$t('orderDetail.receivedMoneyLabel', {
                    money: text,
                    date: dateFormat(this.detailInfo.settledTime),
                }),
                // 401-认购失败
                [StatusKeysMap.subscribeFailure]: this.$t('orderDetail.subscribeFailureLabel', {
                    money: applyAmount,
                    date: dateFormat(this.detailInfo.refundTime),
                }),
                // 701-已退款
                [StatusKeysMap.refunded]: this.$t('orderDetail.refundedLabel', { money: applyAmount, date: dateFormat(this.detailInfo.refundTime) }),
            }
            return map[this.detailInfo.orderStatus]
        },
        isOrderDetail() {
            return this.$route.name === 'orderDetail'
        },
    },
    watch: {},
    created() {
        this.getDetails()
    },
    mounted() {},
    destroyed() {},
    filters: {
        currencyFilter,
        formatterFilter,
        amountFormatter,
    },
    methods: {
        isEmpty,
        dateFormat,
        getDetails() {
            const params = {
                orderNumber: this.$route.query.orderNumber,
            }
            const unShowAdditionFeeStatus = [400, 401, 402, 701]
            if (this.isOrderDetail) {
                ftdOrderDetail(params)
                    .then(({ result }) => {
                        console.log(`yinlong ftdOrderDetail`, params, result)
                        this.detailInfo = result
                        if (result.couponId && !unShowAdditionFeeStatus.includes(result.orderStatus)) {
                            const { orderNumber, productCode, couponId } = result
                            const params = { symbol: orderNumber, productCode, userCouponId: couponId }
                            this.getAdditionCouponFee(params)
                        }
                    })
                    .catch(({ error }) => {
                        console.error(`ftdOrderDetail`, params, error)
                    })
            } else {
                ftdHoldingDetail(params)
                    .then(({ result }) => {
                        console.log(`yinlong ftdHoldingDetail`, params, result)
                        this.detailInfo = result
                        if (result.couponId && !unShowAdditionFeeStatus.includes(result.orderStatus)) {
                            const { orderNumber, productCode, couponId } = result
                            const params = { symbol: orderNumber, productCode, userCouponId: couponId }
                            this.getAdditionCouponFee(params)
                        }
                    })
                    .catch(({ error }) => {
                        console.error(`ftdHoldingDetail`, params, error)
                    })
            }
        },
        gotoDetails() {
            this.$goPage('/detail', { productCode: this.detailInfo.productCode })
        },
        showTips() {
            const msg = this.showEstimate ? this.$t('orderDetail.estimateTips') : this.$t('orderDetail.tips')
            this.$dialog.confirm({
                title: this.$t('tipTitle'),
                message: msg,
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                messageAlign: 'left',
            })
        },
        showRateTips() {
            if (this.showEstimate) {
                this.$dialog.confirm({
                    closeOnClickOverlay: true,
                    title: this.$t('quoteUpdateTime'),
                    message: dateFormat(this.detailInfo.estimateInterestRateDate),
                    showCancelButton: false,
                    confirmButtonText: this.$t('iKnow'),
                    messageAlign: 'center',
                })
            }
        },
        showToadyTips() {
            this.$dialog.confirm({
                closeOnClickOverlay: true,
                title: this.$t('tipTitle'),
                message: this.$t('orderDetail.todayInterestTips'),
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                messageAlign: 'left',
            })
        },
        handleProductItemIconClick(item) {
            if (!item.name) return
            if (item?.name === 'vip') {
                this.showVIPPopup = true
            } else {
                this.showAdditionTipDialog = true
            }
        },
        async getAdditionCouponFee(params) {
            // const { orderNumber } = this.$route.query
            // const { productCode } = this.$route.query || this.detailInfo.productCode
            // const params = { symbol: orderNumber, productCode, userCouponId }
            const res = await getOrderAdditionalCouponFee(params)
            console.log('getOrderAdditionalCouponFee res:', res.data)
            const additionalCouponFee = res?.data?.result?.totalReturnAmount + ''
            this.detailInfo = { ...this.detailInfo, additionalCouponFee }
        },
    },
}
</script>

<style scoped lang="less">
.order-detail {
    padding: 12px 12px 0;
    background: #f9f9f9;
    user-select: none;
    #iosBottom();
    // 模拟底部模块的高度
    &::after {
        display: block;
        height: 50px;
        content: '';
    }

    .progress-card {
        padding: 16px 0 0;

        .progress {
            padding: 0 12px 12px;
        }

        .three-step {
            ::v-deep .first-item {
                width: 140px;
            }

            ::v-deep .last-item {
                width: 140px;
            }
        }

        .step-label {
            margin: 0 12px;
            padding: 16px 0;
            color: @h2-white;
            font-size: 12px;
            line-height: 16px;

            ::v-deep .highlight {
                color: @theme-white;
            }
        }
    }

    .product-info {
        padding: 8px 12px;

        .item-info {
            height: 36px;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            .label {
                display: flex;
                align-items: center;
                color: @h2-white;

                img {
                    margin-left: 4px;
                }
            }

            .title {
                color: @h1-white;
                font-weight: bold;
                font-size: 16px;
            }

            .value {
                color: @h1-white;
            }
        }
    }

    .rule {
        margin: 24px 4px 32px;
        background: #f9f9f9;

        .rule-title {
            color: @h3-white;
            font-weight: bold;
            font-size: 12px;
            line-height: 16px;
        }

        .rule-info {
            margin-top: 8px;
            color: @h3-white;
            font-size: 12px;
            line-height: 18px;

            .title {
                flex-shrink: 0;
                width: 90px;
                margin-right: 6px;
            }

            ::v-deep .highlight {
                color: @theme-white;
            }
        }
    }
}

.card {
    margin-top: 12px;
    padding: 16px 12px;
    background-color: #fff;
    border-radius: 8px;
}

.pt0 {
    margin-top: 0;
}

.name {
    color: #2f2f2f;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
}

.info-second-line {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 4px;
    padding-bottom: 12px;

    .product-code {
        margin-left: 4px;
        color: @h2-white;
        font-size: 11px;
        line-height: 14px;
    }
}

.holding-amount-area {
    display: flex;
    align-items: first baseline;
    margin: 16px 0;
    color: @h1-white;

    .holding-amount {
        margin-right: 4px;
        font-weight: bold;
        font-size: 20px;
        line-height: 28px;
    }

    .holding-amount-currency {
        font-size: 12px;
        line-height: 16px;
    }
}

.info-body {
    display: flex;

    .rate {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;

        + .rate {
            margin-left: 24px;
        }

        .rate-value {
            max-width: 163px;
            margin-bottom: 4px;
            color: @theme-white;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }

        .info-label {
            color: @h3-white;
            font-size: 12px;
            line-height: 16px;
        }

        img {
            margin-left: 4px;
        }
    }

    .info-body-left {
        min-width: 120px;
    }
}

.info-body.info-body2 {
    justify-content: space-between;

    .rate {
        + .rate {
            margin-left: 0;
        }

        &.text-center {
            align-items: center;
        }

        &.text-right {
            align-items: flex-end;
        }

        .rate-value {
            max-width: 100px;
        }
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }
}

.vip-dialog {
    padding: 0 16px 28px;

    .item {
        color: @h1-white;
        font-size: 14px;
        line-height: 20px;

        .dialog-title {
            margin-bottom: 8px;
            font-weight: bold;
        }

        .dialog-desc {
            font-weight: normal;
        }
    }
}

.coupon-dialog {
    /deep/.van-dialog__content {
        height: 348px;
        overflow-y: auto;

        &::-webkit-scrollbar {
            display: none;
        }
    }
}
</style>
