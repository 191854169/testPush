// 资产页
<template>
    <div class="assets">
        <!-- 资产卡片 -->
        <div class="card">
            <div class="box-content">
                <div class="account" @click="chooseFlag = true">
                    <multi-img class="logo" :name="`account-type__${accountType}`" directory="common" />
                    <span>{{ curAccount }}</span>
                    <multi-img class="select" name="angle_trigger" directory="fund" alt="select"></multi-img>
                </div>
                <div class="asset-summary">
                    <div class="bg">
                        <multi-img class="bg-img" name="icon_liushui_xcb" directory="xcbAccount"></multi-img>
                    </div>
                    <asset-total
                        class="total"
                        :disableChange="disableChange"
                        :asset-msg="$t('totalHolding')"
                        :currency="currencyFinal"
                        @choose="currencyChooseHandler"
                        :amount="totalAssetsFinal"
                        :riseFall="false"
                        :sign="false"
                        @showAssetsHandler="toggleAssets"
                    ></asset-total>
                    <!-- 到期提醒 -->
                    <template v-if="showExpireRemindBox">
                        <div class="expire-remind-box" @click="goOrderList">
                            <div class="circle"></div>
                            <div class="text">
                                <span
                                    class="text-tip"
                                    v-html="`${$t('repaymentOrderText', { repaymentLength: assetStatus ? repaymentLength : '*' })}`"
                                ></span>
                            </div>
                            <multi-img class="more" name="icon_right_arrow_16" directory="common"></multi-img>
                        </div>
                    </template>
                    <div class="rate-info">
                        <div class="rate-info-item">
                            <div class="flex-c" @click="todayInterestTips" :style="{ height: '16px' }">
                                <div class="title">{{ $t('todayInterest') }}</div>
                                <multi-img class="info" name="icon-tips" directory="common"></multi-img>
                            </div>
                            <dynamic-font
                                v-if="assetStatus"
                                class="value"
                                :class="{ flat: todayInterestFinal == 0 }"
                                :value="todayInterestFinal | amountFilter"
                                :options="{ maxFontSize: 16, minFontSize: 12 }"
                            ></dynamic-font>
                            <div v-else class="value h2">****</div>
                        </div>
                        <div class="rate-info-item">
                            <div class="title text-center">{{ $t('accumulateInterest') }}</div>
                            <dynamic-font
                                v-if="assetStatus"
                                class="value text-center"
                                :class="{ flat: accumInterestFinal == 0 }"
                                :value="accumInterestFinal | amountFilter"
                                :options="{ maxFontSize: 16, minFontSize: 12 }"
                            ></dynamic-font>
                            <div v-else class="value h2 text-center">****</div>
                        </div>
                        <div class="rate-info-item">
                            <div class="title text-right">{{ $t('reciveFee') }}</div>
                            <dynamic-font
                                v-if="assetStatus"
                                class="value text-right"
                                :class="{ flat: dueInterestFinal == 0 }"
                                :value="dueInterestFinal | amountFilter"
                                :options="{ maxFontSize: 16, minFontSize: 12 }"
                            ></dynamic-font>
                            <div v-else class="value h2 text-right">****</div>
                        </div>
                    </div>
                    <template v-if="showSubscribeBtn">
                        <button class="btn subscribe" @click="goProductList">{{ $t('viewProducts') }}</button>
                    </template>
                    <div class="virtual-dom"></div>
                </div>
            </div>
        </div>
        <!-- 持仓逻辑 -->
        <template v-if="holdingList.length">
            <template>
                <div class="card holding-list" v-show="hkdHoldingList?.length && ['ALL', 'HKD'].includes(accountType)">
                    <h3 class="title">
                        <template v-if="isAllAccount">
                            <multi-img name="account-type__HKD" directory="common"></multi-img>
                            <span>{{ $t('fundAccountMap.HKD') }}</span>
                        </template>
                        <template v-else>
                            <span>{{ $t('myHoldings') }}({{ curHoldingList.length }})</span>
                        </template>
                    </h3>
                    <holding-table
                        ref="hkdTableRef"
                        key="HKD"
                        :assetStatus="assetStatus"
                        :list="hkdHoldingList"
                        @sort="(k, s) => onSort(k, s, 'hkd')"
                        @row-click="onRowClick"
                    ></holding-table>
                </div>
                <div class="card holding-list" v-show="usdHoldingList?.length && ['ALL', 'USD'].includes(accountType)">
                    <h3 class="title">
                        <template v-if="isAllAccount">
                            <multi-img name="account-type__USD" directory="common"></multi-img>
                            <span>{{ $t('fundAccountMap.USD') }}</span>
                        </template>
                        <template v-else>
                            <span>{{ $t('myHoldings') }}({{ curHoldingList.length }})</span>
                        </template>
                    </h3>
                    <holding-table
                        ref="usdTableRef"
                        key="USD"
                        :assetStatus="assetStatus"
                        :list="usdHoldingList"
                        @sort="(k, s) => onSort(k, s, 'usd')"
                        @row-click="onRowClick"
                    ></holding-table>
                </div>
            </template>
        </template>
        <!-- 更多页面（了解现金宝、认购记录） -->
        <ul class="list" @click="onListClick">
            <li class="list-item mask" data-key="about">
                <span class="list-item__text">{{ $t('whatIsStarTreasureAccount') }}</span>
                <multi-img name="icon_right_arrow_16" directory="common"></multi-img>
            </li>
            <li class="list-item mask" data-key="records">
                <span class="list-item__text">{{ $t('viewOrders') }}</span>
                <multi-img name="icon_right_arrow_16" directory="common"></multi-img>
            </li>
        </ul>
        <!-- 风险提示 -->
        <section class="risk-tip">
            <p class="risk-tip-title">{{ $t('riskWarning') }}</p>
            <p class="text">
                {{ $t('riskWarningText1') }}
            </p>
            <p class="text">
                {{ $t('riskWarningText2') }}
            </p>
            <p class="text">
                {{ $t('riskWarningText3') }}
            </p>
        </section>
        <!-- 快捷引导 -->
        <div class="guide">
            <div class="left" @click="goProductList">{{ $t('productList') }}</div>
            <div class="right" @click="goOnlineService" v-if="isInThsApp">{{ $t('onlineService') }}</div>
            <div class="right" @click="goWealthCounselor" v-else>{{ $t('dedicatedAdvisors') }}</div>
        </div>
        <!-- 账户选择组件 -->
        <account-choose :type="accountType" v-model="chooseFlag" @choose="chooseHandler"></account-choose>
    </div>
</template>

<script>
import AssetTotal from '@/components/AssetTotal.vue'
import { accountMap, WEALTH_AMOUNT_STATUS_kEY } from '@/config/common'
import AccountChoose from '@/components/AccountChoose.vue'
import HoldingTable from '../components/HoldingTable.vue'
import pathnames from '@/config/H5Pathname'
import NP from 'number-precision'
import { ORDER_STATUS_MAP, PRODUCT_SUBSCRIBE_STATUS_MAP } from '@/views/xcbAccount/config/common'
import { ssaAssetsSummary, ssaOrderStatistics, ssaProductList, ssaUserHoldings } from '@/apis/xjb'
import { customerService, getPageVisibleSupportProperty, getValueFromLocalStorage, isEmpty, isTHSApp, floatToRatio, milliFormat } from '@/utils'
import DynamicFont from '@/components/FosunDynamicFont.vue'
export default {
    name: 'assets',
    components: { AssetTotal, AccountChoose, HoldingTable, DynamicFont },
    data() {
        return {
            chooseFlag: false,
            accountType: 'ALL',
            currencyFinal: 'ALL',
            holdingList: [],
            basicHoldingList: [], // 用来作为排序的基础数据
            hkdHoldingList: [],
            usdHoldingList: [],
            assetStatus: true,
            hasProduct: undefined, // 请求完成会变成Boolean
            hasSubscringProduct: undefined, // 请求完成会变成Boolean
            assetsSummaryMap: {
                allAccount: {},
                hkdAccount: {},
                usdAccount: {},
            }, // 资产总览
            repaymentList: [],
            sortCache: {
                hkd: {},
                usd: {},
            },
        }
    },
    computed: {
        curAccount() {
            return accountMap.keyValueMap[this.accountType] || ''
        },
        totalAssetsFinal() {
            const key = `${this.accountType?.toLowerCase()}Account`
            return this.assetsSummaryMap[key]?.[this.currencyFinal.toLowerCase()]?.totalAssets
        },
        // 今日利息
        todayInterestFinal() {
            const key = `${this.accountType?.toLowerCase()}Account`
            return this.assetsSummaryMap[key]?.[this.currencyFinal.toLowerCase()]?.todayInterest || 0
        },
        // 累计利息
        accumInterestFinal() {
            const key = `${this.accountType?.toLowerCase()}Account`
            return this.assetsSummaryMap[key]?.[this.currencyFinal.toLowerCase()]?.accumInterest || 0
        },
        // 到期利息
        dueInterestFinal() {
            const key = `${this.accountType?.toLowerCase()}Account`
            return this.assetsSummaryMap[key]?.[this.currencyFinal.toLowerCase()]?.actualInterest || 0
        },
        showExpireRemindBox() {
            return !!this.repaymentLength
        },
        disableChange() {
            return this.accountType !== accountMap.keysMap.ALL
        },
        curHoldingList() {
            const { keysMap } = accountMap
            return this.accountType === keysMap.HKD ? this.hkdHoldingList : this.accountType === keysMap.USD ? this.usdHoldingList : []
        },
        // 是否展示“查看服务|立即认购”按钮
        showSubscribeBtn() {
            return typeof this.hasProduct === 'boolean' && this.hasProduct
        },
        // 回款订单映射对象
        repaymentLengthMap() {
            return this.repaymentList.reduce(
                (o, c) => {
                    if (c.currency === accountMap.keysMap.HKD) {
                        o.HKD += 1
                    }
                    if (c.currency === accountMap.keysMap.USD) {
                        o.USD += 1
                    }
                    return o
                },
                {
                    ALL: this.repaymentList.length,
                    HKD: 0,
                    USD: 0,
                }
            )
        },
        // 到期回款的订单数量 - 会根据账户来判断
        repaymentLength() {
            return this.repaymentLengthMap[this.accountType]
        },
        isAllAccount() {
            return this.accountType === accountMap.keysMap.ALL
        },
        isInThsApp() {
            return isTHSApp() || this.$thsI18NJsBridge.isTHSI18NApp()
        },
    },
    created() {
        this.init()
        this.registerAppWealthCounselorButton()
    },
    filters: {
        amountFilter(v, sign = false) {
            v = v || 0
            let ret = floatToRatio(v, { rate: false, base: 2, sign: sign })
            ret = milliFormat(ret)
            return ret
        },
    },
    methods: {
        async init() {
            try {
                this.setQueryToData()
                if (this.$jsBridge) {
                    const data = await this.$jsBridge.getAssetsShowStatus()
                    this.assetStatus = data
                } else {
                    this.assetStatus = getValueFromLocalStorage(WEALTH_AMOUNT_STATUS_kEY, true, true)
                }
                this.initData()
            } catch (error) {
                console.error(`Feng.chen:: 19:17:34 error ===> `, error)
            }
        },
        async initData(needLoading = true) {
            try {
                if (needLoading) {
                    this.$loading.show = {
                        show: true,
                        options: {
                            mask: true,
                        },
                    }
                }
                await Promise.all([this.fetchAssetsSummary(), this.fetchProductList(), this.fetchSubscribeRecords(), this.fetchHoldingList()])
            } finally {
                this.$loading.show = false
            }
        },
        /**
         * 将query参数初始化到data数据中
         */
        setQueryToData() {
            const { accountType = 'ALL', currency = 'HKD' } = this.$route.query
            this.accountType = accountType
            this.setCurrency(this.accountType)
            if (currency) {
                this.currencyFinal = currency
            }
        },
        currencyChooseHandler(currency) {
            this.currencyFinal = currency
        },
        /**
         * 资产展示设置
         */
        toggleAssets(v) {
            this.assetStatus = v
        },
        /**
         * 跳转认购记录页
         */
        goOrderList() {
            this.$goPage('/order-list', {
                status: ORDER_STATUS_MAP.keysMap.receivedMoney,
            })
        },
        /**
         * 跳转到产品列表页
         */
        goProductList() {
            this.$goPage('/list')
            this.isFromProductListPage = true
            this.registerWatchHandler()
        },
        // 跳转帮助中心
        goHelpCenter() {
            const href = 'https://h5.fotechwealth.com/faq/#/article/490702228690304000/1'
            this.$goPage(href)
        },
        // 今日利息(费后) 弹窗
        todayInterestTips() {
            this.$dialog.confirm({
                closeOnClickOverlay: true,
                title: this.$t('tipTitle'),
                message: this.$t('todayInterestTips'),
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
                messageAlign: 'left',
            })
        },
        /**
         * 选择账户
         * @param {String} type 账户类型
         */
        chooseHandler(type) {
            this.accountType = type
            this.chooseFlag = false
            this.setCurrency(type)
        },
        /**
         * 设置货币类型
         * @param {String} type 账户类型
         */
        setCurrency(type) {
            //选择账户默认对应账户相关的币种
            this.currencyFinal = type === 'ALL' ? 'HKD' : type
        },
        /**
         * 获取持仓列表
         */
        async fetchHoldingList() {
            try {
                const params = { account: this.accountType }
                let list = []
                const { result } = await ssaUserHoldings(params)
                list = result?.list || []
                const test = false

                if (test) {
                    list = [
                        {
                            orderStatus: 501,
                            productCode: '212154',
                            productName: '测试产品01',
                            marketValue: '100000000',
                            maturityTime: '2020/11/23',
                            actualInterest: '1234567',
                            orderNumber: 555222,
                            currency: 'HKD',
                        },
                        {
                            orderStatus: 300,
                            productCode: '21215433',
                            productName: '测试产品01',
                            marketValue: '1222888888888888',
                            maturityTime: '2020/11/23',
                            actualInterest: '123457',
                            orderNumber: 5552221,
                            currency: 'USD',
                        },
                        {
                            orderStatus: 700,
                            productCode: '2121545533',
                            productName: '测试产品01',
                            marketValue: '1222888888888888',
                            maturityTime: '2020/11/23',
                            actualInterest: '123458',
                            orderNumber: 5552221,
                            currency: 'USD',
                        },
                        {
                            orderStatus: 500,
                            productCode: '21215433',
                            productName: '测试产品02',
                            marketValue: '1222888888888888',
                            maturityTime: '2020/11/23',
                            actualInterest: '123459',
                            orderNumber: 5552222,
                            currency: 'HKD',
                        },
                        {
                            orderStatus: 200,
                            productCode: '2121543366',
                            productName: '测试产品0222',
                            marketValue: '1222888888888888',
                            maturityTime: '2020/11/23',
                            actualInterest: '',
                            orderNumber: 5552222,
                            currency: 'HKD',
                        },
                        {
                            orderStatus: 200,
                            productCode: '2121543399',
                            productName: '测试产品03333',
                            marketValue: '3',
                            maturityTime: '2020/11/23',
                            actualInterest: '',
                            orderNumber: 5552222,
                            currency: 'HKD',
                        },
                        {
                            orderStatus: 600,
                            productCode: '2121543388',
                            productName: '测试产品044',
                            marketValue: '3',
                            maturityTime: '2020/11/23',
                            actualInterest: '0',
                            orderNumber: 5552333,
                            currency: 'HKD',
                        },
                    ]
                }
                let hkdIdx = 0
                let usdIdx = 0
                this.hkdHoldingList = list.filter(i => {
                    const res = i.currency === 'HKD'
                    if (res) {
                        i.initIndex = hkdIdx++
                    }
                    return res
                })
                this.usdHoldingList = list.filter(i => {
                    const res = i.currency === 'USD'
                    if (res) {
                        i.initIndex = usdIdx++
                    }
                    return res
                })
                this.holdingList = list
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * 常见问题
         */
        onRemind() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            // H5 生成器 中台Key
            const H5_KEY = 'FTDQA'
            const url = `${VUE_APP_BUILDER_PAGE}?key=${H5_KEY}`
            this.$goPage(url)
        },
        /**
         * 排序算法
         * @param {String} key  需要排序的字段
         * @param {String} sort  排序方式
         * @param {String} type  需要排序的持仓组合
         */
        onSort(key, sort, type) {
            let list = []
            switch (type) {
                case 'hkd':
                    list = this.hkdHoldingList
                    break
                case 'usd':
                    list = this.usdHoldingList
                    break
                default:
                    list = this.curHoldingList
            }
            // 记录排序数据
            this.sortCache[type || 'default'] = { key, sort, type }
            list.sort((a, b) => {
                if (sort === 'asc') {
                    return this.sortByAsc(a, b, key)
                }
                if (sort === 'desc') {
                    return this.sortByDesc(a, b, key)
                }
                // 默认排序的情况，暂时不存在了~
                // return a.initIndex - b.initIndex
            })
        },
        /**
         * 升序算法
         */
        sortByAsc(a, b, key) {
            const aV = a[key]
            const bV = b[key]
            // 如果按照升序排列，需要将数据值为''的 放到最后列.
            // 如果两个都为''的情况下,会按照initIndex来排序
            if (!(aV || bV)) return a.initIndex - b.initIndex
            if (!aV) return 1
            if (!bV) return 1
            // 如果两个数值相同的情况下，会按照原始排序来放置
            const ret = NP.minus(aV, bV)
            if (ret === 0) return a.initIndex - b.initIndex
            return ret
        },
        /**
         * 降序算法
         */
        sortByDesc(a, b, key) {
            const aV = a[key]
            const bV = b[key]
            // 如果按照升序排列，需要将数据值为''的 放到最后列.
            // 如果两个都为''的情况下,会按照initIndex来反排序
            if (!(aV || bV)) {
                const index = b.initIndex - a.initIndex
                if (index > 0) return -1
                if (index < 0) return 1
            }
            if (!aV) return 1
            if (!bV) return -1
            // 如果两个数值相同的情况下，会按照原始排序相反方向来放置
            const ret = NP.minus(bV, aV)
            if (ret === 0) {
                const index = b.initIndex - a.initIndex
                if (index > 0) return -1
                if (index < 0) return 1
            }
            return ret
        },
        /**
         * 获取产品列表（用来判断是否有产品展示在前端）
         */
        async fetchProductList() {
            try {
                const { result } = await ssaProductList({
                    subscriptionStatus: '2,3',
                })
                const list = result?.list || []
                this.hasProduct = !!list.length
                // 是否有认购中的产品
                this.hasSubscringProduct = list.some(i => [PRODUCT_SUBSCRIBE_STATUS_MAP.SUBSCRIBING].includes(i.subscriptionStatus))
            } catch (e) {
                console.error(e)
                this.hasProduct = false
                this.hasSubscringProduct = false
            }
        },
        /**
         * 获取到期回款的订单数量 - 只包含当天的订单
         */
        async fetchSubscribeRecords() {
            try {
                const { result } = await ssaOrderStatistics()
                this.repaymentList = result?.todaySettledOrders || []
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * 常见问题+认购记录点击监听
         */
        onListClick(e) {
            const { key } = e.target.dataset
            if (!key) return
            switch (key) {
                case 'about':
                    this.$goPage('/about')
                    break
                case 'records':
                    this.$goPage('/order-list')
                    break
                default:
                    break
            }
        },

        async fetchAssetsSummary() {
            try {
                const { result } = await ssaAssetsSummary()
                this.assetsSummaryMap = result || {}
            } catch (e) {
                console.error('fetchAssetsSummary ===> ', e)
            }
        },

        onRowClick({ item } = {}) {
            this.$goPage('/holding-detail', {
                orderNumber: item.orderNumber,
            })
        },
        /**
         * 注册页面监听事件
         */
        registerWatchHandler() {
            if (this.registerWatchHandler.watch) return
            if (this.$jsBridge && this.$jsBridge.watchPageVisible) {
                this.$jsBridge.watchPageVisible(this.handlePageVisible)
            } else {
                this.propertyData = getPageVisibleSupportProperty()
                // 买入，卖出，开通星财宝返回时，刷新页面
                document.addEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
                this.$once('hook:beforeDestroy', () => {
                    document.removeEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
                })
            }
            this.registerWatchHandler.watch = true
        },

        handlePageShow() {
            !document[this.propertyData?.hidden] && this.handlePageVisible()
        },

        async handlePageVisible() {
            if (!this.isFromProductListPage) return
            await this.initData(false)
            // 按照原来的排序方式来触发一次
            Object.entries(this.sortCache).forEach(([key, value]) => {
                if (!isEmpty(value)) {
                    const ref = this.$refs[`${key}TableRef`]
                    if (ref) {
                        ref?.setSort(value.key, value.sort)
                        this.onSort(value.key, value.sort, value.type)
                    }
                }
            })
            this.isFromProductListPage = false
        },

        /**
         * 注册专属理财顾问（右上角）仅HL APP内部
         */
        registerAppWealthCounselorButton() {
            this.$jsBridge?.setButton('right1', { customIcon: require('@/assets/images/xcbAccount/vipConsouner.png') }, () => {
                this.goWealthCounselor()
            })
            this.$jsBridge?.setButton('right2', { customIcon: require('@/assets/images/common/icon_navi_tips@3x.png') }, () => {
                this.goHelpCenter()
            })
        },

        goWealthCounselor() {
            const { VUE_APP_WEALTH_COUNSELOR_PAGE } = pathnames
            this.$goPage(VUE_APP_WEALTH_COUNSELOR_PAGE)
        },
        /**
         * 跳转在线客服
         */
        goOnlineService() {
            let link = customerService({
                url: true,
            })
            if (this.$jsBridge) {
                this.$jsBridge
                    .getUserinfo()
                    .then(data => {
                        const subAcctId = (((data?.clientInfo || {}).accts || [])[0] || {}).subAcctId || ''
                        const hlid = data?.clientInfo?.hlId || ''
                        link = customerService({
                            url: true,
                            userid: subAcctId,
                            hlid: hlid,
                        })
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
                    .catch(() => {
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
            } else if (this.$mylinkJsbridge.isInMylink()) {
                this.$mylinkJsbridge.openH5InWebview(link)
            } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                this.$goPage(link)
            } else {
                window.open(link)
            }
        },
    },
}
</script>

<style scoped lang="less">
.assets {
    padding: 0 12px;
    background: #f9f9f9;

    .card {
        margin: 12px 0;
        background: @bg-color;
        border-radius: 8px;

        .box-content {
            position: relative;
            z-index: 1000;
            background: @white;
            border-radius: 8px;
            box-shadow: inset -0.5px 0.5px 0 #ffe9dd;
            backdrop-filter: blur(27.1828px);

            .bg {
                position: absolute;
                top: 0;
                right: 0;
                z-index: 1;

                .bg-img {
                    width: 94px;
                    height: 94px;
                }
            }

            .account {
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                width: 100%;
                padding: 16px 12px 0;
                line-height: 21px;
                background: @white;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;

                span {
                    margin: 0 6px;
                    color: @fontBlackColor;
                    font-weight: 500;
                    font-size: 15px;
                    line-height: 21px;
                }

                .logo {
                    width: 16px;
                    height: 16px;
                }

                .select {
                    width: 6px;
                    height: 6px;
                }
            }

            .virtual-dom {
                height: 0.001px; // 修复兼容性问题，在苹果13的手机上不写height的话，会导致margin合并
                overflow: hidden;
            }

            .asset-summary {
                .total {
                    ::v-deep(h3) {
                        margin-top: 8px;

                        span {
                            font-weight: 700;
                            font-size: 32px;
                            line-height: 1.4;
                        }
                    }

                    & + .virtual-dom {
                        height: 32px;
                    }
                }
            }

            .expire-remind-box {
                display: flex;
                align-items: center;
                width: 256px;
                margin: -8px auto 20px;
                padding: 8px 12px;
                background: linear-gradient(90deg, rgba(255, 99, 7, 0.05) 1.15%, rgba(255, 99, 7, 0.02) 101.25%);
                border-radius: 4px;

                .circle {
                    width: 4px;
                    height: 4px;
                    background: @theme;
                    border-radius: 50%;
                    opacity: 0.5;
                }

                .text {
                    flex: 1 1 auto;
                    margin-left: 6px;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 22px;

                    &-tip {
                        color: @fontLightColor;

                        ::v-deep(.text-name) {
                            color: @fontBlackColor;
                            font-weight: 700;
                        }
                    }
                }

                .more {
                    width: 16px;
                    height: 16px;
                }
            }

            .rate-info {
                display: flex;
                height: 42px;
                margin: 4px 12px 24px;

                .rate-info-item {
                    width: calc((100vw - 48px - 16px) / 3);

                    + .rate-info-item {
                        margin-left: 8px;
                    }

                    .info {
                        width: 12px;
                        height: 12px;
                        margin-left: 4px;
                    }

                    .title {
                        color: @h3-white;
                        font-size: 12px;
                        line-height: 16px;
                        letter-spacing: 0;
                        text-align: left;
                    }

                    .value {
                        margin-top: 4px;
                        color: @h1-white;
                        font-weight: bold;
                        font-size: 16px;
                        line-height: 22px;
                        text-align: left;
                    }

                    .h2 {
                        color: @h2-white;
                    }

                    .text-center {
                        text-align: center;
                    }

                    .text-right {
                        text-align: right;
                    }
                }
            }

            .subscribe {
                display: block;
                width: calc(100% - 40px);
                height: 44px;
                margin: 8px auto 24px;
                color: @theme;
                font-weight: 700;
                font-size: 16px;
                line-height: 36px;
                background: #ff69071a;
                border-radius: 22px;
                cursor: pointer;
            }
        }
    }

    .holding-list {
        overflow: hidden;

        .title {
            display: flex;
            align-items: center;
            padding: 16px 12px 8px;

            img {
                width: 16px;
                height: 16px;
                margin-right: 6px;
            }

            span {
                color: @fontBlackColor;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px; /* 137.5% */
            }
        }
    }

    .list {
        overflow: hidden;
        background: @bg-color;
        border-radius: 8px;

        &-item {
            display: flex;
            justify-content: space-between;
            margin: 0 16px;
            padding: 16px 0;

            &:not(:last-child) {
                box-shadow: 0 -0.5px 0 0 #efefef inset, 16px 0 0 0 #fff inset, -16px 0 0 0 #fff inset;
            }

            &__text {
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }

            img {
                width: 16px;
                height: 16px;
            }
        }
    }
    // 距离屏幕间距远4px
    .risk-tip {
        margin-top: 24px;
        padding: 0 4px;

        p {
            color: @fontGreyColor;
            font-size: 12px;
            line-height: 18px;

            &.risk-tip-title {
                font-weight: 700;
                line-height: 16px;
            }

            &.text {
                margin: 8px 0 18px;

                &:first-child {
                    margin: 0;
                }
            }
        }
    }

    .guide {
        display: flex;
        justify-content: center;
        padding: 32px 0;

        div {
            padding: 0 16px;
            color: @theme;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        .left {
            position: relative;

            &::after {
                position: absolute;
                top: 50%;
                right: 0;
                width: 1px;
                height: 13px;
                background: #e0dfdf;
                transform: translateY(-50%) scaleX(0.5);
                content: '';
            }
        }
    }
}
</style>
