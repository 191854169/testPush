import { getLangType } from '@/utils/tools'
import { isTenantApp } from '@/utils'

export default {
    data() {
        return {}
    },
    created() {},
    methods: {
        getTagText(item) {
            const langType = getLangType() // zhCn | zhTc
            if (langType == 'zhCn') {
                return item.name
            } else if (langType == 'zhTc') {
                return item.nameTc
            }
        },
        pushToCustomerDetail(uin) {
            if (uin || uin == 0) {
                const url = `${location.origin}${location.pathname}#/customer-detail?otherUin=${uin}`
                if (this.$jsBridge) {
                    this.$jsBridge.open({ url: encodeURIComponent(url), title: '', mode: 'immersive', inapp: isTenantApp() })
                } else {
                    this.$router.push({
                        path: '/customer-detail',
                        query: {
                            otherUin: uin,
                        },
                    })
                }
            }
        },
    },
}
