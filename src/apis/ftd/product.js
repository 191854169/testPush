import { path_version, get } from '@/httpRequest/http.js'
import { Merge, isHLApp } from '@/utils'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env

let domain = ''
if (isHLApp() || NODE_ENV === 'production') {
    domain = `${VUE_APP_JIAOYI}`
}

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.NO_ENCRYPT, needCommonParam: false })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

const SERVER_NAME = '/ftd/product/'

/**
 * @name 获取产品列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004667@toc2
 * @param {*} data
 * @param {*} config
 * @returns {Promise} 请求实例
 */
export const ftdProductList = (data = {}, config = {}) => {
    return get(`${domain}${SERVER_NAME}${path_version}/ProductList`, marginOptions(data, config))
}

/**
 * @name 获取产品详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004667@toc3
 * @param {*} data
 * @param {*} config
 * @returns {Promise} 请求实例
 */
export const ftdProductDetail = (data = {}, config = {}) => {
    return get(`${domain}${SERVER_NAME}${path_version}/ProductDetail`, marginOptions(data, config))
}
