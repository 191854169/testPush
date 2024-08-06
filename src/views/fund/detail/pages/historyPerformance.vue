// 历史业绩
<template>
    <div class="history-performance">
        <ul class="tabs">
            <li class="tabs-item" :class="{ active: activeTab === tab.key }" v-for="tab in tabs" :key="tab.key" @click="changeTabHandler(tab.key)">
                {{ tab.label }}
            </li>
        </ul>
        <div class="content" v-show="currentList.length > 0">
            <div class="content-header">
                <span class="header-item" v-for="column in columns" :key="column.key">
                    {{ column.title }}
                </span>
            </div>
            <div class="content-body">
                <div class="row" v-for="(item, index) in currentList" :key="activeTab + index">
                    <span class="row-left">{{ item.label }}</span>
                    <span class="row-right" v-riseFall="item.value"></span>
                </div>
            </div>
        </div>
        <empty v-show="currentList.length === 0"></empty>
    </div>
</template>
<script>
import Empty from '@/components/Empty.vue'
import { getHistoryReturn } from '@/apis/fund/fund'

const keyMap = {
    STAGE: 'stage',
    QUATER: 'quater',
    YEAR: 'year',
}
export default {
    name: 'historyPerformance',
    components: {
        Empty,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            activeTab: keyMap.STAGE,
            tabs: [
                { label: this.$t('stargePerformance'), key: keyMap.STAGE },
                { label: this.$t('quaterPerformance'), key: keyMap.QUATER },
                { label: this.$t('yearPerformance'), key: keyMap.YEAR },
            ],
            listMap: {
                [keyMap.STAGE]: { label: this.$t('stargePerformance'), list: [] },
                [keyMap.QUATER]: { label: this.$t('quaterPerformance'), list: [] },
                [keyMap.YEAR]: { label: this.$t('yearPerformance'), list: [] },
            },
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
            rowClass: 'income-table__row',
            titleClass: 'income-table__title',
        }
    },
    computed: {
        currentList() {
            return this.listMap[this.activeTab]?.list || []
        },
    },
    watch: {
        currentList: {
            handler(v) {
                console.log('currentList', v)
            },
        },
    },
    created() {
        this.getList()
    },
    methods: {
        async getList() {
            const quaterMap = {
                '01': '1',
                '04': '2',
                '07': '3',
                10: '4',
            }
            const quarterFormat = (date = '') => {
                if (date === '') return ''
                return `${date.slice(2, 4)}${this.$t('year')}${quaterMap[date.slice(4, 6)]}${this.$t('quarter')}`
            }
            const yearFormat = (date = '') => {
                if (date === '') return ''
                return `${date.slice(2, 4)}${this.$t('annual')}`
            }
            try {
                const { result = {} } = await getHistoryReturn({ symbol: this.symbol })
                const { stage = {}, quarter = [], year = [] } = result
                Object.keys(stage).forEach(key => {
                    this.listMap[keyMap.STAGE].list.push({
                        label: this.incomeKeyMap[key],
                        value: stage[key],
                    })
                })
                this.listMap[keyMap.QUATER].list = quarter.map(item => ({ label: quarterFormat(item.period), value: item.return }))
                this.listMap[keyMap.YEAR].list = year.map(item => ({ label: yearFormat(item.period), value: item.return }))
            } catch (e) {
                console.log(e)
            }
        },
        changeTabHandler(key) {
            this.activeTab = key
        },
    },
}
</script>
<style lang="less">
.history-performance {
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
}
</style>
<style scoped lang="less">
.history-performance {
    width: 100%;
    height: 100vh;
    padding: 12px;
    background: #f5f5f5;
}

.table-content {
    max-height: calc(100% - 61px);
    padding: 12px;
    overflow: auto;
    background-color: #fff;
    border-radius: 8px;

    /deep/.box {
        height: 100%;

        .scroll {
            .scroll-title-container {
                left: 250px;
            }
        }
    }
}

.tabs {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 15px;

    .tabs-item {
        flex: 1;
        color: #666;
        font-weight: 400;
        font-size: 15px;
        line-height: 22px;
        text-align: center;
    }

    .active {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
    }
}

.content {
    max-height: calc(100% - 37px);
    padding: 0 12px 12px;
    overflow: scroll;
    background: #fff;
    border-radius: 8px;

    .content-header {
        position: sticky;
        top: 0;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 36px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
        background: #fff;
    }

    .content-body {
        .row {
            display: flex;
            justify-content: space-between;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 40px;
        }
    }
}
</style>
