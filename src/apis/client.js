import { get, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
import { isTenantApp } from '@/utils'
const { VUE_APP_UC = '', NODE_ENV } = process.env

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_UC}`

const mergeOptions = (options, isInWt = path_version === 'v0') => {
    const data = options.data || (options.data = {})
    const commonParam = []
    if (isInWt) {
        let accts = {}
        let sub = ''
        try {
            accts = JSON.parse(localStorage.getItem('accts')) || {}
            sub = JSON.parse(localStorage.getItem('sub')) || {} // 通过网厅带来的subAccountId
        } catch (e) {} // eslint-disable-line
        const { subAcctId } = accts
        commonParam.push({ key: 'subAccountId', defaultV: subAcctId || sub || undefined }) // 同花顺获取session的必要参数
    }
    commonParam.forEach(({ key, defaultV }) => {
        data[key] = data[key] || defaultV
    })
    if (!options.encrypt) {
        options.encrypt = ENCRYPT_TYPES.LOGIN
    }
    return options
}

/** 获取用户是否PI且不是的情况需要多少资产才能申请 - https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001985@toc98 */
export const getPiStatus = option => {
    return get(`${domain}/client/${path_version}/PIProperty`, mergeOptions({ ...option, origin: false }))
}

/** 获取用户申请PI的进程状态 - https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001985@toc98 */
export const getPiApplyDetail = option => {
    return get(`${domain}/client/${path_version}/PIDetail`, mergeOptions({ ...option, origin: false }))
}
