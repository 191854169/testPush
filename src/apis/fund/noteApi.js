import { post, ENCRYPT_TYPES, path_version } from '@/httpRequest/http.js'
const { VUE_APP_WEALTH = '', NODE_ENV, VUE_APP_ENV } = process.env
import { isHLApp } from '@/utils'
import { getRunEnv } from '@/utils/env.js'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_WEALTH}`

// 合并请求参数
const marginOptions = (data, config) => {
    // 合并参数不应改变传递进来的值
    const dataClone = JSON.parse(JSON.stringify(data))
    const option = {
        origin: false,
    }
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const accts = userInfo.clientInfo?.accts?.[0] || {}
    const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
    const hlID = Number(userInfo.hlId) || undefined
    const newData = Object.assign(dataClone, {
        uin: Number(localStorage.getItem('uin')) || undefined,
        clientId: accts.cltId || undefined,
        accountId: Number(accts.acctId) || undefined,
        subAccountId: subAcctId,
        hlID: hlID,
    })
    let defaultEncrypt = ENCRYPT_TYPES.LOGIN
    const login = !!localStorage.getItem('session')
    if (getRunEnv() === 2 || !login || VUE_APP_ENV === 'dev') {
        defaultEncrypt = ENCRYPT_TYPES.NO_ENCRYPT
    }
    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    return Object.assign(option, { data: newData }, config)
}

/**
 * @name 票据询价新增询价单
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005200
 */
export const NoteInquiryOrderCreate = (data = {}, config = {}) => {
    return post(`${domain}/noteApi/${path_version}/NoteInquiryOrderCreate`, marginOptions(data, config))
}
/**
 * @name 票据每日询价单列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005208
 */
export const NoteInquiryDaily = (data = {}, config = {}) => {
    return post(`${domain}/noteApi/${path_version}/NoteInquiryOrderDaily`, marginOptions(data, config))
}
/**
 * @name 票据历史询价列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005209
 */
export const NoteInquiryHistory = (data = {}, config = {}) => {
    return post(`${domain}/noteApi/${path_version}/NoteInquiryOrderList`, marginOptions(data, config))
}
/**
 * @name 票据询价单详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005211
 */
export const NoteInquiryOrderDetail = (data = {}, config = {}) => {
    return post(`${domain}/noteApi/${path_version}/NoteInquiryOrderDetail`, marginOptions(data, config))
}
/**
 * @name 票据询价单详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005267
 */
export const NoteInquiryOrderChoice = (data = {}, config = {}) => {
    return post(`${domain}/noteApi/${path_version}/NoteInquiryOrderChoice`, marginOptions(data, config))
}
/**
 * @name 白名单校验接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005270
 */
export const NoteInquiryWhiteList = (data = {}, config = {}) => {
    return post(`${domain}/noteApi/${path_version}/NoteInquiryWhiteList`, marginOptions(data, config))
}
