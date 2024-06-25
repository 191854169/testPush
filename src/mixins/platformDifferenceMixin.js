// 不同平台差异性操作
import { isFunction } from '@/utils'

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
            } else {
                window.document.title = title
            }
        },
    },
}
