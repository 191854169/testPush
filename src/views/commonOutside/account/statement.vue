<template>
    <!-- 理财收益说明 -->
    <div class="statement-card">
        <div class="btn" @click="openPage">{{ $t('profitDesc') }}</div>
        <div class="msg">
            {{ $t('serviceBy1') }}
            <span class="primary">{{ $t('tenant.company') }}</span>
            {{ $t('serviceBy2') }}
        </div>
    </div>
</template>

<script>
import { getLangType } from '@/utils/tools'

export default {
    methods: {
        openPage() {
            const url = 'https://h5.fotechwealth.com/faq/#/article/649491648588515328?langType=' + getLangType()
            this.$goPage(url)
        },
    },
}
</script>

<style lang="less" scoped>
.statement-card {
    padding: 16px 0 40px;
    text-align: center;

    .btn {
        display: inline-flex;
        align-items: center;
        padding: 6px 20px;
        color: #2f2f2f;
        font-size: 14px;
        background: #fff;
        border-radius: 16px;
    }

    .msg {
        margin-top: 16px;
        color: #bfbfbf;
        font-size: 12px;

        span {
            color: @theme;
        }
    }
}
</style>
