<template>
    <div class="bond-history-price">
        <div class="content" v-if="list && list.length > 0">
            <Table :data="list.slice(0, 8)" :columns="columns" :showEmptyTip="false" :canPullDown="false">
                <template v-slot:MAY="props">
                    <span v-riseFall="{ value: props.item.MAY, base: 3 }"></span>
                </template>
            </Table>
            <div class="content-footer" v-if="list.length > 8" @click="goPage">{{ $t('moreHistoryPrice') }}</div>
        </div>
        <div class="empty" v-else>{{ $t('noData') }}</div>
    </div>
</template>
<script>
import { getPriceHis } from '@/apis/bond'
import Table from '@/components/Table.vue'
import { thousandsFilter } from '@/config/filters.js'
import { keepDecimals } from '@/utils'
export default {
    name: 'bondHistoryPrice',
    components: {
        Table,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            columns: [
                {
                    title: this.$t('date'),
                    key: 'date',
                    fixed: true,
                    style: {
                        width: '1.32rem',
                        'text-align': 'left',
                    },
                },
                {
                    title: this.$t('closingPrice'),
                    key: 'price',
                    style: {
                        width: '0.88rem',
                        'text-align': 'center',
                        'justify-content': 'center',
                    },
                    filter: row => thousandsFilter(keepDecimals(row.price, 3)),
                },
                {
                    title: this.$t('expireIncome'),
                    key: 'MAY',
                    slot: true,
                    style: {
                        flex: '1',
                        'text-align': 'right',
                    },
                },
            ],
            list: [],
        }
    },
    created() {
        this.getList()
    },
    methods: {
        async getList() {
            try {
                const {
                    result: { list = [] },
                } = await getPriceHis({
                    symbol: this.symbol,
                    count: 10,
                    start: 1,
                })
                this.list = list
            } catch (e) {
                console.log('getPriceHis===>error:', e)
            }
        },
        goPage() {
            const url = `${location.origin}/wealth/fund.html#/bond-history-price?symbol=${this.symbol}`
            this.$jsBridge
                ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                : this.$router.push({
                      path: '/bond-history-price',
                      query: {
                          symbol: this.symbol,
                      },
                  })
        },
    },
}
</script>
<style scoped lang="less">
.bond-history-price {
    /deep/ .box {
        .fixed {
            width: 132px;

            .fixed-body {
                .item {
                    height: 40px;
                    color: #2f2f2f;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                }
            }
        }

        .scroll {
            .scroll-title-container {
                left: 132px;
            }

            .body {
                .row {
                    .item {
                        height: 40px;
                    }
                }
            }
        }
    }

    .content {
        display: flex;
        flex-direction: column;

        .title {
            display: flex;
            justify-content: space-between;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 24px;

            span:first-of-type {
                flex: 0 0 132px;
            }

            span:nth-of-type(2) {
                flex: 0 0 88px;
                text-align: center;
            }

            span:nth-of-type(3) {
                flex: 1;
                text-align: right;
            }
        }

        .list {
            li {
                display: flex;
                justify-content: space-between;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
                line-height: 40px;

                span:first-of-type {
                    flex: 0 0 132px;
                }

                span:nth-of-type(2) {
                    flex: 0 0 88px;
                    text-align: center;
                }

                span:nth-of-type(3) {
                    flex: 1;
                    text-align: right;
                }
            }
        }

        .content-footer {
            color: #666;
            font-weight: 400;
            font-size: 12px;
            line-height: 25px;
            text-align: center;
        }
    }
}
</style>
