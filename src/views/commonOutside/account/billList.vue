<template>
    <div class="holding-list-container" v-if="holdDataList && holdDataList.length > 0">
        <!-- 标题 -->
        <div class="flex-s pad-t16 pad-b8">
            <!-- 基金类型 -->
            <div class="f16 font-bold">票据</div>
        </div>

        <!-- 列表 -->
        <Table
            ref="table"
            initScrollHorizon
            :class="{ start: showAsset }"
            :data="holdDataList"
            :columns="columns"
            :canPullDown="false"
            :canPullUp="false"
            @sort="setSortMap"
            @rowClick="listClickHander"
        >
            <!-- 固定列：名称/代码 -->
            <template v-slot:name="{ item }">
                <div class="flex-content">
                    <div class="fund-name line-elipsis" :class="{ hide: !showAsset }">
                        {{ showAsset ? item.name : '****' }}
                    </div>
                    <div class="fund-info" v-if="showAsset">
                        <div class="fund-info__currency" :class="[`currency-${item.currency}`]"></div>
                        <span class="fund-info__isin">
                            {{ item.isinCode }}
                        </span>
                    </div>
                </div>
            </template>

            <!-- 持有金额 -->
            <template v-slot:assets="{ item }">
                <div class="scoll-content">
                    <div
                        class="content-top"
                        v-riseFall="{
                            value: item.assets,
                            hide: !showAsset,
                            hideObj: { color: '#666', text: '****' },
                            sign: false,
                            riseFall: false,
                            rate: false,
                        }"
                    ></div>
                </div>
            </template>

            <!-- 到期估算收益 -->
            <template v-slot:estimateProfitLoss="{ item }">
                <div class="scoll-content">
                    <div
                        class="content-top"
                        v-riseFall="{
                            value: item.estimateProfitLoss,
                            hide: !showAsset,
                            hideObj: { color: '#666', text: '****' },
                            rate: false,
                        }"
                    ></div>
                </div>
            </template>

            <!-- 距离到期 -->
            <template v-slot:leftDays="{ item }">
                <div class="scoll-content">
                    <div class="content-top" :class="{ hide: !showAsset }">
                        {{ showAsset ? `${item.leftDays ? item.leftDays + '天' : '--'}` : '****' }}
                    </div>
                </div>
            </template>
        </Table>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import Table from '@/components/Table.vue'
import NP from 'number-precision'

export default {
    props: {
        holdDataList: {
            type: Array,
            default: () => [],
        },
    },
    components: {
        Table,
    },
    data() {
        return {
            sortMap: {
                assets: 'none', // 持有金额
                estimateProfitLoss: 'none', // 到期估算收益
                leftDays: 'none', // 距离到期
            },
            columns: [
                {
                    title: '名称/代码',
                    key: 'name',
                    fixed: true,
                    slot: true,
                },
                {
                    title: '持有金额',
                    key: 'assets',
                    sort: true,
                    slot: true,
                },
                {
                    title: '到期估算收益',
                    key: 'estimateProfitLoss',
                    sort: true,
                    slot: true,
                },
                {
                    title: '距离到期',
                    key: 'leftDays',
                    sort: true,
                    slot: true,
                },
            ],
        }
    },
    computed: {
        ...mapState('user', ['showAsset']),
    },
    methods: {
        // 设置排序排序
        setSortMap(key, type) {
            if (key in this.sortMap && ['asc', 'desc', 'none'].includes(type)) {
                this.sortMap[key] = type
                this.holdDataList.sort((a, b) => {
                    const i = a[key]
                    const j = b[key]
                    return type === 'asc' ? NP.minus(i - j) : NP.minus(j - i)
                })
            }
        },

        // 点击跳转票据持有详情页
        listClickHander(rowData) {
            const { currency, symbol } = rowData
            this.$goPage(
                '/product-detail-hold',
                { currency, symbol: encodeURIComponent(symbol), assetType: 'alterInvestment' },
                { pathname: '/wealth/fund.html' }
            )
        },
    },
}
</script>

<style lang="less" scoped>
.holding-list-container {
    padding: 0 12px 4px;
    background: #fff;

    .flex-content {
        display: flex;
        flex-direction: column;

        .fund-name {
            width: 127px;
            height: 20px;
            margin-top: 11px;
            margin-bottom: 2px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            &.hide {
                color: #666;
            }
        }

        .fund-info {
            display: flex;
            align-items: center;

            .fund-info__currency {
                width: 28px;
                height: 14px;
                margin-right: 5px;

                &.currency-HKD {
                    background-image: url('~@/assets/images/commonOutside/currency_HKD.png');
                }

                &.currency-USD {
                    background-image: url('~@/assets/images/commonOutside/currency_USD.png');
                }

                &.currency-CNY {
                    background-image: url('~@/assets/images/commonOutside/currency_CNY.png');
                }

                &.currency-CNH {
                    background-image: url('~@/assets/images/commonOutside/currency_CNH.png');
                }
            }

            .fund-info__isin {
                display: flex;
                flex-direction: row;
                align-items: center;
                height: 16px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 10px;
                line-height: 16px;

                &.hide {
                    color: #666;
                }
            }
        }
    }

    .scoll-content {
        display: flex;
        flex-direction: column;

        .content-top {
            height: 20px;
            margin-top: 11px;
            margin-bottom: 2px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: right;
        }

        .content-bottom {
            height: 16px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            text-align: right;
        }
    }

    /deep/ .box {
        &.start {
            .fixed .item,
            .scroll .item {
                justify-content: start !important;
            }
        }

        .fixed {
            width: 135px !important;

            .item:not(:last-child) {
                border-bottom: 0.5px solid #efefef;
            }
        }

        .scroll-title-container {
            left: 135px !important;
        }

        .scroll {
            .titleItem,
            .item {
                width: 94px;
                text-align: right;
            }

            .row:not(:last-child) {
                .item {
                    border-bottom: 0.5px solid #efefef;
                }
            }
        }
    }
}
</style>
