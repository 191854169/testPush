<template>
    <div class="client-radar-banner" @click="goPage">
        <div class="banner-left">
            <p class="title">{{ $t('investExpression') }}：{{ source | sourceFilter }}{{ $t('radar.score') }}</p>
            <p class="desc">
                <span>{{ $t('preMoreThanInvest') }}</span>
                <span class="rise">{{ beyondInvestor ? beyondInvestor : '--' }}</span>
                <span>{{ $t('sufMoreThanInvest') }}</span>
            </p>
        </div>
        <div class="banner-right">
            <client-radar-chart class="chart" ref="chart" checkTheme shrink :userData="userData" :platformData="platformData"></client-radar-chart>
            <p class="empty" v-if="isEmpty">{{ $t('noData') }}</p>
        </div>
    </div>
</template>
<script>
import { keepDecimals } from '@/utils'
import { isEmpty } from '@/utils/utils'
import ClientRadarChart from './components/radarChart.vue'

export default {
    name: 'clientRadarBanner',
    components: {
        ClientRadarChart,
    },
    props: {
        userData: {
            type: Object,
            default: () => ({}),
        },
        platformData: {
            type: Object,
            default: () => ({}),
        },
    },
    filters: {
        sourceFilter(v) {
            return v ? keepDecimals(v, 2) : '--'
        },
    },
    computed: {
        isEmpty() {
            return isEmpty(this.userData)
        },
        beyondInvestor() {
            return this.userData.beyondInvestor
        },
        source() {
            return this.userData.compScore
        },
    },
    mounted() {
        this.$refs.chart && this.$refs.chart.initChart()
    },
    methods: {
        goPage() {
            const url = `${location.origin}/wealth/fund.html#/client-radar`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            }
            this.$router.push({ path: '/client-radar' })
        },
    },
}
</script>
<style scoped lang="less">
.client-radar-banner {
    display: flex;
    width: 100%;
    padding: 10px 12px;

    .banner-left {
        flex: 1;
        padding: 6px 0;

        .title {
            padding-bottom: 14px;
            font-weight: 700;
            font-size: 14px;
            line-height: 20px;
            #font_h1();
        }

        .desc {
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            #font_h2();

            .rise {
                font-weight: 700;
                #font_theme();
            }
        }
    }

    .banner-right {
        position: relative;
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;

        .chart {
            width: 100%;
            height: 100%;
        }

        .empty {
            position: absolute;
            top: 50%;
            margin-top: -8px;
            font-weight: 400;
            font-size: 10px;
            line-height: 16px;
            #font_h2();
        }
    }
}
</style>
