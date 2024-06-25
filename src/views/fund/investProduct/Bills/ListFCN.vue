<!-- 票据询价 -->
<template>
    <div class="list-fnc" ref="scrollarea" :class="{ bgfff: showList.length === 0 }">
        <!-- 导航栏 -->
        <div class="tabs">
            <div class="flex pad-l12 pad-tb8">
                <div
                    class="flex tab"
                    :class="{ 'active-tab': item.id === activeTabID }"
                    v-for="item in tabs"
                    :key="item.id"
                    @click="tabChanged(item.id)"
                >
                    {{ item.lable }}
                </div>
            </div>
            <tableStickyHeader
                v-if="showFixedTitle && showList.length > 0"
                :config="originColumns"
                ref="fexedTitle"
                @sort="handlerSort"
            ></tableStickyHeader>
        </div>
        <div :style="{ height: `${calcRem(44)}px` }"></div>
        <van-pull-refresh class="refresh-content" v-model="isLoading" @refresh="requestCurrentList()">
            <div v-if="activeTabID === 0 && bestItem" class="fnc-card-container" @click="listClickHander(bestItem)">
                <div class="fnc-card">
                    <div class="card-top flex">
                        <span class="coupon" v-riseFall="{ value: bestItem.coupon, sign: false, thousand: true }"></span>
                        <div class="name flex">
                            <div class="currency" :class="[`currency-${bestItem.currency}`]" :style="{ height: '14px', width: '27px' }"></div>
                            <div class="product line-elipsis">{{ getObjectStockStr(bestItem, '、') }}</div>
                        </div>
                    </div>

                    <div class="card-desc">
                        <span :style="{ marginRight: '48px' }">
                            {{ $t('fcn.annualizedCoupon') }}
                        </span>
                        <span>{{ bestItem.inquiryPeriod }}{{ $t('fcn.monthPeriod') }}</span>
                        <span class="line"></span>
                        <span>{{ bestItem.pricerName }}{{ $t('fcn.quotation') }}</span>
                    </div>
                    <div class="card-bottom flex border-top-1px">
                        <template v-if="bestItem?.orderStatus !== 500">
                            <span>{{ $t('fcn.validQuotation') }}</span>
                            <span class="h2">
                                {{ bestItem.quotationTime | dateTimeFormat }} {{ ' - ' }} {{ bestItem.expirationTime | dateTimeFormat }}
                            </span>
                        </template>
                        <template v-else>
                            <span>{{ $t('fcn.validQuotationExpiration') }}</span>
                        </template>
                    </div>
                </div>
            </div>
            <div v-if="activeTabID === 1 && showList.length === 0">
                <div class="no-data">
                    <multi-img width="103" height="103" name="noHold" directory="common" />
                    <h4>{{ $t('fcn.noHistory') }}</h4>
                </div>
            </div>
            <div v-else class="bgfff">
                <Table
                    ref="table"
                    class="fnc-table"
                    initScrollHorizon
                    showPullUpLoading
                    :class="{ 'history-table': activeTabID === 1 }"
                    :data="showList"
                    :columns="originColumns"
                    :border="true"
                    :canPullDown="false"
                    :showEmptyTip="true"
                    :canPullUp="false"
                    :loadingOverMsg="$t('follow.noMore')"
                    :hiddenLastBorder="true"
                    @sort="handlerSort"
                    @pullUpLoad="onPullUpLoad"
                    @rowClick="listClickHander"
                    @body-scroll-left="v => (bodyScrollLeft = v.scrollLeft)"
                >
                    <!-- 固定列标题 -->
                    <template v-slot:fixTitle>
                        <div class="fix-title flex">
                            <div class="product-type">{{ $t('fcn.productType') }}</div>
                            <div class="obj-title">{{ $t('fcn.biaodi') }}</div>
                        </div>
                    </template>
                    <!-- 固定列 -->
                    <template v-slot:name="props">
                        <div class="fix-content">
                            <div v-if="activeTabID === 0" class="fix-name">{{ 'FCN' }}</div>
                            <div v-else>
                                <div class="fix-name">{{ 'FCN' }}</div>
                                <div class="fix-name-info flex-c">
                                    <multi-img :name="iconMap[props.item.orderStatus]?.icon || 'icon-wait'" directory="bond" />
                                    <div>{{ iconMap[props.item.orderStatus]?.msg || $t('fcn.requesting') }}</div>
                                </div>
                            </div>
                            <div class="obj-value line-elipsis">{{ getObjectStockStr(props.item) }}</div>
                        </div>
                    </template>
                    <!-- 滚动列：其他信息 -->
                    <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                        <div class="scoll-content" :key="key">
                            <div v-if="getInquiryItemKey(props.item, key).bool">
                                <div
                                    v-riseFall="{
                                        value: getInquiryItemKey(props.item, key).value,
                                        riseFall: ['coupon'].includes(key),
                                        sign: ['coupon'].includes(key),
                                        hide: getInquiryItemKey(props.item, key).hide,
                                        hideObj: getInquiryItemKey(props.item, key).hideObj,
                                    }"
                                ></div>
                            </div>
                            <div
                                v-else-if="['inquiryTime', 'currency', 'knockOutType', 'inquiryPeriod', 'pricerName'].includes(key) == false"
                                v-riseFall="{ value: props.item[key], riseFall: ['coupon'].includes(key), sign: ['coupon'].includes(key) }"
                                :class="[`${key}`]"
                            ></div>
                            <div v-else-if="key === 'knockOutType'">{{ getFrequencyStr(props.item) }}</div>
                            <div v-else-if="key === 'currency'" :class="[`${key}`]">{{ props.item[key] | currencyFilter }}</div>
                            <div v-else-if="key === 'inquiryTime'" :class="[`${key}`]">
                                <div class="date">{{ props.item[key] | dateFormat }}</div>
                                <div class="time">{{ props.item[key] | timeFormat }}</div>
                            </div>
                            <div v-else class="line-elipsis" :class="[`${key}`]">{{ props.item[key] }}</div>
                        </div>
                    </template>
                </Table>
            </div>

            <div v-if="showList.length > fullScreenCount" class="bottom-tips">{{ $t('customBillListLegalTip') }}</div>
        </van-pull-refresh>
        <div :style="{ height: `${calcRem(90)}px` }"></div>
        <footer class="fixed-footer">
            <div v-if="showList.length > 0 && showList.length <= fullScreenCount" class="abs-tips">{{ $t('customBillListLegalTip') }}</div>
            <div class="add" @click="addEnquiry">{{ $t('fcn.addEnquiry') }}</div>
        </footer>
    </div>
</template>

<script>
import Table from '@/components/Table.vue'
import { calcRem, debounce } from '@/utils'
import { NoteInquiryDaily, NoteInquiryHistory } from '@/apis/fund/noteApi'
import { currencyFilter } from '@/config/filters'
import dayjs from 'dayjs'
import { daily, history } from './ListFCNConfig.js'
import { i18n } from '@/i18n/fund'
import { throttle } from 'lodash'
import tableStickyHeader from './components/tableStickyHeader.vue'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import { InquiryItemMap } from './common'

const dateFormat = v => {
    return v ? dayjs(v).format('YYYY/MM/DD') : '--'
}
const timeFormat = v => {
    return v ? dayjs(v).format('HH:mm:ss') : '--'
}
const dateTimeFormat = v => {
    return v ? dayjs(v).format('YY/MM/DD HH:mm') : '--'
}

const iconMap = {
    300: {
        icon: 'icon-success',
        msg: i18n.t('fcn.replied'),
    },
    400: {
        icon: 'icon-success',
        msg: i18n.t('fcn.replied'),
    },
    500: {
        icon: 'icon-expired2',
        msg: i18n.t('fcn.expired'),
    },
}

export default {
    name: '',
    mixins: [watchPageVisibleMixin],
    components: { Table, tableStickyHeader },
    props: {},
    data() {
        return {
            bodyScrollLeft: 0,
            showFixedTitle: false,
            iconMap,
            bestItem: undefined,
            isLoadingMore: false,
            isLoading: false,
            canLoadingMore: {
                0: true,
                1: true,
            },
            listDaily: [],
            listHistory: [],
            activeTabID: 0,
            table: null,
            loadMoreHandler: throttle(this.triggerLoadMore, 1000, { leading: false }),
            sort: {
                0: {
                    type: 'desc', // 排序方式
                    key: 'coupon', // 排序字段
                },
                1: {
                    type: 'desc', // 排序方式
                    key: 'inquiryTime', // 排序字段
                },
            },
            tabs: [
                { id: 0, lable: this.$t('fcn.FCNBills') },
                { id: 1, lable: this.$t('fcn.InquiryHistory') },
            ],
        }
    },
    computed: {
        slotScollColumnKeys() {
            return this.originColumns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
        showList() {
            return this.activeTabID === 0 ? this.listDaily : this.listHistory
        },
        originColumns() {
            return this.activeTabID === 0 ? daily : history
        },
        fullScreenCount() {
            return this.activeTabID === 0 ? 6 : 7
        },
    },
    watch: {
        bodyScrollLeft(v) {
            if (this.$refs.fexedTitle) {
                this.$refs.fexedTitle.updateScrollarea(v)
            }
        },
    },
    created() {
        this.requestCurrentList()
    },
    activated() {
        // 这个钩子函数会在动态组件被激活（显示）时被调用。与created生命周期钩子类似，但是它会在每次组件被展示时都被调用。
        // 滚动的高度
        const scrollTop = this.$refs.scrollarea?.scrollTop || 0
        if (this.activeTabID === 0) {
            this.showFixedTitle = scrollTop >= this.calcRem(144)
        } else {
            this.showFixedTitle = scrollTop >= this.calcRem(5)
        }
    },
    deactivated() {
        // 这个钩子函数会在动态组件失去焦点（隐藏）时被调用。与destroyed生命周期钩子类似，但是它会在每次组件被隐藏时都被调用。
    },
    mounted() {
        this.$refs.scrollarea?.addEventListener('scroll', this.listenScroll, true)
        this.watch(() => {
            this.requestCurrentList()
        })
    },
    beforeDestroy() {
        this.$refs.scrollarea?.removeEventListener('scroll', this.listenScroll, true)
    },
    destroyed() {},
    filters: { currencyFilter, dateFormat, timeFormat, dateTimeFormat },
    methods: {
        listenScroll(event) {
            // 滚动的高度
            const scrollTop = this.$refs.scrollarea.scrollTop
            // 视窗高度
            const clientHeight = (event.srcElement && event.srcElement.clientHeight) || document.body.clientHeight
            // 页面高度
            const scrollHeight = (event.srcElement && event.srcElement.scrollHeight) || document.body.scrollHeight
            // 距离页面底部的高度
            const height = scrollHeight - scrollTop - clientHeight
            if (this.activeTabID === 0) {
                this.showFixedTitle = scrollTop >= this.calcRem(144)
            } else {
                this.showFixedTitle = scrollTop >= this.calcRem(5)
            }
            this.$refs.fexedTitle?.updateScrollarea(this.bodyScrollLeft)
            this.$refs.fexedTitle?.setSortMap(this.sort[this.activeTabID].key, this.sort[this.activeTabID].type)

            if (height < -10 && this.canLoadingMore[this.activeTabID]) {
                debounce(this.loadMoreHandler(), 500)
            }
        },
        calcRem(v) {
            return calcRem(document, v)
        },
        tabChanged(id) {
            this.activeTabID = id
            if (this.activeTabID === 0) {
                this.requestNoteInquiryDaily()
            } else {
                this.requestNoteInquiryHistory()
            }
            this.$nextTick(() => {
                this.tableScrollTop()
                const key = this.sort[this.activeTabID].key
                const type = this.sort[this.activeTabID].type
                this.$refs.table && this.$refs.table.setSortMap(key, type)
                this.$refs.fexedTitle && this.$refs.fexedTitle.setSortMap(key, type)
            })
        },
        handlerSort(key, type) {
            if (type === 'none') {
                // 此处不能展示为 none 排序
                type = 'asc'
                this.$refs.table && this.$refs.table.setSortMap(key, type)
                this.$refs.fexedTitle && this.$refs.fexedTitle.setSortMap(key, type)
            }
            this.sort[this.activeTabID].key = key
            this.sort[this.activeTabID].type = type
            this.tableScrollTop()
            this.requestCurrentList()
        },
        onPullUpLoad() {},
        // 滚到顶部
        tableScrollTop() {
            if (this.showList.length > 0) {
                this.$refs.scrollarea.scrollTo(0, 0)
            }
        },
        listClickHander(item) {
            this.$goPage('/bill-enquiry-detail', { number: item.orderId })
        },
        addEnquiry() {
            this.$goPage('/bill-add-enquiry')
        },
        getObjectStockStr(item, sp = ' ') {
            return item.objectCodeList
                ?.map(obj => {
                    return `${obj.code}.${obj.mkt.toUpperCase()}`
                })
                .join(sp)
        },
        getFrequencyStr(item) {
            if (item.knockOutType <= 2) {
                return this.$t('fcn.perMonth', { month: item.observationFrequency })
            }
            return this.$t('fcn.everyday')
        },
        // 询价key
        getInquiryItemKey(item, key) {
            return {
                bool: InquiryItemMap.keysMap[item.inquiryItem] === key,
                value: item[key],
                hide: !item[key],
                hideObj: {
                    text: item.orderStatus === 400 ? this.$t('fcn.unableQuote') : '--',
                    color: item.orderStatus === 400 ? '#999' : '#2f2f2f',
                },
            }
        },
        async requestCurrentList(loadingMore) {
            if (this.activeTabID === 0) {
                await this.requestNoteInquiryDaily(loadingMore)
            } else {
                await this.requestNoteInquiryHistory(loadingMore)
            }
            this.isLoading = false
        },
        async requestNoteInquiryDaily(loadingMore) {
            const params = {
                start: 0,
                count: 99,
                field: this.sort[0].key,
                sort: this.sort[0].type === 'asc' ? -1 : 0,
            }
            if (loadingMore) {
                params.start = this.listDaily.length
            }
            try {
                const { result = {} } = (await NoteInquiryDaily(params)) ?? {}
                console.log(`yinlong NoteInquiryDaily result`, result)
                if (loadingMore) {
                    this.listDaily = this.listDaily.concat(result.list)
                } else {
                    this.listDaily = result.list
                }
                console.log(`yinlong NoteInquiryDaily result`, result.total, this.listDaily.length)
                this.canLoadingMore[0] = result.total > this.listDaily.length
                if (params.field === 'coupon' && params.sort === 0 && this.listDaily.length > 0) {
                    this.bestItem = this.listDaily[0]
                }
                this.$nextTick(() => {
                    if (this.$refs.table) {
                        this.table = this.$refs.table
                        this.$refs.table.setSortMap(this.sort[0].key, this.sort[0].type)
                        this.$refs.fexedTitle?.setSortMap(this.sort[0].key, this.sort[0].type)
                    }
                })
            } catch (error) {
                console.error(`NoteInquiryDaily`, error)
            }
        },
        async requestNoteInquiryHistory(loadingMore) {
            const params = {
                start: 0,
                count: 99,
                field: this.sort[1].key,
                sort: this.sort[1].type === 'asc' ? -1 : 0,
            }
            if (loadingMore) {
                params.start = this.listHistory.length
            }
            try {
                const { result = {} } = (await NoteInquiryHistory(params)) ?? {}
                console.log(`yinlong requestNoteInquiryHistory result`, result)
                if (loadingMore) {
                    this.listHistory = this.listHistory.concat(result.list)
                } else {
                    this.listHistory = result.list
                }
                this.canLoadingMore[1] = result.total > this.listHistory.length
                console.log(`yinlong NoteInquiryDaily result`, result.total, this.listHistory.length)
                this.$nextTick(() => {
                    if (this.$refs.table) {
                        this.table = this.$refs.table
                        this.$refs.table.setSortMap(this.sort[1].key, this.sort[1].type)
                        this.$refs.fexedTitle?.setSortMap(this.sort[1].key, this.sort[1].type)
                    }
                })
            } catch (error) {
                console.error(`NoteInquiryHistory`, error)
            }
        },
        // 上拉加载成功后关闭加载状态
        async triggerLoadMore() {
            if (this.isLoadingMore) return
            this.isLoadingMore = true
            await this.requestCurrentList(true)
            this.isLoadingMore = false
        },
    },
}
</script>

<style scoped lang="less">
/* stylelint-disable selector-class-pattern */
.list-fnc {
    position: relative;
    background-color: #f9f9f9;

    &::-webkit-scrollbar {
        display: none;
    }

    .tabs {
        position: fixed;
        z-index: 1;
        align-items: center; // 上下居中
        width: 100%;
        background-color: #fff;

        .tab {
            align-items: center; // 上下居中
            justify-content: center; // 左右居中
            height: 28px;
            margin-right: 8px;
            padding: 0 12px;
            color: @h2-white;
            font-weight: 400;
            font-size: 13px;
            line-height: 20px;
            background: #f7f7f7;
            border-radius: 14px;

            &.active-tab {
                color: @h1-white;
                font-weight: bold;
                background: #ff69071a;
            }
        }
    }

    .fnc-card-container {
        padding: 12px 0;
        background-color: #fff;

        .fnc-card {
            height: 112px;
            margin: 0 12px;
            padding: 16px 12px 12px;
            background: linear-gradient(0deg, #f9f9f9, #f9f9f9), linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
            border: 1px solid linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0) 100%);
            border-radius: 8px;

            .card-top {
                .coupon {
                    min-width: 62px;
                    margin-right: 28px;
                    font-weight: bold;
                    font-size: 17px;
                    line-height: 24px;
                }

                .currency {
                    margin-right: 8px;
                }

                .name {
                    flex: 1;
                    align-items: center;
                    color: @h1-white;
                    font-size: 14px;
                    line-height: 20px;
                }

                .product {
                    max-width: 200px;
                }
            }

            .card-desc {
                display: flex;
                align-items: center;
                margin-top: 4px;
                color: @h3-white;
                font-size: 12px;
                line-height: 16px;

                .line {
                    width: 1px;
                    height: 10px;
                    margin: 0 8px;
                    background: #b6b6b6;
                }
            }

            .card-bottom {
                align-items: flex-end;
                height: 24px;
                margin-top: 16px;
                color: @h3-white;
                font-size: 11px;
                line-height: 16px;

                .h2 {
                    color: @h2-white;
                }

                &.border-top-1px::after {
                    background-color: #ececec;
                }
            }
        }
    }

    .fnc-table {
        height: 100%;
        padding-top: 8px;
        padding-left: 12px;
        font-size: 14px;
        line-height: 20px;
        background-color: #fff;
    }

    .refresh-content {
        // 下面两属性修复，下拉刷新组件在 iOS 上出现上拉卡顿的问题
        min-height: calc(100vh - 124px - 85px);
        overflow: hidden;
    }

    ::v-deep .fnc-table.box {
        .scrollElement {
            padding-top: 20px;
        }

        .title {
            background: #fff;
        }
        @fixedW: 170px;

        .fixed {
            width: @fixedW !important;

            .fix-title {
                position: absolute;
                top: 4px;
                width: 100%;
                height: 24px;
                padding-top: 4px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;

                .product-type {
                    flex-shrink: 0;
                    width: 62px;
                    margin-right: 10px;
                }

                .obj-title {
                    width: 88px;
                    margin-right: 10px;
                }
            }

            .fix-content {
                display: flex;
                align-items: center;
                color: @h1-white;
                font-size: 14px;
                line-height: 20px;

                .fix-name {
                    flex-shrink: 0;
                    width: 62px;
                    margin-right: 10px;
                }

                .fix-name-info {
                    color: @h3-white;
                    font-weight: bold;
                    font-size: 12px;
                    line-height: 16px;

                    img {
                        width: 12px;
                        height: 12px;
                        margin-right: 3px;
                    }
                }

                .obj-value {
                    width: 96px;
                }
            }

            .item {
                height: 48px;
            }
        }

        .scroll {
            .scroll-title-container {
                top: 4px;
                left: calc(@fixedW + 10px) !important;
                z-index: 0;
                height: 24px;
                padding-top: 4px;

                .title {
                    padding-bottom: 0;
                    font-weight: 400;
                    font-size: 12px;
                }
            }

            .item {
                height: 48px;
            }

            .inquiryTime {
                font-weight: 400;
                text-align: right;

                .date {
                    color: @h1-white;
                    font-size: 14px;
                    line-height: 20px;
                }

                .time {
                    color: @h3-white;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }
    }

    ::v-deep .history-table.box {
        .fixed {
            .item {
                height: 60px;
            }
        }

        .scroll {
            .item {
                height: 60px;
            }
        }
    }

    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;
        background-color: #fff;

        img {
            width: 104px;
            height: 104px;
            margin-top: 44px;
            margin-bottom: 12px;
        }

        h4 {
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }

    .bottom-tips {
        width: 100%;
        height: 30px;
        padding-top: 12px;
        color: @h3-white;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
        background-color: #f9f9f9;
    }

    .fixed-footer {
        position: fixed;
        bottom: 0;
        left: 0;
        display: flex;
        justify-content: center;
        width: 100%;
        background: #fff;
        #iosBottom(8px);

        .abs-tips {
            position: absolute;
            top: -30px;
            color: @h3-white;
            font-size: 12px;
            line-height: 18px;
        }

        .add {
            width: 100%;
            height: 44px;
            margin: 8px 28px 4px;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background-color: #ff6907;
            border-radius: 22px;
        }
    }
}

.bgfff {
    background-color: #fff;
}
</style>
