import './init.js'
import Vue from 'vue'
import App from '@/views/cashBox/app.vue'
import VantComponents from '@/config/vant.components.js'
import setDirectives from '@/config/directives.js'
import router from '@/router/cashBox'
import store from '@/store/cashBox'
import '../utils/remH5.js'
import '@/assets/css/index.js'
import { toggleDebug } from '@/utils/utils.js'
import MultiImg from '@/components/MultiImg.vue'
import Loading from '@/components/Loading.vue'
import { thousandsFilter } from '@/config/filters.js'
import { i18n } from '@/i18n/cashBox/index.js'
import { isTenantApp } from '@/utils/tools.js'
import { getAccountStatus, nextAfterJudgeAccountStatus } from './init'

export { FINANCE_ACCOUNT, FUND_ACCOUNT } from './init'

// error handler
import { initErrorLoggerHandler } from '@/utils/logService'
initErrorLoggerHandler()

// 设置指令
setDirectives(Vue)

Vue.filter('thousandsFilter', thousandsFilter)

VantComponents(Vue)
Vue.component(MultiImg.name, MultiImg)
Vue.component(Loading.name, Loading)
Vue.config.productionTip = false
if (process.env.VUE_APP_ENV !== 'prod') {
    toggleDebug(true)
}

const app = new Vue({
    data() {
        return {
            isLogin: undefined,
        }
    },
    mounted() {
        this.initPageVisibleHandler()
    },
    methods: {
        login,
        getAccountStatus: getAccountStatus(store),
        nextAfterJudgeAccountStatus,
        /**
         * 注册页面监听事件 - 触发页面刷新
         * @param {Array} pages 需要监听登录状态的页面
         */
        initPageVisibleHandler(pages = ['/', '/account-hold', '/detail']) {
            if (this.$jsBridge) {
                const onVisible = () => {
                    if (!pages.length || pages.includes(this.$route.path)) {
                        // 校验用户是否已经退出登录了 - 只用处理在app内部的
                        this.$store
                            .dispatch('user/getUserInfo', false)
                            .then(() => {
                                // 未登录 -> 登录
                                if (!this.$root.isLogin) {
                                    location.reload()
                                }
                            })
                            .catch(() => {
                                // 登录 -> 未登录
                                if (this.$root.isLogin) {
                                    location.reload()
                                }
                            }) // 登录失效会触发页面刷新
                    }
                }
                this.$jsBridge.watchPageVisible(onVisible)
            }
        },
    },
    router,
    store,
    i18n,
    render: h => h(App),
}).$mount('#app')

// 页面初始化登录态
store
    .dispatch('user/getUserInfo', false)
    .then(data => {
        // 有数据说明app获取数据正常
        if (data) {
            app.isLogin = true
        } else {
            app.isLogin = !!localStorage.getItem('session') || !!localStorage.getItem('WTtoken')
        }
    })
    .catch(() => {
        app.isLogin = false
    })

/* 登录操作 - 内含各个环境的是否存在登录态及后续的登陆操作 */
function login() {
    // 恒利
    if (isTenantApp()) {
        // 内部会进行是否登录状态判断
        store.dispatch('user/login', false).then(data => {
            if (data) {
                app.isLogin = true
                location.reload()
            }
        })
        return false
    }

    // 站外
    const session = localStorage.getItem('session')
    if (!session) {
        let curPage = location.href
        curPage = encodeURIComponent(curPage)
        const loginPageHref = `${location.origin}/pages/login.html?path=${curPage}#/`
        location.href = loginPageHref
        return false
    }
    return true
}
