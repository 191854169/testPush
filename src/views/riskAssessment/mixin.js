import { lupuJsBridge as JSBridge } from '@fs/jsbridge'

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
