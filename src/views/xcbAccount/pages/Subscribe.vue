// 认购页
<template>
    <div class="subscribe">
        <div class="name_info card_radius">
            <div @click="onClickName">
                <div class="name line-elipsis_l2">{{ info.productName }}</div>
                <div class="flex-c">
                    <span class="currency" :class="`currency-${info.currency}`"></span>
                    <span class="symble">{{ info.productCode }}</span>
                </div>
                <multi-img
                    v-if="info.annualManageFeeRate?.length > 1"
                    class="arrow"
                    :name="displayStep ? 'up-16' : 'down-16'"
                    directory="common"
                ></multi-img>
                <multi-img v-else class="arrow" name="icon-right-arrow" directory="common" />
            </div>
            <div v-if="displayStep && info.annualManageFeeRate?.length > 1" class="rate-step-container" @click="gotoDetails">
                <RateStep class="mar-b4" :list="info.annualManageFeeRate" :before-rate="info.actualInterestRate" :currency="info.currency"></RateStep>
            </div>
        </div>

        <div class="card_radius mar-t12 pad-tb8">
            <div v-for="(item, index) in productInfoList" :key="index">
                <div class="product_info flex-s">
                    <div class="title">
                        {{ item.title }}
                        <multi-img v-if="item.tips" @click="showTips(item.tips)" class="icon_tips" name="icon-tips" directory="common" />
                    </div>
                    <div class="value" :style="item.style || {}">{{ item.value }}</div>
                </div>
            </div>
        </div>

        <SubscribeInput
            class="amount_info card_radius mar-t12"
            v-model="inputValue"
            :info="info"
            :placeholder="placeholder"
            :buttonMsgDisable="allinDisable"
            :error-tips="errorTips"
            @triggerAllIn="triggerAllIn"
            @blur="triggerBlurHandler"
        ></SubscribeInput>

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
                            {{ $t('saveCapitalShort') }}
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

        <div class="fixed" v-if="!showAndroidKeyboard">
            <button class="tradeButton" :class="{ dislabed: !tradeEnable }" @click="tradeClick">{{ $t('subscribeText') }}</button>
        </div>
        <SubscribeConfimDialog v-model="showConfimDialog" :list="confirmInfo" @confirm="tradeAction"></SubscribeConfimDialog>
    </div>
</template>

<script>
import capitalDetail from '../components/capitalDetail.vue'
import RateStep from '../components/rateStep.vue'
import SubscribeInput from '../components/SubscribeInput.vue'
import SubscribeConfimDialog from '../components/SubscribeConfimDialog.vue'
import starZHVerifyMixin from '../mixin/starZHVerifyMixin.js'
import NP from 'number-precision'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
import MonitorKeyboard from '@/utils/monitorKeyboard'
import { isEmpty, throttle, cloneDeep } from 'lodash'
import { periodUnitFilter } from '../filters'

import { ssaOrderCreate, ssaProductTotalApplyAmount } from '@/apis/xjb/order.js'
import { ssaProductDetail } from '@/apis/xjb/product.js'
import { PRODUCT_TURNOVER_STATUS } from '../config/common.js'
import { ENCRYPT_TYPES } from '@/httpRequest/http'
import pathnames from '@/config/H5Pathname'

const formatterFilter = (v, d = 2) => {
    return thousandsFilter(toFixed(v, d))
}

const dayCount = 365
const unitAmount = 10000

export default {
    name: 'subscribe',
    mixins: [starZHVerifyMixin],
    components: {
        capitalDetail,
        SubscribeInput,
        SubscribeConfimDialog,
        RateStep,
        // DynamicFont,
    },
    data() {
        return {
            showAndroidKeyboard: false,
            monitorKeyboard: null,
            power: {},
            inputValue: '',
            myLinkTradeLogin: null, // 中移动交易密码登录
            showConfimDialog: false,
            totalApplyAmount: '0', // 已提交 认购总额
            displayStep: true,
            errorTips: '',
            info: {
                productName: '', //	产品名称
                productCode: '', //	产品代码
                currency: '', //	产品币种
                periodValue: 0, //	投资期限
                periodUnit: '', //	期限单位，d-按日, w-按周, m-按月, y-按年
                periodLock: 0, //	产品锁定期
                interestAccrualTime: '', //	起息日，格式:2023-09-10 18:22:30
                maturityTime: '', //	到期日，格式:2023-09-10 18:22:30
                announcedTime: '', //	公布结果日，格式:2023-09-10 18:22:30
                actualInterestRate: '', //	本期客户年利率（费前）, 去除百分号
                annualManageFeeRate: [], //	管理费, 去除百分号, 梯度费率
                collectStartTime: '', //	开始认购日，格式:2023-09-10 18:22:30 15:20
                collectEndTime: '', //	截止认购日，格式:2023-09-10 18:22:30 15:20
                collectedResult: 0, //	募集状态, 0-待公布, 1-募集成功, 2-募集失败
                minSubscriptionAmount: '', //	起购金额，单位是元
                settlementDays: 0, //	T+n回款日
                settlementTime: '', //	回款日，格式:2023-09-10 18:22:30
                productAdvantage: '', //	产品亮点
                productDescription: '', //	产品特点
                status: 0, //	产品状态, 100-待提交, 200-已提交, 300-即将认购, 320-认购中, 340-认购结束, 400-募集成功, 401-募集失败, 410-已起息, 500-已到期
                serverTime: '', //	服务器时间，格式:2023-09-10 18:22:30 15:20:10
            },
        }
    },
    computed: {
        productCode() {
            return this.$route.query.productCode
        },
        placeholder() {
            return `${formatterFilter(this.info.minSubscriptionAmount)}${currencyFilter(this.info.currency)}${this.$t('qi')}`
        },
        periodValueUnit() {
            return periodUnitFilter(this.info.periodUnit, this.info.periodValue)
        },
        realInterestRate() {
            const beforeRate = this.info.actualInterestRate || 0
            const totalAmount = NP.plus(this.inputValue, this.totalApplyAmount || '0')
            const list = cloneDeep(this.info.annualManageFeeRate || []).reverse()
            const [manageFee] = list.filter((item, index) => {
                if (index === list.length - 1) {
                    return true
                }
                return NP.minus(totalAmount, item.minAmount) >= 0
            })
            if (manageFee) {
                return formatterFilter(NP.times(NP.minus(beforeRate, manageFee.feeRate || 0), 100))
            }
            return formatterFilter(NP.times(beforeRate, 100))
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
            const minRate = NP.divide(this.realInterestRate, 100, dayCount)
            const min = NP.times(this.inputValue, minRate, this.info.periodValue, map[periodUnit] || 1)
            return formatterFilter(min)
        },
        minMaxRate() {
            const min = formatterFilter(NP.times(this.info.actualInterestRate, 100))
            return `${min}%`
        },
        totalAndInputAmount() {
            return NP.plus(this.totalApplyAmount, this.inputValue)
        },
        productInfoList() {
            const info1 = { title: this.$t('subscribe.investmentPeriod'), value: this.periodValueUnit }
            const info2 = {
                title: this.$t('subscribe.amountOfCurrentPeriod'),
                value: `${formatterFilter(this.totalAndInputAmount)}${currencyFilter(this.info.currency)}`,
                tips: this.$t('subscribe.amountOfCurrentPeriodTips'),
            }
            if (NP.minus(this.inputValue, this.info.minSubscriptionAmount) >= 0) {
                const info3 = { title: this.$t('detail.annualisedRate'), value: `${this.realInterestRate}%`, style: { color: '#FF6907' } }
                const info4 = { title: this.$t('subscribe.interestDue'), value: `${this.interestDue}${currencyFilter(this.info.currency)}` }
                return [info1, info2, info3, info4]
            }
            return [info1, info2]
        },
        confirmInfo() {
            const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
            const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
            const currency = currencyFilter(this.info.currency)
            return [
                { label: this.$t('subscribe.accountNumber'), value: subAcctId },
                { label: this.$t('subscribe.serviceName'), value: this.info.productName },
                { label: this.$t('subscribe.amountOfCurrentPeriod'), value: `${formatterFilter(this.totalAndInputAmount)}${currency}` },
                { label: this.$t('subscribe.subscribeAmount'), value: `${formatterFilter(this.inputValue)}${currency}` },
                { label: this.$t('detail.annualisedRate'), value: `${this.realInterestRate}%` },
                { label: this.$t('subscribe.investmentPeriod'), value: this.periodValueUnit },
            ]
        },
        showCashError() {
            // 小于起投金额
            return !isEmpty(this.power) && NP.minus(this.power.singleWithdrawBalance || 0, this.info.minSubscriptionAmount) < 0
        },
        inputValid() {
            return Number(this.inputValue) % unitAmount === 0
        },
        tradeEnable() {
            return (
                this.inputValid &&
                NP.minus(this.inputValue, this.info.minSubscriptionAmount) >= 0 &&
                !this.showCashError &&
                this.$refs.capitalRef?.gap <= 0 &&
                this.info.status === PRODUCT_TURNOVER_STATUS.InSubscription
            )
        },
        allinDisable() {
            return Number(this.inputValue) > 0 && NP.minus(this.inputValue, this.power.singleWithdrawBalance || 0) === 0
        },
    },
    watch: {},
    created() {
        this.getProductInfo()
        this.getProductTotalApplyAmount()
        this.getCashToMarginStatus()
        this.getKeyboardState()
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
        isEmpty,
        async getProductTotalApplyAmount() {
            const params = {
                productCode: this.productCode,
            }
            ssaProductTotalApplyAmount(params)
                .then(({ result }) => {
                    this.totalApplyAmount = result.totalApplyAmount || ''
                    console.log(`yinlong getProductTotalApplyAmount`, result)
                })
                .catch(err => {
                    console.error(`yinlong getProductTotalApplyAmount`, err)
                })
        },
        async getProductInfo() {
            const params = {
                productCode: this.productCode,
            }
            ssaProductDetail(params)
                .then(({ result }) => {
                    this.info = result
                    console.log(`yinlong getProductInfo`, result)
                })
                .catch(err => {
                    console.error(`yinlong getProductInfo`, err)
                })
        },
        async createOrder() {
            const params = {
                applyAmount: this.inputValue,
                productCode: this.productCode,
            }
            const config = {
                encrypt: ENCRYPT_TYPES.APP_TRADE_ENC,
            }
            return ssaOrderCreate(params, config)
        },
        gotoDetails() {
            this.$goPage('/detail', { productCode: this.productCode })
        },
        onClickName() {
            if (this.info.annualManageFeeRate?.length > 1) {
                this.displayStep = !this.displayStep
            } else {
                this.gotoDetails()
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
                let value = Math.min(9999999999.99, Math.max(Number(this.power.singleWithdrawBalance), 0))
                if (value % unitAmount !== 0) {
                    this.errorTips = this.$t('subscribe.errorTips', { num: formatterFilter(unitAmount, 0) })
                } else {
                    this.errorTips = ''
                }
                // 向下取整
                value = Math.trunc(NP.divide(value, unitAmount))
                // 算出来最终结果
                value = NP.times(value, unitAmount)

                this.inputValue = toFixed(value, 2)
            }
        },
        triggerBlurHandler() {
            if (!this.inputValid) {
                this.errorTips = this.$t('subscribe.errorTips', { num: formatterFilter(unitAmount, 0) })
            } else {
                this.errorTips = ''
            }
        },
        tradeClick: throttle(async function () {
            if (!this.tradeEnable) {
                if (this.info.status > PRODUCT_TURNOVER_STATUS.InSubscription) {
                    this.$toast(this.$t('subscribe.subscriptionClosed'))
                }
                return
            }

            if (!(await this.checkStarZHSubscribe())) return

            if (!(await this.checkStarZHAssessmentStatus())) return

            if (!this.checkCashToMarginStatus()) return

            // 其它币种欠款提醒
            if (!this.$refs.capitalRef?.check()) return

            const tradeLoginResult = await this.verifyTradeLogin()
            if (!tradeLoginResult) return
            this.showConfimDialog = true
        }, 300),
        tradeAction: throttle(async function () {
            this.$loading.show = true

            this.createOrder()
                .then(({ result }) => {
                    this.$loading.show = false
                    console.log(`yinlong`, result)
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
            this.$router.replace({
                path: '/subscribe-result',
                query: {
                    orderNumber: orderNumber,
                    productCode: this.productCode,
                },
            })
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
        showTips(tips) {
            this.$dialog.confirm({
                title: this.$t('tipTitle'),
                message: tips,
                showCancelButton: false,
                confirmButtonText: this.$t('gotIt'),
                messageAlign: 'left',
            })
        },
    },
}
</script>

<style scoped lang="less">
.card_radius {
    background-color: #fff;
    border-radius: 8px;
}

.subscribe {
    padding: 12px 12px 134px;
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
        height: 11px;
        margin-right: 4px;
    }

    .symble {
        color: @h3-white;
        font-size: 10px;
        line-height: 12px;
    }

    .arrow {
        position: absolute;
        top: 24px;
        right: 12px;
        // transform: translateY(-50%);
        width: 16px;
        height: 16px;
    }

    .rate-step-container {
        margin-top: 12px;
    }
}

.product_info {
    height: 36px;
    margin: 0 12px;
    font-size: 14px;
    line-height: 20px;

    .title {
        display: flex;
        align-items: center;
        color: @h2-white;

        .icon_tips {
            width: 16px;
            height: 16px;
            margin-left: 4px;
        }
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
</style>
