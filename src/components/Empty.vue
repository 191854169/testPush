<template>
    <div class="empty" :style="{ height: height }">
        <multi-img v-if="showImg" :name="imgName" directory="common" />
        <slot>
            <p>{{ i18nTipText }}</p>
        </slot>
    </div>
</template>
<script>
export default {
    name: 'Empty',
    props: {
        showImg: {
            type: Boolean,
            default: false,
        },
        tipText: {
            type: String,
            default: '',
        },
        height: {
            type: String,
            default: '2rem',
        },
        imgName: {
            type: String,
            default: 'noData',
        },
    },
    computed: {
        i18nTipText() {
            return this.tipText ? this.tipText : this.$t('noData')
        },
    },
}
</script>
<style scoped lang="less">
.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
        width: 103px;
        height: 103px;
        margin-bottom: 12px;
    }

    p {
        color: #9c9c9c;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }
}
</style>
