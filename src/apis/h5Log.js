import { post } from '@/httpRequest/http'
const { VUE_APP_H5LOG = '' } = process.env

export const LogNew = data => {
    return post(`${VUE_APP_H5LOG}/h5Log/v1/LogNew`, { data, jsonRpc: false, encrypt: 0, jsBridge: false })
    // return get(`${BASE_URL_OPERATION}/operation/${path_version}/UserCouponList`, {params})
}
