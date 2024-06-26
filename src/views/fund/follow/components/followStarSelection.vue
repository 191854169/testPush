<!--
 * @Description: 投资组合组合首页的星选组合榜单
-->
<template>
    <div class="card" v-if="groupTypeList.length">
        <div class="title">
            <div>{{ $t('starSel.starSelTitle') }}</div>
            <div class="right" @click="gotoStarSelection()">
                <span class="txt">{{ $t('loadingMore') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>

        <van-tabs class="inner_tabs" swipe-threshold="2" @click="tabClickAction">
            <van-tab v-for="tabItem in groupTypeList" :key="tabItem.id" :title="tabItem.name">
                <div class="tab-page">
                    <div class="star_select_item_bg">
                        <div class="star_select_item" @click="gotoFollowDetail(item.portfolioId)" v-for="item in dataList" :key="item.symbol">
                            <div class="star_select_wrapper border-bottom-1px">
                                <div>
                                    <div class="creator_info flex-c">
                                        <headerPortrait v-if="showHeader" class="header_icon" :ossId="item.avatarOSSID"></headerPortrait>
                                        <div class="nick_name line-elipsis">{{ item.creatorNick }}</div>
                                    </div>

                                    <div class="group_info">
                                        <div class="flex-c">
                                            <portfolio-tag :portfolioType="item.portfolioType"></portfolio-tag>
                                            <span class="group_name">{{ item.portfolioName }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="profit_info">
                                    <p class="profit_value" v-riseFall="{ value: item.week1Return, base: 2, rate: true }"></p>
                                    <p class="profit_title">{{ $t('master.nearOneWeekProfit') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </van-tab>
        </van-tabs>
    </div>
</template>

<script>
import { Tab, Tabs, Toast } from 'vant'
import { portfolioLabelList, PortfolioList } from '@/apis/followInvest'
import { isEmpty } from '@/utils'
import portfolioTag from './portfolioTag.vue'
import headerPortrait from './headerPortrait'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'

export default {
    name: 'findFollow',
    components: {
        [Tab.name]: Tab,
        [Tabs.name]: Tabs,
        [Toast.name]: Toast,
        portfolioTag,
        headerPortrait,
    },
    mixins: [gotoFollowDetailsMixin],
    props: {},
    data() {
        return {
            currentIndex: 0,
            groupTypeList: [],
            activeTab: 0,
            activeID: '',
            dataList: [],
        }
    },
    computed: {
        showHeader() {
            //  'license' -> 1 表示不显示头像,  10 表示显示头像
            const showHeaderLicense = 10
            return this.groupTypeList[this.currentIndex]?.license === showHeaderLicense
        },
    },
    mounted() {
        this.portfolioLabelList()
            .then(list => {
                this.activeID = list[0].id
                this.portfolioList()
            })
            .catch(err => {
                console.error('xujia catch', err)
            })
    },
    methods: {
        gotoStarSelection() {
            this.$router.push('/star-selection')
        },

        async portfolioLabelList() {
            const { result } = (await portfolioLabelList()) || {}
            console.log('xujia portfolioLabelList', result)
            this.groupTypeList = result.list
            return result.list
        },
        async portfolioList() {
            if (isEmpty(this.activeTab)) {
                return
            }
            try {
                const params = {
                    count: 3,
                    field: 'w1',
                    labelId: this.activeID,
                    order: 'desc',
                    start: 0,
                    type: 0,
                }
                console.log('xujia portfolioList params', params)
                this.$loading.show = true
                const { result } = (await PortfolioList(params)) || {}
                this.dataList = result.records || []
                this.canLoadingMore = result.total > this.dataList.length
                console.log('xujia portfolioList', result)
                this.$loading.show = false
            } catch (error) {
                this.$loading.show = false
                console.error('xujia portfolioList', error)
            }
        },
        tabClickAction(index, title) {
            const newID = this.groupTypeList[index].id
            if (this.activeID == newID) return

            this.currentIndex = index
            this.activeID = newID
            this.portfolioList()
            console.log(index, title, this.activeID)
        },
    },
}
</script>

<style lang="less" scoped>
.card {
    #foreground();

    margin-top: 12px;
    border-radius: 8px;

    &.shadow {
        background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
        box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
        backdrop-filter: blur(27px);
    }
}

.inner_tabs /deep/ .van-tabs__wrap {
    height: 44px;
    margin-top: 8px;

    .van-tab {
        flex: 0 0 fit-content;
        align-items: center;
        margin-top: 8px;
        padding: 0 6px;
        border: none;

        &:first-child {
            padding-left: 12px;
        }

        &:last-child {
            padding-right: 12px;
        }
    }

    .van-tabs__nav {
        padding: 0;
        background: transparent;
        // background: red;
    }

    .van-tabs__line {
        width: 0;
        height: 0;
    }

    .van-tab__text {
        align-items: center;
        padding: 4px 12px;
        color: #666;
        font-weight: normal;
        font-size: 14px;
        background: #f9f9f9;
        border-radius: 14px;
    }

    .van-tab--active .van-tab__text {
        padding: 4px 12px;
        color: #2f2f2f;
        font-weight: bold;
        font-size: 14px;
        background: rgba(255, 105, 7, 0.1);
    }

    .tab-page {
        padding-bottom: calc(constant(safe-area-inset-bottom)); /* 兼容 iOS<11.2 */
        padding-bottom: calc(env(safe-area-inset-bottom)); /* 兼容iOS >= 11.2 */
        background-color: transparent;

        .star_select_item_bg {
            padding: 0 12px;
            background-color: #f9f9f9;

            .star_select_item {
                margin: 12px 0;
                border-radius: 8px;
            }
        }
    }
}

.title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 12px 12px 0;
    overflow: hidden;
    color: #2f2f2f;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
    white-space: nowrap;
    text-overflow: ellipsis;
    #font_h1();

    .right {
        display: flex;
        align-items: center;
        font-weight: normal;
        font-size: 12px;
        font-family: 'PingFang SC';
        line-height: 22px;
        #font_h2();

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

.star_select_wrapper {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0 12px;
    padding: 16px 0;
    font-size: 12px;
    background-color: #fff;

    .creator_info {
        width: 100%;
        margin-bottom: 6px;

        .header_icon {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            border-radius: 12px;
        }

        .nick_name {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 14px;
            line-height: 24px;
            text-align: left;
        }
    }

    .group_info {
        display: flex;
        // align-items: center;
        justify-content: space-between;

        .group_name {
            margin-left: 6px;
            color: #666;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .profit_info {
        width: 30%;
        text-align: right;

        .profit_value {
            margin-right: 4px;
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            font-family: MIMUN;
            line-height: 22px;
        }

        .profit_title {
            margin-top: 8px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }
    }
}
</style>
