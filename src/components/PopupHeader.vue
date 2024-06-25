<template>
    <div class="popup-header">
        <p>{{ title }}</p>
        <div class="popup-info">
            <img src="@/assets/images/openAccount/popup-close.png" alt srcset @click="close" />
            <span @click="success" v-show="showOk">{{ rightText }}</span>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        /** title 文字 */
        title: {
            type: String,
            default: () => 'Title',
        },
        /** 右侧的文字 */
        rightText: {
            type: String,
            default: () => '确定',
        },
        /** 是否显示确认按钮 */
        showOk: {
            type: Boolean,
            default: () => true,
        },
    },
    methods: {
        /** 点击关闭按钮 */
        close() {
            this.$emit('close')
        },
        /** 点击右侧的文字 */
        success() {
            this.$emit('success')
        },
    },
}
</script>
<style lang="less" scoped>
.popup-header {
    height: 44px;

    p {
        font-weight: 500;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
    }

    .popup-info {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 44px;
        padding: 0 16px;

        img {
            width: 22px;
            height: 22px;
        }

        span {
            color: #ff6907;
            font-size: 14px;
        }
    }
}
</style>
