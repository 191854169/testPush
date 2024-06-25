<template>
    <van-dialog
        class="additional-coupon-tips-dialog"
        width="2.8rem"
        v-model="show"
        :title="title"
        showCancelButton
        :cancelButtonText="$t('coupon.couponTipsBtnLeft')"
        :confirmButtonText="$t('coupon.couponTipsBtnRight')"
        @confirm="$emit('confirm')"
        @cancel="$emit('cancel')"
    >
        <div class="addiional-tips-content">
            <div class="item">
                {{ $t('coupon.couponTips') }}
            </div>
        </div>
    </van-dialog>
</template>

<script>
export default {
    name: 'AdditionCouponDialog',
    mixins: [],
    components: {},
    props: {
        title: {
            type: String,
            default() {
                return '提示'
            },
        },
        value: {
            type: Boolean,
            required: true,
        },
    },
    computed: {
        show: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
}
</script>

<style scoped lang="less">
.addiional-tips-content {
    height: 68px;
    padding: 0 16px;
    font-size: 14px;
    line-height: 20px;
}
</style>
