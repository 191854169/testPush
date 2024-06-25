import { getBasicInfo } from '@/apis/fund/fund.js'
import { UserRiskInfo } from '@/apis/riskAssessment.js'

import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { FINANCE_ACCOUNT, FUND_ACCOUNT, CASH_TO_MARGIN_STATUS } from '@/config/common'
import isOlderAge65 from '@/mixins/AgeLimit'
import isInitedTradePwd, { isNeedToSetTrade } from '@/mixins/initTradePwd'
import { lightHoldings } from '@/apis/wealth/index.js'
import pathnames from '@/config/H5Pathname'
import { isInApp } from '@/config/globalProterties/env'
import { mapState } from 'vuex'
import { Dialog } from 'vant'
import { customerService, getQueryString, isInOutsideH5 } from '@/utils'
import { getC2MApplyStatus } from '@/apis/uc.js'
import HKindentify from '@/mixins/HKIndentify/index.js'

export default {
    mixins: [riskAssessmentMixin, HKindentify],

    data() {
        return {
            isInitAccountWatch: false,
            openAccount: false, // 是否需要展示“立即开户”四个字
            buy: false,
            sell: false,
            selected: false,
            isDisbaled: false, // 是否是被禁止操作
            isOpenedDerivative: false, // 是否开通衍生品权限
            basicInfo: {}, // 当前产品的基础信息
            cashToMarginStatus: 0,
            isRiskMatch: false, // 是否合适性匹配
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        // 美国国籍
        isUSNationality() {
            return this.accts.nationality == 'US'
        },
        // 是否不在恒利或网厅
        isNotInHlOrWt() {
            return !isInApp
        },
        isInCashToMargin() {
            const transferFailed = [
                CASH_TO_MARGIN_STATUS.Pending,
                CASH_TO_MARGIN_STATUS.CSApproved,
                CASH_TO_MARGIN_STATUS.ROApproved,
                CASH_TO_MARGIN_STATUS.PendingTransfer,
                CASH_TO_MARGIN_STATUS.AssetTransferred,
                CASH_TO_MARGIN_STATUS.AccountOpeningFailed,
            ]

            return transferFailed.includes(this.cashToMarginStatus)
        },
    },

    methods: {
        // 获取产品基本信息
        async getBasicInfo({ symbol }) {
            try {
                this.basicInfo = (await getBasicInfo({ symbol }))?.result?.list?.[0] || {}
                return this.basicInfo
            } catch (e) {
                console.log(e)
                throw e
            }
        },
        async getCashToMarginStatus() {
            if (!this.$root.isLogin) return
            try {
                const subAccountId = getQueryString('sub', true) || localStorage.getItem('sub')
                const { result } = await getC2MApplyStatus({ params: { subAccountId } })
                if (result) {
                    this.cashToMarginStatus = result.status || 0
                    console.log('getCashToMarginStatus', 'success')
                }
            } catch (e) {
                console.log('eror', e)
            }
        },
        // 注册开户监听函数
        initAccountWatch() {
            try {
                if (this.$jsBridge && this.$jsBridge.watchPageVisible && !this.isInitAccountWatch) {
                    this.$jsBridge.watchPageVisible(async () => {
                        this.$store.dispatch('user/getUserInfo', false).then(async () => {
                            // 开过户并且衍生品权限存在就不需要执行后续逻辑
                            if (!this.openAccount && this.isOpenedDerivative) return
                            this.openAccount = !this.$root.getAccountStatus(FINANCE_ACCOUNT) || !this.$root.getAccountStatus(FUND_ACCOUNT)
                            this.isOpenedDerivative = this.getDerivativeStatus()
                            this.buy = !this.openAccount && this.isOpenedDerivative
                        })
                    })
                    this.isInitAccountWatch = true
                }
            } catch (e) {
                console.error(e)
            }
        },

        // 获取衍生品权限 - true 有权限 false 无权限 NOTE：promise
        getDerivativeStatus() {
            const accts = this.$store.state.user.accts || {}
            const userDerivative = accts.openDerivative || 0 // 用户的衍生品权限开通状态 - 可能为空
            const bondDerivative = this.basicInfo.isDerivative || 0 // 产品是否需要衍生品知识 - 可能为空
            return userDerivative >= bondDerivative
        },

        // 账户校验
        async accountVerify(isSell) {
            // 登录校验
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            // 开户校验
            if (!this.$root.getAccountStatus(FINANCE_ACCOUNT)) {
                this.$root.nextAfterJudgeAccountStatus('openAccount')
                return false
            }

            if (!this.usNationalityVerify(isSell)) {
                return false
            }
            // 基金开户校验
            if (!this.$root.getAccountStatus(FUND_ACCOUNT)) {
                this.initAccountWatch()
                const params = { hasDerivative: this.basicInfo.isDerivative }
                this.$root.nextAfterJudgeAccountStatus('fundAccount', params)
                return false
            }
            // 交易密码校验
            if (!isInitedTradePwd({ store: this.$store })) return
            // 65岁校验
            if (await isOlderAge65()) return false
            return true
        },
        // 美国国籍检查 优先级高于基金开户/衍生品权限校验/风测
        // 所以 除卖出的情况都当做买入处理
        usNationalityVerify(isSell) {
            console.log(`this.accts.nationality = ${this.accts.nationality}`)
            if (this.isUSNationality) {
                Dialog.confirm({
                    value: true,
                    message: this.$t('notTradableFinancing', { direction: isSell ? this.$t('sell') : this.$t('buy') }),
                    cancelButtonText: this.$t('cancel'),
                    confirmButtonText: this.$t('concatUs'),
                    messageAlign: 'center',
                    className: 'dialog-message-bold',
                })
                    .then(() => {
                        this.gotoOnlineService()
                    })
                    .catch(() => {})
                return false
            }
            return true
        },
        gotoOnlineService() {
            let link = customerService({
                url: true,
            })
            if (this.$jsBridge) {
                this.$jsBridge
                    .getUserinfo()
                    .then(data => {
                        const subAcctId = (((data?.clientInfo || {}).accts || [])[0] || {}).subAcctId || ''
                        const hlid = data?.clientInfo?.hlId || ''
                        link = customerService({
                            url: true,
                            userid: subAcctId,
                            hlid: hlid,
                        })
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
                    .catch(() => {
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
            } else if (this.$mylinkJsbridge.isInMylink()) {
                this.$mylinkJsbridge.openH5InWebview(link)
            } else {
                window.open(link)
            }
        },
        // 风险匹配校验
        // dialog: 自定义 dialog 展示
        // goto: 自定义跳转函数
        async riskMatchVerify(key, dialog, goto) {
            // 风险匹配校验
            const { riskRating } = this.basicInfo
            const res = await UserRiskInfo({
                params: {
                    subAcctId: this.$store.getters['user/getSubAccountId'],
                },
            })
            const basicInfo = this.basicInfo
            const fund = Object.assign(basicInfo, { riskRating })
            const fRes = fund || {} // 基金基础风险信息

            const isMatch = (res = {}, fRes = {}) => {
                const matchDerivative = res?.result?.openDerivative === 1 || fRes.isDerivative === 0
                const matchRisk = res?.result?.riskLevel >= fRes.riskRating
                const matchInvestObjective = res?.result?.investmentObjective >= fRes.investObjective
                const matchInvestmentExperience = res?.result?.investmentExperience >= fRes.investYear
                return { matchDerivative, matchRisk, matchInvestObjective, matchInvestmentExperience }
            }

            const isMatchResult = isMatch(res, fRes)
            // 匹配结果 依次排序 （衍生品 风险等级 投资目标 投资年期）
            this.matchRes = `${+isMatchResult.matchDerivative}${+isMatchResult.matchRisk}${+isMatchResult.matchInvestObjective}${+isMatchResult.matchInvestmentExperience}`
            this.isRiskMatch =
                isMatchResult.matchDerivative &&
                isMatchResult.matchRisk &&
                isMatchResult.matchInvestObjective &&
                isMatchResult.matchInvestmentExperience
            console.log('风测匹配结果:', isMatchResult)

            // 衍生品权限校验 !优先于 风险测评校验
            if (!this.isOpenedDerivative) {
                // 跳转到衍生品开启页面
                if (goto) {
                    goto(key)
                } else {
                    this.jumpToPage(key)
                }
                return false
            }

            // 风险测评校验
            const data = await this.getAssessStatus()
            console.log('getAssessStatus ==> ', data)
            const { result } = data || {}
            const { isAssessed, isExpired } = result || {}
            let { VUE_APP_RISK_PAGE: link } = pathnames
            link += '?isToResult=2' // isToResult 1 跳 2 不跳转
            link = this.$addCurParamsForUrl(link)
            if (isInOutsideH5()) {
                // 睿银等站外H5加url参数测评完成后跳回原来页面
                const fundDetailPage = `${pathnames.VUE_APP_WEALTH_FUND_PAGE}detail`
                const billsDetailPage = `${pathnames.VUE_APP_WEALTH_FUND_PAGE}bills/detail`
                const url = this.$route.path.includes('bills') ? billsDetailPage : fundDetailPage
                const urlParams = encodeURIComponent(this.$addCurParamsForUrl(url))
                link += `&url=${urlParams}`
            }
            if (isAssessed === this.NO_ASSESS) {
                // 跳转到测评页
                this.handleEvaluate(link, { replace: false })
                return false
            }

            if (isExpired === this.EXPIRED) {
                // 重新测评提示
                this.handleEvaluate(link, { replace: false })
                return false
            }

            if (!this.isRiskMatch) {
                // 风险等级不匹配 弹框提示 + 跳转到风险不匹配页面
                if (dialog) {
                    dialog(res.result)
                    return false
                }
                this.$dialog
                    .confirm({
                        title: this.$t('tipTitle'),
                        message: this.$t('noMatchTip'),
                        showCancelButton: true,
                        confirmButtonText: this.$t('learnReason'),
                    })
                    .then(() => {
                        localStorage.setItem(
                            'matchRiskInfo',
                            JSON.stringify({
                                fund: {
                                    riskRating,
                                    symbol: this.$route.query.symbol,
                                },
                                user: {
                                    ...(res.result || {}),
                                },
                            })
                        )
                        this.$goPage('/no-matched-risk', {}, { pathname: '/wealth/fund.html' })
                    })
                return false
            }
            return true
        },
        // 风测不匹配公共弹窗
        riskMatchDialog(result, investFocusDegree) {
            const { riskRating } = this.basicInfo
            this.$dialog
                .confirm({
                    title: this.$t('tipTitle'),
                    message: this.$t('noMatchTip_view'),
                    showCancelButton: true,
                    confirmButtonText: this.$t('noMatchTip_view_why'),
                })
                .then(() => {
                    localStorage.setItem(
                        'matchRiskInfo',
                        JSON.stringify({
                            fund: {
                                riskRating,
                                symbol: this.$route.query.symbol,
                            },
                            user: {
                                ...(result || {}),
                            },
                        })
                    )
                    this.$goPage('/no-matched-risk', { investFocusDegree }, { pathname: '/wealth/fund.html' })
                })
                .catch(() => {})
        },
        // 校验测评过后 风测是否过期 false - 过期 true - 未过期
        async checkRiskAssessmentExpiredStatus() {
            try {
                const data = await this.getAssessStatus()
                const { isExpired, isAssessed } = data?.result || {}
                let { VUE_APP_RISK_PAGE: link } = pathnames
                link = this.$addCurParamsForUrl(link)
                // 未做风测
                if (isAssessed == this.NO_ASSESS) {
                    this.confirmDialog(4, link, {}, { replace: false })
                    return false
                }
                // 风测过期
                if (isAssessed === this.ASSESSED && isExpired === this.EXPIRED) {
                    this.confirmDialog(5, link, {}, { replace: false })
                    return false
                }
                return true
            } catch (e) {
                if (e?.error?.data?.tips) {
                    this.$toast(e.error.data.tips)
                } else {
                    this.$toast(this.$t('networkFailTimeOut'))
                }
                return false
            }
        },

        async isOlderAge65() {
            return isOlderAge65()
        },

        async initButtons({ symbol = this.$route.query.symbol } = {}) {
            await this.getBasicInfo({ symbol })
            try {
                if (!this.$root.isLogin) {
                    // 特殊操作 用来支持展示buy方式
                    this.openAccount = false
                    this.isOpenedDerivative = true
                    this.buy = true
                    this.sell = false
                } else {
                    this.openAccount = !this.$root.getAccountStatus(FINANCE_ACCOUNT) || !this.$root.getAccountStatus(FUND_ACCOUNT) // 按理应该是 true
                    this.isOpenedDerivative = this.getDerivativeStatus()
                    this.buy = !this.openAccount && this.isOpenedDerivative
                }
                try {
                    // 未设置交易密码无法查询持仓
                    if (!isNeedToSetTrade(this.$store)) {
                        const { result } = await lightHoldings({ symbol, count: 2, start: 0 })
                        this.hasHolding = result?.list?.length > 0
                        this.sell = !this.openAccount && this.hasHolding && !this.notSell // notSell 是否禁止卖出 票据不可卖
                    }
                } catch (e) {
                    console.error(e)
                }
            } catch (e) {
                console.error(e)
                // 接口/出错时 默认为未登录
                this.openAccount = false
                this.isOpenedDerivative = true
                this.buy = true
                this.sell = false
            }
            this.generateFooterButton()
        },

        // 现金宝 认购校验
        async checkCashTreasureSubscribe() {
            // 登录校验
            if (!this.$mylinkJsbridge.isInMylink()) {
                if (!this.$root.isLogin) {
                    return this.$root.login()
                }
            }

            // 开户校验
            if (!this.$root.getAccountStatus(FINANCE_ACCOUNT)) {
                this.$root.nextAfterJudgeAccountStatus('openAccount')
                return false
            }

            if (this.isUSNationality) {
                Dialog.confirm({
                    value: true,
                    title: this.$t('prompt'),
                    message: this.$t('cantSubscribe'),
                    cancelButtonText: this.$t('cancel'),
                    confirmButtonText: this.$t('onlineService'),
                    messageAlign: 'left',
                })
                    .then(() => {
                        this.gotoOnlineService()
                    })
                    .catch(() => {})
                return false
            }

            // 基金开户校验
            if (!this.$root.getAccountStatus(FUND_ACCOUNT)) {
                this.initAccountWatch()
                const params = { hasDerivative: this.basicInfo.isDerivative }
                this.$root.nextAfterJudgeAccountStatus('fundAccount', params)
                return false
            }
            // 交易密码校验
            if (!isInitedTradePwd({ store: this.$store })) return false

            return true
        },
        // 现金转融资校验
        checkCashToMarginStatus() {
            if (this.isInCashToMargin) {
                this.$dialog.alert({
                    closeOnClickOverlay: true,
                    title: this.$t('prompt'),
                    message: this.$t('cashToMarginTip'),
                    messageAlign: 'center',
                    confirmButtonText: this.$t('iKnow'),
                })
                return false
            }
            return true
        },
    },
}
