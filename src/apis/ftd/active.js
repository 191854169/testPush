import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { get, path_version } from '@/httpRequest/http.js'
const { VUE_APP_OPERATION = '', NODE_ENV } = process.env
import { Merge, isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_OPERATION}`

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.LOGIN, needCommonParam: true })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

const SERVER_NAME = '/newActivity/fixedfund/'

/**
 * @name 查询定存宝订单结果
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004832
 */
export const getFtdOrderActiveResult = (data = {}, config = {}) => {
    return get(`${domain}${SERVER_NAME}${path_version}/get_ftd_order_result`, marginOptions(data, config))
}
