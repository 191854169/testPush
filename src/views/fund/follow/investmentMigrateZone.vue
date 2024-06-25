<!-- 投资移居组合专区 -->
<template>
    <div class="page">
        <multi-img class="bgimage" verifyLang name="img_invert_migrate_bg" directory="fund"></multi-img>
        <div class="content">
            <div v-if="infoList.length === 0" :style="{ height: '54px' }"></div>
            <div
                class="card-info"
                v-for="item in infoList"
                :key="item.portfolioId"
                @click="gotoFollowDetail(item.portfolioId, { goStatic: true, brief: item.brief, avatarOSSID: item.avatarOSSID })"
            >
                <masterTopInfoView :info="item" isStatic :label="item.label" />
                <div class="combination">
                    <div class="top">
                        <div class="flex-c">
                            <span class="group-name">{{ item.portfolioName }}</span>
                            <portfolio-tag class="tag" :portfolioType="item.portfolioType"></portfolio-tag>
                            <portfolio-tag class="tag" :text="riskRatingMap[item.risk || 1]"></portfolio-tag>
                            <portfolio-tag v-if="item.CIES" class="tag" :text="'CIES'"></portfolio-tag>
                        </div>
                        <remainingDayFollower class="mar-t8" :showFollower="false" :margin-style="'12px'" :remainingDay="item.foundDayNum" />
                    </div>
                    <div class="rate-info">
                        <p class="income" v-riseFall="{ value: item.week1Return || 0, base: 2, rate: true }"></p>
                        <p class="income-text">{{ 'w1' | profitTitleFilter }}</p>
                    </div>
                    <div v-if="!!item.portfolioBrief" class="brief mar-t12">
                        <portfolioBrief :text="item.portfolioBrief" :bold-text="$t('follow.brief')" @onClick="showBriefDialog(item)"></portfolioBrief>
                    </div>
                </div>
            </div>
        </div>
        <div class="risk">
            <div class="risk-title">{{ $t('riskWarning') }}</div>
            <div class="risk-label" v-for="(item, index) in riskList" :key="index">
                <div class="mar-r8">{{ index + 1 }}.</div>
                <div>{{ item }}</div>
            </div>
        </div>

        <FooterAdvisors :iconName="'icon_kefu'" :text="$t('follow.consultAdvisor')"></FooterAdvisors>
    </div>
</template>

<script>
import masterTopInfoView from './components/masterTopInfoView'
import remainingDayFollower from './components/remainingDayFollower.vue'
import portfolioBrief from './components/portfolioBrief.vue'
import portfolioTag from './components/portfolioTag.vue'
import gotoFollowDetailsMixin from './mixins/gotoFollowDetailsMixin'
import FooterAdvisors from '@/components/FooterAdvisors.vue'

import { staticRecommendBreif } from '@/apis/investmentMigration'
import { profitTitleFilter } from './utils/filters'
import { RISK_RATING_MAP } from '@/views/fund/config/common.js'

const riskRatingMap = RISK_RATING_MAP.keyValueMap

export default {
    name: '',
    mixins: [gotoFollowDetailsMixin],
    components: {
        masterTopInfoView,
        remainingDayFollower,
        portfolioTag,
        portfolioBrief,
        FooterAdvisors,
    },
    props: {},
    data() {
        return { riskRatingMap, infoList: [] }
    },
    computed: {
        riskList() {
            return this.$t('follow.riskMigrateTip').split('\n')
        },
    },
    watch: {},
    created() {
        this.getMasterList()
    },
    mounted() {},
    destroyed() {},
    filters: { profitTitleFilter },
    methods: {
        async getMasterList() {
            this.$loading.show = true
            try {
                const { result } = (await staticRecommendBreif({ count: 20, start: 0 })) || {}
                this.infoList = result.portfolioList || []
                console.log('getMasterList', result.portfolioList)
                this.$loading.show = false
            } catch (error) {
                this.$loading.show = false
                console.error('getMasterList', error)
            }
        },
        showBriefDialog(item) {
            this.$dialog.alert({
                closeOnClickOverlay: true,
                title: this.$t('follow.brief').replace(/：|:/g, ''),
                message: item.portfolioBrief,
                messageAlign: 'left',
                confirmButtonText: this.$t('confirm'),
            })
        },
    },
}
</script>

<style scoped lang="less">
.page {
    padding-bottom: 70px;

    .bgimage {
        position: relative;
        z-index: 1;
        height: 194px;
    }

    .content {
        margin-top: -54px;
    }

    .card-info {
        position: relative;
        z-index: 2;
        margin: 0 12px 12px;
        padding: 16px 12px;
        background-color: #fff;
        border-radius: 8px;

        // 组合信息
        .combination {
            margin-top: 12px;
            padding: 16px 12px;
            background-color: #f9f9f9;
            border-radius: 4px;

            .top {
                .group-name {
                    margin-right: 8px;
                    color: @h1-white;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 20px;
                }

                .tag {
                    + .tag {
                        margin-left: 6px;
                    }
                }
            }

            .rate-info {
                display: flex;
                align-items: first baseline;
                margin-top: 12px;

                .income {
                    margin-right: 8px;
                    font-weight: bold;
                    font-size: 20px;
                    line-height: 28px;
                }

                .income-text {
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }
    }

    .risk {
        margin-top: 24px;
        padding: 0 12px;
        color: @h3-white;
        font-size: 12px;

        .risk-title {
            font-weight: bold;
            line-height: 16px;
        }

        .risk-label {
            display: flex;
            line-height: 19px;

            + .risk-label {
                margin-top: 6px;
            }
        }
    }
}
</style>
