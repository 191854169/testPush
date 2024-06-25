<template>
    <div class="fund-search">
        <van-search class="out-search" v-model="value" :clearable="false" :placeholder="placeholder" @focus="focusHandler">
            <template v-slot:left-icon>
                <multi-img width="16" height="16" name="icon-search" directory="fund"></multi-img>
            </template>
        </van-search>
        <van-popup v-model="show" position="right" class="search-popup" :class="{ 'expand-popup': selectList.length > 0 }">
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
                    <div class="fund-list">
                        <search-item
                            class="fund-list__item"
                            v-for="(item, index) in fundList"
                            :key="item.symbol + index"
                            :item="item"
                            :value="value"
                            @check="checkHandler"
                        ></search-item>
                    </div>
                </div>
                <div class="list-empty" v-show="isEmpty">
                    <div v-show="value">
                        <multi-img class="empty-image" name="empty-search" directory="fund"></multi-img>
                        <span class="empty-label">{{ $t('fundList.noSearchResult') }}</span>
                    </div>
                    <div v-show="!value">
                        <multi-img class="empty-image" name="noData" directory="common"></multi-img>
                        <span class="empty-label">{{ $t('fundList.noRecord') }}</span>
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>
<script>
import { getFund } from '@/apis/fund/search'
import { Popup, Search } from 'vant'
import { throttle } from 'lodash'
import searchItem from './searchItem.vue'

const MAX_SELECT_NUM = 4
export default {
    name: 'fundSearch',
    components: {
        [Popup.name]: Popup,
        [Search.name]: Search,
        searchItem,
    },
    props: {
        selectList: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            version: 0, // 自选查询参数version,初始查询0，之后update必须取的最新version
            placeholder: this.$t('fundList.pleaseInput'),
            value: '',
            show: false,
            inputAction: throttle(this.searchHandler, 300, { leading: false, trailing: true }),
            fundList: [], // 搜索结果
        }
    },
    computed: {
        // 不能继续添加
        noCanSelect() {
            return this.selectList.length >= MAX_SELECT_NUM
        },
        isEmpty() {
            return !this.fundList.length > 0
        },
        selectSymbolList() {
            return this.selectList.map(item => item.symbol)
        },
    },
    watch: {
        show(v) {
            if (!v) {
                this.fundList = []
            }
        },
        selectSymbolList: {
            handler(v) {
                for (let index = 0; index < this.fundList.length; index++) {
                    this.fundList[index].check = v.includes(this.fundList[index].symbol)
                }
            },
            deep: true,
        },
    },
    methods: {
        // 搜索基金
        async searchHandler() {
            try {
                if (!this.value) {
                    this.fundList = []
                    return
                }
                const res = await getFund({
                    q: this.value,
                })
                const resultList = res.result || []
                this.fundList = resultList.map(item => {
                    const symbol = item.mkt + item.rawSymbol
                    let check = false
                    this.selectSymbolList.includes(symbol) && (check = true)
                    return {
                        symbol,
                        name: item.name,
                        ISIN: item.ISIN,
                        currency: item.currency,
                        type: item.fundType,
                        check,
                    }
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
        checkHandler(v, item) {
            item.check = v
            if (item.check && this.noCanSelect) {
                item.check = false
                this.$toast(this.$t('compare.selectLimit'))
                return
            }
            this.$emit('searchCheck', {
                value: item.check,
                fundInfo: item,
            })
        },
    },
}
</script>
<style scoped lang="less">
.fund-search {
    width: 100%;
    padding: 8px 12px;

    /deep/ .van-overlay {
        height: 0;
    }
}

.out-search {
    background-color: #fff;
}

.inner-search {
    position: sticky;
    top: 0;
    z-index: 999;
    padding: 0 12px !important;
    padding-top: 8px !important;
    background-color: #fff;
}
</style>
<style lang="less" scoped>
/deep/ .van-popup--right {
    top: 0;
    transform: translate3d(0, 0, 0);
}

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
.expand-popup {
    height: calc(100% - 120px) !important;
    height: calc(100% - 120px - constant(safe-area-inset-bottom)) !important;
    height: calc(100% - 120px - env(safe-area-inset-bottom)) !important;
}

.search-popup {
    width: 100%;
    height: calc(100% - 48px);
    height: calc(100% - 48px - constant(safe-area-inset-bottom));
    height: calc(100% - 48px - env(safe-area-inset-bottom));
    padding: 0;

    .popup-content {
        .list-content {
            padding: 8px 0 0 12px;

            .fund-list {
                display: flex;
                flex-direction: column;

                .fund-list__item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 20px 10px 0;
                    box-shadow: inset 0 -0.5px 0 #efefef;
                }

                .fund-list__item:last-of-type {
                    box-shadow: none;
                }
            }
        }

        .list-empty {
            padding-top: 144px;

            div {
                display: flex;
                flex-direction: column;
                align-items: center;

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
}
</style>
