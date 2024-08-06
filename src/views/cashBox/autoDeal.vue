<template>
    <div class="auto-deal" v-show="loadPage">
        <div class="deal-box">
            <div class="account-title">
                <div class="account-title__left">
                    <div class="account-info">
                        <multi-img :name="`account-type__USD`" directory="common" />
                        <span class="account-type">{{ $t('USDMarket') }}{{ accountType }}</span>
                        <p class="status" :class="[mgShiftTo ? 'open' : 'pause']">{{ $t('had') }}{{ mgShiftTo ? $t('open') : $t('pause') }}</p>
                    </div>
                    <div class="amount-info">
                        <span>
                            {{ $t('canUseCash') }}
                            <span class="bold">{{ singleWithdrawMap.USD | amountFilter }}</span>
                            {{ $t('USD') }}
                        </span>
                    </div>
                </div>
                <van-switch class="account-title__right" :value="mgShiftTo" @input="shiftTotChange('usd')"></van-switch>
            </div>
            <div class="row">
                <div class="row-content" @click="chooseProductAction(2)">
                    <div class="row-content__top">
                        <div class="left">{{ $t('autoRollIn') }}{{ $t('product') }}</div>
                        <div class="right">
                            <span>{{ mgproductName }}</span>
                            <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                        </div>
                    </div>
                    <div class="row-content__bottom">{{ $t('idleCashRecommandUS') }}</div>
                </div>
            </div>
            <div class="row" @click="checkTime(2)">
                <div class="row-content">
                    <div class="row-content__top">
                        <div class="left">{{ $t('autoRollIn') }}{{ $t('date') }}</div>
                        <div class="right">
                            <span>{{ mgToTheTime }}</span>
                            <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                        </div>
                    </div>
                    <div class="row-content__bottom">{{ $t('deferredRemind') }}</div>
                </div>
            </div>
            <div class="row">
                <div class="row-content no-shadow" @click="reservedAmount(2)">
                    <div class="row-content__top">
                        <div class="left">{{ $t('reserveCash') }}</div>
                        <div class="right">
                            <span>{{ mgKeepAmount | thousandsFilter }} {{ $t('USD') }}</span>
                            <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                        </div>
                    </div>
                    <div class="row-content__bottom">{{ $t('ecashKeepAmountAuto') }}</div>
                </div>
            </div>
        </div>
        <div class="deal-box">
            <div class="account-title">
                <div class="account-title__left">
                    <div class="account-info">
                        <multi-img :name="`account-type__HKD`" directory="common" />
                        <span class="account-type">{{ $t('HKDMarket') }}{{ accountType }}</span>
                        <p class="status" :class="[ggShiftTo ? 'open' : 'pause']">{{ $t('had') }}{{ ggShiftTo ? $t('open') : $t('pause') }}</p>
                    </div>
                    <div class="amount-info">
                        <span>
                            {{ $t('canUseCash') }}
                            <span class="bold">{{ singleWithdrawMap.HKD | amountFilter }}</span>
                            {{ $t('HKD') }}
                        </span>
                    </div>
                </div>
                <van-switch class="account-title__right" :value="ggShiftTo" @input="shiftTotChange('hkd')"></van-switch>
            </div>
            <div class="row">
                <div class="row-content" @click="chooseProductAction(1)">
                    <div class="row-content__top">
                        <div class="left">{{ $t('autoRollIn') }}{{ $t('product') }}</div>
                        <div class="right">
                            <span>{{ ggproductName }}</span>
                            <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                        </div>
                    </div>
                    <div class="row-content__bottom">{{ $t('idleCashRecommandHK') }}</div>
                </div>
            </div>
            <div class="row" @click="checkTime(1)">
                <div class="row-content">
                    <div class="row-content__top">
                        <div class="left">{{ $t('autoRollIn') }}{{ $t('date') }}</div>
                        <div class="right">
                            <span>{{ ggToTheTime }}</span>
                            <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                        </div>
                    </div>
                    <div class="row-content__bottom">{{ $t('deferredRemind') }}</div>
                </div>
            </div>
            <div class="row">
                <div class="row-content no-shadow" @click="reservedAmount(1)">
                    <div class="row-content__top">
                        <div class="left">{{ $t('reserveCash') }}</div>
                        <div class="right">
                            <span>{{ ggKeepAmount | thousandsFilter }} {{ $t('HKD') }}</span>
                            <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                        </div>
                    </div>
                    <div class="row-content__bottom">{{ $t('ecashKeepAmountAuto') }}</div>
                </div>
                <!-- 新手引导 -->
                <div v-if="showGuide" class="setting-guide" @touchstart.prevent="handleGuide">
                    <div class="guide-content">
                        <div class="setting-guide row-content no-shadow">
                            <div class="row-content__top">
                                <div class="left">{{ $t('reserveCash') }}</div>
                                <div class="right">
                                    <span>{{ 400 | thousandsFilter }} {{ $t('HKD') }}</span>
                                    <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                                </div>
                            </div>
                            <div class="row-content__bottom">{{ $t('ecashKeepAmountAuto') }}</div>
                        </div>
                        <p class="guide-text" v-html="$t('ecashGuideTest3')"></p>
                        <multi-img class="guide-img" name="ecash-guide-3" directory="noob" />
                    </div>
                </div>
            </div>
        </div>

        <div class="desc">
            <p class="desc-title">{{ $t('cashServeDeclare') }}</p>
            <div class="desc-content">
                <p class="desc-content__text">{{ $t('cashServeText1') }}</p>
                <p class="desc-content__text">{{ $t('cashServeText2') }}</p>
            </div>
        </div>
        <van-action-sheet v-model="showTime" :lazy-render="false">
            <div class="custom-time">
                <van-picker
                    ref="timePicker"
                    show-toolbar
                    :title="$t('dateSetting')"
                    :confirm-button-text="$t('queding')"
                    :columns="columns"
                    @change="onChange"
                    @confirm="confirmTime"
                    cancel-button-text=" "
                >
                    <multi-img slot="cancel" class="next" name="icon-cancel" directory="common" @click="cancelTime"></multi-img>
                </van-picker>
            </div>
        </van-action-sheet>
        <van-dialog
            v-model="amountShow"
            class-name="custom-dialog"
            overlay-class="custom-overlay"
            :confirm-button-text="$t('queding')"
            :title="`${$t('reserveCash')}（${ggOrmgAmount === 1 ? $t('HKD') : $t('USD')}）`"
            show-cancel-button
            @confirm="confirmAmount"
            :before-close="beforeCloseHandler"
        >
            <div class="cusinp">
                <van-field
                    type="text"
                    clearable
                    ref="input"
                    v-model="keepAmount"
                    :placeholder="`0.00${ggOrmgAmount === 1 ? $t('gangyuan') : $t('USD')}`"
                    @keyup="inputHander"
                />
            </div>
        </van-dialog>
        <choose-product
            v-model="chooseProductFlag"
            :currency="productCurrency"
            :symbol="ggOrmgSubscriptionProduct"
            @choose="chooseProductHandler"
        ></choose-product>
    </div>
</template>
<script>
import { getWithDrawalBalance } from '@/apis/portfolio/index.js'
import { accountTypeMap } from '@/config/common'
import { thousandsFilter, amountFilter } from '@/config/filters.js'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt.js'
import { Toast, Switch, Area, ActionSheet } from 'vant'
import { mapState } from 'vuex'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
import chooseProduct from './components/chooseProduct.vue'
import { ecashUserSetting, userSettingUpdate } from '@/apis/wealth/index.js'
import { selectDateMap, rangeMap } from '@/views/cashBox/config/common'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { keepDecimals } from '@/utils'
import { isInOutsideH5 } from '@/utils'
import { getPubList } from '@/apis/fund/fund'

const accountTypeKeyMap = accountTypeMap.keyValueMap
const rangeKeyValueMap = rangeMap.keyValueMap // { DAY: '每日', ... }
const rangekeysMap = rangeMap.keysMap // { 0: DAY, 1: WEEK ... }
const rangeColumns = Object.values(rangeKeyValueMap) // [每日， 每周， 每月]

export default {
    name: 'auto-deal',
    filters: {
        thousandsFilter,
        amountFilter,
    },
    data() {
        return {
            ecashKeepAmountGuideKey: 'ECASH_KEEP_AMOUNT_GUIDE', // 保留金额新手引导key
            showGuide: false, // 保留金额 新手引导
            loadPage: false,
            keepAmount: '',
            ggKeepAmount: '', //港股保留金额
            mgKeepAmount: '', //美股保留金额
            amountDisplay: '',
            ggShiftTo: true, //港股买入
            mgShiftTo: true, //美股买入
            showTime: false,
            ggToTheTime: '', //港股买入时间
            mgToTheTime: '', //美股买入时间
            ggGetTimeArr: [], //港股选择的时间
            mgGetTimeArr: [], //美股选择的时间
            checkTimeFlag: '',
            amountShow: false, //保留金额弹窗
            ggOrmgAmount: '', //判断是港股还是美股保留金额 1 港股 2美股
            chooseProductFlag: false,
            columns: [], // 时间选择器展示的选项
            defaultColumns: [{ values: rangeColumns }, { values: selectDateMap[rangekeysMap[0]] }], // 时间选择器默认选项
            chooseProduct: null, // 选择的产品
            ggproductName: this.$t('smartTactics'),
            mgproductName: this.$t('smartTactics'),
            productFlag: '', //1 港股策略 2美股
            ggsubscriptionProduct: '', //港股买入策略symbol
            mgsubscriptionProduct: '', //美股买入策略symbol
            ggsubscriptionStrategy: '', //港股买入策略
            mgsubscriptionStrategy: '', //美股买入策略
            ProductList: [],
            originUserSettingInfo: {}, // 存储用户设置信息
            singleWithdrawMap: {
                // 单币种可提金额
                HKD: 0,
                USD: 0,
            },
            myLinkTradeLogin: null,
        }
    },
    components: {
        [Switch.name]: Switch,
        [Area.name]: Area,
        [ActionSheet.name]: ActionSheet,
        chooseProduct,
    },
    async created() {
        this.getGuide()
        Object.keys(this.singleWithdrawMap).forEach(currency => {
            this.getDrawBalance(currency)
        })
        await this.getList()
        this.$loading.show = true
        await this.getUserSetting()
        this.$loading.show = false
    },
    computed: {
        ...mapState('user', ['accts']),
        //策略symbol
        ggOrmgSubscriptionProduct() {
            return this.productFlag === 1 ? this.ggsubscriptionProduct : this.mgsubscriptionProduct
        },
        // 选择产品币种
        productCurrency() {
            return this.productFlag === 1 ? 'HKD' : 'USD'
        },
        accountType() {
            return accountTypeKeyMap[this.accts.type]
        },
    },
    watch: {
        '$route.query.chooseProduct': {
            handler(v) {
                this.chooseProductFlag = v ? true : false
                this.setTitle(v ? this.$t('select') : this.$t('smartTactics'))
            },
            deep: true,
        },
    },
    methods: {
        setTitle(title) {
            if (!title) return
            if (this.$jsBridge) {
                this.$jsBridge.setTitle(title)
            } else {
                window.document.title = title
            }
        },
        async getList() {
            try {
                const { result } = await getPubList({
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
                })
                const list = result?.list || []
                this.ProductList = list
            } catch (e) {
                console.log('getPubList===>e:', e)
            }
        },
        getPtinfo(v1, v2) {
            const arrItem1 = this.ProductList.find(item => item.symbol === v1)
            const arrItem2 = this.ProductList.find(item => item.symbol === v2)
            this.ggproductName = arrItem1?.name ? arrItem1.name : this.$t('smartTactics')
            this.mgproductName = arrItem2?.name ? arrItem2.name : this.$t('smartTactics')
        },
        // 切换自动买入
        shiftTotChange(type = 'hkd') {
            const marketTypeMap = {
                hkd: this.$t('HKDMarket'),
                usd: this.$t('USDMarket'),
            }
            const currencyTypeMap = {
                hkd: this.$t('gangyuan'),
                usd: this.$t('USD'),
            }
            const key = type === 'hkd' ? 'ggShiftTo' : 'mgShiftTo'
            const v = !this[key]
            const request = async () => {
                const subStatus = v ? 1 : 2
                const tradeLoginResult = await this.verifyTradeLogin()
                if (!tradeLoginResult) return
                const res = await this.updateInvoke(
                    {
                        ops: {
                            [type]: {
                                subscriptionStatus: subStatus,
                            },
                        },
                    },
                    subStatus
                )
                if (res) {
                    this[key] = !this[key]
                }
            }
            if (this[key]) {
                // 开通=>暂停
                this.$dialog
                    .confirm({
                        value: true,
                        title: this.$t('confirmCloseSmart', { market: marketTypeMap[type] }),
                        message: this.$t('closeSmartRemind', { market: marketTypeMap[type], currency: currencyTypeMap[type] }),
                        confirmButtonColor: '#ff6907',
                        confirmButtonText: this.$t('stopConfirm'),
                        cancelButtonText: this.$t('thinkTwice'),
                    })
                    .then(() => {
                        request()
                    })
            } else {
                // 暂停=>开通
                request()
            }
        },
        //时间
        onChange(picker, values) {
            const key = values[0]
            const index = rangeColumns.findIndex(item => item === key)
            if (index !== -1) {
                picker.setColumnValues(1, selectDateMap[rangekeysMap[index]])
            }
        },
        //自动买入时间
        confirmTime(value, index) {
            this.showTime = false
            this.checkTimeFlag == 1 ? (this.ggGetTimeArr = index) : this.checkTimeFlag == 2 ? (this.mgGetTimeArr = index) : ''
            if (index[0] == 0 && index[1] == 0) {
                this.checkTimeFlag == 1 ? (this.ggToTheTime = value[1]) : this.checkTimeFlag == 2 ? (this.mgToTheTime = value[1]) : ''
            } else {
                this.checkTimeFlag == 1
                    ? (this.ggToTheTime = value[0] + value[1])
                    : this.checkTimeFlag == 2
                    ? (this.mgToTheTime = value[0] + value[1])
                    : ''
            }
            const obj =
                this.checkTimeFlag == 1
                    ? {
                          subscriptionScheduleMode: this.ggGetTimeArr[0] ? Number(this.ggGetTimeArr[0]) + 1 : 1,
                          subscriptionScheduleValue: this.ggGetTimeArr[0] ? Number(this.ggGetTimeArr[1]) + 1 : 0,
                      }
                    : this.checkTimeFlag == 2
                    ? {
                          subscriptionScheduleMode: this.mgGetTimeArr[0] ? Number(this.mgGetTimeArr[0]) + 1 : 1,
                          subscriptionScheduleValue: this.mgGetTimeArr[0] ? Number(this.mgGetTimeArr[1]) + 1 : 0,
                      }
                    : ''
            const ops = {}
            this.checkTimeFlag == 1 ? (ops.hkd = obj) : this.checkTimeFlag == 2 ? (ops.usd = obj) : ''
            this.userSettingUpdate({ ops })
        },
        checkTime(type) {
            const key = type === 1 ? 'ggGetTimeArr' : 'mgGetTimeArr'
            const timeArr = this[key]
            if (timeArr.length === 2) {
                this.columns = [
                    {
                        values: rangeColumns,
                        defaultIndex: timeArr[0],
                    },
                    {
                        values: selectDateMap[rangekeysMap[timeArr[0]]],
                        defaultIndex: timeArr[1],
                    },
                ]

                const timePicker = this.$refs.timePicker
                if (timePicker) {
                    // 时间选择器设置默认值
                    timePicker.setIndexes([timeArr[0], timeArr[1]])
                }
            } else {
                this.columns = this.defaultColumns
            }
            this.$nextTick(() => {
                this.showTime = true
                this.checkTimeFlag = type
            })
        },
        cancelTime() {
            this.showTime = false
        },
        //保留金额
        confirmAmount() {
            if (this.keepAmount === '') return
            this.ggOrmgAmount === 1 ? (this.ggKeepAmount = this.keepAmount) : this.ggOrmgAmount === 2 ? (this.mgKeepAmount = this.keepAmount) : ''
            const hkdOrusd = this.ggOrmgAmount === 1 ? 'hkd' : this.ggOrmgAmount === 2 ? 'usd' : ''
            const ops = {}
            ops[hkdOrusd] = {
                keepAmount: this.ggOrmgAmount === 1 ? this.ggKeepAmount : this.ggOrmgAmount === 2 ? this.mgKeepAmount : '',
            }
            this.userSettingUpdate({ ops })
        },
        beforeCloseHandler(action, done) {
            if (action === 'confirm' && this.keepAmount === '') {
                this.$toast(this.$t('pleaseInputAmount'))
                done(false)
            } else {
                done()
            }
        },
        //策略
        async chooseProductHandler(row) {
            this.productFlag === 1
                ? (this.ggproductName = row ? row.name : this.$t('smartTactics'))
                : this.productFlag === 2
                ? (this.mgproductName = row ? row.name : this.$t('smartTactics'))
                : ''
            const symbol = row ? row.symbol : undefined
            this.chooseProduct = row
            const ops = {}
            const hkdOrusd = this.productFlag === 1 ? 'hkd' : this.productFlag === 2 ? 'usd' : ''
            ops[hkdOrusd] = {
                subscriptionStrategy: symbol ? 1 : 2,
                subscriptionProduct: symbol,
            }
            this[`${this.productFlag === 1 ? 'gg' : 'mg'}subscriptionProduct`] = symbol ?? ''
            this.$router.go(-1)
            this.userSettingUpdate({ ops })
        },
        chooseProductAction(v) {
            this.productFlag = v
            this.$router.push({
                ...this.$route,
                query: {
                    ...this.$route.query,
                    chooseProduct: 1,
                    tipsPage: 1,
                },
            })
        },
        //保留金额
        reservedAmount(type) {
            this.keepAmount = type === 1 ? this.ggKeepAmount : this.mgKeepAmount
            this.amountShow = true
            this.ggOrmgAmount = type
        },
        /**
         *
         * @param {Object} data 请求参数
         * @param {*} subStatus 恢复/暂停  undefined：非修改自动买入状态
         */
        async userSettingUpdate(data, subStatus) {
            const tradeLoginResult = await this.verifyTradeLogin()
            tradeLoginResult && this.updateInvoke(data, subStatus)
        },
        // 交易密码校验
        async verifyTradeLogin() {
            if (JSBridge) {
                try {
                    await this.$jsBridge.tradeLogin()
                    return true
                } catch (e) {
                    console.log('userSettingUpdate-tradeLogin===>error:', e)
                    // 交易密码输入失败 还原选项
                    this.syncUserSetting(this.originUserSettingInfo)
                    return false
                }
            } else if (isInOutsideH5()) {
                if (!this.myLinkTradeLogin) {
                    this.myLinkTradeLogin = new TradeLogin({ propsData: { subAcctId: this.accts.subAcctId } })
                }
                this.myLinkTradeLogin.show = true
                const task = new Promise(resolve => {
                    this.myLinkTradeLogin.vm.$once('ok', () => {
                        console.log('myLinkTradeLogin-on-ok:')
                        resolve(true)
                    })
                    this.myLinkTradeLogin.vm.$once('cancel', () => {
                        console.log('myLinkTradeLogin-on-error:')
                        this.syncUserSetting(this.originUserSettingInfo)
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
        // 调用修改
        async updateInvoke(data, subStatus) {
            try {
                const encrypt = ENCRYPT_TYPES.APP_TRADE_ENC
                const { result } = await userSettingUpdate(data, { encrypt })
                if (result?.success) {
                    if (subStatus) {
                        // 恢复暂停另外提醒
                        Toast(subStatus === 1 ? this.$t('revoverSettingSuccess') : this.$t('pauseSettingSuccess'))
                    } else {
                        Toast(this.$t('settingSuccess'))
                    }
                    // 修改成功，更新本地原始信息
                    this.getUserSetting()
                    return true
                }
            } catch (e) {
                // 接口更新失败还原选项
                this.syncUserSetting(this.originUserSettingInfo)
                console.log('userSettingUpdate===>e:', e)
                const message = e.error.data?.tips || this.$t('serviceError')
                Toast(message)
                return false
            }
        },

        chkPrice(e) {
            e.target.value = e.target.value.replace(/[^\d.]/g, '')
            //必须保证第一位为数字而不是.
            e.target.value = e.target.value.replace(/^\./g, '')
            //保证只有出现一个.而没有多个.
            e.target.value = e.target.value.replace(/\.{2,}/g, '.')
            //保证.只出现一次，而不能出现两次以上
            e.target.value = e.target.value.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
            if (e.target.value.replace(/^(.*\..{2}).*$/, '$1') > 99999999.99) {
                Toast(this.$t('cgzdbljexz'))
                this.amountDisplay = thousandsFilter(this.keepAmount)
                return
            }
            this.keepAmount = e.target.value.replace(/^(.*\..{2}).*$/, '$1') //只能输入2位小数
            this.amountDisplay = e.target.value = thousandsFilter(this.keepAmount)
        },
        chkLast() {
            if (this.amountDisplay == '') {
                return
            }
            this.keepAmount = keepDecimals(this.keepAmount, 2)
            this.amountDisplay = thousandsFilter(this.keepAmount)
        },
        //获取用户信息
        async getUserSetting() {
            try {
                const { result } = await ecashUserSetting()
                if (result) {
                    // 暂存用户信息数据
                    this.originUserSettingInfo = result
                    this.syncUserSetting(result)
                }
            } catch (error) {
                console.log('e', error)
                const message = error.error.data?.tips || this.$t('serviceError')
                Toast(message)
            } finally {
                this.loadPage = true
            }
        },
        // 同步userSetting数据
        syncUserSetting(result = {}) {
            this.ggShiftTo = result?.hkd.subscriptionStatus === 1
            this.mgShiftTo = result?.usd.subscriptionStatus === 1
            this.ggGetTimeArr = [
                result?.hkd.subscriptionScheduleMode ? Number(result?.hkd.subscriptionScheduleMode) - 1 : result?.hkd.subscriptionScheduleMode,
                result?.hkd.subscriptionScheduleValue ? Number(result?.hkd.subscriptionScheduleValue) - 1 : result?.hkd.subscriptionScheduleValue,
            ]
            this.mgGetTimeArr = [
                result?.usd.subscriptionScheduleMode ? Number(result?.usd.subscriptionScheduleMode) - 1 : result?.usd.subscriptionScheduleMode,
                result?.usd.subscriptionScheduleValue ? Number(result?.usd.subscriptionScheduleValue) - 1 : result?.usd.subscriptionScheduleValue,
            ]

            // 港股
            if (this.ggGetTimeArr[0] === 0) {
                this.ggToTheTime = selectDateMap[rangekeysMap[0]][0] // 每日
            } else {
                const dateVal = rangeKeyValueMap[rangekeysMap[this.ggGetTimeArr[0]]] // 每周 每月
                this.ggToTheTime = dateVal + selectDateMap[rangekeysMap[this.ggGetTimeArr[0]]][this.ggGetTimeArr[1]]
            }
            // 美股
            if (this.mgGetTimeArr[0] === 0) {
                this.mgToTheTime = selectDateMap[rangekeysMap[0]][0] // 每日
            } else {
                const dateVal = rangeKeyValueMap[rangekeysMap[this.mgGetTimeArr[0]]] // 每周 每月
                this.mgToTheTime = dateVal + selectDateMap[rangekeysMap[this.mgGetTimeArr[0]]][this.mgGetTimeArr[1]]
            }

            this.ggKeepAmount = result?.hkd.keepAmount
            this.mgKeepAmount = result?.usd.keepAmount

            this.ggsubscriptionStrategy = result?.hkd.subscriptionStrategy
            this.mgsubscriptionStrategy = result?.usd.subscriptionStrategy
            this.ggsubscriptionProduct = result?.hkd.subscriptionStrategy === 1 ? result?.hkd.subscriptionProduct : ''
            this.mgsubscriptionProduct = result?.usd.subscriptionStrategy === 1 ? result?.usd.subscriptionProduct : ''

            this.getPtinfo(this.ggsubscriptionProduct, this.mgsubscriptionProduct)
        },

        // 保留金额输入
        inputHander() {
            if (!this.$refs.input) return
            const value = this.$refs.input.value.slice(0, 16)
            this.keepAmount = value.replace(/^\D*(\d*(?:\.\d{0,2})?).*$/g, '$1')
        },

        // 获取单币种可用
        async getDrawBalance(currency) {
            if (!Object.keys(this.singleWithdrawMap).includes(currency)) return
            try {
                const { result = {} } = await getWithDrawalBalance({ currency })
                this.singleWithdrawMap[currency] = result.singleWithdrawBalance ?? 0
            } catch (e) {
                console.log('getWithDrawalBalance===>e:', e)
            }
        },
        // 获取新手引导
        async getGuide() {
            if (this.$jsBridge) {
                try {
                    const data = await this.$jsBridge.readLocalStorage(this.ecashKeepAmountGuideKey)
                    this.showGuide = !(data && data.value)
                } catch (e) {
                    console.error('wealth-ecash-readLocalStorage===>error:', this.ecashKeepAmountGuideKey, e)
                }
            }
        },
        // 处理新手引导
        async handleGuide() {
            this.showGuide = false
            try {
                if (this.$jsBridge) {
                    await this.$jsBridge.writeLocalStorage(this.ecashKeepAmountGuideKey, '1')
                }
            } catch (e) {
                console.error('wealth-ecash-readLocalStorage===>error:', this.ecashKeepAmountGuideKey, e)
            }
        },
    },
}
</script>
<style lang="less" scoped>
.auto-deal {
    min-height: 100vh;
    padding: 12px 12px 32px;
    background-color: #f9f9f9;

    .deal-box:first-of-type {
        margin-top: 0;
    }

    .deal-box {
        margin-top: 12px;
        background: #fff;
        border-radius: 8px;

        .account-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            box-shadow: inset 0 -0.5px 0 #efefef;

            &__left {
                display: flex;
                flex-direction: column;

                .account-info {
                    display: flex;
                    align-items: center;

                    img {
                        width: 16px;
                        height: 16px;
                        margin-right: 8px;
                    }

                    span.account-type {
                        color: #2f2f2f;
                        font-weight: 700;
                        font-size: 16px;
                        line-height: 22px;
                        transform: translateY(0.5px);
                    }

                    .status {
                        margin-left: 8px;
                        padding: 2px 3px;
                        font-weight: 700;
                        font-size: 10px;
                        line-height: 12px;
                        border: 0.5px solid;
                        border-radius: 2px;
                    }

                    .open {
                        color: @theme;
                        border-color: @theme;
                    }

                    .pause {
                        color: #9c9c9c;
                        border-color: #9c9c9c;
                    }
                }

                .amount-info {
                    margin-top: 4px;
                    color: #666;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 22px;
                }
            }

            &__right {
                width: 40px;
                height: 24px;
                font-size: 24px;
                background-color: #d7d7d7;
                border: 1px solid #d7d7d7;

                /deep/ .van-switch__node {
                    box-shadow: none;
                    transition: none;
                }

                &.van-switch {
                    transition: none;
                }

                &.van-switch--on {
                    background-color: @theme;
                    border: 1px solid @theme;

                    /deep/ .van-switch__node {
                        transform: translateX(16px);
                    }
                }
            }
        }

        .row {
            position: relative;
            display: flex;
            flex-direction: row;
            height: 76px;
            margin: 0 12px;

            .no-shadow {
                box-shadow: none !important;
            }

            .row-content {
                display: flex;
                flex-direction: column;
                width: 100%;
                padding: 16px 8px;
                box-shadow: inset 0 -0.5px 0 #efefef;

                &__top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #2f2f2f;
                    font-weight: 400;
                    font-size: 16px;
                    line-height: 16px;

                    .right {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        font-size: 14px;

                        .next {
                            width: 16px;
                            height: 16px;
                        }
                    }
                }

                &__bottom {
                    margin-top: 12px;
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .setting-guide {
                position: absolute;
                top: 0;
                right: 0;
                left: 0;

                .guide-content {
                    position: relative;

                    .setting-guide {
                        position: relative;
                        z-index: 2000;
                        margin: 4px 0;
                        padding: 12px 8px !important;
                        background-color: #fff;
                        border-radius: 18px;
                    }

                    .guide-text {
                        position: absolute;
                        top: 134px;
                        left: 14px;
                        z-index: 2001;
                        width: 260px;
                        color: #ff6108;
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 22px;
                    }

                    img.guide-img {
                        position: absolute;
                        left: -10px;
                        z-index: 2000;
                        width: 347px;
                        max-width: none;
                        height: 140px;
                    }

                    &::after {
                        position: absolute;
                        top: -100vh;
                        left: -100vw;
                        z-index: 1000;
                        width: 200vw;
                        height: 200vh;
                        background-color: rgba(0, 0, 0, 0.7);
                        content: '';
                    }
                }
            }
        }

        .stop {
            .right {
                display: flex;
                flex-direction: column;

                .title {
                    color: @theme;
                }
            }
        }
    }

    .end {
        height: 56px;
        margin-top: 12px;

        p {
            margin-top: 4px;
            color: #9c9c9c;
            font-size: 12px;
        }
    }

    .popuptitle {
        padding: 11px 0;
        color: #2f2f2f;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
    }

    .popup-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 64px;
        padding-left: 12px;
        box-shadow: inset 12px 0 0 #fff, inset 0 -0.5px 0 #efefef;

        .stopDay {
            margin-bottom: 6px;
            color: #1f1f1f;
            font-size: 14px;
            line-height: 20px;
        }

        .buyDay {
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .popBox {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 240px;

        .title {
            padding: 11px 0;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
        }

        .openFace {
            position: absolute;
            top: 0;
            right: 0;
            padding-top: 12px;
            padding-right: 16px;
            color: @theme;
            font-size: 14px;
            line-height: 20px;
        }

        .popInput {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 16px;
        }

        .sureButton {
            width: 343px;
            height: 44px;
            margin-bottom: 20px;
            color: #fff;
            font-weight: 700;
            line-height: 44px;
            text-align: center;
            background: @theme;
            border-radius: 41px;
        }

        .forget {
            color: @theme;
            font-size: 16px;
            line-height: 22px;
        }
    }

    .button {
        height: 44px;
        margin: 0 28px;
        margin-top: 32px;
        color: #fff;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #ff6307;
        border-radius: 22px;
    }

    .custom-time {
        .next {
            width: 24px;
            height: 24px;
        }

        /deep/.van-picker__confirm {
            color: @theme;
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
}

.desc {
    margin-top: 32px;
    padding: 0 4px;

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
