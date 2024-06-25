<template>
    <div class="titleDialog">
        <van-dialog
            v-model="show"
            width="280px"
            :show-cancel-button="!!cancelText"
            :show-confirm-button="!!confirmText"
            :cancel-button-text="cancelText"
            :confirm-button-text="confirmText"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6907"
            @confirm="$emit('confirm')"
            @cancel="$emit('cancel')"
        >
            <div :style="{ ...defaultStyle }">
                {{ title }}
            </div>
        </van-dialog>
    </div>
</template>

<script>
import { Dialog } from 'vant'
import { i18n } from '@/i18n/fund/index.js'

export default {
    name: 'titleDialog',
    components: {
        [Dialog.name]: Dialog,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
            default: '',
        },
        cancelText: {
            type: String,
            default() {
                return i18n.t('cancel')
            },
        },
        confirmText: {
            type: String,
            default() {
                return i18n.t('confirm')
            },
        },
    },
    computed: {
        visible: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
    watch: {
        value(val) {
            this.show = val
        },
        show(val) {
            this.$emit('input', val)
        },
    },
    data() {
        return {
            show: false,
            defaultStyle: {
                color: '#2F2F2F',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'center',
                width: '100%',
                height: '78px',
                lineHeight: '78px',
            },
        }
    },
    methods: {},
}
</script>

<style scoped lang="less">
::v-deep .van-dialog__cancel {
    color: #2f2f2f;
    font-weight: bold;
    font-size: 16px;
    background: #fff;
}

::v-deep .van-dialog {
    border-radius: 12px;
}
</style>
