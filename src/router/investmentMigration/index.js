import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/investmentMigration'
import NProgress from 'nprogress'
import '@/assets/css/nprogress.css'
import JSBridge from 'jsbridge' // 不在自研APP内获取的对象为  undefined
Vue.use(VueRouter)
import { isTHSApp } from '@/utils/tools'
import { setPageTitle } from '@/utils/thsJsBridgeTools'
import { autoTrackSinglePage } from '@/utils/bury'
import { i18n } from '@/i18n/investmentMigration'
NProgress.configure({ showSpinner: false })

const router = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/',
            redirect: '/home',
        },
        {
            path: '/home',
            name: 'home',
            meta: {
                title: i18n.t('homePageTitle'),
            },
            component: () => import(/* webpackChunkName: "investmentMigrationPack" */ '@/views/investmentMigration/pages/home.vue'),
        },
        {
            path: '/no-matched-risk',
            name: 'noMatchedRisk',
            meta: {
                title: i18n.t('fitRecord'),
            },
            component: () => import(/* webpackChunkName: "investmentMigrationPack" */ '@/views/investmentMigration/pages/NoMatchedRisk.vue'),
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
    if (isTHSApp()) {
        setPageTitle(to.meta.title)
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
