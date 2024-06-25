<template>
    <div class="product-list-card bg-white border-radius-8px mar-lr12 overflow-hidden" :class="{ 'is-fund': !isStock }">
        <div class="h-38 mar-lr12 flex-s f14 mar-t8" :class="{ 'border-bottom-1px': data.showAllFlag }" @click="handleToggle(data)">
            <div class="h2-white category-name bold">
                <span>{{ categoryName }}</span>
            </div>
            <div class="c-main">
                <multi-img name="down" directory="common" width="16" :class="{ 'icon-arrow': data.showAllFlag }"></multi-img>
            </div>
        </div>
        <div v-show="data.showAllFlag">
            <div class="table-header f12 c-gray flex-c">
                <div class="item">{{ $t('follow.nameCode') }}</div>
                <div class="item">{{ isStock ? $t('count') : $t('follow.holdRate') }}</div>
                <div class="item">
                    {{ isStock ? `${$t('follow.price')}(${currencyName || ''})` : `${$t('trade.applyAmount')}(${currencyName || ''})` }}
                </div>
            </div>
            <div class="pad-l12">
                <div
                    class="table-body flex-c"
                    v-for="(item, index) in data.holdings"
                    :class="{ 'border-bottom-1px': index !== data.holdings.length - 1 }"
                    :key="index"
                >
                    <div class="item flex-c">
                        <div class="mar-r12 w-16">
                            <van-checkbox
                                class="outter-checkbox"
                                icon-size="16"
                                checked-color="#2F2F2F"
                                v-model="data.holdings[index]['checked']"
                                @click="handleCheckboxChange(index, data.holdings)"
                            >
                                <template v-slot:icon="{ checked }">
                                    <multi-img
                                        :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                        directory="fund"
                                        width="16"
                                    ></multi-img>
                                </template>
                            </van-checkbox>
                        </div>
                        <div class="">
                            <div class="w-132 elipsis">{{ item.name }}</div>
                            <div class="flex-c mar-t4">
                                <!-- 股票是市场 -->
                                <span :class="[`market-${item.market.toLocaleUpperCase()}`]" v-if="isStock"></span>
                                <!-- 基金是币种 -->
                                <span :class="[`currency-${dataCurrency}`]" v-else></span>
                                <span class="c-gray f12 mar-14">{{ item.productCode }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="item">
                        <amount-input
                            ref="stockCountRef"
                            v-if="isStock"
                            v-model="data.holdings[index]['lotNum']"
                            label=""
                            maxlength="9"
                            :limitDecimal="0"
                            class="item-field f12"
                            @input="() => handleItemInput(index, $refs.stockCountRef[index].input, data.holdings)"
                            @blur="handleItemBlur($event, item)"
                        ></amount-input>
                        <span v-else class="f12">{{ item.ratio }}%</span>
                    </div>
                    <div class="item">
                        <van-popover
                            ref="amountInputRef"
                            v-model="data.holdings[index]['popover']"
                            trigger=""
                            placement="top-end"
                            get-container="#order"
                        >
                            <template #reference>
                                <amount-input
                                    ref="stockAmountRef"
                                    v-if="isStock"
                                    v-model="data.holdings[index]['latestPrice']"
                                    type="number"
                                    label=""
                                    maxlength="9"
                                    :limitDecimal="getStockLimitDecimal(index, data.holdings)"
                                    class="item-field f12"
                                    @blur="e => onStockBlur(e, index, data.holdings)"
                                    @focus="() => onStockInputFocus(index, data.holdings)"
                                    @input="() => handleItemInput(index, $refs.stockAmountRef[index].input, data.holdings)"
                                ></amount-input>
                                <span v-else class="fund-field">
                                    <!-- 基金的买入金额放在lotNum属性上面 -->
                                    <span
                                        v-riseFall="{ value: data.holdings[index]['lotNum'], riseFall: false, base: 2, rate: false, sign: false }"
                                    ></span>
                                </span>
                            </template>
                            <div class="f11 c-theme popover-tips">{{ data.holdings[index].popoverMsg }}</div>
                        </van-popover>
                    </div>
                </div>
            </div>
            <!-- 总览 -->
            <div class="summary border-top-1px">
                <div class="summary-amount flex-s">
                    <div class="label">{{ categoryName }}{{ $t('trade.ddje') }}</div>
                    <div class="value">
                        <p class="cur-currency">{{ data.selectedAmount | amountFilter }} {{ currencyName }}</p>
                        <p class="oppose-currency" v-if="opposeCurrencyName">
                            ≈{{ data.exchangeSelectedAmount | amountFilter }} {{ opposeCurrencyName }}
                        </p>
                    </div>
                </div>
                <div class="summary-count" v-html="summaryCountHtml"></div>
            </div>
        </div>
    </div>
</template>

<script>
import { CURRENCY_MAP } from '@/config/common'
import { toFixed } from '@/utils'
import NP from 'number-precision'
import { thousandsFilter, amountFormatter } from '@/config/filters'
import AmountInput from '@/components/AmountInput.vue'
import { cloneDeep } from 'lodash'
import { FUND_TYPE_MAP } from '../../config/common'

const opposeCurrencyMap = {
    HKD: 'USD',
    USD: 'HKD',
}
export default {
    name: 'product-list-card',
    components: { AmountInput },
    props: {
        origin: {
            type: Object,
            required: true,
        },
        isStock: {
            type: Boolean,
            required: true,
        },
        // 外层货币类型
        currency: {
            type: String,
            required: true,
        },
        exchangeRateList: {
            type: Array,
            default: () => [],
            required: true,
        },
    },
    data() {
        return {
            data: null,
        }
    },
    filters: {
        amountFilter(v) {
            return amountFormatter(v, { base: 2 })
        },
    },
    computed: {
        // 当前产品货币类型
        dataCurrency() {
            return this.data.holdings[0].currency
        },
        currencyName() {
            const currency = this.dataCurrency
            return CURRENCY_MAP.keyValueMap[currency]
        },
        opposeCurrency() {
            if (this.currency === this.dataCurrency) return this.dataCurrency
            return opposeCurrencyMap[this.dataCurrency]
        },
        opposeCurrencyName() {
            if (this.currency !== this.dataCurrency) {
                const c = opposeCurrencyMap[this.dataCurrency]
                return CURRENCY_MAP.keyValueMap[c]
            }
            return ''
        },
        market() {
            return this.data.holdings[0].market
        },
        isHKStock() {
            return this.market === 'hk'
        },
        isUSStock() {
            return this.market === 'us'
        },
        // 股票类型 港股 美股
        // 基金类型 "1"：股票型， "2"：债券型， "3"：混合型， "4"：货币型，"5"：股权型
        categoryName() {
            if (!this.isStock) {
                // 基金类型
                return `${FUND_TYPE_MAP.keyValueMap[this.data.marketType]}${this.$t('follow.fundName')}` || ''
            }
            return this.isHKStock ? this.$t('HKDMarket') : this.isUSStock ? this.$t('USDMarket') : ''
        },
        // 转换币种的汇率
        opposeCurrencyExchangeRate() {
            if (this.dataCurrency === this.currency) return 1
            const ret = this.exchangeRateList.find(i => i.fromCurrency === this.dataCurrency && i.toCurrency === this.opposeCurrency) || {}
            console.log(`Feng.chen:: 09:46:40 ret ===> `, ret)
            return ret.rate || 1
        },

        marketName() {
            if (this.isStock) {
                return { 1: this.$t('stocksHKD'), 2: this.$t('stocksUSD') }[this.data.marketType]
            }
            return this.$t('follow.fundName')
        },

        summaryCountHtml() {
            const orderType = this.isHKStock ? `(${this.$t('follow.limitOrder1')})` : this.isUSStock ? `(${this.$t('follow.limitOrder2')})` : ''
            const html = this.$t('follow.totalPurchaseCount', { count: this.data.selected.length, marketName: this.marketName })
            if (this.isStock) {
                return `${html} ${orderType}`
            }
            return html
        },
    },
    watch: {
        'data.selected': {
            handler(data) {
                console.log('on-change ===>', data)
                this.$emit('on-change', {
                    marketType: this.data.marketType,
                    selected: data,
                    currency: this.dataCurrency,
                    selectedAmount: this.data.selectedAmount,
                    exchangeSelectedAmount: this.data.exchangeSelectedAmount,
                })
            },
        },
        currency: {
            handler() {
                this.filterSelectedProduct(true)
                this.$emit('on-refresh', {
                    marketType: this.data.marketType,
                    selected: this.data.selected,
                    currency: this.dataCurrency,
                    selectedAmount: this.data.selectedAmount,
                    exchangeSelectedAmount: this.data.exchangeSelectedAmount,
                })
            },
        },
    },
    created() {
        this.data = cloneDeep(this.origin)
    },
    methods: {
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

        handleToggle(data) {
            data.showAllFlag = !data.showAllFlag
        },
        // 基金 - 处理勾选事件
        handleCheckboxChange(index, list) {
            if (this.isStock) {
                const item = list[index]
                if (item.lotNum == 0) {
                    this.$toast(this.$t('follow.emptyLotNumTip'))
                    item.checked = false
                    return
                }
                this.filterSelectedProduct()
                return this.handleItemInput(undefined, undefined, list)
            }
            this.filterSelectedProduct()
        },

        filterSelectedProduct(refreshAmount = false) {
            if (!refreshAmount) {
                const selectedList = this.data.holdings.filter(i => i.checked)
                this.data.selected = selectedList
                this.data.selectedAmount = selectedList.reduce((a, c) => {
                    if (this.isStock) {
                        a = NP.plus(a, NP.times(c.lotNum, c.latestPrice))
                    } else {
                        a = NP.plus(a, c.lotNum)
                    }
                    return a
                }, 0)
            }
            this.data.selectedAmount = toFixed(this.data.selectedAmount, 2)
            // 汇率换算后的金额
            const exchangeSelectedAmount = NP.times(this.data.selectedAmount, this.opposeCurrencyExchangeRate)
            // 直接舍去2位小数以后位数
            this.data.exchangeSelectedAmount = toFixed(exchangeSelectedAmount, 2)
        },

        // 实时获取对应的小数位
        getStockLimitDecimal(index, list) {
            const ret = list[index].latestPrice

            let len = 2
            if (this.isUSStock) {
                len = NP.minus(ret, 1) >= 0 ? 2 : 4
            }
            if (this.isHKStock) {
                len = 3
            }
            return len
        },

        handleItemBlur(e, item) {
            if (item.lotNum < item.minTradeUnit) {
                item.lotNum = item.minTradeUnit
            }
        },

        handleItemInput(index, input, list) {
            console.log(`Feng.chen:: 20:12:44 handleItemInput ===> `, index)
            this.amountDisplay = ''
            if (this.isStock) {
                list.filter((item, idx) => {
                    idx === index && item.isFocus && Object.assign(item, this.getPopover(item))
                    if (item.popover) {
                        this.$nextTick(() => {
                            const inputRef = this.$refs.amountInputRef[idx]
                            inputRef?.updateLocation()
                        })
                    }
                    return item.checked
                })
            } else {
                list.filter(item => item.checked)
            }
            if (this.amountDisplay) {
                this.number = toFixed(Number(this.amountDisplay), 2)
                this.amountDisplay = thousandsFilter(this.number)
            } else {
                this.number = ''
                this.amountDisplay = ''
            }

            input && this.checkInputLengthToChangeFontSize(input)
            this.filterSelectedProduct()
        },

        onStockBlur(e, index, list) {
            let ret = list[index].latestPrice
            const len = this.getStockLimitDecimal(index, list)
            // eslint-disable-next-line prefer-const
            let [intNumber, demc = ''] = (ret + '').split('.')
            demc = demc.length >= len ? demc.slice(0, len) : demc.padEnd(len, '0')
            ret = `${intNumber}.${demc}`
            list[index].latestPrice = ret

            list[index].isFocus = false
        },

        checkInputLengthToChangeFontSize(input) {
            this.$nextTick(() => {
                const value = (input || '').value
                const edgeLength = 10
                input.style.fontSize = value.length >= edgeLength ? '0.1rem' : '0.12rem'
            })
        },

        onStockInputFocus(index, list) {
            list[index].isFocus = true
        },

        getPopover(data) {
            const UP_BASE_PERCENT = 0.02 // 评判百分比
            const DOWN_BASE_PERCENT = -0.02 // 评判百分比
            const res = NP.minus(data.latestPrice, data.initialPrice)
            let percent = NP.divide(res, data.initialPrice)
            percent = percent > 1 ? 1 : percent < -1 ? -1 : percent
            const toFixedPercent = toFixed(Math.abs(NP.times(percent, 100)), 2)
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
    },
}
</script>

<style scoped lang="less">
.product-list-card {
    margin: 12px;

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

    &.pad-b158 {
        padding-bottom: 158px;
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

    .table-header,
    .table-body {
        height: 28px;
        padding: 0 0 0 38px;

        .item {
            width: 72px;
            margin-right: 12px;
            text-align: right;

            &:first-child {
                width: 138px;
                text-align: left;
            }
        }

        .item-field {
            width: 72px;
            height: 28px;
            padding: 2px 6px;
            background: #f7f7f7;
            border-radius: 2px;

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

    .table-header {
        margin-top: 12px;
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

    &.is-fund {
        &.pad-b158 {
            padding-bottom: 185px;
        }

        .table-header,
        .table-body {
            .item {
                &:nth-of-type(1) {
                    width: 138px;
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
        padding-bottom: 14px;
        background: #fff;
        border-radius: 8px;

        .autoBuy {
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
            height: 64px;
            overflow: hidden;
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

            &.hasWrong {
                &::after {
                    background: #f31414;
                }
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
                    font-size: 16px;
                    line-height: 28px;

                    &.focus-large {
                        font-size: 32px;
                        line-height: 44px;
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

    .summary {
        margin: 0 12px;
        padding: 12px 0 16px;

        &-amount {
            .label,
            .value {
                color: @fontBlackColor;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }

            .value {
                position: relative;
                font-weight: 700;

                .oppose-currency {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    left: -100%;
                    margin-top: 4px;
                    color: @fontLightColor;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: right;
                }
            }
        }

        &-count {
            margin-top: 4px;
            color: @fontLightColor;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;

            ::v-deep(.summary-count__value) {
                color: @theme;
            }
        }
    }
}
</style>
