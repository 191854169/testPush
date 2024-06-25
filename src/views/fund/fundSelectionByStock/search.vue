<!--
 * @Description: 股票选基搜索页
 * @Autor: JerryYi
-->

<template>
    <div class="main flex-column">
        <div class="search-wrapper">
            <Search
                :placeholder="$t('fundSelectionByStock.searchPlaceholder2')"
                show-action
                v-model="value"
                @input="inputAction"
                @cancel="cancelHandler"
            ></Search>
        </div>
        <div class="default-main" v-show="!isSearch">
            <div class="history-main mar-b40" v-if="historyList.length">
                <div class="mar-t32 flex-s">
                    <span class="f14 black bold">{{ $t('fundSelectionByStock.searchHistory') }}</span>
                    <multi-img width="16" height="16" name="icon_search_del" directory="fund" @click="cleanHistorySearch"></multi-img>
                </div>
                <div class="common-list" id="historyList" ref="historyList" v-show="moreThanTwoLines">
                    <div class="item" v-for="(item, index) in historyList" :key="index" @click="historyClickHandler(item)">{{ item.name }}</div>
                </div>
                <div class="common-list" v-show="!moreThanTwoLines" ref="hasExpandList">
                    <template v-for="(item, index) in historyListFilter">
                        <div class="item" :key="index" @click="historyClickHandler(item)" v-if="item.name">{{ item.name }}</div>
                        <div class="icon-expand-wrapper" v-else :key="index">
                            <div class="icon-expand flex-c" @click="moreThanTwoLines = true">
                                <multi-img width="11" height="6" name="icon_arrow_dark" directory="fund"></multi-img>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <div class="hot-main">
                <div class="f14 mar-t32 black bold">{{ $t('fundSelectionByStock.searchHot') }}</div>
                <div class="common-list hot-list">
                    <div class="item" v-for="(item, index) in hotList" :key="index" @click="goPage(item)">{{ item.name }}</div>
                </div>
            </div>
        </div>
        <section class="search-content" v-if="isSearch">
            <ul class="list-content">
                <li
                    class="stock-item"
                    v-for="(item, index) in searchList"
                    :key="item.rawSymbol + index"
                    :data-symbol="item.rawSymbol"
                    @click="onClickHandler(item)"
                >
                    <div class="stock-name line-elipsis" v-html="changeColor(item.name, value)"></div>
                    <div class="stock-info">
                        <div class="stock-info__market" :class="[`market-${item.mkt.toLocaleUpperCase()}`]"></div>
                        <div class="stock-info__symbol" v-html="changeColor(item.rawSymbol, value)"></div>
                    </div>
                </li>
            </ul>
            <div class="list-empty" v-show="isEmpty">
                <multi-img class="empty-image" :name="isSearch ? 'empty-search' : 'noData'" :directory="isSearch ? 'fund' : 'common'"></multi-img>
                <span class="empty-label">{{ isSearch ? $t('fundList.noSearchResult') : $t('fundList.noRecord') }}</span>
            </div>
        </section>
    </div>
</template>

<script>
import Search from '@/components/Search.vue'
import { throttle } from 'lodash'
import { hotSearch } from '@/apis/info.js'
import { getStock } from '@/apis/fund/search.js'
import { strColorChange, formArray } from '@/utils/tools'
import { quote } from '@/apis/market.js'

const STORGE_KEY = 'FUND_SELECT_STOCK_SEARCH' // 股票选基-localStorage KEY

export default {
    name: 'fundSelectionByStockSearch',
    components: {
        Search,
    },
    data() {
        return {
            symbols: this.$route.query.symbols ? JSON.parse(decodeURIComponent(this.$route.query.symbols)) : [], // 带过来的symbols
            value: '',
            historyList: [],
            inputAction: throttle(this.searchHandler, 300, { leading: false, trailing: true }),
            hotList: [],
            historyListFilter: [],
            searchList: [],
            moreThanTwoLines: true,
        }
    },
    computed: {
        // 搜索中
        isSearch() {
            return this.value.length > 0
        },

        isEmpty() {
            return !this.searchList.length > 0 && this.isSearch
        },
    },
    mounted() {
        this.init()
    },
    methods: {
        async init() {
            const storage = localStorage.getItem(STORGE_KEY)
            const historyList = storage ? JSON.parse(storage) : []
            if (historyList.length) {
                await this.getHistorySearch(historyList)
                this.showHistoryExpand()
                this.getHotSearch()
            } else {
                this.getHotSearch()
            }
        },
        // 是否显示历史记录展开按钮
        showHistoryExpand() {
            const dom = this.$refs.historyList
            if (!dom) {
                return false
            }
            // 历史搜索是否超过2行
            // 一个元素的外边距
            const marginTop = parseInt(getComputedStyle(dom.children[0], null).marginTop) + 1
            // 2行的高度
            const maxHeight = (dom.children[0].offsetHeight + marginTop) * 2
            this.moreThanTwoLines = !(dom.offsetHeight > maxHeight)
            if (this.moreThanTwoLines) {
                return false
            }
            // 超过则显示展开按钮，动态计算展开按钮放入哪个位置
            const arr = formArray(dom?.children || [])
            const maxWidth = dom?.offsetWidth
            let total = 0
            let index = 0
            let times = 0
            for (let i = 0; i < arr.length; i++) {
                const offsetWidth = arr[i]['offsetWidth']
                total = offsetWidth + total + marginTop
                if (total > maxWidth) {
                    index = i
                    total = offsetWidth
                    times++
                    if (times == 2) {
                        break
                    }
                }
            }

            if (times == 2) {
                this.historyListFilter = this.historyList.slice(0, index)
                this.historyListFilter.push({})
            }

            this.$nextTick(() => {
                if (this.$refs.hasExpandList.offsetHeight > 82) {
                    this.historyListFilter.splice(this.historyListFilter.length - 2, 1)
                }
            })
        },
        // 搜索股票
        async searchHandler() {
            try {
                if (!this.value) return
                const { result } = await getStock({
                    q: this.value,
                    size: 50,
                    type: 'stock',
                })
                this.searchList = result || []
            } catch (e) {
                console.log('getStock:===>e', e)
            }
        },

        // 获取热门股票
        async getHotSearch() {
            try {
                const { result } = await hotSearch()
                this.hotList = result?.list || []
            } catch (e) {
                console.log('getHotSearch===>e:', e)
            }
        },

        // 获取历史搜索
        async getHistorySearch(historyList = []) {
            if (historyList.length) {
                // 请求接口，为了兼容多语言
                const codes = historyList.map(item => item.mkt + item.rawSymbol)
                try {
                    const { result } = await quote({
                        codes,
                        fields: ['name', 'mkt', 'rawSymbol'],
                    })
                    // 接口每次返回的数据顺序与传过去的codes顺序不一致，所以要处理
                    result.forEach(item => {
                        historyList.forEach(i => {
                            if (item.mkt + item.rawSymbol == i.mkt + i.rawSymbol) {
                                i.name = item.name
                            }
                        })
                    })
                    this.historyList = historyList
                } catch (e) {
                    console.log('quote===>e:', e)
                }
            } else {
                this.historyList = []
                this.historyListFilter = []
            }
        },

        // 设置历史搜索
        setHistorySearch(item) {
            const stockSymbol = item.mkt + item.rawSymbol
            const index = this.historyList.findIndex(i => i.mkt + i.rawSymbol === stockSymbol)
            if (index !== -1) {
                this.historyList.splice(index, 1)
            }
            this.historyList.unshift(item)
            this.historyList.length > 10 && (this.historyList.length = 10)
            localStorage.setItem(STORGE_KEY, JSON.stringify(this.historyList))
        },

        // 清空历史搜索
        cleanHistorySearch() {
            this.$dialog
                .confirm({
                    message: this.$t('fundSelectionByStock.deleteTips'),
                    confirmButtonText: this.$t('confirm'),
                    cancelButtonText: this.$t('cancel'),
                    messageAlign: 'center',
                })
                .then(() => {
                    localStorage.removeItem(STORGE_KEY)
                    this.getHistorySearch()
                })
                .catch(() => {})
        },

        // 选择历史记录
        historyClickHandler(item) {
            this.goPage(item)
        },
        // 选择股票
        onClickHandler(item) {
            this.setHistorySearch(item)
            this.goPage(item)
        },

        goPage(item) {
            let symbols = []
            const stockSymbol = item.mkt + item.rawSymbol
            const index = this.symbols.findIndex(symbol => symbol === stockSymbol)
            if (index !== -1) {
                this.symbols.splice(index, 1)
                this.symbols.push(stockSymbol)
                symbols = this.symbols
            } else {
                symbols = [...this.symbols, stockSymbol]
            }
            this.$router.replace({
                path: '/stock-fund-compare',
                query: {
                    symbols: encodeURIComponent(JSON.stringify(symbols)),
                    holderType: this.$route.query.holderType || 1,
                },
            })
        },

        cancelHandler() {
            this.$router.go(-1)
        },

        // 修改颜色
        changeColor(origin, match) {
            return strColorChange(origin, match)
        },
    },
}
</script>

<style lang="less" scoped>
/deep/ .van-search__action:active {
    background: none;
}

.black {
    color: @black;
}

.main {
    height: 100vh;
    padding: 0 12px;
    overflow: hidden;
    background: @white;

    .search-wrapper {
        margin-top: 8px;

        .cancel-btn {
            width: 44px;
            color: @fontBlackColor;
            text-align: right;
        }
    }

    .common-list {
        margin-left: -12px;
        font-size: 0;

        .item {
            display: inline-block;
            max-width: 156px;
            margin: 12px 0 0 12px;
            padding: 6px 16px;
            overflow: hidden;
            color: #1f1f1f;
            font-size: 14px;
            white-space: nowrap;
            text-overflow: ellipsis;
            background: #f9f9f9;
            border-radius: 26px;
        }

        .icon-expand-wrapper {
            display: inline-block;
            margin: 12px 0 0 12px;
            vertical-align: top;
        }

        .icon-expand {
            justify-content: center;
            width: 28px;
            height: 28px;
            background: #f9f9f9;
            border-radius: 28px;
        }
    }

    .search-content {
        flex: 1;
        overflow-y: auto;

        .list-content {
            display: flex;
            flex-direction: column;
            width: 100%;

            .stock-item {
                display: flex;
                flex-direction: column;
                width: 100%;
                padding: 10px 0;

                .stock-name {
                    margin-bottom: 2px;
                    color: #2f2f2f;
                    font-weight: 500;
                    font-size: 16px;
                    line-height: 22px;
                }

                .stock-info {
                    display: flex;
                    align-items: center;

                    &__market {
                        width: 14px;
                        height: 12px;
                    }

                    &__symbol {
                        margin-left: 4px;
                        color: #9c9c9c;
                        font-weight: 400;
                        font-size: 10px;
                        line-height: 12px;
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
