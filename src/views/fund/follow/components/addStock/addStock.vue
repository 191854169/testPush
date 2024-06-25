<template>
    <van-popup class="popup" v-model="showPopup" position="bottom">
        <div class="popup-content">
            <div class="header">
                <multi-img class="cancel-btn" name="icon-cancel" directory="common" @click="clickCancel" />
                <span>{{ title }}</span>
                <span class="confirm-btn" @click="confirmHandle">{{ $t('confirm') }}</span>
                <div class="search-wrapper">
                    <Search :placeholder="placeholder" v-model="searchValue" @input="inputAction"></Search>
                </div>
            </div>

            <div class="content">
                <div class="selected-title" @click="clickExpand">
                    <p class="number">{{ $t('follow.selectedList') }} ({{ selectedNum }})</p>
                    <multi-img class="expand" :name="isExpand ? 'up-12' : 'down-12'" :directory="'common'"></multi-img>
                </div>
                <div class="selected-list">
                    <div v-for="(item, index) in showList" :key="item.rawSymbol + index">
                        <div class="divide" v-if="showDivide(index)"></div>
                        <add-stock-item
                            :key="item.rawSymbol + index"
                            :itemInfo="item"
                            :type="type"
                            @check="checkAction"
                            v-if="isExpand || index >= mSelectedList.length"
                        />
                    </div>
                    <div class="divide" v-if="isEmpty"></div>
                </div>
            </div>

            <div class="list-empty" v-show="isEmpty">
                <multi-img class="empty-image" :name="isSearch ? 'empty-search' : 'noData'" :directory="isSearch ? 'fund' : 'common'"></multi-img>
                <span class="empty-label">{{ isSearch ? $t('fundList.noSearchResult') : $t('fundList.noRecord') }}</span>
            </div>
        </div>
    </van-popup>
</template>
<script>
import Search from '@/components/Search.vue'
import { throttle } from 'lodash'
import { getStock } from '@/apis/fund/search.js'
import addStockItem from './addStockItem.vue'

export default {
    name: 'addStock',
    components: {
        Search,
        addStockItem,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            default: 'stock',
            validator: v => {
                return ['stock', 'fund'].includes(v)
            },
        },
        selectedList: {
            type: Array,
            default: () => [],
        },
        currency: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            searchValue: '',
            searchList: [],
            inputAction: throttle(this.searchHandler, 300, { leading: false, trailing: true }),
            isExpand: false,
            selectSymbolList: [],
            canotCancelSymbolList: [],
            selectedNum: 0,
            showList: [],
            mSelectedList: [],
            requestStack: [],
        }
    },
    computed: {
        showPopup: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        title() {
            if (this.type == 'stock') {
                return this.$t('createPortfolio.addStock')
            }
            return this.$t('fundSelectionByStock.addFund')
        },
        placeholder() {
            if (this.type == 'stock') {
                return this.$t('fundSelectionByStock.searchPlaceholder3')
            }
            return this.$t('fundList.pleaseInput')
        },
        // 搜索中
        isSearch() {
            return this.searchValue.length > 0 && this.searchList.length > 0
        },

        isEmpty() {
            return !this.searchList.length > 0 || this.searchValue.length == 0
        },
    },
    watch: {
        showPopup: {
            handler(v) {
                console.log('hxj v', v)
                if (v) {
                    this.init()
                } else {
                    this.clear()
                }
            },
        },
    },
    methods: {
        init() {
            this.isExpand = false
            this.mSelectedList = [...this.selectedList]
            this.showList = this.mSelectedList
            this.selectSymbolList = this.mSelectedList.map(item => item.mkt + item.rawSymbol) || []
            this.canotCancelSymbolList = this.mSelectedList.reduce((values, item) => {
                if (!item.cancelable) {
                    values.push(item.mkt + item.rawSymbol)
                }
                return values
            }, [])
            this.selectedNum = this.mSelectedList.length
        },
        showDivide(index) {
            return index == this.mSelectedList.length || (index == 0 && this.mSelectedList.length == 0)
        },
        async searchHandler() {
            try {
                if (this.searchValue == '') {
                    this.showList = this.mSelectedList
                    this.requestStack.splice(0)
                    return
                }
                if (!this.value) return
                const param = {
                    q: this.searchValue,
                    size: 10,
                    searchModel: this.type == 'stock' ? 4 : 5,
                    mkt: this.type == 'fund' ? 'mf' : '',
                    currency: this.currency,
                }
                const timestamp = Date.now()
                const lastIndex = this.requestStack.findIndex(item => item.key > timestamp)
                if (lastIndex === -1) {
                    this.requestStack.splice(0)
                } else {
                    this.requestStack.splice(0, lastIndex)
                }
                this.requestStack.push({ key: timestamp })
                const { result } = await getStock(param)
                const index = this.requestStack.findIndex(item => item.key == timestamp)
                if (index !== -1) {
                    this.requestStack.splice(0, index + 1)
                    this.searchList = result.map(item => {
                        const symbol = item.mkt + item.rawSymbol

                        // 给搜索列表赋值是否为已选择 或者是否为不可取消
                        let check = false
                        this.selectSymbolList.includes(symbol) && (check = true)
                        item.check = check

                        let cancelable = true
                        this.canotCancelSymbolList.includes(symbol) && (cancelable = false)
                        item.cancelable = cancelable

                        return item
                    })
                    // this.searchList = result
                    this.showList = this.mSelectedList.concat(this.searchList)
                }
            } catch (e) {
                console.log('getStock:===>e', e)
            }
        },
        async confirmHandle() {
            if (this.mSelectedList.length) {
                this.$emit('confirm', this.mSelectedList)
                console.log('hxj confirm', this.mSelectedList)
            }
            this.showPopup = false
        },
        // 选择
        checkAction(row = {}) {
            const { value, itemInfo = {} } = row
            console.log('hxj check', row)
            itemInfo.check = value
            if (value) {
                const index = this.mSelectedList.findIndex(item => item.mkt + item.rawSymbol === itemInfo.mkt + itemInfo.rawSymbol)
                if (index !== -1) {
                    this.mSelectedList.splice(index, 1)
                }
                this.mSelectedList.push(itemInfo)
                console.log('hxj mSelectedList', this.mSelectedList)
            } else {
                //  取消选择
                const index = this.mSelectedList.findIndex(item => item.mkt + item.rawSymbol === itemInfo.mkt + itemInfo.rawSymbol)
                if (index !== -1) {
                    this.mSelectedList.splice(index, 1)
                }
                console.log('hxj mSelectedList', this.mSelectedList)
            }
            this.selectSymbolList = this.mSelectedList.map(item => item.mkt + item.rawSymbol) || []
            this.selectedNum = this.mSelectedList.length
            this.syncCheckhandler(itemInfo.mkt + itemInfo.rawSymbol, value)
        },

        // 同步更改选中与取消
        syncCheckhandler(symbol, check) {
            const instance = this.searchList.find(item => item.mkt + item.rawSymbol === symbol)
            instance && (instance.check = check)
            this.showList = this.mSelectedList.concat(this.searchList)
        },
        clear() {
            this.searchValue = ''
            this.searchList = []
            this.canotCancelSymbolList = []
            this.showList = []
            this.selectSymbolList = []
            this.selectedNum = 0
            this.mSelectedList = []
        },
        clickCancel() {
            this.showPopup = false
        },
        clickExpand() {
            this.isExpand = !this.isExpand
        },
        // openPop() {
        //     this.mSelectedList = [...this.selectedList]
        // }
    },
}
</script>
<style scoped lang="less">
.popup {
    border-radius: 12px 12px 0 0;
}

.popup-content {
    height: 80vh;
    overflow: scroll;
    background: #f9f9f9;
    border-radius: 12px 12px 0 0;

    .header {
        position: sticky;
        top: 0;
        padding: 0 12px;
        padding-bottom: 8px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #fff;

        .cancel-btn {
            position: absolute;
            top: 10px;
            left: 17px;
            width: 24px;
            height: 24px;
        }

        .confirm-btn {
            position: absolute;
            right: 17px;
            color: #ff6907;
            font-weight: normal;
            font-size: 14px;
        }
    }

    .search-wrapper {
        margin-top: 8px;
    }

    .content {
        .selected-title {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            height: 36px;
            padding: 0 12px;
            background: #fff;

            .number {
                color: #666;
                font-weight: normal;
                font-size: 14px;
            }

            .expand {
                width: 12px;
                height: 12px;
            }
        }

        .selected-list {
            padding: 0 12px;
            background: #fff;

            .divide {
                width: calc(100% + 24px);
                height: 12px;
                margin: 0 -12px;
                background-color: #f9f9f9;
            }
        }
    }

    .list-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: calc(100% - 144px);
        padding-top: 144px;
        background: #fff;

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
</style>
