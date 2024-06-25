<!-- 认购页输入框 -->
<template>
    <div class="subscribe_input">
        <div class="title">{{ $t('subscribe.depositAmount') }}</div>
        <div class="input_container">
            <TradeInput
                class="input"
                v-model="inputValue"
                :currency="info.currency"
                :placeholder="placeholder"
                :button-msg="$t('buyAll')"
                :int-part-length="10"
                :smaller="smallerFont"
                @trigger="triggerAllIn"
            ></TradeInput>
        </div>
    </div>
</template>

<script>
import NP from 'number-precision'
import TradeInput from '@/components/TradeInput.vue'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
const formatterFilter = v => {
    return thousandsFilter(toFixed(v, 2))
}
export default {
    name: 'subscribe-input',
    mixins: [],
    components: {
        TradeInput,
    },
    props: {
        info: {
            type: Object,
            required: true,
        },
        placeholder: {
            type: String,
            required: true,
        },
        value: {
            type: String,
            required: true,
        },
    },
    data() {
        return {}
    },
    computed: {
        inputValue: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        // 有效输入, 输入大于起投
        inputValid() {
            return NP.minus(this.inputValue, this.info.minInitial) >= 0
        },
        estimatedCost() {
            return NP.times(this.inputValue, NP.divide(this.info.rate, 100))
        },
        smallerFont() {
            return Number(this.inputValue) > 9999999
        },
    },
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: {
        currencyFilter,
        formatterFilter,
    },
    methods: {
        triggerAllIn() {
            this.$emit('triggerAllIn')
        },
    },
}
</script>
<style scoped lang="less">
.mar-l12 {
    margin-left: 12px;
}

.subscribe_input {
    padding: 16px 0;

    .title {
        padding: 0 12px;
        color: @h1-white;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
    }

    .input_container {
        display: flex;
        align-items: center;
        height: 64px;
        margin: 0 12px;

        .input {
            width: 100%;
            height: 64px;

            ::v-deep .van-field {
                &.smaller {
                    font-size: 24px;
                    line-height: 34px;
                }
            }
        }
    }

    .item {
        padding: 0 12px;
        font-size: 11px;
        line-height: 14px;

        .label {
            color: @h2-white;
        }

        .value {
            color: @h1-white;
        }

        .highlight {
            color: @theme-white;
        }
    }
}
</style>
