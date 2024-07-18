// 赎回
<template>
    <div class="subscribe">
        <div class="top" @click="goFundDetail">
            <div class="left">
                <div class="fundName">{{ fundInfo.name }}</div>
                <div class="fundNum">
                    <span>{{ fundInfo.currency }}</span>
                    <p>{{ fundInfo.ISIN }}</p>
                </div>
            </div>
            <div class="right">
                <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
            </div>
        </div>
        <div class="buyBox">
            <div class="autoBuy">
                <div class="left">{{ isMMF ? $t('sellAmount') : $t('trade.shuhuifene') }}</div>
                <div class="right" v-if="isPublicFund" @click="goTradeRule">
                    <span class="right-text">{{ $t('tradeRule') }}</span>
                    <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                </div>
            </div>
            <div class="buy-input">
                <div class="inputBox">
                    <div class="input">
                        <van-field
                            name="applyMarginLimit"
                            type="text"
                            inputmode="decimal"
                            @keyup="chkPrice"
                            @blur="chkLast"
                            v-model="amountDisplay"
                            :placeholder="placeholder"
                            :class="{ 'focus-large': amountDisplay, 'middle-large': amountDisplay.length > 9 }"
                            clearable
                        />
                    </div>
                    <div class="buyAll" @click="buyAll" :class="{ hasAll: number == maxNum && amountDisplay != '' }">
                        {{ $t('trade.qunbushuhui') }}
                    </div>
                </div>
            </div>
            <div class="fast">
                <span class="fast-item" v-for="(item, index) in fastArr" :key="index" @click="fastInput(item)">{{ item.name }}</span>
            </div>
            <div class="wrong-tip" v-show="calcWrong(number)">{{ calcWrong(number) }}</div>
            <div class="cus-fl">
                <div class="cus-fl__top">
                    <div class="fl-top__left">
                        <span class="label">{{ $t('redeemFee') }}：</span>
                        <span class="value">{{ sellRate }}</span>
                    </div>
                    <div class="fl-top__right">
                        <span>{{ $t('ygSellingCosts') }}：</span>
                        <span class="amount">{{ sellCost }}</span>
                        <span>{{ fundInfo.currency | currencyFilter }}</span>
                    </div>
                </div>
                <div class="cus-fl__bottom" v-if="!isMMF">
                    <span>
                        <span>{{ $t('estimateInto') }}</span>
                        <multi-img name="icon-tips" directory="common" @click="showEstAmountDialog = true"></multi-img>
                        <span>：</span>
                    </span>
                    <span class="amount">{{ sellEstAmount | floorFilter | thousandsFilter }}</span>
                    <span>{{ fundInfo.currency | currencyFilter }}</span>
                    <span>{{ $t('estimateIntoStand') }}</span>
                </div>
            </div>
            <div class="maxMoney">
                {{ isMMF ? $t('canRollOutAmount') : $t('trade.keyongfene') }}
                <span class="num" v-if="isMMF">
                    {{ MMFSellableAmount | amountFilter | thousandsFilter }} {{ fundInfo.currency | currencyFilter }}
                </span>
                <span class="num" v-else>{{ quantity | amountFilter(decimalDigits) | thousandsFilter }}{{ $t('trade.part') }}</span>
            </div>
        </div>
        <div class="cuszh">
            <div>回款至</div>
            <div class="right">
                <multi-img
                    v-if="fundInfo.currency != 'EUR'"
                    width="24"
                    height="24"
                    :name="
                        fundInfo.currency == 'HKD'
                            ? 'icon_flag'
                            : fundInfo.currency == 'USD'
                            ? 'mgic'
                            : fundInfo.currency == 'CNH' || fundInfo.currency == 'CNY'
                            ? 'icon_currency_CNH'
                            : 'icon_flag'
                    "
                    directory="fund"
                />
                <span>{{ accountObj[fundInfo.currency] }}{{ accts.type | accountTypeFilter }}</span>
            </div>
        </div>

        <footer>
            <div class="agree">
                <van-checkbox class="outter-checkbox" icon-size="16" checked-color="#2F2F2F" v-model="agreeFlag">
                    <template v-slot:icon="{ checked }">
                        <multi-img
                            :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                            directory="fund"
                            style="width: 18px"
                        ></multi-img>
                    </template>
                    <span style="color: #9c9c9c">
                        <span>{{ $t('trade.bryydbty') }}</span>
                        <span style="color: #043799" @click="goProtocol">《{{ $t('trade.xgxywj') }}》</span>
                        <span>及</span>
                        <span style="color: #043799" @click="goClientStatement">《{{ $t('protocol.clientStatement') }}》</span>
                    </span>
                </van-checkbox>
            </div>
            <div class="button" :class="{ canSign: canSign }" v-debounce="sure">{{ $t('redeem') }}</div>
            <div class="safe-padding-bottom"></div>
        </footer>
        <van-dialog
            v-model="buySure"
            :title="$t('trade.shuhuiqueren')"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('trade.queding')"
            @confirm="confirmRedeem"
        >
            <div class="diagBox">
                <div class="item">
                    <div class="left">{{ $t('tradeAccount') }}</div>
                    <div class="right">{{ accts.subAcctId }}</div>
                </div>
                <div class="item">
                    <div class="left">{{ $t('trade.cpmc') }}</div>
                    <div class="right">{{ fundInfo.name }}</div>
                </div>
                <div class="item" v-if="isMMF">
                    <div class="left">{{ $t('sellAmount') }}</div>
                    <div class="right">{{ amountDisplay }}{{ fundInfo.currency | currencyFilter }}</div>
                </div>
                <div class="item" v-else>
                    <div class="left">{{ $t('trade.shuhuifene') }}</div>
                    <div class="right">{{ amountDisplay }}{{ $t('trade.part') }}</div>
                </div>
            </div>
        </van-dialog>
        <van-dialog v-model="showTip" :title="$t('tipTitle')" confirm-button-color="#FF6907" :confirm-button-text="$t('iKnow')">
            <div class="dialogContent">{{ $t('trade.jsjebfzxjz') }}</div>
        </van-dialog>
        <van-dialog v-model="buyFail" :title="$t('trade.shuhuishibai')" confirm-button-color="#FF6907" :confirm-button-text="$t('iGet')">
            <div class="dialogContent">{{ failText }}</div>
        </van-dialog>
        <van-dialog v-model="showEstAmountDialog" :title="$t('estimateInto')" confirm-button-color="#FF6907" :confirm-button-text="$t('iGet')">
            <div class="est-dialog-content">
                <p class="content-top">{{ $t('estimateIntoFormula') }}</p>
                <p class="content-body">{{ $t('estimateIntoReference', { nav: navFormat(fundInfo.latestNav) }) }}</p>
            </div>
        </van-dialog>
        <investmentProTradeDialog v-model="showInvestmentProPopup"></investmentProTradeDialog>
        <loading :propsShow="true" :msg="loadingMsg" :showLoading="showLoading" />
    </div>
</template>
<script>
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
import { FundRedeem, holdingsTradeable, ecashRedeem, getHoldingsDetail } from '@/apis/wealth/index.js'
import { ENCRYPT_TYPES } from '@/httpRequest/http.js'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { getQuote, getTradingRule } from '@/apis/fund/fund.js'
import { Toast } from 'vant'
import { mapState } from 'vuex'
import { showTip, AGE_LIMIT_CODE } from '@/mixins/AgeLimit'
import NP from 'number-precision'
import { keepDecimals, getLangType, milliFormat } from '@/utils'
import { accountTypeMap } from '@/config/common'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import wealthOrderInstructionMixin from '@/mixins/wealthOrderInstructionMixin.js'
import { isInOutsideH5 } from '@/utils'
import InvestmentProDialogMixin from '@/views/fund/mixins/InvestmentProDialogMixin.js'
import investmentProTradeDialog from '@/views/fund/components/investmentProTradeDialog.vue'

const accountTypeKeyMap = accountTypeMap.keyValueMap

// 1: 份额 2: 金额
const DisplayType = {
    share: 1,
    amount: 2,
}

export default {
    name: 'autoDeal',
    mixins: [verifyMixin, wealthOrderInstructionMixin, InvestmentProDialogMixin],
    components: { investmentProTradeDialog },
    data() {
        return {
            checked: true,
            number: '',
            show: false,
            selectIndex: 0,
            agreeFlag: false,
            radio: '',
            buySure: false,
            buyFail: false,
            failText: '',
            fundInfo: {},
            riskRatingObj: {},
            isDividendObj: {},
            tradingRule: {},
            fastArr: [
                { name: '1/4', value: 1 / 4 },
                { name: '1/3', value: 1 / 3 },
                { name: '1/2', value: 1 / 2 },
            ],
            fundMode: 1,
            showTip: false,
            quantity: '', //份额
            amountDisplay: '',
            prevClose: '',
            decimalDigits: 4,
            placeholder: '',
            maxNum: '',
            loadingMsg: '',
            showLoading: false,
            accountObj: {},
            sellRate: '0.00', // 卖出费率
            sellableAmountMap: {}, // MMF基金可卖金额映射
            myLinkTradeLogin: null, // 中移动交易密码登录、站外通用卖出校验交易密码
            showEstAmountDialog: false, // 预估到账dialog
        }
    },
    created() {
        this.symbol = this.$route.params.symbol
        this.getFundInfo()

        this.riskRatingObj = {
            0: this.$t('lowRisk'),
            1: this.$t('lowRisk'),
            2: this.$t('middleLowRisk'),
            3: this.$t('middleRisk'),
            4: this.$t('middleHighRisk'),
            5: this.$t('highRisk'),
        }
        this.isDividendObj = {
            0: this.$t('trade.bupaixi'),
            1: this.$t('trade.paixi'),
        }
        this.regObj = {
            1: /^(.*\..{1}).*$/,
            2: /^(.*\..{2}).*$/,
            3: /^(.*\..{3}).*$/,
            4: /^(.*\..{4}).*$/,
            5: /^(.*\..{5}).*$/,
            6: /^(.*\..{6}).*$/,
        }
        this.loadingMsg = this.$t('inCommit')
        this.accountObj = {
            HKD: this.$t('stocksHKD'),
            USD: this.$t('stocksUSD'),
            CNH: this.$t('stocksCNH'),
            CNY: this.$t('stocksCNH'),
        }
    },
    filters: {
        currencyFilter,
        typeFilter(v, $t) {
            return (
                {
                    1: $t('stockType'),
                    2: $t('bondType'),
                    3: $t('mixedType'),
                    4: $t('currencyType'),
                }[v] || ''
            )
        },
        accountTypeFilter(v) {
            return accountTypeKeyMap[v] || ''
        },
        amountFilter(v, base = 2) {
            return v ? keepDecimals(v, base) : ''
        },
        floorFilter(v, base = 2) {
            const pow = Math.pow(10, base)
            return v ? keepDecimals(String(Math.floor(v * pow) / pow), 2) : ''
        },
    },
    computed: {
        ...mapState('user', ['accts']),
        canSign() {
            return (
                this.amountDisplay != '' &&
                Number(this.number) != 0 &&
                this.agreeFlag &&
                this.calcWrong(this.number) == '' &&
                Number(this.number) >= Number(this.minRedemption)
            )
        },
        //最小赎回
        minRedemption() {
            if (this.tradingRule.sellDisplayType == DisplayType.share) {
                return this.tradingRule.minRedemptionShare
            }
            return this.tradingRule.minRedemption
        },
        //卖出费用
        sellCost() {
            const rate = NP.divide(Number.parseFloat(this.sellRate) || 0, 100)
            let holdNum = Number(this.number)
            if (this.tradingRule.sellDisplayType == DisplayType.share) {
                holdNum = NP.times(Number(this.number), Number(this.prevClose))
            }
            const sellCost = NP.times(holdNum, rate)
            const sellCostFixed = keepDecimals(sellCost, 2)
            return sellCostFixed
        },
        // MMF 基金 可卖出金额
        MMFSellableAmount() {
            return this.sellableAmountMap.AllSellableAmount || 0
        },
        // 是否是 MMF 基金
        isMMF() {
            return this.fundInfo.isMMF === 1
        },
        isPublicFund() {
            return this.fundMode === 0
        },
        // 卖出预估到账
        sellEstAmount() {
            if (!this.number || !this.fundInfo.latestNav) {
                return '0'
            }
            const total = NP.times(this.number, this.fundInfo.latestNav)
            return NP.minus(total, this.sellCost) + ''
        },
    },
    methods: {
        navFormat(v) {
            return v ? milliFormat(keepDecimals(v, 4)) : ''
        },
        chkPrice(e) {
            e.target.value = e.target.value.replace(/[^\d.]/g, '')
            //必须保证第一位为数字而不是.
            e.target.value = e.target.value.replace(/^\./g, '')
            //保证只有出现一个.而没有多个.
            e.target.value = e.target.value.replace(/\.{2,}/g, '.')
            //保证.只出现一次，而不能出现两次以上
            e.target.value = e.target.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
            const reg = this.regObj[this.decimalDigits]
            this.number = e.target.value.replace(reg, '$1') //只能输入4位小数
            this.amountDisplay = e.target.value = thousandsFilter(this.number)
        },
        chkLast() {
            if (this.amountDisplay == '') {
                return ''
            }
            this.number = keepDecimals(this.number, this.decimalDigits)
            this.amountDisplay = thousandsFilter(this.number)
        },
        //检测输入值返回错误信息
        calcWrong(num) {
            if (num == '' || this.amountDisplay == '') {
                return ''
            }
            if (this.isMMF) {
                if (Number(num) > Number(this.maxNum)) {
                    return `${this.$t('sellNotEnoughTips')}`
                }
            } else if (Number(num) > Number(this.quantity)) {
                return `${this.$t('zdkmc')}${this.quantity}${this.$t('trade.part')}`
            }
            if (Number(num) < Number(this.minRedemption)) {
                return this.placeholder
            }
            return ''
        },
        //查询用户持仓
        async getHoldings() {
            try {
                const { result = {} } = await getHoldingsDetail({
                    symbol: this.symbol,
                })
                console.log('getHoldingsDetail：', result)
                this.quantity = result.availableQuantity
                this.prevClose = result.nav || 0
                this.maxNum = keepDecimals(this.quantity, this.decimalDigits)
                this.getRate()
            } catch (e) {
                console.log('getHoldingsDetail：===>e:', e)
            }
        },
        // 查询MMF基金持仓
        async getMMFHoldings() {
            try {
                const { result = {} } = await holdingsTradeable({ symbol: this.symbol })
                console.warn('MMF-可卖', result)
                this.sellableAmountMap = result
                this.maxNum = keepDecimals(this.MMFSellableAmount, this.decimalDigits)
                this.getRate()
            } catch (e) {
                console.log('holdingsTradeable===>e:', e)
            }
        },
        //获取基金交易规则
        async getRate() {
            try {
                const res = await getTradingRule({
                    data: {
                        symbol: this.symbol,
                    },
                })
                if (res.data.result) {
                    this.tradingRule = res.data.result.tradingRule
                    console.log(`tradingRule`, this.tradingRule)
                    this.sellRate = this.tradingRule.sellRate || '0.00%'
                    if (this.isMMF) {
                        this.placeholder = `${thousandsFilter(keepDecimals(this.minRedemption, 2))}${currencyFilter(this.fundInfo.currency)}${this.$t(
                            'trade.qi'
                        )}`
                    } else {
                        this.placeholder = `${thousandsFilter(this.minRedemption)}${this.$t('trade.qi')}`
                    }
                }
            } catch (err) {
                console.log(err)
            }
        },
        toCeil(num, byte) {
            const n = Math.pow(10, byte)
            if (num == 0) {
                return keepDecimals(num, byte)
            }
            return Math.ceil(num * n) / n
        },
        fastInput(item) {
            this.number = keepDecimals(item.value * Number(this.isMMF ? this.MMFSellableAmount : this.quantity), this.decimalDigits)
            this.amountDisplay = thousandsFilter(this.number)
        },
        //获取基金详情和根据币种获取用户资产
        getFundInfo() {
            this.$loading.show = true
            getQuote({
                data: {
                    symbol: this.symbol,
                },
            })
                .then(async res => {
                    if (res.data.result) {
                        console.log('getFundInfo', res.data)
                        const result = res.data.result
                        this.fundMode = result.fundMode //0：公募 1：私募

                        this.fundInfo = this.fundMode == 0 ? result.pubQuote : result.priQuote
                        if (this.isMMF) {
                            this.decimalDigits = 2
                            this.getMMFHoldings()
                            await this.initInstuction('CASHBOX') // 初始化下单指令ID
                        } else {
                            const taskList = [
                                this.initInstuction(this.fundMode === 0 ? 'PUBLIC' : 'PRIVATE'), // 初始化下单指令ID
                            ]
                            if (this.fundMode == 0) {
                                const decimalPoint = this.fundInfo.decimalPoint
                                this.decimalDigits = typeof decimalPoint === 'number' ? decimalPoint : 4
                            }
                            await Promise.all(taskList)
                            this.getHoldings()
                        }
                        this.$loading.show = false
                    }
                })
                .catch(() => {
                    this.$loading.show = false
                })
        },
        //点击全部认购
        buyAll() {
            this.number = this.maxNum
            this.amountDisplay = thousandsFilter(this.number)
        },
        //跳转到协议文件
        goProtocol() {
            const url = location.origin + '/wealth/fund.html#/protocol?symbol=' + this.symbol
            if (JSBridge) {
                JSBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/protocol',
                    query: {
                        symbol: this.symbol,
                    },
                })
            }
        },
        goClientStatement() {
            const fileName = `客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            const title = this.$t('protocol.clientStatement')
            if (this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },
        async sure() {
            if (!this.canSign) {
                return
            }
            if (!this.usNationalityVerify(true)) {
                return
            }
            try {
                if (JSBridge) {
                    await JSBridge.tradeLogin()
                } else if (isInOutsideH5()) {
                    if (!this.myLinkTradeLogin) {
                        this.myLinkTradeLogin = new TradeLogin({
                            propsData: {
                                subAcctId: this.accts.subAcctId,
                                callBack: () => {
                                    this.buySure = true
                                },
                                showCloseIcon: isInOutsideH5(),
                            },
                        })
                    }
                    this.myLinkTradeLogin.show = true
                    return
                }
                this.buySure = true
            } catch (e) {
                console.log('tradeLogin===>error:', e)
            }
        },
        async confirmRedeem() {
            if (this.isMMF) {
                if (Number(this.number) > Number(this.maxNum)) {
                    this.failText = this.$t('sellNotEnoughTips')
                    this.buyFail = true
                    return
                }
            } else if (Number(this.number) > this.quantity) {
                this.failText = this.$t('trade.shuhuifenebuzu')
                this.buyFail = true
                return
            }
            this.$sensorsTrack('FundTradeOperation', {
                operation_type: '下单',
                deal_type: '赎回',
                fund_type: this.fundInfo.type,
                fund_code: this.fundInfo.ISIN,
                fund_name: this.fundInfo.name,
                redeem_num: this.number,
                currency: this.fundInfo.currency,
            })
            try {
                let res = {}
                // 显示loading
                this.showLoading = true
                if (this.isMMF) {
                    // MMF货基赎回下单
                    const { result = {} } = await ecashRedeem({
                        orderMode: 1, // 下单模式： 1-指定产品 2-自动分配
                        tradeMode: 1, // 交易方式 1-金额 2-数量
                        amount: String(this.number),
                        currency: this.fundInfo.currency,
                        symbol: this.symbol,
                        instructionId: this.getInstructionId(),
                    })
                    res = result
                } else {
                    // 其他公募赎回下单
                    const { result = {} } = await FundRedeem(
                        {
                            symbol: this.symbol,
                            quantity: String(this.number),
                            instructionId: this.getInstructionId(),
                        },
                        { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC }
                    )
                    res = result
                }
                console.log('FundRedeem ===> result:', res)
                Toast.success({
                    message: this.$t('trade.tijiaochenggong'),
                    forbidClick: true,
                    onClose: () => {
                        this.$router.replace({
                            path: '/submit-result',
                            query: {
                                orderId: res.orderId || '',
                                orderNumber: res.orderNumber,
                                symbol: this.symbol,
                                type: 'public',
                                isMMF: this.isMMF ? 1 : 0,
                            },
                        })
                    },
                })
            } catch (e) {
                this.handleOrderError({
                    error: e,
                    orderFunction: this.confirmRedeem,
                    callback: err => {
                        console.log('FundRedeem===>e:', err)
                        const error = err?.error || {}
                        if (error?.code === AGE_LIMIT_CODE) {
                            showTip()
                            return
                        }
                        if (error?.data?.tips) {
                            this.failText = error.data.tips
                            this.buyFail = true
                            return
                        }
                        // 隐藏loading
                        this.$toast(this.$t('serviceError'))
                    },
                    timeoutCallback: async orderList => {
                        Toast.success({
                            message: this.$t('trade.tijiaochenggong'),
                            forbidClick: true,
                            onClose: () => {
                                const { orderId, orderNumber } = orderList[0]
                                this.$router.replace({
                                    path: '/submit-result',
                                    query: {
                                        orderId: orderId,
                                        orderNumber: orderNumber,
                                        symbol: this.symbol,
                                        type: 'public',
                                        isMMF: this.isMMF ? 1 : 0,
                                    },
                                })
                            },
                        })
                    },
                    direction: 'redeem',
                })
            } finally {
                this.showLoading = false
            }
        },
        // 前往基金详情
        goFundDetail() {
            this.$goPage('/detail', { type: this.isPublicFund ? 'public' : 'private', symbol: this.symbol, fundType: this.fundInfo.type })
        },

        // 前往交易规则
        goTradeRule() {
            if (this.isPublicFund) {
                this.$goPage('/trade-rule', { type: 'public', symbol: this.symbol, fundType: this.fundInfo.type, active: 'sell' })
            }
        },
    },
}
</script>
<style lang="less" scoped>
.subscribe {
    padding: 12px;

    .cuszh {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 15px 12px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        background: #fff;
        border-radius: 8px;

        .right {
            display: flex;
            flex-direction: row;
            align-items: center;

            img {
                width: 16px;
                height: 16px;
            }

            span {
                margin-left: 6px;
                font-weight: 400;
                font-size: 15px;
            }
        }
    }

    .jetips {
        // border-top: 1px solid #F31414;
        width: 100%;
        padding: 11px 0;
        color: #f31414;
        font-size: 12px;
        line-height: 16px;
    }

    .van-dialog {
        width: 280px;

        /deep/ .van-dialog__header {
            font-size: 16px;
        }
    }

    /deep/ .van-overlay {
        background: rgba(0, 0, 0, 0.3);
    }

    .top {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px;
        background: #fff;
        border-radius: 8px;

        .left {
            margin-right: 8px;

            .fundName {
                margin-bottom: 7px;
                font-size: 16px;
                line-height: 22px;
            }

            .fundNum {
                display: flex;
                align-items: center;
                color: #666;
                font-size: 11px;
                line-height: 14px;

                p {
                    margin-right: 4px;
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 10px;
                    line-height: 12px;
                }

                span {
                    margin-right: 4px;
                    padding: 0 4px;
                    color: #278aff;
                    font-size: 10px;
                    background: #e7f2ff;
                    border-radius: 2px;
                }

                .currency {
                    margin-right: 5px;
                    padding: 2px;
                    color: #7933d9;
                    font-weight: 600;
                    font-size: 8px;
                    line-height: 12px;
                    border: 0.5px solid #7933d9;
                    border-radius: 1.5px;

                    &.HKD {
                        color: #7933d9;
                        border: 0.5px solid #7933d9;
                    }

                    &.CNH {
                        color: #ff6476;
                        border: 0.5px solid #ff6476;
                    }

                    &.CNY {
                        color: #ff6476;
                        border: 0.5px solid #ff6476;
                    }

                    &.EUR {
                        color: #164bcb;
                        border: 0.5px solid #164bcb;
                    }

                    &.USD {
                        color: #0569ff;
                        border: 0.5px solid #0569ff;
                    }
                }
            }
        }

        .right {
            img {
                width: 16px;
                height: 16px;
            }
        }
    }

    .buyBox {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 12px;
        padding: 0 12px;
        background: #fff;
        border-radius: 8px;

        .autoBuy {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding-top: 15px;

            .left {
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

            .right {
                display: flex;
                align-items: center;

                .right-text {
                    color: #666;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                }

                img {
                    width: 12px;
                    height: 12px;
                    margin-left: 4px;
                }
            }
        }

        .wrong-tip {
            padding-top: 8px;
            color: #f31414;
            font-size: 12px;
            line-height: 16px;
        }

        .buy-input {
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 64px;

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
                    padding: 0;
                    color: #000;
                    font-size: 16px;
                    line-height: 28px;
                    background-color: unset;

                    &.focus-large {
                        font-size: 32px;
                        line-height: 44px;
                    }

                    &.middle-large {
                        font-size: 24px;
                    }

                    input::-webkit-input-placeholder {
                        /* WebKit browsers 适配谷歌 */
                        color: rgba(156, 156, 156, 0.6);
                    }

                    input:-moz-placeholder {
                        /* Mozilla Firefox 4 to 18 适配火狐 */
                        color: rgba(156, 156, 156, 0.6);
                    }

                    input::-moz-placeholder {
                        /* Mozilla Firefox 19+ 适配火狐 */
                        color: rgba(156, 156, 156, 0.6);
                    }

                    input:-ms-input-placeholder {
                        /* Internet Explorer 10+  适配ie */
                        color: rgba(156, 156, 156, 0.6);
                    }
                }
            }

            .buyAll {
                margin-left: 10px;
                color: #ff6907;
                font-size: 14px;

                &.hasAll {
                    opacity: 0.3;
                }
            }
        }

        .fast {
            position: relative;
            width: 100%;
            margin-bottom: 4px;
            padding-bottom: 16px;

            .fast-item {
                display: inline-block;
                min-width: 48px;
                margin-right: 10px;
                padding: 4px 14.5px;
                color: #ff6907;
                font-size: 12px;
                line-height: 16px;
                text-align: center;
                background: rgba(255, 105, 7, 0.08);
                border-radius: 12px;
            }

            // 底部0.5 border
            &::after {
                position: absolute;
                right: 0;
                bottom: 0;
                left: 0;
                height: 1px;
                background: #efefef;
                transform: scaleY(0.5);
                content: '';
            }
        }

        .cus-fl {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            padding: 12px 0;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;

            .amount {
                color: #ff6307;
                font-style: normal;
            }

            .cus-fl__top {
                display: flex;

                .fl-top__left {
                    margin-right: 24px;

                    .label {
                        color: #666;
                    }

                    .value {
                        color: #2f2f2f;
                    }
                }

                .fl-top__right {
                    color: #666;
                }
            }

            .cus-fl__bottom {
                margin-top: 6px;
                color: #666;
                font-weight: 400;
                font-size: 11px;
                line-height: 16px;

                img {
                    width: 16px;
                    height: 16px;
                    margin: 0 2px 0 4px;
                    transform: translateY(4px);
                }
            }

            // 底部0.5 border
            &::after {
                position: absolute;
                right: 0;
                bottom: 0;
                left: 0;
                height: 1px;
                background: #efefef;
                transform: scaleY(0.5);
                content: '';
            }
        }
    }

    .ratio {
        margin-top: 12px;
        padding: 20px 12px;
        background: #fff;
        border-radius: 8px;

        .title {
            margin-bottom: 12px;
            color: #666;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .maxMoney {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 12px 0 16px;
        color: #666;
        font-size: 14px;
        line-height: 16px;
        background: #fff;
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;

        .num {
            margin-right: 24px;
            margin-left: 8px;
            color: #2f2f2f;
        }

        .flex-row {
            display: flex;
            flex-direction: row;
            align-items: center;

            .img {
                margin-left: 4px;
            }

            .num {
                margin-right: 0;
            }
        }
    }

    footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 12px 28px 3px;
        background-color: #fff;

        .agree {
            font-size: 12px;

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

    .diagBox {
        display: flex;
        flex-direction: column;
        margin-bottom: 24px;

        .item {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 6px 16px;

            .left {
                color: #9c9c9c;
                font-size: 14px;
                line-height: 20px;
            }

            .right {
                width: 160px;
                color: #1f1f1f;
                font-size: 16px;
                line-height: 22px;
                text-align: right;
            }
        }
    }

    .dialogContent {
        padding: 12px 16px 28px;
        font-size: 14px;
        text-align: center;
    }

    .est-dialog-content {
        padding: 17px 16px 28px;

        .content-top {
            margin-bottom: 16px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        .content-body {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }
    }
}
</style>
