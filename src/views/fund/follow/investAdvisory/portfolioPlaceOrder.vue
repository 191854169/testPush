<!--
 * @Description: 投资组合下单
-->
<template>
    <div class="c-main" id="order">
        <div class="pad-12 pad-b120 basic-info">
            <div class="mar-b12 top_info">
                <div class="flex-c">
                    <h5 class="f16 bold mar-r8 lh-22">{{ basicInfo.name ?? '' }}</h5>
                    <portfolio-tag :portfolioType="basicInfo.type" :tag-obj="tagObj"></portfolio-tag>
                </div>
            </div>
            <!-- 买入金额 -->
            <div class="trade-body">
                <div class="direction border-bottom-1px">
                    <div class="left">
                        <h5 class="f16 bold mar-r8 lh-22">{{ $t('investAdvisory.tradeDirection') }}</h5>
                    </div>
                    <div class="right">
                        <div class="tab" :class="{ 'tab-active': activeTab === 0 }" @click="clickTab(0)">
                            {{ $t('investAdvisory.additionalBuy') }}
                        </div>
                        <div class="tab" :class="{ 'tab-active': activeTab === 1, 'tab-disable': cancelFollow }" @click="clickTab(1)">
                            {{ $t('investAdvisory.soldOut') }}
                        </div>
                    </div>
                </div>
                <div class="add-buy" v-show="activeTab === 0">
                    <div class="autoBuy">
                        <div class="left">
                            <select-currency v-model="currency" :currencyList="currencyList">
                                {{ $t('follow.descriptAmount') }}
                            </select-currency>
                        </div>
                    </div>
                    <!-- 输入金额 -->
                    <div class="buyInput border-bottom-1px" :class="{ hasWrong: calcWrong(toCalcNumber) }">
                        <div class="numTip" v-show="calcDigits(toCalcNumber)">
                            <i></i>
                            <span>{{ calcDigits(toCalcNumber) }}</span>
                        </div>
                        <div class="left">{{ currency }}</div>
                        <div class="inputBox">
                            <div class="input" :class="[amountDisplayFontSize]">
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
                    <CapitalDetail
                        class="outter-capital-detail"
                        v-if="currency"
                        v-model="minusVal"
                        :product-buy-type="productBuyType"
                        :trade-amount="toCalcNumber"
                        :currency="currency"
                        @getWithDrawalBalance="WithdrawalBalance"
                        :mix-market="false"
                        :currentRate="1"
                        :source-page="sourcePage"
                        :single-sum-min="true"
                        ref="capitalDetailRef"
                    ></CapitalDetail>
                </div>

                <div class="sold-out" v-show="activeTab === 1">
                    <div class="top-info">
                        <div class="left">{{ $t('trade.yjkshje') }}</div>
                        <div class="right">
                            <div class="row" v-for="(item, index) in getAmountItems(soldInfo)" :key="index">
                                <span class="amount line-elipsis">{{ formatAmountWithCurrency(item.amount, item.currency) }}</span>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="tips">{{ '这里是卖出提示，如实际到账金额或因交易费用导致与预估进行有所偏差等。' }}</div> -->
                </div>
            </div>

            <!-- <div class="risk">
                <p class="risk-tip-title">{{ $t('riskWarning') }}：</p>
                <p>{{ $t('follow.riskTip') }}</p>
            </div> -->
        </div>

        <!-- 底部按钮及协议声明 -->
        <footer>
            <div class="button" v-show="activeTab === 0" :class="{ canSign }" @click="buyHandler">{{ $t('investAdvisory.confirmBuy') }}</div>
            <div class="button" v-show="activeTab === 1" :class="{ canSell }" @click="sellHandler">{{ $t('investAdvisory.confirmSell') }}</div>
            <div class="safe-padding-bottom"></div>
        </footer>
    </div>
</template>

<script>
import { amountFilter, amountFormatter, thousandsFilter } from '@/config/filters.js'
import { mapState } from 'vuex'
import portfolioTag from '../components/portfolioTag.vue'
import NP from 'number-precision'
import MonitorKeyboard from '@/utils/monitorKeyboard'
import { dynamicFontSize, keepDecimals } from '@/utils'
import { CURRENCY_MAP } from '../../config/common'
import { PRODUCT_BUY_TYPE } from '@/config/common'
import SelectCurrency from '../../components/selectCurrency.vue'
import CapitalDetail from '../components/capitalDetailFollow.vue'
import { additionalBuying, holdOrderAmount, orderSoldOut } from '@/apis/portfolioFollow/index.js'
import { sourcePageMap } from '../../config/common'
import { Toast } from 'vant'
import { i18n } from '@/i18n/fund'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import investAdvisoryMixin from '../mixins/investAdvisoryMixin'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import { throttle } from 'lodash'

NP.enableBoundaryChecking(false)
export default {
    name: 'place-order',
    components: {
        portfolioTag,
        SelectCurrency,
        CapitalDetail,
    },
    mixins: [platformDifferenceMixin, investAdvisoryMixin, watchPageVisibleMixin],
    data() {
        return {
            activeTab: 0,
            number: '',
            placeholder: this.$t('investAdvisory.placeholder'),
            amountDisplay: '',
            withdrawalBalanceData: {
                singleWithdrawBalance: '', //单币种可提现金额
                purchasingPower: '', // 最大购买力
            },
            monitorKeyboard: null,
            focusVal: '',
            minusVal: 0,
            minInitialAmount: 0,
            soldInfo: {},
            buyHandler: throttle(this.handleBuy, 1000),
            sellHandler: throttle(this.handleSell, 1000),
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        currencyName() {
            return this.currency ? CURRENCY_MAP.keyValueMap[this.currency] : 'HKD'
        },
        // 是否显示存入资金
        depositFlag() {
            return this.minusVal > 0
        },
        // 基金组合的最小投资金额
        minInitial() {
            //起投金额币种 和 当前币种相同，直接返回起投金额
            const now = keepDecimals(this.minInitialAmount, 2)
            const mini = this.minInitialAmount
            const suffix = now < mini ? 0.01 : 0
            return now + suffix
        },
        canSign() {
            const greaterThanZero = NP.minus(this.toCalcNumber, 0) > 0 // 买入金额需要大于零
            if (!greaterThanZero) return false
            const isEnoughAmount = !this.depositFlag
            // 认购金额需要大于最小起投
            const greaterThanMinInitial = NP.minus(this.toCalcNumber, this.minInitial) >= 0
            return greaterThanMinInitial && isEnoughAmount
        },

        canSell() {
            if (this.soldInfo?.sellAmountHKD && this.soldInfo.sellAmountHKD.length > 0) {
                return true
            }

            if (this.soldInfo?.sellAmountUSD && this.soldInfo.sellAmountUSD.length > 0) {
                return true
            }

            if (this.soldInfo?.sellAmountCNH && this.soldInfo.sellAmountCNH.length > 0) {
                return true
            }
            return false
        },
        // 限制的小数位
        limitDecimal() {
            return 2 //和产品确认，目前都限制两位小数
        },
        productBuyType() {
            return PRODUCT_BUY_TYPE.keysMap['cash']
        },
        minPricePer() {
            return this.minInitial
        },
        purchasingPower() {
            return this.withdrawalBalanceData.singleWithdrawBalance
        },
        toCalcNumber() {
            return this.number
        },
        sourcePage() {
            return sourcePageMap.upgradeInvestService
        },
        currencyList() {
            return [
                { value: 'HKD', text: i18n.t('HKD') },
                { value: 'USD', text: i18n.t('USD') },
                { value: 'CNH', text: i18n.t('CNH') },
            ]
        },
        cancelFollow() {
            //清仓卖出，取消跟投
            return this.soldInfo.followStatus === 4
        },

        amountDisplayFontSize() {
            if (this.amountDisplay.length > 9) {
                return 'small-font-size'
            }
            return 'normal-font-size'
        },
    },
    filters: {
        amountFilter(v) {
            return amountFormatter(v, { base: 2 })
        },
        currencyFilter(v) {
            return CURRENCY_MAP.keyValueMap[v] || ''
        },
    },
    watch: {},
    created() {
        this.getKeyboardState()
        this.watch(() => {
            this.$nextTick(() => {
                if (this.$refs.capitalDetailRef) {
                    this.$refs.capitalDetailRef.clearWithdrawBalance()
                    this.$refs.capitalDetailRef.getAssetsDetail()
                }
            })
        })
    },
    async mounted() {
        await this.getBasicInfo()
        await this.getSoldAmount()
        this.adjustAmountElementFontSize()
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

        //获取卖出金额
        async getSoldAmount() {
            try {
                const { result } = await holdOrderAmount({
                    portfolioId: this.portfolioId,
                    applyAccountId: this.applyAccountId,
                    subAcctId: this.subAccountId,
                })
                console.log('investAdvisor getSoldAmount ==>', result)
                if (result) {
                    this.soldInfo = result
                }
            } catch (e) {
                console.error('investAdvisor getSoldAmount error', e)
            }
        },

        async handleBuy() {
            if (!this.canSign) return

            //APP内部会调起交易密码校验
            if (this.$jsBridge) {
                await this.$jsBridge.tradeLogin()
            }

            this.appTradeFn()
        },

        async handleSell() {
            // APP内部会调起交易密码校验
            if (this.$jsBridge) {
                await this.$jsBridge.tradeLogin()
            }
            this.appSellFn()
        },

        async appSellFn() {
            try {
                const params = {
                    subAcctId: this.subAccountId,
                    portfolioId: this.portfolioId,
                    applyAccountId: this.applyAccountId,
                }

                if (this.soldInfo?.sellAmountHKD) {
                    params.sellAmountHKD = this.soldInfo.sellAmountHKD
                }

                if (this.soldInfo?.sellAmountUSD) {
                    params.sellAmountUSD = this.soldInfo.sellAmountUSD
                }

                if (this.soldInfo?.sellAmountCNH) {
                    params.sellAmountCNH = this.soldInfo.sellAmountCNH
                }

                this.$loading.show = true
                const { result } = await orderSoldOut(params)
                if (result) {
                    Toast.success(this.$t('follow.alreadySubmit'))
                    setTimeout(() => {
                        this.goBackPrePage()
                    }, 1000)
                }
            } catch (e) {
                console.log('appSellFn===>error:', e)
                if (e?.error?.data?.tips) {
                    return Toast(e?.error?.data?.tips)
                }
                Toast(this.$t('tradeFailed'))
            } finally {
                this.$loading.show = false
            }
        },

        gotoOrderRecords(orderId = '') {
            const url = `${location.origin}${location.pathname}#/invest-advisory/order-records?type=${0}&portfolioId=${
                this.portfolioId
            }&applyAccountId=${this.applyAccountId}`
            location.href = url
        },

        goBackPrePage() {
            this.backPreviousPage()
        },

        // 下单买入
        async appTradeFn() {
            try {
                const params = {
                    subAcctId: this.subAccountId,
                    portfolioId: this.portfolioId,
                    applyAccountId: this.applyAccountId,
                    amount: this.toCalcNumber + '',
                    currency: this.currency,
                }
                this.$loading.show = true
                const { result } = await additionalBuying(params)
                if (result) {
                    Toast.success(this.$t('follow.alreadySubmit'))
                    setTimeout(() => {
                        this.goBackPrePage()
                    }, 1000)
                }
            } catch (e) {
                console.error('orderCreate===>error:', e)
                if (e?.error?.data?.tips) {
                    return Toast(e?.error?.data?.tips)
                }
                Toast(this.$t('tradeFailed'))
            } finally {
                this.$loading.show = false
            }
        },

        //检测输入值返回错误信息
        calcWrong(num) {
            if (this.depositFlag && this.purchasingPower !== '') {
                return this.$t('portfolioFollow.notEnoughTransferAmount')
            }
            if (num === '' || this.amountDisplay === '') {
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
            if (this.amountDisplay === '') {
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

        handleFocus() {
            this.focusVal = keepDecimals(Number(this.number), 2)
        },

        chkLast() {
            // 失去焦点，计算每个股票的价格和数量
            if (this.amountDisplay === '') {
                return ''
            }
            this.number = keepDecimals(Number(this.number), 2)
            this.amountDisplay = thousandsFilter(this.number)
        },

        amountFormat(v, decimal = 2) {
            v = v + ''
            v = v.replace(/,/g, '')
            return amountFilter(keepDecimals(Number(v), decimal))
        },

        onClear() {
            this.number = ''
            this.amountDisplay = ''
        },

        formatAmountWithCurrency(amount, currency) {
            const formattedAmount = amountFilter(amount)
            if (amount) {
                const currencyStr = CURRENCY_MAP.keyValueMap[currency] || ''
                return `${formattedAmount} ${currencyStr}`
            }
            return '--'
        },

        getAmountItems(item) {
            const result = []
            if (item.sellAmountHKD && item.sellAmountHKD.length > 0) {
                result.push({ amount: item.sellAmountHKD, currency: 'HKD' })
            }
            if (item.sellAmountUSD && item.sellAmountUSD.length > 0) {
                result.push({ amount: item.sellAmountUSD, currency: 'USD' })
            }
            if (item.sellAmountCNH && item.sellAmountCNH.length > 0) {
                result.push({ amount: item.sellAmountCNH, currency: 'CNH' })
            }
            if (result.length === 0) {
                result.push({ amount: null, currency: null })
            }
            return result
        },

        clickTab(index) {
            if (index === 1 && this.cancelFollow) {
                Toast(this.$t('investAdvisory.noHoldSell'))
                return
            }
            this.activeTab = index
        },
    },
}
</script>

<style lang="less" scoped>
.basic-info {
    .bottom {
        margin-top: 10px;
    }

    &.pad-b120 {
        padding-bottom: 120px;
    }

    .top_info {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 16px 12px;
        color: #2f2f2f;
        background: #fff;
        background-color: #fff;
        border-radius: 8px;
    }
}

.trade-body {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 12px;
    background: #fff;
    border-radius: 8px;

    .direction {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 54px;

        .right {
            display: flex;
            align-items: center;
            justify-content: space-evenly;
            width: 166px;
            height: 32px;
            background: #f8f8f8;
            border-radius: 16px;

            .tab {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 80px;
                height: 28px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                text-align: center;

                &-active {
                    color: #ff6907;
                    font-weight: 700;
                    font-size: 14px;
                    line-height: 20px;
                    background-color: #fff;
                    border-radius: 14px;
                }

                &-disable {
                    color: #ddd;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                    background-color: #f8f8f8;
                }
            }
        }
    }

    .add-buy {
        background: #fff;

        .autoBuy {
            display: flex;
            justify-content: space-between;
            width: 100%;
            padding-top: 23px;

            .left {
                display: flex;
                align-items: center;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;

                /deep/ span {
                    color: #2f2f2f;
                }
            }
        }

        .wrongTip {
            margin-top: 8px;
            margin-bottom: 4px;
            color: #f31414;
            font-size: 12px;
            line-height: 16px;
        }

        .outter-capital-detail {
            width: calc(100% + 24px);
            margin: 0 -12px;

            ::v-deep(.capital-list) {
                margin-bottom: 4px;
            }
        }

        .hasWrong {
            &.border-bottom-1px::after {
                background-color: #f31414;
            }
        }

        .buyInput {
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: center;
            width: 100%;
            height: 64px;
            margin-top: 0;
            overflow: hidden;

            .left {
                margin-left: 0;
                color: #333;
                font-weight: 400;
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

                &.small-font-size {
                    ::v-deep .van-field {
                        font-size: 28px;
                    }
                }

                &.normal-font-size {
                    ::v-deep .van-field {
                        font-size: 32px;
                    }
                }

                ::v-deep .van-field {
                    color: #000;
                    font-weight: bold;
                    font-size: 32px;
                    line-height: 38px;

                    input::-webkit-input-placeholder {
                        /* WebKit browsers 适配谷歌 */
                        color: rgba(156, 156, 156, 1);
                        font-weight: normal;
                        transform: scale(20 / 32);
                        transform-origin: left;
                    }

                    input:-moz-placeholder {
                        /* Mozilla Firefox 4 to 18 适配火狐 */
                        color: rgba(156, 156, 156, 1);
                        font-weight: normal;
                        transform: scale(20 / 32);
                        transform-origin: left;
                    }

                    input::-moz-placeholder {
                        /* Mozilla Firefox 19+ 适配火狐 */
                        color: rgba(156, 156, 156, 1);
                        font-weight: normal;
                        transform: scale(20 / 32);
                        transform-origin: left;
                    }

                    input:-ms-input-placeholder {
                        /* Internet Explorer 10+  适配ie */
                        color: rgba(156, 156, 156, 1);
                        font-weight: normal;
                        transform: scale(20 / 32);
                        transform-origin: left;
                    }
                }
            }

            .numTip {
                position: absolute;
                top: 3px;
                left: 62px;
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

    .sold-out {
        width: 100%;
        padding-top: 23px;
        padding-bottom: 16px;
        background: #fff;

        .top-info {
            display: flex;
            justify-content: space-between;
            width: 100%;

            .left {
                display: flex;
                align-items: start;
                width: 100px;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

            .right {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                justify-content: center;
                box-sizing: border-box;

                .row {
                    height: 22px;
                    margin-bottom: 4px;
                }

                .amount {
                    color: @h1-white;
                    font-size: 16px;
                    line-height: 22px;
                    white-space: nowrap;
                    text-align: right;
                }
            }
        }

        .tips {
            padding-top: 16px;
            font-weight: 400;
            font-size: 12px;
            line-height: 19px;
        }
    }
}

.asset-ratio-card {
    background-color: #fff;
    border-radius: 8px;
}

.risk {
    color: #9c9c9c;
    font-weight: normal;
    font-size: 12px;
    line-height: 19px;
    white-space: pre-line;

    .risk-tip-title {
        margin: 24px 0 8px;
        font-weight: normal;
    }
}

footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 4px 12px;
    background-color: #fff;
    box-shadow: inset 0 0.5px 0 #efefef;

    .button {
        height: 44px;
        margin: 0 16px;
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

        &.canSell {
            opacity: 1;
        }
    }

    .safe-padding-bottom {
        #iosBottom();
    }
}
</style>
