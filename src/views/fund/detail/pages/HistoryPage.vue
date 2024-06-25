<template>
    <div class="history-page">
        <Table
            class="table-content"
            :data="list"
            :canPullDown="false"
            :canPullUp="canPullUp"
            :showLoadingOver="showLoadingOver"
            :columns="isCurrencyHistory ? columns2 : columns"
            :rowClass="rowClass"
            :titleClass="titleClass"
            :showPullUpLoading="true"
            @pullUpLoad="loadHandler"
        >
            <template v-if="isCurrencyHistory" v-slot:returnD7ToY1="props">
                <span v-riseFall="{ value: props.item.returnD7ToY1, base: 4 }"></span>
            </template>
            <template v-else v-slot:chgPct="props">
                <span v-riseFall="props.item.chgPct"></span>
            </template>
        </Table>
    </div>
</template>
<script>
import { getHistoryNav, getCurrencyTrend } from '@/apis/fund/fund'
import Table from '@/components/Table.vue'
import { throttle } from 'lodash'
import { thousandsFilter } from '@/config/filters.js'
export default {
    name: 'historyPage',
    components: {
        Table,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            type: this.$route.query.type,
            showLoadingOver: false,
            canPullUp: true,
            loadHandler: throttle(this.$route.query.currencyHistory == 1 ? this.getCurrencyTrend : this.getHistoryNav, 1000, { leading: false }),
            start: 1,
            count: 20,
            columns: [
                {
                    title: this.$t('date'),
                    key: 'date',
                    fixed: true,
                    className: 'history-page__columns__fixed',
                },
                {
                    title: this.$t('currencyNet'),
                    key: 'nav',
                    className: 'history-page__columns__scroll',
                    filter: row => thousandsFilter(row.nav),
                    style: {
                        'text-align': 'center',
                        'justify-content': 'center',
                    },
                },
                {
                    title: this.$route.query.type === 'private' ? this.$t('priceChange') : this.$t('dayChg'),
                    key: 'chgPct',
                    slot: true,
                    className: 'history-page__columns__scroll',
                    style: {
                        'text-align': 'right',
                    },
                },
            ],
            columns2: [
                {
                    title: this.$t('date'),
                    key: 'date',
                    fixed: true,
                    className: 'history-page__columns__fixed',
                },
                {
                    title: this.$t('wfIncome'),
                    key: 'income10k',
                    className: 'history-page__columns__scroll',
                    filter: row => thousandsFilter(row.income10k),
                    style: {
                        'text-align': 'center',
                        'justify-content': 'center',
                    },
                },
                {
                    title: this.$t('day7Annual'),
                    key: 'returnD7ToY1',
                    slot: true,
                    className: 'history-page__columns__scroll',
                    style: {
                        'text-align': 'right',
                    },
                },
            ],
            list: [],
            rowClass: 'history-page__row',
            titleClass: 'history-page__title',
        }
    },
    computed: {
        isCurrencyHistory() {
            if (this.$route.query.currencyHistory == 1) {
                document.title = this.$t('hisDay7Annual')
                return true
            }
            document.title = this.$t('historyNet')
            return false
        },
    },
    created() {
        if (this.isCurrencyHistory) {
            this.getCurrencyTrend()
        } else {
            this.getHistoryNav()
        }
    },
    methods: {
        async getHistoryNav(cb = null) {
            try {
                const res = await getHistoryNav({
                    symbol: this.symbol,
                    start: this.start,
                    count: this.count,
                })
                const list = res.result.list.map(item => {
                    item.date = item.date.replace(/-/g, '/')
                    return item
                })
                if (list.length === 0) {
                    // 数据请求完 不在加载
                    this.canPullUp = false
                    this.showLoadingOver = true
                }
                this.list = this.list.concat(list)
                this.start = this.list.length + 1
            } catch (e) {
                console.log('getHistoryNav=>e:', e)
            } finally {
                cb && cb()
            }
        },
        //历史七日年化
        async getCurrencyTrend(cb = null) {
            try {
                const res = await getCurrencyTrend({
                    symbol: this.symbol,
                    type: 0,
                    start: this.start,
                    count: this.count,
                })
                const list = res.result.list
                if (list.length === 0) {
                    // 数据请求完 不在加载
                    this.canPullUp = false
                    this.showLoadingOver = true
                }
                this.list = this.list.concat(list)
                this.start = this.list.length + 1
            } catch (e) {
                console.log('getHistoryNav=>e:', e)
            } finally {
                cb && cb()
            }
        },
    },
}
</script>
<style lang="less">
.history-page__row {
    height: 40px !important;
    color: #2f2f2f;
    font-size: 14px !important;
}

.history-page__title {
    width: 157px !important;
}

.history-page__columns__fixed {
    width: 157px !important;
    text-align: left;
}

.history-page__columns__scroll {
    width: 85px !important;
}
</style>
<style lang="less" scoped>
/deep/ .box {
    .scroll {
        .scroll-title-container {
            left: 157px;
        }
    }
}
</style>
<style scoped lang="less">
.history-page {
    display: inline-block;
    width: calc(100% - 24px);
    height: calc(100% - 24px);
    margin: 12px;
    padding: 8px 0 8px 12px;
    overflow: auto;
    background-color: #fff;
    border-radius: 8px;

    .table-content {
        height: 100%;
    }
}
</style>
