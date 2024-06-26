<template>
    <div class="mz-footer">
        <p class="statementSty" @click="goRiskStatement">{{ $t('publicRisk') }}</p>
    </div>
</template>
<script>
import { getLangType } from '../../../utils'
export default {
    methods: {
        goRiskStatement() {
            const fileName = `风险披露&免责声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            const title = this.$t('protocol.publicRisk')
            console.log('pdfUrl:', url)
            if (this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },
    },
}
</script>
<style scoped lang="less">
.mz-footer {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin-bottom: 24px;

    .statementSty {
        padding: 8px 14px;
        color: #666;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        background: #fff;
        border-radius: 35px;
    }
    // margin-bottom: 0px;
}
</style>
