<!-- 组合仓位分享 UI -->
<template>
    <div>
        <section>
            <assetDistributionPct :pctList="pctList"></assetDistributionPct>
        </section>
        <section>
            <div class="table-wrapper pos-r">
                <Table
                    v-if="!hideFlag"
                    ref="table"
                    class="content-table position-distribution-table"
                    :class="{ hide: hideFlag }"
                    :rowClass="'dist_table__row'"
                    :border="false"
                    :data="list"
                    :columns="columns"
                    :emptyPlaceholder="$t('fundList.noFund')"
                    :canPullDown="false"
                    :showEmptyTip="false"
                    :canPullUp="false"
                    :loadingOverMsg="$t('fundList.noMoreFund')"
                >
                    <!-- 固定列：基金名 -->
                    <template v-slot:name="props">
                        <div class="flex-content">
                            <div class="fund-name line-elipsis mar-b4">{{ props.item.name }}</div>
                            <div class="flex-c mar-t2">
                                <span class="currency" :class="currencyClass(props.item)"></span>
                                <span class="c-gray f12 mar-l2">{{ props.item.productCode }}</span>
                            </div>
                        </div>
                    </template>
                    <!-- 滚动列：基金其他信息 -->
                    <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                        <div class="scoll-content" :key="key">
                            <template v-if="key === 'ratio' || key === 'holdDayNum'">
                                <div class="content-top" v-if="key === 'ratio'">{{ props.item[key] ? props.item[key] + '%' : '--' }}</div>
                                <div class="content-top" v-if="key === 'holdDayNum'">{{ props.item[key] || '--' }}</div>
                            </template>
                            <div class="content-top" v-else v-riseFall="props.item[key]"></div>
                        </div>
                    </template>
                </Table>

                <div v-else>
                    <multi-img name="list_mask_bg" directory="fund" />
                    <account-mask class="mask" />
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import assetDistributionPct from '../assetDistributionPct.vue'
import accountMask from '../accountMask.vue'
import Table from '@/components/Table.vue'
import { PORTFOLIO_TYPE_MAP, FUND_TYPE_MAP } from '../../../config/common'
import { PortfolioHoldingAllocation } from '@/apis/followInvest/index.js'

export default {
    name: 'share-portfolio-distribution',
    components: {
        assetDistributionPct,
        accountMask,
        Table,
    },
    data() {
        return {
            columns: [
                {
                    title: this.$t('fundSelectionByStock.stockName'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                    className: 'column-name',
                },
                {
                    title: this.$t('follow.holdRatio'),
                    key: 'ratio',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.66rem',
                        'text-align': 'right',
                    },
                    className: 'column-ratio',
                },
                {
                    title: this.$t('follow.holdDayNum'),
                    key: 'holdDayNum',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.66rem',
                        'text-align': 'right',
                    },
                    className: 'column-holdDayNum',
                },
                {
                    title: this.$t('dayChg'),
                    key: 'day1Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.72rem',
                        'text-align': 'right',
                    },
                    className: 'column-day1Return',
                },
            ],
            hideFlag: true,
            portfolioType: PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK,
            cashValue: 0,
            ratioMap: {},
            list: [],
        }
    },
    computed: {
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
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
        if (this.$root.isLogin) {
            this.getData()
        } else {
            this.getMockData()
        }
    },
    watch: {
        '$root.isLogin': {
            handler(v) {
                if (typeof v === 'boolean') {
                    this.hideFlag = !this.$root.isLogin
                    this.getData().then(() => {
                        if (this.hideFlag) {
                            // 这个Mock 只mock部分数据
                            this.getMockData()
                        }
                    })
                }
            },
            immediate: true,
        },
    },
    methods: {
        currencyClass(item) {
            if (this.isFund) {
                return `currency-${item.currency?.toLocaleUpperCase()}`
            }
            return `market-${item.market?.toLocaleUpperCase()}`
        },
        getMockData() {
            this.list = Array.from({ length: 3 }).map(() => ({
                currency: 'HKD',
                day1Return: '33.50',
                holdDayNum: 12,
                investObjective: 0,
                investYear: 0,
                isDerivative: 0,
                latestPrice: '345.200',
                minInitial: '',
                minTradeUnit: 100,
                name: '腾讯控股',
                ratio: '40.23',
                riskRating: 0,
                symbol: '00700',
            }))
        },
        // 获取数据
        async getData(queryType = 0) {
            try {
                const { result } = await PortfolioHoldingAllocation({
                    id: Number(this.$route.query.portfolioId),
                    queryType,
                })
                console.log('share-distribution result', result)
                if (result) {
                    const { overview, detail } = result
                    if (overview) {
                        this.portfolioType = overview.portfolioType
                        this.list = overview.leadHolding
                        if (this.list.length > 3) {
                            this.list = this.list.slice(0, 3)
                        }
                        console.log('share-distribution list', this.list)
                        this.columns[0].title = this.$t(this.isFund ? 'fundName' : 'fundSelectionByStock.stockName')
                    }

                    if (detail) {
                        this.portfolioType = detail.portfolioType
                        let total = 0
                        if (this.isFund) {
                            detail.holding.forEach(item => {
                                this.ratioMap[item.industryCode] = Number(item.ratio)
                                total += Number(item.ratio)
                            })
                        } else {
                            detail.marketHolding.forEach(item => {
                                this.ratioMap[item.marketType] = Number(item.ratio)
                                total += Number(item.ratio)
                            })
                        }
                        this.cashValue = 100 - total
                    }
                }
            } catch (e) {
                console.log('eror', e)
            }
        },
    },
}
</script>

<style scoped lang="less">
/deep/ .position-distribution-table {
    flex: 1;

    .fixed {
        width: 128px !important;

        .item {
            height: 48px;
        }

        .fund-name {
            width: 128px;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .scroll {
        .scroll-title-container {
            left: 128px;
        }

        .titleItem {
            position: relative;
            left: 11px;
        }

        .item {
            position: relative;
            left: 11px;
            height: 48px;
        }
    }

    .loading-over {
        padding-right: 12px;
    }

    .content-top {
        font-weight: normal;
        font-size: 14px;
    }
}

/deep/ .mask {
    background-color: rgba(255, 255, 255, 0);
}

.table-wrapper {
    margin-top: 8px;
}

.dist_table__row {
    height: 48px !important;
    color: #2f2f2f;
}

.currency {
    margin-top: 2px;
    margin-right: 2px;
}
</style>
