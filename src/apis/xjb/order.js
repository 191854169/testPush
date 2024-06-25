import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { post, path_version } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env
import { Merge, isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_JIAOYI}`

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.LOGIN, needCommonParam: true })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

const SERVER_NAME = '/xjb/order/'

/**
 * @name 订单列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004759
 */
export const ssaOrderList = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderList`, marginOptions(data, config))
}

/**
 * @name 订单详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004759
 */
export const ssaOrderDetail = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderDetail`, marginOptions(data, config))
}

/**
 * @name 订单创建
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004759
 */
export const ssaOrderCreate = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderCreate`, marginOptions(data, config))
}
/**
 * @name 订单统计
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004759
 */
export const ssaOrderStatistics = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderStatistics`, marginOptions(data, config))
}

/**
 * @name 产品认购总额
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004759
 */
export const ssaProductTotalApplyAmount = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/ProductTotalApplyAmount`, marginOptions(data, config))
}
