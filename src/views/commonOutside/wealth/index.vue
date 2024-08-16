<template>
    <div ref="fund" class="wealth-wrapper">
        <div class="bs-wrapper">
            <!-- 星选理财 -->
            <div class="card hot-fund" v-if="hotFundList.length">
                <van-swipe :autoplay="0" @change="onSwipeChange">
                    <van-swipe-item v-for="item in loading ? getTempList(1) : hotFundList" :key="item.symbol" @click="gotoFundDetail(item)">
                        <div class="item">
                            <van-skeleton row="4" :loading="loading">
                                <div class="item__type">
                                    <multi-img name="xingxuan_bg" class="xingxuan-bg" directory="commonOutside"></multi-img>
                                    <h2>{{ $t('jxlc') }}</h2>
                                </div>

                                <div class="item__header">
                                    <h3 class="title">
                                        <span class="line-elipsis">{{ item.name }}</span>
                                        <div class="is-in-ry" :class="`currency-${item.currency}`"></div>
                                    </h3>
                                </div>
                                <div class="item__body">
                                    <div class="item__body-left">
                                        <template v-if="fundTypeKeysMap.currency === item.fundType">
                                            <span class="rate" v-riseFall="{ value: item.returnD7ToY1, base: 4 }"></span>
                                            <p class="type">{{ $t('jqrnh') }}</p>
                                        </template>

                                        <template v-else>
                                            <span class="rate" v-riseFall="{ value: item.returnY1, base: 2 }"></span>
                                            <p class="type">{{ $t('nearOneYearChg') }}</p>
                                        </template>
                                    </div>
                                    <PerformanceTrend class="item__body-right" :symbol="item.symbol" :fundType="item.fundType"></PerformanceTrend>
                                </div>
                                <div class="item__footer">
                                    <Button>{{ $t('mr') }}</Button>
                                </div>
                            </van-skeleton>
                        </div>
                    </van-swipe-item>
                </van-swipe>
            </div>

            <!-- 功能排列卡片 -->
            <div class="features" :class="{ 'z-index-highest': showNoobGuide }">
                <div @click="onFeaturesClick" class="features-container">
                    <div
                        v-for="item in features"
                        class="mask features-item"
                        :key="item.key"
                        :data-key="item.key"
                        :data-link="item.link"
                        :data-label="item.label"
                    >
                        <multi-img :name="item.name" class="icon" directory="commonOutside" verifyTheme></multi-img>
                        <label class="text">{{ item.label }}</label>
                    </div>
                </div>
            </div>

            <!-- 开户提醒 -->
            <div class="card open-account-guide" v-if="!tradeAccount || !fundAccount" @click="gotoOpenAccount">
                <div class="left">
                    <h3 class="title">{{ $t(isToUpdateFundAccount ? 'updateFundAccount' : 'openFundAccount') }}</h3>
                    <p class="tip">{{ $t(isToUpdateFundAccount ? 'updateManagerAssets' : 'openManagerAssets') }}</p>
                    <button class="btn">{{ $t('openAccountNow') }}</button>
                </div>
                <div class="right">
                    <multi-img name="img_fund_account" directory="commonOutside" verifyTheme></multi-img>
                </div>
            </div>

            <!-- 进取投资 -->
            <div class="card advanced-invest" v-if="advancedInvestList.length">
                <div class="title">
                    <div>{{ $t('aggressiveInvest') }}</div>
                    <div class="right" @click="toMorePage()">
                        <span class="txt">{{ $t('loadingMore') }}</span>
                        <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
                    </div>
                </div>
                <div class="fund-item" v-for="item in loading ? getTempList(3) : advancedInvestList" :key="item.symbol" @click="gotoFundDetail(item)">
                    <van-skeleton row="4" :loading="loading">
                        <div class="fund-item-left">
                            <fund-chart :symbol="item.symbol" period="y3" :chgRate="item.returnY3"></fund-chart>
                        </div>
                        <div class="fund-item-right">
                            <h3 class="title_">{{ item.name }}</h3>
                            <div class="descript">
                                <span>{{ item.currency }}</span>
                                <span>{{ fundObj[item.fundType] }}</span>
                                <span>{{ riskRatingObj[item.riskRating] }}</span>
                                <span>{{ item.minInitial | thousandsFilter }}{{ item.currency | currencyFilter }}起投</span>
                            </div>
                            <div class="disbot">
                                <p class="rate" v-riseFall="item.returnY3"></p>
                                <p class="type">近3年{{ $t('priceChange') }}</p>
                            </div>
                        </div>
                    </van-skeleton>
                </div>
            </div>
            <!-- 星选理财(货币基金精选) -->
            <div class="card cash-fund" v-if="cashFundList.length !== 0">
                <h2>{{ $t('xxlc') }}</h2>
                <div class="cash-fund-list">
                    <div
                        class="cash-fund-list-item"
                        v-for="item in loading ? getTempList(2) : cashFundList"
                        :key="item.symbol"
                        @click="gotoFundDetail(item, 'public')"
                    >
                        <van-skeleton row="4" :loading="loading">
                            <div class="cash-fund-list-item-header">
                                <h3 class="title">
                                    <span class="line-elipsis">{{ item.name }}</span>
                                    <div :class="`currency-${item.currency}`"></div>
                                </h3>
                            </div>
                            <div class="cash-fund-list-item-body">
                                <p class="rate" v-riseFall="{ value: item.returnD7ToY1, base: 4, rate: true }"></p>
                                <p class="type">{{ $t('jqrnh') }}</p>
                            </div>
                            <div class="cash-fund-list-item-footer">
                                <button class="btn">{{ $t('mr') }}</button>
                            </div>
                        </van-skeleton>
                    </div>
                </div>
            </div>
            <!-- 基金榜单 -->
            <div class="card tjlist">
                <div class="title">
                    <div>{{ $t('fundText16') }}</div>
                    <div class="right" @click="toMorePage(5, 1)">
                        <span class="txt">{{ $t('loadingMore') }}</span>
                        <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
                    </div>
                </div>
                <div class="fund-item" v-for="item in loading ? getTempList(4) : bangdanList" :key="item.symbol" @click="toMorePage(5, item.id)">
                    <van-skeleton row="4" :loading="loading">
                        <div class="bdicon">
                            <multi-img :name="item.iconName" directory="fund" verifyTheme />
                        </div>
                        <div class="fund-item-right">
                            <h3 class="title_">{{ item.name }}</h3>
                            <div class="bddescript">
                                <span>{{ item.tips }}</span>
                            </div>
                        </div>
                    </van-skeleton>
                </div>
            </div>

            <!-- 重要文件 -->
            <a class="important-info" @click="gotoProtocol">{{ $t('importantInfo') }}</a>
            <p class="fund-relation-compayn-tip">
                <span>{{ $t('fundRelationCompanyTip') }}</span>
                <span class="company">{{ $t('fundRelationCompany') }}</span>
                <span>{{ $t('provide') }}</span>
            </p>
        </div>
    </div>
</template>

<script>
import { Overlay, Skeleton, SwipeItem, Swipe } from 'vant'
import { getPubList } from '@/apis/fund/fund.js'
import { getNews } from '@/apis/fund/news.js'
import { getPiApplyDetail } from '@/apis/client.js'
import { userRadar } from '@/apis/wealth'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { isNeedToSetTrade } from '@/mixins/initTradePwd'
import { isUndefined } from '@/utils/tools'
// import { getUserDetail } from '@/apis/uc.js'
// import { getRunEnv } from '@/utils/env.js'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import { isTenantApp } from '@/utils/tools.js'
import RadarBanner from '@/views/commonOutside/components/radarBanner.vue'
import FundChart from '@/views/fund/components/FundChart.vue'
import pathnames from '@/config/H5Pathname.js'
import { FUND_ACCOUNT_STATUS } from '@/utils/user'
import PerformanceTrend from '../components/PerformanceTrendRy.vue'
// import BScroll from '@better-scroll/core'
import { isInRyH5 } from '@/utils'
import { PUB_LIST_FILTER_MAP } from '@/config/common'
import Banner from '@/views/fund/components/Banner.vue'
import { getRecommendList } from '@/apis/fund/fund.js'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { FUND_TYPE_MAP } from '../config/common'

const FINANCE_ACCOUNT = 1 // 资金账户
const FUND_ACCOUNT = 2 // 基金账户

export default {
    name: 'ManageMoney',
    components: {
        [Overlay.name]: Overlay,
        [Skeleton.name]: Skeleton,
        RadarBanner,
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        FundChart,
        PerformanceTrend,
        Banner,
    },
    mixins: [riskAssessmentMixin, checkPIMixin],
    data() {
        return {
            fundTypeKeysMap: FUND_TYPE_MAP.keysMap,
            cashBoxNoobKey: 'WEALTH_NOOB_KEY',
            followNoobKey: 'FOLLOW_NOOB_KEY',
            showCashBoxNoobGuide: false,
            showFollowNoobGuide: false,
            newsList: [],
            newsPage: 6,
            newLength: 0,
            tradeAccount: false, // 是否开通了证券账户
            fundAccount: false, // 是否开通了基金账户
            loading: true,
            showTopTooltip: false,
            isProfessional: false, // 是否专业投资者
            isInitedTradePwd: false,
            isToUpdateFundAccount: false, // 是否是需要升级理财账户的用户

            userRadar: {
                permission: 0, // 看雷达图权限 0：没有权限 1：有权限
                userData: {},
                platformData: {},
            },
            loginStatusWhenMount: false, // 组件初始化时登录的初始状态
            status: '', //pi年审详情状态 550:待PI年审（凭证已过期）
            PIkey: 'showPIDialog',
            showPIDialog: false, //pi年审弹框控制
            showPITooltip: false, //pi小黄条显示
            clientType: '',
            auditType: 1, //审核类型
            showPistatus: [100, 110, 500], //小黄条显示的状态  // 100待提交、550待PI年审 110驳回待提交、500已驳回
            Riskcounter: 0, //初始化次数
            Personcounter: 0,
            openFundTrade: false,
            cashBoxData: {}, // 非睿银展示现金宝数据

            hotFundList: [], // 明星精选
            advancedInvestList: [],
            steadyFundList: [],
            spareFundList: [],
            cashFundListRequested: false,
            cashFundList: [], // 货币基金列表
            // cashFundList: [],

            bangdanList: [
                {
                    id: 1,
                    name: this.$t('topList1'),
                    tips: this.$t('topList1Tips'),
                    iconName: 'sl',
                },
                {
                    id: 2,
                    name: this.$t('topList2'),
                    tips: this.$t('topList2Tips'),
                    iconName: 'top-list_cash',
                },
                {
                    id: 3,
                    name: this.$t('fundText27'),
                    tips: this.$t('fundText26'),
                    iconName: 'jylj',
                },
                {
                    id: 4,
                    name: this.$t('fundText21'),
                    tips: this.$t('fundText28'),
                    iconName: 'gsy',
                },
                {
                    id: 5,
                    name: this.$t('fundText22'),
                    tips: this.$t('fundText23'),
                    iconName: 'pxjj',
                },
            ],
            fundObj: {
                1: this.$t('stockType'),
                2: this.$t('bondType'),
                3: this.$t('mixedType'),
                4: this.$t('currencyType'),
            },
            riskRatingObj: {
                1: this.$t('lowRisk'),
                2: this.$t('middleLowRisk'),
                3: this.$t('middleRisk'),
                4: this.$t('middleHighRisk'),
                5: this.$t('highRisk'),
            },
        }
    },
    filters: {
        currencyFilter,
        minInitialFilter(v, currency, $t) {
            return $t('startAmountForBond', { amount: thousandsFilter(v), currency: currencyFilter(currency) })
        },
    },
    computed: {
        // 是否显示新手引导
        showNoobGuide() {
            return this.showCashBoxNoobGuide || this.showFollowNoobGuide
        },
        // 是否个人账户/公司户
        cptIsneedPI() {
            const PERSONCOR_FLAG = [1, 4] // 个人账户/公司户
            return PERSONCOR_FLAG.includes(this.clientType)
        },
        // 是否需要pi年审
        cptIsPIexpire() {
            return this.cptIsneedPI && (this.cptIsStatus || (this.auditType == 2 && this.showPistatus.includes(this.status)))
        },
        //是否在3/9月份
        cptIsInmonth() {
            return [3, 9].includes(new Date().getMonth() + 1)
        },
        features() {
            return [
                {
                    key: 'cash',
                    label: this.$t('cashBox'),
                    name: 'cashManage',
                    link: '/wealth/cashBox.html#/',
                },
                {
                    key: 'publicFund',
                    label: this.$t('publicFundFullName'),
                    name: 'publicFund',
                    link: '/wealth/fund.html#/list',
                },
            ]
        },
    },
    watch: {
        showNoobGuide: {
            handler(v) {
                if (!v) {
                    // 新手引导隐藏只会执行一次
                    // this.initRiskTooltip()
                    // this.initRiskTooltip.watch()
                    this.getPersonType()
                    this.getPersonType.watch()
                }
            },
            immediate: true,
            deep: true,
        },
    },
    created() {
        this.checkNoobGuide()
    },
    async mounted() {
        if (!isUndefined(this.$root.isLogin)) {
            this.init()
        } else {
            const loginStatusUnwatch = this.$watch(
                '$root.isLogin',
                () => {
                    if (!isUndefined(this.$root.isLogin)) {
                        this.init()
                        loginStatusUnwatch()
                    }
                },
                { immediate: true }
            )
        }
    },
    methods: {
        isInRyH5,
        async init() {
            this.loginStatusWhenMount = this.$root.isLogin
            this.initAccountStatus()
            this.initAccountWatch()
            this.getPersonType()
            this.getPersonType.watch()
            this.getRecommendList()
            // this.getUserRadar()
            // this.$refs.bannerRef?.getLang()
            // await this.getCashFundList()
            // } else {
            // await this.getCashboxRecommend()
            // }
            // await this.getNews(this.newsPage)
        },
        // 获取用户查看雷达图权限
        async getUserRadar() {
            if (!this.$root.isLogin || !this.$root.getAccountStatus(FINANCE_ACCOUNT)) return
            try {
                const { result = {} } = await userRadar()
                console.warn('userRadar-result:', result)
                this.userRadar.permission = result.permission
                this.userRadar.userData = result.user
                this.userRadar.platformData = result.platform
            } catch (e) {
                console.error('userRadar===>e:', e)
            }
        },
        moreBtn() {
            this.newsPage += 5
            this.getNews(this.newsPage)
        },
        // 初始化 证券户和基金户 状态
        initAccountStatus() {
            this.tradeAccount = this.$root.getAccountStatus(FINANCE_ACCOUNT)
            this.fundAccount = this.$root.getAccountStatus(FUND_ACCOUNT)
            this.isInitedTradePwd = !isNeedToSetTrade(this.$store)
            this.judgeFundAccountUpdateStatus()
        },
        async getNews(pagenum) {
            const { result = {} } = await getNews({ type: 'fund', num: pagenum })
            const list = result.list || []
            this.newLength = list.length
            const arr = [...list]
            if (!(list.length < pagenum)) {
                arr.pop()
            }
            this.newsList = arr
        },
        getHMS(timestamp) {
            var date = new Date(timestamp * 1000) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
            // var Y = date.getFullYear() + '/';
            var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/'
            var D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' '

            var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
            var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
            // var s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
            return M + D + h + m
        },
        getTempList(length) {
            return Array.from({ length }).map(() => ({}))
        },

        gotoFundDetail(item, type) {
            type =
                type ||
                {
                    0: 'public',
                    1: 'private',
                }[item.fundMode]
            if (!(type && item.symbol)) return
            const url = `${location.origin}/wealth/fund.html#/detail?type=${type}&symbol=${item.symbol}`
            this.$goPage(url)
        },
        //跳转至研报详情
        gotoNewsDetail(item) {
            const url = `${location.origin}/pages/informationDetail.html#/?id=${item.id}&type=${encodeURIComponent('研报')}`
            if (isTenantApp() && this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                window.open(url)
            }
        },

        onFeaturesClick(e, value) {
            const { link, key, label } = e ? e.target.dataset : value
            if (!link) return

            if (key === 'cash') {
                if (!this.tradeAccount || !this.fundAccount) {
                    // 现金宝未开户(证券账户、理财账户)前置校验
                    this.gotoOpenAccount()
                    return
                }
            }
            const url = `${location.origin}${link}`
            console.log(`onFeaturesClick ===> ${url}`)
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                location.href = this.$addCurParamsForUrl(url)
            }
        },

        gotoOpenAccount() {
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            this.$root.nextAfterJudgeAccountStatus(!this.tradeAccount ? 'openAccount' : !this.fundAccount ? 'fundAccount' : '')
        },

        gotoProtocol() {
            const url = `${location.origin}/wealth/fund.html#/protocol?from=home`
            this.$goPage(url)
        },
        getPersonType() {
            try {
                if (this.$root.isLogin && this.$root.getAccountStatus(FINANCE_ACCOUNT) && !this.showNoobGuide) {
                    // 3月9月年审
                    if (!this.cptIsInmonth) {
                        this.initRiskTooltip()
                        this.initRiskTooltip.watch()
                        return
                    }
                    // 判断用户是否是个人账户 1个人户/2Esop/3联名户/4公司户/5机构户
                    const subAcctId = this.$store.getters['user/getSubAccountId']
                    const params = { data: { subAcctId: subAcctId || undefined } }
                    getPiApplyDetail(params)
                        .then(data => {
                            const { status, clientType, auditType } = data?.result
                            this.status = status || ''
                            this.clientType = clientType || ''
                            this.auditType = auditType
                            // 弹框提示
                            const showPIDialog = localStorage.getItem(this.PIkey)
                            if (this.cptIsPIexpire) {
                                if (!showPIDialog) {
                                    this.showPIDialog = true
                                } else {
                                    this.showPITooltip = true
                                }
                            } else {
                                this.initRiskTooltip()
                                this.initRiskTooltip.watch()
                            }
                        })
                        .catch(() => {})
                }
            } finally {
                // 页面显示的时候同步用户信息在获取PI状态
                this.getPersonType.watch = () => {
                    if (!this.Personcounter) {
                        this.$jsBridge &&
                            this.$jsBridge.watchPageVisible(() => {
                                this.$store.dispatch('user/getUserInfo', false).then(() => {
                                    this.getPersonType()
                                })
                            })
                        this.Personcounter++
                    }
                }
            }
        },
        cancelPI() {
            localStorage.setItem(this.PIkey, true)
            this.showPIDialog = false
            this.showPITooltip = true
        },
        initRiskTooltip(call = true) {
            //  call 是否第一次调用
            // 如果风险测评过期则进行弹框提示。(弹框一天一次)
            // 如果用户关闭弹框 则增加置顶提示
            // 是否需要年审
            // TODO: 需要已开户 + 通过新手引导
            if (this.$root.isLogin && this.$root.getAccountStatus(FINANCE_ACCOUNT) && !this.showNoobGuide) {
                // 调用过一次就不需要重复调用
                if (call && this.Riskcounter) return
                this.getAssessStatus()
                    .then(data => {
                        const { isExpired, isAssessed } = data?.result
                        if (isExpired === this.NO_EXPIRED) {
                            this.showTopTooltip = false
                            return
                        }
                        if (isAssessed === this.ASSESSED && isExpired === this.EXPIRED) {
                            // 弹框提示
                            const key = 'showDialogTime'
                            const showDialogTime = localStorage.getItem(key) // 存储结构yyyyMMDD
                            const currentTime = (() => {
                                const date = new Date()
                                return `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`
                            })()
                            if (!showDialogTime || showDialogTime !== currentTime) {
                                const self = this
                                this.confirmDialog(
                                    5,
                                    self.$addCurParamsForUrl(pathnames.VUE_APP_RISK_PAGE),
                                    {
                                        beforeClose(action, done) {
                                            if (action === 'cancel') {
                                                self.showTopTooltip = true
                                            }
                                            done()
                                        },
                                    },
                                    { replace: false }
                                )
                                localStorage.setItem(key, currentTime)
                            } else {
                                this.showTopTooltip = true
                            }
                            return
                        }
                    })
                    .catch(() => {})
            }
            // 页面显示的时候校验风险测评过期否

            this.initRiskTooltip.watch = () => {
                if (!this.Riskcounter) {
                    this.$jsBridge &&
                        this.$jsBridge.watchPageVisible(() => {
                            this.initRiskTooltip(false)
                        })
                    this.Riskcounter++
                }
            }
        },
        /** 风险测评跳转 */
        goRisk() {
            const url = pathnames.VUE_APP_RISK_PAGE
            this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : (location.href = this.$addCurParamsForUrl(url))
        },
        // 注册开户监听函数
        initAccountWatch() {
            try {
                if (this.$jsBridge && this.$jsBridge.watchPageVisible && !this.isInitAccountWatch) {
                    console.log('initAccountWatch ==>')
                    this.$jsBridge.watchPageVisible(async () => {
                        // 如果证券户和基金户都开通同时交易密码设置了则不需要进行后续逻辑
                        if (this.tradeAccount && this.fundAccount && this.isInitedTradePwd) return
                        this.$store.dispatch('user/getUserInfo', false).then(() => {
                            // 是否设置交易密码验证
                            this.isInitedTradePwd = !isNeedToSetTrade(this.$store)
                            this.initAccountStatus()
                        })
                    })
                    this.isInitAccountWatch = true
                }
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * @name 检查新手引导任务项
         * @param {string} type  cashBox: 现金宝引导，follow：跟投引导
         */
        async checkNoobTask(type = '') {
            try {
                // 键
                const key = {
                    cashBox: this.cashBoxNoobKey,
                    follow: this.followNoobKey,
                }[type]
                // 关闭标识
                const guideFlag = {
                    cashBox: 'showCashBoxNoobGuide',
                    follow: 'showFollowNoobGuide',
                }[type]
                if (!key) return
                if (this.$jsBridge) {
                    const data = await this.$jsBridge.readLocalStorage(key)
                    this[guideFlag] = !(data && data.value)
                }
            } catch (e) {
                console.error('wealth-home-readLocalStorage===>error:', e)
            }
        },

        // 检查是否新手引导
        checkNoobGuide() {
            const tastList = ['cashBox', 'follow']
            tastList.forEach(key => {
                this.checkNoobTask(key)
            })
        },

        async judgeFundAccountUpdateStatus() {
            try {
                const result = await this.$store.dispatch('user/getUserInfo')
                const openWealthMarketAction = result?.clientInfo?.accts?.[0]?.openWealthMarketAction
                this.openFundTrade = this.openFundTrade = result?.clientInfo?.accts?.[0]?.openFundTrade === FUND_ACCOUNT_STATUS.FUND_ACCOUNT_OPENED
                // 开通理财产品操作类型： 1：需开通； 2：升级 3：已开通
                const NEED_TO_UPDATE = 2
                this.isToUpdateFundAccount = openWealthMarketAction === NEED_TO_UPDATE
            } catch (error) {
                console.error(error)
            }
        },

        async getCashFundList() {
            try {
                const { result = {} } = await getPubList({
                    f: 'returnD7ToY1',
                    filter: [{ type: 'fundType', items: ['currency'] }], // 写死货币型
                    sort: 'desc',
                    start: 0,
                    count: 100,
                    type: 11,
                    buyable: PUB_LIST_FILTER_MAP.BUYABLE,
                })
                const list = result?.list || []
                const canUseFund = {
                    HKD: {
                        returnD7ToY1: 0,
                    },
                    USD: {
                        returnD7ToY1: 0,
                    },
                }
                list.forEach(curr => {
                    const currency = curr?.currency?.toUpperCase()
                    const old = canUseFund[currency]
                    if (Number(curr.returnD7ToY1) > Number(old && old.returnD7ToY1)) {
                        canUseFund[currency] = curr
                    }
                })
                console.log('result.list:', result.list || [])
                const yiFandDaItem = list.find(item => item.ISIN === 'HK0000499811' && item.currency === 'USD')
                this.cashFundList = yiFandDaItem ? [yiFandDaItem] : [canUseFund.USD, canUseFund.HKD].slice(0, 1)
                // this.cashFundList = [canUseFund.USD, canUseFund.HKD].slice(0,1)
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
            }
        },

        async getCashboxRecommend() {
            try {
                const SPARE_FUND = 4 // 闲钱理财
                const { result } =
                    (await getRecommendList({
                        type: SPARE_FUND, // 星彩宝闲钱理财
                    })) || {}
                const list = result?.list || []
                list.forEach(el => {
                    if (el.type === SPARE_FUND) {
                        this.cashBoxData = el.info[0]
                    }
                })
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
            }
        },

        transform() {
            return this.$t.call(this, ...arguments)
        },

        async getRecommendList() {
            try {
                const HOT_FUND = 1 // 热门基金
                const ADVANCED_FUND = 2 // 进取型基金
                const STEADY_FUND = 3 // 稳健型基金
                const SPARE_FUND = 4 // 闲钱理财
                const SREENGTH_FUND = 5 // 业绩实力榜
                const HIGH_FUND = 6 // 高收益风险比榜
                const OLD_FUND = 7 // 绩优老基榜
                const PAYOUT_FUND = 8 // 派息基金榜
                const USA_BOND = 9 // 美国国债
                const START_SELECTED_FUND = 12 // 星选理财
                const types = [
                    HOT_FUND,
                    ADVANCED_FUND,
                    STEADY_FUND,
                    SPARE_FUND,
                    SREENGTH_FUND,
                    HIGH_FUND,
                    OLD_FUND,
                    PAYOUT_FUND,
                    USA_BOND,
                    START_SELECTED_FUND,
                ]
                let { result } = (await getRecommendList({ type: types.join(',') })) || {}
                result = result || {}
                const list = result.list || []
                let advancedList = []
                console.log(`getRecommendList`, list)
                list.forEach(i => {
                    switch (i.type) {
                        case HOT_FUND:
                            this.hotFundList.push(...i.info)
                            break
                        case ADVANCED_FUND:
                            advancedList = i.info.slice(0, 3)
                            this.advancedInvestList.push(...advancedList)
                            break
                        case STEADY_FUND:
                            this.steadyFundList.push(...i.info)
                            break
                        case SPARE_FUND:
                            advancedList = i.info.slice(0, 1)
                            this.spareFundList.push(...advancedList)
                            break
                        case START_SELECTED_FUND:
                            advancedList = i.info
                            this.cashFundList.push(...advancedList)
                            break
                        default:
                            break
                    }
                })
            } catch (e) {
                console.error('getRecommendList', e)
            } finally {
                this.loading = false
            }
        },

        onSwipeChange() {},

        toMorePage(v, id) {
            if (v === 'bond') {
                const path = '/bond'
                const params = {}
                this.goPageLocal(path, params)
                return
            }
            if (v == 5) {
                //基金榜单
                this.$goPage(
                    '/strength-page',
                    {
                        isMore: v,
                        id,
                    },
                    {
                        pathname: '/wealth/fund.html',
                    }
                )
            } else {
                this.$goPage(
                    '/more-page',
                    {
                        isMore: 0,
                    },
                    {
                        pathname: '/wealth/fund.html',
                    }
                )
            }
        },
    },
}
</script>

<!-- 新写的 -->
<style lang="less" scoped>
.wealth-wrapper {
    height: 100%;
    padding: 0 12px;
    #background();

    [data-theme='black'] .van-skeleton__row {
        background-color: #262626;
    }

    #pi-tool-tip {
        color: #af7213;
        background-color: #fff6e8;

        &::before,
        &::after {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 12px;
            background-color: #fff6e8;
            content: '';
        }

        .go-risk {
            color: #ff6907;
        }
    }

    .risk-tool-tip {
        position: relative;
        margin-top: -12px;
        margin-bottom: 12px;
        padding: 8px 0;
        font-size: 12px;
        line-height: 18px;
        #warn_bg();
        #warn_color();

        &::before,
        &::after {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 12px;
            content: '';
            #warn_bg();
        }

        &::before {
            left: -12px;
        }

        &::after {
            right: -12px;
        }

        .go-risk {
            margin-left: 8px;
            background: none;
            border: none;
            outline: none;
            #font_theme();
        }
    }

    .card {
        #foreground();

        margin-top: 12px;
        border-radius: 8px;

        &.shadow {
            background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
            box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
            backdrop-filter: blur(27px);
        }
    }
}

// 星选理财
.hot-fund {
    position: relative;
    margin-top: 0;
    margin-bottom: 12px;
    overflow: hidden;
    background: linear-gradient(181.61deg, #fff8e7 1.37%, #fff 95.92%);
    border: 1px solid #fff;

    .item {
        box-sizing: border-box;
        width: 100%;
        padding: 15px 12px;
        overflow: hidden;

        &__type {
            .xingxuan-bg {
                position: absolute;
                top: 0;
                right: 0;
                width: 65px;
                height: 65px;
            }

            h2 {
                margin-top: 0;
                margin-bottom: 17px;
                overflow: hidden;
                font-weight: 600;
                font-size: 16px;
                line-height: 22px;
                white-space: nowrap;
                text-overflow: ellipsis;
                #font_h1();
            }
        }

        &__header {
            overflow: hidden;

            .title {
                display: flex;
                align-items: center;
                font-weight: 600;
                font-size: 15px;
                line-height: 20px;
                #font_h1();

                span {
                    margin-right: 8px;
                }

                & > div {
                    flex: 0 0 auto;
                }

                .right-arrow {
                    width: 8px;
                    margin-left: 2px;
                }
            }
        }

        &__body {
            display: flex;
            justify-content: space-between;
            height: 40px;
            margin-top: 8px;

            &-left {
                display: flex;
                flex-shrink: 0;
                align-items: flex-end;
                margin-right: 16px;

                .rate {
                    margin-right: 6px;
                    font-weight: 700;
                    font-size: 28px;
                    line-height: 28px;
                }

                .type {
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            &-right {
                width: 108px;
                height: 40px;
            }
        }

        &__footer {
            margin: 20px 0 16px;
            text-align: center;

            button {
                width: 227px;
                height: 44px;
                font-weight: 700;
                font-size: 16px;
                line-height: 44px;
                text-align: center;
                border: none;
                border-radius: 31px;
                outline: none;
                box-shadow: none;
                #bg_theme();
                #button_font();
            }
        }
    }

    /deep/ .van-swipe {
        .van-swipe-item {
            overflow: hidden;
        }

        &__indicators {
            bottom: 16px;
        }

        &__indicator {
            width: 4px;
            height: 4px;
            border-radius: 0;
            #swipe_background();

            &:not(:last-child) {
                margin-right: 5px;
            }
        }

        &__indicator--active {
            #swipe_active_background();

            width: 8px;
        }
    }
}

// 功能卡片
.features {
    position: relative;
    padding: 8px 0;

    &.z-index-highest {
        z-index: 9999 !important;
    }

    &.card {
        margin-top: 0;
    }

    .features-container {
        display: flex;

        .features-item {
            display: flex;
            align-items: center;
            margin-right: 8px;
            padding: 8px 14px;
            font-size: 14px;
            background: #fff;
            border: 0.5px solid #ebebeb;
            border-radius: 18px;

            img {
                width: 20px;
                height: 20px;
                margin-right: 6px;
            }
        }
    }

    ul {
        display: flex;

        li {
            display: flex;
            align-items: center;
            width: 32px;
            border-radius: 18px;

            &:nth-child(4n + 1),
            &:nth-child(4n + 2),
            &:nth-child(4n + 3) {
                margin-right: 0;
            }
            // &:nth-child(n + 5) {
            //     margin-top: 12px;
            // }
            &.mask {
                position: relative;

                &::after {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1;
                    content: '';
                }
            }

            .icon {
                display: block;
                width: 32px;
            }

            .text {
                display: block;
                margin-top: 6px;
                font-size: 12px;
                line-height: 16px;
                text-align: center;
                word-break: keep-all;
                #font_h1();
            }
        }
    }

    ul:nth-child(2) {
        margin-top: 12px;
    }
}

// 开户提醒
.open-account-guide {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;

    .left {
        margin: 18px 0 18px 16px;

        .title {
            font-weight: 700;
            font-size: 18px;
            line-height: 22px;
            #font_h1();
        }

        .tip {
            margin-top: 6px;
            font-size: 12px;
            line-height: 18px;
            #font_h2();
        }

        .btn {
            margin-top: 12px;
            padding: 0 15px;
            font-weight: 700;
            font-size: 14px;
            line-height: 28px;
            text-align: center;
            border: none;
            border-radius: 35px;
            outline: none;
            #bg_theme();
            #button_font();
        }
    }

    .right {
        margin: 24px 26px 0 0;

        img {
            width: 109px;
            height: 82px;
        }
    }
}

// 进取投资
.advanced-invest {
    padding: 8px 0 12px;
    overflow: hidden;

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px 12px 0;
        overflow: hidden;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;
        #font_h1();

        .right {
            display: flex;
            align-items: center;
            font-weight: 400;
            font-size: 12px;
            font-family: 'PingFang SC';
            line-height: 22px;
            #font_h2();

            .arrowicon {
                width: 12px;
                height: 12px;
                vertical-align: middle;
            }

            .txt {
                margin-right: 3px;
                vertical-align: middle;
            }
        }
    }

    .fund-item {
        display: flex;
        flex-direction: row;
        padding: 12px;

        &-left {
            min-width: 80px;
            margin-right: 8px;
        }

        &-right {
            .title_ {
                // padding-left: 5px;
                font-weight: 500;
                font-size: 14px;
                line-height: 20px;
                #font_h1();
            }

            .descript {
                display: flex;
                margin-top: 7px;

                span {
                    display: inline-block;
                    flex-shrink: 0;
                    height: 11px;
                    padding: 0 4px;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 12px;
                    border-right: 0.5px solid #b6b6b6;
                    #font_h2();
                }

                span:last-child {
                    flex: 1;
                    height: 12px;
                    padding: 0 0 0 5px;
                    line-height: 12px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    border-right: none;
                }
            }

            .disbot {
                display: flex;
                flex-direction: row;
                margin-top: 6px;

                .rate {
                    margin: 4px 8px 0 5px;
                    font-weight: 600;
                    font-size: 14px;
                    line-height: 16px;
                }

                .type {
                    margin-top: 4px;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                    #font_h3();
                }
            }
        }
    }
}

// 星选理财(非卡片)
.cash-fund {
    h2 {
        margin-bottom: 23px;
        padding: 14px 12px 0;
        overflow: hidden;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;

        #font_h1();
    }

    &-list {
        position: relative;
        display: flex;
        justify-content: space-between;
        padding: 0 12px 24px;

        &-item {
            width: 153px;
            text-align: center;

            &-header {
                overflow: hidden;

                .title {
                    display: flex;
                    align-items: center;
                    font-size: 14px;
                    line-height: 20px;
                    #font_h1();

                    span {
                        margin-right: 3px;
                    }

                    & > div {
                        flex: 0 0 auto;
                    }

                    .right-arrow {
                        width: 8px;
                        margin-left: 2px;
                    }
                }
            }

            &-body {
                margin-top: 8px;

                .type {
                    margin-top: 2px;
                    font-size: 12px;
                    line-height: 16px;
                    #font_h2();
                }

                .rate {
                    font-weight: 700;
                    font-size: 20px;
                    line-height: 28px;
                }
            }

            &-footer {
                margin-top: 8px;

                .btn {
                    width: 64px;
                    font-weight: 700;
                    font-size: 14px;
                    line-height: 28px;
                    text-align: center;
                    border: none;
                    border-radius: 31px;
                    outline: none;
                    box-shadow: none;
                    #bg_theme();
                    #button_font();
                }
            }
        }

        &::before {
            position: absolute;
            left: 50%;
            width: 1px;
            height: 110px;
            transform: translateX(-50%) scaleX(0.5);
            content: '';
            #divider_back_gound();
        }
    }
}

// 基金榜单
[data-theme='white'] .comment {
    background: linear-gradient(90.05deg, #f7f7f7 20.72%, rgba(246, 246, 246, 0) 98.91%);
}

[data-theme='black'] .comment {
    background: linear-gradient(90deg, #2b2927 0%, rgba(43, 41, 39, 0.1) 100%);
}

.tjlist {
    padding: 8px 0 12px;

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px 12px 0;
        overflow: hidden;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;
        #font_h1();

        .right {
            display: flex;
            align-items: center;
            font-weight: 400;
            font-size: 12px;
            font-family: 'PingFang SC';
            line-height: 22px;
            #font_h2();

            .arrowicon {
                width: 12px;
                height: 12px;
                vertical-align: middle;
            }

            .txt {
                margin-right: 3px;
                vertical-align: middle;
            }
        }
    }

    .fund-item {
        display: flex;
        flex-flow: row wrap;
        padding: 12px 8px 12px 12px;

        &.bond-type {
            .fund-item-left {
                margin-right: 8px;
            }
        }

        &-left {
            min-width: 73px;
            margin-right: 15px;

            .rate {
                font-weight: 600;
                font-size: 16px;
                line-height: 22px;
                #font_h3();
            }

            .type {
                margin-top: 4px;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
                #font_h3();
            }
        }

        &-right {
            .title_ {
                padding-left: 5px;
                font-weight: 500;
                font-size: 14px;
                line-height: 20px;
                #font_h1();
            }

            .descript {
                display: flex;
                margin-top: 7px;

                span {
                    display: inline-block;
                    flex-shrink: 0;
                    height: 11px;
                    padding: 0 3px;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 12px;
                    border-right: 0.5px solid #b6b6b6;
                    #font_h3();
                }

                span:last-child {
                    flex: 1;
                    height: 12px;
                    padding: 0 0 0 5px;
                    line-height: 12px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    border-right: none;
                }
            }

            .bddescript {
                display: inline-block;
                height: 10px;
                margin-top: 6px;
                padding: 0 5px;
                font-weight: 400;
                font-size: 12px;
                line-height: 10px;
                #font_h3();
            }
        }

        .bdicon {
            display: flex;
            align-items: center;
            margin-right: 10px;

            img {
                width: 34px;
                height: 34px;
            }
        }

        .comment {
            display: flex;
            flex: 0 0 100%;
            align-items: center;
            height: 28px;
            margin-top: 8px;
            padding: 0 10px;
            border-radius: 4px;

            img {
                width: 12px;
                margin-right: 8px;
            }

            .comment-text {
                font-size: 12px;
                line-height: 16px;
                #font_h1();
            }
        }
    }
}

// 重要信息
.important-info {
    display: inline-block;
    margin: 32px 0 16px 50%;
    padding: 8px 20px;
    color: #2f2f2f;
    font-size: 14px;
    line-height: 16px;
    border-radius: 19.5px;
    transform: translateX(-50%);
    #dialog_background();
}

// 底部声明
.fund-relation-compayn-tip {
    padding-bottom: 58px;
    font-size: 11px;
    line-height: 16px;
    text-align: center;
    #font_h3();

    .company {
        #font_theme();
    }
}
</style>

/* PI年审 */
<style lang="less" scoped>
.pi-dialog {
    /deep/ .van-dialog__header {
        font-weight: 500;
    }

    /deep/ .van-button__content {
        font-weight: 400;
        font-size: 14px;
    }

    .pi-dialog-content {
        padding: 0 16px;
        font-size: 14px;

        .content-msg {
            line-height: 22px;
        }

        .pi-btn {
            width: 100%;
            margin-top: 28px;
            padding: 0 15px;
            font-weight: 500;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            border: none;
            border-radius: 35px;
            outline: none;
            #bg_theme();
            #button_font();
        }
    }

    /deep/ .van-hairline--top::after {
        border: none;
    }
}
</style>
