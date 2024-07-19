// 基金综合表现页
<template>
    <div class="comprehensive-performance">
        <basic-info :fundInfo="fundInfo" :isOnlyBasicInfo="true" class="outter-basic-info"></basic-info>
        <div class="tabs-wrapper fixed" v-if="fixedFlag">
            <ul class="tabs" @click="onTabChange($event, 'fixed')">
                <li class="tab mask" :class="{ selected: item.key === period }" v-for="item in tabs" :key="item.key" :data-key="item.key">
                    {{ item.label }}
                </li>
            </ul>
        </div>
        <div class="tabs-wrapper" ref="tabsWrapper">
            <ul class="tabs" @click="onTabChange">
                <li class="tab mask" :class="{ selected: item.key === period }" v-for="item in tabs" :key="item.key" :data-key="item.key">
                    {{ item.label }}
                </li>
            </ul>
        </div>
        <radar-map
            @period-change="onPeroidChange"
            :showMoreBtn="false"
            :showTabs="false"
            :period="period"
            :initPeriod="initPeriod"
            ref="radarMapRef"
        ></radar-map>
        <analysis-detail :period="period"></analysis-detail>
        <similar-fund :period="period"></similar-fund>
        <template>
            <div class="footer-box">
                <div ref="footerTemp"></div>
            </div>
        </template>
    </div>
</template>

<script>
import BasicInfo from '../components/BasicInfo.vue'
import AnalysisDetail from '../components/AnalysisDetail.vue'
import RadarMap from '../components/RadarMap.vue'
import SimilarFund from '../components/SimilarFund.vue'
import initMixins from '../../mixins/initButton/index'
import { PERIOD_MAP } from '../../config/common'
export default {
    name: 'comprehensive-performance',
    mixins: [initMixins],
    components: {
        BasicInfo,
        AnalysisDetail,
        SimilarFund,
        RadarMap,
    },
    data() {
        return {
            period: 'y3',
            fundInfo: {},
            tabs: PERIOD_MAP.YEAR_OPTIONS,
            fixedFlag: false,
        }
    },
    computed: {
        initPeriod() {
            return this.$route.query.period
        },
    },
    async mounted() {
        this.period = this.initPeriod
        window.addEventListener('scroll', this.handleScroll, true)
    },
    beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll, true)
    },
    methods: {
        handleScroll() {
            const top = this.$refs.tabsWrapper.getBoundingClientRect().top
            this.fixedFlag = top <= 0
        },
        onPeroidChange(v) {
            this.period = v
            if (!this.isInHlApp) {
                this.$router.replace({
                    path: this.$route.path,
                    query: {
                        ...this.$route.query,
                        period: v,
                    },
                })
            }
        },
        onTabChange(e) {
            const { key } = e.target.dataset
            if (!key || key === this.period) return
            this.onPeroidChange(key)
        },
    },
}
</script>

<style scoped lang="less">
@import (reference) '~@/assets/css/mixins.less';
@import (once) url('../../mixins/initButton/index.less');

.comprehensive-performance {
    overflow: auto;
    background: #f9f9f9;
    #iosBottom(61px);

    .outter-basic-info {
        margin-top: 12px;
        padding-top: 12px;
    }

    .footer-box {
        #iosBottom();

        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        background: #fff;
    }

    .tabs-wrapper {
        margin-bottom: -15px;
        // position: sticky;
        // top: 0;
        padding: 20px 12px 16px;

        &.fixed {
            position: fixed;
            top: 0;
            z-index: 9999;
            width: 100%;
            max-width: 375px;
            padding: 8px 12px;
            background: #fff;
        }
    }

    .tabs {
        display: flex;
        justify-content: space-between;

        .tab {
            width: 112px;
            color: #666;
            font-size: 14px;
            line-height: 28px;
            text-align: center;
            border-radius: 18px;

            &.selected {
                color: #2f2f2f;
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
