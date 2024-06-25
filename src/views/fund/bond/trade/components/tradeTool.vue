<template>
    <div class="trade-tool" ref="tradeToolRef">
        <div class="top">
            <span class="title">{{ $t('intentionalPrice') }}</span>
            <span>{{ $t(isSubscribe ? 'referPrice' : 'referSellPrice') }}：{{ price }}</span>
        </div>
        <div class="center">
            <div class="number-input" ref="numberInputRef">
                <div class="buyInput">
                    <div class="numTip" v-show="calcDigits(number, 'number')">
                        <i></i>
                        <span>{{ calcDigits(number, 'number') }}</span>
                    </div>
                    <div class="left">{{ currency }}</div>
                    <div class="inputBox">
                        <div class="input">
                            <van-field
                                type="text"
                                inputmode="decimal"
                                v-model="numberDisplay"
                                :placeholder="'0.000'"
                                :class="{ 'focus-large': numberDisplay }"
                                clearable
                                @keyup="chkPrice($event, 'number')"
                                @clear="onClear('number')"
                                @blur="chkLast('number')"
                            />
                        </div>
                    </div>
                </div>
                <div class="wrongTip" v-show="numberWrongTip">{{ numberWrongTip }}</div>
            </div>
            <div class="amount">
                <p class="title">{{ $t('parFaceCash') }}</p>
                <div class="buyInput">
                    <div class="numTip" v-show="calcDigits(amount, 'amount')">
                        <i></i>
                        <div v-if="isUsemargin" :class="{ 'is-use-margin': isUsemargin }">
                            <span>{{ calcDigits(amount, 'amount') }}</span>
                            <img src="~@/assets/images/fund/dot_line.png" />
                            <span>{{ $t('willUseMargin') }}</span>
                        </div>
                        <span v-else>{{ calcDigits(amount, 'amount') }}</span>
                    </div>
                    <div class="left">{{ currency }}</div>
                    <div class="inputBox">
                        <div class="input">
                            <van-field
                                type="text"
                                inputmode="decimal"
                                v-model="amountDisplay"
                                :placeholder="placeholder"
                                :class="{ 'focus-large': amountDisplay }"
                                clearable
                                @keyup="chkPrice($event, 'amount', { base: 2 })"
                                @clear="onClear('amount')"
                                @blur="chkLast('amount', { base: 2 })"
                                @focus="onFocus('amount')"
                            />
                        </div>
                        <template v-if="isSubscribe">
                            <div class="buyAll" @click="buyAll" v-show="showBuyALl">{{ $t('trade.qbrg') }}</div>
                        </template>
                        <template v-else>
                            <div class="sellAll" @click="sellAll">{{ $t('trade.qunbushuhui') }}</div>
                        </template>
                    </div>
                </div>
                <div class="wrongTip" v-show="amountWrongTip">{{ amountWrongTip }}</div>
                <div class="trade-rule" v-show="!amountWrongTip">
                    <p>
                        <span>{{ $t('startFaceCash') }}：</span>
                        <span v-html="minInitialText"></span>
                    </p>
                    <div class="row">
                        <p>
                            <span>{{ $t(isSubscribe ? 'trade.rgfl' : 'trade.mcfl') }}：</span>
                            <span class="rule-value">{{ buyFee }}</span>
                        </p>
                        <p>
                            <span>{{ $t('validTimeForBondOrder') }}：</span>
                            <span>{{ $t('oneDayValid') }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="!isSubscribe" class="parvalue">
            <span class="label">
                {{ $t('validToSellFaceValue') }}
                <multi-img name="icon-tips" directory="common" @click.stop="onRemind"></multi-img>
            </span>
            <span class="value">{{ parValue | thousandsFilter }}{{ currency | currencyFilter }}</span>
        </div>
        <div class="footer"></div>
    </div>
</template>
<script>
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { keepDecimals, floatToRatio } from '@/utils'
import { i18n } from '@/i18n/fund/index.js'
import { ORDER_DIRECTION_MAP } from '../../../config/common'
import { getHoldingsDetail } from '@/apis/wealth/index.js'
import NP from 'number-precision'
import { PRODUCT_BUY_TYPE } from '@/config/common'
export default {
    name: 'tradeTool',
    props: {
        currency: {
            type: String,
            default: '',
        },
        tradeRule: {
            type: Object,
            default: () => ({}),
        },
        price: {
            type: [Number, String],
        },
        // 用户购买支持购买力的产品，是否使用到了购买力
        isUsemargin: {
            type: Boolean,
            default: false,
        },
        // 是否提示 其它币种欠款
        showWithdrawalBalanceTip: {
            type: Boolean,
            default: false,
        },
        // 产品类型
        productBuyType: {
            type: Number,
            required: true,
        },
        // 用户当前资金差 如果用户资金小于买入资金则为正数
        capitalGap: {
            type: [Number, String],
            default: 0,
        },
        // 可用购买力（包含现金购买力|最大购买力）
        purchasingPower: {
            type: [Number, String],
            default: 0,
            required: true,
        },
        quoteInfo: {
            type: Object,
            default: () => ({}),
        },
        // 投资集中度
        investFocusDegree: {
            type: [Number, String],
        },
    },
    filters: {
        currencyFilter,
    },
    data() {
        return {
            number: '',
            numberDisplay: '',
            amount: '',
            amountDisplay: '',
            holdingDetail: {},
            hasFocusedNumberInput: false,
            hasFocusedAmountInput: false,
            amountWrongTip: '',
            numberWrongTip: '',
        }
    },
    computed: {
        // 是否显示低于起投金额文字
        lowThanMiniIntial() {
            return this.amount && Number(this.amount) < this.minInitial
        },
        // 单位金额整数倍限制
        integralMultiLimit() {
            return this.amount && Number(this.amount) % Number(this.unitAmount) !== 0
        },

        placeholder() {
            return `${this.minInitialMsg}${this.$t('trade.qi')}`
        },
        // 买入|卖出 起投金额
        minInitial() {
            return this.tradeRule[this.isSubscribe ? 'minInitial' : 'minRedemption']
        },
        // 买入|卖出 递增金额
        unitAmount() {
            return this.tradeRule[this.isSubscribe ? 'unitAmount' : 'sellUnitAmount']
        },
        // 起投金额 | 卖出起投金额（包含单位）
        minInitialMsg() {
            return `${thousandsFilter(floatToRatio(this.minInitial, { rate: false, sign: false }))}${currencyFilter(this.currency)}`
        },
        // 单位金额
        unitAmountMsg() {
            return `${thousandsFilter(this.unitAmount)}`
        },
        minInitialText() {
            const minInitalAmount = thousandsFilter(floatToRatio(this.minInitial, { rate: false, sign: false }))
            const currency = currencyFilter(this.currency)
            return `<span><span class='rule-value'>${minInitalAmount}</span>${currency}，${i18n.t('decreaseUnit', {
                num: this.unitAmountMsg,
                classname: 'rule-value',
                currency: currency,
            })}</span>`
        },
        // 认购费
        buyFee() {
            return this.tradeRule.buyFee ? floatToRatio(this.tradeRule.buyFee, { sign: false }) : ''
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
        parValue() {
            return this.holdingDetail?.availableQuantity || 0
        },

        showBuyALl() {
            const n = Number(this.number)
            return !!n
        },
    },
    watch: {
        number: {
            handler(v) {
                this.$emit('changePrice', v)
            },
            immediate: true,
        },
        amount: {
            handler(v) {
                this.$emit('changeAmount', v)
            },
            immediate: true,
        },
    },
    mounted() {
        this.getHolding()
    },
    methods: {
        async getHolding() {
            try {
                const { result = {} } = await getHoldingsDetail({ symbol: this.$route.params.symbol })
                console.log('getHoldingsDetail-result ==> ', result)
                this.holdingDetail = result
                this.$emit('getParValue', this.parValue)
            } catch (e) {
                console.error(e)
            }
        },
        //返回输入位数
        calcDigits(num, key) {
            if (this[`${key}Display`] == '') {
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
        chkPrice(e, key, options = { base: 3 }) {
            const validateMethod = 'check' + key.slice(0, 1)?.toUpperCase() + key.slice(1)
            const value = e.target.value
            if (!value) {
                this[key] = ''
                this.$nextTick(() => {
                    this[validateMethod]()
                    if (key === 'number') {
                        this.checkAmount()
                    }
                })
                return
            }
            const reg = new RegExp(`\\.{${options.base},}`, 'g')
            let val = value.replace(/[^0-9\\.]/g, '').replace(reg, '.')
            if (+val < 0) val = '0'
            // v-model表单值
            this[key] = val.indexOf('.') > 0 ? val.split('.')[0] + '.' + val.split('.')[1].substring(0, options.base) : val
            this[`${key}Display`] = e.target.value = thousandsFilter(this[key])
            this.$nextTick(() => {
                this[validateMethod]()
                if (key === 'number') {
                    this.checkAmount()
                }
            })
        },
        onClear(key) {
            this[key] = ''
            this.$nextTick(() => {
                const validateMethod = 'check' + key.slice(0, 1)?.toUpperCase() + key.slice(1)
                this[validateMethod]()
            })
        },
        chkLast(key, options = { base: 3 }) {
            if (this[`${key}Display`] == '') {
                return ''
            }
            this[key] = keepDecimals(this[key], options.base)
            this[`${key}Display`] = thousandsFilter(this[key])
        },
        // 校验number是否输入正常
        checkNumber() {
            let msg = ''
            let n = this.number
            if (!n) {
                msg = this.$t('cantEmptyForPrice')
            } else {
                n = Number(this.number)
                if (n === 0) {
                    msg = this.$t('cantBeZeroForPrice')
                }
            }
            this.numberWrongTip = msg
            if (msg) {
                const bondBuyDom = document.querySelector('.bond-buy')
                if (bondBuyDom && bondBuyDom.scrollTop >= 80) {
                    // 滚动到视野中
                    this.$refs.tradeToolRef.scrollIntoView({ behavior: 'smooth' })
                }
            }
            return msg
        },
        // 校验票面面值是否输入正常
        checkAmount() {
            let msg = ''
            const n = this.amount
            // 投资集中度选中了才提醒
            if (this.investFocusDegree) {
                if (!n) {
                    msg = this.$t('cantEmptyForAmount')
                }
            }
            if (this.lowThanMiniIntial) {
                msg = this.$t('minInitialTips', { num: this.minInitialMsg })
            }
            if (!this.isSubscribe) {
                // 最大票面面额的校验
                if (NP.minus(this.holdingDetail?.availableQuantity || 0, this.amount) < 0) {
                    msg = this.$t('moreThanValidFaceValue')
                }
            }
            if (this.integralMultiLimit) {
                msg = this.$t('parMustMulti', { num: this.unitAmount })
            }
            if (this.capitalGap > 0) {
                if (this.productBuyType === PRODUCT_BUY_TYPE.keysMap.purchasingPower) {
                    msg = this.$t('greatThanPurchasingPowerTip')
                }
                if (this.productBuyType === PRODUCT_BUY_TYPE.keysMap.cash) {
                    msg = this.$t('greatThanCashTip')
                }
            }
            if (this.showWithdrawalBalanceTip) {
                // 超出最大购买力，其他币种有欠款未还清
                msg = this.$t('tradeFailedOfMaxPPForDebt')
            }
            this.amountWrongTip = msg
            this.$emit('changeShowWrong', msg)
            if (msg) {
                const bondBuyDom = document.querySelector('.bond-buy')
                if (bondBuyDom && bondBuyDom.scrollTop >= 80) {
                    // 滚动到视野中
                    this.$refs.tradeToolRef.scrollIntoView({ behavior: 'smooth' })
                }
            }
            return msg
        },

        onFocus(type) {
            if (type === 'amount') {
                this.checkNumber()
            }
        },
        // 计算最大面值
        calcMaxAmount() {
            const price = this.number
            let maxPurchasingPower = this.purchasingPower
            let retAmount = 0
            const buyFee = NP.divide(this.tradeRule.buyFee || 0, 100)
            const unitAmount = this.unitAmount
            const accrualInterest = this.quoteInfo.accrualInterest || 0
            maxPurchasingPower = NP.minus(maxPurchasingPower, NP.times(buyFee, maxPurchasingPower)) // 扣除 买入费率
            retAmount = NP.divide(NP.times(maxPurchasingPower, 100), NP.plus(price, accrualInterest))
            // 向下取整
            retAmount = NP.divide(retAmount, unitAmount)
            retAmount = Math.trunc(retAmount)
            // 算出来最终结果
            retAmount = NP.times(retAmount, unitAmount)
            return retAmount
        },

        buyAll() {
            if (this.purchasingPower <= 0) return
            const amount = this.calcMaxAmount()
            this.amount = '' + amount
            this.amountDisplay = thousandsFilter(this.amount)
            this.$nextTick(() => {
                this.checkAmount()
            })
        },

        sellAll() {
            this.amount = this.parValue
            this.amountDisplay = thousandsFilter(this.amount)
        },

        onRemind() {
            this.$dialog
                .confirm({
                    title: this.$t('validToSellFaceValue'),
                    message: this.$t('validToSellFaceValueTip'),
                    showCancelButton: false,
                    confirmButtonText: this.$t('iKnow'),
                })
                .then(() => {})
        },
    },
}
</script>
<style></style>
<style scoped lang="less">
.trade-tool {
    padding: 16px 12px;
    background: #fff;
}

.top {
    display: flex;
    align-items: center;
    color: #9c9c9c;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;

    .title {
        padding-right: 10px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }
}

.center {
    position: relative;

    .wrongTip {
        position: relative;
        padding-top: 8px;
        color: #f31414;
        font-size: 12px;
        line-height: 16px;

        &::after {
            position: absolute;
            top: -0.5px;
            right: 0;
            left: 0;
            height: 1px;
            background: #f31414;
            transform: scaleY(0.5);
            content: '';
        }
    }

    .amount {
        padding-top: 16px;

        .title {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        .amount-input {
            display: flex;
            align-items: center;
            padding: 12px 0 22px;

            img {
                width: 20px;
                height: 20px;
            }

            /deep/ .van-cell {
                width: 146px;
                padding: 0;

                input {
                    color: #000;
                    font-weight: 400;
                    font-size: 32px;
                    line-height: 44px;
                    text-align: center;
                }
            }

            /deep/ .van-cell::after {
                border-width: 0;
            }
        }

        .trade-rule {
            padding-top: 12px;

            .row {
                display: flex;

                p:first-of-type {
                    margin-right: 24px;
                }
            }

            /deep/ .rule-value {
                color: #2f2f2f;
            }

            p {
                color: #666;
                font-weight: 400;
                font-size: 11px;
                line-height: 16px;

                span:first-of-type {
                    color: #9c9c9c;
                }
            }

            & > p:first-of-type {
                padding-bottom: 6px;
            }
        }
    }

    .buyInput {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        height: 64px;
        margin-top: 2px;
        overflow: hidden;

        .numTip {
            position: absolute;
            top: 0;
            left: 60px;
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

            .is-use-margin {
                display: flex;
                align-items: center;
                padding: 0 2px;
                font-size: 0;
                background: rgba(255, 105, 7, 0.1);
                border-radius: 1px;

                img {
                    width: 1px;
                    height: 7px;
                }

                span {
                    color: @theme;
                    font-size: 8px;
                    line-height: 12px;
                    background: transparent;
                }
            }

            span {
                padding: 2px;
                color: #666;
                font-size: 8px;
                background: #f0f0f0;
                border-radius: 1px;
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

        .left {
            width: 44px;
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
                padding: 10px 13px;
                color: #000;
                font-size: 20px;
                line-height: 28px;

                &.focus-large {
                    font-size: 32px;
                    line-height: 44px;
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

        .buyAll,
        .sellAll {
            margin-left: 10px;
            color: #ff6907;
            font-size: 14px;

            &.hasAll {
                opacity: 0.3;
            }
        }
    }
}

.parvalue {
    position: relative;
    display: flex;
    margin-top: 16px;
    padding: 12px 0 0;

    &::before {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 1px;
        background: #efefef;
        transform: scaleY(0.5);
        content: '';
    }

    .label {
        display: flex;
        align-items: center;
        color: @fontGreyColor;
        font-size: 14px;
        line-height: 20px;

        img {
            width: 14px;
            height: 14px;
            margin-left: 5px;
        }
    }

    .value {
        margin-left: 10px;
        color: #2f2f2f;
        font-size: 14px;
        line-height: 20px;
    }
}
</style>
