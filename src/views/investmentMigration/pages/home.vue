<!-- 投资移居主页 -->
<template>
    <div class="investment-migration-pages">
        <!-- 导航栏 -->
        <navigation-bar
            :color="'#0000'"
            :magicColor="'#f9f9f9'"
            :shadePixel="32"
            :placeholder-area="false"
            :scrollTitle="{ enable: true }"
            @updateNaviHeight="v => (naviHeight = v)"
            @back="goBack"
        ></navigation-bar>

        <div class="home-bg" :style="{ 'margin-bottom': `${naviHeight - calcRem(275)}px` }">
            <multi-img name="home_bg" directory="investmentMigration" />
        </div>

        <van-pull-refresh
            v-model="isPullLoading"
            @refresh="requestData"
            style="min-height: 100vh"
            :pulling-text="$t('pullRefresh')"
            :loosing-text="$t('relessRefresh')"
            :loading-text="`${$t('loading')}...`"
        >
            <div class="content">
                <div class="fashion-title">
                    <multi-img name="img_fashion_title" directory="investmentMigration" verifyLang></multi-img>
                    <div class="id-code">
                        <div>{{ tzymAccountInfo?.subAcctId || '' }}</div>
                        <multi-img
                            name="icon_home_copy"
                            directory="investmentMigration"
                            class="copy-btn"
                            :data-clipboard-text="tzymAccountInfo?.subAcctId || ''"
                            @click="copySubAccountId"
                        ></multi-img>
                    </div>
                </div>
                <!-- 账户资产 -->
                <div class="card assets">
                    <div class="bg">
                        <multi-img class="bgImg" name="home_assets_bg" directory="investmentMigration"></multi-img>
                    </div>
                    <asset-total
                        class="total"
                        :asset-msg="$t('theAccount.totalAssets')"
                        :currency="currencyFinal"
                        @choose="currencyChooseHandler"
                        :amount="totalAssetsFinal"
                        :riseFall="false"
                        :sign="false"
                        :showPI="!showPIGuide"
                        @showAssetsHandler="toggleAssets"
                        disableChange
                    ></asset-total>

                    <!-- 买入、卖出待处理 -->
                    <div class="passage-asset-container">
                        <div class="passage-asset" ref="passageAsset" v-show="!isUnfunded">
                            <div class="passage-asset__left">
                                <p class="content pointer" v-show="showAssets">
                                    <span class="content-title">{{ $t('theAccount.transferPendingConfirmation') }}：</span>
                                    <span
                                        class="content-value"
                                        ref="transferPendingConfirmation"
                                        v-riseFall="{
                                            value: transferPendingConfirmation,
                                            rate: false,
                                            thousand: true,
                                            sign: false,
                                            riseFall: false,
                                            normal: true,
                                        }"
                                    ></span>
                                </p>
                                <span class="content pointer" v-show="!showAssets">{{ $t('theAccount.transferPendingConfirmation') }}：****</span>
                            </div>
                        </div>
                        <div class="quick-deposit" v-show="isUnfunded" @click="onSaveCapitalClick">
                            <multi-img class="bg-quick-deposit" name="bg_quick_deposit" directory="investmentMigration"></multi-img>
                            <div class="content">
                                <span class="value">{{ $t('theAccount.quickDeposit') }}</span>
                                <multi-img class="arrow" name="icon_arrow_right" directory="investmentMigration"></multi-img>
                            </div>
                        </div>
                    </div>
                    <!-- 收益 -->
                    <div class="earnings">
                        <!-- 持有收益 -->
                        <div class="item">
                            <span class="tit">{{ $t('theAccount.holdingGains') }}</span>
                            <span class="radio">
                                <strong v-show="showAssets" class="xcbrise">
                                    <span v-riseFall="{ value: latestIncome, rate: false, thousand: true, normal: false }"></span>
                                </strong>
                                <strong v-show="!showAssets" class="hide">****</strong>
                            </span>
                        </div>
                        <!-- 累计收益 -->
                        <div class="item">
                            <span class="tit">{{ $t('theAccount.cumulativeReturns') }}</span>
                            <span class="radio">
                                <strong
                                    v-show="showAssets"
                                    class="xcbrise"
                                    v-riseFall="{ value: cumulativeReturns, rate: false, thousand: true, normal: false }"
                                ></strong>
                                <strong v-show="!showAssets" class="hide">****</strong>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 认证、权限相关 -->
                <div class="guide-list-card" v-if="showGuide">
                    <div class="title">{{ $t('guide.title') }}</div>
                    <div class="guide">
                        <template v-for="(item, index) in guideList">
                            <guide-card
                                v-show="item.visble"
                                :icon="item.icon"
                                :title="item.title"
                                :content="item.content"
                                :btnText="item.btnText"
                                @button-click="handleGuide(item.name)"
                                :key="index"
                            />
                        </template>
                    </div>
                </div>

                <!-- 金刚区 -->
                <div class="card features" v-show="isDepositPendingConfirmation || isFundsDeposited">
                    <ul @click="onFeaturesClick">
                        <template v-for="item in features.slice(0, 3)">
                            <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                                <multi-img :name="item.imgName" class="icon" :directory="item.imgDirectory"></multi-img>
                                <label class="text">{{ item.label }}</label>
                            </li>
                        </template>
                    </ul>
                </div>

                <!-- 投资组合 -->
                <div class="investment-portfolio" v-show="!showGuide">
                    <div class="title">{{ investmentPortfolioTitle }}</div>
                    <!-- 未入金情况下，投资组合只展示简介 -->
                    <div v-if="isUnfunded">
                        <div
                            class="card-info"
                            v-for="item in infoList"
                            :key="item.portfolioId"
                            @click="gotoFollowDetail(item.portfolioId, { goStatic: true, brief: item.brief, avatarOSSID: item.avatarOSSID })"
                        >
                            <masterTopInfoView :info="item" isStatic :label="item.label" isInvestmentMigration />
                            <div class="combination">
                                <div class="top">
                                    <div class="flex-c">
                                        <span class="group-name">{{ item.portfolioName }}</span>
                                        <portfolio-tag class="tag" :portfolioType="item.portfolioType"></portfolio-tag>
                                        <portfolio-tag class="tag" :text="riskRatingMap[item.risk || 1]"></portfolio-tag>
                                        <portfolio-tag v-if="item.CIES" class="tag" :text="'CIES'"></portfolio-tag>
                                    </div>
                                    <remainingDayFollower
                                        class="mar-t8"
                                        :showFollower="false"
                                        :margin-style="'12px'"
                                        :remainingDay="item.foundDayNum"
                                    />
                                </div>
                                <div class="rate-info">
                                    <p class="income" v-riseFall="{ value: item.week1Return || 0, base: 2, rate: true }"></p>
                                    <p class="income-text">{{ 'w1' | profitTitleFilter }}</p>
                                </div>
                                <div v-if="!!item.portfolioBrief" class="brief mar-t12">
                                    <portfolioBrief
                                        :text="item.portfolioBrief"
                                        :bold-text="$t('investmentPortfolio.brief')"
                                        @onClick="showBriefDialog(item)"
                                    ></portfolioBrief>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 入金待确认情况下展示金额，但不展示操作按钮，已入金的情况才展示操作按钮 -->
                    <div class="item-list" v-if="isDepositPendingConfirmation || isFundsDeposited">
                        <div class="item" v-for="consultant in consultantList" :key="consultant.uin">
                            <masterTopInfoView class="mar-b16" :info="consultant" hiddenSkilled isInvestmentMigration></masterTopInfoView>

                            <div
                                class="group-info"
                                v-for="(portfolio, index) in consultant.portfolioList"
                                :key="portfolio.portfolioID + index"
                                ref="groupRefs"
                            >
                                <div class="group-info-title">
                                    <span>{{ portfolio.portfolioName }}</span>
                                    <portfolioTag :portfolioType="portfolio.portfolioType" :tagObj="tagObj"></portfolioTag>
                                </div>
                                <div class="group-info-details between">
                                    <div class="group-info-item width-equal" v-show="followStatus.normal.includes(portfolio.followerStatus)">
                                        <div class="item-title">{{ $t('holdlingAmount') }}</div>
                                        <div
                                            class="item-value bold"
                                            v-riseFall="{
                                                value: portfolio.assetInfo[`Assets${currencyFinal}`],
                                                normal: false,
                                                hide: !showAssets,
                                                sign: false,
                                                riseFall: false,
                                                rate: false,
                                                hideObj: { text: '*****', color: '#2F2F2F' },
                                            }"
                                            :class="assetColorClass(portfolio.assetInfo[`Assets${currencyFinal}`])"
                                        ></div>
                                    </div>
                                    <div class="group-info-item width-equal" v-show="followStatus.normal.includes(portfolio.followerStatus)">
                                        <div class="item-title text-align-center">
                                            {{ $t('holdProfit') }}
                                        </div>
                                        <div
                                            class="item-value text-align-center bold"
                                            v-riseFall="{
                                                value: portfolio.assetInfo[`profitLoss${currencyFinal}`],
                                                normal: false,
                                                hide: !showAssets,
                                                rate: false,
                                                hideObj: { text: '*****', color: '#2F2F2F' },
                                            }"
                                        ></div>
                                    </div>
                                    <div class="group-info-item width-equal" v-show="followStatus.normal.includes(portfolio.followerStatus)">
                                        <div class="item-title text-align-right">{{ $t('holdProfitRate') }}</div>
                                        <div
                                            class="item-rate text-align-right bold"
                                            v-riseFall="{
                                                value: portfolio.assetInfo.profitLossRate,
                                                normal: false,
                                                hide: !showAssets,
                                                hideObj: { text: '*****', color: '#2F2F2F' },
                                            }"
                                        ></div>
                                    </div>
                                    <div class="group-info-item flex-c width-auto" v-show="!followStatus.normal.includes(portfolio.followerStatus)">
                                        <div
                                            class="item-value bold"
                                            v-riseFall="{
                                                value: portfolio[`applyAmount${currencyFinal}`],
                                                normal: false,
                                                hide: !showAssets,
                                                sign: false,
                                                riseFall: false,
                                                rate: false,
                                                hideObj: { text: '*****', color: '#2F2F2F' },
                                            }"
                                        ></div>
                                        <div class="item-title mar-14 mar-b-0">
                                            {{ $t('investAdvisory.applyAmount') }}
                                        </div>
                                    </div>
                                    <div class="group-info-item flex-c width-auto" v-show="!followStatus.normal.includes(portfolio.followerStatus)">
                                        <span class="item-title mar-b-0">
                                            {{ $t('investAdvisory.applyStatus') }}:
                                            <span :class="{ 'text-red': followStatus.failure.includes(portfolio.followerStatus) }">
                                                {{ portfolio.followerStatus | groupStatusFilter }}
                                            </span>
                                        </span>

                                        <multi-img class="next-arrow" name="right_arrow_10" directory="common" width="10" height="10" />
                                    </div>
                                </div>
                                <!-- 操作菜单栏 -->
                                <ul
                                    v-if="isFundsDeposited"
                                    class="function-entry border-top-1px"
                                    @click.stop="onFunctionEntryClick($event, portfolio)"
                                >
                                    <!-- <li class="entry mask" data-type="0">
                                    <multi-img name="icon_portfolio_rebalancing" directory="fund/follow" />
                                    <span>{{ $t('investAdvisory.portfolioRebalancing') }}</span>
                                </li> -->
                                    <li class="entry mask" data-type="1">
                                        <multi-img name="icon_position_details" directory="fund/follow" />
                                        <span>{{ $t('investAdvisory.positionDetails') }}</span>
                                    </li>
                                    <li class="entry mask" data-type="2">
                                        <multi-img name="icon_trade_jilu" directory="fund/follow" />
                                        <span>{{ $t('investAdvisory.orderRecord') }}</span>
                                    </li>
                                    <li class="entry mask" data-type="3">
                                        <multi-img name="icon_income_details" directory="fund/follow" />
                                        <span>{{ $t('investAdvisory.incomeDetail') }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="footer">
                <FooterAdvisors :iconName="'icon_kefu'" :text="$t('consultAdvisor')" :style="{ margin: 0 }"></FooterAdvisors>
                <div class="company-tip" v-html="$t('stockRelationCompanyTip')"></div>
            </div>
        </van-pull-refresh>
    </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue'
import AssetTotal from '../components/AssetTotal.vue'
import GuideCard from '../components/GuideCard.vue'
import QuickEntrance from '../components/QuickEntrance.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import Clipboard from 'clipboard'

import { assetsDetail, cashAllocateInfo, staticRecommendBreif } from '@/apis/investmentMigration'
import { UserRiskInfo } from '@/apis/riskAssessment'
import { mapState, mapGetters } from 'vuex'
import { getLangType, calcRem, isHLApp } from '@/utils/tools'
import { WEALTH_AMOUNT_STATUS_kEY } from '@/config/common.js'
import { getValueFromLocalStorage, isInRyH5, getProfessionalStatus } from '@/utils'
import { currencyMap } from '@/config/common'
import pathnames from '@/config/H5Pathname.js'
import { thousandsFilter } from '@/config/filters.js'
import { OPEN_DERIVATIVE } from '@/config/common'
import { dynamicFontSize, composeParams } from '@/utils'
import { guideNameMap } from '../config/common'
import FooterAdvisors from '@/components/FooterAdvisors.vue'
import { showVirturlAssetDialog } from '../utils/dialogUtils'
import { features } from '../config/index'
import gotoFollowDetailsMixin from '@/views/fund/follow/mixins/gotoFollowDetailsMixin'
import masterTopInfoView from '@/views/fund/follow/components/masterTopInfoView.vue'
import remainingDayFollower from '@/views/fund/follow/components/remainingDayFollower.vue'
import portfolioTag from '@/views/fund/follow/components/portfolioTag.vue'
import portfolioBrief from '@/views/fund/follow/components/portfolioBrief.vue'
import { profitTitleFilter } from '@/views/fund/follow/utils/filters'
import { RISK_RATING_MAP } from '@/views/fund/config/common.js'
import { cloneDeep } from 'lodash'
import { isFunction } from '@fs/utils'

const riskRatingMap = RISK_RATING_MAP.keyValueMap

const currencyKeysMap = currencyMap.keysMap

// 1: 未提交开户 2: 开户中 3：跟投中 4: 已取消跟投 5: 开户失败
const followStatus = {
    opening: [2],
    normal: [3, 4],
    failure: [5, 7],
}
const priority = { 3: 10, 4: 9 }
export default {
    name: 'investmentMigrationHome',
    mixins: [platformDifferenceMixin, watchPageVisibleMixin, gotoFollowDetailsMixin],
    components: {
        NavigationBar,
        AssetTotal,
        GuideCard,
        QuickEntrance,
        FooterAdvisors,
        masterTopInfoView,
        remainingDayFollower,
        portfolioTag,
        portfolioBrief,
    },
    data() {
        return {
            naviHeight: 0,
            showAssets: true,
            userInfo: {},
            costPriceType: 0,
            ignoreZero: false,
            currencyFinal: 'HKD', //当前币种
            totalAsset: {},
            depositFunds: {
                icon: {
                    name: 'icon_ym_cunqian',
                    directory: 'investmentMigration',
                },
                name: this.$t('entrance.depositFunds'),
            },
            features,
            riskRatingMap,
            consultantList: [],
            tagObj: { 1: this.$t('follow.stockName'), 2: this.$t('publicFund'), 3: this.$t('bond'), 4: this.$t('mixed') },
            followStatus,
            loadAssetsError: false,
            isPullLoading: false,
            isRequestingAllocate: false,
            isRequestingDetail: false,
            cashAllocateInfo: {},
            infoList: [],
            userRiskInfo: {},
            initData: false,
        }
    },
    async created() {
        const cb = () => {
            this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            if (this.$jsBridge) {
                this.$jsBridge.getAssetsShowStatus().then(data => {
                    this.showAssets = data
                })
            } else if (isInRyH5()) {
                this.showAssets = this.showAsset
            } else {
                this.showAssets = getValueFromLocalStorage(WEALTH_AMOUNT_STATUS_kEY, true, true)
                localStorage.setItem(WEALTH_AMOUNT_STATUS_kEY, this.showAssets)
            }
            if (this.userInfo.clientSetting) {
                try {
                    const clientSetting = JSON.parse(this.userInfo.clientSetting)
                    this.ignoreZero = !(clientSetting?.stockShowingClearance ?? false)
                    this.costPriceType = clientSetting?.costPriceType ?? 0
                } catch (error) {
                    console.log(error)
                }
            }
            const delay = this.initData ? 1000 : 0
            setTimeout(() => {
                this.requestData()
            }, delay)
        }
        cb()
        this.watch(cb)
    },
    computed: {
        ...mapState('user', ['showAsset', 'accts']),
        ...mapGetters({
            tzymAccountInfo: 'user/getTzymAccountInfo',
            etfIpoQuestionnaireStatusInfo: 'user/getEtfIpoQuestionnaireStatusInfo',
        }),
        isInHLAPP() {
            return isHLApp()
        },
        iconEye() {
            return this.showAssets ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
        // 专业投资者引导
        showPIGuide() {
            return !getProfessionalStatus(this.accts?.professionalType)
        },
        // 衍生品权限引导
        showDerivativesGuide() {
            return !(this.accts?.openDerivative === OPEN_DERIVATIVE)
        },
        // 虚拟资产评估引导
        showVirtualAssetAssessGuide() {
            return this.etfIpoQuestionnaireStatusInfo?.status === 0
        },
        // 虚拟资产重新评估引导
        showVirtualAssetReassessGuide() {
            return this.etfIpoQuestionnaireStatusInfo?.status === 2
        },
        showGuide() {
            return this.showPIGuide || this.showDerivativesGuide || this.showVirtualAssetAssessGuide || this.showVirtualAssetReassessGuide
        },
        hasRefuseRecord() {
            return this.cashAllocateInfo?.hasRefuseRecord === true
        },
        // 未入金，不存在认证引导时，已完成转入记录->否，待转入金额不存在或等于0
        isUnfunded() {
            return (
                !this.showGuide &&
                this.cashAllocateInfo?.hasCompleteRecord === false &&
                !this.hasRefuseRecord &&
                !this.isValid(this.cashAllocateInfo?.inProgressTransferIn, false)
            )
        },
        // 入金待确认，不存在认证引导时，已完成转入记录->否，待转入金额大于0
        isDepositPendingConfirmation() {
            if (!this.showGuide) {
                if (this.hasRefuseRecord) {
                    return true
                } else if (this.cashAllocateInfo?.hasCompleteRecord === false && this.isValid(this.cashAllocateInfo?.inProgressTransferIn, false)) {
                    const value = parseFloat(this.cashAllocateInfo?.inProgressTransferIn)
                    return !isNaN(value) && value > 0
                }
            }

            return false
        },
        // 已入金，不存在认证引导时，已完成转入记录->是
        isFundsDeposited() {
            return !this.showGuide && this.cashAllocateInfo?.hasCompleteRecord === true
        },
        investmentPortfolioTitle() {
            return this.isUnfunded ? this.$t('investmentPortfolio.titleQuickDeposit') : this.$t('investmentPortfolio.title')
        },
        guideList() {
            return [
                {
                    name: guideNameMap.PI,
                    visble: this.showPIGuide,
                    icon: {
                        name: 'icon_ym_pi',
                        directory: 'investmentMigration',
                    },
                    title: this.$t('guide.piTitle'),
                    content: this.$t('guide.piContent'),
                    btnText: this.$t('guide.piBtn'),
                },
                {
                    name: guideNameMap.DERIVATIVES,
                    visble: this.showDerivativesGuide,
                    icon: {
                        name: 'icon_ym_qx',
                        directory: 'investmentMigration',
                    },
                    title: this.$t('guide.derivativesTitle'),
                    content: this.$t('guide.derivativesContent'),
                    btnText: this.$t('guide.derivativesBtn'),
                },
                {
                    name: guideNameMap.VIRTUAL_ASSET,
                    visble: this.showVirtualAssetAssessGuide,
                    icon: {
                        name: 'icon_ym_qx',
                        directory: 'investmentMigration',
                    },
                    title: this.$t('guide.virtualAssetTitle'),
                    content: this.$t('guide.virtualAssetAssessContent'),
                    btnText: this.$t('guide.virtualAssetAssessBtn'),
                },
                {
                    name: guideNameMap.VIRTUAL_ASSET,
                    visble: this.showVirtualAssetReassessGuide,
                    icon: {
                        name: 'icon_ym_qx',
                        directory: 'investmentMigration',
                    },
                    title: this.$t('guide.virtualAssetTitle'),
                    content: this.$t('guide.virtualAssetReassessContent'),
                    btnText: this.$t('guide.virtualAssetReassessBtn'),
                },
            ]
        },
        //总资产
        totalAssetsFinal() {
            const totalAssets = this.totalAsset?.totalAssetsHKD ? this.validText(this.totalAsset?.totalAssetsHKD) : '--'
            return totalAssets
            // return '632548.62'
        },
        // 持有收益
        latestIncome() {
            const totalProfitLoss = this.totalAsset.profitLossHKD ? this.validText(this.totalAsset.profitLossHKD) : '--'
            return totalProfitLoss
            // return '513622.32'
        },
        // 累计收益
        cumulativeReturns() {
            const accumProfitLoss = this.totalAsset.accumulatedProfitLossHKD ? this.validText(this.totalAsset.accumulatedProfitLossHKD) : '--'
            return accumProfitLoss
            // return '78962541.36'
        },
        transferPendingConfirmation() {
            return this.cashAllocateInfo?.inProgressTransferIn || '--'
        },
        requestCompleted() {
            return !this.isRequestingAllocate && !this.isRequestingDetail
        },
    },
    mounted() {},
    watch: {
        showAssets() {
            this.resetFontSize()
        },
        transferPendingConfirmation() {
            this.resetFontSize()
        },
        requestCompleted(newValue, oldValue) {
            console.log('requestCompleted changed from', oldValue, 'to', newValue)
            if (newValue !== oldValue && newValue) {
                this.isPullLoading = false
            }
        },
    },
    methods: {
        // 选择币种
        async currencyChooseHandler(currency) {
            this.currencyFinal = currency
            //await this.getECashAssetsDetail()
        },
        toggleAssets(v) {
            this.showAssets = v
        },
        requestData() {
            if (!this.initData) {
                this.initData = true
                this.getStaticRecommendBreif()
            }
            this.getCashAllocateInfo()
            this.getAssetsDetail()
            this.getUserRiskInfo({ forceRefresh: true })
            this.$store.dispatch('user/getUserInfo', { toLogin: false, isRefresh: true })
            this.$store.dispatch('user/getEtfIpoQuestionnaireStatus', true)
        },
        async getUserRiskInfo({ subAcctId = this.$store.getters['user/getSubAccountId'], forceRefresh = false } = {}) {
            try {
                if (!forceRefresh) {
                    let info = null
                    if ((info = this.userRiskInfo)) return info
                }
                const ops = { params: { subAcctId } }
                const { result } = await UserRiskInfo(ops)
                this.userRiskInfo = result
            } catch (e) {
                console.error(e)
            }
        },
        async getCashAllocateInfo() {
            if (this.isRequestingAllocate) {
                this.isPullLoading = false
                return
            }
            this.isRequestingAllocate = true
            try {
                const subAccountID = this.accts?.subAcctId || ''
                const queryAccountID = this.tzymAccountInfo?.subAcctId || ''
                const { result = {} } = await cashAllocateInfo({
                    subAccountID,
                    queryAccountID,
                })
                if (result) {
                    this.cashAllocateInfo = result
                    if (this.isUnfunded) {
                        this.getStaticRecommendBreif()
                    }
                }
            } catch (e) {
                console.log('getCashAllocateInfo error =>', e)
            } finally {
                this.isRequestingAllocate = false
            }
        },
        async getStaticRecommendBreif() {
            try {
                const { result } = (await staticRecommendBreif({ count: 20, start: 0 })) || {}
                this.infoList = result.portfolioList || []
            } catch (e) {
                console.log('getStaticRecommendBreif error =>', e)
            }
        },
        // 资产及入金后展示的投资组合列表
        async getAssetsDetail() {
            if (this.isRequestingDetail) {
                this.isPullLoading = false
                return
            }
            this.isRequestingDetail = true
            try {
                const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
                const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
                let { result = {} } = await assetsDetail({
                    subAccountID: subAcctId,
                    assetsType: 14,
                })
                result = result || {}
                let needShowNoobGuide = false
                this.totalAsset = result.totalAsset || {}
                const portfolioMap = {}
                this.portfolioCount = result.portfolioList?.length || 0
                result.portfolioList?.forEach(item => {
                    if (!portfolioMap[item.consultantHlID]) {
                        portfolioMap[item.consultantHlID] = { list: [], hasNormal: false }
                    }
                    item.assetInfo = item.assetInfo || {}
                    const map = cloneDeep(portfolioMap[item.consultantHlID])

                    map.hasNormal = map.hasNormal || followStatus.normal.includes(item.followerStatus)
                    needShowNoobGuide = needShowNoobGuide || map.hasNormal
                    map.list.push(item)
                    // 保证优先级排序
                    map.list.sort((a, b) => {
                        return (priority[b.followerStatus] || b.followerStatus) - (priority[a.followerStatus] || a.followerStatus) // 按优先级降序
                    })
                    portfolioMap[item.consultantHlID] = map
                })

                this.consultantList = []
                Object.keys(result.consultantList || {}).forEach(key => {
                    const item = result.consultantList[key]
                    item.uin = item.consultantUin
                    item.nickName = item.consultantNick
                    item.portfolioList = portfolioMap[key].list
                    item.hasNormal = portfolioMap[key].hasNormal
                    this.consultantList.push(item)
                })
                // 将有 normal状态 跟投的信息放在上面
                this.consultantList.sort((a, b) => {
                    if (a.hasNormal && b.hasNormal) {
                        return 0
                    }

                    if (a.hasNormal || b.hasNormal) {
                        return a.hasNormal ? -1 : 1
                    }
                    return 0
                })
                this.loadAssetsError = false
            } catch (e) {
                console.error('investAdvisoryAsset error', e)
            } finally {
                this.isRequestingDetail = false
            }
        },
        calcRem(v) {
            return calcRem(document, v)
        },
        goBack() {
            this.backPreviousPage()
        },
        // 复制证券账户
        copySubAccountId() {
            const clipboard = new Clipboard('.copy-btn')
            clipboard.on('success', () => {
                this.$toast(this.$t('copySuccess'))
                clipboard.destroy()
            })
            clipboard.on('error', () => {
                clipboard.destroy()
            })
        },
        // 切换显示隐藏隐私
        triggerHandler() {
            this.showAssets = !this.showAssets
            if (this.$jsBridge) {
                this.$jsBridge.setAssetsShowStatus({ showAssets: this.showAssets })
            } else if (isInRyH5()) {
                // 睿银项目中，更改显示与隐藏状态
                this.$store.commit('user/updateShowAsset', this.showAssets)
            } else {
                localStorage.setItem(WEALTH_AMOUNT_STATUS_kEY, this.showAssets)
            }
        },
        onSaveCapitalClick() {
            if (this.isMatchDeposit()) {
                const query = `langType=${getLangType()}&allocationType=investmentImmigration`
                const origin = process.env.NODE_ENV === 'development' ? 'https://sit.mfosunhani.com' : location.origin
                const url = `${origin}${'/edda_app/fundAllocation/'}?${query}`
                this.goPageWithH5(url)
            } else {
                this.showNoMatchDialog()
            }
        },
        handleGuide(name) {
            switch (name) {
                // 跳转PI认证页面
                case guideNameMap.PI:
                    this.goPageWithH5(pathnames.VUE_APP_PI_APPLY)
                    break
                // 跳转衍生品页面
                case guideNameMap.DERIVATIVES:
                    this.goPageWithH5(pathnames.VUE_APP_DERIVATIVE_PAGE)
                    break
                case guideNameMap.VIRTUAL_ASSET:
                    this.handleVirturlAsset()
                    break
            }
        },
        handleVirturlAsset() {
            const remainingTimes = this.etfIpoQuestionnaireStatusInfo?.remainingTimes ?? 0
            if (remainingTimes > 0) {
                const url = `${pathnames.VUE_APP_ETF_QUESTION}?cltId=${this.accts?.cltId}`
                this.goPageWithH5(url)
            } else {
                showVirturlAssetDialog(this)
            }
        },
        goPageWithH5(url, title = '') {
            if (this.$openPageInThs(url.replace(/http(s)?/, 'https'))) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title })
            } else {
                location.href = this.$addCurParamsForUrl(url)
            }
        },
        validText(value) {
            return this.isValid(value) ? value : '--'
        },
        resetFontSize() {
            this.$nextTick(() => {
                if (this.showAssets) {
                    if (this.transferPendingConfirmation) {
                        dynamicFontSize({ dom: 'transferPendingConfirmation', minFontSize: 9, context: this })
                    }
                }
            })
        },
        // 功能区跳转
        onFeaturesClick(e, value) {
            const { link, key } = e ? e.target.dataset : value
            if (!link) return

            if (key === 'deposit') {
                this.onSaveCapitalClick()
                return
            }

            const goURL = () => {
                const list = ['capitalRecord']
                if (!list.includes(key)) {
                    return undefined
                }
                const origin = process.env.NODE_ENV === 'development' ? 'https://sit.mfosunhani.com' : location.origin
                return `${origin}${link}`
            }

            const url = goURL() || `${origin}${link}`
            this.goPageWithH5(url)
        },
        showBriefDialog(item) {
            this.$dialog.alert({
                closeOnClickOverlay: true,
                title: this.$t('investmentPortfolio.brief').replace(/：|:/g, ''),
                message: item.portfolioBrief,
                messageAlign: 'left',
                confirmButtonText: this.$t('confirm'),
            })
        },
        onClickGroup(portfolio) {
            if (!followStatus.normal.includes(portfolio.followerStatus)) {
                const { VUE_APP_INVESTMENT_V2_OPEN_ACCOUNT_PAGE: page_url } = pathnames
                const url = `${page_url}?productId=${portfolio.portfolioID}&portfolioId=${portfolio.relatedID}`
                // this.$goPage(url)
                this.goPageWithH5(url)
            }
        },
        onFunctionEntryClick(e, portfolio) {
            const { type } = e.target.dataset || {}
            if (!type) return
            const commonParam = {
                tgID: portfolio.portfolioID, // 投顾ID
                tgAccID: portfolio.subAccountID,
                currency: this.currencyFinal,
                isInvestmentMigration: 1,
            }
            const gotoOrderRecordPage = () => {
                const params = {
                    type: 0,
                    ...commonParam,
                }
                this.$goPage('/invest-advisory/order-records', { ...params }, { pathname: '/wealth/fund.html' })
            }

            const gotoProfitLossDetailPage = () => {
                this.$goPage('/invest-advisory/profit-loss-details', { ...commonParam }, { pathname: '/wealth/fund.html' })
            }

            const gotoPlaceOrderPage = () => {
                this.$goPage('/invest-advisory/portfolio-place-order', { ...commonParam }, { pathname: '/wealth/fund.html' })
            }

            const map = {
                0: gotoPlaceOrderPage,
                1: () => {
                    this.$goPage('/invest-advisory/holding-detail', { ...commonParam }, { pathname: '/wealth/fund.html' })
                },
                2: gotoOrderRecordPage,
                3: gotoProfitLossDetailPage,
            }
            if (isFunction(map[type])) {
                map[type]()
            }
        },
        showNoMatchDialog() {
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
                    cancelButtonText: this.$t('cancelDeposit'),
                    className: 'init-btn-dialog',
                    // getContainer: '.footer-content',
                })
                .then(() => {
                    const params = [
                        ['user', 1],
                        ['virtualAssetKnowledge', this.etfIpoQuestionnaireStatusInfo?.status],
                    ]
                    const queyrString = composeParams(params)
                    if (this.$jsBridge) {
                        const url = `${location.origin}/wealth/investmentMigration.html#/no-matched-risk${queyrString}`
                        this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                    } else {
                        this.$router.push(`/no-matched-risk${queyrString}`)
                    }
                })
        },
        isValid(value, ignoreZero = true) {
            if (ignoreZero) {
                return value !== undefined && value !== null && value !== ''
            }
            return value !== undefined && value !== null && value !== '' && value != 0
        },
        isMatchDeposit() {
            return (
                !this.showPIGuide &&
                !this.showDerivativesGuide &&
                this.etfIpoQuestionnaireStatusInfo?.status === 1 &&
                this.userRiskInfo?.riskLevel === 5 &&
                this.userRiskInfo?.investmentExperience >= 3
            )
        },
        assetColorClass(asset) {
            if (asset > 0) {
                return 'asset-normal' // 正值时的颜色
            }

            return 'asset-flat' // 零值时的颜色
        },
    },
    filters: {
        thousandsFilter(num) {
            return num ? `${thousandsFilter(num)}` : '--'
        },
        profitTitleFilter,
        groupStatusFilter(v) {
            if (followStatus.opening.includes(v)) {
                return this.$t('investAdvisory.shenhezhong')
            } else if (followStatus.failure.includes(v)) {
                return this.$t('investAdvisory.rejected')
            }
            return ''
        },
    },
}
</script>

<style scoped lang="less">
.investment-migration-pages {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100vh;
    padding-bottom: 58px;
    background-color: #f9f9f9;
}

.home-bg {
    position: relative;
    z-index: 0;
    width: 100vw;
    height: 275px;
}

.content {
    position: relative;
    z-index: 1;
    flex: 1;
}

.footer {
    padding-top: 20px;

    .company-tip {
        width: 100%;
        margin-top: 24px;
        color: #bfbfbf;
        font-size: 11px;
        line-height: 16px;
        text-align: center;

        ::v-deep .highlight {
            color: #ff6907;
        }
    }
}

.fashion-title {
    display: flex;
    justify-content: space-between;
    height: 46px;
    padding: 8px 14px 0;

    img {
        height: 28px;
    }

    .id-code {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 24px;
        padding: 2px 2px 2px 4px;
        color: #623111;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        background: linear-gradient(269.44deg, #ffe8cd -0.55%, #ffd3b5 105.87%);
        border-radius: 12px 12px 12px 0;

        .copy-btn {
            width: 20px;
            height: 20px;
            margin-left: 4px;
        }
    }
}

.card {
    background-color: #fff;
    border-radius: 8px;

    + .card {
        margin-top: 12px;
    }
}

.btn {
    flex-shrink: 0;
    width: 80px;
    height: 28px;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    line-height: 28px;
    text-align: center;
    background: #ff6907;
    border-radius: 14px;
}
</style>
<!-- 账户概览 -->
<style scoped lang="less">
.assets {
    position: relative;
    width: calc(100% - 24px);
    margin: 0 12px;
    padding: 24px 0 16px;
    // background: linear-gradient(180deg, #fff8f3 0%, #fff 100%);

    .bg {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 0;

        .bgImg {
            width: 100%;
            height: 100%;
        }
    }

    ::v-deep .asset-total {
        position: relative;
        padding: 0;
        background-color: transparent;
    }

    .total {
        padding: 0 12px;

        ::v-deep(h3) {
            span {
                font-weight: 700;
                font-size: 30px;
                line-height: 42px;
            }
        }
    }

    .assets-value {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 10px;
        color: @h1-white;
        font-weight: bold;
        font-size: 30px;
        line-height: 38px;

        img {
            width: 12px;
            height: 12px;
        }
    }

    .profit-loss {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;

        .pl-item {
            flex: 1;
            color: @h2-white;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;

            .value {
                margin-top: 4px;
                font-weight: bold;
                font-size: 14px;
                line-height: 20px;
            }
        }
    }

    .passage-asset-container {
        position: relative;
        display: flex;
        justify-content: center;
        width: calc(100% - 24px);
        margin: 0 12px 16px;

        .passage-asset {
            display: flex;
            align-items: center;
            margin-top: 10px;
            // flex: 0 0 auto;
            padding: 4px 12px;
            color: @fontLightColor;
            font-size: 12px;
            line-height: 16px;
            background: linear-gradient(106deg, rgba(255, 141, 7, 0.09) 0%, rgba(255, 111, 7, 0.05) 100%);
            border-radius: 29px;

            &::after {
                position: absolute;
                top: 10px;
                left: 50%;
                width: 0;
                height: 0;
                border-right: 6px solid;
                border-right-color: transparent;
                border-bottom: 8px solid;
                border-bottom-color: #fff3e6;
                border-left: 6px solid;
                border-left-color: transparent;
                transform: translate(-50%, -100%);
                content: '';
            }

            &__left,
            &__right {
                width: auto;
            }

            &__right {
                margin-left: 16px;
            }

            .content {
                display: flex;
                flex: 1 0 auto;
                align-items: center;

                .content-title {
                    flex: 0 0 auto;
                }

                .content-value {
                    align-items: center;
                    width: auto;
                    overflow: hidden;
                    font-weight: bold;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }

        .quick-deposit {
            position: relative;
            width: auto;
            height: 38px;
            margin-top: 4px;
            padding: 0 20.5px 0 21.5px;

            .bg-quick-deposit {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                z-index: 0;
                width: 100%;
                height: 38px;
            }

            .content {
                position: relative;
                display: flex;
                align-items: center;
                height: 100%;
                padding-top: 6px;

                .value {
                    color: #fff;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 20px;
                }

                .arrow {
                    width: 12px;
                    height: 12px;
                    margin-left: 4px;
                }
            }
        }
    }

    .earnings {
        position: relative;
        display: flex;
        justify-content: space-between;
        height: 40px;
        padding: 0 12px;
        font-size: 12px;
        line-height: 17px;

        .item {
            position: relative;
            display: flex;
            flex: 1; /* 让子元素平分父元素的宽度 */
            flex-direction: column;
            align-items: center; /* 让内容垂直居中对齐 */
            justify-content: center; /* 水平居中对齐 */
            text-align: center;

            .tit {
                margin-bottom: 4px;
                color: @fontLightColor;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }

            span {
                color: @fontGreyColor;
                line-height: 17px;
            }

            .radio {
                height: 20px;
                font-weight: 500;
                font-size: 14px;
                line-height: 20px;

                .xcbrise {
                    font-size: 14px;
                }

                .hide {
                    color: @fontLightColor;
                }

                .no-return {
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                }
            }
        }

        .item:nth-of-type(1) {
            left: 0;
            z-index: 10;
            text-align: left;
        }

        .item:nth-of-type(2) {
            right: 0;
            text-align: right;
        }
    }
}

.guide-list-card {
    position: relative;
    margin: 16px 12px 0;

    .title {
        display: flex;
        align-items: center;
        height: 28px;
        color: @fontLightColor;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }

    .guide > * {
        margin-top: 12px;
    }
}
</style>
<!-- 金刚区 功能卡片 -->
<style scoped lang="less">
.features {
    width: 100%;
    margin-top: 16px;
    padding: 0 12px;
    background-color: #f9f9f9;

    ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        li {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 110px;
            height: 36px;
            background-color: #fff;
            border-radius: 18px;
            #border_all_1px(#EBEBEB, 18px);

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
                width: 20px;
                height: 20px;
                margin-right: 6px;
            }

            .text {
                font-size: 14px;
                line-height: 20px;
            }
        }
    }

    ul:nth-child(2) {
        margin-top: 12px;
    }
}
</style>
<!-- 投资组合 -->
<style scoped lang="less">
.investment-portfolio {
    margin-top: 16px;
    padding: 0 12px;

    .title {
        display: flex;
        align-items: center;
        height: 36px;
        color: @fontBlackColor;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
    }

    .card-info {
        position: relative;
        z-index: 2;
        margin-top: 12px;
        padding: 16px 12px;
        background-color: #fff;
        border-radius: 8px;

        // 组合信息
        .combination {
            margin-top: 12px;
            padding: 16px 12px;
            background-color: #f9f9f9;
            border-radius: 4px;

            .top {
                .group-name {
                    margin-right: 8px;
                    color: @h1-white;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 20px;
                }

                .tag {
                    + .tag {
                        margin-left: 6px;
                    }
                }
            }

            .rate-info {
                display: flex;
                align-items: first baseline;
                margin-top: 12px;

                .income {
                    margin-right: 8px;
                    font-weight: bold;
                    font-size: 20px;
                    line-height: 28px;
                }

                .income-text {
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }
    }

    .item-list {
        margin-top: 12px;

        .item {
            position: relative;
            margin-bottom: 12px;
            padding: 16px 12px;
            background-color: #fff;
            border-radius: 8px;

            .group-info {
                margin-top: 12px;
                padding: 8px 12px 16px;
                background-color: #f9f9f9;
                border-radius: 8px;

                .group-info-title {
                    display: flex;
                    align-items: center;
                    padding: 8px 0;

                    span {
                        margin-right: 8px;
                        font-weight: bold;
                        font-size: 14px;
                        line-height: 20px;
                    }
                }

                .group-info-details {
                    display: flex;
                    margin-top: 4px;

                    &.evenly {
                        justify-content: space-evenly;
                    }

                    &.between {
                        justify-content: space-between;
                    }

                    .group-info-item {
                        width: 98px;

                        .item-title {
                            flex-shrink: 0;
                            margin-bottom: 4px;
                            color: @h3-white;
                            font-size: 12px;
                            line-height: 16px;
                        }

                        .mar-b-0 {
                            margin-bottom: 0;
                        }

                        .next-arrow {
                            width: 10px;
                            height: 10px;
                            margin-left: 4px;
                        }

                        .item-value {
                            flex-shrink: 0;
                            font-size: 14px;
                            line-height: 20px;
                        }

                        .item-rate {
                            font-size: 12px;
                            line-height: 16px;
                        }

                        .text-red {
                            color: @error-white;
                        }

                        .text-align-center {
                            text-align: center;
                        }

                        .text-align-right {
                            text-align: right;
                        }
                    }

                    .width-equal {
                        width: 33.33%;
                        padding: 0 4px;
                    }

                    .width-equal:first-of-type {
                        padding: 0 8px 0 0;
                    }

                    .width-equal:last-of-type {
                        padding: 0 0 0 8px;
                    }

                    .width-84 {
                        width: 84px;
                    }

                    .width-auto {
                        width: auto;
                    }
                }
            }

            .function-entry {
                display: flex;
                justify-content: space-between;
                height: 56px;
                margin-top: 16px;
                padding-top: 12px;

                .entry {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 56px;
                    height: 44px;
                    color: @h1-white;
                    font-size: 12px;
                    line-height: 16px;

                    img {
                        width: 20px;
                        height: 20px;
                        margin-bottom: 8px;
                    }
                }
            }
        }
    }

    .asset-flat {
        color: @flat-white;
    }

    .asset-normal {
        color: @h1-white;
    }
}
</style>
<style lang="less">
.init-btn-dialog {
    .van-dialog__footer {
        display: flex;
        flex-direction: column-reverse !important;

        .van-dialog__confirm {
            height: 44px;
            color: #fff;
            background: #ff6907;
            border-radius: 22px;

            .van-button__text {
                font-weight: 500;
                font-size: 16px;
            }
        }

        .van-dialog__cancel {
            margin-top: 12px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            background: #fff;
        }

        .van-dialog__cancel::before {
            background-color: transparent !important;
        }
    }

    .van-dialog__message {
        white-space: normal;

        .cusspan {
            color: #ff6907;
        }
    }

    button {
        width: 100%;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
        background: #ff6907;
        border-radius: 18px;
    }
}
</style>
