import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/fixedDepositTreasure.js'
import NProgress from 'nprogress'
import '@/assets/css/nprogress.css'
import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js' // 不在自研APP内获取的对象为  undefined
import { thsI18NJsBridge } from '@fs/jsbridge'
import { i18n } from '@/i18n/fixedDepositTreasure'
import { isTHSApp } from '@/utils'
import { setPageTitle } from '../../utils/thsJsBridgeTools'
import { removeTheme } from '@/utils/env'
import { autoTrackSinglePage } from '@/utils/bury'
Vue.use(VueRouter)
NProgress.configure({ showSpinner: false })

const router = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'cashTreasureIndex',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/Index.vue'),
            meta: {
                title: i18n.t('fixedDepositAccount'),
            },
        },
        {
            path: '/about',
            name: 'about',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/About.vue'),
            meta: {
                title: i18n.t('learnFixedDeposit'),
            },
        },
        {
            path: '/list',
            name: 'list',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/List.vue'),
            meta: {
                title: i18n.t('productList'),
            },
        },
        {
            path: '/detail',
            name: 'detail',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/Detail.vue'),
            meta: {
                title: i18n.t('serviceDetail'),
            },
        },
        {
            path: '/subscribe',
            name: 'subscribe',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/Subscribe.vue'),
            meta: {
                title: i18n.t('subscribeText'),
            },
        },
        {
            path: '/subscribe-result',
            name: 'subscribe-result',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/SubscribeResult.vue'),
            meta: {
                title: i18n.t('subscribeResult'),
            },
        },
        {
            path: '/order-list',
            name: 'orderList',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/OrderList.vue'),
            meta: {
                title: i18n.t('orderList.pageTitle'),
            },
        },
        {
            path: '/order-detail',
            name: 'orderDetail',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/OrderDetail.vue'),
            meta: {
                title: i18n.t('orderDetail.page'),
            },
        },
        {
            path: '/holding-detail',
            name: 'holdingDetail',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/OrderDetail.vue'),
            meta: {
                title: i18n.t('orderDetail.pageholding'),
            },
        },
        {
            path: '/ftd-cpoupon-list',
            name: 'ftdCouponList',
            component: () => import(/* webpackChunkName: "cashTreasureRouter" */ '@/views/fixedDepositTreasure/pages/ftdCouponList/index.vue'),
            meta: {
                title: i18n.t('coupon.selectCoupon'),
            },
        },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        return { x: 0, y: 0 }
    },
})

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
    if (JSBridge) {
        JSBridge.setTitle(to.meta.title)
    }
    if (isTHSApp()) {
        setPageTitle(to.meta.title)
    }
    if (thsI18NJsBridge.isTHSI18NApp()) {
        thsI18NJsBridge.changeWebViewTitle(to.meta.title)
    }
    if (to.query.fhsid) {
        store.commit('user/updateSession', { session: to.query.fhsid })
    }
    // TODO: 主题设置
    removeTheme()
    next()
})

router.afterEach(() => {
    !JSBridge && NProgress.done()
    Vue.nextTick(() => {
        autoTrackSinglePage()
    })
})

export default router
