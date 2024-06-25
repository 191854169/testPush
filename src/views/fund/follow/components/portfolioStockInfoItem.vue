<!-- 创建组合/调仓 股票信息item -->
<template>
    <div class="info_item">
        <div class="left_info">
            <div class="name">{{ obj.name }}</div>
            <div class="flex-c">
                <span :class="getCurrencyClass(obj)"></span>
                <span class="c-gray value mar-l2 mar-r6">{{ obj.productCode }}</span>
                <span v-if="!isFund" class="c-gray value">{{ obj.latestPrice }}</span>
                <span class="c-gray value mar-l2">
                    (
                    <span v-riseFall="{ value: obj.day1Return, riseFall: false }"></span>
                    )
                </span>
            </div>
        </div>
        <div class="right_info">
            <div
                class="ratio"
                :class="{
                    'c-gray': parseFloat(obj.ratio) === 0,
                    'margin-b': obj.changingRatio || obj.ratio_error,
                    error_border: obj.ratio_error && !obj.changingRatio,
                }"
                @click="$emit('changing', obj)"
            >
                {{ obj.ratio | ratioFilter }}
                <multi-img v-if="obj.changingRatio" name="icon_angle_trigger_up" directory="fund" class="trigger"></multi-img>
                <multi-img v-else name="angle_trigger" directory="fund" class="trigger"></multi-img>
            </div>
            <div v-if="obj.changingRatio" class="tips_msg">{{ `1~${max}%` }}</div>
            <div v-if="obj.ratio_error && !obj.changingRatio" class="error_message">{{ $t('rebalancing.plsSetRatio') }}</div>
            <div class="del_c" @click="onClockDeleteItem">
                <multi-img class="del" name="icon_zhuancang_delete" directory="fund/follow" />
            </div>
        </div>
    </div>
</template>

<script>
import { PORTFOLIO_TYPE_MAP } from '../../config/common'
import { floatToRatio } from '@/utils'
import NP from 'number-precision'

export default {
    name: 'portfolioStockInfoItem',
    components: {},
    props: {
        obj: {
            type: Object,
            default() {
                return {}
            },
        },
        max: {
            type: Number,
        },
    },
    filters: {
        ratioFilter(value) {
            return floatToRatio(value, { rate: true, sign: false })
        },
    },
    computed: {
        isFund() {
            return this.obj.productType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        device1px() {
            return NP.divide(1, window.devicePixelRatio).toFixed(2)
        },
    },
    data() {
        return {}
    },
    methods: {
        getCurrencyClass(data) {
            if (this.isFund) {
                return `currency-${data.currency.toLocaleUpperCase()}`
            }
            return `market-${data.market.toLocaleUpperCase()}`
        },
        onClockDeleteItem() {
            this.$titleDialog
                .show({
                    title: this.$t('rebalancing.delete'),
                })
                .then(() => {
                    this.$emit('delete')
                })
                .catch(() => {})
        },
    },
}
</script>

<style scoped lang="less">
.mar-l2 {
    margin-left: 2px;
}

.margin-b {
    margin-bottom: 16px;
}

.info_item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
}

.left_info {
    .name {
        margin-bottom: 2px;
        color: #2f2f2f;
        font-size: 14px;
        line-height: 20px;
    }

    .value {
        font-size: 10px;
        line-height: 14px;
    }
}

.right_info {
    position: relative;
    display: flex;
    align-items: center;
    height: 100%;

    .ratio {
        position: relative;
        width: 86px;
        height: 24px;
        padding: 4px 0 4px 10px;
        font-weight: bold;
        font-size: 12px;
        line-height: 18px;
        background-color: #f7f7f7;
        border-radius: 4px;

        .trigger {
            position: absolute;
            top: calc(50% - 2px);
            right: 6px;
            width: 6px;
            height: 6px;
        }
    }

    .del_c {
        display: flex;
        align-items: center;
        height: 100%;

        .del {
            width: 12px;
            height: 12px;
            margin-left: 12px;
        }
    }

    .tips_msg {
        position: absolute;
        bottom: 8px;
        left: 8px;
        color: #909498;
        font-size: 10px;
        line-height: 14px;
    }

    .error_border {
        #border_all_1px(#f31414, 3px);
    }

    .error_message {
        position: absolute;
        bottom: 8px;
        left: 0;
        color: #f31414;
        font-size: 10px;
        line-height: 14px;
    }
}
</style>
