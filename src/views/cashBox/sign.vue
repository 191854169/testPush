<template>
    <div class="sign">
        <div class="row account">
            <div class="row-content no-border">
                <div class="content-top">
                    <div class="left font-bold">{{ $t('appointAccount') }}</div>
                    <div class="right">
                        <span>{{ accts.type | accountTypeFilter }}（{{ accts.subAcctId }}）</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="row-content">
                <div class="content-top">
                    <div class="left font-bold">{{ $t('autoRollIn') }}</div>
                </div>
                <div class="content-bottom">{{ $t('idleCashRecommand') }}</div>
            </div>
        </div>
        <div class="row" @click="checkTime(1)">
            <div class="row-content">
                <div class="content-top">
                    <div class="left">{{ $t('autoTradeTime') }}</div>
                    <div class="right">
                        <span>{{ ggToTheTime }}</span>
                        <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                    </div>
                </div>
                <div class="content-bottom">{{ $t('deferredRemind') }}</div>
            </div>
        </div>
        <div class="row">
            <div class="row-content" @click="reservedAmount('HKD')">
                <div class="content-top">
                    <div class="left">{{ $t('reserveCash') }}（{{ $t('HKD') }}）</div>
                    <div class="right">
                        <span>{{ amountDisplayHKD | thousandsFilter }}</span>
                        <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                    </div>
                </div>
                <div class="content-bottom">{{ $t('autoRollInRemind') }}</div>
            </div>
        </div>
        <div class="row">
            <div class="row-content no-border" @click="reservedAmount('USD')">
                <div class="content-top">
                    <div class="left">{{ $t('reserveCash') }}（{{ $t('USD') }}）</div>
                    <div class="right">
                        <span>{{ amountDisplayUSD | thousandsFilter }}</span>
                        <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                    </div>
                </div>
                <div class="content-bottom">{{ $t('autoRollInRemind') }}</div>
            </div>
        </div>
        <div class="agree">
            <van-checkbox icon-size="16" v-model="agreeFlag" checked-color="#2F2F2F">
                <template v-slot:icon="{ checked }">
                    <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund" style="width: 16px"></multi-img>
                </template>
                <p class="footer-top__text">
                    <span>{{ $t('bryydbty') }}</span>
                    <a @click.stop="goServiceProtocol">《{{ $t('cashTradeProtocol') }}》</a>
                    <a @click.stop="goProtocol">《{{ $t('xgxywj') }}》</a>
                    <span>{{ $t('ji') }}</span>
                    <a @click.stop="goStatement">《{{ $t('clientStatement') }}》</a>
                </p>
            </van-checkbox>
        </div>
        <div class="button" :class="{ canSign: canSign }" @click="open">{{ $t('quedingkaitong') }}</div>
        <van-dialog
            v-model="cepingDiag"
            :title="$t('tishi')"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('goRisk')"
            @confirm="cepingSure"
        >
            <div class="diagBox">
                {{ cepingText }}
            </div>
        </van-dialog>
        <loading :propsShow="true" :msg="loadingMsg" :showLoading="showLoading" />
        <div class="desc">
            <p class="desc-title">{{ $t('cashServeDeclare') }}</p>
            <div class="desc-content">
                <p class="desc-content__text">{{ $t('cashServeText1') }}</p>
                <p class="desc-content__text">{{ $t('cashServeText2') }}</p>
            </div>
        </div>
        <div class="product">
            <div class="left" @click="goxcbExplain">{{ $t('seeCashBox') }}</div>
            <div class="right" @click="onRemind">{{ $t('commonQuestion') }}</div>
        </div>
        <van-action-sheet v-model="showTime">
            <div class="custom-time">
                <van-picker
                    show-toolbar
                    :title="$t('dateSetting')"
                    :confirm-button-text="$t('queding')"
                    :columns="columns"
                    @change="onChange"
                    @confirm="confirmTime"
                >
                    <multi-img slot="cancel" class="next" name="icon_close" directory="cashBox" @click="cancelTime"></multi-img>
                </van-picker>
            </div>
        </van-action-sheet>
        <van-dialog
            v-model="amountShow"
            :title="`${$t('reserveCash')}（${currencyKeyMap[inputCurrencyType]}）`"
            class-name="custom-dialog"
            overlay-class="custom-overlay"
            show-cancel-button
            :confirm-button-text="$t('queding')"
            @confirm="beforeCloseAmount"
        >
            <div class="cusinp">
                <van-field
                    type="text"
                    clearable
                    ref="input"
                    v-model="keepAmount"
                    :placeholder="`0.00${inputCurrencyType === 'HKD' ? $t('gangyuan') : $t('USD')}`"
                    @keyup="inputHander"
                />
            </div>
        </van-dialog>
    </div>
</template>
<script>
import { lupuJsbridge as JSBridge } from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
import { thousandsFilter } from '@/config/filters.js'
import { ecashOpen } from '@/apis/wealth/index.js'
import { Toast, Overlay, Switch, Area, ActionSheet, Picker } from 'vant'
import { mapState } from 'vuex'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { showTip, AGE_LIMIT_CODE } from '@/mixins/AgeLimit'
import { addCurParamsForUrl, getLangType } from '@/utils'
import { currencyMap, accountTypeMap, PUB_LIST_FILTER_MAP } from '@/config/common'
import { selectDateMap, rangeMap } from '@/views/cashBox/config/common'
import pathnames from '@/config/H5Pathname.js'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { isInOutsideH5 } from '@/utils'
import { CASHBOXINPUTINFO } from './config/common'
import { getPubList } from '@/apis/fund/fund'

const currencyKeyMap = currencyMap.keyValueMap
const rangeKeyValueMap = rangeMap.keyValueMap // { DAY: '每日', ... }
const rangekeysMap = rangeMap.keysMap // { 0: DAY, 1: WEEK ... }
const rangeColumns = Object.values(rangeKeyValueMap) // [每日， 每周， 每月]
const accountTypeKeyMap = accountTypeMap.keyValueMap

export default {
    name: 'sign',
    mixins: [riskAssessmentMixin],
    components: {
        [Overlay.name]: Overlay,
        [Switch.name]: Switch,
        [Area.name]: Area,
        [ActionSheet.name]: ActionSheet,
        [Picker.name]: Picker,
    },
    filters: {
        thousandsFilter,
        currencyTextFilter(v) {
            return currencyKeyMap[v] || ''
        },
        accountTypeFilter(v) {
            return accountTypeKeyMap[v] || ''
        },
    },
    data() {
        return {
            currencyKeyMap,
            symbolList: [],
            agreeFlag: false,
            amountDisplayUSD: '0.00',
            amountDisplayHKD: '0.00',
            cepingDiag: false,
            cepingText: '',
            isAssessed: '',
            isExpired: '',
            cepingUrl: '',
            loadingMsg: '',
            showLoading: false,
            ggShiftTo: true,
            ggToTheTime: selectDateMap[rangekeysMap[0]][0], // 每日每个交易日
            showTime: false,
            columns: [{ values: rangeColumns }, { values: selectDateMap[rangekeysMap[0]] }],
            amountShow: false,
            keepAmount: '', //保留金额
            inputCurrencyType: '', // 输入是金额类型
            getTimeArr: [], //选择的时间
            getTimeArrStr: [], //选择的时间文字
            myLinkTradeLogin: null,
        }
    },
    created() {
        this.cepingUrl = location.origin + '/wealth/riskAssessment.html#/'
        this.getECashProductList()
        this.loadingMsg = this.$t('inCommit')
        const info = sessionStorage.getItem(CASHBOXINPUTINFO)
        if (info) {
            const { ggToTheTime, getTimeArr, amountDisplayHKD, amountDisplayUSD } = JSON.parse(info)
            console.log('init info:', JSON.parse(info))
            this.ggToTheTime = ggToTheTime
            this.getTimeArr = getTimeArr
            this.amountDisplayHKD = amountDisplayHKD
            this.amountDisplayUSD = amountDisplayUSD
            sessionStorage.removeItem(CASHBOXINPUTINFO)
            this.agreeFlag = true
        }
    },
    async mounted() {
        // 站外H5点击浏览器后退再进到这个页面自动重定向到首页理财tab
        if (isInOutsideH5()) {
            const ecashStatusInfo = await this.$store.dispatch('user/getEcashStatus', true)
            console.log('ecashStatusInfo:', ecashStatusInfo)
            if (ecashStatusInfo?.openStatus === 1) {
                window.location.replace(`${pathnames.VUE_APP_WEALTH_COMMONOUTSIDE_PAGE}?activeTab=2`)
            }
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        canSign() {
            return this.amountDisplayUSD !== '' && this.amountDisplayHKD !== '' && this.agreeFlag
        },
    },
    methods: {
        // 保留金额输入
        inputHander() {
            if (!this.$refs.input) return
            const value = this.$refs.input.value.slice(0, 16)
            this.keepAmount = value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')
        },
        onRemind() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=COMMONPROBLEM-ST`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
        goxcbExplain() {
            this.$router.push({ path: '/xcbExplain' })
        },
        //时间
        onChange(picker, values) {
            const key = values[0]
            const index = rangeColumns.findIndex(item => item === key)
            if (index !== -1) {
                picker.setColumnValues(1, selectDateMap[rangekeysMap[index]])
            }
        },
        checkTime(v) {
            this.showTime = true
            this.checkTimeFlag = v
        },
        cancelTime() {
            this.showTime = false
        },
        confirmTime(value, index) {
            this.showTime = false
            this.getTimeArr = index
            this.getTimeArrStr = value
            if (index[0] == 0 && index[1] == 0) {
                this.ggToTheTime = value[1]
            } else {
                this.ggToTheTime = value[0] + value[1]
            }
        },
        beforeCloseAmount() {
            if (this.inputCurrencyType === 'USD') {
                this.amountDisplayUSD = this.keepAmount
            }
            if (this.inputCurrencyType === 'HKD') {
                this.amountDisplayHKD = this.keepAmount
            }
        },
        //保留金额
        reservedAmount(currency = 'HKD') {
            this.inputCurrencyType = currency
            this.keepAmount = this[`amountDisplay${currency}`] === '0.00' ? '' : this[`amountDisplay${currency}`]
            this.amountShow = true
        },
        // (星财宝)货币基金自动买入及赎回服务协议
        goServiceProtocol() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const key = 'CASH_BOX'
            const url = `${VUE_APP_BUILDER_PAGE}?key=${key}`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
        //跳转到协议
        async goProtocol() {
            const symbols = encodeURIComponent(JSON.stringify(this.symbolList))
            const url = location.origin + `/wealth/cashBox.html#/protocol?symbols=${symbols}`
            if (JSBridge) {
                JSBridge.open({ url: encodeURIComponent(url) })
            } else {
                window.location.href = addCurParamsForUrl(url)
            }
        },

        // 客户声明
        goStatement() {
            const fileName = `客户声明_${getLangType()}.pdf`
            const url = `${location.origin}/wealth/static/${fileName}`
            const title = this.$t('clientStatement')
            if (this.$jsBridge) {
                this.$jsBridge.openPDF({ url: encodeURIComponent(url), title })
            } else {
                window.open(url)
            }
        },

        //获取产品列表
        async getECashProductList() {
            try {
                const { result = {} } = await getPubList({
                    start: 0,
                    count: 99,
                    sort: 'desc',
                    f: 'returnD7ToY1',
                    filter: [
                        {
                            type: 'fundType',
                            items: ['mmf'],
                        },
                    ],
                    buyable: PUB_LIST_FILTER_MAP.BUYABLE, // 只筛选可买的星财宝
                })
                const list = result.list || []
                this.symbolList = list.map(item => item.symbol)
            } catch (e) {
                console.log('getPubList===>e:', e)
            }
        },
        //跳转到风险测评
        cepingSure() {
            if (JSBridge) {
                JSBridge.open({ url: encodeURIComponent(this.cepingUrl) })
            } else {
                this.saveInputInfo()
                if (isInOutsideH5()) {
                    const urlParams = `${pathnames.VUE_APP_WEALTH_CASHBOX_PAGE}sign`
                    console.log('urlParams:', encodeURIComponent(urlParams))
                    window.location.href = addCurParamsForUrl(this.cepingUrl + `?url=${encodeURIComponent(urlParams)}`)
                } else {
                    window.location.href = addCurParamsForUrl(this.cepingUrl)
                }
            }
        },
        //开通星财宝
        async open() {
            if (!this.canSign) return
            if (this.$jsBridge) {
                try {
                    await this.$jsBridge.tradeLogin()
                } catch (e) {
                    return
                }
            } else if (isInOutsideH5()) {
                if (!this.myLinkTradeLogin) {
                    this.myLinkTradeLogin = new TradeLogin({ propsData: { subAcctId: this.accts.subAcctId, callBack: this.openInvoke } })
                }
                this.myLinkTradeLogin.show = true
                return
            }
            this.openInvoke()
        },
        async openInvoke() {
            // 获取风测信息
            const data = await this.getAssessStatus()
            this.isAssessed = data?.result?.isAssessed
            this.isExpired = data?.result?.isExpired
            if (this.isAssessed == 2 || this.isExpired == 1) {
                // 是否已经评测，1，是，2，否
                if (this.isAssessed == 2) {
                    this.cepingText = this.$t('jcdnwtjgfxcp')
                }
                // 是否评测过期，1，是，2，否
                if (this.isExpired == 1) {
                    this.cepingText = this.$t('ndfxcpjgygq')
                }
                this.cepingDiag = true
                return
            }
            try {
                // 显示loading
                this.showLoading = true
                const params = {
                    buyKeepAmountUSD: this.amountDisplayUSD, // USD自动转入金额
                    buyKeepAmountHKD: this.amountDisplayHKD, // HKD自动转入金额
                    subscriptionStatus: this.ggShiftTo ? 1 : 2,
                    subscriptionScheduleMode: this.getTimeArr[0] ? Number(this.getTimeArr[0]) + 1 : 1,
                    subscriptionScheduleValue: this.getTimeArr[0] ? Number(this.getTimeArr[1]) + 1 : 0,
                }
                const { result } = await ecashOpen(params)
                // 隐藏loading
                this.showLoading = false
                if (result) {
                    const url = `${location.origin}${location.pathname}#/review`
                    location.replace(addCurParamsForUrl(url))
                }
            } catch (e) {
                this.showLoading = false
                if (e?.error?.code === AGE_LIMIT_CODE) {
                    showTip()
                    return
                }
                const message = e.error?.data?.tips || this.$t('serviceError')
                Toast(message)
            }
        },
        // 保存当前页面的输入信息
        saveInputInfo() {
            const info = {
                ggToTheTime: this.ggToTheTime,
                getTimeArr: this.getTimeArr,
                amountDisplayHKD: this.amountDisplayHKD,
                amountDisplayUSD: this.amountDisplayUSD,
            }
            sessionStorage.setItem(CASHBOXINPUTINFO, JSON.stringify(info))
        },
    },
}
</script>
<style lang="less" scoped>
.product {
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 34px 0 58px;

    div {
        padding: 0 16px;
        color: #ff6907;
        font-weight: 400;
        font-size: 14px;
        line-height: 14px;
    }

    .left {
        border-right: 0.5px solid #9c9c9c;
    }
}

header {
    height: 48px;
    color: #666;
    line-height: 48px;
    text-align: center;
}

.custom-time {
    .next {
        width: 24px;
        height: 24px;
    }

    /deep/.van-picker__confirm {
        color: #ff6907;
    }
}

.cusinp {
    padding: 16px 16px 36px;

    ::v-deep .van-field {
        padding: 0;

        .van-field__body {
            width: 100%;
            height: 36px;
            padding: 7px 12px;
            background: #f8f8f8;
            border: none;
            border-radius: 8px;
        }
    }
}

.sign {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #f9f9f9;

    .account {
        margin: 12px 0;
    }

    .row {
        display: flex;
        flex-direction: row;
        padding: 0 20px;
        background: #fff;

        .no-border {
            border-bottom-width: 0 !important;
        }

        .row-content {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding: 18px 0;
            border-bottom: 0.5px solid #ebebeb;

            .content-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;

                .font-bold {
                    font-weight: 700;
                }

                .left {
                    font-size: 16px;
                    line-height: 16px;
                }

                .right {
                    display: flex;
                    flex-direction: row;
                    align-items: center;

                    .next {
                        width: 16px;
                        height: 16px;
                    }
                }
            }

            .content-bottom {
                padding-top: 12px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .buyType {
        height: 50px;

        .left {
            font-weight: 700;
        }
    }

    .agree {
        margin-top: 32px;
        padding: 0 20px;

        /deep/ .van-checkbox {
            align-items: flex-start;
        }

        p.footer-top__text {
            font-weight: 400;
            font-size: 12px;
            line-height: 17px;

            span {
                color: #9c9c9c;
            }

            a {
                color: #043799;
            }
        }
    }
}

.diagBox {
    padding: 17px 16px 28px;
    font-size: 14px;
}

.button {
    height: 44px;
    margin: 0 28px;
    margin-top: 16px;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 44px;
    text-align: center;
    background: #ff6307;
    border-radius: 22px;
    opacity: 0.3;

    &.canSign {
        opacity: 1;
    }
}

.desc {
    margin-top: 32px;
    padding: 0 17px;

    .desc-title {
        color: #9c9c9c;
        font-weight: 700;
        font-size: 12px;
        line-height: 16px;
    }

    .desc-content {
        &__text {
            margin-top: 8px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 18px;
            text-align: justify;
        }
    }
}
</style>
