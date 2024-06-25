<template>
    <div class="card invest-compose" id="invest">
        <h3 class="title">{{ $t('investCompose') }}</h3>
        <f-empty v-if="empty"></f-empty>
        <fosun-tabs v-else v-model="active" circle class="outter-tabs">
            <van-tab :title="$t('assetType')" v-if="asset.list.length">
                <invest-compose-chart :update-time="asset.updateTime" :list="asset.list"></invest-compose-chart>
            </van-tab>
            <van-tab :title="$t('industryDistribute')" v-if="industry.list.length">
                <invest-compose-chart :update-time="industry.updateTime" :list="industry.list"></invest-compose-chart>
            </van-tab>
            <van-tab :title="$t('areaDistribute')" v-if="area.list.length">
                <invest-compose-chart :update-time="area.updateTime" :list="area.list"></invest-compose-chart>
            </van-tab>
            <van-tab :title="$t('bondCredit')" v-if="bond.list.length">
                <invest-compose-chart :update-time="bond.updateTime" :list="bond.list"></invest-compose-chart>
            </van-tab>
        </fosun-tabs>
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, DatasetComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import FosunTabs from '@/components/FosunTabs.vue'
import { Tab } from 'vant'
import InvestComposeChart from './InvestComposeChart.vue'
import { getCompose } from '@/apis/fund/fund.js'
import FEmpty from '@/components/Empty.vue'

const plugins = [GridComponent, PieChart, CanvasRenderer, UniversalTransition, DatasetComponent]

echarts.use(plugins)

export default {
    name: 'invest-compose',
    components: {
        FosunTabs,
        [Tab.name]: Tab,
        InvestComposeChart,
        FEmpty,
    },
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            active: 0,
            asset: { list: [], updateTime: '' },
            industry: { list: [], updateTime: '' },
            area: { list: [], updateTime: '' },
            bond: { list: [], updateTime: '' },
        }
    },
    computed: {
        empty() {
            let count = 0
            ;['asset', 'industry', 'area', 'bond'].forEach(key => {
                if (!this[key].list.length) {
                    count += 1
                }
            })
            return count === 4
        },
    },
    mounted() {
        this.getDetail()
    },
    methods: {
        async getDetail() {
            try {
                const params = { symbol: this.$route.query.symbol, type: 'all' }
                const { result } = (await getCompose(params)) || {}
                const r = result || {}
                const list = r.list || []
                const handler = (list = []) => {
                    return list.map(i => ({ value: i.rate, name: i.name }))
                }
                const data = list.reduce((o, c) => {
                    o[c.type] = { list: handler(c.components), updateTime: c.updateTime }
                    return o
                }, {})
                console.log('eee ===>', data)
                this.asset = data.asset || { list: [], updateTime: '' }
                this.industry = data.sector || { list: [], updateTime: '' }
                this.area = data.region || { list: [], updateTime: '' }
                this.bond = data.bondCredit || { list: [], updateTime: '' }
            } catch (e) {
                console.error(e)
            }
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px;
    padding: 8px 0 24px;
    background: #fff;
    border-radius: 8px;
}

.invest-compose {
    .title {
        padding: 0 12px;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    .update-time {
        margin: 8px 0 0;
        padding: 9px 12px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
    }

    .outter-tabs {
        margin: 0 12px;
    }
}
</style>
