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
            if (this.$jsBridge) {
                // 监听页面返回
                this.$jsBridge.watchPageVisible(() => {
                    callback()
                })
            } else {
                // 非app页面重新显示事件
                this.propertyData = getPageVisibleSupportProperty()
                // 返回时，刷新页面
                document.addEventListener(
                    this.propertyData.visibilityChange,
                    () => {
                        if (document[this.propertyData.hidden]) return
                        callback()
                    },
                    false
                )
            }
        },
    },
}
