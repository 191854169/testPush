<template>
    <div>
        <van-dialog ref="dialog" width="2.8rem" v-model="show" :title="$translate('tipTitle')" :confirm-button-text="$translate('iKnow')">
            <div class="freeze-dialog__main">
                <div class="mb-12">
                    <span>{{ $translate('freezeTips') }}</span>
                    <span class="action" @click="showCS">{{ $translate('concatUs') }}</span>
                </div>
            </div>
        </van-dialog>
        <ClientServicePopup v-model="csShow"></ClientServicePopup>
    </div>
</template>

<script>
import { i18n } from '@/i18n/common'
import ClientServicePopup from '@/components/ClientServicePopup.vue'

export default {
    components: {
        ClientServicePopup,
    },
    data() {
        return {
            show: false,
            csShow: false,
        }
    },
    methods: {
        $translate: v => i18n.t(v),
        showCS() {
            this.csShow = true
            this.show = false
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

    .action {
        color: @theme;
    }
}
</style>
