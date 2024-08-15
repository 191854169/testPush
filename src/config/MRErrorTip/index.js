import { Dialog } from 'vant'
import { i18n } from '@/i18n/common'
import { isTenantApp } from '@/utils/tools'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
// tip实例 （单例）
let intance = null

// 默认忽略路径
export const ignoreURLs = [{ pathname: 'fund', hash: '/' }]

/**
 * @name 需要校验（依赖版本）
 * @return {Boolean} true: 校验，false：不校验MR错误
 */
const needVerifyByVersion = () => {
    // 不在app需要校验 (同花顺MR测试阶段打不开财富商城不考虑)
    if (!isTenantApp()) return true
    // const curVersion = getAppVersion()
    // const limitVersion = '2.3.0'
    // 当前版本小于2.3.0 需要校验
    // return compareVersion(curVersion, limitVersion) < 0
    return false
}

/**
 * @name 是否拦截校验（路径）
 * @param {Array} ignoreList 忽略路径
 * @param {String} pathname location.pathname
 * @param {String} hash location.hash
 * @return {Boolean}
 */
const verifyIgnorePath = (ignoreList, pathname, hash) => {
    for (const item of ignoreList) {
        // 匹配项目目录名 如:location.pathname：/wealth/fund.html ==> fund
        const name = pathname.replace(/\/wealth\/|\.html/g, '')
        // 匹配route.path 如:location.hash: /list?activeTab=all ==> /list
        const path = hash.replace(/#|\?.*/g, '')
        if (item.pathname === name && item.hash === path) return true
    }
    return false
}

export const goBack = () => {
    try {
        if (JSBridge) {
            JSBridge.back()
        } else {
            history.go(-1)
        }
        console.log()
    } catch (e) {
        console.log('MRError-goBack===>e:', e)
    }
}

const MRErrorTip = (ignoreList = []) => {
    if (!needVerifyByVersion()) return
    if (intance) return

    const pathname = window?.location?.pathname || ''
    const hash = window?.location?.hash || ''
    ignoreList = [...ignoreURLs, ...ignoreList]
    if (verifyIgnorePath(ignoreList, pathname, hash)) return

    intance = Dialog.alert({
        title: `${i18n.t('MRSystemError.tipTitle')}`,
        message: `${i18n.t('MRSystemError.tipMessage')}`,
        confirmButtonText: `${i18n.t('MRSystemError.tipButton')}`,
    }).then(() => {
        intance = null
        goBack()
    })
}
export default MRErrorTip
