// 不同平台差异性操作
import { isTHSApp, isFunction, isTHSI18NApp } from '@/utils'
import { setPageTitle } from '@/utils/thsJsBridgeTools'

export default {
    data() {
        return {}
    },
    created() {},
    methods: {
        // 返回上一页mix 这个是关闭当前webview的（支持webview打开的渠道内）
        backPreviousPage(otherFunc) {
            // HL APP
            if (this.$jsBridge) {
                this.$jsBridge.close()
            } else if (isTHSApp()) {
                // 同花顺
                // eslint-disable-next-line no-undef
                callNativeHandler('goback', { type: 'component' })
            } else if (this.$mylinkJsbridge.isInMylink()) {
                // 中移动返回
                this.$mylinkJsbridge.onNativeBackClick()
            } else if (isTHSI18NApp()) {
                console.log('close should run here1,this.$thsI18NJsBridge', this.$thsI18NJsBridge)
                this.$thsI18NJsBridge.goBack()
            } else {
                if (otherFunc && isFunction(otherFunc)) {
                    otherFunc()
                } else {
                    // 其他网页情况
                    this.$router.go(-1)
                }
            }
        },

        setTitle(title) {
            if (this.$jsBridge) {
                this.$jsBridge.setTitle(title)
            } else if (isTHSApp()) {
                setPageTitle(title)
            } else {
                window.document.title = title
            }
        },
    },
}
