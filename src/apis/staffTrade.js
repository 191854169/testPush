import { get, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env
import { isHLApp } from '@/utils'
import { getRunEnv } from '@/utils/env.js'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_JIAOYI}`

// 合并请求参数
const marginOptions = (data, config) => {
    const option = {
        origin: false,
    }
    const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
    const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
    data = Object.assign(data, {
        uin: Number(localStorage.getItem('uin')) || undefined,
        clientId: accts.cltId || undefined,
        accountId: Number(accts.acctId) || undefined,
        subAccountId: subAcctId,
    })
    let defaultEncrypt = ENCRYPT_TYPES.LOGIN
    if (getRunEnv() === 2) {
        defaultEncrypt = ENCRYPT_TYPES.NO_ENCRYPT
    }
    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    return Object.assign(option, { data }, config)
}

/**
 * @name 员工是否可以交易指定股票
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001947@toc1
 */
export const tradeCheck = (data = {}, config = {}) => {
    return get(`${domain}/staffTrade/${path_version}/TradeCheck`, marginOptions(data, config))
}
