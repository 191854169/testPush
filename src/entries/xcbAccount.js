import './init.js'
import Vue from 'vue'
import App from '@/views/xcbAccount/App.vue'

import VantComponents from '@/config/vant.components.js'
import setDirectives from '@/config/directives.js'
import router from '@/router/xcbAccount'
import store from '@/store/xcbAccount.js'
import '../utils/remH5.js'
import '@/assets/css/index.js'
import MultiImg from '@/components/MultiImg.vue'
import Loading from '@/components/Loading.vue'
import { toggleDebug } from '@/utils/utils.js'
import { i18n } from '@/i18n/xcbAccount/index.js'
import 'normalize.css/normalize.css'
import { getAccountStatus, getStarSpecialAccountStatus, nextAfterJudgeAccountStatus, login } from './init.js'
import { getQueryString } from '@/utils/tools.js'
import SvgIcon from '@/components/SvgIcon.vue'

// error handler
import { initErrorLoggerHandler } from '@/utils/logService'
initErrorLoggerHandler()

Vue.component(MultiImg.name, MultiImg)
Vue.component(SvgIcon.name, SvgIcon)
Vue.component(Loading.name, Loading)

VantComponents(Vue)

// 设置全局指令
setDirectives(Vue)
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
    mounted() {},
    methods: {
        login: login(store, getActualApp),
        getAccountStatus: getAccountStatus(store),
        getStarSpecialAccountStatus: getStarSpecialAccountStatus(store),
        nextAfterJudgeAccountStatus,
    },
    router,
    store,
    i18n,
    render: h => h(App),
}).$mount('#app')

/**
 * 获取APP返回实例
 * @returns {Object} VUE app instance
 */
function getActualApp() {
    return app
}

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
