<template>
    <div class="account-hold" v-show="!isLoading" :class="{ 'android-bottom': !isIos, 'ios-bottom': isIos }">
        <!-- 账户基本信息卡片 -->
        <account-card
            ref="accountCard"
            class="account-info"
            list
            :canJump="false"
            @assetsStatus="onAssetsStatus"
            :isLoading="isLoading"
            :isProfessional="isProfessional"
            :inAccountHold="true"
            @on-currency-change="onCurrencyChange"
            @on-doing-orderNum-change="onDoingOrderNumChange"
            @on-account-change="onAccountChange"
            @init-currency="onInitCurrency"
            :showRepayment="true"
        ></account-card>

        <!-- 功能展示 -->
        <feature-card :haveDoingOrder="haveDoingOrder" :currency="currency"></feature-card>
        <!-- 我的持仓 -->
        <div class="holding">
            <div class="title-row">
                <h2 class="title">{{ $t('assetsDetail') }}</h2>
                <div class="profit-desc" @click="goProfitDescPage">
                    {{ $t('profitDesc') }}
                    <multi-img class="arrow" name="icon_trade_detail" directory="common" />
                </div>
            </div>
            <div class="holding-content">
                <template v-if="assetsDetailLaoding">
                    <ul class="has-holding-list" v-for="i in 5" :key="i">
                        <li class="has-holding-list__item skeleton">
                            <van-skeleton row="3" :loading="assetsDetailLaoding"></van-skeleton>
                        </li>
                    </ul>
                </template>
                <template v-else-if="!assetsDetailLaoding && loadAssetsError">
                    <div class="load-assets-error">
                        <multi-img name="noData" directory="common" />
                        <p class="error-desc">{{ $t('loadingError') }}</p>
                        <p class="error-button" @click="reloadGetAssetsDetail">{{ $t('reload') }}</p>
                    </div>
                </template>
                <!-- 专户服务 + 理财产品 -->
                <ul class="types" v-else>
                    <li class="types-item" v-for="(tItem, tIndex) in types" :key="tIndex">
                        <h3 class="types-item__title" @click="setHideStatus(tItem)">
                            <span>{{ tItem.title }}</span>
                            <multi-img :name="'up-12'" directory="common" :class="{ expand: tItem.hide }"></multi-img>
                        </h3>
                        <div class="content" :class="{ 'content-hide': tItem.hide }">
                            <!-- 有持仓列表 -->
                            <template v-if="tItem.hasHolding.length && !loadAssetsError">
                                <ul class="has-holding-list" @click="onHoldingClick">
                                    <li class="has-holding-list__item mask" v-for="item in tItem.hasHolding" :key="item.type" :data-type="item.key">
                                        <div class="base-info">
                                            <span class="type">{{ item.label }}</span>
                                            <span class="holding-percent">
                                                {{ $t('holdingRate') }}
                                                <span v-if="assetsStatus" key="show">{{ item.assetsPercentage | percentageFilter }}</span>
                                                <span v-else key="hide" class="hide">****</span>
                                            </span>
                                        </div>
                                        <div class="holding-detail">
                                            <ul class="detail-types">
                                                <!-- 持有金额: 现金宝、公募、债券、另类、私募、投顾 展示 -->
                                                <li v-if="item.showHoldingAmount">
                                                    <p class="label">{{ $t('holdlingAmount') }}</p>
                                                    <p
                                                        class="value"
                                                        v-riseFall="{
                                                            value: item.assets || '--',
                                                            normal: false,
                                                            riseFall: false,
                                                            sign: false,
                                                            rate: false,
                                                            thousand: true,
                                                            hide: !assetsStatus,
                                                        }"
                                                    ></p>
                                                </li>
                                                <!-- 持有总额: 定存宝、现金宝专户 展示 -->
                                                <li v-if="item.showTotalHolding">
                                                    <p class="label">{{ $t('totalHolding') }}</p>
                                                    <p
                                                        class="value"
                                                        v-riseFall="{
                                                            value: item.assets || '--',
                                                            normal: false,
                                                            riseFall: false,
                                                            sign: false,
                                                            rate: false,
                                                            thousand: true,
                                                            hide: !assetsStatus,
                                                        }"
                                                    ></p>
                                                </li>
                                                <!-- 持有收益: 定存宝、现金宝专户 展示 -->
                                                <li v-if="item.showHoldingCount">
                                                    <p class="label">{{ $t('holdingCount') }}</p>
                                                    <p
                                                        class="value"
                                                        v-riseFall="{
                                                            value: item.numHoldings,
                                                            normal: false,
                                                            riseFall: false,
                                                            sign: false,
                                                            rate: false,
                                                            thousand: false,
                                                            base: 0,
                                                            hide: !assetsStatus,
                                                        }"
                                                    >
                                                        {{ assetsStatus ? item.numHoldings : '*' }}
                                                    </p>
                                                </li>
                                                <!-- 昨日收益: 现金宝、公募、债券、私募 -->
                                                <li v-if="item.showLatestProfit">
                                                    <p class="label">
                                                        <span>{{ $t('yesterdayProfit') }}</span>
                                                        <span>{{ item.yesterdayProfitlossDate | lossDateFilter }}</span>
                                                    </p>
                                                    <p
                                                        class="value"
                                                        v-riseFall="{
                                                            value: item.yesterdayProfitloss || '--',
                                                            normal: false,
                                                            rate: false,
                                                            thousand: true,
                                                            hide: !assetsStatus,
                                                        }"
                                                    ></p>
                                                </li>
                                                <!-- 持有收益/率: 公募、私募、债券、投顾 展示 -->
                                                <li v-if="item.showProfitWithRate">
                                                    <!-- 0, 1 公募 私募显示持有收益 其他显示累计收益 -->
                                                    <p class="label">{{ $t('holdProfitWithRate') }}</p>
                                                    <p class="value rate">
                                                        <span
                                                            v-riseFall="{
                                                                value: item.profitloss || '--',
                                                                normal: false,
                                                                rate: false,
                                                                thousand: true,
                                                                hide: !assetsStatus,
                                                            }"
                                                        ></span>
                                                        <span
                                                            v-riseFall="{
                                                                value: item.profitlossRate || '--',
                                                                normal: false,
                                                                rate: true,
                                                                thousand: true,
                                                                hide: !assetsStatus,
                                                            }"
                                                        ></span>
                                                    </p>
                                                </li>
                                                <!-- 累计收益: 另类、现金宝 -->
                                                <li v-if="item.showAccumulatedProfitloss">
                                                    <p class="label">{{ $t('accumulatedProfit') }}</p>
                                                    <p
                                                        class="value"
                                                        v-riseFall="{
                                                            value: item.accumulatedProfitloss || '--',
                                                            normal: false,
                                                            rate: false,
                                                            thousand: true,
                                                            hide: !assetsStatus,
                                                        }"
                                                    ></p>
                                                </li>
                                            </ul>
                                        </div>
                                    </li>
                                </ul>
                            </template>
                            <!-- 无持仓列表 -->
                            <template v-if="tItem.noHolding.length && !loadAssetsError">
                                <ul class="no-holding-list" @click="onNoHoldingClick">
                                    <li class="no-holding-list__item mask" v-for="item in tItem.noHolding" :key="item.type" :data-type="item.key">
                                        <span class="type">{{ item.label }}</span>
                                        <div class="tip">
                                            <span v-if="judgeOpenStatus(item)">{{ $t('noOpenCashBox') }}</span>
                                            <span v-else>{{ $t('noHoldingToView') }}</span>
                                            <multi-img name="icon_arrow_left" directory="fund"></multi-img>
                                        </div>
                                    </li>
                                </ul>
                            </template>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { Overlay, Skeleton } from 'vant'
import AccountCard from './components/AccountCard.vue'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { dynamicFontSize } from '../../utils'
import { floatToRatio, isIos, isTenantApp } from '@/utils'
import { FUND_MODE_MAP, ASSET_TYPE_MAP } from '@/views/fund/config/common'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import privateMixin from './list/mixins/private'
import HKindentify from '@/mixins/HKIndentify/index.js'
import { getAssetsDetail } from '@/apis/wealth/index.js'
import FeatureCard from './components/FeatureCard.vue'
import { throttle } from 'lodash'
import dayjs from 'dayjs'
import { assetTypeMap } from '@/config/common'
import pathnames from '@/config/H5Pathname'
import pageUrl from '@/config/pageUrl'

const fundModeKeysMap = FUND_MODE_MAP.keysMap

export default {
    name: 'account-hold',
    components: {
        [Overlay.name]: Overlay,
        [Skeleton.name]: Skeleton,
        AccountCard,
        FeatureCard,
    },
    mixins: [riskAssessmentMixin, checkPIMixin, privateMixin, HKindentify],
    data() {
        return {
            ASSET_TYPE_MAP,
            isLoading: false,
            isIos: isIos(),
            assetsDetailLaoding: false, // 获取资产详情loading
            loadAssetsError: false, // 是否加载资产错误
            getAssetsDetail: throttle(this.getAssetsDetailHander, 100, { leading: false, trailing: true }),
            modeTypeMap: {
                [fundModeKeysMap.PUBLIC]: 'public',
                [fundModeKeysMap.PRIVATE]: 'private',
                [fundModeKeysMap.BOND]: 'bond',
                [fundModeKeysMap.BILL]: 'bill',
            },
            holdList: [],
            cashBoxOpenStatus: 1, // 开通状态(Number) 0-未开通，1-已开通
            assetsStatus: true,
            assetList: [], // 资产类型列表
            haveDoingOrder: false,
            currency: 'HKD',
            account: this.$route.query.accountType || 'ALL',
            // 开通状态(Boolean) false-未开通，true-已开通
            fixedDepositTreasureOpenStatus: true,
            // 现金宝专户开通状态(Boolean) false-未开通，true-已开通
            starSpecialAccountOpenStatus: true,
            types: [],
            specialAccountHideKey: 'SPECIAL_ACCOUNT_ASSET',
            wealthHideKey: 'WEALTH_ASSET',
        }
    },
    filters: {
        hideFilter(v, amountStatus) {
            const placeholder = '******'
            return amountStatus ? v : placeholder
        },

        floatToRatioFilter(v, rate) {
            return floatToRatio(v, { rate })
        },
        percentageFilter(v) {
            return floatToRatio(v, { fate: true, base: 2, pow: 2, sign: false })
        },
        lossDateFilter(v) {
            return v ? `(${dayjs(v).format('MM/DD')})` : ''
        },
    },
    watch: {
        assetsStatus(v) {
            if (v) {
                this.resetFontSize()
            }
        },
    },
    async mounted() {
        if (this.$jsBridge) {
            this.$jsBridge?.enabelPageRefreshFunction()
            // TODO: 接口较慢暂时关闭返回刷新
            // this.$jsBridge?.watchPageVisible(this.init)
        }
    },
    methods: {
        onInitCurrency(currency) {
            this.currency = currency
            this.init()
        },
        async init() {
            this.assetList = []
            this.isLoading = true
            this.$loading.show = true
            // Promise 内部均消化了报错
            await Promise.all([this.getAssetsDetail(), this.getEcashUserStatus()])
            this.isLoading = false
            this.$loading.show = false
        },
        onAssetsStatus(status) {
            this.assetsStatus = status
        },
        // 重新设置字体大小
        resetFontSize() {
            this.$nextTick(() => {
                this.holdList.forEach(i => {
                    const list = ['marketValue', 'count', 'profitRate', 'profitAmount']
                    list.forEach(k => {
                        const minFontSize = 10
                        dynamicFontSize({ dom: this.$refs[i.productCode + k], minFontSize })
                    })
                })
            })
        },

        async getEcashUserStatus() {
            try {
                const result = await this.$store.dispatch('user/getEcashStatus')
                console.log('现金宝开通状态ecashUserStatus-res:', result)
                this.cashBoxOpenStatus = result?.openStatus || 0
            } catch (e) {
                console.error('ecashUserStatus===>e:', e)
            }
        },
        // 持仓点击事件
        onHoldingClick(e) {
            try {
                const { type } = e.target.dataset || {}
                if (!type) return
                // 现金宝
                if (type === 'cashBox') {
                    const href = `${location.origin}/wealth/cashBox.html#/?accountType=${this.account}&currency=${this.currency}`
                    this.$goPage(href)

                    return
                }
                // 定存宝
                if (type === 'fixedDepositTreasure') {
                    const { VUE_APP_FIXEDDEPOSIT_PAGE } = pathnames
                    const href = `${VUE_APP_FIXEDDEPOSIT_PAGE}?accountType=${this.account}&currency=${this.currency}`

                    this.$goPage(href)
                    return
                }
                // 现金宝专户
                if (type === 'starSpecialAccount') {
                    const { VUE_APP_STARSPECIALACCOUNT_PAGE } = pathnames
                    const href = `${VUE_APP_STARSPECIALACCOUNT_PAGE}?accountType=${this.account}&currency=${this.currency}`

                    this.$goPage(href)
                    return
                }
                // 投顾
                if (type === 'investAdvisory') {
                    if (isTenantApp()) {
                        this.$goPage('/invest-advisory/assets')
                    } else {
                        this.$toast(this.$t('investAdvisory.pleaseContactService'))
                    }

                    return
                }
                this.$goPage('/asset-hold', {
                    assetType: type,
                    accountType: this.account,
                })
            } catch (e) {
                console.error(e)
            }
        },

        onNoHoldingClick(e) {
            try {
                const { type } = e.target.dataset || {}
                if (!type) return
                const exec = {
                    cashBox: () => {
                        if (!this.cashBoxOpenStatus) {
                            // 未开通 当前页前往开通页
                            const url = encodeURIComponent(location.href)
                            location.href = `${location.origin}/wealth/cashBox.html#/sign?url=${url}`
                        } else {
                            // 已开通 新开webview去现金宝首页
                            this.$goPage('/', {}, { pathname: '/wealth/cashBox.html' })
                        }
                    },
                    publicFund: () => {
                        // 跳转到基金列表页（全部）
                        this.$goPage('/list', {
                            activeTab: 'all',
                        })
                    },
                    privateFund: () => {
                        // 跳转到私募列表页
                        this.$goPage('/private-list')
                    },
                    bond: () => {
                        // 跳转到债券列表页
                        this.$goPage('/bond')
                    },
                    alterInvestment: () => {
                        // 跳转到票据列表页
                        this.$goPage('/invest-product/alter-investments')
                    },
                    fixedDepositTreasure: () => {
                        // eslint-disable-next-line prefer-const
                        let { VUE_APP_FIXEDDEPOSIT_ABOUT_PAGE: url1, VUE_APP_FIXEDDEPOSIT_LIST_PAGE: url2 } = pathnames
                        if (!this.fixedDepositTreasureOpenStatus) {
                            // 跳转到定存宝开通页
                            url1 = `${url1}?open=1`
                            this.$goPage(url1)
                        } else {
                            this.$goPage(`${url2}`)
                        }
                    },
                    starSpecialAccount: () => {
                        const { VUE_APP_STARSPECIALACCOUNT_OPEN_ACCOUNT_PAGE: url1, VUE_APP_STARSPECIALACCOUNT_LIST_PAGE: url2 } = pathnames
                        if (!this.starSpecialAccountOpenStatus) {
                            // 跳转到现金宝专户开通页
                            this.$goPage(url1)
                        } else {
                            this.$goPage(url2)
                        }
                    },
                    investAdvisory: () => {
                        // 跳转到好易投主页
                        this.$goPage('/follow')
                    },
                }

                exec[type] && exec[type]()
            } catch (e) {
                console.error(e)
            }
        },

        reloadGetAssetsDetail() {
            this.loadAssetsError = false
            this.getAssetsDetail()
        },

        async getAssetsDetailHander() {
            try {
                const params = {
                    toCurrency: this.currency,
                    account: this.account,
                }
                this.assetsDetailLaoding = true
                let { result } = await getAssetsDetail(params)
                result = result || []
                result = this.addKeys(result)
                this.assetList = result
                // 分类理财资产类型
                this.types = await this.classifyAsset(result)
            } catch (e) {
                console.error('getAssetsDetail===>e:', e)
                // 加载资产错误
                this.loadAssetsError = true
            } finally {
                this.assetsDetailLaoding = false
            }
        },

        addKeys(list = []) {
            return list.map(i => {
                return {
                    ...i,
                    key: ASSET_TYPE_MAP.KeyInteralMap[i.assetsType],
                    label: ASSET_TYPE_MAP.keyValueMap[i.assetsType],
                    showLatestProfit: this.getShowLatestProfit(i),
                    showProfitWithRate: this.getShowProfitWithRate(i),
                    showAccumulatedProfitloss: this.getShowAccumulatedProfitloss(i),
                    showTotalHolding: this.getShowTotalHolding(i),
                    showHoldingCount: this.getShowHoldingCount(i),
                    showHoldingAmount: this.getShowHoldingAmount(i),
                }
            })
        },
        /**
         * 拆分不同类型的理财类型
         * @param {Array} list 资产列表
         * @returns {Array}
         */
        async classifyAsset(list = []) {
            // 展示顺序 10, 11, 9, 1, 3, 8, 2, 13
            const specialAccountList = this.classifyHasHoldingAndNoHolding(list.slice(0, 2))
            const wealthList = this.classifyHasHoldingAndNoHolding(list.slice(2))
            // 增加title
            specialAccountList.title = this.$t('specialAccountService')
            wealthList.title = this.$t('wealthProduct')
            // 获取展示隐藏默认值
            specialAccountList.hideKey = this.specialAccountHideKey
            wealthList.hideKey = this.wealthHideKey
            specialAccountList.hide = await this.getDefaultHideStatus(this.specialAccountHideKey)
            wealthList.hide = await this.getDefaultHideStatus(this.wealthHideKey)
            return [specialAccountList, wealthList]
        },

        /**
         * 拆分产品类型中的有持仓和无持仓
         * @param {Array} list 资产列表
         * @returns {Object}
         */
        classifyHasHoldingAndNoHolding(list = []) {
            const baseObj = {
                hasHolding: [],
                noHolding: [],
            }
            const ret = list.reduce((o, c) => {
                if (c.numHoldings > 0 || (c.assets > 0 && c.assetsType === ASSET_TYPE_MAP.keysMap.investAdvisory)) {
                    o.hasHolding.push(c)
                } else {
                    // 现金宝专户未开通不放入数组
                    if (c.assetsType === ASSET_TYPE_MAP.keysMap.starSpecialAccount) {
                        console.log('classifyHasHoldingAndNoHolding starSpecialAccountOpenStatus', this.starSpecialAccountOpenStatus)
                        if (this.starSpecialAccountOpenStatus) {
                            o.noHolding.push(c)
                        }
                    } else {
                        o.noHolding.push(c)
                    }
                }

                return o
            }, baseObj)
            return ret
        },

        async getDefaultHideStatus(key = '') {
            let ret = false
            try {
                if (this.$jsBridge) {
                    const data = await this.$jsBridge.readLocalStorage(key)
                    ret = JSON.parse(data?.value)
                }
            } catch (e) {
                console.error('getDefaultHideStatus error ===>', e)
            }
            return ret
        },

        async setHideStatus(item) {
            try {
                item.hide = !item.hide
                if (this.$jsBridge) {
                    await this.$jsBridge.writeLocalStorage(item.hideKey, JSON.stringify(item.hide))
                }
            } catch (e) {
                console.error('getDefaultHideStatus error ===>', e)
            }
        },

        onCurrencyChange(v) {
            this.currency = v
            this.getAssetsDetail()
        },

        onDoingOrderNumChange(v) {
            this.haveDoingOrder = v
        },

        onAccountChange({ value } = {}) {
            this.account = value
            this.getAssetsDetail()
        },

        // 是否展示昨日收益（公募、私募、债券、现金宝）
        getShowLatestProfit(data) {
            const { keysMap: k } = assetTypeMap
            const ret = [k.publicFund, k.privateFund, k.bond, k.cashBox].includes(data.assetsType)
            return ret
        },
        // 是否展示持有收益/率（公募、私募、债券、投顾）
        getShowProfitWithRate(data) {
            const { keysMap: k } = assetTypeMap
            const ret = [k.publicFund, k.privateFund, k.bond, k.investAdvisory].includes(data.assetsType)
            return ret
        },
        // 是否展示 累计收益（另类、现金宝）
        getShowAccumulatedProfitloss(data) {
            const { keysMap: k } = assetTypeMap
            const ret = [k.alterInvestment, k.cashBox].includes(data.assetsType)
            return ret
        },
        // 是否展示 持有总额（定存宝、现金宝专户）
        getShowTotalHolding(data) {
            const { keysMap: k } = assetTypeMap
            const ret = [k.fixedDepositTreasure, k.starSpecialAccount].includes(data.assetsType)
            return ret
        },
        // 是否展示 持有收益（定存宝、现金宝专户）
        getShowHoldingCount(data) {
            const { keysMap: k } = assetTypeMap
            const ret = [k.fixedDepositTreasure, k.starSpecialAccount].includes(data.assetsType)
            return ret
        },
        // 是否展示 持有金额（现金宝、公募、私募、债券、另类、投顾）
        getShowHoldingAmount(data) {
            const { keysMap: k } = assetTypeMap
            const ret = [k.publicFund, k.privateFund, k.bond, k.cashBox, k.alterInvestment, k.investAdvisory].includes(data.assetsType)
            return ret
        },
        goProfitDescPage() {
            this.$goPage(pageUrl.FAQ_PROFIT_DESC)
        },
        /**
         * 判断账户的开通情况
         */
        judgeOpenStatus(item) {
            if (item.assetsType === ASSET_TYPE_MAP.keysMap.cashBox) return !this.cashBoxOpenStatus
            if (item.assetsType === ASSET_TYPE_MAP.keysMap.fixedDepositTreasure) return !this.fixedDepositTreasureOpenStatus
            if (item.assetsType === ASSET_TYPE_MAP.keysMap.starSpecialAccount) return !this.starSpecialAccountOpenStatus
        },
    },
}
</script>

<style lang="less">
html {
    background: #f9f9f9;
}

.private-tip {
    z-index: 10001 !important;
    width: 280px !important;
    border-radius: 12px;

    .van-dialog__content {
        min-height: auto;
    }

    .van-dialog__message {
        padding: 28px 16px;

        > span {
            display: block;
            margin-left: 8px;
            color: #1f1f1f;
            font-size: 14px;
            line-height: 20px;
            text-align: left;

            span {
                display: inline;
                color: #ff6907;
            }
        }
    }

    .van-dialog__footer {
        .van-dialog__confirm {
            height: 44px;
        }

        box-shadow: inset 0 0.5px 0 #efefef;
    }
}
</style>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');
@black: #1f1f1f;
@white: #fff;

.android-bottom {
    padding-bottom: 12px;
}

.ios-bottom {
    #iosBottom();
}

.account-hold {
    overflow: auto;
    background: #f9f9f9;

    .card {
        margin-top: 12px;
        background: @white;
        border-radius: 8px;
    }

    .mask {
        position: relative;

        &::after {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1;
            display: block;
            content: '';
        }
    }

    .holding {
        margin: 12px;

        .title-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 20px 0 4px;
            padding: 7px 0;

            .title {
                color: @fontBlackColor;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

            .profit-desc {
                display: flex;
                align-items: center;
                color: #666;
                font-size: 12px;
                line-height: 16px;

                .arrow {
                    width: 16px;
                    height: 16px;
                    margin-left: 2px;
                }
            }
        }

        .types {
            &-item {
                margin-bottom: 12px;
                padding: 12px;
                background: #fff;
                border-radius: 8px;

                &__title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 36px;
                    font-size: 0;

                    span {
                        color: @fontBlackColor;
                        font-weight: 700;
                        font-size: 16px;
                        line-height: 22px; /* 137.5% */
                    }

                    img {
                        width: 12px;
                        height: 12px;
                        transition: transform 0.3s;

                        &.expand {
                            transform: rotate(180deg);
                        }
                    }
                }

                .content {
                    position: relative;
                    box-sizing: border-box;
                    max-height: 900px;
                    overflow: hidden;
                    transition: max-height 0.3s ease-in-out;
                    will-change: max-height;

                    &::before {
                        display: block;
                        height: 12px;
                        content: '';
                    }

                    &-hide {
                        max-height: 0;
                    }
                }
            }
        }

        .has-holding-list {
            & > li {
                margin-bottom: 12px;
                padding: 0 12px;
                background: @bgGreyColor;
                border-radius: 8px;

                .base-info {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 52px;

                    .type {
                        color: @fontBlackColor;
                        font-weight: 700;
                        font-size: 14px;
                        line-height: 20px;
                    }

                    .holding-percent {
                        color: @fontLightColor;
                        font-size: 12px;
                        line-height: 16px;
                    }

                    .hide-percent {
                        color: @fontLightColor;
                    }
                }

                .holding-detail {
                    position: relative;
                    padding: 12px 0;

                    &::before {
                        position: absolute;
                        top: 0;
                        width: 100%;
                        height: 1px;
                        background: #efefef;
                        transform: scaleY(0.5);
                        content: '';
                    }

                    .detail-types {
                        display: flex;
                        justify-content: space-between;

                        .label {
                            color: @fontGreyColor;
                            font-size: 12px;
                            line-height: 16px;
                        }

                        .value {
                            margin-top: 4px;
                            color: @fontBlackColor;
                            font-weight: 700;
                            font-size: 14px;
                            line-height: 20px;

                            &.rate {
                                display: flex;
                                flex-direction: column;

                                span:last-child {
                                    font-size: 12px;
                                    line-height: 16px;
                                }
                            }
                        }

                        & > li {
                            flex: 1 0 auto;
                            width: 98px;

                            &:nth-child(2) {
                                text-align: center;
                            }

                            &:last-child {
                                text-align: right;
                            }
                        }
                    }
                }
            }

            & .skeleton {
                padding: 12px 0;
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

        .no-holding-list {
            background: @white;
            border-radius: 8px;

            &__item {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 52px;
                margin-bottom: 12px;
                padding: 0 12px;
                background: @bgGreyColor;
                border-radius: 8px;

                &:last-child {
                    margin-bottom: 0;
                }

                .type {
                    color: @fontBlackColor;
                    font-weight: 700;
                    font-size: 14px;
                    line-height: 20px;
                }

                .tip {
                    display: flex;
                    align-items: center;

                    span {
                        color: @fontGreyColor;
                        font-size: 12px;
                        line-height: 16px;
                    }

                    img {
                        width: 12px;
                        height: 12px;
                        margin-left: 8px;
                    }
                }
            }
        }
    }
}
</style>
