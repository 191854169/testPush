import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { post } from '@/httpRequest/http.js'
const { VUE_APP_WEALTH = '', NODE_ENV, VUE_APP_ENV } = process.env
import { Merge, isHLApp } from '@/utils'
import { getPathVersion } from '@/utils/env'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_WEALTH}`

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.LOGIN, needCommonParam: true })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

/**
 * @name 投资移民-资金调拨信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001006037
 * @param subAccountID 用户证券账号 string 必传
 * @param queryAccountID 投资移民专户 string 必传
 * @param uin int 必传
 */
export const cashAllocateInfo = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/immigration/cash_allocate_info`, marginOptions(data, config))
}

/**
 * @name 投顾资产
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005571
 */
export const assetsDetail = (data = {}, config = {}) => {
    return post(`${domain}/portfolioFollow/portfolio/asset/detail`, marginOptions(data, config))
}
