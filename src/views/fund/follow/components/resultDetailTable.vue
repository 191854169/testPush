<template>
    <div class="container">
        <div class="table fund" v-if="isFund">
            <div class="head">
                <div class="title width-208">{{ $t('follow.nameCode') }}</div>
                <div class="title width-100 algin-right">{{ $t('trade.applyAmount') }}</div>
            </div>
            <div class="row" v-for="item in list" :key="item.productCode">
                <div class="width-208">
                    <div class="name">{{ item.productName }}</div>
                    <div class="stock-code">
                        <!-- <span>us</span> -->
                        <span :class="`currency-${item.currency}`"></span>
                        <span class="code">{{ item.productCode }}</span>
                    </div>
                </div>
                <div class="width-100 algin-right">{{ item.amount | thousandsFilter }}</div>
            </div>
        </div>
        <div class="table" v-else>
            <div class="head">
                <div class="title width-138">{{ $t('follow.stockCode') }}</div>
                <div class="title width-81 algin-right">{{ $t('count') }}</div>
                <div class="title width-81 algin-right">{{ $t('follow.price') }}</div>
            </div>
            <div class="row" v-for="item in list" :key="item.productCode">
                <div class="width-138">
                    <div class="name">{{ item.productName }}</div>
                    <div class="stock-code">
                        <!-- <span>us</span> -->
                        <span :class="`market-${marketMap[item.productType] || marketMap[item.market]}`"></span>
                        <span class="code">{{ item.productCode }}</span>
                    </div>
                </div>
                <div class="width-81 algin-right">{{ item.quantity | thousandsFilter }}</div>
                <div class="width-81 algin-right">{{ item.price | thousandsFilter }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { keepDecimals } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'

export default {
    props: {
        list: {
            type: Array,
            default() {
                return []
            },
        },
        isFund: {
            type: Boolean,
            default: false,
        },
        unity: {
            type: String,
            default: '',
        },
        currency: {
            type: String,
            default: '',
        },
    },
    filters: {
        thousandsFilter(v) {
            return v ? thousandsFilter(keepDecimals(v, 2)) : '--'
        },
    },
    data() {
        return {
            marketMap: {
                1: 'HK',
                2: 'US',
            },
        }
    },
}
</script>

<style lang="less" scoped>
.table {
    .head {
        display: flex;
        height: 32px;
        padding-top: 12px;
        color: @fontGreyColor;
        font-weight: 400;
        font-size: 12px;
        font-style: normal;
    }

    .row {
        display: flex;
        align-items: center;
        height: 56px;

        .name {
            overflow: hidden;
            color: @fontBlackColor;
            font-size: 14px;
            line-height: 20px;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .stock-code {
            display: flex;
            align-items: center;

            .code {
                margin-left: 3px;
                color: @fontGreyColor;
                font-weight: 400;
                font-size: 10px;
                font-style: normal;
                line-height: 14px;
            }
        }
    }

    .algin-right {
        text-align: right;
    }

    .width-138 {
        width: 138px;
    }

    .width-81 {
        width: 81px;

        &:nth-of-type(2) {
            margin-left: 12px;
        }

        &:nth-of-type(3) {
            margin-left: 16px;
        }
    }

    .width-208 {
        width: 208px;
    }

    .width-100 {
        width: 100px;
        margin-left: 19px;
    }
}
</style>
