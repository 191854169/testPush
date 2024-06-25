<template>
    <div class="footer-box">
        <slot>
            <div class="button-main flex-c">
                <div class="legal-tip" v-if="tip.length > 0">{{ tip }}</div>
                <div class="button" @click="handleClick">{{ $t('bills.addCustomizeProduct') }}</div>
            </div>
        </slot>
    </div>
</template>

<script>
export default {
    name: 'bottomButton',
    props: {
        tip: {
            type: String,
            default() {
                return ''
            },
        },
    },
    data() {
        return {}
    },
    methods: {
        handleClick() {
            this.$goPage('/bill-customize-add')
        },
    },
}
</script>

<style lang="less" scoped>
.footer-box {
    #iosBottom(8px);

    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 19;
    max-width: 375px;
    margin: 0 auto;
    background: #fff;

    .button-main {
        .legal-tip {
            position: absolute;
            top: -30px;
            right: 0;
            left: 0;
            color: @fontGreyColor;
            font-weight: 400;
            font-size: 12px;
            font-style: normal;
            line-height: 18px;
            text-align: center;
        }

        .button {
            width: 100%;
            height: 44px;
            margin: 8px 28px 4px;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background-color: #ff6907;
            border-radius: 22px;
        }
    }
}
</style>
