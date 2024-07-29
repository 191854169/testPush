import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/demo'
import NProgress from 'nprogress'
import '@/assets/css/nprogress.css'
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge.js' // 不在自研APP内获取的对象为  undefined
// import {
//   getOrigin,
//   isLogin
// } from '@/utils/tools.js'
import { i18n } from '@/i18n/cashBox'
Vue.use(VueRouter)

NProgress.configure({ showSpinner: false })
const router = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'cashBox',
            meta: {
                title: i18n.t('cashBox'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/index.vue'),
        },
        {
            path: '/cashBoxIndex',
            name: 'cashBoxIndex',
            meta: {
                title: i18n.t('cashBox'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/index.vue'),
        },
        {
            path: '/beforeSign',
            name: 'beforeSign',
            meta: {
                title: i18n.t('cashBox'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/beforeSign.vue'),
        },
        {
            path: '/sign',
            name: 'sign',
            meta: {
                title: i18n.t('openCashBox'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/sign.vue'),
        },
        {
            path: '/closeService',
            name: 'closeService',
            meta: {
                title: i18n.t('cashBoxService'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/closeService.vue'),
        },
        {
            path: '/autoDeal',
            name: 'autoDeal',
            meta: {
                title: i18n.t('autoTradeSetting'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/autoDeal.vue'),
        },
        {
            path: '/review',
            name: 'review',
            meta: {
                title: i18n.t('zdss'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/review.vue'),
        },
        {
            path: '/incomeDetails',
            name: 'incomeDetails',
            meta: {
                title: i18n.t('symx'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/incomeDetails/index.vue'),
        },
        {
            path: '/profitInfo',
            name: 'profitInfo',
            meta: {
                title: i18n.t('profitInfo'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/profitInfo.vue'),
        },
        {
            path: '/hold-detail',
            name: 'holdDetail',
            meta: {
                title: i18n.t('holdingDetail'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/holdDetail/index.vue'),
        },
        {
            // 旧赎回route重定向
            path: '/handDeal',
            redirect: '/trade/rollOut',
        },
        {
            path: '/trade/:orient',
            name: 'trade',
            meta: {
                title: '',
            },
            component: () => import(/* webpackChunkName: "cashboxTradeRouter" */ '@/views/cashBox/trade/index.vue'),
        },
        {
            path: '/submit-result',
            name: 'submitResult',
            meta: {
                title: '',
            },
            component: () => import(/* webpackChunkName: "cashboxTradeRouter" */ '@/views/cashBox/trade/submitResult.vue'),
        },
        {
            path: '/productDetails',
            name: 'productDetails',
            meta: {
                title: i18n.t('productDetail'),
            },
            component: () => import(/* webpackChunkName: "cashboxStaticRouter" */ '@/views/cashBox/productDetails/index.vue'),
        },
        {
            path: '/latestIncome',
            name: 'latestIncome',
            meta: {
                title: i18n.t('newIncome'),
            },
            component: () => import(/* webpackChunkName: "cashboxRouter" */ '@/views/cashBox/latestIncome/index.vue'),
        },
        {
            path: '/xcbExplain',
            name: 'xcbExplain',
            meta: {
                title: i18n.t('cashBox'),
            },
            component: () => import(/* webpackChunkName: "cashboxStaticRouter" */ '@/views/cashBox/xcbExplain.vue'),
        },
        {
            path: '/protocol',
            name: 'protocol',
            meta: {
                title: i18n.t('protocol.title'),
            },
            component: () => import(/* webpackChunkName: "cashboxStaticRouter" */ '@/views/cashBox/Protocol.vue'),
        },
    ],
})

// let routerLength = 0 //vue 路由历史长度
// let showClosed = false //app是否已显示关闭按钮
// let lastHistoryLength = 0 //history 长度缓存
// router.afterEach((to, from)=>{
//   NProgress.done()
//   if(!lastHistoryLength){
//     routerLength += 1
//   } else {
//     if(history.length > lastHistoryLength){
//       routerLength += 1
//     }
//   }
//   lastHistoryLength = history.length
//   //判断历史路由长度并显示app关闭按钮
//   if(!showClosed && routerLength > 1){
//     JSBridge && JSBridge.setClose(true)
//     showClosed = true
//   }
// })

router.beforeResolve((to, form, next) => {
    // ======= 所有项目必须同步内容 START =======
    const wtToken = to.query.wtToken || ''
    const sub = to.query.sub || ''
    if (wtToken) {
        store.dispatch('user/setWTToken', wtToken)
    }
    if (sub) {
        store.dispatch('user/setSubAccountId', sub)
    }

    // ======= 所有项目必须同步内容 END =======

    next()
})
router.beforeEach((to, from, next) => {
    !JSBridge && NProgress.start()
    //存在 title 则设置 title
    to.meta.title ? (document.title = to.meta.title || '') : ''
    if (JSBridge) {
        JSBridge.setTitle(to.meta.title)
    }

    //同花顺登录标识
    if (to.query.fhsid) {
        store.commit('user/updateSession', {
            session: to.query.fhsid,
        })
    }
    //自研app下调用登录
    // if (!store.state.user.session) {
    //   store.dispatch("user/login")
    // }

    // // 独立h5且未登录时
    // if (getOrigin() == 7 && isLogin()) {
    //   let href = document.location.href
    //   console.log(href)
    //   localStorage.setItem('session', '8410c9a1940b4a84b3624b397da3ecca') //因为Storage跨域,暂时写死,h5部署到同一环境时注释
    //   window.location.href = `http://h5-dev.xingyunplan.com/pages/login.html#/?path=${href}&type=href`
    // }

    // if (to.matched.some(page => page.meta.login) && !store.state.user.session) {
    //   store.dispatch("user/login")
    // } else if (store.state.user.session &&  login_redirect_page.includes(to.name)) {  // 判断已经登录则不再访问列表中的页面
    //  //
    // }
    next()
})

router.afterEach(() => {
    !JSBridge && NProgress.done()
})

export default router
