import './init.js'

import Vue from 'vue'
import Demo from '@/views/Demo'
import '../utils/remH5.js'
import '@/assets/css/index.js'
import { toggleDebug } from '@/utils/utils.js'
import VantComponents from '@/config/vant.components.js'
import router from '@/router/demo'
import store from '@/store/demo'

VantComponents(Vue)
Vue.config.productionTip = false
if (process.env.VUE_APP_ENV !== 'prod') {
    toggleDebug(true)
}

new Vue({
    router,
    store,
    render: h => h(Demo),
}).$mount('#app')
