<template>
    <div class="limited-textBox" :message.sync="message">
        <div class="limited-content">
            <van-field
                class="limited-text"
                :class="{ 'limited-text-oneline': isOneLine }"
                v-model="message"
                :border="false"
                :autosize="{ maxHeight: this.getMaxH(), minHeight: this.getMinH() }"
                :type="isOneLine ? 'text' : 'textarea'"
                :placeholder="this.placeholder"
                :clearable="clearable"
                @input="textChanged"
            >
                <div slot="right-icon">
                    <div v-if="showCount" class="limited-limit-count" :class="{ 'limited-limit-count-oneline': isOneLine }">
                        <span :class="{ error_color: overBehaviourError && this.count > this.maxTextLength }">{{ this.count }}</span>
                        <span>{{ `/${this.maxTextLength.toString()}` }}</span>
                    </div>
                </div>
            </van-field>
        </div>
    </div>
</template>

<script>
export default {
    name: 'text-limited-box',
    data() {
        return {
            count: 0,
            oldMessage: '',
        }
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: '',
        },
        boxHeight: {
            type: Number,
            default: 100,
        },
        maxTextHeight: {
            type: Number,
            default: 0,
        },
        minTextHeight: {
            type: Number,
            default: 0,
        },
        maxTextLength: {
            type: Number,
            default: 200,
        },
        isOneLine: {
            type: Boolean,
            default: false,
        },
        showCount: {
            type: Boolean,
            default: true,
        },
        clearable: {
            type: Boolean,
            default: false,
        },
        // 字数超过最大值后的表现
        overBehaviour: {
            type: String,
            default: 'error',
            validator: v => {
                // error 提示超出限制错误
                // cutOff 不显示
                return ['error', 'cutOff'].includes(v)
            },
        },
    },
    computed: {
        message: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v, [...v].length > this.maxTextLength)
            },
        },
        overBehaviourError() {
            return this.overBehaviour === 'error'
        },
        overBehaviourCutOff() {
            return this.overBehaviour === 'cutOff'
        },
    },
    watch: {
        message: {
            handler(v) {
                this.$nextTick(() => {
                    this.count = [...v].length
                    this.oldMessage = v
                })
            },
        },
    },
    methods: {
        textChanged(value) {
            if ([...value].length > this.maxTextLength) {
                if (this.overBehaviourError) {
                    this.message = value
                } else if (this.overBehaviourCutOff) {
                    this.$nextTick(() => {
                        this.message = this.oldMessage
                    })
                } else {
                    console.error('未识别指令', this.overBehaviour)
                }
            } else {
                this.message = value
            }
        },
        getMaxH() {
            return this.maxTextHeight > 0 ? this.maxTextHeight : this.boxHeight
        },
        getMinH() {
            return this.minTextHeight > 0 ? this.minTextHeight : this.boxHeight
        },
    },
}
</script>

<style scoped lang="less">
.limited-textBox {
    .limited-content {
        position: relative;
        align-items: center;
        width: auto;
        height: 100%;
    }

    .limited-limit-count {
        // background-color: #f9f9f9;
        position: absolute;
        right: 0;
        bottom: -14px;
        z-index: 1;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 10px;
        line-height: 14px;

        .error_color {
            color: #f31414;
        }
    }

    .limited-limit-count-oneline {
        position: static;
    }

    .limited-text {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 12px 12px 26px;
        color: #2f2f2f;
        line-height: normal;
        background-color: #f9f9f9;
        border-radius: 8px;

        //YLTODO: scrollbar设置手机上不生效 (display除外)
        /deep/::-webkit-scrollbar {
            position: absolute !important;
            right: 0 !important;
            display: none;
            width: 3px !important; /* 对垂直流动条有效 */
        }

        /* 定义滚动条的轨道颜色、内阴影及圆角 */
        /deep/::-webkit-scrollbar-track {
            background-color: transparent !important;
            border-radius: 4px !important;
        }

        /* 定义滑块颜色、内阴影及圆角 */
        /deep/::-webkit-scrollbar-thumb {
            background-color: #d9d9d9 !important;
            border-radius: 4px !important;
        }
    }

    .limited-text-oneline {
        padding: 0 12px;

        /deep/.van-field__control {
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 48px;
        }
    }
}
</style>
