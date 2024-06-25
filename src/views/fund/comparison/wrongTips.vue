<template>
    <div class="wrong-tips" v-if="show">
        <span>{{ $t('compare.wrongTips') }}</span>
        <multi-img name="icon-close-opacity" directory="common" @click="show = false" />
    </div>
</template>
<script>
export default {
    name: 'wrong-tips',
    data() {
        return {
            show: true,
        }
    },
}
</script>
<style scoped lang="less">
.wrong-tips {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #fff6e8;

    span {
        color: #af7213;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }

    img {
        width: 16px;
        height: 16px;
    }
}
</style>
