<template>
    <van-dialog
        v-model="showDialog"
        width="2.8rem"
        title="确定退出登录？"
        message="退出后，下次打开需重新登录账号"
        confirm-button-text="退出登录"
        showCancelButton
        @confirm="onConfirm"
        @cancel="onCancel"
    ></van-dialog>
</template>

<script>
import { Logout } from '@/apis/uc'
import { isInRyH5 } from '@/utils'

export default {
    props: {
        show: {
            type: Boolean,
            default: true,
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
        async onConfirm() {
            Logout()
                .then(() => {
                    this.handleData()
                })
                .catch(err => {
                    this.$toast(err.error.message)
                })
                .finally(() => {
                    this.$emit('cancel')
                })
        },
        // 退出登录成功处理
        handleData() {
            localStorage.removeItem('uin')
            localStorage.removeItem('session')
            localStorage.removeItem('rndKey')
            const queryStr = isInRyH5() ? '?isInRy=1' : ''
            window.location.href = '/pages/login.html#/' + queryStr
        },
        onCancel() {
            this.$emit('cancel')
        },
    },
}
</script>
