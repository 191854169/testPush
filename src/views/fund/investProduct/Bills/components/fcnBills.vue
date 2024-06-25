<!-- FCN票据列表 -->
<template>
    <div class="fcn-bills" ref="scrollarea">
        <div class="fnc-card" @click="listClickHander(bestItem)">
            <div class="card-background">
                <div class="card-top flex">
                    <span class="coupon leftFix" v-riseFall="{ value: bestItem.coupon, sign: false, thousand: true }"></span>
                    <div class="name flex">
                        <div class="currency" :class="[`currency-${bestItem.currency}`]"></div>
                        <div class="product line-elipsis">{{ getObjectStockStr(bestItem, '、', '') }}</div>
                    </div>
                </div>
                <div class="card-desc">
                    <span class="leftFix">
                        {{ $t('fcn.annualizedCoupon') }}
                    </span>
                    <span>
                        {{ getPeriod(bestItem) }}
                    </span>
                    <span class="line"></span>
                    <span>{{ bestItem.pricerName + $t('fcn.quotation') }}</span>
                </div>
                <div class="card-bottom flex border-top-1px">
                    <template v-if="bestItem?.orderStatus !== 500">
                        <span>{{ $t('fcn.validQuotation') }}</span>
                        <span class="h2">{{ getValidTime(bestItem) }}</span>
                    </template>
                    <template v-else>
                        <span>{{ $t('fcn.validQuotationExpiration') }}</span>
                    </template>
                </div>
            </div>
        </div>
        <div class="table-container">
            <Table
                ref="table"
                class="content-table"
                :data="list"
                :border="true"
                :hiddenLastBorder="true"
                :columns="originColumns"
                :canPullDown="false"
                :showEmptyTip="false"
                :canPullUp="false"
                loadingOverMsg=""
                :showPullUpLoading="false"
                @sort="handlerSort"
                @rowClick="listClickHander"
            >
                <!-- 固定列标题 -->
                <template v-slot:fixTitle>
                    <div class="fix-title flex">
                        <div class="product-type">{{ $t('fcn.productType') }}</div>
                        <div class="biaodi">{{ $t('fcn.biaodi') }}</div>
                    </div>
                </template>
                <!-- 固定列 -->
                <template v-slot:name="props">
                    <div class="fix-content">
                        <div class="fix-name">{{ 'FCN' }}</div>
                        <div class="fund-info_isin line-elipsis">{{ getObjectStockStr(props.item, ' ', '--') }}</div>
                    </div>
                </template>
                <!-- 滚动列：其他信息 -->
                <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                    <div class="scoll-content" :key="key">
                        <div v-if="getInquiryItemKey(props.item) === key">
                            <div
                                v-if="props.item[key]"
                                v-riseFall="{ value: props.item[key], riseFall: ['coupon'].includes(key), sign: ['coupon'].includes(key) }"
                            ></div>
                            <div v-else-if="props.item.orderStatus === 400" :style="{ color: '#999' }">
                                {{ $t('fcn.unableQuote') }}
                            </div>
                            <div v-else>{{ '--' }}</div>
                        </div>
                        <div v-else-if="'coupon' === key" class="f14 lh-20" v-riseFall="{ value: props.item[key] }"></div>
                        <div v-else-if="['strikePrice', 'knockOutPrice'].includes(key)" class="c-main f14 lh-20 line-elipsis">
                            {{ props.item[key] | rateFilter }}
                        </div>
                        <div v-else-if="key === 'observationFrequency'" class="c-main f14 lh-20 line-elipsis">{{ getFrequency(props.item) }}</div>
                        <div v-else-if="key === 'currency'" class="c-main f14 lh-20 line-elipsis">{{ props.item[key] | currencyFilter }}</div>
                        <div v-else class="c-main f14 lh-20 line-elipsis">{{ props.item[key] ? props.item[key] : '--' }}</div>
                    </div>
                </template>
            </Table>
        </div>
    </div>
</template>

<script>
import Table from '@/components/Table.vue'
import { currencyFilter } from '@/config/filters'
import { floatToRatio } from '@/utils'
import { InquiryItemMap } from '.././common'

export default {
    name: '',
    mixins: [],
    components: {
        Table,
    },
    props: {
        list: {
            type: Array,
            default: () => {
                return []
            },
        },
        bestItem: {
            type: Object,
            default: () => {
                return {}
            },
        },
    },
    data() {
        return {
            table: null,
            sort: {
                type: 'desc', // 排序方式
                key: 'coupon', // 排序字段
            },
            originColumns: [
                {
                    title: this.$t('fcn.productType'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                    headSlot: true,
                },
                {
                    title: this.$t('fcn.annualizedCoupon'),
                    key: 'coupon',
                    sort: true,
                    slot: true,
                    style: {
                        width: '0.76rem',
                        'text-align': 'right',
                        'padding-left': '0.1rem',
                    },
                },
                {
                    title: this.$t('fcn.strikePrice'),
                    key: 'strikePrice',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.80rem',
                        'text-align': 'right',
                        'padding-left': '0.12rem',
                    },
                },
                {
                    title: this.$t('fcn.knockOutBid'),
                    key: 'knockOutPrice',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.82rem',
                        'text-align': 'right',
                        'padding-left': '0.12rem',
                    },
                },
                {
                    title: this.$t('fcn.knockOutFrequency'),
                    key: 'observationFrequency',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.96rem',
                        'text-align': 'left',
                        'padding-left': '0.24rem',
                    },
                    titleItemStyle: {
                        'justify-content': 'flex-start',
                    },
                },
                {
                    title: this.$t('fcn.inquiryPeriod'),
                    key: 'inquiryPeriod',
                    slot: true,
                    style: {
                        width: '0.64rem',
                        'text-align': 'left',
                        'padding-left': '0.16rem',
                    },
                    titleItemStyle: {
                        'justify-content': 'flex-start',
                    },
                },
                {
                    title: this.$t('currency'),
                    key: 'currency',
                    slot: true,
                    riseFall: false,
                    style: {
                        width: '0.51rem',
                        'padding-left': '0.16rem',
                        'text-align': 'left',
                    },
                    titleItemStyle: {
                        'justify-content': 'flex-start',
                    },
                },
                {
                    title: this.$t('fcn.offer'),
                    key: 'pricerName',
                    sort: false,
                    slot: true,
                    riseFall: false,
                    style: {
                        width: '1.06rem',
                        'text-align': 'left',
                        'padding-left': '0.16rem',
                    },
                    titleItemStyle: {
                        'justify-content': 'flex-start',
                    },
                },
            ],
        }
    },
    computed: {
        slotScollColumnKeys() {
            return this.originColumns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
    },
    watch: {},
    created() {},
    mounted() {
        this.table = this.$refs.table
        this.$refs.table.setSortMap(this.sort.key, this.sort.type)
    },
    destroyed() {},
    filters: {
        rateFilter(v) {
            return v ? floatToRatio(v * 1.0, { sign: false }) : '--'
        },
        currencyFilter,
    },
    methods: {
        // 询价key
        getInquiryItemKey(item) {
            return InquiryItemMap.keysMap[item.inquiryItem]
        },

        getObjectStockStr(item, sp = ' ', defaultStr = '') {
            if (item.objectCodeList === null || item.objectCodeList === undefined) return defaultStr
            return item.objectCodeList
                ?.map(obj => {
                    return `${obj.code}.${obj.mkt.toUpperCase()}`
                })
                .join(sp)
        },

        getPeriod(item) {
            const period = item.inquiryPeriod ? item.inquiryPeriod : '--'
            return period.toString() + this.$t('fcn.monthPeriod')
        },

        getFrequency(item) {
            if (item.knockOutType === 3 || item.knockOutType === 4) {
                return this.$t('fcn.everyday')
            }
            const frequency = item.observationFrequency ? item.observationFrequency : '--'
            return this.$t('fcn.perMonth', { month: frequency })
        },

        getValidTime(item) {
            if (item.quotationTime && item.expirationTime) {
                if (item.quotationTime.length >= 16 && item.expirationTime.length >= 16) {
                    return item.quotationTime.substring(2, 16).replace(/-/g, '/') + ' - ' + item.expirationTime.substring(2, 16).replace(/-/g, '/')
                }
            }

            return '--'
        },

        handlerSort(key, type) {
            if (type === 'none') {
                // 此处不能展示为 none 排序
                type = 'asc'
                this.$refs.table && this.$refs.table.setSortMap(key, type)
            }
            this.sort.key = key
            this.sort.type = type
            //this.tableScrollTop()
            this.$emit('handlerSort', key, type)
        },

        tableScrollTop() {
            this.$refs.scrollarea.scrollTo(0, 0)
        },
        listClickHander(rowData) {
            this.$goPage('/bill-enquiry-detail', { number: rowData.orderId })
        },
    },
}
</script>

<style scoped lang="less">
.fcn-bills {
    width: 100%;
    padding: 4px 12px 12px;

    .fnc-card-container {
        padding: 12px 0;
        background-color: #fff;
    }

    .fnc-card {
        height: 112px;
        padding: 1px;
        background: linear-gradient(180deg, #fff 100%, #fff 0%);
        border-radius: 8px;

        .card-background {
            padding: 15px 11px 11px;
            background: linear-gradient(180deg, #fff2ef, #fefefe), linear-gradient(180deg, #fff 100%, #fff 0%);
            border: 1px solid linear-gradient(180deg, #fff 100%, #fff 0%);
            border-radius: 8px;
        }

        .leftFix {
            width: 0.97rem;
        }

        .card-top {
            .coupon {
                font-weight: bold;
                font-size: 17px;
                line-height: 24px;
            }

            .currency {
                width: 27px;
                height: 14px;
                margin-right: 8px;
            }

            .name {
                flex: 1;
                align-items: center;
                color: @h1-white;
                font-size: 14px;
                line-height: 20px;

                .product {
                    max-width: 1.97rem;
                }
            }
        }

        .card-desc {
            display: flex;
            align-items: center;
            margin-top: 4px;
            color: @h3-white;
            font-size: 12px;
            line-height: 16px;

            .line {
                width: 1px;
                height: 10px;
                margin: 0 8px;
                background: #b6b6b6;
            }
        }

        .card-bottom {
            align-items: flex-end;
            height: 24px;
            margin-top: 16px;
            color: @h3-white;
            font-size: 11px;
            line-height: 16px;

            .h2 {
                margin-left: 2px;
                color: @h2-white;
            }

            &.border-top-1px::after {
                background-color: #ececec;
            }
        }
    }

    .table-container {
        margin-top: 8px;
        padding: 8px 12px 0;
        background-color: #fff;
        border-radius: 8px;
    }

    .content-table {
        background-color: #fff;
    }

    ::v-deep .box {
        flex: 1;

        .fixed {
            z-index: 0;
            width: 170px !important;

            .item {
                height: 48px !important; //每一行高度
            }

            .fix-title {
                position: absolute;
                top: 0;
                align-items: center;
                width: 100%;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 24px;

                .product-type {
                    flex-shrink: 0;
                    width: 72px;
                }
            }

            .fix-content {
                display: flex;
                color: @h1-white;
                font-size: 14px;
                line-height: 20px;

                .fix-name {
                    flex-shrink: 0;
                    width: 72px;
                }
            }
        }

        .title {
            z-index: 0;
        }

        .scroll {
            .scroll-title-container {
                left: 170px !important;
                z-index: 0;
            }

            .item {
                height: 48px !important; //每一行高度
            }
        }
    }
}
</style>
