// 产品列表页
<template>
    <van-pull-refresh
        class="refresh-content"
        v-model="isLoading"
        @refresh="onRefresh"
        :pulling-text="$t('pullRefresh')"
        :loosing-text="$t('relessRefresh')"
        :loading-text="`${$t('loading')}...`"
    >
        <template slot="loading">
            <div class="loading-text">
                <multi-img class="loading-icon" width="20" height="20" name="icon-footer-loading" directory="fund" />
                <span>{{ `${$t('loading')}...` }}</span>
            </div>
        </template>
        <div class="page">
            <div class="banner">
                <multi-img class="banner-img" name="fdt-banner" directory="fixedDepositTreasure"></multi-img>
                <div class="banner-content">
                    <p>{{ $t('depositTreasure') }}</p>
                    <p>{{ $t('depositTreasureDesc') }}</p>
                </div>
                <div class="guide mg-b12" @click="goIntroductionPage()">
                    <div class="left">
                        <multi-img name="icon-what-deposit" directory="fixedDepositTreasure" />
                        <span>{{ $t('whatIsDepositTreasure') }}</span>
                    </div>
                    <div class="right">
                        <span>{{ $t('toSee') }}</span>
                        <multi-img class="next" name="icon_arrow_left" directory="bond" />
                    </div>
                </div>
            </div>
            <div class="page-body pad-t12">
                <div class="card-title">
                    <div>{{ firstCardTitle }}</div>
                    <div class="right" @click="goSubscribeList()">
                        <span class="txt">{{ $t('subscribe.record') }}</span>
                        <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left"></multi-img>
                    </div>
                </div>
                <section v-if="hotList.length != 0">
                    <div class="list-card" v-for="(item, index) in hotList" :key="`${index}_${item.productCode}_tag_3`">
                        <InfoCard
                            class="info-card"
                            :productName="item.productName"
                            :currency="item.currency"
                            :collectStartTime="item.collectStartTime"
                            :collectEndTime="item.collectEndTime"
                            :serverTime="item.serverTime"
                            :rangeValue1="item.estimateInterestRateMin"
                            :rangeValue2="item.estimateInterestRateMax"
                            :minSubscriptionAmount="item.minSubscriptionAmount"
                            :interestAccrualTime="item.interestAccrualTime"
                            :periodValue="item.periodValue"
                            :productAdvantage="item.productAdvantage"
                            @click="goProductDetail(item.productCode)"
                        ></InfoCard>
                    </div>
                </section>
                <section v-if="featuredList.length != 0">
                    <div class="card-title" v-if="showFeaturedTitle">{{ $t('specialSubscribe') }}</div>
                    <div>
                        <div class="list-card" v-for="(item, index) in featuredList" :key="`${index}_${item.productCode}_tag_2`">
                            <InfoCard
                                class="info-card"
                                :productName="item.productName"
                                :currency="item.currency"
                                :collectStartTime="item.collectStartTime"
                                :collectEndTime="item.collectEndTime"
                                :serverTime="item.serverTime"
                                :rangeValue1="item.estimateInterestRateMin"
                                :rangeValue2="item.estimateInterestRateMax"
                                :minSubscriptionAmount="item.minSubscriptionAmount"
                                :interestAccrualTime="item.interestAccrualTime"
                                :periodValue="item.periodValue"
                                :productAdvantage="item.productAdvantage"
                                @click="goProductDetail(item.productCode)"
                            ></InfoCard>
                        </div>
                    </div>
                </section>
                <!-- 仅有待上市,列表展示 -->
                <section v-if="onlyUpcomingHasValue">
                    <div class="list-card" v-for="(item, index) in upcomingList" :key="`${index}_${item.productCode}_tag_3`">
                        <InfoCard
                            class="info-card"
                            :productName="item.productName"
                            :subscribeStatus="item.subscriptionStatus"
                            :currency="item.currency"
                            :collectStartTime="item.collectStartTime"
                            :collectEndTime="item.collectEndTime"
                            :serverTime="item.serverTime"
                            :rangeValue1="item.estimateInterestRateMin"
                            :rangeValue2="item.estimateInterestRateMax"
                            :minSubscriptionAmount="item.minSubscriptionAmount"
                            :interestAccrualTime="item.interestAccrualTime"
                            :periodValue="item.periodValue"
                            :productAdvantage="item.productAdvantage"
                            @click="goProductDetail(item.productCode)"
                        ></InfoCard>
                    </div>
                </section>
                <section v-else-if="upcomingList.length != 0">
                    <div class="card-title" v-if="showUpcomingTitle">{{ $t('forthcomingSubscription') }}</div>
                    <InfoCard
                        v-if="upcomingList.length == 1"
                        class="info-card mar-left-right"
                        :isUpcoming="true"
                        :productName="upcomingList[0].productName"
                        :currency="upcomingList[0].currency"
                        :collectStartTime="upcomingList[0].collectStartTime"
                        :collectEndTime="upcomingList[0].collectEndTime"
                        :serverTime="upcomingList[0].serverTime"
                        :rangeValue1="upcomingList[0].estimateInterestRateMin"
                        :rangeValue2="upcomingList[0].estimateInterestRateMax"
                        :minSubscriptionAmount="upcomingList[0].minSubscriptionAmount"
                        :interestAccrualTime="upcomingList[0].interestAccrualTime"
                        :periodValue="upcomingList[0].periodValue"
                        :productAdvantage="upcomingList[0].productAdvantage"
                        @click="goProductDetail(upcomingList[0].productCode)"
                    ></InfoCard>

                    <div class="upcoming-crosswise-list pad-r12" v-else>
                        <InfoCardSmall
                            class="small-card-item"
                            v-for="(item, index) in upcomingList"
                            :key="`${index}_${item.productCode}_status_2`"
                            :productName="item.productName"
                            :currency="item.currency"
                            :collectStartTime="item.collectStartTime"
                            :serverTime="item.serverTime"
                            :rangeValue1="item.estimateInterestRateMin"
                            :rangeValue2="item.estimateInterestRateMax"
                            @click="goProductDetail(item.productCode)"
                        ></InfoCardSmall>
                    </div>
                </section>

                <div class="no-data" v-if="list.length == 0">
                    <Empty :showImg="true" :tip-text="$t('noContent')" imgName="empty-status" height="auto" />
                </div>
            </div>
            <!-- 查看常见问题-->
            <div class="question flex-s" @click="gotoFAQ">
                <div>{{ $t('viewFAQ') }}</div>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left"></multi-img>
            </div>

            <div class="group-buy" @click="setGroupBuy">
                <multi-img class="reminder" width="12" height="12" name="fdt_reminder_subscribe" directory="fixedDepositTreasure" />
                <span>{{ didSetGroupBuy ? $t('closeGroupBuy') : $t('openGroupBuy') }}</span>
            </div>
        </div>
    </van-pull-refresh>
</template>

<script>
import InfoCard from '../components/InfoCard.vue'
import InfoCardSmall from '../components/InfoCardSmall.vue'
import { SwipeItem, Swipe, PullRefresh } from 'vant'
import Empty from '@/components/Empty.vue'
import { ftdProductList } from '@/apis/ftd/product.js'
import { ftdSubscribeStatus, ftdSubscribe } from '@/apis/ftd/portfolio.js'
import { PRODUCT_SUBSCRIBE_STATUS_MAP, PRODUCT_TAG_MAP } from '../config/common.js'
import { getPageVisibleSupportProperty } from '@/utils'
import { Toast } from 'vant'
import pathnames from '@/config/H5Pathname.js'
import ClientSettingMixin from '@/mixins/ClientSettingMixin.js'

const kReminderKey = 'fixedDepositGroupPurchaseReminder'
const NotRemindKey = 'NotRemindKey'

export default {
    name: 'list',
    mixins: [ClientSettingMixin],
    components: {
        InfoCard,
        InfoCardSmall,
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        [PullRefresh.name]: PullRefresh,
        Empty,
    },
    data() {
        // const listItem = {
        //     id: 321, // 产品ID
        //     productName: '定存一号',
        //     productCode: '123', // 产品代码
        //     currency: '',
        //     periodValue: 365, // 投资期限
        //     periodUnit: '', // 期限单位，d-按日, w-按周, m-按月, y-按年
        //     periodLock: 100, // 产品锁定期
        //     estimateInterestRateMin: '0.0315', // 最小预计年利率, 去除百分号, /100 的数据
        //     estimateInterestRateMax: '0.0489', // 最大预计年利率, 去除百分号, /100 的数据
        //     interestAccrualTime: '2023-09-05', // 起息日 格式:2023-09-10
        //     maturityTime: '2024-06-30', // 到期日 格式:2023-09-10
        //     announcedTime: '2023-09-01', // 公布结果日，格式:2023-09-10
        //     actualInterestRate: '', // 实际利率, 去除百分号, /100 的数据
        //     annualManageFeeRate: '', // 管理费率(年化)
        //     collectStartTime: '2023-08-10', // 开始认购日
        //     collectEndTime: '', // 截止认购日
        //     minSubscriptionAmount: '200000', // 起购金额
        //     productAdvantage: '123', // 产品亮点
        //     tags: [1, 2], // 产品标签，1:精选，2:热门
        //     subscriptionStatus: 2, // tab类型，2：即将认购，3：认购中，4：认购结束
        //     serverTime: '2023-09-14 15:20:10', // 服务器时间，格式:2023-09-10 15:20:10
        // }
        return {
            list: [],
            isLoading: false,
            didSetGroupBuy: false,
            clientSetting: {},
        }
    },
    mounted() {
        // if (this.$jsBridge) {
        //     this.$jsBridge?.enabelPageRefreshFunction()
        // }
    },
    async created() {
        Toast.setDefaultOptions('text', {
            className: 'van-toast--dcb',
        })
        this.getListResult()
        this.registerWatchHandler()
        console.log('list', this.list)
        this.requestFtdSubscribeStatus()
    },
    computed: {
        hotList() {
            // 热门认购
            return this.list.filter(
                item => item.tags.includes(PRODUCT_TAG_MAP.Hot) && item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.SUBSCRIBING
            )
        },
        featuredList() {
            // 精选认购
            return this.list.filter(
                item => item.tags.includes(PRODUCT_TAG_MAP.Choiceness) && item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.SUBSCRIBING
            )
        },
        upcomingList() {
            // 即将认购
            return this.list.filter(item => item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.TO_BE_SUBSCRIBE)
        },
        onlyUpcomingHasValue() {
            return this.hotList.length === 0 && this.featuredList.length === 0 && this.upcomingList.length > 0
        },
        firstCardTitle() {
            // 标题跟随第一个Card
            if (this.list.length === 0) {
                return this.$t('hotSubscribe')
            } else if (this.hotList.length !== 0) {
                return this.$t('hotSubscribe')
            } else if (this.featuredList.length !== 0) {
                return this.$t('specialSubscribe')
            } else if (this.upcomingList.length !== 0) {
                return this.$t('forthcomingSubscription')
            }
            return this.$t('hotSubscribe')
        },
        showFeaturedTitle() {
            // 认购列表，精选列表模块展示自己的标题
            if (this.hotList.length !== 0) {
                return true
            }
            return false
        },
        showUpcomingTitle() {
            // 认购列表或者精选列表不为空，即将认购模块展示自己的标题
            if (this.hotList.length !== 0 || this.featuredList.length !== 0) {
                return true
            }
            return false
        },
    },
    methods: {
        async requestFtdSubscribeStatus() {
            try {
                const { result } = await ftdSubscribeStatus()
                this.didSetGroupBuy = result.subscribe === 1 // 1: 已订阅 2: 未订阅
                this.showTipsIfNeeded()
            } catch (error) {
                console.error(`ftdSubscribeStatus`, error)
            }
        },
        goIntroductionPage() {
            this.$goPage('/about')
        },
        gotoFAQ() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=FTDQA`
            this.$goPage(url)
        },
        goSubscribeList() {
            this.$goPage('/order-list')
        },
        goProductDetail(productCode) {
            const activityID = sessionStorage.getItem('activityId') || ''
            if (activityID) {
                this.$goPage('/detail', { productCode: productCode, activityID: activityID })
            } else {
                this.$goPage('/detail', { productCode: productCode })
            }
        },
        async getListResult() {
            // tab类型，2：即将认购，3：认购中，4：认购结束，支持多选，
            try {
                const { result } = await ftdProductList({
                    subscriptionStatus: '2,3',
                })
                if (result) {
                    this.list = result.list || []
                    console.log('result', result)
                }
            } catch (e) {
                this.list = []
                console.log('eror', e)
            } finally {
                this.isLoading = false
            }
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
                // 刷新页面
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
            this.getListResult()
            this.requestFtdSubscribeStatus()
            console.log('handlePageVisible', 'getListResult')
        },
        async showTipsIfNeeded() {
            //定存宝已开户，且未设置过开团提醒的客户，且未弹窗提示过的客户
            if (!(await this.$root.getFtdAccountStatus())) return
            if (this.didSetGroupBuy) return

            const showDialog = () => {
                this.$dialog.confirm({
                    title: this.$t('openGroupBuy'),
                    message: this.$t('groupBuyTips'),
                    confirmButtonText: this.$t('settingNow'),
                    cancelButtonText: this.$t('doNotSet'),
                    messageAlign: 'center',
                    beforeClose: async (action, done) => {
                        if (action === 'confirm') {
                            try {
                                done()
                                this.$loading.show = true
                                this.setGroupBuy()
                                this.$toast(this.$t('openGroupBuySuccess'))
                                this.$loading.show = false
                            } catch {
                                this.$loading.show = false
                            }
                        } else {
                            done()
                        }
                    },
                })

                // 只提醒一次
                this.setClientSetting(NotRemindKey, { ...this.clientSetting, [kReminderKey]: 1 })
            }

            this.requestClientSetting(NotRemindKey, result => {
                this.clientSetting = result
                if (!result?.[kReminderKey]) {
                    showDialog()
                }
            })
        },
        async setGroupBuy() {
            try {
                const { result = {} } = await ftdSubscribe({ subscribe: this.didSetGroupBuy ? 2 : 1 })
                if (result.code === 0) {
                    this.didSetGroupBuy = !this.didSetGroupBuy
                    this.$toast(this.$t(this.didSetGroupBuy ? 'openGroupBuySuccess' : 'closeGroupBuySuccess'))
                }
            } catch (error) {
                console.error(`setGroupBuy`, error)
            }
        },
        onRefresh() {
            this.isLoading = true
            this.getListResult()
        },
    },
}
</script>

<style scoped lang="less">
.page {
    min-height: 100vh;
    background: linear-gradient(180deg, #ebdefd 0%, #dbd2ff 19.85%, #ebe8fd 24.26%, #f0edfc 100%);
    user-select: none;
    #iosBottom();
    // 模拟底部模块的高度
    &::after {
        display: block;
        height: 50px;
        content: '';
    }
}

.refresh-content {
    // 下面两属性修复，下拉刷新组件在 iOS 上出现上拉卡顿的问题
    min-height: 100vh;
    overflow: hidden;

    /deep/ .loading-text {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        min-height: 20px;

        .loading-icon {
            margin-right: 12px;
            animation: circle 1.5s infinite linear;
        }

        span {
            display: inline-block;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }
    }

    @keyframes circle {
        0% {
            transform: rotate(0deg);
        }

        25% {
            transform: rotate(90deg);
        }

        50% {
            transform: rotate(180deg);
        }

        75% {
            transform: rotate(270deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
}

.banner {
    position: relative;
    z-index: 10;
    width: 100%;

    .banner-img {
        width: 100%;
        height: 200px;
    }

    .banner-content {
        position: absolute;
        top: 42px;
        left: 24px;
        display: flex;
        flex-direction: column;

        p:nth-child(1) {
            margin-bottom: 6px;
            color: #8348ec;
            font-weight: 600;
            font-size: 34px;
            line-height: 44px;
        }

        p:nth-child(2) {
            color: #7d3cf0;
            font-weight: 400;
            font-size: 15px;
            line-height: 21px;
        }
    }

    .guide {
        position: absolute;
        top: 162px;
        z-index: 11;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 32px);
        margin: 0 16px;
        padding: 12px;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        background: linear-gradient(180deg, #f0eef8 0%, #fff 51.04%, #fff 100%);
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #fff;
        backdrop-filter: blur(27.1828px);

        .left {
            display: flex;
            align-items: center;
            color: #2f2f2f;

            img {
                width: 24px;
                height: 24px;
                margin-right: 8px;
            }
        }

        .right {
            display: flex;
            align-items: center;
            height: 20px;
            color: #ff6907;
            font-weight: 400;

            span:first-of-type {
                margin-right: 4px;
                font-size: 14px;
                line-height: 20px;
            }

            .next {
                width: 12px;
                height: 12px;
            }
        }
    }
}

.card-title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 24px 16px 12px 18px;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;

    .right {
        display: flex;
        align-items: center;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        line-height: 22px;

        .arrowicon {
            width: 12px;
            height: 12px;
            vertical-align: middle;
        }

        .txt {
            margin-right: 3px;
            vertical-align: middle;
        }
    }
}

.list-card {
    margin: 0 12px;

    .info-card {
        margin-bottom: 12px;
    }
}

.forthcoming-card {
    margin: 0 12px;
    padding: 16px 12px;
    background-color: #fff;
    border-radius: 8px;
}

.mar-left-right {
    margin: 0 12px;
}

.upcoming-crosswise-list {
    display: flex;
    overflow-x: scroll;

    &::-webkit-scrollbar {
        display: none;
    }

    .small-card-item {
        flex-shrink: 0;
        width: 262px;
        margin-left: 12px;
    }
}

/deep/ .van-swipe {
    &__indicators {
        bottom: 8px;
    }

    &__indicator {
        width: 4px;
        height: 4px;
        border-radius: 0;
        #swipe_background();

        &:not(:last-child) {
            margin-right: 5px;
        }
    }

    &__indicator--active {
        #swipe_active_background();

        width: 8px;
    }
}

.no-data {
    margin: 0 12px;
    padding: 97px 124px 129px;
    background-color: #fff;
    border-radius: 8px;
}

.question {
    height: 52px;
    margin: 12px;
    padding: 0 16px;
    color: @h1-white;
    font-size: 14px;
    line-height: 20px;
    background-color: #fff;
    border-radius: 8px;

    .arrowicon {
        width: 12px;
        height: 12px;
        vertical-align: middle;
    }
}

.group-buy {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140px;
    height: 32px;
    margin: 30px auto 12px;
    background-color: #fff;
    border-radius: 16px;

    span {
        color: @h1-white;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }

    .reminder {
        width: 12px;
        height: 12px;
        margin-right: 4px;
    }
}
</style>
<style lang="less">
.van-toast--dcb {
    max-width: 220px;
}
</style>
