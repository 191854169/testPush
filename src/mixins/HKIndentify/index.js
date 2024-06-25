import { getRunEnv } from '@/utils/env'
import { getUserDetail, getSubAcctDetail } from '@/apis/uc.js'
import IndentifyDialog from './IndentifyDialog'
import { mapActions } from 'vuex'
import pathnames from '@/config/H5Pathname'

export default {
    name: 'HKindentify',
    data() {
        return {
            indentifyDialog: new IndentifyDialog(),
            needSignHKIdentifier: 0, // 1:未签署，2:已签署未拿到BCAN码，0：已签署已拿到BCAN码
            subAccountId: this.$route.query.sub || this.$store.getters['user/getSubAccountId'],
        }
    },
    mounted() {
        this.$jsBridge &&
            this.$jsBridge.watchPageVisible(() => {
                // 返回页面关闭dialog
                this.indentifyDialog.show = false
            })
    },
    methods: {
        ...mapActions('user', ['getUserInfo', 'login']),

        /* 登录操作 - 内含各个环境的是否存在登录态及后续的登陆操作 */
        async toLogin() {
            // 1.自研App 2.网厅 3.站外H5
            if (getRunEnv() === 1) {
                // 内部会进行是否登录状态判断
                await this.login(false)
                location.reload()
                return false
            } else if (getRunEnv() === 2) {
                // 同花顺 - 进入页面一定是登录态
                return false
            }
            // 站外
            const session = localStorage.getItem('session')
            if (!session) {
                let curPage = location.href
                curPage = encodeURIComponent(curPage)
                const loginPageHref = `${location.origin}/pages/login.html#/?path=${curPage}`
                location.href = loginPageHref
                return false
            }

            return true
        },

        // 获取认证信息
        async HKIndentifyGetIndentify() {
            try {
                // 登录校验
                let isLogin = undefined
                const userInfo = await this.getUserInfo(false)
                console.log('HKIndentifyGetIndentify-userInfo', userInfo)
                if (userInfo) {
                    isLogin = true
                } else {
                    isLogin = !!localStorage.getItem('session') || !!localStorage.getItem('WTtoken')
                }
                if (!isLogin) {
                    return await this.toLogin()
                }
                // 开户校验
                const ACCOUNT_UNOPEN = 30
                const ACCOUNT_CLOSED = 32
                const ACCOUNT_OPENING = 33
                // 是否开通证券账号
                const finanaceAccount = ![ACCOUNT_UNOPEN, ACCOUNT_CLOSED, ACCOUNT_OPENING].includes(userInfo.clientStatus)
                if (!finanaceAccount) {
                    // 未开通去开通账户
                    const { VUE_APP_OPEN_ACCOUNT_PAGE } = pathnames
                    if (this.$jsBridge) {
                        this.$jsBridge.goPage('mainTrade')
                    } else {
                        location.href = VUE_APP_OPEN_ACCOUNT_PAGE
                    }
                    return false
                }
            } catch (e) {
                console.log('验证账户信息失败===>e:', e)
                return false
            }
            try {
                // 1.自研App 2.网厅 3.站外H5
                if (getRunEnv() === 1 || getRunEnv() === 3) {
                    const { result = {} } = await getUserDetail()
                    this.needSignHKIdentifier = result?.clientInfo?.accts?.[0]?.extra?.needSignHKIdentifier || 0
                } else {
                    const subAccountId = this.subAccountId
                    const { result = {} } = await getSubAcctDetail({ params: { subAccountId } })
                    this.needSignHKIdentifier = result?.clientInfo?.extra?.needSignHKIdentifier || 0
                }
            } catch (e) {
                console.log('获取用户签署信息===>e:', e)
            }
        },

        // 校验香港标识符
        async HKIndentifyCheckIndentify() {
            // 香港标识符开关 0代表关闭，不为0代表开启
            const { VUE_APP_HKIDENTIFIER_FLAG = 0 } = process.env
            if (!Number(VUE_APP_HKIDENTIFIER_FLAG)) {
                console.log('拦截签署')
                return true
            }
            await this.HKIndentifyGetIndentify()
            console.log('签署信息-needSignHKIdentifier===>:', this.needSignHKIdentifier)

            if (this.needSignHKIdentifier > 0) {
                this.indentifyDialog.type = this.needSignHKIdentifier
                this.indentifyDialog.show = true
                return false
            }
            return true
        },
    },
}
