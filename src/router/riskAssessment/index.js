import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/riskAssessment.js'
import NProgress from 'nprogress'
import '@/assets/css/nprogress.css'
import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js' // 不在自研APP内获取的对象为  undefined
Vue.use(VueRouter)
import { i18n } from '@/i18n/riskAssessment'
import { autoTrackSinglePage } from '@/utils/bury'
NProgress.configure({ showSpinner: false })

const router = new VueRouter({
    mode: 'hash',
    routes: [
        {
            path: '/',
            name: 'index',
            meta: {
                title: i18n.t('riskAssessemnt'),
            },
            component: () => import(/* webpackChunkName: "riskassessmentRouter" */ '@/views/riskAssessment/Index.vue'),
        },
        {
            path: '/index',
            name: 'index',
            meta: {
                title: i18n.t('riskAssessemnt'),
            },
            component: () => import(/* webpackChunkName: "riskassessmentRouter" */ '@/views/riskAssessment/Index.vue'),
        },
        {
            path: '/start',
            name: 'start',
            meta: {
                title: i18n.t('riskAssessemnt'),
            },
            component: () => import(/* webpackChunkName: "riskassessmentRouter" */ '@/views/riskAssessment/Start.vue'),
        },
        {
            path: '/result',
            name: 'result',
            meta: {
                title: i18n.t('riskAssessemnt'),
            },
            component: () => import(/* webpackChunkName: "riskassessmentRouter" */ '@/views/riskAssessment/Result.vue'),
        },
    ],
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
    // if (to.matched.some(page => page.meta.login) && !store.state.user.session) {
    //   store.dispatch("user/login")
    // } else if (store.state.user.session &&  login_redirect_page.includes(to.name)) {  // 判断已经登录则不再访问列表中的页面
    //  //
    // }
})

router.afterEach(() => {
    !JSBridge && NProgress.done()
    Vue.nextTick(() => {
        autoTrackSinglePage()
    })
})

export default router
