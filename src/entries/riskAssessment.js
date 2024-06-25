import './init.js'
import Vue from 'vue'
import App from '@/views/riskAssessment/App.vue'

import VantComponents from '@/config/vant.components.js'
// import setDirectives from '@/config/directives.js'
import router from '@/router/riskAssessment'
import store from '@/store/riskAssessment.js'
import '../utils/remH5.js'
import '@/assets/css/index.js'
import MultiImg from '@/components/MultiImg.vue'
import Loading from '@/components/Loading.vue'
import { toggleDebug } from '@/utils/utils.js'
import { i18n } from '@/i18n/riskAssessment/index.js'
import 'normalize.css/normalize.css'

// error handler
import { initErrorLoggerHandler } from '@/utils/logService'
initErrorLoggerHandler()

Vue.component(MultiImg.name, MultiImg)
Vue.component(Loading.name, Loading)

VantComponents(Vue)

// 设置全局指令
// setDirectives(Vue)
Vue.config.productionTip = false

Vue.prototype.$jsBridge = window.JSBridge

if (process.env.VUE_APP_ENV !== 'prod') {
    toggleDebug(true)
}

new Vue({
    i18n,
    router,
    store,
    render: h => h(App),
}).$mount('#app')
