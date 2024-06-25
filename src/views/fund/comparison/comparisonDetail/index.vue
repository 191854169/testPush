<template>
    <div class="comparison-detail" ref="container">
        <div v-show="symbols.length > 0" ref="dom">
            <header :class="{ 'header-shadow': showShadow }">
                <wrong-tips v-show="!isSameType"></wrong-tips>
                <fund-list
                    ref="fundList"
                    :list="fundList"
                    @dispatchScroll="collectDispatchHandler"
                    @collectContext="collectContextHandler"
                    @subtract="subtractHandler"
                ></fund-list>
            </header>
            <radar-map ref="radar" :symbols="symbols" @dispatchScroll="collectDispatchHandler" @collectContext="collectContextHandler"></radar-map>
            <performance-trend ref="trend" class="card" :fundList="fundList" :symbols="symbols"></performance-trend>
            <history-profit
                ref="profit"
                class="card"
                @dispatchScroll="collectDispatchHandler"
                @collectContext="collectContextHandler"
                :fundList="fundList"
                :symbols="symbols"
            ></history-profit>
            <risk-indicator
                ref="risk"
                class="card"
                @dispatchScroll="collectDispatchHandler"
                @collectContext="collectContextHandler"
                :fundList="fundList"
                :symbols="symbols"
            ></risk-indicator>
        </div>
        <empty-list v-show="symbols.length === 0" />
    </div>
</template>
<script>
import { getCompareLabel } from '@/apis/fund/fund.js'
import fundList from './fundList.vue'
import wrongTips from '../wrongTips.vue'
import performanceTrend from './performanceTrend.vue'
import historyProfit from './historyProfit.vue'
import riskIndicator from './riskIndicator.vue'
import emptyList from './emptyList.vue'
import RadarMap from './RadarMap.vue'

export default {
    name: 'comparisonDetail',
    components: {
        fundList,
        wrongTips,
        performanceTrend,
        historyProfit,
        riskIndicator,
        emptyList,
        RadarMap,
    },
    data() {
        return {
            symbols: this.$route.query.symbols ? JSON.parse(decodeURIComponent(this.$route.query.symbols)) : [],
            fundList: [],
            showShadow: false,
            eventMap: new Map(),
        }
    },
    computed: {
        // 相同类型
        isSameType() {
            if (this.fundList.length > 0) {
                return this.fundList.every(item => item.type === this.fundList[0].type)
            }
            return true
        },
    },
    created() {
        this.getBasicInfo()
    },
    mounted() {
        const container = this.$refs.container
        const dom = this.$refs.dom
        if (!container || !dom) return
        const scrollHnadler = () => {
            const { y } = dom.getBoundingClientRect()
            this.showShadow = y < 0
        }
        container.addEventListener('scroll', scrollHnadler)
        this.$once('hook:beforeDestroy', () => {
            container.removeEventListener('scroll', scrollHnadler)
        })
    },
    methods: {
        async getBasicInfo() {
            try {
                const { result } = await getCompareLabel({ symbols: this.symbols })
                const list = result?.list || []

                this.fundList = list.map(item => {
                    return {
                        symbol: item.symbol,
                        name: item.name,
                        riskRating: item.riskRating,
                        type: item.type,
                    }
                })
            } catch (e) {
                console.log('getCompareLabel===>e:', e)
            }
        },
        subtractHandler(index) {
            this.fundList.splice(index, 1)
            this.symbols.splice(index, 1)
        },
        // 收集组件
        collectContextHandler(context) {
            if (context && !this.eventMap.has(context)) {
                this.eventMap.set(context, true)
            }
        },
        // 收集事件
        collectDispatchHandler(value) {
            if (value === undefined) return
            const iterator = this.eventMap.keys()
            let next = iterator.next().value
            while (next) {
                next.launchScroll && next.launchScroll(value)
                next = iterator.next().value
            }
        },
    },
}
</script>
<style scoped lang="less">
.comparison-detail {
    height: 100%;
    padding-bottom: 12px;
    overflow: scroll;
    background: #f9f9f9;
}

header {
    position: sticky;
    top: 0;
    z-index: 9999;
}

.header-shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card {
    margin: 12px 12px 0;
    padding: 15px 0 16px;
    background: #fff;
    border-radius: 8px;
}
</style>
