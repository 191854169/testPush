<template>
    <div class="fund-search">
        <van-search class="out-search" v-model="value" :clearable="false" :placeholder="placeholder" @focus="focusHandler">
            <template v-slot:left-icon>
                <multi-img width="16" height="16" name="icon-search" directory="fund"></multi-img>
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
                    <multi-img width="16" height="16" name="icon-search" directory="fund"></multi-img>
                </template>
            </van-search>
            <div class="popup-content">
                <div class="list-content" v-show="fundList.length > 0">
                    <p v-if="!isSearch" class="history-title">{{ $t('fundList.historyRecord') }}</p>
                    <div class="fund-list">
                        <div class="fund-list__item" v-for="(item, index) in fundList" :key="item.rawSymbol + index" @click="clickHander(item)">
                            <div class="item-desc">
                                <div class="item-name line-elipsis" :class="{ 'item-name__history': !isSearch }" v-html="colorName(item.name)"></div>
                                <div class="item-info">
                                    <div class="item-info__currency" :class="[`currency-${item.currency}`]"></div>
                                    <span class="item-info__symbol" v-html="colorName(item.ISIN)"></span>
                                    <span class="item-info__type">{{ item.fundType | fundTypeFilter }}</span>
                                </div>
                            </div>
                            <div class="item-self" v-if="isSearch">
                                <div class="item-earn">
                                    <div class="item-earn__value" v-riseFall="item.returnYtd"></div>
                                    <div class="item-earn__time">{{ item.ytdType | ytdTypeFilter }}</div>
                                </div>
                                <multi-img
                                    v-if="isApp"
                                    class="self-size"
                                    :name="`icon-self-${item.isSelf ? 'checked' : 'uncheck'}`"
                                    directory="fund"
                                    @click.stop="selfHandler(item)"
                                ></multi-img>
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
import { getFund } from '@/apis/fund/search'
import { floatToRatio } from '@/utils'
import { Popup, Search } from 'vant'
import { throttle } from 'lodash'
import { isHLApp } from '@/utils/tools'
import { i18n } from '@/i18n/fund/index.js'

const FUND_TYPE_ENUM = {
    1: i18n.t('fundList.stockType'),
    2: i18n.t('fundList.bondType'),
    3: i18n.t('fundList.mixedType'),
    4: i18n.t('fundList.currencyType'),
}
const YTD_TYPE_ENUM = {
    1: i18n.t('fundList.returnY1U'),
    2: i18n.t('fundList.fromSetUp'),
}
export default {
    name: 'fundSearch',
    components: {
        [Popup.name]: Popup,
        [Search.name]: Search,
    },
    filters: {
        floatToRatio,
        fundTypeFilter(key) {
            return FUND_TYPE_ENUM[key] || ''
        },
        ytdTypeFilter(key) {
            return YTD_TYPE_ENUM[key] || ''
        },
    },
    data() {
        return {
            version: 0, // 自选查询参数version,初始查询0，之后update必须取的最新version
            placeholder: this.$t('fundList.pleaseInput'),
            STORAGEKEY: 'fund-search-history', // 本地缓存字段名
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
            return isHLApp() && !!this.$jsBridge
        },
    },
    watch: {
        show(v) {
            if (!v) return
            this.$sensorsTrack('FundSearchPageView', {
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
                const res = await getFund({
                    q: this.value,
                })
                const resultList = res.result || []
                // TODO:(能否从app中获取所有自选) 检查列表每项是否自选
                if (this.isApp) {
                    const checkList = []
                    resultList.forEach(item => {
                        checkList.push(
                            new Promise((resolve, reject) => {
                                this.checkFavstock(`${item.mkt}${item.rawSymbol}`)
                                    .then(res => {
                                        item.isSelf = res
                                        resolve()
                                    })
                                    .catch(err => {
                                        item.isSelf = err
                                        reject()
                                    })
                            })
                        )
                    })
                    await Promise.all(checkList)
                }
                this.searchList = resultList
                // 搜索结果埋点
                this.$sensorsTrack('FundSearchKeywordResult', {
                    search_keyword: this.value,
                    search_result_num: this.searchList.length,
                })
            } catch (e) {
                console.log('getFund:===>e', e)
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
        selectedFund(item) {
            if (!this.isSearch) return
            const intance = this.historyList.find(i => {
                return `${i.mkt}${i.rawSymbol}` === `${item.mkt}${item.rawSymbol}`
            })
            if (intance) {
                // 存在 提前
                const index = this.historyList.indexOf(intance)
                this.historyList.splice(index, 1)
            }
            this.historyList.unshift(item)
            localStorage.setItem(this.STORAGEKEY, JSON.stringify(this.historyList.slice(0, 10)))
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
        // 添加\删除 自选
        async selfHandler(item) {
            if (!this.isSearch) return
            const symbol = `${item.mkt}${item.rawSymbol}`
            try {
                const isFavStock = await this.checkFavstock(symbol)
                if (isFavStock) {
                    await this.$jsBridge.removeFavstock(symbol)
                    item.isSelf = false
                } else {
                    await this.$jsBridge.addFavstock(symbol)
                    item.isSelf = true
                }
            } catch (e) {
                console.log('selfHandler=>e:', e)
            }
        },
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
            this.selectedFund(item)
            const symbol = item.mkt + item.rawSymbol
            // 点击跳转埋点
            this.$sensorsTrack('FundSearchResultClick', {
                keyword_type: this.isSearch ? '自定义搜索词' : '历史搜索词',
                product_type: FUND_TYPE_ENUM[item.fundType],
                product_code: item.ISIN,
                product_name: item.name,
                search_result_num: this.isSearch ? this.searchList.length : undefined,
            })

            if (this.$jsBridge) {
                const url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${symbol}`
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `/detail`,
                    query: {
                        type: 'public',
                        symbol,
                    },
                })
            }
        },
    },
}
</script>
<style scoped lang="less">
.fund-search {
    width: 100%;
    padding: 8px 12px;
}

.out-search {
    background-color: #fff;
}

.inner-search {
    position: sticky;
    top: 0;
    z-index: 999;
    padding-top: 8px !important;
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
        margin-right: 10px;
        margin-left: 18px;
    }

    .van-search__content {
        padding: 0;
        background: #f8f8f8;
        border-radius: 14px;

        .van-field {
            input {
                color: #2f2f2f;

                &::placeholder {
                    color: #9c9c9c;
                    font-size: 14px;
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
                color: #1f1f1f;
                font-weight: 400;
                font-size: 12px;
                line-height: 24px;
            }

            .fund-list {
                display: flex;
                flex-direction: column;

                .fund-list__item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 0;

                    .item-desc {
                        flex: 1;
                        width: 100%;

                        .item-name {
                            flex: 0 0;
                            max-width: 220px;
                            height: 22px;
                            overflow: hidden;
                            color: #1f1f1f;
                            font-weight: 700;
                            font-size: 15px;
                            line-height: 22px;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                        }

                        .item-name__history {
                            max-width: 100%;
                        }

                        .item-info {
                            display: flex;
                            height: 12px;
                            margin-top: 2px;
                            font-weight: 400;
                            font-size: 10px;
                            line-height: 12px;

                            .item-info__currency {
                                margin-right: 5px;
                            }

                            .item-info__symbol {
                                display: inline-block;
                                color: #9c9c9c;
                            }

                            .item-info__type {
                                position: relative;
                                z-index: 1;
                                margin-left: 9px;
                                color: #9c9c9c;
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

                    .item-self {
                        display: flex;
                        align-items: center;

                        .item-earn {
                            display: flex;
                            flex-direction: column;

                            &__value {
                                font-weight: 400;
                                font-size: 15px;
                                line-height: 21px;
                                text-align: right;
                            }

                            &__time {
                                margin-top: 3px;
                                color: #9c9c9c;
                                font-weight: 400;
                                font-size: 12px;
                                line-height: 16px;
                                text-align: right;
                            }
                        }

                        .self-size {
                            width: 24px;
                            height: 24px;
                            margin-left: 26px;
                        }

                        .self-color {
                            color: #ff6907;
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
