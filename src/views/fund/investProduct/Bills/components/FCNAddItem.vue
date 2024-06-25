<template>
    <div class="item">
        <div class="info-area border-bottom-1px" :class="{ 'input-entering': isFocus, 'input-error': anyError }">
            <div class="title-label">
                <div class="label">{{ item.label }}</div>
                <multi-img v-if="!!item.infoTips" name="icon-tips" directory="common" @click.stop="tipsRemind"></multi-img>
            </div>

            <div v-if="type === 'options'" class="type-area type-options" @click="$emit('onClick')">
                <div v-if="!value" class="placeholder">{{ $t('bills.selectPlaceholder') }}</div>
                <div v-else class="placeholder h1 value line-elipsis">{{ value }}</div>
                <multi-img name="icon-right-arrow" directory="common" />
            </div>
            <div v-if="type === 'input'" class="type-area type-input">
                <van-field
                    v-model="amountDisplay"
                    ref="inputRef"
                    class="amount-input"
                    type="text"
                    inputmode="decimal"
                    :placeholder="$t('fcn.pleaseInput')"
                    @keyup="inputHandler($event)"
                    @focus="focusHandler()"
                    @blur="blurHandler()"
                />
                <span v-if="!!item.suffix">{{ item.suffix }}</span>
            </div>
        </div>
        <div v-if="showErrorTips" class="error">{{ errorMsg }}</div>
        <div v-else-if="showRangeTips" class="error">{{ errorRangeMsg }}</div>
    </div>
</template>

<script>
import { thousandsFilter } from '@/config/filters.js'
import { keepDecimals } from '@/utils'
import NP from 'number-precision'

export default {
    name: 'FCNAddItem',
    mixins: [],
    components: {},
    props: {
        value: {
            type: [String, Number],
        },
        /*
        label/base/suffix/infoTips
        */
        item: {
            type: Object,
            default() {
                return {}
            },
        },
        type: {
            type: String,
            validator(value) {
                return ['options', 'input'].includes(value)
            },
        },
    },
    data() {
        return {
            showErrorTips: false,
            showRangeTips: false,
            showEmptyError: false,
            showOpEmptyError: false,
            amount: '',
            amountDisplay: '',
            isFocus: false,
        }
    },
    computed: {
        errorMsg() {
            if (this.base === 0) {
                return this.$t('fcn.error1')
            }
            return this.$t('fcn.error2')
        },
        errorRangeMsg() {
            if (this.item.range) {
                return this.$t('fcn.error3', { range: `${this.item.range.min}~${this.item.range.max}` })
            }
            return ''
        },
        base() {
            return this.item.base ?? 2
        },
        anyError() {
            return this.showErrorTips || this.showRangeTips || this.showEmptyError || this.showOpEmptyError
        },
    },
    watch: {
        value: {
            handler(newV, oldV) {
                if (newV !== oldV) {
                    this.showEmptyError = false
                    if (this.type === 'input') {
                        this.amount = newV
                        this.amountDisplay = this.formatHandler(newV)
                    }
                }
            },
            immediate: true,
        },
        amount(v) {
            this.$emit('input', v)
        },
    },
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        focusHandler() {
            this.isFocus = true
            this.amountDisplay = this.amount
            this.$emit('focus')
        },
        blurHandler() {
            this.isFocus = false
            this.showErrorTips = false
            if (this.amountDisplay === '') {
                this.amount = ''
                this.$emit('blur')
                return ''
            }
            this.amountDisplay = thousandsFilter(keepDecimals(this.amount, this.base))
            this.$emit('blur')
        },
        inputHandler(e) {
            const value = e.target.value
            if (!value) {
                this.showRangeTips = false
                return
            }
            this.amountDisplay = e.target.value = this.formatHandler(value, true)
        },
        // 数据格式化
        formatHandler(value, isInput = false) {
            value = value + ''
            const reg = new RegExp(`\\.{${this.base},}`, 'g')
            let val = value.replace(/[^0-9\\.]/g, '').replace(reg, '.')
            if (this.base === 0) {
                val = value.replace(/[^0-9\\]/g, '')
            }

            if (+val < 0) val = '0'
            this.amount = val.indexOf('.') > 0 ? val.split('.')[0] + '.' + val.split('.')[1].substring(0, this.base) : val

            if (isInput) {
                this.showErrorTips = value.replace(/,/g, '') !== val
                const left = NP.minus(val, this.item.range.min || 0) >= 0
                const right = NP.minus(this.item.range.max || 0, val) >= 0
                this.showRangeTips = !this.showErrorTips && !(left && right)
            }

            const startReg = /^0[0-9]\.*/g
            if (startReg.test(this.amount)) {
                // 规范开头写入的错误数字格式  (如： 001， 01)
                this.amount = Number(this.amount).toString()
            }
            return thousandsFilter(this.amount)
        },
        tipsRemind() {
            this.$dialog.confirm({
                title: this.$t('tipTitle'),
                message: this.item.infoTips,
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                messageAlign: 'center',
            })
        },
    },
}
</script>

<style scoped lang="less">
.item {
    height: 80px;
    background: #fff;

    .info-area {
        padding: 6px 0;
        background-color: #fff;

        .title-label {
            display: flex;

            img {
                width: 14px;
                height: 14px;
                margin-left: 4px;
            }
        }

        .label {
            margin-bottom: 7px;
            color: @h2-white;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .type-area {
            display: flex;
            align-items: center;
            height: 21px;
        }

        .type-options {
            justify-content: space-between;

            img {
                width: 12px;
                height: 12px;
            }
        }

        .type-input {
            height: 21px;

            .placeholder-style {
                input::-webkit-input-placeholder {
                    /* WebKit browsers 适配谷歌 */
                    color: #9c9c9c;
                }

                input:-moz-placeholder {
                    /* Mozilla Firefox 4 to 18 适配火狐 */
                    color: #9c9c9c;
                }

                input::-moz-placeholder {
                    /* Mozilla Firefox 19+ 适配火狐 */
                    color: #9c9c9c;
                }

                input:-ms-input-placeholder {
                    /* Internet Explorer 10+  适配ie */
                    color: #9c9c9c;
                }
            }

            .amount-input {
                padding: 0;

                &.van-cell::after {
                    border-bottom: none;
                }
            }

            ::v-deep .van-field {
                padding: 0;
                color: @h1-white;
                font-size: 15px;
                line-height: 21px;
                .placeholder-style();
            }

            span {
                color: @h1-white;
                font-size: 15px;
                line-height: 21px;
            }
        }

        .placeholder {
            color: @h3-white;
            font-size: 15px;
            line-height: 21px;
        }

        .h1 {
            color: @h1-white;
        }

        .value {
            white-space: pre-wrap;
        }
    }

    .error {
        margin-top: 4px;
        color: #f31414;
        font-size: 12px;
        line-height: 16px;
    }

    .input-entering.border-bottom-1px::after {
        background-color: #ff6907;
    }

    .input-error.border-bottom-1px::after {
        background-color: #f31414;
    }
}
</style>
