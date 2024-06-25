import { i18n } from '@/i18n/riskAssessment/index.js'
import { i18n as ci18n } from '@/i18n/fixedDepositTreasure'
import { Dialog } from 'vant'
import { RISK_RATING_MAP } from '@/views/fund/config/common.js'
// import { router } from '@/router/riskAssessment'
import pathnames from '@/config/H5Pathname.js'

const reEvaluateData = {
    1: { message: i18n.t('twiceTips'), btnText: i18n.t('reTest') },
    2: { message: i18n.t('upTwiceTips'), btnText: i18n.t('gotIt') }, // 当日已测评2次
    3: { message: i18n.t('frequentTips'), btnText: i18n.t('reTest') }, // 一年超过5次，第6次测评时提示
    4: { message: i18n.t('notDoneTips'), btnText: i18n.t('goEvaluate') }, // 未进行过测评，提示语
    5: { message: ci18n.t('expiredTips'), btnText: i18n.t('goEvaluate') }, // 测评过期提示语
    6: { message: i18n.t('sevenTips'), btnText: i18n.t('concatUs') }, // 一年测评超过6次，第7次测评时提示
}
export default {
    data() {
        return {}
    },
    methods: {
        /**
         * 弹窗二次确认
         * @param {*} type 必选参数，对应上面reEvaluateData的key值, 2表示当日测评次数已用完
         * @param {*} url 可选参数，其它页面跳测评开始页，需要传url地址,如https://h5-sit.xingyunplan.com/wealth/riskAssessment.html#/start
         */
        // eslint-disable-next-line max-params
        confirmDialog(type = 1, url = '', dialogOptions = {}, options = {}) {
            const flag = type != 2
            Dialog.confirm({
                title: i18n.t('prompt'),
                message: reEvaluateData[type]['message'],
                showCancelButton: flag,
                messageAlign: 'left',
                width: '75%',
                className: 'custom-dialog',
                overlayClass: 'custom-overlay',
                confirmButtonText: reEvaluateData[type]['btnText'],
                ...dialogOptions,
            })
                .then(() => {
                    if (flag) {
                        // 一年测评超过6次，第7次测评时提示
                        if (type === 6) {
                            location.href = `${location.origin}/wealth/fund.html#/services`
                            return
                        }
                        !url ? this.$router.replace({ name: 'start' }) : this.goPage(url, options)
                    }
                })
                .catch(() => {})
        },

        isRiskNotMatch(result) {
            const { riskRating } = this.basicInfo
            this.$dialog
                .confirm({
                    title: this.$t('tipTitle'),
                    message: this.$t('notMatchMsg', { lv: RISK_RATING_MAP.keyValueMap[result.riskLevel] }),
                    showCancelButton: true,
                    confirmButtonText: i18n.t('reEvaluate'),
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
                    // router.replace({ name: 'start' })
                    // this.$goPage('/no-matched-risk', {}, { pathname: '/wealth/fund.html' })
                    // this.$goPage('/index', {}, { pathname: '/wealth/riskAssessment.html' })
                    // isToResult 1 跳 2 不跳转
                    this.goPage(this.$addCurParamsForUrl(pathnames.VUE_APP_RISK_PAGE + '?isToResult=2'), { replace: false })
                })
        },
    },
}
