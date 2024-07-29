import { get, post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
import { isTenantApp } from '@/utils'
const { VUE_APP_UC = '', NODE_ENV } = process.env

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_UC}`

// 统一处理参数
const handleParams = option => {
    const params = { ...option, origin: false, encrypt: ENCRYPT_TYPES.LOGIN }

    return params
}

// 文档地址：https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001104
/** 查询用户风险评估状态 */
export const AssessStatus = option => {
    return get(`${domain}/uc/${path_version}/s1/AssessStatus`, handleParams(option))
}

/** 风险评测问卷接口 */
export const RiskQuestionnaire = option => {
    return get(`${domain}/uc/${path_version}/s1/RiskQuestionnaire`, handleParams(option))
}

/** 保存用户风险问卷信息 */
export const RiskAssessSubmit = option => {
    return post(`${domain}/uc/${path_version}/s1/RiskAssessSubmit`, handleParams(option))
}

/** 用户风险等级，投资经验，投资目标，衍生品买卖标记的查询接口 */
export const UserRiskInfo = option => {
    return get(`${domain}/uc/${path_version}/s1/UserRiskInfo`, handleParams(option))
}
