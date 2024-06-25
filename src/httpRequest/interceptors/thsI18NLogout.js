import { thsI18NJsBridge } from '@fs/jsbridge'

import { getQueryString, isTHSI18NApp } from '@fs/utils'
import { ERROR_COCES, ERROR_CODE_MAP, THS_I18N_TICKET_KEY } from '../constants'
import { Toast } from 'vant'

export default http => {
    http.registerInterceptor('response', {
        onFulfilled: response => {
            // user/modules/user.js会存储 THS_I18N_TICKET_KEY
            if (isTHSI18NApp() && (getQueryString('ticket') || localStorage.getItem(THS_I18N_TICKET_KEY))) {
                const logoutCodes = [
                    ERROR_CODE_MAP.IASIA_UNVALID_SESSION,
                    ERROR_CODE_MAP.ERROR_SESSION,
                    ERROR_CODE_MAP.ERROR_SESSION_EXPIRE,
                    ERROR_CODE_MAP.ERROR_UIN,
                    ERROR_CODE_MAP.ERROR_TRADE_SESSION_EXPIRE,
                    ERROR_COCES.MYLINK_REJECT,
                ]
                if (logoutCodes.includes(response.data.error.code)) {
                    Toast('提示登录失效，请重新登录')
                    localStorage.clear()
                    thsI18NJsBridge.closeWebPage()
                    // 返回reject的情况，后续的interceptor会执行对应的onRejected函数
                    return Promise.reject(response)
                }
            }
            return response
        },
        onRejected: response => {
            return Promise.reject(response)
        },
        options: {},
    })
}
