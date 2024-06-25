<template>
    <div class="disclaimer">
        <div class="title">{{ $t('privateDisclaimer.title') }}</div>
        <div class="content">
            <p>{{ $t('privateDisclaimer.text1') }}</p>
            <p>{{ $t('privateDisclaimer.text2') }}</p>
            <p>{{ $t('privateDisclaimer.text3') }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'disclaimer',
}
</script>

<style scoped lang="less">
.disclaimer {
    padding: 0 16px;

    .title {
        color: #7c7470;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
    }

    .content {
        color: #7c7470;
        font-size: 12px;
        line-height: 18px;

        p {
            margin-top: 8px;
        }
    }
}
</style>
