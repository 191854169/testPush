import './initLocalStorage'
import Vue from 'vue'
import '@babel/polyfill'
import VueRouter from 'vue-router'
import { addCurParamsForUrl } from '@/utils/utils.js'
import { getRunEnv } from '@/utils/env.js'
import '@fs/jsbridge/dist/lib/thsI18NJsBridge.js'
import thsJsBridge from '@fs/jsbridge/dist/lib/thsJsBridge.js'

// 注册全局属性
import '@/config/globalProterties/index.js'
import pathnames from '../config/H5Pathname.js'
import initSensors from '@/utils/bury.js'
import { isHLApp, isTHSApp } from '@/utils/tools'
import { isInOutsideH5 } from '@/utils'
import LogoAd from '@/components/logo.vue'

// 初始化神策埋点
initSensors()

Vue.prototype.$jsBridge = window.JSBridge
Vue.component(LogoAd.name, LogoAd)

const addWtToken = path => {
    const href = location.href
    let queryString = ''
    if (href.search(/(&|\?)wtToken/) > 0) {
        queryString = (href.match(/(&|\?)wtToken(.+)/g) || [])[0] || ''
        queryString = queryString.replace(/^(&|\?)/, '')
    }
    if (typeof path === 'string') {
        const tempPath = addCurParamsForUrl(path, { needAddProtocol: false })
        // 正则作用：tempPath会返回包含全路径（http://sit.mfosuhani.com/wealth/fund.html#/list?test=1）
        // 例子：http://sit.mfosuhani.com/wealth/fund.html#/list?test=1  => /list?test=1
        path = tempPath.replace(/^[^#]+#/, '')
    } else {
        path.query = {
            ...queryString.split('&').reduce((o, i) => {
                const [k, v] = i.split('=')
                o[k] = v
                return o
            }, {}),
            ...(path.query || {}),
        }
    }
    return path
}
const originPush = VueRouter.prototype.push
const originReplace = VueRouter.prototype.replace
VueRouter.prototype.push = function () {
    let path = arguments[0]
    path = addWtToken(path)
    if (pushInThsApp.call(this, path)) return
    return originPush.call(this, path, ...[...arguments].slice(1))
}
VueRouter.prototype.replace = function () {
    let path = arguments[0]
    path = addWtToken(path)
    // replace在同花顺不需要新开webview
    // if (pushInThsApp.call(this, path)) return
    return originReplace.call(this, path, ...[...arguments].slice(1))
}

function pushInThsApp(path) {
    if (isTHSApp()) {
        // eslint-disable-line
        if (typeof path === 'object') {
            if (path.name) {
                path = this.resolve(path)?.route || {} // 通过名称查找当前的路由对象
            }
            path =
                path.path +
                '?' +
                Object.entries(path.query)
                    .reduce((str, [k, v]) => {
                        if (!k) return str
                        return (str += `${k}=${v}&`)
                    }, '')
                    .replace(/&$/, '')
        }
        if (typeof path === 'string') {
            path = ('/' + path).replace('//', '/')
            const href = `${location.origin}${location.pathname}?t=${Date.now()}#${path}`
            // 兼容 私募认购页 查看风险提示 文件的路由
            if (path.includes('tipsPage')) {
                return false
            }
            console.log('pushInThsApp ===>', path, href)
            location.href = href
            return true
        }
    }
    return false
}
//判断是否处于同花顺android app里面，初始化后退拦截为客户端自行管理
thsJsBridge()

// var ths = window.navigator.userAgent.includes('Hexin_Gphone')
// if (ths) {
//     var data = {
//         method: 'setBrowserField',
//         params: {
//             isUseDefaultBack: 'true',
//         },
//     }
//     callNativeHandler('notifyWebHandleEvent', JSON.stringify(data)) // eslint-disable-line
// }

export const FINANCE_ACCOUNT = 1 // 资金账户
export const FUND_ACCOUNT = 2 // 基金账户
export const FIXEDDEPOSIT_ACCOUNT = 3 // 定存宝账户
/**
 * 获取账户状态
 * @param { Number } accountType 资金账户 基金账户
 * @returns { Boolean } 是否开户 开户 - true 未开户 - false
 */
export function getAccountStatus(store) {
    function fn(accountType) {
        accountType = accountType || fn.FINANCE_ACCOUNT
        let { userInfo } = store.state.user
        userInfo = userInfo || {}
        const openFundType = userInfo?.clientInfo?.accts?.[0]?.openFundTrade // 是否开通基金交易标记：0-不开通；1-开通
        const ACCOUNT_UNOPEN = 30
        const ACCOUNT_OPENED = 31
        const ACCOUNT_CLOSED = 32
        const ACCOUNT_OPENING = 33
        const FUND_ACCOUNT_UNOPEN = 0
        const FUND_ACCOUNT_OPENED = 1
        switch (accountType) {
            // 现在默认 证券账户和基金户是绑定开通
            case FINANCE_ACCOUNT:
                if ([ACCOUNT_UNOPEN, ACCOUNT_CLOSED, ACCOUNT_OPENING].includes(userInfo.clientStatus)) {
                    return false
                }
                if ([ACCOUNT_OPENED].includes(userInfo.clientStatus)) {
                    return true
                }
                return false
            case FUND_ACCOUNT:
                if (openFundType === FUND_ACCOUNT_UNOPEN) return false
                if (openFundType === FUND_ACCOUNT_OPENED) return true
                return false
            default:
                return false
        }
    }
    fn.FINANCE_ACCOUNT = FINANCE_ACCOUNT
    fn.FUND_ACCOUNT = FUND_ACCOUNT
    return fn
}
/**
 * 获取定存宝账户开通状态
 * @returns { Boolean } 是否开户 开户 - true 未开户 - false
 */
export function getFtdAccountStatus(store) {
    async function fn() {
        try {
            if (fn.fetching) return
            fn.fetching = true
            const info = await store.dispatch('user/getSpecialAccountStatus', { type: 'ftd' })
            // info === null 未开通（包含未提交、提交但未开通完成） info !== null 表示开通完成 暂未考虑账户开通后异常情况
            return !!info
        } catch (e) {
            return false
        } finally {
            fn.fetching = false
        }
    }
    return fn
}

/**
 * 获取投顾组合账户信息
 * @returns { Boolean } 是否开户 开户 - true 未开户 - false
 */
export function getInvesetmentAccountStatus(store) {
    async function fn() {
        try {
            if (fn.fetching) return
            fn.fetching = true
            const info = await store.dispatch('user/getSpecialAccountStatus', { type: 'investment' })
            // info === null 未开通（包含未提交、提交但未开通完成） info !== null 表示开通完成 暂未考虑账户开通后异常情况
            return !!info
        } catch (e) {
            return false
        } finally {
            fn.fetching = false
        }
    }
    return fn
}
/**
 * 获取星财宝专户账户开通状态
 * @returns { Boolean } 是否开户 开户 - true 未开户 - false
 */
export function getStarSpecialAccountStatus(store) {
    async function fn() {
        try {
            if (fn.fetching) return
            fn.fetching = true
            const info = await store.dispatch('user/getSpecialAccountStatus', { type: 'xcb' })
            // info === null 未开通（包含未提交、提交但未开通完成） info !== null 表示开通完成 暂未考虑账户开通后异常情况
            return !!info
        } catch (e) {
            console.error(`Feng.chen:: 15:08:02 e ===> `, e)
            return false
        } finally {
            fn.fetching = false
        }
    }
    return fn
}
export function nextAfterJudgeAccountStatus(to = 'openAccount', params = {}) {
    // 跳转证券开户页
    if (to === 'openAccount') {
        const { VUE_APP_OPEN_ACCOUNT_PAGE, VUE_APP_OPEN_H5 } = pathnames
        if (this.$jsBridge) {
            this.$jsBridge.goPage('mainTrade')
        } else {
            isInOutsideH5() ? (location.href = VUE_APP_OPEN_H5) : (location.href = VUE_APP_OPEN_ACCOUNT_PAGE)
        }
        return
    }

    // 跳转基金开户页
    if (to === 'fundAccount') {
        let { VUE_APP_OPEN_FUND_PAGE: link } = pathnames
        // 增加参数
        link =
            link +
            Object.entries(params)
                .reduce((query, [k, v] = []) => {
                    query += `${k}=${v}&`
                    return query
                }, '?')
                .replace(/&$/, '')
                .replace(/^\?$/, '')
        if (Vue.prototype.$openPageInThs(link)) return
        if (this.$jsBridge) {
            this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
        } else {
            location.href = addCurParamsForUrl(link)
        }
        return
    }
}

/**
 * 登录操作 - 内含各个环境的是否存在登录态及后续的登陆操作
 * @param {*} store 对应store
 * @param {*} getApp 获取app实例，由于JavaScript从右开始执行，所以直接传入app会导致app为undefined，因此通过函数的方式来获取
 * @returns
 */
export function login(store, getApp = () => {}) {
    const isWT = getRunEnv() === 2 // 是否在网厅
    return () => {
        const app = getApp()
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
            const loginPageHref = `${location.origin}/pages/login.html#/?path=${curPage}`
            location.href = loginPageHref
            return false
        }
        return true
    }
}
