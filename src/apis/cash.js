const { VUE_APP_CASH, NODE_ENV } = process.env
import { get, path_version } from '@/httpRequest/http.js'

const isInApp = /platform\/fosunhani/.test(window.navigator.userAgent)

const baseURL = isInApp || NODE_ENV !== 'development' ? VUE_APP_CASH : ''
const baseConfig = {
    origin: false,
}

/**
 *
 * https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002378@toc1
 */

// H5自动换汇开通状态查询接口
export const AutoFxSetting = (params, config = {}) => {
    return get(`${baseURL}/cash/${path_version}/AutoFxSetting`, { params, ...config, ...baseConfig })
}
