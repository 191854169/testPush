import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { get, path_version } from '@/httpRequest/http.js'
const { VUE_APP_CASH = '', NODE_ENV } = process.env
import { Merge, isTenantApp } from '@/utils'

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_CASH}`

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.LOGIN, needCommonParam: true })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

/**
 * @name 资金调拨记录查询
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001003925@toc6
 */
export const cashAllocateList = (data = {}, config = {}) => {
    return get(`${domain}/cash/${path_version}/CashAllocateList`, marginOptions(data, config))
}
