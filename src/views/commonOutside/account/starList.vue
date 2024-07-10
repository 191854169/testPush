<template>
    <div class="holding-list-container" v-if="holdDataList && holdDataList.length > 0">
        <!-- 标题 -->
        <div class="flex-s pad-t16 pad-b8">
            <!-- 基金类型 -->
            <div class="f16 font-bold">{{ $t('cashBox') }}</div>
            <!-- 星财宝显示自动买入设置按钮 -->
            <div class="flex-c lh-16 f12" @click="openPage">
                <multi-img name="icon_set" directory="commonOutside" class="icon-set"></multi-img>
                <div class="h2-white">自动买入设置</div>
            </div>
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

            <!-- 昨日收益 -->
            <template v-slot:yesterdayProfitLoss="{ item }">
                <div class="scoll-content">
                    <div
                        class="content-top"
                        v-riseFall="{
                            value: item.yesterdayProfitLoss,
                            hide: !showAsset,
                            hideObj: { color: '#666', text: '****' },
                            rate: false,
                        }"
                    ></div>
                </div>
            </template>

            <!-- 持有收益、持有收益率 -->
            <template v-slot:profitLoss="{ item }">
                <div class="scoll-content">
                    <div
                        class="content-top"
                        v-riseFall="{
                            value: item.profitLoss,
                            hide: !showAsset,
                            hideObj: { color: '#666', text: '****' },
                            rate: false,
                        }"
                    ></div>
                    <div
                        v-if="showAsset"
                        class="content-bottom"
                        v-riseFall="{
                            value: item.profitLossPercentage,
                        }"
                    ></div>
                </div>
            </template>

            <!-- 累计收益 -->
            <template v-slot:accumulatedProfitLoss="{ item }">
                <div class="scoll-content">
                    <div
                        class="content-top"
                        v-riseFall="{
                            value: item.accumulatedProfitLoss,
                            hide: !showAsset,
                            hideObj: { color: '#666', text: '****' },
                            rate: false,
                        }"
                    ></div>
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
                yesterdayProfitLoss: 'none', // 昨日收益
                profitLoss: 'none', // 持有收益
                accumulatedProfitLoss: 'none', // 累计收益
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
                    title: '昨日收益',
                    key: 'yesterdayProfitLoss',
                    sort: true,
                    slot: true,
                },
                {
                    title: '持有收益',
                    key: 'profitLoss',
                    sort: true,
                    slot: true,
                },
                {
                    title: '累计收益',
                    key: 'accumulatedProfitLoss',
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

        // 跳转至自动买入设置
        openPage() {
            this.$goPage('/autoDeal', {}, { pathname: '/wealth/cashBox.html' })
        },

        // 点击跳转至星财宝主页携带币种
        listClickHander(rowData) {
            this.$goPage('/', { accountType: rowData.currency }, { pathname: '/wealth/cashBox.html' })
        },
    },
}
</script>

<style lang="less" scoped>
.holding-list-container {
    padding: 0 12px 4px;
    background: #fff;

    .icon-set {
        width: 16px;
        height: auto;
        margin-right: 6px;
    }

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
