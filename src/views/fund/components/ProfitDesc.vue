<template>
    <div class="profit-desc" @click="goPage">
        {{ $t('profitDesc') }}
    </div>
</template>

<script>
import pageUrl from '@/config/pageUrl'

export default {
    methods: {
        goPage() {
            this.$goPage(pageUrl.FAQ_PROFIT_DESC)
        },
    },
}
</script>
<style scoped lang="less">
.profit-desc {
    cursor: pointer;
    width: 112px;
    height: 32px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: #2f2f2f;
    margin: 24px auto 20px;
    border-radius: 20px;

    .icon {
        width: 14px;
        height: 14px;
        margin-right: 3px;
    }
}
</style>
