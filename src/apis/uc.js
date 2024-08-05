import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { get, post, path_version } from '@/httpRequest/http.js'
import { isTenantApp } from '@/utils'
const { VUE_APP_UC = '', NODE_ENV } = process.env

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_UC}`
/** 查询用户详情 - 包含userInf和clientInfo - https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000142@toc22 */
export const getUserDetail = option => {
    return get(`${domain}/uc/v1/s1/UserDetail`, { ...option, origin: false, encrypt: ENCRYPT_TYPES.LOGIN })
}

/** （已废弃）根据subAccountId查询用户详情 - 供同花顺使用 */
export const getSubAcctInfo = option => {
    return get(`${domain}/uc/v0/SubAcctInfo`, { ...option, origin: false, encrypt: ENCRYPT_TYPES.NO_ENCRYPT })
}

/** 根据subAccountId查询用户详情 - 供同花顺使用 */
export const getSubAcctDetail = option => {
    return get(`${domain}/uc/v0/SubAcctDetail`, { ...option, origin: false, encrypt: ENCRYPT_TYPES.NO_ENCRYPT })
}

/** 根据subAccountId查询用户现金转孖展申请状态 */
export const getC2MApplyStatus = option => {
    return get(`${domain}/uc/${path_version}/C2MApplyStatus`, { ...option, origin: false })
}

// h5交易登录
export const TradeLogin = data => {
    return post(domain + '/uc/v1/s1/TradeLogin', { data, encrypt: ENCRYPT_TYPES.LOGIN, origin: false })
}

/** ‒ 查询用户的账号信息及策略子账户开户申请状态。 */
export const getAccountStatus = data => {
    return post(`${domain}/account/v1/TgState`, { data, origin: false, encrypt: ENCRYPT_TYPES.LOGIN })
}

/** 退出登录 https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000142@toc18 */
export const Logout = data => {
    return post(domain + '/uc/v1/Logout', { data, origin: false })
}

/** 查询用户配置 常用数量、订单预设、持仓字段排序等 - */
export const queryClientSetting = option => {
    return get(`${domain}/uc/${path_version}/ClientSettingQuery`, { ...option, origin: false, encrypt: ENCRYPT_TYPES.LOGIN })
}
/** 设置用户配置 常用数量、订单预设、持仓字段排序等 - */
export const setClientSetting = data => {
    return post(`${domain}/uc/${path_version}/ClientSettingSet`, { data, origin: false, encrypt: ENCRYPT_TYPES.LOGIN })
}

// 同花顺国际版通过ticket拿uin、rndKey、session
export const TicketCheck = params => {
    return get(`${domain}/uc/v1/TicketCheck`, { params, encrypt: ENCRYPT_TYPES.NO_ENCRYPT, origin: false })
}

// 虚拟资产ETF ipo问卷状态查询接口
export const getIpoQuestionnaireStatus = params => {
    return get(`${domain}/uc/v1/IpoQuestionnaireStatus`, { params, origin: false, encrypt: ENCRYPT_TYPES.LOGIN })
}
