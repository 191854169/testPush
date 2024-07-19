import { post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', NODE_ENV, VUE_APP_ENV } = process.env
import { isTenantApp } from '@/utils'

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_JIAOYI}`

// 合并请求参数
const mergeOptions = (data, config) => {
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
    const defaultEncrypt = ENCRYPT_TYPES.LOGIN

    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    if (VUE_APP_ENV == 'dev') {
        config = { ...config, encrypt: ENCRYPT_TYPES.NO_ENCRYPT }
    }
    return Object.assign(option, { data }, config)
}

/**
 * @name 股票取消订单
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000327@toc9
 */
export const OrderCancel = (data = {}, config = { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC }) => {
    return post(`${domain}/trade/${path_version}/OrderCancel`, mergeOptions(data, config))
}

/**
 * @name 汇率查询
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000327@toc40
 */
export const getExchangeRate = (data = {}, config = {}) => {
    return post(`${domain}/trade/${path_version}/exchangeRate`, mergeOptions(data, config))
}
