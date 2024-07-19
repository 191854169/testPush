import { get } from '@/httpRequest/http.js'
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
 * @name 获取热门搜索股票数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001315
 */
export const hotSearch = (data = {}, config = {}) => {
    return get(`${domain}/info/v1/hotSearch`, marginOptions(data, config))
}

/**
 * @name 获取当前日期的交易状态
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002617
 */
export const getExchangeDateStatus = (data = {}, config = {}) => {
    return get(`${domain}/info/v1/exchange/date_status`, marginOptions(data, config))
}
