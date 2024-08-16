/** * 资金详情 * 包含现金账户、保证金账户 * 区分现金购买、PP购买 */

<template>
    <div class="capital-detail">
        <ul class="capital-list">
            <li class="capital-list-item">
                <div class="label">
                    <span>{{ $t('canUseCash') }}</span>
                    <multi-img name="icon-tips" directory="common" @click.stop="cashRemind"></multi-img>
                </div>
                <div class="value">
                    <span class="amount">{{ avaliableCash | amountFilter }}</span>
                    <span class="currency">{{ currency | currencyFilter }}</span>
                </div>
            </li>
            <!-- 支持购买力购买的产品才展示购买力 -->
            <li class="capital-list-item" v-if="isMarginType">
                <div class="label">{{ $t('capitalDetail.maxQty') }}</div>
                <div class="value">
                    <span class="amount">{{ purchasingPower | amountFilter }}</span>
                    <span class="currency">{{ currency | currencyFilter }}</span>
                </div>
            </li>
            <li v-if="showBusinessError">
                <slot name="businessError"></slot>
            </li>
            <li class="capital-list-item" v-else-if="gap > 0">
                <div class="label">
                    <span>
                        {{ $t('andNeed') }}
                    </span>
                    <multi-img name="icon-tips" directory="common" @click.stop="andNeedRemind"></multi-img>
                </div>
                <div class="value">
                    <span class="gap amount">{{ gap | amountFilter }}</span>
                    <span class="currency">{{ currency | currencyFilter }}</span>
                    <button class="operation" @click="onOperation">
                        {{ operationBtnText }}
                        <multi-img name="right_arrow_primary" directory="common"></multi-img>
                    </button>
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
import { floatToRatio, milliFormat } from '@/utils'
import pathnames from '@/config/H5Pathname'
import pageUrl from '@/config/pageUrl'

// 需要注意一个为产品可支持的认购类型，
// 一个为用户的账户类型
// TODO 支持对外展示是否有用到融资
export default {
    name: 'capital-detail',
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
        // 展示自定义报错
        showBusinessError: {
            type: Boolean,
            default: false,
        },
        // 还需提示语
        andNeedDialogMessage: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            avaliableCash: '', // 现金可用
            summaryWithdrawBalance: '', // 综合现金可用
            ecashHolding: '', // 现金宝可卖出持仓
            purchasingPower: '', // 最大购买力
            marginToastShow: false,
            cashToastShow: false,
            toRemind: true, // 是否需要进行toast提醒，跨币种|融资额度(目前只有HL APP内部可能不提醒)
            loaded: false,
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
            if (this.isMarginType) {
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
                // 现金用户会减去现金宝的资产
                insufficientAmount = NP.minus(v, NP.plus(avaliableCash, this.ecashHolding || 0))
            }
            isUsePurchasingPower = isUsePurchasingPower && insufficientAmount > 0
            this.$emit('isUsePurchasingPower', { value: isUsePurchasingPower, insufficientAmount: insufficientAmount, accountType: this.accountType })
        },
        currency: {
            async handler(v) {
                if (!v) return
                this.getAssetsDetail()
                // 支持购买力的产品才需要获取现金宝资产
                if (this.isMarginType) {
                    // 开通现金宝的用户才有必要获取
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
        async getAssetsDetail() {
            try {
                const params = { currency: this.currency }
                const { result } = await getWithDrawalBalance(params)
                this.$emit('getWithDrawalBalance', result)
                this.avaliableCash = result?.singleWithdrawBalance || 0
                this.purchasingPower = result?.purchasingPower
                this.summaryWithdrawBalance = result?.summaryWithdrawBalance ?? '--'
            } catch (error) {
                console.error('getAssetsDetail ==>', error)
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
                this.ecashHolding = result?.[`${this.currency}SellableAmount`] || ''
            } catch (error) {
                console.error(error)
            }
        },
        onOperation() {
            if (this.isCashType) {
                // 存入資金
                const { VUE_APP_EDDA_CURRENCY_APP } = pathnames
                const url = VUE_APP_EDDA_CURRENCY_APP
                this.$goPage(url)
            }
            if (this.isMarginType) {
                // 提升购买力
                const url = `${location.origin}/pages/purchasing.html#/`
                this.$goPage(url)
            }
        },
        cashRemind() {
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
                    const href = pageUrl.FAQ_ACCOUNT
                    goPage(href)
                })
        },
        andNeedRemind() {
            const message = this.andNeedDialogMessage
                ? this.andNeedDialogMessage
                : this.$t('andNeedRemindMsg', { currencPower: this.$t(this.isMarginType ? 'capitalDetail.maxQty' : 'canUseCash') })
            this.$dialog.confirm({
                title: this.$t('andNeed'),
                message: message,
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
                display: flex;
                align-items: center;
                color: @fontBlackColor;
                font-size: 14px;
                line-height: 20px;

                .amount {
                    margin-right: 4px;
                }

                .gap {
                    color: @error-white;
                }

                .operation {
                    display: flex;
                    align-items: center;
                    margin-left: 8px;
                    padding: 2px 4px 2px 6px;
                    color: @theme;
                    font-size: 11px;
                    line-height: 14px;
                    background: @tabBackground;
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
        }
    }
}
</style>
