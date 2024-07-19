<template>
    <div class="trade-input">
        <div class="num-tip" v-show="calcDigits(amount)">
            <i></i>
            <span>{{ calcDigits(amount) }}</span>
        </div>
        <div class="left">{{ currency }}</div>
        <div class="input-box">
            <div class="input">
                <van-field
                    type="text"
                    inputmode="decimal"
                    v-model="amountDisplay"
                    :placeholder="placeholder"
                    :class="{ 'focus-large': amountDisplay, smaller: amountDisplay && smaller }"
                    clearable
                    :maxlength="maxLength"
                    @keyup="inputHandler($event, { base })"
                    @clear="onClear()"
                    @focus="focusHandler"
                    @blur="blurHandler({ base })"
                />
                <span v-if="buttonMsg" class="text-btn" :class="{ buttonMsgDisable: buttonMsgDisable }" @click="clickHandler">{{ buttonMsg }}</span>
            </div>
        </div>
    </div>
</template>
<script>
import { thousandsFilter } from '@/config/filters.js'
import { keepDecimals } from '@/utils'
export default {
    name: 'tradeInput',
    props: {
        currency: {
            type: String,
            default: '',
        },
        value: {
            type: [String, Number],
            default: '',
        },
        buttonMsg: {
            type: String,
            default: '',
        },
        buttonMsgDisable: {
            type: Boolean,
        },
        placeholder: {
            type: String,
            default: '',
        },
        base: {
            type: Number,
            default: 2,
        },
        // 整数部分最大展示位数
        intPartLength: {
            type: Number,
        },
        smaller: {
            type: Boolean,
        },
    },
    data() {
        return {
            amount: '',
            amountDisplay: '',
            isFocus: false,
        }
    },
    computed: {
        maxLength() {
            if (!this.intPartLength) return '-'
            return +this.intPartLength + Math.ceil(this.intPartLength / 3 - 1) + (this.base ? 1 + this.base : 0)
        },
    },
    watch: {
        value: {
            handler(newV, oldV) {
                if (newV !== oldV) {
                    this.amount = newV
                    this.amountDisplay = this.formatHandler(newV)
                }
            },
            immediate: true,
        },
        amount(v) {
            this.$emit('input', v)
        },
    },
    methods: {
        //返回输入位数
        calcDigits(num) {
            if (this.amountDisplay == '') {
                this.amount = ''
                return ''
            }
            num = num + ''
            const intStr = num.indexOf('.') > -1 ? num.split('.')[0] : num
            const numArr = {
                4: this.$t('qian'),
                5: this.$t('wan'),
                6: this.$t('shiwan'),
                7: this.$t('baiwan'),
                8: this.$t('qianwan'),
                9: this.$t('yi'),
                10: this.$t('shiyi'),
            }
            return numArr[intStr.length]
        },
        // 数据格式化
        formatHandler(value, options = { base: 3 }) {
            value = value + ''
            const reg = new RegExp(`\\.{${options.base},}`, 'g')
            let val = value.replace(/[^0-9\\.]/g, '').replace(reg, '.')
            if (+val < 0) val = '0'
            this.amount = val.indexOf('.') > 0 ? val.split('.')[0] + '.' + val.split('.')[1].substring(0, options.base) : val

            const startReg = /^0[0-9]\.*/g
            if (startReg.test(this.amount)) {
                // 规范开头写入的错误数字格式  (如： 001， 01)
                this.amount = Number(this.amount).toString()
            }
            //只能输入 intPartLength
            if (this.intPartLength) {
                if (this.amount.includes('.')) {
                    const arr = this.amount.split('.')
                    let integerPart = arr[0]
                    const decimalPart = arr[1]
                    integerPart = integerPart.replace(new RegExp(`^(.{${(1, this.intPartLength)}}).*$`), '$1')
                    this.amount = [integerPart, decimalPart].join('.')
                } else {
                    this.amount = this.amount.replace(new RegExp(`^(.{${(1, this.intPartLength)}}).*$`), '$1')
                }
            }
            return thousandsFilter(this.amount)
        },

        inputHandler(e, options = { base: 3 }) {
            const value = e.target.value
            if (!value) return
            this.amountDisplay = e.target.value = this.formatHandler(value, options)
        },

        onClear() {
            this.amount = ''
        },
        focusHandler() {
            this.isFocus = true
        },

        blurHandler(options = { base: 2 }) {
            this.isFocus = false
            if (this.amountDisplay == '') {
                this.amount = ''
                this.$emit('blur')
                return ''
            }
            this.amount = keepDecimals(this.amount, options.base)
            this.amountDisplay = thousandsFilter(this.amount)
            this.$emit('blur')
        },

        clickHandler() {
            if (this.buttonMsgDisable) return
            this.$emit('trigger')
        },
    },
}
</script>
<style scoped lang="less">
.trade-input {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 66px;
    overflow: hidden;

    .num-tip {
        position: absolute;
        top: 2px;
        left: 60px;
        z-index: 2;
        display: flex;
        flex-direction: row;
        align-items: center;

        i {
            display: inline-block;
            width: 1px;
            height: 12px;
            margin-right: 2px;
            background: #d6d6d6;
            transform: scaleX(0.5);
        }

        span {
            padding: 2px;
            color: #666;
            font-size: 8px;
            background: #f0f0f0;
            border-radius: 1px;
        }
    }

    // 底部0.5 border
    &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 1px;
        background: #efefef;
        transform: scaleY(0.5);
        content: '';
    }

    .left {
        width: 44px;
        font-size: 20px;
        line-height: 28px;
    }

    .input-box {
        display: flex;
        flex: 1;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }

    .input {
        display: flex;
        flex: 1;
        align-items: center;

        ::v-deep .van-field {
            flex: 1;
            padding: 10px 13px;
            color: #000;
            font-size: 20px;
            line-height: 28px;

            &.focus-large {
                font-size: 32px;
                line-height: 44px;
            }

            .smaller {
                font-size: 24px;
                line-height: 34px;
            }

            input::-webkit-input-placeholder {
                /* WebKit browsers 适配谷歌 */
                color: rgba(156, 156, 156, 0.6);
            }

            input:-moz-placeholder {
                /* Mozilla Firefox 4 to 18 适配火狐 */
                color: rgba(156, 156, 156, 0.6);
            }

            input::-moz-placeholder {
                /* Mozilla Firefox 19+ 适配火狐 */
                color: rgba(156, 156, 156, 0.6);
            }

            input:-ms-input-placeholder {
                /* Internet Explorer 10+  适配ie */
                color: rgba(156, 156, 156, 0.6);
            }
        }

        ::v-deep .van-cell::after {
            border-width: 0;
        }

        .text-btn {
            flex: 0 0 auto;
            color: @theme;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        .buttonMsgDisable {
            opacity: 0.3;
        }
    }
}
</style>
