<template>
    <van-dialog
        ref="dialog"
        width="2.8rem"
        v-model="show"
        :title="$translate('tipTitle')"
        :confirm-button-text="$translate('onlineService')"
        :showCancelButton="true"
        @confirm="onConfirm"
        @cancel="onCancel"
    >
        <div class="freeze-dialog__main">
            <div class="mb-12">{{ $translate('freezeTips') }}</div>

            <div clas="row">
                <span class="label">{{ $translate('mainlandService') }}：</span>
                <a href="tel:400 812 0922">400 812 0922</a>
            </div>

            <div clas="row">
                <span class="label">{{ $translate('hkService') }}：</span>
                <a href="tel:+852 2979 6988">+852 2979 6988</a>
            </div>
        </div>
    </van-dialog>
</template>

<script>
import { i18n } from '@/i18n/common'
import { customerService } from '@/utils'

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

        onConfirm() {
            this.$emit('confirm')
            if (!this.isInMylink) {
                this.goOnlineService()
            }
        },

        goOnlineService() {
            let link = customerService({
                url: true,
            })

            if (window.JSBridge) {
                window.JSBridge.getUserinfo()
                    .then(data => {
                        const subAcctId = (((data?.clientInfo || {}).accts || [])[0] || {}).subAcctId || ''
                        const hlid = data?.clientInfo?.hlId || ''
                        link = customerService({
                            url: true,
                            userid: subAcctId,
                            hlid: hlid,
                        })
                        window.JSBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
                    .catch(() => {
                        window.JSBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
            } else {
                window.open(link)
            }
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
