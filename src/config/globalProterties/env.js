import { getRunEnv } from '@/utils/env.js'
import { isTenantApp } from '@/utils'

const openFeatures = [''] // h5开放的交易功能列表,待需求提供完善

function getAllEnv() {
    return getRunEnv() // 当前环境  1，自研， 2，网厅（包含同花顺app内）， 3 站外H5
}
export const env = getAllEnv() // 当前环境  1，自研， ， 3 站外H5
export const isInApp = isTenantApp() // 是否在APP内，true是
// 站外H5是否开启该功能
export const getOpenFeatures = (option = '') => {
    // app内默认功能都开启
    if (isInApp) {
        return true
    }
    return openFeatures.includes(option)
}
const envObj = {
    env,
    isInApp,
    getOpenFeatures,
}

export default envObj
