<template>
    <div class="currency-choose">
        <van-popover
            v-model="currencySwitch"
            trigger="click"
            :get-container="getCurrencyPopoverContainer"
            ref="currencyList"
            class="outter-van-popover"
        >
            <ul class="list" @click.stop="onChoose">
                <li class="item" :class="{ selected: item.key === currency }" :data-key="item.key" v-for="item in currencyList" :key="item.key">
                    {{ item.value }}
                </li>
            </ul>
            <template #reference>
                <label for="">
                    <slot name="prefix">
                        <span class="currency">({{ currency | currencyFilter }})</span>
                    </slot>
                    <multi-img name="angle_trigger" directory="fund" class="trigger" alt="select"></multi-img>
                    <div ref="trigger" class="trigger-container"></div>
                    <slot name="suffix"></slot>
                    <span @click.stop="onClick" style="flex: 1 1 auto">&nbsp;</span>
                </label>
            </template>
        </van-popover>
    </div>
</template>

<script>
import { Popover } from 'vant'
import { CURRENCY_MAP } from '@/config/common'
import { isInOutsideH5 } from '@fs/utils'

export default {
    name: 'currency-choose',
    components: {
        [Popover.name]: Popover,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        defaultCurrency: {
            type: String,
            default: CURRENCY_MAP.keysMap.HKD,
        },
    },
    data() {
        return {
            currency: CURRENCY_MAP.keysMap.HKD,
        }
    },
    computed: {
        currencySwitch: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        currencyList() {
            const list = [CURRENCY_MAP.keysMap.HKD, CURRENCY_MAP.keysMap.USD, CURRENCY_MAP.keysMap.CNH]
            return CURRENCY_MAP.options.filter(i => list.includes(i.key))
        },
    },
    watch: {
        defaultCurrency: {
            handler(val) {
                this.currency = val
            },
            immediate: true,
        },
    },
    filters: {
        currencyFilter(v) {
            return CURRENCY_MAP.options.findLabel(v, '--')
        },
    },
    methods: {
        onChoose(e) {
            const currency = e.target.dataset.key
            if (currency === this.currency || !currency) return
            this.currency = currency
            this.$emit('on-currency-chage', this.currency)
            this.currencySwitch = false
        },

        onClick() {
            this.$emit('click')
        },

        getCurrencyPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },

        onTrigger() {
            this.currencySwitch = true
        },
    },
    mounted() {
        if (isInOutsideH5()) {
            this.currency = this.$route.query.currency || CURRENCY_MAP.keysMap.HKD
        }
    },
}
</script>

<style scoped lang="less">
.currency-choose {
    /deep/ .list {
        width: 94px;
        overflow: hidden;
        border-radius: 4px;

        .item {
            color: #2f2f2f;
            font-size: 14px;
            line-height: 36px;
            text-align: center;
            background: #fff;
            box-shadow: inset 0 -0.5px 0 #efefef;

            &.selected {
                color: #ff6307;
            }
        }
    }

    label {
        display: flex;
        align-items: center;

        .trigger {
            width: 6px;
            height: 4px;
            margin-left: 4px;
        }
    }
}
</style>
