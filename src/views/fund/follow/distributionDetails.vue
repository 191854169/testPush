<!--
 * @Description:持仓分布详情
-->

<template>
    <div class="pad-12 c-main" @click="onClick">
        <div v-if="!isEmpty(holdList)" class="fixed_area" ref="fixedAreaRef">
            <div class="flex-c tab" v-if="!isFund">
                <div class="tab_item" :class="{ tab_active: tabIndex == 0 }" @click="onTabClick(0)">{{ $t('marketDistribute') }}</div>
                <div class="tab_item" :class="{ tab_active: tabIndex == 1 }" @click="onTabClick(1)">{{ $t('industryDistribute') }}</div>
            </div>
            <assetDistributionPct v-if="tabIndex == 0" class="asset_dist" :pctList="pctList"></assetDistributionPct>
        </div>
        <!-- 占位 -->
        <div class="placeholder" :style="{ height: `${fixedAreaHeight}px` }"></div>
        <!-- 市场分布 -->
        <div v-if="!isEmpty(marketList) && tabIndex == 0 && !isFund">
            <div class="bg-white pad-tb8 border-radius-8px mar-b12" v-for="(item, index) in marketList" :key="index">
                <div class="pad-rl12">
                    <div class="flex-s h-36 border-bottom-1px mar-b8 f16 bold">
                        <div class="title">
                            <span>{{ item.marketType | marketFilter }}</span>
                        </div>
                        <div class="">{{ item.ratio + '%' }}</div>
                    </div>
                    <div
                        class="h-60 flex-s relative-mask"
                        v-for="(citem, cindex) in item.holding"
                        :key="citem.symbol"
                        :data-index="`${index}_${cindex}`"
                        @click.stop="onMarketClick(citem)"
                    >
                        <div class="flex1">
                            <div class="f16 elipsis mar-b6 w-221">{{ citem.name }}</div>
                            <div class="flex-c">
                                <span :class="getCurrencyClass(citem)"></span>
                                <span class="c-gray f12 mar-l2 mar-r6">{{ citem.symbol }}</span>
                                <span class="c-gray f12 mar-r6">{{ citem.latestPrice }}</span>
                                <span class="c-gray f12 mar-r6">
                                    (
                                    <span v-riseFall="{ value: citem.day1Return, riseFall: false }"></span>
                                    )
                                </span>
                            </div>
                        </div>
                        <div class="f16">{{ citem.ratio }}%</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 行业分布 -->
        <div v-if="tabIndex == 1 || isFund">
            <div class="bg-white pad-tb8 border-radius-8px mar-b12" v-for="(item, index) in holdList" :key="index">
                <div class="pad-rl12">
                    <div class="flex-s h-36 border-bottom-1px mar-b8 f16 bold">
                        <div class="title">
                            <span>{{ item.industryName }}</span>
                        </div>
                        <div class="">{{ item | totalRatioFilter }}</div>
                    </div>
                    <div
                        class="h-60 flex-s relative-mask"
                        v-for="(citem, cindex) in item.industryHolding"
                        :key="citem.symbol"
                        :data-index="`${index}_${cindex}`"
                    >
                        <div class="flex1">
                            <div class="f16 elipsis mar-b6 w-221">{{ citem.name }}</div>
                            <div class="flex-c">
                                <span :class="getCurrencyClass(citem)"></span>
                                <span class="c-gray f12 mar-l2 mar-r6">{{ citem.symbol }}</span>
                                <span class="c-gray f12 mar-r6">{{ citem.latestPrice }}</span>
                                <span class="c-gray f12 mar-r6">
                                    (
                                    <span v-riseFall="{ value: citem.day1Return, riseFall: false }"></span>
                                    )
                                </span>
                            </div>
                        </div>
                        <div class="f16">{{ citem.ratio }}%</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { PortfolioHoldingAllocation } from '@/apis/followInvest/index.js'
import { i18n } from '@/i18n/fund/index.js'
import { floatToRatio, isEmpty } from '../../../utils'
import { PORTFOLIO_TYPE_MAP, FUND_TYPE_MAP } from '../config/common'
import assetDistributionPct from './components/assetDistributionPct'

export default {
    name: 'followDistributionDetails',
    components: {
        assetDistributionPct,
    },
    data() {
        return {
            tabIndex: 0,
            fixedAreaHeight: 0,
            holdList: [],
            marketList: [],
            portfolioType: PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK,
            cashValue: 0,
            ratioMap: {},
        }
    },
    filters: {
        totalRatioFilter(i) {
            const ret = i.industryHolding.reduce((t, c) => {
                t += c.ratio ? +c.ratio : 0
                return t
            }, 0)
            return floatToRatio(ret, { rate: true, sign: false })
        },
        totalMarketRatioFilter(i) {
            const ret = i.holding.reduce((t, c) => {
                t += c.ratio ? +c.ratio : 0
                return t
            }, 0)
            return floatToRatio(ret, { rate: true, sign: false })
        },
        marketFilter(i) {
            return ['', i18n.t('HKDMarket'), i18n.t('USDMarket'), ''][i] || '--'
        },
    },
    computed: {
        isFund() {
            return this.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        pctList() {
            let list = []
            if (this.isFund) {
                list = [
                    {
                        key: 'stockFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.stock] || 0,
                        label: this.$t('stockType'),
                    },
                    {
                        key: 'bondFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.bond] || 0,
                        label: this.$t('bondType'),
                    },
                    {
                        key: 'mixtureFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.mixed] || 0,
                        label: this.$t('mixedType'),
                    },
                    {
                        key: 'moneyFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.currency] || 0,
                        label: this.$t('currencyType'),
                    },
                ]
            } else {
                list = [
                    {
                        key: 'hkStock',
                        pct: this.ratioMap[1] || 0,
                        label: this.$t('HKDMarket'),
                    },
                    {
                        key: 'usStock',
                        pct: this.ratioMap[2] || 0,
                        label: this.$t('USDMarket'),
                    },
                ]
            }
            list.sort((a, b) => {
                return b.pct - a.pct
            })
            list.unshift({
                key: 'cash',
                pct: this.cashValue,
                label: this.$t('cash'),
            })
            return list
        },
    },
    created() {
        this.getHoldList()
    },
    mounted() {
        this.fixedAreaChangeHeight()
    },
    methods: {
        isEmpty,
        fixedAreaChangeHeight() {
            this.$nextTick(() => {
                this.fixedAreaHeight = this.$refs.fixedAreaRef?.scrollHeight || 0
            })
        },
        getCurrencyClass(data) {
            if (this.isFund) {
                return `currency-${data.currency.toLocaleUpperCase()}`
            }
            return `market-${data.market.toLocaleUpperCase()}`
        },
        async getHoldList() {
            try {
                const data = await PortfolioHoldingAllocation({
                    id: Number(this.$route.query.portfolioId),
                    queryType: 1,
                })
                const { detail } = data.result
                this.portfolioType = detail?.portfolioType || this.portfolioType
                this.holdList = detail && detail.holding
                this.marketList = detail && detail.marketHolding

                let total = 0
                if (this.isFund) {
                    this.holdList.forEach(item => {
                        this.ratioMap[item.industryCode] = Number(item.ratio)
                        total += Number(item.ratio)
                    })
                } else {
                    this.marketList.forEach(item => {
                        this.ratioMap[item.marketType] = Number(item.ratio)
                        total += Number(item.ratio)
                    })
                }
                this.cashValue = 100 - total
                this.fixedAreaChangeHeight()
                console.log('data===>detail', data, detail)
            } catch (e) {
                console.log('error', e)
            }
        },
        onClick(e) {
            const { index } = e.target.dataset
            if (!index) return
            const [industryIndex, productIndex] = index.split('_')
            const product = this.holdList[industryIndex]?.industryHolding?.[productIndex]
            if (product.fundID) {
                this.$router.push({
                    path: '/detail',
                    query: {
                        symbol: product.fundID,
                        type: 'public',
                    },
                })
            } else {
                this.$jsBridge?.goPage(`stockQuote?stockId=${product.market}${product.symbol}`)
            }
        },
        onMarketClick(item) {
            this.$jsBridge?.goPage(`stockQuote?stockId=${item.market}${item.symbol}`)
        },
        onTabClick(newIndex) {
            this.tabIndex = newIndex
            this.fixedAreaChangeHeight()
        },
    },
}
</script>

<style lang="less" scoped>
.h-36 {
    height: 36px;
}

.h-60 {
    height: 60px;
}

.w-221 {
    width: 221px;
}

.title {
    position: relative;
    padding-left: 0;

    .icon-strip {
        position: absolute;
        top: 4px;
        left: 0;
        display: block;
        width: 3px;
        height: 12px;
        background: #5cceff;
        border-radius: 3px;
    }
}

.c-main {
    .fixed_area {
        position: fixed;
        z-index: 100;
        width: 100%;
        margin: -12px 0 0 -12px;
        padding: 0 12px;
        background: #fff;
        border-bottom: 0.5px solid #efefef;

        .tab {
            height: 36px;

            .tab_item {
                color: #666;
                font-weight: 400;
                font-size: 15px;
                line-height: 21px;

                &:first-of-type {
                    margin-right: 28px;
                }
            }

            .tab_active {
                color: #2f2f2f;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }
        }

        .asset_dist {
            padding: 12px 0;
        }
    }

    .h-60 {
        position: relative;
    }
}

.mar-l2 {
    margin-left: 2px;
}
</style>
