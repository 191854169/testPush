<!-- 专属定制列表 -->
<template>
    <div class="special-custom-bills" v-if="list.length > 0">
        <div
            v-for="(item, index) in list"
            :key="index"
            class="custom-item"
            :class="{ lastItem: index === list.length - 1 }"
            @click="gotoDetail(item)"
        >
            <div class="header">
                <div class="name line-elipsis">{{ item.name }}</div>
                <div class="label">
                    <div v-for="(label, i) in getLabels(item)" :key="i" class="tags">
                        <div v-if="label === 'currency' && i == 0" :class="`fnc-currency-${item.currency}`" class="currency">{{ item.currency }}</div>
                        <div v-else class="label-tag">{{ label }}</div>
                    </div>
                </div>
            </div>
            <div class="content">
                <div class="content-item">
                    <span class="value" :class="{ rise: isRise(item), fall: !isRise(item) }">{{ item.yieldStr ? item.yieldStr : '--' }}</span>
                    <span class="label">
                        {{ item.noteProperty === 3 ? $t('fcn.annualizedCoupon') : $t('bills.annualizedYTM') }}
                    </span>
                </div>
                <div class="content-item">
                    <span class="value">{{ item.period }}</span>
                    <span class="label">{{ $t('fcn.inquiryPeriod') }}</span>
                </div>
                <div class="content-item">
                    <span class="value">{{ getDateOrFrequency(item) }}</span>
                    <span class="label">{{ item.noteProperty === 3 ? $t('fcn.knockOutFrequency') : $t('bills.remainingTerm') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// import tag from '@/components/Tag.vue'
import { isNull, isUndefined } from '@/utils'
export default {
    name: '',
    mixins: [],
    components: {},
    props: {
        list: {
            type: Array,
            default: () => {
                return []
            },
        },
    },
    data() {
        return {}
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        getLabels(item) {
            let currency = ''
            if (!isNull(item.currency) && !isUndefined(item.currency)) {
                currency = item.currency.toUpperCase()
            }
            const list = ['currency']
            if (!isNull(item.label) && !isUndefined(item.label) && item.label.length > 0) {
                const arr = item.label.split(',').filter(label => {
                    return label.toUpperCase() !== currency
                })
                list.push(...arr)
            }
            return list
        },

        maturityDateFilter(v) {
            return v ? v.substring(0, 10).replace(/-/g, '/') : '--'
        },

        getDateOrFrequency(item) {
            if (item.noteProperty === 3) {
                if (item.knockOutType === 3 || item.knockOutType === 4) {
                    return this.$t('fcn.everyday')
                }
                const frequency = item.observationFrequency ? item.observationFrequency : '--'
                return this.$t('fcn.perMonth', { month: frequency })
            }
            return this.maturityDateFilter(item.maturityDate)
        },

        isRise(item) {
            if (isNull(item.yield) || isUndefined(item.yield)) {
                return true
            }
            return item.yield >= 0
        },
        gotoDetail(item) {
            this.$goPage('/bills/detail', {
                symbol: item.symbol,
            })
        },
    },
}
</script>

<style scoped lang="less">
.special-custom-bills {
    width: 100%;
    padding-top: 4px;
    padding-right: 12px;
    padding-left: 12px;

    .lastItem {
        margin-bottom: 0 !important;
    }

    .custom-item {
        margin-bottom: 12px;
        padding: 12px;
        background: #fff;
        border-radius: 8px;

        .header {
            .name {
                height: 20px;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }

            .label {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: flex-start;

                .tags {
                    .currency {
                        margin-top: 4px;
                        margin-right: 8px;
                    }

                    .fnc-currency {
                        height: 14px;
                        padding: 0 3.5px;
                        font-weight: 400;
                        font-size: 10px;
                        line-height: 14px;
                        border-radius: 2px;
                    }

                    .fnc-currency-USD {
                        .fnc-currency();

                        color: #0569ff;
                        background-color: #edf4ff;
                    }

                    .fnc-currency-HKD {
                        .fnc-currency();

                        color: #7933d9;
                        background-color: #f6efff;
                    }

                    .fnc-currency-EUR {
                        .fnc-currency();

                        color: #164bcb;
                        background-color: #edf2ff;
                    }

                    .fnc-currency-CNY {
                        .fnc-currency();

                        color: #ff6476;
                        background-color: #fff0f2;
                    }

                    .fnc-currency-CNH {
                        .fnc-currency();

                        color: #ff6476;
                        background-color: #fff0f2;
                    }

                    .label-tag {
                        height: 14px;
                        margin-top: 4px;
                        margin-right: 8px;
                        padding: 0 3px;
                        color: #bd9862;
                        font-weight: 400;
                        font-size: 10px;
                        line-height: 14px;
                        background-color: rgba(189, 152, 98, 0.1);
                        border-radius: 2px;
                    }
                }
            }
        }

        .content {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;

            &-item {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 90px;
                height: 40px;

                .label {
                    position: absolute;
                    bottom: 0;
                    color: @fontGreyColor;
                    font-size: 12px;
                    line-height: 16px;
                    word-break: keep-all;
                }

                .value {
                    position: absolute;
                    color: @fontBlackColor;
                    font-weight: 700;
                    font-size: 14px;
                    line-height: 20px;
                }

                &:nth-child(1) {
                    text-align: center;

                    .value {
                        color: @font-color;
                    }
                }

                &:nth-child(2) {
                    align-items: center;
                    text-align: center;
                }

                &:nth-child(3) {
                    text-align: right;

                    .value,
                    .label {
                        right: 0;
                    }
                }
            }
        }
    }
}
</style>
