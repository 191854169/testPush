import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/fund.js'
import NProgress from 'nprogress'
import '@/assets/css/nprogress.css'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge' // 不在自研APP内获取的对象为  undefined
import { i18n } from '@/i18n/fund'
import { setTheme, removeTheme, getRunEnv } from '@/utils/env'
import followRoutes from './follow'
import pathnames from '@/config/H5Pathname'
Vue.use(VueRouter)
NProgress.configure({ showSpinner: false })

const router = new VueRouter({
    mode: 'hash',
    /**
     * meta对象属性
     * meta: { title: '', login: Boolean - 是否需要登录（默认为false), forceClose: Boolean - 登录失败|不想登录是否要关闭页面（默认为true) }
     */
    routes: [
        {
            path: '/',
            name: 'fundIndex',
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/Index.vue'),
            meta: {
                title: i18n.t('wealth'),
            },
        },
        {
            path: '/account-hold',
            name: 'accountHold',
            meta: {
                title: i18n.t('wealthAssets'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/AccountHold.vue'),
        },
        {
            path: '/asset-hold',
            name: 'assetHold',
            meta: {
                title: '',
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/AssetHold.vue'),
        },
        {
            path: '/invest-product/:type',
            name: 'investProduct',
            meta: {
                title: '',
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Index.vue'),
        },
        {
            path: '/services',
            name: 'services',
            meta: {
                title: i18n.t('services'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/Services.vue'),
        },
        {
            path: '/protocol',
            name: 'protocol',
            meta: {
                title: i18n.t('protocol.title'),
            },
            component: () => import(/* webpackChunkName: "fundrouter" */ '@/views/fund/Protocol.vue'),
        },
        {
            path: '/list',
            name: 'list',
            meta: {
                title: i18n.t('fundList.title'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/list/Index.vue'),
        },
        {
            path: '/private-list',
            name: 'privateList',
            meta: {
                title: i18n.t('privateEnjoy'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/list/PrivateList.vue'),
        },
        {
            path: '/filter-private-fund',
            name: 'filterPrivateFund',
            meta: {
                title: i18n.t('privateProduct'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/list/FilterPrivateFund.vue'),
        },
        {
            path: '/mechanism',
            name: 'mechanism',
            meta: {
                title: i18n.t('fosunMechanism'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/list/Mechanism.vue'),
        },
        {
            path: '/detail',
            name: 'detail',
            meta: {
                title: i18n.t('fundDetail'),
            },
            component: () => import(/* webpackChunkName: "fundrouter" */ '@/views/fund/detail/Index.vue'),
        },
        {
            path: '/holdingDetails',
            name: 'holdingDetails',
            meta: {
                title: i18n.t('holdingDetails'),
            },
            component: () => import(/* webpackChunkName: "fundrouter" */ '@/views/fund/holdingDetails/Index.vue'),
        },
        {
            path: '/trade-rule',
            name: 'tradeRule',
            meta: {
                title: i18n.t('tradeRule'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/detail/pages/Rule.vue'),
        },
        {
            path: '/history-page',
            name: 'historyPage',
            meta: {
                title: i18n.t('historyNet'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/detail/pages/HistoryPage.vue'),
        },
        {
            path: '/history-profit',
            name: 'historyProfit',
            meta: {
                title: i18n.t('historyProfit'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/detail/pages/HistoryProfit.vue'),
        },
        {
            path: '/full-page',
            name: 'fullScreen',
            meta: {
                title: i18n.t(''),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/detail/pages/fullScreen.vue'),
        },
        {
            path: '/history-performance',
            name: 'historyPerformance',
            meta: {
                title: i18n.t('historyPerformance'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/detail/pages/historyPerformance.vue'),
        },
        {
            path: '/profit',
            name: 'profit',
            meta: {
                title: i18n.t('profitDetail'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/Profit.vue'),
        },
        {
            path: '/subscribe/:symbol',
            name: 'subscribe',
            meta: {
                title: i18n.t('trade.subscribeFund'),
                login: true,
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/trade/Subscribe.vue'),
        },
        {
            path: '/redeem/:symbol',
            name: 'redeem',
            meta: {
                title: i18n.t('trade.redeemFund'),
                login: true,
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/trade/Redeem.vue'),
        },
        {
            path: '/order-list',
            name: 'order-list',
            meta: {
                title: i18n.t('orderRecord'),
                login: true,
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/trade/orderList/index.vue'),
        },
        {
            path: '/order-detail',
            name: 'order-detail',
            meta: {
                title: i18n.t('orderDetail'),
                login: true,
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/trade/orderDetail/index.vue'),
        },
        // 票据
        {
            path: '/bills/:type',
            name: 'bills-detail',
            meta: {
                title: i18n.t('bills.billsDetail'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/detail.vue'),
        },
        {
            path: '/no-matched-risk',
            name: 'no-matched-risk',
            meta: {
                title: i18n.t('protocol.fitRecord'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/NoMatchedRisk.vue'),
        },
        {
            path: '/more-page',
            name: 'more-page',
            meta: {
                title: i18n.t('aggressiveInvest'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/morePage/MorePage.vue'),
        },
        {
            path: '/strength-page',
            name: 'strength-page',
            meta: {
                title: i18n.t('fundText16'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/morePage/StrengthList.vue'),
        },
        {
            path: '/static/indicator-declare',
            name: 'indicatorDeclare',
            meta: {
                title: i18n.t('indicatorDeclare.title'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/staticPages/indicatorDeclare.vue'),
        },
        {
            path: '/bond',
            name: 'bond',
            meta: {
                title: i18n.t('bond'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/bond/index.vue'),
        },
        {
            path: '/bond-detail',
            name: 'bondDetail',
            meta: {
                title: i18n.t('bondDetail'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/bond/detail/index.vue'),
        },
        {
            path: '/bond-history-price',
            name: 'bondHistoryPrice',
            meta: {
                title: i18n.t('historyPrice'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/bond/detail/page/historyPrice.vue'),
        },
        {
            path: '/bond-buy/:symbol',
            name: 'bondBuy',
            meta: {
                title: i18n.t('buyBond'),
                login: true,
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/bond/trade/buy.vue'),
        },
        {
            path: '/submit-result',
            name: 'submitResult',
            meta: {
                title: i18n.t('submitResult'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/bond/trade/submitResult.vue'),
        },
        {
            path: '/not-allow',
            name: 'notAllow',
            meta: {
                title: i18n.t('prompt'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/NotAllow.vue'),
        },
        {
            path: '/comprehensive-performance',
            name: 'comprehensivePerformance',
            meta: {
                title: i18n.t('radar.fundComprehensivePerformance'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/detail/pages/ComprehensivePerformance.vue'),
        },
        {
            path: '/analysis-detail',
            name: 'analysisDetail',
            meta: {
                title: i18n.t('radar.analysisDetail'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/detail/pages/AnalysisDetail.vue'),
        },
        {
            path: '/select-fund',
            name: 'selectFund',
            meta: {
                title: i18n.t('compare.fundCompare'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/comparison/selectFund/index.vue'),
        },
        {
            path: '/comparison-detail',
            name: 'comparisonDetail',
            meta: {
                title: i18n.t('compare.fundCompare'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/comparison/comparisonDetail/index.vue'),
        },
        {
            path: '/all-services',
            name: 'allServices',
            meta: {
                title: i18n.t('allServices'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/allServices.vue'),
        },
        {
            path: '/fund-selection-by-stock',
            name: 'fundSelectionByStock',
            meta: {
                title: i18n.t('fundSelectionByStock.title'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/fundSelectionByStock/index.vue'),
        },
        {
            path: '/affiliated-fund',
            name: 'affiliatedFund',
            meta: {
                title: i18n.t('fundSelectionByStock.affiliatedFund'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/fundSelectionByStock/affiliatedFund.vue'),
        },
        {
            path: '/fund-selection-by-stock-search',
            name: 'fundSelectionByStockSearch',
            meta: {
                title: i18n.t('fundSelectionByStock.title'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/fundSelectionByStock/search.vue'),
        },
        {
            path: '/stock-fund-compare',
            name: 'stockFundCompare',
            meta: {
                title: i18n.t('fundSelectionByStock.title'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/fundSelectionByStock/stockFundCompare/index.vue'),
        },

        {
            path: '/client-radar',
            name: 'clientRadar',
            meta: {
                title: i18n.t('investExpression'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/clientRadarMap/index.vue'),
        },
        {
            path: '/product-detail-hold',
            name: 'productDetailInHold',
            meta: {
                title: i18n.t('holdingDetailInfo'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/ProductDetailInHold.vue'),
        },
        {
            path: '/latest-profit',
            name: 'latestProfit',
            meta: {
                title: i18n.t('latestProfit'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/LatestProfit.vue'),
        },
        {
            path: '/no-hold-product',
            name: 'noHoldProduct',
            meta: {
                title: i18n.t('clearanceProduct'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/NoHoldProduct.vue'),
        },
        // 理财跟投
        ...followRoutes,
        // 票据定制化
        {
            path: '/bill-customize-index',
            name: 'billCustomizeIndex',
            meta: {
                title: i18n.t('bills.customProducts'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/CustomizeIndex.vue'),
        },
        {
            path: '/bill-customize-orders',
            name: 'billCustomizeOrders',
            meta: {
                title: i18n.t('bills.customizeRecords'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/CustomizeOrders.vue'),
        },
        {
            path: '/bill-customize-detail',
            name: 'billCustomizeDetail',
            meta: {
                title: i18n.t('bills.customizeDetail'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/CustomizeDetail.vue'),
        },
        {
            path: '/bill-customize-result',
            name: 'billCustomizeResult',
            meta: {
                title: i18n.t('submitResult'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/CustomizeResult.vue'),
        },
        {
            path: '/bill-customize-add',
            name: 'billCustomizeAdd',
            meta: {
                title: i18n.t('bills.billCustomizeAdd'), //i18n.t('bills.billCustomizeAdd')
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/CustomizeAdd.vue'),
        },
        {
            path: '/bill-customize-edit',
            name: 'billCustomizeEdit',
            meta: {
                title: i18n.t('bills.billCustomizeEdit'), //i18n.t('bills.billCustomizeAdd')
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/CustomizeAdd.vue'),
        },
        {
            path: '/bill-customize-confirm',
            name: 'billCustomizeConfirm',
            meta: {
                title: i18n.t('bills.changeProductInfo'),
                login: true,
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/CustomizeConfirm.vue'),
        },
        {
            path: '/bill-add-enquiry',
            name: 'billAddEnquiry',
            meta: {
                title: i18n.t('fcn.addEnquiry'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/FCNAdd.vue'),
        },
        {
            path: '/bill-add-enquiry-result',
            name: 'add-enquiry-result',
            meta: {
                title: i18n.t('submitResult'),
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/FCNAdd.vue'),
        },
        {
            path: '/bill-enquiry-detail',
            name: 'billEnquiryDetail',
            meta: {
                title: i18n.t('fcn.enquiryDetail'),
                login: true,
            },
            component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/investProduct/Bills/FCNDetails.vue'),
        },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        return { x: 0, y: 0 }
    },
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
    if (JSBridge) {
        JSBridge.setTitle(to.meta.title)
    }
    if (to.query.fhsid) {
        store.commit('user/updateSession', { session: to.query.fhsid })
    }
    // TODO: 主题设置
    if (to.path === '/') {
        setTheme()
    } else {
        removeTheme()
    }
    // if(!store.state.user.session){
    // store.dispatch("user/login")
    // }

    // if (to.matched.some(page => page.meta.login) && !store.state.user.session) {
    //   store.dispatch("user/login")
    // } else if (store.state.user.session &&  login_redirect_page.includes(to.name)) {  // 判断已经登录则不再访问列表中的页面
    //  //
    // }
    next()
})

router.afterEach(to => {
    !JSBridge && NProgress.done()
    /*------- 在页面刷新之后才判断登录态（保证session的有效） -------*/
    const isLogin = !!localStorage.getItem('session')
    if (to.meta.login && !isLogin) {
        loginInHlAppOrH5(to.meta)
    }
})

function loginInHlAppOrH5(options = {}) {
    if (JSBridge) {
        const forceCloseWhenNoLogin = typeof options.forceClose === 'boolean' ? options.forceClose : true
        JSBridge.login()
            .then(() => {
                location.reload()
            })
            .catch(e => {
                console.error(`loginInHlAppOrH5 e ===> `, e)
                /*------- 登录失败|用户拒绝登录 是否需要强制关闭当前页 -------*/
                if (forceCloseWhenNoLogin) {
                    JSBridge.close()
                }
            })
    } else if (getRunEnv() === 3) {
        let curPage = location.href
        curPage = encodeURIComponent(curPage)
        const loginPageHref = `${pathnames.VUE_APP_LOGIN_H5}?path=${curPage}`
        location.href = loginPageHref
    } else {
        // 剩余的平台都需要登录后才能查看内容
    }
}

export default router
