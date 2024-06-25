import { get } from '@/httpRequest/http'
const { VUE_APP_OPERATION = '', NODE_ENV } = process.env

const isInApp = /platform\/fosunhani/.test(window.navigator.userAgent)

const baseURL = isInApp || NODE_ENV !== 'development' ? VUE_APP_OPERATION : ''
const baseConfig = {
    origin: false,
}
/**
 * Get Banner List
 */
export const getBannerList = (params, config = {}) => {
    return get(`${baseURL}/ad/v1/BannerList`, { params, ...baseConfig, ...config })
}
