<template>
    <div class="index flex-column">
        <!-- tab切换 港元理财账户/美元理财账户 -->
        <div class="tab-main flex-c align-c bg-white">
            <div
                class="flex1"
                :class="{ active: item.value == accountType }"
                v-for="item in tabData"
                :key="item.value"
                @click="onAccountChange(item.value)"
            >
                {{ item.text }}
            </div>
        </div>

        <div class="pad-rl12 flex1 pad-b32 auto-y" v-if="loaded">
            <!-- 账户资产信息 -->
            <div class="account-info bg-white border-radius-8px mar-t12 overflow-hidden" v-if="openFundTrade">
                <multi-img name="bg_account" directory="cmhk" class="bg-account"></multi-img>
                <div class="flex-c lh-20 f15" v-if="accts.type">
                    <span>{{ accts.type | accountTypeFilter }}：</span>
                    <span>{{ showAssets ? accts.subAcctId : hideSubAccountId }}</span>
                    <multi-img
                        name="icon_copy"
                        directory="cmhk"
                        width="20"
                        height="20"
                        class="mar-l6 copyBtn"
                        :data-clipboard-text="accts.subAcctId"
                        @click="copySubAccountId"
                    ></multi-img>
                </div>
                <!-- 资产净值、累计收益 -->
                <div class="flex-s mar-t20">
                    <div>
                        <div class="flex-c">
                            <div class="f14 h2-white">{{ $t('netAssetValue') }} ({{ currency | currencyTextFilter }})</div>
                            <multi-img
                                v-if="showAssets"
                                name="icon_trade_eye_open"
                                directory="cmhk"
                                width="16"
                                height="16"
                                class="mar-116"
                                @click="handleAssetsFlag(false)"
                            ></multi-img>
                            <multi-img
                                v-else
                                name="icon_trade_eye_close"
                                directory="cmhk"
                                width="16"
                                height="16"
                                class="mar-116"
                                @click="handleAssetsFlag(true)"
                            ></multi-img>
                        </div>
                    </div>
                    <div class="align-r f12 h2-white">{{ $t('yesterdaysEarnings') }}{{ profitlossDate | profitLostDateFormat }}</div>
                </div>

                <div class="flex-s mar-t8 bold">
                    <div
                        class="f30 c-main"
                        v-riseFall="{
                            value: totalAssets,
                            hide: !showAssets,
                            hideObj: { color: '#2F2F2F', text: '*****' },
                            sign: false,
                            riseFall: false,
                            rate: false,
                            thousand: true,
                            normal: true,
                        }"
                    ></div>
                    <div
                        class="f20 align-r"
                        v-riseFall="{
                            value: yesterdayProfitloss,
                            hide: !showAssets,
                            hideObj: { color: '#2F2F2F', text: '****' },
                            rate: false,
                            thousand: true,
                            normal: true,
                        }"
                    ></div>
                </div>

                <!-- 现金、理财持仓、累计收益 -->
                <div class="flex-s mar-t18">
                    <div class="flex1">
                        <div class="f12 c-gray mar-b4">{{ $t('canUseCash') }}</div>
                        <div
                            class="f14 lh-22 c-main bold w-100"
                            ref="cashDom"
                            v-riseFall="{
                                value: cashBalance,
                                hide: !showAssets,
                                hideObj: { color: '#2F2F2F', text: '****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                                thousand: true,
                                normal: true,
                            }"
                        ></div>
                    </div>
                    <div class="align-c flex1">
                        <div class="f12 c-gray mar-b4 w-108">{{ $t('wealthHolding') }}</div>
                        <div
                            class="f14 lh-22 c-main bold w-108"
                            ref="totalMarketValueDom"
                            v-riseFall="{
                                value: totalMarketValue,
                                hide: !showAssets,
                                hideObj: { color: '#2F2F2F', text: '****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                                thousand: true,
                                normal: true,
                            }"
                        ></div>
                    </div>
                    <div class="align-r flex1">
                        <div class="f12 c-gray mar-b4">{{ $t('cumulativeEarnings') }}</div>
                        <div
                            class="f14 lh-22 bold"
                            v-riseFall="{
                                value: accumulatedProfitloss,
                                hide: !showAssets,
                                hideObj: { color: '#2F2F2F', text: '****' },
                                rate: false,
                                thousand: true,
                                normal: true,
                            }"
                        ></div>
                    </div>
                </div>
                <div class="auto-tips f12 pad-l8" v-if="nextAutoBuyTime">{{ $t('nextAutoBuyTime') }} &nbsp;{{ nextAutoBuyTime | dateFormat }}</div>
                <div
                    class="f12 lh-22 h2-white mar-t16 pad-t12 border-top-1px flex-s"
                    v-if="numOfOrdersInProceessing.ecash"
                    @click="goPage('processing')"
                >
                    <div v-html="doingHtml"></div>
                    <multi-img name="icon-right-arrow" directory="common" width="12" height="12"></multi-img>
                </div>
                <div
                    class="f12 lh-22 h2-white mar-t16 pad-t12 border-top-1px flex-s"
                    v-if="numOfOrdersInProceessing.ftdSettled"
                    @click="goPage('receivedMoney')"
                >
                    <div v-html="dcbDoingHtml"></div>
                    <multi-img name="icon-right-arrow" directory="common" width="12" height="12"></multi-img>
                </div>
            </div>

            <!-- 开通理财账户 -->
            <openFundAccount v-else></openFundAccount>

            <!-- 功能ICON入口 -->
            <div class="mar-t12">
                <van-swipe>
                    <van-swipe-item v-for="(item, idx) in swipeLength" :key="item">
                        <ul class="features" @click="openPage">
                            <li
                                class="features-item mask"
                                v-for="item in getFeatures(idx)"
                                :key="item.key"
                                :data-key="item.key"
                                :data-link="item.link"
                            >
                                <div class="img-box">
                                    <multi-img directory="cmhk/features" :name="item.icon"></multi-img>
                                </div>
                                <span>{{ item.label }}</span>
                            </li>
                        </ul>
                    </van-swipe-item>
                </van-swipe>
            </div>

            <!-- 星财宝持仓 或 定存宝持仓 -->
            <component
                :is="componentId1"
                :holdDataList="componentId1 == 'starHoldingData' ? ecashHoldingsSummary[accountType] || [] : ftdHoldingsSummary[accountType] || []"
                :showAssets="showAssets"
            ></component>

            <component
                :is="componentId2"
                :holdDataList="componentId2 == 'starHoldingData' ? ecashHoldingsSummary[accountType] || [] : ftdHoldingsSummary[accountType] || []"
                :showAssets="showAssets"
            ></component>

            <!-- 开通定存宝 -->
            <openDepositoryTreasure v-if="openFundTrade && !openDepositoryTreasure"></openDepositoryTreasure>

            <!-- 开通星财宝 -->
            <openStarAccount v-if="openFundTrade && !ecashStatusInfo.openStatus && openDepositoryTreasure"></openStarAccount>
        </div>

        <!-- 风险测评弹窗 -->
        <van-dialog
            v-model="cepingDiag"
            :title="$t('prompt')"
            class="custom-dialog"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('goRisk')"
            @confirm="cepingSure"
        >
            <div class="risk-dialog__content">
                {{ cepingText }}
            </div>
        </van-dialog>
    </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapState } from 'vuex'
import { Swipe, SwipeItem, Dialog } from 'vant'
import NP from 'number-precision'
import { ecashUserSetting, getOrderStatistics, mylinkAssetsDetail } from '@/apis/wealth/index.js'
import { thousandsFilter } from '@/config/filters.js'
import { currencyMap, accountTypeMap, accountMap } from '@/config/common'
import { TRADE_PWD_STATUS, FUND_ACCOUNT_STATUS } from '@/utils/user'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import isOlderAge65 from '@/mixins/AgeLimit/index.js'
import HKindentify from '@/mixins/HKIndentify/index.js'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { getPageVisibleSupportProperty, dynamicFontSize } from '@/utils/utils'
import { getLangType } from '@/utils/tools'
import Clipboard from 'clipboard'
import { WEALTH_AMOUNT_STATUS_kEY } from '@/config/common'

import openFundAccount from './components/openFundAccount.vue'
import openDepositoryTreasure from './components/openDepositoryTreasure.vue'
import openStarAccount from './components/openStarAccount.vue'
import starHoldingData from './components/starHoldingData.vue'
import depositoryTreasureHolding from './components/depositoryTreasureHolding.vue'

const SWIPE_ITEM_LENGTH = 4
const currencyKeyValueMap = currencyMap.keyValueMap
const currencyKeysMap = currencyMap.keysMap
const accountTypeKeyValueMap = accountTypeMap.keyValueMap
const accountKeysMap = accountMap.keysMap

const assetsMap = {
    totalAssets: '',
    totalMarketValue: '',
    accumulatedProfitloss: '',
    yesterdayProfitloss: '',
    annualReturn7d: '',
    profitlossDate: '',
    buyingAmount: '',
    sellableAmount: '',
    profitlossUpdateStatus: 0, // 收益更新状态 0-未更新， 1-部分更新，2-已全部更新
}
export default {
    name: 'index',
    mixins: [riskAssessmentMixin, HKindentify],
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        openFundAccount,
        openDepositoryTreasure,
        openStarAccount,
        starHoldingData,
        depositoryTreasureHolding,
    },
    filters: {
        thousandsFilter(num, that) {
            return that.showAssets ? (num ? `${thousandsFilter(num)}` : '--') : '****'
        },
        accountTypeFilter(v) {
            return accountTypeKeyValueMap[v] || ''
        },
        currencyTextFilter(v) {
            return currencyKeyValueMap[v] || ''
        },
        // 最新收益日期format
        profitLostDateFormat(date) {
            return date ? `(${dayjs(date).format('MM/DD')})` : ''
        },
        dateFormat(v) {
            return v ? dayjs(v).format('YYYY/MM/DD HH:mm') : '--'
        },
    },
    data() {
        return {
            loaded: false,
            tradeLoginDialog: null,
            that: this,
            showAssets: false, // 默认不显示金额
            accountType: 'HKD',
            currency: 'HKD',
            showPopover: false,
            cepingDiag: false, // 风测过期dialog
            cepingText: '', // 风测错误信息
            tradeLoginFlag: false,
            tabData: [
                { value: accountKeysMap.HKD, text: this.$t('hkdAccount') },
                { value: accountKeysMap.USD, text: this.$t('usdAccount') },
            ],
            userSetting: null, // 用户设置信息
            hkdAccount: {
                HKD: { ...assetsMap },
                USD: { ...assetsMap },
                CNH: { ...assetsMap },
            },
            usdAccount: {
                HKD: { ...assetsMap },
                USD: { ...assetsMap },
                CNH: { ...assetsMap },
            },
            isUnsetTradePwd: true, // 未设置交易密码
            holdingMap: {}, // 星财宝持仓
            openFundTrade: false, // 是否开通理财产品标记
            openDepositoryTreasure: false, // 是否开通定存宝
            numOfOrdersInProceessingMap: {
                // 订单进行中map(区分市场)
                HKD: null,
                USD: null,
            },
            ecashHoldingsSummary: {},
            ftdHoldingsSummary: {},
            propertyData: {},
            ecashStatusInfo: {}, // 星财宝信息； openStatus：int，开通状态 0-未开通，1-已开通,openTime：int,开通时间 "YY-MM-DD HH:MM:SS"，effectiveStatus: int,生效状态 0-未生效 1-已生效  timesteamp: 当前服务器时间
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        features() {
            const list = [
                {
                    key: 'starPage',
                    label: this.$t('cashBox'),
                    icon: 'xcb',
                    link: `/wealth/cashBox.html#/?accountType=${this.accountType}`,
                },
                {
                    key: 'depositTreasurePage',
                    label: this.$t('depositoryTreasureName'),
                    icon: 'dcb',
                    link: `/wealth/fixedDepositTreasure.html#/?accountType=${this.accountType}`,
                },
                {
                    key: 'orderHistory',
                    label: this.$t('orderRecord'),
                    icon: 'orderHistory',
                    link: `/wealth/fund.html#/order-list?productType=9&lock=1&accountType=${this.accountType}`,
                },
                {
                    key: 'deposit',
                    label: this.$t('saveCapital'),
                    icon: 'deposit',
                    link: '/edda_app/?langType=' + getLangType(),
                },
                {
                    key: 'profitDetail',
                    label: this.$t('profitDetail'),
                    icon: 'profitDetail',
                    // link: `/wealth/cashBox.html#/incomeDetails?accountType=${this.accountType}`,
                    link: `/wealth/fund.html#/profit?assetType=cashBox&accountType=${this.accountType}`,
                },
                {
                    key: 'currencyExchange',
                    label: this.$t('currencyExchange'),
                    icon: 'currencyExchange',
                    link: '/edda_app/currency/exchange?langType=' + getLangType(),
                },
                {
                    key: 'activityCenter',
                    label: this.$t('awardCenter'),
                    icon: 'activityCenter',
                    link: '/pages/activityCard.html#/?isReward=1&langType=' + getLangType(),
                },
                {
                    key: 'riskAssessment',
                    label: this.$t('fxcp'),
                    icon: 'riskAssessment',
                    link: '/wealth/riskAssessment.html#/',
                },
                {
                    key: 'transferOutFunds',
                    label: this.$t('extractCapital'),
                    icon: 'transferOutFunds',
                    link: '/edda_app/transferOutFunds/?langType=' + getLangType(),
                },
                {
                    key: 'bankCard',
                    label: this.$t('bankAccount'),
                    icon: 'bankCard',
                    link: '/edda_app/bankCard/?langType=' + getLangType(),
                },
                {
                    key: 'eddaRecord',
                    label: this.$t('capitalRecord'),
                    icon: 'eddaRecord',
                    link: '/edda_app/eddaRecord/?langType=' + getLangType(),
                },
            ]

            list.forEach(item => {
                const isSameProject = (to = '', current = location.pathname) => {
                    const [, currentProject] = current?.split('/') || []
                    const [, toProject] = to?.split('/') || []
                    if (!(currentProject && toProject)) return false
                    return currentProject === toProject
                }
                // 判断一下是否是项目内部还是其它项目的页面地址
                const origin =
                    process.env.NODE_ENV === 'development' && !isSameProject(item.link, location.pathname)
                        ? 'https://sit.mfosunhani.com'
                        : location.origin
                item.link = `${origin}${item.link}`
                // 给ICON统一增加前缀'icon_'
                const iconPrefix = 'icon_'
                item.icon = `${iconPrefix}${item.icon}`
            })
            return list
        },
        // 计算有几个swipeItem，向上取整
        swipeLength() {
            const res = Math.ceil(NP.divide(this.features.length, SWIPE_ITEM_LENGTH))
            return res
        },
        numOfOrdersInProceessing() {
            return this.numOfOrdersInProceessingMap[this.accountType] ?? { ecash: '', ftdSettled: '' }
        },
        // 订单进行中
        doingHtml() {
            return this.$t('doingOrderMsg', { num: ` <span class="c-theme">${this.showAssets ? this.numOfOrdersInProceessing?.ecash : '*'}</span> ` })
        },

        // 定存包到期回款中
        dcbDoingHtml() {
            return this.$t('dcbDoingHtml', {
                num: ` <span class="c-theme">${this.showAssets ? this.numOfOrdersInProceessing?.ftdSettled || '' : '*'}</span> `,
            })
        },

        // 当前账户数据
        currentAccountData() {
            return this[`${this.accountType.toLocaleLowerCase()}Account`] || {}
        },
        // 当前币种数据
        currentCurrencyData() {
            // const currency = currencyKeysMap[this.currency]?.toLocaleLowerCase() ?? ''
            return this.currentAccountData[this.currency] || {}
        },
        //总资产
        totalAssets() {
            const totalAssets = this.currentCurrencyData?.totalAssets ?? ''
            return NP.plus(totalAssets, this.cashBalance) ?? ''
        },
        // 总市值，理财持仓市值
        totalMarketValue() {
            return this.currentCurrencyData?.totalMarketValue ?? ''
        },
        // 最新收益
        yesterdayProfitloss() {
            return this.currentCurrencyData?.yesterdayProfitloss ?? ''
        },
        // 累计收益
        accumulatedProfitloss() {
            return this.currentCurrencyData?.accumulatedProfitloss ?? ''
        },
        // 收益日期
        profitlossDate() {
            return this.currentCurrencyData?.profitlossDate ?? ''
        },
        // 现金（可提现金 + 冻结现金） 现金可用改为withdrawBalance
        cashBalance() {
            return this.currentCurrencyData?.withdrawBalance ?? ''
        },
        // 自动申赎下一次执行时间
        nextAutoBuyTime() {
            if (!this.userSetting) {
                return ''
            }
            const HKDTime = this.userSetting.hkd?.nextAutoBuyTime || ''
            const USDTime = this.userSetting.usd?.nextAutoBuyTime || ''
            return this.accountType === currencyKeysMap.HKD ? HKDTime : USDTime
        },
        hideSubAccountId() {
            return this.accts?.subAcctId.substring(0, 2) + '***' + this.accts?.subAcctId.substr(this.accts?.subAcctId.length - 4)
        },
        componentId1() {
            if (this.ecashStatusInfo.openStatus && this.ecashHoldingsSummary[this.accountType]) {
                return 'starHoldingData'
            }
            if (this.openDepositoryTreasure && this.ftdHoldingsSummary[this.accountType]) {
                return 'depositoryTreasureHolding'
            }
            if (
                this.ecashStatusInfo.openStatus &&
                this.openDepositoryTreasure &&
                !this.ecashHoldingsSummary[this.accountType] &&
                !this.ftdHoldingsSummary[this.accountType]
            ) {
                return 'starHoldingData'
            }
            return ''
        },

        componentId2() {
            // 哪个开通显示哪个
            if (['starHoldingData', ''].includes(this.componentId1) && this.openDepositoryTreasure) {
                return 'depositoryTreasureHolding'
            }

            if (['depositoryTreasureHolding', ''].includes(this.componentId1) && this.ecashStatusInfo.openStatus) {
                return 'starHoldingData'
            }

            return ''
        },
    },
    created() {
        this.init()
    },
    mounted() {
        this.pageShow()
    },
    beforeDestroy() {
        document.removeEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
    },
    methods: {
        async init() {
            try {
                this.numOfOrdersInProceessingMap = {}
                const firstTimeFlag = sessionStorage.getItem('firstTimeFlag') ? true : false
                const flag = localStorage.getItem(WEALTH_AMOUNT_STATUS_kEY)
                const showFlag = JSON.parse(flag)
                this.showAssets = firstTimeFlag && showFlag
                await this.getUserDetail()
                if (!this.isUnsetTradePwd) {
                    this.getRiskInfo()
                    this.getMylinkAssets()
                    this.getOrderStatistics()
                    await this.getEcashUserStatus()
                    this.ecashStatusInfo.openStatus && this.getEcashUserSetting()
                }
            } catch (e) {
                console.log('cmhk-index', e)
            }
        },
        initTradePwd() {
            if (!this.isUnsetTradePwd) {
                this.validateIsFirstTime()
            }
        },
        pageShow() {
            this.propertyData = getPageVisibleSupportProperty()
            // 买入，卖出，开通星财宝返回时，刷新页面
            document.addEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
        },

        // 资产显示，隐藏
        handleAssetsFlag(flag) {
            this.showAssets = flag
            localStorage.setItem(WEALTH_AMOUNT_STATUS_kEY, flag)
            const options = flag ? { reduce: true, increase: false, minFontSize: 12 } : { reduce: false, increase: true, minFontSize: 14 }
            this.dynamicFontSizeFn(options)
        },

        // 复制证券账户
        copySubAccountId() {
            const clipboard = new Clipboard('.copyBtn')
            clipboard.on('success', () => {
                this.$toast(this.$t('copySuccess'))
                clipboard.destroy()
            })
            clipboard.on('error', () => {
                // this.$toast('该浏览器不支持自动复制,请手动复制')
                clipboard.destroy()
            })
        },
        handlePageShow() {
            !document[this.propertyData.hidden] && this.init()
        },
        // 校验是否第一次进来的
        validateIsFirstTime() {
            const firstTimeFlag = sessionStorage.getItem('firstTimeFlag')
            if (!firstTimeFlag) {
                this.tradeLoginDialog =
                    this.tradeLoginDialog ||
                    new TradeLogin({ propsData: { subAcctId: this.accts.subAcctId, showCloseIcon: false, callBack: this.handleTradeConfirm } })
                this.tradeLoginDialog.show = true
            }
        },
        // 获取进行中的订单
        async getOrderStatistics() {
            try {
                if (this.numOfOrdersInProceessingMap[this.accountType]) return
                const params = { account: this.accountType }
                const { result } = await getOrderStatistics(params)
                console.log('**********getOrderStatistics************', result)
                this.$set(this.numOfOrdersInProceessingMap, this.accountType, result?.numOfOrdersInProceessing || {})
            } catch (e) {
                console.error('********getOrderStatistics***error ==> ', e)
            }
        },
        // 获取用户信息
        async getUserDetail() {
            try {
                const res = await this.$store.dispatch('user/getUserInfo', false)
                this.loaded = true
                console.warn('userInfo:', res)
                this.isUnsetTradePwd = res?.clientInfo?.pwdStatus === TRADE_PWD_STATUS.PWD_UNSET
                this.openFundTrade = res?.clientInfo?.accts?.[0]?.openFundTrade === FUND_ACCOUNT_STATUS.FUND_ACCOUNT_OPENED
                this.openDepositoryTreasure = !!res?.clientInfo?.accts?.[0]?.ftdInfo
                console.log('*****this.openDepositoryTreasure*****', this.openDepositoryTreasure)
                if (this.isUnsetTradePwd) {
                    this.goSetPasswordPage()
                }
            } catch (e) {
                console.log('*********user/getUserInfo**********===>error:', e)
                this.loaded = true
            }
        },
        // 去设置交易密码页
        goSetPasswordPage() {
            Dialog.confirm({
                title: this.$t('setPasswordBtn'),
                message: this.$t('setPasswordDialogMessage', { subAcctId: ` <span class="c-theme">${this.accts.subAcctId}</span> ` }),
                width: '75%',
                className: 'custom-dialog',
                overlayClass: 'custom-overlay',
                showCancelButton: false,
                confirmButtonText: this.$t('goSet'),
            })
                .then(() => {
                    const path = encodeURIComponent(location.href)
                    // 去设置交易密码页
                    window.location.href = `${location.origin}/pages/initTradePassword.html#/?reset=0&langType=${getLangType()}&path=${path}`
                })
                .catch(() => {})
        },
        // 获取星财宝开通状态
        async getEcashUserStatus() {
            try {
                this.ecashStatusInfo = await this.$store.dispatch('user/getEcashStatus', true)
                console.warn('星财宝开通状态：', this.ecashStatusInfo)
            } catch (e) {
                console.error('ecashUserStatus===>e:', e)
            }
        },

        //跳转到风险测评
        cepingSure() {
            this.$goPage('/', {}, { pathname: '/wealth/riskAssessment.html' })
        },

        openPage(e) {
            const { link, key } = e.target?.dataset || {}
            if (!link) return
            // 弹出交易密码逻辑暂时放这里，后续删除
            if (key === 'dialog') {
                this.tradeLoginDialog.show = true
                return
            }

            if (key === 'starPage' || key === 'depositTreasurePage') {
                this.goPage(key)
            } else {
                this.$goPage(link)
            }
        },

        // 去开通理财账户页
        gotoOpenAccount() {
            this.$goPage('/', { path: encodeURIComponent(location.href) }, { pathname: '/pages/fundAccount.html' })
        },

        // 交易判断
        async handleTradeFn(key, link) {
            // 未开通理财账户
            if (!this.openFundTrade) {
                Dialog.confirm({
                    title: this.$t('openFundAccountTips'),
                    message: this.$t('openManagerAssets'),
                    messageAlign: 'center',
                    width: '75%',
                    className: 'custom-dialog',
                    overlayClass: 'custom-overlay',
                    confirmButtonText: this.$t('soonOpen'),
                })
                    .then(() => {
                        this.$goPage('/', { path: encodeURIComponent(location.href) }, { pathname: '/pages/fundAccount.html' })
                    })
                    .catch(() => {})
                return
            }
            if (this.cepingText) {
                // 风测错误
                this.cepingDiag = true
                return
            }
            if (!this.ecashStatusInfo.openStatus) {
                // 自动买入设置
                const message = key === 'autoDeal' ? this.$t('needOpenEcash') : this.$t('tradeOpenMessage')
                this.handleDialog(message)
                return
            }

            if (await isOlderAge65()) return
            this.$goPage(link)
        },

        // 获取风测信息
        async getRiskInfo() {
            // 获取风测信息
            const data = await this.getAssessStatus()
            const isAssessed = data?.result?.isAssessed
            const isExpired = data?.result?.isExpired
            if (isAssessed == 2 || isExpired == 1) {
                // 是否已经评测，1，是，2，否
                if (isAssessed == 2) {
                    this.cepingText = this.$t('jcdnwtjgfxcp')
                }
                // 是否评测过期，1，是，2，否
                if (isExpired == 1) {
                    this.cepingText = this.$t('ndfxcpjgygq')
                }
            } else {
                this.cepingText = ''
            }
        },

        getFeatures(idx) {
            const start = idx * SWIPE_ITEM_LENGTH
            const end = start + SWIPE_ITEM_LENGTH
            const res = this.features.slice(start, end)
            return res
        },
        // choose account
        onAccountChange(type) {
            this.accountType = type
            this.currency = type
            // this.getEcashHolding()
            this.getOrderStatistics()
        },

        // 输入交易密码后回调
        handleTradeConfirm() {
            sessionStorage.setItem('firstTimeFlag', 1)
            this.handleAssetsFlag(true)
        },

        // 页面跳转
        goPage(type) {
            switch (type) {
                // 自动买入设置
                case 'autoDeal':
                    this.handleTradeFn('autoDeal', `${location.origin}/wealth/cashBox.html#/autoDeal?accountType=${this.accountType}`)
                    break
                // 星财宝专页
                case 'starPage':
                    this.$goPage(`${location.origin}/wealth/cashBox.html#/?accountType=${this.accountType}`)
                    break
                // 定存宝页面
                case 'depositTreasurePage':
                    this.openDepositoryTreasure
                        ? this.$goPage(
                              `${location.origin}/wealth/fixedDepositTreasure.html#/?accountType=${this.accountType}&currency=${this.currency}`
                          )
                        : this.$goPage(`${location.origin}/wealth/fixedDepositTreasure.html#/about?open=1`)
                    break
                // 进行中的订单
                case 'processing':
                    this.$goPage(
                        '/order-list',
                        { productType: 9, lock: 1, haveDoing: 1, accountType: this.accountType },
                        { pathname: '/wealth/fund.html' }
                    )
                    break
                // 星财宝订单页面
                case 'starOrderList':
                    this.$goPage('/order-list', { productType: 9, lock: 1, accountType: this.accountType }, { pathname: '/wealth/fund.html' })
                    break
                // 定存宝，到期汇款中的订单
                case 'receivedMoney':
                    this.$goPage('/order-list', { status: 700, accountType: this.accountType }, { pathname: '/wealth/fixedDepositTreasure.html' })
                    break
                default:
                    break
            }
        },

        // 未开通星财宝，弹窗
        handleDialog(title) {
            Dialog.confirm({
                title,
                message: this.$t('exceedSaveWealth'),
                messageAlign: 'center',
                width: '75%',
                className: 'custom-dialog',
                overlayClass: 'custom-overlay',
                confirmButtonText: this.$t('soonOpen'),
            })
                .then(() => {
                    this.$goPage('/beforeSign', {}, { pathname: '/wealth/cashBox.html', url: encodeURIComponent(location.href) })
                })
                .catch(() => {})
        },

        // mylink首页资产信息
        async getMylinkAssets() {
            try {
                this.$loading.show = true
                const { result } = await mylinkAssetsDetail()
                this.initTradePwd()
                console.log('*************getMylinkAssets***********', result)
                const { assetsDetail, ecashHoldingsSummary, ftdHoldingsSummary } = result || {}
                this.hkdAccount = assetsDetail?.hkdAccount || {}
                this.usdAccount = assetsDetail?.usdAccount || {}
                console.log('ecashHoldingsSummary', ecashHoldingsSummary, 'ftdHoldingsSummary', ftdHoldingsSummary)
                this.ecashHoldingsSummary = ecashHoldingsSummary || {}
                this.ftdHoldingsSummary = ftdHoldingsSummary || {}
                this.dynamicFontSizeFn()
            } catch (error) {
                console.log('******error*******getMylinkAssets***********', error)
                error?.error?.data?.tips && this.$toast(error?.error?.data?.tips)
            } finally {
                this.$loading.show = false
            }
        },

        dynamicFontSizeFn(options = { minFontSize: 12 }) {
            this.$nextTick(() => {
                const arr = ['cashDom', 'totalMarketValueDom']
                arr.forEach(item => {
                    dynamicFontSize({ ...options, maxFontSize: 14, dom: item, context: this })
                })
            })
        },

        // 获取星财宝自动买入时间
        async getEcashUserSetting() {
            try {
                const { result } = await ecashUserSetting()
                this.userSetting = result || {}
            } catch (error) {
                console.log('ecashUserSetting===>error:', error)
                error?.error?.data?.tips && this.$toast(error?.error?.data?.tips)
            }
        },
    },
}
</script>

<style scoped lang="less">
.mar-l6 {
    margin-left: 6px;
}

.w-100 {
    width: 100px;
}

.w-108 {
    width: 108px;
}

.index {
    height: 100vh;
    overflow: hidden;

    .tab-main {
        height: 36px;
        color: #666;
        font-size: 15px;

        .active {
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
        }
    }

    .account-info {
        position: relative;
        padding: 16px 12px 12px;

        .bg-account {
            position: absolute;
            top: 0;
            right: 0;
            width: 98px;
            height: 98px;
        }
    }

    .link-main {
        .item {
            display: inline-block;
            vertical-align: middle;
        }

        .divider {
            width: 0;
            height: 12px;
            margin: 0 16px;
            border-right: 0.5px solid #e0dfdf;
        }
    }

    .features {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
        padding-top: 16px;
        padding-bottom: 26px;
        overflow: auto;
        background: #fff;
        border-radius: 8px;

        &-item {
            display: flex;
            flex: 0 0 auto;
            flex-direction: column;
            align-items: center;
            width: calc(100% / 4);

            .img-box {
                width: 24px;
                height: 24px;
                overflow: hidden;
            }

            span {
                margin-top: 8px;
                color: @fontBlackColor;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    :deep(.van-swipe__indicators) {
        .van-swipe__indicator {
            width: 8px;
            height: 2px;
            background: #9c9c9c;
            border-radius: 0;
            opacity: 0.4;

            &:not(:last-child) {
                margin-right: 4px;
            }

            &.van-swipe__indicator--active {
                background: #ff6907;
                opacity: 1;
            }
        }
    }
}

.list {
    width: 94px;
    overflow: hidden;
    border-radius: 4px;

    .item {
        font-size: 14px;
        line-height: 36px;
        text-align: center;
        #font_h1();
        #dialog_background();
        #box_shadow_2();

        &.selected {
            color: #ff6307;
        }
    }
}

.risk-dialog__content {
    padding: 0 16px 28px;
    color: #2f2f2f;
    font-size: 14px;
    line-height: 20px;
}

.auto-tips {
    margin: 14px auto 4px;
    padding-left: 8px;
    color: #666;
    line-height: 38px;
    background: #f9f9f9;
    border-radius: 4px;
}
</style>
