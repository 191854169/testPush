<!--
 * @Description: 投资组合下单
-->

<template>
    <div class="c-main order-main" id="order" :class="{ 'is-fund': !isStock }">
        <quote-permission v-if="isStock" :market="stockMarket" class="outter-quote-permission"></quote-permission>
        <div class="pad-12 pad-b158 pad-t44 basic-info">
            <div class="top_info">
                <div>
                    <div class="flex-c top_info-name">
                        <h5 class="f16 bold mar-r8">{{ obj.portfolioName }}</h5>
                        <portfolio-tag :portfolioType="obj.portfolioType"></portfolio-tag>
                    </div>
                    <remainingDayFollower :remainingDay="obj.foundDayNum" :follower="obj.followersNum" />
                </div>
                <div>
                    <p class="big_value" v-riseFall="{ value: obj.totalReturn, base: 2, sign: true }"></p>
                    <p class="label">{{ $t('accumulatedProfit') }}</p>
                </div>
            </div>
            <!-- 买入金额 -->
            <div class="buyBox mar-b12">
                <div class="autoBuy">
                    <div class="left">
                        <template v-if="isMix">
                            <select-currency v-model="period">
                                {{ $t('follow.descriptAmount') }}
                            </select-currency>
                        </template>
                        <template v-else>
                            {{ $t('follow.descriptAmount') }}
                        </template>
                    </div>
                    <div class="right" @click="clickBuyTypeSwitch">
                        {{ buyTypeText }}
                        <multi-img class="icon-right" name="icon_arrow_right_dark" directory="fund"></multi-img>
                    </div>
                </div>
                <!-- 输入金额 -->
                <div class="buyInput" :class="{ hasWrong: calcWrong(toCalcNumber) }">
                    <div class="numTip" v-show="calcDigits(toCalcNumber)">
                        <i></i>
                        <span>{{ calcDigits(toCalcNumber) }}</span>
                    </div>
                    <div class="left">{{ currency }}</div>
                    <div class="inputBox">
                        <div class="input" v-if="isSelectNum" @click="clickSelectNum">
                            <div class="input-container">
                                <!-- 用户选择份数 -->
                                <span ref="minPricePerRef" class="amount line-elipsis">{{ selectAmount | amountFilter }}</span>
                                <span class="num">({{ portfolioCount }}份)</span>
                            </div>
                            <multi-img name="icon_arrow_left" directory="fund"></multi-img>
                        </div>
                        <div class="input" v-if="isInputAmount">
                            <van-field
                                ref="inputAmountRef"
                                name="applyMarginLimit"
                                type="text"
                                inputmode="decimal"
                                @input="onPriceInput"
                                @focus="handleFocus"
                                @blur="chkLast"
                                @clear="onClear"
                                :value="amountDisplay"
                                :placeholder="placeholder"
                                clearable
                                maxlength="14"
                            ></van-field>
                        </div>
                    </div>
                </div>

                <!-- 错误提示 -->
                <div class="wrongTip" v-show="calcWrong(number)">{{ calcWrong(number) }}</div>

                <!-- 资产内容 -->
                <capital-detail-follow
                    class="outter-capital-detail"
                    v-if="currency"
                    v-model="minusVal"
                    :product-buy-type="productBuyType"
                    :trade-amount="toCalcNumber"
                    :currency="currency"
                    @getWithDrawalBalance="WithdrawalBalance"
                    :mix-market="isMix"
                    :currentRate="opposeCurrentRate"
                    ref="capitalDetailRef"
                ></capital-detail-follow>
            </div>
            <tradeCollapseGroup
                class="collapse_group"
                v-for="(group, index) in holdingList"
                :key="index"
                :group="group"
                :isFund="isFund"
                :currency="currency"
                :rate="currentRate"
            ></tradeCollapseGroup>
        </div>
        <!-- 底部按钮及协议声明 -->
        <footer>
            <div class="agree pad-b8" v-if="!isStock">
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
            <div class="button" :class="{ canSign }" @click="handleBuy">{{ $t('follow.confirmBuy') }}</div>
            <div class="safe-padding-bottom"></div>
        </footer>
        <order-type-switch v-model="showTypeSwitch" :buyType="buyType" @confirm="confirmSwitchType"></order-type-switch>
        <order-num-select
            v-model="showNumSelect"
            :currency="currency"
            :maxPurchasingPower="purchasingPower"
            :minPricePer="minPricePer"
            @confirm="confirmSelectNum"
            :count="portfolioCount"
            :amount-list="numberList"
        ></order-num-select>
    </div>
</template>

<script>
import { amountFilter, amountFormatter, thousandsFilter } from '@/config/filters.js'
import { mapState } from 'vuex'
import { Dialog, Toast } from 'vant'
import portfolioTag from './components/portfolioTag.vue'
import { PortfolioHoldingAllocation, PortfolioOrderCreate } from '@/apis/followInvest/index.js'
import NP from 'number-precision'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt.js'
import { getLangType, isHLApp } from '@/utils/tools.js'
import MonitorKeyboard from '@/utils/monitorKeyboard'
import { tradeCheck } from '@/apis/staffTrade.js'
import { UserRiskInfo } from '@/apis/riskAssessment.js'
import { dynamicFontSize, keepDecimals } from '../../../utils'
import QuotePermission from './components/quotePermission.vue'
import { CURRENCY_MAP, FOLLOW_BUY_TYPE, ORDER_PATH_TYPE, PORTFOLIO_TYPE_MAP, stockOrderTypeMap, opposeCurrencyMap } from '../config/common'
import pathnames from '@/config/H5Pathname.js'
import capitalDetailFollow from './components/capitalDetailFollow.vue'
import { PRODUCT_BUY_TYPE, accountTypeMap } from '@/config/common'
import remainingDayFollower from './components/remainingDayFollower.vue'
import orderTypeSwitch from './components/orderTypeSwitch.vue'
import orderNumSelect from './components/orderNumSelect.vue'
import tradeCollapseGroup from './components/tradeCollapseGroup.vue'
import portfolioTradeCalcMixin from '@/views/fund/follow/mixins/portfolioTradeCalcMixin'
import { cloneDeep } from 'lodash'
import SelectCurrency from '../components/selectCurrency.vue'
import { calcTradePrice } from './utils/tradeUtil'

NP.enableBoundaryChecking(false)
export default {
    name: 'folloOrder',
    components: {
        portfolioTag,
        QuotePermission,
        capitalDetailFollow,
        remainingDayFollower,
        orderTypeSwitch,
        orderNumSelect,
        tradeCollapseGroup,
        SelectCurrency,
    },
    mixins: [portfolioTradeCalcMixin],
    data() {
        return {
            investAgreeFlag: false,
            agreeFlag: false,
            checked: true,
            number: '',
            currencyObj: {},
            // currency: '',
            placeholder: '',
            amountDisplay: '',
            list: [],
            confirmList: [
                { label: this.$t('trade.tradeAccount'), value: '' },
                { label: this.$t('follow.combinationName'), value: '' },
                { label: this.$t('follow.tradeMarket'), value: '' },
                { label: this.$t('follow.stockAmount'), value: '' },
                { label: this.$t('follow.descriptAmount'), value: '' },
                // { label: '预计买入费用', value: '' },
                // { label: '预计合计金额', value: '' },
            ],
            subAccountId: this.$store.getters['user/getSubAccountId'],
            withdrawalBalanceData: {
                singleWithdrawBalance: '', //单币种可提现金额
                purchasingPower: '', // 最大购买力
            },
            monitorKeyboard: null,
            holdingDetails: [],
            focusVal: '',
            isFromInvestionRatioPage: false, // 是否从投资集中度页面过来
            minusVal: 0,

            showTypeSwitch: false,
            buyType: FOLLOW_BUY_TYPE.keysMap.number, // 1--选择份数 2--输入金额
            showNumSelect: false,
            selcetedNumItem: { amount: 9999, num: 2 },
            periodSwitch: false,
            period: 'HKD',
            periodList: [
                { value: 'HKD', text: this.$t('HKD') },
                { value: 'USD', text: this.$t('USD') },
            ],
            portfolioCount: 1, // 组合份数
            stockRatio: 0,
            exchangeRateList: [],
            hkdNumberList: [], // 份数对应的金额
            usdNumberList: [], // 份数对应的金额
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
        stockMarket() {
            return { 1: ['hk'], 2: ['us'], 4: ['hk', 'us'] }[this.obj.portfolioType]
        },
        marketName() {
            if (this.isMix) {
                return this.$t('customerDetail.mixture')
            }
            return { 1: this.$t('stocksHKD'), 2: this.$t('stocksUSD'), 3: this.$t('follow.fundName') }[this.obj.portfolioType]
        },
        // 是否是股票
        isStock() {
            return this.isUSStock || this.isHKStock || this.isMix
        },
        currency: {
            get() {
                if (this.isMix) {
                    return this.period
                }
                return this.obj.currency
            },
            set(v) {
                this.period = v
            },
        },
        opposeCurrency() {
            return opposeCurrencyMap[this.currency]
        },
        currencyName() {
            if (this.isMix) return CURRENCY_MAP.keyValueMap[this.period]
            if (this.isStock) {
                return CURRENCY_MAP.keyValueMap[{ 1: 'HKD', 2: 'USD' }[this.obj.portfolioType]]
            }
            // todo, 基金待返回币种
            return CURRENCY_MAP.keyValueMap[this.leadHoldingList[0]['currency']]
        },
        buyNum() {
            return this.leadHoldingList.filter(item => !!item.lotNum).length
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
        isMix() {
            return this.obj.portfolioType == PORTFOLIO_TYPE_MAP.keysMap.mixin
        },
        // 基金组合的最小投资金额
        minInitial() {
            return this.fundMinInitial
        },
        canSign() {
            const greaterThanZero = NP.minus(this.toCalcNumber, 0) > 0 // 买入金额需要大于零
            if (!greaterThanZero) return false
            const isEnoughAmount = !this.depositFlag
            // 股票校验
            if (this.isStock) {
                return this.agreeFlag && !!this.buyNum && isEnoughAmount
            }

            // 认购金额需要大于最小起投
            const greaterThanMinInitial = NP.minus(this.toCalcNumber, this.minInitial) >= 0
            return this.agreeFlag && this.investAgreeFlag && this.buyNum && greaterThanMinInitial && isEnoughAmount
        },
        // 限制的小数位
        limitDecimal() {
            const map = {
                1: () => 3,
                2: () => 4,
                3: () => 2,
            }
            return map[this.obj.portfolioType]
        },

        productBuyType() {
            return PRODUCT_BUY_TYPE.keysMap[this.isStock ? 'purchasingPower' : 'cash']
        },
        buyTypeText() {
            return this.isSelectNum ? this.$t('followOrder.selectNum') : this.$t('followOrder.inputAmount')
        },
        minPricePer() {
            return this.isStock ? this.stockBestAmountFixed.replace(/,/g, '') : this.fundMinInitial
        },
        purchasingPower() {
            return this.isStock ? this.withdrawalBalanceData.purchasingPower : this.withdrawalBalanceData.singleWithdrawBalance
        },
        numberList() {
            if (this.currency === 'HKD') {
                return this.hkdNumberList
            }
            if (this.currency === 'USD') {
                return this.usdNumberList
            }
            return []
        },
        isSelectNum() {
            return this.buyType === FOLLOW_BUY_TYPE.keysMap.number
        },
        isInputAmount() {
            return this.buyType === FOLLOW_BUY_TYPE.keysMap.amount
        },

        selectAmount() {
            return this.numberList[this.portfolioCount - 1]?.amount || ''
        },

        toCalcNumber() {
            return this.isSelectNum ? this.selectAmount : this.number
        },
    },
    filters: {
        amountFilter(v) {
            return amountFormatter(v, { base: 2 })
        },
    },
    watch: {
        period: {
            handler() {
                if (this.isSelectNum) {
                    this.initPortfolioNumberList()
                    this.confirmSelectNum({ count: this.portfolioCount })
                }
                if (this.isInputAmount) {
                    this.number = ''
                    this.amountDisplay = ''
                    this.resetLotNum()
                }
                this.placeholder = '0.00' + this.currencyName + this.$t('trade.qi')
            },
        },
    },
    created() {
        this.getKeyboardState()
    },
    async mounted() {
        await this.getExchangeRate()
        await Promise.all([this.getData(), this.getPortfolioHoldingAllocation(1)])

        this.initPortfolioNumberList()
        this.adjustAmountElementFontSize()
        this.checkRatio(this.isFromInvestionRatioPage)
        if (this.$jsBridge) {
            this.$jsBridge.watchPageVisible(() => {
                this.checkRatio(this.isFromInvestionRatioPage)
                this.isFromInvestionRatioPage = false
            })
        }

        this.$nextTick(() => {
            dynamicFontSize({ dom: this.$refs.minPricePerRef, minFontSize: 21, interval: 1 })
        })
    },
    beforeDestroy() {
        this.monitorKeyboard.onEnd()
    },
    methods: {
        // 动态更新金额字体大小
        adjustAmountElementFontSize() {
            setTimeout(() => {
                const ref = this.$refs.amountRef
                if (!ref) return
                const refComputed = getComputedStyle(ref)
                const height = Number.parseFloat(refComputed.height)
                const paddingTop = Number.parseFloat(refComputed.paddingTop)
                const lineHeight = Number.parseFloat(refComputed.lineHeight)
                if (NP.divide(NP.minus(height, paddingTop), lineHeight) > 1.6) {
                    ref.style.fontSize = '0.1rem'
                }
            }, 60)
        },
        getKeyboardState() {
            this.monitorKeyboard = new MonitorKeyboard()
            this.monitorKeyboard.onStart()
            // 监听虚拟键盘弹出事件
            this.monitorKeyboard.onShow(() => {
                console.log('键盘弹出')
            })

            //监听键盘收起的事件
            this.monitorKeyboard.onHidden(() => {
                console.log('键盘收起')
            })
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
        async getPortfolioHoldingAllocation(queryType = 0) {
            try {
                const data = await PortfolioHoldingAllocation({
                    id: this.$route.query.portfolioId,
                    queryType,
                })
                const { detail } = data.result

                let amountDisplay = ''

                let list
                if (this.isFund) {
                    list = detail && detail.holding
                    list.forEach(item => {
                        item.holding = item.industryHolding
                        item.holding.forEach(i => {
                            i.lotNum = 0
                            i.bestLotNum = 0
                            i.radio = 1
                        })
                        item.marketType = item.industryCode
                    })
                    this.holdingList = list

                    // 组合是基金时
                    const absStartAmount = this.calculateFundStartAmount() // 抽象的起投金额（包含现金部分）
                    this.holdingList.forEach(group => {
                        group.holding.forEach(item => {
                            let latestPrice = NP.times(absStartAmount, NP.divide(item.ratio, 100))
                            latestPrice = keepDecimals(latestPrice, 2)
                            item.lotNum = latestPrice
                            item.bestLotNum = latestPrice
                        })
                    })
                    amountDisplay = this.minPricePer

                    this.placeholder = thousandsFilter(keepDecimals(amountDisplay, 2)) + this.currencyName + this.$t('trade.qi')
                } else {
                    list = detail && detail.marketHolding
                    this.stockRatio = 0
                    list.forEach(item => {
                        this.stockRatio = NP.plus(this.stockRatio, item.ratio)
                        item.holding.forEach(i => {
                            i.lotNum = 0
                            i.bestLotNum = 0
                        })
                    })
                    this.stockRatio = NP.divide(this.stockRatio, 100)
                    this.holdingList = list

                    // 组合是股票时计算
                    const maxPrice = this.calculateStockStartAmount()

                    this.holdingList.forEach(group => {
                        group.holding.forEach(item => {
                            item.lotNum = item.minTradeUnit
                            const lotNum = this.calcNumberOfStock(maxPrice, item)
                            item.bestLotNum = lotNum

                            item.lotNum = lotNum
                        })
                    })
                    amountDisplay = this.minPricePer
                    this.placeholder = `0.00${this.currencyName}${this.$t('trade.qi')}`
                }
                this.number = this.minPricePer + ''
                this.amountDisplay = thousandsFilter(keepDecimals(this.number, 2))
            } catch (e) {
                console.log('error', e)
            }
        },

        handleItemInput(index, input) {
            input && this.checkInputLengthToChangeFontSize(input)
        },
        checkRatio(fromInvestionRatio) {
            const id = localStorage.getItem('RATIO_ID')
            if (id !== this.$route.query.portfolioId && !fromInvestionRatio) {
                this.setRatioKey(this.$route.query.portfolioId)
                this.setInitialRatioList()
            } else {
                this.updateRatio(fromInvestionRatio)
            }
        },

        updateRatio(fromInvestionRatio = false) {
            const oldInvestmentList = JSON.parse(localStorage.getItem('investmentList') || '[]')
            const oldInvestmentListMap = oldInvestmentList.reduce((o, c) => ((o[c.symbol] = c), o), {})
            console.log(`Feng.chen:: 11:18:26 oldInvestmentListMap ===> `, oldInvestmentListMap)

            let list = this.leadHoldingList.reduce((l, i) => {
                const oldI = oldInvestmentListMap[i.symbol]
                // 副作用
                if (fromInvestionRatio) {
                    i.radio = oldI?.radio || i.radio
                }
                l.push(i)
                return l
            }, [])

            list = JSON.stringify(list)
            localStorage.setItem('investmentList', list)
        },

        setRatioKey(value) {
            localStorage.setItem('RATIO_ID', value)
        },

        setInitialRatioList() {
            let list = this.leadHoldingList
            console.log(`Feng.chen:: 14:58:55 list ===> `, list)
            list = JSON.stringify(list)
            localStorage.removeItem('investmentLength')
            localStorage.setItem('investmentList', list)
        },
        // 跳转到投资集中度
        goInvestmentConcentration() {
            const list = this.leadHoldingList.filter(item => !!item.lotNum)
            if (!list.length) {
                Toast(this.$t('follow.lastNumber'))
                return
            }
            this.checkRatio()
            this.goFollowInvestmentConcentration()
        },
        goFollowInvestmentConcentration() {
            const url = `${location.origin}${location.pathname}#/follow-investment-concentration?portfolioId=${this.$route.query.portfolioId}`
            if (this.$jsBridge) {
                this.isFromInvestionRatioPage = true
                return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            }
            this.$router.push({ name: 'followInvestmentConcentration', query: { portfolioId: this.$route.query.portfolioId } })
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
                const list = this.leadHoldingList
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
            const fileName = `客户声明_${getLangType()}.pdf`
            const title = this.$t('protocol.clientStatement')
            const url = `${location.origin}/wealth/static/${fileName}`
            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },
        async handleBuy() {
            if (!this.canSign) return

            if (!this.isStock) {
                const noValidRatioLength = this.leadHoldingList.some(i => i.radio > i.investFocusDegree)
                if (noValidRatioLength) {
                    return this.failureDialog(3)
                }
            }
            if (!this.isStock) {
                // 基金需要校验可提
                const { singleWithdrawBalance, summaryWithdrawBalance } = this.withdrawalBalanceData
                const noEnoughBalance =
                    NP.minus(singleWithdrawBalance, summaryWithdrawBalance) > 0 && NP.minus(summaryWithdrawBalance, this.toCalcNumber) < 0
                if (noEnoughBalance) {
                    return this.$toast(this.$t('tradeFailedForDebt'))
                }
            }

            // 衍生品权限
            if (!(await this.checkDerivatives(this.isStock ? 'stock' : 'fund'))) return
            if (this.isStock) {
                // 股票 - 内部员工交易限制
                if (!(await this.checkTradeLimit(this.leadHoldingList.map(i => i.productCode)))) return
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
            const totalAmount = amountFormatter(this.toCalcNumber, { base: 2 })
            this.confirmList[0]['value'] = this.subAccountId
            this.confirmList[1]['value'] = this.obj.portfolioName
            this.confirmList[2]['value'] = this.marketName
            this.confirmList[3]['value'] = this.leadHoldingList.filter(item => !!item.lotNum).length + this.$t('zhi')
            this.confirmList[3].label = this.isFund ? this.$t('follow.fundAmount') : this.$t('follow.stockAmount')
            this.confirmList[4]['value'] = totalAmount + this.currencyName

            let insufficientAmountTip = ''
            let insufficientAmountContent = ''
            const insufficientAmountTipRef = this.getInsufficientTipRef()
            if (this.isMix) {
                const [first, second] = this.holdingList
                const firstCurrency = first?.holding[0]?.currency
                const secondCurrency = second?.holding[0]?.currency
                const firstCurrencyName = CURRENCY_MAP.keyValueMap[firstCurrency]
                const secondCurrencyName = CURRENCY_MAP.keyValueMap[secondCurrency]
                const oppositeCurrencyName = CURRENCY_MAP.keyValueMap[this.opposeCurrency]
                const firstOrderAmount = this.groupAmount(first)
                const secondOrderAmount = this.groupAmount(second)
                this.confirmList[5] = { label: '', value: '' }
                const oppositeAmount = keepDecimals(NP.times(this.toCalcNumber, this.opposeCurrentRate), 2)
                this.confirmList[5]['value'] = '≈' + amountFormatter(oppositeAmount) + oppositeCurrencyName

                const isFirstInsufficientAmount = this.isInsufficientAmount(firstCurrency, firstOrderAmount)
                const isSecondInsufficientAmount = this.isInsufficientAmount(secondCurrency, secondOrderAmount)
                const firstInsufficientAmount = this.getInsufficientAmount(firstCurrency, firstOrderAmount)
                const secondInsufficientAmount = this.getInsufficientAmount(secondCurrency, secondOrderAmount)
                const showFirstInsufficientWarn = isFirstInsufficientAmount && firstInsufficientAmount > 0
                const showSecondInsufficientWarn = isSecondInsufficientAmount && secondInsufficientAmount > 0
                this.confirmList[4]['warnValue'] = showFirstInsufficientWarn || showSecondInsufficientWarn
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
                const currency = this.obj.currency
                const toCalcNumber = this.toCalcNumber
                const isInsufficientAmount = this.isInsufficientAmount(currency, toCalcNumber)
                const insufficientAmount = this.getInsufficientAmount(currency, toCalcNumber)
                const showInsufficientWarn = isInsufficientAmount && insufficientAmount > 0
                console.log(
                    `confirmDialog isInsufficientAmount=${isInsufficientAmount};insufficientAmount=${insufficientAmount};showInsufficientWarn=${showInsufficientWarn}`
                )
                this.confirmList[4]['warnValue'] = showInsufficientWarn
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

            let html = ''
            this.confirmList.forEach(item => {
                const valueClass = item['warnValue'] ? 'c-main high-light' : 'c-main'
                html += `<div class="h-32 flex-s f14"> <span class="c-gray">${item.label}</span> <span class="${valueClass}">${item.value}</span> </div>`
            })

            if (insufficientAmountTip) {
                html += insufficientAmountTip
            }

            Dialog.confirm({
                title: this.$t('trade.rgqr'),
                className: 'dialog-pad-top buy-confirm-dialog',
                message: html,
                messageAlign: 'center',
                showCancelButton: true,
                confirmButtonText: this.$t('confirm'),
            })
                .then(() => {
                    this.appTradeFn()
                })
                .catch(() => {})
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
            console.log(`isInsufficientAmount avaliableCash=${avaliableCash},purchasingPower=${purchasingPower},orderAmountF=${orderAmountF}`)
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
            //同币种星财宝抵押值
            const ecashHolding = parseFloat(ecashHoldingResult?.[`${currency}SellableAmount`] || 0)

            const insufficientAmount = NP.minus(orderAmountF, avaliableCash, ecashHolding) //跨币种交易/使用到融资的金额
            console.log(`getInsufficientAmount ecashHolding=${ecashHolding},avaliableCash=${avaliableCash},insufficientAmount=${insufficientAmount}`)
            return insufficientAmount
        },
        /** 根据账户类型获取下单提示的文字引用 */
        getInsufficientTipRef() {
            if (this.isMarginAccount) {
                return 'follow.orderMarginFeeHint'
            }
            return 'follow.orderCashExchangeHint'
        },
        groupAmount(group) {
            let total = 0
            group.holding.forEach(item => {
                if (this.isFund) {
                    total = NP.plus(total, item.lotNum || 0)
                } else {
                    total = NP.plus(total, NP.times(item.lotNum || 0, calcTradePrice(item)))
                }
            })
            return total
        },
        // 下单买入
        async appTradeFn() {
            try {
                const orderDetail = []
                const estimateBuyInfo = []
                this.holdingList.forEach(item => {
                    if (this.isStock) {
                        const amount = item.holding.reduce((o, c) => {
                            const curProductAmount = NP.times(c.lotNum, calcTradePrice(c))
                            o = NP.plus(o, curProductAmount)
                            return o
                        }, 0)

                        const currency = item.holding[0]?.currency
                        estimateBuyInfo.push({
                            amount: amount,
                            currency,
                            fee: 0, // 费用待接口提供， 1期来不及
                        })
                    }
                    item.holding.forEach(i => {
                        let ret
                        if (this.isStock) {
                            ret = {
                                productType: i.productType,
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
                if (this.isFund) {
                    const amount = this.toCalcNumber
                    const currency = this.currency
                    estimateBuyInfo.push({
                        amount,
                        currency,
                        fee: 0, // 费用待接口提供， 1期来不及
                    })
                }
                const params = {
                    subAccountId: this.subAccountId,
                    estimateBuyInfo,
                    portfolioId: Number(this.$route.query.portfolioId),
                    optType: 1,
                    orderDetail,
                    simulated: ORDER_PATH_TYPE.keysMap.order,
                }
                this.$loading.show = true
                const data = await PortfolioOrderCreate(params, { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC })
                const { result } = data
                Toast.success(this.$t('follow.alreadySubmit'))
                sessionStorage.setItem('orderResult', JSON.stringify(result))
                this.$router.replace({ name: 'followOrderResult', query: { portfolioId: this.$route.query.portfolioId } })
            } catch (e) {
                console.log('bond-tradeLogin===>error:', e)
                const msg = e.error?.data?.tips
                if (msg) {
                    return Toast(msg)
                }
                Toast(this.$t('tradeFailed'))
            } finally {
                this.$loading.show = false
            }
        },

        goPageWithH5(url, title = '') {
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title })
            } else {
                location.href = url
            }
        },

        // 入金
        deposit() {
            const { VUE_APP_EDDA_H5_APP, VUE_APP_EDDA_H5 } = pathnames
            const url = this.$jsBridge ? VUE_APP_EDDA_H5_APP : VUE_APP_EDDA_H5
            this.goPageWithH5(url)
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
        //检测输入值返回错误信息
        calcWrong(num) {
            if (this.depositFlag && this.purchasingPower !== '') {
                return this.$t('notEnoughCash')
            }
            if (this.isSelectNum) {
                return ''
            }
            if (num == '' || this.amountDisplay == '') {
                return ''
            }
            if (Number(num) < Number(this.minInitial)) {
                return this.$t('follow.minInitialAmountText', {
                    minInitial: thousandsFilter(keepDecimals(this.minInitial, 2)),
                    currencyName: this.currencyName,
                })
            } else if (Number(num) > 999999999.99) {
                return `${this.$t('trade.cgmrjexzdbzdmr')}${this.currencyName}`
            }
            return ''
        },
        //返回输入位数
        calcDigits(num) {
            if (this.amountDisplay == '') {
                return ''
            }
            num = String(num)
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
        formatPrice(e) {
            let ret = e.target.value
            ret = ret.replace(/[^\d.]/g, '')
            //必须保证第一位为数字而不是.
            ret = ret.replace(/^\./g, '')
            //保证只有出现一个.而没有多个.
            ret = ret.replace(/\.{2,}/g, '.')
            //保证.只出现一次，而不能出现两次以上
            ret = ret.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
            if (ret.includes('.')) {
                const arr = ret.split('.')
                let integerPart = arr[0]
                const decimalPart = arr[1]
                integerPart = integerPart.replace(new RegExp(`^(.{${(1, 9)}}).*$`), '$1')
                ret = [integerPart, decimalPart].join('.')
            } else {
                ret = ret.replace(new RegExp(`^(.{${(1, 9)}}).*$`), '$1')
            }
            return ret.replace(new RegExp(`^(.*\\..{${this.limitDecimal}}).*$`), '$1') //只能输入2位小数
        },
        onPriceInput(value) {
            // 认为删除了“，”
            const amountLen = this.amountDisplay.length
            const valueLen = value.length
            if (valueLen < amountLen && value !== this.amountDisplay && thousandsFilter(value.replace(/[,]/g, '')) === this.amountDisplay) {
                let index = 0
                for (let i = 0; i < amountLen; i++) {
                    const oldV = this.amountDisplay[i]
                    const newV = value[i]
                    if (oldV !== newV) {
                        index = i
                        break
                    }
                }
                // 说明删除的为“,”前一位
                index -= 1
                // 更新value数据
                value = value.substring(0, index) + value.substring(index + 1, value.length)
            }

            this.number = this.formatPrice({ target: { value: value } }) //只能输入2位小数
            this.amountDisplay = thousandsFilter(this.number)
            this.$refs.inputAmountRef.$refs.input.value = this.amountDisplay
        },

        checkInputLengthToChangeFontSize(input) {
            this.$nextTick(() => {
                const value = (input || '').value
                const edgeLength = 10
                input.style.fontSize = value.length >= edgeLength ? '0.1rem' : '0.12rem'
            })
        },
        // 实时获取对应的小数位
        getStockLimitDecimal(index) {
            const ret = this.leadHoldingList[index].latestPrice

            let len = 2
            if (this.isUSStock) {
                len = NP.minus(ret, 1) >= 0 ? 2 : 4
            }
            if (this.isHKStock) {
                len = 3
            }
            return len
        },

        onStockBlur(e, index) {
            let ret = this.leadHoldingList[index].latestPrice
            const len = this.getStockLimitDecimal(index)
            // eslint-disable-next-line prefer-const
            let [intNumber, demc = ''] = (ret + '').split('.')
            demc = demc.length >= len ? demc.slice(0, len) : demc.padEnd(len, '0')
            ret = `${intNumber}.${demc}`
            this.leadHoldingList[index].latestPrice = ret

            this.leadHoldingList[index].isFocus = false
        },

        onStockInputFocus(index) {
            this.leadHoldingList[index].isFocus = true
        },
        handleFocus() {
            this.focusVal = keepDecimals(Number(this.number), 2)
        },
        handleItemBlur(e, item) {
            if (item.lotNum < item.minTradeUnit) {
                item.lotNum = item.minTradeUnit
            }
        },
        chkLast() {
            // 失去焦点，计算每个股票的价格和数量
            if (this.amountDisplay == '') {
                return ''
            }
            this.number = keepDecimals(Number(this.number), 2)
            this.amountDisplay = thousandsFilter(this.number)
            // 失焦与聚焦的金额不对才计算
            if (NP.minus(this.number, this.focusVal) !== 0) {
                // 计算最小可买入金额
                const oldNumber = this.number

                this.calculateFn()
                if (NP.minus(this.number, this.stockBestAmount) < 0) {
                    // restore list data
                    this.leadHoldingList.forEach(i => {
                        i.lotNum = i.bestLotNum
                    })
                    this.unvalidAmountTip()
                    this.number = this.minPricePer + ''
                    this.amountDisplay = thousandsFilter(keepDecimals(this.number, 2))
                    return
                }

                this.$nextTick(() => {
                    this.handleItemInput()
                    this.displayCalcResult(oldNumber, this.number)
                })
                return
            }
        },

        displayCalcResult(oldNumber, number) {
            const title = `<p class="tip">${this.$t('follow.calcTipTitle')}</p>`
            const userInputAmount = `<li class="list-item"><span>${this.$t('follow.calcTipForInputAmount')}</span><span>${thousandsFilter(
                oldNumber
            )}${this.currencyName}</span></li>`
            const systemCalcAmount = `<li class="list-item"><span>${this.$t('follow.calcTipForSystemAmount')}</span><span>${thousandsFilter(
                keepDecimals(number, 2)
            )}${this.currencyName}</span></li>`
            const canBuyCount = `<li class="list-item"><span>${this.$t(
                this.isFund ? 'follow.calcTipForFundCount' : 'follow.calcTipForStockCount'
            )}</span><span>${this.buyNum}${this.$t('zhi')}</span></li>`
            const isGreatThanMinPricePer = NP.minus(number, this.minPricePer) >= 0
            const bestAmount = isGreatThanMinPricePer
                ? ''
                : `<li class="list-item"><span>${this.$t('follow.calcTipForBestAmount')}</span><span>${thousandsFilter(
                      keepDecimals(this.minPricePer, 2)
                  )}${this.currencyName}</span></li>`
            const list = `<ul class="list">${userInputAmount}${systemCalcAmount}${bestAmount}${canBuyCount}</ul>`
            this.$dialog.confirm({
                title: this.$t('sweetTip'),
                message: `${title}${list}`,
                allowHtml: true,
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                className: 'order-sweet-tip',
            })
        },

        unvalidAmountTip() {
            const title = `<p class="tip">${this.$t('follow.calcTipTitle')}</p>`
            const bestAmount = `<li class="list-item"><span>${this.$t('follow.calcTipForBestAmount')}</span><span>${thousandsFilter(
                keepDecimals(this.minPricePer, 2)
            )}${this.currencyName}</span></li>`
            const list = `<ul class="list">${bestAmount}</ul>`
            this.$dialog.confirm({
                title: this.$t('sweetTip'),
                message: `${title}<div class="unvalid-amount"><span>${this.$t('follow.resetToBestAmountTip')}</span>${list}</div>`,
                allowHtml: true,
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                className: 'order-sweet-tip',
            })
        },

        getPopover(data) {
            const UP_BASE_PERCENT = 0.02 // 评判百分比
            const DOWN_BASE_PERCENT = -0.02 // 评判百分比
            const res = NP.minus(data.latestPrice, data.initialPrice)
            let percent = NP.divide(res, data.initialPrice)
            percent = percent > 1 ? 1 : percent < -1 ? -1 : percent
            const toFixedPercent = keepDecimals(Math.abs(NP.times(percent, 100)), 2)
            const isUpPrice = NP.minus(percent, UP_BASE_PERCENT) > 0
            const isDownPrice = NP.minus(percent, DOWN_BASE_PERCENT) < 0
            if (isUpPrice || isDownPrice) {
                return {
                    popover: true,
                    popoverMsg: isUpPrice
                        ? this.$t('follow.heightPrice', { percent: toFixedPercent })
                        : isDownPrice
                        ? this.$t('follow.lowPrice', { percent: toFixedPercent })
                        : '',
                }
            }
            return {
                popover: false,
                popoverMsg: '',
            }
        },
        // eslint-disable-next-line max-params
        calculateHKStock(item, allUnchecked = false, calcAmount = 0, assignAmount = 0) {
            if (!assignAmount && calcAmount) {
                const ratio = NP.divide(item.ratio, 100)
                assignAmount = NP.times(calcAmount, ratio)
            }

            let lotNum = parseInt(NP.divide(assignAmount, item.latestPrice))
            lotNum = allUnchecked ? lotNum : 0
            const lotHands = parseInt(NP.divide(lotNum, item.minTradeUnit)) // 能买多少手 - 向下取整
            lotNum = NP.times(lotHands, item.minTradeUnit) // 实际能买股数
            item.lotNum = lotNum
        },

        // eslint-disable-next-line max-params
        calculateUSDStock(item, allUnchecked = false, calcAmount = 0, assignAmount) {
            if (!assignAmount && calcAmount) {
                const ratio = NP.divide(item.ratio, 100)
                assignAmount = NP.times(calcAmount, ratio)
            }

            const lotNum = parseInt(NP.divide(assignAmount, item.latestPrice)) // 向下取整
            item.lotNum = allUnchecked ? lotNum : 0
        },
        // 如果计算完后 没有包含 持仓占比最高的产品，则将“买入金额”分配到选种产品中占比最高的
        getMaxRatioProduct(list = []) {
            // 如果计算完后“买入金额”一个能买的都没有 - 则将金额分配到选中产品中占比最高的
            let maxRatioProduct = list[0]
            const { ratio: maxRatio } = list[0]
            const maxRatioProductList = list.filter(i => i.ratio === maxRatio)

            if (maxRatioProductList.length >= 2) {
                // 1、存在占比相同的产品时 选择股价小得产品来作为分配产品
                for (let i = 0; i < maxRatioProductList.length; i++) {
                    const j = maxRatioProductList[i]
                    if (maxRatioProduct) {
                        if (NP.minus(j.latestPrice, maxRatioProduct.latestPrice) < 0) {
                            maxRatioProduct = j
                        }
                    } else {
                        maxRatioProduct = j
                    }
                }
            }
            return maxRatioProduct
        },

        getCalcAmount() {},

        getCheckedProductRatio() {},
        // 获取持仓占比最高的产品是否被买入
        getMaxRatioProductStatus(checkedList = [], newCheckedList = []) {
            const { ratio: maxRatio } = checkedList[0] || {}
            const maxRatioProductList = checkedList.filter(i => i.ratio === maxRatio)
            return !newCheckedList.find(i => !!maxRatioProductList.find(j => j.symbol === i.symbol))
        },
        amountFormat(v, decimal = 2) {
            v = v + ''
            v = v.replace(/,/g, '')
            return amountFilter(keepDecimals(Number(v), decimal))
        },
        calculateStock() {
            let total = 0
            const isBest = NP.minus(this.number, this.stockBestAmountFixed.replace(/,/g, '')) === 0
            let calcAmount = NP.divide(this.number, this.stockRatio)

            if (isBest) {
                calcAmount = this.startStockAmount
            }
            this.lastInputAmount = this.amountFormat(this.amountDisplay, 2)
            this.leadHoldingList.forEach(item => {
                // 整手股数
                const number = this.calcNumberOfStock(calcAmount, item)
                item.lotNum = number
                total = NP.plus(total, NP.times(number, this.calcPrice(item)))
                // 换算汇率价格
                const price = this.calcPrice(item)
                if (item.lotNum) {
                    if (isBest) {
                        item.nowRatio = NP.divide(NP.times(item.lotNum, price), NP.divide(this.stockBestAmount, this.stockRatio))
                    } else {
                        item.nowRatio = NP.divide(NP.times(item.lotNum, price), calcAmount)
                    }
                    item.nowRatio = NP.times(item.nowRatio, 100)
                } else {
                    item.nowRatio = 0
                }
            })

            this.number = total + ''
            this.amountDisplay = this.amountFormat(total, 2)
        },
        calculateFund() {
            // 全部取消勾选 则percent为0
            const percent = this.leadHoldingList.reduce((p, c) => {
                p = NP.plus(p, NP.divide(c.ratio, 100))
                return p
            }, 0)
            const startAmount = NP.divide(this.number, percent)
            // 组合是基金时
            this.leadHoldingList.forEach(item => {
                const ratio = NP.divide(item.ratio, 100)
                const assignAmount = NP.times(startAmount, ratio)
                item.latestPrice = assignAmount
                item.lotNum = assignAmount
            })
            this.number =
                this.leadHoldingList.reduce((o, c) => {
                    o = NP.plus(o, c.latestPrice)
                    return o
                }, 0) + ''
        },
        calculateFn() {
            const { portfolioType } = this.obj
            if (this.isStock) {
                this.calculateStock(portfolioType)
            }

            if (this.isFund) {
                this.calculateFund()
            }
        },

        onClear() {
            this.number = ''
            this.amountDisplay = ''
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
            const checkList = this.leadHoldingList
            if (!checkList.length) return true
            const [res] = await this.checkSuitability({ forceRefresh: this.forceRefresh, checkList })
            const { matchDerivative, matchRes, isMatch, info } = res || {}
            if (res && !matchDerivative) {
                const { VUE_APP_DERIVATIVE_PAGE } = pathnames
                const url = `${VUE_APP_DERIVATIVE_PAGE}?needRisk=1&matchRes=${matchRes}${!isMatch ? `&symbol=${info.symbol}&user=1` : ''}`
                this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : (location.href = this.$addCurParamsForUrl(url))
                return false
            }
            return true
        },
        // 合适性匹配
        async checkSuitability({ checkList = [] } = {}) {
            const cache = []
            await this.getUserRiskInfo({ forceRefresh: true })
            const hd = checkList || this.this.leadHoldingList

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
                const ret = await this.getFund(this.leadHoldingList) // 只需要获取一个基金即可
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
                            const symbol = res?.info?.fundID
                            const investFocusDegree = this.leadHoldingList.find(i => i.fundID === symbol)?.radio || 1
                            if (this.$jsBridge) {
                                const url = `${location.origin}/wealth/fund.html#/no-matched-risk?symbol=${symbol}&user=1&investFocusDegree=${investFocusDegree}`
                                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                            } else {
                                this.$router.push(`/no-matched-risk?symbol=${symbol}&user=1&investFocusDegree=${investFocusDegree}`)
                            }
                        })
                    return false
                }
                return true
            } catch (e) {
                console.error(e)
            }
        },

        clickBuyTypeSwitch() {
            this.showTypeSwitch = true
        },

        clickSelectNum() {
            this.showNumSelect = true
        },

        confirmSwitchType(type) {
            this.buyType = type
            if (this.buyType === FOLLOW_BUY_TYPE.keysMap.number) {
                this.initPortfolioNumberList()
                this.confirmSelectNum({ count: 1 })
            } else {
                this.number = this.minPricePer
                this.amountDisplay = thousandsFilter(keepDecimals(this.number, 2))
                const list = this.calcPortfolioOfCountToAmount(1)
                this.assignLotNum(list)
            }
        },

        calculateFundStartAmount() {
            return this.startFundAmount
        },
        calculateStockStartAmount() {
            return this.startStockAmount
        },

        confirmSelectNum(item) {
            this.portfolioCount = item.count
            this.leadHoldingList.forEach((i, idx) => {
                i.lotNum = this.numberList[item.count - 1].list[idx].lotNum
                i.nowRatio = undefined
            })
            this.$nextTick(() => {
                dynamicFontSize({ dom: this.$refs.minPricePerRef, minFontSize: 21, interval: 1 })
            })
        },

        onPeriodChoose(e) {
            this.period = e.target.dataset.key
            console.log(`Feng.chen:: 14:44:27 period ===> `, this.period)
        },
        getPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },

        calcFundTotalAmount() {},

        calcSingleFundSubscribeAmount(data = {}) {
            return NP.times(data.lotNum, this.calcPrice(data))
        },
        calcSingleStockSubscribeAmount(data = {}) {
            return data.lotNum
        },

        calcPortfolioToAmount(absStartAmount, portfolioList = []) {
            const ret = portfolioList.reduce(
                (o, i) => {
                    if (this.isStock) {
                        i.lotNum = this.calcNumberOfStock(absStartAmount, i)
                        o.amount = NP.plus(o.amount, NP.times(i.lotNum, this.calcPrice(i)))
                    } else {
                        const amount = NP.times(absStartAmount, NP.divide(i.ratio, 100))
                        i.lotNum = keepDecimals(amount, 2)
                        o.amount = NP.plus(o.amount, i.lotNum)
                    }
                    o.list.push({ productCode: i.productCode, currency: i.currency, lotNum: i.lotNum })
                    return o
                },
                { amount: 0, list: [] }
            )
            ret.amount = keepDecimals(ret.amount, 2)
            return ret
        },

        calcPortfolioOfCountToAmount(num = 100, list = this.leadHoldingList) {
            let absStartAmount = 0
            if (this.isStock) {
                absStartAmount = this.calculateStockStartAmount()
            } else {
                absStartAmount = this.calculateFundStartAmount()
            }

            return Array.from({ length: num }).map((_, idx) => {
                let startAmount = 0
                const count = idx + 1
                startAmount = NP.times(absStartAmount, count)
                const ret = this.calcPortfolioToAmount(startAmount, cloneDeep(list))
                return { count, ...ret }
            })
        },

        calcPortfolioOfHKD() {
            this.hkdNumberList = this.calcPortfolioOfCountToAmount()
        },
        calcPortfolioOfUSD() {
            this.usdNumberList = this.calcPortfolioOfCountToAmount()
        },

        initPortfolioNumberList() {
            let key = ''
            let method = ''
            if (this.currency === 'HKD') {
                key = 'hkdNumberList'
                method = 'calcPortfolioOfHKD'
            } else {
                key = 'usdNumberList'
                method = 'calcPortfolioOfUSD'
            }

            const list = this[key]
            if (list.length) return
            this[method]?.()
        },

        assignLotNum(list = []) {
            this.leadHoldingList.forEach((i, idx) => {
                i.lotNum = list[0].list[idx].lotNum
            })
        },

        resetLotNum() {
            this.leadHoldingList.forEach(i => {
                i.lotNum = 0
            })
        },
    },
}
</script>
<style lang="less" scoped>
.basic-info {
    .bottom {
        margin-top: 10px;
    }

    &.pad-b158 {
        padding-bottom: 156px;
    }

    .top_info {
        position: relative;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px 10px 12px 12px;
        color: #2f2f2f;
        background: #fff;
        border-radius: 8px;

        &-name {
            padding: 0 0 7px;

            & > h5 {
                line-height: 22px;
            }
        }

        .big_value {
            padding: 0 0 5px;
            font-weight: bold;
            font-size: 18px;
            line-height: 26px;
            text-align: right;
        }

        .label {
            color: #666;
            font-size: 12px;
            line-height: 16px;
            text-align: right;
        }
    }
}

.outter-quote-permission {
    & + .pad-t44 {
        padding-top: 44px;
    }
}

.valid-account {
    font-size: 12px;
    line-height: 16px;
}

.popover-tips {
    padding: 4px 6px;
}

.pad-b158 {
    padding-bottom: 158px;
}

.h-48 {
    height: 48px;
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

.table-header,
.table-body {
    height: 32px;
    padding: 12px 0 4px 38px;

    .item {
        width: 72px;
        margin-right: 12px;
        text-align: right;

        &:first-child {
            width: 132px;
            text-align: left;
        }

        &:nth-of-type(2) {
            margin-right: 16px;
        }
    }

    .item-field {
        width: 72px;
        height: 28px;
        padding: 2px 6px;
        background: #f7f7f7;
        border-radius: 4px;

        ::v-deep .van-field__control {
            text-align: right;
        }
    }

    .fund-field {
        display: flex;
        align-items: center;
        color: @fontBlackColor;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }
}

.table-body {
    height: 56px;
    padding-left: 0;

    .item {
        &:first-child {
            width: 170px;
        }
    }
}

.is-fund {
    .basic-info {
        &.pad-b158 {
            padding-bottom: 185px;
        }
    }

    .table-header,
    .table-body {
        .item {
            &:nth-of-type(1) {
                width: 134px;
            }

            &:nth-of-type(2) {
                flex-shrink: 0;
                width: 50px;
            }

            &:nth-of-type(3) {
                width: 88px;
            }
        }
    }

    .table-body {
        .item {
            &:first-child {
                width: 166px;
            }
        }
    }
}

.row-reverse {
    flex-direction: row-reverse;
}

.deposit-funds-button {
    width: 72px;
    color: #fff;
    font-weight: 500;
    font-size: 12px;
    line-height: 24px;
    background: #ff6907;
    border: none;
    border-radius: 31px;
    outline: none;
}

.buyBox {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 12px;
    background: #fff;
    border-radius: 8px;

    .autoBuy {
        z-index: 10;
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding-top: 15px;

        .left {
            display: flex;
            align-items: center;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;

            .popover {
                position: relative;
                z-index: 12;
                display: flex;
                flex-direction: row;
                align-items: center; // 上下居中
                margin-left: 12px;
                color: #666;
                font-size: 14px;

                label {
                    display: flex;
                    align-items: center; // 上下居中
                    // justify-content: center; // 左右居中

                    & > span {
                        flex: 1 0 auto;
                    }

                    img {
                        width: 16px;
                        margin-left: 16px;

                        &.trigger {
                            width: 6px;
                            margin-left: 4px;
                        }
                    }

                    .trigger-container {
                        position: relative;
                    }
                }

                .list {
                    width: 69px;
                    overflow: hidden;
                    border-radius: 4px;

                    .item {
                        color: #2f2f2f;
                        font-size: 14px;
                        line-height: 36px;
                        text-align: center;
                        background-color: #fff;
                        box-shadow: inset 0 -0.5px 0 #efefef;

                        &.selected {
                            color: #ff6907;
                        }
                    }
                }
            }
        }

        .right {
            font-weight: normal;
            font-size: 12px;
            line-height: 22px;

            .icon-right {
                width: 8px;
                height: 8px;
            }
        }
    }

    .wrongTip {
        margin-top: 6px;
        margin-bottom: 2px;
        color: #f31414;
        font-size: 12px;
        line-height: 16px;
    }

    .outter-capital-detail {
        width: calc(100% + 24px);
        margin: 0 -12px;
        margin-top: 8px;
        border-radius: 0 0 8px 8px;

        ::v-deep(.capital-list) {
            margin-bottom: 4px;
        }
    }

    .buyInput {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 70px;
        margin-top: 16px;
        overflow: hidden;
        border: 1px solid #e8e8e8;
        border-radius: 8px;

        &.hasWrong {
            border: 1px solid #f31414;
        }

        .left {
            margin-left: 12px;
            color: #333;
            font-weight: bold;
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
            display: flex;
            flex: 1;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;

            ::v-deep .van-field {
                color: #000;
                font-weight: bold;
                font-size: 28px;
                line-height: 38px;

                input::-webkit-input-placeholder {
                    /* WebKit browsers 适配谷歌 */
                    color: rgba(156, 156, 156, 0.6);
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }

                input:-moz-placeholder {
                    /* Mozilla Firefox 4 to 18 适配火狐 */
                    color: rgba(156, 156, 156, 0.6);
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }

                input::-moz-placeholder {
                    /* Mozilla Firefox 19+ 适配火狐 */
                    color: rgba(156, 156, 156, 0.6);
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }

                input:-ms-input-placeholder {
                    /* Internet Explorer 10+  适配ie */
                    color: rgba(156, 156, 156, 0.6);
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }
            }

            .input-container {
                display: flex;
                align-items: center;
                width: 100%;
            }

            .amount {
                max-width: 183px;
                margin-left: 12px;
                color: @fontBlackColor;
                font-weight: bold;
                font-size: 28px;
                line-height: 38px;
            }

            .num {
                flex: 0 0 auto;
                margin-left: 8px;
                color: @fontBlackColor;
                font-weight: normal;
                font-size: 14px;
            }

            img {
                width: 16px;
                height: 16px;
                margin-right: 11px;
            }
        }

        .numTip {
            position: absolute;
            top: 6px;
            left: 74px;
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
    }

    .capital {
        width: 100%;
    }
}

.collapse_group {
    margin-top: 12px;

    ::v-deep(.van-cell__right-icon) {
        margin-left: 8px;
    }
}

footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 12px 0 12px 14px;
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
    }

    .button {
        height: 44px;
        margin: 0 16px;
        margin-top: 16px;
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
</style>

<style lang="less">
.buy-confirm-dialog {
    border-radius: 12px;

    .van-dialog__content {
        .van-dialog__message {
            padding-bottom: 24px;
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

<style lang="less">
.order-sweet-tip {
    .tip {
        margin-bottom: 14px;
        color: @fontLightColor;
        font-size: 12px;
        line-height: 17px;
    }

    .list {
        &-item {
            display: flex;
            justify-content: space-between;
            margin-top: 12px;

            span {
                font-size: 14px;
                line-height: 20px;

                &:nth-of-type(1) {
                    color: @fontGreyColor;
                }

                &:nth-of-type(2) {
                    font-weight: 700;
                }
            }

            &:nth-of-type(2) {
                span:nth-of-type(2) {
                    color: #ff6907;
                }
            }
        }
    }

    .unvalid-amount {
        color: #2f2f2f;
        font-size: 14px;
        line-height: 20px;

        .list {
            &-item {
                display: flex;
                justify-content: space-between;
                margin-top: 12px;

                span {
                    font-size: 14px;
                    line-height: 20px;

                    &:nth-of-type(1) {
                        color: @fontGreyColor;
                    }

                    &:nth-of-type(2) {
                        font-weight: 700;
                    }
                }
            }
        }
    }
}
</style>
