import { getBasicInfo } from '@/apis/portfolioFollow/index.js'
import { i18n } from '@/i18n/fund'
import { tgProductTypeMap } from '../utils/filters'

export default {
    data() {
        return {
            basicInfo: {},
            currency: null,
            subAccountId: this.$store.getters['user/getSubAccountId'],
            portfolioId: this.$route.query.tgID ?? '',
            applyAccountId: this.$route.query.tgAccID ?? '',
            tagObj: tgProductTypeMap.keyValueMap,
        }
    },
    created() {
        // this.getData()
    },
    methods: {
        //获取投资顾问组合详情
        async getBasicInfo() {
            try {
                const { result } = await getBasicInfo({
                    portfolioID: this.portfolioId,
                })
                console.log('investAdvisor getBasicInfo ==>', result)
                if (result) {
                    this.basicInfo = result
                    this.currency = result.minInitialCurrency ?? 'HKD'
                }
            } catch (e) {
                console.error('investAdvisor getBasicInfo error', e)
            }
        },
    },
}
