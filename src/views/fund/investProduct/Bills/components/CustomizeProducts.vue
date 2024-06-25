<template>
    <div class="card">
        <div class="pad-l12">
            <Table
                v-show="list.length"
                ref="table"
                class="content-table"
                :class="{ 'fix-height': fixHeight }"
                :border="true"
                :data="list"
                :columns="columns"
                :canPullDown="!filterShow"
                :hiddenLastBorder="true"
                :showEmptyTip="showEmptyTip"
                :canPullUp="canPullUp"
                :loadingOverMsg="$t('follow.noMore')"
                :showPullUpLoading="true"
                @sort="handlerSort"
                @pullUpLoad="loadHandler"
                @refresh="onRefresh"
                @rowClick="listClickHander"
            >
                <!-- 固定列：基金名 -->
                <template v-slot:name="props">
                    <div class="flex-content">
                        <div class="fund-name line-elipsis mar-b4">{{ props.item.name }}</div>
                        <span :class="`currency-${props.item.currency}`"></span>
                    </div>
                </template>
                <!-- 滚动列：基金其他信息 -->
                <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                    <div class="scoll-content" :key="key">
                        <span v-if="key == 'yieldStr'" class="f14 lh-20" :class="{ rise: isRise(props.item), fall: !isRise(props.item) }">
                            {{ props.item[key] }}
                        </span>
                        <span v-if="key == 'maturityDate'" class="c-main f14 lh-20">{{ props.item[key] | maturityDateFilter }}</span>
                    </div>
                </template>
            </Table>
            <Empty v-if="!list.length" :showImg="true" imgName="noHold" height="300px">
                <div>
                    <p class="text">{{ $t('bills.noFinishedProducts') }}</p>
                    <button class="add btn" @click.stop="handleClick">
                        <multi-img directory="fund" name="icon_optional_add"></multi-img>
                        {{ $t('bills.addCustomizeProduct') }}
                    </button>
                </div>
            </Empty>
        </div>
    </div>
</template>

<script>
import Table from '@/components/Table.vue'
import Empty from '@/components/Empty.vue'
import { getCustomProductList } from '@/apis/fund/note'
import { throttle } from 'lodash'
import { isNull, isUndefined, toFixed } from '@/utils'
import NP from 'number-precision'

const filterUnit = {
    start: 0,
    count: 15,
}

export default {
    name: 'CustomizeProducts',
    components: {
        Table,
        Empty,
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
    },
    filters: {
        maturityDateFilter(v) {
            return v ? v.substring(2, 10).replace(/-/g, '/') : ''
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
            sortKey: 'yield', // 排序字段
            start: filterUnit.start, // 开始数量
            unitCount: filterUnit.count, // 单位查询数量
            // 上拉加载
            loadHandler: throttle(this.onLoader, 1000, { leading: false }),
            // 下拉事件
            touchMoveThrottle: throttle(this.touchMoveHander, 100, { leading: false }),
            columns: [
                {
                    title: this.$t('productName'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                },
                {
                    title: this.$t('bills.yield'),
                    key: 'yieldStr',
                    sort: this.sort,
                    slot: true,
                    riseFall: false,
                    style: {
                        width: '1.04rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('bills.expiryDate'),
                    key: 'maturityDate',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.78rem',
                        'text-align': 'right',
                    },
                },
            ],
            list: [],
            showEmptyTip: false,
            fixHeight: false,
        }
    },
    computed: {
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
        subAcctId() {
            return this.$store.getters['user/getSubAccountId']
        },
    },
    mounted() {
        this.getList()
        this.$nextTick(() => {
            this.table = this.$refs.table
            this.$refs.table.setSortMap('yieldStr', this.sortType)
            document.body.addEventListener('touchstart', this.touchStartHander, {
                passive: false,
            })
            document.body.addEventListener('touchmove', this.touchMoveThrottle, {
                passive: false,
            })
            this.setTableActualHeight()
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
        handleClick() {
            this.$goPage('/bill-customize-add')
        },
        isRise(item) {
            if (isNull(item.yield) || isUndefined(item.yield)) {
                return true
            }
            return item.yield >= 0
        },
        handlerSort(key, type) {
            if (type === 'none') {
                // 此处不能展示为 none 排序
                type = 'asc'
                this.$refs.table && this.$refs.table.setSortMap(key, type)
            }
            this.sortType = type
            this.sortKey = { yieldStr: 'yield', maturityDate: 'maturityDate' }[key]
            this.initPullUpLoading()
            this.tableScrollTop()
            this.getList({ sort: true })
        },
        listClickHander(rowData) {
            this.$goPage('/bills/detail', {
                symbol: rowData.symbol,
            })
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
            await this.getList({ reset: true })
            cb()
        },
        async onLoader(cb = null) {
            await this.getList()
            cb && cb()
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
        // 获取列表
        async getList(options = {}) {
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
                    f: this.sortKey,
                    sort: this.sortType,
                    start: this.start,
                    count: this.unitCount,
                    includesExpired: 1,
                    subAccountId: this.subAcctId,
                }
                const { result } = await getCustomProductList(params)
                this.showEmptyTip = true
                if (result) {
                    const resultList = result.list
                    if (reset || sort) this.list = []
                    this.list = this.list.concat(resultList)
                    this.start = this.list.length
                    this.fixHeight = this.list.length >= 5
                    if (resultList.length < this.unitCount) {
                        this.closePullUploading()
                    }
                    // 无数据 则不展示没有更多提示
                    // this.list.length === 0 && this.cancelShowOver()
                }
            } catch (e) {
                console.log('eeror', e)
            }
        },
        setTableActualHeight() {
            // 获取页面的高度
            const viewHeight = document.documentElement.clientHeight
            const rootFontSize = Number.parseFloat(document.documentElement.style.fontSize)
            console.log(`Feng.chen:: 16:02:07 rootFontSize ===> `, rootFontSize)
            // 手动计算table的实际高度
            const height = toFixed(NP.minus(viewHeight, NP.times(NP.divide(286, 100), rootFontSize)), 2)
            console.log(`Feng.chen:: 15:46:54 table height ===> `, viewHeight, height)
            // 设置元素对应高度
            this.table.$el.style.maxHeight = `${height}px`
            this.table.$el.style.height = `${height}px`
        },
    },
}
</script>

<style lang="less" scoped>
.text {
    margin-top: 4px;
    text-align: center;
}

.btn.add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 32px;
    margin-top: 16px;
    color: @theme;
    font-weight: 400;
    font-size: 14px;
    background: rgba(255, 105, 7, 0.07);
    border: none;
    border-radius: 32px;
    box-shadow: none;

    img {
        width: 12px;
        height: 12px;
        margin: 0 4px 0 0;
    }
}

.card {
    #foreground();

    padding: 8px 0 0;
    border-radius: 8px;

    // .fix-height {
    //     height: calc(100vh - 286px);
    // }

    .content-table {
        min-height: 0;
        // max-height: calc(100vh - 286px);
        font-weight: normal;
        font-size: 14px;

        /deep/ .noData {
            top: calc(23% + 24px);
        }
    }

    // margin-top: 12px;
    &.shadow {
        background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
        box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
        backdrop-filter: blur(27px);
    }

    /deep/ .box {
        flex: 1;

        .fixed {
            z-index: 5;
            width: 146px !important;
        }

        .scroll {
            .scroll-title-container {
                left: 146px !important;
                z-index: 5;
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
}

.flex-content {
    display: flex;
    flex-direction: column;

    .fund-name {
        font-size: 14px;
        line-height: 20px;
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
</style>
