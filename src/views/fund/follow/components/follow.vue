<template>
    <!-- 发现投资组合 -->
    <div class="card tjlist follow">
        <div class="pad-l12">
            <Table
                ref="table"
                class="content-table"
                :border="true"
                :data="list"
                :columns="columns"
                :canPullDown="!filterShow"
                :showEmptyTip="showEmptyTip"
                :canPullUp="canPullUp"
                :loadingOverMsg="$t('follow.noMore')"
                showPullUpLoading
                @sort="handlerSort"
                @pullUpLoad="loadHandler"
                @refresh="onRefresh"
                @rowClick="listClickHander"
            >
                <!-- 固定列：基金名 -->
                <template v-slot:name="props">
                    <div class="flex-content">
                        <div class="fund-name line-elipsis mar-b4">{{ props.item.portfolioName }}</div>
                        <div class="fund-info_isin line-elipsis">{{ props.item.creatorNick }}</div>
                    </div>
                </template>
                <!-- 滚动列：基金其他信息 -->
                <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                    <div class="scoll-content" :key="key">
                        <div
                            v-if="key !== 'followerReturn'"
                            class="content-top"
                            v-riseFall="{ value: props.item[key], riseFall: ['day1Return', 'week1Return'].includes(key) }"
                            :class="[`${key}`]"
                        ></div>
                        <div v-else class="content-top" :class="[`${key}`]">{{ props.item[key] | followerNumFilter }}</div>
                    </div>
                </template>
            </Table>
        </div>
    </div>
</template>

<script>
import Table from '@/components/Table.vue'
import { PortfolioList } from '@/apis/followInvest/index.js'
import { throttle } from 'lodash'
import { INVEST_EXP_MAP } from '../../config/common'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'
import { followerNumFilter } from '../utils/filters'

const filterUnit = {
    start: 0,
    count: 50,
}

export default {
    name: 'follow',
    mixins: [gotoFollowDetailsMixin],
    components: {
        Table,
    },
    props: {
        sort: {
            type: Boolean,
            default: true,
        },
        from: {
            type: String,
            default: '',
        },
        groupType: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            table: null,
            canPullUp: true,
            preTouchY: null,
            nextTouchY: null,
            // 条件控制
            filterShow: false, // 展示查询
            // 搜索条件
            sortType: 'desc', // 排序方式
            sortKey: 'd1', // 排序字段
            start: filterUnit.start, // 开始数量
            unitCount: filterUnit.count, // 单位查询数量
            // 上拉加载
            loadHandler: throttle(this.onLoader, 1000, { leading: false }),
            // 下拉事件
            touchMoveThrottle: throttle(this.touchMoveHander, 100, { leading: false }),
            originColumns: [
                {
                    title: this.$t('follow.combinationName'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                },
                {
                    title: this.$t('dayChg'),
                    key: 'day1Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.70rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('nearOneWeek'),
                    key: 'week1Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.70rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('nearOneMonth'),
                    key: 'month1Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.70rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('fundList.returnM3'),
                    key: 'month3Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.88rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('fundList.returnM6'),
                    key: 'month6Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.88rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('fundList.returnY1'),
                    key: 'year1Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.88rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('fundList.returnY3'),
                    key: 'year3Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.88rem',
                        'padding-right': '0.12rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('accumulatedProfit'),
                    key: 'totalReturn',
                    sort: this.sort,
                    slot: true,
                    riseFall: false,
                    style: {
                        width: '0.88rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('starSel.follower'),
                    key: 'followerReturn',
                    sort: this.sort,
                    slot: true,
                    riseFall: false,
                    style: {
                        width: '1rem',
                        paddingRight: '12px',
                        'text-align': 'right',
                    },
                },
            ],
            list: [],
            showEmptyTip: false,
        }
    },
    computed: {
        columns() {
            const arr = this.originColumns
            return arr
        },
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
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
        this.$nextTick(() => {
            this.table = this.$refs.table
            this.$refs.table.setSortMap('day1Return', this.sortType)
            document.body.addEventListener('touchstart', this.touchStartHander, {
                passive: false,
            })
            document.body.addEventListener('touchmove', this.touchMoveThrottle, {
                passive: false,
            })
        })
    },
    beforeDestroy() {
        document.body.removeEventListener('touchstart', this.touchStartHander, {
            passive: false,
        })
        document.body.removeEventListener('touchmove', this.touchMoveThrottle, {
            passive: false,
        })
    },
    watch: {
        groupType() {
            this.getPortList({ reset: true })
        },
    },
    methods: {
        // 获取组合列表
        async getPortList(options = {}) {
            this.showEmptyTip = false
            const { reset = false, sort = false } = options
            if (reset) {
                // 重置
                this.start = filterUnit.start
                this.unitCount = filterUnit.count
            }
            if (sort) {
                // 排序
                this.start = filterUnit.start
            }
            try {
                const params = {
                    type: this.groupType,
                    field: this.sortKey,
                    order: this.sortType,
                    start: this.start,
                    count: this.unitCount,
                }
                const { result } = await PortfolioList(params)
                this.showEmptyTip = true
                if (result) {
                    const resultList = result.records
                    if (reset || sort) this.list = []
                    this.list = this.list.concat(resultList)
                    this.start = this.list.length
                    if (resultList.length < this.unitCount) {
                        this.closePullUploading()
                    }

                    console.log(result, params)
                }
            } catch (e) {
                console.log('eeror', e)
            }
        },
        async onRefresh(cb) {
            this.initPullUpLoading()
            await this.getPortList({ reset: true })
            cb()
        },
        async onLoader(cb = null) {
            await this.getPortList()
            cb && cb()
        },
        handlerSort(key, type) {
            if (type === 'none') {
                // 此处不能展示为 none 排序
                type = 'asc'
                this.$refs.table && this.$refs.table.setSortMap(key, type)
            }
            this.sortType = type
            this.sortKey = {
                day1Return: 'd1',
                week1Return: 'w1',
                month1Return: 'm1',
                month3Return: 'm3',
                month6Return: 'm6',
                year1Return: 'y1',
                year3Return: 'y3',
                totalReturn: 'total',
                followerReturn: 'follower',
            }[key]
            this.initPullUpLoading()
            this.tableScrollTop()
            this.getPortList({ sort: true })
        },
        listClickHander(rowData) {
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
        // 滚到顶部
        tableScrollTop() {
            this.table && this.table.$refs['scrollElement'].scrollTo({ top: 0 })
        },
        // 开启、关闭 能否上拉
        openCanPullUp() {
            this.canPullUp = true
        },
        cancelCanPullUp() {
            this.canPullUp = false
        },
        // 初始化 上拉加载
        initPullUpLoading() {
            this.openCanPullUp()
        },
        // 上拉加载结束
        closePullUploading() {
            this.cancelCanPullUp()
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
    },
}
</script>

<style lang="less" scoped>
.follow {
    /deep/ .box {
        flex: 1;

        .fixed {
            width: 146px !important;
        }

        .scroll {
            .scroll-title-container {
                left: 146px !important;
            }
        }
    }
}

.card {
    #foreground();

    border-radius: 8px;

    // margin-top: 12px;
    &.shadow {
        background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
        box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
        backdrop-filter: blur(27px);
    }
}

.tjlist {
    padding: 8px 0 0;

    /deep/ .box {
        flex: 1;

        .fixed {
            width: 172px;
        }

        .scroll {
            .scroll-title-container {
                left: 172px;
            }
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
                vertical-align: middle;
            }
        }
    }

    .content-table {
        height: calc(100vh - 50px);
        #iosBottom();

        ::-webkit-scrollbar {
            display: none;
        }
    }
}

.flex-content {
    display: flex;
    flex-direction: column;

    .fund-name {
        font-weight: 500;
        font-size: 14px;
        line-height: 20px;
        #font_h1();
    }

    .fund-info_isin {
        align-items: center;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
    }

    .fund-info {
        display: flex;
        align-items: center;

        .fund-info_currency {
            margin-right: 5px;
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
