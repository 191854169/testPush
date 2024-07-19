<template>
    <div class="bill-search">
        <van-search class="out-search" v-model="value" :clearable="false" :placeholder="placeholder" @focus="focusHandler">
            <template v-slot:left-icon>
                <multi-img width="20" height="20" name="icon-bill-search" directory="fund"></multi-img>
            </template>
        </van-search>
        <van-popup v-model="show" position="right" class="search-popup">
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
            <div class="popup-content">
                <div class="list-content" v-show="fundList.length > 0">
                    <p v-if="!isSearch" class="history-title">{{ $t('fundSelectionByStock.searchHistory') }}</p>
                    <div class="bill-list">
                        <div class="bill-list__item" v-for="(item, index) in fundList" :key="item.symbol + index" @click="clickHander(item)">
                            <div class="item-desc border-bottom-1px">
                                <div class="item-name line-elipsis" :class="{ 'item-name__history': !isSearch }" v-html="colorName(item.name)"></div>
                                <div class="item-info">
                                    <div class="item-info__currency">FCN</div>
                                    <span class="item-info__symbol" v-html="colorName(item.ISIN)"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!isSearch" class="history-clear" @click="historyClear">{{ $t('fundList.clearRecord') }}</div>
                </div>
                <div class="list-empty" v-show="isEmpty">
                    <multi-img class="empty-image" :name="isSearch ? 'empty-search' : 'noData'" :directory="isSearch ? 'fund' : 'common'"></multi-img>
                    <span class="empty-label">{{ isSearch ? $t('fundList.noSearchResult') : $t('fundList.noRecord') }}</span>
                </div>
            </div>
        </van-popup>
    </div>
</template>
<script>
import { getBill } from '@/apis/fund/note'
import { floatToRatio, isUndefined, isNull } from '@/utils'
import { Popup, Search } from 'vant'
import { throttle } from 'lodash'
import { isTenantApp } from '@/utils/tools'

export default {
    name: 'fundSearch',
    components: {
        [Popup.name]: Popup,
        [Search.name]: Search,
    },
    filters: {
        floatToRatio,
    },
    data() {
        return {
            version: 0, // 自选查询参数version,初始查询0，之后update必须取的最新version
            placeholder: this.$t('bills.pleaseInput'),
            STORAGEKEY: 'bills-search-history', // 本地缓存字段名
            value: '',
            show: false,
            inputAction: throttle(this.searchHandler, 300, { leading: false, trailing: true }),
            historyList: [], // 历史记录
            searchList: [], // 搜索结果
        }
    },
    computed: {
        // 搜索中
        isSearch() {
            return this.value.length > 0
        },
        fundList() {
            if (this.isSearch) {
                return this.searchList
            }
            return this.historyList
        },
        isEmpty() {
            return !this.fundList.length > 0
        },
        isApp() {
            return isTenantApp() && !!this.$jsBridge
        },
    },
    watch: {
        show(v) {
            if (!v) return
            this.$sensorsTrack('BillSearchPageView', {
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
                const res = await getBill({
                    q: this.value,
                })
                console.log('BillSearch', res.result)
                const resultList = res.result.list || []
                this.searchList = resultList
                // 搜索结果埋点
                this.$sensorsTrack('BillSearchKeywordResult', {
                    search_keyword: this.value,
                    search_result_num: this.searchList.length,
                })
            } catch (e) {
                console.log('getBill:===>e', e)
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
        selectedBill(item) {
            if (!this.isSearch) return
            const intance = this.historyList.find(i => {
                return `${i.symbol}` === `${item.symbol}`
            })
            if (intance) {
                // 存在 提前
                const index = this.historyList.indexOf(intance)
                this.historyList.splice(index, 1)
            }
            this.historyList.unshift(item)
            localStorage.setItem(this.STORAGEKEY, JSON.stringify(this.historyList.slice(0, 10)))
        },

        // 搜索文字
        colorName(name) {
            if (isUndefined(name) || isNull(name)) {
                return `<span>${''}</span>`
            }
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
            this.selectedBill(item)
            const symbol = item.symbol
            // 点击跳转埋点
            this.$sensorsTrack('BillSearchResultClick', {
                keyword_type: this.isSearch ? '自定义搜索词' : '历史搜索词',
                product_code: item.symbol,
                product_name: item.name,
                search_result_num: this.isSearch ? this.searchList.length : undefined,
            })

            this.$goPage('/bills/detail', {
                symbol: symbol,
            })
        },
    },
}
</script>
<style scoped lang="less">
.bill-search {
    width: 100%;
    padding: 6px 12px;

    /deep/ .van-overlay {
        background: #fff;
    }
}

.out-search {
    background-color: #fff;
}

.inner-search {
    position: sticky;
    top: 0;
    z-index: 999;
    padding-top: 5px !important;
    background-color: #fff;
}
</style>
<style lang="less" scoped>
/deep/ .van-search {
    padding: 0;

    .van-cell {
        padding: 0;
        line-height: 32px;
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
        padding: 0;
        background: #f8f8f8;
        border-radius: 16px;

        .van-field {
            input {
                color: #2f2f2f;

                &::placeholder {
                    color: #9c9c9c;
                    font-size: 15px;
                }
            }
        }
    }

    .van-search__action {
        padding: 0 0 0 16px;
        line-height: 28px;
    }

    .van-icon-clear {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0;
    }
}
</style>
<style lang="less" scoped>
.search-popup {
    width: 100%;
    height: 100%;
    padding: 0 12px;

    .popup-content {
        .list-content {
            padding: 8px 0;

            .history-title {
                height: 24px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 24px;
            }

            .bill-list {
                display: flex;
                flex-direction: column;

                .bill-list__item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0;

                    .item-desc {
                        flex: 1;
                        width: 100%;
                        height: 60px;

                        .item-name {
                            flex: 0 0;
                            max-width: 330px;
                            height: 22px;
                            margin-top: 10px;
                            overflow: hidden;
                            color: #2f2f2f;
                            font-weight: 400;
                            font-size: 16px;
                            line-height: 22px;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }

                        .item-name__history {
                            max-width: 100%;
                        }

                        .item-info {
                            display: flex;
                            align-items: center;
                            justify-content: flex-start;
                            height: 16px;
                            margin-top: 2px;
                            font-weight: 400;
                            font-size: 12px;
                            line-height: 16px;

                            .item-info__currency {
                                display: flex;
                                width: 27px;
                                height: 14px;
                                margin-right: 4px;
                                padding: 0 3px;
                                color: #bd9862;
                                font-weight: 400;
                                font-size: 10px;
                                text-align: center;
                                background-color: rgba(189, 152, 98, 0.1);
                                border-radius: 2px;
                            }

                            .item-info__symbol {
                                display: inline-block;
                                color: #9c9c9c;
                            }
                        }
                    }
                }
            }

            .history-clear {
                width: 100%;
                height: 40px;
                color: #1f1f1f;
                font-weight: 400;
                font-size: 12px;
                line-height: 40px;
                text-align: center;
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
