import { post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
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
 * @name 查询用户单币种可提现金额
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000327@toc30
 */
export const getWithDrawalBalance = (data = {}, config = {}) => {
    return post(`${domain}/portfolio/${path_version}/WithdrawalBalance`, marginOptions(data, config))
}

/**
 * @name 首页资产概览
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005259
 */
export const getAssetSummary = (data = {}, config = {}) => {
    return post(`${domain}/portfolio/v3/AssetSummary`, marginOptions(data, config))
}

/**
 * @name 持仓概览接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005259
 */
export const getHolding = (data = {}, config = {}) => {
    return post(`${domain}/portfolio/v3/holdingsGroup`, marginOptions(data, config))
}

/**
 * @name 资金流水
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005259@toc6
 */
export const cashFlowList = data => {
    return post(`${domain}/portfolio/v3/CashFlowList`, marginOptions(data))
}
