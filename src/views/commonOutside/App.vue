<template>
    <div class="index" ref="indexRef" :class="[showTradeLoginDialog ? 'active' : '', 'price-color-' + colorType]">
        <router-view></router-view>
    </div>
</template>

<script>
import { getPriceColorType, getRunEnv } from '@/utils/env.js'
import { isInRyH5 } from '@fs/utils'
export default {
    name: 'App',
    data() {
        return {
            showTradeLoginDialog: false, // 子路由交易密码弹窗是否出现的标识
            colorType: 1,
        }
    },
    mounted() {
        let colorType = getPriceColorType()
        if (getRunEnv() === 2) {
            colorType = 3 // 默认红涨绿跌
        }
        this.colorType = colorType
        sessionStorage.setItem('outsideSource', isInRyH5() ? 'ry' : 'common') // 暂时只有睿银和通用
    },
}
</script>
<style scoped lang="less">
.index {
    height: 100vh;
    // overflow: hidden;
    background: #f9f9f9;
}
</style>
