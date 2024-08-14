<template>
    <div class="page">
        <!-- 资产总览 -->
        <div>
            <Profile :assetsSummary="assetsSummary" />

            <!-- 资产 -->
            <Asset :assetsBreakdown="assetsBreakdown" :filterDataList="filterDataList" />

            <!-- 购买力 -->
            <!-- <Purchase :assetsSummary="assetsSummary" /> -->

            <!-- 融资 -->
            <!-- <Finance :assetsSummary="assetsSummary" /> -->

            <!-- 风险水平 -->
            <Risk :assetsSummary="assetsSummary" />
        </div>
        <!-- 联系客服 -->
        <TelContact />
    </div>
</template>

<script>
import TelContact from '../components/TelContact.vue'
import Profile from './profile.vue'
import Asset from './asset.vue'
// import Purchase from './purchase.vue'
// import Finance from './finance.vue'
import Risk from './risk.vue'
import { getAssetSummary } from '@/apis/portfolio/index.js'
import NP from 'number-precision'

export default {
    components: {
        Profile,
        Asset,
        // Purchase,
        // Finance,
        Risk,
        TelContact,
    },
    data() {
        return {
            // 资产总览
            assetsSummary: {
                totalAssets: {}, // 总资产净值
                yesterdayProfitLoss: {}, // 昨日收益
                yesterdayPLDate: '', // 昨日收益日期
                availableBalance: {}, // 总现金
                marketValue: {}, // 	账号持仓市值
                totalProfitLoss: {}, // 总持仓盈亏
                totalProfitLossPercentage: '', // 总持仓盈亏比
                maxPurchasingPower: {}, // 最大购买力
                cashPurchasingPower: {}, // 现金购买力
                marginableValue: {}, // 可按仓股票价值
                marginPurchasingPower: {}, // 可融资金额
                useMarginValue: {}, // 已借金额
                interestAmount: {}, // 	计息金额
                surplusMarginValue: {}, // 剩余可借
                accruedInterest: {}, // 应记利息
                marginRatio: '', // 保证金比例
                marginCallAmount: {}, // 追收保证金额
                riskStatus: '', // 	风险状态
                creditLimit: {}, // 最大借贷额
            },
            // 资产分类统计
            assetsBreakdown: {
                HKD: {},
                USD: {},
                CNH: {},
            },
            sortKey: 'assetHKD', // 资产排序KEY
            filterDataList: [], // 资产排序数组
        }
    },
    methods: {
        // 首页资产概览
        async getAssetSummary() {
            try {
                this.$loading.show = true
                const res = await getAssetSummary()
                const { assetsSummary, assetsBreakdown } = res.result || {}
                this.assetsSummary = { ...this.assetsSummary, ...assetsSummary }
                this.assetsBreakdown = { ...this.assetsBreakdown, ...assetsBreakdown }
                this.handleSort()
            } catch (err) {
                err?.error?.message && this.$toast(err?.error?.message)
            } finally {
                this.$loading.show = false
            }
        },

        // 降序排序处理
        handleSort() {
            const filterDataList = Object.values(this.assetsBreakdown)
            // 根据sortKey降序排序
            this.filterDataList = filterDataList.sort((a, b) => {
                const i = a[this.sortKey]
                const j = b[this.sortKey]
                return NP.minus(j - i)
            })
        },
    },
    created() {
        this.getAssetSummary()
    },
}
</script>

<style lang="less">
.page {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    padding: 0 12px;
    overflow-y: auto;
}

.common-card {
    margin-top: 12px;
    padding: 8px 12px;
    background: #fff;
    border-radius: 8px;
}

.common-head {
    height: 36px;

    .icon-about {
        width: 16px;
        height: 16px;
    }
}

.common-content {
    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 36px;
        color: #2f2f2f;
        font-size: 14px;
    }
}
</style>
