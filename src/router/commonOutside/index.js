import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/commonOutside'
import NProgress from 'nprogress'
import '@/assets/css/nprogress.css'
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge' // 不在自研APP内获取的对象为  undefined
Vue.use(VueRouter)
import { autoTrackSinglePage } from '@/utils/bury'
import { i18n } from '@/i18n/commonOutside'
NProgress.configure({ showSpinner: false })

const router = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/account',
            name: 'account',
            meta: {
                title: '',
            },
            component: () => import(/* webpackChunkName: "commonOutsideRouter" */ '@/views/commonOutside/index.vue'),
        },
        {
            path: '/wealth',
            name: 'wealth',
            meta: {
                title: '',
            },
            component: () => import(/* webpackChunkName: "commonOutsideRouter" */ '@/views/commonOutside/index.vue'),
        },
        {
            path: '/all-service',
            name: 'allService',
            meta: {
                title: i18n.t('allService'),
            },
            component: () => import(/* webpackChunkName: "commonOutsideRouter" */ '@/views/commonOutside/allService.vue'),
        },
        {
            path: '/detail',
            name: 'detail',
            meta: {
                title: i18n.t('accountDetail'),
            },
            component: () => import(/* webpackChunkName: "commonOutsideRouter" */ '@/views/commonOutside/detail/index.vue'),
        },
        {
            path: '/flow',
            name: 'Flow',
            meta: {
                title: '资金流水',
            },
            component: () => import(/* webpackChunkName: "commonOutsideRouter" */ '@/views/commonOutside/flow/index.vue'),
        },
        {
            path: '/flow/detail',
            name: 'FlowDetail',
            meta: {
                title: '记录详情',
            },
            component: () => import(/* webpackChunkName: "commonOutsideRouter" */ '@/views/commonOutside/flow/detail.vue'),
        },
    ],
    // 跳转新页面置顶
    scrollBehavior: () => ({ y: 0 }),
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

router.beforeEach(async (to, from, next) => {
    !JSBridge && NProgress.start()
    // 存在 title 则设置 title
    to.meta.title ? (document.title = to.meta.title || '') : ''
    if (JSBridge) {
        JSBridge.setTitle(to.meta.title)
    }

    if (to.query.fhsid) {
        store.commit('user/updateSession', { session: to.query.fhsid })
    }

    if (!store.state.user.session) {
        await store.dispatch('user/login')
    }

    next()
})

router.afterEach(() => {
    !JSBridge && NProgress.done()
    Vue.nextTick(() => {
        autoTrackSinglePage()
    })
})

export default router
