<!--
 * @Description: 投资组合订单记录页
-->
<template>
    <div class="record-page">
        <section class="record-operation">
            <div class="record-operation__time" @click="datePopup = true">
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
                <orderList ref="followListRef" :list="recordListMap[pageType]" @refresh="onRefresh" @loader="onLoader" />
            </div>
        </div>
        <div class="empty" v-else>
            <multi-img name="noRecord" directory="common" />
            <div class="text">{{ $t('fundList.noRecord') }}</div>
        </div>
        <!-- 时间筛选 -->
        <DatePopup
            v-model="datePopup"
            :limitDate="minDate"
            :minDate="minDate"
            :maxDate="maxDate"
            :types="['All', 'D1', 'W1', 'M1', 'M3']"
            @click="clickDateHandler"
        ></DatePopup>
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
                    :class="{ select: orderStatus === item.value }"
                    @click="selectOrderStatus(item)"
                >
                    {{ item.label }}
                </span>
            </div>
        </van-popup>
    </div>
</template>

<script>
import orderList from './orderContentList.vue'
import dayjs from 'dayjs'
import { orderRecords } from '@/apis/portfolioFollow'
import DatePopup from './datePopup.vue'

const dateFormat = date => dayjs(date).format('YYYY/MM/DD')

const filterUnit = {
    start: 0,
    count: 50,
}

export default {
    components: {
        orderList,
        DatePopup,
    },
    props: {
        pageType: {
            type: Number,
            default: 0,
        },
        currentPage: {
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
            isShowAll: false,
            conditionPopup: false,
            datePopup: false,
            minDate: new Date(2022, 0, 1),
            maxDate: new Date(),
            periodItem: {
                rangeStart: '',
                rangeEnd: '',
                dateType: 0,
            },
            dateName: this.$t('quanburiqi'),
            closeIcon: require('@/assets/images/common/closePopup.png'),
            orderDirection: 0,
            orderStatus: 0, // 状态 默认 全部： 0
            statusArr: [
                { label: this.$t('quanbu'), value: 0 },
                { label: this.$t('investAdvisory.unbuild'), value: 1 },
                { label: this.$t('investAdvisory.builded'), value: 2 },
                { label: this.$t('trade.weiwancheng'), value: 3 },
                { label: this.$t('trade.yiwancheng'), value: 4 },
                { label: this.$t('follow.cancelFail'), value: 5 },
            ],
            typeArr: [
                { label: this.$t('quanbu'), value: 0 },
                { label: this.$t('subscribe'), value: 1 },
                { label: this.$t('redeem'), value: 2 },
                { label: this.$t('investAdvisory.portfolioTransfer'), value: 3 },
            ],
        }
    },
    computed: {
        isFund() {
            return this.pageType === 3
        },
    },

    watch: {
        currentPage: {
            handler(v) {
                if (this.pageType === v) {
                    //this.getPortfolioOrders()
                }
            },
        },
    },
    created() {
        this.initDate()
        // if (this.pageType === 0) {
        //     this.getPortfolioOrders()
        // }
        this.getPortfolioOrders()
    },
    methods: {
        initDate() {
            this.periodItem.rangeStart = dateFormat(this.minDate)
            this.periodItem.rangeEnd = dateFormat(this.maxDate)
        },
        //日期选择
        clickDateHandler(item) {
            this.periodItem = { ...item }
            //重新请求数据
            if (this.periodItem.dateType === '') {
                this.dateName = this.$t('customDate')
            } else if (this.periodItem.dateType === 'All') {
                this.dateName = this.$t('quanburiqi')
            } else {
                this.dateName = this.periodItem.label
            }
            //this.datePopup = false
            this.$loading.show = true
            this.getPortfolioOrders()
            this.$loading.show = false
        },

        //选择方向
        selectDirection(item) {
            this.orderDirection = item.value
        },
        //选择状态
        selectOrderStatus(item) {
            // 选择状态，失败/撤单(终止)需存[30, 90]
            this.orderStatus = item.value
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
                const subAccountId = this.$store.getters['user/getSubAccountId']
                const applyAccountId = this.$route.query.tgAccID ?? ''
                const params = {
                    submitTimeBegin: this.periodItem.rangeStart.replace(new RegExp('/', 'g'), '-'),
                    submitTimeEnd: this.periodItem.rangeEnd.replace(new RegExp('/', 'g'), '-'),
                    start: this.startMap[this.pageType],
                    count: this.unitCount,
                    applyAccountId: applyAccountId,
                    subAcctId: subAccountId,
                }

                if (Number(this.pageType) > 0) {
                    params.portfolioOrderType = Number(this.pageType)
                }

                if (this.orderStatus > 0) {
                    params.orderStatus = this.orderStatus
                }

                if (this.orderDirection > 0) {
                    params.placeType = this.orderDirection
                }

                console.log('orderRecords-params:', params)
                const { result } = await orderRecords(params)
                console.log('orderRecords-result:', result)
                if (result) {
                    const resultList = result.list
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
                console.error('getPortfolioOrders===>e:', e)
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
        height: calc(100vh - @opreationHeight);
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

.condition-select {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 8px 0 32px;
    padding: 0 12px;

    .select-item {
        display: inline-block;
        box-sizing: border-box;
        width: 106px;
        height: 36px;
        margin: 0 4px;
        margin-bottom: 12px;
        font-size: 14px;
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

    &::after {
        width: 106px;
        margin: 0 4px;
        content: '';
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
</style>
