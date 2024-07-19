import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'

export default {
    mounted() {
        JSBridge && JSBridge.setClose(false)
        this.back()
    },
    methods: {
        back() {
            if (JSBridge) {
                window.WebViewBack = function () {
                    JSBridge.close()
                    return true
                }
            }
        },
    },
}
