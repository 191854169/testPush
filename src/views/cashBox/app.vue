<template>
    <div id="cashBox" ref="indexRef">
        <router-view v-if="appReady"></router-view>
    </div>
</template>

<script>
import { getPriceColorType } from '@/utils/env.js'
import { mapActions } from 'vuex'
export default {
    name: 'Home',
    data() {
        return {
            appReady: false,
        }
    },
    created() {
        this.getUserInfo()
            .then(() => {
                this.appReady = true
            })
            .catch(() => {
                this.appReady = true
                console.error('登录状态出错 ===> appReady', this.appReady)
            })
    },
    mounted() {
        this.$refs.indexRef.classList.add(`price-color-${getPriceColorType()}`)
    },
    methods: {
        ...mapActions('user', ['getUserInfo']),
    },
}
</script>

<style lang="less">
#cashBox {
    position: relative;
    width: 100%;
    height: 100vh;
    margin: 0 auto;
    color: #2f2f2f;
    font-size: 14px;
    background: #f9f9f9;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    // .van-popup {
    //     max-width: @maxWidth;
    //     left: 0;
    //     right: 0;
    //     margin: auto;
    // }
}
</style>
