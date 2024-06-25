<template>
    <div class="history-module card" id="history-module">
        <header>
            <span :class="{ 'henader-checker': activeHeader === 1 }" @click="activeHeader = 1">{{ $t('historyNet') }}</span>
            <span :class="{ 'henader-checker': activeHeader === 2 }" @click="activeHeader = 2">{{ $t('historyProfit') }}</span>
            <span :class="{ 'henader-checker': activeHeader === 3 }" @click="activeHeader = 3">{{ $t('annualProfit') }}</span>
        </header>
        <div class="body">
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
                <div class="show-more" v-if="showWorthMore" @click="showMoreHandler(2)">
                    <span>{{ $t('loadingMore') }}</span>
                </div>
            </div>
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
                <div class="show-more" v-if="showWorthMore" @click="showMoreHandler(3)">
                    <span>{{ $t('loadingMore') }}</span>
                </div>
            </div>
            <div class="annual" v-show="showAnnual">
                <Table
                    v-show="annual.list.length"
                    class="table-content__income"
                    :data="annual.list"
                    :columns="annual.columns"
                    :rowClass="annual.rowClass"
                    :titleClass="annual.titleClass"
                    :showEmptyTip="false"
                    :canPullDown="false"
                >
                    <template v-slot:return="props">
                        <span v-riseFall="props.item.return"></span>
                    </template>
                </Table>
                <empty v-if="annual.list.length === 0" showImg :tipText="$t('noAnnualProfit')"></empty>
            </div>
        </div>
    </div>
</template>
<script>
import Empty from '@/components/Empty.vue'
import { getHistoryNav, getHistoryReturnV2, getFundQuote } from '@/apis/fund/fund'
import Table from '@/components/Table.vue'
import { floatToRatio } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'

export default {
    name: 'historyModule',
    filters: {
        floatToRatio,
    },
    components: {
        Empty,
        Table,
    },
    data() {
        return {
            activeHeader: 1,
            symbol: this.$route.query.symbol,
            showCount: 6, // 展示条数
            income: {
                columns: [
                    {
                        title: this.$t('historyPeriod'),
                        key: 'label',
                        fixed: true,
                        className: 'income-columns__fixed',
                    },
                    {
                        title: this.$t('profit'),
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
                        style: {
                            width: '1.57rem',
                            'text-align': 'left',
                        },
                    },
                    {
                        title: this.$t('currencyNet'),
                        key: 'nav',
                        className: 'worth-scroll__item',
                        filter: row => thousandsFilter(row.nav),
                        style: {
                            width: '1.57rem',
                            height: 'auto',
                            'align-items': 'flex-start',
                            'justify-content': 'flex-start',
                        },
                    },
                    {
                        title: this.$t('dayChg'),
                        key: 'chgPct',
                        slot: true,
                        className: 'worth-scroll__item',
                    },
                ],
                list: [],
                rowClass: 'worth-table__row',
                titleClass: 'worth-table__title',
            },
            annual: {
                columns: [
                    {
                        title: this.$t('annual'),
                        key: 'period',
                        fixed: true,
                        className: 'income-columns__fixed',
                    },
                    {
                        title: this.$t('profit'),
                        key: 'return',
                        slot: true,
                        className: 'income-columns__scoll',
                    },
                ],
                list: [],
                rowClass: 'income-table__row',
                titleClass: 'income-table__title',
            },
            incomeKeyMap: {
                returnD1: this.$t('nearOneDay'),
                returnW1: this.$t('nearOneWeek'),
                returnM1: this.$t('nearOneMonth'),
                returnM3: this.$t('nearThreeMonth'),
                returnM6: this.$t('nearSixMonth'),
                returnY1: this.$t('nearOneYear'),
                returnY2: this.$t('nearTwoYear'),
                returnY3: this.$t('nearThreeYear'),
                returnY4: this.$t('nearFourYear'),
                returnY5: this.$t('nearFiveYear'),
                returnYTD: this.$t('yearToDay'),
                returnFounded: this.$t('fromFoundedToDay'),
            },
            isFundType: Number(this.$route.query.fundType),
        }
    },
    computed: {
        showWorth() {
            return this.activeHeader === 1
        },
        showIncome() {
            return this.activeHeader === 2
        },
        showAnnual() {
            return this.activeHeader === 3
        },
        showWorthMore() {
            return this.worth.list.length >= this.showCount
        },
        showIncomeMore() {
            return this.income.list.length >= this.showCount
        },
    },
    created() {
        this.getQuote()
        this.getHistoryNav()
        this.getHistoryReturn()
    },
    methods: {
        async getQuote() {
            try {
                const res = await getFundQuote({ symbol: this.$route.query.symbol })
                const resultKey = 'pubQuote'
                if (res.result && res.result[resultKey]) {
                    this.isFundType = Number(res.result[resultKey]['type'])

                    this.activeHeader = 1
                }
            } catch (e) {
                console.log('getQuote===>e:', e)
            }
        },

        // 历史净值
        async getHistoryNav() {
            try {
                const res = await getHistoryNav({
                    symbol: this.symbol,
                    start: 1,
                    count: this.showCount,
                })
                this.worth.list = res.result.list.map(item => {
                    item.date = item.date.replace(/-/g, '/')
                    return item
                })
            } catch (e) {
                console.log(e)
            }
        },

        // 历史收益
        async getHistoryReturn() {
            try {
                const { result = {} } = await getHistoryReturnV2({
                    symbol: this.symbol,
                })
                const stage = result.stage || {} // 历史收益
                const yearReturn = result.year || [] // 年度收益
                Object.keys(this.incomeKeyMap).forEach(key => {
                    if (this.income.list.length >= this.showCount) return
                    this.income.list.push({
                        label: this.incomeKeyMap[key],
                        value: stage[key] || '--',
                        key,
                    })
                })
                yearReturn.forEach(item => {
                    this.annual.list.push({
                        period: item.period,
                        return: item.return,
                    })
                })
            } catch (e) {
                console.log('getHistoryReturnV2=>e:', e)
            }
        },
        showMoreHandler(val) {
            const path =
                {
                    2: '/history-page',
                    3: '/history-profit',
                }[val] || ''
            if (!path) return
            const query = {
                symbol: this.symbol,
                currencyHistory: val,
                type: this.$route.query.type,
            }
            this.$goPage(path, query)
        },
    },
}
</script>
<style lang="less">
.history-module {
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
.card {
    margin: 0 12px;
    margin-top: 12px;
    padding: 8px 0 20px;
    background: #fff;
    border-radius: 8px;
}

.history-module {
    padding: 0 12px;
}

.body {
    height: 304px;
    overflow: hidden;
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

.annual {
    height: 100%;

    .empty {
        height: 100% !important;
    }
}
</style>
