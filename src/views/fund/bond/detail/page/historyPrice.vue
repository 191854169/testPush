<template>
    <div class="bond-history-price">
        <Table
            :data="list"
            :columns="columns"
            showPullUpLoading
            :showEmptyTip="false"
            :canPullDown="false"
            :canPullUp="canPullUp"
            @pullUpLoad="loadHandler"
        >
            <template v-slot:MAY="props">
                <span v-riseFall="{ value: props.item.MAY, base: 3 }"></span>
            </template>
        </Table>
    </div>
</template>
<script>
import { getPriceHis } from '@/apis/bond'
import { throttle } from 'lodash'
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
            showLoadingOver: false,
            canPullUp: true,
            loadHandler: throttle(this.getList, 1000, { leading: false }),
            start: 1,
            count: 20,
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
                    filter: row => thousandsFilter(keepDecimals(row.price, 3)),
                    style: {
                        width: '0.88rem',
                        'text-align': 'center',
                        'justify-content': 'center',
                    },
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
        async getList(cb = null) {
            const {
                result: { list = [] },
            } = await getPriceHis({
                symbol: this.symbol,
                start: this.start,
                count: this.count,
            })
            if (list.length === 0) {
                // 数据请求完 不在加载
                this.canPullUp = false
                this.showLoadingOver = true
            }
            this.list = this.list.concat(list)
            this.start = this.list.length + 1
            try {
                console.log()
            } catch (e) {
                console.log(e)
            } finally {
                cb && cb()
            }
        },
    },
}
</script>
<style scoped lang="less">
.bond-history-price {
    display: inline-block;
    width: calc(100% - 24px);
    height: calc(100% - 24px);
    margin: 12px;
    padding: 12px;
    background-color: #fff;
    border-radius: 8px;

    /deep/ .box {
        height: 100%;

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
}
</style>
