<template>
    <van-popup class="popup" v-model="showPopup" position="bottom" @opened="onOpened">
        <div class="popup-content">
            <div class="header">
                <multi-img class="cancel-btn" name="icon-cancel" directory="common" @click="clickCancel" />
                <span>{{ $t('fcn.objectSelect') }}</span>
                <span class="confirm-btn" :class="{ disabled: mSelectedList.length === 0 }" @click="confirmHandle">{{ $t('confirm') }}</span>
                <div class="search-wrapper">
                    <Search :placeholder="$t('bills.pleaseInput2')" v-model="searchValue" @input="inputHandler"></Search>
                </div>
            </div>

            <div class="content">
                <div class="selected-list">
                    <div v-for="(item, index) in searchList" :key="item.rawSymbol + `${index}`">
                        <add-stock-item :key="item.rawSymbol" :itemInfo="item" @check="checkAction" />
                    </div>
                </div>
            </div>

            <div class="list-empty" v-show="isEmpty">
                <multi-img class="empty-image" :name="'empty-search'" :directory="'fund'"></multi-img>
                <span class="empty-label">{{ $t('fundList.noSearchResult') }}</span>
            </div>
        </div>
    </van-popup>
</template>
<script>
import Search from '@/components/Search.vue'
import addStockItem from './addObjectStockItem.vue'
import { throttle } from 'lodash'
import { searchNoteObject } from '@/apis/fund/search.js'
import { isIos } from '@/utils'

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
        selectedList: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            searchValue: '',
            searchList: undefined,
            searchAction: throttle(this.searchHandler, 300, { leading: false, trailing: true }),
            selectSymbolList: [],
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
        isEmpty() {
            return Array.isArray(this.searchList) && this.searchList.length === 0
        },
    },
    watch: {
        showPopup: {
            handler(v) {
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
            this.mSelectedList = [...this.selectedList]
            this.selectSymbolList = this.mSelectedList.map(item => item.mkt + item.rawSymbol) || []
            if (isIos()) {
                this.searchHandler()
            }
        },
        clear() {
            this.searchValue = ''
            this.searchList = undefined
            this.selectSymbolList = []
            this.mSelectedList = []
        },
        async onOpened() {
            if (!isIos()) {
                this.$loading.show = true
                await this.searchHandler()
                this.$loading.show = false
            }
        },
        showDivide(index) {
            return index === this.mSelectedList.length || (index === 0 && this.mSelectedList.length === 0)
        },
        inputHandler() {
            // 过滤中文
            // const newV = this.searchValue.replace(/[\u4e00-\u9fa5]+/g, '')
            // if (this.searchValue === newV) {
            this.searchAction()
            // }
        },
        async searchHandler() {
            try {
                if (!this.value) return
                const param = {
                    q: this.searchValue,
                    size: 50,
                    mkt: '',
                }
                const timestamp = Date.now()
                const lastIndex = this.requestStack.findIndex(item => item.key > timestamp)
                if (lastIndex === -1) {
                    this.requestStack.splice(0)
                } else {
                    this.requestStack.splice(0, lastIndex)
                }
                this.requestStack.push({ key: timestamp })
                const { result } = await searchNoteObject(param)
                const index = this.requestStack.findIndex(item => item.key === timestamp)
                if (index !== -1) {
                    this.requestStack.splice(0, index + 1)
                    this.searchList = result.map(item => {
                        item.rawSymbol = item.code
                        const symbol = item.mkt + item.rawSymbol

                        // 给搜索列表赋值是否为已选择 或者是否为不可取消
                        let check = false
                        this.selectSymbolList.includes(symbol) && (check = true)
                        item.check = check
                        return item
                    })
                }
            } catch (e) {
                console.log('searchNoteObject:===>e', e)
                this.searchList = []
            }
        },
        async confirmHandle() {
            if (this.mSelectedList.length) {
                this.$emit('confirm', this.mSelectedList)
                this.showPopup = false
            }
        },
        // 选择
        checkAction(row = {}) {
            const { value, itemInfo = {} } = row
            console.log(`yinlong`, row)
            itemInfo.check = value
            if (value) {
                if (this.mSelectedList.length === 4) {
                    this.$toast(this.$t('fcn.maxObjectStock'))
                    itemInfo.check = false
                    return
                }
                const index = this.mSelectedList.findIndex(item => item.mkt + item.rawSymbol === itemInfo.mkt + itemInfo.rawSymbol)
                if (index !== -1) {
                    this.mSelectedList.splice(index, 1)
                }
                this.mSelectedList.push(itemInfo)
            } else {
                //  取消选择
                const index = this.mSelectedList.findIndex(item => item.mkt + item.rawSymbol === itemInfo.mkt + itemInfo.rawSymbol)
                if (index !== -1) {
                    this.mSelectedList.splice(index, 1)
                }
            }
            this.selectSymbolList = this.mSelectedList.map(item => item.mkt + item.rawSymbol) || []
        },
        clickCancel() {
            this.showPopup = false
        },
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
        height: 88px;
        padding: 0 12px;
        color: #2f2f2f;
        font-weight: bold;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #fff;

        .cancel-btn {
            position: absolute;
            top: 10px;
            left: 16px;
            width: 24px;
            height: 24px;
        }

        .confirm-btn {
            position: absolute;
            right: 16px;
            color: #ff6907;
            font-weight: normal;
            font-size: 14px;

            &.disabled {
                opacity: 0.3;
            }
        }

        .search-wrapper {
            height: 44px;
            padding: 6px 0;

            ::v-deep .out-search {
                height: 32px;
            }

            ::v-deep .van-search .van-cell {
                padding: 6px 0;
            }

            ::v-deep .multi-img {
                width: 20px;
                height: 20px;
            }
        }
    }

    .content {
        .selected-list {
            padding: 0 16px;
            background: #fff;
        }
    }

    .list-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: calc(100% - 88px);
        padding-top: 88px;
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
