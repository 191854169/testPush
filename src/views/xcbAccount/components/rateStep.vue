<!-- 认购金额年化率阶梯表 -->
<template>
    <div class="rate-step">
        <div class="step-title">
            <dynamic-font class="t-left" :value="firstTitle" :options="{ maxFontSize: 12, minFontSize: 9 }"></dynamic-font>
            <dynamic-font class="t-center" :value="$t('detail.manageFeeRate')" :options="{ maxFontSize: 12, minFontSize: 9 }"></dynamic-font>
            <dynamic-font class="t-right" :value="$t('detail.annualisedRate')" :options="{ maxFontSize: 12, minFontSize: 9 }"></dynamic-font>
        </div>
        <div class="step-body">
            <div class="step-item" :class="{ even: index % 2 === 0, odd: index % 2 !== 0 }" v-for="(item, index) in list" :key="item.minAmount">
                <span class="t-left">≥{{ amountList[index] | manageFeeFilter }}</span>
                <span class="t-center">{{ manageFeeList[index] | formatterRateFilter }}</span>
                <span class="t-right c-highlight">{{ rateList[index] | formatterRateFilter }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { currencyFilter } from '@/config/filters'
import { i18n } from '@/i18n/common'
import { floatToRatio, keepDecimals, humanNum } from '@/utils'
import NP from 'number-precision'
import DynamicFont from '@/components/FosunDynamicFont.vue'
import { manageFeeFilter } from '../filters'

export default {
    name: 'rate-step',
    mixins: [],
    components: { DynamicFont },
    props: {
        list: {
            type: Array,
            default() {
                return []
            },
            required: true,
        },
        beforeRate: {
            type: String,
            default() {
                return ''
            },
            required: true,
        },
        currency: {
            type: String,
            default() {
                return ''
            },
            required: true,
        },
    },
    data() {
        return {}
    },
    computed: {
        firstTitle() {
            return `${this.$t('detail.subscribeAmount')} (${currencyFilter(this.currency)})`
        },
        amountList() {
            return this.list.map(item => {
                return item.minAmount
            })
        },
        manageFeeList() {
            return this.list.map(item => {
                return item.feeRate
            })
        },
        rateList() {
            return this.list.map(item => {
                return NP.minus(this.beforeRate, item.feeRate)
            })
        },
    },
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: {
        manageFeeFilter,
        currencyFilter,
        formatAmountFilter(v) {
            return v ? humanNum(v, 0, true, i18n, { needQianWanUnit: true, needQianUnit: true }) : '--'
        },
        formatterRateFilter(v) {
            if (v) {
                const value = NP.times(v, 100)
                return floatToRatio(keepDecimals(value, 2), { sign: false })
            }
            return '--'
        },
    },
    methods: {},
}
</script>

<style scoped lang="less">
.rate-step {
    background-color: #f9f9f9;
    border-radius: 4px;

    .t-left {
        width: 37%;
        text-align: left;
    }

    .t-center {
        width: 25%;
        text-align: center;
    }

    .t-right {
        width: 37%;
        text-align: right;
    }

    .step-title {
        display: flex;
        justify-content: space-between;
        padding: 8px 10px 4px;
        color: @h3-white;
        font-size: 12px;
        line-height: 16px;
    }

    .step-body {
        padding-bottom: 4px;
        font-size: 12px;
        line-height: 16px;

        .step-item {
            display: flex;
            justify-content: space-between;
            padding: 4px 10px;
        }
    }
}

.c-highlight {
    color: #ff6907;
}
</style>
