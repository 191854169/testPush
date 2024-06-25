<!-- 固定or浮动利息列表 -->
<template>
    <div class="interest-bills">
        <div class="card">
            <Table
                v-show="list.length"
                class="content-table"
                :border="true"
                :hiddenLastBorder="true"
                :data="list"
                :columns="columns"
                :canPullDown="false"
                :showEmptyTip="false"
                :canPullUp="false"
                loadingOverMsg=""
                :showPullUpLoading="true"
                @rowClick="listClickHander"
            >
                <!-- 固定列：年化利率 -->
                <template v-slot:name="props">
                    <div class="flex-content">
                        <div v-if="!isLinkedBill" class="first-yield line-elipsis" :class="{ rise: isRise(props.item), fall: !isRise(props.item) }">
                            {{ props.item.yieldStr ? props.item.yieldStr : '--' }}
                        </div>
                        <div v-else class="first-name c-main line-elipsis pad-r12">{{ props.item.name || '--' }}</div>
                    </div>
                </template>
                <!-- 滚动列：基金其他信息 -->
                <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                    <div class="scoll-content" :key="key">
                        <span v-if="key === 'minInitial'" class="c-main f14 lh-20">{{ getMinInital(props.item) }}</span>
                        <span v-if="key === 'period'" class="c-main f14 lh-20">{{ getValue(props.item[key]) }}</span>
                        <span v-if="key === 'riskOverall'" class="c-main f14 lh-20">
                            {{ props.item[key] ? riskRatingObj[props.item[key]] : '--' }}
                        </span>
                    </div>
                </template>
            </Table>
            <Empty v-if="!list.length" :showImg="false" height="200px">
                <div>
                    <p class="text">{{ $t('follow.noDataText') }}</p>
                </div>
            </Empty>
        </div>
    </div>
</template>

<script>
import Table from '@/components/Table.vue'
import Empty from '@/components/Empty.vue'
import { isNull, isUndefined } from '@/utils'
import { toFixed } from '@/utils'
import { i18n } from '@/i18n/common'

export default {
    name: '',
    mixins: [],
    components: {
        Table,
        Empty,
    },
    props: {
        list: {
            type: Array,
            default: () => {
                return []
            },
        },
        isFloat: {
            type: Boolean,
            default: () => {
                return false
            },
        },
        isLinkedBill: {
            //是否是挂钩类资产票据
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            riskRatingObj: {
                0: '--',
                1: this.$t('lowRisk'),
                2: this.$t('middleLowRisk'),
                3: this.$t('middleRisk'),
                4: this.$t('middleHighRisk'),
                5: this.$t('highRisk'),
            },
            columns: [
                {
                    title: this.isLinkedBill ? this.$t('productName') : this.$t('bills.annualizedYTM'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                    style: {
                        width: '1.12rem',
                        'text-align': 'left',
                    },
                },
                {
                    title: this.$t('fundList.minInitialCurrency'),
                    key: 'minInitial',
                    slot: true,
                    style: {
                        width: '0.92rem',
                        'text-align': 'left',
                    },
                    titleItemStyle: {
                        'justify-content': 'flex-start',
                    },
                },
                {
                    title: this.$t('fcn.inquiryPeriod'),
                    key: 'period',
                    slot: true,
                    style: {
                        width: '0.44rem',
                        'text-align': 'left',
                    },
                    titleItemStyle: {
                        'justify-content': 'flex-start',
                    },
                },
                {
                    title: this.$t('fcn.risk'),
                    key: 'riskOverall',
                    slot: true,
                    style: {
                        width: '0.58rem',
                        'text-align': 'right',
                    },
                },
            ],
        }
    },
    computed: {
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
    },
    watch: {},
    created() {},
    mounted() {},
    beforeDestroy() {},
    destroyed() {},
    filters: {},
    methods: {
        isRise(item) {
            if (isNull(item.yield) || isUndefined(item.yield)) {
                return true
            }
            return item.yield >= 0
        },
        getValue(val, defaultStr = '--') {
            if (isNull(val) || isUndefined(val)) {
                return defaultStr
            }
            return val
        },
        formatAmount(v) {
            if (isNull(v) || isUndefined(v)) {
                return '--'
            }
            return this.caculateInitMinitial(v)
        },
        caculateInitMinitial(number) {
            try {
                const num = parseFloat(number)
                let rst = num
                let unit = ''
                let digit = 0
                if (num / 100000000 >= 1) {
                    rst = num / 100000000
                    unit = i18n ? i18n.t('yi') : '亿'
                } else {
                    //小于1万也展示万
                    rst = num / 10000
                    unit = i18n ? i18n.t('wan') : '万'
                }
                //有小数，则展示两位小数，否则不展示小数
                if (rst !== Math.floor(rst)) {
                    digit = 2
                }
                return toFixed(rst, digit, false) + unit
            } catch (e) {
                return number
            }
        },
        getMinInital(val, defaultStr = '--') {
            if (isNull(val) || isUndefined(val)) {
                return defaultStr
            }
            const number = this.formatAmount(val['minInitial'])
            let currency = ''
            if (val.currency !== null || val.currency !== undefined) {
                currency = this.$t(val.currency.toUpperCase())
            }
            return number + currency
        },
        listClickHander(rowData) {
            this.$goPage('/bills/detail', {
                symbol: rowData.symbol,
            })
        },
    },
}
</script>

<style scoped lang="less">
.interest-bills {
    width: 100%;
    padding: 4px 12px 0;
    // overflow: hidden;

    .card {
        #foreground();

        padding: 8px 12px 0;
        border-radius: 8px;

        /deep/ .box {
            flex: 1;

            .fixed {
                z-index: 0;
                width: 132px !important;

                .item {
                    height: 48px; //每一行高度
                }
            }

            .title {
                z-index: 0;
            }

            .scroll {
                .scroll-title-container {
                    left: 132px !important;
                    z-index: 0;
                }

                .item {
                    height: 48px; //每一行高度
                }
            }

            .noData {
                top: calc(23% + 24px);
            }
        }

        .content-table {
            min-height: 0;
            // max-height: calc(100vh - 286px);
        }

        .flex-content {
            display: flex;

            .first-yield {
                font-weight: 700;
                font-size: 14px;
                line-height: 20px;
            }

            .first-name {
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }
        }
    }

    .text {
        text-align: center;
    }
}
</style>
