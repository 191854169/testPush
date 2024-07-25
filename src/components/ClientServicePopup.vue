<template>
    <div>
        <van-popup v-model="show" v-bind="$attrs" round position="bottom" :safe-area-inset-bottom="true">
            <div class="client-service">
                <div class="action">
                    <a href="tel:+852 3978 5095" class="item">
                        <multi-img name="client_service_phone" directory="common" width="48" />
                        <div class="name">{{ _t('hkService') }}</div>
                    </a>
                    <div class="item wechat-action" data-clipboard-text="+85254299780" @click="onCopyWechat">
                        <multi-img name="client_service_wechat" directory="common" width="48" />
                        <div class="name">{{ _t('enterpriseWeChat') }}</div>
                    </div>
                </div>

                <div class="cancel-btn" @click="show = false">{{ _t('cancel') }}</div>
            </div>
        </van-popup>
    </div>
</template>

<script>
import Clipboard from 'clipboard'
import { i18n } from '@/i18n/common'

export default {
    props: {
        value: Boolean,
    },
    computed: {
        show: {
            get() {
                return this.value
            },
            set(val) {
                this.$emit('input', val)
            },
        },
    },
    methods: {
        _t: v => i18n.t(v),
        onCopyWechat() {
            const clipboard = new Clipboard('.wechat-action')
            clipboard.on('success', () => {
                this.$toast(this._t('copySuccess'))
                clipboard.destroy()
            })
            clipboard.on('error', () => {
                clipboard.destroy()
            })
        },
    },
}
</script>
<style scoped lang="less">
.client-service {
    text-align: center;

    .action {
        display: flex;
        justify-content: center;
        padding: 32px 0 24px;
        column-gap: 90px;

        .name {
            margin-top: 12px;
            color: @fontBlackColor;
        }
    }

    .cancel-btn {
        line-height: 50px;
        box-shadow: 0 0.5px 0 0 #efefef inset;
    }
}
</style>
