<template>
    <div class="submit-result">
        <section class="header">
            <multi-img name="submit-success" directory="common" />
            <p>{{ result?.orderStatus === orderStatusKeysMap.CREATING ? $t('trade.tijiaochenggongCreating') : $t('trade.tijiaochenggong') }}</p>
            <p>{{ headerDesc }}</p>
        </section>
        <section class="process" v-if="result && (isPublic || result.orderStatus === orderStatusKeysMap.CREATING)">
            <trade-process :orderInfo="result"></trade-process>
        </section>
        <section class="center" v-if="result">
            <ul>
                <li v-for="(item, index) in resultList" :key="index" v-show="item.showConfig ? item.showConfig(result) : true">
                    <span class="label">{{ item.labelFormat ? item.labelFormat(result) : item.label }}</span>
                    <span class="value">{{ item.key | valueFilter(result, item) }}</span>
                </li>
            </ul>
        </section>
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

        <section class="footer">
            <div class="button" @click="completeHandler">{{ $t('complete') }}</div>
            <p @click="goOrderDetail">{{ $t('orderDetail') }}</p>
        </section>
        <section v-if="showEcashIntro" class="open-ecash">
            <div class="left">
                <p class="open-title">{{ $t('openEcash') }}</p>
                <div class="left-slogan">
                    <p>{{ $t('ecashProfitExceedSave') }}</p>
                    <div class="divider"></div>
                    <p>{{ $t('ecashTradeWeathAsync') }}</p>
                </div>
            </div>
            <button class="right" @click="goEcashOpen">{{ $t('noOpenCashBox') }}</button>
        </section>
        <section v-else-if="showEcashAutoRollIn" class="open-ecash open-ecash__auto">
            <div class="left">
                <p class="open-title">{{ $t('openEcashAuto') }}</p>
                <div class="left-slogan">
                    <p>{{ $t('ecashCreateInterest') }}</p>
                </div>
            </div>
            <button class="right" @click="goEcashSetting">{{ $t('goStart') }}</button>
        </section>
        <section v-else-if="showEcashKeepAmount" class="open-ecash open-ecash__amount">
            <div class="left">
                <p class="open-title">{{ $t('setKeepAmount') }}</p>
                <div class="left-slogan">
                    <p>{{ $t('ecashKeepAmountAuto') }}</p>
                </div>
            </div>
            <button class="right" @click="goEcashSetting">{{ $t('goSetting') }}</button>
        </section>
    </div>
</template>
<script>
import TradeProcess from '@/components/TradeProcess.vue'
import { orderDetail, ecashUserSetting } from '@/apis/wealth/index.js'
import { thousandsFilter } from '@/config/filters.js'
import { floatToRatio, keepDecimals, isTHSApp, addCurParamsForUrl } from '@/utils'
import dayjs from 'dayjs'
import { i18n } from '@/i18n/fund/index'
import NP from 'number-precision'
import { CURRENCY_MAP, ORDER_DIRECTION_MAP, SOURCE_TYPE_MAP, ORDER_STATUS_MAP } from '@/views/fund/config/common'
import { accountTypeMap as ACCOUNT_TYPE_MAP } from '@/config/common'
import { getRunEnv } from '@/utils/env'
import { AutoFxSetting } from '@/apis/cash'
dayjs.extend(require('dayjs/plugin/duration'))

const sourceTypeKeysMap = SOURCE_TYPE_MAP.keysMap

const accountTypeMap = ACCOUNT_TYPE_MAP.keyValueMap
const directionMap = {
    1: i18n.t('trade.buy'),
    2: i18n.t('trade.sell'),
}
const amountFilter = function (v) {
    return ['', undefined, null, NaN].includes(v) ? '--' : thousandsFilter(v)
}
const currencyFilter = function (v) {
    return CURRENCY_MAP.options.findLabel(v)
}
const orderStatusKeysMap = ORDER_STATUS_MAP.keysMap

export default {
    name: 'submitResult',
    components: {
        TradeProcess,
    },
    filters: {
        valueFilter(k, data, item) {
            let v = data[k]
            if (item.filter) {
                v = item.filter(v, data)
            }
            if ([null, undefined, '', NaN].includes(v)) {
                v = '--'
            }
            return v
        },
    },
    data() {
        return {
            orderStatusKeysMap,
            ecashUserSetting: {}, // 星财宝设置状态
            ecashOpenStatus: 1, // 星财宝开通状态 1：开通，0：未开通
            ecashKeepAmountStorageKey: 'SUBMIT-ECASH-KEEP-AMOUNT-DATE-STORAGE',
            ecashKeepAmountStorageDate: '', // 星财宝保留金额引导存储时间
            orderId: this.$route.query.orderId,
            orderNumber: this.$route.query.orderNumber,
            symbol: this.$route.query.symbol,
            result: null,
            publicColumnList: [
                {
                    // 产品名称
                    key: 'productName',
                    label: this.$t('productName'),
                },
                {
                    // 委托类型
                    key: 'orderDirection',
                    label: this.$t('orderDetailCols.orderDirection'),
                    filter: (v, data) => {
                        const { sourceType } = data
                        return `${sourceType === +sourceTypeKeysMap.AUTO ? i18n.t('auto') : ''}${ORDER_DIRECTION_MAP.options.findLabel(v)}`
                    },
                },
                {
                    // 买入金额
                    key: 'applyFeeAmount',
                    label: this.$t('trade.applyAmount'),
                    filter: (v, data) => {
                        const applyGrossAmount = data.applyGrossAmount
                        const value = NP.minus(applyGrossAmount, v)
                        return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                    },
                    showConfig: data => data?.orderDirection === 1,
                },
                {
                    //卖出份额
                    key: 'applyQuantity',
                    label: this.$t('trade.sellQuantity'),
                    filter: v => {
                        return `${amountFilter(v)}${this.$t('trade.part')}`
                    },
                    showConfig: data => data.orderDirection === 2 && !this.isMMF,
                },
                {
                    //卖出金额 (MMF基金)
                    key: 'applyFeeAmount',
                    label: this.$t('sellAmount'),
                    filter: (v, data) => {
                        const applyGrossAmount = data.applyGrossAmount
                        const value = NP.minus(applyGrossAmount, v)
                        return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                    },
                    showConfig: data => data.orderDirection === 2 && this.isMMF,
                },
                {
                    // 交易账户/回款账户
                    key: 'account',
                    label: this.$t('trade.tradeAccount'),
                    filter: (v, data) => {
                        return `${accountTypeMap[data.accountType]}(${v})`
                    },
                    labelFormat: data => {
                        const map = {
                            1: this.$t('trade.trade'),
                            2: this.$t('trade.return'),
                        }
                        const direction = map[data.orderDirection]
                        return `${direction}${this.$t('trade.account')}`
                    },
                },
                {
                    // 下单时间
                    key: 'submitTime',
                    label: this.$t('orderDetailCols.submitTime'),
                    filter(v) {
                        return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                    },
                },
                {
                    // 订单编号
                    key: 'orderNumber',
                    label: this.$t('trade.orderNumber'),
                },
            ],
            privateColumnList: [
                {
                    // 产品名称
                    key: 'productName',
                    label: this.$t('productName'),
                },
                {
                    // 委托类型
                    key: 'orderDirection',
                    label: this.$t('orderDetailCols.orderDirection'),
                    filter: (v, data) => {
                        return directionMap[data.orderDirection] || ''
                    },
                },
                {
                    // 买入金额
                    key: 'applyFeeAmount',
                    label: this.$t('trade.applyAmount'),
                    filter: (v, data) => {
                        const applyGrossAmount = data.applyGrossAmount
                        const value = NP.minus(applyGrossAmount, v)
                        return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 预估费用
                    key: 'applyFeeAmount',
                    label: this.$t('trade.estPrice'),
                    filter(v, data) {
                        return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 交易金额
                    key: 'applyNetAmount',
                    label: this.$t('trade.tradeAmount'),
                    filter(v, data) {
                        const applyFeeAmount = data.applyFeeAmount
                        const value = NP.plus(v, applyFeeAmount)
                        return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 交易账户
                    key: 'account',
                    label: this.$t('trade.tradeAccount'),
                    filter: (v, data) => {
                        return `${accountTypeMap[data.accountType]}(${v})`
                    },
                },
                {
                    // 下单时间
                    key: 'submitTime',
                    label: this.$t('orderDetailCols.submitTime'),
                    filter(v) {
                        return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                    },
                },
                {
                    // 订单编号
                    key: 'orderNumber',
                    label: this.$t('trade.orderNumber'),
                },
            ],
            billsColumnList: [
                {
                    // 产品名称
                    key: 'productName',
                    label: this.$t('productName'),
                },
                {
                    // 委托类型
                    key: 'orderDirection',
                    label: this.$t('orderDetailCols.orderDirection'),
                    filter: (v, data) => {
                        return directionMap[data.orderDirection] || ''
                    },
                },
                {
                    // 到期日期
                    key: 'productPeriod',
                    label: this.$t('orderDetailCols.productPeriod'),
                    filter: (val, data) => dayjs(data.productMaturityDate).format('YYYY/MM/DD'),
                },
                {
                    // 年化利率
                    key: 'productYield',
                    label: this.$t('orderDetailCols.productYield'),
                    filter: (val, data) => {
                        let value = ''
                        if (data['productMinYield'] && data['productMaxYield']) {
                            value = `${floatToRatio(data['productMinYield'], { pow: 2, sign: false })}~${floatToRatio(data['productMaxYield'], {
                                pow: 2,
                                sign: false,
                            })}`
                        } else {
                            value = floatToRatio(val, { pow: 2, sign: false })
                        }
                        return value
                    },
                },
                {
                    // 买入金额
                    key: 'applyFeeAmount',
                    label: this.$t('trade.applyAmount'),
                    filter: (v, data) => {
                        const applyGrossAmount = data.applyGrossAmount
                        const value = NP.minus(applyGrossAmount, v)
                        return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 预估费用
                    key: 'applyFeeAmount',
                    label: this.$t('trade.estPrice'),
                    filter(v, data) {
                        return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 交易金额
                    key: 'applyNetAmount',
                    label: this.$t('trade.tradeAmount'),
                    filter(v, data) {
                        const applyFeeAmount = data.applyFeeAmount
                        const value = NP.plus(v, applyFeeAmount)
                        return `${amountFilter(keepDecimals(value, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 交易账户
                    key: 'account',
                    label: this.$t('trade.tradeAccount'),
                    filter: (v, data) => {
                        return `${accountTypeMap[data.accountType]}(${v})`
                    },
                },
                {
                    // 下单时间
                    key: 'submitTime',
                    label: this.$t('orderDetailCols.submitTime'),
                    filter(v) {
                        return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                    },
                },
                {
                    // 订单编号
                    key: 'orderNumber',
                    label: this.$t('trade.orderNumber'),
                },
            ],
            bondColumnList: [
                {
                    // 产品名称
                    key: 'productName',
                    label: this.$t('productName'),
                },
                {
                    // 委托类型
                    key: 'orderDirection',
                    label: this.$t('orderDetailCols.orderDirection'),
                    filter: (v, data) => {
                        return directionMap[data.orderDirection] || ''
                    },
                },
                {
                    // 意向价格
                    key: 'applyPrice',
                    label: this.$t('trade.intentPrice'),
                    filter: (v, data) => {
                        return `${amountFilter(keepDecimals(v, 3))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 票面面值
                    key: 'applyParValue',
                    label: this.$t('trade.parAmount'),
                    filter: (v, data) => {
                        return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 预估应计利息
                    key: 'applyAccruedInterest',
                    label: this.$t('trade.estInterest'),
                    filter: (v, data) => {
                        return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 预估费用
                    key: 'applyFeeAmount',
                    label: this.$t('trade.estPrice'),
                    filter(v, data) {
                        return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 交易金额 => 预估交易金额
                    key: 'applyNetAmount',
                    label: this.$t('ygAmount'),
                    filter(v, data) {
                        return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 预估交付金额
                    key: 'applyGrossAmount',
                    label: this.$t('ygjfAmount'),
                    filter(v, data) {
                        return `${amountFilter(keepDecimals(v, 2))}${currencyFilter(data.currency)}`
                    },
                },
                {
                    // 交易账户
                    key: 'account',
                    label: this.$t('trade.tradeAccount'),
                    filter: (v, data) => {
                        return `${accountTypeMap[data.accountType]}(${v})`
                    },
                },
                {
                    // 下单时间
                    key: 'submitTime',
                    label: this.$t('orderDetailCols.submitTime'),
                    filter(v) {
                        return dayjs(v).format('YYYY/MM/DD HH:mm:ss')
                    },
                },
                {
                    // 订单标号
                    key: 'orderNumber',
                    label: this.$t('trade.orderNumber'),
                },
            ],
            autoFxSettingStatus: true, // 用户的自动换汇状态
        }
    },
    computed: {
        type() {
            return this.$route.query.type ?? ''
        },
        isMMF() {
            const isMMF = this.$route.query.isMMF ?? 0
            return Number(isMMF)
        },
        isPublic() {
            return this.type === 'public'
        },
        isBond() {
            return this.type === 'bond'
        },
        isBillFNC() {
            return this.type === 'bills' && this.result.noteProperty === 3
        },
        isMarketingBill() {
            return this.type === 'bills' && this.result.noteProperty === 4
        },
        // 显示星财宝开通引导
        showEcashIntro() {
            return this.isMMF === 1 && this.ecashOpenStatus !== 1
        },
        // 显示星财宝自动买入引导
        showEcashAutoRollIn() {
            if (this.isMMF && this.ecashOpenStatus) {
                // 港美股两个市场都没有开通自动买入
                const HKStatus = this.ecashUserSetting?.hkd?.subscriptionStatus ?? 1 // 自动申购状态：1-开启 2-关闭
                const USStatus = this.ecashUserSetting?.usd?.subscriptionStatus ?? 1 // 自动申购状态：1-开启 2-关闭
                if (HKStatus === 2 && USStatus === 2) {
                    return true
                }
            }
            return false
        },
        // 显示星财宝账户保留金额引导
        showEcashKeepAmount() {
            if (this.isMMF && this.ecashOpenStatus) {
                // 港美股两个市场的账户保留金额都 <= 0
                const HKKeepAmount = this.ecashUserSetting?.hkd?.keepAmount ?? '0' // 自动转入保留金额
                const USKeepAmouunt = this.ecashUserSetting?.usd?.keepAmount ?? '0'
                if (Number(HKKeepAmount) <= 0 && Number(USKeepAmouunt) <= 0) {
                    if (this.ecashKeepAmountStorageDate) {
                        // 判断时间是否在当天或者是否超过30天
                        const today = dayjs().format('YYYY-MM-DD')
                        if (this.ecashKeepAmountStorageDate === today) {
                            return true
                        }
                        // 是否超出30天
                        const isExceedThirty = dayjs().subtract(30, 'day').valueOf() >= dayjs(this.ecashKeepAmountStorageDate).valueOf()
                        if (isExceedThirty) {
                            return true
                        }
                    } else {
                        return true
                    }
                }
            }
            return false
        },
        headerDesc() {
            const map = {
                bond: this.$t('orderDetailFields.applySuccessTipsForBond'),
                public: this.$t('orderDetailFields.tradeSuccessRemind'),
                bills: this.$t('orderDetailFields.applySuccessTipsForBill'),
            }
            return map[this.type] || this.$t('orderDetailFields.applySuccessTips')
        },
        resultList() {
            let list = this[`${this.type}ColumnList`] || []
            if (this.isBillFNC) {
                const index = list.findIndex(i => {
                    return i.key === 'productYield'
                })
                list[index].label = this.$t('fcn.coupon')
            }
            if (this.isMarketingBill) {
                list = list.filter(item => item.key !== 'productYield')
            }
            return list
        },

        showAutoExchangeGuide() {
            // 现金账户 购买力产品 未开通自动换汇
            return this.$route.query.showAutoExchangeGuide == 1 && !this.autoFxSettingStatus
        },
    },
    async created() {
        const task = []
        task.push(this.orderDetail())
        task.push(this.getAutExchangeStatus())
        if (this.isMMF) {
            task.push(this.getEcashUserStatus())
        }
        this.$loading.show = {
            show: true,
            options: {
                mask: true,
            },
        }
        await Promise.all(task)
        this.$loading.show = false
    },
    mounted() {
        if (this.isMMF) {
            this.$jsBridge &&
                this.$jsBridge.watchPageVisible(() => {
                    this.getEcashUserStatus()
                })
        }
    },
    methods: {
        async orderDetail() {
            try {
                const { result } = await orderDetail({
                    orderNumber: this.orderNumber,
                    orderId: this.orderId,
                })
                this.result = result
            } catch (e) {
                console.log(e)
            }
        },
        completeHandler() {
            this.$router.go(-1)
            setTimeout(() => {
                console.log('submit-result   setTimeout===>200', this.$route.path)
                if (this.$route.path === '/submit-result') {
                    // 如果延时还在当前页面 认为是在webview的第一层 直接关闭webview
                    if (this.$jsBridge) {
                        this.$jsBridge.close()
                    } else if (isTHSApp()) {
                        // eslint-disable-next-line no-undef
                        callNativeHandler('goback', { type: 'component' })
                    } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                        this.$thsI18NJsBridge.goBack()
                    }
                }
            }, 200)
        },
        goOrderDetail() {
            this.$router.replace({
                path: '/order-detail',
                query: {
                    orderId: this.orderId,
                    orderNumber: this.orderNumber,
                },
            })
        },
        // 星财宝开通信息
        async getEcashUserStatus() {
            try {
                const result = await this.$store.dispatch('user/getEcashStatus', true)
                this.ecashOpenStatus = result?.openStatus || 0
                if (this.ecashOpenStatus) {
                    // 已开通 查询 星财宝设置状态
                    this.getKeepAmountStorageDate()
                    await this.getEcashUserSetting()
                }
            } catch (e) {
                console.error('ecashUserStatus===>e:', e)
            }
        },
        // 获取星财宝设置信息
        async getEcashUserSetting() {
            try {
                const { result } = await ecashUserSetting()
                this.ecashUserSetting = result || {}
            } catch (e) {
                console.log('===>error:', e)
            }
        },
        // 获取星财宝保留金额引导存储时间
        async getKeepAmountStorageDate() {
            const date = await this.getCashCache(this.ecashKeepAmountStorageKey)
            console.warn('getKeepAmountStorageDate-date:', date)
            date && (this.ecashKeepAmountStorageDate = date)
            console.log('this.showEcashKeepAmount', this.showEcashKeepAmount)
            if (this.showEcashKeepAmount) {
                this.setKeepAmountStorageDate()
            }
        },
        // 设置星财宝保留金额引导存储时间
        async setKeepAmountStorageDate() {
            const date = dayjs().format('YYYY-MM-DD')
            console.log('setKeepAmountStorageDate', date)
            this.setCashCache(this.ecashKeepAmountStorageKey, date)
        },

        /**
         * @name 设置缓存时间
         * @param {String} key
         * @param {String} times
         */
        setCashCache(key, times) {
            if (this.$jsBridge) {
                this.$jsBridge.writeLocalStorage(key, times)
            } else {
                return localStorage.setItem(key, times)
            }
        },
        // 获取缓存时间
        async getCashCache(key) {
            if (this.$jsBridge) {
                const cache = await this.$jsBridge.readLocalStorage(key)
                return cache?.value ?? ''
            }
            return localStorage.getItem(key)
        },

        goEcashOpen() {
            this.$goPage(
                '/beforeSign',
                {},
                {
                    pathname: '/wealth/cashBox.html',
                }
            )
        },
        goEcashSetting() {
            this.$goPage(
                '/autoDeal',
                {},
                {
                    pathname: '/wealth/cashBox.html',
                }
            )
        },
        goAutoExchange() {
            let url = `${location.origin}/pages/autoExchange.html#/?sub=${this.$store.state.user.subAccountId}`
            if (getRunEnv() === 2) {
                url = addCurParamsForUrl(url)
            }
            location.href = url
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
    },
}
</script>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.submit-result {
    min-height: 100vh;
    padding: 0 12px;
    background: #f9f9f9;
    #iosBottom(8px);

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 37px 0 32px;

        img {
            width: 60px;
            height: 60px;
        }

        p:first-of-type {
            padding: 21px 0 4px;
            color: #1f1f1f;
            font-weight: 700;
            font-size: 18px;
            line-height: 26px;
            text-align: center;
        }

        p:nth-of-type(2) {
            width: 284px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }

    .process {
        margin-bottom: 12px;
        padding: 16px 28px;
        background: #fff;
        border-radius: 8px;
    }

    .center {
        padding: 8px 12px;
        background: #fff;
        border-radius: 8px;

        ul {
            li {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;

                .label {
                    flex: 0 0 110px;
                    color: #666;
                    text-align: left;
                }

                .value {
                    flex: 1;
                    color: #1f1f1f;
                    text-align: right;
                }
            }
        }
    }

    .footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 0 0;

        .button {
            width: 100%;
            height: 44px;
            color: #fff;
            font-weight: bold;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background: #ff6907;
            border-radius: 49px;
        }

        p {
            padding-top: 12px;
            color: #ff6907;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }

    .open-ecash {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 32px;
        padding: 16px;
        background-color: #fff;
        background-image: url('~@/assets/images/fund/ecash-open-bg@3x.png');
        background-repeat: no-repeat;
        background-position: left bottom;
        background-size: 69px 66px;
        border-radius: 8px;
        box-shadow: inset 0.5px 0.5px 0 #fff;

        .left {
            display: flex;
            flex-direction: column;

            .open-title {
                color: #2f2f2f;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }

            .left-slogan {
                display: flex;
                align-items: center;
                margin-top: 6px;
                color: #666;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;

                .divider {
                    height: 11px;
                    margin: 0 6px;
                    border-left: 0.5px solid #cfcfcf;
                }
            }
        }

        .right {
            padding: 4px 12px;
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            background: #ff6907;
            border-width: 0;
            border-radius: 14px;
        }
    }

    .open-ecash__auto {
        background-image: url('~@/assets/images/fund/ecash-open-auto@3x.png');
        background-position: 0 3px;
        background-size: 86px 86px;
    }

    .open-ecash__amount {
        background-image: url('~@/assets/images/fund/ecash-keep-amount@3x.png');
        background-position: 0 5px;
        background-size: 90px 71px;
    }

    .auto-exchange-guide {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 12px;
        padding: 16px;
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
