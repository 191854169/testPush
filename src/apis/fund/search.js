import { get } from '@/httpRequest/http.js'
const { VUE_APP_MKTDATA = '', NODE_ENV } = process.env
import { isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_MKTDATA}`

const commonConfig = {
    encrypt: 0, // 1: 临时加密； 2 登录加密  0:所有状态不加密
    origin: false,
}
// 合并请求参数
const marginOptions = (data, config) => {
    return Object.assign({}, commonConfig, { data }, config)
}
/**
 * @name 基金搜索
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001303
 */
export const getFund = (data = {}, config = {}) => {
    return get(`${domain}/search/v1/fund`, marginOptions(data, config))
}

/**
 * @name 股票代码搜索
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000390
 */
export const getStock = (data = {}, config = {}) => {
    return get(`${domain}/search/v4/stock`, marginOptions(data, config))
}
/**
 * @name 票据询价标的搜索
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005252
 */
export const searchNoteObject = (data = {}, config = {}) => {
    return get(`${domain}/search/v1/note_object_code`, marginOptions(data, config))
}
