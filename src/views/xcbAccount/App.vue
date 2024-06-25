<template>
    <div class="index" ref="indexRef" :class="{ 'in-wt': inWtNotInTHS }">
        <router-view></router-view>
        <loading />
    </div>
</template>

<script>
import { getPriceColorType, getRunEnv } from '@/utils/env.js'
import { isTHSApp } from '@/utils'
export default {
    name: 'index',
    mounted() {
        let colorType = getPriceColorType()
        if (getRunEnv() === 2) {
            colorType = 3 // 默认红涨绿跌
        }
        this.$refs.indexRef.classList.add(`price-color-${colorType}`)
    },
    computed: {
        inWtNotInTHS() {
            return getRunEnv() === 2 && !isTHSApp()
        },
    },
}
</script>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.index {
    height: 100vh;

    &::-webkit-scrollbar {
        width: 0;
        height: 0;
        background: transparent;
    }

    &.in-wt {
        overflow: auto;
    }
}
</style>
