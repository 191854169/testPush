<!--新建定制票据产品-->
<template>
    <div class="pad-12">
        <div class="bg-white pad-12 border-radius-8px">
            <div class="f11 h2-white lh-14 mar-b6">{{ $t('bills.customObjects') }}</div>
            <div class="flex-s" @click="selectProductVisible = true">
                <div class="c-main f16 lh-22 bold">{{ selectedProduct.name }}</div>
                <multi-img name="icon_right_arrow_16" directory="common" width="14" height="14"></multi-img>
            </div>
        </div>

        <!-- 意向认购金额 -->
        <div class="bg-white pad-12 pad-t14 border-radius-8px mar-t12 amount-card">
            <div class="f16 c-main lh-22 bold">{{ $t('bills.intendedSubscriptionAmount') }}</div>
            <div :class="{ 'has-error': showError }">
                <div class="buy-input" :class="{ 'buy-input-active': buyAmount }">
                    <div class="numTip" v-show="calcDigits(buyAmount)">
                        <div class="text">
                            <span class="f8">{{ calcDigits(buyAmount) }}</span>
                        </div>
                    </div>
                    <div class="label">{{ currency }}</div>
                    <div class="input-box">
                        <div class="input">
                            <van-field
                                name="buyAmount"
                                type="text"
                                inputmode="decimal"
                                v-model="buyAmount"
                                :placeholder="
                                    $t('bills.amountPlaceholder', {
                                        amount: humanNum(selectedProduct.minInitial, 0, true, this.$i18n),
                                        currency: $t(currency),
                                    })
                                "
                                :class="{ 'focus-large': buyAmount }"
                                clearable
                                :formatter="amountFormatter"
                                format-trigger="onBlur"
                                @input="handleAmountInput"
                            />
                        </div>
                    </div>
                </div>
                <div class="fast-click">
                    <span class="fast-item" v-for="(item, index) in fastArr" :key="index" @click="handleFastItemClick(item)">{{ item.value }}</span>
                </div>
                <div v-if="showError" class="error-tips">
                    {{ errorTips }}
                </div>

                <div class="tips" v-else>
                    <div class="tips-item">
                        <label class="label">{{ $t('bills.startAmount') }}:</label>
                        <label>
                            {{
                                $t('bills.startAmountValue', {
                                    amount: amountFilter(selectedProduct?.minInitial),
                                    currency: $t(currency),
                                    unitAmount: amountFilter(selectedProduct?.unitAmount),
                                })
                            }}
                        </label>
                    </div>
                    <div class="tips-item">
                        <label class="label">{{ $t('bills.referenceRates') }}:</label>
                        <label>{{ `${selectedProduct?.buyFee ?? '--'}%` }}</label>
                    </div>
                </div>
            </div>
        </div>

        <!-- 期望投资年限 -->
        <div class="bg-white pad-12 pad-t14 border-radius-8px mar-t12">
            <div class="f16 c-main lh-22 mar-b16 bold">{{ $t('bills.expectedInvestmentPeriod') }}</div>
            <div class="flex-c flex-wrap">
                <div
                    class="month-item"
                    v-for="(item, index) in monthArr"
                    :key="index"
                    :class="{ active: index + 1 === monthIndex }"
                    @click="monthIndex = index + 1"
                >
                    {{ item.name }}
                </div>
            </div>
            <div class="f12 c-gray lh-16 pad-t12 pad-b12" v-if="!monthIndex">{{ $t('bills.chooseInvestmentTips') }}</div>
            <div class="border-radius-8px pad-l12 rate-tips" v-else>
                <span class="f13 lh-20 h2-white">{{ $t('bills.rateExpectedTips1') }}</span>
                <!-- 浮动产品 -->
                <template v-if="selectedProduct?.isFixed == 0">
                    <span class="f13 lh-20 h2-white">{{ $t('bills.floatRateText') }}</span>
                    <span class="f16 c-theme lh-26 bold">
                        {{ monthArr[monthIndex - 1]?.yieldMin }}%&nbsp;~&nbsp;{{ monthArr[monthIndex - 1]?.yieldMax }}%
                    </span>
                </template>
                <!-- 固定产品 -->
                <template v-else>
                    <span class="f14 lh-20 h2-white">{{ $t('bills.sub') }}</span>
                    <span class="f16 c-theme lh-26 bold">{{ monthArr[monthIndex - 1]?.yield }}%</span>
                </template>
            </div>
        </div>
        <button class="submit-btn" @click="handleSubmit" :class="{ disabled: !canSign }">{{ $t('bills.submit') }}</button>
        <!-- 温馨提示 -->
        <div class="warm-prompt">
            <h5 class="warm-prompt__title">{{ $t('sweetTip') }}</h5>
            <h5 class="warm-prompt__content">{{ $t('customBillLegalTip') }}</h5>
        </div>
        <!-- 选择框 -->
        <van-popup v-model="selectProductVisible" round position="bottom">
            <div class="picker">
                <div class="picker-header pos-r flex-c">
                    <multi-img name="icon-cancel" directory="common" class="icon-close" @click="selectProductVisible = false"></multi-img>
                    <span class="f16 lh-22 c-main flex1 bold">{{ $t('bills.selectProduct') }}</span>
                </div>
                <div class="scroll">
                    <div
                        class="picker-item"
                        :class="{ selected: selectedProduct?.symbol === item.symbol }"
                        v-for="item in products"
                        :key="item.symbol"
                        @click="handleSelectProductConfirm(item)"
                    >
                        {{ item.name }}
                    </div>
                </div>
            </div>
        </van-popup>
    </div>
</template>

<script>
import { thousandsFilter } from '@/config/filters.js'
import { toFixed, humanNum } from '@/utils'
import { getCustomList } from '@/apis/fund/note'
import NP from 'number-precision'
import { BILL_UNIT_MAP } from '@/views/fund/config/common'
import { noteCustomizationOrderCreate, noteCustomizationOrderDetail, noteCustomizationOrderModify } from '@/apis/wealth/index'

// 金额格式化
const amountFilter = function (val) {
    const ret = toFixed(thousandsFilter(val ?? ''), 2)
    console.log(`Feng.chen:: 16:18:34 val ===> `, val, ret, ret.length)
    return ret
}

export default {
    name: 'CustomizeAdd',
    data() {
        return {
            BILL_UNIT_MAP,
            monthIndex: '',
            selectProductVisible: false,
            showError: false,
            quoteInfo: {},
            buyAmount: '',
            isUsemargin: false,
            errorTips: '',
            products: [],
            selectedProduct: { symbol: '', expectInvest: [] },

            amountVerifyRules: [
                {
                    validator: () => {
                        return this.realAmount < this.selectedProduct?.minInitial
                    },
                    message: () => this.$t('bills.minLimitMsg', { amount: this.selectedProduct?.minInitial, currency: this.$t(this.currency) }),
                },
                {
                    validator: () => {
                        return this.realAmount % this.selectedProduct?.unitAmount !== 0
                    },
                    message: () => this.$t('bills.unitLimitMsg', { amount: this.selectedProduct?.unitAmount }),
                },
                {
                    validator: () => {
                        return this.showWithdrawalBalanceTip
                    },
                    message: () => this.$t('tradeFailedOfMaxPPForDebt'),
                },
            ],
            orderId: Number(this.$route.query.orderId),
            isModify: this.$route.query.type === 'modify',
            form: {},
        }
    },
    computed: {
        // 货币
        currency() {
            return this.selectedProduct?.currency ?? 'USD'
        },

        // 快速选择
        fastArr() {
            // const num = Math.ceil(this.selectedProduct?.minInitial / 10000) * 10000
            const num = NP.times(NP.divide(this.selectedProduct?.minInitial || '', 10000), 10000)
            console.log('num=>', num)
            return [num, num * 5, num * 10].map(item => ({
                amount: item,
                value: humanNum(item, 0, true, this.$i18n) + this.$t(this.currency),
            }))
        },
        // 金额 Number
        realAmount() {
            return Number(this.getAmountString(this.buyAmount))
        },

        subAccountId() {
            return this.$store.getters['user/getSubAccountId']
        },
        monthArr() {
            return this?.selectedProduct?.expectInvest?.map(item => {
                let name = ''
                if (item.unit == this.BILL_UNIT_MAP.keysMap.month) {
                    name = this.$t('orderDetailFields.months', { num: item.value })
                } else {
                    name = item.value + this.BILL_UNIT_MAP.keyValueMap[item.unit]
                }
                return { name, ...item, isFixed: this?.selectedProduct?.isFixed }
            })
        },

        // 是否可认购
        canSign() {
            return this.selectedProduct?.symbol && this.realAmount > 0 && !this.showError && this.monthIndex > 0
        },

        // 编辑状态
        isEdit() {
            return this.orderId && this.isModify
        },
    },

    filters: {
        amountFilter,
    },

    mounted() {
        this.init()
    },

    methods: {
        humanNum,
        amountFilter,
        //返回输入位数
        calcDigits(numStr) {
            const realNumStr = numStr.replace(/,/g, '')
            const intStr = realNumStr.indexOf('.') > -1 ? realNumStr.split('.')[0] : realNumStr
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

        // 获取金额字串
        getAmountString(amount = '') {
            return amount.replace(/,/g, '')
        },

        async init() {
            if (this.orderId) {
                await this.getDetailData()
                this.getData()
            } else {
                this.getData()
            }
        },

        // 输入格式化
        amountFormatter(val) {
            const pureNumString = this.getAmountString(val)
            const formatedVal = pureNumString
                .replace(/[^\d.]/g, '') // 数字与小数点
                .replace(/^\./g, '') // 禁止开头小数点
                .replace('.', '$#$')
                .replace(/\./g, '')
                .replace('$#$', '.') // 多个小数点保留第一个
                .replace(/^\./g, '') // 再次禁止开头小数点

            return formatedVal ? this.amountFilter(formatedVal) : formatedVal
        },

        amountValidate(trigger = 'input') {
            const currRules = trigger === 'submit' ? this.amountVerifyRules : this.amountVerifyRules.filter(rule => !rule.trigger)
            return !currRules.some(rule => {
                const hasError = rule.validator()

                if (hasError) {
                    const msg = rule.message()

                    if (rule.msgType === 'toast') {
                        this.$toast(msg)
                    } else {
                        this.showError = true
                        this.errorTips = msg
                    }
                } else {
                    this.showError = false
                    this.errorTips = ''
                }

                return hasError
            })
        },

        // 金额校验
        handleAmountInput() {
            if (this.buyAmount) {
                this.amountValidate()
            } else {
                this.showError = false
                this.errorTips = ''
            }
        },

        // 处理快速点击、全部认购
        handleFastItemClick({ amount = 0 } = {}, all = false) {
            const num = all ? this.maxPurchasingPower : amount
            this.buyAmount = this.amountFormatter(`${num}`)
            this.amountValidate()

            console.log(this.buyAmount, this.realAmount)
        },

        // 处理选择产品
        handleSelectProductConfirm(item) {
            this.selectedProduct = item
            this.monthIndex = ''
            this.buyAmount = ''
            this.errorTips = ''
            this.showError = false
            this.selectProductVisible = false
            // this.amountValidate()
        },

        handleSubmit() {
            if (!this.canSign) {
                return false
            }
            this.createOrder()
        },

        async createOrder() {
            this.$store.commit('app/updateShowLoading', true)
            try {
                const params = {
                    symbol: this.selectedProduct.symbol,
                    applyAmount: this.getAmountString(this.buyAmount),
                    productPeriod: this.monthArr[this.monthIndex - 1].value,
                    productPeriodUnit: this.monthArr[this.monthIndex - 1].unit,
                }
                // 浮动利率
                if (this.selectedProduct?.isFixed == 0) {
                    params.productYieldMin = this.monthArr[this.monthIndex - 1].yieldMin
                    params.productYieldMax = this.monthArr[this.monthIndex - 1].yieldMax
                } else {
                    params.productYield = this.monthArr[this.monthIndex - 1].yield
                }
                if (this.isEdit) {
                    params.orderId = this.orderId
                }
                const { result = {} } = (this.isEdit ? await noteCustomizationOrderModify(params) : await noteCustomizationOrderCreate(params)) ?? {}
                this.$store.commit('app/updateShowLoading', false)
                if (result?.orderId) {
                    this.$router.replace({
                        path: '/bill-customize-result',
                        query: {
                            orderId: result?.orderId,
                        },
                    })
                }
            } catch (err) {
                const self = this
                console.log('noteCustomizationOrderCreate=>err', err)
                this.$store.commit('app/updateShowLoading', false)
                // 同产品有待处理订单
                if (err?.error?.code === 270009) {
                    this.$dialog.confirm({
                        title: '',
                        message: this.$t('bills.haveCustomizeErrorTips'),
                        messageAlign: 'left',
                        showCancelButton: true,
                        confirmButtonText: this.$t('toView'),
                        beforeClose(action, done) {
                            if (action == 'confirm') {
                                self.$goPage('/bill-customize-detail', {
                                    orderId: err?.error?.data?.orderId,
                                })
                                done()
                            } else {
                                done()
                            }
                        },
                    })
                }
            }
        },

        // 获取可见产品列表
        async getData() {
            try {
                const { result = {} } = (await getCustomList({ subAccountId: this.subAccountId })) ?? {}
                this.products = result?.list || []
                if (this.orderId) {
                    this.selectedProduct = this.products.filter(item => item.symbol === this.form.parentSymbol)[0] || {}
                    this.monthArr.forEach((item, index) => {
                        if (item.value == this.form.productPeriod) {
                            this.monthIndex = index + 1
                        }
                    })
                } else {
                    this.selectedProduct = this.products[0]
                }
            } catch (err) {
                console.log('err', err)
                this.products = []
            }
        },

        // 获取订单数据
        async getDetailData() {
            try {
                const { result } = await noteCustomizationOrderDetail({ orderId: this.orderId })
                this.form = result
                this.buyAmount = result.applyAmount || ''
            } catch (e) {
                console.log('noteCustomizationOrderDetail===>e:', e)
                this.form = {}
            }
        },
    },
}
</script>

<style lang="less" scoped>
.field-box(@height) {
    box-sizing: border-box;
    min-height: @height;
}

.flex-wrap {
    flex-wrap: wrap;
}

.placeholder-style {
    input::-webkit-input-placeholder {
        /* WebKit browsers 适配谷歌 */
        color: rgba(@fontGreyColor, 0.6);
        font-size: 20px;
        line-height: 28px;
    }

    input:-moz-placeholder {
        /* Mozilla Firefox 4 to 18 适配火狐 */
        color: rgba(@fontGreyColor, 0.6);
        font-size: 20px;
        line-height: 28px;
    }

    input::-moz-placeholder {
        /* Mozilla Firefox 19+ 适配火狐 */
        color: rgba(@fontGreyColor, 0.6);
        font-size: 20px;
        line-height: 28px;
    }

    input:-ms-input-placeholder {
        /* Internet Explorer 10+  适配ie */
        color: rgba(@fontGreyColor, 0.6);
        font-size: 20px;
        line-height: 28px;
    }
}

.amount-card {
    .buy-input {
        position: relative;
        display: flex;
        align-items: center;
        .field-box(64px);

        padding: 20px 0 18px;

        .label {
            flex: 0 0 auto;
            color: #000;
            font-size: 20px;
            line-height: 28px;
        }

        .input-box {
            position: relative;
            top: -1px;
            display: flex;
            flex: 1 1 auto;
            align-items: center;

            .input {
                position: relative;
                flex: 1 1 auto;
            }

            .buy-all {
                flex: 0 0 auto;
                color: #ff6907;
            }

            ::v-deep .van-field {
                padding: 0 12px;
                color: #000;
                font-size: 20px;
                line-height: 28px;

                &.focus-large {
                    font-size: 32px;
                    line-height: 38px;
                }

                .placeholder-style();
            }
        }

        .numTip {
            position: absolute;
            top: 0;
            left: 56px;
            z-index: 2;
            display: flex;
            flex-direction: row;
            align-items: center;
            line-height: 12px;

            .text {
                position: relative;
                padding: 2px;
                color: #2f2f2f;
                background: #f0f0f0;
                border-radius: 1px;

                &::after {
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    display: block;
                    width: 0;
                    height: 0;
                    border: 4px solid transparent;
                    border-top: 4px solid #f0f0f0;
                    transform: translateX(-50%);
                    content: '';
                }
            }
        }
    }

    .buy-input-active {
        padding: 14px 0;
    }

    .error-tips {
        margin-top: 8px;
        color: #f31414;
        font-size: 12px;
        line-height: 16px;
    }

    .fast-click {
        padding-bottom: 16px;
        box-shadow: inset 0 0 0 #fff, inset 0 0 0 #fff, inset 0 -0.5px 0 #efefef;

        .fast-item {
            margin-right: 16px;
            padding: 4px 8px;
            color: #ff6907;
            font-size: 12px;
            line-height: 24px;
            background: rgba(255, 105, 7, 0.08);
            border-radius: 12px;
        }
    }

    .tips {
        margin-top: 16px;

        .tips-item {
            color: @fontBlackColor;
            font-size: 12px;

            & + .tips-item {
                margin-top: 10px;
            }

            .label {
                margin-right: 8px;
                color: @fontGreyColor;
            }

            label {
                display: inline-block;
            }
        }
    }

    .profit {
        margin-top: 12px;
        padding-top: 12px;
        color: #666;
        font-size: 12px;
        border-top: 1px solid #efefef;

        .amount {
            color: #ff6907;
        }
    }
}

.month-item {
    // width: 73px;
    flex: 0 0 72px;
    margin-right: 0.12rem;
    margin-bottom: 0.16rem;
    padding: 8px 10px;
    color: #2f2f2f;
    font-size: 14px;
    text-align: center;
    background: #f9f9f9;
    border-radius: 29px;

    &:nth-child(4n) {
        margin-right: 0;
    }

    &:last-child {
        margin-right: auto;
    }

    &.active {
        position: relative;
        color: #ff6907;
        background: rgba(255, 99, 7, 0.1);
        // &::after {
        //     content: '';
        //     position: absolute;
        //     left: 50%;
        //     bottom: -16px;
        //     transform: translateX(-50%);
        //     display: block;
        //     width: 0;
        //     height: 0;
        //     border: 9px solid transparent;
        //     border-bottom: 9px solid #f9f9f9;
        // }
    }
}

.rate-tips {
    // height: 40px;
    padding: 7px 8px;
    word-break: break-all;
    // padding-bottom: 4px;
    background: #f9f9f9;
}

.submit-btn {
    display: block;
    width: 319px;
    margin: 30px auto;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 44px;
    background: #ff6907;
    border: none;
    border-radius: 31px;
    outline: none;

    &.disabled {
        opacity: 0.3;
    }
}

::v-deep .van-popup--bottom.van-popup--round {
    border-radius: 12px 12px 0 0;
}

.picker {
    display: flex;
    flex-direction: column;
    // padding-bottom: calc(64px + 34px);
    height: 76vh;
    padding: 0 8px;

    .picker-header {
        flex: 0 0 auto;
        height: 44px;
        margin-bottom: 5px;
        text-align: center;

        .icon-close {
            position: absolute;
            top: 9px;
            left: 8px;
            width: 24px;
            height: 24px;
        }
    }

    .scroll {
        flex: 1 1 auto;
        height: calc(100% - 49px);
        overflow: auto;
    }

    .picker-item {
        display: flex;
        align-items: center;
        justify-content: left;
        width: 100%;
        height: 64px;
        padding-left: 12px;
        font-size: 16px;
        line-height: 22px;
        text-align: left;
        border-radius: 8px;

        &:last-child {
            margin-bottom: 24px;
        }

        &.selected {
            background: #fff5ef;
        }
    }
}

.warm-prompt {
    margin: 28px 0 20px;

    &__title {
        color: @fontGreyColor;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
    }

    &__content {
        margin-top: 8px;
        color: @fontGreyColor;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;
    }
}
</style>
