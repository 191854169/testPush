// 债券认购
<template>
    <div class="bond-buy">
        <section class="bond-info" @click="goBondDetail">
            <div class="left">
                <p class="name">{{ quoteInfo.name }}</p>
                <div class="bond-info__quote">
                    <span class="quote-currency">{{ quoteInfo.currency }}</span>
                    <span class="quote-isin">{{ quoteInfo.ISIN }}</span>
                </div>
            </div>
            <div class="right">
                <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
            </div>
        </section>
        <trade-tool
            ref="tradeTool"
            class="trade-module"
            :tradeRule="tradeRule"
            :currency="quoteInfo.currency"
            :price="quoteInfo.price"
            @changePrice="changePrice"
            @changeAmount="changeAmount"
            @changeShowWrong="changeShowWrong"
            @getParValue="getParValue"
            :isUsemargin="isUsemargin"
            :showWithdrawalBalanceTip="showWithdrawalBalanceTip"
            :productBuyType="productBuyType"
            :capital-gap="capitalGap"
            :purchasingPower="finalPurchasingPower"
            :quoteInfo="quoteInfo"
            :investFocusDegree="radio"
        ></trade-tool>
        <section class="assets" v-if="isSubscribe">
            <capital-detail
                @isUsemargin="v => (isUsemargin = v)"
                @isUsePurchasingPower="v => (isUsePurchasingPower = v)"
                @buyType="v => (buyType = v)"
                @showWithdrawalBalanceTip="v => (showWithdrawalBalanceTip = v)"
                ref="capitalDetailRef"
                :currency="currency"
                :tradeAmount="allCost"
                v-model="capitalGap"
                :productBuyType="productBuyType"
                @getWithDrawalBalance="getAssetsDetail"
            ></capital-detail>
        </section>
        <section class="calc-cost" v-show="showCost">
            <ul>
                <li>
                    <span class="label">{{ $t('ygAmount') }}</span>
                    <span class="value">{{ amountMoney | thousandsFilter }}</span>
                </li>
                <li>
                    <span class="label">{{ $t('accruedInterest') }}</span>
                    <span class="value">{{ extraFeeAmount | thousandsFilter }}</span>
                </li>
                <li>
                    <span class="label">{{ $t('buyRate') }}</span>
                    <span class="value">{{ estimateCost | thousandsFilter }}</span>
                </li>
                <li class="all-price">
                    <span class="label">{{ $t('ygjfAmount') }}</span>
                    <span class="value">{{ allCost | thousandsFilter }}</span>
                </li>
            </ul>
            <p class="cost-tip">{{ $t('costTip') }}</p>
        </section>

        <section class="ratio" v-if="isSubscribe" ref="ratioRef">
            <div class="title">{{ $t('trade.investAssetRatio') }}</div>
            <div class="t-tips">{{ $t('productDemand') }}{{ $t(`bills.payRate.${quoteInfo.investFocusDegree}`) }}</div>
            <van-radio-group v-model="radio" direction="horizontal" @change="changeRadio">
                <van-radio v-for="i in investFocusDegreeList" :key="i.key" :name="i.key" :value="i.label">
                    <template v-slot:icon="{ checked }">
                        <multi-img
                            :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                            directory="fund"
                            style="width: 16px; height: 16px"
                        ></multi-img>
                    </template>
                    <span v-if="i.key <= 60">&lt;{{ i.label }}%</span>
                    <span v-else>&gt;60%</span>
                </van-radio>
            </van-radio-group>
            <p class="custips" v-if="showTips">
                {{ $t('jzdtips') }}
            </p>
        </section>
        <div class="xgxy">
            <p>{{ $t('readContent') }}</p>
            <div>
                <i v-for="(item, idx) in fileList" :key="idx">《{{ item.fileType }}》</i>
                <i v-if="riskFile.fileType">《{{ riskFile.fileType }}》</i>
                <i>《{{ $t('protocol.clientStatement') }}》</i>
                <span @click="goProtocol">{{ $t('checkTheAgreement') }}</span>
            </div>
        </div>
        <section class="footer">
            <div class="agree">
                <van-checkbox icon-size="16" checked-color="#2F2F2F" v-model="agreeFlag">
                    <template v-slot:icon="{ checked }">
                        <multi-img
                            :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                            directory="fund"
                            style="width: 16px; height: 16px"
                        ></multi-img>
                    </template>
                    <span style="color: #9c9c9c">
                        {{ $t('trade.bryydbty') }}
                        <span style="color: #043799" @click.stop="goProtocol">《{{ $t('trade.xgxywj') }}》</span>
                        {{ $t('ji') }}
                        <span style="color: #043799" @click="goClientStatement">《{{ $t('protocol.clientStatement') }}》</span>
                    </span>
                </van-checkbox>
            </div>
            <div class="button" :class="{ canSign: canSign }" @click="sure">{{ $t(isSubscribe ? 'trade.rengou' : 'trade.maichu') }}</div>
        </section>
        <van-dialog
            v-model="cepingDiag"
            :title="$t('prompt')"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('goRisk')"
            @confirm="cepingSure"
        >
            <div class="cepingBox">
                {{ cepingText }}
            </div>
        </van-dialog>
        <van-dialog
            class="custom-dialog"
            v-model="buySure"
            :title="$t(isSubscribe ? 'trade.rgqr' : 'trade.shuhuiqueren')"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('trade.queding')"
            @confirm="confirmBuy"
        >
            <div class="diagBox">
                <p class="purchasing-tip border-bottom-1px" v-if="isUsePurchasingPower.value" v-html="isUsePurchasingPowerTip"></p>
                <div class="item">
                    <div class="left">{{ $t('tradeAccount') }}</div>
                    <div class="right">{{ accts.subAcctId }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('trade.cpmc') }}</div>
                    <div class="right">{{ quoteInfo.name }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('intentionalPrice') }}</div>
                    <div class="right">{{ buyInfo.price | thousandsFilter3 }}{{ currency }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('parFaceCash') }}</div>
                    <div class="right" :class="{ 'remind-color': redeemLowerLeast }">{{ buyInfo.amount | thousandsFilter }}{{ currency }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('accruedInterest') }}</div>
                    <div class="right">{{ extraFeeAmount | thousandsFilter }}{{ currency }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('buyRate') }}</div>
                    <div class="right">{{ estimateCost | thousandsFilter }}{{ currency }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('ygAmount') }}</div>
                    <div class="right">{{ amountMoney | thousandsFilter }}{{ currency }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('ygjfAmount') }}</div>
                    <div class="right">{{ allCost | thousandsFilter }}{{ currency }}</div>
                </div>
                <div class="redeem-remind" v-if="redeemLowerLeast">
                    <multi-img name="icon-warn" directory="common" />
                    <p>{{ $t('bondRedeemLowerLeast', { currency }) }}</p>
                </div>
            </div>
        </van-dialog>
        <investmentProTradeDialog v-model="showInvestmentProPopup"></investmentProTradeDialog>
        <trade-tip ref="tradeTipRef" :currency="quoteInfo.currency" @on-confirm="onConfirmTrade"></trade-tip>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import { getQuote, getTradeInfo } from '@/apis/bond'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { bondSubscribe, boedRedeem } from '@/apis/wealth/index.js'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt.js'
import tradeTool from './components/tradeTool.vue'
import { addCurParamsForUrl, floatToRatio, getLangType } from '../../../../utils'
import { isTenantApp } from '@/utils/tools.js'
import { getFile as getBondFile } from '@/apis/bond/index'
import TradeTip from './components/TradeToast.vue'
import { BOND_ORDER_VALID_TIME_MAP, INVEST_FOCUS_DEGREE_MAP, ORDER_DIRECTION_MAP } from '../../config/common'
import NP from 'number-precision'
import capitalDetail from '@/components/capitalDetail.vue'
import { accountTypeMap, PRODUCT_BUY_TYPE } from '@/config/common'
import { AutoFxSetting } from '@/apis/cash'
import { keepDecimals } from '@/utils'
import pathnames from '@/config/H5Pathname'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import wealthOrderInstructionMixin from '@/mixins/wealthOrderInstructionMixin.js'
import InvestmentProDialogMixin from '@/views/fund/mixins/InvestmentProDialogMixin.js'
import investmentProTradeDialog from '@/views/fund/components/investmentProTradeDialog.vue'
export default {
    name: 'bondBuy',
    mixins: [verifyMixin, wealthOrderInstructionMixin, InvestmentProDialogMixin],
    components: {
        tradeTool,
        TradeTip,
        capitalDetail,
        investmentProTradeDialog,
    },
    filters: {
        thousandsFilter(v) {
            return thousandsFilter(keepDecimals(v, 2))
        },
        thousandsFilter3(v) {
            return thousandsFilter(keepDecimals(v, 3))
        },
    },
    data() {
        return {
            symbol: this.$route.params.symbol,
            agreeFlag: true,
            buySure: false,
            showWrongTips: '',
            radio: '',
            availableWithdrawBalance: 0, // 单币种现金可用
            summaryWithdrawBalance: 0, // 账户总现金 - 包含别的币种转换后的之和

            cepingDiag: false, //测评相关
            cepingText: '',
            isAssessed: '',
            isExpired: '',

            deGree: false, //验证投资集中度

            quoteInfo: {
                // 行情数据
                symbol: '',
                productCode: '',
                ISIN: '',
                name: '',
                currency: '',
                couponRate: '', // 票面利息
                maturityDate: '',
                dividendFrq: '',
                price: 0,
                date: '',
                riskOverall: '',
                creditRating: '',
                remainingYear: '',
                investFocusDegree: '',
                MAY: '',
            },
            tradeRule: {
                // 交易规则
                buyFee: '',
                currency: '',
                custodion: '',
                interest: '',
                minInitial: '',
                unitAmount: '',
            },
            investFocusDegreeList: INVEST_FOCUS_DEGREE_MAP.options,
            buyInfo: {
                amount: '',
                price: '',
            },
            showTips: false,
            fileList: [],
            riskFile: {},
            parValue: 0,
            // 资金差 = 总额估算 - 现金可用
            capitalGap: '',
            isUsemargin: false,
            isUsePurchasingPower: {
                value: false,
                insufficientAmount: 0, // 差值
                accountType: accountTypeMap.keysMap.cash,
            },
            // 用户实际的下单方式
            buyType: PRODUCT_BUY_TYPE.keysMap.cash,
            showWithdrawalBalanceTip: false,
            purchasingPower: '',
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        tabs() {
            const riskRating = {
                1: this.$t('lowRisk'),
                2: this.$t('middleLowRisk'),
                3: this.$t('middleRisk'),
                4: this.$t('middleHighRisk'),
                5: this.$t('highRisk'),
            }
            const keys = ['currency', 'riskOverall', 'creditRating']
            return keys.map(k => (k === 'riskOverall' ? riskRating[this.quoteInfo[k]] : this.quoteInfo[k]))
        },

        // 币种
        currency() {
            return this.quoteInfo.currency
        },

        //投资集中度
        investFocusDegree() {
            const focusDegreeObj = {
                1: 15,
                2: 30,
                3: 45,
                4: 60,
                5: 75,
                6: 90,
            }
            return focusDegreeObj[this.quoteInfo.investFocusDegree || 1]
        },

        // 展示费用估计
        showCost() {
            return this.buyInfo.amount && this.buyInfo.price
        },

        // 预估交易金额 = 认购价格 * (认购数量 / 100)
        amountMoney() {
            if (this.buyInfo.amount && this.buyInfo.price) {
                return NP.times(this.buyInfo.price, NP.divide(this.buyInfo.amount, 100))
            }
            return 0
        },
        // 费用估算=认购金额*认购费率
        estimateCost() {
            if (this.amountMoney && this.tradeRule.buyFee) {
                return NP.times(this.amountMoney, NP.divide(this.tradeRule.buyFee, 100))
            }
            return 0
        },

        // 预估交付金额 = 认购金额 + 费用估算 + 应计利息估算
        allCost() {
            if (this.isSubscribe) {
                return +NP.plus(this.amountMoney, this.estimateCost, this.extraFeeAmount)
            }
            return +NP.minus(NP.plus(this.amountMoney, this.extraFeeAmount), this.estimateCost)
        },

        // 是否可认购
        canSign() {
            let ret = !this.showWrongTips && Number(this.buyInfo.price) > 0 && Number(this.buyInfo.amount) > 0 && this.agreeFlag
            if (this.isSubscribe) {
                // 认购需要校验投资集中度+可提金额
                ret = ret && this.deGree && this.capitalGap <= 0
            }
            return ret
        },
        // 应计利息估算  应计利息估算=每日应计利息*（票面面额/100）
        extraFeeAmount() {
            const { accrualInterest = 0 } = this.quoteInfo
            return NP.times(accrualInterest, NP.divide(this.buyInfo?.amount || 0, 100))
        },
        // 操作方向 - 买入|卖出
        direction() {
            const { direction } = this.$route.query || {}
            return +direction || ORDER_DIRECTION_MAP.keysMap.SUBSCRIBE // 没获取到默认“买入”操作
        },
        // 是否买入行为
        isSubscribe() {
            return this.direction === ORDER_DIRECTION_MAP.keysMap.SUBSCRIBE
        },

        // 可用资金不足时是否可以展示“引导入金”按钮
        isShowDepositGuide() {
            return this.capitalGap > 0 || this.availableWithdrawBalance <= 0
        },
        // 企业债券赎回面值小于20w
        redeemLowerLeast() {
            if (this.parValue) {
                return this.isCompanyBond && !this.isSubscribe && NP.minus(this.buyInfo.amount, 200000) < 0 && NP.minus(this.parValue, 200000) >= 0
            }
            return false
        },
        // 是否是企业债券
        isCompanyBond() {
            return this.quoteInfo.type === 0
        },
        // 产品支持的购买方式
        productBuyType() {
            if (this.quoteInfo.isPP) {
                return PRODUCT_BUY_TYPE.keysMap.purchasingPower
            }
            return PRODUCT_BUY_TYPE.keysMap.cash
        },

        isUsePurchasingPowerTip() {
            const { value, insufficientAmount, accountType } = this.isUsePurchasingPower
            const currencyText = currencyFilter(this.quoteInfo.currency)
            const text = this.$t(accountType == accountTypeMap.keysMap.margin ? 'isUsePurchasingPowerMargin' : 'isUsePurchasingPowerCash', {
                amount: thousandsFilter(floatToRatio(insufficientAmount, { base: 2, rate: false, sign: false })),
                currency: currencyText,
            })
            return value ? text : ''
        },
        // 根据产品类型来决定最终购买力是现金还是最大购买力
        finalPurchasingPower() {
            if (this.productBuyType === PRODUCT_BUY_TYPE.keysMap.cash) {
                return this.availableWithdrawBalance
            }
            if (this.productBuyType === PRODUCT_BUY_TYPE.keysMap.purchasingPower) {
                return this.purchasingPower
            }
            return 0
        },
    },
    async created() {
        this.$loading.show = true
        await Promise.all([this.initInstuction('BOND'), this.getQuote()])
        this.getTradeInfo()
        this.getBondFile()
        await this.getBasicInfo({ symbol: this.symbol })
        this.$loading.show = false
    },
    mounted() {
        document.title = this.$t(this.isSubscribe ? 'subscribeBond' : 'redeemBond')
    },
    methods: {
        getParValue(v) {
            this.parValue = v
        },
        async getBondFile() {
            try {
                if (!this.symbol) return
                const res = await getBondFile({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    console.log('getFile=>e断断续续:', res)
                    this.fileList = res.result.list
                    this.riskFile = res.result.riskFile || {}
                }
            } catch (e) {
                console.log('getFile=>e:', e)
            }
        },
        // 行情报价
        async getQuote() {
            try {
                const { result = {} } = await getQuote({ symbol: this.symbol })
                this.quoteInfo = result
            } catch (e) {
                console.log('getQuote===>error:', e)
            }
        },
        // 交易规则
        async getTradeInfo() {
            try {
                const { result = {} } = await getTradeInfo({ symbol: this.symbol })
                console.info('getTradeInfo:', result)
                this.tradeRule = result
            } catch (e) {
                console.log('getTradeInfo==>error:', e)
            }
        },

        // 资产信息
        async getAssetsDetail(result) {
            try {
                this.summaryWithdrawBalance = Number(result?.summaryWithdrawBalance || 0)
                this.availableWithdrawBalance = Number(result?.singleWithdrawBalance || 0)
                this.purchasingPower = result?.purchasingPower
            } catch (e) {
                // this.availableWithdrawBalance = 10114900 + 6000
                console.log(e)
            }
        },

        //判断是否风险测评
        async isEvaluated() {
            const data = await this.getAssessStatus()
            this.isAssessed = data?.result.isAssessed
            this.isExpired = data?.result.isExpired
            let { VUE_APP_RISK_PAGE: link } = pathnames
            link = addCurParamsForUrl(link)
            // 是否已经评测，1，是，2，否
            if (this.isAssessed == 2) {
                this.confirmDialog(4, link, {}, { replace: false })
                return false
            }
            // 是否评测过期，1，是，2，否
            if (this.isExpired == 1) {
                this.confirmDialog(5, link, {}, { replace: false })
                return false
            }
            return true
        },

        //跳转到风险测评
        cepingSure() {
            const url = location.origin + '/wealth/riskAssessment.html#/'
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url) })
            } else {
                window.location.href = url
            }
        },

        //验证投资集中度
        changeRadio(value) {
            if (INVEST_FOCUS_DEGREE_MAP.options.findLabel(value) <= this.investFocusDegree) {
                this.deGree = true
                this.showTips = false
            } else {
                this.deGree = false
                // this.$toast({
                //     message: this.$t('trade.ndjzdxzbpp'),
                //     className: 'bond-buy__toast',
                // })
                this.showTips = true
            }
            this.$nextTick(() => {
                this.$refs.tradeTool.checkNumber()
                this.$refs.tradeTool.checkAmount()
            })
        },

        // 修改价格
        changePrice(v) {
            this.buyInfo.price = v
        },

        // 修改数量
        changeAmount(v) {
            this.buyInfo.amount = v
        },

        changeShowWrong(v) {
            this.showWrongTips = v
        },

        //跳转到协议文件
        goProtocol() {
            const investFocusDegree = this.investFocusDegreeList.findIndex(i => i.key === this.radio) + 1
            const url = location.origin + `/wealth/fund.html#/protocol?type=bond&symbol=${this.symbol}&investFocusDegree=${investFocusDegree}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/protocol',
                    query: {
                        symbol: this.symbol,
                        type: 'bond',
                        investFocusDegree,
                    },
                })
            }
        },
        goClientStatement() {
            const fileName = `客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            console.log('pdfUrl:', url)
            const title = this.$t('protocol.clientStatement')
            if (isTenantApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },

        // 校验综合可提现金是否充足
        isEnoughWithdrawalBalance() {
            // 单币种小于总资产说明当前币种不回去兑付其它币种的欠款

            // 综合账户可提现金 单币种可提现金 都 >= 金额，则不校验是否欠款
            const amount = Number(this.amountMoney)
            if (this.availableWithdrawBalance >= amount && this.summaryWithdrawBalance >= amount) return true
            return this.availableWithdrawBalance <= this.summaryWithdrawBalance
        },

        toastIfPriceNotValid() {
            // const valid = Number(this.buyInfo.price) > 0
            if (this.$refs.tradeTool?.checkNumber()) {
                return false
            }
            // if (!valid) {
            //     this.$toast({ message: this.$t('pleaseInputYXJG'), forbidClick: true })
            // }
            return true
        },

        toastIfAmountNotValid() {
            // const valid = Number(this.buyInfo.amount) > 0
            // if (!valid) {
            //     this.$toast({ message: this.$t('pleaseInputPMMZ'), forbidClick: true })
            // }
            // return valid
            if (this.$refs.tradeTool?.checkAmount()) {
                return false
            }
            return true
        },

        toastIfDegreeValid() {
            const valid = this.deGree
            if (!valid) {
                this.$refs.ratioRef?.scrollIntoView({ behavior: 'smooth' })
                if (!this.showTips) {
                    this.$toast({ message: this.$t('pleaseInputTZJZD') })
                }
            }
            return valid
        },

        toastIfAgreeNotValid() {
            const valid = this.agreeFlag
            if (!valid) {
                this.$toast({ message: this.$t('pleaseInputXGXY') })
            }
            return valid
        },

        // 认购
        async sure() {
            if (!this.canSign) {
                if (!this.toastIfPriceNotValid()) return
                if (!this.toastIfAmountNotValid()) return
                if (this.isSubscribe) {
                    if (!this.toastIfDegreeValid()) return
                }
                if (!this.toastIfAgreeNotValid()) return
                return
            }

            if (!this.usNationalityVerify(!this.isSubscribe)) {
                return
            }

            // 风测
            // if (!(await this.isEvaluated())) {
            //     return
            // }
            this.isOpenedDerivative = this.getDerivativeStatus()
            const showDialog = result => {
                const investFocusDegree = this.investFocusDegreeList.findIndex(i => i.key === this.radio) + 1
                this.riskMatchDialog(result, investFocusDegree)
            }
            if (!(await this.riskMatchVerify('buy', showDialog))) return

            try {
                // APP内部会调起交易密码校验
                if (this.$jsBridge) {
                    await this.$jsBridge.tradeLogin()
                }
                // 债券认购需要校验综合可提是否有欠款
                if (this.isSubscribe) {
                    if (!this.$refs.capitalDetailRef?.check()) return
                }
                this.buySure = true
            } catch (e) {
                this.buySure = false
                console.log('bond-tradeLogin===>error:', e)
            }
        },
        // 创建订单
        async confirmBuy(skipTradeCheck) {
            const type = this.direction
            this.buySure = false
            if (!skipTradeCheck) {
                if (this.isSubscribe) {
                    // 交易费提示
                    const fee = NP.times(this.amountMoney || 0, NP.divide(0.05, 100))
                    const ret = NP.minus(-this.capitalGap /* 剩余现金，这个capitalGap为负数，注意！ */, fee)
                    if (ret < 0) return this.$refs.tradeTipRef.check('fee', fee)
                }
                // 交易时间提示
                if (!(await this.$refs.tradeTipRef.check('date'))) return
            }

            this.$loading.show = {
                show: true,
                options: {
                    msg: this.$t('inCommit'),
                },
            }
            try {
                const params = {
                    symbol: this.symbol,
                    amount: this.amountMoney + '',
                    price: this.buyInfo.price + '',
                    parValue: this.buyInfo.amount + '',
                    currency: this.currency,
                    validTime: BOND_ORDER_VALID_TIME_MAP.keysMap.oneDay,
                    bondType: this.quoteInfo?.type,
                    instructionId: this.getInstructionId(),
                }
                if (this.isSubscribe) {
                    // 用户选择的投资集中度. 0无、1 <15%、 2 <30%、 3 < 45%、4 < 60%、5< 75%、 6<90%
                    params.investFocusDegree = this.radio
                }
                const config = {
                    encrypt: ENCRYPT_TYPES.APP_TRADE_ENC,
                }
                let ret = {}
                console.log(`Feng.chen:: 19:03:24 type ===> `, type)
                if (type === ORDER_DIRECTION_MAP.keysMap.REDEEM) {
                    const { result } = await boedRedeem(params, config)
                    ret = result
                } else {
                    params.buyType = this.buyType
                    const { result } = await bondSubscribe(params, config)
                    ret = result
                }
                const showAutoExchangeGuide = (await this.$refs.capitalDetailRef?.getAutoExchangeGuideStatus()) ? 1 : 0
                this.$router.replace(
                    `/submit-result?orderId=${ret.orderId}&orderNumber=${ret.orderNumber}&symbol=${this.symbol}&type=bond&showAutoExchangeGuide=${showAutoExchangeGuide}`
                )
            } catch (e) {
                this.handleOrderError({
                    error: e,
                    orderFunction: () => this.confirmBuy(skipTradeCheck),
                    callback: err => {
                        const title = this.$t(type === ORDER_DIRECTION_MAP.keysMap.SUBSCRIBE ? 'trade.rgsb' : 'trade.shuhuishibai')
                        const message = err?.error?.data?.tips || this.$t('serviceError')
                        message &&
                            this.$dialog.alert({
                                closeOnClickOverlay: true,
                                title,
                                message,
                                messageAlign: 'center',
                                confirmButtonText: this.$t('iGet'),
                            })
                        console.log('bondSubscribe===>error:', err)
                    },
                    timeoutCallback: async orderList => {
                        const { orderId, orderNumber } = orderList[0]
                        const showAutoExchangeGuide = (await this.$refs.capitalDetailRef?.getAutoExchangeGuideStatus()) ? 1 : 0
                        this.$router.replace({
                            path: '/submit-result',
                            query: {
                                orderId,
                                orderNumber,
                                symbol: this.symbol,
                                type: 'bond',
                                showAutoExchangeGuide,
                            },
                        })
                    },
                    direction: type === ORDER_DIRECTION_MAP.keysMap.REDEEM ? 'redeem' : 'subscribe',
                })
            } finally {
                this.$loading.show = false
            }
        },
        // 获取是否展示自动开通引导
        // 现金账户 购买力产品 未开通自动换汇
        async getAutoExchangeGuideStatus() {
            try {
                const { value /* 是否使用到了购买力中包含其它币种 */, accountType } = this.isUsePurchasingPower
                const isCash = accountType == accountTypeMap.keysMap.cash
                const isMargin = this.productBuyType === PRODUCT_BUY_TYPE.keysMap.purchasingPower
                const autoExchangeStatus = await this.getAutExchangeStatus()
                return value && isCash && isMargin && !autoExchangeStatus
            } catch (e) {
                console.error(e)
                return false
            }
        },

        // 自动换汇开通状态
        async getAutExchangeStatus() {
            try {
                // 如果用户已开通自动换汇则不需要提醒
                const { result } = await AutoFxSetting({ subAccountId: this.$store.state.user.subAccountId })
                // 0:未开通、1:已开通、2:已关闭
                const AUTO_EXCHANGE_OPENED = 1
                if (result?.status == AUTO_EXCHANGE_OPENED) return false
                return true
            } catch (e) {
                return false
            }
        },

        onConfirmTrade() {
            this.confirmBuy(true)
        },

        goBondDetail() {
            this.$goPage('/bond-detail', { symbol: this.symbol })
        },
    },
}
</script>
<style>
.bond-buy__toast {
    max-width: 100%;
    white-space: nowrap;
}
</style>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.bond-buy {
    height: 100%;
    padding: 12px 0;
    overflow: auto;
    #iosBottom();
}

.custips {
    margin-top: 8px;
    color: #f31414;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
}

.xgxy {
    margin-top: 22px;
    margin-bottom: 120px;
    padding: 0 12px;
    color: #9c9c9c;
    font-size: 12px;
    line-height: 16px;

    p {
        margin-bottom: 8px;
        font-weight: 500;
    }

    div {
        font-weight: 400;
        line-height: 18px;

        span {
            color: #043799;
        }
    }

    i {
        font-style: normal;
    }
}

.mg-b12 {
    margin: 0 12px 12px;
}

.bg_f-r8 {
    background: #fff;
    border-radius: 8px;
}

.bond-info {
    .mg-b12();
    .bg_f-r8();

    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;

    .left {
        flex: 1 1 auto;
        margin-right: 8px;

        .name {
            padding-bottom: 5px;
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        .bond-info__quote {
            .quote-currency {
                margin-right: 0.04rem;
                padding: 0 0.04rem;
                color: #278aff;
                font-size: 0.1rem;
                line-height: 0.14rem;
                background: #e7f2ff;
                border-radius: 0.02rem;
            }

            .quote-isin {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 10px;
                line-height: 12px;
            }
        }
    }

    .right {
        display: flex;
        align-items: center;

        img {
            width: 16px;
            height: 16px;
        }
    }
}

// 交易工具
.trade-module {
    // .mg-b12();
    .bg_f-r8();

    margin: 0 12px;
    border-radius: 8px;
}

// 计算费用
.calc-cost {
    .mg-b12();
    .bg_f-r8();

    padding: 12px;

    ul {
        li {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;

            .label {
                color: #9c9c9c;
                text-align: left;
            }

            .value {
                color: #2f2f2f;
                text-align: right;
            }
        }

        li:nth-last-child(2) {
            box-shadow: inset 0 -0.5px 0 #efefef;
        }

        .all-price {
            margin-top: 2px;

            .value {
                color: #ff6907;
            }
        }
    }
    // 金额计算提示
    .cost-tip {
        margin: 4px 0 2px;
        color: #2f2f2f;
        font-size: 12px;
        line-height: 18px;
    }
}

// 资金部分
.assets {
    .mg-b12();
    .bg_f-r8();
}

// 资产比例
.ratio {
    .mg-b12();
    .bg_f-r8();

    padding: 20px 12px;
    // margin-bottom: 120px;

    .title {
        margin-bottom: 6px;
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }

    .t-tips {
        margin-bottom: 16px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
    }

    /deep/ .van-radio-group {
        justify-content: space-between;

        .van-radio--horizontal {
            flex: 1;
            margin-right: 0;
        }

        .van-radio__icon {
            display: flex;
            align-items: center;
        }

        .van-radio__label {
            flex: 1;
            margin-left: 2px;
            color: #2f2f2f;
        }
    }
}

// 底部按钮
.footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 12px 12px 0;
    background-color: #fff;
    #iosBottom();

    .agree {
        padding: 0 12px;
        font-size: 12px;
    }

    .button {
        height: 44px;
        margin: 16px 0 3px;
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
}

.diagBox {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;

    .purchasing-tip {
        margin: 8px 16px 12px;
        padding-bottom: 12px;
        color: #af7213;
        font-size: 12px;
        line-height: 17px;
        word-break: break-all;

        :deep(.important) {
            color: @theme;
            font-weight: 600;
            word-break: break-all;
        }
    }

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
            width: 160px;
            color: #2f2f2f;
            font-size: 14px;
            line-height: 22px;
            text-align: right;
        }

        .remind-color {
            color: #ff6907;
        }
    }

    .redeem-remind {
        display: flex;
        align-items: center;
        padding: 6px 14px 9px;

        img {
            width: 16px;
            height: 16px;
            margin-right: 4px;
        }

        p {
            color: #ff6907;
            font-weight: 400;
            font-size: 12px;
            line-height: 17px;
            transform: translateY(0.5px);
        }
    }
}
</style>
