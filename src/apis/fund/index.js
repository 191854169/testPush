import { post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
import { isHLApp } from '@/utils'

// import store from '@/store/fund'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_JIAOYI}`
const assignData = option => {
    const accts = (JSON.parse(localStorage.getItem('userInfo')) || {}).clientInfo?.accts?.[0] || {}
    const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
    option.data = Object.assign(option.data, {
        uin: Number(localStorage.getItem('uin')) || undefined,
        clientId: accts.cltId || undefined,
        accountId: Number(accts.acctId) || undefined,
        subAccountId: subAcctId,
    })
    const defaultEncrypt = ENCRYPT_TYPES.LOGIN

    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    return option
}

/** 查询用户资产 */
export const AssetsDetail = option => {
    return post(`${domain}/fund/${path_version}/AssetsDetail`, assignData(option))
}
/** 查询用户基金持仓 */
export const Holdings = option => {
    return post(`${domain}/fund/${path_version}/Holdings`, assignData(option))
}
/** 基金认购/赎回 */
export const OrderCreate = option => {
    return post(`${domain}/fund/${path_version}/OrderCreate`, assignData(option))
}
/** 撤销基金订单 */
export const OrderCancel = option => {
    return post(`${domain}/fund/${path_version}/OrderCancel`, assignData(option))
}
/** 用户基金订单列表 */
export const OrderList = option => {
    return post(`${domain}/fund/${path_version}/OrderList`, assignData(option))
}
/** 基金订单详情 */
export const OrderDetail = option => {
    return post(`${domain}/fund/${path_version}/OrderDetail`, assignData(option))
}
/** 基金收益明细 */
export const ProfitLossList = option => {
    return post(`${domain}/fund/${path_version}/ProfitLossList`, assignData(option))
}
/** 基金历史持仓 */
export const HistoryHoldingList = option => {
    return post(`${domain}/fund/${path_version}/HistoryHoldingList`, assignData(option))
}
