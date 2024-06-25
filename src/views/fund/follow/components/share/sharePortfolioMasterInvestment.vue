<!-- 
    分享星选专区 UI
 -->
<template>
    <div class="master-investment">
        <logo-ad class="logo"></logo-ad>
        <multi-img class="bgimage" verifyLang name="master_big_bg" directory="fund"></multi-img>

        <!-- 分享时图片中间展示的文案-->
        <div class="share-info">
            <p class="title">{{ shareLeadboradTitle }}</p>
            <p class="subtitle" v-if="shareLeadboradPeriodText">{{ shareLeadboradPeriodText }}</p>
        </div>

        <!-- 大咖列表 -->
        <div class="master-list">
            <div class="master-item" v-for="(item, index) in masterList.slice(0, 3)" :key="item.symbol">
                <masterTopInfoView :info="item" :isFromShare="true" />
                <div class="combination">
                    <div class="left">
                        <div class="flex-c">
                            <span class="group_name">{{ item.portfolio[0].name }}</span>
                            <portfolio-tag :portfolioType="item.portfolio[0].type"></portfolio-tag>
                        </div>
                        <remainingDayFollower
                            class="mar-t8"
                            :margin-style="'12px'"
                            :remainingDay="item.portfolio[0].foundDayNum"
                            :follower="item.portfolio[0].followersNum"
                        />
                    </div>
                    <div class="right">
                        <p class="income" v-riseFall="{ value: item.portfolio[0].profitReturn, base: 2, rate: true }"></p>
                        <p class="income_text">{{ item.portfolio[0].profitCycle | profitTitleFilter }}</p>
                    </div>
                </div>
                <div class="ranking-icon">
                    <multi-img :name="getRankingIconName(index)" directory="fund" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { profitTitleFilter } from '../../utils/filters'
import masterTopInfoView from '../masterTopInfoView.vue'
import portfolioTag from '../portfolioTag.vue'
import remainingDayFollower from '../remainingDayFollower.vue'

export default {
    name: 'share-portfolio-master-investment',
    props: {
        masterList: {
            type: Array,
            default: () => [],
        },
        shareLeadboradTitle: {
            type: String,
            default: '',
        },
        shareLeadboradPeriodText: {
            type: String,
            default: '',
        },
    },
    components: {
        masterTopInfoView,
        portfolioTag,
        remainingDayFollower,
    },
    data() {
        return {
            rankingIndexIconMap: {
                1: 'img_top1',
                2: 'img_top2',
                3: 'img_top3',
            },
        }
    },
    computed: {},
    watch: {},
    filters: {
        profitTitleFilter,
    },
    created() {},
    mounted() {
        console.log('share-master-investment masterList', this.masterList)
    },
    methods: {
        getRankingIconName(index) {
            return this.rankingIndexIconMap[index + 1]
        },
    },
}
</script>

<style scoped lang="less">
.master-investment {
    padding: 0 0 12px;
    background: #f9f9f9;
}

.logo {
    padding-bottom: 14px;
}

.bgimage {
    position: relative;
    z-index: 1;
    height: 194px;
}

.share-info {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: -84px;
    color: #fbd6b0;
    text-align: center;

    .title {
        font-weight: bold;
        font-size: 16px;
        line-height: 24px;
    }

    .subtitle {
        font-size: 12px;
        line-height: 18px;
    }
}

.master-list {
    height: auto;
    padding: 0 12px 16px;
    background: #f9f9f9;

    .master-item {
        position: relative;
        z-index: 2;
        margin: 8px 0 12px;
        padding: 16px 12px;
        background: #fff;
        border-radius: 8px;

        // 组合信息
        .combination {
            display: flex;
            align-items: center;
            height: 76px;
            margin-top: 16px;
            padding: 0 12px;
            background-color: #f9f9f9;
            border-radius: 4px;

            .left {
                display: inline-block;
                width: 70%;

                .group_name {
                    margin-right: 8px;
                    color: #2f2f2f;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 20px;
                }

                .icon {
                    width: 12px;
                    height: 12px;
                }

                .group_value {
                    margin-left: 4px;
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .right {
                width: 30%;
                text-align: right;

                .income {
                    font-weight: bold;
                    font-size: 16px;
                    line-height: 22px;
                }

                .income_text {
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }

        .ranking-icon {
            position: absolute;
            top: 0;
            left: 301px;
            z-index: 3;
            width: 32px;
            height: 38px;
        }
    }
}
</style>
