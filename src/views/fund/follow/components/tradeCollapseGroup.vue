<!-- 交易用到的可 -->

// 跟投模拟计算器页
<template>
    <div class="trade-collapse-group">
        <van-collapse v-model="activeNames" :border="false">
            <van-collapse-item class="item_title" name="1">
                <div slot="title" class="title">
                    {{ marketFilter(group.marketType) }}
                </div>
                <div slot="value" class="ratio">{{ group.ratio }}%</div>
                <div class="content">
                    <div class="section_title">
                        <div :class="['abs', `index_${index}`]" v-for="(text, index) in sectionTitle" :key="index">
                            {{ text }}
                        </div>
                    </div>
                    <div v-for="item in group.holding" :key="item.productCode">
                        <div class="cell_item">
                            <div class="name_info">
                                <div class="name line-elipsis">{{ item.name }}</div>
                                <div class="flex-c">
                                    <span :class="getCurrencyClass(item)"></span>
                                    <span v-if="isFund" class="c-gray code">
                                        {{
                                            $t('follow.minInitialAmountText', {
                                                minInitial: amountFormat(item.minInitial),
                                                currencyName: currencyFilter(currency),
                                            })
                                        }}
                                    </span>
                                    <span v-else class="c-gray code">{{ item.productCode }}</span>
                                    <span class="c-gray code" v-if="!isFund && !item.nowRatio">({{ floatToRatioFormat(item.ratio) }})</span>
                                    <span class="c-gray code" v-if="!isFund && item.nowRatio">
                                        ({{ floatToRatioFormat(item.ratio) }}→{{ floatToRatioFormat(item.nowRatio) }})
                                    </span>
                                </div>
                            </div>
                            <div v-if="isFund" class="abs count">{{ floatToRatioFormat(item.ratio) }}</div>
                            <div v-else class="abs count" :class="{ f12: smallerFont(item) }">{{ amountFormat(item.lotNum || 0, 0) }}</div>
                            <div v-if="isFund" class="abs price" :class="{ f12: smallerFont(item) }">{{ amountFormat(item.lotNum || 0, 2) }}</div>
                            <div v-else class="abs price">{{ priceFormat(item) }}</div>
                        </div>
                    </div>
                    <van-divider class="hor-line"></van-divider>
                    <div class="statistics">
                        <div class="top_statistics flex-s">
                            <div v-if="isFund" class="left">{{ fundTypeFilter(group.marketType) }}{{ $t('trade.ddje') }}</div>
                            <div v-else class="left">{{ marketFilter(group.marketType) }}{{ $t('trade.ddje') }}</div>
                            <div class="right">{{ amountFormat(groupAmount, 2) }} {{ currencyFilter(groupCurrency) }}</div>
                        </div>
                        <div class="bottom">
                            <span v-if="isFund" v-html="$t('simulation.totalFundPurchaseCount', { num: tradableItems.length })"></span>
                            <span
                                v-else-if="groupCurrency == 'USD'"
                                v-html="$t('simulation.totalPurchaseCountUS', { num: tradableItems.length, type: marketFilter(group.marketType) })"
                            ></span>
                            <span
                                v-else
                                v-html="$t('simulation.totalPurchaseCount', { num: tradableItems.length, type: marketFilter(group.marketType) })"
                            ></span>
                            <span v-if="needRate && groupAmount">≈{{ amountFormat(rateAmount(), 2) }} {{ currencyFilter(toCurrency) }}</span>
                        </div>
                    </div>
                </div>
            </van-collapse-item>
        </van-collapse>
    </div>
</template>

<script>
import { Collapse, CollapseItem, Divider } from 'vant'
import { currencyMap } from '@/config/common'

import { i18n } from '@/i18n/fund/index.js'
import { amountFilter } from '@/config/filters.js'
import { getStockLimitDecimal, floatToRatio, keepDecimals } from '@/utils'

import NP from 'number-precision'
import { calcTradePrice } from '../utils/tradeUtil'

export default {
    name: 'trade-collapse-group',
    components: {
        [Divider.name]: Divider,
        [Collapse.name]: Collapse,
        [CollapseItem.name]: CollapseItem,
    },
    props: {
        group: {
            type: Object,
            default: () => {
                return {}
            },
        },
        isFund: {
            type: Boolean,
            default: false,
        },
        currency: {
            type: String,
            default: 'HKD',
        },
        rate: {
            type: [Number, String],
            default: 0,
        },
    },
    filters: {},
    data() {
        return {
            activeNames: ['1'],
        }
    },
    computed: {
        sectionTitle() {
            if (this.isFund) {
                return [
                    this.$t('follow.nameCode'),
                    this.$t('follow.holdRate'),
                    `${this.$t('trade.applyAmount')} (${this.currencyFilter(this.groupCurrency)})`,
                ]
            }
            return [
                this.$t('fundSelectionByStock.stockName'),
                this.$t('count'),
                `${this.$t('follow.price')} (${this.currencyFilter(this.groupCurrency)})`,
            ]
        },
        groupCurrency() {
            return this.group.holding[0]?.currency
        },
        toCurrency() {
            return this.currency
        },
        groupAmount() {
            let total = 0
            this.group.holding.forEach(item => {
                if (this.isFund) {
                    total = NP.plus(total, item.lotNum || 0)
                } else {
                    const stockPrice = calcTradePrice(item)
                    total = NP.plus(total, NP.times(item.lotNum || 0, stockPrice))
                }
            })
            return total
        },
        // 是否需要做汇率换算
        needRate() {
            return this.groupCurrency !== this.currency
        },
        tradableItems() {
            return this.group.holding.filter(item => {
                return Number(item.lotNum) > 0
            })
        },
    },
    created() {},
    mounted() {},
    watch: {},
    beforeDestroy() {},
    methods: {
        smallerFont(item) {
            return NP.minus(item.lotNum || 0, 99999999) > 0
        },
        getStockLimitDecimal,
        currencyFilter(v) {
            return currencyMap.keyValueMap[v] || ''
        },
        marketFilter(i) {
            if (this.isFund) {
                return ['', i18n.t('stockType'), i18n.t('bondType'), i18n.t('mixedType'), i18n.t('currencyType'), i18n.t('stockRightType')][i] || '--'
            }
            return ['', i18n.t('HKDMarket'), i18n.t('USDMarket'), ''][i] || '--'
        },
        fundTypeFilter(i) {
            const type = ['', i18n.t('stockType'), i18n.t('bondType'), i18n.t('mixedType'), i18n.t('currencyType'), i18n.t('stockRightType')][i]
            return type ? `${type}${this.$t('follow.fundName')}` : '--'
        },
        getCurrencyClass(data) {
            if (this.isFund) {
                return `currency-${data.currency.toLocaleUpperCase()}`
            }
            return `market-${data.market.toLocaleUpperCase()}`
        },
        amountFormat(v, decimal) {
            v = v + ''
            v = v.replace(/,/g, '')
            return amountFilter(keepDecimals(Number(v), decimal).toString())
        },
        priceFormat(item) {
            const decimal = getStockLimitDecimal(item.market || '', item.latestPrice)
            const price = calcTradePrice(item)
            return this.amountFormat(price, decimal)
        },
        floatToRatioFormat(v) {
            return floatToRatio(v, { rate: true, base: 2, sign: false })
        },
        // 计算汇率
        rateAmount() {
            return NP.times(this.rate, this.groupAmount)
        },
    },
}
</script>

<style scoped lang="less">
.trade-collapse-group {
    .item_title {
        .title {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }

        .ratio {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }
    }

    .abs {
        position: absolute;
    }

    .content {
        .section_title {
            position: relative;
            display: flex;
            align-items: center;
            height: 28px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;

            .index_1 {
                right: 97px;
            }

            .index_2 {
                right: 0;
            }
        }

        .cell_item {
            position: relative;
            display: flex;
            align-items: center;
            height: 56px;
            color: #2f2f2f;
            font-weight: normal;
            font-size: 14px;
            line-height: 20px;

            .name_info {
                .name {
                    max-width: 138px;
                }

                .code {
                    margin-left: 2px;
                    font-weight: normal;
                    font-size: 10px;
                    line-height: 14px;
                }
            }

            .count {
                right: 97px;
                font-weight: normal;
            }

            .price {
                right: 0;
                font-weight: normal;
            }
        }

        .hor-line {
            height: 0.5px;
            margin: 0 0 0.5px;
            background-color: #f8f8f8;
        }

        .statistics {
            height: 44px;
            margin-top: 12px;

            .top_statistics {
                font-size: 14px;
                line-height: 20px;

                .left {
                    color: #2f2f2f;
                    font-weight: 400;
                }

                .right {
                    color: #000;
                    font-weight: 700;
                }
            }

            .bottom {
                display: flex;
                justify-content: space-between;
                margin-top: 4px;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    ::v-deep .van-collapse-item__title {
        border-radius: 8px;
    }

    ::v-deep .van-collapse-item__title--expanded {
        border-radius: 8px 8px 0 0;
    }

    ::v-deep .van-collapse-item__content {
        border-radius: 0 0 8px 8px;
    }

    ::v-deep .highlight {
        color: @theme;
    }
}
</style>
