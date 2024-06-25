<template>
    <div v-if="isRenderTitle" class="title-wrapper">
        {{ title }}
    </div>
</template>
<script>
import { isInOutsideH5, isWeiXin, isDingtalk } from '@fs/utils'
import { i18n } from '@/i18n/fund'

export default {
    props: {
        title: {
            type: String,
            default: i18n.t('ry.protocolTitle'),
        },
    },
    data() {
        return {
            isRenderTitle: false,
        }
    },
    mounted() {
        if (!isDingtalk() && !isWeiXin() && isInOutsideH5()) {
            this.isRenderTitle = true
        }
    },
}
</script>
<style scoped lang="less">
.title-wrapper {
    width: 100%;
    max-width: 375px;
    height: 44px;
    margin-bottom: 12px;
    color: #2f2f2f;
    font-weight: 500;
    font-size: 18px;
    line-height: 44px;
    text-align: center;
}
</style>
