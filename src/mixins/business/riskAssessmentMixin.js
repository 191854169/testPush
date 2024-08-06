/**
 * 风险测评点击重新测评业务逻辑复用
 */

import { Dialog } from 'vant'
import { AssessStatus } from '@/apis/riskAssessment.js'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
import { i18n } from '@/i18n/riskAssessment/index.js'
import { getQueryString } from '@/utils'
import { isInOutsideH5 } from '@/utils'
const $t = text => i18n.t(text)

const reEvaluateData = {
    1: { message: $t('twiceTips'), btnText: $t('reTest') },
    2: { message: $t('upTwiceTips'), btnText: $t('gotIt') }, // 当日已测评2次
    3: { message: $t('frequentTips'), btnText: $t('reTest') }, // 一年超过5次，第6次测评时提示
    4: { message: $t('notDoneTips'), btnText: $t('goEvaluate') }, // 未进行过测评，提示语
    5: { message: $t('expiredTips'), btnText: $t('goEvaluate') }, // 测评过期提示语
    6: { message: $t('sevenTips'), btnText: $t('concatUs') }, // 一年测评超过6次，第7次测评时提示
}

export default {
    data() {
        return {
            NO_ASSESS: 2, // 未测评
            ASSESSED: 1, // 已测评
            EXPIRED: 1, // 已过期
            NO_EXPIRED: 2, // 未过期
            isReplace: true,
        }
    },
    methods: {
        // 查询用户风险评估状态
        getAssessStatus() {
            return AssessStatus({
                params: {
                    subAcctId: this.$route.query.sub || this.$store.getters['user/getSubAccountId'],
                },
            })
                .then(res => res)
                .catch(res => {
                    console.error('查询用户风险评估状态getAssessStatus ===>', res, res?.error?.message)
                    return Promise.reject(res)
                })
        },

        /**
         * 测评，重新测评
         * @param {*} url 可选参数，其它页面跳测评开始页，需要传url地址,如https://h5-sit.xingyunplan.com/wealth/riskAssessment.html#/start
         * @param {Object} options
         * @param {Boolean} options.replace 是否采用replace方法来替换路由
         */
        async handleEvaluate(url = '', options = {}) {
            if (typeof options.replace === 'boolean') {
                this.isReplace = options.replace
            }
            const data = await this.getAssessStatus()
            const { isAssessed, isExpired, dayRetryTimes, yearRetryTimes } = data?.result || {}
            // 是否已经评测，1，是，2，否
            if (isAssessed == 2) {
                this.confirmDialog(4, url)
                return
            }
            // 是否评测过期，1，是，2，否
            if (isExpired == 1) {
                this.confirmDialog(5, url)
                return
            }

            // 1年内已做了6次
            if (yearRetryTimes == 0) {
                this.confirmDialog(6)
                return
            }
            // 一年内做了5次
            if (yearRetryTimes <= 1) {
                // 当日剩余大于0
                dayRetryTimes > 0 ? this.confirmDialog(3, url) : this.confirmDialog(2)
            } else {
                // 当日剩余大于0
                dayRetryTimes > 0 ? this.confirmDialog(1, url) : this.confirmDialog(2)
            }
        },

        /**
         * 跳转页面
         * @param {*} url 必选参数，要跳转的页面地址
         * @param {*} title 可选参数，默认是风险测评
         */
        openPage(url, title = $t('riskAssessemnt')) {
            JSBridge ? JSBridge.open({ url: url, title }) : (location.href = decodeURIComponent(url))
        },

        replacePage(url) {
            window.location.replace(decodeURIComponent(url))
        },

        goPage(url, options = {}) {
            const isReplace = typeof options.replace === 'boolean' ? options.replace : this.isReplace
            if (isReplace) {
                this.replacePage(url)
            } else {
                this.openPage(url)
            }
        },

        /**
         * 弹窗二次确认
         * @param {*} type 必选参数，对应上面reEvaluateData的key值, 2表示当日测评次数已用完
         * @param {*} url 可选参数，其它页面跳测评开始页，需要传url地址,如https://h5-sit.xingyunplan.com/wealth/riskAssessment.html#/start
         */
        // eslint-disable-next-line max-params
        confirmDialog(type = 1, url = '', dialogOptions = {}, options = {}) {
            const flag = type != 2
            Dialog.confirm({
                title: $t('prompt'),
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
                        const queryType = getQueryString('type', true)
                        const symbol = getQueryString('symbol', true)
                        // 站外睿银等h5从产品详情跳转风险测试不使用goPage方法跳转，防止已经编码的url参数被goPage方法解码无法正常带到风险测评页
                        !url
                            ? this.$router.replace({ name: 'start', query: { ...this.$route.query, type: queryType, symbol } })
                            : isInOutsideH5()
                            ? (location.href = url)
                            : this.goPage(url, options)
                    }
                })
                .catch(() => {})
        },
    },
}
