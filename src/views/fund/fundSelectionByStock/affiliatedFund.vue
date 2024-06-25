<!--
 * @Description: 股票选基所属基金页
 * @Autor: JerryYi
-->
<template>
    <div class="fund-list">
        <div class="fund-head">
            <div class="basic-info flex-s">
                <div class="flex1 elipsis f16 bold">{{ stockData.rawSymbol }} {{ stockData.name }}</div>
                <div>
                    <span class="f14 pad-l8 theme">{{ stockData.price }}</span>
                    <span class="f14 pad-l8" v-riseFall="{ value: stockData.chgPct, base: 2, sign: true }"></span>
                </div>
            </div>
            <div class="data-info flex-s">
                <div class="item">
                    <div class="title">{{ $t('nearOneMonth') }}</div>
                    <div class="value" v-riseFall="{ value: stockData.chgPct1M, sign: true }"></div>
                </div>
                <div class="item align-r">
                    <div class="title">{{ $t('nearSixMonth') }}</div>
                    <div class="value" v-riseFall="{ value: stockData.chgPct6M, sign: true }"></div>
                </div>
                <div class="item align-r">
                    <div class="title">{{ $t('nearOneYear') }}</div>
                    <div class="value" v-riseFall="{ value: stockData.chgPct1Y, sign: true }"></div>
                </div>
                <div class="item align-r">
                    <div class="title">{{ $t('yearToDay') }}</div>
                    <div class="value" v-riseFall="{ value: stockData.chgPctInYear, sign: true }"></div>
                </div>
            </div>
        </div>
        <div class="fund-total-main">
            <span class="f16 bold">{{ $t('fundSelectionByStock.sxjj') }}</span>
            <span class="f14 light-color">（{{ $t('fundSelectionByStock.totalFund', { num: list.length }) }}）</span>
        </div>
        <div class="pad-rl12">
            <Table
                ref="table"
                class="content-table"
                :border="true"
                initScrollHorizon
                :data="list"
                :columns="columns"
                :emptyPlaceholder="$t('fundList.noFund')"
                :canPullDown="!filterShow"
                :showEmptyTip="showEmptyTip"
                :canPullUp="canPullUp"
                :showLoadingOver="showLoadingOver"
                :loadingOverMsg="$t('fundList.noMoreFund')"
                showPullUpLoading
                @sort="handlerSort"
                @pullUpLoad="loadHandler"
                @refresh="onRefresh"
                @rowClick="listClickHander"
            >
                <!-- 固定列：基金名 -->
                <template v-slot:name="props">
                    <div class="flex-content">
                        <div class="fund-name line-elipsis mar-b4">{{ props.item.name }}</div>
                        <div class="fund-info">
                            <div class="fund-info_currency" :class="[`currency-${props.item.currency}`]"></div>
                            <span class="fund-info_isin">
                                {{ props.item.ISIN }}
                            </span>
                            <span class="item-info__type">{{ props.item.type | fundTypeFilter }}</span>
                        </div>
                    </div>
                </template>
                <!-- 滚动列：基金其他信息 -->
                <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                    <div class="scoll-content" :key="key">
                        <template v-if="key === 'holderRatio' || key === 'score'">
                            <div class="content-top" v-if="key === 'holderRatio'">{{ props.item[key] | floatToRatio }}</div>
                            <div class="content-top" v-if="key === 'score'">{{ props.item[key] || '--' }}</div>
                        </template>
                        <div class="content-top" v-else v-riseFall="props.item[key]"></div>
                    </div>
                </template>
            </Table>
        </div>
    </div>
</template>

<script>
// import { getPubList } from '@/apis/fund/fund.js'
import { getFundHolding } from '@/apis/fund/fund.js'
import { hisQuoteChg } from '@/apis/market.js'
import Table from '@/components/Table.vue'
import { throttle } from 'lodash'
import { i18n } from '@/i18n/fund/index.js'
import { floatToRatio } from '@/utils'
import NP from 'number-precision'
import { toFixed } from '@/utils/utils'

// import { thousandsFilter } from '@/config/filters.js'
const filterUnit = {
    start: 1,
    count: 999,
}
const FUND_TYPE_ENUM = {
    1: i18n.t('fundList.stockType'),
    2: i18n.t('fundList.bondType'),
    3: i18n.t('fundList.mixedType'),
    4: i18n.t('fundList.currencyType'),
}
export default {
    name: 'fund-list',
    components: {
        Table,
        // fundFilter,
        // fundSearch
    },
    data() {
        return {
            table: null,
            canPullUp: true,
            showLoadingOver: false,
            preTouchY: null,
            nextTouchY: null,
            // 搜索条件
            sortType: 'desc', // 排序方式
            sortKey: 'holderRatio', // 排序字段
            start: filterUnit.start, // 开始数量
            unitCount: filterUnit.count, // 单位查询数量
            filterList: [], // item: {type:String, items: Array}
            // 上拉加载
            loadHandler: throttle(this.onLoader, 1000, { leading: false }),
            // 下拉事件
            touchMoveThrottle: throttle(this.touchMoveHander, 100, { leading: false }),
            // 条件控制
            filterShow: false, // 展示查询
            columns: [
                {
                    title: i18n.t('fundName'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                },
                {
                    title: i18n.t('fundSelectionByStock.cczb'),
                    key: 'holderRatio',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundSelectionByStock.jsqbh'),
                    key: 'holderChgRatio',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnY3') + i18n.t('fundSelectionByStock.zhpf'),
                    key: 'score',
                    sort: true,
                    slot: true,
                    style: {
                        width: '1.1rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('nearOneWeek'),
                    key: 'returnWeek',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnM1'),
                    key: 'returnM1',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnM3'),
                    key: 'returnM3',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnM6'),
                    key: 'returnM6',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnY1'),
                    key: 'returnY1',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnY3'),
                    key: 'returnY3',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnY5'),
                    key: 'returnY5',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnYTD'),
                    key: 'returnYTD',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnFounded'),
                    key: 'returnFounded',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundSelectionByStock.updateDate'),
                    key: 'updateDate',
                    sort: true,
                    slot: false,
                    style: {
                        width: '0.98rem',
                        'text-align': 'right',
                        'padding-right': '0.12rem',
                    },
                },
            ],
            list: [],
            showEmptyTip: false,
            symbol: '',
            stockData: {},
            stockCode: this.$route.query.stockCode && decodeURIComponent(this.$route.query.stockCode),
        }
    },
    filters: {
        timeFilter(v) {
            v = v || ''
            return v.replace(/-/g, '/') || '--'
        },
        fundTypeFilter(key) {
            return FUND_TYPE_ENUM[key] || ''
        },
        floatToRatio(v) {
            return floatToRatio(v, { sign: false })
        },
    },
    computed: {
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
    },
    watch: {},
    mounted() {
        this.getPubList()
        this.getHisQuoteChg()
        this.$nextTick(() => {
            this.table = this.$refs.table
            this.$refs.table.setSortMap(this.sortKey, this.sortType)
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
    methods: {
        async getHisQuoteChg() {
            try {
                const res = await hisQuoteChg({ codes: [this.stockCode] })
                const data = res?.result?.list[0]
                data.price = NP.divide(data.price, Math.pow(10, data.power))
                data.price = toFixed(data.price, 3)
                data.chgVal = NP.divide(data.chgVal, Math.pow(10, data.power))
                data.chgPct = NP.divide(data.chgPct, Math.pow(10, 2))
                data.chgPctWeek = NP.divide(data.chgPctWeek, Math.pow(10, 2))
                data.chgPct1M = NP.divide(data.chgPct1M, Math.pow(10, 2))
                data.chgPct3M = NP.divide(data.chgPct3M, Math.pow(10, 2))
                data.chgPct6M = NP.divide(data.chgPct6M, Math.pow(10, 2))
                data.chgPct1Y = NP.divide(data.chgPct1Y, Math.pow(10, 2))
                data.chgPctInYear = NP.divide(data.chgPctInYear, Math.pow(10, 2))
                this.stockData = data
            } catch (e) {
                console.log('jsBridge.getHisQuoteChg=>e:', e)
            }
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
        async onRefresh(cb) {
            this.initPullUpLoading()
            await this.getPubList({ reset: true })
            cb()
        },
        async onLoader(cb = null) {
            await this.getPubList()
            cb && cb()
        },
        // 搜索
        async getPubList(options = {}) {
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
                const res = await getFundHolding({
                    codes: [this.stockCode],
                    f: this.sortKey,
                    sort: this.sortType,
                    // start: this.start,
                    // count: this.unitCount,
                })

                this.showEmptyTip = true
                const data = res.result || {}
                if (data.list) {
                    const resultList = data.list
                    if (reset || sort) this.list = []
                    this.list = this.list.concat(resultList)
                    this.start = this.list.length + 1
                    if (resultList.length < this.unitCount) {
                        this.closePullUploading()
                    }
                    // 无数据 则不展示没有更多提示
                    this.list.length === 0 && this.cancelShowOver()
                }
            } catch (e) {
                console.log('error:getPubList===>:', e)
            }
        },
        handlerSort(key, type) {
            if (type === 'none') {
                // 此处不能展示为 none 排序
                type = 'asc'
                this.$refs.table && this.$refs.table.setSortMap(key, type)
            }
            this.sortType = type
            this.sortKey = key
            this.initPullUpLoading()
            this.tableScrollTop()
            this.getPubList({ sort: true })
        },
        listClickHander(rowData) {
            const url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${rowData.symbol}&fundType=${rowData.type}`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `/detail`,
                    query: {
                        type: 'public',
                        symbol: rowData.symbol,
                        fundType: rowData.type,
                    },
                })
            }
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
        // 开启、关闭 展示没有更多
        openShowOver() {
            this.showLoadingOver = true
        },
        cancelShowOver() {
            this.showLoadingOver = false
        },
        // 初始化 上拉加载
        initPullUpLoading() {
            this.openCanPullUp()
            this.cancelShowOver()
        },
        // 上拉加载结束
        closePullUploading() {
            this.cancelCanPullUp()
            this.openShowOver()
        },
    },
}
</script>
<style lang="less" scoped>
/deep/ .box {
    .fixed {
        width: 176px;
    }

    .scroll {
        .row .item {
            font-size: 14px;
        }

        .scroll-title-container {
            left: 176px;
        }
    }

    .loading-over {
        padding-right: 12px;
    }
}
</style>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

html,
body {
    overflow: hidden;
}

.theme {
    color: @theme;
}

.light-color {
    color: @fontLightColor;
}

.fund-list {
    width: 100%;
    height: 100%;
    background-color: #fff;
    #iosBottom();
}

.fund-total-main {
    margin-top: 8px;
    padding-left: 12px;
    line-height: 36px;
}

.pad-l8 {
    padding-left: 8px;
}

.basic-info {
    height: 50px;
    color: @fontBlackColor;
    font-size: 14px;
}

.data-info {
    height: 60px;

    .item {
        .title {
            color: @fontGreyColor;
            font-size: 12px;
            line-height: 24px;
        }

        .value {
            line-height: 36px;
        }
    }
}

.content-table {
    height: calc(100vh - 154px);
    min-height: 0;

    /deep/ .noData {
        top: calc(23% + 24px);

        h4 {
            color: #9c9c9c;
        }
    }
}

.fund-head {
    z-index: 10;
    height: 110px;
    padding: 0 12px;
    background-color: #fff;
    box-shadow: inset 0 -0.5px 0 #efefef;

    &__item {
        color: #666;
        font-weight: 400;
        font-size: 15px;
        line-height: 22px;
    }
}

.fund-optional {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    line-height: 24px;
    background: #fff;

    & .label {
        color: @fontGreyColor;
        font-size: 12px;
    }

    & .checked-color {
        color: #ff6907;
    }

    & .filter__icon {
        width: 12px;
        height: 12px;
    }

    & > span {
        font-size: 14px;
    }
}

.flex-content {
    display: flex;
    flex-direction: column;

    .fund-name {
        width: 176px;
        color: #1f1f1f;
        font-weight: 400;
        font-size: 15px;
        line-height: 22px;
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
            font-size: 10px;
            line-height: 12px;

            .isSelfSelect {
                width: 8px;
                height: 8px;
                margin-left: 5px;
            }
        }

        .item-info__type {
            position: relative;
            z-index: 0;
            margin-left: 9px;
            color: #9c9c9c;
            font-size: 10px;
        }

        .item-info__type::after {
            position: absolute;
            top: 1px;
            left: -5px;
            width: 1px;
            height: 8px;
            background-color: #9c9c9c;
            transform: scaleX(0.5);
            content: '';
        }
    }
}

.scoll-content {
    display: flex;
    flex-direction: column;

    .content-top {
        height: 20px;
        margin-bottom: 2px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        text-align: right;
    }

    .content-bottom {
        height: 16px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        text-align: right;
    }
}
</style>
