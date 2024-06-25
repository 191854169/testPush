/** * 资金详情 * 包含现金账户、保证金账户 * 区分现金购买、PP购买 */

<template>
    <div class="capital-detail">
        <ul class="capital-list">
            <li class="capital-list-item">
                <div class="label">
                    <span>{{ getCashTitle() }}</span>
                    <multi-img name="icon-tips" directory="common" @click.stop="cashRemind"></multi-img>
                </div>
                <div class="value">
                    <span class="amount">{{ avaliableCash | amountFilter }}</span>
                    <span class="currency">{{ currency | currencyFilter }}</span>
                    <div class="oppose-value" v-if="mixMarket">
                        <span class="oppose-value__amount">{{ opposeAvaliableCash | amountFilter }}</span>
                        <span class="oppose-value__currency">{{ opposeCurrency | currencyFilter }}</span>
                    </div>
                </div>
            </li>
            <!-- 支持购买力购买的产品才展示购买力 -->
            <li class="capital-list-item" v-if="isMarginType">
                <div class="label">{{ $t('capitalDetail.maxQty') }}</div>
                <div class="value">
                    <span class="amount">{{ purchasingPower | amountFilter }}</span>
                    <span class="currency">{{ currency | currencyFilter }}</span>
                    <div class="oppose-value purchasing-power" v-if="mixMarket">
                        <span class="oppose-value__amount">≈{{ opposePurchasingPower | amountFilter }}</span>
                        <span class="oppose-value__currency">{{ opposeCurrency | currencyFilter }}</span>
                    </div>
                </div>
            </li>
            <li class="capital-list-item" v-show="gap > 0">
                <div class="label">
                    <span>
                        {{ $t('andNeed') }}
                    </span>
                    <!-- <multi-img name="icon-tips" directory="common" @click.stop="andNeedRemind"></multi-img> -->
                    <button class="operation" @click="onOperation">
                        {{ operationBtnText }}
                        <multi-img name="right_arrow_primary" directory="common"></multi-img>
                    </button>
                </div>
                <div class="value">
                    <span class="gap amount">{{ gap | amountFilter }}</span>
                    <span class="currency">{{ currency | currencyFilter }}</span>
                    <div class="oppose-value gap-amount" v-if="mixMarket">
                        <span class="oppose-value__amount">≈{{ opposeGap | amountFilter }}</span>
                        <span class="oppose-value__currency">{{ opposeCurrency | currencyFilter }}</span>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { getWithDrawalBalance } from '@/apis/portfolio'
import { holdingsTradeable, ecashUserStatus } from '@/apis/wealth'
import { accountTypeMap, currencyMap, PRODUCT_BUY_TYPE } from '@/config/common'
import goPage from '@/config/globalProterties/goPage'
import NP from 'number-precision'
import { mapState } from 'vuex'
import { floatToRatio, keepDecimals, milliFormat } from '@/utils'
import { getRunEnv } from '@/utils/env'
import pathnames from '@/config/H5Pathname'
import { opposeCurrencyMap, sourcePageMap } from '../../config/common'

// 需要注意一个为产品可支持的认购类型，
// 一个为用户的账户类型
// TODO 支持对外展示是否有用到融资
export default {
    name: 'capital-detail-follow',
    props: {
        productBuyType: {
            type: Number,
            default: PRODUCT_BUY_TYPE.keysMap.cash,
        },
        // // 账户类型
        // accountType: {
        //     type: [String, Number],
        // },
        // 货币类型
        currency: {
            type: String,
            required: true,
        },
        // 交易金额
        tradeAmount: {
            type: [Number, String],
            required: true,
        },
        // 是否为混合市场
        mixMarket: {
            type: Boolean,
            required: true,
            default: false,
        },
        exchangeRateList: {
            type: Array,
            default: () => [],
            required: false,
        },
        currentRate: {
            type: [Number, String],
            required: false,
        },
        sourcePage: {
            type: String,
            required: false,
            default: () => {
                return sourcePageMap.default
            },
        },
        singleSumMin: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            avaliableCash: '', // 现金可用
            summaryWithdrawBalance: '', // 综合现金可用
            ecashHolding: '', // 星财宝可卖出持仓
            ecashHoldingResult: '', // 星财宝可卖出持仓接口返回
            purchasingPower: '', // 最大购买力
            opposeAvaliableCash: '', // 其它币种现金可用
            opposeSummaryWithdrawBalance: '', // 其它币种综合现金可用
            opposePurchasingPower: '', // 其它币种最大购买力
            marginToastShow: false,
            cashToastShow: false,
            toRemind: true, // 是否需要进行toast提醒，跨币种|融资额度(目前只有HL APP内部可能不提醒)
            loaded: false,
            // 本地缓存资金状况，如需重复调用需要重新刷新页面
            withdrawBalanceMap: {
                HKD: null,
                USD: null,
            },
            // 用于本地存储 换算出来的 最大购买力信息
            purchasingPowerMap: {
                HKD: '',
                USD: '',
                CNH: '',
            },
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
        isCashType() {
            return this.productBuyType == PRODUCT_BUY_TYPE.keysMap.cash
        },
        isMarginType() {
            return this.productBuyType == PRODUCT_BUY_TYPE.keysMap.purchasingPower
        },
        // 现金购买方式：this.tradeAmount - this.avaliableCash
        // 购买力购买方式: this.tradeAmount - this.purchasingPower
        gap() {
            // 会不会采用"购买力值"来进行比较
            let ret = 0
            if (!this.loaded) return 0
            if (!this.tradeAmount) return 0
            if (this.isCashType) {
                ret = NP.minus(this.tradeAmount, this.avaliableCash)
            }
            if (this.isMarginType) {
                // 是不是要判断购买力大于可提现金
                ret = NP.minus(this.tradeAmount, this.purchasingPower)
            }
            return ret
        },
        operationBtnText() {
            let text = this.$t('saveCapital')
            if (this.isMarginType || this.sourcePage === sourcePageMap.upgradeInvestService) {
                text = this.$t('capitalDetail.promote')
            }
            return text
        },

        // 校验综合可提现金是否充足
        isEnoughWithdrawalBalance() {
            // 单币种小于总资产说明当前币种不回去兑付其它币种的欠款
            // 综合账户可提现金 单币种可提现金 都 >= 金额，则不校验是否欠款
            const amount = Number(this.tradeAmount)
            // 综合可提为负的情况 必定不充足
            if (this.summaryWithdrawBalance < 0) return false
            if (this.avaliableCash >= amount && this.summaryWithdrawBalance >= amount) return true
            return NP.minus(this.avaliableCash, this.summaryWithdrawBalance) <= 0
        },

        opposeCurrency() {
            return opposeCurrencyMap[this.currency]
        },
        // 转换币种的汇率
        opposeCurrencyExchangeRate() {
            const ret = this.exchangeRateList.find(i => i.fromCurrency === this.currency && i.toCurrency === this.opposeCurrency) || {}
            console.log(`Feng.chen:: 09:46:40 ret ===> `, ret)
            return ret.rate || this.currentRate || 1
        },

        opposeGap() {
            const rate = this.opposeCurrencyExchangeRate || this.currentRate || 1
            return NP.times(this.gap, rate)
        },
    },
    filters: {
        currencyFilter(v) {
            return currencyMap.keyValueMap[v] || ''
        },
        amountFilter(v) {
            v = v || 0
            let ret = floatToRatio(v, { rate: false, base: 2, sign: false })
            ret = milliFormat(ret)
            return ret
        },
    },
    watch: {
        gap(v) {
            this.$emit('input', v)
            // 是否展示币种不足提醒 - 采用PP购买，且购买力不足
            const showWithdrawalBalanceTip = this.isMarginType && v > 0 && NP.minus(this.avaliableCash, this.summaryWithdrawBalance) > 0
            this.$emit('showWithdrawalBalanceTip', showWithdrawalBalanceTip)
        },
        // 监听交易金额
        tradeAmount(v) {
            const avaliableCash = this.avaliableCash > 0 ? this.avaliableCash : 0
            let insufficientAmount = NP.minus(v, avaliableCash)
            // 保证金账户 是否用到购买力
            const isUsemargin = this.isMarginAccount && this.isMarginType && insufficientAmount > 0
            this.$emit('isUsemargin', isUsemargin)
            // 触发用户使用的"下单方式"
            const buyType = this.isMarginType && insufficientAmount > 0 ? PRODUCT_BUY_TYPE.keysMap.purchasingPower : PRODUCT_BUY_TYPE.keysMap.cash
            this.$emit('buyType', buyType)
            // 是否用到购买力
            let isUsePurchasingPower = this.isMarginType
            if (this.isCashAccount) {
                // 现金用户会减去星财宝的资产
                insufficientAmount = NP.minus(v, NP.plus(avaliableCash, this.ecashHolding || 0))
            }
            isUsePurchasingPower = isUsePurchasingPower && insufficientAmount > 0
            this.$emit('isUsePurchasingPower', { value: isUsePurchasingPower, insufficientAmount: insufficientAmount, accountType: this.accountType })
        },
        currency: {
            async handler(v) {
                if (!v) return
                this.getAssetsDetail()
                this.getOpposeAssetsDetail()
                // 支持购买力的产品才需要获取星财宝资产
                if (this.isMarginType) {
                    // 开通星财宝的用户才有必要获取
                    if (await this.getEcashUserStatus()) {
                        this.getEcashHolding()
                    }
                }
            },
            immediate: true,
        },
    },
    created() {},
    methods: {
        getCashTitle() {
            if (this.sourcePage === sourcePageMap.upgradeInvestService) {
                return this.$t('portfolioFollow.transferAmount')
            }
            return this.$t('canUseCash')
        },
        async getAssetsDetail(currency) {
            try {
                let result = null
                const curCurrency = currency || this.currency
                if (!(result = this.withdrawBalanceMap[curCurrency])) {
                    const params = { currency: curCurrency }
                    const data = await getWithDrawalBalance(params)
                    result = data.result
                    this.withdrawBalanceMap[curCurrency] = result
                }

                if (this.singleSumMin) {
                    //取单币种可提  和 单币种综合可提 中最小的
                    this.avaliableCash = Math.max(
                        Math.min(Number(result?.singleWithdrawBalance ?? '0'), Number(result?.summaryWithdrawBalance ?? '0')),
                        0
                    )
                } else {
                    this.avaliableCash = result?.singleWithdrawBalance || 0
                }
                const curValue = this.purchasingPowerMap[curCurrency]
                if (curValue) {
                    this.purchasingPower = curValue
                } else {
                    this.purchasingPower = result?.purchasingPower
                    this.purchasingPowerMap[curCurrency] = this.purchasingPower
                }
                this.summaryWithdrawBalance = result?.summaryWithdrawBalance ?? '--'
                // 手动修改最大购买力字段 - 因为后端的最大购买力计算结果跟前端不一致！
                result.purchasingPower = this.purchasingPower
                // 触发资产获取成功事件
                this.$emit('getWithDrawalBalance', result)

                // 最大購買力采用本地换算
                const opposeValue = this.purchasingPowerMap[this.opposeCurrency]
                if (opposeValue) {
                    this.opposePurchasingPower = opposeValue
                } else {
                    this.opposePurchasingPower = keepDecimals(NP.times(this.purchasingPower, this.opposeCurrencyExchangeRate), 2)
                    this.purchasingPowerMap[this.opposeCurrency] = this.opposePurchasingPower
                }
            } catch (error) {
                console.error('getAssetsDetail ==>', error)
                this.avaliableCash = ''
                this.purchasingPower = ''
                this.summaryWithdrawBalance = ''
                this.opposePurchasingPower = ''
            } finally {
                this.loaded = true
            }
        },

        async getOpposeAssetsDetail() {
            try {
                const curCurrency = opposeCurrencyMap[this.currency]
                let result = null
                if (curCurrency && !(result = this.withdrawBalanceMap[curCurrency])) {
                    const params = { currency: curCurrency }
                    const data = await getWithDrawalBalance(params)
                    result = data.result
                    this.withdrawBalanceMap[curCurrency] = result
                }
                this.opposeAvaliableCash = result?.singleWithdrawBalance || 0
                this.opposeSummaryWithdrawBalance = result?.summaryWithdrawBalance ?? '--'
            } catch (error) {
                console.error('getAssetsDetail ==>', error)
                this.opposeAvaliableCash = ''
                this.opposeSummaryWithdrawBalance = ''
            } finally {
                this.loaded = true
            }
        },

        async getEcashUserStatus() {
            try {
                // 开通状态 0-未开通，1-已开通
                const ECASH_OPEND = 1
                const { result } = await ecashUserStatus()
                return result.openStatus === ECASH_OPEND
            } catch (e) {
                console.error(e)
                return false
            }
        },

        async getEcashHolding() {
            try {
                const { result } = await holdingsTradeable()
                this.ecashHoldingResult = result
                this.ecashHolding = result?.[`${this.currency}SellableAmount`] || ''
            } catch (error) {
                console.error(error)
            }
        },
        onOperation() {
            const isPurchasing = this.isMarginType || this.sourcePage === sourcePageMap.upgradeInvestService
            if (this.isCashType && !isPurchasing) {
                // 存入資金
                const { VUE_APP_EDDA_CURRENCY_APP, VUE_APP_EDDA_CURRENCY_H5 } = pathnames
                const isInWtOrThs = getRunEnv() === 2
                const url = isInWtOrThs ? VUE_APP_EDDA_CURRENCY_H5 : VUE_APP_EDDA_CURRENCY_APP
                this.$goPage(url)
            }
            if (isPurchasing) {
                // 提升购买力
                const url = `${location.origin}/pages/purchasing.html#/`
                this.$goPage(url)
            }
        },
        cashRemind() {
            if (this.sourcePage === sourcePageMap.upgradeInvestService) {
                this.$dialog.confirm({
                    title: this.getCashTitle(),
                    message: this.$t('portfolioFollow.transferAmountMsg'),
                    showCancelButton: false,
                    confirmButtonText: this.$t('iKnow'),
                    messageAlign: 'center',
                })
                return
            }
            this.$dialog
                .confirm({
                    title: this.$t('canUseCash'),
                    message: this.$t('capitalDetail.canUseCashDesc'),
                    cancelButtonText: this.$t('cancel'),
                    confirmButtonText: this.$t('capitalDetail.learnMore'),
                    messageAlign: 'center',
                })
                .then(() => {
                    // 帮助中心文章
                    const href = 'https://h5.fotechwealth.com/faq/#/article/490702228690304000/1'
                    goPage(href)
                })
        },
        andNeedRemind() {
            this.$dialog.confirm({
                title: this.$t('andNeed'),
                message: this.$t('andNeedRemindMsg', { currencPower: this.$t(this.isMarginType ? 'capitalDetail.maxQty' : 'canUseCash') }),
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                messageAlign: 'center',
            })
        },
        /**
         * 是否能进入下一步
         * @returns {Boolean} false - 能 true 能
         */
        check() {
            if (this.isCashType) {
                if (!this.isEnoughWithdrawalBalance) {
                    this.$toast(this.$t('tradeFailedForDebt'), { duration: 2000 })
                    return false
                }
            }
            return true
        },

        // 获取是否展示自动开通引导
        // 现金账户 购买力产品 未开通自动换汇
        async getAutoExchangeGuideStatus() {
            try {
                // 是否用到购买力
                let isUsePurchasingPower = this.isMarginType
                const avaliableCash = this.avaliableCash > 0 ? this.avaliableCash : 0
                let insufficientAmount = NP.minus(this.tradeAmount, avaliableCash)
                if (this.isCashAccount) {
                    insufficientAmount = NP.minus(this.tradeAmount, NP.plus(avaliableCash, this.ecashHolding || 0))
                }
                isUsePurchasingPower = isUsePurchasingPower && insufficientAmount > 0

                const isCash = this.isCashAccount
                const isMargin = this.isMarginType
                return isUsePurchasingPower && isCash && isMargin
            } catch (e) {
                console.error(e)
                return false
            }
        },

        clearWithdrawBalance() {
            this.withdrawBalanceMap = {}
        },
    },
}
</script>

<style scoped lang="less">
.capital-detail {
    margin: 12px 0;
    background: #fff;
    border-radius: 8px;

    .capital-list {
        overflow: hidden;

        &-item {
            display: flex;
            justify-content: space-between;
            margin: 16px 12px;

            .label {
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                align-self: flex-start;
                color: @fontGreyColor;
                font-size: 14px;
                line-height: 20px;

                img {
                    width: 14px;
                    height: 14px;
                    margin-left: 5px;
                }

                .operation {
                    display: flex;
                    align-items: center;
                    margin-left: 8px;
                    padding: 2px 4px 2px 6px;
                    color: @theme;
                    font-size: 11px;
                    line-height: 14px;
                    background: rgba(255, 105, 7, 0.1);
                    border: none;
                    border-radius: 28px;
                    outline: none;

                    img {
                        width: 8px;
                        height: 8px;
                        margin-left: 2px;
                    }
                }
            }

            .value {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: flex-end;
                color: @fontBlackColor;
                font-size: 14px;
                line-height: 20px;

                .amount {
                    margin-right: 4px;
                }

                .oppose-value {
                    flex: 1 0 100%;
                    text-align: right;

                    &.purchasing-power {
                        color: @fontLightColor;
                        font-weight: 400;
                        font-size: 10px;
                        line-height: 14px;
                    }

                    &__amount {
                        margin-right: 4px;
                    }

                    &.gap-amount {
                        font-weight: 400;
                        font-size: 10px;
                        line-height: 14px;

                        .oppose-value__amount {
                            color: @error-white;
                        }
                    }
                }

                .gap {
                    color: @error-white;
                }
            }
        }
    }
}
</style>
