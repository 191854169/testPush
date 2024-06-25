import { FINANCE_ACCOUNT, FUND_ACCOUNT } from '@/entries/Fund.js'
import isOlderAge65 from '@/mixins/AgeLimit'
import pathnames from '@/config/H5Pathname.js'
import isInitedTradePwd from '@/mixins/initTradePwd'
import { PORTFOLIO_TYPE_MAP } from '../../config/common'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import { customerService } from '@/utils'

export default {
    data() {
        return {
            infoData: {},
        }
    },
    mixins: [verifyMixin],
    created() {},
    computed: {
        _type() {
            return this.infoData.portfolioType || this.infoData.type
        },
        _isFund() {
            return this._type === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        _isHkStock() {
            return this._type === PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK
        },
        _isMixMarket() {
            return this._type === PORTFOLIO_TYPE_MAP.keysMap.mixin
        },
    },
    methods: {
        gotoOpenAccount() {
            this.$root.nextAfterJudgeAccountStatus('openAccount')
        },
        checkLogin() {
            if (this.$root.isLogin) {
                return true
            }
            return this.$root.login(), false
        },
        checkAccount(info) {
            this.infoData = info
            if (!this.$root.getAccountStatus(FINANCE_ACCOUNT)) {
                this.$titleDialog
                    .show({
                        title: this.$t('follow.openAaccountFirst'),
                        confirmText: this.$t('openBtn'),
                    })
                    .then(() => {
                        this.$root.nextAfterJudgeAccountStatus('openAccount')
                    })
                    .catch(() => {})
                return false
            }
            if (!this.usNationalityVerify(false)) {
                return false
            }
            // 如果是基金 - 需要理财户
            if (this._isFund) {
                if (!this.$root.getAccountStatus(FUND_ACCOUNT)) {
                    this.$root.nextAfterJudgeAccountStatus('fundAccount')
                    return false
                }
            }
            return true
        },
        /**
         * @param { Array } productRisks 产品的风险等级信息，包含产品基本信息
         * @param { Object } productRisks.name 名称
         * @param { Object } productRisks.code code
         * @param { Object } productRisks.risk 风测等级 - 仅限基金
         * @returns { Boolean } 风测权限是否匹配 TRUE 匹配 FALSE 不匹配
         */
        async checkRisk() {
            // 风险测评校验
            const data = await this.getAssessStatus()
            console.log('getAssessStatus ==> ', data)
            const { result } = data || {}
            const { isAssessed, isExpired } = result || {}

            let { VUE_APP_RISK_PAGE: link } = pathnames
            link += '?isToResult=2' // isToResult 1 跳 2 不跳转
            link = this.$addCurParamsForUrl(link)
            // 未做风测
            if (isAssessed === this.NO_ASSESS) {
                // 跳转到测评页
                this.handleEvaluate(link, { replace: false })
                return false
            }
            // 风测过期
            if (isExpired === this.EXPIRED) {
                // 重新测评提示
                this.handleEvaluate(link, { replace: false })
                return false
            }

            return true
        },
        // 投资组合
        async check(info) {
            this.infoData = info
            // 登录
            if (!this.checkLogin()) return false
            // 账户
            if (!this.checkAccount(info)) return false

            if (this._isFund) {
                // 风测
                if (!(await this.checkRisk())) return false
            }
            // 65岁校验
            if (await isOlderAge65()) return false
            // 交易密码校验
            if (!isInitedTradePwd({ store: this.$store })) return false
            // 港股、基金、(混合市场) 限制，美股不需要限制
            if (this._isFund || this._isHkStock || this._isMixMarket) {
                if (!(await this.HKIndentifyCheckIndentify())) {
                    console.log('香港标识符-未签署')
                    return false
                }
            }
            return true
        },
        // 投顾组合
        async checkInvestment(info) {
            this.infoData = info
            // 登录
            if (!this.checkLogin()) return false
            // 账户
            if (!this.checkAccount(info)) return false
            // 检查账户是否已冻结
            if (this.isAccountSuspend()) {
                this.showAccountSuspendDialog()
                return false
            }
            // 是否开通理财户
            if (!this.$root.getAccountStatus(FUND_ACCOUNT)) {
                this.$root.nextAfterJudgeAccountStatus('fundAccount')
                return false
            }

            // 交易密码校验
            if (!isInitedTradePwd({ store: this.$store })) return false

            // 投顾组合买入判断不需要判断产品是不是基金
            // 风测
            if (!(await this.checkRisk())) return false
            return true
        },
        // 账号已冻结
        isAccountSuspend() {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const { suspendStatus } = userInfo?.clientInfo?.accts?.[0] ?? {}
            return suspendStatus === 1
        },
        showAccountSuspendDialog() {
            this.$dialog
                .confirm({
                    value: true,
                    title: this.$t('prompt'),
                    message: this.$t('tradeDialog.freezeText2'),
                    cancelButtonText: this.$t('cancel'),
                    confirmButtonText: this.$t('concatUs'),
                    messageAlign: 'center',
                })
                .then(() => {
                    this.contactCustomerService()
                })
                .catch(() => {})
        },
        // 联系客服
        contactCustomerService() {
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
                        console.log(link) // test
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
                    .catch(() => {
                        console.log(link) // test
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
            } else {
                window.open(link)
            }
        },
    },
}
