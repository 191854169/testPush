<template>
    <div class="select-currency">
        <van-popover v-model="currencySwitch" trigger="click" :get-container="getCurrencyPopoverContainer" ref="currencyList">
            <ul class="list" @click="onCurrencyChoose">
                <li class="item" :class="{ selected: item.value === currency }" :data-key="item.value" v-for="item in currencyList" :key="item.value">
                    {{ item.text }}
                </li>
            </ul>
            <template #reference>
                <label for="">
                    <slot name="default"></slot>
                    <span>{{ currency | currencyFilter(currencyList) }}</span>
                    <multi-img name="angle_trigger" directory="fund" class="trigger" alt="select"></multi-img>
                    <div ref="trigger" class="trigger-container"></div>
                </label>
            </template>
        </van-popover>
    </div>
</template>

<script>
const USD = 'USD'
const HKD = 'HKD'
// const CNH = 'CNH'
import { i18n } from '@/i18n/fund/index.js'

export default {
    name: 'select-currency',
    props: {
        currencyList: {
            type: Array,
            default: () => [
                { value: HKD, text: i18n.t('HKD') },
                { value: USD, text: i18n.t('USD') },
            ],
        },
        value: {
            type: String,
            default: 'HKD',
        },
    },
    data() {
        return {
            currencySwitch: false,
        }
    },
    computed: {
        currency: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
    filters: {
        currencyFilter(v, list) {
            return ((list || []).find(i => i.value === v) || {}).text
        },
    },
    methods: {
        getCurrencyPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },
        onCurrencyChoose(e) {
            this.currency = e.target.dataset.key
        },
    },
}
</script>

<style scoped lang="less">
.select-currency {
    .trigger-container {
        /deep/ .van-popover {
            top: 4px !important;
            left: 33px !important;
            transform: translate3d(calc(-50% - 36px), 15px, 0) !important;

            .van-popover__arrow {
                #arrow_color();
            }

            .van-popover__content {
                background-color: unset;
                box-shadow: 0 -1px 10px rgba(50, 50, 51, 0.15);
            }
        }
    }

    .list {
        width: 69px;
        overflow: hidden;
        border-radius: 4px;

        .item {
            color: @fontBlackColor;
            font-weight: 400;
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

    flex: 0 1 auto;
    width: 196px;
    text-align: left;

    label {
        display: flex;
        align-items: center;

        & > span {
            flex: 1 0 auto;
            margin-left: 12px;
            color: @fontLightColor;
            font-weight: 400;
            font-size: 14px;
            line-height: 18px;
        }

        img {
            width: 16px;
            margin-left: 16px;

            &.trigger {
                width: 6px;
                margin-left: 4px;
            }
        }

        .trigger-container {
            position: relative;
        }
    }

    .amount.hide {
        font-size: 28px !important;
    }
}
</style>
