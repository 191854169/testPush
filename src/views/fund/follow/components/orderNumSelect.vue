<template>
    <van-popup class="popup" v-model="showPopup" position="bottom">
        <div class="popup-content">
            <div class="header">
                <multi-img class="cancel-btn" name="icon-cancel" directory="common" @click="clickCancel" />
                <span>{{ $t('followOrder.selectBuyNum') }}</span>
            </div>

            <div class="content" @click="itemClick">
                <div v-for="(item, index) in amountList" :key="index">
                    <div class="divide" v-if="showDivide(index)">{{ $t('followOrder.cannotSelect') }}</div>
                    <div
                        class="item border-bottom-1px mask-local"
                        :data-amount="item.amount"
                        :data-count="item.count"
                        :class="{ disabled: clickUnable(item), selected: item.count === count }"
                    >
                        <p>{{ item.count }}{{ $t('followOrder.per') }}</p>
                        <p>{{ item.amount | amountFilter }}{{ currency | currencyFilter }}</p>
                    </div>
                </div>
            </div>
        </div>
    </van-popup>
</template>
<script>
import { currencyMap } from '@/config/common'
import { floatToRatio, milliFormat } from '@/utils'
import NP from 'number-precision'
export default {
    name: 'orderNumSelect',
    components: {},
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        maxPurchasingPower: {
            type: String,
            default: '',
        },
        minPricePer: {
            type: [Number, String],
            default: '',
        },
        currency: {
            type: String,
            default: 'HKD',
        },
        count: {
            type: [Number, String],
            default: 1,
        },
        amountList: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {}
    },
    filters: {
        currencyFilter(v) {
            return currencyMap.keyValueMap[v] || ''
        },
        amountFilter(v) {
            v = v || 0
            let ret = floatToRatio(v, { rate: false, base: 2, sign: false })
            ret = milliFormat(ret)
            return ret
        },
    },
    computed: {
        showPopup: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
    methods: {
        clickCancel() {
            this.showPopup = false
        },
        showDivide(index) {
            return (
                this.amountList[index].amount > Number(this.maxPurchasingPower) &&
                (index == 0 || this.amountList[index - 1].amount <= Number(this.maxPurchasingPower))
            )
        },
        clickUnable(item) {
            return NP.minus(item.amount, this.maxPurchasingPower) > 0
        },
        itemClick(e) {
            const { amount, count } = e.target.dataset
            this.$emit('confirm', { amount, count: +count })
            this.showPopup = false
        },
    },
}
</script>
<style scoped lang="less">
.popup {
    border-radius: 12px 12px 0 0;
}

.popup-content {
    height: 83vh;
    overflow: scroll;
    background: #fff;
    border-radius: 12px 12px 0 0;

    .header {
        position: sticky;
        top: 0;
        z-index: 1;
        padding: 0 12px;
        padding-bottom: 8px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #fff;

        .cancel-btn {
            position: absolute;
            top: 10px;
            left: 17px;
            width: 24px;
            height: 24px;
        }
    }

    .content {
        z-index: 0;

        .item {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            height: 60px;
            margin: 0 16px;
            color: #2f2f2f;
            font-weight: normal;
            font-size: 16px;

            &.mask-local {
                &::before {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1;
                    content: '';
                }
            }
        }

        .disabled {
            color: #666;
        }

        .selected {
            color: @theme;
        }

        .divide {
            position: relative;
            margin: 12px 0 8px;
            color: @fontLightColor;
            font-weight: normal;
            font-size: 12px;
            text-align: center;

            &::before {
                position: absolute;
                top: 6px;
                left: 40px;
                width: 32px;
                height: 1px;
                background: #efefef;
                content: '';
            }

            &::after {
                position: absolute;
                top: 6px;
                right: 40px;
                width: 32px;
                height: 1px;
                background: #efefef;
                content: '';
            }
        }
    }
}
</style>
