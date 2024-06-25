import { get, post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
const { VUE_APP_WEALTH = '', NODE_ENV, VUE_APP_ENV } = process.env
import { isHLApp } from '@/utils'
import { getRunEnv } from '@/utils/env.js'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_WEALTH}`

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
    let defaultEncrypt = ENCRYPT_TYPES.LOGIN
    const login = !!localStorage.getItem('session')
    if (getRunEnv() === 2 || !login || VUE_APP_ENV === 'dev') {
        defaultEncrypt = ENCRYPT_TYPES.NO_ENCRYPT
    }
    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    return Object.assign(option, { data }, config)
}

/**
 * @name 创建投顾组合
 * @link
 */
export const orderCreate = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/order/create`, mergeOptions(data, config))
}

/**
 * @name 投顾组合-组合详情
 * @link
 */
export const getBasicInfo = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/basic_info`, mergeOptions(data, config))
}

/**
 * @name 持仓明细-市场分布
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005563
 */
export const marketBreakDown = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/asset/market_break_down`, mergeOptions(data, config))
}

/**
 * @name 收益明细-盈亏总览
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005565
 */
export const profitLossSummary = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/customer/profitloss_summary`, mergeOptions(data, config))
}

/**
 * @name 收益明细-收益日历
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005564
 */
export const profitLossCalendar = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/customer/calendar`, mergeOptions(data, config))
}

/**
 * @name 订单记录-列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005566
 */
export const orderRecords = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/order/list`, mergeOptions(data, config))
}

/**
 * @name 订单记录-详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005567
 */
export const getOrderDetail = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/order/detail`, mergeOptions(data, config))
}

/**
 * @name 投顾订单-追加买入
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005568
 */
export const additionalBuying = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/order/additional_buying`, mergeOptions(data, config))
}

/**
 * @name 投顾订单-清仓卖出金额
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005570
 */
export const holdOrderAmount = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/order/sell_amount`, mergeOptions(data, config))
}

/**
 * @name 投顾订单-清仓卖出
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005569
 */
export const orderSoldOut = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/order/clearance_sale`, mergeOptions(data, config))
}

/**
 * @name 投顾资产
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005571
 */
export const investAdvisoryAsset = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/asset/detail`, mergeOptions(data, config))
}
