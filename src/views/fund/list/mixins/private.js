import { getPrivateListV2 } from '@/apis/fund/fund.js'
import { concatUs } from '../../components/ConcatUs'
import { getPiApplyDetail } from '@/apis/client.js'
import Vue from 'vue'
import PiGuide from '../components/pi-guide.vue'
import store from '@/store/fund.js'
import { i18n } from '@/i18n/fund/index.js'
import { Toast } from 'vant'
import isInitedTradePwd from '@/mixins/initTradePwd'
import { FINANCE_ACCOUNT } from '@/entries/Fund.js'
import { CLIENT_TYPE } from '../../config/common'

export default {
    data() {
        return {}
    },
    methods: {
        // 获取私募基金列表
        async getList(options = {}) {
            try {
                this.$loading.show = true
                const params = {
                    start: this.start,
                    count: this.count,
                    ...options,
                }
                const { result } = await getPrivateListV2(params)
                console.log(`Feng.chen:: 13:29:19 res ===> `, result, params)
                const { labels, list } = result || {}

                if (this.labels?.length === 1) {
                    this.labels[0].count = labels.reduce((num, cur) => ((num += cur.count), num), 0)
                    this.labels = this.labels.concat(labels.map(i => ({ ...i, label: i.name })))
                }
                this.list = list || []
            } catch (e) {
                console.log('getPriList===>e:', e)
            } finally {
                this.$loading.show = false
                this.hasInit = true
            }
        },
        goPrivateDetail(item) {
            const url = `${location.origin}/wealth/fund.html#/detail?type=private&symbol=${item.symbol}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `detail`,
                    query: {
                        symbol: item.symbol,
                        type: 'private',
                    },
                })
            }
        },
        goBondDetailHandler(item) {
            const url = `${location.origin}/wealth/fund.html#/bond-detail?symbol=${item.symbol}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/bond-detail',
                    query: {
                        symbol: item.symbol,
                    },
                })
            }
        },
        goBillDetail(item) {
            this.$router.push({
                name: 'bills-detail',
                query: {
                    symbol: item.symbol,
                },
                params: {
                    id: item.symbol,
                    type: 'detail',
                },
            })
        },
        async viewDetailHnader(item, type = 'private') {
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            // 开户校验
            if (!this.$root.getAccountStatus(FINANCE_ACCOUNT)) {
                this.$root.nextAfterJudgeAccountStatus('openAccount')
                return
            }

            // 交易密码校验
            if (!isInitedTradePwd({ store: this.$store })) return
            if (this.isProfessional) {
                // 私募基金
                if (type === 'private') {
                    return this.goPrivateDetail(item)
                }
                // 债券
                if (type === 'bond') {
                    return this.goBondDetailHandler(item)
                }
                // 票据
                if (type === 'bill') {
                    return this.goBillDetail(item)
                }
                return
            }
            // 判断用户是否是个人账户 1个人户/2Esop/3联名户/4公司户/5机构户
            const subAcctId = this.$route.query.sub || this.$store.getters['user/getSubAccountId']
            const params = { data: { subAcctId: subAcctId || undefined } }
            // console.log('params*****', params)
            try {
                const { result } = await getPiApplyDetail(params)
                // console.log('result*****', result)
                // 公司户或者个人户可以支持认证
                const isPersonalAccountOrCorporate = [CLIENT_TYPE.CLIENT_INDIVIDUAL, CLIENT_TYPE.CLIENT_CORPORATE].includes(result?.clientType)
                if (isPersonalAccountOrCorporate) {
                    let instance = this.piGuideInstance
                    if (!instance) {
                        const Comp = Vue.extend(PiGuide)
                        instance = new Comp({ store, i18n })
                        instance.$mount(document.createElement('div'))
                        document.body.appendChild(instance.$el)
                        this.piGuideInstance = instance
                    }
                    instance.show(result)
                    return
                }
                const message = `<span>${this.$t(
                    'priList.noProfessionalTips'
                )}<span onclick="location.href='${`${location.origin}/wealth/fund.html#/services`}'">${this.$t(
                    'priList.customerManager'
                )}</span>${this.$t('priList.contact')}。</span>`
                this.$dialog.alert({
                    value: true,
                    message: message,
                    messageAlign: 'left',
                    confirmButtonText: this.$t('priList.already'),
                    className: 'private-tip',
                })
            } catch (data) {
                console.log(data, 'data')
                if (data.error) {
                    const message = data.error.code == 200000 ? this.$t('piGuide.zhybdj') : data.error?.data?.tips || this.$t('serviceError')
                    message && Toast(message)
                }
            }
        },
        onServiceBtns(e) {
            const { name } = e.target.dataset
            if (!name) return
            const execMap = {
                service: () => {
                    if (this.$jsBridge) {
                        this.$jsBridge?.contactUs()
                    } else {
                        concatUs()
                    }
                },
                mechanism: () => {
                    this.gotoMechanism()
                },
            }
            const exec = execMap[name]
            exec && exec()
        },
        gotoMechanism() {
            const url = `${location.origin}/wealth/fund.html#/mechanism`

            this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : this.$router.push('mechanism')
        },

        onPermissoinalCheck(data) {
            // TODO
            console.log('gg ===> onPermissoinalCheck')
            this.viewDetailHnader(data)
        },
    },
}
