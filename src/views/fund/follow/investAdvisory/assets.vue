<!-- 投顾资产 -->
<template>
    <div class="page" :class="{ 'overflow-hidden': showNoobGuide }">
        <van-pull-refresh
            v-model="isPullLoading"
            @refresh="getInvestAdvisoryAsset"
            style="min-height: 100vh"
            :pulling-text="$t('pullRefresh')"
            :loosing-text="$t('relessRefresh')"
            :loading-text="`${$t('loading')}...`"
        >
            <!-- 账户基本信息卡片 -->
            <account-card
                class="account-info"
                :isLoading="!requestFinish"
                :isProfessional="isProfessional"
                :totalAsset="totalAsset"
                @assetsStatus="onAssetsStatus"
                @on-currency-change="onCurrencyChange"
                @init-currency="onInitCurrency"
            ></account-card>
            <template v-if="requestFinish">
                <div class="my-group">{{ $t('investAdvisory.myInvestGroup') }}({{ portfolioCount }})</div>
                <div v-if="portfolioCount" class="item-list">
                    <div class="item" v-for="consultant in consultantList" :key="consultant.uin">
                        <masterTopInfoView
                            class="mar-b16"
                            :info="consultant"
                            hiddenSkilled
                            @followedSuccess="getInvestAdvisoryAsset"
                        ></masterTopInfoView>

                        <div
                            class="group-info"
                            v-for="(portfolio, index) in consultant.portfolioList"
                            :key="portfolio.portfolioID + index"
                            @click.stop="onClickGroup(portfolio)"
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
                                            value: portfolio.assetInfo[`Assets${currency}`],
                                            normal: true,
                                            hide: !assetsStatus,
                                            sign: false,
                                            riseFall: false,
                                            rate: false,
                                            hideObj: { text: '*****', color: '#2F2F2F' },
                                        }"
                                    ></div>
                                </div>
                                <div class="group-info-item width-equal" v-show="followStatus.normal.includes(portfolio.followerStatus)">
                                    <div class="item-title text-align-center">
                                        {{ $t('holdProfit') }}
                                    </div>
                                    <div
                                        class="item-value text-align-center bold"
                                        v-riseFall="{
                                            value: portfolio.assetInfo[`profitLoss${currency}`],
                                            normal: true,
                                            hide: !assetsStatus,
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
                                            normal: true,
                                            hide: !assetsStatus,
                                            hideObj: { text: '*****', color: '#2F2F2F' },
                                        }"
                                    ></div>
                                </div>
                                <div class="group-info-item flex-c width-auto" v-show="!followStatus.normal.includes(portfolio.followerStatus)">
                                    <div
                                        class="item-value bold"
                                        v-riseFall="{
                                            value: portfolio[`applyAmount${currency}`],
                                            normal: true,
                                            hide: !assetsStatus,
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
                            <ul
                                v-if="showFunctionEntryID === portfolio.portfolioID"
                                class="function-entry border-top-1px"
                                @click.stop="onFunctionEntryClick($event, portfolio)"
                            >
                                <li class="entry mask" data-type="0">
                                    <multi-img name="icon_portfolio_rebalancing" directory="fund/follow" />
                                    <span>{{ $t('investAdvisory.portfolioRebalancing') }}</span>
                                </li>
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
                <template v-else-if="loadAssetsError">
                    <div class="load-assets-error">
                        <multi-img name="noData" directory="common" />
                        <p class="error-desc">{{ $t('loadingError') }}</p>
                        <p class="error-button" @click="reloadGetAssetsDetail">{{ $t('reload') }}</p>
                    </div>
                </template>
                <div v-else class="empty-container">
                    <empty showImg :tipText="$t('investAdvisory.noInvestList')"></empty>
                </div>
            </template>
        </van-pull-refresh>
        <!-- 新手引导 -->
        <template v-if="showNoobGuide">
            <div class="card-overlay mask" @click="finishGuideAction">
                <div class="noob-container">
                    <div class="cash-box-noob">
                        <multi-img name="invest-noob-guide" directory="noob" />
                        <span>{{ $t('investAdvisory.clickMoreInfo') }}</span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import AccountCard from './components/AccountCard.vue'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import gotoFollowDetailsMixin from '../mixins/gotoFollowDetailsMixin'
import privateMixin from '@/views/fund/list/mixins/private'
import masterTopInfoView from '@/views/fund/follow/components/masterTopInfoView.vue'
import portfolioTag from '../components/portfolioTag.vue'
import dayjs from 'dayjs'
import pathnames from '@/config/H5Pathname'
import Empty from '@/components/Empty.vue'

import { i18n } from '@/i18n/fund'
import { isFunction } from '@fs/utils'
import { investAdvisoryAsset } from '@/apis/portfolioFollow'
import { cloneDeep } from 'lodash'
import { PullRefresh } from 'vant'

// 1: 未提交开户 2: 开户中 3：跟投中 4: 已取消跟投 5: 开户失败
const followStatus = {
    opening: [2],
    normal: [3, 4],
    failure: [5, 7],
}
const priority = { 3: 10, 4: 9 }

const GUIDE_KEY = 'TG_ASSETS_GUIDE_KEY'

const rootElement = document.documentElement

export default {
    name: '',
    mixins: [checkPIMixin, privateMixin, gotoFollowDetailsMixin, watchPageVisibleMixin],
    components: {
        AccountCard,
        masterTopInfoView,
        portfolioTag,
        Empty,
        [PullRefresh.name]: PullRefresh,
    },
    data() {
        return {
            followStatus,
            tagObj: { 1: this.$t('follow.stockName'), 2: this.$t('publicFund'), 3: this.$t('bond'), 4: this.$t('mixed') },
            requestFinish: false,
            isPullLoading: false,
            loadAssetsError: false,
            assetsStatus: true,
            showFunctionEntryID: '',
            showNoobGuide: false,
            totalAsset: {},
            consultantList: [],
            portfolioCount: 0,
            currency: 'HKD',
        }
    },
    computed: {
        guideKey() {
            return GUIDE_KEY + '_' + localStorage.getItem('uin')
        },
        buyAmountOnWay() {
            return this.totalAsset[`buyAmountOnWay${this.currency}`]
        },
        sellAmountOnWay() {
            return this.totalAsset[`sellAmountOnWay${this.currency}`]
        },
        // 是否展示在资产提示
        showonLineAssets() {
            return this.buyAmountOnWay || this.sellAmountOnWay
        },
    },
    watch: {},
    created() {
        this.watch(() => {
            this.getInvestAdvisoryAsset()
        })
    },
    mounted() {},
    destroyed() {},
    filters: {
        latestProfitDateFilter(v) {
            return v ? `(${dayjs(v).format('MM/DD')})` : ''
        },
        groupStatusFilter(v) {
            if (followStatus.opening.includes(v)) {
                return i18n.t('investAdvisory.shenhezhong')
            } else if (followStatus.failure.includes(v)) {
                return i18n.t('investAdvisory.rejected')
            }
            return ''
        },
    },
    methods: {
        async getInvestAdvisoryAsset() {
            try {
                const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
                const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
                let { result = {} } = await investAdvisoryAsset({
                    subAccountID: subAcctId,
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
                console.log('investAdvisoryAsset result ==>', result)
                console.log(`investAdvisoryAsset consultantList ==>`, this.consultantList)
                this.loadAssetsError = false
                setTimeout(async () => {
                    const data = await this.$jsBridge.readLocalStorage(this.guideKey)

                    this.showNoobGuide = needShowNoobGuide && data.value !== '1'
                    if (this.showNoobGuide) {
                        await this.$jsBridge.writeLocalStorage(this.guideKey, '1')
                        if (this.$refs.groupRefs) {
                            const offsetTop = this.$refs.groupRefs[0].getBoundingClientRect().y
                            console.log('mask overlay offsetTop', offsetTop)
                            rootElement.style.setProperty(`--top`, offsetTop + 'px')
                        } else {
                            if (this.showonLineAssets) {
                                rootElement.style.setProperty(`--top`, '3.58rem')
                            } else {
                                rootElement.style.setProperty(`--top`, '3.20rem')
                            }
                        }
                    }
                }, 250)
            } catch (e) {
                this.loadAssetsError = this.portfolioCount === 0 && (await this.$root.getInvesetmentAccountStatus())
                console.error('investAdvisoryAsset error', e)
            } finally {
                console.log(`yinlong InvesetmentAccountStatus`, await this.$root.getInvesetmentAccountStatus())
                this.requestFinish = true
                this.isPullLoading = false
            }
        },
        async init() {
            this.requestFinish = false
            this.$loading.show = true
            await this.getInvestAdvisoryAsset()
            this.$loading.show = false
        },
        fetchIgnoreState() {
            this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            if (this.userInfo.clientSetting) {
                try {
                    const clientSetting = JSON.parse(this.userInfo.clientSetting)
                    this.costPriceType = clientSetting?.costPriceType ?? 1 // 默认 摊薄成本价
                } catch (error) {
                    console.error(error)
                }
            }
        },
        reloadGetAssetsDetail() {
            this.loadAssetsError = false
            this.init()
        },
        onAssetsStatus(status) {
            this.assetsStatus = status
        },
        onCurrencyChange(v) {
            this.currency = v
        },
        onInitCurrency(currency) {
            this.currency = currency
            this.init()
        },
        onFunctionEntryClick(e, portfolio) {
            const { type } = e.target.dataset || {}
            if (!type) return
            const commonParam = {
                tgID: portfolio.portfolioID, // 投顾ID
                tgAccID: portfolio.subAccountID,
                currency: this.currency,
            }
            let commonParamStr = ''
            Object.keys(commonParam).forEach(key => {
                commonParamStr += `${key}=${commonParam[key]}&`
            })
            commonParamStr = commonParamStr.slice(0, -1)
            const gotoOrderRecordPage = () => {
                if (this.$jsBridge) {
                    const url = `${location.origin}${location.pathname}#/invest-advisory/order-records?type=${0}&${commonParamStr}`
                    this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                } else {
                    this.$router.push({
                        path: '/follow-order-records',
                        query: {
                            type: 0,
                            ...commonParam,
                        },
                    })
                }
            }

            const gotoProfitLossDetailPage = () => {
                const url = `${location.origin}${location.pathname}#/invest-advisory/profit-loss-details?${commonParamStr}`
                this.$goPage(url)
            }

            const gotoPlaceOrderPage = () => {
                const url = `${location.origin}${location.pathname}#/invest-advisory/portfolio-place-order?&${commonParamStr}`
                this.$goPage(url)
            }

            const map = {
                0: gotoPlaceOrderPage,
                1: () => {
                    this.$goPage('/invest-advisory/holding-detail', { ...commonParam })
                },
                2: gotoOrderRecordPage,
                3: gotoProfitLossDetailPage,
            }
            if (isFunction(map[type])) {
                map[type]()
            }
        },
        onClickGroup(portfolio) {
            if (followStatus.normal.includes(portfolio.followerStatus)) {
                if (this.showFunctionEntryID) {
                    this.showFunctionEntryID = this.showFunctionEntryID === portfolio.portfolioID ? '' : portfolio.portfolioID
                } else {
                    this.showFunctionEntryID = portfolio.portfolioID
                }
            } else {
                const { VUE_APP_INVESTMENT_V2_OPEN_ACCOUNT_PAGE: page_url } = pathnames
                const url = `${page_url}?productId=${portfolio.portfolioID}&portfolioId=${portfolio.relatedID}`
                this.$goPage(url)
            }
        },
        // 点击完成新手指导
        finishGuideAction() {
            this.showNoobGuide = false
        },
    },
}
</script>

<style scoped lang="less">
// WARN: 改动该页面布局后, 要复查新手引导位置是否偏移
.page {
    min-height: 100vh;
    padding: 0 0 70px;
    background-color: #f9f9f9;

    .account-info {
        margin-top: 12px;
    }

    &.overflow-hidden {
        height: 100vh;
        overflow-y: hidden;
    }
}

.my-group {
    height: 36px;
    margin: 12px 12px 8px;
    color: @h1-white;
    font-weight: bold;
    font-size: 16px;
    line-height: 36px;
}

.item-list {
    padding: 0 12px;

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
                        color: @h1-white;
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

.load-assets-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
    background-color: @white;
    border-radius: 8px;

    img {
        width: 104px;
        height: 104px;
    }

    .error-desc {
        color: @fontGreyColor;
        font-weight: 400;
        font-size: 14px;
        line-height: 44px;
    }

    .error-button {
        color: @theme;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }
}

.empty-container {
    margin: 0 12px;
    background-color: #fff;
    border-radius: 8px;
}

.card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    .noob-container {
        .cash-box-noob {
            position: absolute;
            top: calc(var(--top) - 130px - 12px); // 218px;
            left: 50%;
            z-index: 2;
            width: 224px;
            height: 134px;
            transform: translateX(-50%);

            img {
                width: 224px;
                height: 134px;
            }

            span {
                position: absolute;
                top: 61px;
                left: 16px;
                color: @theme-white;
                font-size: 14px;
                line-height: 22px;
            }
        }

        &::before {
            position: absolute;
            top: calc(-100vw + var(--top) - 12px);
            left: calc(-100vw + 12px);
            z-index: 2;
            box-sizing: content-box;
            width: 351px;
            height: 128px;
            border-color: rgba(0, 0, 0, 0.3);
            border-style: solid;
            border-width: 100vw;
            border-radius: calc(100vw + 12px);
            content: '';
        }
    }
}
</style>
