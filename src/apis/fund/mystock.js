import { post, get, path_version } from '@/httpRequest/http.js'
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
 * @name 查询用户自选股列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000239
 */
export const getWatchlist = (data = {}, config = {}) => {
    return get(`${domain}/mystock/${path_version}/watchlist`, marginOptions(data, config))
}

/**
 * @name 自选股列表更新
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000216
 */
export const updateWatchlist = (data = {}, config = {}) => {
    return post(`${domain}/mystock/${path_version}/watchlist/upd`, marginOptions(data, config))
}
