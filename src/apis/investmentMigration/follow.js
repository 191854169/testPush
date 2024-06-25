import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { get } from '@/httpRequest/http.js'
const { VUE_APP_WEALTH = '', NODE_ENV } = process.env
import { Merge, isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_WEALTH}`

// 合并请求参数
const mergeInstance = new Merge({ defaultEncrypt: ENCRYPT_TYPES.NO_ENCRYPT, needCommonParam: false })
const marginOptions = mergeInstance.exec.bind(mergeInstance)

/**
 * @name 香港移民2.0推荐组合首页接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005395
 */
export const staticRecommendBreif = (data = {}, config = {}) => {
    return get(`${domain}/portfolioFollow/recommend/brief`, marginOptions(data, config))
}

/**
 * @name 香港移民2.0推荐组合详情页策略接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005396
 */
export const staticStrategy = (data = {}, config = {}) => {
    return get(`${domain}/portfolioFollow/recommend/strategy`, marginOptions(data, config))
}

/**
 * @name 投资组合-投资移民关联组合列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001006031@toc0
 */
export const immigrationPortfolioList = (data = {}, config = {}) => {
    return get(`${domain}/followinvest/v1/ImmigrationPortfolioList`, marginOptions(data, config))
}
