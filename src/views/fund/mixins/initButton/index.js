import { getQueryString, isTenantApp } from '@/utils'
import { UserRiskInfo } from '@/apis/riskAssessment.js'
import { getHoldingsDetail } from '@/apis/wealth/index.js'
import { getBasicInfo } from '@/apis/fund/fund.js'
import { FINANCE_ACCOUNT, FUND_ACCOUNT } from '@/entries/Fund.js'
import Vue from 'vue'
import { isNeedToSetTrade } from '@/mixins/initTradePwd'
import pathnames from '@/config/H5Pathname.js'
import { isInApp } from '@/config/globalProterties/env'
import { TRADE_ACCOUNT_STATUS } from '@/utils/user'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import { TRADE_STATUS_MAP } from '@/views/fund/config/common.js'
import { isInOutsideH5 } from '@/utils'

export default {
    mixins: [verifyMixin],
    data() {
        return {
            isDisbaledFund: false, // 是否是被禁止操作的基金
            basicInfoFund: null, // 当前基金的基础信息
            buyable: true, // 产品是否可买
            sellable: true, // 产品是否可卖
        }
    },
    computed: {
        // 基金类型
        type() {
            return this.$route.query.type
        },
        symbol() {
            return this.$route.query.symbol
        },
        // 公募
        isPublic() {
            return this.type === 'public'
        },
        isInHlApp() {
            return isTenantApp()
        },
        // 是否站内
        isInApp() {
            return isInApp
        },
        // 判断是否从CMHK的活动页进入到基金详情页
        isFromActivityPage() {
            const isChinaMobileHK = getQueryString('isChinaMobileHK') || getQueryString('isChinaMobileHK', true)
            const FROM_CHINA_MOBILE_HK = '1'
            return isChinaMobileHK === FROM_CHINA_MOBILE_HK
        },
        // 是否从瑞银跳转
        isInOutside() {
            return isInOutsideH5()
        },
    },
    watch: {
        '$root.isLogin': {
            async handler(v) {
                console.warn('initButton-watch-isLogin', this.isInApp, this.isInOutside)

                // 做一个二次保险
                if (v !== undefined) {
                    if (this.isInApp || this.isInOutside) {
                        // 初始化按钮
                        if (typeof this.$root.isLogin === 'boolean') {
                            this.initButtons({ dom: this.$refs.footerTemp })
                        }
                    }
                }
            },
            immediate: true,
        },
    },
    methods: {
        async getFundBasicInfo() {
            try {
                this.basicInfoFund = (await getBasicInfo({ symbol: this.symbol }))?.result?.list?.[0] || {}
                this.basicInfo = this.basicInfoFund
                this.buyable = [TRADE_STATUS_MAP.CAN_BUY_SELL, TRADE_STATUS_MAP.ONLY_CAN_BUY].includes(this.basicInfo.tradingStatus)
                this.sellable = [TRADE_STATUS_MAP.CAN_BUY_SELL, TRADE_STATUS_MAP.ONLY_CAN_SELL].includes(this.basicInfo.tradingStatus)
                this.isDisbaledFund = this.basicInfo.tradingStatus === TRADE_STATUS_MAP.NO_BUY_SELL
                console.log(`getFundBasicInfo`, this.basicInfo)
            } catch (e) {
                console.log('getBasicInfo===>error:', e)
            }
        },
        generateFooterButton({ dom } = {}) {
            try {
                // 生成tip文案
                const getUnsubscribeTipChild = h => {
                    let tips = ''

                    // 仅支持买入
                    if (!this.basicInfo.isActive) {
                        tips = this.$t('soldOut')
                    } else if (this.isDisbaledFund) {
                        // tips = this.$t('trade.cantSubscribeFund')
                    } else if (!this.sellable && this.buy && this.sell) {
                        tips = this.$t('trade.onlySubscribeFund')
                    } else if (!this.buyable) {
                        // 仅支持卖出
                        tips = this.$t('stopSelling')
                        if (this.sell) {
                            tips = this.$t('onlySellForProduct')
                        }
                    }
                    console.log(`yinlong tips`, tips)
                    if (tips) {
                        return h(
                            'p',
                            {
                                style: {
                                    left: 0,
                                    right: 0,
                                    textAlign: 'center',
                                    position: 'absolute',
                                    transform: 'translateY(calc(-100% - 0.06rem))',
                                    background: '#FFE5E7',
                                    lineHeight: '0.32rem',
                                    fontSize: '0.12rem',
                                    color: '#9D252A',
                                },
                            },
                            tips
                        )
                    }
                    return ''
                }
                // 开户|开通权限|认购|赎回 按钮
                const getFooterChild = h => {
                    const footerButtonChild = []
                    let step = 0
                    const steps = {
                        1: () => {
                            footerButtonChild.push(
                                h(
                                    'span',
                                    {
                                        staticClass: 'mask',
                                        attrs: {
                                            'data-key': 'openAccount',
                                        },
                                        class: {
                                            'private-btn': !this.isPublic,
                                            'normal-btn': this.isPublic,
                                        },
                                    },
                                    this.$t('openAccountNow')
                                )
                            )
                        },
                        2: () => {
                            footerButtonChild.push(
                                h(
                                    'span',
                                    {
                                        staticClass: 'mask',
                                        attrs: {
                                            'data-key': 'derivative',
                                        },
                                        class: {
                                            'private-btn': !this.isPublic,
                                            'normal-btn': this.isPublic,
                                        },
                                    },
                                    this.$t('openDerivative')
                                )
                            )
                        },
                        3: () => {
                            if (this.buy) {
                                footerButtonChild.push(
                                    h(
                                        'span',
                                        {
                                            staticClass: 'mask',
                                            attrs: {
                                                'data-key': 'buy',
                                            },
                                            class: {
                                                'private-btn': !this.isPublic,
                                                buyable: this.buyable,
                                                'disabled-buy': !this.buyable,
                                            },
                                        },
                                        this.$t('subscribe')
                                    )
                                )
                            }
                            if (this.sell) {
                                footerButtonChild.push(
                                    h(
                                        'span',
                                        {
                                            staticClass: 'mask',
                                            attrs: {
                                                'data-key': 'sell',
                                            },
                                            class: {
                                                'private-btn': !this.isPublic,
                                                sellable: this.buy && this.sellable,
                                                'disabled-sell': this.buy && !this.sellable,
                                            },
                                        },
                                        this.$t('redeem')
                                    )
                                )
                            }
                        },
                    }
                    if (this.openAccount) {
                        step = 1
                    } else {
                        if (!this.isOpenedDerivative) {
                            step = 2
                        } else {
                            step = 3
                        }
                    }
                    steps[step] && steps[step]()
                    return h('div', { staticClass: 'footer-content' }, [
                        getUnsubscribeTipChild(h),
                        h(
                            'button',
                            {
                                staticClass: 'footer-button',
                                class: {
                                    'open-account': this.openAccount,
                                    buy: this.buy,
                                    sell: this.sell,
                                    'big-btn': !this.isPublic || !this.isInHlApp, // 私募通过额外类来控制按钮的高度
                                    'dis-private-fund': !this.isPublic && this.isDisbaledFund,
                                },
                                on: this.isDisbaledFund ? {} : { click: this.onOpenAccount },
                            },
                            footerButtonChild
                        ),
                    ])
                }
                // 自选按钮
                const selfCheckChild = h => {
                    return h(
                        'button',
                        {
                            staticClass: 'self-select',
                            class: { selected: this.selected },
                            on: { click: this.selfHandler },
                        },
                        [
                            h('multi-img', {
                                staticClass: `self-icon`,
                                props: {
                                    name: `icon-self-${this.selected ? 'checked' : 'uncheck'}`,
                                    directory: 'fund',
                                },
                            }),
                            h('span', this.$t(this.selected ? 'deleteSelf' : 'addSelf')),
                        ]
                    )
                }
                // PK 按钮
                const comparisonChild = h => {
                    return h(
                        'button',
                        {
                            staticClass: 'comparison',
                            on: { click: this.compareFund },
                        },
                        [
                            h('multi-img', {
                                staticClass: `comparsion-icon`,
                                props: {
                                    name: `fund-comparison`,
                                    directory: 'fund',
                                },
                            }),
                            h('span', this.$t('compare.compare')),
                        ]
                    )
                }
                // 分享按钮
                const shareChild = h => {
                    return h('button', { staticClass: 'share', on: { click: this.onShare } }, [
                        h('i', { staticClass: 'fsfont f-a-share_huaban1' }),
                        h('span', this.$t('share')),
                    ])
                }
                // 前往星财富按钮
                // 这个按钮是在CMHK的基金页面使用，其它不需要用
                const goHlAPPChild = h => {
                    const dom = h(
                        'span',
                        {
                            staticClass: 'mask',
                            attrs: {
                                'data-key': 'goAssestPage',
                            },
                            class: {},
                        },
                        this.$t('goCmhkAssetBtn')
                    )
                    return h('div', { staticClass: 'footer-content' }, [
                        h(
                            'button',
                            {
                                staticClass: 'footer-button',
                                class: {
                                    'open-account': true,
                                    'big-btn': true,
                                },
                                on: { click: this.goAssestPage },
                            },
                            [dom]
                        ),
                    ])
                }

                const getFooterChildren = h => {
                    const footerChildren = []
                    // isFundPage 会在fund/detail/index.vue里面声明
                    if (this.isFromActivityPage && this.isFundPage) {
                        footerChildren.push(goHlAPPChild(h))
                    } else {
                        if (!this.isPublic || !this.isDisbaledFund) {
                            footerChildren.push(getFooterChild(h))
                        }

                        // if (this.isInHlApp && this.isPublic) {
                        //     footerChildren.push(selfCheckChild(h), comparisonChild(h), shareChild(h))
                        // }
                    }
                    return footerChildren
                }
                const footerComp = new Vue({
                    render: h => {
                        return h(
                            'footer',
                            {
                                style: { justifyContent: this.isInApp ? '' : 'center' },
                                class: { 'disabled-operate': this.isPublic && this.isDisbaledFund },
                            },
                            getFooterChildren(h)
                        )
                    },
                })
                // 延迟加载一次
                this.$nextTick(() => {
                    dom = dom || this.$refs.footerTemp
                    if (this.isInOutside) {
                        // 睿银产品可操作才渲染按钮，保证页面效果正常
                        if (!this.isDisbaledFund) {
                            this.$refs.footerTemp && footerComp.$mount(dom)
                        }
                    } else {
                        this.$refs.footerTemp && footerComp.$mount(dom)
                    }
                })
            } catch (e) {
                console.error(e)
            }
        },
        async initButtons({ dom } = {}) {
            try {
                // 如果从cmhk的活动页过来并且打开是基金页面不需要处理后续接口
                if (this.isFromActivityPage && this.isFundPage) {
                    return
                }
                await this.getFundBasicInfo()
                if (!this.$root.isLogin) {
                    // 特殊操作 用来支持展示buy方式
                    this.openAccount = false
                    this.isOpenedDerivative = true
                    this.buy = true
                    this.sell = false
                    return
                }
                this.openAccount = !this.$root.getAccountStatus(FINANCE_ACCOUNT) || !this.$root.getAccountStatus(FUND_ACCOUNT) // 按理应该是 true
                this.isOpenedDerivative = this.getDerivativeStatus()
                console.warn('this.isOpenedDerivative', this.isOpenedDerivative)
                this.buy = !this.openAccount && this.isOpenedDerivative
                if (this.type === 'private') {
                    // 私募不能主动赎回
                    this.sell = false
                    return
                }
                try {
                    // （未设置交易密码 || 未开户） 无法查询持仓
                    if (!isNeedToSetTrade(this.$store) && this.$root.getAccountStatus(FINANCE_ACCOUNT)) {
                        const { result = {} } = await getHoldingsDetail({ symbol: this.symbol })
                        console.log('getHoldingsDetail-result ==> ', result)
                        this.hasHolding = !!Number(result?.quantity)
                        this.sell = !this.openAccount && this.hasHolding
                    }
                } catch (e) {
                    console.error(e)
                }
            } catch (e) {
                console.error(e)
                // 接口/出错时 默认为未登录
                this.openAccount = false
                this.isOpenedDerivative = true
                this.buy = true
                this.sell = false
            } finally {
                this.generateFooterButton({ dom })
            }
        },
        onSelfSelected() {
            this.selected = !this.selected
        },

        onShare() {
            if (this.isInHlApp) {
                const { name, ISIN } = this.basicInfoFund
                this.$jsBridge.share({ title: name, desc: ISIN, pageUrl: location.href })
            }
        },

        async onOpenAccount(e) {
            try {
                this.$loading.show = true
                const key = e.target.dataset.key
                if (!key) return
                console.log(`onOpenAccount Key=${key} buyable=${this.buyable}, sellable=${this.sellable}`)
                const matchRes = '' // 匹配结果

                // 不可进行买操作
                if (key === 'buy' && !this.buyable) return
                // 不可进行卖操作
                if (key === 'sell' && !this.sellable) return

                // 账户校验
                if (!(await this.accountVerify(key === 'sell'))) return

                // 页面跳转
                const jumpToPage = key => {
                    const { symbol } = this.$route.query
                    const { VUE_APP_DERIVATIVE_PAGE } = pathnames
                    let url = ''
                    switch (key) {
                        case 'buy':
                            this.$router.push(`/subscribe/${symbol}`)
                            break
                        case 'sell':
                            // 现金宝选择卖出至证券或银行账户
                            if (this.basicInfoFund.isMMF == 1) {
                                this.sellCashBoxVisible = true
                            } else {
                                this.$router.push(`/redeem/${symbol}`)
                            }
                            break
                        case 'derivative':
                            this.initAccountWatch()
                            url = `${VUE_APP_DERIVATIVE_PAGE}?needRisk=1&matchRes=${matchRes}${
                                !this.isRiskMatch ? `&symbol=${this.symbol}&user=1` : ''
                            }`
                            this.$jsBridge
                                ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                                : (location.href = this.$addCurParamsForUrl(url))
                            break
                        default:
                            break
                    }
                }
                if (key === 'sell') {
                    return jumpToPage(key)
                }

                // 风险匹配校验
                const { riskRating } = this.basicInfoFund
                const res = await UserRiskInfo({
                    params: {
                        subAcctId: this.$store.getters['user/getSubAccountId'],
                    },
                })
                const showDialog = () => {
                    // 风险等级不匹配 弹框提示 + 跳转到风险不匹配页面
                    const message = ` <div>
                    <p>${this.$t('noMatchDes')}</p><br/>
                    <p>${this.$t('noMatchDes_')}</p>
                    </div>`
                    this.$dialog
                        .confirm({
                            title: this.$t('tzhsxpp'),
                            message,
                            showCancelButton: true,
                            allowHtml: true,
                            confirmButtonText: this.$t('learnReason'),
                            theme: 'round-button',
                            cancelButtonText: this.$t('cancelBuy'),
                            className: 'init-btn-dialog',
                            // getContainer: '.footer-content',
                        })
                        .then(() => {
                            localStorage.setItem(
                                'matchRiskInfo',
                                JSON.stringify({
                                    fund: {
                                        riskRating,
                                        symbol: this.symbol,
                                    },
                                    user: {
                                        ...(res.result || {}),
                                    },
                                })
                            )
                            if (this.$jsBridge) {
                                const url = `${location.origin}/wealth/fund.html#/no-matched-risk`
                                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                            } else {
                                this.$router.push('/no-matched-risk')
                            }
                        })
                }
                if (!(await this.riskMatchVerify(key, showDialog, jumpToPage))) return
                jumpToPage(key)
            } catch (e) {
                console.error(e)
            } finally {
                this.$loading.show = false
            }
        },
        // 校验是否存在于自选
        async checkFavstock() {
            if (!this.isInHlApp) return
            try {
                const data = await this.$jsBridge.checkFavstock(this.symbol)
                return data.isFavStock
            } catch (e) {
                console.log('jsBridge.checkFavstock=>e:', e)
                return false
            }
        },
        // 添加\删除 自选
        async selfHandler() {
            if (!this.isInHlApp) return
            try {
                const isFavStock = await this.checkFavstock(this.symbol)
                if (isFavStock) {
                    await this.$jsBridge.removeFavstock(this.symbol)
                    this.selected = false
                } else {
                    await this.$jsBridge.addFavstock(this.symbol)
                    this.selected = true
                }
            } catch (e) {
                console.log('detail-selfHandler=>e:', e)
            }
        },

        compareFund() {
            this.$router.push({
                path: '/select-fund',
                query: {
                    symbols: encodeURIComponent(JSON.stringify([this.symbol])),
                },
            })
            console.log('compareFund ===>', this.symbol)
        },

        // 注册自选监听函数
        initFavstockWatch() {
            try {
                if (this.$jsBridge && this.$jsBridge.watchPageVisible && !this.initFavstockWatch.inited) {
                    this.$jsBridge.watchPageVisible(async () => {
                        this.selected = await this.checkFavstock()
                    })
                    this.initFavstockWatch.inited = true
                }
            } catch (e) {
                console.error(e)
            }
        },
        // 前往星财富按钮判断方法
        goAssestPage() {
            // 如果没登录的情况
            const session = localStorage.getItem('session')
            const rndKey = localStorage.getItem('rndKey')
            const uin = localStorage.getItem('uin')
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const login_Status = session && rndKey && uin
            const noOpenAccountStatus = [
                TRADE_ACCOUNT_STATUS.ACCOUNT_UNOPEN,
                TRADE_ACCOUNT_STATUS.ACCOUNT_CLOSED,
                TRADE_ACCOUNT_STATUS.ACCOUNT_OPENING,
            ].includes(userInfo.clientStatus)
            console.log(`Feng.chen:: 14:46:24 userInfo ===> `, userInfo, userInfo.clientStatus, noOpenAccountStatus)
            const keys = [
                { key: 'thirdPartyToken', value: '' },
                { key: 'trade', value: '' },
                { key: 'open', value: '' },
                { key: 'langType', value: '' },
            ]
            keys.forEach(d => {
                const value = getQueryString(d.key) || getQueryString(d.key, true)
                d.value = value
            })
            if (!login_Status) {
                // 登录
                const params = keys.reduce((s, c) => {
                    if (c.value) {
                        s += `${c.key}=${c.value}&`
                    }
                    return s
                }, '&')
                let { VUE_APP_CMHK_LOGIN_PAGE: href } = pathnames
                const redirectPath = encodeURIComponent(location.href)
                href = `${href}?path=${redirectPath}${params}`
                location.href = href
            } else if (noOpenAccountStatus) {
                // 开户
                let { VUE_APP_OPEN_H5 } = pathnames
                VUE_APP_OPEN_H5 = VUE_APP_OPEN_H5.replace('#/', '') // 因为需要在html后面加参数
                const langType = keys[2]
                location.href = `${VUE_APP_OPEN_H5}?t=${Date.now()}&langType=${langType.value}#/`
            } else {
                location.href = `${location.origin}/wealth/cmhk.html`
            }
        },
    },
    async created() {
        this.initFavstockWatch()
        // 是否自选
        this.selected = await this.checkFavstock()
    },
}
