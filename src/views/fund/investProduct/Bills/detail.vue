<!-- 另类(票据) 详情 和 买入 -->
<template>
    <div>
        <div class="page" :class="{ 'buy-page': isBuyType }" :key="`${type}_${id}`" v-if="!noDataFlag && loaded">
            <!-- 产品信息 -->
            <div class="card name-card">
                <div class="card-title">
                    {{ quoteInfo?.name | emptyFilter }}
                    <BillTags :data="quoteInfo" :label="detailData.label" />
                </div>
                <div class="card-main" v-if="isDetail && !isFCN">
                    <div class="rate-box" v-if="!hiddenReferenceRange">
                        <div class="rate" :class="{ rise: isRise, fall: !isRise }">{{ getYield(quoteInfo) | emptyFilter }}</div>
                        <div class="sub">{{ isMarketingBill ? $t('bills.referenceRange') : $t('bills.annualizedYTM') }}</div>
                    </div>
                    <div class="rest-box" :class="{ 'rest-box-single': hiddenReferenceRange }">
                        <div class="rest">{{ quoteInfo?.maturityDate | emptyFilter }}</div>
                        <div class="sub">{{ $t('bills.remainingTerm') }}</div>
                    </div>
                </div>
                <div v-if="showReferenceTip()" class="descriptionBox">
                    <portfolioBrief
                        class="description"
                        :text="$t('profitDesc') + '：' + quoteInfo.referenceIncomeDesc"
                        @onClick="showBriefDialog"
                    ></portfolioBrief>
                </div>
                <div class="card-main" v-if="isDetail && isFCN">
                    <div class="rate-box">
                        <div class="rate" v-riseFall="{ value: detailData?.FCNInfo.coupon, rate: true, sign: true, thousand: true }"></div>
                        <div class="sub">{{ $t('fcn.coupon') }}</div>
                    </div>
                    <div class="rest-box">
                        <div class="rest">{{ getFrequencyStr(this.detailData?.FCNInfo) }}</div>
                        <div class="sub">{{ $t('fcn.knockOutFrequency') }}</div>
                    </div>
                </div>
            </div>
            <!-- 详情页 -->
            <template v-if="isDetail">
                <template v-if="!isFCN">
                    <!-- 产品简介 -->
                    <div class="card">
                        <div class="card-title">
                            {{ $t('bills.productIntroduction') }}
                        </div>
                        <div class="card-main">
                            <ProductIntro :text="detailData?.introduction || '--'"></ProductIntro>
                        </div>
                    </div>
                    <!-- 产品特点 -->
                    <div class="card">
                        <div class="card-title">
                            {{ $t('bills.productFeature') }}
                        </div>
                        <div class="card-main">
                            <div class="intro" v-html="detailData?.feature"></div>
                        </div>
                    </div>
                    <!-- 产品文件 -->
                    <div class="card">
                        <div class="card-title">
                            {{ $t('bills.productFiles') }}
                        </div>
                        <div class="card-main small-gap">
                            <div class="list">
                                <div class="list-header">
                                    <span>{{ $t('bills.type') }}</span>
                                    <span>{{ $t('bills.updateTime') }}</span>
                                </div>
                                <div class="list-item" v-for="item in productFiles" :key="item.fileName" @click="handleFileClick(item)">
                                    <div class="list-item__name">
                                        <multi-img class="file-icon" name="icon_pdf" directory="fund" />
                                        <span>{{ item.fileName }}</span>
                                    </div>
                                    <div class="list-item__time">{{ item.updateTime }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <!-- 产品发行人 -->
                    <div class="card">
                        <div class="card-title">
                            {{ $t('fcn.issuers') }}
                        </div>
                        <div class="card-main">
                            <div class="intro" v-html="detailData?.issuers"></div>
                        </div>
                    </div>
                    <!-- 挂钩标的 -->
                    <div class="card pad-b-8">
                        <div class="card-title">
                            {{ $t('fcn.detailObj') }}
                        </div>
                        <div class="card-main small-gap-7">
                            <div class="desc">
                                <div class="desc-item" v-for="item in underlyingStock" :key="item.key">
                                    <div class="label h1">{{ item.label('') }}</div>
                                    <div class="value">{{ item.value('') }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 产品选项 -->
                    <div class="card pad-b-8">
                        <div class="card-title">
                            {{ $t('fcn.productOptions') }}
                        </div>
                        <div class="card-main small-gap-7">
                            <div class="desc">
                                <div class="desc-item" v-for="item in productOptions" :key="item.key">
                                    <div class="label">{{ $t(item.label) }}</div>
                                    <div class="value">{{ item.value() }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 观察选项 -->
                    <div class="card pad-b-8">
                        <div class="card-title">
                            {{ $t('fcn.observeOptions') }}
                        </div>
                        <div class="card-main small-gap-7">
                            <div class="desc">
                                <div class="desc-item" v-for="item in observeOptions" :key="item.key">
                                    <div class="label">{{ $t(item.label) }}</div>
                                    <div class="value">{{ item.value(tradeInfo?.[item.key]) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
                <!-- 交易规则 -->
                <div class="card pad-b-8">
                    <div class="card-title">
                        {{ $t('bills.tradeRules') }}
                    </div>
                    <div class="card-main small-gap-7">
                        <div class="desc">
                            <div class="desc-item" v-for="item in tradeRules" :key="item.key">
                                <div class="label">{{ $t(item.label) }}</div>
                                <div class="value">{{ item.value(tradeInfo?.[item.key]) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="!isFCN" class="risk-remind">
                    <p>{{ $t('billRiskRemind', { day: riskRemindMsg }) }}</p>
                </div>
                <div v-else>
                    <div class="fcn-risk-remind">
                        <template v-if="inSale">
                            <span>{{ $t('fcn.validSell') }}</span>
                            <span class="h2">
                                {{ detailData?.FCNInfo.quotationTime | dateTimeFormat }}
                                {{ ' - ' }}
                                {{ detailData?.FCNInfo.expirationTime | dateTimeFormat }}
                            </span>
                        </template>
                        <template v-else>
                            <span>{{ $t('fcn.validQuotationExpiration') }}</span>
                        </template>
                    </div>
                </div>
                <RiskStatement></RiskStatement>
            </template>
            <!-- 认购页 -->
            <template v-else>
                <!-- 选择产品 -->
                <div class="card select-card">
                    <div class="card-title">
                        {{ $t('bills.selectProduct') }}
                    </div>
                    <div class="card-main small-gap">
                        <div class="select-product">
                            <van-field
                                readonly
                                clickable
                                :value="selectedProduct?.text"
                                :placeholder="$t('bills.selectPlaceholder')"
                                right-icon="arrow"
                                @click="selectProductVisible = true"
                            />
                        </div>
                    </div>
                </div>
                <!-- 认购金额 -->
                <div class="card amount-card">
                    <div class="card-title">
                        {{ $t('bills.buyAmount') }}
                    </div>
                    <div class="card-main small-gap" :class="{ 'has-error': showError }">
                        <div class="buy-input">
                            <div class="numTip" v-show="calcDigits(buyAmount)">
                                <i></i>
                                <div v-if="isUsemargin" :class="{ 'is-use-margin': isUsemargin }">
                                    <span>{{ calcDigits(buyAmount) }}</span>
                                    <img src="~@/assets/images/fund/dot_line.png" />
                                    <span>{{ $t('willUseMargin') }}</span>
                                </div>
                                <span v-else>{{ calcDigits(buyAmount) }}</span>
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
                                                amount: humanNum(tradeInfo.minInitial, 0, true, this.$i18n),
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
                                <div class="buy-all" @click="handleFastItemClick({}, true)">{{ $t('bills.buyAll') }}</div>
                            </div>
                        </div>
                        <div v-show="showError" class="error-tips">
                            {{ errorTips }}
                        </div>
                        <div class="fast-click">
                            <span class="fast-item" v-for="(item, index) in fastArr" :key="index" @click="handleFastItemClick(item)">
                                {{ item.value }}
                            </span>
                        </div>
                        <div class="tips">
                            <div class="tips-item">
                                <label class="label">{{ $t('bills.startAmount') }}:</label>
                                <label>
                                    {{
                                        $t('bills.startAmountValue', {
                                            amount: amountFilter(tradeInfo?.minInitial),
                                            currency: $t(currency),
                                            unitAmount: amountFilter(tradeInfo?.unitAmount),
                                        })
                                    }}
                                </label>
                            </div>
                            <div class="flex-c mar-t10">
                                <div class="tips-item">
                                    <label class="label">{{ $t('bills.buyFeeRate') }}:</label>
                                    <label>{{ `${tradeInfo?.buyFee ?? '--'}%` }}</label>
                                </div>
                                <div class="tips-item" :style="{ 'margin-left': '28px' }">
                                    <label class="label">{{ $t('bills.estimateCost') }}:</label>
                                    <label>{{ estimateCost | amountFilter }}{{ $t(currency) }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 可用金额 -->
                <capital-detail
                    v-model="capitalGap"
                    ref="capitalDetailRef"
                    @showWithdrawalBalanceTip="v => (showWithdrawalBalanceTip = v)"
                    @buyType="v => (buyType = v)"
                    @isUsemargin="v => (isUsemargin = v)"
                    @isUsePurchasingPower="v => (isUsePurchasingPower = v)"
                    :product-buy-type="productBuyType"
                    :currency="currency"
                    :trade-amount="allCost"
                    :andNeedDialogMessage="$t(quoteInfo.isPP ? 'andNeedMsgPP' : 'andNeedMsgCash')"
                    @getWithDrawalBalance="fetchAssetsDetail"
                ></capital-detail>

                <section class="card calc-cost total-amount pad-12" v-show="isMarketingBill">
                    <ul>
                        <li>
                            <span class="label">{{ $t('trade.tradeAmount') }}</span>
                            <span class="value">{{ realAmount | amountFilter }}</span>
                        </li>
                        <li>
                            <span class="label">{{ $t('buyRate') }}</span>
                            <span class="value">{{ estimateCost | amountFilter }}</span>
                        </li>
                        <li class="all-price">
                            <span class="label">{{ $t('ygjfAmount') }}</span>
                            <span class="value">{{ allCost | amountFilter }}</span>
                        </li>
                    </ul>
                </section>

                <!-- 认购投资产品占您的资产比例 -->
                <div class="card radio-card">
                    <div class="card-main">
                        <div class="title">{{ $t('trade.investAssetRatio') }}</div>
                        <div class="t-tips">{{ $t('productDemand') }}{{ $t(`bills.payRate.${quoteInfo.investFocusDegree}`) }}</div>
                        <div class="radio">
                            <van-radio-group v-model="radio" direction="horizontal" @change="handleRadioChange">
                                <van-radio v-for="i in investFocusDegreeList" :key="i" :name="i">
                                    <template v-slot:icon="{ checked }">
                                        <multi-img
                                            :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                            directory="fund"
                                            style="width: 16px"
                                        ></multi-img>
                                    </template>
                                    <span>{{ $t(`bills.payRate.${i}`) }}</span>
                                </van-radio>
                            </van-radio-group>
                            <p class="custips" v-if="showTips">
                                {{ $t('jzdtips') }}
                            </p>
                        </div>
                    </div>
                </div>
                <!-- 说明 -->
                <div class="prompt">
                    {{ $t('bills.prompt') }}
                </div>
                <div class="xgxy">
                    <p>{{ $t('readContent') }}</p>
                    <div>
                        <i v-for="(item, idx) in fileList" :key="idx">《{{ item.fileName }}》</i>
                        《{{ $t('protocol.clientStatement') }}》
                        <span @click="goProtocol">{{ $t('checkTheAgreement') }}</span>
                    </div>
                </div>
            </template>

            <!-- 认购 -->
            <div class="footer-box" :class="{ web: isNotInHlOrWt }">
                <template v-if="!isBuyType">
                    <div class="suspension" v-if="quoteInfo.isActive === 0">{{ $t('soldOut') }}</div>
                    <div class="suspension" v-else-if="!isFCN && quoteInfo.tradingStatus === 2">{{ $t('suspensionMsg') }}</div>
                    <div class="suspension" v-else-if="!isFCN && quoteInfo.tradingStatus === 3">{{ $t('billNoTradeTime') }}</div>
                    <div ref="footerTemp"></div>
                </template>
                <div class="buy-footer" v-else-if="!isNotInHlOrWt">
                    <div class="agree" v-if="isBuyType">
                        <van-checkbox icon-size="16" checked-color="#2F2F2F" v-model="agreeFlag">
                            <template v-slot:icon="{ checked }">
                                <multi-img
                                    :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                    directory="fund"
                                    style="width: 15px"
                                ></multi-img>
                            </template>
                            <span style="color: #9c9c9c">
                                {{ $t('trade.bryydbty') }}
                                <span style="color: #043799" @click.stop="goProtocol">《{{ $t('trade.xgxywj') }}》</span>
                                及
                                <span style="color: #043799" @click="goClientStatement">《{{ $t('protocol.clientStatement') }}》</span>
                            </span>
                        </van-checkbox>
                    </div>
                    <div class="buy-btn-box">
                        <van-button class="buy-btn" block round color="#FF6907" @click="handleBuyBtnClick" :disabled="isBuyType && !canSign">
                            {{ $t('bills.buy') }}
                        </van-button>
                    </div>
                </div>
            </div>

            <!-- 选择框 -->
            <van-popup v-model="selectProductVisible" round position="bottom">
                <div class="picker">
                    <div
                        class="picker-item"
                        :class="{ selected: selectedProduct?.symbol === item.symbol }"
                        v-for="item in formatedProducts"
                        :key="item.symbol"
                        @click="handleSelectProductConfirm(item)"
                    >
                        {{ item.text }}
                    </div>
                </div>
            </van-popup>

            <!-- 二次确认 -->
            <van-dialog
                v-model="buyConfirmVisible"
                :title="$t('trade.rgqr')"
                :show-cancel-button="true"
                cancel-button-color="#2F2F2F"
                confirm-button-color="#FF6307"
                :confirm-button-text="$t('trade.queding')"
                @confirm="handleSubmit"
                :before-close="beforeCloseSubmit"
            >
                <div class="diagBox">
                    <p class="purchasing-tip border-bottom-1px" v-if="isUsePurchasingPower.value" v-html="isUsePurchasingPowerTip"></p>
                    <div class="item">
                        <div class="left">{{ $t('tradeAccount') }}</div>
                        <div class="right">{{ accts.subAcctId }}</div>
                    </div>
                    <div class="item">
                        <div class="left">{{ $t('trade.cpmc') }}</div>
                        <div class="right">{{ quoteInfo?.name }}</div>
                    </div>
                    <div class="item">
                        <div class="left">{{ $t('trade.rgje') }}</div>
                        <div class="right">{{ realAmount | amountFilter }}{{ currency }}</div>
                    </div>
                    <div class="item">
                        <div class="left">{{ $t('buyRate') }}</div>
                        <div class="right">{{ estimateCost | amountFilter }}{{ currency }}</div>
                    </div>
                    <div class="item">
                        <div class="left">{{ $t('transactionAmount') }}</div>
                        <div class="right">{{ allCost | amountFilter }}{{ currency }}</div>
                    </div>
                </div>
            </van-dialog>
        </div>
        <div class="empty-container" v-if="noDataFlag && loaded">
            <Empty :showImg="true" imgName="empty-status" height="2.87rem">
                <h5 class="f16 c-main lh-22 mar-t12 mar-b8 bold">{{ $t('soldOut') }}</h5>
                <div class="f14 lh-20 h2-white">{{ $t('concatService') }}</div>
            </Empty>
            <button class="go-back-btn" @click="goBack">{{ $t('goBack') }}</button>
            <div class="contact-wrapper flex-c" @click="onCallMe">
                <multi-img name="icon_kefu" directory="common" width="12" height="12" />
                <span class="mar-14">{{ $t('concatUs') }}</span>
            </div>
        </div>
        <van-dialog width="75%" v-model="isShowDialog" :title="$t('profitDesc')" :confirm-button-text="$t('confirm')">
            <div class="dialog-content">{{ quoteInfo.referenceIncomeDesc }}</div>
        </van-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import dayjs from 'dayjs'
import Vue from 'vue'
import ProductIntro from './components/ProductIntro.vue'

import { thousandsFilter } from '@/config/filters.js'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt.js'
import verifyMixin from '@/mixins/business/verifyMixins.js'

import BillTags from './BillTags.vue'

import { isHLApp, humanNum, floatToRatio, toFixed, isTHSApp, isInRyH5, isInOutsideH5, isUndefined, isNull } from '@/utils'
import { accAdd, accMul, accSub } from '@/utils/accurate'

import { getBillsDetail, getBillsFiles, getBillsQuoteInfo, getBillsProductList } from '@/apis/fund/note'
import { noteSubscribe } from '@/apis/wealth/index.js'
import { getLangType } from '../../../../utils'
import { accountTypeMap, currencyMap, PRODUCT_BUY_TYPE } from '@/config/common'
import capitalDetail from '@/components/capitalDetail'
import pathnames from '@/config/H5Pathname.js'
import Empty from '@/components/Empty.vue'
import wealthOrderInstructionMixin from '@/mixins/wealthOrderInstructionMixin.js'
import NP from 'number-precision'
import { knockOutTypeMap, knockInTypeMap } from './common'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import RiskStatement from '@/views/fund/components/RiskStatement.vue'
import portfolioBrief from '../../follow/components/portfolioBrief.vue'

// 金额格式化
const amountFilter = function (val) {
    return toFixed(thousandsFilter(val ?? ''), 2)
}
const dateTimeFormat = v => {
    return v ? dayjs(v).format('YY/MM/DD HH:mm') : '--'
}

export default {
    name: 'bills-detail',
    mixins: [verifyMixin, wealthOrderInstructionMixin],
    components: {
        BillTags,
        capitalDetail,
        ProductIntro,
        Empty,
        RiskStatement,
        portfolioBrief,
    },
    data() {
        return {
            // 数据
            notSell: true, // 是否禁止卖出
            detailData: {},
            quoteInfo: {}, // 1-可交易 0-不可交易 2-暂停认购 3-非交易时段 暂停交易
            productFiles: [],
            protocolFiles: [],
            selectedProduct: undefined,
            buyAmount: '',
            maxPurchasingPower: 0,
            power: {},
            avaliableCash: 0,
            radio: 0,
            errorTips: '',
            products: [],
            investFocusDegreeList: [1, 2, 3, 4, 5],
            amountVerifyRules: [
                {
                    validator: () => {
                        return this.realAmount < this.tradeInfo?.minInitial
                    },
                    message: () => this.$t('bills.minLimitMsg', { amount: this.tradeInfo?.minInitial, currency: this.$t(this.currency) }),
                },
                // {
                //     validator: () => {
                //         return this.realAmount > this.tradeInfo?.maxInitial
                //     },
                //     message: () => this.$t('bills.maxLimitMsg', { amount: this.tradeInfo?.maxInitial, currency: this.$t(this.currency) })
                // },
                {
                    validator: () => {
                        return this.realAmount % this.tradeInfo?.unitAmount !== 0
                    },
                    message: () => this.$t('bills.unitLimitMsg', { amount: this.tradeInfo?.unitAmount }),
                },
                {
                    validator: () => {
                        return this.showWithdrawalBalanceTip
                    },
                    message: () => this.$t('tradeFailedOfMaxPPForDebt'),
                },
            ],

            // 控制
            agreeFlag: true,
            degreeFlag: false,
            selectProductVisible: false,
            buyConfirmVisible: false,
            showError: false,
            showTips: false,
            fileList: [],
            capitalGap: 0, // 资金差 = 总额估算 - 最大购买力
            isUsePurchasingPower: {
                value: false,
                insufficientAmount: 0, // 差值
                accountType: accountTypeMap.keysMap.cash,
            },
            isUsemargin: false,
            buyType: PRODUCT_BUY_TYPE.keysMap.cash,
            showWithdrawalBalanceTip: false,
            noDataFlag: false, // 无数据票据
            loaded: false,
            tradeLoginInstance: null, // 睿银站外H5票据输入交易密码校验
            isShowDialog: false,
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        isFCN() {
            return this.detailData?.noteProperty === 3
        },
        isMarketingBill() {
            //是否是挂钩类票据
            return this.detailData?.noteProperty === 4
        },
        hiddenReferenceRange() {
            //不展示目标参考区间
            return this.isMarketingBill && !this.isExist(this.quoteInfo.referenceIncomeMin) && !this.isExist(this.quoteInfo.referenceIncomeMax)
        },
        accountType() {
            return this.accts?.type
        },
        isMarginAccount() {
            return this.accountType === accountTypeMap.keysMap.margin
        },
        type() {
            return this.$route.params.type ?? 'detail'
        },
        isDetail() {
            return !this.isBuyType
        },
        isBuyType() {
            return this.type === 'buy'
        },

        id() {
            return this.$route.query.symbol ?? ''
        },

        // 货币
        currency() {
            return this.quoteInfo?.currency ?? 'USD'
        },

        tradeInfo() {
            return this.detailData?.tradeInfo ?? {}
        },

        // 快速选择
        fastArr() {
            const num = Math.ceil(this.tradeInfo?.minInitial / 10000) * 10000
            return [num, num * 5, num * 10].map(item => ({
                amount: item,
                value: humanNum(item, 0, true, this.$i18n),
            }))
        },

        // 金额 Number
        realAmount() {
            return Number(this.getAmountString(this.buyAmount))
        },

        // 费用估算=认购金额*认购费率
        estimateCost() {
            if (this.realAmount && this.tradeInfo?.buyFee) {
                return accMul(Number(this.realAmount), Number(this.tradeInfo?.buyFee / 100))
            }
            return 0
        },

        // 总额估算=认购金额+费用估算
        allCost() {
            return accAdd(this.realAmount, this.estimateCost)
        },

        // 资金差 = 总额估算 - 最大购买力
        // capitalGap() {
        //     if (!this.allCost) return 0
        //     return accSub(this.allCost, this.maxPurchasingPower)
        // },

        // 可选择产品列表
        formatedProducts() {
            return this.products.map(item => ({
                text: this.isMarketingBill
                    ? this.$t('bills.productPeriodText', { date: item.maturityDate, period: item.periodMonth || '--' })
                    : this.$t('bills.productText', { period: item.maturityDate, yield: item.yieldStr }),
                ...item,
            }))
        },

        // 前端计算的收益数据
        profitData() {
            const amount = accSub(
                accMul(accMul(this.realAmount, this.selectedProduct?.yield / 100), this.selectedProduct?.periodDay / 360),
                this.estimateCost
            )
            const date = dayjs()
                .add(this.selectedProduct?.periodDay ?? 0, 'd')
                .format('YYYY/MM/DD')

            return {
                date,
                amount: amount < 0 ? 0 : this.amountFilter(amount),
            }
        },

        // 是否不在恒利或网厅或睿银H5
        isNotInHlOrWt() {
            return !this.$env.isInApp && !isInRyH5()
        },

        // 是否可认购
        canSign() {
            return (
                this.selectedProduct &&
                this.realAmount > 0 &&
                this.agreeFlag &&
                this.degreeFlag &&
                this.capitalGap <= 0 &&
                !this.showError &&
                this.quoteInfo.tradingStatus === 1
            )
        },

        // 可用资金不足时是否可以展示“引导入金”按钮
        isShowDepositGuide() {
            return this.capitalGap > 0 || this.maxPurchasingPower <= 0
        },
        inSale() {
            return this.detailData?.quote?.inSale === 1
        },

        productBuyType() {
            const { isPP } = this.quoteInfo
            const { keysMap } = PRODUCT_BUY_TYPE
            if (isPP) {
                return keysMap.purchasingPower
            }
            return keysMap.cash
        },

        isUsePurchasingPowerTip() {
            const { value, insufficientAmount, accountType } = this.isUsePurchasingPower
            const currencyText = currencyMap.keyValueMap[this.quoteInfo.currency]
            const text = this.$t(accountType === accountTypeMap.keysMap.margin ? 'isUsePurchasingPowerMargin' : 'isUsePurchasingPowerCash', {
                amount: thousandsFilter(floatToRatio(insufficientAmount, { base: 2, rate: false, sign: false })),
                currency: currencyText,
            })
            return value ? text : ''
        },

        // HKindentify mixin 已经有这个变量了
        // subAccountId() {
        //     return this.$store.getters['user/getSubAccountId']
        // },

        // 定制单详情带过来的认购金额
        applyAmount() {
            return this.$route.query.amount ?? ''
        },
        // 交易规则字典
        tradeRules() {
            let list = [
                // 最小买入金额
                {
                    key: 'minInitial',
                    label: 'bills.minInitial',
                    value: val => `${this.amountFilter(val)}${this.$t(this.currency)}`,
                },
                // 单位金额
                {
                    key: 'unitAmount',
                    label: 'bills.unitAmount',
                    value: val => `${this.amountFilter(val)}${this.$t(this.currency)}`,
                },
                // 交易费用
                {
                    key: 'buyFee',
                    label: 'bills.buyFee',
                    value: val => `${val ?? '--'}%`,
                },
                //管理费
                {
                    key: 'managementFee',
                    label: 'managerFee',
                    value: val => `${val || '--'}%`,
                },
                // 交收时间
                {
                    key: 'settlementTimeNum',
                    label: 'fcn.effectiveDateOffset',
                    value: val => (val ? this.$t('fcn.XEffectiveWorkDay', { X: val }) : '--'),
                },
                // 结算托管费用
                {
                    key: 'custodian',
                    label: 'fcn.custodian',
                    value: val => `${val || '--'}`,
                },
                // 代收利息费用
                {
                    key: 'interest',
                    label: 'fcn.interest',
                    value: val => `${val || '--'}`,
                },
                // 到期兑付
                {
                    key: 'maturityPay',
                    label: 'fcn.maturityPay',
                    value: val => `${val || '--'}`,
                },
            ]
            if (this.isFCN) {
                list = list.filter(i => {
                    return i.key !== 'settlementTimeNum'
                })
            }
            if (!this.isMarketingBill || !this.tradeInfo.managementFee) {
                list = list.filter(i => {
                    return i.key !== 'managementFee'
                })
            }
            return list
        },
        // 挂钩标的
        underlyingStock() {
            return this.detailData?.FCNInfo.codeList.map(i => {
                return {
                    key: `${i.mkt}${i.code}`,
                    label: () => `${i.code}.${i.mkt.toUpperCase()}`,
                    value: () => i.name,
                }
            })
        },
        // 产品选项
        productOptions() {
            const fcn = this.detailData?.FCNInfo || {}
            const date = this.tradeInfo.settlementTimeNum
            return [
                {
                    key: 'minInitial',
                    label: 'fcn.productType',
                    value: () => `FCN`,
                },
                {
                    key: 'currency',
                    label: 'fundList.currency',
                    value: () => `${this.$t(this.currency)}`,
                },
                {
                    key: 'inquiryPeriod',
                    label: 'fcn.inquiryPeriod',
                    value: () => `${this.detailData?.quote?.periodMonth || '--'}`,
                },
                {
                    key: 'observationFrequency',
                    label: 'fcn.observationFrequency',
                    value: () => `${fcn.observationFrequency}`,
                },
                {
                    key: 'settlementTimeNum',
                    label: 'settlementTime',
                    value: () => (date ? this.$t('fcn.XEffectiveWorkDay', { X: date }) : '--'),
                },
            ]
        },
        observeOptions() {
            const fcn = this.detailData?.FCNInfo || {}
            const knockInPrice = floatToRatio(fcn.knockInPrice, { base: 2, sign: false })
            const isNone = fcn.knockInType === knockInTypeMap.KeyInteralMap.NONE
            return [
                {
                    key: 'strikePrice',
                    label: 'fcn.strikePrice',
                    value: () => floatToRatio(fcn.strikePrice, { base: 2, sign: false }),
                },
                {
                    key: 'knockOutType',
                    label: 'fcn.knockOutType',
                    value: () =>
                        `${knockOutTypeMap.interalLabelMap[fcn.knockOutType]} | ${floatToRatio(fcn.knockOutPrice, { base: 2, sign: false })}`,
                },
                {
                    key: 'knockInType',
                    label: 'fcn.knockInType',
                    value: () => `${knockInTypeMap.interalLabelMap[fcn.knockInType]} | ${isNone ? '--' : knockInPrice}`,
                },
            ]
        },
        isRise() {
            if (this.isMarketingBill) {
                //挂钩类票据产品
                if (this.isExist(this.quoteInfo.referenceIncomeMax)) {
                    return this.quoteInfo.referenceIncomeMax >= 0
                }
                return (this.quoteInfo.referenceIncomeMin ?? 0) >= 0
            }
            if (isNull(this.quoteInfo.yield) || isUndefined(this.quoteInfo.yield)) {
                return true
            }
            return this.quoteInfo.yield >= 0
        },
        riskRemindMsg() {
            if (this.tradeInfo.maturityPayDays) {
                return this.$t('numOfWorkday', { num: this.tradeInfo.maturityPayDays })
            }
            return this.tradeInfo.maturityPay
        },
    },
    watch: {
        type: {
            handler: async function (val) {
                this.$loading.show = true

                await Promise.all([
                    this.initInstuction('BILL'), // 初始化下单指令
                    this.fetchData(),
                ])
                if (this.noDataFlag) {
                    this.$loading.show = false
                    return false
                }
                await this.fetchQuoteInfo()

                if (val === 'buy') {
                    // 认购

                    // 设置title
                    const title = this.$t('bills.buyBill')
                    if (this.$jsBridge) {
                        this.$jsBridge.setTitle(title)
                    } else {
                        document.title = title
                    }

                    // 获取数据
                    await this.fetchProductList()
                    await this.getBasicInfo({ symbol: this.id })
                    this.fetchFiles({ type: 2 })

                    this.buyAmount = this.applyAmount
                } else {
                    // 离开认购页的时候清空输入金额
                    this.buyAmount = ''
                    // 详情
                    this.fetchFiles({ type: 1 })

                    // 生成按钮
                    if (!this.isNotInHlOrWt) {
                        if (!this.quoteInfo?.isActive) {
                            // 排除非交易时段状态
                            this.isDisbaled = true
                        }

                        // 初始化按钮
                        if (typeof this.$root.isLogin === 'boolean') {
                            await this.initButtons({ symbol: this.id })
                        }
                    }
                }

                this.$loading.show = false
            },
            immediate: true,
        },
    },
    filters: {
        emptyFilter(val) {
            return val ?? '--'
        },
        amountFilter,
        dateTimeFormat,
    },
    // 初始请求在watch type
    async created() {},
    methods: {
        // 工具方法
        floatToRatio,
        humanNum,
        amountFilter,
        isExist(val) {
            return !(isNull(val) || isUndefined(val))
        },
        getYield(item) {
            if (this.isMarketingBill) {
                //挂钩类票据产品
                if (this.isExist(item.referenceIncomeMax) && this.isExist(item.referenceIncomeMin)) {
                    if (item.referenceIncomeMax === item.referenceIncomeMin) {
                        return floatToRatio(item.referenceIncomeMax) + ''
                    }
                    return `${floatToRatio(item.referenceIncomeMin)} ~ ${floatToRatio(item.referenceIncomeMax)}`
                } else if (this.isExist(item.referenceIncomeMax)) {
                    return floatToRatio(item.referenceIncomeMax) + ''
                } else if (this.isExist(item.referenceIncomeMin)) {
                    return floatToRatio(item.referenceIncomeMin) + ''
                }
                return '--'
            }
            if (item.maxYield) {
                return `${floatToRatio(item.yield)} ~ ${floatToRatio(item.maxYield)}`
            } else if (item.yield) {
                return floatToRatio(item.yield)
            }
            return item.yieldStr
        },

        showReferenceTip() {
            return this.isDetail && this.isMarketingBill && this.quoteInfo.referenceIncomeDesc?.length
        },

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

        // 请求详情数据
        async fetchData(symbol) {
            try {
                const { result = {} } = (await getBillsDetail({ symbol: symbol || this.id })) ?? {}

                this.detailData = { ...result }
                console.log(`yinlong getBillsDetail`, result)
                this.noDataFlag = false
                this.loaded = true
            } catch (err) {
                console.log('🚀 ~ fetchData ~ err', err)
                this.loaded = true
                if (err.error.code === 302000) {
                    this.noDataFlag = true
                } else {
                    this.noDataFlag = false
                    this.$toast(err.error ? err.error.message : err.message)
                }

                this.detailData = {}
            }
        },

        // 请求报价数据
        async fetchQuoteInfo(symbol) {
            try {
                const { result = {} } = (await getBillsQuoteInfo({ symbol: symbol || this.id })) ?? {}

                this.quoteInfo = { ...result }
            } catch (err) {
                console.log('🚀 ~ fetchData ~ err', err)
                this.$toast(err.error ? err.error.message : err.message)
                this.quoteInfo = {}
            }
        },

        // 请求文件数据
        async fetchFiles(params = {}) {
            const filesArrKey = params.type === 1 ? 'productFiles' : 'protocolFiles'

            try {
                const { result = {} } = (await getBillsFiles({ symbol: params.symbol || this.id, ...params })) ?? {}

                this[filesArrKey] = result?.list ?? []
                this.fileList = result?.list ?? []
            } catch (err) {
                console.log('🚀 ~ fetchFiles ~ err', err)
                this.$toast(err.error ? err.error.message : err.message)
                this[filesArrKey] = []
            }
        },

        // 请求资产信息
        async fetchAssetsDetail(data) {
            try {
                this.power = data
                this.maxPurchasingPower = data.purchasingPower ?? 0
                this.avaliableCash = data.singleWithdrawBalance || 0
            } catch (err) {
                console.log('🚀 ~ fetchAssetsDetail ~ err', err)
                this.$toast(err.error ? err.error.message : err.message)
                this.maxPurchasingPower = 0
            }
        },

        // 请求产品信息
        async fetchProductList() {
            try {
                const { result = {} } = (await getBillsProductList({ symbol: this.id, subAccountId: this.subAccountId })) ?? {}

                this.products = result?.list ?? []
                this.$nextTick(() => {
                    this.handleSelectProductConfirm(this.formatedProducts[0], { clear: false })
                })
            } catch (err) {
                console.log('🚀 ~ fetchProductList ~ err', err)
                this.$toast(err.error ? err.error.message : err.message)
                this.products = []
            }
        },

        // 生成按钮
        generateFooterButton() {
            try {
                // 交易状态
                const tradeDisable = this.quoteInfo.tradingStatus !== 1
                // 开户|开通权限|认购|赎回 按钮
                const getFooterChild = h => {
                    const footerButtonChild = []
                    let step = 0
                    const steps = {
                        1: () => {
                            footerButtonChild.push(
                                h(
                                    'span',
                                    {
                                        staticClass: 'mask',
                                        attrs: {
                                            'data-key': 'openAccount',
                                        },
                                    },
                                    this.$t('openAccountNow')
                                )
                            )
                        },
                        2: () => {
                            footerButtonChild.push(
                                h(
                                    'span',
                                    {
                                        staticClass: 'mask',
                                        attrs: {
                                            'data-key': 'derivative',
                                        },
                                    },
                                    this.$t('openDerivative')
                                )
                            )
                        },
                        3: () => {
                            if (this.buy) {
                                footerButtonChild.push(
                                    h(
                                        'span',
                                        {
                                            staticClass: 'mask',
                                            attrs: {
                                                'data-key': 'buy',
                                            },
                                        },
                                        this.$t('subscribe')
                                    )
                                )
                            }
                            if (this.sell) {
                                footerButtonChild.push(
                                    h(
                                        'span',
                                        {
                                            staticClass: 'mask',
                                            attrs: {
                                                'data-key': 'sell',
                                            },
                                        },
                                        this.$t('redeem')
                                    )
                                )
                            }
                        },
                    }
                    if (this.openAccount) {
                        step = 1
                    } else {
                        if (!this.isOpenedDerivative) {
                            step = 2
                        } else {
                            step = 3
                        }
                    }
                    steps[step] && steps[step]()

                    const clickDisable = step < 3 ? false : tradeDisable
                    return h('div', { staticClass: 'footer-content' }, [
                        h(
                            'button',
                            {
                                staticClass: 'footer-button big-btn',
                                class: {
                                    'open-account': this.openAccount,
                                    buy: this.buy,
                                    sell: this.sell,
                                    disabled: clickDisable,
                                },
                                on: clickDisable ? { click: this.onDisableClick } : { click: this.onOpenAccount },
                            },
                            footerButtonChild
                        ),
                    ])
                }

                // 联系我们按钮
                const callMeChild = h => {
                    return h('div', { staticClass: 'footer-content' }, [
                        h(
                            'button',
                            {
                                staticClass: 'footer-button big-btn',
                                on: { click: this.onCallMe },
                            },
                            [h('span', this.$t('callMe'))]
                        ),
                    ])
                }

                // 不在销售时间展示专属客服
                const dedicatedAdvisorsChild = h => {
                    return h('div', { staticClass: 'footer-content' }, [
                        h(
                            'button',
                            {
                                staticClass: 'footer-button big-btn',
                                on: { click: this.callDedicatedAdvisors },
                            },
                            [h('span', this.$t('callDedicatedAdvisors'))]
                        ),
                    ])
                }
                const getFooterChildren = h => {
                    const footerChildren = []
                    if (this.isFCN && !this.inSale) {
                        footerChildren.push(dedicatedAdvisorsChild(h))
                    } else if (!this.isDisbaled) {
                        // 可交易
                        footerChildren.push(getFooterChild(h))
                    } else {
                        // 不可交易 提示联系我们
                        footerChildren.push(callMeChild(h))
                    }
                    return footerChildren
                }

                const footerComp = new Vue({
                    render: h => {
                        return h(
                            'footer',
                            {
                                style: { justifyContent: this.isInHlApp ? '' : 'center' },
                            },
                            getFooterChildren(h)
                        )
                    },
                })
                // 延迟加载一次
                this.$nextTick(() => {
                    this.$refs.footerTemp && footerComp.$mount(this.$refs.footerTemp)
                })
            } catch (e) {
                console.error(e)
            }
        },

        onDisableClick() {
            if (this.quoteInfo.tradingStatus === 3) {
                this.$dialog.alert({
                    title: this.$t('tradeRemind'),
                    message: this.$t('billNoTradeTimeHtml'),
                    messageAlign: 'left',
                    className: 'custom-dialog',
                    overlayClass: 'custom-overlay',
                    confirmButtonText: this.$t('iGet'),
                })
                return
            }
        },

        async onOpenAccount(e) {
            try {
                this.$loading.show = true
                const key = e.target.dataset.key
                if (!key) return

                // 账户校验
                if (!(await this.accountVerify(key === 'sell'))) return

                if (key === 'sell') {
                    return this.jumpToPage(key)
                }

                // 风险匹配及测评校验
                if (!(await this.riskMatchVerify(key))) return
                this.jumpToPage(key)
            } catch (e) {
                console.error(e)
            } finally {
                this.$loading.show = false
            }
        },

        // 页面跳转
        jumpToPage(key) {
            const { VUE_APP_DERIVATIVE_PAGE, VUE_APP_WEALTH_FUND_PAGE } = pathnames
            let url = ''
            let backUrl = ''
            switch (key) {
                case 'buy':
                    this.$router.push({
                        path: '/bills/buy',
                        query: {
                            symbol: this.id,
                        },
                    })
                    break
                // case 'sell':
                //     this.$router.push(`/redeem/${symbol}`)
                //     break
                case 'derivative':
                    this.initAccountWatch()
                    backUrl = `${VUE_APP_WEALTH_FUND_PAGE}bills/detail?symbol=${this.id}`
                    url = `${VUE_APP_DERIVATIVE_PAGE}?needRisk=1&matchRes=${this.matchRes}${
                        !this.isRiskMatch ? `&symbol=${this.id}&user=1&url=${encodeURIComponent(backUrl)}` : ''
                    }`
                    if (this.$jsBridge) {
                        this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                    } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                        this.$goPage(this.$addCurParamsForUrl(url))
                    } else {
                        location.href = this.$addCurParamsForUrl(url)
                    }
                    break
                default:
                    break
            }
        },

        goBack() {
            if (this.$jsBridge) {
                this.$jsBridge.close()
            } else if (isTHSApp()) {
                // eslint-disable-next-line
                callNativeHandler('goback', { type: 'component' }, function () {})
            } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                this.$thsI18NJsBridge.goBack()
            } else {
                this.$router.go(-1)
            }
        },

        onCallMe() {
            if (this.$jsBridge) {
                this.$jsBridge.contactUs()
            } else {
                this.$router.push({
                    path: '/services',
                })
            }
        },
        callDedicatedAdvisors() {
            const { VUE_APP_WEALTH_COUNSELOR_PAGE: url } = pathnames
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            this.$goPage(url)
        },
        getFrequencyStr(item) {
            if (item.knockOutType <= 2) {
                return this.$t('fcn.perMonth', { month: item.observationFrequency })
            }
            return this.$t('fcn.everyday')
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

        // 点击产品文件
        handleFileClick({ fileUrl = '', fileName } = {}) {
            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: fileUrl, title: fileName })
            } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                this.$thsI18NJsBridge.openPDF({ url: fileUrl.replace(`${fileName}`, encodeURIComponent(fileName)), title: fileName })
            } else {
                window.open(fileUrl)
            }
        },

        // 认购前校验
        buyVerify() {
            // 必须是单位金额的整数倍
            return this.amountValidate('submit')
        },

        // 点击认购
        async handleBuyBtnClick() {
            if (!this.canSign) {
                return
            }

            if (!this.usNationalityVerify(false)) {
                return
            }

            // 风险测评
            // if (!(await this.checkRiskAssessmentExpiredStatus())) return
            this.isOpenedDerivative = this.getDerivativeStatus()
            const showDialog = result => {
                this.riskMatchDialog(result, this.radio)
            }
            if (!(await this.riskMatchVerify('buy', showDialog))) return

            // 其它币种欠款提醒
            if (!this.$refs.capitalDetailRef?.check()) return

            const validateResult = this.buyVerify()
            if (validateResult) {
                this.buyConfirmVisible = true
            }
        },

        beforeCloseSubmit(action, done) {
            done(action === 'confirm' ? false : true)
        },

        // 提交认购
        async handleSubmit() {
            const tradeLoginResult = await this.verifyTradeLogin()
            if (!tradeLoginResult) return

            try {
                this.buyConfirmVisible = false
                this.$loading.show = {
                    show: true,
                    options: {
                        msg: this.$t('inCommit'),
                    },
                }
                const paramsDegree = this.radio
                const { result } =
                    (await noteSubscribe(
                        {
                            symbol: this.selectedProduct?.symbol,
                            amount: `${toFixed(this.realAmount, 2)}`,
                            currency: this.currency,
                            investFocusDegree: paramsDegree > 4 ? 128 : paramsDegree,
                            buyType: this.buyType,
                            instructionId: this.getInstructionId(),
                        },
                        {
                            encrypt: ENCRYPT_TYPES.APP_TRADE_ENC,
                        }
                    )) ?? {}
                const showAutoExchangeGuide = (await this.$refs.capitalDetailRef?.getAutoExchangeGuideStatus()) ? 1 : 0
                this.$router.replace(
                    `/submit-result?type=bills&orderId=${result?.orderId}&orderNumber=${result?.orderNumber}&symbol=${this.id}&showAutoExchangeGuide=${showAutoExchangeGuide}`
                )
            } catch (err) {
                console.log('🚀 ~ submit ~ err', err)
                this.handleOrderError({
                    error: err,
                    orderFunction: this.handleSubmit,
                    callBack: err => {
                        const message = err.error?.data?.tips || this.$t('serviceError')
                        this.$dialog.alert({
                            closeOnClickOverlay: true,
                            title: this.$t('trade.rgsb'),
                            message,
                            messageAlign: 'center',
                            confirmButtonText: this.$t('iGet'),
                        })
                    },
                    timeoutCallback: async orderList => {
                        const { orderId, orderNumber } = orderList[0]
                        const showAutoExchangeGuide = (await this.$refs.capitalDetailRef?.getAutoExchangeGuideStatus()) ? 1 : 0
                        this.$router.replace({
                            path: '/submit-result',
                            query: {
                                orderId,
                                orderNumber,
                                symbol: this.id,
                                type: 'bills',
                                showAutoExchangeGuide,
                            },
                        })
                    },
                    direction: 'subscribe',
                })
            } finally {
                this.$loading.show = false
            }
        },

        // 处理快速点击、全部认购
        handleFastItemClick({ amount = 0 } = {}, all = false) {
            const calcPower = () => {
                let powerValue = this.avaliableCash
                if (this.quoteInfo.isPP) {
                    powerValue = this.power.purchasingPower
                }
                return powerValue
            }

            let value = ''
            if (all) {
                value = NP.divide(calcPower(), NP.plus(1, NP.times(this.tradeInfo?.buyFee || 0, 0.01)))
                const unitAmount = this.tradeInfo?.unitAmount || 0
                // 向下取整
                value = Math.trunc(NP.divide(value, unitAmount))
                // 算出来最终结果
                value = NP.times(value, unitAmount)
                if (Number(calcPower()) <= 0) {
                    value = 0
                }
            } else {
                value = amount
            }

            this.buyAmount = this.amountFormatter(`${value}`)
            this.amountValidate()

            console.log(this.buyAmount, this.realAmount)
        },

        // 处理选择产品
        async handleSelectProductConfirm(item, params = { clear: true, check: false }) {
            this.selectedProduct = item
            this.selectProductVisible = false

            await this.fetchData(item.symbol)
            await this.fetchQuoteInfo(item.symbol)
            this.fetchFiles({ type: 2, symbol: item.symbol })
            if (params.clear) {
                this.degreeFlag = false
                this.radio = ''
                this.buyAmount = ''
                this.showTips = false
            } else if (params.check) {
                if (this.radio) {
                    this.handleRadioChange(this.radio)
                }
            }
        },

        // 处理资产占比
        handleRadioChange(name) {
            // fix切换票据产品，未选投资集中度，可以认购的问题
            if (!name) {
                return false
            }
            if (name > this.quoteInfo?.investFocusDegree ?? 1) {
                this.degreeFlag = false
                this.showTips = true
                // this.$toast(this.$t('trade.ndjzdxzbpp'))
            } else {
                this.degreeFlag = true
                this.showTips = false
            }
        },

        //跳转到协议文件
        goProtocol() {
            const investFocusDegree = this.radio
            const symbol = this.selectedProduct.symbol
            if (this.$jsBridge) {
                const url = `${location.origin}/wealth/fund.html#/protocol?symbol=${symbol}&type=bills&investFocusDegree=${investFocusDegree}`
                this.$jsBridge.open({ url: encodeURIComponent(url) })
                this.initWatchVisible()
            } else {
                this.$router.push({
                    path: '/protocol',
                    query: {
                        symbol,
                        type: 'bills',
                        investFocusDegree,
                    },
                })
            }
        },
        goClientStatement() {
            const fileUrl = `static/客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/${fileUrl}`
            const title = this.$t('protocol.clientStatement')
            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
                this.initWatchVisible()
            } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                const newUrl = `${location.origin}/wealth/${encodeURIComponent(fileUrl)}`
                this.$thsI18NJsBridge.openPDF({ url: newUrl, title })
            } else {
                window.open(url)
            }
        },
        // goRiskStatement() {
        //     const fileUrl = `static/风险披露&免责声明_${getLangType()}.pdf`
        //     const url = `${location.origin}/wealth/${fileUrl}`
        //     console.log('pdfUrl:', url)
        //     if (this.$jsBridge) {
        //         this.$jsBridge.openPDF({ url: encodeURIComponent(url), title: this.$t('protocol.publicRisk') })
        //     } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
        //         const newUrl = `${location.origin}/wealth/${encodeURIComponent(fileUrl)}`
        //         this.$goPage(newUrl)
        //     } else {
        //         window.open(fileUrl)
        //     }
        // },

        initWatchVisible() {
            if (!this.isGoProtocol) {
                this.$jsBridge.watchPageVisible(async () => {
                    const { result = {} } = (await getBillsProductList({ symbol: this.id, subAccountId: this.subAccountId })) ?? {}
                    this.products = result?.list ?? []
                    this.selectedProduct = this.formatedProducts.find(i => i.symbol === this.selectedProduct.symbol)
                    this.handleSelectProductConfirm(this.selectedProduct, { check: true })
                })
                this.isGoProtocol = true
            }
        },

        // 交易密码校验
        async verifyTradeLogin() {
            if (this.$jsBridge) {
                try {
                    await this.$jsBridge.tradeLogin()
                    return true
                } catch (err) {
                    console.log('🚀 ~ tradeLogin===>error:', err)
                    err.error && this.$toast(err.error.message)
                    return false
                }
            } else if (isInOutsideH5()) {
                if (!this.tradeLoginInstance) {
                    this.tradeLoginInstance = new TradeLogin({ propsData: { subAcctId: this.accts.subAcctId, zIndex: 9999 } })
                }
                this.tradeLoginInstance.show = true
                const task = new Promise(resolve => {
                    this.tradeLoginInstance.vm.$once('ok', () => {
                        console.log('tradeLoginInstance-on-ok:')
                        resolve(true)
                    })
                    this.tradeLoginInstance.vm.$once('cancel', () => {
                        console.log('tradeLoginInstance-on-error:')
                        resolve(false)
                    })
                })
                const result = await task
                console.log('ruiyin-verifyTradeLogin-result', result)
                return result
            }
            // 其他环境默认无需校验交易密码
            return true
        },

        showBriefDialog() {
            this.isShowDialog = true
        },
    },
}
</script>

<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.go-back-btn {
    display: block;
    width: 232px;
    margin: -10px auto 0;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 44px;
    background: #ff6907;
    border: none;
    border-radius: 35px;
    outline: none;
}

.contact-wrapper {
    position: fixed;
    bottom: 66px;
    left: 50%;
    justify-content: center;
    width: 112px;
    height: 32px;
    background: #f2f2f2;
    border-radius: 16px;
    transform: translateX(-50%);
}

.page {
    padding: 8px 12px;
    background: #f9f9f9;
    user-select: none;
    #iosBottom(66px);

    &.buy-page {
        #iosBottom(104px);
    }

    .risk-remind {
        margin-top: 12px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 11px;
        line-height: 18px;
        white-space: break-spaces;
    }

    .fcn-risk-remind {
        margin-top: 16px;
        color: @h3-white;
        font-weight: 400;
        font-size: 11px;
        line-height: 18px;

        .h2 {
            color: @h2-white;
        }
    }

    .mz-footer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        margin-top: 24px;

        .statementSty {
            padding: 6px 20px;
            color: @h1-white;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            background: #fff;
            border-radius: 35px;
        }

        margin-bottom: 40px;
    }

    .xgxy {
        margin-top: 32px;
        margin-bottom: 0;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;

        p {
            margin-bottom: 8px;
            font-weight: 500;
        }

        div {
            font-weight: 400;
            line-height: 18px;

            span {
                color: #043799;
            }
        }

        i {
            font-style: normal;
        }
    }

    .card {
        padding: 16px 12px;
        color: #2f2f2f;
        background: #fff;
        border-radius: 8px;

        & ~ .card {
            margin-top: 12px;
        }

        .card-title {
            font-weight: bold;
            font-size: 16px;
        }

        .card-main {
            position: relative;
            margin-top: 15px;

            &.small-gap {
                margin-top: 11px;
            }

            &.small-gap-7 {
                margin-top: 7px;
            }

            .sub {
                color: #666;
                font-size: 12px;
            }

            .intro {
                font-size: 14px;
                line-height: 22px;
                white-space: pre-line;
                word-break: break-all;

                & + .intro {
                    margin-top: 10px;
                }
            }

            ::v-deep {
                .van-tabs__wrap {
                    margin-bottom: 14px;
                }
            }

            .list {
                .list-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 24px;
                }

                .list-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    font-size: 14px;

                    .list-item__name {
                        display: flex;
                        flex: 1 1 auto;

                        .file-icon {
                            width: 20px;
                            height: 20px;
                            margin-right: 6px;
                        }

                        span {
                            line-height: 22px;
                            word-break: break-all;
                        }
                    }

                    .list-item__time {
                        flex: 0 0 auto;
                        margin-left: 12px;
                        line-height: 22px;
                    }
                }

                .list-item:last-child {
                    padding-bottom: 0;
                }
            }

            .desc {
                font-size: 14px;
                line-height: 20px;

                .desc-item {
                    display: flex;
                    align-items: flex-start;
                    min-height: 36px;
                    padding: 8px 0;

                    .label {
                        flex: 0 0 auto;
                        width: 100px;
                        margin-right: 20px;
                        color: #666;
                    }

                    .value {
                        flex: 1 1 auto;
                        color: @h1-white;
                    }

                    .h1 {
                        color: @h1-white;
                    }
                }
            }

            .t-tips {
                margin-top: 6px;
                margin-bottom: 14px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 20px;
            }

            .custips {
                margin-top: 8px;
                color: #f31414;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        &.name-card {
            word-break: break-all;

            .card-main {
                display: flex;
                align-items: center;

                .rate-box {
                    min-width: calc(50%);

                    .rate {
                        margin-bottom: 6px;
                        color: #ff6907;
                        font-weight: bold;
                        font-size: 20px;
                    }
                }

                .rest-box {
                    padding-left: 13px;

                    .rest {
                        margin-bottom: 8px;
                        font-weight: bold;
                        font-size: 16px;
                    }
                }

                .rest-box-single {
                    display: flex;
                    padding-left: 0;

                    .rest {
                        margin-right: 6px;
                        margin-bottom: 0;
                    }

                    .sub {
                        margin-top: 3.5px;
                    }
                }
            }
        }

        .field-box(@height) {
            box-sizing: border-box;
            min-height: @height;
            box-shadow: inset 0 0 0 #fff, inset 0 0 0 #fff, inset 0 -0.5px 0 #efefef;
        }

        .placeholder-style {
            input::-webkit-input-placeholder {
                /* WebKit browsers 适配谷歌 */
                color: #9c9c9c;
            }

            input:-moz-placeholder {
                /* Mozilla Firefox 4 to 18 适配火狐 */
                color: #9c9c9c;
            }

            input::-moz-placeholder {
                /* Mozilla Firefox 19+ 适配火狐 */
                color: #9c9c9c;
            }

            input:-ms-input-placeholder {
                /* Internet Explorer 10+  适配ie */
                color: #9c9c9c;
            }
        }

        &.amount-card {
            .card-main {
                margin-top: 10px;

                &.has-error {
                    .buy-input {
                        box-shadow: inset 0 0 0 #fff, inset 0 0 0 #fff, inset 0 -0.5px 0 #f31414;
                    }

                    .fast-click {
                        margin-top: 24px;
                    }
                }
            }

            .buy-input {
                position: relative;
                display: flex;
                align-items: center;
                .field-box(64px);

                .label {
                    flex: 0 0 auto;
                    color: #000;
                    font-size: 20px;
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
                        padding: 10px 12px;
                        color: #000;
                        font-size: 20px;
                        line-height: 28px;

                        &.focus-large {
                            font-size: 32px;
                            line-height: 44px;
                        }

                        .placeholder-style();
                    }
                }

                .numTip {
                    position: absolute;
                    top: -4px;
                    left: 56px;
                    z-index: 2;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    line-height: 12px;

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
            }

            .error-tips {
                margin-top: 8px;
                color: #f31414;
                font-size: 12px;
                line-height: 16px;
            }

            .fast-click {
                margin-top: 16px;

                .fast-item {
                    margin-right: 16px;
                    padding: 4px 8px;
                    color: #ff6907;
                    font-size: 12px;
                    line-height: 16px;
                    background: rgba(255, 105, 7, 0.08);
                    border-radius: 12px;
                }
            }

            .tips {
                margin-top: 16px;

                .tips-item {
                    color: #666;
                    font-size: 12px;

                    .label {
                        margin-right: 8px;
                        color: #9c9c9c;
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

        &.able-card {
            .card-main {
                display: flex;
                align-items: center;
                margin-top: 0;

                .capital {
                    flex: 1 1 auto;
                    color: #2f2f2f;

                    .label {
                        margin-right: 8px;
                        color: #9c9c9c;
                    }

                    .need {
                        padding-top: 8px;
                    }

                    .gap {
                        color: #f31414;
                    }
                }

                .save {
                    flex: 0 0 auto;
                    min-width: 80px;
                    padding: 4px 12px;
                    color: #fff;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 20px;
                    text-align: center;
                    background: #ff6907;
                    border-radius: 31px;
                    user-select: none;
                }
            }
        }

        &.select-card {
            padding-bottom: 6px;

            .card-main {
                .select-product {
                    ::v-deep .van-field {
                        padding: 10px 0;
                        color: #000;
                        font-size: 16px;
                        line-height: 28px;

                        .placeholder-style();

                        .van-icon-arrow {
                            font-size: 12px;
                        }
                    }
                }
            }
        }

        &.radio-card {
            padding: 20px 12px 24px;

            .card-main {
                margin-top: 0;

                .title {
                    color: #666;
                }

                .radio {
                    margin-top: 12px;

                    ::v-deep .van-radio-group--horizontal {
                        justify-content: space-between;

                        .van-radio--horizontal {
                            margin-right: 6px;

                            .van-radio__label {
                                margin-left: 6px;
                            }
                        }
                    }
                }
            }
        }
    }

    .pad-b-8 {
        padding-bottom: 8px;
    }

    .footer-box {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        background: #fff;
        #iosBottom();

        &.web {
            padding-bottom: 0;
        }

        .suspension {
            padding: 8px 0;
            color: #9d252a;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
            background: #ffe5e7;
        }

        .buy-footer {
            padding: 12px 28px 0;

            .agree {
                margin-bottom: 16px;
                font-size: 12px;
            }

            .buy-btn {
                font-weight: bold;
            }
        }
    }

    /deep/ footer {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        padding: 8px 12px 0;

        button {
            position: relative;
            display: flex;
            justify-content: center;
            background: transparent;
            border: none;
            outline: none;

            span {
                &.mask {
                    position: relative;

                    &::after {
                        position: absolute;
                        top: 0;
                        right: 0;
                        bottom: 0;
                        left: 0;
                        z-index: 1;
                        content: '';
                    }
                }
            }
        }

        .footer-content {
            width: 100%;

            button {
                width: 100%;
                color: #fff;
                font-weight: 700;
                font-size: 16px;
                line-height: 44px;
                background: #ff6907;
                border-radius: 28px;

                &.disabled {
                    cursor: not-allowed;
                    opacity: 0.4;
                }
            }

            .big-btn {
                width: calc(100% - 38px);
                margin-right: 19px;
                margin-left: 19px;
                line-height: 44px;
                border-radius: 28px;
            }

            span:first-child:last-child {
                width: 100%;
            }
        }

        .open-account,
        .buy {
            background: #ff6907;
        }

        .sell.buy {
            span {
                width: 50%;
                text-align: center;
            }

            background: linear-gradient(90deg, #ff8d07 0%, #ff6907 50%, #ffa724 50%, #ffba07 100%);
        }
    }

    .diagBox {
        display: flex;
        flex-direction: column;
        margin-bottom: 24px;

        .purchasing-tip {
            margin: 8px 16px 12px;
            padding-bottom: 12px;
            color: #af7213;
            font-size: 12px;
            line-height: 17px;
            word-break: break-all;

            :deep(.important) {
                color: @theme;
                font-weight: 600;
                word-break: break-all;
            }
        }

        .item {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            padding: 6px 16px;

            .left {
                color: #9c9c9c;
                font-size: 14px;
                line-height: 20px;
            }

            .right {
                width: 160px;
                color: #1f1f1f;
                font-size: 14px;
                line-height: 22px;
                text-align: right;
            }
        }
    }

    .picker {
        padding: 10px 8px;
        padding-bottom: calc(22px + 34px);

        .picker-item {
            width: 100%;
            padding: 16px 8px;
            font-size: 14px;
            line-height: 20px;
            text-align: left;
            border-radius: 8px;

            &.selected {
                background: #fff5ef;
            }
        }
    }

    .prompt {
        margin-top: 12px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 20px;
    }
}

.empty-container {
    height: 100vh;
    background: #fff;
}

.descriptionBox {
    padding: 16px 0 0;

    .description {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        max-height: 60px;
        padding: 12px 8px;
        background-color: #f9f9f9;
        border-radius: 4px;

        &-text {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            font-style: normal;
            line-height: 18px;
        }

        &-arrow {
            width: 12px;
            height: 12px;
        }
    }
}

/deep/ .van-dialog {
    width: 280px;
}

.dialog-content {
    width: 100%;
    padding: 10px 16px 28px;
    color: #2f2f2f;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
}

// 计算费用
.calc-cost {
    li {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;

        .label {
            color: #9c9c9c;
            text-align: left;
        }

        .value {
            color: #2f2f2f;
            text-align: right;
        }
    }

    li:nth-last-child(2) {
        box-shadow: inset 0 -0.5px 0 #efefef;
    }

    .all-price {
        margin-top: 4px;

        .value {
            color: #ff6907;
        }
    }
}
</style>
