<template>
    <van-field
        ref="inputRef"
        class="amount-input"
        type="text"
        inputmode="decimal"
        :value="amountDisplay"
        :placeholder="placeholder"
        :clearable="clearable"
        :maxlength="maxLength"
        @input="onInput"
        @keyup="onKeyup"
        @focus="handleFocus"
        @blur="onBlur"
        @clear="onClear"
    />
</template>

<script>
import { thousandsFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
export default {
    name: 'amount-input',
    props: {
        // 是否可清空
        clearable: {
            type: Boolean,
            default: false,
        },
        // 限制的小数位
        limitDecimal: {
            type: Number,
            default: 2,
        },
        value: {
            type: [Number, String],
        },
        placeholder: {
            type: String,
            default: '',
        },
        maxlength: {
            type: [Number, String],
        },
    },
    data() {
        return {
            amountDisplay: '',
            number: '',
        }
    },
    computed: {
        maxLength() {
            if (!this.maxlength) return ''
            return +this.maxlength + Math.ceil(this.maxlength / 3 - 1) + (this.limitDecimal ? 1 + this.limitDecimal : 0)
        },
        input() {
            return this.$refs.inputRef.$refs.input
        },
    },
    watch: {
        value: {
            handler(v) {
                this.number = v
                this.formatNumebr(v)
            },
        },
    },
    mounted() {
        this.number = this.value
        this.formatNumebr(this.value)
    },

    methods: {
        formatNumebr(number) {
            this.amountDisplay = thousandsFilter(number)
            this.setInputValue(this.amountDisplay)
            this.$emit('input', number)
        },

        formatPrice(e) {
            let ret = e.target.value
            ret = ret.replace(/[^\d.]/g, '')
            // 必须保证第一位为数字而不是.
            ret = ret.replace(/^\./g, '')
            // 保证只有出现一个.而没有多个.
            if (this.limitDecimal > 0) {
                ret = ret.replace(/\.{2,}/g, '.')
                // 保证.只出现一次，而不能出现两次以上
                ret = ret.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
            } else {
                ret = ret.replace(/\.{1,}/g, '')
            }
            //只能输入maxlength
            if (this.maxlength) {
                if (ret.includes('.')) {
                    const arr = ret.split('.')
                    let integerPart = arr[0]
                    const decimalPart = arr[1]
                    integerPart = integerPart.replace(new RegExp(`^(.{${(1, this.maxlength)}}).*$`), '$1')
                    ret = [integerPart, decimalPart].join('.')
                } else {
                    ret = ret.replace(new RegExp(`^(.{${(1, this.maxlength)}}).*$`), '$1')
                }
            }

            ret = ret.replace(new RegExp(`^(.*\\..{${this.limitDecimal}}).*$`), '$1') //只能输入2位小数
            return ret
        },

        onKeyup(e) {
            this.$emit('keyup', e)
        },

        handleFocus(e) {
            this.$emit('focus', e)
        },

        onBlur(e) {
            if (this.amountDisplay == '') {
                return ''
            }
            this.$emit('blur', e)
            this.number = this.number.replace(/,/g, '')
            this.number = toFixed(Number(this.number), this.limitDecimal)
            this.formatNumebr(this.number)
        },

        onClear() {
            this.number = ''
            this.amountDisplay = ''
            this.$emit('input', this.number)
            this.$emit('clear', this.number)
        },

        setInputValue(v) {
            this.input.value = v
        },

        onInput(value) {
            // 认为删除了“，”
            const amountLen = this.amountDisplay.length
            const valueLen = value.length
            if (valueLen < amountLen && value !== this.amountDisplay && thousandsFilter(value.replace(/[,]/g, '')) === this.amountDisplay) {
                let index = 0
                for (let i = 0; i < amountLen; i++) {
                    const oldV = this.amountDisplay[i]
                    const newV = value[i]
                    if (oldV !== newV) {
                        index = i
                        break
                    }
                }
                // 说明删除的为“,”前一位
                index -= 1
                // 更新value数据
                value = value.substring(0, index) + value.substring(index + 1, value.length)
            }
            const onlyHasNumberCode = /^[\d.,]+$/g.test(value)
            const onlyHasOneDot = /^\d+\.\d+$/g.test(value)
            if (onlyHasNumberCode && onlyHasOneDot) {
                const currentValue = value.replace(/[^\d.]/g, '') // 会包含","千分号
                const oldValue = this.number
                if (currentValue === oldValue) {
                    // 不进行操作
                    this.$emit('input', this.number)
                    return
                }
            }

            const ret = this.formatPrice({ target: { value: value } })
            this.number = ret
            this.formatNumebr(ret)
        },
    },
}
</script>

<style scoped lang="less"></style>
