<template>
    <div class="review">
        <multi-img class="status" name="submit-success" directory="common"></multi-img>
        <h3>{{ $t('openSuccess') }}</h3>
        <h4>{{ $t('reSettingRemind') }}</h4>
        <div class="button" @click="sure">{{ $t('complete') }}</div>
    </div>
</template>
<script>
import { getQueryString } from '@/utils/tools.js'
import { isInOutsideH5 } from '@/utils'
export default {
    data() {
        return {
            icon1: '',
        }
    },
    mounted() {
        const close = getQueryString('close', true)
        const url = getQueryString('url', true)
        console.warn('query', close, url)
    },
    methods: {
        //回到交易页
        sure() {
            const close = getQueryString('close', true)
            const queryUrl = getQueryString('url', true)
            const url = queryUrl ? decodeURIComponent(queryUrl) : ''

            if (isInOutsideH5() && url) {
                window.location.replace(url)
                return
            }
            if (close) {
                // 直接关闭webview
                if (this.$jsBridge) {
                    this.$jsBridge.close()
                } else {
                    window.close()
                }
            } else if (url) {
                if (/http(s)?:\/\//.test(url)) {
                    // 完整的url
                    location.replace(url)
                } else {
                    this.$router.replace({ path: url })
                }
            } else {
                // 回到星财宝首页
                this.$router.replace({ path: '/' })
            }
        },
    },
}
</script>
<style lang="less" scoped>
.review {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    background: #fff;

    .status {
        width: 58px;
        height: 58px;
        margin-top: 87px;
        margin-bottom: 21px;
    }

    h3 {
        margin-bottom: 4px;
        color: #1f1f1f;
        font-weight: 700;
        font-size: 18px;
        line-height: 26px;
        text-align: center;
    }

    h4 {
        width: 265px;
        color: #9c9c9c;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
    }

    .button {
        width: 319px;
        height: 44px;
        margin-top: 46px;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #ff6907;
        border-radius: 49px;
    }
}
</style>
