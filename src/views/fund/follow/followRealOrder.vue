<template>
    <div class="follow-real-order pad-b158" :class="{ 'is-fund': !isStock }">
        <div v-if="isInAPP">
            <div class="bg_image"></div>
            <navigation-bar @updateNaviHeight="v => (statusBarHeight = v)" :color="'#fdddc7'" :shadePixel="123" @back="goBack"></navigation-bar>
        </div>
        <quote-permission
            v-if="isStock"
            :immersive="true"
            :market="market"
            :display-status.sync="showTips"
            class="outter-quote-permission"
            :style="{ top: `${isInAPP ? statusBarHeight : 0}px` }"
        ></quote-permission>
        <div :style="{ height: `${showTips ? quotePermissionHeight : 0}px` }"></div>
        <!-- 买入金额 -->
        <div class="buyBox mar-lr12">
            <div class="autoBuy">
                <div class="left">
                    <select-currency v-model="currency" v-if="isMixPortfolio">
                        {{ $t('follow.descriptAmount') }}
                    </select-currency>
                    <template v-else>
                        {{ $t('follow.descriptAmount') }}
                    </template>
                </div>
                <div class="right">{{ $t('follow.realOrderTag') }}</div>
            </div>
            <!-- 输入金额 -->
            <div class="buyInput">
                <div class="left">{{ currency }}</div>
                <div class="inputBox">
                    <div class="input">
                        <van-field
                            readonly
                            name="applyMarginLimit"
                            type="text"
                            inputmode="decimal"
                            :value="amountDisplay"
                            :placeholder="placeholder"
                            :class="{ 'focus-large': amountDisplay }"
                            clearable
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- 资产内容 -->
        <capital-detail-follow
            class="outter-capital-detail"
            v-if="currency"
            v-model="minusVal"
            :product-buy-type="productBuyType"
            :trade-amount="number"
            :currency="currency"
            @getWithDrawalBalance="WithdrawalBalance"
            :mix-market="isMixPortfolio"
            :exchangeRateList="exchangeRateList"
            ref="capitalDetailRef"
        ></capital-detail-follow>

        <!-- 限价买入股票，基金 -->
        <product-list-card
            v-for="(pItem, idx) in categoryList"
            :key="idx"
            :origin="pItem"
            :isStock="isStock"
            :currency="currency"
            @on-change="onProductListChange"
            @on-refresh="onProductListRefresh"
            :exchangeRateList="exchangeRateList"
        ></product-list-card>

        <!-- 底部按钮及协议声明 -->
        <footer>
            <template v-if="!isStock">
                <div class="agree pad-b8">
                    <van-checkbox class="outter-checkbox" icon-size="16" checked-color="#2F2F2F" v-model="investAgreeFlag">
                        <template v-slot:icon="{ checked }">
                            <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund" width="16"></multi-img>
                        </template>
                        <span class="c-gray f0">
                            <span class="f12">{{ $t('follow.agreeText') }}</span>
                            <span class="c-link f12" @click.stop="goInvestmentConcentration">&nbsp;&nbsp;{{ $t('radar.viewDetail') }}</span>
                        </span>
                    </van-checkbox>
                </div>
                <div class="agree">
                    <van-checkbox class="outter-checkbox" icon-size="16" checked-color="#2F2F2F" v-model="agreeFlag">
                        <template v-slot:icon="{ checked }">
                            <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund" width="16"></multi-img>
                        </template>
                        <span class="c-gray f0">
                            <span class="f12">{{ $t('trade.bryydbty') }}</span>
                            <span class="c-link f12" @click.stop="goProtocol">
                                《{{ $t(isFund ? 'trade.xgxywj' : 'follow.portfolioOrderDisclaimer') }}》
                            </span>
                            <span class="f12">{{ $t('ji') }}</span>
                            <span class="c-link f12" @click.stop="goClientStatement">《{{ $t('protocol.clientStatement') }}》</span>
                        </span>
                    </van-checkbox>
                </div>
            </template>
            <div class="button" :class="{ canSign }" @click="handleBuy">{{ $t('follow.confirmBuy') }}</div>
            <div class="safe-padding-bottom"></div>
        </footer>
    </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue'
import { composeParams, dynamicFontSize, getLangType, isTenantApp } from '@/utils'
import { CURRENCY_MAP, ORDER_PATH_TYPE, PORTFOLIO_TYPE_MAP, stockOrderTypeMap } from '../config/common'
import { amountFormatter } from '@/config/filters'
import { PortfolioOrderCreate } from '@/apis/followInvest/index.js'
import basicInfoMixin from './mixins/basicInfoMixin'
import NP from 'number-precision'
import capitalDetailFollow from './components/capitalDetailFollow.vue'
import { Dialog, Toast } from 'vant'
import pathnames from '@/config/H5Pathname'
import QuotePermission from './components/quotePermission.vue'
import productListCard from './components/productListCard.vue'
import { getExchangeRate } from '@/apis/trade'
import selectCurrency from '../components/selectCurrency.vue'
import { PRODUCT_BUY_TYPE, accountTypeMap } from '@/config/common'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'
import { UserRiskInfo } from '@/apis/riskAssessment'
import { tradeCheck } from '@/apis/staffTrade'
import { mapState } from 'vuex'
import { calcTradePrice } from './utils/tradeUtil'

const opposeCurrencyMap = {
    HKD: 'USD',
    USD: 'HKD',
}
export default {
    name: 'follow-real-order',
    components: { capitalDetailFollow, QuotePermission, productListCard, selectCurrency, NavigationBar },
    mixins: [basicInfoMixin],
    data() {
        return {
            statusBarHeight: 36,
            number: '',
            amountDisplay: '',
            minusVal: 0,
            showTips: false,
            showAllFlag: true,
            list: [],
            placeholder: '',
            investAgreeFlag: false,
            checked: false,
            agreeFlag: false,
            categoryList: [],
            currency: '',
            exchangeRateList: [],
            selectedProductList: [], // 选中的产品
            statusNaviBarOpacity: 0,
            confirmList: [
                { label: this.$t('follow.realOrderFreezeAmount'), value: '', get() {}, currency: '' },
                { label: this.$t('follow.realOrderFreezeAmount'), value: '', get() {}, currency: '' },
                { label: this.$t('buyAmount'), value: '' },
            ],
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        accountType() {
            return this.accts?.type
        },
        isCashAccount() {
            return this.accountType == accountTypeMap.keysMap.cash
        },
        isMarginAccount() {
            return this.accountType == accountTypeMap.keysMap.margin
        },
        quotePermissionHeight() {
            const fontSize = document.documentElement.style.fontSize.replace('px', '')
            return NP.times(NP.divide(32, 100), fontSize)
        },
        portfolioId() {
            return this.$route.query.portfolioId
        },
        isInAPP() {
            return isTenantApp()
        },
        stockMarket() {
            return { 1: 'hk', 2: 'us' }[this.obj.portfolioType]
        },
        market() {
            if (this.isMixPortfolio) {
                return ['hk', 'us']
            }
            return [this.stockMarket]
        },
        marketName() {
            return { 1: this.$t('stocksHKD'), 2: this.$t('stocksUSD'), 3: this.$t('follow.fundName') }[this.obj.portfolioType]
        },

        statusNaviColor() {
            const white = `rgba(255, 255, 255, ${this.statusNaviBarOpacity})`
            const color = `linear-gradient(${white}, ${white}), linear-gradient(#fdddc7, #fdddc7)`
            return color
        },
        // 是否是股票
        isStock() {
            return this.isUSStock || this.isHKStock || this.isMixPortfolio // 当前只有股票有混合市场
        },
        // currency() {
        //     const isHasObj = !!Object.keys(this.obj).length
        //     if (!isHasObj) return undefined
        //     return this.stockMarket ? { 1: 'HKD', 2: 'USD' }[this.obj?.portfolioType] : this.selectedList[0]?.['currency']
        // },
        currencyName() {
            return CURRENCY_MAP.keyValueMap[this.currency]
        },
        opposeCurrency() {
            return opposeCurrencyMap[this.currency]
        },
        opposeCurrencyName() {
            return CURRENCY_MAP.keyValueMap[this.opposeCurrency]
        },
        // 是否显示存入资金
        depositFlag() {
            return this.minusVal > 0
        },
        isFund() {
            return this.obj.portfolioType == PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        isHKStock() {
            return this.obj.portfolioType == PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK
        },
        isUSStock() {
            return this.obj.portfolioType == PORTFOLIO_TYPE_MAP.keysMap.US_STOCK
        },
        canSign() {
            const greaterThanZero = NP.minus(this.number, 0) > 0 // 买入金额需要大于零
            if (!greaterThanZero) return false
            const isEnoughAmount = !this.depositFlag
            // 股票校验
            if (this.isStock) {
                return isEnoughAmount
            }
            return this.agreeFlag && this.investAgreeFlag && isEnoughAmount
        },
        // 是否为混合型组合
        isMixPortfolio() {
            return this.obj?.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.mixin
        },

        productBuyType() {
            return PRODUCT_BUY_TYPE.keysMap[this.isStock ? 'purchasingPower' : 'cash']
        },

        subAccountId() {
            return this.$store.getters['user/getSubAccountId']
        },

        selectedList() {
            return this.selectedProductList.reduce((l, c) => {
                l = l.concat(c.selected)
                return l
            }, [])
        },
    },
    async created() {
        await this.getData()

        if (this.isMixPortfolio) {
            this.fetchExchangeRate()
        }
        this.getPortfolioHoldingAllocation(1)
    },
    mounted() {
        this.checkRatio(this.isFromInvestionRatioPage, this.selectedList)
        if (this.$jsBridge) {
            this.$jsBridge.watchPageVisible(() => {
                this.checkRatio(this.isFromInvestionRatioPage, this.selectedList)
                this.isFromInvestionRatioPage = false
            })
        }
    },
    beforeDestroy() {},
    methods: {
        goBack() {
            this.$router.go(-1)
        },

        //返回输入位数
        calcDigits(num) {
            if (this.amountDisplay == '') {
                return ''
            }
            const intStr = num.indexOf('.') > -1 ? num.split('.')[0] : num
            const numArr = {
                4: this.$t('qian'),
                5: this.$t('wan'),
                6: this.$t('shiwan'),
                7: this.$t('baiwan'),
                8: this.$t('qianwan'),
                9: this.$t('yi'),
                10: this.$t('shiyi'),
            }
            return numArr[intStr.length]
        },

        // 查询用户单币种可提现金额
        async WithdrawalBalance(data) {
            console.log(`Feng.chen:: 10:28:05 data ===> `, data)
            try {
                if (data) {
                    this.withdrawalBalanceData = data
                }
            } catch (e) {
                console.log('eror', e)
            }
        },

        // 获取当前组合持仓数据
        async getPortfolioHoldingAllocation() {
            try {
                const SIMULATION_LIST_KEY = 'simulation_result'
                let simulationResult = localStorage.getItem(SIMULATION_LIST_KEY) || '{}'
                simulationResult = JSON.parse(simulationResult)

                // 拿到数据之后需要清掉数据 - 不然占用太多了
                localStorage.removeItem(SIMULATION_LIST_KEY)
                console.log(`Feng.chen:: 21:31:01 simulationResult ===> `, simulationResult)
                // 根据模拟计算来获取币种
                this.currency = simulationResult.currency
                // 不同类别的内容
                // 股票分为：港股 美股
                // 基金分为："1"：股票型， "2"：债券型， "3"：混合型， "4"：货币型，"5"：股权型
                let categoryList = []
                simulationResult.holdingList?.forEach(item => {
                    const holdings = item.holding || []
                    item.showAllFlag = true
                    holdings.forEach(i => {
                        i.checked = false
                        i.radio = 1
                        i.popover = false
                        i.popoverMsg = ''
                        i.isFocus = false // 股票的输入框是否聚焦
                        i.latestPrice = calcTradePrice(i)
                        i.initialPrice = i.latestPrice
                    })
                    item.holdings = holdings
                    item.selected = []
                    item.selectedAmount = 0
                    item.exchangeSelectedAmount = 0
                })
                categoryList = simulationResult.holdingList || []
                this.categoryList = categoryList

                this.number = ''
                this.amountDisplay = ''
            } catch (e) {
                console.log('eror', e)
            }
        },

        // 跳转到投资集中度
        goInvestmentConcentration() {
            const list = this.selectedList
            if (!list.length) {
                Toast(this.$t('follow.lastNumber'))
                return
            }
            this.checkRatio(false, list)
            this.goFollowInvestmentConcentration()
        },

        checkRatio(fromInvestionRatio, list = []) {
            const id = localStorage.getItem('RATIO_ID')
            if (id !== this.portfolioId && !fromInvestionRatio) {
                this.setRatioKey(this.portfolioId)
                this.setInitialRatioList(list)
            } else {
                this.updateRatio(fromInvestionRatio, list)
            }
        },

        setRatioKey(value) {
            localStorage.setItem('RATIO_ID', value)
        },

        setInitialRatioList(list) {
            list = JSON.stringify(list)
            localStorage.removeItem('investmentLength')
            localStorage.setItem('investmentList', list)
        },

        updateRatio(fromInvestionRatio = false, list) {
            const oldInvestmentList = JSON.parse(localStorage.getItem('investmentList') || '[]')
            const oldInvestmentListMap = oldInvestmentList.reduce((o, c) => ((o[c.symbol] = c), o), {})
            console.log(`Feng.chen:: 11:18:26 oldInvestmentListMap ===> `, oldInvestmentListMap)

            list = list.reduce((l, i) => {
                const oldI = oldInvestmentListMap[i.symbol]
                // 副作用
                if (fromInvestionRatio) {
                    i.radio = oldI?.radio || i.radio
                    if (!this.$jsBridge) {
                        i.checked = !!oldI
                    }
                }
                // restore checked
                i.checked && l.push(i)
                // TODO 如果取消选择是否要把ratio置空 要跟上面i.radio = oldI?.radio || i.radio 同步
                return l
            }, [])
            console.warn(`Feng.chen:: 15:49:52 list ===> `, list)
            if (list) {
                list = JSON.stringify(list)
                localStorage.setItem('investmentList', list)
            }
        },

        goFollowInvestmentConcentration() {
            const url = `${location.origin}${location.pathname}#/follow-investment-concentration?portfolioId=${this.portfolioId}`
            if (this.$jsBridge) {
                this.isFromInvestionRatioPage = true
                return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            }
            this.$router.push({ name: 'followInvestmentConcentration', query: { portfolioId: this.portfolioId } })
        },

        async handleBuy() {
            if (!this.canSign) return

            if (!this.isStock) {
                const noValidRatioLength = this.selectedList.filter(i => i.radio > i.investFocusDegree).length
                if (noValidRatioLength) {
                    return this.failureDialog(3)
                }
                // 基金需要校验可提
                if (!this.$refs.capitalDetailRef.check()) return
            }

            // 衍生品权限
            if (!(await this.checkDerivatives(this.isStock ? 'stock' : 'fund'))) return
            if (this.isStock) {
                // 股票 - 内部员工交易限制
                if (!(await this.checkTradeLimit(this.selectedList.map(i => i.productCode)))) return
            } else {
                // 基金合适性匹配校验
                if (!(await this.checkFundRiskLevel())) return
            }

            // APP内部会调起交易密码校验
            if (this.$jsBridge) {
                await this.$jsBridge.tradeLogin()
            }

            this.confirmDialog()
        },

        confirmDialog() {
            let insufficientAmountTip = ''
            let insufficientAmountContent = ''

            const [first, second] = this.selectedProductList
            const insufficientAmountTipRef = this.getInsufficientTipRef()
            if (this.isMixPortfolio) {
                const firstCurrency = first?.currency
                const secondCurrency = second?.currency
                const firstCurrencyName = CURRENCY_MAP.keyValueMap[firstCurrency]
                const secondCurrencyName = CURRENCY_MAP.keyValueMap[secondCurrency]

                const firstOrderAmount = parseFloat(first?.selectedAmount || 0)
                const secondOrderAmount = parseFloat(second?.selectedAmount || 0)

                const map = {
                    HKD: this.$t('follow.hkStock'),
                    USD: this.$t('follow.usStock'),
                }
                // 添加过就不加了
                if (!this.confirmList[0].label.includes(map[firstCurrency])) {
                    this.confirmList[0].label = `${this.confirmList[0].label}(${map[firstCurrency]})`
                    this.confirmList[1].label = `${this.confirmList[1].label}(${map[secondCurrency]})`
                }
                this.confirmList[0].currency = firstCurrencyName
                this.confirmList[1].currency = secondCurrencyName
                this.confirmList[0]['value'] = amountFormatter(first?.selectedAmount)
                this.confirmList[1]['value'] = amountFormatter(second?.selectedAmount)

                const isFirstInsufficientAmount = this.isInsufficientAmount(firstCurrency, firstOrderAmount)
                const isSecondInsufficientAmount = this.isInsufficientAmount(secondCurrency, secondOrderAmount)
                const firstInsufficientAmount = this.getInsufficientAmount(firstCurrency, firstOrderAmount)
                const secondInsufficientAmount = this.getInsufficientAmount(secondCurrency, secondOrderAmount)
                const showFirstInsufficientWarn = isFirstInsufficientAmount && firstInsufficientAmount > 0
                const showSecondInsufficientWarn = isSecondInsufficientAmount && secondInsufficientAmount > 0
                this.confirmList[0]['warnValue'] = showFirstInsufficientWarn
                this.confirmList[1]['warnValue'] = showSecondInsufficientWarn
                if (showFirstInsufficientWarn || showSecondInsufficientWarn) {
                    const firstInsufficientAmountFormatted = amountFormatter(firstInsufficientAmount)
                    const secondInsufficientAmountFormatted = amountFormatter(secondInsufficientAmount)
                    let amountTip = ''
                    const firstAmountContent = `${firstInsufficientAmountFormatted} ${firstCurrencyName}`
                    const secondAmountContent = `${secondInsufficientAmountFormatted} ${secondCurrencyName}`
                    if (showFirstInsufficientWarn && showSecondInsufficientWarn) {
                        const withWord = this.$t('follow.with')
                        amountTip = `<span class='high-light'>${firstAmountContent}</span>${withWord}<span class='high-light'>${secondAmountContent}</span>`
                    } else if (showFirstInsufficientWarn) {
                        amountTip = `<span class='high-light'>${firstAmountContent}</span>`
                    } else {
                        amountTip = `<span class='high-light'>${secondAmountContent}</span>`
                    }
                    if (insufficientAmountTipRef) {
                        insufficientAmountContent = this.$t(insufficientAmountTipRef, { amountTip })
                        insufficientAmountTip = `<div class="f14 card white_background">${insufficientAmountContent}</div>`
                    }
                }
            } else {
                this.confirmList[0]['value'] = amountFormatter(this.number)
                this.confirmList[0].currency = this.currencyName
                const orderAmount = parseFloat(this.number)
                const currency = this.currency
                const isInsufficientAmount = this.isInsufficientAmount(currency, orderAmount)
                const insufficientAmount = this.getInsufficientAmount(currency, orderAmount)
                const showInsufficientWarn = isInsufficientAmount && insufficientAmount > 0
                this.confirmList[0]['warnValue'] = showInsufficientWarn
                if (showInsufficientWarn) {
                    const insufficientAmountFormatted = amountFormatter(insufficientAmount)
                    const currencyName = CURRENCY_MAP.keyValueMap[currency]
                    const amountTip = `<span class='high-light'>${insufficientAmountFormatted} ${currencyName}</span>`
                    if (insufficientAmountTipRef) {
                        insufficientAmountContent = this.$t(insufficientAmountTipRef, { amountTip })
                        insufficientAmountTip = `<div class="f14 card white_background">${insufficientAmountContent}</div>`
                    }
                }
            }
            this.confirmList[2]['value'] =
                this.selectedProductList.reduce((o, j) => {
                    o = o + j.selected.length
                    return o
                }, 0) + this.$t('zhi')

            const tipHtml = `<div class="tip">${this.$t('follow.realOrderConfirmTitle')}</div>`

            let html = this.confirmList.reduce((s, item) => {
                let itemClass = 'list-item h-32 flex-s f14 '
                if (item.warnValue) {
                    itemClass += 'high-light'
                } else {
                    itemClass += 'c-main'
                }

                if (item.value) {
                    const label = `<span class="c-gray">${item.label}</span>`
                    const value = `<span class="bold real-order-amount line-elipsis">${item.value}</span>`
                    const currency = item.currency ? `<span class="bold">${item.currency}</span>` : ''
                    s += `<div class="${itemClass}">${label}${value}${currency} </div>`
                }
                return s
            }, '')
            html = tipHtml + html

            if (insufficientAmountTip) {
                html += insufficientAmountTip
            }

            Dialog.confirm({
                title: '',
                className: 'dialog-pad-top rela-trade-confirm-dialog',
                message: html,
                messageAlign: 'center',
                showCancelButton: true,
                confirmButtonText: this.$t('confirm'),
            })
                .then(() => {
                    this.appTradeFn()
                })
                .catch(() => {})

            this.$nextTick(() => {
                const doms = [...document.body.querySelectorAll('.real-order-amount')]
                doms.forEach(dom => {
                    dynamicFontSize({ dom, minFontSize: 12, interval: 1 })
                })
            })
        },

        /**
         * 计算指定币种下订单是否有跨币种交易/使用到融资
         * @param {string} currency 币种
         * @param {number} orderAmount 下单金额
         * */
        isInsufficientAmount(currency, orderAmount) {
            const orderAmountF = parseFloat(orderAmount)
            const capitalDetailRef = this.$refs.capitalDetailRef
            const withdrawBalanceMap = capitalDetailRef.withdrawBalanceMap

            const withdrawBalance = withdrawBalanceMap[currency]
            //当前币种「现金可用」
            let avaliableCash = parseFloat(withdrawBalance?.singleWithdrawBalance || 0)
            //现金可用<0时按0处理
            avaliableCash = Math.max(avaliableCash, 0)
            //当前币种最大购买力
            const purchasingPower = parseFloat(withdrawBalance?.purchasingPower || 0)
            console.log(`confirmDialog avaliableCash=${avaliableCash},purchasingPower=${purchasingPower},orderAmount=${orderAmount}`)
            return orderAmountF > avaliableCash && orderAmountF <= purchasingPower
        },
        /**
         * 计算指定币种下订单跨币种交易/使用到融资的金额
         * @param {string} currency 币种
         * @param {number} orderAmount 下单金额
         * */
        getInsufficientAmount(currency, orderAmount) {
            const orderAmountF = parseFloat(orderAmount)

            const capitalDetailRef = this.$refs.capitalDetailRef
            const ecashHoldingResult = capitalDetailRef.ecashHoldingResult
            const withdrawBalanceMap = capitalDetailRef.withdrawBalanceMap

            const withdrawBalance = withdrawBalanceMap[currency]
            //当前币种「现金可用」
            let avaliableCash = parseFloat(withdrawBalance?.singleWithdrawBalance || 0)
            //现金可用<0时按0处理
            avaliableCash = Math.max(avaliableCash, 0)
            //同币种现金宝抵押值
            const ecashHolding = parseFloat(ecashHoldingResult?.[`${currency}SellableAmount`] || 0)

            const insufficientAmount = NP.minus(orderAmountF, avaliableCash, ecashHolding) //跨币种交易/使用到融资的金额
            console.log(`confirmDialog ecashHolding=${ecashHolding},avaliableCash=${avaliableCash},insufficientAmount=${insufficientAmount}`)
            return insufficientAmount
        },
        getInsufficientTipRef() {
            if (this.isMarginAccount) {
                return 'follow.orderMarginFeeHint'
            }
            return 'follow.orderCashExchangeHint'
        },

        failureDialog(type = 1) {
            const html = {
                1: this.$t('tradeFailedForDebt'),
                2: this.$t('trade.rgjecgkyje'),
                3: this.$t('follow.errorReason'),
            }[type]
            const messageAlign = { 1: 'left', 2: 'center', 3: 'left' }[type]
            const confirmButtonText = {
                1: this.$t('iKnow'),
                2: this.$t('iKnow'),
                3: this.$t('follow.adjustmentText'),
            }[type]
            Dialog.confirm({
                title: this.$t('trade.rgsb'),
                className: 'dialog-pad-top',
                message: html,
                messageAlign,
                showCancelButton: false,
                confirmButtonText,
            })
                .then(() => {
                    if (type == 3) {
                        this.goFollowInvestmentConcentration()
                    }
                })
                .catch(() => {})
        },
        // 下单买入
        async appTradeFn() {
            try {
                const orderDetail = []
                const estimateBuyInfo = []
                this.selectedProductList.forEach(item => {
                    if (this.isStock) {
                        estimateBuyInfo.push({
                            amount: parseFloat(item.selectedAmount),
                            currency: item.currency,
                            fee: 0, // 费用待接口提供， 1期来不及
                        })
                    }
                    item.selected.forEach(i => {
                        let ret
                        if (this.isStock) {
                            ret = {
                                productType: i.market === 'hk' ? 1 : 2,
                                productCode: i.productCode,
                                price: calcTradePrice(i),
                                quantity: parseFloat(i.lotNum),
                                stockOrderType:
                                    i.market === 'hk'
                                        ? stockOrderTypeMap.strongLimitOrder
                                        : i.market === 'us'
                                        ? stockOrderTypeMap.limitOrder
                                        : undefined,
                            }
                        } else {
                            ret = {
                                productType: Number(this.obj.portfolioType),
                                productCode: i.productCode,
                                amount: parseFloat(i.lotNum),
                                investFocusDegree: i.radio,
                            }
                        }
                        orderDetail.push(ret)
                    })
                })

                if (!this.isStock) {
                    const amount = this.selectedList.reduce((o, c) => {
                        o = NP.plus(o, c.lotNum)
                        return o
                    }, 0)
                    const currency = this.selectedList[0]?.currency
                    estimateBuyInfo.push({
                        amount: amount,
                        currency,
                        fee: 0, // 费用待接口提供， 1期来不及
                    })
                }
                const params = {
                    subAccountId: this.subAccountId,
                    estimateBuyInfo,
                    // estimateBuyFee: 0, // 费用待接口提供， 1期来不及
                    // estimateBuyAmount: parseFloat(this.number),
                    portfolioId: Number(this.portfolioId),
                    optType: 1,
                    orderDetail,
                    simulated: ORDER_PATH_TYPE.keysMap.simulated,
                }
                this.$loading.show = true
                const data = await PortfolioOrderCreate(params, { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC })
                const { result } = data
                Toast.success(this.$t('follow.alreadySubmit'))
                sessionStorage.setItem('orderResult', JSON.stringify(result))
                this.$router.replace({ name: 'followOrderResult', query: { from: 'followRealOrder', portfolioId: this.portfolioId } })
            } catch (e) {
                console.log('bond-tradeLogin===>error:', e)
                if (e?.error?.data?.tips) {
                    return Toast(e?.error?.data?.tips)
                }
                Toast(this.$t('tradeFailed'))
            } finally {
                this.$loading.show = false
            }
        },
        // 跳转到协议
        goProtocol() {
            if (this.isStock) {
                const H5_KEY = 'PORTFOLIO-ORDER-DISCLAIMER'
                const { VUE_APP_BUILDER_PAGE } = pathnames
                const url = `${VUE_APP_BUILDER_PAGE}?key=${H5_KEY}` // 投资组合免责声明
                if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                location.href = url
            } else {
                const list = this.selectedList
                if (!list.length) {
                    Toast(this.$t('follow.lastNumber'))
                    return
                }
                localStorage.setItem('investmentList', JSON.stringify(list))
                const url = `${location.origin}${location.pathname}#/follow-rule-list`
                if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                this.$router.push({ name: 'followRuleList' })
            }
        },
        // 跳转到声明
        goClientStatement() {
            const fileName = `static/客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            const title = this.$t('protocol.clientStatement')
            if (isTenantApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },

        onProductListChange(data) {
            console.log(`Feng.chen:: 19:57:03 data ===> `, data, this.number)
            const index = this.selectedProductList.findIndex(i => i.marketType === data.marketType)
            if (index !== -1) {
                this.selectedProductList.splice(index, 1, data)
            } else {
                this.selectedProductList.push(data)
            }

            if (this.isMixPortfolio) {
                this.number = this.selectedProductList.reduce((o, c) => {
                    if (this.currency !== c.currency) {
                        o = NP.plus(o, c.exchangeSelectedAmount)
                    } else {
                        o = NP.plus(o, c.selectedAmount)
                    }
                    return o
                }, 0)
            } else {
                this.number = this.selectedProductList.reduce((o, c) => {
                    o = NP.plus(o, c.selectedAmount)
                    return o
                }, 0)
            }
            // 字符串化
            this.number = this.number + ''
            this.amountDisplay = amountFormatter(this.number)
        },

        onProductListRefresh(data) {
            if (!this.count) {
                // 用来统计触发了几次 - 混合会触发两次
                this.count = 0
                this.number = ''
                this.amountDisplay = ''
            }
            this.count += 1
            if (this.isMixPortfolio) {
                if (this.currency !== data.currency) {
                    this.number = NP.plus(this.number, data.exchangeSelectedAmount) + ''
                } else {
                    this.number = NP.plus(this.number, data.selectedAmount) + ''
                }
            } else {
                this.number = NP.plus(this.number, data.selectedAmount) + ''
            }
            this.amountDisplay = amountFormatter(this.number)
            if (this.count === this.categoryList.length) {
                this.count = 0
            }
        },

        // 获取汇率 - 混合型组合才需要获取
        async fetchExchangeRate() {
            try {
                const { result } = await getExchangeRate()
                this.exchangeRateList = result.list || []
            } catch (e) {
                console.error(e)
            }
        },

        // 股票内部交易限制 - 仅限股票
        async checkTradeLimit(stockCodeList = []) {
            try {
                if (!stockCodeList || !stockCodeList.length) return true
                const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
                const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
                let isToasted = false // 只展示第一个不符合的股票提示信息
                const check = async stockCode => {
                    const params = { subAcctId, stockCode }
                    const { result: { isTrade, message } = {} } = await tradeCheck(params)
                    const CAN_NOT_TRADE = 0 // 0:不可 1:可以
                    if (CAN_NOT_TRADE === isTrade) {
                        if (!isToasted) {
                            if (message) {
                                isToasted = true
                                const msg = `${stockCode} ${message}` // 提示信息需要拼接stockCode
                                this.$toast(msg)
                            }
                        }
                        return false
                    }
                    return true
                }
                const all = await Promise.all(stockCodeList.map(i => check(i)))
                console.log(`Feng.chen:: 16:49:57 all ===> `, all)
                return all.every(i => i)
            } catch (e) {
                console.error(e)
                const msg = e.error?.data?.tips
                msg && this.$toast(msg)
                return false
            }
        },

        async getUserRiskInfo({ subAcctId = this.$store.getters['user/getSubAccountId'], forceRefresh = false } = {}) {
            try {
                if (!forceRefresh) {
                    let info = null
                    if ((info = this.userRiskInfo)) return info
                }
                const ops = { params: { subAcctId } }
                const { result } = await UserRiskInfo(ops)
                // result.riskLevel = 3 // 测试
                // result.openDerivative = 0 // 测试
                this.userRiskInfo = result
                return this.userRiskInfo
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * @description 合适性匹配函数 - 仅限基金使用
         * @param { Object } user 用户信息
         * @param { Object } fRes 基金信息
         * @returns { Object } res => { match, list }
         */
        match: (user = {}, fRes = {}) => {
            const matchDerivative = user?.openDerivative === 1 || fRes.isDerivative === 0 // 衍生品权限对比
            const matchRisk = user?.riskLevel >= fRes.riskRating // 风测等级
            const matchInvestObjective = user?.investmentObjective >= fRes.investObjective // 投资目标
            const matchInvestmentExperience = user?.investmentExperience >= fRes.investYear // 投资经验
            const list = [matchDerivative, matchRisk, matchInvestObjective, matchInvestmentExperience]
            return { match: list.every(i => i), list: list }
        },

        async checkDerivatives(type = 'stock') {
            const list = ['stock', 'fund']
            if (!list.includes(type)) {
                console.error(type, ' is not valid!')
                return
            }
            const checkList = this.selectedList
            if (!checkList.length) return true
            const [res] = await this.checkSuitability({ forceRefresh: this.forceRefresh, checkList })
            const { matchDerivative, matchRes, isMatch, info } = res || {}

            if (res && !matchDerivative) {
                const { VUE_APP_DERIVATIVE_PAGE } = pathnames
                const paramsList = []
                if (!isMatch) {
                    if (!this.isStock) {
                        paramsList.push(['needRisk', 1], ['matchRes', matchRes], ['symbol', info.symbol], ['user', 1])
                    } else {
                        paramsList.push(['needRisk', 0])
                    }
                }
                const queryString = composeParams(paramsList)
                const url = `${VUE_APP_DERIVATIVE_PAGE}${queryString}`
                console.log(`Feng.chen:: 16:45:06 url ===> `, url)
                this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : (location.href = this.$addCurParamsForUrl(url))
                return false
            }
            return true
        },
        // 合适性匹配
        async checkSuitability({ checkList = [] } = {}) {
            const cache = []
            await this.getUserRiskInfo({ forceRefresh: true })
            const hd = checkList || this.selectedList

            for (let i = 0; i < hd.length; i++) {
                const info = hd[i]
                const res = {}
                const { match, list = [] } = this.match(this.userRiskInfo, info)
                res.isMatch = match
                res.list = list
                res.info = info
                res.matchDerivative = list[0]
                // 匹配结果 依次排序 （衍生品 风险等级 投资目标 投资年期）
                res.matchRes = list.reduce((s, c) => {
                    s += +c
                    return s
                }, '')
                // 当出现合适性不匹配的元素就停止匹配
                if (!res.isMatch) {
                    cache.push(res)
                }
            }
            return cache
        },
        // 获取一支基金用来做合适性匹配
        getFund(list) {
            if (!list || !list.length) return
            // 筛选依据 从左到右
            // 风险等级 -> 投资目标 -> 投资年限 -> 持仓占比 -> 随机抽选一只
            const getFundsByRiskLevel = (list = []) => {
                // 排序 风险等级由高到低
                list.sort((a, b) => b.riskRating - a.riskRating)
                // 筛选出跟第一个风险等级一致的基金
                return list.filter(i => i.riskRating === list[0]?.riskRating)
            }
            // 根据投资目标
            const getFundsByInvestObject = (list = []) => {
                // 排序 投资吗目标由高到低
                list.sort((a, b) => b.investObjective - a.investObjective)
                // 筛选出跟第一个投资目标一致的基金
                return list.filter(i => i.investObjective === list[0]?.investObjective)
            }
            // 根据投资年限
            const getFundsByInvestYear = (list = []) => {
                // 排序 投资年限由高到低
                list.sort((a, b) => b.investYear - a.investYear)
                // 筛选出跟第一个投资年限一致的基金
                return list.filter(i => i.investYear === list[0]?.investYear)
            }
            // 根据投资占比
            const getFundsByRatio = (list = []) => {
                // 排序 投资年限由高到低
                list.sort((a, b) => +b.ratio - +a.ratio)
                // 筛选出跟第一个投资年限一致的基金
                return list.filter(i => +i.ratio === +list[0]?.ratio)
            }
            // 获取第一个基金
            const getFirstFund = (list = []) => {
                return list[0]
            }
            return Promise.resolve(list)
                .then(getFundsByRiskLevel)
                .then(getFundsByInvestObject)
                .then(getFundsByInvestYear)
                .then(getFundsByRatio)
                .then(getFirstFund)
        },
        async checkFundRiskLevel() {
            try {
                const ret = await this.getFund(this.selectedList) // 只需要获取一个基金即可
                if (!ret) return true
                const [res] = await this.checkSuitability({ forceRefresh: this.forceRefresh, checkList: [ret] })
                if (res && !res.isMatch) {
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
                            const symbol = res?.info?.symbol
                            const investFocusDegree = this.selectedList.find(i => i.symbol === symbol)?.radio || 1
                            const params = [
                                ['symbol', symbol],
                                ['user', 1],
                                ['investFocusDegree', investFocusDegree],
                            ]
                            const queyrString = composeParams(params)
                            if (this.$jsBridge) {
                                const url = `${location.origin}/wealth/fund.html#/no-matched-risk${queyrString}`
                                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                            } else {
                                this.$router.push(`/no-matched-risk${queyrString}`)
                            }
                        })
                    return false
                }
                return true
            } catch (e) {
                console.error(e)
            }
        },
    },
}
</script>

<style scoped lang="less">
.follow-real-order {
    position: relative;
    z-index: auto;
    background: #f9f9f9;

    .bg_image {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 0;
        width: 100%;
        height: 266px;
        margin: 0;
        background: linear-gradient(to bottom, #fdddc7 170px, rgba(253, 221, 199, 0) 100%);
    }

    .navi_bar {
        position: fixed;
        left: 0;
        z-index: 1000;
        font-weight: bold;
        font-size: 16px;
    }

    ::v-deep .van-popover--light .van-popover__content {
        background: #fff0e6;
        border-radius: 4px;
        box-shadow: none;
    }

    ::v-deep .van-popover--light .van-popover__arrow {
        right: 2px;
        color: #fff0e6;
        border-width: 0.08rem;
    }

    .bottom {
        margin-top: 10px;
    }

    .category-name {
        color: @fontBlackColor;
        font-size: 16px;
    }

    .outter-quote-permission {
        & + .pad-t44 {
            margin-top: 44px;
        }
    }

    .valid-account {
        font-size: 12px;
        line-height: 16px;
    }

    .popover-tips {
        padding: 4px 6px;
    }

    &.pad-b158 {
        padding-bottom: 94px;
    }

    .h-38 {
        height: 38px;
    }

    .w-16 {
        width: 16px;
    }

    .w-132 {
        width: 132px;
    }

    .icon-arrow {
        transform: rotate(180deg);
    }

    &.is-fund {
        &.pad-b158 {
            padding-bottom: 185px;
        }
    }

    .row-reverse {
        flex-direction: row-reverse;
    }

    .buyBox {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-top: 12px;
        padding: 0 12px 8px;
        background: #fff;
        border-radius: 8px 8px 0 0;

        .autoBuy {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding-top: 15px;

            .left {
                display: flex;
                align-items: center;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;

                .icon-remind {
                    width: 16px;
                    height: 16px;
                    margin-left: 6px;
                }
            }

            .right {
                padding: 0 6px;
                color: #fff;
                font-weight: 700;
                font-size: 10px;
                font-style: normal;
                line-height: normal;
                line-height: 18px;
                background: linear-gradient(90deg, #ffab07 0%, #ff6b00 100%), linear-gradient(59deg, #44d2ff 0%, #278aff 100%),
                    linear-gradient(90deg, #ffab07 0%, #ff6b00 100%);
                border-radius: 2px;
            }
        }

        .numTip {
            position: absolute;
            top: 40px;
            left: 70px;
            z-index: 2;
            display: flex;
            flex-direction: row;
            align-items: center;

            i {
                display: inline-block;
                width: 1px;
                height: 12px;
                margin-right: 2px;
                background: #d6d6d6;
                transform: scaleX(0.5);
            }

            span {
                padding: 2px;
                color: #666;
                font-size: 8px;
                background: #f0f0f0;
                border-radius: 1px;
            }
        }

        .wrongTip {
            margin-top: 8px;
            margin-bottom: 4px;
            color: #f31414;
            font-size: 12px;
            line-height: 16px;
        }

        .buyInput {
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 38px;
            margin-top: 15px;
            overflow: hidden;

            &.hasWrong {
                &::after {
                    background: #f31414;
                }
            }

            .left {
                width: 44px;
                color: @fontBlackColor;
                font-size: 20px;
                line-height: 28px;
            }

            .inputBox {
                display: flex;
                flex: 1;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }

            .input {
                // 防止覆盖error line
                position: relative;
                flex: 1;

                ::v-deep .van-field {
                    padding: 0 13px;
                    color: @fontBlackColor;
                    font-size: 16px;
                    line-height: 28px;

                    &.focus-large {
                        font-size: 28px;
                        line-height: 38px;
                    }

                    &__control {
                        color: @fontBlackColor;
                        font-weight: 700;
                    }

                    input::-webkit-input-placeholder {
                        /* WebKit browsers 适配谷歌 */
                        color: rgba(156, 156, 156, 0.6);
                        font-size: 20px;
                    }

                    input:-moz-placeholder {
                        /* Mozilla Firefox 4 to 18 适配火狐 */
                        color: rgba(156, 156, 156, 0.6);
                        font-size: 20px;
                    }

                    input::-moz-placeholder {
                        /* Mozilla Firefox 19+ 适配火狐 */
                        color: rgba(156, 156, 156, 0.6);
                        font-size: 20px;
                    }

                    input:-ms-input-placeholder {
                        /* Internet Explorer 10+  适配ie */
                        color: rgba(156, 156, 156, 0.6);
                        font-size: 20px;
                    }
                }
            }
        }
    }

    .outter-capital-detail {
        position: relative;
        z-index: 1;
        margin-top: -1px;
        margin-right: 12px;
        margin-left: 12px;
        background-color: #fff;
        border-radius: 0 0 8px 8px;
    }

    footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 12px 0 12px 12px;
        background-color: #fff;
        box-shadow: inset 0 0.5px 0 #efefef;

        .agree {
            .outter-checkbox {
                position: relative;

                /deep/ .van-checkbox__icon {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                }

                /deep/ .van-checkbox__label {
                    margin-left: 24px;
                }
            }

            & + .button {
                margin-top: 16px;
            }
        }

        .button {
            height: 44px;
            margin: 0 28px;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background: #ff6307;
            border-radius: 22px;
            opacity: 0.3;

            &.canSign {
                opacity: 1;
            }
        }

        .safe-padding-bottom {
            #iosBottom();
        }
    }
}
</style>

<style lang="less">
.rela-trade-confirm-dialog {
    border-radius: 12px;

    .van-dialog__message {
        padding: 17px 16px 24px;
    }

    .van-dialog__cancel {
        font-weight: 700;
    }

    .tip {
        margin: 0 -4px 17px;
        padding: 8px 6px 8px 10px;
        color: #af7213;
        font-weight: 700;
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        background: #fff6e8;
        border-radius: 6px;
    }

    .list-item {
        span {
            flex: 0 0 auto;

            &:nth-of-type(2) {
                flex: 1 0;
                text-align: right;
            }
        }
    }

    .high-light {
        color: #ff6907;
    }

    .card {
        padding: 12px;
        line-height: 22px;
        text-align: left;
        border-radius: 6px;
    }
}

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
