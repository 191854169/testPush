import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { get } from '@/httpRequest/http'
const { VUE_APP_WEALTH = '', NODE_ENV } = process.env

const isInApp = /platform\/fosunhani/.test(window.navigator.userAgent)

const baseURL = isInApp || NODE_ENV !== 'development' ? VUE_APP_WEALTH : ''
const baseConfig = {
    origin: false,
    encrypt: ENCRYPT_TYPES.NO_ENCRYPT,
}
/**
 * Get PRIVATE FUND AMOUNT - 获取私募份额金额
 * https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002088
 */
export const getAmount = (params, config = {}) => {
    return get(`${baseURL}/amount/v1/get_amount`, { params, ...baseConfig, ...config })
}
