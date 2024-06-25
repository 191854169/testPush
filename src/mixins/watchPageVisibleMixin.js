/**
 * @description: 监听页面显示与否，同时支持app和非app页面
 */
import { getPageVisibleSupportProperty } from '@/utils'

export default {
    data() {
        return {
            propertyData: {}, // 页面监听属性
        }
    },
    mixins: [],
    created() {},
    computed: {},
    methods: {
        watch(callback) {
            if (this.watch.watch) return
            if (this.$jsBridge && this.$jsBridge.watchPageVisible) {
                // 监听页面返回
                this.$jsBridge.watchPageVisible(() => {
                    callback()
                })
            } else {
                // 非app页面重新显示事件
                this.propertyData = getPageVisibleSupportProperty()
                const handle = () => {
                    if (document[this.propertyData.hidden]) return
                    callback()
                }
                // 返回时，刷新页面
                document.addEventListener(this.propertyData.visibilityChange, handle, false)
                this.$once('hook:beforeDestroy', () => {
                    document.removeEventListener(this.propertyData.visibilityChange, handle, false)
                })
            }
            this.watch.watch = true
        },
    },
}
