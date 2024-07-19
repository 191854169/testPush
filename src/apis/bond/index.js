import { get, post } from '@/httpRequest/http.js'
const { VUE_APP_WEALTH = '', NODE_ENV } = process.env
import { isTenantApp } from '@/utils'

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_WEALTH}`

const commonConfig = {
    encrypt: 0, // 1: 临时加密； 2 登录加密  0:所有状态不加密
    origin: false,
}
// 合并请求参数
const marginOptions = (data, config) => {
    return Object.assign({}, commonConfig, { data }, config)
}
/**
 * @name 债券列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001972
 */
export const getList = (data = {}, config = {}) => {
    return post(`${domain}/bond/v1/list`, marginOptions(data, config))
}
/**
 * @name 美国国债列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002630
 */
export const getUsaBondList = (data = {}, config = {}) => {
    return post(`${domain}/bond/v1/us_bond_list`, marginOptions(data, config))
}

/**
 * @name 债券报价信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001975
 */
export const getQuote = (data = {}, config = {}) => {
    return get(`${domain}/bond/v1/quote`, marginOptions(data, config))
}

/**
 * @name 债券历史走势/价格数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001978
 */
export const getPriceHis = (data = {}, config = {}) => {
    return post(`${domain}/bond/v1/price_his`, marginOptions(data, config))
}

/**
 * @name 债券基本简况
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001973
 */
export const getBrief = (data = {}, config = {}) => {
    return get(`${domain}/bond/v1/brief`, marginOptions(data, config))
}

/**
 * @name 债券公司信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001977
 */
export const getCompanyInfo = (data = {}, config = {}) => {
    return get(`${domain}/bond/v1/company_info`, marginOptions(data, config))
}

/**
 * @name 债券交易信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001976
 */
export const getTradeInfo = (data = {}, config = {}) => {
    return get(`${domain}/bond/v1/trade_info`, marginOptions(data, config))
}

/**
 * @name 债券文件接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001979
 */
export const getFile = (data = {}, config = {}) => {
    return get(`${domain}/bond/v1/file`, marginOptions(data, config))
}
