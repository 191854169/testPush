import verifyMixin from '@/mixins/business/verifyMixins.js'
import { UserRiskInfo } from '@/apis/riskAssessment.js'
import { FUND_ACCOUNT } from '@/config/common'
import { Dialog } from 'vant'
import pathnames from '@/config/H5Pathname'
import { RISK_RATING_MAP } from '@/views/fund/config/common.js'

export default {
    mixins: [verifyMixin],
    data() {
        return {}
    },
    async created() {},
    methods: {
        // 星财宝专户 认购校验
        async checkStarZHSubscribe() {
            if (!this.$root.isLogin) {
                return this.$root.login()
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

            if (!(await this.$root.getStarSpecialAccountStatus())) {
                const { VUE_APP_STARSPECIALACCOUNT_OPEN_ACCOUNT_PAGE: url } = pathnames
                this.$goPage(url, {}, { pathname: '' })
                return false
            }

            // 基金开户校验
            if (!this.$root.getAccountStatus(FUND_ACCOUNT)) {
                this.initAccountWatch()
                const params = { hasDerivative: this.basicInfo.isDerivative }
                this.$root.nextAfterJudgeAccountStatus('fundAccount', params)
                return false
            }

            return true
        },

        async checkStarZHAssessmentStatus() {
            try {
                const data = await this.getAssessStatus()
                const { isExpired, isAssessed } = data?.result || {}
                let { VUE_APP_RISK_PAGE: link } = pathnames
                link = this.$addCurParamsForUrl(link)
                const userRisk = await UserRiskInfo({
                    params: {
                        subAcctId: this.$store.getters['user/getSubAccountId'],
                    },
                })
                const { riskLevel } = userRisk?.result || {}
                console.log(`userRisk`, userRisk)
                // 未做风测
                if (isAssessed === this.NO_ASSESS) {
                    this.confirmDialog(4, link, { message: this.$t('notDoneTips') }, { replace: false })
                    return false
                }

                // 风险等级中度及以上
                if (riskLevel < RISK_RATING_MAP.keysMap.middleLowRisk) {
                    this.confirmDialog(
                        5,
                        link,
                        { message: this.$t('notMatchMsg', { lv: RISK_RATING_MAP.keyValueMap[riskLevel] }), confirmButtonText: this.$t('reEvaluate') },
                        { replace: false }
                    )
                    return false
                }
                // 风测过期
                if (isAssessed === this.ASSESSED && isExpired === this.EXPIRED) {
                    this.confirmDialog(5, link, { message: this.$t('expiredTips'), confirmButtonText: this.$t('reEvaluate') }, { replace: false })
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
    },
}
