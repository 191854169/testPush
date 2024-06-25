<template>
    <div class="history-profit">
        <Table
            class="table-content"
            :data="list"
            :showEmptyTip="!isloading"
            :canPullDown="false"
            :canPullUp="canPullUp"
            :showLoadingOver="showLoadingOver"
            :columns="columns"
            :rowClass="rowClass"
            :titleClass="titleClass"
            :showPullUpLoading="false"
        >
            <template v-slot:value="props">
                <span v-riseFall="props.item.value"></span>
            </template>
        </Table>
    </div>
</template>
<script>
import { getHistoryReturnV2 } from '@/apis/fund/fund'
import Table from '@/components/Table.vue'
export default {
    name: 'historyProfit',
    components: {
        Table,
    },
    data() {
        return {
            isloading: false,
            symbol: this.$route.query.symbol,
            showLoadingOver: false,
            canPullUp: false,
            start: 1,
            count: 20,
            columns: [
                {
                    title: this.$t('historyPeriod'),
                    key: 'label',
                    fixed: true,
                    className: 'history-profit__columns__fixed',
                },
                {
                    title: this.$t('profit'),
                    key: 'value',
                    slot: true,
                    className: 'history-profit__columns__scroll',
                },
            ],
            list: [],
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
            rowClass: 'history-profit__row',
            titleClass: 'history-profit__title',
        }
    },
    async mounted() {
        this.isloading = this.$loading.show = true
        await this.getHistoryReturn()
        this.isloading = this.$loading.show = false
    },
    methods: {
        async getHistoryReturn() {
            try {
                const { result = {} } = await getHistoryReturnV2({
                    symbol: this.symbol,
                })
                const stage = result.stage || {} // 历史收益
                Object.keys(this.incomeKeyMap).forEach(key => {
                    this.list.push({
                        label: this.incomeKeyMap[key],
                        value: stage[key] || '--',
                        key,
                    })
                })
            } catch (e) {
                console.log('getHistoryReturnV2=>e:', e)
            }
        },
    },
}
</script>
<style lang="less">
.history-profit__row {
    height: 40px !important;
    color: #2f2f2f;
    font-size: 14px !important;
}

.history-profit__title {
    width: 250px !important;
}

.history-profit__columns__fixed {
    width: 250px !important;
    text-align: left;
}

.history-profit__columns__scroll {
    width: 77px !important;
    text-align: right;
}
</style>
<style lang="less" scoped>
/deep/ .box {
    .scroll {
        .scroll-title-container {
            left: 250px;
        }
    }
}
</style>
<style scoped lang="less">
.history-profit {
    display: inline-block;
    width: calc(100% - 24px);
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
