import { getProfessionalStatus } from '@/utils'
import { isUndefined } from '@/utils/tools'
export default {
    data() {
        return {
            isProfessional: false,
        }
    },
    watch: {
        '$root.isLogin': {
            handler(v) {
                if (!isUndefined(v)) {
                    this.checkPI()
                    !this.isProfessional && this.watchFn()
                }
            },
            immediate: true,
        },
    },
    methods: {
        // 检查是否专业投资者
        async checkPI() {
            try {
                await this.$store.dispatch('user/getUserInfo', { toLogin: false, isRefresh: true })
                const acctObj = this.$store.getters['user/getAccts']
                this.isProfessional = getProfessionalStatus(acctObj.professionalType) // A、B 是个人PI，P、R是公司PI
                console.log(`isProfessional = `, this.isProfessional)
            } catch (e) {
                console.log('getUserInfo=>e:', e)
            }
        },

        // 页面显示的时候校验PI是否认证成功
        watchFn() {
            this.$jsBridge &&
                this.$jsBridge.watchPageVisible(() => {
                    this.checkPI()
                })
        },
    },
}
