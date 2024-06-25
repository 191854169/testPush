import { getFreezeErrorCode } from '../http.tool'
import freezeService from '@/components/freezeService/index.js'
import { createUnreadableObject } from '@fs/utils'

export default http => {
    http.registerInterceptor('response', {
        onFulfilled: res => {
            const { config = {} } = res || {}
            // 是否展示弹框，默认为true
            const showFreeze = config?.showFreeze === undefined ? true : config?.showFreeze

            // 自研app只有下单相关窗口才展示冻结弹框
            const freezeErrorCode = getFreezeErrorCode()
            const code = res?.data?.error?.code
            if (showFreeze && freezeErrorCode.includes(code)) {
                freezeService.show()

                res.data = createUnreadableObject(res.data)

                config.skipCommonErrorInterceptor = true
                return Promise.reject(res)
            }
            return Promise.resolve(res)
        },
        onRejected: res => {
            return Promise.reject(res)
        },
        options: {},
    })
}
