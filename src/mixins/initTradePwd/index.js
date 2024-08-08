import { TRADE_PWD_STATUS } from '@/utils/user'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
import { getAppVersion, compareVersion } from '@/utils/tools'
import { getRunEnv } from '../../utils/env'

// 判断是否 未设置交易密码
export function isNeedToSetTrade(store) {
    // 在非app内部，不用做交易密码的校验
    if (getRunEnv() !== 1) return false
    const userInfo = store.state.user.userInfo // 证券户信息
    // 未设置交易密码
    const isUnsetTradePwd = userInfo?.clientInfo?.pwdStatus === TRADE_PWD_STATUS.PWD_UNSET
    const isNeedToCheck = userInfo?.clientInfo?.pwdStatus === TRADE_PWD_STATUS.PWD_NEED_CHECK
    return isUnsetTradePwd || isNeedToCheck
}

export default ({ store } = {}) => {
    if (isNeedToSetTrade(store)) {
        // 跳转到交易页面
        // const supportVerifyTradePwdVersion = '1.1.0'
        // const supportVerifyTradePwd = compareVersion(getAppVersion(), supportVerifyTradePwdVersion) >= 0
        // if (supportVerifyTradePwd) {
        //     JSBridge.verifyTradePwd()
        // } else {
        //     JSBridge.tradeLogin()
        // }
        JSBridge.verifyTradePwd()
        return false
    }
    return true
}
