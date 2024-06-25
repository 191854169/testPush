import { getPiApplyDetail } from '@/apis/client.js'
import { Toast } from 'vant'
import isInitedTradePwd from '@/mixins/initTradePwd'
import { CLIENT_TYPE, FINANCE_ACCOUNT } from '@/config/common.js'
import PiGuide from '../components/pi-guide.vue'
import store from '@/store/xcbAccount.js'
import { i18n } from '@/i18n/xcbAccount'
import Vue from 'vue'

export default {
    data() {
        return {}
    },
    methods: {
        async gotoVerify() {
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
                return
            }
            // 判断用户是否是个人账户 1个人户/2Esop/3联名户/4公司户/5机构户
            const subAcctId = this.$route.query.sub || this.$store.getters['user/getSubAccountId']
            const params = { data: { subAcctId: subAcctId || undefined } }
            try {
                const { result } = await getPiApplyDetail(params)
                console.log(`getPiApplyDetail`, result)
                // 公司户或者个人户可以支持认证
                const isPersonalAccountOrCorporate = [CLIENT_TYPE.CLIENT_INDIVIDUAL, CLIENT_TYPE.CLIENT_CORPORATE].includes(result?.clientType)
                if (isPersonalAccountOrCorporate) {
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
                    return
                }
            } catch (data) {
                console.error('getPiApplyDetail', data)
                if (data.error) {
                    const message = data.error.code == 200000 ? this.$t('piGuide.zhybdj') : data.error?.data?.tips || this.$t('serviceError')
                    message && Toast(message)
                }
            }
        },
    },
}
