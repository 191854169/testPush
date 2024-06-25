<template>
    <!-- 实盘交易记录-搜索 -->
    <div class="order-record-search">
        <!-- 外部展示的搜索框 -->
        <van-search class="out-search" v-model="value" :clearable="false" :placeholder="placeholder" @focus="focusHandler">
            <template v-slot:left-icon>
                <multi-img width="20" height="20" name="icon-bill-search" directory="fund"></multi-img>
            </template>
        </van-search>
        <!-- 弹出展示的搜索页 -->
        <van-popup v-model="show" position="right" class="search-popup">
            <!-- 搜索框 -->
            <van-search
                class="inner-search"
                ref="serachInput"
                show-action
                v-model="value"
                @input="inputAction"
                @cancel="cancelHandler"
                :placeholder="placeholder"
            >
                <template v-slot:left-icon>
                    <multi-img width="20" height="20" name="icon-bill-search" directory="fund"></multi-img>
                </template>
            </van-search>
            <!-- 内容 -->
            <div class="popup-content">
                <!-- 列表内容 -->
                <div class="list-content" v-show="orderRecordList.length > 0">
                    <!-- <p v-if="!isSearch" class="history-title">{{ $t('followList.historyRecord') }}</p> -->
                    <!-- 列表表头 -->
                    <div class="order-record-title" v-if="isSearch">
                        <div class="order-record-title__status">{{ $t('follow.directionStatus') }}</div>
                        <div class="order-record-title__name">{{ $t('follow.combinationName') }}</div>
                        <div class="order-record-title__amount">{{ $t('follow.amount') }}</div>
                    </div>
                    <div class="history-title" v-else>{{ $t('follow.searchHistory') }}</div>
                    <div class="order-record-list">
                        <div class="order-record-list__item" v-for="item in orderRecordList" :key="item.id" @click="clickHander(item)">
                            <!-- 关键字搜索内容 -->
                            <div class="flex1" v-if="isSearch">
                                <div class="item-content">
                                    <div class="item-status">
                                        <div class="item-status__direction">{{ item.optType | optTypeFilter }}</div>
                                        <div class="item-status__type">
                                            <multi-img
                                                class="type_image"
                                                v-if="tradeStatusIconMap[item.tradeStatus]"
                                                :name="tradeStatusIconMap[item.tradeStatus]"
                                                directory="common/orderStatus"
                                            ></multi-img>
                                            <span class="type_text">{{ item.tradeStatus | tradeStatusTextFilter(item) }}</span>
                                        </div>
                                    </div>
                                    <div class="item-name line-elipsis" v-html="colorName(item.portfolioName)"></div>
                                    <div class="item-amount">
                                        <div class="row" v-for="(aItem, index) in item.estimateBuyInfo" :key="index">
                                            <dynamic-font
                                                class="amount line-elipsis"
                                                :value="formatAmountWithCurrency(aItem.amount, aItem.currency)"
                                                :options="{ maxFontSize: 14, minFontSize: 12 }"
                                            ></dynamic-font>
                                        </div>
                                    </div>
                                </div>
                                <div class="divider"></div>
                            </div>
                            <!-- 历史搜索内容 -->
                            <div class="flex1" v-else>
                                <div class="item-history">
                                    <div class="item-name">{{ item.portfolioName }}</div>
                                </div>
                                <div class="divider"></div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!isSearch" class="history-clear-box" @click="historyClear">
                        <div class="history-clear">
                            <svg-icon iconClass="icon_search_dell" className="claer-img"></svg-icon>
                            <span class="clear-text">{{ $t('fundList.clearRecord') }}</span>
                        </div>
                    </div>
                </div>
                <!-- 空视图 -->
                <div class="list-empty" v-show="isEmpty">
                    <multi-img class="empty-image" :name="isSearch ? 'empty-search' : 'noData'" :directory="isSearch ? 'fund' : 'common'"></multi-img>
                    <span class="empty-label">{{ isSearch ? $t('fundList.noSearchResult') : $t('fundList.noRecord') }}</span>
                </div>
            </div>
        </van-popup>
    </div>
</template>
<script>
import DynamicFont from '@/components/FosunDynamicFont.vue'
import { getPortfolioOrders } from '@/apis/followInvest/index.js'
import { Popup, Search } from 'vant'
import { throttle } from 'lodash'
import { isHLApp } from '@/utils/tools'
import { FOLLOW_TRADE_STATUS_MAP } from '@/views/fund/config/common'
import { i18n } from '@/i18n/fund'

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
    name: 'order-recordSearch',
    components: {
        [Popup.name]: Popup,
        [Search.name]: Search,
        [DynamicFont.name]: DynamicFont,
    },
    filters: {
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
    },
    data() {
        return {
            version: 0, // 自选查询参数version,初始查询0，之后update必须取的最新version
            placeholder: this.$t('follow.followSearchHint'),
            STORAGEKEY: 'order-record-search-history', // 本地缓存字段名
            value: '',
            show: false,
            inputAction: throttle(this.searchHandler, 300, { leading: false, trailing: true }),
            historyList: [], // 历史记录
            searchList: [], // 搜索结果
            tradeStatusIconMap,
        }
    },
    computed: {
        // 搜索中
        isSearch() {
            return this.value.length > 0
        },
        orderRecordList() {
            if (this.isSearch) {
                return this.searchList
            }
            return this.historyList
        },
        isEmpty() {
            return !this.orderRecordList.length > 0
        },
        isApp() {
            return isHLApp() && !!this.$jsBridge
        },
    },
    watch: {
        show(v) {
            if (!v) return
            this.$sensorsTrack('ordeRecordSearchPageView', {
                forward_page: window.location.href,
            })
        },
    },
    created() {
        // 本地缓存读取历史记录
        const list = JSON.parse(localStorage.getItem(this.STORAGEKEY)) || ''
        // 最多展示十条最近记录
        list.length > 0 && (this.historyList = list.slice(0, 10))
    },
    methods: {
        // 搜索基金
        async searchHandler() {
            try {
                if (!this.value) return
                const res = await getPortfolioOrders({
                    name: this.value,
                    start: 0,
                    count: 50,
                })
                const resultList = res?.result?.records || []
                this.searchList = resultList
                // 搜索结果埋点
                this.$sensorsTrack('orderRecordSearchKeywordResult', {
                    search_keyword: this.value,
                    search_result_num: this.searchList.length,
                })
            } catch (e) {
                console.log('getOrderRecord:===>e', e)
            }
        },
        focusHandler() {
            this.show = true
            this.$nextTick(() => {
                const serachInput = this.$refs['serachInput']
                const input = serachInput.querySelector('input')
                input && input.focus()
            })
        },
        cancelHandler() {
            this.show = false
            this.value = ''
        },
        historyClear() {
            this.historyList = []
            // 清空本地缓存
            localStorage.removeItem(this.STORAGEKEY)
        },
        // 选择基金
        selectedOrderRecord(item) {
            if (!this.isSearch) return
            const intance = this.historyList.find(i => {
                return `${i.id}` === `${item.id}`
            })
            if (intance) {
                // 存在 提前
                const index = this.historyList.indexOf(intance)
                this.historyList.splice(index, 1)
            }
            this.historyList.unshift(item)
            if (this.historyList.length > 10) {
                this.historyList = this.historyList.slice(0, 10)
            }

            localStorage.setItem(this.STORAGEKEY, JSON.stringify(this.historyList))
        },
        // 检查自选
        // async checkFavstock(symbol) {
        //     if (!this.isApp) return
        //     try {
        //         let data = await this.$jsBridge.checkFavstock(symbol)
        //         return data.isFavStock
        //     } catch (e) {
        //         console.log('jsBridge.checkFavstock=>e:', e)
        //         return false
        //     }
        // },
        // 添加\删除 自选
        // async selfHandler(item) {
        //     if (!this.isSearch) return
        //     let symbol = `${item.mkt}${item.rawSymbol}`
        //     try {
        //         let isFavStock = await this.checkFavstock(symbol)
        //         if (isFavStock) {
        //             await this.$jsBridge.removeFavstock(symbol)
        //             item.isSelf = false
        //         } else {
        //             await this.$jsBridge.addFavstock(symbol)
        //             item.isSelf = true
        //         }
        //     } catch (e) {
        //         console.log('selfHandler=>e:', e)
        //     }
        // },
        // 搜索文字
        colorName(name) {
            const upperName = name ? name.toLocaleUpperCase() : ''
            if (this.isSearch && upperName && upperName.includes(this.value.toLocaleUpperCase())) {
                const startIndex = upperName.indexOf(this.value.toLocaleUpperCase())
                const endIndex = startIndex + this.value.length
                const fragment = name.slice(startIndex, endIndex)
                const list = name.split(fragment)
                const result = list.join(`<span style="color: #FF6907;">${fragment}</span>`)
                return result
            }
            return `<span>${name}</span>`
        },
        clickHander(item) {
            // 加入缓存
            this.selectedOrderRecord(item)
            const id = item.id
            // 点击跳转埋点
            this.$sensorsTrack('orderRecordSearchResultClick', {
                keyword_type: this.isSearch ? '自定义搜索词' : '历史搜索词',
                id: id,
                product_portfolioId: item.portfolioId,
                product_portfolioName: item.portfolioName,
                search_result_num: this.isSearch ? this.searchList.length : undefined,
            })

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
        formatAmountWithCurrency(amount, currency) {
            const formattedAmount = this.$options.filters.amountFilter(amount)
            return `${formattedAmount} ${currency}`
        },
    },
}
</script>
<style scoped lang="less">
.order-record-search {
    width: 100%;

    ::v-deep(.van-overlay) {
        background-color: transparent;
    }
}

.out-search {
    padding: 6px 12px !important;
    background-color: #fff;
}

.inner-search-container {
    padding-top: 6px;
    padding-right: 12px;
    padding-bottom: 6px;
    padding-left: 12px;
}

.inner-search {
    position: sticky;
    top: 0;
    z-index: 999;
    padding: 6px 12px !important;
    background-color: #fff;
}
</style>
<style lang="less" scoped>
/deep/ .van-search {
    padding: 0;

    .van-cell {
        padding: 4px 0;
        line-height: 20px;
    }

    .van-cell__value {
        display: flex;
    }

    i.van-icon-search::before {
        content: '';
    }

    .van-field__body {
        width: 100%;
    }

    .van-field__left-icon {
        display: flex;
        align-items: center;
        margin-right: 12px;
        margin-left: 16px;
    }

    .van-search__content {
        height: 32px;
        padding: 0;
        background: #f8f8f8;
        border-radius: 16px;

        .van-field {
            input {
                color: #2f2f2f;
                border-radius: 0;

                &::placeholder {
                    color: #9c9c9c;
                    font-size: 15px;
                    line-height: 21px;
                }
            }
        }
    }

    .van-icon-clear {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0;
    }

    .van-search__action {
        padding: 0 0 0 16px;
        color: #2f2f2f;
        font-size: 16px;
        line-height: 22px;
    }

    .van-field__control {
        color: #2f2f2f;
        font-size: 15px;
        line-height: 21px;
    }
}
</style>
<style lang="less" scoped>
.search-popup {
    width: 100%;
    height: 100%;

    .popup-content {
        .divider {
            width: calc(100% - 12px);
            height: 0;
            margin-left: 12px;
            border-bottom: 0.5px solid #efefef; /* 分割线颜色 */
        }

        .list-content {
            padding: 8px 0;

            .history-title {
                display: flex;
                align-items: center;
                width: 85px;
                height: 44px;
                padding-left: 12px;
                color: #000;
                font-weight: bold;
                font-size: 14px;
                line-height: 20px;
            }

            .order-record-title {
                display: flex;
                flex: 1;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 24px;
                padding-right: 12px;
                padding-left: 12px;

                .order-record-title__status {
                    width: 76px;
                    height: 16px;
                    color: #9c9c9c;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 16px;
                }

                .order-record-title__amount {
                    width: 110px;
                    height: 16px;
                    color: #9c9c9c;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: end;
                }

                .order-record-title__name {
                    flex: 1;
                    height: 16px;
                    color: #9c9c9c;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .order-record-list {
                display: flex;
                flex-direction: column;

                .order-record-list__item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .item-content {
                        display: flex;
                        flex: 1;
                        align-items: center;
                        width: 100%;
                        height: 64px;
                        padding-left: 12px;

                        .item-status {
                            display: flex;
                            flex-direction: column;
                            width: 76px;

                            .item-status__direction {
                                height: 20px;
                                color: #2f2f2f;
                                font-weight: normal;
                                font-size: 14px;
                                line-height: 20px;
                                white-space: nowrap;
                                text-align: start;
                                text-overflow: ellipsis;
                            }

                            .item-status__type {
                                display: flex;
                                align-items: center;
                                height: 16px;
                                margin-top: 2px;

                                .type_image {
                                    width: 12px;
                                    height: 12px;
                                }

                                .type_text {
                                    height: 16px;
                                    margin-left: 2px;
                                    color: #9c9c9c;
                                    font-weight: bold;
                                    font-size: 12px;
                                    line-height: 16px;
                                    white-space: nowrap;
                                    text-align: start;
                                    text-overflow: ellipsis;
                                }
                            }
                        }

                        .item-name {
                            flex: 1;
                            height: 21px;
                            color: #2f2f2f;
                            font-weight: normal;
                            font-size: 15px;
                            line-height: 21px;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }

                        .item-amount {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding-right: 12px;

                            .row {
                                display: flex;
                                align-items: center;
                                height: 20px;

                                .amount {
                                    height: 20px;
                                    color: #2f2f2f;
                                    font-weight: normal;
                                    font-size: 14px;
                                    line-height: 20px;
                                    white-space: nowrap;
                                }
                            }
                        }
                    }

                    .item-history {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 52px;

                        .item-name {
                            flex: 1;
                            height: 22px;
                            margin-right: 12px;
                            margin-left: 12px;
                            color: #2f2f2f;
                            font-weight: normal;
                            font-size: 16px;
                            line-height: 22px;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }
                    }
                }
            }

            .history-clear-box {
                display: flex;
                align-items: center;
                justify-content: center;
                padding-top: 16px;

                .history-clear {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 28px;
                    padding-right: 16px;
                    padding-left: 16px;
                    background: #f2f2f2;
                    border-radius: 31px;

                    .claer-img {
                        width: 12px;
                        height: 12px;
                    }

                    .clear-text {
                        padding-left: 4px;
                        color: #1f1f1f;
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 20px;
                        text-align: center;
                    }
                }
            }
        }

        .list-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 144px;

            img.empty-image {
                width: 104px;
                height: 104px;
            }

            .empty-label {
                height: 20px;
                padding: 12px 0;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
            }
        }
    }
}
</style>
