<template>
    <div class="mz-footer">
        <p class="statementSty" @click="goRiskStatement">{{ $t('follow.riskStatement') }}</p>
    </div>
</template>

<script>
import pathnames from '@/config/H5Pathname'
export default {
    name: 'riskStatement',
    methods: {
        goRiskStatement() {
            const KEY = 'ZHCPSM'
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=${KEY}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$goPage(url)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.mz-footer {
    display: flex;
    flex-direction: row;
    justify-content: center;

    .statementSty {
        padding: 8px 14px;
        color: #666;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        background: #fff;
        border-radius: 35px;
    }

    margin-bottom: 24px;
}
</style>
