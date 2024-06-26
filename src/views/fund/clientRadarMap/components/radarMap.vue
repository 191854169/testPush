<template>
    <div class="radar-map">
        <header>
            <h3 class="title">{{ $t('investExpression') }}</h3>
            <multi-img name="icon-remind" directory="fund" @click="onRemind"></multi-img>
        </header>
        <p class="summary">
            <!-- <span>{{ activeTab | periodFilter(tabs) }}</span> -->
            <span class="desc">
                <span>{{ $t('preMoreThanInvest') }}</span>
                <span class="rise">{{ beyondInvestor ? beyondInvestor : '--' }}</span>
                <span>{{ $t('sufMoreThanInvest') }}</span>
            </span>
        </p>
        <div class="tool-tips">
            <div class="content">
                <div class="content-item">
                    <p class="label">{{ $t('me') }}</p>
                    <p class="value">{{ isEmpty ? '--' : userData.compScore ? userData.compScore + $t('radar.score') : '--' }}</p>
                </div>
                <div class="content-item">
                    <p class="label">{{ $t('platformInvestor') }}</p>
                    <p class="value">{{ isEmpty ? '--' : platformData.compScore ? platformData.compScore + $t('radar.score') : '--' }}</p>
                </div>
            </div>
        </div>
        <p class="empty" v-if="isEmpty">
            <multi-img name="noData" directory="common"></multi-img>
            <span>{{ $t('noData') }}</span>
        </p>
        <client-radar-chart
            class="chart"
            v-else
            ref="chart"
            setEmpty="@setEmpty"
            :userData="userData"
            :platformData="platformData"
        ></client-radar-chart>
        <!-- TODO: 第一期隐藏切换时间区间 默认年初至今 
        <ul class="tabs" @click="onTabChange">
            <li class="tab mask" :class="{ selected: item.key === activeTab }" v-for="item in tabs" :key="item.key" :data-key="item.key">{{ item.label }}</li>
        </ul> -->
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent, DatasetComponent, RadarComponent } from 'echarts/components'
import { RadarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { userRadar } from '@/apis/wealth'
import ClientRadarChart from './radarChart.vue'
import { i18n } from '@/i18n/fund'
import pathnames from '@/config/H5Pathname.js'
const plugins = [GridComponent, RadarChart, CanvasRenderer, UniversalTransition, DatasetComponent, RadarComponent]

echarts.use(plugins)

const tabs = [
    { key: 'month', label: i18n.t('preMonth'), value: '' },
    { key: 'year2now', label: i18n.t('yearToDay'), value: '' },
    { key: 'open2now', label: i18n.t('openToDay'), value: '' },
]
export default {
    name: 'client-radar-map',
    components: {
        ClientRadarChart,
    },
    props: {
        showMoreBtn: {
            type: Boolean,
            default: true,
        },
        initPeriod: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            tabs,
            activeTab: 'year2now',
            periodMap: {
                month: {
                    userData: {},
                    platformData: {},
                    isEmpty: false,
                },
                year2now: {
                    userData: {},
                    platformData: {},
                    isEmpty: false,
                },
                open2now: {
                    userData: {},
                    platformData: {},
                    isEmpty: false,
                },
            },
        }
    },
    filters: {
        periodFilter(v, tabs) {
            return tabs.find(i => i.key === v)?.label || '--'
        },
    },
    computed: {
        userData() {
            return this.periodMap[this.activeTab].userData || {}
        },
        platformData() {
            return this.periodMap[this.activeTab].platformData || {}
        },
        isEmpty() {
            return this.periodMap[this.activeTab].isEmpty
        },
        beyondInvestor() {
            return this.userData.beyondInvestor
        },
    },
    created() {
        this.initPeriod && (this.activeTab = this.initPeriod)
    },
    mounted() {
        this.initChart()
    },
    methods: {
        onTabChange(e) {
            const { key } = e.target.dataset
            if (!key || key === this.activeTab) return
            this.activeTab = key
            this.$emit('period-change', this.activeTab)
            this.initChart()
        },
        async getData() {
            try {
                const { result } = (await userRadar()) || {}
                // Object.keys(this.periodMap).forEach(period => {
                const { user, platform } = result || {}
                this.periodMap[this.activeTab].userData = user || {}
                this.periodMap[this.activeTab].platformData = platform || {}
                this.$emit('changeData', { user, platform })
                // })
            } catch (e) {
                console.error('getUserRadar===>e:', e)
            }
        },

        /**
         * 校验是否为空
         * @params period
         * @returns { Boolean } true-为空，false-非空
         */
        async initChart() {
            await this.getData()
            this.$nextTick(() => {
                this.$refs.chart.initChart()
            })
        },

        onRemind() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=INVEST-EXPRESS-DESCRIPTION` // 投资综合表现
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
        setEmpty() {
            this.periodMap[this.activeTab].isEmpty = true
        },
    },
}
</script>

<style scoped lang="less">
.radar-map {
    padding: 15px 12px 20px;

    header {
        display: flex;
        align-items: center;

        .title {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        img {
            width: 16px;
            margin-left: 6px;
        }

        .view-more-box {
            display: flex;
            flex: 1 0 auto;
            align-items: center;
            justify-content: flex-end;
            text-align: right;

            .view-more {
                color: #666;
                font-size: 12px;
                line-height: 16px;
                background: none;
                border: none;
                outline: none;
            }

            img {
                width: 12px;
                margin-left: 4px;
            }
        }
    }

    .summary {
        margin-top: 15px;
        color: #666;
        font-size: 14px;
        line-height: 20px;

        .value {
            color: @theme;
            font-weight: @fontBold;
        }

        .desc {
            .rise {
                color: #ff6907;
                font-weight: 700;
            }
        }
    }

    .tool-tips {
        margin: 18px 0 24px;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 4px;

        .content {
            display: flex;
            justify-content: space-between;

            .content-item {
                position: relative;
                display: flex;
                justify-content: space-between;
                width: 112px;
                margin-left: 12px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;

                .label {
                    color: #2f2f2f;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
                }

                .value {
                    color: #ff6907;
                    font-weight: 700;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .content-item::before {
                position: absolute;
                top: 50%;
                left: -12px;
                width: 6px;
                height: 6px;
                background-color: #ffa800;
                border-radius: 50%;
                transform: translateY(-50%);
                content: '';
            }

            .content-item:first-of-type::before {
                background-color: #278aff;
            }
        }
    }

    .chart {
        height: 184px;
    }

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 184px;
        color: #9c9c9c;
        font-size: 14px;
        line-height: 20px;

        img {
            width: 104px;
            margin-bottom: 12px;
        }
    }

    .tabs {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        padding: 6px 0;

        .tab {
            width: 112px;
            color: #666;
            font-size: 12px;
            line-height: 24px;
            text-align: center;
            border-radius: 18px;

            &.selected {
                color: #ff6907;
                font-weight: 500;
                background: rgba(255, 99, 7, 0.1);
            }

            &.mask {
                position: relative;

                &::after {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 111;
                    content: '';
                }
            }
        }
    }
}
</style>
