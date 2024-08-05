import Vue from 'vue'
import Loading from './loading'
import { addCurParamsForUrl } from '@/utils/utils.js'
import goPage from './goPage'
import env from './env'
import { variable } from '@/assets/css/variable'

Vue.prototype.$loading = new Loading()

Vue.prototype.$addCurParamsForUrl = addCurParamsForUrl

Vue.prototype.$jsBridge = window.JSBridge

Vue.prototype.$goPage = goPage

Vue.prototype.$env = env

Vue.prototype.$variable = variable
