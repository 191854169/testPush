import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { get } from '@/httpRequest/http'
const { VUE_APP_CMS = '', NODE_ENV } = process.env

const isInApp = /platform\/fosunhani/.test(window.navigator.userAgent)

const baseURL = isInApp || NODE_ENV !== 'development' ? VUE_APP_CMS : ''
const baseConfig = {
    origin: false,
    encrypt: ENCRYPT_TYPES.NO_ENCRYPT,
}
/**
 * Get Article Detail
 */
export const getArticleDetail = (params, config = {}) => {
    return get(`${baseURL}/cms/v1/Article`, { params, ...baseConfig, ...config })
}
