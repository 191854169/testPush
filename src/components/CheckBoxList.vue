<template>
    <div class="agreement-list">
        <ul class="list">
            <li v-for="item in list" :key="item.name">
                <div class="input">
                    <van-checkbox icon-size="16" v-model="value[item.name]">
                        {{ item.desc }}
                    </van-checkbox>
                </div>
                <div class="error" v-if="showError && !value[item.name] && item.errorMsg">
                    {{ item.errorMsg }}
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    props: {
        list: {
            required: true,
            type: Array,
            default() {
                return []
            },
        },
        value: {
            type: Object,
            default() {
                return {}
            },
        },
        showError: {
            type: Boolean,
            default: false,
        },
        defaultChecked: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {}
    },
    mounted() {
        if (this.defaultChecked) {
            const newValues = this.list.reduce((values, item) => {
                values[item.name] = this.value[item.name] ?? true

                return values
            }, {})

            this.$emit('input', newValues)
        }
    },
    methods: {},
}
</script>
<style lang="less" scoped>
.agreement-list {
    position: relative;

    .list {
        li {
            margin-bottom: 16px;

            &:last-child {
                margin-bottom: 0;
            }

            .input {
                ::v-deep .van-checkbox {
                    align-items: flex-start;

                    .van-checkbox__icon {
                        position: relative;
                        top: 2px;
                    }
                }
            }

            .error {
                margin-top: 8px;
                margin-left: 24px;
                color: #f31414;
                font-size: 12px;
            }
        }
    }
}
</style>
