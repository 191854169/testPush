<template>
    <van-dialog v-model="showDialog" width="2.8rem" title="联系我们" confirm-button-text="已了解" @confirm="onConfirm">
        <div class="block">
            <div class="row">
                <span class="label">内地客服：</span>
                <a href="tel:400 812 0922">400 812 0922</a>
            </div>

            <div class="row mar-t12">
                <span class="label">香港客服：</span>
                <a href="tel:+852 2979 6988">+852 2979 6988</a>
            </div>
        </div>
    </van-dialog>
</template>

<script>
export default {
    props: {
        show: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        showDialog: {
            get() {
                return this.show
            },
            set() {},
        },
    },
    methods: {
        onConfirm() {
            this.$emit('confirm')
        },
    },
}
</script>

<style lang="less" scoped>
.block {
    padding: 0 16px 28px;

    .row {
        font-size: 14px;

        .label {
            color: #2f2f2f;
        }

        a {
            color: #043799;
        }
    }
}
</style>
