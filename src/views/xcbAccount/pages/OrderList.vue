// 认购记录
<template>
    <div class="order-list" :class="{ 'w-bg full-height': isEmptyList }">
        <van-pull-refresh
            class="refresh-content"
            v-model="isLoading"
            @refresh="onRefresh"
            :pulling-text="$t('pullRefresh')"
            :loosing-text="$t('relessRefresh')"
            :loading-text="`${$t('loading')}...`"
        >
            <div>
                <van-sticky class="outter-sticky">
                    <div class="filter-bg" :class="{ 'w-bg': isEmptyList }">
                        <div class="filter_btn" :class="{ highlight: hasFilterStatus, 'w-bg': isEmptyList }" @click="showFilterSheet = true">
                            {{ $t('orderList.filter') }}
                            <span class="fsfont" :style="{ color: hasFilterStatus ? '#FF6907' : '#2F2F2F' }">&#xe612;</span>
                        </div>
                    </div>
                </van-sticky>
            </div>

            <template slot="loading">
                <div class="loading-text">
                    <multi-img class="loading-icon" width="20" height="20" name="icon-footer-loading" directory="fund" />
                    <span>{{ `${$t('loading')}...` }}</span>
                </div>
            </template>
            <div class="list">
                <div v-for="item in dataList" :key="item.orderNumber">
                    <OrderListItem class="item" :info="item"></OrderListItem>
                </div>
            </div>
            <!-- 无数据 -->
            <div class="noData" v-show="isEmptyList">
                <multi-img class="noDataImg" name="noData" directory="common" alt="noData"></multi-img>
                <span>{{ $t('noRecord') }}</span>
            </div>
        </van-pull-refresh>

        <van-action-sheet v-model="showFilterSheet" @open="filterSheetOpen">
            <div class="filter-sheet">
                <div class="title-area">
                    <multi-img name="icon-cancel" directory="common" @click="showFilterSheet = false" />
                    <span class="title">{{ $t('orderList.filter') }}</span>
                    <span class="confirm" @click="filterSheetConfirm">{{ $t('confirm') }}</span>
                </div>
                <div class="content">
                    <div class="status">{{ $t('orderList.status') }}</div>
                    <div class="flex-c mar-b12" v-for="(items, index) in orderStatus" :key="index">
                        <div
                            class="flex-c status-item"
                            :class="{
                                'center-item': index == 1,
                                'status-item-sel': tempFilterList.includes(item.key),
                            }"
                            v-for="(item, index) in items"
                            :key="item.key"
                            @click="selectedStatusItem(item)"
                        >
                            {{ item.label }}
                        </div>
                    </div>
                </div>
            </div>
        </van-action-sheet>
    </div>
</template>

<script>
import OrderListItem from '../components/OrderListItem.vue'
import { ORDER_STATUS_MAP } from '../config/common.js'
import { Sticky, ActionSheet, PullRefresh } from 'vant'
import { cloneDeep, isEmpty } from 'lodash'
import { ssaOrderList } from '@/apis/xjb'
import { throttle, debounce } from 'lodash'

const StatusAllKey = 0
const StatusOptions = ORDER_STATUS_MAP.options

export default {
    name: 'order-list',
    mixins: [],
    components: {
        OrderListItem,
        [Sticky.name]: Sticky,
        [ActionSheet.name]: ActionSheet,
        [PullRefresh.name]: PullRefresh,
    },
    props: {},
    data() {
        return {
            isEmptyList: false,
            showFilterSheet: false,
            filterList: [],
            tempFilterList: [],
            orderStatus: [StatusOptions.slice(0, 3), StatusOptions.slice(3, 6), StatusOptions.slice(6)],
            loadMoreHandler: throttle(this.triggerLoadMore, 1000, { leading: false }),
            isLoadingMore: false,
            canLoadingMore: true,
            isLoading: false,
            dataList: [],
        }
    },
    computed: {
        initStatus() {
            return this.$route.query.status || '0'
        },
        hasFilterStatus() {
            return this.filterList > 1 || this.filterList[0] !== StatusAllKey
        },
    },
    watch: {},
    created() {
        this.filterList = this.initStatus.split(',').map(v => {
            return Number(v)
        })
        this.getOrderList()
    },
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        async getOrderList() {
            const params = {
                start: 0,
                count: 50,
            }
            const list = cloneDeep(this.filterList)
            list.remove(0)
            if (list.length > 0) {
                params.orderStatus = this.filterList
            }
            this.$loading.show = true
            ssaOrderList(params)
                .then(({ result }) => {
                    console.log(`yinlong getOrderList`, params, result)
                    this.dataList = result.list
                    this.canLoadingMore = result.total > this.dataList.length
                    this.$loading.show = false
                    this.isEmptyList = this.dataList.length == 0
                })
                .catch(({ error }) => {
                    console.error(`getOrderList`, params, error)
                    this.$loading.show = false
                    this.isEmptyList = this.dataList.length == 0
                })
                .finally(() => {
                    this.isLoading = false
                })
        },
        // 上拉加载成功后关闭加载状态
        async triggerLoadMore() {
            if (this.isLoadingMore) return
            this.isLoadingMore = true
            try {
                const { result } = (await ssaOrderList({ count: 50, orderStatus: this.filterList, start: this.dataList.length })) || {}
                this.dataList = this.dataList.concat(result.list)
                this.canLoadingMore = result.total > this.dataList.length
                console.log('yinlong triggerLoadMore', result)
                this.isLoadingMore = false
            } catch (error) {
                console.error('yinlong triggerLoadMore', error)
                this.isLoadingMore = false
            }
        },
        listenScroll(event) {
            // 滚动的高度
            const scrollTop =
                (event.srcElement ? event.srcElement.scrollTop : false) ||
                window.pageYOffset ||
                (event.srcElement?.body ? event.srcElement.body.scrollTop : 0)
            // 视窗高度
            const clientHeight = (event.srcElement && event.srcElement.clientHeight) || document.body.clientHeight
            // 页面高度
            const scrollHeight = (event.srcElement && event.srcElement.scrollHeight) || document.body.scrollHeight
            // 距离页面底部的高度
            const height = scrollHeight - scrollTop - clientHeight

            if (height < -10 && this.canLoadingMore) {
                debounce(this.loadMoreHandler(), 500)
            }
        },
        filterSheetOpen() {
            this.tempFilterList = cloneDeep(this.filterList)
        },
        filterSheetConfirm() {
            this.showFilterSheet = false
            this.filterList = cloneDeep(this.tempFilterList)
            this.getOrderList()
        },
        selectedStatusItem(item) {
            if (item.key === StatusAllKey) {
                this.tempFilterList = [StatusAllKey]
            } else {
                this.tempFilterList.remove(StatusAllKey)
                if (this.tempFilterList.includes(item.key)) {
                    this.tempFilterList.remove(item.key)
                } else {
                    this.tempFilterList.push(item.key)
                }
            }
            if (isEmpty(this.tempFilterList)) {
                this.tempFilterList = [StatusAllKey]
            }
        },
        onRefresh() {
            this.isLoading = true
            this.getOrderList()
        },
    },
}
</script>

<style scoped lang="less">
.order-list {
    padding-bottom: 34px;
    background-color: #f9f9f9;

    .filter-bg {
        display: flex;
        justify-content: flex-end;
        width: 100%;
        height: 32px;
        background-color: #f9f9f9;
    }

    .filter_btn {
        align-items: center;
        height: 32px;
        padding: 0 12px;
        color: @h1-white;
        font-size: 14px;
        line-height: 32px;

        & > span {
            font-size: 14px;
        }
    }

    .highlight {
        color: #ff6907;
    }

    .refresh-content {
        // 下面两属性修复，下拉刷新组件在 iOS 上出现上拉卡顿的问题
        min-height: 100vh;
        overflow: hidden;

        /deep/ .loading-text {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            min-height: 20px;

            .loading-icon {
                margin-right: 12px;
                animation: circle 1.5s infinite linear;
            }

            span {
                display: inline-block;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        @keyframes circle {
            0% {
                transform: rotate(0deg);
            }

            25% {
                transform: rotate(90deg);
            }

            50% {
                transform: rotate(180deg);
            }

            75% {
                transform: rotate(270deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        .list {
            padding: 0 12px;

            .item {
                margin-bottom: 12px;
            }
        }

        .noData {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 112px 0 10px;
            color: @h3-white;

            .noDataImg {
                width: 104px;
                height: 104px;
                margin-bottom: 12px;
            }
        }
    }
}

.filter-sheet {
    height: 329px;
    background: #fff;

    .title-area {
        display: flex;
        align-items: center;
        height: 44px;
        padding: 0 16px;

        img {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
        }

        .title {
            width: 100%;
            color: @h1-white;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
        }

        .confirm {
            flex-shrink: 0;
            color: @theme-white;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .content {
        margin-top: 20px;
        padding: 0 16px;

        .status {
            margin-bottom: 8px;
            color: @h1-white;
            font-size: 14px;
            line-height: 20px;
        }

        .status-item {
            justify-content: center;
            width: 106px;
            height: 36px;
            color: @h1-white;
            background-color: #f9f9f9;
            border-radius: 29px;
        }

        .center-item {
            margin-right: 12px;
            margin-left: 12px;
        }

        .status-item-sel {
            color: @theme-white;
            background: #ff630712;
        }
    }
}

.w-bg {
    background-color: #fff !important;
}

.full-height {
    height: 100vh;
}
</style>
