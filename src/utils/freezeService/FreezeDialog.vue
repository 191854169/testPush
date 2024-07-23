<template>
    <van-dialog
        ref="dialog"
        width="2.8rem"
        v-model="show"
        :title="$translate('tipTitle')"
        :confirm-button-text="$translate('iKnow')"
        @confirm="onCancel"
    >
        <div class="freeze-dialog__main">
            <div class="mb-12">{{ $translate('freezeTips') }}</div>

            <div clas="row">
                <span class="label">{{ $translate('hkService') }}</span>
                <a href="tel:+852 3978 5095">+852 3978 5095</a>
            </div>
        </div>
    </van-dialog>
</template>

<script>
import { i18n } from '@/i18n/common'

export default {
    data() {
        return {
            show: false,
        }
    },
    methods: {
        $translate: v => i18n.t(v),
        onCancel() {
            this.$emit('cancel')
        },
    },
}
</script>
<style scoped lang="less">
.freeze-dialog__main {
    padding: 0 16px 16px;
    font-size: 14px;
    line-height: 20px;

    > div {
        margin-bottom: 12px;
    }
}
</style>
