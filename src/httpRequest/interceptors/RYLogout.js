import { ERROR_COCES, ERROR_CODE_MAP } from '../constants'
import CMHKLogoutInstance from '@/utils/CMHKLogout'

export default http => {
    http.registerInterceptor('response', {
        onFulfilled: response => {
            // 改为执行时判断，因为在初始化时，可能还没有注入初始化标识
            if (sessionStorage.getItem('outsideSource')) {
                const code = response?.data?.error?.code
                if (code) {
                    // 互踢单独做提醒
                    if (code === ERROR_COCES.MYLINK_REJECT) {
                        CMHKLogoutInstance.open()
                        return Promise.reject(response)
                    }
                    const logoutCodes = [
                        ERROR_CODE_MAP.IASIA_UNVALID_SESSION,
                        ERROR_CODE_MAP.ERROR_SESSION,
                        ERROR_CODE_MAP.ERROR_SESSION_EXPIRE,
                        ERROR_CODE_MAP.ERROR_UIN,
                    ]
                    if (logoutCodes.includes(code)) {
                        // 其它情况直接跳转到登录页
                        window.location.href = '/pages/login.html#/'
                    }
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
