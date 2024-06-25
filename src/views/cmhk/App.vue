<template>
    <div class="index" ref="indexRef">
        <router-view></router-view>
    </div>
</template>

<script>
import { getPriceColorType, getRunEnv } from '@/utils/env.js'
export default {
    name: 'index',
    mounted() {
        let colorType = getPriceColorType()
        if (getRunEnv() === 2) {
            colorType = 3 // 默认红涨绿跌
        }
        this.$refs.indexRef.classList.add(`price-color-${colorType}`)
    },
}
</script>
<style scoped lang="less">
.index {
    height: 100vh;
    overflow: hidden;
    background: #f9f9f9;
}
</style>
