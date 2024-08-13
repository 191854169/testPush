<template>
    <div class="tab-list">
        <div class="filter" v-show="!isFromCommonOutside">
            <div class="filter-left">
                <div class="time" @click="!lockChooseProduct && (chooseAsset = true)">
                    <span>{{ productType | assetFilter }}</span>
                    <multi-img v-if="!lockChooseProduct" class="trigger" name="icon_selection_arrow" directory="common" alt="select"></multi-img>
                </div>
                <div class="time" @click="chooseAccount = true">
                    <span>{{ account | accountFilter }}</span>
                    <multi-img class="trigger" name="icon_selection_arrow" directory="common" alt="select"></multi-img>
                </div>
                <div class="time" @click="openDatePopup">
                    <span>{{ dateName }}</span>
                    <multi-img class="trigger" name="icon_selection_arrow" directory="common" alt="select"></multi-img>
                </div>
            </div>
            <div class="condition" @click="conditionPopup = true">
                {{ $t('trade.shaixuan') }}
                <img class="icon_condition" src="@/assets/images/cashBox/icon_optional_shaixuan.png" alt="" />
            </div>
        </div>
        <!-- 时间筛选 -->
        <van-popup class="list-popup" v-model="datePopup" closeable :close-icon="closeIcon" close-icon-position="top-left" round position="bottom">
            <div class="popuptitle">{{ $t('trade.riqishaixuan') }}</div>
            <div class="dateSelect">
                <span
                    class="select-item"
                    v-for="(item, index) in dateArr"
                    :key="index"
                    :class="{ select: item.value === selectValue }"
                    @click="selectDate(item)"
                >
                    {{ item.label }}
                </span>
            </div>
            <div class="dateRange">
                <div class="range rangeStart" :class="{ active: selectType == 'rangeStart' }" @click="changeType('rangeStart')">{{ rangeStart }}</div>
                <div class="center">—</div>
                <div class="range rangeEnd" :class="{ active: selectType == 'rangeEnd' }" @click="changeType('rangeEnd')">{{ rangeEnd }}</div>
            </div>
            <van-datetime-picker
                v-model="currentDate"
                :show-toolbar="false"
                type="date"
                :title="$t('trade.xuanzenianyueri')"
                :min-date="minDate"
                :max-date="maxDate"
                :formatter="formatter"
                @change="changeDate"
            />

            <div class="bottom">
                <div class="reset" @click="reset">{{ $t('trade.chongzhi') }}</div>
                <div class="finish" @click="finish">{{ $t('trade.wancheng') }}</div>
            </div>
        </van-popup>
        <!-- 筛选条件 -->
        <van-popup
            class="list-popup"
            v-model="conditionPopup"
            closeable
            :close-icon="closeIcon"
            close-icon-position="top-left"
            round
            position="bottom"
        >
            <div class="popuptitle">{{ $t('trade.shaixuan') }}</div>
            <div class="sure" @click="sureSelect">{{ $t('trade.queren') }}</div>
            <div class="conditionTitle">{{ $t('trade.leixing') }}</div>
            <div class="conditionSelect">
                <span
                    class="select-item"
                    v-for="(item, index) in typeArr"
                    :key="index"
                    :class="{ select: item.value == orderDirection }"
                    @click="selectDirection(item)"
                >
                    {{ item.label }}
                </span>
            </div>
            <div class="conditionTitle">{{ $t('trade.zhuangtai') }}</div>
            <div class="conditionSelect">
                <span
                    class="select-item"
                    v-for="(item, index) in statusArr"
                    :key="index"
                    :class="{ select: item.value == orderValue }"
                    @click="selectOrderStatus(item)"
                >
                    {{ item.label }}
                </span>
            </div>
        </van-popup>
        <div class="table-content">
            <order-table
                ref="table"
                :list="list"
                @rowClick="rowClick"
                :loading="tableLoading"
                :loadingOver="loadingOver"
                :initLoading="initLoading"
                @loadMore="pullUpLoad"
            ></order-table>
        </div>
        <asset-types v-model="chooseAsset" :typeKey="productType" @on-change="onAssetTypeChange"></asset-types>
        <account-choose v-model="chooseAccount" :type="account" @choose="chooseAccountHandler"></account-choose>
    </div>
</template>
<script>
import { thousandsFilter } from '@/config/filters.js'
import OrderTable from './order-table.vue'
import AssetTypes from '@/components/AssetTypes.vue'
import AccountChoose from '@/components/AccountChoose'
import { getNearWeek, getNearMonth, getNearThreeMonth } from '@/utils/utils.js'
import { getQueryString } from '@/utils/tools.js'
import { orderList, orderDetail } from '@/apis/wealth/index.js'
import { ORDER_STATUS_MAP } from '@/views/fund/config/common'
import { accountMap, productTypeMap } from '@/config/common'
import { i18n } from '@/i18n/fund/index.js'
import dayjs from 'dayjs'
import { isInRyH5 } from '@/utils'

const dateFormat = date => dayjs(date).format('YYYY/MM/DD')

const accountKeyValueMap = accountMap.keyValueMap
const productTypeKeysMap = productTypeMap.keysMap
const assetMap = {
    all: i18n.t('allProduct'),
    9: i18n.t('cashBox'),
    1: i18n.t('publicFund'),
    2: i18n.t('privateFund'),
    3: i18n.t('bond'),
    4: i18n.t('alterInvestment'),
}
const TABS_KEY_MAP = {
    ALL: 0,
    DOING: 1,
}

export default {
    name: 'tabList',
    components: { OrderTable, AssetTypes, AccountChoose },
    filters: {
        accountFilter(v) {
            return accountKeyValueMap[v] || ''
        },
        assetFilter(v) {
            if (v) {
                return assetMap[v]
            }
            return assetMap.all
        },
    },
    props: {
        isDoing: {
            type: Boolean,
            default: false,
        },
        activeTab: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            initLoading: true,
            chooseAccount: false,
            chooseAsset: false,
            account: this.$route.query.accountType || 'ALL',
            productType: getQueryString('productType', true) || 'all',
            productTypes: this.$route.query.productTypes ? JSON.parse(decodeURIComponent(this.$route.query.productTypes)) : [],
            lockChooseProduct: getQueryString('lock', true) || '',
            tableLoading: false,
            loadingOver: false,
            list: [],
            status: {
                0: this.$t('trade.weitijiao'),
                1: this.$t('trade.daiqueren'),
                2: this.$t('trade.yichedan'),
                3: this.$t('trade.yishouli'),
                4: this.$t('trade.yishouli'),
                5: this.$t('trade.yiquerenfene'),
                6: this.$t('trade.yijujue'),
                7: this.$t('trade.yiwancheng'),
                8: this.$t('trade.xiadanshibai'),
            },
            datePopup: false,
            conditionPopup: false,
            dateArr: [
                { label: this.$t('quanbu'), value: '' },
                { label: this.$t('jinri'), value: 1 },
                { label: this.$t('jinyizhou'), value: 2 },
                { label: this.$t('jinyiyue'), value: 3 },
                { label: this.$t('jinsanyue'), value: 4 },
            ],
            typeArr: [],
            commonTypeList: [
                { label: this.$t('quanbu'), value: '' },
                { label: this.$t('subscribe'), value: 1 },
                { label: this.$t('redeem'), value: 2 },
            ],
            cashTypeList: [
                { label: this.$t('trade.autoRollIn'), value: 5 },
                { label: this.$t('trade.autoRollOut'), value: 6 },
            ],
            selectValue: '',
            orderDirection: 0,
            orderValue: 0,
            orderStatus: [], // // “进行中”订单的状态包含 U,O,D,P
            minDate: new Date(2022, 0, 1),
            maxDate: new Date(),
            currentDate: new Date(),
            rangeStart: new Date(),
            rangeEnd: new Date(),
            selectType: 'rangeStart',
            dateName: this.$t('quanburiqi'),
            start: 0,
            count: 20,
            closeIcon: require('@/assets/images/common/closePopup.png'),
            viewOrder: null, // 查看的订单
            propertyData: {},
        }
    },
    computed: {
        statusArr() {
            if (this.isDoing) {
                return [
                    { label: this.$t('quanbu'), value: 0 },
                    { label: this.$t('trade.creating'), value: -1 },
                    { label: this.$t('trade.daishouli'), value: 1 },
                    { label: this.$t('trade.yishouli'), value: 34 },
                    { label: this.$t('trade.yiquerenfene'), value: 5 },
                ]
            }
            return [
                { label: this.$t('quanbu'), value: 0 },
                { label: this.$t('trade.creating'), value: -1 },
                { label: this.$t('trade.daishouli'), value: 1 },
                { label: this.$t('trade.yichedan'), value: 2 },
                { label: this.$t('trade.yishouli'), value: 34 },
                { label: this.$t('trade.yiquerenfene'), value: 5 },
                { label: this.$t('trade.yijujue'), value: 6 },
                { label: this.$t('trade.yiwancheng'), value: 7 },
            ]
        },
        showCurrencyTab() {
            return this.isDoing ? this.activeTab === TABS_KEY_MAP.DOING : this.activeTab === TABS_KEY_MAP.ALL
        },
        isInRy() {
            return isInRyH5()
        },
        isFromCommonOutside() {
            // return this.$route.query.fromSource === 'commonOutside' || !!sessionStorage.getItem('outsideSource')
            return false
        },
    },
    watch: {
        isDoing: {
            handler(v) {
                this.orderStatus = v ? ORDER_STATUS_MAP.DOING_STATUS_LIST : []
            },
            immediate: true,
        },
        productType: {
            handler(v) {
                if ([productTypeKeysMap.cashBox, productTypeKeysMap.all].includes(v)) {
                    this.typeArr = [...this.commonTypeList, ...this.cashTypeList]
                } else {
                    this.typeArr = [...this.commonTypeList]
                    if ([3, 4].includes(this.orderDirection)) {
                        // 非星财宝产品选择 自动买入卖出 则切换到全部
                        this.orderDirection = 0
                    }
                }
            },
            immediate: true,
        },
    },
    created() {
        if (getQueryString('rangeStart', true) && getQueryString('rangeEnd', true)) {
            this.rangeStart = decodeURIComponent(getQueryString('rangeStart', true))
            this.rangeEnd = decodeURIComponent(getQueryString('rangeEnd', true))
            this.dateName = this.$t('customDate')
        } else {
            this.rangeStart = dateFormat(this.minDate)
            this.rangeEnd = dateFormat(this.maxDate)
        }
        this.currentDate = new Date(this.rangeStart)
        this.rangeStartSelect = this.rangeStart
        this.rangeEndSelect = this.rangeEnd
    },
    async mounted() {
        await this.$store.dispatch('user/getUserInfo')
        this.$nextTick(() => {
            this.loadingRefresh()
        })
        if (this.$jsBridge && this.$jsBridge.watchPageVisible) {
            this.$jsBridge.watchPageVisible(this.handlePageVisible)
        }
    },
    methods: {
        // myLink页面刷新事件
        handlePageShow() {
            !document[this.propertyData.hidden] && this.handlePageVisible()
        },
        // 页面返回刷新事件
        async handlePageVisible() {
            console.log('页面返回刷新')
            if (this.viewOrder) {
                const changeFlag = await this.checkOrderChange(this.viewOrder)
                console.warn('visible-change-order-flag：', changeFlag)
                if (changeFlag) {
                    // 如果当前有订单修改状态 则刷新当前列表
                    this.$emit('change-order', this.viewOrder)
                    this.showCurrencyTab && this.loadingRefresh()
                }
            }
        },
        async loadingRefresh() {
            this.$loading.show = true
            this.initLoading = true
            await this.refresh()
            this.$loading.show = false
            this.initLoading = false
        },
        //千分位显示
        setThousand(num) {
            if (num == '') {
                return '--'
            }
            return thousandsFilter(num)
        },
        async pullUpLoad() {
            await this.getData()
        },
        async refresh() {
            this.start = 0
            this.loadingOver = false
            await this.getData()
        },
        //获取基金订单记录
        async getData() {
            try {
                if (this.tableLoading) return
                this.tableLoading = true
                const productType = this.productType === 'all' ? undefined : +this.productType

                let productTypes = [...this.productTypes]

                if (productType) {
                    productTypes = [productType]
                }

                const params = {
                    start: this.start,
                    count: this.count,
                    fromDate: this.rangeStartSelect.replace(new RegExp('/', 'g'), '-'),
                    toDate: this.rangeEndSelect.replace(new RegExp('/', 'g'), '-'),
                    orderDirection: this.orderDirection == 0 ? [] : [this.orderDirection],
                    orderStatus: this.orderStatus,
                    productTypes,
                    account: this.account,
                }
                console.log('order list params:', params)
                const res = await orderList(params)
                const list = res?.result?.list || []
                if (this.start == 0) {
                    this.resetList()
                }
                this.list = this.list.concat(list)
                this.start = this.list.length
                if (list.length < this.count) {
                    this.loadingOver = true
                }
            } catch (e) {
                console.log('error:orderList===>:', e)
                this.loadingOver = true
            } finally {
                this.tableLoading = false
            }
        },
        // 重置表格及位置
        resetList() {
            this.list = []
            if (this.$refs.table) {
                this.$refs.table.$el.scrollTo({ top: 0 })
            }
        },
        reset() {
            this.selectValue = ''
            this.rangeStart = dateFormat(this.minDate)
            this.rangeEnd = dateFormat(this.maxDate)
            if (this.selectType == 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (this.selectType == 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
        },
        finish() {
            this.rangeStartSelect = this.rangeStart
            this.rangeEndSelect = this.rangeEnd
            if (this.selectValue === null) {
                this.dateName = this.$t('customDate')
            } else if (this.selectValue == '') {
                this.dateName = this.$t('quanburiqi')
            } else {
                this.dateName = this.selectItem.label
            }
            this.loadingRefresh()
            this.datePopup = false
        },
        onLoad() {},
        //列表行点击事情
        rowClick(row) {
            console.log(row.orderId)
            const id = row.orderId
            this.viewOrder = {
                orderId: row.orderId,
                orderNumber: row.orderNumber,
                orderStatus: row.orderStatus,
            }
            const query = {
                orderId: id,
                orderNumber: row.orderNumber,
            }
            this.$goPage('/order-detail', query)
        },
        openDatePopup() {
            this.datePopup = true
            this.rangeStart = this.rangeStartSelect
            this.rangeEnd = this.rangeEndSelect
            if (this.selectType == 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (this.selectType == 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
        },
        addO(date) {
            if (date < 10) {
                return '0' + date
            }
            return date
        },
        getDay(date) {
            return `${date.getFullYear()}/${this.addO(date.getMonth() + 1)}/${this.addO(date.getDate())}`
        },
        formatter(type, val) {
            if (type === 'year') {
                return val + this.$t('nian')
            }
            if (type === 'month') {
                return val + this.$t('yue')
            }
            if (type === 'day') {
                return val + this.$t('ri')
            }
            return val
        },
        changeType(type) {
            if (type == 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (type == 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
            this.selectType = type
        },
        changeDate() {
            if (this.selectType == 'rangeStart') {
                this.rangeStart = this.getDay(this.currentDate)
            } else if (this.selectType == 'rangeEnd') {
                this.rangeEnd = this.getDay(this.currentDate)
            }
            this.selectValue = null
        },
        selectDate(item) {
            this.selectValue = item.value
            this.selectItem = item
            if (this.selectValue == 0) {
                this.rangeStart = dateFormat(this.minDate)
                this.rangeEnd = dateFormat(this.maxDate)
            } else if (this.selectValue == 1) {
                this.rangeStart = this.rangeEnd = this.getDay(new Date())
            } else if (this.selectValue == 2) {
                this.rangeStart = getNearWeek().start
                this.rangeEnd = getNearWeek().end
            } else if (this.selectValue == 3) {
                this.rangeStart = getNearMonth().start
                this.rangeEnd = getNearMonth().end
            } else if (this.selectValue == 4) {
                this.rangeStart = getNearThreeMonth().start
                this.rangeEnd = getNearThreeMonth().end
            }
            if (this.selectType == 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (this.selectType == 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
        },
        //选择方向
        selectDirection(item) {
            this.orderDirection = item.value
        },
        //选择状态
        selectOrderStatus(item) {
            const orderValue = item.value
            let orderStatus = ''
            if (item.value === 0) {
                orderStatus = []
                // 进行中的订单列表全部需要传指定类型
                orderStatus = this.isDoing ? ORDER_STATUS_MAP.DOING_STATUS_LIST : []
            } else if (item.value === 34) {
                orderStatus = [3, 4]
            } else {
                orderStatus = [orderValue]
            }
            this.orderValue = orderValue
            this.orderStatus = orderStatus
        },
        //确认筛选
        sureSelect() {
            this.loadingRefresh()
            this.conditionPopup = false
        },
        chooseAccountHandler(row) {
            this.chooseAccount = false
            this.account = row
            this.start = 0
            this.loadingRefresh()
        },
        onAssetTypeChange(type) {
            this.chooseAsset = false
            this.productType = type
            this.start = 0
            this.loadingRefresh()
        },
        // 检查订单是否改动 return true: 状态改动 ， false： 状态未改动
        async checkOrderChange(row) {
            if (!row) return
            try {
                const { result = {} } = await orderDetail({
                    orderId: row.orderId,
                    orderNumber: row.orderNumber,
                })
                console.log(result)
                return result.orderStatus !== row.orderStatus
            } catch (e) {
                console.log('orderDetail===>e:', e)
                return false
            }
        },
    },
}
</script>
<style scoped lang="less">
@tabsHeight: 36px;
@filterHeight: 32px;
@marginTop: 8px;

.list-popup {
    /deep/ .van-popup__close-icon--top-left {
        top: 11px;
    }
}

.filter {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    color: #666;
    font-size: 14px;
    line-height: 20px;
    background-color: #fff;
    box-shadow: inset 0 -0.5px 0 #efefef;

    .filter-left {
        display: flex;

        div {
            display: flex;
            align-items: center;
            margin-right: 20px;

            .trigger {
                width: 12px;
                height: 12px;
                margin-left: 2px;
            }
        }

        div:last-of-type {
            margin-right: 0;
        }
    }

    .icon_time {
        width: 12px;
        height: 12px;
        margin-left: 5px;
    }

    .icon_condition {
        width: 12px;
        height: 12px;
        margin-left: 4px;
    }
}

.tab-list {
    display: flex;
    flex-direction: column;

    .table-content {
        height: calc(100vh - @filterHeight - @tabsHeight);
    }

    .popuptitle {
        padding: 11px 0;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
    }

    .dateSelect,
    .conditionSelect {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 20px 0;
        padding: 0 12px;

        .select-item {
            display: inline-block;
            box-sizing: border-box;
            width: 63px;
            height: 36px;
            margin: 0 4px;
            line-height: 36px;
            text-align: center;
            background: #f9f9f9;
            border-radius: 122px;

            &.select {
                box-sizing: border-box;
                color: @theme;
                /* stylelint-disable-next-line number-max-precision */
                background: @tabBackground;
                // border: 0.5px solid rgba(255, 99, 7, 0.6);
                border-radius: 32px;
            }
        }
    }

    .dateRange {
        display: flex;
        flex-direction: row;
        place-content: center center;
        margin-top: 10px;
        margin-bottom: 16px;

        .range {
            width: 153px;
            height: 40px;
            color: #9c9c9c;
            font-size: 18px;
            line-height: 40px;
            text-align: center;
            background: #f9f9f9;
            border-radius: 4px;

            &.active {
                color: @theme;
                background: @tabBackground;
            }
        }

        .center {
            height: 40px;
            margin: 0 12px;
            line-height: 40px;
        }
    }

    .bottom {
        display: flex;
        flex-direction: row;
        place-content: center space-between;
        margin-top: 20px;
        margin-bottom: 34px;
        box-shadow: inset 0 0.5px 0 #efefef;

        .reset,
        .finish {
            flex: 1;
            padding: 14px 0 13px;
            color: #1f1f1f;
            font-weight: 600;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
        }

        .finish {
            color: @theme;
        }
    }

    .sure {
        position: absolute;
        top: 0;
        right: 0;
        padding: 12px 16px;
        color: @theme;
        font-size: 14px;
        line-height: 20px;
    }

    .conditionTitle {
        margin-top: 20px;
        padding-left: 16px;
        font-size: 14px;
        line-height: 20px;
    }

    .conditionSelect {
        flex-wrap: wrap;
        margin-top: 8px;

        &::after {
            width: 106px;
            margin: 0 4px;
            content: '';
        }

        .select-item {
            width: 106px;
            margin-bottom: 12px;
            font-size: 14px;
        }
    }
}
</style>
