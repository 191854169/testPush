// 基金首页
<template>
    <div ref="fund" class="fund">
        <van-overlay :show="showNoobGuide" class="mask-overlay" @click="finishGuideAction"></van-overlay>
        <!-- pi年审提示 -->
        <p class="risk-tool-tip" id="pi-tool-tip" v-if="showPITooltip">
            <span>{{ cptPITooltipText }}</span>
            <span class="go-risk" @click="jumpToPI">{{ cptPTupdateText }}</span>
        </p>
        <!-- 风险测评过期提示 -->
        <p class="risk-tool-tip" v-else-if="showTopTooltip">
            <span>{{ $t('riskTipExpired') }}</span>
            <span class="go-risk" @click="goRisk">{{ $t('goRisk') }}</span>
        </p>
        <van-dialog
            width="280px"
            class="pi-dialog"
            v-model="showPIDialog"
            :title="$t('sweetTip')"
            confirm-button-color="#2f2f2f"
            :confirm-button-text="$t('cancel')"
            @confirm="cancelPI"
        >
            <div class="pi-dialog-content">
                <p class="content-msg">{{ cptPIDialogText }}</p>
                <button class="pi-btn" block round color="#FF6907" @click="jumpToPI">{{ $t('PIuploadText') }}</button>
            </div>
        </van-dialog>
        <!-- 账户基本信息卡片，只依据初始化的登录态来判断是否展示“持仓卡片”，因为登录态改变的时候页面会reload，没有必要实时刷新该组件的显示状态，
            可能会引起组件内部图片的请求被浏览器cancel，导致arms上报资源错误
         -->
        <account-card
            showOrder
            class="account-info"
            v-if="loginStatusWhenMount && tradeAccount && isInitedTradePwd"
            :isProfessional="isProfessional"
            :showRepayment="true"
        ></account-card>
        <!-- 功能排列卡片 -->
        <div class="card features" :class="{ 'z-index-highest': showNoobGuide }">
            <ul @click="onFeaturesClick">
                <template v-for="item in features.slice(0, 4)">
                    <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                        <multi-img :name="item.name" class="icon" directory="fund" verifyTheme></multi-img>
                        <label class="text">{{ item.label }}</label>
                    </li>
                </template>
            </ul>
            <ul @click="onFeaturesClick">
                <template v-for="item in features.slice(4)">
                    <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                        <multi-img :name="item.name" class="icon" directory="fund" verifyTheme></multi-img>
                        <label class="text">{{ item.label }}</label>
                    </li>
                </template>
            </ul>
            <!-- 新手引导 -->
            <template v-if="showNoobGuide">
                <div class="card-overlay mask" @click="finishGuideAction">
                    <!-- 用v-show 接口切换新手引导导致的闪动问题 -->
                    <div class="cash-box-noob" v-show="showCashBoxNoobGuide">
                        <multi-img name="noob-guide" directory="noob" />
                        <span>{{ $t('noobGuide') }}</span>
                    </div>
                    <div class="follow-noob" v-show="!showCashBoxNoobGuide && showFollowNoobGuide">
                        <multi-img name="follow-noob-guide" directory="noob" />
                        <span>{{ $t('followNoobGuide') }}</span>
                    </div>
                </div>
            </template>
        </div>
        <!-- 客户雷达图入口 -->
        <radar-banner
            class="card"
            v-if="userRadar.permission === 1"
            :userData="userRadar.userData"
            :platformData="userRadar.platformData"
        ></radar-banner>
        <!-- banner -->
        <banner></banner>
        <!-- 开户提醒 -->
        <div class="card open-account-guide" v-if="!tradeAccount || !fundAccount" @click="gotoOpenAccount">
            <div class="left">
                <h3 class="title">{{ $t(isToUpdateFundAccount ? 'updateFundAccount' : 'openFundAccount') }}</h3>
                <p class="tip">{{ $t(isToUpdateFundAccount ? 'updateManagerAssets' : 'openManagerAssets') }}</p>
                <button class="btn">{{ $t('openAccountNow') }}</button>
            </div>
            <div class="right">
                <multi-img name="open_account" directory="fund" verifyTheme></multi-img>
            </div>
        </div>
        <!-- 投资组合 -->
        <investmentPortfolioCard />
        <!-- 星财宝 -->
        <div class="card tjlist" v-if="spareFundList.length">
            <div class="title">
                <div>{{ $t('cashBox') }}</div>
            </div>
            <div
                class="fund-item"
                v-for="(item, idx) in loading ? getTempList(1) : spareFundList"
                :key="item.symbol"
                @click="idx == 0 ? onFeaturesClick('', { link: '/wealth/cashBox.html#/', key: 'cash', label: $t('cashBox') }) : gotoFundDetail(item)"
            >
                <van-skeleton row="4" :loading="loading">
                    <div class="fund-item-left">
                        <p class="rate" v-riseFall="{ value: item.returnD7ToY1, base: 4 }"></p>
                        <p class="type">{{ $t('jqrnh') }}</p>
                    </div>
                    <div class="fund-item-right">
                        <h3 class="title_">{{ $t('adjustAutoManage') }}</h3>
                        <div class="descript">
                            <span>
                                {{ $t('reckonInPower') }}
                            </span>
                        </div>
                    </div>
                </van-skeleton>
            </div>
        </div>
        <!-- 热门基金跑马灯 -->
        <div class="card hot-fund" v-if="hotFundList.length">
            <van-swipe class="my-swipe" :autoplay="0" @change="onSwipeChange">
                <van-swipe-item v-for="item in loading ? getTempList(1) : hotFundList" :key="item.symbol" @click="gotoFundDetail(item)">
                    <div class="fund-item">
                        <van-skeleton row="4" :loading="loading">
                            <header class="fund-item-header">
                                <div class="tag">
                                    <multi-img name="hot_tag" directory="fund" alt="hot_tag"></multi-img>
                                    <span>{{ $t('selectedStar') }}</span>
                                </div>
                                <p class="company">{{ item.companyBrief }}</p>
                            </header>
                            <div class="fund-item-body">
                                <div class="left">
                                    <div class="top">
                                        <span class="rate" v-riseFall="{ value: item.returnY3, base: 2 }"></span>
                                        <span class="type">{{ $t('nearThreeYearIncome') }}</span>
                                    </div>
                                    <div class="bottom">
                                        <p class="fund-title">{{ item.name }}</p>
                                    </div>
                                </div>
                                <div class="right">
                                    <fund-chart :chgRate="item.returnY3" period="y3" ref="fundChart" :symbol="item.symbol"></fund-chart>
                                </div>
                            </div>
                            <Button class="fund-item-footer">{{ $t('buyNow') }}</Button>
                        </van-skeleton>
                    </div>
                </van-swipe-item>
            </van-swipe>
        </div>
        <!-- 投资进取基金 -->
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
        <div class="card cash-fund" v-if="!(cashFundListRequested && cashFundList.length === 0)">
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
        <!-- 美国国债板块 -->
        <div class="card tjlist" v-if="usaBond.length">
            <div class="title">
                <div>{{ $t('usaNationalDebt') }}</div>
                <div class="right" @click="toMorePage('bond')">
                    <span class="txt">{{ $t('loadingMore') }}</span>
                    <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
                </div>
            </div>
            <div class="fund-item bond-type" v-for="item in loading ? getTempList(3) : usaBond" :key="item.symbol" @click="gotoBondDetail(item)">
                <van-skeleton row="4" :loading="loading">
                    <div class="fund-item-left">
                        <!-- 债券到期年化率为三位 -->
                        <p class="rate" v-riseFall="{ value: item.MAY, base: 3 }"></p>
                        <p class="type">{{ $t('expireIncome') }}</p>
                    </div>
                    <div class="fund-item-right">
                        <h3 class="title_">{{ item.name }}</h3>
                        <div class="descript">
                            <span>{{ $t('zeroCommission') }}</span>
                            <span>{{ item.minInitial | minInitialFilter(item.currency, transform) }}</span>
                            <span>{{ riskRatingObj[item.riskRating] }}</span>
                        </div>
                    </div>
                    <p class="comment">
                        <multi-img name="comments" directory="fund" verifyTheme></multi-img>
                        <span class="comment-text">{{ item.comment }}</span>
                    </p>
                </van-skeleton>
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
            <div class="fund-item" v-for="(item, idx) in loading ? getTempList(4) : bangdanList" :key="item.symbol" @click="toMorePage(5, item.id)">
                <van-skeleton row="4" :loading="loading">
                    <div class="bdicon">
                        <multi-img v-if="idx == 0" name="sl" directory="fund" verifyTheme />
                        <multi-img v-if="idx == 1" name="gsy" directory="fund" verifyTheme />
                        <multi-img v-if="idx == 2" name="jylj" directory="fund" verifyTheme />
                        <multi-img v-if="idx == 3" name="pxjj" directory="fund" verifyTheme />
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
        <!-- 研究报告 -->
        <div class="card invest yjbg">
            <h2>{{ $t('fundText19') }}</h2>
            <div class="fund-list" v-if="newsList.length">
                <div class="fund-item" style="width: 100%" v-for="(item, idx) in newsList" :key="idx" @click="gotoNewsDetail(item)">
                    <van-skeleton row="3" :loading="loading">
                        <div class="fund-item-header">
                            <h3 class="title">{{ item.title }}</h3>
                        </div>
                        <div class="fund-item-body">
                            <div class="left">
                                <span class="type right10" v-if="item.source">{{ item.source }}</span>
                                <span class="type">{{ getHMS(item.publish) }}</span>
                            </div>
                        </div>
                    </van-skeleton>
                </div>
                <div class="moreBtn" @click="moreBtn" v-if="newsPage - 1 < newLength">{{ $t('loadingMore') }}</div>
            </div>
            <div class="no-data" v-else>
                <multi-img name="noData" directory="common" verifyTheme></multi-img>
                <p>{{ $t('fundText20') }}</p>
            </div>
        </div>

        <!-- 重要文件 -->
        <a class="important-info" @click="gotoProtocol">{{ $t('importantInfo') }}</a>
        <p class="fund-relation-compayn-tip">
            <span>{{ $t('fundRelationCompanyTip') }}</span>
            <span class="company">{{ $t('fundRelationCompany') }}</span>
            <span>{{ $t('provide') }}</span>
        </p>

        <!-- app专属顾问 -->
        <div
            class="app-counselor"
            :class="{ 'app-counselor-half': showHalfCounselor }"
            ref="appCounselor"
            v-if="showAppCounselor"
            @click="goCounselor"
        >
            <multi-img name="close-full-gray" class="counselor-icon" directory="common" @click.stop="hiddenCounselor"></multi-img>
            <span class="app-counselor__text">{{ $t('addWealthCounselor') }}</span>
            <multi-img name="app_counselor" class="counselor-bg" directory="fund"></multi-img>
        </div>
    </div>
</template>

<script>
import { Overlay, SwipeItem, Swipe, Skeleton } from 'vant'
import FundChart from '@/views/fund/components/FundChart.vue'
import { getUserRecommendList, getRecommendList } from '@/apis/fund/fund.js'
import { getNews } from '@/apis/fund/news.js'
import { getPiApplyDetail } from '@/apis/client.js'
import { userRadar } from '@/apis/wealth'
import AccountCard from './components/AccountCard.vue'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { FINANCE_ACCOUNT, FUND_ACCOUNT } from '@/entries/Fund.js'
import Banner from './components/Banner.vue'
import { isNeedToSetTrade } from '@/mixins/initTradePwd'
import { isUndefined, compatIOSLocalStorage } from '@/utils/tools'
import { getUserDetail } from '@/apis/uc.js'
import { getRunEnv, setTheme } from '@/utils/env.js'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import { isHLApp, getAppVersion, compareVersion } from '@/utils/tools.js'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { getUsaBondList } from '@/apis/bond/index.js'
import investmentPortfolioCard from './follow/components/investmentPortfolioCard.vue'
import RadarBanner from '@/views/fund/clientRadarMap/radarBanner.vue'
import pathnames from '@/config/H5Pathname.js'
import dayjs from 'dayjs'
import { debounce } from 'lodash'

export default {
    name: 'fund',
    components: {
        [Overlay.name]: Overlay,
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        FundChart,
        AccountCard,
        [Skeleton.name]: Skeleton,
        Banner,
        investmentPortfolioCard,
        RadarBanner,
    },
    mixins: [riskAssessmentMixin, checkPIMixin],
    data() {
        return {
            counselorStorageKey: 'COUNSELOR_STORAGE_DATE', // app专属顾问localStorage存储key
            showHalfCounselor: false, // 显示一半app专属顾问
            closeAppCounselor: false, // 是否关闭app专属顾问入口
            cashBoxNoobKey: 'WEALTH_NOOB_KEY',
            followNoobKey: 'FOLLOW_NOOB_KEY',
            showCashBoxNoobGuide: false,
            showFollowNoobGuide: false,
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
            features: [],
            hotFundList: [],
            advancedInvestList: [],

            steadyFundList: [],
            spareFundList: [],
            bangdanList: [
                {
                    id: 1,
                    name: this.$t('fundText27'),
                    tips: this.$t('fundText26'),
                },
                {
                    id: 2,
                    name: this.$t('fundText21'),
                    tips: this.$t('fundText28'),
                },
                {
                    id: 3,
                    name: this.$t('fundText24'),
                    tips: this.$t('fundText25'),
                },
                {
                    id: 4,
                    name: this.$t('fundText22'),
                    tips: this.$t('fundText23'),
                },
            ],
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
            cashFundList: [], // 货币基金列表
            usaBond: [], // 美国国债列表
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
            cashFundListRequested: false, // 是否请求过货币基金
        }
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
        cptIsStatus() {
            return this.status == 550
        },
        // 是否需要pi年审
        cptIsPIexpire() {
            return this.cptIsneedPI && (this.cptIsStatus || (this.auditType == 2 && this.showPistatus.includes(this.status)))
        },
        //是否在3/9月份
        cptIsInmonth() {
            return [3, 9].includes(new Date().getMonth() + 1)
        },
        // pi截至日期
        cptDateText() {
            const month = new Date().getMonth() + 1
            const strs = ['3月28日 12:00', '9月27日 12:00']
            return this.cptIsInmonth ? ([3].includes(month) ? strs[0] : strs[1]) : '--'
        },
        // pi年审小黄条信息
        cptPITooltipText() {
            let text = ''
            if (this.cptIsneedPI) {
                if ([100, 550].includes(this.status)) {
                    if (this.clientType === 1) text = 'PITooltipPersonText'
                    else text = 'PITooltipComText'
                } else if ([110, 500].includes(this.status)) {
                    if (this.clientType === 1) text = 'PIReTooltipPersonText'
                    else text = 'PIReTooltipComText'
                } else {
                    text = ''
                }
            }
            return this.$t(text, { date: this.cptDateText })
        },
        cptPTupdateText() {
            return [110, 500].includes(this.status) ? this.$t('PIupdateText') : this.$t('PIuploadText')
        },
        // pi年审弹框信息
        cptPIDialogText() {
            const key = this.cptIsneedPI ? (this.clientType === 1 ? 'PIDialogPersonText' : 'PIDialogComText') : ''
            return this.$t(key, { date: this.cptDateText })
        },
        // 是否显示app专属顾问
        showAppCounselor() {
            if (this.closeAppCounselor) return false
            const inHL = isHLApp()
            // 显示新手引导时不显示
            if (this.showNoobGuide) return false
            if (inHL) {
                // app版本号大于2.10不展示
                const curVersion = getAppVersion()
                const moreThanVersion = compareVersion(curVersion, '2.10') >= 0
                console.log('app专属顾问版本判断当前版本是否 >= 2.10：', moreThanVersion)
                if (moreThanVersion) return
                const counselorDate = localStorage.getItem(this.counselorStorageKey)
                const today = dayjs().format('YYYY-MM-DD')
                if (counselorDate && today === counselorDate) {
                    // 当天关闭过icon,不再显示
                    return false
                }
                return true
            }
            return false
        },
    },
    filters: {
        currencyFilter,
        minInitialFilter(v, currency, $t) {
            return $t('startAmountForBond', { amount: thousandsFilter(v), currency: currencyFilter(currency) })
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
    beforeCreate() {
        setTheme()
    },
    created() {
        // this.checkPI()
        this.checkNoobGuide()
        this.getUsaBondList()
        this.getIsWhiteList()
    },
    mounted() {
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
        this.getRecommendList()
        this.getNews(this.newsPage)
        // TODO: 需要先判断是否展示app专属入口
        this.addFundScroll()
    },
    methods: {
        init() {
            this.loginStatusWhenMount = this.$root.isLogin

            this.initAccountStatus()
            this.initAccountWatch()
            this.getPersonType()
            this.getPersonType.watch()
            // this.initRiskTooltip()
            // this.initRiskTooltip.watch()
            this.getUserRadar()
        },
        // 首页滚动事件 app专属入口是否展示
        addFundScroll() {
            // TODO: 需要先判断是否展示app专属入口
            const showFn = debounce(() => {
                this.showHalfCounselor = false
                console.log('showFn')
            }, 1000)
            const fundScrollHandler = () => {
                if (this.closeAppCounselor) return
                this.showHalfCounselor = true
                showFn()
            }

            document.addEventListener('scroll', fundScrollHandler)
            this.$once('hook:beforeDestroy', () => {
                document.removeEventListener('scroll', fundScrollHandler)
            })
        },

        // 白名单内展示理财跟投
        async getIsWhiteList() {
            const features = [
                {
                    key: 'cash',
                    label: this.$t('cashBox'),
                    name: 'cash',
                    link: '/wealth/cashBox.html#/',
                },
                {
                    key: 'cashManage',
                    label: this.$t('cashManage'),
                    name: 'cashManage',
                    link: '/wealth/fund.html#/list?activeTab=mmf',
                },
                {
                    key: 'advancedInvest',
                    label: this.$t('publicFund'),
                    name: 'stockFund',
                    link: '/wealth/fund.html#/list?activeTab=all',
                },
                {
                    key: 'privatePlacement',
                    label: this.$t('privateFund'),
                    name: 'privatePlacement',
                    link: '/wealth/fund.html#/private-list',
                },
                {
                    key: 'bond',
                    label: this.$t('bond'),
                    name: 'bond',
                    link: '/wealth/fund.html#/bond',
                },
                {
                    key: 'insurance',
                    label: this.$t('insurance'),
                    name: 'insurance',
                    link: '/wealth/fund.html#/invest-product/insurance',
                },
                {
                    key: 'alterInvestment',
                    label: this.$t('alterInvestment'),
                    name: 'alterInvestment',
                    link: '/wealth/fund.html#/invest-product/alter-investments',
                },
                {
                    key: 'invest',
                    label: this.$t('fundList.all'),
                    name: 'allServices',
                    link: '/wealth/fund.html#/all-services',
                },
            ]
            try {
                features[1] = {
                    key: 'follow',
                    label: this.$t('follow.combinationTitle'),
                    name: 'follow',
                    link: '/wealth/fund.html#/follow',
                }
            } catch (e) {
                console.log('error', e)
            }
            this.features = features
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
        //千分位显示
        setThousand(num) {
            return thousandsFilter(num)
        },
        goPageLocal(path, params) {
            let query = params
            if (typeof params === 'object') {
                query = Object.entries(params).reduce((str, [k, v]) => {
                    str += `${k}=${v}&`
                    return str
                }, '?')
            }
            let url = ''
            if (!/http(s)?\/\//.test(path)) {
                url = `${location.origin}${location.pathname}#${path}${query}`
            }
            if (this.$jsBridge) {
                return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            }
            this.$router.push({ path, query: params })
        },
        toMorePage(v, id) {
            if (v === 'bond') {
                const path = '/bond'
                const params = {}
                this.goPageLocal(path, params)
                return
            }
            if (v == 5) {
                //基金榜单
                this.$goPage('/strength-page', {
                    isMore: v,
                    id,
                })
            } else {
                this.$goPage('/more-page', {
                    isMore: v,
                })
            }
        },
        // 初始化 证券户和基金户 状态
        initAccountStatus() {
            this.tradeAccount = this.$root.getAccountStatus(FINANCE_ACCOUNT)
            this.fundAccount = this.$root.getAccountStatus(FUND_ACCOUNT)
            this.isInitedTradePwd = !isNeedToSetTrade(this.$store)
            this.judgeFundAccountUpdateStatus()
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
        async getUserRecommendList() {
            try {
                // let params = {start:1,count:3}
                let { result } = (await getUserRecommendList()) || {}
                result = result || {}
                const list = result.list || []
                console.log(list)
            } catch (error) {
                console.error(error)
            }
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
        // getHMS(timestamp) {
        //     return new Date(parseInt(timestamp) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
        // },
        getTempList(length) {
            return Array.from({ length }).map(() => ({}))
        },

        onSwipeChange(index) {
            // debugger //eslint-disable-line
            this.$refs.fundChart[index].init()
        },

        gotoFundDetail(item, type) {
            console.log(`Feng.chen:: 11:31:06 ===> `, item)
            type =
                type ||
                {
                    0: 'public',
                    1: 'private',
                }[item.fundMode]
            if (!(type && item.symbol)) return
            const url = `${location.origin}/wealth/fund.html#/detail?type=${type}&symbol=${item.symbol}`

            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push(`/detail?type=${type}&symbol=${item.symbol}`)
            }
        },
        //跳转至研报详情
        gotoNewsDetail(item) {
            const url = `${location.origin}/pages/informationDetail.html#/?id=${item.id}&type=${encodeURIComponent('研报')}`

            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                window.open(url)
            }
        },

        onFeaturesClick(e, value) {
            const { link, key, label } = e ? e.target.dataset : value
            if (!link) return

            this.$sensorsTrack('FinancialIconClick', {
                button_name: label,
            })
            if (key === 'cash') {
                if (!this.tradeAccount || !this.fundAccount) {
                    // 星财宝未开户(证券账户、理财账户)前置校验
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

            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/protocol',
                    query: {
                        from: 'home',
                    },
                })
            }
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
        //跳转pi年审
        jumpToPI() {
            localStorage.setItem(this.PIkey, true)
            this.showPIDialog = false
            this.showPITooltip = false
            const url = `${pathnames.VUE_APP_PI_APPLY}index?auditType=2`
            this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : (location.href = this.$addCurParamsForUrl(url))
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
         * @param {string} type  cashBox: 星财宝引导，follow：跟投引导
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
                    // 兼容IOS
                    if (!compatIOSLocalStorage()) return
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
        /**
         * @name 完成新手引导
         * @param {string} type  cashBox: 星财宝引导，follow：跟投引导
         */
        async finishGuidehandler(type = '') {
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
            if (!key || !guideFlag) return
            this[guideFlag] = false
            try {
                if (this.$jsBridge) {
                    await this.$jsBridge.writeLocalStorage(key, '1')
                }
            } catch (e) {
                console.error('wealth-home-writeLocalStorage===>error:', e)
            }
        },

        // 点击完成新手指导
        finishGuideAction() {
            if (this.showCashBoxNoobGuide) {
                // step 1: 如果显示星财宝引导
                return this.finishGuidehandler('cashBox')
            }
            if (this.showFollowNoobGuide) {
                // step 2: 如果显示跟投引导
                return this.finishGuidehandler('follow')
            }
        },
        async judgeFundAccountUpdateStatus() {
            try {
                let openWealthMarketAction
                if (getRunEnv() !== 2) {
                    const { result = {} } = await getUserDetail()
                    openWealthMarketAction = result?.clientInfo?.accts?.[0]?.openWealthMarketAction
                }
                // 开通理财产品操作类型： 1：需开通； 2：升级 3：已开通
                const NEED_TO_UPDATE = 2
                this.isToUpdateFundAccount = openWealthMarketAction === NEED_TO_UPDATE
            } catch (error) {
                console.error(error)
            }
        },

        async getUsaBondList() {
            try {
                const { result } = await getUsaBondList({ start: 1, count: 50 })
                console.log('result ===>', result)
                const { longList, shortList } = result || {}
                this.usaBond = [
                    { ...(shortList[0] || {}), comment: this.$t('shortBondComment') },
                    { ...(longList[0] || {}), comment: this.$t('longBondComment') },
                ]
                return
            } catch (e) {
                console.log(e)
            }
        },

        gotoBondDetail(data) {
            this.goPageLocal('/bond-detail', { symbol: data.symbol })
        },

        transform() {
            return this.$t.call(this, ...arguments)
        },

        // 前往专属顾问
        goCounselor() {
            this.$goPage('/', null, { pathname: '/pages/appAdvisor.html' })
        },
        // 隐藏专属顾问链接
        hiddenCounselor() {
            this.$refs.appCounselor.classList.add('app-counselor-hidden')
            const today = dayjs().format('YYYY-MM-DD')
            localStorage.setItem(this.counselorStorageKey, today)
            this.closeAppCounselor = true
        },
    },
}
</script>

<style scoped lang="less">
[data-theme='black'] .van-skeleton__row {
    background-color: #262626;
}

@black: #1f1f1f;
@white: #fff;
@fixedIndex: 1999; // 浮动高度 1990 比 vant 蒙层2000低
.price-color-1 .rise {
    #font_theme() !important;
}

.fund {
    padding: 12px;
    #background();

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

    .account-info {
        #foreground();

        margin-bottom: 12px;
    }

    .important-info {
        display: inline-block;
        margin: 32px 0 12px 50%;
        padding: 8px 14px;
        font-size: 12px;
        line-height: 16px;
        border-radius: 19.5px;
        transform: translateX(-50%);
        #dialog_background();
        #font_h2();
    }

    .fund-relation-compayn-tip {
        margin-top: 12px;
        font-size: 11px;
        line-height: 16px;
        text-align: center;
        #font_h3();
        #iosBottom();

        .company {
            #font_theme();
        }
    }
}

.app-counselor {
    position: fixed;
    right: 8px;
    bottom: 61px;
    z-index: @fixedIndex;
    width: 80px;
    height: 80px;
    transition: all 0.15s linear;

    .counselor-icon {
        position: absolute;
        top: 2px;
        right: 4px;
        width: 14px;
        height: 14px;
    }

    .counselor-bg {
        height: 100%;
        widows: 100%;
    }

    &__text {
        position: absolute;
        bottom: 12px;
        left: 10px;
        color: #212b34;
        font-weight: 500;
        font-size: 10px;
        line-height: 12px;
        text-align: center;
    }
}

.app-counselor-half {
    right: -44px;
    opacity: 0.6;
}

.app-counselor-hidden {
    right: -100px;
    opacity: 0.3;
}
</style>

/* 功能卡片 */
<style lang="less" scoped>
.features {
    position: relative;
    padding: 16px 28px;

    &.card {
        margin-top: 0;
    }

    ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        li {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 32px;

            &:nth-child(4n + 1),
            &:nth-child(4n + 2),
            &:nth-child(4n + 3) {
                margin-right: 50px;
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
</style>

<style lang="less" scoped>
// 新手引导

.z-index-highest {
    z-index: 9999 !important;
}

.features {
    .card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 10px;
    }

    .cash-box-noob {
        img {
            position: absolute;
            top: 60px;
            left: 38px;
            width: 307px;
            height: 66px;
        }

        span {
            position: absolute;
            top: 92px;
            left: 94px;
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            #font_theme();
        }

        &::before {
            position: absolute;
            top: calc(-100vw + 6px);
            left: calc(-100vw + 6px);
            box-sizing: content-box;
            width: 75px;
            height: 75px;
            border-style: solid;
            border-width: 100vw;
            border-radius: 50%;
            content: '';
            #noob_border_color();
        }
    }

    .follow-noob {
        img {
            position: absolute;
            top: 36px;
            left: 31px;
            width: 283px;
            height: 99px;
        }

        span {
            position: absolute;
            top: 101px;
            left: 55px;
            font-weight: 400;
            font-size: 14px;
            line-height: 22px;
            #font_theme();
        }

        &::before {
            position: absolute;
            top: calc(-100vw + 6px);
            left: calc(-100vw + 94px);
            box-sizing: content-box;
            width: 75px;
            height: 75px;
            border-style: solid;
            border-width: 100vw;
            border-radius: 50%;
            content: '';
            #noob_border_color();
        }
    }
}
</style>

<style lang="less" scoped>
.open-account-guide {
    display: flex;
    justify-content: space-between;

    .left {
        margin: 20px 0 16px 12px;

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
            width: 96px;
            height: 64px;
        }
    }
}

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
</style>

/* 热门基金 */
<style lang="less" scoped>
[data-theme='black'] .mask-overlay {
    z-index: 8999;
    background: rgba(0, 0, 0, 0.65);
}

.mask-overlay {
    z-index: 8999;
    background: rgba(0, 0, 0, 0);
}

[data-theme='black'] .hot-fund {
    background: linear-gradient(359.39deg, #181818 77.12%, #27241f 101.12%);
    box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset 0 0.5px 0 #424242;

    .fund-item-header {
        .company {
            color: #a36f33;
        }
    }
}

.hot-fund {
    background: linear-gradient(359.39deg, #fff 77.12%, #fff5ea 101.12%);
    box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset 0.5px -0.5px 0 #fff, inset -0.5px 0.5px 0 #fff;

    .fund-item {
        padding: 16px;

        &-header {
            display: flex;
            align-items: center;

            .tag {
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                height: 16px;
                padding: 0 4px;
                background: linear-gradient(90deg, #ffab07 0%, #ff6b00 104.92%), linear-gradient(86.7deg, #44d2ff -19.89%, #278aff 101.62%),
                    linear-gradient(90deg, #ffab07 0%, #ff6b00 104.92%);
                border-radius: 2px;

                img {
                    width: 7px;
                }

                span {
                    margin-left: 2px;
                    font-weight: 600;
                    font-size: 9px;
                    #button_font();
                }
            }

            .company {
                margin-left: 8px;
                overflow: hidden;
                color: #ff9211;
                font-size: 12px;
                line-height: 16px;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }

        &-body {
            display: flex;
            justify-content: space-between;
            margin-top: 24px;

            .top {
                margin-bottom: 4px;
                font-size: 0;
            }

            .rate {
                display: inline-block;
                color: #1f1f1f;
                font-weight: 700;
                font-size: 26px;
                line-height: 32px;
                vertical-align: bottom;
            }

            .type {
                display: inline-block;
                margin-left: 6px;
                font-size: 12px;
                line-height: 28px;
                vertical-align: bottom;
                #font_h3();
            }

            .fund-title {
                overflow: hidden;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
                white-space: nowrap;
                text-overflow: ellipsis;
                #font_h1();
            }

            .left {
                overflow: hidden;
            }

            .right {
                flex: 0 0 auto;
                width: 124px;
                height: 60px;
                margin-left: 12px;
            }
        }

        &-footer {
            display: block;
            width: 100%;
            margin: 30px 0 16px;
            font-weight: 700;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            border: none;
            border-radius: 28px;
            outline: none;
            #bg_theme();
            #button_font();
        }
    }

    /deep/ .van-swipe {
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
</style>

/* 智能推荐 */
<style lang="less" scoped>
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
</style>

/* 投资进取 */
<style lang="less" scoped>
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
</style>

/* 稳健收益 */
<style lang="less" scoped>
.invest {
    padding: 8px 0 10px;

    h2 {
        margin-bottom: 12px;
        padding: 14px 12px 0;
        overflow: hidden;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;

        #font_h1();
    }

    .fund-item {
        display: inline-block;
        width: 50%;
        padding: 12px;

        &-header {
            .title {
                overflow: hidden;
                font-size: 15px;
                line-height: 21px;
                white-space: nowrap;
                text-overflow: ellipsis;
                #font_h1();
            }
        }

        &-body {
            display: flex;
            justify-content: space-between;
            margin-top: 8px;

            .rate {
                color: #1f1f1f;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

            .type {
                margin-top: 4px;
                color: #9c9c9c;
                font-size: 12px;
                line-height: 16px;
            }

            .left {
                flex: 1 0 auto;
            }

            .right {
                flex: 0 0 auto;
                width: 66px;
                height: 36px;
                margin-left: 6px;
            }
        }
    }
}

.yjbg {
    .no-data {
        padding: 20px;
        text-align: center;
        #font_h3();

        img {
            width: 103px;
            height: 103px;
        }

        p {
            margin-top: 12px;
        }
    }

    .right10 {
        margin-right: 8px;
    }

    .moreBtn {
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        #font_h2();
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
