<template>
    <div class="filter-fund">
        <header>{{ $t('fundSelectionByStock.fundRatioTips') }}</header>
        <div class="content flex1 flex-column overflow-hidden-y">
            <div class="filter-wrapper">
                <div class="header flex-s">
                    <div>
                        <span class="f16 main-color bold">{{ $t('fundSelectionByStock.sxjj') }}</span>
                        <span class="f14 light-color">（{{ $t('fundSelectionByStock.totalFund', { num: list.length }) }}）</span>
                    </div>
                    <div class="flex-c contain-main" @click="filterModal = true">
                        <span class="f12 light-color">{{ holderTypeData[holderType] }}</span>
                        <multi-img width="12" class="mar-14" height="12" name="icon_arrow_down" directory="fund"></multi-img>
                    </div>
                </div>
            </div>

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
                        <template v-if="key === 'holderRatio'">
                            <div class="content-top align-l">
                                <div>{{ props.item[key] | floatToRatio }}</div>
                            </div>
                            <div class="content-bottom pos-r">
                                <div class="ratio-main" :style="props.item['style']">
                                    <template v-for="(item, index) in symbols">
                                        <div
                                            class="ratio-item"
                                            :class="'item' + (index + 1)"
                                            :style="props.item['item' + (index + 1)]"
                                            :key="item"
                                            v-if="props.item['item' + (index + 1)]['width']"
                                        ></div>
                                    </template>
                                </div>
                            </div>
                        </template>
                        <div class="content-top" v-if="key == 'score'">{{ props.item[key] || '--' }}</div>
                        <div class="content-top" v-if="key !== 'score' && key !== 'holderRatio'" v-riseFall="props.item[key]"></div>
                    </div>
                </template>
            </Table>
        </div>
        <van-action-sheet v-model="filterModal" title="" :closeable="false">
            <div class="filter-main">
                <div class="item" v-for="(item, key) in holderTypeData" :key="key" :class="{ active: key == holderType }" @click="filterHandler(key)">
                    {{ item }}
                </div>
            </div>
        </van-action-sheet>
    </div>
</template>
<script>
import { i18n } from '@/i18n/fund/index.js'
import { throttle } from 'lodash'
import { getFundHolding } from '@/apis/fund/fund.js'
import Table from '@/components/Table.vue'
import { floatToRatio, max } from '@/utils'

const filterUnit = {
    start: 1,
    count: 20,
}
const FUND_TYPE_ENUM = {
    1: i18n.t('fundList.stockType'),
    2: i18n.t('fundList.bondType'),
    3: i18n.t('fundList.mixedType'),
    4: i18n.t('fundList.currencyType'),
}

const HOLDER_TYPE_DATA = {
    1: i18n.t('fundSelectionByStock.containAllStock'),
    0: i18n.t('fundSelectionByStock.containPartStock'),
}
export default {
    name: 'filterFund',
    components: {
        Table,
    },
    data() {
        return {
            holderTypeData: HOLDER_TYPE_DATA,
            symbols: this.$route.query.symbols ? JSON.parse(decodeURIComponent(this.$route.query.symbols)) : [],
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
            // 上拉加载
            loadHandler: throttle(this.onLoader, 1000, { leading: false }),
            // 下拉事件
            touchMoveThrottle: throttle(this.touchMoveHander, 100, { leading: false }),
            // 条件控制
            filterShow: false, // 展示查询
            filterModal: false,
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
                        width: '0.78rem',
                        'padding-left': '0.16rem',
                    },
                    titleItemStyle: {
                        'justify-content': 'flex-start',
                    },
                },
                {
                    title: i18n.t('fundSelectionByStock.jsqbh'),
                    key: 'holderChgRatio',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.78rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnY3') + i18n.t('fundSelectionByStock.zhpf'),
                    key: 'score',
                    sort: true,
                    slot: true,
                    style: {
                        width: '1.06rem',
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
            holderType: this.$route.query.holderType, // 获取数据类型	0: 包含部分股票 1: 包含全部股票 默认为0
            maxRatio: 0,
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
    mounted() {
        this.getPubList()
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
        filterHandler(key) {
            this.holderType = key
            this.filterModal = false
            this.getPubList()
            this.$emit('handleFilter', key)
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
        deleteFn(options = {}) {
            const { market, rawSymbol } = options
            // 删除
            if (market && rawSymbol) {
                const code = market + '' + rawSymbol
                this.symbols = this.symbols.filter(item => item != code)
            }
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
                    codes: this.symbols,
                    f: this.sortKey,
                    sort: this.sortType,
                    HolderType: Number(this.holderType),
                    // start: this.start,
                    // count: this.unitCount,
                })

                this.showEmptyTip = true
                const data = res.result || {}
                this.list = []
                if (data.list) {
                    const resultList = data.list
                    this.computedStyle(resultList)
                    if (reset || sort) this.list = []
                    this.list = resultList

                    this.start = this.list.length + 1
                    if (resultList.length < this.unitCount) {
                        this.closePullUploading()
                    }
                }
                // 无数据 则不展示没有更多提示
                this.list.length === 0 && this.cancelShowOver()
            } catch (e) {
                console.log('error:getPubList===>:', e)
            }
        },
        // 计算持仓占比样式
        computedStyle(resultList = []) {
            this.maxRatio = max(resultList.map(item => item.holderRatio))
            resultList.forEach(item => {
                if (item['holderRatio'] == this.maxRatio) {
                    item.style = {
                        width: '58px',
                    }
                } else {
                    item.style = {
                        width: (item['holderRatio'] / this.maxRatio) * 58 + 'px',
                    }
                }
                this.symbols.forEach((i, j) => {
                    const currentIndex = j + 1
                    item['item' + currentIndex] = {}
                    if (i && item.ratioList[i]) {
                        item['item' + currentIndex] = { width: (item.ratioList[i] / item.holderRatio) * 100 + '%' }
                    } else {
                        item['item' + currentIndex] = {
                            width: 0,
                            border: 0,
                        }
                    }
                })
            })
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
            this.symbol = rowData.symbol
            const url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${rowData.symbol}&fundType=${rowData.type}`
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
    flex: 1;

    .fixed {
        width: 164px;
    }

    .scroll {
        .row .item {
            font-size: 14px;
        }

        .scroll-title-container {
            left: 164px;
        }
    }

    .loading-over {
        padding-right: 12px;
    }
}
</style>
<style scoped lang="less">
.light-color {
    color: @fontLightColor;
}

.filter-main {
    padding: 12px 8px;

    .item {
        padding: 0 16px;
        color: #000;
        font-size: 16px;
        line-height: 64px;

        &.active {
            background: #fff5ef;
            border-radius: 8px;
        }
    }
}

.ratio-main {
    position: absolute;
    width: 58px;
    height: 5px;
    margin-top: 7px;
    overflow: hidden;
    font-size: 0;
    white-space: nowrap;
    border-radius: 7px;

    .ratio-item {
        display: inline-block;
        vertical-align: top;
        border-right: 0.01rem solid #fff;

        &:last-child {
            border: 0;
        }
    }

    .item1 {
        height: 5px;
        background: #278aff;
    }

    .item2 {
        height: 5px;
        background: #9471ff;
    }

    .item3 {
        height: 5px;
        background: #ff7875;
    }

    .item4 {
        height: 5px;
        background: #ffa800;
    }
}

header {
    padding: 12px;
    color: #9c9c9c;
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
}

.content {
    background-color: #fff;
}

.fund-total-main {
    padding: 8px 12px 0;
    line-height: 36px;
}

.content-table {
    min-height: 0;
    margin-left: 12px;
    // height: calc(100vh - 154px);
    /deep/ .noData {
        top: calc(23% + 24px);

        h4 {
            color: #9c9c9c;
        }
    }
}

.flex-content {
    display: flex;
    flex-direction: column;

    .fund-name {
        width: 164px;
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
        margin-top: -2px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        text-align: left;
    }
}

.filter-wrapper {
    padding: 8px 0 0 12px;
    background-color: @white;

    .header {
        height: 36px;
        padding-right: 12px;
    }

    .contain-main {
        align-items: baseline;
    }
}
</style>
