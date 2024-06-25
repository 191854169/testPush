import Vue from 'vue'
import Loading from './loading'
import { addCurParamsForUrl } from '@/utils/utils.js'
import openPageInThs from './openPageInThs'
import goPage from './goPage'
import mylinkJsbridge from '@fs/jsbridge/dist/lib/mylinkJsBridge.js'
import env from './env'
import openPageInI18NThs from './openPageInI18NThs'
import { thsI18NJsBridge } from '@fs/jsbridge'

Vue.prototype.$loading = new Loading()

Vue.prototype.$addCurParamsForUrl = addCurParamsForUrl

Vue.prototype.$jsBridge = window.JSBridge

Vue.prototype.$openPageInThs = openPageInThs

Vue.prototype.$goPage = goPage

Vue.prototype.$mylinkJsbridge = mylinkJsbridge

Vue.prototype.$env = env

Vue.prototype.$openPageInI18NThs = openPageInI18NThs

Vue.prototype.$thsI18NJsBridge = thsI18NJsBridge
