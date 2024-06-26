<template>
    <div style="padding-bottom: 80px">
        <header>Title</header>
        <ul>
            <router-link tag="li" v-for="(item, index) in pageList" :key="index" :to="item.link">{{ item.name }}</router-link>
        </ul>
        <div class="content">
            <van-button type="primary" block @click="sendGet">send GET</van-button>
            <van-button type="primary" block @click="sendPost">send POST</van-button>
            <router-view></router-view>
        </div>
        <div>
            <p>方案一</p>
            <van-button type="primary" @click="changeTheme('white')">白皮肤主题</van-button>
            <van-button type="info" @click="changeTheme('black')">黑皮肤主题</van-button>
            <div class="test-theme">
                <div class="title">文字主色背景前景色</div>
                <div class="content">文字h1,背景为背景色{{ theme }}</div>
            </div>
            <p>方案二</p>
            <van-button type="primary" @click="updateTheme('white')">白皮肤主题</van-button>
            <van-button type="info" @click="updateTheme('black')">黑皮肤主题</van-button>
            <div class="test-theme2">
                <div class="test-title test-bg title">一些标题</div>
                <div class="content">一些内容一些内容一些内容一些内容{{ bgColor }}</div>
            </div>
        </div>
        <van-button @click="test">进入mylink 页面</van-button>
        <div>-------------------------------------------------------------------------</div>
        <div style="margin-top: 30px">
            <p>同花顺国际版jsbridge测试:</p>
            <!-- <van-button type="primary" @click="changeTheme('white')">白皮肤主题</van-button> -->
            <!-- <van-button type="info" @click="changeTheme('black')">黑皮肤主题</van-button> -->
            <!-- <div class="test-theme">
                <div class="title">文字主色背景前景色</div>
                <div class="content">文字h1,背景为背景色{{ theme }}</div>
            </div> -->
            <div>当前页面域名：{{ origin }}</div>
            <van-button type="primary" @click="handleRouteTest">测试Vue路由跳转B</van-button>
            <van-button type="primary" @click="handleRouteTestA">测试Vue路由跳转A</van-button>
            <van-button type="primary" @click="handleRouteTestC">测试Vue路由跳转C</van-button>
            <van-button type="primary" @click="handleCloseWebView">测试同花顺安卓关闭webview</van-button>
            <div>同花顺国际版应用信息：{{ thsI18NAppInfo }}</div>
        </div>
    </div>
</template>

<script>
import { UserBankList, EddiIn } from '@/apis/demo/demo.js'
import router from '../../router/demo'
import { getThemeType } from '@/utils/env.js'

const { variable } = require('@/assets/css/variable')

import variables from '@/assets/css/variable.less'

export default {
    name: 'DemoHome',
    data() {
        return {
            bgColor: variable['bg-color'],
            theme: getThemeType(),
            pageList: [
                {
                    name: 'A Page',
                    link: '/Apage',
                },
                {
                    name: 'B Page',
                    link: '/Bpage',
                },
                {
                    name: 'Amount Page',
                    link: '/amount',
                },
                {
                    name: 'Chart Page',
                    link: '/chart',
                },
            ],
            thsI18NAppInfo: {},
        }
    },
    computed: {
        // theme() {
        //     return this.$store.state.app.theme
        // },
        origin() {
            return window.location.origin
        },
    },
    mounted() {
        console.log('this.variables', variables, 'Variable', variable, 'theme', this.theme)
        this.changeTheme(this.theme)

        console.log('页面加载就发送一次请求')
        this.sendGet()
    },
    methods: {
        test() {
            window.location.href = 'http://10.36.15.216:8080/wealth/cmhk.html#/'
        },
        changeTheme(theme) {
            // this.$store.dispatch('app/setTheme', theme)
            this.theme = theme
            document.documentElement.setAttribute('data-theme', theme)
        },
        updateTheme(theme) {
            theme == 'white' &&
                window.less.modifyVars({
                    '@bg-color': '#ff6907',
                    '@font-color': '#fff',
                })
            theme == 'black' &&
                window.less.modifyVars({
                    '@bg-color': '#242424',
                    '@font-color': '#EB5528',
                })
        },
        toCard() {
            window.location.href =
                'http://localhost:8080/pages/activityCard.html/#/?wtToken=9d4f1938e7a741328cbee4d659fbe7b1&sub=888821103&nav=1&lang=zhTc'
        },
        goPage(item) {
            router.push({
                path: item.link,
            })
        },

        sendGet() {
            /**
             * 示例 GET 请求
             */
            UserBankList({
                params: {
                    subAccountId: '086003780',
                },
            })
                .then(res => {
                    console.log(res)
                })
                .catch()
        },

        sendPost() {
            /**
             * 示例 post 请求
             */
            EddiIn({
                data: {
                    amount: '1.00',
                    currency: 'HKD',
                    eddaId: 256,
                    origin: 3,
                    subAccountId: '886600101',
                },
            })
                .then(res => {
                    console.log(res)
                })
                .catch()
        },
        handleRouteTestA() {
            this.$router.push('/APage')
        },
        handleRouteTestC() {
            this.$router.push('/chart')
        },
        handleCloseWebView() {},
        handleRouteTest() {
            this.$router.push('/BPage')
        },
        // const info = window.callI18NNativeSync('getAppBaseInfo', [])
        // console.log('info:', info)
        // window.callI18NNativeHandler('showCloseBarItem', {}) //ok
        // window.callI18NNativeHandler('closeWebPage', {}) //ok
        // this.thsI18NAppInfo = info.data
        // window.callI18NNativeHandler('route', {
        //     url: 'hexin.aInvestLogin/thirdLogin',
        //     params: '',
        // })
        // const jumpUrl = encodeURIComponent('https://sit.mfosunhani.com/activity/ry.html#/')
        // window.callI18NNativeHandler('goBack', { type: 'component' })//ok
        // window.callI18NNativeHandler('changeStatusModel', { isDark: '1' })
    },
}
</script>

<style lang="less">
.test-theme {
    .title {
        padding: 10px;
        #font_theme();
        #foreground();
    }

    .content {
        padding: 10px;
        #font_h1();
        #background();
    }
}

.test-theme2 {
    .title {
        padding: 10px;
    }

    .content {
        padding: 10px;
        background: @bg-color;
    }
}

header {
    height: 48px;
    color: #666;
    line-height: 48px;
    text-align: center;
    border-bottom: 1px solid #ececec;
}

ul {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #ececec;

    li {
        width: 100%;
        height: 40px;
        font-size: 12px;
        line-height: 40px;
        text-align: center;
        list-style: none;
        border-right: 1px solid #ececec;
    }
}

.content {
    margin-top: 20px;
    padding: 0 10px 10px;
    text-align: center;

    button {
        margin-bottom: 4px;
    }
}
</style>
