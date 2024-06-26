<!-- 已废弃 -->
<template>
    <div class="trade-capital">
        <div class="capital">
            <p class="had">
                {{ $t('canUseCash') }}&nbsp;
                <span>{{ availableWithdrawBalance | thousandsFilter }}</span>
                <span class="currency">{{ currency | currencyFilter }}</span>
            </p>
            <p class="need" v-show="capitalGap < 0">
                {{ $t('andNeed') }}&nbsp;
                <span>{{ Math.abs(capitalGap) | thousandsFilter }}</span>
                <span class="currency">{{ currency | currencyFilter }}</span>
            </p>
        </div>
        <div class="save" v-show="isShowDepositGuide && !isLoading" @click="saveCapital">{{ $t('saveCapital') }}</div>
    </div>
</template>
<script>
import { thousandsFilter } from '@/config/filters.js'
import { getWithDrawalBalance } from '@/apis/portfolio/index.js'
import { keepDecimals } from '@/utils'
import { i18n } from '@/i18n/cashBox'
import NP from 'number-precision'
import pathnames from '@/config/H5Pathname.js'
import { getLangType } from '@/utils/tools'

const { VUE_APP_EDDA_CURRENCY_APP = '', VUE_APP_EDDA_CURRENCY_H5 = '' } = pathnames

export default {
    name: 'tradeCapital',
    filters: {
        thousandsFilter(v) {
            return thousandsFilter(keepDecimals(v, 2))
        },
        currencyFilter(v) {
            return {
                HKD: i18n.t('HKD'),
                USD: i18n.t('USD'),
                CNH: i18n.t('yuan'),
                CNY: i18n.t('yuan'),
                EUR: i18n.t('EUR'),
            }[v]
        },
    },
    props: {
        // 目标金额
        amount: {
            type: [String, Number],
            default: '',
        },
        // 币种
        currency: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            isLoading: false,
            availableWithdrawBalance: 0, // 单币种现金可用
            summaryWithdrawBalance: 0, // 账户总现金 - 包含别的币种转换后的之和
        }
    },
    computed: {
        // 资金差 = 现金可用 - 目标金额
        capitalGap() {
            return NP.minus(this.availableWithdrawBalance, this.amount)
        },
        // 校验综合可提现金是否充足
        isEnoughWithdrawalBalance() {
            // 单币种小于总资产说明当前币种不回去兑付其它币种的欠款
            // 综合账户可提现金 单币种可提现金 都 >= 金额，则不校验是否欠款
            const amount = Number(this.amount)
            if (this.availableWithdrawBalance >= amount && this.summaryWithdrawBalance >= amount) return true
            return this.availableWithdrawBalance <= this.summaryWithdrawBalance
        },
        // 可用资金不足时是否可以展示“引导入金”按钮
        isShowDepositGuide() {
            return this.capitalGap < 0 || this.availableWithdrawBalance <= 0
        },
    },
    watch: {
        currency: {
            handler(v) {
                if (v) {
                    this.getAssetsDetail()
                }
            },
            immediate: true,
        },
    },
    methods: {
        // 资产信息
        async getAssetsDetail() {
            try {
                this.isLoading = this.$loading.show = true
                // 请求前先重置资产
                this.availableWithdrawBalance = 0
                this.summaryWithdrawBalance = 0
                const { result = {} } = await getWithDrawalBalance({ currency: this.currency })
                console.log('getWithDrawalBalance===:', result)
                this.summaryWithdrawBalance = Number(result?.summaryWithdrawBalance || 0)
                this.availableWithdrawBalance = Number(result?.singleWithdrawBalance || 0)
                console.warn('isEnoughWithdrawalBalance', this.isEnoughWithdrawalBalance)
            } catch (e) {
                console.log('getWithDrawalBalance===>error:', e)
            } finally {
                this.isLoading = this.$loading.show = false
            }
        },
        // 存入资金
        saveCapital() {
            const url = this.$jsBridge ? VUE_APP_EDDA_CURRENCY_APP : VUE_APP_EDDA_CURRENCY_H5

            this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : window.open(url)
        },
    },
}
</script>
<style scoped lang="less">
.trade-capital {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-radius: 8px;

    .capital {
        display: flex;
        flex-direction: column;
        padding-right: 12px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;

        .had {
            flex: 1;

            span {
                color: #2f2f2f;
            }
        }

        .need {
            padding-top: 8px;

            span {
                color: #f31414;
            }
        }

        .currency {
            color: #2f2f2f !important;
        }
    }

    .save {
        flex: 0 0 auto;
        min-width: 80px;
        padding: 4px 12px;
        color: #fff;
        font-weight: 700;
        font-size: 14px;
        line-height: 20px;
        text-align: center;
        background: #ff6907;
        border-radius: 31px;
        user-select: none;
    }
}
</style>
