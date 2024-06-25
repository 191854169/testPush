import { post, get, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
import { getRunEnv } from '@/utils/env.js'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env
import { isHLApp } from '@/utils'

const domain = isHLApp() || NODE_ENV === 'production' ? VUE_APP_JIAOYI : ''

//encrypt: 0不加密,1
const assignData = option => {
    const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
    option.data = Object.assign(option.data, {
        uin: Number(localStorage.getItem('uin')) || undefined,
        clientId: accts.cltId || undefined,
        accountId: Number(accts.acctId) || undefined,
        subAccountId: accts.subAcctId || undefined,
    })
    let defaultEncrypt = ENCRYPT_TYPES.LOGIN
    if (getRunEnv() === 2) {
        defaultEncrypt = ENCRYPT_TYPES.NO_ENCRYPT
    }
    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    return option
}
/** 当前用户是否开通星财宝 */
export const ECashUserStatus = option => {
    return post(`${domain}/fund/${path_version}/ECashUserStatus`, assignData(option))
}
/** 星财宝用户配置，返回星财宝保留余额，当前状态等 */
export const ECashUserSetting = option => {
    return post(`${domain}/fund/${path_version}/ECashUserSetting`, assignData(option))
}
/** 产品列表 */
export const ECashProductList = option => {
    return get(`${domain}/fund/${path_version}/ECashProductList`, assignData(option))
}
/** 开通星财宝 */
export const ECashOpen = option => {
    return post(`${domain}/fund/${path_version}/ECashOpen`, assignData(option))
}
/** 用户资产 */
export const ECashAssetsDetail = option => {
    return post(`${domain}/fund/${path_version}/ECashAssetsDetail`, assignData(option))
}
/** 星财宝持仓 */
export const ECashHoldings = option => {
    return post(`${domain}/fund/${path_version}/ECashHoldings`, assignData(option))
}
/** 更新保留额度 */
export const ECashSettingUpdate = option => {
    return post(`${domain}/fund/${path_version}/ECashSettingUpdate`, assignData(option))
}
/** 暂停自动申赎 */
export const ECashSuspend = option => {
    return post(`${domain}/fund/${path_version}/ECashSuspend`, assignData(option))
}
/** 订单记录 */
export const ECashOrderList = option => {
    return post(`${domain}/fund/${path_version}/ECashOrderList`, assignData(option))
}
/** 手动赎回 */
export const ECashRedemption = option => {
    return post(`${domain}/fund/${path_version}/ECashRedemption`, assignData(option))
}
/** 收益明细 */
export const ECashProfitlossList = option => {
    return post(`${domain}/fund/${path_version}/ECashProfitlossList`, assignData(option))
}
/** 撤回订单 */
export const EcashOrderCancel = option => {
    return post(`${domain}/fund/${path_version}/EcashOrderCancel`, assignData(option))
}
