import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { post, path_version } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env
import { Merge, isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') {
    domain = `${VUE_APP_JIAOYI}`
}

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.LOGIN, needCommonParam: true })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

const SERVER_NAME = '/ftd/order/'

/**
 * @name 订单列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004668@toc0
 */
export const ftdOrderList = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderList`, marginOptions(data, config))
}

/**
 * @name 订单详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004668@toc1
 */
export const ftdOrderDetail = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderDetail`, marginOptions(data, config))
}

/**
 * @name 订单创建
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004668@toc2
 */
export const ftdOrderCreate = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderCreate`, marginOptions(data, config))
}
/**
 * @name 订单统计
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004668@toc3
 */
export const ftdOrderStatistics = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/OrderStatistics`, marginOptions(data, config))
}
