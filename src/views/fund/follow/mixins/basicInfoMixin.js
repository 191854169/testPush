import { PortfolioBasicInfo } from '@/apis/followInvest/index.js'
import { PORTFOLIO_TYPE_MAP } from '../../config/common'
import { getBasicInfo as getInvesetmentPortfolioBasicInfo } from '@/apis/portfolioFollow/index.js'
import { isTenantApp } from '@/utils'

export default {
    data() {
        return {
            obj: {},
            invesetmentPortfolioBasicInfo: {},
        }
    },
    created() {
        // this.getData()
    },
    methods: {
        // 获取基金基础数据
        async getData() {
            try {
                const { result } = await PortfolioBasicInfo({
                    id: Number(this.$route.query.portfolioId),
                })
                if (result) {
                    this.obj = result || {}
                    result.portfolioType = result.portfolioType || PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK
                    console.log('follow BasicInfo result', result)
                    // 在恒利 App 才请求，关联的投顾组合 id, 获取关联的投顾信息
                    if (isTenantApp()) {
                        const invesetmentPortfolioId = result.relatedPortfolioID
                        console.log('getInvesetmentPortfolioBasicInfo portfolioID=', invesetmentPortfolioId)
                        this.getInvesetmentPortfolioBasicInfo(invesetmentPortfolioId)
                    }
                }
            } catch (e) {
                console.log('eror', e)
            }
        },
        //获取投资顾问组合详情
        async getInvesetmentPortfolioBasicInfo(portfolioID) {
            if (!portfolioID) return
            try {
                const { result } = await getInvesetmentPortfolioBasicInfo({
                    portfolioID: portfolioID,
                })
                console.log('getInvesetmentPortfolioBasicInfo ==>', result)
                if (result) {
                    this.invesetmentPortfolioBasicInfo = result
                }
            } catch (e) {
                console.log('getInvesetmentPortfolioBasicInfo error', e)
            }
        },
    },
}
