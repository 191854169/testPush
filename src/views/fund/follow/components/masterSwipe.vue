<!--
 * @Description: 投资组合组合首页的跟着大咖投资组件
-->
<template>
    <div style="margin-top: 12px" class="card master-invest" v-if="masterList.length">
        <div class="title">
            <div>{{ $t('master.masterTitle') }}</div>
            <div class="right" @click="gotoMasterInvestment()">
                <span class="txt">{{ $t('loadingMore') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>

        <van-swipe class="my-swipe" :autoplay="3000" @change="onSwipeChange">
            <van-swipe-item v-for="(item, index) in masterList" :key="index">
                <div class="fund-item">
                    <!-- <van-skeleton row="4" :loading="loading"> -->
                    <masterTopInfoView :info="item" @followedSuccess="onFollowChange()" />
                    <div class="fund-item-body" @click="gotoFollowDetail(item.portfolio[0].id)">
                        <div class="left">
                            <div class="row">
                                <span class="name line-elipsis">{{ item.portfolio[0].name }}</span>
                                <portfolio-tag :portfolioType="item.portfolio[0].type"></portfolio-tag>
                            </div>
                            <remainingDayFollower
                                class="mar-t8"
                                :margin-style="'12px'"
                                :remainingDay="item.portfolio[0].foundDayNum"
                                :follower="item.portfolio[0].followersNum"
                            />
                            <div class="row">
                                <div class="chg" v-riseFall="{ value: item.portfolio[0].profitReturn, base: 2, rate: true }"></div>
                                <div class="chg-txt">{{ $t('master.nearOneWeekProfit') }}</div>
                            </div>
                        </div>

                        <div class="right">
                            <portfolioChart ref="chart" period="y1" :symbol="item.portfolio[0].id"></portfolioChart>
                        </div>
                    </div>
                    <!-- </van-skeleton> -->
                </div>
            </van-swipe-item>
        </van-swipe>
    </div>
</template>

<script>
import { investMasterList } from '@/apis/followInvest/index.js'
import { INVEST_EXP_MAP } from '../../config/common'
import { followerNumFilter, groupTypeFilter } from '../utils/filters'
import { Overlay, SwipeItem, Swipe, Skeleton } from 'vant'
import portfolioChart from './portfolioTrend.vue'
import portfolioTag from './portfolioTag.vue'
import masterTopInfoView from './masterTopInfoView'
import remainingDayFollower from './remainingDayFollower.vue'
import customerDetailMixin from '../mixins/customerDetailMixin'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
export default {
    name: 'findFollow',
    mixins: [customerDetailMixin, gotoFollowDetailsMixin, watchPageVisibleMixin],
    components: {
        [Overlay.name]: Overlay,
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        [Skeleton.name]: Skeleton,
        portfolioChart,
        masterTopInfoView,
        portfolioTag,
        remainingDayFollower,
    },
    props: {},
    emits: ['followedChange'],
    data() {
        return {
            masterList: [],
            currentMasterIndex: 0,
        }
    },
    computed: {},
    filters: {
        groupTypeFilter,
        followerNumFilter,
        investExpFilter(v) {
            return INVEST_EXP_MAP.options.findLabel(v, '--')
        },
    },
    mounted() {
        this.getMasterList()
        this.watch(() => {
            this.getMasterList()
        })
    },
    beforeDestroy() {},
    methods: {
        gotoMasterInvestment() {
            this.$router.push('/master-investment')
        },
        onSwipeChange(newIndex) {
            this.currentMasterIndex = newIndex
            this.$refs.chart[newIndex].init()
        },
        onFollowChange() {
            this.getMasterList()
            this.$emit('followedChange')
        },
        async getMasterList() {
            try {
                const { result } = (await investMasterList({ count: 3, profitCycle: 'w1', start: 0 })) || {}
                this.masterList = result.list || []
            } catch (error) {
                console.error('getMasterList', error)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.card {
    #foreground();

    border-radius: 8px;

    &.shadow {
        background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
        box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
        backdrop-filter: blur(27px);
    }
}

.title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 12px;
    overflow: hidden;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
    white-space: nowrap;
    text-overflow: ellipsis;
    #font_h1();

    .right {
        display: flex;
        align-items: center;
        color: @fontLightColor;
        font-weight: normal;
        font-size: 12px;
        font-family: 'PingFang SC';
        line-height: 22px;

        .arrowicon {
            width: 12px;
            height: 12px;
            vertical-align: middle;
        }

        .txt {
            margin-right: 3px;
            color: @fontGreyColor;
            vertical-align: middle;
        }
    }
}

.master-invest {
    // box-shadow: 0px 0.5px 8px rgba(0, 0, 0, 0.04), inset 0.5px -0.5px 0px #ffffff, inset -0.5px 0.5px 0px #ffffff;
    padding: 8px 0 0;

    .fund-item {
        padding: 16px;

        &-header {
            display: flex;
            align-items: center;

            .name {
                color: #2f2f2f;
                font-weight: bold;
                font-size: 16px;
            }

            .simple-info {
                display: flex;
                flex-direction: row;
                margin-top: 6px;
                font-weight: normal;
                font-size: 12px;

                .label {
                    margin-right: 4px;
                    color: #9c9c9c;
                }

                .value {
                    margin-right: 12px;
                    color: #666;
                }
            }

            .middle {
                display: flex;
                flex-direction: column;
            }

            .right {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin: 0 0 0 auto;
                padding: 4px 15px;
                background-color: rgba(255, 105, 7, 0.1);
                border-radius: 31px;

                .follow-txt {
                    margin-left: 2px;
                    overflow: hidden;
                    color: #ff6907;
                    font-weight: bold;
                    font-size: 14px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }

                .follow-icon {
                    width: 12px;
                    height: 12px;
                }
            }
        }

        &-body {
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
            margin-bottom: 16px;
            padding: 16px 12px;
            background-color: #f9f9f9;
            border-radius: 8px;

            .type {
                display: inline-block;
                margin-left: 6px;
                font-size: 12px;
                line-height: 28px;
                vertical-align: bottom;
                #font_h3();
            }

            .fund-title {
                overflow: hidden;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
                white-space: nowrap;
                text-overflow: ellipsis;
                #font_h1();
            }

            .left {
                flex: 1 1 auto;
                overflow: hidden;

                .row {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    color: @fontGreyColor;
                    font-weight: normal;
                    font-size: 12px;

                    .name {
                        flex: 0 1 auto;
                        margin-right: 6px;
                        color: @fontBlackColor;
                        font-weight: bold;
                        font-size: 16px;
                    }

                    .tag {
                        flex: 0 0 auto;
                    }

                    .chg {
                        margin-top: 12px;
                        color: #ff6907;
                        font-weight: bold;
                        font-size: 20px;
                    }

                    .chg-txt {
                        margin-top: 18px;
                        margin-left: 6px;
                    }
                }
            }

            .right {
                flex: 0 0 auto;
                width: 104px;
            }
        }

        &-middle {
            display: flex;
            margin-top: 12px;
        }

        &-footer {
            display: block;
            width: 100%;
            margin: 30px 0 16px;
            font-weight: 700;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            border: none;
            border-radius: 28px;
            outline: none;
            #bg_theme();
            #button_font();
        }
    }

    /deep/ .van-swipe {
        &__indicators {
            bottom: 16px;
        }

        &__indicator {
            width: 4px;
            height: 4px;
            border-radius: 0;
            #swipe_background();

            &:not(:last-child) {
                margin-right: 5px;
            }
        }

        &__indicator--active {
            #swipe_active_background();

            width: 8px;
        }
    }
}
</style>
