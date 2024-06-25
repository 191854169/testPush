import { get, post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
import { getRunEnv } from '@/utils/env.js'
import { isHLApp } from '@/utils'
const { VUE_APP_UC = '', NODE_ENV } = process.env

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_UC}`
// 判断是否是网厅 1.自研App 2.网厅 3.站外H5
const isWangTing = getRunEnv() === 2
// 统一处理参数
const handleParams = option => {
    const params = { ...option, origin: false, encrypt: ENCRYPT_TYPES.LOGIN }
    // 网厅需要加多一个subAccountId参数
    if (isWangTing) {
        // 网厅不加密 1: 临时加密； 2 登录加密  0:所有状态不加密
        params.encrypt = ENCRYPT_TYPES.NO_ENCRYPT
        // get请求
        if (params?.params?.subAcctId) {
            params.params.subAccountId = params.params.subAcctId
        }
        // post请求
        if (params?.data?.subAcctId) {
            params.data.subAccountId = params.data.subAcctId
        }
    }
    return params
}

// 文档地址：https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001104
/** 查询用户风险评估状态 */
export const AssessStatus = option => {
    return get(`${domain}/uc/${path_version}/AssessStatus`, handleParams(option))
}

/** 风险评测问卷接口 */
export const RiskQuestionnaire = option => {
    return get(`${domain}/uc/${path_version}/RiskQuestionnaire`, handleParams(option))
}

/** 保存用户风险问卷信息 */
export const RiskAssessSubmit = option => {
    return post(`${domain}/uc/${path_version}/RiskAssessSubmit`, handleParams(option))
}

/** 用户风险等级，投资经验，投资目标，衍生品买卖标记的查询接口 */
export const UserRiskInfo = option => {
    return get(`${domain}/uc/${path_version}/UserRiskInfo`, handleParams(option))
}
