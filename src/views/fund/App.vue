<template>
    <div class="index" ref="indexRef">
        <router-view></router-view>
        <loading />
    </div>
</template>

<script>
import { getPriceColorType } from '@/utils/env.js'
import smoothscroll from '@/utils/smoothScroll.js'
export default {
    name: 'index',
    computed: {},
    mounted() {
        const colorType = getPriceColorType()

        this.$refs.indexRef.classList.add(`price-color-${colorType}`)
        smoothscroll.polyfill()
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
