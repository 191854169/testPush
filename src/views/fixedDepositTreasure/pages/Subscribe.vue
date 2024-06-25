// 认购页
<template>
    <div class="subscribe">
        <div class="name_info card_radius" @click="gotoDetails">
            <div class="name line-elipsis_l2">{{ info.productName }}</div>
            <div class="flex-c">
                <span class="currency" :class="`currency-${info.currency}`"></span>
                <span class="symble">{{ info.productCode }}</span>
            </div>
            <multi-img class="arrow" name="icon-right-arrow" directory="common" />
        </div>

        <div class="card_radius mar-t12">
            <div v-for="(item, index) in productInfoList" :key="index">
                <div class="product_info flex-s" :class="{ 'border-bottom-1px': index != productInfoList.length - 1 }">
                    <div class="title">{{ item.title }}</div>
                    <div class="value flex-c" v-if="index == 2">
                        <dynamic-font class="resize" :value="interestDue" :options="{ maxFontSize: 14, minFontSize: 12 }"></dynamic-font>
                        <span class="flex0">{{ info.currency | currencyFilter }}</span>
                    </div>
                    <div v-else class="value" :style="item.style || {}">{{ item.value }}</div>
                </div>
            </div>
        </div>

        <SubscribeInput
            class="amount_info card_radius mar-t12"
            v-model="inputValue"
            :info="info"
            :placeholder="placeholder"
            @triggerAllIn="triggerAllIn"
        >
            存入金额
        </SubscribeInput>

        <capital-detail
            v-if="!isEmpty(info.currency)"
            ref="capitalRef"
            :trade-amount="inputValue"
            :currency="info.currency"
            :show-business-error="showCashError"
            @getWithDrawalBalance="v => (power = v)"
        >
            <template v-slot:businessError>
                <div class="cash_short">
                    <div class="title-container border-top-1px pad-t12">
                        <span class="text-red">{{ $t('subscribe.lackOfCash') }}</span>
                        <span class="text-normal">，{{ $t('subscribe.optionalMode') }}</span>
                    </div>

                    <div class="btn-cantainer">
                        <button class="operation" @click="onOperation">
                            {{ $t('saveCapital') }}
                            <multi-img class="arrow" name="icon-right-arrow-black" directory="common" />
                        </button>
                        <button class="operation" @click="gocurrencyExchange">
                            {{ $t('currencyExchange') }}
                            <multi-img class="arrow" name="icon-right-arrow-black" directory="common" />
                        </button>
                    </div>
                </div>
            </template>
        </capital-detail>

        <div class="coupon-module-wrapper" @click="gotoFtdCouponListsPage">
            <div class="coupon-left">
                <multi-img class="coupon-img" name="addition_coupon" directory="common" />
                <span class="coupon-text">
                    {{ $t('coupon.youhuiquan') }}
                </span>
            </div>
            <div class="coupon-right">
                <span v-if="all.length && !inputValue" class="has-coupon-list-tip">{{ $t('coupon.srjeckkyyhq') }}</span>
                <span v-if="!canUseCoupons.length" class="no-use-list">{{ $t('coupon.zanwukeyong') }}</span>
                <span v-if="canUseCoupons.length && !additionAmount" class="has-use-list">
                    {{ canUseCoupons.length }}{{ $t('coupon.zhangkeyong') }}
                </span>
                <span v-if="canUseCoupons.length && additionAmount" class="has-addition-amount">
                    <span class="const-text">{{ $t('coupon.yujiewaijiaxi') }}</span>
                    +{{ additionAmountFormat }} {{ info.currency | currencyFilter }}
                </span>
                <multi-img class="arrow" name="icon-right-arrow" directory="common" />
            </div>
        </div>

        <div class="fixed" v-if="!showAndroidKeyboard">
            <button class="tradeButton" :class="{ dislabed: !tradeEnable }" @click="tradeClick">{{ $t('subscribeText') }}</button>
        </div>
        <SubscribeConfimDialog v-model="showConfimDialog" :list="confirmInfo" @confirm="tradeAction"></SubscribeConfimDialog>
        <AdditionCouponDialog v-model="showCouponDialog" @confirm="gotoFtdCouponListsPage" @cancel="handleCouponDialogCancel"></AdditionCouponDialog>
    </div>
</template>

<script>
import DynamicFont from '@/components/FosunDynamicFont.vue'
import capitalDetail from '../components/capitalDetail.vue'
import SubscribeInput from '../components/SubscribeInput.vue'
import SubscribeConfimDialog from '../components/SubscribeConfimDialog.vue'
import AdditionCouponDialog from '../components/AdditionCouponDialog.vue'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import cashRiskMixin from '../mixin/cashRiskMixin.js'
import NP from 'number-precision'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
import MonitorKeyboard from '@/utils/monitorKeyboard'
import { isEmpty, throttle } from 'lodash'
import { periodUnitFilter } from '../filters'

import { ftdOrderCreate } from '@/apis/ftd/order.js'
import { ftdProductDetail } from '@/apis/ftd/product.js'
import { getFtdCouponList, useCouponForFtdProduct } from '@/apis/operation.js'
import { PRODUCT_TURNOVER_STATUS } from '../config/common.js'
import { ENCRYPT_TYPES } from '@/httpRequest/http'
import pathnames from '@/config/H5Pathname'
import { mapActions, mapGetters } from 'vuex'

const formatterFilter = v => {
    return thousandsFilter(toFixed(v, 2))
}

const dayCount = 365

export default {
    name: 'subscribe',
    // cashRiskMixin 要放在 verifyMixin 后面
    mixins: [verifyMixin, cashRiskMixin],
    components: {
        capitalDetail,
        SubscribeInput,
        SubscribeConfimDialog,
        DynamicFont,
        AdditionCouponDialog,
    },
    data() {
        return {
            showAndroidKeyboard: false,
            monitorKeyboard: null,
            power: {},
            inputValue: '',
            myLinkTradeLogin: null, // 中移动交易密码登录
            showConfimDialog: false,
            info: {
                minSubscriptionAmount: '',
                estimateInterestRateMin: '', // 最小预计年利率, 去除百分号, /100 的数据
                estimateInterestRateMax: '', // 最大预计年利率, 去除百分号, /100 的数据
                currency: '', // 币种
                productName: '', // 产品名称
                productCode: '', // 产品代码
                periodValue: 0, //	投资期限
                periodUnit: '', //	期限单位，d-按日, w-按周, m-按月, y-按年
                status: 0, // 产品状态, 100-待提交, 200-已提交, 300-即将认购, 320-认购中, 340-认购结束, 400-募集成功, 401-募集失败, 410-已起息, 500-已到期
            },
            showCouponDialog: false,
        }
    },
    computed: {
        ...mapGetters(['all', 'canUseCoupons', 'subscriptionAmount', 'persistenceProductInfo', 'additionAmount', 'selectedCouponId']),
        isFromActive() {
            return !isEmpty(this.activityID)
        },
        productCode() {
            return this.$route.query.productCode
        },
        activityID() {
            return this.$route.query.activityID
        },
        placeholder() {
            return `${formatterFilter(this.info.minSubscriptionAmount)}${currencyFilter(this.info.currency)}${this.$t('qi')}`
        },
        periodValueUnit() {
            return periodUnitFilter(this.info.periodUnit, this.info.periodValue)
        },
        interestDue() {
            const map = {
                d: 1,
                w: 7,
                n: 30, // 后续版本待定, 当前全是d
                y: dayCount,
            }
            // 利息=本金*（费后年利率/365）* 持有天数
            // 本期
            const periodUnit = this.info.periodUnit
            const minRate = NP.divide(this.info.estimateInterestRateMin, dayCount)
            const maxRate = NP.divide(this.info.estimateInterestRateMax, dayCount)
            const min = NP.times(this.inputValue, minRate, this.info.periodValue, map[periodUnit] || 1)
            const max = NP.times(this.inputValue, maxRate, this.info.periodValue, map[periodUnit] || 1)
            return `${formatterFilter(min)}~${formatterFilter(max)}`
        },
        minMaxRate() {
            const min = formatterFilter(NP.times(this.info.estimateInterestRateMin, 100))
            const max = formatterFilter(NP.times(this.info.estimateInterestRateMax, 100))
            return `${min}%~${max}%`
        },
        productInfoList() {
            const info1 = { title: this.$t('subscribe.investmentPeriod'), value: this.periodValueUnit }
            const info2 = { title: this.$t('subscribe.annualRateAfter'), value: this.minMaxRate, style: { color: '#FF6907' } }
            if (NP.minus(this.inputValue, this.info.minSubscriptionAmount) >= 0) {
                const info3 = { title: this.$t('subscribe.interestDue'), value: `${this.interestDue}${currencyFilter(this.info.currency)}` }
                return [info1, info2, info3]
            }
            return [info1, info2]
        },
        confirmInfo() {
            const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
            const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
            return [
                { label: this.$t('subscribe.accountNumber'), value: subAcctId },
                { label: this.$t('subscribe.serviceName'), value: this.info.productName },
                { label: this.$t('subscribe.subscribeAmount'), value: `${formatterFilter(this.inputValue)}${currencyFilter(this.info.currency)}` },
                { label: this.$t('subscribe.annualRateAfter'), value: this.minMaxRate },
                { label: this.$t('subscribe.investmentPeriod'), value: this.periodValueUnit },
            ]
        },
        showCashError() {
            // 小于起投金额
            return !isEmpty(this.power) && NP.minus(this.power.singleWithdrawBalance || 0, this.info.minSubscriptionAmount) < 0
        },
        tradeEnable() {
            return (
                NP.minus(this.inputValue, this.info.minSubscriptionAmount) >= 0 &&
                !this.showCashError &&
                this.$refs.capitalRef?.gap <= 0 &&
                this.info.status === PRODUCT_TURNOVER_STATUS.InSubscription
            )
        },
        additionAmountFormat() {
            return formatterFilter(this.additionAmount)
        },
    },
    watch: {
        inputValue(newVal, oldVal) {
            console.log('inputValue--newVal:', newVal)
            console.log('inputValue--oldVal:', oldVal)
            // 卡券列表返回时，this.info未从接口获取到，从vuex中取以便可以卡券计算正确
            const minSubscriptionAmount = +this.info.minSubscriptionAmount || +this.persistenceProductInfo.minSubscriptionAmount
            const currency = this.info.currency || this.persistenceProductInfo.currency
            if (newVal) {
                const subscriptionAmount = +newVal
                console.log('run watch logic:', { subscriptionAmount, minSubscriptionAmount, currency })
                this.commitCanUseCoupons({ subscriptionAmount, minSubscriptionAmount, currency })
            } else {
                console.log('lasdjflkajdklajl:')
                this.commitCanUseCoupons({ subscriptionAmount: 0, minSubscriptionAmount, currency })
            }
            // 从卡券列表返回后重新输入值要清空已经计算的加息及选中的卡券
            if (oldVal && newVal) {
                this.commitSelectedCoupon([])
                this.commitAdditionalAmount(0)
            }
        },
    },
    created() {
        this.getProductInfo()
        this.getCashToMarginStatus()
        this.getKeyboardState()
        this.getCoupons()
    },
    beforeDestroy() {
        this.monitorKeyboard?.onEnd()
    },
    mounted() {},
    filters: {
        currencyFilter,
        formatterFilter,
        periodUnitFilter,
    },
    methods: {
        ...mapActions([
            'commitAllCoupons',
            'commitCanUseCoupons',
            'commitSubscriptionAmount',
            'commitProductInfo',
            'commitSelectedCoupon',
            'commitAdditionalAmount',
            'commitBeginStatus',
        ]),
        isEmpty,
        async getProductInfo() {
            const params = {
                productCode: this.productCode,
            }
            ftdProductDetail(params)
                .then(({ result }) => {
                    this.info = result
                    console.log(`yinlong`, result)
                })
                .catch(err => {
                    console.error(`yinlong err`, err)
                })
        },
        async createOrder() {
            const params = {
                applyAmount: this.inputValue,
                productCode: this.productCode,
            }
            if (this.isFromActive) {
                params.activityId = this.activityID
            }
            if (this.selectedCouponId) params.couponId = this.selectedCouponId
            const config = {
                encrypt: ENCRYPT_TYPES.APP_TRADE_ENC,
            }
            return ftdOrderCreate(params, config)
        },

        gotoDetails() {
            if (this.isFromActive) {
                this.$goPage('/detail', { productCode: this.info.productCode, activityID: this.activityID })
            } else {
                this.$goPage('/detail', { productCode: this.info.productCode })
            }
        },
        onOperation() {
            this.$refs.capitalRef?.onOperation()
        },
        gocurrencyExchange() {
            const { VUE_APP_CURRENCY_H5_APP } = pathnames
            this.$goPage(VUE_APP_CURRENCY_H5_APP)
        },
        triggerAllIn() {
            if (this.power.singleWithdrawBalance) {
                this.inputValue = Math.min(9999999999.99, Math.max(Number(this.power.singleWithdrawBalance), 0))
            }
        },
        tradeClick: throttle(async function () {
            if (!this.tradeEnable) {
                if (this.info.status > PRODUCT_TURNOVER_STATUS.InSubscription) {
                    this.$toast(this.$t('subscribe.subscriptionClosed'))
                }
                return
            }

            if (!(await this.checkCashTreasureSubscribe())) return

            if (!(await this.checkRiskAssessmentExpiredStatus())) return

            if (!this.checkCashToMarginStatus()) return

            // 其它币种欠款提醒
            if (!this.$refs.capitalRef?.check()) return

            if (this.canUseCoupons.length && !this.selectedCouponId) {
                this.showCouponDialog = true
                return
            }
            const tradeLoginResult = await this.verifyTradeLogin()
            if (!tradeLoginResult) return
            this.showConfimDialog = true
        }, 300),
        tradeAction: throttle(async function () {
            this.$loading.show = true

            this.createOrder()
                .then(async ({ result }) => {
                    this.$loading.show = false
                    console.log(`yinlong`, result)
                    if (this.selectedCouponId) {
                        await useCouponForFtdProduct({
                            id: this.selectedCouponId,
                            productCode: this.productCode,
                            symbol: result.orderNumber,
                        })
                    }
                    this.toResult(result.orderNumber)
                })
                .catch(({ error }) => {
                    this.$loading.show = false
                    console.error(`yinlong err`, error)
                    if (error?.data?.tips) {
                        this.$toast(error.data.tips)
                    } else if (error?.code == 2700015) {
                        this.$dialog.confirm({
                            title: this.$t('tipTitle'),
                            message: this.$t('subscribe.haveSameOrder'),
                            showCancelButton: false,
                            confirmButtonText: this.$t('iKnow'),
                            messageAlign: 'center',
                        })
                    } else {
                        this.$toast(this.$t('networkFailTimeOut'))
                    }
                })
        }, 300),
        toResult(orderNumber) {
            if (this.isFromActive) {
                this.$router.replace({
                    path: '/subscribe-result',
                    query: {
                        orderNumber: orderNumber,
                        activityID: this.activityID,
                    },
                })
            } else {
                this.$router.replace({
                    path: '/subscribe-result',
                    query: {
                        orderNumber: orderNumber,
                    },
                })
            }
        },
        // 交易密码校验
        async verifyTradeLogin() {
            if (this.$jsBridge) {
                try {
                    await this.$jsBridge.tradeLogin()
                    return true
                } catch (e) {
                    console.log('verifyTradeLogin-tradeLogin===>error:', e)
                    return false
                }
            } else if (this.$mylinkJsbridge.isInMylink()) {
                if (!this.myLinkTradeLogin) {
                    this.myLinkTradeLogin = new TradeLogin({ propsData: { subAcctId: this.accts.subAcctId } })
                }
                this.myLinkTradeLogin.show = true
                const task = new Promise(resolve => {
                    this.myLinkTradeLogin.vm.$once('ok', () => {
                        console.log('verifyTradeLogin-on-ok:')
                        resolve(true)
                    })
                    this.myLinkTradeLogin.vm.$once('cancel', () => {
                        console.error('verifyTradeLogin-on-error:')
                        resolve(false)
                    })
                })
                const result = await task
                console.log('myLink-verifyTradeLogin-result', result)
                return result
            }
            // 其他环境(如同花顺)默认无需校验交易密码
            return true
        },
        getKeyboardState() {
            this.monitorKeyboard = new MonitorKeyboard()
            this.monitorKeyboard.onStart()
            // 监听虚拟键盘弹出事件
            this.monitorKeyboard.onShow(() => {
                this.showAndroidKeyboard = true
            })
            //监听键盘收起的事件
            this.monitorKeyboard.onHidden(() => {
                this.showAndroidKeyboard = false
            })
        },
        async getCoupons() {
            const couponRes = await getFtdCouponList()
            const {
                couponInfos: { list },
            } = couponRes?.data?.result
            console.log('couponRes:', couponRes)
            this.commitAllCoupons(list)
        },
        async handleCouponDialogCancel() {
            const tradeLoginResult = await this.verifyTradeLogin()
            if (!tradeLoginResult) return
            this.showConfimDialog = true
        },
        gotoFtdCouponListsPage() {
            this.commitSubscriptionAmount(this.inputValue)
            this.commitProductInfo(this.info)
            this.$router.push('/ftd-cpoupon-list')
        },
    },
    beforeRouteEnter(to, from, next) {
        // 卡券列表返回时，认购金额回填
        if (from.path === '/ftd-cpoupon-list') {
            next(vm => (vm.inputValue = vm.subscriptionAmount))
        } else {
            next(vm => vm.commitBeginStatus())
        }
    },
}
</script>

<style scoped lang="less">
.card_radius {
    background-color: #fff;
    border-radius: 8px;
}

.subscribe {
    padding: 12px 12px 34px;
}

.name_info {
    position: relative;
    padding: 12px;

    .name {
        margin-bottom: 5px;
        color: @h1-white;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
    }

    .currency {
        display: inline-block;
        height: 12px;
        margin-right: 4px;
    }

    .symble {
        color: @h3-white;
        font-size: 10px;
        line-height: 12px;
    }

    .arrow {
        position: absolute;
        top: 50%;
        right: 12px;
        width: 16px;
        height: 16px;
        transform: translateY(-50%);
    }
}

.product_info {
    height: 48px;
    margin: 0 12px;
    font-size: 14px;
    line-height: 20px;

    .title {
        color: @h2-white;
    }

    .value {
        color: @h1-white;
    }

    .resize {
        max-width: calc(186px - 28px);
    }

    .flex0 {
        flex-shrink: 0;
    }
}

.cash_short {
    display: flex;
    flex-direction: column;
    align-content: flex-start;
    margin-top: -6px;
    padding: 0 12px 16px;

    .title-container {
        display: flex;

        .text-red {
            color: @error-white;
            font-size: 12px;
            line-height: 16px;
        }

        .text-normal {
            color: #666;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .btn-cantainer {
        display: flex;
        margin-top: 12px;
    }

    .operation {
        display: flex;
        align-items: center;
        padding: 7px 8px;
        color: #2f2f2f;
        font-size: 12px;
        line-height: 14px;
        background: #f6f6f6;
        border: none;
        border-radius: 28px;
        outline: none;

        img {
            width: 8px;
            height: 8px;
            margin-left: 2px;
        }

        &:last-child {
            margin-left: 12px;
        }
    }
}

.fixed {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 3px 28px 34px;
    background-color: #fff;

    .tradeButton {
        width: 100%;
        height: 44px;
        color: #fff;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
        letter-spacing: 0;
        text-align: center;
        background-color: @theme-white;
        border: none;
        border-radius: 22px;
    }

    .dislabed {
        opacity: 0.3;
    }
}

/* stylelint-disable-next-line no-duplicate-selectors */
.subscribe {
    .coupon-module-wrapper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 12px;
        color: #666;
        font-size: 14px;
        background-color: #fff;
        border-radius: 8px;

        .coupon-left {
            display: flex;
            align-items: center;

            .coupon-img {
                width: 20px;
                height: 20px;
                margin-right: 8px;
            }
        }

        .coupon-right {
            position: relative;
            display: flex;
            align-items: center;

            .has-coupon-list-tip {
                position: absolute;
                top: -35px;
                right: -12px;
                padding: 4px 10px;
                color: #337eef;
                font-size: 12px;
                white-space: nowrap;
                background: #e4efff;
                border-radius: 12px;

                &::after {
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-top: 10px solid #e4efff;
                    border-right: 10px solid transparent;
                    border-left: 10px solid transparent;
                    content: '';
                }
            }

            .no-use-list {
                color: #9c9c9c;
            }

            .has-use-list {
                padding: 1px 4px;
                color: #fff;
                font-size: 12px;
                line-height: 16px;
                background: #ff6907;
                border-radius: 2px;
            }

            .has-addition-amount {
                color: #2f2f2f;

                .const-text {
                    margin-right: 8px;
                    padding: 1px 4px;
                    color: #ff6907;
                    font-size: 12px;
                    line-height: 16px;
                    background: rgba(255, 105, 7, 0.15);
                    border-radius: 2px;
                }
            }

            .arrow {
                width: 16px;
                height: 16px;
                margin-left: 8px;
            }
        }
    }
}
</style>
