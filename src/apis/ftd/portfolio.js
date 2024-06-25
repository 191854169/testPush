import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { post, get, path_version } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', VUE_APP_OPERATION = '', NODE_ENV } = process.env
import { Merge, isHLApp } from '@/utils'

let domain = ''
let domain_o = ''
if (isHLApp() || NODE_ENV === 'production') {
    domain = `${VUE_APP_JIAOYI}`
    domain_o = `${VUE_APP_OPERATION}`
}

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.LOGIN, needCommonParam: true })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

const SERVER_NAME = '/ftd/portfolio/'

/**
 * @name 定存宝资产总览
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004672@toc2
 */
export const ftdAssetsSummary = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/AssetsSummary`, marginOptions(data, config))
}

/**
 * @name 客户持仓列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004672@toc3
 */
export const ftdUserHoldings = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/UserHoldings`, marginOptions(data, config))
}

/**
 * @name 持仓详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004672@toc4
 */
export const ftdHoldingDetail = (data = {}, config = {}) => {
    return post(`${domain}${SERVER_NAME}${path_version}/HoldingDetail`, marginOptions(data, config))
}
/**
 * @name 定存宝订阅状态查询
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005513
 */
export const ftdSubscribeStatus = (data = {}, config = {}) => {
    return get(`${domain_o}/newActivity/fixedfund/${path_version}/subscribe_status`, marginOptions(data, config))
}
/**
 * @name 定存宝订阅/取消订阅接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005513
 */
export const ftdSubscribe = (data = {}, config = {}) => {
    return post(`${domain_o}/newActivity/fixedfund/${path_version}/subscribe`, marginOptions(data, config))
}
