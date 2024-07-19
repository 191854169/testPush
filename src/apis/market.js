import { post } from '@/httpRequest/http.js'
import { isTenantApp } from '@/utils'

// import store from '@/store/fund'
const { VUE_APP_MKTDATA = '', NODE_ENV } = process.env

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_MKTDATA}`
const commonConfig = {
    encrypt: 0, // 1: 临时加密； 2 登录加密  0:所有状态不加密
    origin: false,
}
// 合并请求参数
const marginOptions = (data, config) => {
    return Object.assign({}, commonConfig, { data }, config)
}
/**
 * @name 获取历史行情涨跌数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002331
 */
export const hisQuoteChg = (data = {}, config = {}) => {
    return post(`${domain}/market/v1/hisQuoteChg`, marginOptions(data, config))
}

/**
 * @name 查询证券基础报价数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000271
 */
export const quote = (data = {}, config = {}) => {
    return post(`${domain}/market/v1/secu/quote`, marginOptions(data, config))
}

/**
 * @name 查询证券交易日历
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004653
 */
export const tradingCalendar = (data = {}, config = {}) => {
    return post(`${domain}/market/v1/trading_calender`, marginOptions(data, config))
}
