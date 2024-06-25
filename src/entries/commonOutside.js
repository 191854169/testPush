import './init.js'
import Vue from 'vue'
import CommonOutsideApp from '@/views/commonOutside/App.vue'

import getTitleDialog from '@/views/fund/follow/components/titleDialog/index.js'
import VantComponents from '@/config/vant.components.js'
import setDirectives from '@/config/directives.js'
import router from '@/router/commonOutside'
import store from '@/store/commonOutside'
import '../utils/remH5.js'
import '@/assets/css/index.js'
import MultiImg from '@/components/MultiImg.vue'
import Loading from '@/components/Loading.vue'
import { toggleDebug } from '@/utils/utils.js'
import { thousandsFilter, amountFilter } from '@/config/filters.js'
import SvgIcon from '@/components/SvgIcon.vue'
import { isHLApp, isInRyH5 } from '@/utils/tools.js'
import { i18n } from '@/i18n/commonOutside/index.js'
import { getRunEnv } from '@/utils/env.js'
import { getAccountStatus, nextAfterJudgeAccountStatus } from './init'

export { FINANCE_ACCOUNT, FUND_ACCOUNT } from './init'

// error handler
import { initErrorLoggerHandler } from '@/utils/logService'
initErrorLoggerHandler()

Vue.component(MultiImg.name, MultiImg)
Vue.component(SvgIcon.name, SvgIcon)
Vue.component(Loading.name, Loading)

Vue.filter('thousandsFilter', thousandsFilter)
Vue.filter('amountFilter', amountFilter)

VantComponents(Vue)
// 设置全局指令
setDirectives(Vue)
Vue.config.productionTip = false

Vue.config.errorHandler = function (err, vm, info) {
    console.error('Vue config error ===> ', err, '\n', 'vm ===>', vm, '\n', 'info ===> ', info)
}

window.onerror = function () {
    console.error('global error ===>', arguments)
}

const isTestin = false // 兼容性测试
let needDebug = process.env.VUE_APP_ENV !== 'prod'

if (isTestin && process.env.VUE_APP_ENV === 'sit') {
    needDebug = false
}
if (needDebug) {
    toggleDebug(true)
}
const isWT = getRunEnv() === 2 // 是否在网厅
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
    render: h => h(CommonOutsideApp),
}).$mount('#app')

// app.$watch(
//     'isLogin',
//     v => {
//         if (!isWT) {
//             app.$mount('#app')
//         } else {
//             if (v) {
//                 app.$mount('#app')
//             }
//         }
//     },
//     {
//         immediate: true,
//     }
// )

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
        const queryStr = isInRyH5() ? '?isInRy=1&' : '?'
        const loginPageHref = `${location.origin}/pages/login.html#/${queryStr}path=${curPage}`
        location.href = loginPageHref
        return false
    }
    return true
}
// 全局组件
Vue.prototype.$titleDialog = getTitleDialog(Vue)
