<!--
 * @Description: 投资组合订单记录页
-->
<template>
    <div class="record-page">
        <section class="record-operation">
            <div class="record-operation__time" @click="openDatePopup">
                <span>{{ dateName }}</span>
                <multi-img class="trigger" name="icon_selection_arrow" directory="common" alt="select"></multi-img>
            </div>
            <div class="record-operation__condition" @click="conditionPopup = true">
                <span>{{ $t('trade.shaixuan') }}</span>
                <img class="icon_condition" src="@/assets/images/cashBox/icon_optional_shaixuan.png" alt="" />
            </div>
        </section>
        <div v-if="recordListMap[pageType] && recordListMap[pageType].length">
            <div class="record-content border-top-1px">
                <follow-order-list ref="followListRef" :list="recordListMap[pageType]" @refresh="onRefresh" @loader="onLoader" />
            </div>
        </div>
        <div class="empty" v-else>
            <multi-img name="noRecord" directory="common" />
            <div class="text">{{ $t('fundList.noRecord') }}</div>
        </div>
        <!-- 时间筛选 -->
        <van-popup class="list-popup" v-model="datePopup" closeable :close-icon="closeIcon" close-icon-position="top-left" round position="bottom">
            <div class="popup-title">{{ $t('trade.riqishaixuan') }}</div>
            <div class="date-select">
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
            <div class="date-range">
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
            <div class="popup-title">{{ $t('trade.shaixuan') }}</div>
            <div class="sure" @click="sureSelect">{{ $t('trade.queding') }}</div>
            <div class="condition-title">{{ $t('trade.leixing') }}</div>
            <div class="condition-select">
                <span
                    class="select-item"
                    v-for="(item, index) in typeArr"
                    :key="index"
                    :class="{ select: item.value === orderDirection }"
                    @click="selectDirection(item)"
                >
                    {{ item.label }}
                </span>
            </div>
            <div class="condition-title">{{ $t('trade.zhuangtai') }}</div>
            <div class="condition-select">
                <span
                    class="select-item"
                    v-for="(item, index) in statusArr"
                    :key="index"
                    :class="{ select: orderStatus.includes(item.value) }"
                    @click="selectOrderStatus(item)"
                >
                    {{ item.label }}
                </span>
            </div>
        </van-popup>
    </div>
</template>

<script>
import followOrderList from './components/followOrderList.vue'
import { getPortfolioOrders } from '@/apis/followInvest/index.js'
import { getNearWeek, getNearMonth, getNearThreeMonth } from '@/utils/utils.js'
import { FOLLOW_TRADE_STATUS_MAP } from '@/views/fund/config/common'
import dayjs from 'dayjs'

const tradeStatusMap = FOLLOW_TRADE_STATUS_MAP.keysMap
const dateFormat = date => dayjs(date).format('YYYY/MM/DD')

const filterUnit = {
    start: 0,
    count: 50,
}

export default {
    components: {
        followOrderList,
    },
    props: {
        pageType: {
            // 页面类型： 港股： 1，美股： 2，基金： 3
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            recordListMap: {
                0: [],
                1: [],
                2: [],
                3: [],
                4: [],
            },
            // 每个的开始数量
            startMap: {
                0: filterUnit.start,
                1: filterUnit.start,
                2: filterUnit.start,
                3: filterUnit.start,
                4: filterUnit.start,
            },
            unitCount: filterUnit.count, // 单位查询数量
            // stockNameMap: {
            //     0: this.$t('quanbu'),
            //     1: this.$t('stocksHKD'),
            //     2: this.$t('stocksUSD'),
            //     3: this.$t('follow.fundName'),
            //     4: this.$t('mixed'),
            // },
            // textColorMap: {
            //     1: '#7933D9',
            //     2: '#0569FF',
            //     3: '#FE8900',
            // },
            // textBgColor: {
            //     1: '#F3EBFF',
            //     2: '#EAF2FF',
            //     3: 'rgba(254, 137, 0, 0.12)',
            // },
            isShowAll: false,

            conditionPopup: false,
            selectValue: '',
            datePopup: false,
            dateArr: [
                { label: this.$t('quanbu'), value: '' },
                { label: this.$t('jinri'), value: 1 },
                { label: this.$t('jinyizhou'), value: 2 },
                { label: this.$t('jinyiyue'), value: 3 },
                { label: this.$t('jinsanyue'), value: 4 },
            ],
            minDate: new Date(2022, 0, 1),
            maxDate: new Date(),
            currentDate: '',
            rangeStart: '',
            rangeEnd: '',
            rangeStartSelect: '',
            rangeEndSelect: '',
            selectType: 'rangeStart',
            dateName: this.$t('quanburiqi'),
            closeIcon: require('@/assets/images/common/closePopup.png'),
            orderDirection: 0,
            typeArr: [
                { label: this.$t('quanbu'), value: 0 },
                { label: this.$t('subscribe'), value: 1 },
            ],
            orderStatus: [0], // 状态 默认 全部： 0
            stockStatusArr: [
                { label: this.$t('quanbu'), value: 0 },
                { label: this.$t('trade.weiwancheng'), value: tradeStatusMap.wait },
                { label: this.$t('trade.yiwancheng'), value: tradeStatusMap.success },
                { label: this.$t('follow.cancelFail'), value: tradeStatusMap.cancel }, // 股票撤单/失败 30，90都需要传，点击选项处理逻辑
            ],
            fundStatusArr: [
                { label: this.$t('quanbu'), value: 0 },
                { label: this.$t('trade.weiwancheng'), value: tradeStatusMap.wait },
                { label: this.$t('trade.yiwancheng'), value: tradeStatusMap.success },
                { label: this.$t('follow.cancelEnding'), value: tradeStatusMap.cancel }, // 基金撤单/终止30，90都需要传，点击选项处理逻辑
            ],
        }
    },
    computed: {
        isFund() {
            return this.pageType === 3
        },
        statusArr() {
            return this.isFund ? this.fundStatusArr : this.stockStatusArr
        },
    },
    created() {
        this.initDate()
        this.getPortfolioOrders()
    },
    methods: {
        initDate() {
            this.rangeStart = dateFormat(this.minDate)
            this.rangeEnd = dateFormat(this.maxDate)
            this.currentDate = new Date(this.rangeStart)
            this.rangeStartSelect = this.rangeStart
            this.rangeEndSelect = this.rangeEnd
        },
        async finish() {
            this.rangeStartSelect = this.rangeStart
            this.rangeEndSelect = this.rangeEnd
            if (this.selectValue === null) {
                this.dateName = this.$t('customDate')
            } else if (this.selectValue == '') {
                this.dateName = this.$t('quanburiqi')
            } else {
                this.dateName = this.selectItem.label
            }
            this.datePopup = false
            this.$loading.show = true
            await this.getPortfolioOrders()
            this.$loading.show = false
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

        //选择方向
        selectDirection(item) {
            this.orderDirection = item.value
        },
        //选择状态
        selectOrderStatus(item) {
            // 选择状态，失败/撤单(终止)需存[30, 90]
            this.orderStatus = item.value === tradeStatusMap.cancel ? [tradeStatusMap.cancel, tradeStatusMap.error] : [item.value]
        },
        //确认筛选
        async sureSelect() {
            this.conditionPopup = false
            this.$loading.show = true
            await this.getPortfolioOrders()
            this.$loading.show = false
        },
        // 刷新
        async onRefresh(callBack) {
            await this.getPortfolioOrders()
            callBack && callBack()
        },
        async onLoader(callBack) {
            await this.getPortfolioOrders(false)
            callBack && callBack()
        },
        // 获取跟投订单
        async getPortfolioOrders(isRefresh = true) {
            if (isRefresh) {
                // 重置
                this.startMap[this.pageType] = filterUnit.start
                this.unitCount = filterUnit.count
            }

            try {
                const params = {
                    type: Number(this.pageType),
                    submitTimeBegin: new Date(this.rangeStartSelect).valueOf(),
                    submitTimeEnd: new Date(this.rangeEndSelect).valueOf(),
                    start: this.startMap[this.pageType],
                    count: this.unitCount,
                }
                // 订单状态全部，不传tradeStatus
                const tradeStatus = this.orderStatus.filter(item => !!item).join(',')
                if (tradeStatus) {
                    params.tradeStatus = tradeStatus
                }
                console.log('getPortfolioOrders-params:', params)
                const { result } = await getPortfolioOrders(params)
                if (result) {
                    const resultList = result.records
                    if (isRefresh) {
                        this.recordListMap[this.pageType] = []
                    }
                    this.recordListMap[this.pageType] = this.recordListMap[this.pageType].concat(resultList)
                    this.startMap[this.pageType] = this.recordListMap[this.pageType].length
                    if (resultList.length < this.unitCount) {
                        this.$refs.followListRef?.closePullUploading()
                    }
                }
            } catch (e) {
                console.log('getPortfolioOrders===>e:', e)
                // 报错清空列表
                this.recordListMap[this.pageType] = []
            }
        },
    },
}
</script>

<style lang="less" scoped>
@searchHeight: 44px;
@tabHeight: 36px;
@opreationHeight: 28px;
@bottomGap: 16px;

.record-page {
    background: #fff;

    .top-tap {
        position: fixed;
        top: 0;
        z-index: 10;
        background: #fff;
    }

    .record-operation {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: 28px;
        padding: 4px 12px;
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        background-color: #fff;

        .trigger {
            width: 12px;
            height: 12px;
            margin-left: 2px;
        }

        .icon_condition {
            width: 12px;
            height: 12px;
            margin-left: 4px;
        }
    }

    .record-content {
        height: calc(100vh - @tabHeight - @opreationHeight - @bottomGap - @searchHeight);
        overflow-y: scroll;
    }

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 351px;
        height: 244px;
        margin: 0 auto;
        margin-top: 12px;
        background: #fff;
        border-radius: 8px;

        img {
            width: 103px;
            height: 103px;
            margin-bottom: 8px;
        }

        .text {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
        }
    }
}
</style>

<style lang="less" scoped>
.list-popup {
    padding-bottom: 8px;

    /deep/ .van-popup__close-icon--top-left {
        top: 11px;
    }
}

.popup-title {
    padding: 11px 0;
    color: #2f2f2f;
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
}

.date-select,
.condition-select {
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
            // border: 0.5px solid rgba(255, 99, 7, 0.6);
            box-sizing: border-box;
            color: #ff6907;
            /* stylelint-disable-next-line number-max-precision */
            background: rgba(255, 99, 7, 0.0698703);
            border-radius: 32px;
        }
    }
}

.date-range {
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
            color: #ff6907;
            background: #fff5ef;
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
        color: #ff6907;
    }
}

.sure {
    position: absolute;
    top: 0;
    right: 0;
    padding: 12px 16px;
    color: #ff6907;
    font-size: 14px;
    line-height: 20px;
}

.condition-title {
    margin-top: 20px;
    padding-left: 16px;
    font-size: 14px;
    line-height: 20px;
}

.condition-select {
    flex-wrap: wrap;
    margin: 8px 0 32px;

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
</style>
