<template>
    <div class="private-detail" ref="privateDetailRef">
        <logo-ad v-if="isNotInHLAndWTAppAndRY"></logo-ad>
        <ul v-if="isInHLApp || isInRy || isInThsI18NApp" class="tabs" @click="onTabClick" :style="{ maxHeight: showTabs ? '150px' : '0' }">
            <li class="tab mask" :class="{ selected: activeTab === item.hash }" v-for="(item, idx) in tabs" :key="idx" :data-id="item.hash">
                <a>{{ item.label }}</a>
            </li>
        </ul>
        <basic-info
            ref="basicInfoRef"
            @getBriefData="getBriefInfo"
            @getFundInfo="getFundInfo"
            @checkNoNetWorth="checkNoNetWorth"
            :style="{ 'margin-top': isNotInHLAndWTAppAndRY ? '0.08rem' : '0' }"
        ></basic-info>
        <performance-trend v-if="!noNetWorth"></performance-trend>
        <history-module v-if="!noNetWorth"></history-module>
        <risk-indicator v-if="!noNetWorth"></risk-indicator>
        <invest-module :briefInfo="briefInfo"></invest-module>
        <profile></profile>
        <fund-manager></fund-manager>
        <fund-file></fund-file>
        <rule></rule>
        <RiskStatement></RiskStatement>
    </div>
</template>
<script>
import HistoryModule from './components/HistoryModulePrivate.vue'
import PerformanceTrend from './components/PerformanceTrendPrivate.vue'
import Profile from './components/privateProfile.vue'
import fundManager from './components/privateFundManager.vue'
import investModule from './components/investDetail.vue'
import BasicInfo from './components/BasicInfoPrivate.vue'
import RiskIndicator from './components/RiskIndicator.vue'
import FundFile from './components/FundFile.vue'
import Rule from './components/RulePrivate.vue'
import RiskStatement from '../components/RiskStatement.vue'
import { isHLApp } from '../../../utils'
import { isInRyH5 } from '@/utils'

export default {
    name: 'privateDetail',
    components: {
        BasicInfo,
        PerformanceTrend,
        HistoryModule,
        Profile,
        RiskIndicator,
        FundFile,
        investModule,
        Rule,
        fundManager,
        RiskStatement,
    },
    data() {
        return {
            activeTab: '',
            showTabs: false,
            briefInfo: {},
            isScrolling: false,
            noNetWorth: false, // 无净值数据
        }
    },
    computed: {
        symbol() {
            return this.$route.query.symbol
        },
        isInHLApp() {
            return isHLApp()
        },
        // 睿银不展示广告、展示购买按钮
        isInRy() {
            return isInRyH5()
        },
        isNotInHLAndWTAppAndRY() {
            return !this.$env.isInApp && !this.isInRy
        },
        tabs() {
            return [
                ...(this.noNetWorth
                    ? []
                    : [
                          {
                              hash: 'performance-trend',
                              label: this.$t('performance'),
                          },
                      ]),
                ...[
                    {
                        hash: 'profile',
                        label: this.$t('profile'),
                    },
                    {
                        hash: 'trade-rule',
                        label: this.$t('rule'),
                    },
                ],
            ]
        },
        isInThsI18NApp() {
            return this.$thsI18NJsBridge.isTHSI18NApp()
        },
    },
    watch: {
        tabs: {
            handler(v) {
                this.activeTab = v[0].hash
            },
            deep: true,
            immediate: true,
        },
        showTabs(v) {
            let title
            if (v) {
                title = this.$refs.basicInfoRef.fundInfo.name
            } else {
                title = this.$t('fundDetail')
            }
            if (this.$jsBridge) {
                this.$jsBridge.setTitle(title)
            } else if (this.isInThsI18NApp) {
                this.$thsI18NJsBridge.changeWebViewTitle(title)
            } else {
                document.title = title
            }
        },
        symbol() {
            // 同花顺 安卓版本无效 - 因此在BasicInfoPrivate组件中采用location.href=location.href的方式
            location.reload()
        },
    },
    mounted() {
        if (this.isInHLApp || this.isInRy || this.isInThsI18NApp) {
            this.onScrollListener()
        }
    },
    methods: {
        // goRiskStatement() {
        //     const fileUrl = `static/风险披露&免责声明_${getLangType()}.pdf`
        //     const url = `${location.origin}/wealth/${fileUrl}`
        //     console.log('pdfUrl:', url)
        //     if (this.$jsBridge) {
        //         this.$jsBridge.openPDF({ url: encodeURIComponent(url), title: this.$t('protocol.publicRisk') })
        //     } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
        //         const newUrl = `${location.origin}/wealth/${encodeURIComponent(fileUrl)}`
        //         this.$goPage(newUrl)
        //     } else {
        //         window.open(fileUrl)
        //     }
        // },
        onScrollListener() {
            const self = this
            const fnc = () => {
                const scrollElement = document.documentElement
                this.showTabs = scrollElement.scrollTop > 10
                if (this.isScrolling) {
                    clearTimeout(this.timer)
                    this.timer = setTimeout(() => {
                        self.judgeScrollStop(scrollElement.scrollTop, this.timer)
                    }, 300)
                    return
                }
                for (let index = 0, tab = null; index < this.tabs.length; index++) {
                    tab = this.tabs[index]
                    const dom = document.querySelector(`#${tab.hash}`)
                    if (!dom) continue
                    const rect = dom.getBoundingClientRect()
                    if (!['profile', 'trade-rule'].includes(tab.hash) && rect.top < 116) {
                        this.activeTab = tab.hash
                    }
                    if (
                        tab.hash === 'profile' &&
                        rect.top <
                            window.screen.height - rect.height - document.querySelector('#private-history-module')?.getBoundingClientRect().height
                    ) {
                        this.activeTab = tab.hash
                    }
                    if (
                        tab.hash === 'trade-rule' &&
                        Math.ceil(scrollElement.scrollTop + scrollElement.offsetHeight) > scrollElement.scrollHeight - 60
                    ) {
                        this.activeTab = tab.hash
                    }
                }
            }
            document.addEventListener('scroll', fnc)
            this.fnc = fnc
        },
        onTabClick(e) {
            const id = e.target.dataset.id
            console.log(`Feng.chen:: 19:20:28 ===> `, 'onTabClick', id)
            const dom = document.querySelector('#' + id)
            const rect = dom.getBoundingClientRect()
            this.activeTab = id
            this.isScrolling = true
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

        getFundInfo({ name } = {}) {
            if (this.showTabs) {
                if (this.$jsBridge) {
                    this.$jsBridge.setTitle(name)
                } else {
                    document.title = name
                }
            }
        },
        getBriefInfo(briefInfo = {}) {
            this.briefInfo = briefInfo
        },

        // 检测是否有净值
        checkNoNetWorth(v) {
            this.noNetWorth = v
        },
    },

    beforeDestroy() {
        this.fnc && document.removeEventListener('scroll', this.fnc)
    },
}
</script>
<style scoped lang="less">
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
//     // margin-bottom: 0px;
// }

.private-detail {
    padding-top: 0.1px;
    background-color: #f9f9f9;
    // padding: 12px;
    .tabs {
        position: fixed;
        top: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 100%;
        // padding: 7px 0;
        height: 36px;
        max-height: 0;
        overflow: hidden;
        background: #fff;
        box-shadow: inset 0 -0.5px 0 #efefef;
        transition: max-height 0.3s ease-in-out;

        .tab {
            flex: 1;
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
                        background: #eca46a;
                        border-radius: 16px;
                        content: '';
                    }
                }
            }
        }
    }
}
</style>
<style lang="less" scoped>
.detail-item {
    background-color: #fff;
    border-radius: 8px;
}
</style>
