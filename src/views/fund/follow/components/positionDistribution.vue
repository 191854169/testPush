<template>
    <div class="card tjlist">
        <div class="title">
            <div>{{ $t('follow.positionDistribution') }}</div>
            <div class="right" @click="toMorePage()" v-if="!hideFlag">
                <span class="txt">{{ $t('follow.distributeTitle') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <div>
            <div v-if="isFund" class="pad-rl12">
                <invest-compose-chart :centerText="$t('marketDistribute')" :list="industryChartData"></invest-compose-chart>
            </div>
            <div v-else class="pad-rl12">
                <!-- 市场分布 -->
                <invest-compose-chart class="margin-0" :centerText="$t('marketDistribute')" :list="marketChartData"></invest-compose-chart>
                <!-- 行业分布 -->
                <invest-compose-chart
                    v-if="!isEmpty(industryChartData)"
                    class="margin-0"
                    :centerText="$t('industryDistribute')"
                    :list="industryChartData"
                ></invest-compose-chart>
            </div>

            <div class="table-wrapper pos-r">
                <Table
                    ref="table"
                    class="content-table position-distribution-table pad-rl12"
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
                    @rowClick="listClickHander"
                >
                    <!-- 固定列：基金名 -->
                    <template v-slot:name="props">
                        <div class="flex-content">
                            <div class="fund-name line-elipsis mar-b4">{{ props.item.name }}</div>
                            <div class="flex-c mar-t2">
                                <span :class="currencyClass(props.item)"></span>
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
                <account-mask v-if="hideFlag" />
            </div>
        </div>
    </div>
</template>

<script>
import InvestComposeChart from '../../detail/components/InvestComposeChart.vue'
import accountMask from './accountMask.vue'
import Table from '@/components/Table.vue'
import { PortfolioHoldingAllocation } from '@/apis/followInvest/index.js'
import { PORTFOLIO_TYPE_MAP } from '../../config/common'
import NP from 'number-precision'
import { isEmpty, toFixed } from '@/utils'

export default {
    name: 'positionDistribution',
    components: {
        InvestComposeChart,
        Table,
        accountMask,
    },
    data() {
        return {
            hideFlag: true,
            asset: { list: [], updateTime: '' },
            industryChartData: [],
            marketChartData: [],
            columns: [
                {
                    title: this.$t('fundSelectionByStock.stockName'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                },
                {
                    title: this.$t('follow.holdRatio'),
                    key: 'ratio',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.64rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('follow.holdDayNum'),
                    key: 'holdDayNum',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.64rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('dayChg'),
                    key: 'day1Return',
                    sort: this.sort,
                    slot: true,
                    style: {
                        width: '0.71rem',
                        'text-align': 'right',
                    },
                },
            ],
            list: [],
            portfolioType: PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK,
        }
    },
    computed: {
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
        isFund() {
            return this.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
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
        isEmpty,
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

                if (result) {
                    const { overview } = result
                    if (overview) {
                        const colorMap = {
                            stock: {
                                stockHk: '#8F4BE5',
                                stockUs: '#3B95FF',
                            },
                            fund: {
                                1: '#3B95FF',
                                2: '#C448FF',
                                3: '#16B1BD',
                                4: '#FF5B8C',
                            },
                        }
                        this.portfolioType = overview.portfolioType
                        let total = 0
                        // 图表所需数据，需转换
                        this.industryChartData = overview.industry.map(item => {
                            total = NP.plus(total, item.ratio)
                            item.value = item.ratio
                            if (this.isFund) {
                                item.color = colorMap['fund'][item.code]
                            }
                            return item
                        })
                        if (this.isFund && NP.minus(100, total) > 0.01) {
                            this.industryChartData.unshift({ name: this.$t('cash'), value: toFixed(NP.minus(100, total), 2), color: '#FF6907' })
                        }

                        const map = {
                            stockHk: this.$t('follow.hkStock'),
                            stockUs: this.$t('follow.usStock'),
                        }
                        const keys = ['stockHk', 'stockUs']

                        this.marketChartData = keys
                            .filter(k => Number(overview.market[k]) > 0)
                            .sort((a, b) => Number(overview.market[b]) - Number(overview.market[a]))
                            .map(key => {
                                const item = { name: map[key], value: overview.market[key], color: colorMap['stock'][key] }
                                return item
                            })
                        if (Number(overview.market.cash) > 0.01) {
                            this.marketChartData.unshift({ name: this.$t('cash'), value: overview.market.cash, color: '#FF6907' })
                        }
                        this.list = overview.leadHolding
                        if (this.list.length > 3) {
                            this.list = this.list.slice(0, 3)
                        }
                        this.columns[0].title = this.$t(this.isFund ? 'fundName' : 'fundSelectionByStock.stockName')
                    }
                }
            } catch (e) {
                console.log('eror', e)
            }
        },
        currencyClass(item) {
            if (this.isFund) {
                return `currency-${item.currency?.toLocaleUpperCase()}`
            }
            return `market-${item.market?.toLocaleUpperCase()}`
        },
        openAccount() {},
        listClickHander(data) {
            if (this.isFund) {
                const url = `${location.origin}${location.pathname}#/detail?symbol=${data.fundID}&type=public`
                if (this.$jsBridge) {
                    this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                } else {
                    this.$router.push({
                        path: '/detail',
                        query: {
                            symbol: data.fundID,
                            type: 'public',
                        },
                    })
                }
            } else {
                this.$jsBridge?.goPage(`stockQuote?stockId=${data.market}${data.symbol}`)
            }
        },
        toMorePage() {
            const url = `${location.origin}${location.pathname}#/follow-distribution-details?portfolioId=${this.$route.query.portfolioId}`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/follow-distribution-details',
                    query: {
                        portfolioId: this.$route.query.portfolioId,
                    },
                })
            }
        },
    },
}
</script>

<style lang="less" scoped>
/deep/ .position-distribution-table {
    flex: 1;

    .fixed {
        width: 128px !important;

        .title {
            padding-left: 12px;
        }

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
            left: 12px;
        }

        .item {
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

.table-wrapper {
    margin-top: 8px;

    .content-table {
        &.hide {
            filter: blur(6px);
        }
    }
}

.card {
    #foreground();

    border-radius: 8px;

    &.shadow {
        background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
        box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
        backdrop-filter: blur(27px);
    }
}

.tjlist {
    padding: 8px 0 12px;

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px 12px 0;
        overflow: hidden;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;
        #font_h1();

        .right {
            display: flex;
            align-items: center;
            color: @h3-white;
            font-weight: 400;
            font-size: 12px;
            font-family: 'PingFang SC';
            line-height: 22px;

            .arrowicon {
                width: 12px;
                height: 12px;
                vertical-align: middle;
            }

            .txt {
                margin-right: 3px;
                vertical-align: middle;
            }
        }
    }
}

.mar-l2 {
    margin-left: 2px;
}

.margin-0 {
    margin: 0;
}
</style>
<style lang="less">
.dist_table__row {
    height: 48px !important;
    color: #2f2f2f;
}
</style>
