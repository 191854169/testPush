<template>
    <div class="hold-list" v-show="list.length || canShowEmpty">
        <div class="content" v-if="list.length">
            <header>
                <multi-img :name="accountIcon" directory="common" />
                <p>{{ curAccount }}</p>
            </header>
            <f-table :data="list" :columns="columns" :canPullDown="false" @rowClick="clickHandler">
                <template v-slot:fundName="props">
                    <div class="flex-content">
                        <div class="fund-name line-elipsis">{{ props.item.fundName }}</div>
                        <div class="fund-info">
                            <div class="fund-info_currency" :class="[`currency-${props.item.currency}`]"></div>
                            <span class="fund-info_isin">ISIN:{{ props.item.isin }}</span>
                        </div>
                    </div>
                </template>
                <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                    <div v-if="key === 'profitloss'" :key="key" v-riseFall="{ value: props.item[key], normal: true, rate: false }"></div>
                    <div v-else-if="key === 'yesterdayProfitloss'" :key="key">
                        <span v-if="isUpdateYesterdayProfitloss(props.item)">{{ $t('updating') }}</span>
                        <span v-else v-riseFall="{ value: props.item[key], normal: true, rate: false }"></span>
                    </div>
                    <div v-else-if="key === 'marketValue'" :key="key" ref="marketValue">
                        {{ props.item.marketValue | thousandsFilter }}
                    </div>
                    <div v-else-if="key !== 'yesterdayProfitloss'" :key="key" v-riseFall="{ value: props.item[key], normal: true }"></div>
                </template>
            </f-table>
        </div>
        <section class="noData" v-else>
            <multi-img class="noDataImg" name="noData" directory="common" alt="noData"></multi-img>
            <span>{{ $t('zwcc') }}</span>
        </section>
    </div>
</template>
<script>
import FTable from '@/components/Table.vue'
import { thousandsFilter } from '@/config/filters.js'
import { accountMap } from '@/config/common'
import { dynamicFontSize } from '@/utils'

const accountKeyValueMap = accountMap.keyValueMap

export default {
    name: 'holdList',
    components: {
        FTable,
    },
    props: {
        accountType: {
            type: String,
            default: '',
        },
        list: {
            type: Array,
            default: () => [],
        },
        summary: {
            type: Object,
            default: () => ({}),
        },
        canShowEmpty: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            columns: [
                {
                    title: this.$t('name'),
                    key: 'fundName',
                    slot: true,
                    style: {
                        width: '1.76rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('newIncome'),
                    key: 'yesterdayProfitloss',
                    slot: true,
                    style: {
                        width: '0.84rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: this.$t('holdlingAmount'),
                    key: 'marketValue',
                    slot: true,
                    style: {
                        width: '1rem',
                        'text-align': 'right',
                    },
                    filter: row => {
                        return thousandsFilter(row.marketValue)
                    },
                },
                {
                    title: this.$t('holdingQuantity'),
                    key: 'quantity',
                    style: {
                        width: '0.84rem',
                        'text-align': 'right',
                    },
                    filter: row => {
                        return thousandsFilter(row.quantity)
                    },
                },
                {
                    title: this.$t('holdingProfit'),
                    key: 'profitloss',
                    slot: true,
                    style: {
                        width: '0.84rem',
                        'text-align': 'right',
                    },
                    filter: row => {
                        return thousandsFilter(row.profitloss)
                    },
                },
                {
                    title: this.$t('holdingProfitRatio'),
                    key: 'profitlossRate',
                    slot: true,
                    style: {
                        width: '0.96rem',
                        'text-align': 'right',
                        'padding-right': '0.12rem',
                    },
                },
            ],
        }
    },
    computed: {
        curAccount() {
            return accountKeyValueMap[this.accountType] || ''
        },
        accountIcon() {
            return `account-type__${this.accountType}`
        },
        slotScollColumnKeys() {
            return this.columns.filter((item, index) => item.slot && index !== 0).map(item => item.key)
        },
    },
    watch: {
        list: {
            handler() {
                this.$nextTick(() => {
                    const domList = this.$refs.marketValue || []
                    domList.forEach(el => {
                        dynamicFontSize({
                            dom: el,
                            minFontSize: 12,
                            maxFontSize: 14,
                            context: this,
                        })
                    })
                })
            },
            immediate: true,
        },
    },
    methods: {
        clickHandler(rowData) {
            const url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${rowData.symbol}&fundType=${rowData.type}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                window.location.href = url
            }
        },
        // 是否显示更新中
        isUpdateYesterdayProfitloss(row) {
            const summary = this.summary
            const yesterdayProfitloss = row.yesterdayProfitloss
            const totalMarketValue = summary?.totalMarketValue ? summary.totalMarketValue : 0
            // 如果有持仓 但是昨收为空 显示更新中
            return totalMarketValue > 0 && yesterdayProfitloss === ''
        },
    },
}
</script>
<style scoped lang="less">
.hold-list {
    padding-left: 12px;
    background-color: #fff;
    border-radius: 8px;

    header {
        display: flex;
        align-items: center;
        padding: 10px 0;
        border-bottom: 0.5px solid #efefef;

        img {
            width: 16px;
            height: 16px;
            margin-right: 6px;
        }

        p {
            color: #2f2f2f;
            font-weight: 400;
            font-size: 16px;
            line-height: 22px;
        }
    }
}

.noData {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 55px 0;
    background-color: #fff;

    .noDataImg {
        width: 104px;
        height: 104px;
        margin-bottom: 8px;
    }
}

.flex-content {
    display: flex;
    flex-direction: column;

    .fund-name {
        width: 176px;
        color: #1f1f1f;
        font-weight: 400;
        font-size: 15px;
        line-height: 22px;
    }

    .fund-info {
        display: flex;
        align-items: center;

        .fund-info_currency {
            margin-right: 5px;
        }

        .fund-info_isin {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 12px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 10px;
            line-height: 12px;
        }
    }
}
</style>
<style lang="less" scoped>
/deep/ .box {
    .fixed-body {
        .item {
            border-bottom: 0.5px solid #efefef;
        }

        .item:last-of-type {
            border-bottom-width: 0;
        }
    }

    .scroll {
        .body {
            .row {
                .item {
                    border-bottom: 0.5px solid #efefef;
                }
            }

            .row:last-of-type {
                .item {
                    border-bottom-width: 0;
                }
            }
        }
    }
}
</style>
