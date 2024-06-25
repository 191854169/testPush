import { post } from '@/httpRequest/http.js'
const { VUE_APP_NEWS = '', NODE_ENV } = process.env
import { isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_NEWS}`

const commonConfig = {
    encrypt: 0, // 1: 临时加密； 2 登录加密  0:所有状态不加密
    origin: false,
}
// 合并请求参数
const marginOptions = (data, config) => {
    return Object.assign({}, commonConfig, { data }, config)
}
/**
 * @name 研究报告
 * @link
 */
export const getNews = (data = {}, config = {}) => {
    return post(`${domain}/news/v2/type/list`, marginOptions(data, config))
}
