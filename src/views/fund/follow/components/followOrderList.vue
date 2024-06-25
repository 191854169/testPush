<template>
    <div class="card tjlist" :class="{ follow: true }">
        <div class="pad-l12">
            <Table
                ref="table"
                class="content-table"
                :border="true"
                :data="list"
                :columns="columns"
                :showEmptyTip="showEmptyTip"
                :canPullUp="canPullUp"
                :loadingOverMsg="$t('follow.noMore')"
                showPullUpLoading
                @pullUpLoad="loadHandler"
                @refresh="onRefresh"
                @rowClick="listClickHander"
            >
                <!-- 固定列：类型状态 -->
                <template v-slot:type="props">
                    <div class="flex-content list-item">
                        <p class="opt-type">{{ props.item.optType | optTypeFilter }}</p>
                        <p class="order-status">
                            <multi-img
                                v-if="tradeStatusIconMap[props.item.tradeStatus]"
                                :name="tradeStatusIconMap[props.item.tradeStatus]"
                                directory="common/orderStatus"
                            ></multi-img>
                            <span>{{ props.item.tradeStatus | tradeStatusTextFilter(props.item) }}</span>
                        </p>
                    </div>
                </template>
                <!-- 名称 -->
                <template v-slot:name="props">
                    <div class="flex-content list-item">
                        <div class="fund-name line-elipsis">{{ props.item.portfolioName }}</div>
                    </div>
                </template>
                <!-- 滚动列：基金其他信息 -->
                <template v-slot:amount="props">
                    <div class="amount-content list-item">
                        <div class="row" v-for="(item, index) in props.item.estimateBuyInfo" :key="index">
                            <dynamic-font
                                class="amount line-elipsis"
                                :value="formatAmountWithCurrency(item.amount, item.currency)"
                                :options="{ maxFontSize: 14, minFontSize: 12 }"
                            ></dynamic-font>
                        </div>
                    </div>
                </template>

                <template v-slot:time="props">
                    <div class="scoll-content list-item">
                        <p class="order-date">{{ props.item.submitTime | dateFilter }}</p>
                        <p class="order-time">{{ props.item.submitTime | timeFilter }}</p>
                    </div>
                </template>
            </Table>
        </div>
    </div>
</template>

<script>
import DynamicFont from '@/components/FosunDynamicFont.vue'
import Table from '@/components/Table.vue'
import { throttle } from 'lodash'
import { i18n } from '@/i18n/fund'
import { INVEST_EXP_MAP } from '../../config/common'
import dayjs from 'dayjs'
import { FOLLOW_TRADE_STATUS_MAP } from '@/views/fund/config/common'
import { keepDecimals } from '@/utils'
import { thousandsFilter } from '@/config/filters'

const $t = text => i18n.t(text)
const tradeStatusKeyValueMap = FOLLOW_TRADE_STATUS_MAP.keyValueMap
const tradeStatusTextCommonMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.wait],
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.success],
}
const tradeStatusIconMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: 'icon-wait',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: 'icon-success',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: 'icon-error',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: 'icon-error',
}

export default {
    name: 'follow',
    components: {
        DynamicFont,
        Table,
    },
    props: {
        list: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            table: null,
            canPullUp: true,
            preTouchY: null,
            nextTouchY: null,
            // 上拉加载
            loadHandler: throttle(this.onLoader, 1000, { leading: false }),
            // 下拉事件
            touchMoveThrottle: throttle(this.touchMoveHander, 100, { leading: false }),
            originColumns: [
                {
                    title: $t('follow.directionStatus'),
                    key: 'type',
                    fixed: true,
                    slot: true,
                },
                {
                    title: $t('follow.combinationName'),
                    key: 'name',
                    slot: true,
                    style: {
                        width: '1.32rem',
                        'justify-content': 'flex-start',
                        'padding-left': '0.12rem',
                    },
                },
                {
                    title: $t('follow.amount'),
                    key: 'amount',
                    slot: true,
                    style: {
                        width: '1.22rem',
                        'justify-content': 'flex-start',
                        'padding-left': '0.12rem',
                    },
                },
                {
                    title: $t('orderDetailCols.submitTime'),
                    key: 'time',
                    slot: true,
                    style: {
                        width: '0.97rem',
                        'padding-right': '0.12rem',
                        'text-align': 'right',
                    },
                },
            ],
            showEmptyTip: false,
            tradeStatusIconMap,
        }
    },
    computed: {
        columns() {
            let arr = this.originColumns
            if (this.isFundIndex) {
                arr = this.originColumns.slice(0, 3)
            }
            return arr
        },
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
    },
    filters: {
        investExpFilter(v) {
            return INVEST_EXP_MAP.options.findLabel(v, '--')
        },
        optTypeFilter(v) {
            // 买入/卖出  1：买，2：卖
            return (
                {
                    1: $t('subscribe'),
                    2: $t('redeem'),
                }[v] || '--'
            )
        },
        tradeStatusTextFilter(v, info = {}) {
            const commonMap = tradeStatusTextCommonMap
            let typeMap = {}
            if (info.portfolioType === 3) {
                // 基金 撤单/终止
                typeMap = {
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: $t('follow.cancelEnding'),
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: $t('follow.cancelEnding'),
                }
            } else {
                // 股票 撤单/失败
                typeMap = {
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: $t('follow.cancelFail'),
                    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: $t('follow.cancelFail'),
                }
            }
            return { ...commonMap, ...typeMap }[v] || '--'
        },
        currencyFilter(v) {
            return (
                {
                    HKD: $t('HKD'),
                    USD: $t('USD'),
                    CNH: $t('yuan'),
                    CNY: $t('yuan'),
                    EUR: $t('EUR'),
                }[v] || '--'
            )
        },
        dateFilter(v) {
            return v ? dayjs(v).format('YY/MM/DD') : ''
        },
        timeFilter(v) {
            return v ? dayjs(v).format('HH:mm:ss') : ''
        },
        amountFilter(v, base = 2) {
            return v ? thousandsFilter(keepDecimals(v, base)) : '--'
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
        // listClickHander(rowData) {
        //     console.log('rowData', rowData)
        //     const url = `${location.origin}/wealth/fund.html#/follow-order-detail?portfolioId=${rowData.portfolioId}`
        //     if (this.$openPageInThs(url)) return
        //     if (this.$jsBridge) {
        //         this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
        //     } else {
        //         this.$router.push({
        //             path: `/follow-order-detail`,
        //             query: {
        //                 orderId: rowData.id,
        //             },
        //         })
        //     }
        // },

        listClickHander(rowData) {
            const id = rowData.id
            const url = `${location.origin}/wealth/fund.html#/follow-order-detail?id=${id}`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/follow-order-detail',
                    query: {
                        id,
                    },
                })
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
        onRefresh(cb) {
            this.initPullUpLoading()
            this.$emit('refresh')
            cb()
        },
        onLoader(cb = null) {
            this.$emit('loader')
            console.log('lkp iiii', 'loader')
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
        formatAmountWithCurrency(amount, currency) {
            const formattedAmount = this.$options.filters.amountFilter(amount)
            return `${formattedAmount} ${currency}`
        },
    },
}
</script>

<style lang="less" scoped>
.follow {
    /deep/ .box {
        flex: 1;

        .fixed {
            width: 76px !important;
        }

        .scroll {
            .scroll-title-container {
                left: 76px !important;
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

    .content-table {
        height: calc(100vh - 50px);
        #iosBottom();

        ::-webkit-scrollbar {
            display: none;
        }
    }
}

.list-item {
    height: 64px;
}

.flex-content {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .opt-type {
        width: 78px;
        margin-bottom: 2px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
    }

    .order-status {
        display: flex;
        align-items: center;
        color: #9c9c9c;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;

        img {
            width: 12px;
            height: 12px;
            margin-right: 3px;
        }
    }

    .fund-name {
        width: 120px;
        font-size: 14px;
        line-height: 20px;
    }
}

.amount-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    width: 120px;

    .row {
        display: flex;
        align-items: center;
        height: 20px;

        .amount {
            width: 120px;
            white-space: nowrap;
        }
    }
}

.scoll-content {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;

    .order-date {
        width: 65px;
        font-size: 14px;
        text-align: right;
    }

    .order-time {
        margin-top: 4px;
        color: #9c9c9c;
        font-weight: normal;
        font-size: 12px;
    }
}
</style>
