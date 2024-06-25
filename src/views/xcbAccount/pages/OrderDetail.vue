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
                <div class="holding-amount-label">{{ detailInfo.currency | currencyFilter }}</div>
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
                        <div class="flex-c" @click="showRateTips">
                            <p class="info-label">{{ $t('detail.annualisedRate') }}</p>
                            <multi-img
                                v-if="detailInfo.annualManageFeeRate?.length > 1"
                                name="icon_tips_big"
                                directory="common"
                                width="16"
                                height="16"
                            ></multi-img>
                        </div>
                    </div>
                    <div class="rate">
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
                    <div class="label" :class="{ title: index === 0 }" @click="handleProductItemIconClick(item)">
                        {{ item.label }}
                        <multi-img v-if="item.icon" name="icon_tips_big" directory="common" width="16" height="16" />
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

        <!-- 专属顾问,不在同花顺展示 中显示 -->
        <div class="advisor-container" v-if="isHLApp()">
            <div class="advisor" @click="goAdvisor">
                <multi-img name="icon_service2" directory="common"></multi-img>
                {{ $t('dedicatedAdvisors') }}
            </div>
        </div>

        <van-dialog v-model="showRateTipsPopup" width="280" :title="$t('orderDetail.rateTipsTitle')" :confirm-button-text="$t('iKnow')">
            <div class="vip-dialog">
                <RateStep
                    :list="detailInfo.annualManageFeeRate"
                    :before-rate="detailInfo.fqActualInterestRate"
                    :currency="detailInfo.currency"
                ></RateStep>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import DynamicFont from '@/components/FosunDynamicFont.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import ProgressStep from '@/components/ProgressStep.vue'
import NP from 'number-precision'
import pathnames from '@/config/H5Pathname'

import { currencyFilter, thousandsFilter } from '@/config/filters'
import { toFixed, isTHSApp, isHLApp } from '@/utils'
import { periodUnitFilter } from '../filters'
import { ORDER_STATUS_MAP } from '@/views/xcbAccount/config/common.js'

import { ssaHoldingDetail, ssaOrderDetail } from '@/apis/xjb'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'
import RateStep from '../components/rateStep.vue'
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
        RateStep,
    },
    props: {},
    data() {
        return {
            showRateTipsPopup: false,
            detailInfo: {},
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

            if (this.interestStep) {
                list.push({
                    label: this.$t('detail.annualisedRate'),
                    value: this.displayRate,
                    icon: this.detailInfo.annualManageFeeRate?.length > 1,
                    name: 'annualisedRate',
                })
            }

            list = list.concat(info)
            return list
        },
        displayRate() {
            const min = formatterFilter(NP.times(this.detailInfo.actualInterestRate || 0, 100))
            return `${min}%`
        },
        displayInterest() {
            const min = formatterFilter(this.detailInfo.actualInterest || 0)
            return `${min}`
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
        isHLApp,
        isTHSApp,
        isEmpty,
        dateFormat,
        getDetails() {
            const params = {
                orderNumber: this.$route.query.orderNumber,
            }
            if (this.isOrderDetail) {
                ssaOrderDetail(params)
                    .then(({ result }) => {
                        console.log(`yinlong ssaOrderDetail`, params, result)
                        this.detailInfo = result
                    })
                    .catch(({ error }) => {
                        console.error(`ssaOrderDetail`, params, error)
                    })
            } else {
                ssaHoldingDetail(params)
                    .then(({ result }) => {
                        console.log(`yinlong ssaHoldingDetail`, params, result)
                        this.detailInfo = result
                    })
                    .catch(({ error }) => {
                        console.error(`ssaHoldingDetail`, params, error)
                    })
            }
        },
        gotoDetails() {
            this.$goPage('/detail', { productCode: this.detailInfo.productCode })
        },
        showTips() {
            const msg = this.$t('orderDetail.tips')
            this.$dialog.confirm({
                title: this.$t('tipTitle'),
                message: msg,
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                messageAlign: 'center',
            })
        },
        showRateTips() {
            this.showRateTipsPopup = this.detailInfo.annualManageFeeRate?.length > 1
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
            if (!item.icon) return
            if (item?.name === 'annualisedRate') {
                this.showRateTips()
            }
        },
        goAdvisor() {
            const { VUE_APP_WEALTH_COUNSELOR_PAGE: url } = pathnames
            this.$goPage(url)
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
        margin: 24px 4px;
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

    .advisor-container {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 24px 0;

        .advisor {
            display: flex;
            align-items: center;
            height: 32px;
            padding: 0 20px;
            background-color: #fff;
            border-radius: 16px;

            img {
                width: 12px;
                height: 12px;
                margin-right: 4px;
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

    .holding-amount-label {
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
            width: 16px;
            height: 16px;
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

    ::v-deep .rate-step {
        #border_all_1px(#efefef,  4px);

        .step-title {
            padding: 8px 10px;
            font-size: 11px;
        }

        .step-body {
            padding-bottom: 0;
            font-size: 14px;
            line-height: 20px;

            .step-item {
                padding: 8px 10px;
            }

            .even {
                background-color: #fff;
            }
        }
    }
}
</style>
