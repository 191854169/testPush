// 产品详情页
<template>
    <div class="detail-container">
        <!-- 站外logo -->
        <logo-ad v-if="isNotInHLAndWTApp"></logo-ad>
        <!-- 产品信息 -->
        <section class="info card">
            <h3 class="name">{{ detailInfo.productName || '--' }}</h3>
            <div class="info-second-line">
                <div :class="`currency-${detailInfo.currency || 'HKD'}`"></div>
                <span class="product-code">{{ detailInfo.productCode || '--' }}</span>
            </div>
            <div class="border-bottom-1px"></div>
            <div class="info-body">
                <div class="rate">
                    <p class="value rise">
                        {{ detailInfo.estimateInterestRateMin | formatterRateFilter }}~{{ detailInfo.estimateInterestRateMax | formatterRateFilter }}
                    </p>
                    <div class="label-container">
                        <p class="info-label">{{ $t('expectedAnnualInterestRate') }}</p>
                        <multi-img name="icon-remind" directory="fund" @click="onQuoteUpdateRemind"></multi-img>
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

        <FooterAdvisors></FooterAdvisors>

        <!-- 同花顺app、同花顺国际版app隐藏定存宝认购及状态入口 -->
        <footer v-if="!isInTHSApp" class="footer-box">
            <button class="subscribeBtn" @click="handlesubscribe" :disabled="!isBottomEnable">{{ bottomText }}</button>
        </footer>
    </div>
</template>

<script>
import CashTradeRule from '../components/CashTradeRule.vue'
import { periodUnitFilter } from '../filters'
import ProgressStep from '@/components/ProgressStep.vue'
import { FINANCE_ACCOUNT } from '@/config/common'
import { i18n } from '@/i18n/common'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import cashRiskMixin from '../mixin/cashRiskMixin.js'
import dayjs from 'dayjs'
import { floatToRatio, keepDecimals, isEmpty, getPageVisibleSupportProperty, humanNum } from '@/utils'
import NP from 'number-precision'
import { ftdProductDetail } from '@/apis/ftd/product.js'
import { ftdSubscribeStatus, ftdSubscribe } from '@/apis/ftd/portfolio.js'
import pathnames from '@/config/H5Pathname'
import { ossDownloadURL } from '@/apis/modules/oss'
import { PRODUCT_TURNOVER_STATUS, PRODUCT_COLLECT_RESULT } from '../config/common.js'
import FooterAdvisors from '@/components/FooterAdvisors.vue'
import { isTHSApp, isTHSI18NApp } from '@/utils/tools'
import ClientSettingMixin from '@/mixins/ClientSettingMixin.js'

const kReminderKey = 'fixedDepositGroupPurchaseReminder'
const NotRemindKey = 'NotRemindKey'

export default {
    name: 'detail',
    // cashRiskMixin 要放在 verifyMixin 后面
    mixins: [verifyMixin, cashRiskMixin, ClientSettingMixin],
    components: {
        CashTradeRule,
        ProgressStep,
        FooterAdvisors,
    },
    data() {
        return {
            detailInfo: {
                // id: 0, // 产品ID
                // productName: '定存一号',
                // productCode: '', // 产品代码
                // currency: '',
                // periodValue: 365, // 投资期限
                // periodUnit: '', // 期限单位，d-按日, w-按周, m-按月, y-按年
                // periodLock: 0, // 产品锁定期
                // interestAccrualTime: '2023-09-05', // 起息日 格式:2023-09-10
                // maturityTime: '2024-06-30', // 到期日 格式:2023-09-10
                // announcedTime: '2023-09-01', // 公布结果日，格式:2023-09-10
                // estimateInterestRateMin: '0.0315', // 最小预计年利率, 去除百分号, /100 的数据
                // estimateInterestRateMax: '0.0489', // 最大预计年利率, 去除百分号, /100 的数据
                // estimateInterestRateDate: '2023-09-14', // 报价更新时间，格式:2023-09-10
                // actualInterestRate: '', // 实际利率, 去除百分号, /100 的数据
                // annualManageFeeRate: '', // 管理费率(年化)
                // serviceFeeRate: {}, // 表现费率(年化), 去除百分号, 梯度费率
                // collectStartTime: '2023-08-10', // 开始认购日
                // collectEndTime: '', // 截止认购日
                // collectedResult: 0, // 募集状态, 0-待公布, 1-募集成功, 2-募集失败
                // minSubscriptionAmount: '', // 起购金额
                // settlementDays: 0, // T+n回款日
                // settlementTime: '2024-07-30', // 回款日，格式:2023-09-10
                // serverTime: '2023-09-14 15:20:10', // 服务器时间，格式:2023-09-10 15:20:10
                // riskRating: 0, // 风险等级，1：低风险，2：中低风险，3：中风险，4：中高风险，5：高风险
                // appRank: 0, // 优先级
                // productAdvantage: '', // 产品亮点
                // productDescription: '', // 产品特点,协商使用 ossId
                // status: 0, // 产品状态, 100-待提交, 200-已提交, 300-即将认购, 320-认购中, 340-认购结束, 400-募集成功, 401-募集失败, 410-已起息, 500-已到期
                // supportSource: [], // 上架渠道
            },
            bottomText: '',
            isBottomEnable: true,
            // 用于当前页面倒计时
            serverTimeUnix: dayjs().unix,
            timerIDs: [],
            didSetGroupBuy: false,
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
        isFinish() {
            return (
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.SubscriptionEnded ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.SuccessfulFundraising ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.FailedFundraising ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.InterestStarted ||
                this.detailInfo.status === PRODUCT_TURNOVER_STATUS.Expired
            )
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
                list = [
                    {
                        message: this.$t('startSubscribe'),
                        label: this.dateFormmater(this.detailInfo.collectStartTime),
                        active: this.compareTime(this.detailInfo.serverTime, this.detailInfo.collectStartTime) >= 0,
                        nextActive: this.compareTime(this.detailInfo.serverTime, this.detailInfo.announcedTime) >= 0,
                    },
                    {
                        message: this.$t('announceResults'),
                        label: this.dateFormmater(this.detailInfo.announcedTime),
                        active: this.compareTime(this.detailInfo.serverTime, this.detailInfo.announcedTime) >= 0,
                        nextActive: this.compareTime(this.detailInfo.serverTime, this.detailInfo.interestAccrualTime) >= 0,
                    },
                    {
                        message: this.$t('startInterest'),
                        label: this.dateFormmater(this.detailInfo.interestAccrualTime),
                        active: this.compareTime(this.detailInfo.serverTime, this.detailInfo.interestAccrualTime) >= 0,
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
        isInTHSApp() {
            return isTHSApp() || isTHSI18NApp()
        },
    },
    async created() {
        await Promise.all([this.getProductDetail(), this.getCashToMarginStatus()])
        //定存宝已开户，且未设置过开团提醒的客户，且未弹窗提示过的客户
        if (await this.$root.getFtdAccountStatus()) {
            try {
                const { result } = await ftdSubscribeStatus()
                console.log(`yinlong ftdSubscribeStatus`, result)
                this.didSetGroupBuy = result.subscribe === 1 // 1: 已订阅 2: 未订阅
                if (!this.didSetGroupBuy) {
                    this.requestClientSetting(NotRemindKey, result => {
                        this.clientSetting = result
                        if (!result?.[kReminderKey]) {
                            this.showTipsIfNeeded()
                        }
                    })
                }
            } catch (error) {
                console.error(`ftdSubscribeStatus`, error)
            }
        }
        this.updateBottomBtnStatus()
        this.registerWatchHandler()
    },
    methods: {
        i18n: text => i18n.t(text),
        async handlesubscribe() {
            if (!this.isBottomEnable) return
            if (!(await this.checkCashTreasureSubscribe())) return
            if (!(await this.checkRiskAssessmentExpiredStatus())) return
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
        onQuoteUpdateRemind() {
            this.$dialog.alert({
                closeOnClickOverlay: true,
                title: this.$t('quoteUpdateTime'),
                message: this.dateFormmater(this.detailInfo.estimateInterestRateDate),
                messageAlign: 'center',
                confirmButtonText: this.$t('iKnow'),
            })
        },

        async getProductDetail() {
            try {
                console.log('get', this.$route.query.productCode)
                const { result } = await ftdProductDetail({
                    productCode: this.$route.query.productCode,
                })
                if (result) {
                    this.detailInfo = result || {}

                    this.serverTimeUnix = dayjs(this.detailInfo.serverTime).unix()
                    // 即将认购的服务，且当前时间还没到开始认购时间，启动定时器；
                    // 认购中的服务，且当前时间还没到认购结束，启动定时器
                    // 其他情况，认购结束，停止定时器
                    if (this.isProductUpComing && NP.minus(this.serverTimeUnix, dayjs(this.detailInfo.collectStartTime).unix()) < 0) {
                        this.startTimer()
                        console.log('startTimer', `isProductUpComing, serverTimeUnix = ${this.serverTimeUnix}`)
                    } else if (
                        this.detailInfo.status === PRODUCT_TURNOVER_STATUS.InSubscription &&
                        NP.minus(this.serverTimeUnix, dayjs(this.detailInfo.collectEndTime).unix()) < 0
                    ) {
                        this.startTimer()
                        console.log('startTimer', `InSubscription, serverTimeUnix = ${this.serverTimeUnix}`)
                    } else {
                        this.stopTimer()
                        console.log('stopTimer', `is finish subscribe, serverTimeUnix = ${this.serverTimeUnix}`)
                    }

                    console.log('result', result)
                }
            } catch (e) {
                this.detailInfo = {}
                console.log('eror', e)
            }
        },
        async updateBottomBtnStatus() {
            const hadOpenCashAccount = await this.$root.getFtdAccountStatus()
            const openFinanceAccount = this.$root.getAccountStatus(FINANCE_ACCOUNT)
            let text = this.$t('subscribeText')
            let bottomBtnEnable = true
            if (this.isProductUpComing) {
                bottomBtnEnable = false
                text = this.$t('forthcomingSubscription')
            } else if (this.isFinish) {
                bottomBtnEnable = false
                text = this.$t('hasFinishSubscribe')
            } else if (!this.$root.isLogin) {
                text = this.$t('subscribeText')
            } else if (!openFinanceAccount) {
                text = this.$t('openBtn')
            } else if (this.isUSNationality) {
                text = this.$t('subscribeText')
            } else if (!hadOpenCashAccount) {
                text = this.$t('openDepositAccount')
            } else if (!this.checkCashToMarginStatus()) {
                text = this.$t('subscribeText')
            } else if (this.isNotInHLAndWTApp) {
                text = this.$t('downloadApp')
            } else {
                text = this.$t('subscribeText')
            }
            this.bottomText = text
            this.isBottomEnable = bottomBtnEnable
        },
        /**
         * 注册页面监听事件
         */
        registerWatchHandler() {
            if (this.registerWatchHandler.watch) return
            if (this.$jsBridge && this.$jsBridge.watchPageVisible) {
                this.$jsBridge.watchPageVisible(this.handlePageVisible)
            } else {
                this.propertyData = getPageVisibleSupportProperty()
                // 刷新页面
                document.addEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
                this.$once('hook:beforeDestroy', () => {
                    document.removeEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
                })
            }
            this.registerWatchHandler.watch = true
        },
        handlePageShow() {
            !document[this.propertyData?.hidden] && this.handlePageVisible()
        },

        handlePageVisible() {
            this.reload()
            console.log('handlePageVisible', `bottomText = ${this.bottomText}`)
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
        async reload() {
            await this.getProductDetail()
            this.updateBottomBtnStatus()
            console.log('reload', `serverTimeUnix = ${this.serverTimeUnix}`)
        },
        async showTipsIfNeeded() {
            this.$dialog.confirm({
                title: this.$t('openGroupBuy'),
                message: this.$t('groupBuyTips'),
                confirmButtonText: this.$t('settingNow'),
                cancelButtonText: this.$t('doNotSet'),
                messageAlign: 'center',
                beforeClose: async (action, done) => {
                    if (action === 'confirm') {
                        try {
                            done()
                            this.$loading.show = true
                            this.setGroupBuy()
                            this.$toast(this.$t('openGroupBuySuccess'))
                            this.$loading.show = false
                        } catch {
                            this.$loading.show = false
                        }
                    } else {
                        done()
                    }
                },
            })

            // 只提醒一次
            this.setClientSetting(NotRemindKey, { ...this.clientSetting, [kReminderKey]: 1 })
        },
        async setGroupBuy() {
            try {
                const { result = {} } = await ftdSubscribe({ subscribe: this.didSetGroupBuy ? 2 : 1 })
                if (result.code === 0) {
                    this.didSetGroupBuy = !this.didSetGroupBuy
                    this.$toast(this.$t(this.didSetGroupBuy ? 'openGroupBuySuccess' : 'closeGroupBuySuccess'))
                }
            } catch (error) {
                console.error(`setGroupBuy`, error)
            }
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
                    this.updateBottomBtnStatus()
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
            color: #ff6907;
            font-weight: bold;
            font-size: 24px;
            line-height: 34px;
        }

        .label-container {
            display: flex;
            align-items: center;

            img {
                width: 14px;
                height: 14px;
                margin-top: 4px;
                margin-left: 5px;
            }
        }
    }

    .term-investment {
        display: flex;
        flex-direction: column;

        .date {
            margin-top: 22px;
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
        margin-top: 4px;
        color: @h2-white;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }
}
</style>
