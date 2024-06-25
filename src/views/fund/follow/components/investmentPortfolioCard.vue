<!-- 
    理财首页投资组合
 -->
<template>
    <div class="card invest_card">
        <div class="title">
            <div class="combinationTitle">{{ $t('follow.combinationTitle') }}</div>
            <div class="right" @click="toMorePage()">
                <span class="txt">{{ $t('loadingMore') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <div class="content">
            <div class="master inner_card">
                <van-swipe class="master_swipe" autoplay="3000" @change="onSwipeIndexChanged">
                    <van-swipe-item v-for="(item, index) in masterList" :key="index" @click="gotoFollowDetail(item.portfolio[0].id)">
                        <div class="master_info" @click.stop="gotoMasterDetail(item)">
                            <headerPortrait class="master_header" :ossId="item.avatarOSSID" />
                            <div class="name_info">
                                <div class="nick_name line-elipsis">
                                    {{ item.nickName }}
                                </div>
                                <div class="fans_num">{{ $t('follow.fansNum') }}{{ item.followersNum | followerNumFilter }}</div>
                            </div>
                        </div>
                        <div class="flex-c">
                            <span class="group_name line-elipsis">{{ item.portfolio[0].name }}</span>
                            <portfolio-tag verifyTheme :portfolioType="item.portfolio[0].type"></portfolio-tag>
                        </div>
                        <div class="profit_info flex-s">
                            <div class="profit_value">
                                <div class="profit_ratio" v-riseFall="{ value: item.portfolio[0].profitReturn, base: 2, rate: true }"></div>
                                <div class="profit_title">{{ $t('master.nearOneWeekProfit') }}</div>
                            </div>
                            <div class="profit_trend">
                                <portfolioChart ref="chart" period="y1" :symbol="item.portfolio[0].id"></portfolioChart>
                            </div>
                        </div>
                        <div class="flex-middle">
                            <van-button class="trade_btn" type="default" round>{{ $t('follow.quitBuy') }}</van-button>
                        </div>
                    </van-swipe-item>
                </van-swipe>
            </div>
            <div class="profit_content">
                <div
                    v-for="(item, index) in portfolioList"
                    :key="index"
                    class="inner_card profit_card"
                    :class="{ 'mar-b8': index == 0 }"
                    @click="gotoFollowDetail(item.portfolioId)"
                >
                    <div v-if="!isEmptyDict(item)">
                        <div class="flex-c mar-b16">
                            <headerPortrait v-if="item.userType == 2" class="master_header" :ossId="item.avatarOSSID" />
                            <div class="nick_name line-elipsis">
                                {{ item.creatorNick }}
                            </div>
                        </div>
                        <div class="flex-c mar-b8">
                            <span class="group_name line-elipsis">{{ item.portfolioName }}</span>
                            <portfolio-tag verifyTheme :portfolioType="item.portfolioType"></portfolio-tag>
                        </div>
                        <div class="p_profit_content">
                            <div
                                class="p_profit_ratio"
                                v-riseFall="{ value: index == 0 ? item.week1Return : item.month1Return, base: 2, rate: true }"
                            ></div>
                            <div class="p_profit_title">{{ $t(index == 0 ? 'master.nearOneWeekProfit' : 'master.nearOneMonthProfit') }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { SwipeItem, Swipe, Button } from 'vant'
import { INVEST_EXP_MAP } from '../../config/common'
import { investMasterList, PortfolioList } from '@/apis/followInvest'
import { followerNumFilter, groupTypeFilter } from '../utils/filters'
import portfolioChart from './portfolioTrend.vue'
import { isEmpty } from '@/utils'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'
import headerPortrait from './headerPortrait'
import portfolioTradePrecheckMixin from '../mixins/portfolioTradePrecheckMixin'
import customerDetailMixin from '../mixins/customerDetailMixin'
import portfolioTag from './portfolioTag.vue'

export default {
    name: 'investmentPortfolioCard',
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        [Button.name]: Button,
        portfolioChart,
        headerPortrait,
        portfolioTag,
    },
    mixins: [gotoFollowDetailsMixin, portfolioTradePrecheckMixin, customerDetailMixin],
    props: {},
    data() {
        return {
            masterList: [],
            portfolio_W: {}, // 周收益
            portfolio_M: {}, // 月收益
            currentMasterIndex: 0,
        }
    },
    computed: {
        portfolioList() {
            return [this.portfolio_W, this.portfolio_M]
        },
    },
    filters: {
        groupTypeFilter,
        followerNumFilter,
        investExpFilter(v) {
            return INVEST_EXP_MAP.options.findLabel(v, '--')
        },
    },
    mounted() {
        this.getMasterList()
        this.getPortfolioList()
        this.$nextTick(() => {})
    },
    beforeDestroy() {},
    methods: {
        async getMasterList() {
            try {
                const { result } = (await investMasterList({ count: 3, profitCycle: 'w1', start: 0 })) || {}
                this.masterList = result.list || []
            } catch (error) {
                console.error('getMasterList', error)
            }
        },
        async getPortfolioList() {
            try {
                const params = {
                    count: 1,
                    field: 'w1',
                    order: 'desc',
                    start: 0,
                }
                let { result } = (await PortfolioList(params)) || {}
                this.portfolio_W = result.records[0]
                params['count'] = 2
                params['field'] = 'm1'
                result = (await PortfolioList(params)) || {}
                result = result.result
                const list = result.records || []
                this.portfolio_M = list.filter(item => item.portfolioId != this.portfolio_W.portfolioId)[0]
            } catch (error) {
                console.error('portfolioList', error)
            }
        },
        gotoMasterDetail(item) {
            const uin = item.uin || 0
            this.pushToCustomerDetail(uin)
        },
        async onClickQuitBuy(item) {
            try {
                if (!(await this.check(item))) return
                const url = `${location.origin}${location.pathname}#/follow-order?portfolioId=${item.id}`
                if (this.$openPageInThs(url)) return
                if (this.$jsBridge) {
                    this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                } else {
                    this.$router.push({
                        path: '/follow-order',
                        query: {
                            portfolioId: item.id,
                        },
                    })
                }
            } catch (e) {
                console.error(e)
            }
        },
        onSwipeIndexChanged(newIndex) {
            this.currentMasterIndex = newIndex
            this.$refs.chart[newIndex].init()
        },
        toMorePage() {
            const link = '/wealth/fund.html#/follow'
            const url = `${location.origin}${link}`
            if (this.$openPageInThs(url.replace(/http(s)?/, 'https'))) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: 'follow',
                })
            }
        },
        isEmptyDict(dict) {
            return isEmpty(dict)
        },
    },
}
</script>

<style lang="less" scoped>
.inner_card {
    border-radius: 8px;

    [data-theme='white'] & {
        #background();
    }

    [data-theme='black'] & {
        border: 1px solid #262626;
    }
}

.invest_card {
    padding: 8px 0 0;

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0 12px;
        overflow: hidden;

        .combinationTitle {
            #font_h1();

            font-weight: bold;
            font-size: 16px;
            line-height: 36px;
        }

        .right {
            display: flex;
            align-items: center;
            font-size: 12px;
            line-height: 22px;
            #font_h2();

            .arrowicon {
                width: 12px;
                height: 12px;
                vertical-align: middle;
            }

            .txt {
                margin-right: 3px;
                vertical-align: middle;
            }
        }
    }
}

.content {
    display: flex;
    justify-content: space-between;
    padding: 8px 8px 12px;
    #font_h1();

    // height: 248px;
    .master {
        width: calc(50% - 4.5px);

        .master_swipe {
            height: 228px;

            .van-swipe-item {
                padding: 16px 8px 0;

                .master_info {
                    display: flex;
                    width: calc(100%);
                    margin-bottom: 16px;

                    .master_header {
                        width: 36px;
                        height: 36px;
                        margin-right: 6px;
                        border-radius: 18px;
                    }

                    .name_info {
                        width: calc(100% - 42px);

                        .nick_name {
                            #font_h1();

                            font-weight: bold;
                            font-size: 15px;
                            line-height: 21px;
                        }

                        .fans_num {
                            margin-top: 4px;
                            color: #9c9c9c;
                            font-size: 10px;
                            line-height: 14px;
                        }
                    }
                }

                .profit_info {
                    height: 50px;
                    margin: 12px 0 0;

                    .profit_value {
                        .profit_ratio {
                            margin-bottom: 6px;
                            font-weight: bold;
                            font-size: 20px;
                            line-height: 28px;
                        }

                        .profit_title {
                            font-size: 12px;
                            line-height: 16px;
                            #font_h3();
                        }
                    }

                    .profit_trend {
                        width: 56px;
                        height: 40px;
                    }
                }

                .trade_btn {
                    height: 28px;
                    margin: 23px 0 0;
                    padding: 4px 12px;
                    color: #fff;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 22px;
                    text-align: center;
                    border: none;

                    [data-theme='black'] & {
                        background: @theme-black;
                    }

                    [data-theme='white'] & {
                        background: @theme-white;
                    }
                }
            }
        }

        /deep/ .van-swipe {
            &__indicators {
                bottom: 8px;
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

    .profit_content {
        width: calc(50% - 4.5px);

        .profit_card {
            height: calc(50% - 4px);
            padding: 12px 8px 0;

            .master_header {
                width: 24px;
                height: 24px;
                margin-right: 6px;
                border-radius: 12px;
            }

            .nick_name {
                #font_h1();

                font-weight: bold;
                font-size: 14px;
            }

            .p_profit_content {
                display: flex;
                align-items: first baseline;

                .p_profit_ratio {
                    margin-right: 6px;
                    font-weight: bold;
                    font-size: 16px;
                    line-height: 22px;
                }

                .p_profit_title {
                    font-size: 12px;
                    line-height: 16px;
                    #font_h3();
                }
            }
        }
    }

    .group_name {
        flex-shrink: 2;
        margin-right: 4px;
        font-size: 14px;
        line-height: 20px;
        #font_h1();
    }
}
</style>
