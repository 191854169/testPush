<!--
 * @Description: 股票选基首页
 * @Autor: JerryYi
-->
<template>
    <div class="main">
        <div class="search-wrapper" @click="focusHandler">
            <Search :placeholder="$t('fundSelectionByStock.searchPlaceholder')" :readonly="true"></Search>
        </div>
        <div class="list-wrapper">
            <div class="title">{{ $t('fundSelectionByStock.fundHot') }}</div>
            <div class="fund-list">
                <div class="fund-item" :class="{ 'border-bottom-1px': index !== dataList.length - 1 }" v-for="(item, index) in dataList" :key="index">
                    <div class="flex-s item1" @click="handleClick(1, item)">
                        <div class="f15">{{ item.stockCode }} {{ item.stockName }}</div>
                        <div class="gray f14 flex-c h-16">
                            <span class="mar-t2">{{ item.holderNum }}{{ $t('fundSelectionByStock.zjjzc') }}</span>
                            <multi-img class="icon-arrow" name="icon-right-arrow" directory="common"></multi-img>
                        </div>
                    </div>
                    <div class="flex-s item2 nowrap" @click="handleClick(2, item)">
                        <div class="flex1 w0">
                            <div class="f14 mar-b6 elipsis">{{ item.fundName }}</div>
                            <div class="item-info">
                                <div class="item-info__currency inline-b" :class="[`currency-${item.currency}`]"></div>
                                <span class="item-info__symbol">{{ item.ISIN }}</span>
                                <span class="item-info__type">{{ item.fundType | fundTypeFilter }}</span>
                            </div>
                        </div>
                        <div class="w-70 align-r">
                            <div class="mar-b6 f14 theme" v-riseFall="{ value: item.return3Y, sign: true }">+{{ item.return3Y }}%</div>
                            <div class="f12 gray">{{ $t('fundSelectionByStock.jsnzf') }}</div>
                        </div>
                        <div class="w-70 align-r">
                            <div class="mar-b6 f14">{{ item.topHoldRatio | toFixedFilter }}%</div>
                            <div class="f12 gray">{{ $t('fundSelectionByStock.cczb') }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="no-more" v-if="dataList.length">
                <span>{{ $t('noMore') }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { getTopHolder } from '@/apis/fund/fund.js'
import { i18n } from '@/i18n/fund/index.js'
import Search from '@/components/Search.vue'
import { keepDecimals } from '@/utils'

const FUND_TYPE_ENUM = {
    1: i18n.t('fundList.stockType'),
    2: i18n.t('fundList.bondType'),
    3: i18n.t('fundList.mixedType'),
    4: i18n.t('fundList.currencyType'),
}
export default {
    name: 'fundSelectionByStock',
    components: {
        Search,
    },
    filters: {
        fundTypeFilter(key) {
            return FUND_TYPE_ENUM[key] || ''
        },
        toFixedFilter(v) {
            return keepDecimals(v, 2)
        },
    },
    data() {
        return {
            dataList: [],
        }
    },
    created() {
        this.getTopHolder()
    },
    methods: {
        async getTopHolder() {
            try {
                const res = await getTopHolder({})
                this.dataList = res?.result?.list || []
            } catch (e) {
                console.log('error:getTopHolder===>:', e)
            }
        },
        handleClick(type, item) {
            const stockCode = encodeURIComponent(item.stockMarket + item.stockCode)
            if (type == 1) {
                this.$router.push({ name: 'affiliatedFund', query: { stockCode } })
            }
            if (type == 2) {
                this.listClickHander(item)
            }
        },
        listClickHander(rowData) {
            this.symbol = rowData.symbol
            const url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${rowData.symbol}&fundType=${rowData.type}`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `/detail`,
                    query: {
                        type: 'public',
                        symbol: rowData.symbol,
                        fundType: rowData.type,
                    },
                })
            }
        },
        focusHandler() {
            this.$router.push({ name: 'fundSelectionByStockSearch' })
        },
    },
}
</script>

<style lang="less" scoped>
.gray {
    color: @fontGreyColor;
}

.theme {
    color: @theme;
}

.icon-arrow {
    width: 12px;
    height: 12px;
    margin-left: 8px;
}

.w-70 {
    width: 70px;
}

.w-60 {
    width: 60px;
}

.h-16 {
    height: 16px;
}

.mar-t2 {
    margin-top: 2px;
}

.no-more {
    padding: 0 0 24px;
    color: #9c9c9c;
    font-weight: 400;
    font-size: 0.12rem;
    text-align: center;
}

.main {
    height: 100vh;
    overflow-y: auto;
    background: @white;

    .search-wrapper {
        padding: 8px 12px 22px;
    }

    .list-wrapper {
        padding: 0 12px;

        .title {
            font-weight: 700;
            font-size: 14px;
        }

        .fund-item {
            margin-top: 16px;
            margin-bottom: 16px;
            padding-bottom: 16px;
            color: @fontBlackColor;
            white-space: nowrap;
        }

        .item2 {
            margin-top: 12px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
        }
    }
}

.item-info {
    display: flex;
    align-items: center;
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
        top: 1px;
        left: -5px;
        width: 1px;
        height: 8px;
        background-color: #9c9c9c;
        transform: scaleX(0.5);
        content: '';
    }
}
</style>
