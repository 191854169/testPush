<template>
    <div class="private-history-module" id="private-history-module">
        <header>
            <span :class="{ 'henader-checker': activeHeader === 1 }" @click="activeHeader = 1">{{ $t('historyPerformance') }}</span>
            <span :class="{ 'henader-checker': activeHeader === 2 }" @click="activeHeader = 2">{{ $t('historyNet') }}</span>
        </header>
        <div class="body">
            <!-- 历史业绩 -->
            <div class="income" v-show="showIncome">
                <Table
                    class="table-content__income"
                    :data="income.list"
                    :columns="income.columns"
                    :rowClass="income.rowClass"
                    :titleClass="income.titleClass"
                    :showEmptyTip="false"
                    :canPullDown="false"
                >
                    <template v-slot:value="props">
                        <span v-riseFall="props.item.value"></span>
                    </template>
                </Table>
                <empty v-if="income.list.length === 0"></empty>
                <div class="show-more" v-if="income.list.length > 0" @click="showIncomeHandler">
                    <span>{{ $t('morePerformanceData') }}</span>
                </div>
            </div>
            <!-- 历史净值 -->
            <div class="worth" v-show="showWorth">
                <Table
                    class="table-content__worth"
                    :data="worth.list"
                    :columns="worth.columns"
                    :rowClass="worth.rowClass"
                    :titleClass="worth.titleClass"
                    :showEmptyTip="false"
                    :canPullDown="false"
                >
                    <template v-slot:chgPct="props">
                        <span v-riseFall="props.item.chgPct"></span>
                    </template>
                </Table>
                <empty v-if="worth.list.length === 0"></empty>
                <div class="show-more" v-if="showWorthMore" @click="showMoreHandler">
                    <span>{{ $t('moreHistoryNet') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import Empty from '@/components/Empty.vue'
import { getHistoryNav, getHistoryReturnV2 } from '@/apis/fund/fund'
import Table from '@/components/Table.vue'
import { floatToRatio } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'

export default {
    name: 'privateHistoryModule',
    filters: {
        floatToRatio,
    },
    components: {
        Empty,
        Table,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            activeHeader: 1,
            historyWorthCount: 6, // 历史净值展示条数
            income: {
                columns: [
                    {
                        title: this.$t('historyPeriod'),
                        key: 'label',
                        fixed: true,
                        className: 'income-columns__fixed',
                    },
                    {
                        title: this.$t('priceChange'),
                        key: 'value',
                        slot: true,
                        className: 'income-columns__scoll',
                    },
                ],
                list: [],
                rowClass: 'income-table__row',
                titleClass: 'income-table__title',
            },
            worth: {
                columns: [
                    {
                        title: this.$t('date'),
                        key: 'date',
                        fixed: true,
                        className: 'worth-columns__fixed',
                    },
                    {
                        title: this.$t('currencyNet'),
                        key: 'nav',
                        className: 'worth-scroll__item',
                        filter: row => thousandsFilter(row.nav),
                    },
                    {
                        title: this.$t('priceChange'),
                        key: 'chgPct',
                        slot: true,
                        className: 'worth-scroll__item',
                    },
                ],
                list: [],
                rowClass: 'worth-table__row',
                titleClass: 'worth-table__title',
            },
            incomeKeyMap: {
                returnD1: this.$t('nearOneDay'),
                returnW1: this.$t('nearOneWeek'),
                returnM1: this.$t('nearOneMonth'),
                returnM3: this.$t('nearThreeMonth'),
                returnM6: this.$t('nearSixMonth'),
                returnY1: this.$t('nearOneYear'),
                returnYTD: this.$t('yearToDay'),
                returnFounded: this.$t('fromFoundedToDay'),
            },
        }
    },
    computed: {
        showWorth() {
            return this.activeHeader === 2
        },
        showIncome() {
            return this.activeHeader === 1
        },
        showWorthMore() {
            return this.worth.list.length >= this.historyWorthCount
        },
    },
    created() {
        this.getHistoryNav()
        this.getHistoryReturn()
    },
    methods: {
        // 历史净值
        async getHistoryNav() {
            try {
                const res = await getHistoryNav({
                    symbol: this.symbol,
                    start: 1,
                    count: this.historyWorthCount,
                })
                this.worth.list = res.result.list.map(item => {
                    item.date = item.date.replace(/-/g, '/')
                    return item
                })
            } catch (e) {
                console.log(e)
            }
        },
        // 历史业绩
        async getHistoryReturn() {
            try {
                const res = await getHistoryReturnV2({
                    symbol: this.symbol,
                })
                const stage = res.result?.stage || {}
                Object.keys(stage).forEach(key => {
                    this.income.list.push({
                        label: this.incomeKeyMap[key],
                        value: stage[key],
                        key,
                    })
                })
            } catch (e) {
                console.log('getHistoryReturn=>e:', e)
            }
        },
        // 历史业绩
        showIncomeHandler() {
            const url = `${location.origin}/wealth/fund.html#/history-performance?symbol=${this.symbol}`
            JSBridge
                ? JSBridge.open({ url: encodeURIComponent(url), title: this.$t('historyPerformance') })
                : this.$router.push({
                      path: '/history-performance',
                      query: {
                          symbol: this.symbol,
                      },
                  })
        },
        // 历史净值
        showMoreHandler() {
            const url = `${location.origin}/wealth/fund.html#/history-page?type=private&symbol=${this.symbol}`
            console.warn('url', url)
            JSBridge
                ? JSBridge.open({ url: encodeURIComponent(url), title: this.$t('historyNet') })
                : this.$router.push({
                      path: '/history-page',
                      query: {
                          symbol: this.symbol,
                          type: 'private',
                      },
                  })
        },
    },
}
</script>
<style lang="less">
.private-history-module {
    .income-table__row {
        height: 40px !important;
        color: #2f2f2f;
        font-size: 14px !important;
    }

    .income-table__title {
        width: 250px !important;
    }

    .income-columns__fixed {
        width: 250px !important;
        text-align: left;
    }

    .income-columns__scoll {
        width: 77px !important;
        text-align: right;
    }

    .worth-table__row {
        height: 40px !important;
        color: #2f2f2f;
        font-size: 14px !important;
    }

    .worth-table__title {
        width: 157px !important;
    }

    .worth-columns__fixed {
        width: 157px !important;
        text-align: left;
    }

    .worth-scroll__item {
        justify-content: center;
        width: 85px !important;
        text-align: right;
    }
}
</style>
<style scoped lang="less">
.private-history-module {
    margin: 8px 12px 0;
    padding: 0 12px;
    background: #fff;
    border-radius: 8px;
}

header {
    display: flex;
    align-items: center;
    padding: 15px 0 7px;
    color: #666;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;

    .henader-checker {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
    }

    span {
        margin-right: 28px;
    }
}

.table-content__worth {
    min-height: 0;

    /deep/ .scroll {
        .scroll-title-container {
            left: 157px;
        }
    }
}

.table-content__income {
    min-height: 0;

    /deep/ .scroll {
        .scroll-title-container {
            left: 250px;
        }
    }
}

.show-more {
    height: 40px;
    color: #666;
    font-weight: 400;
    font-size: 12px;
    line-height: 40px;
    text-align: center;
}

.income {
    .content-header {
        display: flex;
        justify-content: space-between;
        height: 24px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
    }

    .content {
        .content-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 40px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            .item-label {
                max-width: 206px;
            }
        }
    }
}
</style>
