<!--
 * @Description: 投资组合下单
-->
<template>
    <div class="c-main" id="order">
        <div class="pad-12 pad-b158 basic-info">
            <!-- 买入金额 -->
            <div class="buyBox mar-b12">
                <div class="top_info border-bottom-1px">
                    <div>
                        <div class="flex-c">
                            <h5 class="f16 bold mar-r8 lh-22">{{ basicInfo.name ?? '' }}</h5>
                            <portfolio-tag :portfolioType="basicInfo.type" :tag-obj="tagMap"></portfolio-tag>
                        </div>
                    </div>
                </div>
                <div class="autoBuy">
                    <div class="left">
                        <template>
                            {{ $t('follow.descriptAmount') }}
                        </template>
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
                    ref="capitalDetailRef"
                ></CapitalDetail>
            </div>

            <!-- 认购投资产品占您的资产比例 -->
            <div class="asset-ratio-card mar-b12">
                <InvestAssetRatio :investFocusDegree="investmentFocusDegree" @ratioChange="handleRadioChange"></InvestAssetRatio>
            </div>

            <!-- 投资策略说明 -->
            <div class="investment-strategy-card pad-h12 pad-v8">
                <div class="f16 bold color-h1 pad-v8">{{ $t('investmentService.investmentStrategyDesc') }}</div>
                <div class="grid pad-v8">
                    <div class="name">{{ $t('investmentService.investMarket') }}</div>
                    <div class="value">{{ basicInfo.investMarket || '--' }}</div>
                    <div class="name">{{ $t('investmentService.investPrincipal') }}</div>
                    <div class="value">
                        {{ basicInfo.investPrincipal || '--' }}
                    </div>
                    <div class="name">{{ $t('investmentService.lockPeriod') }}</div>
                    <div class="value">{{ basicInfo.lockPeriod || '--' }}</div>
                    <div class="name">{{ $t('riskLevel') }}</div>
                    <div class="value">{{ basicInfo.riskOverall | riskRatingFilter }}</div>
                    <div class="name">{{ $t('investmentService.tradeStrategy') }}</div>
                    <div class="value">{{ basicInfo.tradeStrategy || '--' }}</div>
                    <div class="name">{{ $t('investmentService.tradeProduct') }}</div>
                    <div class="value">
                        {{ basicInfo.tradeProduct || '--' }}
                    </div>
                    <div class="name">{{ $t('investmentService.valuationCurrency') }}</div>
                    <div class="value">{{ basicInfo.valuationCurrency || '--' }}</div>
                    <div class="name">{{ $t('investmentService.leverageRatio') }}</div>
                    <div class="value">{{ basicInfo.leverageRatio || '--' }}</div>
                </div>
                <div class="f12 color-h3 pad-v8 text-h-center">{{ $t('investmentService.managementAgreement') }}</div>
            </div>
        </div>
        <!-- 底部按钮及协议声明 -->
        <footer>
            <div class="button" :class="{ canSign }" @click="handleBuy">{{ $t('createPortfolio.next') }}</div>
            <div class="safe-padding-bottom"></div>
        </footer>
    </div>
</template>

<script>
import { amountFilter, amountFormatter, thousandsFilter } from '@/config/filters.js'
import { mapState } from 'vuex'
import portfolioTag from './components/portfolioTag.vue'
import NP from 'number-precision'
import MonitorKeyboard from '@/utils/monitorKeyboard'
import { dynamicFontSize, keepDecimals } from '../../../utils'
import { CURRENCY_MAP, opposeCurrencyMap, RISK_RATING_MAP } from '../config/common'
import pathnames from '@/config/H5Pathname.js'
import { PRODUCT_BUY_TYPE } from '@/config/common'
import SelectCurrency from '../components/selectCurrency.vue'
import CapitalDetail from './components/capitalDetailFollow.vue'
import { getBasicInfo, orderCreate } from '@/apis/portfolioFollow/index.js'
import { sourcePageMap } from '../config/common'
import InvestAssetRatio from './components/investAssetRatio.vue'
import { Toast } from 'vant'
import { i18n } from '@/i18n/fund'
import { tgProductTypeMap } from './utils/filters'

NP.enableBoundaryChecking(false)
export default {
    name: 'upgradeInvestmentService',
    components: {
        portfolioTag,
        SelectCurrency,
        CapitalDetail,
        InvestAssetRatio,
    },
    mixins: [],
    data() {
        return {
            checked: true,
            number: '',
            placeholder: '',
            amountDisplay: '',
            subAccountId: this.$store.getters['user/getSubAccountId'],
            withdrawalBalanceData: {
                singleWithdrawBalance: '', //单币种可提现金额
                purchasingPower: '', // 最大购买力
            },
            monitorKeyboard: null,
            focusVal: '',
            minusVal: 0,
            degreeFlag: false,
            investmentFocusDegree: 0,
            selectFocusDegree: 0,
            currency: null,
            minInitialAmount: 0,
            basicInfo: {
                riskOverall: '',
                valuationCurrency: '',
                investMarket: '',
                investPrincipal: '',
                lockPeriod: '',
                tradeStrategy: '',
                tradeProduct: '',
                leverageRatio: '',
            },
            tagMap: tgProductTypeMap.keyValueMap,
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        opposeCurrency() {
            return this.currency ? opposeCurrencyMap[this.currency] : 'HKD'
        },
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
            return this.degreeFlag && greaterThanMinInitial && isEnoughAmount
        },
        // 限制的小数位
        limitDecimal() {
            // const map = {
            //     1: () => 3,
            //     2: () => 2,
            //     3: () => 2,
            //     4: () => 2,
            // }
            // return this.basicInfo.type ? map[this.basicInfo.type] : 2
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
        riskRatingFilter(v) {
            return RISK_RATING_MAP.keyValueMap[v] || '--'
        },
        currencyFilter(v) {
            return CURRENCY_MAP.options.findLabel(v, '--')
        },
    },
    watch: {},
    created() {
        this.getKeyboardState()
    },
    async mounted() {
        await this.getBasicInfo()
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
        //获取投资顾问组合详情
        async getBasicInfo() {
            try {
                const portfolioID = this.$route.query.investAdvisorId ?? ''
                const { result } = await getBasicInfo({
                    portfolioID: portfolioID,
                })
                console.log('investAdvisor getBasicInfo ==>', result)
                if (result) {
                    this.basicInfo = result
                    this.minInitialAmount = Number(result.minInitial ?? 0)
                    this.currency = result.minInitialCurrency ?? 'HKD'
                    this.investmentFocusDegree = result.investmentFocusDegree ?? 0
                    if (this.investmentFocusDegree === 0) {
                        this.degreeFlag = true
                    }
                    this.placeholder = thousandsFilter(keepDecimals(this.minInitial, 2)) + this.currencyName + this.$t('trade.qi')
                }
            } catch (e) {
                this.placeholder = thousandsFilter(keepDecimals(this.minInitial, 2)) + this.currencyName + this.$t('trade.qi')
                console.log('investAdvisor getBasicInfo error', e)
            }
        },

        async handleBuy() {
            if (!this.canSign) return

            // APP内部会调起交易密码校验
            // if (this.$jsBridge) {
            //     await this.$jsBridge.tradeLogin()
            // }

            this.appTradeFn()
        },

        gotoOpenAccount(orderId = '') {
            const portfolioId = this.$route.query.investAdvisorId ?? ''
            const from = this.$route.query.from ?? ''
            // 去开户页面
            const { VUE_APP_INVESTMENT_V2_OPEN_ACCOUNT_PAGE: investmentOpenAccountUrl } = pathnames
            const followId = Number(this.$route.query.portfolioId)
            const url = `${investmentOpenAccountUrl}?productId=${portfolioId}&currency=${this.currency}&amount=${this.toCalcNumber}&portfolioId=${followId}&referenceId=${orderId}&from=${from}`
            // 是否需要参数
            // this.$goPage(url)
            location.href = url
        },

        // 下单买入
        async appTradeFn() {
            try {
                const portfolioId = this.$route.query.investAdvisorId ?? ''
                const params = {
                    subAcctId: this.subAccountId,
                    portfolioId: portfolioId,
                    amount: this.toCalcNumber + '',
                    currency: this.currency,
                    investFocusDegree: this.selectFocusDegree,
                }
                this.$loading.show = true
                const { result } = await orderCreate(params)
                if (result) {
                    this.gotoOpenAccount(result.orderId + '')
                }
                // Toast.success(this.$t('follow.alreadySubmit'))
            } catch (e) {
                console.log('orderCreate===>error:', e)
                if (e?.error?.data?.tips) {
                    return Toast(e?.error?.data?.tips)
                } else if (e?.error?.code && e?.error?.code === 800001) {
                    //兼容后台，前段处理资金不足的错误
                    return Toast(e?.error?.message ?? this.$t('follow.notEnoughCashTip'))
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

        // 处理资产占比
        handleRadioChange(value) {
            // fix切换票据产品，未选投资集中度，可以认购的问题
            if (!value) {
                return false
            }
            if (this.investmentFocusDegree > 0 && value > this.investmentFocusDegree) {
                this.degreeFlag = false
            } else {
                this.degreeFlag = true
            }
            this.selectFocusDegree = value
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
        display: flex;
        align-items: center;
        width: 100%;
        padding: 16px 0;
        color: #2f2f2f;
        background: #fff;
        border-radius: 8px 8px 0 0;
    }
}

.pad-b158 {
    padding-bottom: 158px;
}

.pad-h12 {
    padding-inline: 12px;
}

.pad-v8 {
    padding-block: 8px;
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
                width: 300px;
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

.asset-ratio-card {
    background-color: #fff;
    border-radius: 8px;
}

.investment-strategy-card {
    background-color: #fff;
    border-radius: 8px;

    .grid {
        display: grid;
        grid-template-columns: 106px 1fr;
        row-gap: 16px;
    }

    .name {
        color: #666;
        font-size: 14px;
    }

    .value {
        color: #2f2f2f;
        font-size: 14px;
        line-height: 20px;
    }
}

.color-h1 {
    color: @fontBlackColor;
}

.color-h2 {
    color: #666;
}

.color-h3 {
    color: #9c9c9c;
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
    }

    .safe-padding-bottom {
        #iosBottom();
    }
}

.text-h-center {
    text-align: center;
}
</style>
