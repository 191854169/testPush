import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/demo'
import NProgress from 'nprogress'
import '@/assets/css/nprogress.css'
import { lupuJsbridge as JSBridge } from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
Vue.use(VueRouter)

NProgress.configure({ showSpinner: false })

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'Apage',
            component: () => import(/* webpackChunkName: "demoRouter" */ '@/views/Demo/Apage.vue'),
        },
        {
            path: '/Apage',
            name: 'Apage',
            meta: {
                title: 'A page title',
            },
            component: () => import(/* webpackChunkName: "demoRouter" */ '@/views/Demo/Apage.vue'),
        },
        {
            path: '/Bpage',
            name: 'Bpage',
            meta: {
                title: 'B page title',
            },
            component: () => import(/* webpackChunkName: "demoRouter" */ '@/views/Demo/Bpage.vue'),
        },
        {
            path: '/Cpage',
            name: 'Cpage',
            meta: {
                title: 'C page title',
            },
            component: () => import(/* webpackChunkName: "demoRouter" */ '@/views/Demo/Cpage.vue'),
        },
        // {
        //     path: '/amount',
        //     name: 'amount',
        //     meta: {
        //       title: 'Amount Page',
        //     },
        //     component: () =>import(/* webpackChunkName: "purchasingMain" */ '@/views/Demo/Amount.vue'),
        // },
        {
            path: '/chart',
            name: 'chart',
            meta: {
                title: 'Chart Page',
            },
            component: () => import(/* webpackChunkName: "demoRouter" */ '@/views/Demo/Echarts.vue'),
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
    // 存在 title 则设置 title
    to.meta.title ? (document.title = to.meta.title || '') : ''

    if (to.query.fhsid) {
        store.commit('user/updateSession', { session: to.query.fhsid })
    }

    if (!store.state.user.session) {
        store.dispatch('user/login')
    }

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
