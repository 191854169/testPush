<template>
    <!-- 理财收益说明 -->
    <div class="statement-card">
        <div class="btn" @click="openPage">{{ $t('profitDesc') }}</div>
        <div class="msg">
            <span>{{ $t('serviceBy1') }}</span>
            <span class="primary">{{ $t('tenant.company') }}</span>
            <span>{{ $t('serviceBy2') }}</span>
        </div>
    </div>
</template>

<script>
import { getLangType } from '@/utils/tools'
import pageUrl from '@/config/pageUrl'

export default {
    methods: {
        openPage() {
            const url = `${pageUrl.FAQ_PROFIT_DESC}?langType=` + getLangType()
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

        .primary {
            color: @theme;
        }
    }
}
</style>
