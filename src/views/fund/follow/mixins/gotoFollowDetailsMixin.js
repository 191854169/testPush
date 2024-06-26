import { isHLApp } from '@/utils'

export default {
    data() {
        return {}
    },
    created() {},
    methods: {
        gotoFollowDetail(portfolioId) {
            if (portfolioId) {
                const url = `${location.origin}/wealth/fund.html#/follow-details?portfolioId=${portfolioId}&compatibility=1`
                if (this.$jsBridge) {
                    this.$jsBridge.open({ url: encodeURIComponent(`${url}`), title: '', mode: 'immersive', inapp: isHLApp() })
                } else {
                    this.$router.push({
                        path: `/follow-details`,
                        query: {
                            portfolioId: portfolioId,
                            compatibility: 1,
                        },
                    })
                }
            }
        },
    },
}
