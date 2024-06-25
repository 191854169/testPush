// h5页面地址清单 - https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001011
const pathnames = {
    VUE_APP_LOGIN_H5: '/pages/login.html#/', // H5登录页
    VUE_APP_OPEN_H5: '/pages/openAccount.html#/', // 开户H5
    VUE_APP_EDDA_H5: '/edda', // 存入资金 h5 地址
    VUE_APP_EDDA_H5_APP: '/edda_app', // 存入资金 h5 地址
    VUE_APP_EDDA_CURRENCY_APP: '/edda_app/selectCurrency/', // 存入资金-选择币种页面(APP)
    VUE_APP_EDDA_CURRENCY_H5: '/edda/selectCurrency/', // 存入资金-选择币种页面(H5)
    VUE_APP_CURRENCY_H5: '/edda/currency/exchange', // 货币兑换H5
    VUE_APP_CURRENCY_H5_APP: '/edda_app/currency/exchange', // 货币兑换H5
    VUE_APP_TRANSFER_OUT_H5: '/edda/transferOutFunds', // 提取资金
    VUE_APP_TRANSFER_OUT_APP: '/edda_app/transferOutFunds', // 提取资金
    VUE_APP_OPEN_ACCOUNT_PAGE: '/pages/startAccount.html#/', // 开户页面链接
    VUE_APP_RISK_PAGE: '/wealth/riskAssessment.html#/', // 风险测评页面链接
    VUE_APP_OPEN_FUND_PAGE: '/pages/fundAccount.html#/', // 基金开户页面链接
    VUE_APP_DERIVATIVE_PAGE: '/pages/derivative.html#/', // 衍生品权限开通页面链接
    VUE_APP_PI_APPLY: '/pages/PICertification.html#/', // PI 申请页面
    VUE_APP_BUILDER_PAGE: '/pages/builderPage.html#/', // h5生成器页面
    VUE_APP_PURCHASING_H5: '/pages/purchasing.html', // 提升购买力
    VUE_APP_CMHK_LOGIN_PAGE: '/pages/CMHKAuthorization.html#/', // CMHK登录页
    VUE_APP_CMHK_WEALTH_PAGE: '/wealth/cmhk.html#/', // CMHK财富首页
    VUE_APP_FIXEDDEPOSIT_OPEN_ACCOUNT_PAGE: '/pages/openAccountDCB.html', // 定存宝开户页面
    VUE_APP_FIXEDDEPOSIT_PAGE: '/wealth/fixedDepositTreasure.html#/', // 定存宝主页
    VUE_APP_FIXEDDEPOSIT_ABOUT_PAGE: '/wealth/fixedDepositTreasure.html#/about', // 定存宝开通介绍页面
    VUE_APP_FIXEDDEPOSIT_LIST_PAGE: '/wealth/fixedDepositTreasure.html#/list', // 定存宝产品列表页
    VUE_APP_STARSPECIALACCOUNT_OPEN_ACCOUNT_PAGE: '/pages/openAccountXCBPro.html#/', // 星财宝专户开户页面
    VUE_APP_STARSPECIALACCOUNT_PAGE: '/wealth/starTreasureAccount.html#/', // 星财宝专户主页
    VUE_APP_STARSPECIALACCOUNT_ABOUT_PAGE: '/wealth/starTreasureAccount.html#/about', // 星财宝专户开通介绍页面
    VUE_APP_STARSPECIALACCOUNT_LIST_PAGE: '/wealth/starTreasureAccount.html#/list', // 星财宝专户产品列表页
    VUE_APP_FOSUN_DOWNLOAD_PAGE: '/m', // 复星APP下载页
    VUE_APP_WEALTH_COUNSELOR_PAGE: '/pages/appAdvisor.html#/', // 专属顾问页
    VUE_APP_WEALTH_FUND_PAGE: '/wealth/fund.html#/', // 理财页
    VUE_APP_WEALTH_COMMONOUTSIDE_PAGE: '/wealth/commonOutside.html#/', // 睿银站外通用h5页面
    VUE_APP_WEALTH_CASHBOX_PAGE: '/wealth/cashBox.htmsl#/', // 星财宝主页
    VUE_APP_INVESTMENT_V2_OPEN_ACCOUNT_PAGE: '/pages/openAccountInvestmentV2.html', // 投顾组合开户页面
    VUE_APP_ETF_QUESTION: '/pages/IPO.html#/etfQuestion', // 虚拟资产认识评估
}

Object.entries(pathnames).forEach(([k, v]) => {
    Object.defineProperty(pathnames, k, {
        get() {
            if (/^http(s)?/.test(v)) return v
            let origin = location.origin
            // 开发状态下 origin默认跳转到sit域名，方便查看跳转是否正确
            if (process.env.NODE_ENV === 'development') {
                origin = `https://${process.env.VUE_APP_ENV}.mfosunhani.com`
            }
            return `${origin}${v}`
        },
        enumerable: false,
        configurable: false,
    })
})

export default pathnames
