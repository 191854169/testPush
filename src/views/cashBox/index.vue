<template>
    <div class="cashIndex">
        <van-pull-refresh v-model="isLoading" @refresh="onRefresh" :disabled="showGuide" style="min-height: 100vh">
            <div class="cash-box-content">
                <div class="account" @click="chooseFlag = true">
                    <multi-img class="logo" :name="`account-type__${accountType}`" directory="common" />
                    <span>{{ curAccount }}</span>
                    <multi-img class="select" name="angle_trigger" directory="fund" alt="select"></multi-img>
                </div>
                <div class="cashBox">
                    <div class="bg">
                        <multi-img class="bgImg" name="xcb_" directory="cashBox"></multi-img>
                    </div>
                    <asset-total
                        class="total"
                        :asset-msg="$t('zcjz')"
                        :currency="currencyFinal"
                        @choose="currencyChooseHandler"
                        :amount="totalAssetsFinal"
                        :riseFall="false"
                        :sign="false"
                        @showAssetsHandler="toggleAssets"
                    ></asset-total>
                    <!-- 买入、卖出待处理 -->
                    <div class="passage-asset-container">
                        <div class="passage-asset" v-show="showAssets" ref="passageAsset">
                            <div class="passage-asset__left">
                                <p class="content pointer">
                                    <span class="content-title">{{ $t('rollIn') }}{{ $t('daiqueren') }}：</span>
                                    <span class="content-value" ref="buyingAmount">{{ buyingAmount | thousandsFilter }}</span>
                                </p>
                            </div>
                            <div class="passage-asset__right">
                                <p class="content">
                                    <span class="content-title">{{ $t('canSellAmount') }}：</span>
                                    <span class="content-value" ref="sellableAmount">{{ sellableAmount | thousandsFilter }}</span>
                                </p>
                            </div>
                        </div>
                        <div class="passage-asset" v-show="!showAssets">
                            <div class="passage-asset__left">
                                <span class="content pointer">{{ $t('rollIn') }}{{ $t('daiqueren') }}：****</span>
                            </div>
                            <div class="passage-asset__right">
                                <span>{{ $t('canSellAmount') }}：****</span>
                            </div>
                        </div>
                    </div>
                    <div class="earnings">
                        <div class="item" @click="goLatestIncome">
                            <span class="tit">{{ $t('newIncome') }}{{ profitlossDate | profitLostDateFormat }}</span>
                            <span class="radio">
                                <strong v-show="showAssets" class="xcbrise">
                                    <span class="update" v-show="showUpdateIncome">{{ $t('updating') }}</span>
                                    <span
                                        v-show="!showUpdateIncome"
                                        v-riseFall="{ value: yesterdayProfitlossFinal, rate: false, thousand: true, normal: true }"
                                    ></span>
                                </strong>
                                <strong v-show="!showAssets" class="hide">****</strong>
                            </span>
                        </div>
                        <div class="item">
                            <span class="tit">{{ $t('ljsy') }}</span>
                            <span class="radio">
                                <strong
                                    v-show="showAssets"
                                    class="xcbrise"
                                    v-riseFall="{ value: accumulatedProfitlossFinal, rate: false, thousand: true, normal: true }"
                                ></strong>
                                <strong v-show="!showAssets" class="hide">****</strong>
                            </span>
                        </div>
                        <!-- 新手引导 - 01 -->
                        <div v-if="showGuide" v-show="guideStep === 1" class="guide-auto-next" @touchstart.prevent="handleGuide">
                            <p class="auto-time">{{ $t('nextAutoBuyTime') }}{{ guideTime }}</p>
                            <p class="auto-text" v-html="$t('ecashGuideTest1')"></p>
                            <multi-img name="ecash-guide-1" directory="noob" />
                        </div>
                    </div>
                    <div class="kq-tips" v-if="haveAutoSign">
                        <div class="left">
                            <span>{{ $t('nextAutoBuyTime') }}{{ nextAutoBuyTime | dateFormat }}</span>
                        </div>
                    </div>
                    <div class="btncontent">
                        <van-button type="primary" @click="rollOutClick" class="out">{{ $t('rollOut') }}</van-button>
                        <van-button type="primary" v-debounce="$event => goTrade('rollIn')" class="to">{{ $t('rollIn') }}</van-button>
                    </div>
                </div>
            </div>
            <ul class="operateBox">
                <li v-for="(item, index) in operateArr" :key="index" v-debounce="() => openPageLocal(item)">
                    <multi-img class="icon" :name="item.icon" directory="cashBox" :alt="item.icon"></multi-img>
                    <div class="title">{{ item.title }}</div>
                </li>
                <div v-if="showGuide" v-show="guideStep === 2" class="guide-auto-setting" @touchstart.prevent="handleGuide">
                    <li class="guide-setting">
                        <multi-img class="icon" :name="operateArr[3].icon" directory="cashBox" :alt="operateArr[3].icon"></multi-img>
                        <div class="title">{{ operateArr[3].title }}</div>
                    </li>
                    <p class="guide-setting__text">{{ $t('ecashGuideTest2') }}</p>
                    <multi-img class="guide-img" name="ecash-guide-2" directory="noob" />
                </div>
            </ul>
            <div class="tips">
                <div class="des" @click="goxcbExplain">
                    <span>{{ $t('seeSmsxcb') }}？</span>
                    <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                </div>
                <div class="des" @click="goPurchasing">
                    <span>{{ $t('promotePurchasing') }}</span>
                    <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                </div>
            </div>
            <div class="tips-ontent">
                <p>{{ $t('riskWarning') }}</p>
                <span>{{ $t('riskDescText1') }}</span>
                <span class="cusapn">{{ $t('riskDescText2') }}</span>
            </div>
            <div class="product">
                <div class="left" @click="goProfitDescPage">{{ $t('profitDesc') }}</div>
                <div class="left" @click="onRemind">{{ $t('commonQuestion') }}</div>
                <div class="right" @click="goProduct">{{ $t('productDetail') }}</div>
            </div>
        </van-pull-refresh>
        <account-choose :type="accountType" v-model="chooseFlag" @choose="chooseHandler"></account-choose>
        <sell-cash-box v-model="sellCashBoxVisible" @choose="onChooseAccount" />
    </div>
</template>
<script>
import { isInRyH5, isInOutsideH5 } from '@/utils'
import { Overlay, Toast } from 'vant'
import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js'
import { thousandsFilter } from '@/config/filters.js'
import { ecashAssetsDetailInfo, ecashUserSetting } from '@/apis/wealth/index.js'
import isOlderAge65 from '@/mixins/AgeLimit/index.js'
import AccountChoose from '@/components/AccountChoose.vue'
import { accountMap, currencyMap } from '@/config/common'
import AssetTotal from '@/components/AssetTotal.vue'
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import { dynamicFontSize } from '@/utils'
import pathnames from '@/config/H5Pathname.js'
import SellCashBox from '@/components/SellCashBox.vue'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import pageUrl from '@/config/pageUrl'
import { addUrlQuery } from '@fs/utils'

const accountKeyMap = accountMap.keysMap
const accountKeyValueMap = accountMap.keyValueMap
const currencyKeysMap = currencyMap.keysMap
export default {
    name: 'cashBox',
    mixins: [verifyMixin],
    components: {
        [Overlay.name]: Overlay,
        AccountChoose,
        AssetTotal,
        SellCashBox,
    },
    filters: {
        thousandsFilter(num) {
            return num ? `${thousandsFilter(num)}` : '--'
        },
        dateFormat(v) {
            return v ? dayjs(v).format('YYYY/MM/DD HH:mm') : '--'
        },
        profitLostDateFormat(date) {
            return date ? `(${dayjs(date).format('MM/DD')})` : ''
        },
    },
    data() {
        return {
            ecashHomeGuideKey: 'ECASH_HOME_GUIDE_KEY', // 星财宝首页新手引导key
            showGuide: false, // 新手引导
            guideStep: 1, // 新手引导步骤几
            dynamicFontOptions: {
                minFontSize: 10,
                maxFontSize: 12,
            },
            operateArr: [
                {
                    title: this.$t('symx'),
                    icon: 'trade_detail',
                    url: '/incomeDetails',
                },
                {
                    title: this.$t('ddjl'),
                    icon: 'trade_record',
                    url: '/orderHistory',
                },
                {
                    title: this.$t('holdingDetail'),
                    icon: 'ccmx',
                    url: '/hold-detail',
                },
                {
                    title: this.$t('autoTradeSetting'),
                    icon: 'icon-setup',
                    url: '/autoDeal',
                },
            ],
            allAccount: {
                hkd: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0, // 收益更新状态 0-未更新， 1-部分更新，2-已全部更新
                },
                usd: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
                cnh: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
            },
            hkdAccount: {
                hkd: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
                usd: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
                cnh: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
            },
            usdAccount: {
                hkd: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
                usd: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
                cnh: {
                    totalAssets: '',
                    totalMarketValue: '',
                    accumulatedProfitloss: '',
                    yesterdayProfitloss: '',
                    annualReturn7d: '',
                    profitlossDate: '',
                    buyingAmount: '',
                    sellableAmount: '',
                    profitlossUpdateStatus: 0,
                },
            },
            currencyFinal: 'HKD', //当前币种
            list: [],
            showAssets: true,
            isLoading: false,
            autoStatus: '',
            accountType: this.$route.query.accountType || accountKeyMap.ALL,
            accountListMap: accountKeyValueMap,
            chooseFlag: false,
            userSetting: null, // 用户设置信息
            ecashStatusInfo: {}, // 星财宝开通状态
            openStatusMap: {}, // 开户状态
            sellCashBoxVisible: false,
        }
    },
    computed: {
        // 睿银资产显示与隐藏状态 showAsset
        ...mapState('user', ['accts', 'showAsset']),

        // 判断是否在睿银
        isInRy() {
            return isInRyH5()
        },

        guideTime() {
            return dayjs().set('hour', 8).set('minute', 50).add(1, 'day').format('YYYY/MM/DD HH:mm')
        },
        iconEye() {
            return this.showAssets ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
        showUpdateIncome() {
            return this.totalMarketValue && +this.totalMarketValue > 0 && !this.yesterdayProfitlossFinal
        },
        curAccount() {
            return this.accountListMap[this.accountType] || ''
        },
        // 判断自动买入是否开启
        haveAutoSign() {
            if (!this.userSetting) {
                return false
            }
            const HKDStatus = this.userSetting.hkd?.subscriptionStatus === 1
            const USDStatus = this.userSetting.usd?.subscriptionStatus === 1
            if (this.accountType === accountKeyMap.ALL) {
                return HKDStatus || USDStatus
            }
            return this.accountType === accountKeyMap.HKD ? HKDStatus : USDStatus
        },
        // 自动申赎下一次执行时间
        nextAutoBuyTime() {
            if (!this.userSetting) {
                return ''
            }
            const HKDTime = this.userSetting.hkd?.nextAutoBuyTime || ''
            const USDTime = this.userSetting.usd?.nextAutoBuyTime || ''
            if (this.accountType === accountKeyMap.ALL) {
                // 全部账户下 显示最近的交易日期
                if (HKDTime && USDTime) {
                    return dayjs(HKDTime).valueOf() < dayjs(USDTime).valueOf() ? HKDTime : USDTime
                }
                return HKDTime || USDTime
            }
            return this.accountType === accountKeyMap.HKD ? HKDTime : USDTime
        },
        // 展示星财宝开通引导 （未开通）
        showEcashIntro() {
            return this.ecashStatusInfo.openStatus !== 1
        },

        // 是否可交易
        isTradble() {
            return this.userSetting ? this.userSetting.tradble : false
        },
        //总资产
        totalAssetsFinal() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.totalAssets ?? '' : ''
        },
        // 总市值，理财持仓市值
        totalMarketValue() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.totalMarketValue ?? '' : ''
        },
        // 最新收益
        yesterdayProfitlossFinal() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.yesterdayProfitloss ?? '' : ''
        },
        // 累计收益
        accumulatedProfitlossFinal() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.accumulatedProfitloss ?? '' : ''
        },
        // 综合七日年化
        annualReturn7dFinal() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.annualReturn7d ?? '' : ''
        },
        // 收益日期
        profitlossDate() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.profitlossDate ?? '' : ''
        },
        // string	进行中的买入订单金额总和
        buyingAmount() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.buyingAmount ?? '' : ''
        },
        // string	可卖出金额
        sellableAmount() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.sellableAmount ?? '' : ''
        },
        // 收益更新状态
        profitlossUpdateStatus() {
            const account = this.accountType.toLocaleLowerCase()
            const currency = currencyKeysMap[this.currencyFinal]?.toLocaleLowerCase() ?? ''
            return this[`${account}Account`] ? this[`${account}Account`][currency]?.profitlossUpdateStatus ?? '' : ''
        },
    },
    watch: {
        accountType: {
            async handler(val) {
                if (val) {
                    await this.getECashAssetsDetail()
                }
            },
        },
        //  买入待受理文字调整
        buyingAmount() {
            // TODO:
            this.resetFontSize()
        },
        sellableAmount() {
            this.resetFontSize()
        },
    },
    async created() {
        this.getGuide()
        // 同步币种
        this.chooseHandler(this.accountType)

        // 全部账号使用路由传递的币种信息
        if (this.accountType === 'ALL' && this.$route.query.currency) {
            this.currencyFinal = this.$route.query.currency
        }

        if (JSBridge) {
            JSBridge.getAssetsShowStatus().then(data => {
                this.showAssets = data
            })
        } else if (isInOutsideH5()) {
            // 睿银项目中，星财宝与资产首页显示与隐藏状态保持一致
            this.showAssets = this.showAsset
        }
    },
    async mounted() {
        this.$loading.show = {
            show: true,
            options: {
                mask: true,
            },
        }
        await this.init()
        this.$loading.show = false
        this.$jsBridge && this.$jsBridge.watchPageVisible(this.init)
    },
    methods: {
        async init() {
            try {
                await this.getEcashUserStatus()
                if (this.ecashStatusInfo.openStatus) {
                    this.getUserSetting()
                    this.getECashAssetsDetail()
                } else {
                    // 兜底关闭 loading
                    this.$router.replace('/beforeSign')
                    this.$loading.show = false
                    return
                }
            } catch (e) {
                console.log('cashBox-init===>error:', e)
            }
        },
        rollOutClick() {
            if (!this.usNationalityVerify(true)) return
            this.sellCashBoxVisible = true
        },
        // 交易 orient: rollIn: 买入, rollOut: 卖出
        async goTrade(orient = 'rollIn') {
            if (!this.usNationalityVerify(orient === 'rollOut')) {
                return
            }
            if (orient === 'rollIn') {
                // 风测过期校验
                if (!(await this.checkRiskAssessmentExpiredStatus())) return
            }
            this.$goPage(`/trade/${orient}`, {
                accountType: this.accountType,
            })
        },
        onChooseAccount({ type, goTransferOutPage }) {
            if (type === 'stock') {
                this.goTrade('rollOut')
            }

            if (type === 'bank') {
                let currency = this.accountType === 'ALL' ? 'HKD' : this.accountType

                // 全部账号跳转传有可卖出金额的币种
                if (this.accountType === 'ALL') {
                    const ccyOrder = ['hkd', 'usd', 'cnh']
                    for (let i = 0; i < ccyOrder.length; i++) {
                        const account = this.allAccount[ccyOrder[i]]
                        if (account && Number(account.sellableAmount) > 0) {
                            currency = ccyOrder[i].toUpperCase()
                            break
                        }
                    }
                }

                goTransferOutPage({
                    currency,
                })
            }
        },
        goProfitDescPage() {
            this.$goPage(pageUrl.FAQ_PROFIT_DESC)
        },
        onRemind() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=COMMONPROBLEM-ST`
            if (this.$openPageInThs(url)) return
            if (this.$openPageInI18NThs(url)) return
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
        // 选择账户
        chooseHandler(type) {
            this.accountType = type
            this.chooseFlag = false
            //选择账户默认对应账户相关的币种
            this.currencyFinal = type === 'ALL' ? 'HKD' : type
        },
        // 选择币种
        async currencyChooseHandler(currency) {
            this.currencyFinal = currency
            await this.getECashAssetsDetail()
        },
        goProduct() {
            this.$goPage('/productDetails')
        },
        goLatestIncome() {
            const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
            const url = addUrlQuery(`${location.origin}/wealth/fund.html#/profit`, {
                assetType: 'cashBox',
                startDate: this.profitlossDate || yesterday,
                endDate: this.profitlossDate || yesterday,
                accountType: this.accountType,
            })
            this.$goPage(url)
        },
        goxcbExplain() {
            this.$goPage('/xcbExplain')
        },
        goPurchasing() {
            const { VUE_APP_PURCHASING_H5: url } = pathnames
            console.log('提升购买力url：', url)
            url && this.$goPage(url)
        },
        async goAutoDeal() {
            if (await isOlderAge65()) return
            this.$goPage('/autoDeal')
        },
        async onRefresh() {
            if (JSBridge) {
                JSBridge.getAssetsShowStatus().then(data => {
                    this.showAssets = data
                })
            }
            await this.getECashAssetsDetail()
            this.isLoading = false
        },
        toggleAssets(v) {
            this.showAssets = v
        },
        async openPageLocal(item) {
            if (item.url === '/incomeDetails') {
                const url = `${location.origin}/wealth/fund.html#/profit?assetType=cashBox&accountType=${this.accountType}&dateType=0&currency=${this.currencyFinal}`
                this.$goPage(url)
                return
            }
            let url = ''

            if (item.url === '/orderHistory') {
                url = `${location.origin}/wealth/fund.html#/order-list?productType=9&accountType=${this.accountType}`
            } else {
                if (item.url === '/autoDeal') {
                    if (await isOlderAge65()) return

                    if (this.showEcashIntro) {
                        this.$dialog
                            .confirm({
                                className: 'ecash-open-dialog',
                                title: this.$t('prompt'),
                                message: `<p>${this.$t('needOpenEcash')}</p><p>${this.$t('exceedSaveWealth')}</p>`,
                                confirmButtonText: this.$t('soonOpen'),
                                cancelButtonText: this.$t('cancel'),
                            })
                            .then(() => {
                                this.goEcashOpen()
                            })
                            .catch(() => {})
                        return
                    }

                    // 设置页router跳转 回来刷新状态
                    this.$goPage(item.url, {
                        accountType: this.accountType,
                    })
                    return
                }
                url = `${location.origin}/wealth/cashBox.html#${item.url}?accountType=${this.accountType}`
            }
            this.$goPage(url)
        },
        //获取用户资产详情 ECashAssetsDetail
        async getECashAssetsDetail() {
            try {
                const { result } = await ecashAssetsDetailInfo()
                console.warn('ecashAssetsDetailInfo=>result', result)
                this.allAccount = result?.allAccount || {}
                this.hkdAccount = result?.hkdAccount || {}
                this.usdAccount = result?.usdAccount || {}
            } catch (error) {
                if (error?.error?.data?.tips) {
                    Toast(error?.error?.data?.tips)
                }
            }
        },
        //获取用户信息
        async getUserSetting() {
            try {
                const { result = {} } = await ecashUserSetting()
                this.userSetting = result || {}
                console.log('userSetting:', this.userSetting)
            } catch (error) {
                console.log('ecashUserSetting===>error:', error.code, error)
                error?.error?.data?.tips && Toast(error?.error?.data?.tips)
            }
        },

        // 重新设置字体大小
        resetFontSize() {
            this.$nextTick(() => {
                const keys = ['buyingAmount', 'sellableAmount']
                keys.forEach(dom => {
                    dynamicFontSize({ dom: this.$refs[dom], minFontSize: 9, interval: 1 })
                })
            })
        },

        // 前往开通页
        goEcashOpen() {
            this.$goPage('/sign')
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

        // 获取新手引导
        async getGuide() {
            if (this.$jsBridge) {
                try {
                    const data = await this.$jsBridge.readLocalStorage(this.ecashHomeGuideKey)
                    this.showGuide = !(data && data.value)
                } catch (e) {
                    console.error('wealth-ecash-readLocalStorage===>error:', this.ecashHomeGuideKey, e)
                }
            }
        },
        // 处理新手引导
        async handleGuide() {
            if (this.guideStep === 1) {
                // 第一步点击就添加app缓存
                try {
                    if (this.$jsBridge) {
                        await this.$jsBridge.writeLocalStorage(this.ecashHomeGuideKey, '1')
                    }
                } catch (e) {
                    console.error('wealth-ecash-readLocalStorage===>error:', this.ecashHomeGuideKey, e)
                }
            } else {
                // 第二步点击 关闭新手引导
                this.showGuide = false
            }
            this.guideStep++
        },
    },
}
</script>
<style lang="less" scoped>
.cashIndex {
    /deep/.van-pull-refresh__track {
        height: 100%;
        background: #f9f9f9;
    }

    .cash-box-content {
        position: relative;
        z-index: 1000;
        margin: 12px;
        background: @white;
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #ffe9dd;
        backdrop-filter: blur(27.1828px);

        .bg {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 1;

            .bgImg {
                width: 94px;
                // height: 94px;
            }
        }

        .account {
            display: flex;
            flex: 0 0 auto;
            align-items: center;
            width: 100%;
            padding: 16px 12px 0;
            line-height: 21px;
            background: @white;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;

            span {
                margin: 0 6px;
                color: @fontBlackColor;
                font-weight: 500;
                font-size: 15px;
                line-height: 21px;
            }

            .logo {
                width: 16px;
                height: 16px;
            }

            .select {
                width: 6px;
                height: 6px;
            }
        }
    }

    .cashBox {
        background: @white;
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 @white;

        .total {
            ::v-deep(h3) {
                span {
                    font-weight: 700;
                    font-size: 30px;
                    line-height: 42px;
                }
            }
        }

        .passage-asset-container {
            position: relative;
            display: flex;
            justify-content: center;
            margin: 0 12px 20px;

            &::after {
                position: absolute;
                top: 0;
                left: 50%;
                width: 0;
                height: 0;
                border-right: 5px solid;
                border-right-color: transparent;
                border-bottom: 5px solid;
                border-bottom-color: #fff3e6;
                border-left: 5px solid;
                border-left-color: transparent;
                transform: translate(-50%, -100%);
                content: '';
            }
        }

        .passage-asset {
            display: flex;
            align-items: center;
            // flex: 0 0 auto;
            padding: 8px 16px;
            color: @fontLightColor;
            font-size: 12px;
            line-height: 16px;
            background: linear-gradient(106deg, rgba(255, 141, 7, 0.09) 0%, rgba(255, 111, 7, 0.05) 100%);
            border-radius: 29px;

            &__left,
            &__right {
                width: 140px;
            }

            &__right {
                margin-left: 16px;
            }

            .content {
                display: flex;
                flex: 1 0 auto;

                .content-title {
                    flex: 0 0 auto;
                }

                .content-value {
                    flex: 1 0 auto;
                    width: 71px;
                    overflow: hidden;
                    font-weight: 700;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
            }
        }

        .btncontent {
            display: flex;
            justify-content: space-between;
            padding: 16px 12px 24px;

            button {
                width: 156px;
                height: 40px;
                font-weight: 700;
                font-size: 16px;
                border: none;
                border-radius: 31px;
            }

            .out {
                color: @theme;
                background: rgba(@theme, 0.1);
            }

            .to {
                color: @white;
                background: @theme;
            }
        }

        .earnings {
            position: relative;
            height: 40px;
            margin: 0 12px;
            font-size: 12px;
            line-height: 17px;

            .item {
                position: absolute;
                top: 0;
                z-index: 1;
                display: flex;
                flex-direction: column;
                text-align: center;

                .tit {
                    margin-bottom: 4px;
                    color: @fontGreyColor;
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
                    font-weight: 700;
                    font-size: 16px;
                    line-height: 20px;

                    .xcbrise {
                        font-size: 16px;

                        .update {
                            color: @fontBlackColor;
                            font-weight: 400;
                            font-size: 14px;
                        }
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

            .guide-auto-next {
                position: absolute;
                right: 0;
                bottom: -190px;
                left: 0;

                p.auto-time {
                    position: relative;
                    z-index: 2000;
                    padding: 12px 8px;
                    color: @fontBlackColor;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 22px;
                    background-color: @white;
                    border-radius: 46px;
                }

                p.auto-text {
                    position: absolute;
                    bottom: 12px;
                    left: 33px;
                    z-index: 2002;
                    width: 189px;
                    color: #ff6108;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 22px;
                }

                img {
                    position: relative;
                    z-index: 2000;
                    display: block;
                    width: 316px;
                    height: 140px;
                    margin: 4px 0 0 9px;
                }

                &::after {
                    position: absolute;
                    top: -100vh;
                    left: -100vw;
                    z-index: 1000;
                    width: 200vw;
                    height: 200vh;
                    background-color: rgba(0, 0, 0, 0.7);
                    content: '';
                }
            }
        }

        .kq-tips {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 16px 12px 0;

            .left {
                display: flex;
                align-items: center;
            }

            span {
                font-size: 12px;
                line-height: 22px;
                white-space: nowrap;
            }

            img {
                width: 16px;
                height: 16px;
            }
        }
    }

    .operateBox {
        position: relative;
        display: flex;
        flex-direction: row;
        height: 80px;
        margin: 12px;
        background: @white;
        border-radius: 8px;

        li {
            display: flex;
            flex: 1;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .icon {
                width: 24px;
                height: 24px;
                margin-bottom: 9px;
            }

            .title {
                font-size: 12px;
            }
        }

        .guide-auto-setting {
            position: absolute;
            top: 4px;
            right: 0;

            li.guide-setting {
                position: relative;
                z-index: 2000;
                width: 96px;
                height: 72px;
                background-color: @white;
                border-radius: 72px;
            }

            .guide-setting__text {
                position: absolute;
                top: calc(-142px + 33px);
                right: 115px;
                z-index: 2001;
                width: 192px;
                color: #ff6108;
                font-weight: 400;
                font-size: 14px;
                line-height: 22px;
            }

            img.guide-img {
                position: absolute;
                top: -142px;
                right: 12px;
                z-index: 2000;
                display: block;
                width: 315px;
                max-width: none;
                height: 184px;
            }

            &::after {
                position: absolute;
                top: -100vh;
                right: -100vw;
                z-index: 1000;
                width: 200vw;
                height: 200vh;
                background-color: rgba(0, 0, 0, 0.7);
                content: '';
            }
        }
    }

    .tips {
        margin: 12px;
        padding: 0 12px;
        background-color: @white;
        border-radius: 8px;
        box-shadow: inset 0.5px 0.5px 0 @white;

        .slogan {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 17px 0 12px;
            border-bottom: 0.5px solid #efefef;

            .slogan-left {
                display: flex;
                align-items: center;

                img {
                    width: 35px;
                    height: 35px;
                    margin-right: 12px;
                }

                .left-content {
                    display: flex;
                    flex-direction: column;

                    .open-title {
                        color: @fontBlackColor;
                        font-weight: 500;
                        font-size: 16px;
                        line-height: 22px;
                    }

                    .left-desc {
                        display: flex;
                        align-items: center;
                        margin-top: 4px;
                        color: @fontLightColor;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;

                        .divider {
                            height: 11px;
                            margin: 0 6px;
                            border-left: 0.5px solid #cfcfcf;
                        }
                    }
                }
            }

            .slogan-right {
                padding: 4px 12px;
                color: @white;
                font-weight: 500;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
                background: @theme;
                border-width: 0;
                border-radius: 14px;
            }
        }

        .des {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;

            img {
                width: 16px;
                height: 16px;
            }
        }
    }

    .tips-ontent {
        min-height: 215px;
        padding: 16px;
        color: @fontGreyColor;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;

        p {
            margin-bottom: 8px;
        }

        .cusapn {
            display: block;
            margin-top: 8px;
        }
    }

    .product {
        display: flex;
        justify-content: center;
        padding-top: 16px;
        padding-bottom: 58px;

        div {
            padding: 0 16px;
            color: @theme;
            font-weight: 400;
            font-size: 14px;
            line-height: 14px;
        }

        .left {
            border-right: 0.5px solid @fontGreyColor;
        }
    }

    .customFooter {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding-bottom: 58px;
    }

    .holdTitle {
        position: relative;
        margin-top: 12px;
        padding-top: 7px;
        padding-bottom: 16px;
        padding-left: 12px;
        color: #1f1f1f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        background: @white;
    }

    .noHold {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 84px 0;
        color: @fontGreyColor;
        font-size: 14px;
        line-height: 20px;
        background: @white;

        .noHoldImg {
            width: 104px;
            height: 104px;
            margin-bottom: 12px;
        }
    }

    .table {
        background: @white;

        .row {
            display: flex;
            flex-direction: row;
            align-items: center;

            .fundName {
                width: 152px;
            }

            .number {
                width: 104px;
                text-align: right;

                .icon {
                    width: 10px;
                    height: 10px;
                }
            }

            .blank {
                flex: 1;
                height: 16px;
            }

            .operate {
                width: 80px;
                font-weight: 700;
                text-align: center;
            }
        }

        .tabTitle {
            padding: 4px 0;
            padding-left: 11px;
            color: @fontGreyColor;
            font-size: 12px;
            line-height: 16px;
        }

        .body {
            .row {
                height: 56px;
                padding-left: 12px;
                box-shadow: inset -12px 0 0 @white, inset 12px 0 0 @white, inset 0 -0.5px 0 #efefef;

                &:last-child {
                    box-shadow: none;
                }

                .fundName {
                    font-size: 16px;
                }
            }

            .number {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-end;

                .marketValue {
                    width: 100%;
                    margin-bottom: 2px;
                    color: #1f1f1f;
                    font-size: 14px;
                    line-height: 20px;
                    text-align: right;
                }

                .num {
                    width: 100%;
                    color: @fontGreyColor;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: right;
                }
            }

            .operate {
                text-align: center;

                span {
                    display: inline-block;
                    padding: 4px 14px;
                    color: @theme;
                    line-height: 18px;
                    text-align: center;
                    background: rgba(255, 105, 7, 0.1);
                    border-radius: 18px;
                }

                &.disabled {
                    span {
                        opacity: 0.3;
                    }
                }
            }
        }
    }

    .dialogContent {
        padding: 12px 16px 28px;
        font-size: 14px;
        line-height: 21px;
        text-align: center;
        text-align: left;
    }
}
</style>
<style lang="less">
.ecash-open-dialog {
    .van-dialog__content {
        .van-dialog__message {
            p:first-of-type {
                margin-bottom: 8px;
                color: #1f1f1f;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
            }

            p:last-of-type {
                color: @fontLightColor;
                font-weight: 400;
                font-size: 13px;
                line-height: 18px;
                text-align: center;
            }
        }
    }
}
</style>
