import './init.js'
import Vue from 'vue'
import App from '@/views/fixedDepositTreasure/App.vue'

import VantComponents from '@/config/vant.components.js'
import setDirectives from '@/config/directives.js'
import router from '@/router/fixedDepositTreasure'
import store from '@/store/fixedDepositTreasure.js'
import '../utils/remH5.js'
import '@/assets/css/index.js'
import MultiImg from '@/components/MultiImg.vue'
import Loading from '@/components/Loading.vue'
import { toggleDebug } from '@/utils/utils.js'
import { i18n } from '@/i18n/fixedDepositTreasure/index.js'
import 'normalize.css/normalize.css'
import { getAccountStatus, getFtdAccountStatus, nextAfterJudgeAccountStatus } from './init'
import { getQueryString, isHLApp } from '@/utils/tools.js'
import { getRunEnv } from '@/utils/env.js'

// error handler
import { initErrorLoggerHandler } from '@/utils/logService'
initErrorLoggerHandler()

Vue.component(MultiImg.name, MultiImg)
Vue.component(Loading.name, Loading)

VantComponents(Vue)

// 设置全局指令
setDirectives(Vue)
Vue.config.productionTip = false

Vue.prototype.$jsBridge = window.JSBridge

if (process.env.VUE_APP_ENV !== 'prod') {
    toggleDebug(true)
}

const app = new Vue({
    data() {
        return {
            isLogin: undefined,
        }
    },
    mounted() {},
    methods: {
        login,
        getAccountStatus: getAccountStatus(store),
        getFtdAccountStatus: getFtdAccountStatus(store),
        nextAfterJudgeAccountStatus,
    },
    router,
    store,
    i18n,
    render: h => h(App),
}).$mount('#app')

const hash = location.hash
const NO_NEED_LOGIN_PAGES_REG = /#\/(about)/ // 如果需要别的页面也不需要首次打开调用用户详情接口的话。在后面添加: 例如(about|list)
const needLoginInfo = !NO_NEED_LOGIN_PAGES_REG.test(hash)
const openParam = getQueryString('open')
const isHashOpenParams = NO_NEED_LOGIN_PAGES_REG.test(hash) && openParam && openParam === '1'
if (needLoginInfo || isHashOpenParams) {
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
}
const isWT = getRunEnv() === 2 // 是否在网厅
/* 登录操作 - 内含各个环境的是否存在登录态及后续的登陆操作 */
function login() {
    // 恒利
    if (isHLApp()) {
        // 内部会进行是否登录状态判断
        store.dispatch('user/login', false).then(data => {
            if (data) {
                app.isLogin = true
                location.reload()
            }
        })
        return false
    }
    // 同花顺 - 进入页面一定是登录态
    if (isWT) {
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
