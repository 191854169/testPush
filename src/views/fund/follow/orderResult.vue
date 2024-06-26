<template>
    <div class="follow-result">
        <template v-if="isInHlApp && isFromFollowRealOrder">
            <navigation-bar @back="goBack"></navigation-bar>
        </template>
        <div class="container-top">
            <div class="content-top">
                <multi-img width="58" height="58" name="submit-success" directory="common"></multi-img>
                <div class="text1">{{ $t('trade.tijiaochenggong') }}</div>
                <div class="desc">
                    {{ $t('follow.orderResultText', { buyProductNum: result.buyProductNum, stockText: stockTextMap[result.portfolioType] }) }}
                </div>
            </div>
            <div class="content-center border-8">
                <div class="title">{{ $t('follow.orderInfo') }}</div>
                <div class="form-item">
                    <span class="key">{{ $t('trade.tradeAccount') }}</span>
                    <span class="value">{{ result.subAccountId }}</span>
                </div>
                <div class="form-item">
                    <span class="key">{{ $t('follow.combinationName') }}</span>
                    <span class="value">{{ result.portfolioName }}</span>
                </div>
                <div class="form-item" v-if="result.simulated">
                    <span class="key">{{ $t('follow.orderSource') }}</span>
                    <span class="value">{{ result.orderSource }}</span>
                </div>
                <div class="form-item">
                    <span class="key">{{ $t('follow.tradeMarket') }}</span>
                    <span class="value">{{ stockNameMap[result.portfolioType] }}</span>
                </div>
                <div class="form-item">
                    <span class="key">{{ result.portfolioType | typeLabelFilter($t.bind(this)) }}</span>
                    <span class="value">{{ result.buyProductNum }}{{ $t('zhi') }}</span>
                </div>
                <div class="form-item">
                    <span class="key">{{ $t('follow.descriptAmount') }}{{ result.estimateBuyInfo | marketValueFilter(0, $t.bind(this)) }}</span>
                    <span class="value">
                        <span class="value__item">
                            {{ result.estimateBuyInfo | estimateBuyInfoFilter(0) | thousandsFilter }}{{ result.estimateBuyInfo | currencyFilter(0) }}
                        </span>
                    </span>
                </div>
                <div class="form-item" v-if="result.estimateBuyInfo?.length > 1">
                    <span class="key">{{ $t('follow.descriptAmount') }}{{ result.estimateBuyInfo | marketValueFilter(1, $t.bind(this)) }}</span>
                    <span class="value">
                        <span class="value__item">
                            {{ result.estimateBuyInfo | estimateBuyInfoFilter(1) | thousandsFilter }}{{ result.estimateBuyInfo | currencyFilter(1) }}
                        </span>
                    </span>
                </div>
                <!-- <div class="form-item">
                    <span class="key">预计买入费用</span>
                    <span class="value">{{ result.estimateBuyFee }}{{ result.currency }}</span>
                </div> -->
                <!-- <div class="form-item">
                    <span class="key">预计合计金额</span>
                    <span class="value">{{ totalFee }}{{ currency }}</span>
                </div> -->
            </div>
            <div class="content-footer content-center border-8">
                <div class="title">{{ isFund ? $t('follow.fundDetail') : $t('follow.stockDetail') }}</div>
                <result-detail-table :isFund="isFund" :list="result.orderDetail" :currency="result.currency" :unity="currency" />
            </div>
            <!-- 自动换汇提醒 -->
            <div class="auto-exchange-guide" v-if="showAutoExchangeGuide">
                <div class="label">
                    <span>{{ $t('toOpenAutoExchange') }}</span>
                    <multi-img name="icon-tips" directory="common" @click="onAutoExchangeRemind"></multi-img>
                </div>
                <div class="value">
                    <button @click="goAutoExchange">{{ $t('goStart') }}</button>
                </div>
            </div>
        </div>
        <div class="bottom-btn" :class="{ 'only-one-btn': !showToAppsRecordsBtn }">
            <div class="btn" @click="toAppRecords" v-if="showToAppsRecordsBtn">{{ $t('follow.reviewOrderRecord') }}</div>
            <div class="btn btn2" @click="onGoBack">{{ $t('goBack') }}</div>
        </div>
    </div>
</template>

<script>
import ResultDetailTable from './components/resultDetailTable.vue'
import NP from 'number-precision'
import { CURRENCY_MAP, PORTFOLIO_TYPE_MAP } from '../config/common'
import { isHLApp, keepDecimals } from '@/utils'
import { thousandsFilter } from '@/config/filters.js'
import NavigationBar from '@/components/NavigationBar.vue'
import { AutoFxSetting } from '@/apis/cash'
import { mapState } from 'vuex'
import { accountTypeMap } from '@/config/common'

export default {
    components: {
        ResultDetailTable,
        NavigationBar,
    },
    data() {
        return {
            result: {},
            stockNameMap: {
                1: this.$t('stocksHKD'),
                2: this.$t('stocksUSD'),
                3: this.$t('follow.fundName'),
                4: this.$t('customerDetail.mixture'),
            },
            stockTextMap: {
                1: this.$t('follow.stockHkName'),
                2: this.$t('follow.stockUsName'),
                3: this.$t('follow.pubFundName'),
            },
            autoFxSettingStatus: true, // 用户的自动换汇状态
        }
    },
    filters: {
        thousandsFilter(v) {
            return v ? thousandsFilter(keepDecimals(v, 2)) : '--'
        },
        typeLabelFilter(v, $t) {
            const map = {
                1: $t('follow.stockAmount'),
                2: $t('follow.stockAmount'),
                3: $t('follow.fundAmount'),
                4: $t('follow.stockAmount'),
            }
            return map[v]
        },
        estimateBuyInfoFilter(arr = [], idx) {
            return arr[idx]?.amount || ''
        },
        currencyFilter(arr = [], idx) {
            return CURRENCY_MAP.keyValueMap[arr[idx]?.currency || ''] || '--'
        },
        marketValueFilter(arr = [], idx, $t) {
            const isMix = arr.length > 1
            if (!isMix) {
                return ''
            }
            const currency = (arr[idx]?.currency || '')?.toUpperCase()
            const marketValueLabel = {
                HKD: $t('follow.hkStock'),
                USD: $t('follow.usStock'),
            }[currency]
            return marketValueLabel ? `（${marketValueLabel}）` : ''
        },
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
        totalFee() {
            return NP.plus(this.result.estimateBuyFee, this.result.estimateBuyAmount)
        },
        currency() {
            return CURRENCY_MAP.keyValueMap[this.result.currency]
        },
        isFund() {
            return this.result && this.result.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        isInHlApp() {
            return isHLApp()
        },
        isMixMarket() {
            return this.result.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.mixin
        },
        isFromFollowRealOrder() {
            return this.$route.query.from === 'followRealOrder'
        },
        showAutoExchangeGuide() {
            // 现金账户未开通自动换汇
            return this.isCashAccount && !this.autoFxSettingStatus
        },
        showToAppsRecordsBtn() {
            // !isFund && isInHlApp 在app里面跳转app页面，此情况下只在app内展示查看订单记录按钮
            return this.isFund || (!this.isFund && this.isInHlApp)
        },
    },
    mounted() {
        if (!this.isFromFollowRealOrder && this.isInHlApp) {
            this.proxyBackCallback()
        }
        this.getResultData()
        this.getAutExchangeStatus()
    },
    methods: {
        getResultData() {
            this.result = JSON.parse(sessionStorage.getItem('orderResult'))
        },
        toAppRecords() {
            if (this.isFund) {
                const url = `${location.origin}${location.pathname}#/order-list?haveDoing=1`
                if (this.isInHlApp) {
                    this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                } else {
                    this.$router.push('/order-list?haveDoing=1')
                }
            } else {
                if (this.$jsBridge) {
                    this.$jsBridge.goPage('orderRecord')
                }
            }
        },
        toCurrentRecords() {
            if (this.isInHlApp) {
                const url = `${location.origin}${location.pathname}#/follow-order-records?type=${this.result.portfolioType}`
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/follow-order-records',
                    query: {
                        type: this.result.portfolioType,
                    },
                })
            }
        },

        goBack() {
            if (this.$jsBridge) {
                this.$jsBridge.close()
            } else {
                this.$router.go(-1)
            }
        },

        onGoBack() {
            if (this.$jsBridge) {
                this.$jsBridge.close()
            } else {
                this.$router.push(`follow-details?portfolioId=${this.$route.query.portfolioId}`)
            }
        },

        proxyBackCallback() {
            window.WebViewBack = () => {
                this.$jsBridge.close()
                return true
            }
        },

        // 自动换汇开通状态
        async getAutExchangeStatus() {
            try {
                // 如果用户已开通自动换汇则不需要提醒
                const { result } = await AutoFxSetting({ subAccountId: this.$store.state.user.subAccountId })
                // 0:未开通、1:已开通、2:已关闭
                const AUTO_EXCHANGE_OPENED = 1
                if (result?.status == AUTO_EXCHANGE_OPENED) {
                    this.autoFxSettingStatus = true
                    return
                }
                this.autoFxSettingStatus = false
            } catch (e) {
                console.error(`Feng.chen:: 17:05:53 e ===> `, e)
            }
        },

        onAutoExchangeRemind() {
            this.$dialog
                .confirm({
                    title: this.$t('autoExchange'),
                    message: this.$t('autoExchangeDesc'),
                    showCancelButton: false,
                    confirmButtonText: this.$t('iKnow'),
                    messageAlign: 'center',
                })
                .then(() => {})
        },

        goAutoExchange() {
            const url = `${location.origin}/pages/autoExchange.html#/?sub=${this.$store.state.user.subAccountId}`

            location.href = url
        },
    },
}
</script>

<style lang="less" scoped>
@import url('~@/assets/css/mixins.less');

.follow-result {
    display: flex;
    flex-direction: column;
    #iosBottom();

    .container-top {
        margin-bottom: 100px;
        overflow: auto;
    }

    .content-top {
        display: flex;
        flex-direction: column;
        align-items: center;

        img {
            margin-top: 37px;
            margin-bottom: 20px;
        }

        .text1 {
            color: @fontBlackColor;
            font-size: 18px;
            line-height: 26px;
        }

        .desc {
            margin-top: 4px;
            margin-bottom: 32px;
            color: @fontGreyColor;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .border-8 {
        border-radius: 8px;
    }

    .content-center {
        margin: 0 12px;
        padding: 8px 12px;
        // padding-bottom: 16px;
        background: #fff;

        .title {
            height: 36px;
            color: @fontBlackColor;
            font-weight: 500;
            font-size: 16px;
            line-height: 36px;
        }

        .form-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 36px;

            .key {
                color: @fontLightColor;
                font-weight: 400;
                font-size: 14px;
            }

            .value {
                color: @fontBlackColor;
                font-weight: 400;
                font-size: 14px;

                &__item {
                    display: block;
                }
            }

            &:last-child {
                position: relative;

                .value {
                    text-align: right;

                    &__item.oppose {
                        position: absolute;
                        right: 0;
                        left: -200px;
                        margin-top: 2px;
                        color: @fontLightColor;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;
                        text-align: right;
                    }
                }
            }
        }
    }

    .content-footer {
        margin-top: 16px;
    }

    .bottom-btn {
        position: fixed;
        bottom: 0;
        // line-height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
        padding-top: 12px;
        background: #fff;

        &.only-one-btn {
            justify-content: center;

            .btn2 {
                width: 84%;
            }
        }

        .btn {
            width: 160px;
            height: 44px;
            color: @fontBlackColor;
            font-weight: 500;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            border: 0.5px solid @fontGreyColor;
            border-radius: 22px;
        }

        .btn2 {
            color: #fff;
            font-weight: 500;
            font-size: 16px;
            text-align: center;
            background: @theme;
            border: none;
        }
        #iosBottom();
    }

    .auto-exchange-guide {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 12px 12px 0;
        margin-top: 12px;
        padding: 16px;
        padding: 13px 12px;
        background: #fff;
        border-radius: 8px;
        box-shadow: inset 0.5px 0.5px 0 #fff;

        .label {
            display: flex;
            align-items: center;

            span {
                margin-right: 8px;
                color: @fontBlackColor;
                font-weight: 600;
                font-size: 16px;
                line-height: 22px;
            }

            img {
                width: 20px;
            }
        }

        .value {
            button {
                padding: 4px 12px;
                color: @theme;
                font-weight: 600;
                font-size: 14px;
                line-height: 20px;
                background: rgba(255, 105, 7, 0.07);
                border: none;
                border-radius: 31px;
                outline: none;
            }
        }
    }
}
</style>
