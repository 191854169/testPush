<template>
    <div class="trade">
        <section class="product">
            <trade-account
                ref="tradeAccount"
                :orient="orient"
                :symbol="symbol"
                :type="currency"
                @changeType="changeAccountHandler"
                @changeProduct="changeProductHandler"
                @getProduct="getProductHandler"
            ></trade-account>
        </section>
        <section class="input-module">
            <p class="title">{{ orientText }}{{ $t('jine') }}</p>
            <div class="money">
                <trade-input
                    class="money-input"
                    ref="input"
                    :currency="currency"
                    v-model="amount"
                    :buttonMsg="`${$t('allAmount')}${this.orientText}`"
                    :placeholder="inputPlaceholder"
                    @trigger="triggerHandler"
                ></trade-input>
                <p class="money-tips" v-show="showMinAmountTips">
                    {{
                        $t('minLimitMsg', {
                            amount: `${decimalsFilter(minLimitPrice)}`,
                            currency: currencyWord,
                            orient: isRollIn ? $t('startAmount') : $t('rollOut'),
                        })
                    }}
                </p>
                <p class="money-tips" v-show="showSellNotEnoughTips">{{ $t('sellNotEnoughTips') }}</p>
                <p class="roll-out__tips" v-if="isRollOut">
                    <span>{{ $t('canRollOutAmount') }}</span>
                    <span>{{ canSellAmount | thousandsFilter }}</span>
                    <span>{{ currency | currencyFilter }}</span>
                </p>
            </div>
        </section>
        <capital-detail
            v-if="isRollIn"
            v-model="capitalGap"
            ref="capitalDetailRef"
            :product-buy-type="productBuyType"
            :andNeedDialogMessage="$t('andNeedMsgCash')"
            :currency="currency"
            :trade-amount="amount"
        ></capital-detail>
        <section class="detail" v-if="isRollIn && isAuto">
            <p class="detail-title">{{ $t('rollInDetail') }}</p>
            <ul>
                <li v-for="(item, index) in autoAllotList" :key="index">
                    <span class="left">{{ item.name }}</span>
                    <span class="right">
                        <span>{{ item.currency }}</span>
                        <span>&nbsp;</span>
                        <span>{{ item.price | thousandsFilter }}</span>
                    </span>
                </li>
            </ul>
        </section>
        <!-- 交易时间轴，存在可买卖的基金时展示 -->
        <section class="process" v-if="currentSymbol">
            <fosun-step :stepList="stepList"></fosun-step>
        </section>
        <section class="desc">
            <p class="desc-title">{{ $t('tradeRecommend') }}</p>
            <ul>
                <li>{{ $t('tradeRecommendText1', { time: currentCalendarTime, day: settlementDay.settlementDay }) }}</li>
                <li>{{ $t('tradeRecommendText2', { time: currentCalendarTime, day: settlementDay.redeemSettlementDay }) }}</li>
                <li>{{ $t('tradeRecommendText3') }}</li>
            </ul>
        </section>
        <section class="footer fixed-bottom">
            <div class="footer-top">
                <van-checkbox v-model="agreeFlag">
                    <template v-slot:icon="{ checked }">
                        <multi-img
                            class="check-img"
                            :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                            directory="common"
                        ></multi-img>
                    </template>
                    <p class="footer-top__text">
                        <span>{{ $t('bryydbty') }}</span>
                        <a @click.stop="goProtocol">《{{ $t('xgxy') }}》</a>
                        <span class="c-gray">及</span>
                        <a @click.stop="goStatement">《{{ $t('clientStatement') }}》</a>
                    </p>
                </van-checkbox>
            </div>
            <button v-debounce="tradeClickHandler" :class="{ 'can-trade': canTradeFlag }">{{ orientText }}</button>
        </section>
        <van-dialog
            v-model="tradeDialog"
            :title="`${this.orientText}${$t('queren')}`"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            :confirm-button-color="variable.theme"
            :confirm-button-text="$t('queding')"
            @confirm="confirmTrade"
        >
            <div class="diagBox">
                <div class="item">
                    <div class="left">{{ $t('tradeAccount') }}</div>
                    <div class="right">{{ accts.subAcctId }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('cpmc') }}</div>
                    <div class="right">
                        <span>{{ productName }}</span>
                        <span v-if="!isAuto">({{ currency | currencyFilter }})</span>
                    </div>
                </div>
                <div class="item">
                    <div class="left">{{ isRollIn ? $t('rollInAmount') : $t('rollOutAmount') }}</div>
                    <div class="right">{{ amount | thousandsFilter }}{{ currency }}</div>
                </div>
            </div>
        </van-dialog>
    </div>
</template>
<script>
import { orderCalendar, getFundTradingRule } from '@/apis/fund/fund.js'
import fosunStep from '@/components/fosunStep.vue'
import TradeInput from '@/components/TradeInput.vue'
import TradeAccount from '../components/tradeAccount.vue'
import { thousandsFilter, currencyFilter } from '@/config/filters'
import { keepDecimals, getTradeRuleCalendar } from '@/utils'
import { i18n } from '@/i18n/cashBox'
import { accountMap } from '../config/common'
import { ecashSubscribe, ecashRedeem, HoldingsTradeableV3 } from '@/apis/wealth/index.js'
import { debounce } from 'lodash'
import { getLangType } from '@/utils'
import { mapState } from 'vuex'
import { accDiv, accMul } from '@/utils/accurate.js'
import NP from 'number-precision'
import dayjs from 'dayjs'
import capitalDetail from '@/components/capitalDetail'
import { PRODUCT_BUY_TYPE } from '@/config/common'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import wealthOrderInstructionMixin from '@/mixins/wealthOrderInstructionMixin.js'
import { isInOutsideH5 } from '@/utils'
import { variable } from '@/assets/css/variable'
const accountKeyMap = accountMap.keyValueMap

const textMap = {
    rollIn: i18n.t('rollIn'),
    rollOut: i18n.t('rollOut'),
}
const decimalsFilter = v => {
    return thousandsFilter(keepDecimals(v, 2))
}

const DEFAULT_RULE_INFO = {
    buyRate: '', // 买入费率
    minInitial: '', // 起投金额
    minRedemption: '', // 最小赎回金额
    minRedemptionShare: '', // 最小赎回份额
    sellRate: '', // 赎回费率
    managerFee: '', // 管理费
    storageFee: '', // 托管费 !仅公募
    performanceFee: '', // 表现费
    otherFee: '', // 其他费用
    currency: '',
    sellDisplayType: 1, // 1 份额 2 金额
    minSubsequent: '',
    redeemSettlementDay: '',
    settlementDay: '',
}

export default {
    name: 'trade',
    components: {
        TradeInput,
        TradeAccount,
        capitalDetail,
        fosunStep,
    },
    mixins: [verifyMixin, wealthOrderInstructionMixin],
    filters: {
        thousandsFilter(v) {
            return thousandsFilter(keepDecimals(v, 2))
        },
        currencyFilter,
    },
    data() {
        return {
            variable,
            orient: this.$route.params.orient, // rollIn:买入 rollOut: 卖出
            currency: [accountKeyMap.HKD, accountKeyMap.USD].includes(this.$route.query.accountType)
                ? this.$route.query.accountType
                : accountKeyMap.HKD, // 账户类型
            amount: '',
            confirmTrade: debounce(this.tradeHandler, 1000, { leading: true, trailing: false }),
            symbol: undefined, // 选择交易产品 undefined: 自动分配
            agreeFlag: true, // 阅读协议
            tradeDialog: false, // 交易弹窗
            autoAllotList: [], // 自动分配转入明细
            chooseProduct: {}, // 选择的产品
            sellableAmountMap: {}, // 可转出金额Object key: [账户类型]SellableAmount
            ecashStatusInfo: {}, // 星财宝开通信息
            capitalGap: 0,
            myLinkTradeLogin: null, // 中移动交易密码登录、站外通用卖出校验交易密码
            symbolCalendar: {},
            ruleInfo: { ...DEFAULT_RULE_INFO },
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        settlementDay() {
            return {
                settlementDay: Number(this.ruleInfo.settlementDay) == 0 ? '' : '+' + this.ruleInfo.settlementDay,
                redeemSettlementDay: Number(this.ruleInfo.redeemSettlementDay) == 0 ? '' : '+' + this.ruleInfo.redeemSettlementDay,
            }
        },
        isRollIn() {
            return this.orient === 'rollIn'
        },
        isRollOut() {
            return this.orient === 'rollOut'
        },
        // 是否自动分配策略
        isAuto() {
            return !this.symbol
        },
        // 方向文案
        orientText() {
            return textMap[this.orient]
        },
        // 最小价格限制
        minLimitPrice() {
            // 原本 自动分配 最小价格限制为2，目前只买入单只改为1
            if (this.isRollIn) {
                return this.ruleInfo.minInitial
            }
            return this.ruleInfo.minRedemption
        },
        inputPlaceholder() {
            return `${decimalsFilter(this.minLimitPrice)}${currencyFilter(this.currency)}${this.$t('qi')}`
        },
        currencyWord() {
            return currencyFilter(this.currency)
        },
        // 可转出金额
        canSellAmount() {
            console.log('可转出金额==：', this.sellableAmountMap)
            return this.sellableAmountMap[this.currency] || 0
        },
        // 超过最小价格限制
        exceedMinLinit() {
            return NP.minus(this.amount, this.minLimitPrice) >= 0
        },
        // 显示未超过价格限制提醒
        showMinAmountTips() {
            return this.amount && !this.exceedMinLinit && this.$refs.input && !this.$refs.input.isFocus
        },
        // 可卖出金额不足提醒
        showSellNotEnoughTips() {
            if (!this.isRollOut) return false
            return !this.showMinAmountTips && NP.minus(this.canSellAmount, this.amount) < 0 && this.$refs.input && !this.$refs.input.isFocus
        },
        // 能否交易标识
        canTradeFlag() {
            const amount = +this.amount
            const canSellAmount = +this.canSellAmount
            if (this.isRollIn) {
                return this.exceedMinLinit && this.agreeFlag && this.capitalGap <= 0 && Number(this.amount) > 0
            }
            return this.exceedMinLinit && +this.agreeFlag && amount <= canSellAmount && Number(this.amount) > 0
        },
        // dialog产品名称
        productName() {
            return !this.isAuto ? this.chooseProduct.name || '' : `${this.$t('cashBox')}${textMap[this.orient]}${this.$t('smartTactics')}`
        },

        productBuyType() {
            return PRODUCT_BUY_TYPE.keysMap.cash
        },

        // 交易规则
        stepList() {
            const map = this.symbolCalendar[this.currentSymbol] || {}
            return getTradeRuleCalendar(map, this.isRollIn ? 'buy' : 'sell', this.$t.bind(this), { isCurrency: true, time: this.currentCalendarTime })
        },
        currentCalendarTime() {
            const map = this.symbolCalendar[this.currentSymbol] || {}
            const buyTime = map.cutOffTime || '09:45'
            const redeemTime = map.redeemCutOffTime || '13:00'
            const time = this.isRollIn ? buyTime : redeemTime
            return time
        },
        // 获取当前symbol
        currentSymbol() {
            if (this.symbol) return this.symbol
            if (this.isAuto && this.autoAllotList.length) {
                return this.autoAllotList[0].symbol
            }
            return ''
        },
    },
    watch: {
        amount: {
            handler() {
                this.autoAllocatPrice()
            },
        },
        isAuto: {
            handler() {
                this.autoAllocatPrice()
            },
        },
        symbol: {
            async handler() {
                this.symbolChangeHandler()
            },
        },
        $route: {
            handler(v) {
                let title = this.orientText
                if (v.query?.chooseProduct === 1) {
                    title = this.$t('select')
                }
                this.setTitle(title)
            },
            deep: true,
            immediate: true,
        },

        currentSymbol: {
            handler(v) {
                this.getOrderCalendar(v)
                this.getTradingRule(v)
            },
            deep: true,
            immediate: true,
        },
    },
    mounted() {
        this.getEcashStatus()
        const symbol = this.$route.query.symbol
        // const availableQuantity = this.$route.query.availableQuantity // 份额
        // const prevClose = this.$route.query.prevClose // 净值
        if (symbol) {
            // 代表是星财宝指定跳转过来的产品 watch中处理其他任务
            this.symbol = symbol
            if (this.$refs.tradeAccount && this.$refs.tradeAccount.$refs.chooseProduct) {
                this.$refs.tradeAccount.$refs.chooseProduct.$on('getProductList', list => {
                    // 通过choose-product组件内部获取产品列表
                    this.initProductHandler(list)
                })
            }
            this.initInstuction('CASHBOX')
        } else {
            this.symbolChangeHandler(true)
        }
    },
    methods: {
        decimalsFilter,
        async symbolChangeHandler(isFirstInit = false) {
            try {
                this.$loading.show = true
                const taskList = []

                if (isFirstInit) {
                    taskList.push([this.initInstuction('CASHBOX')])
                }

                if (this.isRollOut) {
                    // 转出查询用户持仓可交易信息
                    taskList.push(this.getHoldingsTradeable(this.symbol))
                }
                await Promise.all(taskList)
            } finally {
                this.$loading.show = false
            }
        },
        // 设置title
        setTitle(title) {
            if (this.$jsBridge) {
                this.$jsBridge.setTitle(title)
            }
            window.document.title = title
        },
        // 初始化选择产品
        async initProductHandler(list) {
            try {
                const instance = list.find(item => item.symbol === this.symbol)
                // 找到传过来的产品
                if (instance) {
                    // 指定账户类型、产品
                    this.currency = instance.currency
                    this.changeProductHandler(instance)
                    // 修改组件tradeAccount中的产品名
                    this.$nextTick(() => {
                        this.$refs.tradeAccount && (this.$refs.tradeAccount.productName = instance.name)
                    })
                }
            } catch (e) {
                console.log('rollOutProductHandler===>e:', e)
            }
        },
        // 获取用户持仓可交易信息
        async getHoldingsTradeable(symbol) {
            try {
                // 查询持仓清空之前的持仓数据，防止网络慢展示错误数据
                this.amount = ''
                this.sellableAmountMap = {}
                const params = {}
                const IS_MMF = 1 // 是否筛选MMF产品 1-是 0-否
                if (symbol) {
                    params.symbols = [symbol]
                } else {
                    params.mmf = IS_MMF
                }
                const { result = {} } = await HoldingsTradeableV3(params)
                this.sellableAmountMap = (result?.totalSellableAmounts || []).reduce((o, c) => {
                    o[c.currency] = c.value
                    return o
                }, {})
                return this.sellableAmountMap
            } catch (e) {
                console.log('holdingsTradeable===>e:', e)
            }
        },

        // 全额转入/卖出
        triggerHandler() {
            if (this.isRollIn) {
                const capital = this.$refs['capitalDetailRef']
                if (+capital.avaliableCash > 0) {
                    const powerValue = capital.avaliableCash
                    const rates = this.ruleInfo.buyRate.replace('%', '')
                    let value = NP.divide(powerValue, NP.plus(1, NP.times(rates, 0.01)))
                    const minSubsequent = this.ruleInfo.minSubsequent
                    // 向下取整
                    value = Math.trunc(NP.divide(value, minSubsequent))
                    // 算出来最终结果
                    value = NP.times(value, minSubsequent)

                    this.amount = keepDecimals(value, 2)
                } else {
                    this.amount = '0.00'
                }
            } else {
                this.amount = this.canSellAmount
            }
        },

        // 选择账户
        changeAccountHandler(type) {
            this.currency = type
            this.amount = ''
            this.symbol = undefined
            this.ruleInfo = { ...DEFAULT_RULE_INFO }
        },

        // 选择产品
        changeProductHandler(row) {
            this.symbol = row ? row.symbol : undefined
            this.chooseProduct = row
        },

        // 点击交易
        async tradeClickHandler() {
            if (!this.canTradeFlag) return
            if (!this.usNationalityVerify(!this.isRollIn)) {
                return
            }
            if (this.isRollIn) {
                // 风测过期校验
                if (!(await this.checkRiskAssessmentExpiredStatus())) return

                const ecashContinueVerify = await this.ecashContinueTradeVerify()
                // 取消继续买入 return
                if (!ecashContinueVerify) return
            }
            this.tradeDialog = true
        },

        // 确认交易
        async tradeHandler() {
            if (this.$jsBridge) {
                await this.$jsBridge.tradeLogin()
            } else if (isInOutsideH5()) {
                if (!this.myLinkTradeLogin) {
                    this.myLinkTradeLogin = new TradeLogin({
                        propsData: { subAcctId: this.accts.subAcctId, callBack: this.tradeInvoke, showCloseIcon: isInOutsideH5() },
                    })
                }
                this.myLinkTradeLogin.show = true
                return
            }
            await this.tradeInvoke()
        },

        // 调用交易接口
        async tradeInvoke() {
            try {
                this.$loading.show = true
                const orderNumbers = await this[`tradeRoll${this.isRollIn ? 'In' : 'Out'}`]()
                orderNumbers && this.goResult(orderNumbers)
            } catch (e) {
                console.log('cashbox-trade===>e:', e)
                this.handleOrderError({
                    error: e,
                    orderFunction: this.tradeInvoke,
                    callback: err => {
                        const message = err?.error?.data?.tips || this.$t('serviceError')
                        const errorTitle = this.isRollIn ? this.$t('buyFail') : this.$t('sellFail')
                        this.$dialog.alert({
                            closeOnClickOverlay: true,
                            title: errorTitle,
                            message: message,
                            messageAlign: 'center',
                            confirmButtonText: this.$t('iGet'),
                        })
                    },
                    timeoutCallback: async orderList => {
                        this.goResult(orderList.map(el => el.orderNumber))
                    },
                    direction: this.isRollIn ? 'subscribe' : 'redeem',
                    showOrderDetail: false,
                })
            } finally {
                this.$loading.show = false
            }
        },

        // 买入
        async tradeRollIn() {
            // 校验综合可提现金是否充足
            if (!(await this.$refs.capitalDetailRef?.check())) {
                return
            }
            return await this.subscribe()
        },

        /**
         * @name 继续买入校验
         * @returns { Boolean } true: 通过校验或不需要校验， false： 取消买入
         */
        async ecashContinueTradeVerify() {
            // 非现金账户不检验
            if (this.accts.type !== 1) return true
            const openTime = this.ecashStatusInfo.openTime ? dayjs(this.ecashStatusInfo.openTime).valueOf() : ''
            const timestampDate = this.ecashStatusInfo.timestamp ? dayjs(this.ecashStatusInfo.timestamp).format('YYYY-MM-DD') : ''
            const startTime = timestampDate ? dayjs(timestampDate).hour(4).valueOf() : 0
            const endTime = timestampDate ? dayjs(timestampDate).hour(11).valueOf() : 0
            if (
                !!this.ecashStatusInfo.openStatus &&
                !this.ecashStatusInfo.effectiveStatus &&
                openTime &&
                openTime > startTime &&
                openTime < endTime
            ) {
                // 继续买入提示
                return await this.ecashTradeRemind()
            }
            return true
        },

        // 卖出
        async tradeRollOut() {
            return await this.redeem(this.symbol)
        },

        // 转入API
        async subscribe() {
            try {
                const params = {
                    orderMode: this.isAuto ? 2 : 1, // 下单模式： 1-指定产品 2-自动分配
                    amount: String(this.amount),
                    currency: this.currency,
                    instructionId: this.getInstructionId(),
                }
                if (!this.isAuto) {
                    params.symbol = this.symbol
                }
                const { result } = await ecashSubscribe(params)
                const orderNumbers = result?.orderNumbers || []
                return orderNumbers
            } catch (e) {
                console.log('===>e:', e)
                throw e
            }
        },

        // 转出API
        async redeem() {
            try {
                const params = {
                    orderMode: this.isAuto ? 2 : 1, // 下单模式： 1-指定产品 2-自动分配
                    tradeMode: 1, // 交易方式 1-金额 2-数量
                    amount: String(this.amount),
                    currency: this.currency,
                    instructionId: this.getInstructionId(),
                }
                if (!this.isAuto) {
                    params.symbol = this.symbol
                }
                const { result } = await ecashRedeem(params)
                const orderNumbers = result?.orderNumbers || []
                return orderNumbers
            } catch (e) {
                console.log('===>e:', e)
                throw e
            }
        },

        // 结果页 orderNumber: 订单编号 string | array
        goResult(orderNumbers) {
            console.warn('goResult-orderNumber:', orderNumbers)
            const orderNumbersStr = JSON.stringify(orderNumbers)
            const isAuto = this.isAuto ? '1' : '0'
            const orient = this.orient

            this.$router.replace({
                path: '/submit-result',
                query: {
                    orderNumbers: orderNumbersStr,
                    orient,
                    isAuto,
                },
            })
        },

        // 获取产品列表
        getProductHandler(list) {
            // 自动策略取年化收益最高的一只基金
            let _list = list.slice(0, 1).map(item => {
                return {
                    ...item,
                    price: 0,
                }
            })

            // 卖出找年化收益最低的一只可卖基金
            if (this.isRollOut) {
                let minReturnD7ToY1IProduct = {
                    returnD7ToY1: Number.MAX_SAFE_INTEGER,
                }

                list.forEach(el => {
                    if (el.sellable && +el.returnD7ToY1 < +minReturnD7ToY1IProduct.returnD7ToY1) {
                        minReturnD7ToY1IProduct = el
                    }
                })

                if (minReturnD7ToY1IProduct.symbol) {
                    _list = [
                        {
                            ...minReturnD7ToY1IProduct,
                            price: 0,
                        },
                    ]
                }
            }

            this.autoAllotList = _list
        },

        // TODO: 自动分配策略 转入明细策略
        autoAllocatPrice() {
            const v = this.amount
            if (!this.isAuto) return
            // 现在的限制 lng 最大是2
            const lng = this.autoAllotList.length
            const unit = 0.01
            if (lng === 0) return
            // 是否不能整除  不能整除说明 lng 不为1
            const divFlag = String(accDiv(v, accMul(unit, lng))).includes('.')
            if (divFlag) {
                const averageValue = keepDecimals(accDiv(v - unit, lng), 2)
                this.autoAllotList.forEach((item, index) => {
                    item.price = index === 0 ? Number(averageValue) + unit : averageValue
                })
                return
            }
            const allocatPrice = keepDecimals(accDiv(v, lng), 2)
            this.autoAllotList.forEach(item => {
                item.price = allocatPrice
            })
        },

        // 相关协议
        goProtocol() {
            const productList = this.isAuto ? this.autoAllotList : [this.chooseProduct]
            const symbols = encodeURIComponent(JSON.stringify(productList.map(item => item.symbol)))
            const url = location.origin + `/wealth/cashBox.html#/protocol?symbols=${encodeURIComponent(symbols)}`
            this.$goPage(url)
        },

        // 客户声明
        goStatement() {
            const fileName = `客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            const title = this.$t('clientStatement')
            if (this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },

        // 获取星财宝开通状态
        async getEcashStatus() {
            try {
                this.ecashStatusInfo = await this.$store.dispatch('user/getEcashStatus')
                console.warn('星财宝开通状态：', this.ecashStatusInfo)
            } catch (e) {
                console.log('getEcashStatus===>e:', e)
            }
        },

        // 星财宝货币基金买入提示
        async ecashTradeRemind() {
            try {
                await this.$dialog({
                    title: this.$t('ecashTradeRemindTitle'),
                    message: this.$t('ecashTradeRemindMessage'),
                    confirmButtonText: this.$t('continueBuy'),
                    cancelButtonText: this.$t('cancel'),
                    showCancelButton: true,
                })
                return true
            } catch (e) {
                console.log('取消买入')
                return false
            }
        },

        // 公募基金订单日历接口
        async getOrderCalendar(symbol) {
            if (!symbol || this.symbolCalendar[symbol]) return
            try {
                const { result = {} } = await orderCalendar({
                    symbol: symbol,
                    direction: this.isRollIn ? 1 : 2,
                })
                console.log(`getOrderCalendar`, symbol, result)
                this.$set(this.symbolCalendar, symbol, {})
                this.$set(this.symbolCalendar[symbol], 'systemTime', result?.systemTime ?? '')
                this.$set(this.symbolCalendar[symbol], 'latestTradingDay', result?.latestTradingDay ?? '')
                this.$set(this.symbolCalendar[symbol], 'confirmTime', result?.confirmTime ?? '')
                this.$set(this.symbolCalendar[symbol], 'profitLossTime', result?.profitLossTime ?? '')
                this.$set(this.symbolCalendar[symbol], 'arrivalTime', result?.arrivalTime ?? '')
                this.$set(this.symbolCalendar[symbol], 'settlementDay', result?.settlementDay ?? '')
                this.$set(this.symbolCalendar[symbol], 'redeemSettlementDay', result?.redeemSettlementDay ?? '')
                this.$set(this.symbolCalendar[symbol], 'cutOffTime', result?.cutOffTime ?? '')
                this.$set(this.symbolCalendar[symbol], 'redeemCutOffTime', result?.redeemCutOffTime ?? '')
            } catch (e) {
                console.log('orderCalendar===>error:', e)
            }
        },
        async getTradingRule(symbol) {
            if (!symbol) return
            try {
                const { result } = await getFundTradingRule({
                    symbol: symbol,
                })
                console.log(`yinlong getTradingRule`, result)
                Object.keys(this.ruleInfo).forEach(key => {
                    this.ruleInfo[key] = result.tradingRule[key]
                })
            } catch (e) {
                console.error('tradingRule===>error:', e)
            }
        },
    },
}
</script>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.trade {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 12px 108px;
    overflow: auto;
    background-color: #f9f9f9;
}

.card {
    margin-top: 12px;
    background-color: #fff;
    border-radius: 8px;
}

.product {
    .card();

    padding: 0 12px;
}

.input-module {
    .card();

    padding: 15px 12px 16px;

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 1px;
        color: #2f2f2f;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
    }

    .money {
        .money-input {
            margin-bottom: 4px;
        }

        .money-tips {
            padding-top: 4px;
            color: #f31414;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        .capital {
            padding: 12px 0 4px;
        }

        .roll-out__tips {
            padding-top: 12px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            span:first-of-type {
                margin-right: 8px;
                color: #9c9c9c;
            }
        }
    }
}

.detail {
    .card();

    margin-top: 0;
    padding: 15px 12px 16px;

    p {
        padding-bottom: 4px;
        color: #2f2f2f;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
    }

    ul {
        li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-top: 12px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            p {
                span:first-of-type {
                    margin-right: 4px;
                }
            }
        }
    }
}

.process {
    margin-top: 12px;
    padding: 24px 12px;
    background-color: #fff;
    border-radius: 8px;
}

.desc {
    padding: 32px 0;
    color: #9c9c9c;
    font-size: 12px;

    p.desc-title {
        line-height: 16px;
    }

    ul {
        li {
            padding-top: 8px;
            font-weight: 400;
            line-height: 18px;
            text-align: justify;
        }
    }
}

.footer {
    padding: 12px 28px;
    background-color: #fff;
    box-shadow: inset 0 0.5px 0 #efefef;
    #iosBottom();

    .footer-top {
        margin-bottom: 16px;

        /deep/.van-checkbox {
            display: flex;
            align-items: center;

            .check-img {
                width: 16px;
                height: 16px;
            }
        }

        p.footer-top__text {
            font-weight: 400;
            font-size: 12px;
            line-height: 17px;

            span:first-of-type {
                color: #9c9c9c;
            }

            a {
                color: #043799;
            }
        }
    }

    button {
        width: 100%;
        height: 44px;
        color: #fff;
        font-weight: 500;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background-color: @theme;
        border-width: 0;
        border-radius: 22px;
        opacity: 0.3;
    }

    .can-trade {
        opacity: 1;
    }
}

.diagBox {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;

    .item {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        padding: 6px 16px;

        .left {
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
        }

        .right {
            max-width: 200px;
            color: #2f2f2f;
            font-size: 14px;
            line-height: 22px;
            text-align: right;
        }
    }
}
</style>
