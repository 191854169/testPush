<template>
    <div class="code-input">
        <van-row :gutter="gutter">
            <van-col :span="colSpan" v-for="item in length" :key="`value${item - 1}`">
                <div
                    class="code-item"
                    :class="{
                        mask: mask,
                        active: activeIndex === item - 1 && inputFocus,
                    }"
                >
                    <span>{{ value[item - 1] }}</span>
                </div>
            </van-col>
        </van-row>
        <Input
            ref="input-field"
            class="input-field"
            type="tel"
            pattern="[0-9]*"
            :maxlength="length"
            :value="inputValue"
            @input="handleInput"
            @focus="inputFocus = true"
            @blur="inputFocus = false"
        />
    </div>
</template>
<script>
export default {
    name: 'CodeInput',
    props: {
        /** 值 */
        value: {
            type: String,
            default: '',
        },
        // 输入长度
        length: {
            type: Number,
            default: 6,
        },
        gutter: {
            type: Number || String,
            default: 0,
        },
        mask: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            inputValue: this.value,
            inputFocus: false,
            inputDom: null,
        }
    },
    computed: {
        colSpan() {
            return 24 / this.length
        },
        activeIndex() {
            return this.inputValue.length === this.length ? this.length - 1 : this.inputValue.length
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.inputDom = this.$refs['input-field']
        })
    },
    methods: {
        handleInput(e) {
            const val = e.target.value ?? ''

            const isMatch = /[0-9]*/g.test(val) && val.length <= this.length

            this.inputValue = val
            this.$emit('input', isMatch ? val : this.inputValue)
        },
        reset(clear = false) {
            if (this.inputDom) {
                this.inputDom.value = ''
            }
            this.inputValue = ''
            clear && this.$emit('input', '')
        },
        focus() {
            if (this.inputDom) {
                this.inputDom.focus()
            }
        },
    },
    watch: {
        value(val) {
            if (val.length === this.length) {
                this.$emit('inputAll', val)

                const inputDom = this.$refs['input-field']
                if (inputDom) {
                    inputDom.blur()
                    this.inputValue = ''
                }
            }
        },
    },
}
</script>
<style lang="less" scoped>
.code-input {
    position: relative;

    .code-item {
        height: 56px;
        font-size: 24px;
        line-height: 56px;
        text-align: center;
        background-color: #f9f9f9;
        border-radius: 4px;

        &.active {
            border: 1px solid #ff6907;
        }
    }

    .input-field {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 99;
        width: 100%;
        height: 100%;
        opacity: 0;
    }
}
</style>
