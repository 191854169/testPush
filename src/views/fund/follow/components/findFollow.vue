<!--
 * @Description: 投资组合组合首页的发现投资组合组件
-->
<template>
    <div class="card tjlist">
        <div class="title">
            <div>{{ $t('follow.findCombinationTitle') }}</div>
            <div class="right" @click="toMorePage()">
                <span class="txt">{{ $t('loadingMore') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <van-tabs class="inner_tabs" swipe-threshold="2" @click="tabClickAction">
            <van-tab v-for="tabItem in tabList" :key="tabItem.value" :title="tabItem.label">
                <div class="pad-l12">
                    <Table
                        ref="table"
                        class="content-table"
                        :data="list"
                        :columns="columns"
                        :canPullDown="false"
                        :showEmptyTip="false"
                        :canPullUp="false"
                        @rowClick="listClickHander"
                    >
                        <!-- 固定列：基金名 -->
                        <!-- <template v-slot:portfolioName="props">
                            <div class="flex-content">
                                <div class="fund-name line-elipsis mar-b6">{{ props.item.portfolioName }}</div>
                                <div class="creator-name line-elipsis">{{ props.item.creatorNick }}</div>
                            </div>
                        </template> -->

                        <template v-slot:[item.key]="props" v-for="item in columns">
                            <div class="flex-content" :key="item.key" v-if="item.key == 'portfolioName'">
                                <div class="fund-name line-elipsis mar-b6">{{ props.item.portfolioName }}</div>
                                <div class="creator-name line-elipsis">{{ props.item.creatorNick }}</div>
                            </div>
                            <div class="flex-content" :key="item.key" v-else-if="item.key == 'followerReturn'">
                                <div class="follower">{{ props.item.followerReturn | followerNumFilter }}</div>
                            </div>
                            <div class="flex-content" :key="item.key" v-else>
                                <div v-riseFall="{ value: props.item[item.key] }"></div>
                            </div>
                        </template>
                    </Table>
                </div>
            </van-tab>
        </van-tabs>
    </div>
</template>

<script>
import Table from '@/components/Table.vue'
import { Tab, Tabs, Toast } from 'vant'
import { PortfolioList } from '@/apis/followInvest/index.js'
import { followerNumFilter } from '../utils/filters'
import { INVEST_EXP_MAP } from '../../config/common'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'

export default {
    name: 'findFollow',
    components: {
        Table,
        [Tab.name]: Tab,
        [Tabs.name]: Tabs,
        [Toast.name]: Toast,
    },
    mixins: [gotoFollowDetailsMixin],
    data() {
        return {
            activeField: 'w1',
            table: null,
            preTouchY: null,
            nextTouchY: null,
            originColumns: [
                {
                    title: this.$t('follow.combinationName'),
                    key: 'portfolioName',
                    fixed: true,
                    slot: true,
                    titleItemStyle: {
                        'font-weight': '400',
                        'font-size': '0.12rem',
                    },
                },
                {
                    title: this.$t('dayChg'),
                    key: 'day1Return',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.72rem',
                        'text-align': 'right',
                        'font-weight': 'bold',
                        'font-size': '0.16rem',
                    },
                    titleItemStyle: {
                        'font-weight': '400',
                        'font-size': '0.12rem',
                    },
                },
                {
                    title: this.$t('nearOneWeek'),
                    key: 'week1Return',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.74rem',
                        'text-align': 'right',
                        'font-weight': 'bold',
                        'font-size': '0.16rem',
                    },
                    titleItemStyle: {
                        'font-weight': '400',
                        'font-size': '0.12rem',
                    },
                },
                {
                    title: this.$t('nearOneMonth'),
                    key: 'month1Return',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.74rem',
                        'text-align': 'right',
                        'font-weight': 'bold',
                        'font-size': '0.16rem',
                    },
                    titleItemStyle: {
                        'font-weight': '400',
                        'font-size': '0.12rem',
                    },
                },
                {
                    title: this.$t('fundList.returnM3'),
                    key: 'month3Return',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.74rem',
                        'text-align': 'right',
                        'font-weight': 'bold',
                        'font-size': '0.16rem',
                    },
                    titleItemStyle: {
                        'font-weight': '400',
                        'font-size': '0.12rem',
                    },
                },
                {
                    title: this.$t('fundList.returnY1'),
                    key: 'year1Return',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.74rem',
                        'text-align': 'right',
                        'font-weight': 'bold',
                        'font-size': '0.16rem',
                    },
                    titleItemStyle: {
                        'font-weight': '400',
                        'font-size': '0.12rem',
                    },
                },
                {
                    title: this.$t('starSel.follower'),
                    key: 'followerReturn',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.74rem',
                        'text-align': 'right',
                        'font-weight': 'bold',
                        'font-size': '0.16rem',
                    },
                    titleItemStyle: {
                        'font-weight': '400',
                        'font-size': '0.12rem',
                    },
                },
            ],
            list: [],

            currentIndex: 0,
            tabList: [
                {
                    label: this.$t('starSel.w1Profit'),
                    value: 'w1',
                },
                {
                    label: this.$t('starSel.m1Profit'),
                    value: 'm1',
                },
                {
                    label: this.$t('starSel.m3Profit'),
                    value: 'm3',
                },
                {
                    label: this.$t('starSel.y1Profit'),
                    value: 'y1',
                },
                {
                    label: this.$t('starSel.follower'),
                    value: 'follower',
                },
            ],
        }
    },
    computed: {
        columns() {
            let arr = this.originColumns
            arr = this.originColumns.slice(0, 2)
            arr.push(this.originColumns[this.currentIndex + 2])
            console.log('clickItem', this.currentIndex + 'arr[2] = ' + arr[2].title)
            return arr
        },
        otherColumns() {
            return this.columns.slice(1, 3)
        },
    },
    filters: {
        followerNumFilter,
        investExpFilter(v) {
            return INVEST_EXP_MAP.options.findLabel(v, '--')
        },
    },
    mounted() {
        this.getPortList()
    },
    methods: {
        listClickHander(rowData) {
            console.log('rowData', rowData)
            this.gotoFollowDetail(rowData.portfolioId)
        },
        // 阻止ios拖动
        touchStartHander(e) {
            this.preTouchY = e?.changedTouches[0].screenY
        },
        touchMoveHander(args) {
            const e = args[0]
            if (this.filterShow) return
            if (this.preTouchY) {
                this.nextTouchY = e?.changedTouches[0].screenY
                if (this.nextTouchY - this.preTouchY > 20 && this.$refs.table.$refs['scrollElement'].scrollTop === 0) {
                    // 当列表位于顶部 下拉距离
                    e.preventDefault()
                }
            }
            this.preTouchY = e?.changedTouches[0].screenY
        },
        toMorePage() {
            const url = `${location.origin}${location.pathname}#/portfolio-list`
            if (this.$openPageInI18NThs(url)) return
            this.$router.push('/portfolio-list')
        },
        tabClickAction(index, title) {
            const newID = this.tabList[index].value
            if (this.activeField == newID) return
            this.currentIndex = index
            this.activeField = newID
            this.getPortList()
            console.log(index, title, this.activeField)
        },
        // 获取组合列表
        async getPortList() {
            try {
                const params = {
                    field: this.activeField,
                    order: 'desc',
                    start: 0,
                    count: 5,
                }
                this.$loading.show = true
                const { result } = await PortfolioList(params)
                if (result) {
                    this.list = result.records
                }
                this.$loading.show = false
            } catch (e) {
                this.$loading.show = false
                console.log('eeror', e)
            }
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

.tjlist {
    padding-bottom: 8px;

    /deep/ .box {
        flex: 1;

        .fixed {
            width: 172px;

            .item {
                height: 64px;
            }
        }

        .scroll {
            .scroll-title-container {
                left: 172px;
            }

            .item {
                height: 64px;
            }
        }

        .scrollElement {
            overflow-y: hidden;
        }
    }

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px 12px 0;
        overflow: hidden;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;
        #font_h1();

        .right {
            display: flex;
            align-items: center;
            font-weight: 400;
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
                color: @fontGreyColor;
                vertical-align: middle;
            }
        }
    }
}

.inner_tabs /deep/ .van-tabs__wrap {
    height: 44px;
    margin-top: 8px;

    .van-tab {
        flex: 1 0 fit-content;
        align-items: center;
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

                &:first-child {
                    margin: 8px 0;
                }
            }
        }
    }
}

.flex-content {
    display: flex;
    flex-direction: column;

    .fund-name {
        font-weight: bold;
        font-size: 14px;
        line-height: 20px;

        #font_h1();
    }

    .creator-name {
        color: #9c9c9c;
        font-weight: normal;
        font-size: 12px;
    }

    .follower {
        font-weight: bold;
        font-size: 16px;

        #font_h1();
    }

    .fund-info {
        display: flex;
        align-items: center;

        .fund-info_currency {
            margin-right: 5px;
        }

        .fund-info_isin {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 12px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 11px;
            line-height: 12px;

            .isSelfSelect {
                width: 8px;
                height: 8px;
                margin-left: 5px;
            }
        }

        .item-info__type {
            #font_h3();

            position: relative;
            z-index: 0;
            margin-left: 9px;
            font-size: 11px;
        }

        .item-info__type::after {
            position: absolute;
            top: 2px;
            left: -5px;
            width: 1px;
            height: 8px;
            background-color: #9c9c9c;
            transform: scaleX(0.5);
            content: '';
        }
    }
}
</style>

<style lang="less">
.content-table {
    .title {
        #foreground();
    }

    .totalReturn {
        #font_h1();
    }

    .content-top {
        font-weight: 700;
        font-size: 16px;
    }
}

.follow {
    .content-table {
        .content-top {
            font-weight: normal;
            font-size: 14px;
        }
    }
}
</style>
