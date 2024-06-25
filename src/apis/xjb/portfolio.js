import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { post, path_version } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env
import { Merge, isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_JIAOYI}`

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.LOGIN, needCommonParam: true })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

const SERVER_NAME = '/xjb/portfolio/'

/**
 * @name 资产总览
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004761
 */
export const ssaAssetsSummary = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/AssetsSummary`, marginOptions(data, config))
}

/**
 * @name 客户持仓列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004761
 */
export const ssaUserHoldings = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/UserHoldings`, marginOptions(data, config))
}

/**
 * @name 持仓详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004761
 */
export const ssaHoldingDetail = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/HoldingDetail`, marginOptions(data, config))
}
