// 公募
<template>
    <div class="public-detail" ref="publicDetailRef">
        <!-- <logo-ad v-if="isNotInHLAndWTAppAndRY"></logo-ad> -->
        <ul v-if="isInHLApp || isInRy" class="tabs" @click="onTabClick" :style="{ maxHeight: showTabs ? '150px' : '0' }">
            <li
                class="tab mask"
                :class="{ selected: activeTab === item.hash }"
                v-for="(item, idx) in tabs"
                :key="idx"
                :data-id="item.hash"
                :data-label="item.label"
            >
                <a>{{ item.label }}</a>
            </li>
        </ul>
        <basic-info
            ref="basicInfoRef"
            :style="{ 'margin-top': isNotInHLAndWTAppAndRY ? '0.08rem' : '0.11rem' }"
            @getFundInfo="getFundInfo"
        ></basic-info>
        <radar-map></radar-map>
        <performance-trend></performance-trend>
        <history-module></history-module>
        <holding></holding>
        <invest-compose></invest-compose>
        <assets-chart></assets-chart>
        <risk-indicator></risk-indicator>
        <profile></profile>
        <trade-rule :fundType="fundType"></trade-rule>
        <RiskStatement></RiskStatement>
    </div>
</template>

<script>
import BasicInfo from './components/BasicInfo.vue'
import PerformanceTrend from './components/PerformanceTrend.vue'
import Holding from './components/Holding.vue'
import InvestStyleBox from './components/InvestStyleBox.vue'
import AssetsChart from './components/AssetsChart.vue'
import InvestCompose from './components/InvestCompose.vue'
import HistoryModule from './components/HistoryModule.vue'
import Profile from './components/Profile.vue'
import RiskIndicator from './components/RiskIndicator.vue'
import TradeRule from './components/TradeRule.vue'
import RadarMap from './components/RadarMap.vue'
import RiskStatement from '../components/RiskStatement.vue'
import { isHLApp } from '../../../utils'
import { isInRyH5 } from '@/utils'

export default {
    name: 'public-detail',
    components: {
        BasicInfo,
        PerformanceTrend,
        Holding,
        InvestStyleBox,
        AssetsChart,
        InvestCompose,
        HistoryModule,
        Profile,
        RiskIndicator,
        TradeRule,
        RadarMap,
        RiskStatement,
    },
    data() {
        return {
            tabs: [
                {
                    hash: 'performance-trend',
                    label: this.$t('performance'),
                },
                {
                    hash: 'holding',
                    label: this.$t('holding'),
                },
                {
                    hash: 'invest',
                    label: this.$t('analysis'),
                },
                {
                    hash: 'profile',
                    label: this.$t('profile'),
                },
                {
                    hash: 'trade-rule',
                    label: this.$t('rule'),
                },
            ],
            activeTab: 'performance-trend',
            showTabs: false,
            isScrolling: false,
            fundType: 4,
            fundInfo: {},
        }
    },
    computed: {
        symbol() {
            return this.$route.query.symbol
        },
        isInHLApp() {
            return isHLApp()
        },
        // 睿银不展示广告
        isInRy() {
            return isInRyH5()
        },
        isNotInHLAndWTAppAndRY() {
            return !this.$env.isInApp && !this.isInRy
        },
    },
    watch: {
        showTabs(v) {
            let title
            if (v) {
                title = this.$refs.basicInfoRef.fundInfo.name
            } else {
                title = this.$t('fundDetail')
            }
            if (this.$jsBridge) {
                this.$jsBridge.setTitle(title)
            } else {
                document.title = title
            }
        },
    },
    mounted() {
        if (this.isInHLApp || this.isInRy) {
            this.onScrollListener()
        }
    },
    methods: {
        getFundInfo(info = {}) {
            this.fundInfo = info
            this.fundType = info.type
        },
        onScrollListener() {
            const container = document
            const self = this
            const fnc = () => {
                const scrollElement = document.documentElement
                if (this.isScrolling) {
                    clearTimeout(this.timer)
                    this.timer = setTimeout(() => {
                        self.judgeScrollStop(scrollElement.scrollTop, this.timer)
                    }, 300)
                    return
                }
                this.showTabs = scrollElement.scrollTop > 10
                for (let index = 0, tab = null; index < this.tabs.length; index++) {
                    tab = this.tabs[index]
                    const dom = document.querySelector(`#${tab.hash}`)
                    if (!dom) continue
                    const rect = dom.getBoundingClientRect()
                    if (!['trade-rule'].includes(tab.hash) && rect.top < 80) {
                        this.activeTab = tab.hash
                    }
                    if (
                        tab.hash === 'trade-rule' &&
                        Math.ceil(scrollElement.scrollTop + scrollElement.offsetHeight) > scrollElement.scrollHeight - 20
                    ) {
                        this.activeTab = tab.hash
                    }
                }
            }
            container.addEventListener('scroll', fnc)
            this.fnc = fnc
        },
        onTabClick(e) {
            const { id, label } = e.target.dataset
            console.log(`Feng.chen:: 19:20:28 ===> `, 'onTabClick', id)
            this.$sensorsTrack('FundDetailTabClick', {
                button_name: label,
            })
            const dom = document.querySelector('#' + id)
            if (!dom) return
            const rect = dom.getBoundingClientRect()
            this.isScrolling = true
            this.activeTab = id
            let top = document.documentElement.scrollTop
            // rect.top 如果是负的 top = top + rect.top
            // rect.top 如果是正的 top = top + (rect.top - 50)
            if (rect.top < 0) {
                top = top + rect.top - 50
            } else {
                top = top + (rect.top - 50)
            }
            document.documentElement.scrollTo({ top, behavior: 'smooth' })
        },
        judgeScrollStop(scrollTop = 0) {
            if (document.documentElement.scrollTop === scrollTop) {
                clearTimeout(this.timer)
                this.timer = null
                this.isScrolling = false
                console.log('ok')
            }
        },
    },

    beforeDestroy() {
        this.fnc && document.documentElement.removeEventListener('scroll', this.fnc)
    },
}
</script>

<style scoped lang="less">
.public-detail {
    padding-top: 0.1px;

    // .mz-footer {
    //     display: flex;
    //     flex-direction: row;
    //     justify-content: center;

    //     .statementSty {
    //         padding: 8px 14px;
    //         color: #666;
    //         font-size: 12px;
    //         line-height: 16px;
    //         text-align: center;
    //         background: #fff;
    //         border-radius: 35px;
    //     }

    //     margin-bottom: 24px;
    // }

    .tabs {
        position: fixed;
        top: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 375px;
        // padding: 7px 0;
        height: 36px;
        max-height: 0;
        overflow: hidden;
        background: #fff;
        box-shadow: inset 0 -0.5px 0 #efefef;
        transition: max-height 0.3s ease-in-out;

        .tab {
            width: 20%;
            text-align: center;

            a {
                color: #666;
                font-size: 15px;
                line-height: 21px;
            }

            &.mask {
                position: relative;

                &::after {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 2;
                    content: '';
                }
            }

            &.selected {
                a {
                    position: relative;
                    color: #2f2f2f;
                    font-weight: 700;
                    font-size: 16px;

                    &::after {
                        position: absolute;
                        right: 0;
                        bottom: -4px;
                        left: 0;
                        height: 2px;
                        background: @theme;
                        border-radius: 16px;
                        content: '';
                    }
                }
            }
        }
    }
}
</style>
