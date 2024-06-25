import { getRunEnv } from '@/utils/env.js'
import { isTHSApp, isHLApp, isTHSI18NApp } from '@/utils'
import mylinkJsbridge from '@fs/jsbridge/dist/lib/mylinkJsBridge.js'

const isInMylink = mylinkJsbridge.isInMylink() // 是否在中移动
const openFeatures = [''] // h5开放的交易功能列表,待需求提供完善

function getAllEnv() {
    // 完善getRunEnv方法，暂不直接改getRunEnv方法，可能有些逻辑有用getRunEnv方法，如mixins/HKIndentify/index.js
    if (isInMylink) {
        return 4
    }
    if (isTHSI18NApp()) {
        return 5
    }
    return getRunEnv() // 当前环境  1，自研， 2，网厅（包含同花顺app内）， 3 站外H5
}
export const env = getAllEnv() // 当前环境  1，自研， 2，网厅， 3 站外H5  4 中移动   5同花顺国际版
export const isInApp = isHLApp() || isInMylink || getRunEnv() == 2 || isTHSApp() || isTHSI18NApp() // 是否在APP内，true是
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
