// 跟投模拟计算器页
<template>
    <div class="simulation-calculator">
        <div v-if="isInAPP">
            <div class="bg_image"></div>
            <navigation-bar @updateNaviHeight="v => (naviHeight = v)" :color="'#d4e8ff'" :shadePixel="178" @back="goBack"></navigation-bar>
        </div>
        <quote-permission
            v-if="isStock"
            :immersive="true"
            :display-status.sync="showTips"
            class="outter-quote-permission"
            :style="{ top: `${isInAPP ? naviHeight : 0}px` }"
            :market="stockMarket"
        ></quote-permission>
        <div :style="{ height: `${showTips ? quotePermissionHeight : 0}px` }"></div>
        <div class="top_info">
            <div>
                <div class="flex-c mar-b8">
                    <h5 class="f16 bold mar-r8">{{ obj.portfolioName }}</h5>
                    <portfolio-tag :portfolioType="obj.portfolioType"></portfolio-tag>
                </div>
                <remainingDayFollower :remainingDay="obj.foundDayNum" :follower="obj.followersNum" />
            </div>
            <div>
                <p class="big_value" v-riseFall="{ value: obj.totalReturn, base: 2, sign: true }"></p>
                <p class="label">{{ $t('accumulatedProfit') }}</p>
            </div>
        </div>
        <div class="expected_buy">
            <div class="title">
                <div class="title_text">{{ $t('simulation.estimatedAmount') }}</div>
                <div v-if="isMixinType" class="popover">
                    <van-popover v-model="periodSwitch" trigger="click" placement="bottom-start" :get-container="getPopoverContainer">
                        <ul class="list" @click="onPeriodChoose">
                            <li
                                class="item"
                                :class="{ selected: item.value === period }"
                                :data-key="item.value"
                                v-for="item in periodList"
                                :key="item.value"
                            >
                                {{ item.text }}
                            </li>
                        </ul>
                        <template #reference>
                            <label>
                                <span>{{ period | periodFilter(periodList) }}</span>
                                <multi-img name="angle_trigger" directory="fund" class="trigger"></multi-img>
                                <div ref="trigger" class="trigger-container"></div>
                            </label>
                        </template>
                    </van-popover>
                </div>
                <div class="simulation_label">
                    <div>{{ $t('simulation.trade') }}</div>
                </div>
            </div>
            <div class="input_container" :class="{ hasWrong: calcWrong(inputAmount) }">
                <div v-if="calcDigits(inputAmount)" class="unit_container">
                    <div class="line"></div>
                    <div class="unit">{{ calcDigits(inputAmount) }}</div>
                </div>
                <div class="currency">{{ currency }}</div>
                <amount-input
                    class="input-field"
                    v-model="displayAmount"
                    clearable
                    :placeholder="placeholder"
                    maxlength="9"
                    @blur="onBlur"
                    @input="onInput"
                    @clear="onClear"
                ></amount-input>
            </div>
            <!-- 错误提示 -->
            <div class="wrongTip" v-show="calcWrong(inputAmount)">{{ calcWrong(inputAmount) }}</div>
        </div>
        <tradeCollapseGroup
            class="collapse_group"
            v-for="(group, index) in holdingList"
            :key="index"
            :group="group"
            :isFund="isFund"
            :currency="currency"
            :rate="currentRate"
        ></tradeCollapseGroup>
        <div class="footer">
            <div class="disclaimer" v-for="item in [0, 1, 2, 3, 4, 5]" :key="item">
                {{ $t(`simulation.disclaimer${item}`) }}
            </div>
        </div>
        <div class="trade_container">
            <div class="trade" :class="{ disable: !tradable }" @click="onTradeClick">{{ $t('simulation.buyIn') }}</div>
        </div>
        <div :style="{ height: `90px` }"></div>
        <van-dialog v-model="showDialog" width="280" :title="$t('sweetTip')" :confirm-button-text="$t('iKnow')">
            <div class="dialog_container">
                <div class="top_message">{{ $t('follow.calcTipTitle') }}</div>
                <div class="message_box">
                    <span>{{ $t('follow.calcTipForInputAmount') }}</span>
                    <span class="value">{{ this.currentInputAmount }}{{ this.currencyFilter(this.currency) }}</span>
                </div>
                <div class="message_box">
                    <span>{{ $t('follow.calcTipForSystemAmount') }}</span>
                    <span class="value highlight">{{ this.systemAmount }}{{ this.currencyFilter(this.currency) }}</span>
                </div>
                <div v-if="!isGreaterOrEqual(this.systemAmount, this.stockBestAmountFixed)" class="message_box">
                    <span>{{ $t('follow.calcTipForBestAmount') }}</span>
                    <span class="value">{{ this.stockBestAmountFixed }}{{ this.currencyFilter(this.currency) }}</span>
                </div>
                <div class="message_box">
                    <span>{{ $t('follow.calcTipForStockCount') }}</span>
                    <span class="value">{{ this.canBuyCount }}{{ $t('zhi') }}</span>
                </div>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue'
import remainingDayFollower from './components/remainingDayFollower.vue'
import portfolioTag from './components/portfolioTag.vue'
import AmountInput from '@/components/AmountInput.vue'
import tradeCollapseGroup from './components/tradeCollapseGroup.vue'
import QuotePermission from './components/quotePermission.vue'
import portfolioTradeCalcMixin from '@/views/fund/follow/mixins/portfolioTradeCalcMixin'
import NP from 'number-precision'

import { isTenantApp } from '@/utils'
import { PortfolioHoldingAllocation } from '@/apis/followInvest/index.js'
import { amountFilter } from '@/config/filters.js'
import { keepDecimals } from '@/utils'
import { currencyMap } from '@/config/common'
import { isEmpty } from 'lodash'
import portfolioTradePrecheckMixin from '@/views/fund/follow/mixins/portfolioTradePrecheckMixin'

var SCUnit = {
    inputAmount: '',
    isGotoRealTrade: false,
}
const kSCUnitCacheKey = 'kSCUnitCacheKey'

export default {
    name: 'simulation-calculator',
    mixins: [portfolioTradePrecheckMixin, portfolioTradeCalcMixin],
    components: {
        NavigationBar,
        AmountInput,
        portfolioTag,
        QuotePermission,
        tradeCollapseGroup,
        remainingDayFollower,
    },
    filters: {
        periodFilter(v, list) {
            return ((list || []).find(i => i.value === v) || {}).text
        },
    },
    data() {
        return {
            naviHeight: 0,
            rateList: [],
            showTips: false,
            periodSwitch: false,
            showDialog: false,
            displayAmount: '',
            systemAmount: '', // 系统计算金额
            currentInputAmount: '',
            lastInputAmount: '',
            canBuyCount: 0,
            stockRatio: 0,
        }
    },
    computed: {
        isNotInHLAndWTApp() {
            return !this.$env.isInApp
        },
        isInAPP() {
            return isTenantApp()
        },
        portfolioId() {
            return Number(this.$route.query.portfolioId)
        },
        inputAmount() {
            return this.displayAmount.replace(/,/g, '')
        },
        stockMarket() {
            return { 1: ['hk'], 2: ['us'], 4: ['hk', 'us'] }[this.obj.portfolioType]
        },
        tradable() {
            return NP.minus(this.inputAmount, 0) > 0 && this.calcWrong(this.inputAmount) === ''
        },
        placeholder() {
            if (this.isFund) {
                return `${this.amountFormat(this.fundMinInitial)}` + this.currencyFilter(this.currency) + this.$t('trade.qi')
            }
            return '0.00'
        },
        quotePermissionHeight() {
            const fontSize = document.documentElement.style.fontSize.replace('px', '')
            return NP.times(NP.divide(32, 100), fontSize)
        },
    },
    created() {
        this.getData()
        this.getHoldingList()
        this.getExchangeRate()
    },
    mounted() {},
    beforeDestroy() {},
    methods: {
        async getHoldingList() {
            try {
                const data = await PortfolioHoldingAllocation({
                    id: this.portfolioId,
                    queryType: 1,
                })
                const { detail } = data.result

                this.stockRatio = 0
                if (this.isFund) {
                    detail?.holding?.forEach(item => {
                        item.holding = item.industryHolding
                        item.marketType = item.industryCode
                        this.stockRatio = NP.plus(this.stockRatio, item.ratio)
                    })
                    this.holdingList = (detail && detail.holding) || []
                } else {
                    this.holdingList = (detail && detail.marketHolding) || []
                    this.holdingList.forEach(item => {
                        this.stockRatio = NP.plus(this.stockRatio, item.ratio)
                    })
                }
                this.stockRatio = NP.divide(this.stockRatio, 100)
                console.log('data===>detail', this.holdingList)

                console.log(`stock Best Amount ${this.startStockAmount} Fixed: ${this.stockBestAmountFixed} fund ${this.fundMinInitial}`)
                const cache = sessionStorage.getItem(kSCUnitCacheKey)
                sessionStorage.removeItem(kSCUnitCacheKey)
                if (!isEmpty(cache)) {
                    SCUnit = JSON.parse(cache)
                }
                if (SCUnit.isGotoRealTrade) {
                    SCUnit.isGotoRealTrade = false
                    this.displayAmount = SCUnit.inputAmount
                    this.calc(false, true)
                }
            } catch (e) {
                console.log('error', e)
            }
        },
        //返回输入位数
        calcDigits(num) {
            num = num + ''
            num = num.replace(/,/g, '')
            if (Number(num) == 0) {
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
        async onTradeClick() {
            if (!this.tradable) {
                return
            }

            if (!(await this.check(this.obj))) return

            const copy = []
            this.holdingList.forEach(group => {
                const copyGroup = {
                    holding: [],
                    marketType: group.marketType,
                    ratio: group.ratio,
                }

                group.holding.forEach(item => {
                    if (this.isFund) {
                        copyGroup.holding.push({
                            currency: item.currency,
                            market: item.market,
                            minInitial: item.minInitial,
                            name: item.name,
                            productCode: item.productCode,
                            productType: item.productType,
                            ratio: item.ratio,
                            lotNum: item.lotNum,
                            investFocusDegree: item.investFocusDegree,
                            symbol: item.fundID,
                            investObjective: item.investObjective,
                            investYear: item.investYear,
                            isDerivative: item.isDerivative,
                            riskRating: item.riskRating,
                        })
                    } else {
                        copyGroup.holding.push({
                            currency: item.currency,
                            latestPrice: item.latestPrice,
                            market: item.market,
                            minTradeUnit: item.minTradeUnit,
                            name: item.name,
                            productCode: item.productCode,
                            productType: item.productType,
                            ratio: item.ratio,
                            lotNum: item.lotNum,
                        })
                    }
                })

                copy.push(copyGroup)
            })

            const map = {
                portfolioType: this.obj.portfolioType,
                holdingList: copy,
                currency: this.currency,
            }
            console.log('simulation_result', map)
            localStorage.setItem('simulation_result', JSON.stringify(map))
            SCUnit.inputAmount = this.currentInputAmount
            SCUnit.isGotoRealTrade = true
            sessionStorage.setItem(kSCUnitCacheKey, JSON.stringify(SCUnit))
            this.$router.push({
                path: `/follow/real-order`,
                query: {
                    portfolioId: this.portfolioId,
                },
            })
        },
        //检测输入值返回错误信息
        calcWrong(num) {
            if (this.isStock) {
                return ''
            }
            if (num == '' || this.displayAmount == '') {
                return ''
            }
            const currencyName = this.currencyFilter(this.currency)
            if (Number(num) < Number(this.fundMinInitial)) {
                return this.$t('follow.minInitialAmountText', {
                    minInitial: this.amountFormat(keepDecimals(this.fundMinInitial, 2)),
                    currencyName: currencyName,
                })
            } else if (Number(num) > 99999999.99) {
                return `${this.$t('trade.cgmrjexzdbzdmr')}${currencyName}`
            }
            return ''
        },
        onClear() {
            this.displayAmount = ''
            this.calcStock(false)
        },
        onInput() {},
        onBlur() {
            if (this.lastInputAmount === this.inputAmount) {
                return
            }
            this.calc(true)
        },
        calc(needDialog, update = false) {
            if (this.isFund) {
                let total = 0
                if (NP.minus(this.inputAmount, this.fundMinInitial) >= 0) {
                    const calcAmount = NP.divide(this.inputAmount, this.stockRatio)
                    this.currentInputAmount = this.amountFormat(this.displayAmount, 2)
                    this.leadHoldingList.forEach(item => {
                        const number = NP.times(calcAmount, NP.divide(item.ratio, 100))
                        item.lotNum = number
                        total = NP.plus(total, item.lotNum)
                    })
                }
                this.$nextTick(() => {
                    this.displayAmount = this.amountFormat(total, 2)
                    this.lastInputAmount = this.inputAmount
                    if (Number(this.inputAmount) === 0) {
                        this.displayAmount = ''
                    }
                    this.refresh()
                })
            } else {
                this.calcStock(needDialog, update)
            }
        },
        calcStock(needDialog, update = false) {
            let total = 0
            const isBest = NP.minus(this.inputAmount, this.stockBestAmountFixed.replace(/,/g, '')) === 0
            let calcAmount = NP.divide(this.inputAmount, this.stockRatio)
            if (isBest) {
                calcAmount = this.startStockAmount
            }
            this.currentInputAmount = this.amountFormat(this.displayAmount, 2)
            this.leadHoldingList.forEach(item => {
                // 整手股数
                const number = this.calcNumberOfStock(calcAmount, item)
                item.lotNum = number
                total = NP.plus(total, NP.times(number, this.calcPrice(item)))
            })
            let canBuyCount = 0
            this.leadHoldingList.forEach(item => {
                // 换算汇率价格
                const price = this.calcPrice(item)
                if (item.lotNum) {
                    canBuyCount = NP.plus(canBuyCount, 1)
                    if (isBest) {
                        item.nowRatio = NP.divide(NP.times(item.lotNum, price), NP.divide(this.stockBestAmount, this.stockRatio))
                    } else {
                        item.nowRatio = NP.divide(NP.times(item.lotNum, price), calcAmount)
                    }
                    item.nowRatio = NP.times(item.nowRatio, 100)
                } else {
                    item.nowRatio = 0
                }
            })
            this.$nextTick(() => {
                if (needDialog) {
                    this.displayAmount = this.amountFormat(total, 2)
                    this.lastInputAmount = this.inputAmount
                    this.systemAmount = this.displayAmount
                    this.canBuyCount = canBuyCount
                    this.showDialog = true
                    if (Number(this.inputAmount) === 0) {
                        this.displayAmount = ''
                    }
                }
                if (update) {
                    this.displayAmount = this.amountFormat(total, 2)
                    this.lastInputAmount = this.inputAmount
                    this.systemAmount = this.displayAmount
                    if (Number(this.inputAmount) === 0) {
                        this.displayAmount = ''
                    }
                }

                this.refresh()
            })
        },
        amountFormat(v, decimal = 2) {
            v = v + ''
            v = v.replace(/,/g, '')
            return amountFilter(keepDecimals(v, decimal))
        },
        refresh() {
            this.holdingList = JSON.parse(JSON.stringify(this.holdingList))
        },
        onPeriodChoose(e) {
            this.period = e.target.dataset.key
            this.onClear()
        },
        getPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },
        currencyFilter(v) {
            return currencyMap.keyValueMap[v] || ''
        },
        isGreaterOrEqual(v1, v2) {
            v1 = v1 + ''
            v2 = v2 + ''
            v1 = v1.replace(/,/g, '')
            v2 = v2.replace(/,/g, '')
            return NP.minus(v1, v2) >= 0
        },
        goBack() {
            if (this.$jsBridge) {
                this.$jsBridge.close()
            } else {
                window.close()
            }
        },
    },
}
</script>

<style scoped lang="less">
.simulation-calculator {
    position: relative;
    z-index: auto;
    padding: 12px;
    background: #f9f9f9;

    .top_info {
        position: relative;
        z-index: 10;
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        padding: 12px 10px 12px 12px;
        color: #2f2f2f;
        background: #fff;
        border-radius: 8px;

        .big_value {
            font-weight: bold;
            font-size: 18px;
            line-height: 26px;
            text-align: right;
        }

        .label {
            color: #666;
            font-size: 12px;
            line-height: 16px;
            text-align: right;
        }
    }

    .expected_buy {
        position: relative;
        z-index: 10;
        padding: 12px 12px 20px;
        background: #fff;
        border-radius: 8px;

        .title {
            display: flex;
            margin-bottom: 16px;

            .title_text {
                margin-right: 12px;
                font-weight: bold;
                font-size: 16px;
                line-height: 22px;
            }

            .simulation_label {
                position: absolute;
                top: 13px;
                right: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 52px;
                height: 18px;
                color: #fff;
                font-weight: bold;
                font-size: 10px;
                line-height: 14px;
                background-image: url('~@/assets/images/fund/simulation_bg.png');
                background-repeat: no-repeat;
                background-size: contain;
            }

            .popover {
                position: relative;
                z-index: 12;
                display: flex;
                flex-direction: row;
                align-items: center; // 上下居中
                color: #666;
                font-size: 14px;

                label {
                    display: flex;
                    align-items: center; // 上下居中
                    // justify-content: center; // 左右居中

                    & > span {
                        flex: 1 0 auto;
                    }

                    img {
                        width: 16px;
                        margin-left: 16px;

                        &.trigger {
                            width: 6px;
                            margin-left: 4px;
                        }
                    }

                    .trigger-container {
                        position: relative;
                    }
                }

                .list {
                    width: 69px;
                    overflow: hidden;
                    border-radius: 4px;

                    .item {
                        color: #2f2f2f;
                        font-size: 14px;
                        line-height: 36px;
                        text-align: center;
                        background-color: #fff;
                        box-shadow: inset 0 -0.5px 0 #efefef;

                        &.selected {
                            color: #ff6907;
                        }
                    }
                }
            }
        }

        .input_container {
            position: relative;
            display: flex;
            align-items: center;
            height: 70px;
            border: 1px solid #e8e8e8;
            border-radius: 8px;

            .currency {
                margin-left: 12px;
                color: #333;
                font-weight: bold;
                font-size: 20px;
                line-height: 28px;
            }

            .input-field {
                color: #000;
                font-weight: bold;
                font-size: 28px;
                line-height: 38px;
            }

            .unit_container {
                position: absolute;
                top: 8px;
                left: 68px;
                z-index: 1;
                display: flex;
                color: #666;
                font-size: 8px;
                line-height: 12px;

                .line {
                    width: 1px;
                    height: 12px;
                    margin-right: 2px;
                    background-color: #d6d6d6;
                }

                .unit {
                    padding: 0 2px;
                    background: #f0f0f0;
                    border-radius: 1px;
                }
            }

            ::v-deep .van-field {
                padding: 10px 12px;
                color: #000;
                font-weight: bold;
                font-size: 28px;
                line-height: 38px;

                &.smaller {
                    font-size: 24px;
                    line-height: 34px;
                }

                input::-webkit-input-placeholder {
                    /* WebKit browsers 适配谷歌 */
                    color: #9c9c9c;
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }

                input:-moz-placeholder {
                    /* Mozilla Firefox 4 to 18 适配火狐 */
                    color: #9c9c9c;
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }

                input::-moz-placeholder {
                    /* Mozilla Firefox 19+ 适配火狐 */
                    color: #9c9c9c;
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }

                input:-ms-input-placeholder {
                    /* Internet Explorer 10+  适配ie */
                    color: #9c9c9c;
                    font-weight: normal;
                    transform: scale(20 / 28);
                    transform-origin: left;
                }
            }
        }

        .hasWrong {
            border: 1px solid #f31414;
        }

        .wrongTip {
            margin-top: 6px;
            color: #f31414;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .collapse_group {
        margin-top: 12px;
    }

    .footer {
        margin-top: 32px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;

        .disclaimer {
            margin-bottom: 8px;

            &:first-of-type {
                font-weight: 700;
            }
        }
    }

    .trade_container {
        position: fixed;
        bottom: 0;
        left: 0;
        display: flex;
        width: 100%;
        height: calc(58px + 34px);
        background: #fff;
        border-top: 1px solid #efefef;

        .trade {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 44px;
            margin: 11px 28px 0;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
            background: #3b95ff;
            border-radius: 22px;
        }

        .disable {
            background: #3b95ff4d;
        }
    }

    .outter-quote-permission {
        & + .pad-t44 {
            padding-top: 44px;
        }
    }
}

.dialog_container {
    margin: 0 16px 22px;

    .top_message {
        margin-bottom: 11px;
        color: #666;
        font-weight: 400;
        font-size: 12px;
        line-height: 17px;
    }

    .message_box {
        display: flex;
        justify-content: space-between;
        color: #9c9c9c;
        font-size: 14px;
        line-height: 32px;

        .value {
            color: #2f2f2f;
            font-weight: bold;
            text-align: right;
        }

        .highlight {
            color: #ff6907;
        }
    }
}

.bg_image {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 266px;
    margin: 0;
    background: linear-gradient(to bottom, #d4e8ff 170px, #d4e8ff00 100%);
}
</style>
