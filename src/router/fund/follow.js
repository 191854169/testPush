import { i18n } from '@/i18n/fund'

const routes = [
    // 理财跟投
    {
        path: '/follow',
        name: 'follow',
        meta: {
            title: i18n.t('follow.combinationTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/index.vue'),
    },

    {
        path: '/follow-details',
        name: 'followDetails',
        meta: {
            title: i18n.t('follow.detailTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/details.vue'),
    },

    {
        path: '/portfolio-comment',
        name: 'portfolioCommentPage',
        meta: {
            title: i18n.t('follow.portfolioComment'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/portfolioCommentPage.vue'),
    },

    {
        path: '/create-portfolio-comment',
        name: 'createCommentPage',
        meta: {
            title: i18n.t('follow.createCommentPage'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/createCommentPage.vue'),
    },

    {
        path: '/follow-distribution-details',
        name: 'followDistributionDetails',
        meta: {
            title: i18n.t('follow.distributeTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/distributionDetails.vue'),
    },

    {
        path: '/follow-order-records',
        name: 'followOrderRecords',
        meta: {
            title: i18n.t('customerDetail.realOrderRecond'),
            login: true,
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/orderRecords.vue'),
    },

    {
        path: '/follow-rebalancing-records',
        name: 'followRebalancingRecords',
        meta: {
            title: i18n.t('follow.distributeRecordsTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/rebalancingRecords.vue'),
    },

    {
        path: '/follow-order-result',
        name: 'followOrderResult',
        meta: {
            title: i18n.t('follow.orderResultTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/orderResult.vue'),
    },

    {
        path: '/follow-order',
        name: 'followOrder',
        meta: {
            title: i18n.t('follow.orderTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/order.vue'),
    },

    {
        path: '/follow-rule-list',
        name: 'followRuleList',
        meta: {
            title: i18n.t('follow.ruleTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/ruleList.vue'),
    },
    {
        path: '/follow-investment-concentration',
        name: 'followInvestmentConcentration',
        meta: {
            title: i18n.t('follow.investmentConcentration'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/investmentConcentration.vue'),
    },
    {
        path: '/follow-trade-description',
        name: 'followTradeDescription',
        meta: {
            title: i18n.t('follow.followTradeDescriptionTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/followTradeDescription.vue'),
    },
    {
        path: '/follow-order-detail',
        name: 'followOrderDetail',
        meta: {
            title: i18n.t('follow.combinationRecordDetailTitle'),
            login: true,
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/orderDetail/index.vue'),
    },
    {
        path: '/master-investment',
        name: 'master-investment',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/masterInvestment.vue'),
        meta: {
            title: i18n.t('master.masterTitle'),
        },
    },
    {
        path: '/star-selection',
        name: 'star-selection',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/starSelection.vue'),
        meta: {
            title: i18n.t('starSel.starSelTitle'),
        },
    },
    {
        path: '/portfolio-list',
        name: 'portfolio-list',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/portfolioList.vue'),
        meta: {
            title: i18n.t('follow.findCombinationTitle'),
        },
    },
    {
        path: '/create-portfolio',
        name: 'create-portfolio',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/createPortfolio.vue'),
        meta: {
            title: i18n.t('createPortfolio.title'),
        },
    },
    {
        path: '/add-personal-tags',
        name: 'add-personal-tags',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/addPersonalTags.vue'),
        meta: {
            title: i18n.t('addPersonalTags.title'),
        },
    },
    {
        path: '/edit-portfolio-info',
        name: 'edit-portfolio-info',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/editPortfolioBasicInfo.vue'),
        meta: {
            title: i18n.t('editPortfolioInfo.title'),
        },
    },
    {
        path: '/customer-detail',
        name: 'customer-detail',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/customerDetail.vue'),
        meta: {
            title: i18n.t('customerDetail.title'),
        },
    },
    {
        path: '/edit-customer-info',
        name: 'edit-customer-info',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/editCustomerInfo.vue'),
        meta: {
            title: i18n.t('editPortfolioInfo.page'),
        },
    },
    {
        path: '/simulation-calculator',
        name: 'simulation-calculator',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/simulationCalculator.vue'),
        meta: {
            title: i18n.t('simulation.page'),
        },
    },
    {
        path: '/rebalancing',
        name: 'rebalancing',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/rebalancingPage.vue'),
        meta: {
            title: i18n.t('rebalancing.page'),
        },
    },
    {
        path: '/attention',
        name: 'attention',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/attention.vue'),
        meta: {
            title: i18n.t('attention.title'),
        },
    },
    {
        path: '/follow/real-order',
        name: 'followRealOrder',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/followRealOrder.vue'),
        meta: {
            title: i18n.t('follow.realOrder'),
        },
    },
    {
        path: '/investment-migrate-zone',
        name: 'investmentMigrateZone',
        meta: {
            title: i18n.t('follow.investmentMigrate'),
        },
        component: () => import(/* webpackChunkName: "investmentProPack" */ '@/views/fund/follow/investmentMigrateZone.vue'),
    },
    // 投顾资产
    {
        path: '/invest-advisory/assets',
        name: 'investAdvisoryAssets',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/investAdvisory/assets.vue'),
        meta: {
            title: i18n.t('investAdvisory.assets'),
        },
    },
    // 组合调仓
    {
        path: '/invest-advisory/portfolio-place-order',
        name: 'portfolioPlaceOrder',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/investAdvisory/portfolioPlaceOrder.vue'),
        meta: {
            title: i18n.t('investAdvisory.portfolioTransfer'),
        },
    },
    // 收益明细
    {
        path: '/invest-advisory/profit-loss-details',
        name: 'profitLossDetails',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/investAdvisory/profitLossDetails.vue'),
        meta: {
            title: i18n.t('investAdvisory.profitLoss'),
        },
    },
    // 投顾资产-持仓明细
    {
        path: '/invest-advisory/holding-detail',
        name: 'investAdvisoryAssets',
        component: () => import(/* webpackChunkName: "followRouter"  */ '@/views/fund/follow/investAdvisory/holdingDetailPage.vue'),
        meta: {
            title: i18n.t('investAdvisory.holdDetail'),
        },
    },
    //升级投顾服务
    {
        path: '/upgrade-investment-service',
        name: 'upgradeInvestmentService',
        meta: {
            title: i18n.t('portfolioFollow.upgradeService'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/upgradeInvestmentService.vue'),
    },
    {
        path: '/invest-advisory/order-records',
        name: 'investAdvisoryOrderRecords',
        meta: {
            title: i18n.t('investAdvisory.orderRecord'),
            login: true,
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/investAdvisory/orderRecords.vue'),
    },
    {
        path: '/invest-advisory/order-detail',
        name: 'investAdvisoryOrderDetail',
        meta: {
            title: i18n.t('follow.combinationRecordDetailTitle'),
        },
        component: () => import(/* webpackChunkName: "fundRouter" */ '@/views/fund/follow/investAdvisory/orderDetail.vue'),
    },
]

export default routes
