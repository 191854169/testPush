<template>
    <div class="order-list-item" @click="gotoDetails">
        <div class="title_area border-bottom-1px">
            <div class="name line-elipsis_l2">{{ info.productName }}</div>
            <div class="flex-c">
                <span class="currency" :class="`currency-${info.currency ?? 'HKD'}`"></span>
                <span class="symble">{{ info.productCode }}</span>
            </div>
        </div>
        <div v-for="(item, index) in list" :key="index">
            <div class="item flex-s">
                <div class="label">{{ item.label }}</div>
                <div class="value">{{ item.value }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
import { ORDER_STATUS_MAP } from '@/views/fixedDepositTreasure/config/common.js'
const StatusKeyValue = ORDER_STATUS_MAP.keyValueMap

const formatterFilter = v => {
    return v ? thousandsFilter(toFixed(v, 2)) : '0.00'
}

export default {
    name: 'order-list-item',
    mixins: [],
    components: {},
    props: {
        info: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    data() {
        return {}
    },
    computed: {
        list() {
            return [
                {
                    label: this.$t('subscribe.depositAmount'),
                    value: `${formatterFilter(this.info.applyAmount)}${currencyFilter(this.info.currency ?? 'HKD')}`,
                },
                { label: this.$t('orderList.status'), value: StatusKeyValue[this.info.orderStatus || ''] },
                { label: this.$t('orderList.date'), value: this.info.statusUpdateTime },
            ]
        },
    },
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: { formatterFilter, currencyFilter },
    methods: {
        gotoDetails() {
            this.$goPage('/order-detail', { orderNumber: this.info.orderNumber, productCode: this.info.productCode })
        },
    },
}
</script>

<style scoped lang="less">
.order-list-item {
    height: auto;
    padding: 0 0 12px;
    background: #fff;
    border-radius: 8px;

    .title_area {
        margin: 0 12px;
        padding: 12px 0 8px;

        .name {
            margin-bottom: 4px;
            color: #262626;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }

        .currency {
            display: inline-block;
            height: 12px;
            margin-right: 4px;
        }

        .symble {
            color: @h2-white;
            font-size: 11px;
            line-height: 14px;
        }
    }

    .item {
        height: 36px;
        padding: 0 12px;
        font-size: 14px;
        line-height: 20px;

        .label {
            color: @h2-white;
        }

        .value {
            color: @h1-white;
        }
    }
}
</style>
