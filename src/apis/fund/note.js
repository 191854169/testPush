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
 * @name 票据列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001989
 */
export const getBillsList = (data = {}, config = {}) => {
    return post(`${domain}/note/v1/list`, marginOptions(data, config))
}

/**
 * @name 票据产品营销列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005744
 */
export const getBillsMarketingList = (data = {}, config = {}) => {
    return post(`${domain}/note/v1/marketing_list`, marginOptions(data, config))
}

/**
 * @name 票据详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001993
 */
export const getBillsDetail = (data = {}, config = {}) => {
    return get(`${domain}/note/v1/brief`, marginOptions(data, config))
}

/**
 * @name 票据文件数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002005
 */
export const getBillsFiles = (data = {}, config = {}) => {
    return get(`${domain}/note/v1/file`, marginOptions(data, config))
}

/**
 * @name 票据报价数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002004
 */
export const getBillsQuoteInfo = (data = {}, config = {}) => {
    return get(`${domain}/note/v1/quote`, marginOptions(data, config))
}

/**
 * @name 票据子产品数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002008
 */
export const getBillsProductList = (data = {}, config = {}) => {
    return post(`${domain}/note/v2/product_list`, marginOptions(data, config))
}

/**
 * @name 票据可见产品列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004311
 */
export const getCustomProductList = (data = {}, config = {}) => {
    return post(`${domain}/note/v1/custom_product_list`, marginOptions(data, config))
}

/**
 * @name 票据修改记录详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004353
 */
export const getConfirmInfo = (data = {}, config = {}) => {
    return post(`${domain}/note/v1/confirm_info`, marginOptions(data, config))
}

/**
 * @name 票据可定制产品列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004360
 */
export const getCustomList = (data = {}, config = {}) => {
    return post(`${domain}/note/v1/can_custom_list`, marginOptions(data, config))
}

/**
 * @name 票据事件日期列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005266
 */
export const getEventDate = (data = {}, config = {}) => {
    return post(`${domain}/note/v1/event_date`, marginOptions(data, config))
}

/**
 * @name 票据产品搜索
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005281
 */
export const getBill = (data = {}, config = {}) => {
    return post(`${domain}/note/v1/search_product`, marginOptions(data, config))
}
