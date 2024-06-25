import { get, post, path_version } from '@/httpRequest/http.js'
const { BASE_URL_CASH = '' } = process.env

/** 查询用户银行卡列表 */
export const UserBankList = option => {
    return get(`${BASE_URL_CASH}/cash/${path_version}/UserBankList`, option)
}

/** 存入资金 */
export const EddiIn = option => {
    return post(`${BASE_URL_CASH}/cash/${path_version}/EddiIn`, option)
}
