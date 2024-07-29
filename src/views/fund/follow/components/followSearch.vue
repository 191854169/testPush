<template>
    <!-- 发现投资组合-搜索 -->
    <div class="follow-search">
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
                <div class="list-content" v-if="!isEmpty">
                    <!-- <p v-if="!isSearch" class="history-title">{{ $t('followList.historyRecord') }}</p> -->
                    <!-- 列表表头 -->
                    <div class="follow-title" v-if="isSearch">
                        <div class="follow-title__name">{{ $t('follow.combinationName') }}</div>
                        <div class="follow-title__space"></div>
                        <div class="follow-title__day1Return">{{ $t('follow.dayRise') }}</div>
                        <div class="follow-title__week1Return">{{ $t('jinyizhou') }}</div>
                    </div>
                    <div class="history-title" v-else>{{ $t('follow.searchHistory') }}</div>
                    <div class="follow-list">
                        <div class="follow-list__item" v-for="item in followList" :key="item.portfolioId" @click="clickHander(item)">
                            <!-- 关键字搜索内容 -->
                            <div class="flex1" v-if="isSearch">
                                <div class="item-desc">
                                    <div class="item-first">
                                        <div class="item-portfolioname line-elipsis" v-html="colorName(item.portfolioName)"></div>
                                        <div class="item-username line-elipsis">{{ item.creatorNick }}</div>
                                    </div>
                                    <div class="item-info">
                                        <div class="item-info__pct" v-riseFall="{ value: item.day1Return }"></div>
                                        <div class="item-info__pct" v-riseFall="{ value: item.week1Return }"></div>
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
                <div class="list-empty" v-else>
                    <multi-img class="empty-image" :name="isSearch ? 'empty-search' : 'noData'" :directory="isSearch ? 'fund' : 'common'"></multi-img>
                    <span class="empty-label">{{ isSearch ? $t('fundList.noSearchResult') : $t('fundList.noRecord') }}</span>
                </div>
            </div>
        </van-popup>
    </div>
</template>
<script>
import { PortfolioList } from '@/apis/followInvest/index.js'
import { Popup, Search } from 'vant'
import { throttle } from 'lodash'
import { isTenantApp } from '@/utils/tools'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'

export default {
    name: 'followSearch',
    components: {
        [Popup.name]: Popup,
        [Search.name]: Search,
    },
    mixins: [gotoFollowDetailsMixin],
    filters: {
        // fundTypeFilter(key) {
        //     return FUND_TYPE_ENUM[key] || ''
        // },
        // ytdTypeFilter(key) {
        //     return YTD_TYPE_ENUM[key] || ''
        // },
    },
    data() {
        return {
            version: 0, // 自选查询参数version,初始查询0，之后update必须取的最新version
            placeholder: this.$t('follow.followSearchHint'),
            STORAGEKEY: 'follow-search-history', // 本地缓存字段名
            value: '',
            show: false,
            inputAction: throttle(this.searchHandler, 300, { leading: false, trailing: true }),
            historyList: [], // 历史记录
            searchList: [], // 搜索结果
            field: 'd1',
            order: 'desc',
        }
    },
    computed: {
        // 搜索中
        isSearch() {
            return this.value.length > 0
        },
        followList() {
            if (this.isSearch) {
                return this.searchList
            }
            return this.historyList
        },
        isEmpty() {
            return !this.followList.length > 0
        },
        isApp() {
            return isTenantApp() && !!this.$jsBridge
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
                const res = await PortfolioList({
                    name: this.value,
                    start: 0,
                    count: 50,
                    field: this.field,
                    order: this.order,
                })
                const resultList = res?.result?.records || []
                this.searchList = resultList
                console.log('searchHandler', `${JSON.stringify(this.searchList)}`)
            } catch (e) {
                console.log('getfollow:===>e', e)
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
        selectedFollow(item) {
            if (!this.isSearch) return
            const intance = this.historyList.find(i => {
                return `${i.portfolioId}` === `${item.portfolioId}`
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
            this.selectedFollow(item)
            const portfolioId = item.portfolioId

            this.gotoFollowDetail(portfolioId)
        },
    },
}
</script>
<style scoped lang="less">
::v-deep(.van-overlay) {
    background-color: transparent;
}

.follow-search {
    width: 100%;
}

.out-search {
    padding: 6px 12px !important;
    background-color: #fff;
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

            .follow-title {
                display: flex;
                flex: 1;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 24px;
                padding-right: 12px;
                padding-left: 12px;

                .follow-title__name {
                    width: 156px;
                    height: 16px;
                    color: #9c9c9c;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 16px;
                }

                .follow-title__day1Return {
                    width: 70px;
                    height: 16px;
                    color: #9c9c9c;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: end;
                }

                .follow-title__week1Return {
                    width: 70px;
                    height: 16px;
                    color: #9c9c9c;
                    font-weight: normal;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: end;
                }

                .follow-title__space {
                    flex: 1;
                }
            }

            .follow-list {
                display: flex;
                flex-direction: column;

                .follow-list__item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .item-desc {
                        display: flex;
                        flex: 1;
                        align-items: center;
                        width: 100%;
                        height: 56px;
                        padding-left: 12px;

                        .item-first {
                            max-width: 156px;
                            overflow: hidden;

                            .item-portfolioname {
                                height: 20px;
                                overflow: hidden;
                                color: #1f1f1f;
                                font-weight: bold;
                                font-size: 14px;
                                line-height: 20px;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                            }

                            .item-username {
                                height: 14px;
                                margin-top: 4px;
                                overflow: hidden;
                                color: #9c9c9c;
                                font-weight: normal;
                                font-size: 12px;
                                line-height: 14px;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                            }
                        }

                        .item-info {
                            display: flex;
                            flex: 1;
                            align-items: center;
                            justify-content: flex-end;
                            padding-right: 12px;

                            .item-info__pct {
                                width: 70px;
                                font-weight: bold;
                                font-size: 14px;
                                line-height: 20px;
                                text-align: end;
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
