<template>
    <div class="portfolio-list">
        <van-sticky :offset-top="naviHeight">
            <div class="head">
                <div class="head-text" v-show="!isSelf">{{ $t('customerDetail.portfolio') }}</div>
                <div v-show="isSelf" class="head-page-box">
                    <div
                        class="page-item"
                        v-for="(item, index) in pageTypeList"
                        :key="index"
                        @click="pageTypeClickAction(index)"
                        :class="{ 'page-sel': index == pageIndex }"
                    >
                        <span>{{ item.label + '(' + (selfStatusOverview[item.key] ? selfStatusOverview[item.key] : 0).toString() + ')' }}</span>
                    </div>
                </div>
                <div class="cardHead"></div>
                <div v-show="pageIndex != 0" class="head-status-box">
                    <div
                        class="status-item"
                        v-for="(item, index) in statusList"
                        :key="index"
                        @click="statusTypeClickAction(index)"
                        :class="{ 'status-sel': index == statusIndex }"
                    >
                        <span>{{ item.label + '(' + (runStatusOverview[item.key] ? runStatusOverview[item.key] : 0).toString() + ')' }}</span>
                    </div>
                </div>
                <div class="head-market-box">
                    <div
                        class="market"
                        v-for="(item, index) in typeList"
                        :key="index"
                        @click="marketTypeClickAction(index)"
                        :class="{ sel: index == activeMktIndex }"
                    >
                        <span>{{ item }}</span>
                    </div>
                </div>
            </div>
        </van-sticky>

        <empty class="emptyCard" v-show="dataList.length == 0" showImg :tip-text="$t('customerDetail.noData')"></empty>
        <div class="btnBox" v-show="dataList.length == 0">
            <div v-show="pageIndex == 0" class="addBtn" @click="gotoDiscoverList()">
                <div class="addBtn-title">{{ $t('customerDetail.gotoDiscover') }}</div>
            </div>
        </div>
        <div class="dataList">
            <div class="dataList-item" v-for="(dataModel, index) in dataList" :key="index">
                <div class="dataList-content" @click="gotoFollowDetail(dataModel.portfolioId)">
                    <div class="dataList-top">
                        <span class="dataList-topLeft">
                            <span class="dataList-title line-elipsis mar-r8">{{ dataModel.portfolioName }}</span>
                            <portfolio-tag :portfolioType="dataModel.portfolioType"></portfolio-tag>
                        </span>
                        <remainingDayFollower class="mar-14" :remainingDay="dataModel.foundDayNum" :follower="dataModel.followerNum" />
                    </div>
                    <div v-if="dataModel.runStatus === runStatusNormal" class="dataList-bottom">
                        <span class="dataList-rateBox" v-for="(item, idx) in rateList" :key="idx">
                            <span class="dataList-rate" v-riseFall="{ value: dataModel[item.key], base: 2, rate: true }"></span>
                            <span class="dataList-rateTitle">{{ item.label }}</span>
                        </span>
                    </div>
                    <div v-else class="stop_item">
                        <span class="mar-t8">
                            <span class="dataList-rate">{{ dataModel.totalReturn | amountFilter }}</span>
                            <span class="dataList-rateTitle mar-14">{{ $t('customerDetail.calRev') }}</span>
                        </span>
                        <multi-img class="dataList-stop" verifyLang name="icon_portfolio_stop" directory="fund" />
                    </div>
                </div>
            </div>
        </div>
        <div class="cardBottom"></div>
    </div>
</template>
<script>
import { i18n } from '@/i18n/fund/index.js'
import Empty from '@/components/Empty.vue'
import { UserPortfolioList } from '@/apis/followInvest/index.js'
import { milliFormat, floatToRatio } from '@/utils'
import remainingDayFollower from './remainingDayFollower.vue'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import portfolioTag from './portfolioTag.vue'
import { Sticky } from 'vant'

export default {
    name: 'customer-portfolio-list',
    mixins: [gotoFollowDetailsMixin, watchPageVisibleMixin],
    data() {
        return {
            runStatusNormal: 1,
            typeList: [
                i18n.t('customerDetail.all'),
                i18n.t('customerDetail.hk'),
                i18n.t('customerDetail.us'),
                i18n.t('customerDetail.fund'),
                i18n.t('customerDetail.mixture'),
            ],
            activeMktIndex: 0,
            statusList: [
                { label: i18n.t('customerDetail.active'), key: 'running' },
                { label: i18n.t('customerDetail.close'), key: 'closed' },
            ],
            statusIndex: 0,
            pageTypeList: [
                { label: i18n.t('customerDetail.followPortfolio'), key: 'follow', num: 1 },
                { label: i18n.t('customerDetail.createdPortfolio'), key: 'create', num: 0 },
            ],
            pageIndex: 0,
            ownerListData: [],
            followListData: [],
            runStatusOverview: {},
            selfStatusOverview: {},
            rateList: [
                {
                    key: 'totalReturn',
                    label: i18n.t('customerDetail.calRev'),
                },
                {
                    key: 'week1Return',
                    label: i18n.t('customerDetail.weekRev'),
                },
            ],
        }
    },
    components: { Empty, remainingDayFollower, portfolioTag, [Sticky.name]: Sticky },
    props: {
        searchUin: {
            type: Number,
            default: 0,
        },
        naviHeight: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        isSelf() {
            const uin = localStorage.getItem('uin') || ''
            return parseInt(uin) === parseInt(this.searchUin)
        },
        dataList() {
            const list = this.pageIndex === 0 ? this.followListData : this.ownerListData
            switch (this.activeMktIndex) {
                case 0:
                    return list
                default:
                    return list.filter(item => {
                        return item.portfolioType === this.activeMktIndex
                    })
            }
        },
    },
    created() {
        if (this.isSelf) {
            this.getFollowListData()
        } else {
            this.pageIndex = 1
        }
        this.getOwnerListData()
    },
    mounted() {
        this.watch(() => {
            if (this.isSelf) {
                this.getFollowListData()
            }
            this.getOwnerListData()
        })
    },
    filters: {
        amountFilter(v) {
            v = v || 0
            let ret = floatToRatio(v, { rate: true, base: 2, sign: true })
            ret = milliFormat(ret)
            return ret
        },
    },
    methods: {
        // 查询该用户创建的列表
        async getOwnerListData() {
            this.ownerListData = []
            try {
                const params = {
                    start: 0,
                    count: 999,
                    portfolioType: 0,
                    searchType: 0,
                    searchUin: this.searchUin,
                    runStatus: this.statusIndex + 1,
                }
                const { result } = await UserPortfolioList(params)
                console.log(`用户创建的列表 ===> `, result)
                this.runStatusOverview = result.runStatusOverview
                this.selfStatusOverview = result.selfStatusOverview
                this.ownerListData = result.createdPortfolio && result.createdPortfolio.list
            } catch (e) {
                console.error(e)
            }
        },
        // 查询已关注列表
        async getFollowListData() {
            this.followListData = []
            try {
                const params = {
                    start: 0,
                    count: 999,
                    portfolioType: 0,
                    searchType: 1,
                    searchUin: this.searchUin,
                }
                const { result } = await UserPortfolioList(params)
                console.log('已关注列表', result.followedPortfolio.list)
                this.followListData = result.followedPortfolio && result.followedPortfolio.list
            } catch (e) {
                console.error(e)
            }
        },
        gotoDiscoverList() {
            const url = `${location.origin}${location.pathname}#/portfolio-list`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `/portfolio-list`,
                })
            }
        },

        marketTypeClickAction(index) {
            if (this.activeMktIndex == index) return
            this.activeMktIndex = index
        },
        statusTypeClickAction(index) {
            if (this.statusIndex == index) return
            this.statusIndex = index
            this.activeMktIndex = 0
            this.getOwnerListData()
        },

        pageTypeClickAction(index) {
            if (this.pageIndex == index) return
            this.pageIndex = index
            this.activeMktIndex = 0
        },

        getPortfolioTypeText(data) {
            if (data < this.typeList.length) {
                const market = this.typeList[data]
                return market
            }
        },
    },
}
</script>
<style lang="less" scoped>
.height48 {
    height: 48px;
    padding-bottom: 16px;
}

.portfolio-list {
    width: 100vw;
    background-color: #f9f9f9;

    .dataList {
        width: 100%;
        padding: 0 12px;

        .dataList-item {
            padding: 6px 12px;
            background-color: #fff;
            // height: 122px;
        }

        .dataList-content {
            position: relative;
            // height: 116px;
            display: flex;
            flex-direction: column;
            padding: 8px 12px 16px;
            overflow: hidden;
            background-color: #f9f9f9;
            border-radius: 8px;
        }

        .dataList-top {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            height: 36px;
        }

        .dataList-bottom {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-top: 8px;
        }

        .dataList-topLeft {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 100%;
        }

        .dataList-title {
            max-width: calc(14px * 11);
            font-weight: 500;
            font-size: 14px;
        }

        .dataList-rateBox {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 120px;
            height: 48px;
        }

        .dataList-rate {
            color: #9c9c9c;
            font-weight: bold;
            font-size: 20px;
            line-height: 28px;
        }

        .dataList-rateTitle {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .dataList-stop {
            position: absolute;
            right: 12px;
            bottom: 0;
            width: 66px;
            height: 48px;
            opacity: 0.5;
        }

        .stop_item {
            display: flex;
            align-items: first baseline;
        }
    }

    .head {
        padding: 0 12px;
        background-color: #f9f9f9;

        &-text {
            margin-bottom: 12px;
            padding-top: 8px;
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }

        &-page-box {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 36px;
            padding: 0 12px;
            text-align: center;

            .page-item {
                display: flex;
                margin-right: 20px;
                color: #666;
                font-weight: 400;
                font-size: 15px;
                line-height: 21px;
            }

            .page-sel {
                color: #2f2f2f;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }
        }

        &-status-box {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 36px;
            padding: 0 12px;
            text-align: center;
            background-color: #fff;

            .status-item {
                display: flex;
                margin-right: 28px;
                color: #666;
                font-weight: 400;
                font-size: 15px;
                line-height: 21px;
            }

            .status-sel {
                color: #2f2f2f;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }
        }

        &-market-box {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            height: 42px;
            padding: 8px 12px 6px;
            text-align: center;
            background-color: #fff;

            .market {
                width: 52px;
                height: 100%;
                margin-right: 12px;
                color: #666;
                font-weight: 400;
                font-size: 14px;
                line-height: 28px;
                background-color: #f9f9f9;
                border-radius: 14px;
            }

            .sel {
                color: #2f2f2f;
                font-weight: 500;
                font-size: 14px;
                line-height: 28px;
                background-color: rgba(255, 105, 7, 0.1);
            }
        }

        .cardHead {
            width: 100%;
            height: 8px;
            margin-top: 4px;
            background-color: #fff;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
    }

    .emptyCard {
        height: 188px;
        margin: 0 12px;
        background-color: #fff;
    }

    .btnBox {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 72px;
        margin: 0 12px;
        padding: 0 0 40px;
        background-color: #fff;

        .addBtn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 110px;
            height: 32px;
            background-color: rgba(255, 105, 7, 0.07);
            border-radius: 16px;

            &-title {
                color: #ff6907;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }
        }
    }

    .cardBottom {
        width: calc(100vw - 24px);
        height: 18px;
        margin-bottom: 24px;
        margin-left: 12px;
        background-color: #fff;
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;
    }
}
</style>
