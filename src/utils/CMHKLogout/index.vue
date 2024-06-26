<template>
    <van-dialog
        v-model="show"
        :confirm-button-text="$t('确定')"
        width="75%"
        confirm-button-color="#FF6907"
        class="reject-dialog"
        @confirm="handleRejectConfirm"
    >
        <div class="reject-box">
            <div class="reject-title">{{ $t('登录安全提醒') }}</div>
            <div class="reject-text">
                <span>{{ $t('您的账号已在其他地方登录，请确认是否为本人操作。如非本人操作，请重新登录当前账号或') }}</span>
                <span class="link"><a href="tel:29796988">2979 6988</a></span>
                <span>{{ $t('联系客服') }}</span>
            </div>
        </div>
    </van-dialog>
</template>

<script>
import { customerService } from '@/utils'
import { isInOutsideH5 } from '@/utils'
export default {
    name: 'CMHKLogout',
    props: {
        close: {
            type: Function,
        },
    },
    data() {
        return {
            show: false,
        }
    },
    methods: {
        // 确认
        async handleRejectConfirm() {
            this.close?.()

            const store = (await import('@/store/commonOutside'))?.default
            store?.dispatch('user/clearUserInfo')
            if (isInOutsideH5()) {
                window.location.href = '/pages/login.html#/'
                return
            }
            window.close()
        },
        // 客服
        handleServiceClick() {
            const csUrl = customerService({
                url: true,
            })

            window.location.href = csUrl
        },
    },
}
</script>

<style lang="less" scoped>
.reject-dialog {
    .reject-box {
        padding: 16px 16px 28px;
        color: #2f2f2f;

        .reject-title {
            margin-bottom: 16px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
        }

        .reject-text {
            font-size: 14px;
            line-height: 20px;

            .link {
                margin: 0 8px;
                color: #ff6907;
                cursor: pointer;
            }
        }
    }
}
</style>
