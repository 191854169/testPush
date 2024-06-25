<template>
    <div class="text-input" @click="clickInput">
        <!-- 这里默认需要用 nbsp 占位 -->
        <p class="label des">{{ inputValue ? label || '&nbsp;' : '&nbsp;' }}</p>
        <input v-if="!textarea" :type="type" :placeholder="placeholder" v-model="inputValue" @input="changeInput" @blur="blur" :disabled="disabled" />
        <!-- <div
            v-else
            :type="type"
            contenteditable
            class="textarea"
            :placeholder="placeholder"
            @input="changeInput($event, 'textarea')"
            @blur="blur"
            :disabled="disabled"
        >{{ textareaValue || inputValue }}</div> -->
        <textarea
            v-else
            class="textarea"
            ref="textArea"
            rows="4"
            v-model="inputValue"
            :placeholder="placeholder"
            @input="changeInput"
            @blur="blur"
            :disabled="disabled"
        ></textarea>
        <!-- <van-field
            v-else
            v-model="inputValue"
            center
            type="textarea"
            :placeholder="placeholder"
        ></van-field> -->
        <div class="flex input-tip">
            <p class="text-err">{{ showErrTip || '&nbsp;' }}</p>
            <p class="additional">
                <!-- 在错误信息提示栏增加一个附加信息提示，用在身份证的长期选择功能 -->
                <slot name="additional"></slot>
            </p>
        </div>

        <i class="fsfont more" v-if="rightIco == 'more'" @click="clickRightIco">&#xe609;</i>
        <i class="fsfont camera" v-if="rightIco == 'camera'" @click="clickRightIco">&#xe619;</i>
        <!-- 显示一个搜索或者联想的插槽 -->
        <div class="popup-search">
            <slot name="search"></slot>
        </div>
    </div>
</template>
<script>
export default {
    name: 'TextInput',
    props: {
        /** 左上角显示的标题 */
        label: {
            type: String,
            default: () => {
                return ''
            },
        },
        /** input type */
        type: {
            type: String,
            default: () => {
                return 'text'
            },
        },
        maxLength: {
            type: Number,
            default: () => {
                return 120
            },
        },
        /** 是否为文本编辑框 */
        textarea: {
            type: Boolean,
            default: () => {
                return false
            },
        },
        /** input placeholder */
        placeholder: {
            type: String,
            default: () => {
                return '请输入内容'
            },
        },
        /** 值 */
        value: {
            type: String,
            default: () => {
                return ''
            },
        },
        /** 错误提示文案 */
        errText: {
            type: String,
            default: () => {
                return ''
            },
        },
        /** 右侧图标
         * 默认： 无
         * 支持： more、camera 两种
         */
        rightIco: {
            type: String,
            default: () => {
                return ''
            },
        },
        /**
         *  @回调方法，
         * format(){}
         */
        format: {
            type: Function,
            default: null,
        },
        /**
         * 是否必填
         */
        required: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否禁用
         */
        disabled: {
            type: Boolean,
            default: () => false,
        },

        /**
         * @改变的时候触发
         * change(){}
         */
    },
    data() {
        return {
            inputValue: '',

            isTipError: false, // 必填项目默认不提示错误，在输入过内容之后再提示错误
        }
    },
    computed: {
        /** 字段必填状态下，没有错误提示文字且值为空的时候，自动生成错误提示 */
        showErrTip: function () {
            if (this.isTipError) {
                if (this.required == true && !this.errText) {
                    if (!this.inputValue) {
                        return this.label + '不能为空'
                    }
                    return this.errText
                }
                return this.errText
            }
            return ' '
        },
    },
    mounted() {
        this.inputValue = this.$props.value

        // this.$nextTick(()=>{
        //     let textArea = this.$refs.textArea
        //     textArea.style.height = textArea.scrollHeight + 'px'
        // })
    },
    methods: {
        /** 输入框发生变化 */
        changeInput(e) {
            if (this.isTipError == false) {
                this.isTipError = true
            }

            let value = this.inputValue
            //如果是 textarea 则去获取元素的文字类容

            // 处理最大长度的限制
            if (this.inputValue.length > this.maxLength) {
                value = this.inputValue.slice(0, this.maxLength)
                this.inputValue = value
            }

            // 如果有数据过滤则先调用数据过滤，在出发 change 事件
            if (this.$props.format) {
                const val = this.$props.format({
                    value,
                })
                this.inputValue = val
                value = val
            }
            this.$emit('change', {
                e,
                value,
            })
        },

        /**
         * 修复 div contenteditable 属性修改内容之后，光标定位不准确的问题
         */
        // keepLastIndex(obj) {
        //     if (window.getSelection) {//ie11 10 9 ff safari
        //         obj.focus(); //解决ff不获取焦点无法定位问题
        //         let range = window.getSelection();//创建range
        //         range.selectAllChildren(obj);//range 选择obj下所有子内容
        //         range.collapseToEnd();//光标移至最后
        //     }
        //     else if (document.selection) {//ie10 9 8 7 6 5
        //         let range = document.selection.createRange();//创建选择对象
        //         //var range = document.body.createTextRange();
        //         range.moveToElementText(obj);//range定位到obj
        //         range.collapse(false);//光标移至最后
        //         range.select();
        //     }
        // },
        /** 点击右侧图标 */
        clickRightIco() {
            this.$emit('clickRightIco')
        },
        /** 点击整个区域触发 */
        clickInput() {
            this.$emit('clickInput')
        },
        /** 输入框失去焦点的时候 */
        blur() {
            this.$emit('blur')
        },
    },
    watch: {
        '$props.value': function (n) {
            this.inputValue = n
        },
    },
}
</script>
<style lang="less" scoped>
.text-input {
    position: relative;
    padding-top: 13px;
}

.label {
    font-size: 10px;
    line-height: 14px;
}

input,
.textarea {
    width: 100%;
    padding: 8px 0;
    padding-right: 18px;
    color: #1f1f1f;
    font-weight: 400;
    font-size: 14px;
    border-color: #efefef;
    border-style: solid;
    border-width: 0 0 1px;
    transition: all 0.2s ease-in;
    resize: none;
    user-select: auto;
    caret-color: #0d76ff;

    &::placeholder {
        color: #9c9c9c;
    }

    &:disabled {
        background: rgba(0, 0, 0, 0);
    }

    &:focus {
        border-color: #ff6907;
        transition: all 0.2s ease-in;
    }
}

.textarea {
    min-width: 100%;
    max-width: 100%;

    &:empty::before {
        color: #9c9c9c;
        content: attr(placeholder);
    }
}

.input-tip {
    justify-content: space-between;
}

.text-err {
    padding-top: 4px;
    font-size: 12px;
    line-height: 16px;
}

.popup-search {
    position: absolute;
    bottom: 0;
    left: -16px;
    z-index: 9999;
    width: calc(100% + 32px);
    height: 0;
}

.more,
.camera {
    position: absolute;
    top: 38px;
    right: 0;
    color: #979797;
}

.more {
    font-size: 14px;
}

.camera {
    top: 36px;
    font-size: 20px;
}
</style>
