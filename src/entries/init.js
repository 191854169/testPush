import Vue from 'vue'
import '@babel/polyfill'
import { addCurParamsForUrl } from '@/utils/utils.js'

// 注册全局属性
import '@/config/globalProterties/index.js'
import pathnames from '../config/H5Pathname.js'
import { isTenantApp } from '@/utils/tools'
import { isInOutsideH5 } from '@/utils'
import LogoAd from '@/components/logo.vue'

Vue.prototype.$jsBridge = window.JSBridge
Vue.component(LogoAd.name, LogoAd)

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
    return () => {
        const app = getApp()
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
            const loginPageHref = `${location.origin}/pages/login.html#/?path=${curPage}`
            location.href = loginPageHref
            return false
        }
        return true
    }
}
