// 产品详情页
<template>
    <div class="detail-container">
        <!-- 站外logo -->
        <logo-ad v-if="isNotInHLAndWTApp"></logo-ad>
        <!-- 产品信息 -->
        <section class="info card">
            <h3 class="name">{{ detailInfo.productName || '--' }}</h3>
            <div class="info-second-line">
                <div class="currency" :class="`currency-${detailInfo.currency || 'HKD'}`"></div>
                <span class="product-code">{{ detailInfo.productCode || '--' }}</span>
            </div>
            <div class="border-bottom-1px"></div>
            <div class="info-body">
                <div class="rate">
                    <p class="value">{{ detailInfo.actualInterestRate | formatterRateFilter }}</p>
                    <div class="label-container" @click="displayStep = !displayStep">
                        <p class="info-label">{{ $t('list.expectedAnnualInterestRate') }}</p>
                        <div class="pos-r">
                            <multi-img
                                v-if="detailInfo.annualManageFeeRate?.length > 1"
                                class="displayStepimg"
                                :name="displayStep ? 'up-16' : 'down-16'"
                                directory="common"
                            ></multi-img>
                            <multi-img v-if="displayStep" class="icon-up" name="icon_up" directory="xcbAccount"></multi-img>
                        </div>
                    </div>
                </div>
                <div class="term-investment">
                    <p class="date">{{ investmentTerm }}</p>
                    <p class="info-label">{{ $t('termOfInvestment') }}</p>
                </div>
                <div class="term-investment min-purchase">
                    <p class="date">{{ detailInfo.minSubscriptionAmount | formatAmountFilter }}</p>
                    <p class="info-label">{{ $t('minPurchaseAmount') }}</p>
                </div>
            </div>
            <div v-if="displayStep && detailInfo.annualManageFeeRate?.length > 1" class="rate-step-container">
                <RateStep
                    :list="detailInfo.annualManageFeeRate"
                    :before-rate="detailInfo.actualInterestRate"
                    :currency="detailInfo.currency"
                ></RateStep>
                <div class="rate-step-tips">{{ $t('detail.rateTips') }}</div>
            </div>
        </section>
        <!-- 产品进度 -->
        <ProgressStep class="progress card" :stepList="stepList"></ProgressStep>

        <!-- 产品特点 -->
        <section class="feature card" v-if="!emptyOSSID">
            <h3 class="card-title">{{ $t('productFeature') }}</h3>
            <img class="feature-img" :src="imgSrc" alt="feature" />
        </section>

        <!-- 交易规则 -->
        <CashTradeRule :ruleList="tradeRuleList"></CashTradeRule>

        <!-- 专属顾问,不在同花顺展示 中显示 -->
        <div class="advisor-container" v-if="isHLApp()">
            <div class="advisor" @click="goAdvisor">
                <multi-img name="icon_service2" directory="common"></multi-img>
                {{ $t('dedicatedAdvisors') }}
            </div>
        </div>

        <footer class="footer-box">
            <button class="subscribeBtn" @click="handlesubscribe" :disabled="buttonStatus.disabled">{{ buttonStatus.text }}</button>
        </footer>
    </div>
</template>

<script>
import CashTradeRule from '../components/CashTradeRule.vue'
import RateStep from '../components/rateStep.vue'
import { periodUnitFilter } from '../filters'
import ProgressStep from '@/components/ProgressStep.vue'
import { i18n } from '@/i18n/common'
import starZHVerifyMixin from '../mixin/starZHVerifyMixin.js'
import dayjs from 'dayjs'
import { floatToRatio, keepDecimals, isEmpty, humanNum, isHLApp, isTHSApp } from '@/utils'
import NP from 'number-precision'
import { ssaProductDetail } from '@/apis/xjb/product.js'
import pathnames from '@/config/H5Pathname'
import { ossDownloadURL } from '@/apis/modules/oss'
import { PRODUCT_TURNOVER_STATUS, PRODUCT_COLLECT_RESULT } from '../config/common.js'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'

export default {
    name: 'detail',
    mixins: [starZHVerifyMixin, watchPageVisibleMixin],
    components: {
        CashTradeRule,
        ProgressStep,
        RateStep,
    },
    data() {
        return {
            detailInfo: {},
            // 用于当前页面倒计时
            serverTimeUnix: dayjs().unix,
            timerIDs: [],
            displayStep: true,
            buttonStatus: {},
        }
    },
    computed: {
        isProductUpComing() {
            return (
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.PendingSubmission ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.Submitted ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.UpcomingSubscription
            )
        },
        isFinish() {
            return (
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.SubscriptionEnded ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.SuccessfulFundraising ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.FailedFundraising ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.InterestStarted ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.Expired
            )
        },
        investmentTerm() {
            if (this.detailInfo.periodValue) {
                return periodUnitFilter(this.detailInfo.periodUnit, this.detailInfo.periodLock)
            }
            return '--'
        },
        imgOssId() {
            let ossId = ''
            if (this.detailInfo.productDescription) {
                try {
                    const parsedDescription = JSON.parse(this.detailInfo.productDescription)
                    ossId = parsedDescription.ossId
                } catch (e) {
                    console.log('imgOssId', e)
                }
            }
            return ossId
        },
        imgSrc() {
            return ossDownloadURL(this.imgOssId)
        },
        emptyOSSID() {
            return this.imgOssId === '' || isEmpty(this.imgOssId)
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
        isNotInHLAndWTApp() {
            return !this.$env.isInApp
        },
        stepList() {
            let list = []
            if (this.detailInfo.collectedResult === PRODUCT_COLLECT_RESULT.TO_BE_ANNOUNCED) {
                // 待公布，高亮停留在认购时间
                list = [
                    {
                        message: this.$t('startSubscribe'),
                        label: this.dateFormmater(this.detailInfo.collectStartTime),
                        active: this.compareTime(this.detailInfo.serverTime, this.detailInfo.collectStartTime) >= 0,
                        nextActive: false,
                    },
                    {
                        message: this.$t('announceResults'),
                        label: this.dateFormmater(this.detailInfo.announcedTime),
                        active: false,
                        nextActive: false,
                    },
                    {
                        message: this.$t('startInterest'),
                        label: this.dateFormmater(this.detailInfo.interestAccrualTime),
                        active: false,
                        nextActive: false,
                    },
                    {
                        message: this.$t('expire'),
                        label: this.dateFormmater(this.detailInfo.maturityTime),
                        active: false,
                        nextActive: false,
                    },
                    {
                        message: this.$t('settled'),
                        label: this.dateFormmater(this.detailInfo.settlementTime),
                        active: false,
                    },
                ]
            } else if (this.detailInfo.collectedResult === PRODUCT_COLLECT_RESULT.FAILED) {
                // 失败
                list = [
                    {
                        message: this.$t('startSubscribe'),
                        label: this.dateFormmater(this.detailInfo.collectStartTime),
                        active: true,
                        nextActive: true,
                    },
                    {
                        message: this.$t('announceResults'),
                        label: this.dateFormmater(this.detailInfo.announcedTime),
                        active: true,
                        nextActive: true,
                    },
                    {
                        message: this.$t('finish'),
                        label: this.dateFormmater(this.detailInfo.announcedTime),
                        active: true,
                    },
                ]
            } else {
                // 成功，高亮按时间推进
                // 公布
                const announced = this.compareTime(this.detailInfo.serverTime, this.detailInfo.announcedTime) >= 0
                // 起息
                const interestAccrual = this.compareTime(this.detailInfo.serverTime, this.detailInfo.interestAccrualTime) >= 0
                list = [
                    {
                        message: this.$t('startSubscribe'),
                        label: this.dateFormmater(this.detailInfo.collectStartTime),
                        active: this.compareTime(this.detailInfo.serverTime, this.detailInfo.collectStartTime) >= 0,
                        nextActive: announced,
                    },
                    {
                        message: this.$t('announceResults'),
                        label: this.dateFormmater(this.detailInfo.announcedTime),
                        active: announced,
                        nextActive: this.compareTime(this.detailInfo.serverTime, this.detailInfo.interestAccrualTime) >= 0,
                    },
                    {
                        message: this.$t('startInterest'),
                        label: this.dateFormmater(this.detailInfo.interestAccrualTime),
                        active: announced && interestAccrual,
                        nextActive: this.compareTime(this.detailInfo.serverTime, this.detailInfo.maturityTime) >= 0,
                    },
                    {
                        message: this.$t('expire'),
                        label: this.dateFormmater(this.detailInfo.maturityTime),
                        active: this.compareTime(this.detailInfo.serverTime, this.detailInfo.maturityTime) >= 0,
                        nextActive: this.compareTime(this.detailInfo.serverTime, this.detailInfo.settlementTime) >= 0,
                    },
                    {
                        message: this.$t('settled'),
                        label: this.dateFormmater(this.detailInfo.settlementTime),
                        active: this.compareTime(this.detailInfo.serverTime, this.detailInfo.settlementTime) >= 0,
                    },
                ]
            }
            return list
        },
    },
    async created() {
        Promise.all([this.getProductDetail(), this.getCashToMarginStatus()]).then(() => {
            this.updateButtonStatus()
        })

        this.watch(() => {
            this.reload()
        })
    },
    methods: {
        isHLApp,
        isTHSApp,
        async getProductDetail() {
            try {
                const { result } = await ssaProductDetail({ productCode: this.$route.query.productCode })
                this.detailInfo = result || {}

                this.serverTimeUnix = dayjs(this.detailInfo.serverTime).unix()
                // 即将认购的服务，且当前时间还没到开始认购时间，启动定时器；
                // 认购中的服务，且当前时间还没到认购结束，启动定时器
                // 其他情况，认购结束，停止定时器
                if (this.isProductUpComing && NP.minus(this.serverTimeUnix, dayjs(this.detailInfo.collectStartTime).unix()) < 0) {
                    this.startTimer()
                } else if (
                    this.detailInfo.status === PRODUCT_TURNOVER_STATUS.InSubscription &&
                    NP.minus(this.serverTimeUnix, dayjs(this.detailInfo.collectEndTime).unix()) < 0
                ) {
                    this.startTimer()
                } else {
                    this.stopTimer()
                }
                console.log('getProductDetail', result)
            } catch (e) {
                this.detailInfo = {}
                console.error('getProductDetail', e)
            }
        },
        async handlesubscribe() {
            if (this.buttonStatus.disabled) return
            if (!(await this.checkStarZHSubscribe())) return
            if (!(await this.checkStarZHAssessmentStatus())) return
            if (!this.checkCashToMarginStatus()) return
            if (this.isNotInHLAndWTApp) {
                const { VUE_APP_FOSUN_DOWNLOAD_PAGE: fosunAppDownloadUrl } = pathnames
                this.$goPage(fosunAppDownloadUrl)
                return
            }
            this.gotoSubscribe()
        },
        gotoSubscribe() {
            const productCode = this.$route.query.productCode
            const activityID = this.$route.query.activityID
            if (activityID) {
                this.$goPage('/subscribe', { productCode: productCode, activityID: activityID })
            } else {
                this.$goPage('/subscribe', { productCode: productCode })
            }
        },
        dateFormmater(v) {
            return v ? v.slice(0, 10).replace(/-/g, '/') : '--'
        },
        compareTime(currentTime, targetTime) {
            if (currentTime && targetTime) {
                return dayjs(currentTime).diff(targetTime)
            }
            return -1
        },

        startTimer() {
            console.log('detail', 'startTimer')
            this.stopTimer()
            const id = setInterval(() => {
                this.serverTimeUnix += 60

                // 即将认购的服务，且当前时间到达开始认购时间，刷新数据；
                if (this.isProductUpComing && NP.minus(this.serverTimeUnix, dayjs(this.detailInfo.collectStartTime).unix()) >= 0) {
                    this.reload()
                    console.log('reload', `isProductUpComing, serverTimeUnix = ${this.serverTimeUnix}`)
                }
                // 认购中的服务，且当前时间到达认购结束，刷新数据；
                if (
                    this.detailInfo.status === PRODUCT_TURNOVER_STATUS.InSubscription &&
                    NP.minus(this.serverTimeUnix, dayjs(this.detailInfo.collectEndTime).unix()) >= 0
                ) {
                    this.reload()
                    console.log('reload', `InSubscription, serverTimeUnix = ${this.serverTimeUnix}`)
                }
            }, 1000 * 60)
            this.timerIDs.push(id)
        },
        stopTimer() {
            this.timerIDs.forEach(id => {
                clearInterval(id)
            })
            this.timerIDs = []
        },
        goAdvisor() {
            const { VUE_APP_WEALTH_COUNSELOR_PAGE: url } = pathnames
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            this.$goPage(url)
        },
        async reload() {
            await this.getProductDetail()
            await this.updateButtonStatus()
        },
        async updateButtonStatus() {
            const obj = {
                disabled: false,
                text: this.$t('subscribeText'),
            }
            if (this.isProductUpComing) {
                obj.disabled = true
                obj.text = this.$t('forthcomingSubscription')
            } else if (this.isFinish) {
                obj.disabled = true
                obj.text = this.$t('hasFinishSubscribe')
            } else if (!this.$root.isLogin) {
                // do nothing
            } else if (this.isUSNationality) {
                // do nothing
            } else if (!(await this.$root.getStarSpecialAccountStatus())) {
                obj.text = this.$t('openStarSpecial')
            } else if (!this.checkCashToMarginStatus()) {
                // do nothing
            } else if (this.isNotInHLAndWTApp) {
                obj.text = this.$t('downloadApp')
            }
            this.buttonStatus = obj
        },
    },
    filters: {
        formatterRateFilter(v) {
            if (v) {
                const value = NP.times(v, 100)
                return floatToRatio(keepDecimals(value, 2), { sign: false })
            }
            return '--'
        },
        formatAmountFilter(v) {
            return v ? humanNum(v, 0, true, i18n, { needQianWanUnit: true, needQianUnit: true }) : '--'
        },
    },
    watch: {
        '$root.isLogin': {
            async handler(v) {
                if (typeof v === 'boolean' && v) {
                    await this.getCashToMarginStatus()
                    this.reload()
                }
            },
        },
    },
}
</script>

<style scoped lang="less">
.detail-container {
    margin: 0 12px;
    background: #f9f9f9;
    user-select: none;
    #iosBottom();
    // 模拟底部模块的高度
    &::after {
        display: block;
        height: 62px;
        content: '';
    }

    .footer-box {
        #iosBottom();

        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        max-width: 375px;
        margin: 0 auto;
        background: #fff;
        box-shadow: inset 0 0.5px 0 #efefef;

        .subscribeBtn {
            display: block;
            width: calc(100% - 56px);
            margin: 3px auto;
            color: @btn-font-white;
            font-weight: 700;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background-color: @theme-white;
            border: none;
            border-radius: 28px;
            outline: none;

            &:disabled {
                opacity: 0.3;
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

    .card-title {
        color: #2f2f2f;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
    }

    .feature-img {
        margin-top: 19px;
        border-radius: 8px;
    }
}

.name {
    color: #2f2f2f;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
}

.currency {
    display: inline-block;
    height: 11px;
}

.info-second-line {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 8px;
    margin-bottom: 16px;

    .product-code {
        margin-left: 4px;
        color: @h2-white;
        font-weight: 400;
        font-size: 11px;
        line-height: 14px;
    }
}

.info-body {
    display: flex;
    justify-content: space-between;

    .rate {
        display: flex;
        flex-direction: column;
        place-content: flex-start center;

        .value {
            margin-top: 12px;
            margin-bottom: 4px;
            color: #ff6907;
            font-weight: bold;
            font-size: 24px;
            line-height: 34px;
        }

        .label-container {
            display: flex;
            align-items: center;

            .displayStepimg {
                position: relative;
                width: 14px;
                height: 14px;
                margin-left: 5px;
            }

            .icon-up {
                position: absolute;
                bottom: -12px;
                left: 60%;
                width: 14px;
                height: 10px;
                transform: translateX(-50%) translateY(15%);
            }
        }
    }

    .term-investment {
        display: flex;
        flex-direction: column;

        .date {
            margin-top: 22px;
            margin-bottom: 6px;
            color: @h1-white;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }
    }

    .min-purchase {
        text-align: right;
    }

    .info-label {
        margin-bottom: 4px;
        color: @h2-white;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }
}

.rate-step-container {
    margin-top: 12px;

    .rate-step-tips {
        margin-top: 12px;
        color: @h3-white;
        font-size: 10px;
        line-height: 16px;
        text-align: left;
    }
}
</style>
