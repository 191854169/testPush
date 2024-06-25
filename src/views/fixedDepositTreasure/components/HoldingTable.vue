<template>
    <div class="scroll-table" v-if="list.length">
        <div class="holding-table table fixed">
            <div class="table-header">
                <li class="row">
                    <div class="row-item product">{{ $t('product') }}/{{ $t('subscribe.expiryDate') }}</div>
                </li>
            </div>
            <div class="table-body">
                <ul @click="onRowClick">
                    <li class="row" v-for="(item, index) in list" :key="item.productCode + item.initIndex" :data-index="index">
                        <div class="row-item product">
                            <template v-if="assetStatus">
                                <p class="product-name line-elipsis">{{ item.productName }}</p>
                                <p class="product-expired-time">
                                    <span :class="`currency-${item.currency?.toUpperCase()}`"></span>
                                    {{ $t('subscribe.expiryDate') }}{{ item.maturityTime | maturityTimeFilter }}
                                </p>
                            </template>
                            <p class="hide" v-else>****</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="holding-table table">
            <div class="table-header">
                <li class="row">
                    <div class="row-item product">{{ $t('product') }}/{{ $t('subscribe.expiryDate') }}</div>
                    <div class="row-item holding-amount" @click="sortHandler('marketValue')">
                        <span>{{ $t('holdingAmount') }}</span>
                        <div class="caret-wrapper">
                            <i class="sort-up" :class="{ 'sort-up__active': sortMap.marketValue === 'asc' }" />
                            <i class="sort-down" :class="{ 'sort-down__active': sortMap.marketValue === 'desc' }" />
                        </div>
                    </div>
                    <div class="row-item actual-interest" @click="sortHandler('actualInterest')">
                        <span>{{ $t('reciveFee') }}</span>
                        <div class="caret-wrapper">
                            <i class="sort-up" :class="{ 'sort-up__active': sortMap.actualInterest === 'asc' }" />
                            <i class="sort-down" :class="{ 'sort-down__active': sortMap.actualInterest === 'desc' }" />
                        </div>
                    </div>
                    <div class="row-item today-interest" @click="sortHandler('todayInterest')">
                        <span>{{ $t('todayInterest') }}</span>
                        <div class="caret-wrapper">
                            <i class="sort-up" :class="{ 'sort-up__active': sortMap.todayInterest === 'asc' }" />
                            <i class="sort-down" :class="{ 'sort-down__active': sortMap.todayInterest === 'desc' }" />
                        </div>
                    </div>
                    <div class="row-item accumulate-interest" @click="sortHandler('accumInterest')">
                        <span>{{ $t('accumulateInterest') }}</span>
                        <div class="caret-wrapper">
                            <i class="sort-up" :class="{ 'sort-up__active': sortMap.accumInterest === 'asc' }" />
                            <i class="sort-down" :class="{ 'sort-down__active': sortMap.accumInterest === 'desc' }" />
                        </div>
                    </div>
                    <div class="row-item holding-ratio" @click="sortHandler('positionRatio')">
                        <span>{{ $t('holdingRatio') }}</span>
                        <div class="caret-wrapper">
                            <i class="sort-up" :class="{ 'sort-up__active': sortMap.positionRatio === 'asc' }" />
                            <i class="sort-down" :class="{ 'sort-down__active': sortMap.positionRatio === 'desc' }" />
                        </div>
                    </div>
                </li>
            </div>
            <div class="table-body">
                <ul @click="onRowClick">
                    <li class="row" v-for="(item, index) in list" :key="item.productCode + item.initIndex" :data-index="index">
                        <div class="row-item product"></div>
                        <div class="row-item holding-amount center-right">
                            <template v-if="assetStatus">
                                <p class="holding-amount-value line-elipsis" ref="holdingAmountRef">{{ item.marketValue | amountFilter }}</p>
                            </template>
                            <div class="hide" v-else>****</div>
                        </div>
                        <div class="row-item actual-interest">
                            <template v-if="assetStatus">
                                <p class="actual-interest-amount" ref="actualInterestAmountRef">
                                    {{ item.actualInterest | amountFilter(true, item.orderStatus, toConfirmFeeLabel) }}
                                </p>
                                <p class="actual-interest-status">{{ item.orderStatus | orderStatusFilter }}</p>
                            </template>
                            <div class="hide" v-else>****</div>
                        </div>
                        <div class="row-item today-interest center-right">
                            <template v-if="assetStatus">
                                <p class="today-interest-value">
                                    {{ item.todayInterest | amountFilter(true, item.orderStatus, toConfirmFeeLabel) }}
                                </p>
                            </template>
                            <div class="hide" v-else>****</div>
                        </div>
                        <div class="row-item accumulate-interest center-right">
                            <template v-if="assetStatus">
                                <p class="accumulate-interest-value">
                                    {{ item.accumInterest | amountFilter(true, item.orderStatus, toConfirmFeeLabel) }}
                                </p>
                            </template>
                            <div class="hide" v-else>****</div>
                        </div>
                        <div class="row-item holding-ratio center-right">
                            <template v-if="assetStatus">
                                <p class="holding-ratio-value">{{ item.positionRatio | positionRatioFilter }}</p>
                            </template>
                            <div class="hide" v-else>****</div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { dynamicFontSize, floatToRatio, milliFormat } from '@/utils'
import { ORDER_STATUS_MAP } from '../config/common'
import dayjs from 'dayjs'
export default {
    name: 'holding-table',
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        assetStatus: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            sortMap: {
                marketValue: 'desc',
                actualInterest: 'none',
                todayInterest: 'none', // 今日利息
                accumInterest: 'none', // 累计利息
                positionRatio: 'none',
            },
        }
    },
    computed: {
        toConfirmFeeLabel() {
            return this.$t('toConfirmFee')
        },
    },
    filters: {
        // eslint-disable-next-line max-params
        amountFilter(v, key, orderStatus, toConfirmFeeLabel) {
            if (key && orderStatus === ORDER_STATUS_MAP.keysMap.submitted) {
                return toConfirmFeeLabel
            }
            return milliFormat(floatToRatio(v, { rate: false, sign: false }))
        },

        orderStatusFilter(v) {
            return v ? ORDER_STATUS_MAP.options.findLabel(v, '--') : '--'
        },

        maturityTimeFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD') : '--'
        },

        positionRatioFilter(v) {
            return v ? floatToRatio(v, { rate: true, sign: false, pow: 2 }) : '--'
        },
    },
    watch: {
        assetStatus: {
            handler(v) {
                this.resetFontSize(v)
            },
            immediate: true,
        },
    },
    methods: {
        sortHandler(key) {
            if (!this.sortMap[key]) return
            let type = ''
            switch (this.sortMap[key]) {
                case 'asc':
                case 'none':
                    type = 'desc'
                    break
                case 'desc':
                    type = 'asc'
                    break
                default:
                    type = 'none'
                    break
            }
            this.resetSortMap()
            this.setSortMap(key, type)
            this.$emit('sort', key, type)
        },
        // 设置排序排序
        setSortMap(key, type) {
            if (key in this.sortMap && ['asc', 'desc', 'none'].includes(type)) {
                this.sortMap[key] = type
            }
        },

        onRowClick(e) {
            const getLi = function (event) {
                let li = event.target

                while (li && li.tagName.toUpperCase() !== 'HTML') {
                    if (li.tagName.toUpperCase() === 'LI') {
                        return li
                    }
                    li = li.parentNode
                }

                return null
            }
            const li = getLi(e)
            const { index } = li.dataset
            const item = this.list[index]
            this.$emit('row-click', { index, item })
        },
        /**
         * 设置对应字段排序
         * @param {String} key 要设置的字段
         * @param {String} sort 排序方式
         */
        setSort(key, sort) {
            if (!(key in this.sortMap)) return
            this.resetSortMap()
            this.sortMap[key] = sort
        },
        /**
         * 重置所有的排序方式
         */
        resetSortMap() {
            Object.keys(this.sortMap).forEach(k => {
                this.sortMap[k] = 'none'
            })
        },

        resetFontSize(v) {
            this.$nextTick(() => {
                const doms = [...(this.$refs.holdingAmountRef || []), ...(this.$refs.actualInterestAmountRef || [])]
                doms.forEach(dom => {
                    if (v) {
                        dynamicFontSize({ dom, minFontSize: 8 })
                    }
                })
            })
        },
    },
}
</script>

<style scoped lang="less">
#basic_style(@fontSize: 12px, @lineHeight, @fontColor: @fontBlackColor) {
    color: @fontColor;
    font-weight: 400;
    font-size: @fontSize;
    line-height: @lineHeight;
}

.scroll-table {
    position: relative;

    &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 7px;
        background: #fff;
        content: '';
    }
}

.table {
    padding: 0 12px;
    overflow: scroll;
    background: @bg-color;

    .row {
        display: flex;

        &-item {
            flex-shrink: 0;

            &.product {
                width: 134px;
                margin-right: 7px;
                visibility: hidden;

                .product-name {
                    #basic_style(16px, 22px);
                }

                .product-expired-time {
                    #basic_style(12px, 16px, @fontGreyColor);

                    display: flex;
                    align-items: center;
                    margin-top: 2px;

                    span:first-child {
                        margin-right: 3px;
                    }
                }
            }

            &.holding-amount {
                width: 84px;
                margin-right: 11px;
                text-align: right;

                .holding-amount-value {
                    #basic_style(16px, 22px);
                }
            }

            &.actual-interest {
                width: 91px;
                margin-right: 12px;
                text-align: right;

                .actual-interest-amount {
                    #basic_style(16px, 22px);
                }

                .actual-interest-status {
                    #basic_style(12px, 16px, @fontGreyColor);

                    margin-top: 2px;
                }
            }

            &.today-interest {
                width: 91px;
                margin-right: 12px;
                text-align: right;

                .today-interest-value {
                    #basic_style(16px, 22px);
                }
            }

            &.accumulate-interest {
                width: 91px;
                margin-right: 12px;
                text-align: right;

                .accumulate-interest-value {
                    #basic_style(16px, 22px);
                }
            }

            &.holding-ratio {
                width: 82px;
                padding-right: 12px;
                text-align: right;

                .holding-ratio-value {
                    #basic_style(16px, 22px);
                }
            }

            &.center-right {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                margin-bottom: 12px;
            }

            .hide {
                #basic_style(16px, 22px, @fontLightColor);
            }
        }
    }

    .table-header {
        .row {
            height: 28px;
            padding: 8px 0 4px;
        }

        .row-item {
            #basic_style(12px, 16px, @fontGreyColor);

            display: flex;

            &:not(:first-child) {
                justify-content: flex-end;
            }

            .caret-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 6px;
                margin-left: 4px;

                .sort-box {
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 100%;
                }

                .sort-up {
                    .sort-box();

                    width: 6px;
                    height: 5px;
                    margin-bottom: 1px;
                    background-image: url('~@/assets/images/common/sort-up.png');
                }

                .sort-up__active {
                    background-image: url('~@/assets/images/common/sort-up__active.png');
                }

                .sort-down {
                    .sort-box();

                    width: 6px;
                    height: 5px;
                    margin-top: 1px;
                    background-image: url('~@/assets/images/common/sort-down.png');
                }

                .sort-down__active {
                    background-image: url('~@/assets/images/common/sort-down__active.png');
                }
            }
        }
    }

    .table-body {
        .row {
            height: 60px;
            padding-top: 10px;

            &-item {
                #basic_style(14px, 20px, @fontBlackColor);
            }
        }
    }

    &.fixed {
        position: absolute;
        top: 0;
        left: 0;
        width: 141px;
        padding-right: 0;
        overflow: hidden;
        background: #fff;

        .row-item.product {
            visibility: visible;
        }
    }
}
</style>
