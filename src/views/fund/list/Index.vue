// 基金列表页
<template>
    <div class="fund-list">
        <H5BroserTitle v-if="isManageMoney" :title="$t('cashManage')" :style="{ 'margin-bottom': '0px' }"></H5BroserTitle>
        <fund-search v-if="!isManageMoney"></fund-search>
        <div class="fund-head" v-if="!isManageMoney">
            <div class="fund-head__item" v-for="item in fundTypeList" :key="item.key" @click="headClickAction($event)">
                <span :class="{ 'active-item': activeTab === item.key }" :data-key="item.key">{{ item.label }}</span>
            </div>
        </div>
        <Table
            ref="table"
            class="content-table"
            :class="{ 'is-in-ry': isManageMoney }"
            initScrollHorizon
            :data="list"
            :columns="columns"
            :emptyPlaceholder="$t('fundList.noFund')"
            :canPullDown="!filterShow"
            :showEmptyTip="showEmptyTip"
            :canPullUp="canPullUp"
            :showLoadingOver="showLoadingOver"
            :loadingOverMsg="$t(`fundList.${isManageMoney ? 'noMoreProduct' : 'noMoreFund'}`)"
            showPullUpLoading
            :isInRy="isInRy"
            @sort="handlerSort"
            @pullUpLoad="loadHandler"
            @refresh="onRefresh"
            @rowClick="listClickHander"
        >
            <!-- filter部分 -->
            <template v-slot:fixTitle>
                <div v-if="!isManageMoney" class="fund-optional" @click="triggerFilter">
                    <div class="label" :class="{ 'checked-color': filterShow || isHasFilter }">{{ $t('fundList.filter') }}</div>
                    <span class="fsfont" :style="{ color: filterShow || isHasFilter ? variable.theme : '#2F2F2F' }">&#xe612;</span>
                </div>
                <div v-if="isManageMoney" class="fund-optional">
                    <span class="title">产品名称</span>
                </div>
                <fund-filter
                    :filterShow="filterShow"
                    :isAll="isAll"
                    :filterList="filterList"
                    @cancel="triggerFilter"
                    @search="handlerFilterSearch"
                ></fund-filter>
            </template>
            <!-- 固定列：基金名 -->
            <template v-slot:name="props">
                <div class="flex-content">
                    <div class="fund-name line-elipsis">{{ props.item.name }}</div>
                    <div class="fund-info">
                        <div class="fund-info_currency is-in-ry" :class="[`currency-${props.item.currency}`]"></div>
                        <span class="fund-info_isin">
                            {{ props.item.ISIN }}
                            <multi-img v-if="props.item.isSelf" class="isSelfSelect" name="icon-self-checked" directory="fund" />
                        </span>
                    </div>
                </div>
            </template>
            <template v-slot:latestNav="props">
                <div class="scoll-content">
                    <div class="content-top">{{ props.item.latestNav }}</div>
                    <div class="content-bottom">{{ props.item.latestNavDate | timeFilter }}</div>
                </div>
            </template>
            <!-- 滚动列：基金其他信息 -->
            <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                <div class="scoll-content" :key="key">
                    <div
                        class="content-top"
                        :data-key="key"
                        v-riseFall="{ value: props.item[key], base: 4, rate: true }"
                        v-if="key == 'returnD7ToY1'"
                    ></div>
                    <div class="content-top" v-riseFall="props.item[key]" v-else></div>
                </div>
            </template>
        </Table>
    </div>
</template>

<script>
import { getPubList } from '@/apis/fund/fund.js'
import fundSearch from './components/fund-search.vue'
import Table from '@/components/Table.vue'
import fundFilter from './components/fund-filter.vue'
import { cloneDeep, throttle } from 'lodash'
import { i18n } from '@/i18n/fund/index.js'
import { thousandsFilter } from '@/config/filters.js'
import { isTenantApp } from '@/utils/tools'
import { isInRyH5 } from '@/utils'
import { dealAssetValToString } from './utils'
import H5BroserTitle from '../components/H5BroserTitle.vue'
import { variable } from '@/assets/css/variable'

const filterUnit = {
    start: 1,
    count: 20,
}
export default {
    name: 'fund-list',
    components: {
        Table,
        fundFilter,
        fundSearch,
        H5BroserTitle,
    },
    data() {
        return {
            variable,
            table: null,
            canPullUp: true,
            showLoadingOver: false,
            preTouchY: null,
            nextTouchY: null,
            // 搜索条件
            sortType: 'desc', // 排序方式
            sortKey: 'returnM1', // 排序字段
            start: filterUnit.start, // 开始数量
            unitCount: filterUnit.count, // 单位查询数量
            filterList: [], // item: {type:String, items: Array}
            // 上拉加载
            loadHandler: throttle(this.onLoader, 1000, { leading: false }),
            // 下拉事件
            touchMoveThrottle: throttle(this.touchMoveHander, 100, { leading: false }),
            // 条件控制
            filterShow: false, // 展示查询
            activeTab: 'all', // 活动的tab
            fundTypeList: [
                { label: i18n.t('fundList.all'), key: 'all' },
                { label: i18n.t('fundList.stockType'), key: 'stock' },
                { label: i18n.t('fundList.bondType'), key: 'bond' },
                { label: i18n.t('fundList.mixedType'), key: 'mixed' },
                { label: i18n.t('cashBox'), key: 'mmf' },
            ],
            fundTypeMap: {
                all: i18n.t('fundList.all'),
                stock: i18n.t('fundList.stockType'),
                bond: i18n.t('fundList.bondType'),
                mixed: i18n.t('fundList.mixedType'),
                mmf: i18n.t('cashBox'),
            },
            columns: [
                {
                    title: '',
                    key: 'name',
                    headSlot: true,
                    fixed: true,
                    slot: true,
                },
                {
                    title: i18n.t('fundList.latestNav'),
                    key: 'latestNav',
                    sort: true,
                    slot: true,
                    filter: row => {
                        return thousandsFilter(row.latestNav)
                    },
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('dayTrip'),
                    key: 'returnLastDay',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('nearlyWeek'),
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
                // {
                //     title: i18n.t('fundList.drawDownM6'),
                //     key: 'drawDownM6',
                //     sort: true,
                //     slot: true,
                //     style: {
                //         width: '0.87rem',
                //         'text-align': 'right'
                //     }
                // },
                {
                    title: i18n.t('fundList.drawDownY1'),
                    key: 'drawDownY1',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.sharpeRatioY1'),
                    key: 'sharpeRatioY1',
                    sort: true,
                    style: {
                        width: '1.1rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.minInitial'),
                    key: 'minInitial',
                    sort: true,
                    filter: row => {
                        return thousandsFilter(row.minInitial)
                    },
                    style: {
                        'padding-right': '0.12rem',
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.asset'),
                    key: 'asset',
                    sort: true,
                    filter: row => dealAssetValToString(row.asset),
                    style: {
                        'padding-right': '0.12rem',
                        width: '1.12rem',
                        'text-align': 'right',
                    },
                },
            ],
            list: [],
            showEmptyTip: false,
            symbol: '',
        }
    },
    filters: {
        timeFilter(v) {
            v = v || ''
            return v.replace(/-/g, '/') || '--'
        },
    },
    computed: {
        slotScollColumnKeys() {
            // 最新净值列非固定、展示内容额外处理
            return this.columns.filter(item => item.slot && !item.fixed && item.key !== 'latestNav').map(item => item.key)
        },
        // 是否alltab
        isAll() {
            return this.activeTab === 'all'
        },
        // 是否有筛选条件
        isHasFilter() {
            return !!(
                this.filterList.filter(item => {
                    return this.activeTab === 'all' ? true : item.type !== 'fundType'
                }) || []
            ).reduce((all, { items } = {}) => {
                all += items.length
                return all
            }, 0)
        },
        isApp() {
            return isTenantApp() && !!this.$jsBridge
        },
        // 是否从瑞银跳转
        isInRy() {
            return isInRyH5()
        },

        // 是否为现金管理页面
        isManageMoney() {
            return this.$route.query.pageType === 'manageMoney'
        },
    },
    watch: {
        '$route.query': {
            handler(v) {
                if (v && v.activeTab) {
                    // 现金管理只展示星财宝数据
                    this.isManageMoney ? (this.activeTab = 'mmf') : (this.activeTab = v.activeTab)
                }
            },
            deep: true,
            immediate: true,
        },
        activeTab: {
            async handler(v, oldVal) {
                const fundTypeItem = this.filterList.find(item => {
                    return item.type === 'fundType'
                })
                const fundTypeIndex = this.filterList.indexOf(fundTypeItem)
                if (v === 'all') {
                    // all-删除类型filter
                    if (fundTypeItem) {
                        this.filterList.splice(fundTypeIndex, 1)
                    }
                } else {
                    if (fundTypeItem) {
                        fundTypeItem.items = [this.activeTab]
                    } else {
                        this.isManageMoney
                            ? this.filterList.push({ type: 'fundType', items: [this.activeTab, 'currency'] })
                            : this.filterList.push({ type: 'fundType', items: [this.activeTab] })
                    }
                }
                // 当前是货币型基金需要增加两项
                if (v === 'mmf') {
                    this.sortKey = this.isInRy ? 'asset' : 'returnD7ToY1'
                    this.sortType = 'desc'
                    this.table && this.table.setSortMap(this.sortKey, this.sortType)
                    this.addCurrencyList()
                }
                // 上一次是货币型的话，其他类型要过滤掉万份收益和七日年化
                if (oldVal === 'mmf') {
                    this.sortKey = 'returnM1'
                    this.sortType = 'desc'
                    this.table && this.table.setSortMap(this.sortKey, this.sortType)
                    this.columns = this.columns.filter(item => {
                        return item.key !== 'income10K' && item.key !== 'returnD7ToY1'
                    })
                }
                // 切换tab查询
                this.initPullUpLoading()
                this.tableScrollTop()
                this.filterShow && this.triggerFilter()
                this.$loading.show = true
                await this.burySearch({ reset: true })
                this.$loading.show = false
            },
            immediate: true,
        },
    },
    mounted() {
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
        this.$jsBridge &&
            this.$jsBridge.watchPageVisible(() => {
                if (this.symbol) {
                    this.checkViewDetail(this.symbol)
                }
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
        //检查查看详情的symbo是否为自选，是则刷新状态
        async checkViewDetail(symbol) {
            const isSelf = await this.checkFavstock(symbol)
            for (const a of this.list) {
                if (a.symbol == symbol) {
                    a.isSelf = isSelf
                }
            }
        },
        // 检查自选
        async checkFavstock(symbol) {
            if (!this.isApp) return
            try {
                const data = await this.$jsBridge.checkFavstock(symbol)
                return data.isFavStock
            } catch (e) {
                console.log('jsBridge.checkFavstock=>e:', e)
                return false
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
        // 埋点搜索
        async burySearch(options = {}) {
            await this.getPubList(options)
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
                const res = await getPubList({
                    filter: this.filterList,
                    f: this.sortKey,
                    sort: this.sortType,
                    start: this.start,
                    count: this.unitCount,
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
        headClickAction(e) {
            if (e.target.nodeName !== 'SPAN') return
            this.activeTab = e.target.dataset.key
        },
        triggerFilter() {
            this.filterShow = !this.filterShow
            this.$nextTick(() => {
                const body = document.querySelector('body')
                const html = document.querySelector('html')
                body && body.classList[this.filterShow ? 'add' : 'remove']('overflow-hidden-y')
                html && html.classList[this.filterShow ? 'add' : 'remove']('overflow-hidden-y')
            })
        },
        // filter查询
        handlerFilterSearch(list) {
            this.initPullUpLoading()
            this.tableScrollTop()
            this.filterList = cloneDeep(list)
            this.triggerFilter()
            this.burySearch({ reset: true })
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
        //货币型基金增加万份收益和七日年化
        addCurrencyList() {
            this.columns.splice(1, 0, {
                title: i18n.t('jqrnh'),
                key: 'returnD7ToY1',
                sort: true, // 睿银站外h5默认根据资产规模字段排序
                slot: true,
                style: {
                    width: '0.87rem',
                    'text-align': 'right',
                },
            })
        },
    },
}
</script>
<style lang="less" scoped>
/deep/ .box {
    margin-top: 8px;
    padding: 0 12px;

    .fixed {
        width: 176px;

        .fixed-body .item {
            border-bottom: 0.5px solid #efefef;
        }
    }

    .scroll {
        .row .item {
            font-size: 14px;
            border-bottom: 0.5px solid #efefef;
        }

        .scroll-title-container {
            left: 188px;
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

.fund-list {
    width: 100%;
    height: 100%;
    background-color: #fff;
    #iosBottom();
}

.content-table {
    height: calc(100vh - 88px);
    min-height: 0;
    padding: 0 0 0 12px;

    &.is-in-ry {
        margin-top: 0;
    }

    /deep/ .noData {
        top: calc(23% + 24px);

        h4 {
            color: #9c9c9c;
        }
    }
}

.fund-head {
    z-index: 10;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 36px;
    padding: 0;
    font-style: normal;
    background-color: #fff;
    box-shadow: inset 0 -0.5px 0 #efefef;

    &__item {
        color: #666;
        font-weight: 400;
        font-size: 15px;
        line-height: 22px;

        & .active-item {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
        }
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
        padding-right: 4px;
        color: #2f2f2f;
        font-size: 14px;
    }

    & .checked-color {
        color: @theme;
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
        margin-bottom: 2px;
        color: #1f1f1f;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
    }

    .fund-info {
        display: flex;
        align-items: center;

        .fund-info_currency {
            margin-right: 4px;
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
