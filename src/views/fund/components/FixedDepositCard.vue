<template>
    <div v-if="dataList.length > 0" class="card fixed-deposit">
        <div class="title">
            <div class="combinationTitle">{{ $t('fixed.fixedDeposit') }}</div>
            <div class="right" @click="toMorePage()">
                <span class="txt">{{ $t('loadingMore') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <van-swipe class="my-swipe" :autoplay="3000">
            <van-swipe-item v-for="item in dataList" :key="item.productCode">
                <div class="swipe-item" @click="gotoDetails(item.productCode)">
                    <div class="top">
                        <div class="name_area flex-c">
                            <div class="flex-c">
                                <div class="name line-elipsis">{{ item.productName }}</div>
                                <div :class="`currency-${item.currency}`"></div>
                            </div>
                            <div class="count-down flex-c">
                                <multi-img class="icon_time" name="icon_time" directory="common" verifyTheme></multi-img>
                                {{ countDownText(item) }}
                            </div>
                        </div>
                        <div class="desc">
                            <span>{{ item.interestAccrualTime | dateFormat }}{{ $t('fixed.startInterest') }}</span>
                            <div class="seperator"></div>
                            <span>{{ item.periodUnit | periodUnitFilter(item.periodValue) }}</span>
                            <div class="seperator"></div>
                            <span>
                                {{ item.minSubscriptionAmount | humanNumFilter }}{{ item.currency | currencyFilter }}{{ $t('fixed.minimumPurchase') }}
                            </span>
                        </div>
                    </div>
                    <div class="bottom" :class="{ 'single-item': dataList.length === 1 }">
                        <div class="flex-base">
                            <div class="rate rise">{{ displayRate(item) }}</div>
                            <div class="text">{{ $t('fixed.annualInterestRateAft') }}</div>
                        </div>
                        <div class="b_desc flex-c" v-show="!!item.productAdvantage">
                            <multi-img class="comments" name="comments" directory="fund" verifyTheme></multi-img>
                            <div class="line-elipsis">{{ item.productAdvantage }}</div>
                        </div>
                    </div>
                </div>
            </van-swipe-item>
        </van-swipe>
    </div>
</template>

<script>
import { SwipeItem, Swipe } from 'vant'
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'
import { thousandsFilter, currencyFilter } from '@/config/filters'
import { toFixed, humanNum, humanTime } from '@/utils'
import NP from 'number-precision'
import { i18n } from '@/i18n/fund'
import { ftdProductList } from '@/apis/ftd/product.js'

const formatterFilter = v => {
    return thousandsFilter(toFixed(v, 2))
}

const ComingSoon = 2

export default {
    name: 'fixed-deposit-card',
    mixins: [],
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
    },
    props: {},
    data() {
        //  {
        //     productName: '', //	产品名称
        //     productCode: '', //	产品代码
        //     currency: '', //	货币单位
        //     periodValue: 0, //	投资期限
        //     periodUnit: 'd', //	期限单位，d-按日, w-按周, m-按月, y-按年
        //     periodLock: 0, //	产品锁定期
        //     estimateInterestRateMin: '', //	最小预计年利率, 去除百分号, /100 的数据
        //     estimateInterestRateMax: '', //	最大预计年利率, 去除百分号, /100 的数据
        //     interestAccrualTime: '2023-09-10', //	起息日，格式:2023-09-10
        //     maturityTime: '', //	到期日，格式:2023-09-10
        //     collectStartTime: '', //	开始认购日，格式:2023-09-10
        //     collectEndTime: '', //	截止认购日，格式:2023-09-10
        //     minSubscriptionAmount: '200000', //	起购金额，单位是元
        //     productAdvantage: '', //	产品亮点
        //     tags: [], // 产品标签，1:精选，2:热门
        //     subscriptionStatus: 0, //	tab类型，2：即将认购，3：认购中，4：认购结束
        //     serverTime: '2023-09-9 15:20:10', // 服务器时间，格式:2023-09-10 15:20:10
        //     serverTimeUnix: '', // 服务器时间计算得来的时间戳 非接口返回
        // }
        return {
            dataList: [],
            timerIDs: [],
        }
    },
    computed: {},
    watch: {},
    created() {
        this.getFtdProductList()
    },
    mounted() {},
    destroyed() {},
    filters: {
        currencyFilter,
        dateFormat(v) {
            return v ? dayjs(v).format('MM/DD') : '--'
        },
        periodUnitFilter(unit, v) {
            // 期限单位，d-按日, w-按周, m-按月, y-按年
            if (unit === 'd') {
                return `${v}${i18n.t('day')}`
            } else if (unit === 'w') {
                return `${v}${i18n.t('week')}`
            } else if (unit === 'm') {
                return `${v}${i18n.t('yue')}`
            } else if (unit === 'y') {
                return `${v}${i18n.t('year')}`
            }
            return v
        },
        humanNumFilter(v) {
            return humanNum(v, 0, true, i18n, { needQianWanUnit: true, needQianUnit: true })
        },
    },
    methods: {
        async getFtdProductList() {
            const params = {
                subscriptionStatus: '2,3',
                count: 3,
            }
            ftdProductList(params)
                .then(({ result }) => {
                    let needTimer = false
                    result.list.forEach(item => {
                        item.serverTimeUnix = dayjs(item.serverTime).unix()
                        const diff = this.getItemDiff(item)
                        needTimer = Number(diff.days) == 0 || needTimer
                    })
                    this.dataList = result.list
                    if (needTimer) {
                        this.startTimer()
                    }
                    console.log(`yinlong getFtdProductList`, result)
                })
                .catch(err => {
                    console.error(`yinlong getFtdProductList`, err)
                })
        },
        toMorePage() {
            this.$goPage('/list', {}, { pathname: '/wealth/fixedDepositTreasure.html' })
        },
        gotoDetails(productCode) {
            this.$goPage('/detail', { productCode }, { pathname: '/wealth/fixedDepositTreasure.html' })
        },
        startTimer() {
            this.stopTimer()
            const id = setInterval(() => {
                const tempList = cloneDeep(this.dataList)
                for (let index = 0; index < this.dataList.length; index++) {
                    tempList[index].serverTimeUnix = tempList[index].serverTimeUnix + 60
                }
                this.dataList = cloneDeep(tempList)
            }, 1000 * 60)
            this.timerIDs.push(id)
        },
        stopTimer() {
            this.timerIDs.forEach(id => {
                clearInterval(id)
            })
            this.timerIDs = []
        },
        displayRate(item) {
            const min = formatterFilter(NP.times(item.estimateInterestRateMin, 100))
            const max = formatterFilter(NP.times(item.estimateInterestRateMax, 100))
            return `${min}%~${max}%`
        },
        countDownText(item) {
            const getTime = param => {
                if (NP.minus(param.days, 0) > 0) {
                    return Number(param.days) + i18n.t('day')
                } else if (NP.minus(param.hours, 0) > 0) {
                    return Number(param.hours) + i18n.t('hour') + param.minutes + i18n.t('minute')
                }
                return param.minutes + i18n.t('minute')
            }
            const diff = this.getItemDiff(item)
            if (item.subscriptionStatus == ComingSoon) {
                return `${getTime(diff)} ${this.$t('fixed.subStarts')}`
            }
            return `${getTime(diff)} ${this.$t('fixed.subEnd')}`
        },
        getItemDiff(item) {
            if (item.subscriptionStatus == ComingSoon) {
                if (dayjs(item.collectStartTime).unix() > item.serverTimeUnix) {
                    return humanTime(NP.times(1000, NP.minus(dayjs(item.collectStartTime).unix(), item.serverTimeUnix)))
                }
                return {
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    second: 0,
                }
            }
            if (dayjs(item.collectEndTime).unix() > item.serverTimeUnix) {
                return humanTime(NP.times(1000, NP.minus(dayjs(item.collectEndTime).unix(), item.serverTimeUnix)))
            }
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                second: 0,
            }
        },
    },
}
</script>

<style scoped lang="less">
.fixed-deposit {
    padding: 8px 0 0;
    background-color: #fff;

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin-bottom: 9px;
        padding: 0 12px;
        overflow: hidden;

        .combinationTitle {
            #font_h1();

            font-weight: bold;
            font-size: 16px;
            line-height: 36px;
        }

        .right {
            display: flex;
            align-items: center;
            font-size: 12px;
            line-height: 22px;
            #font_h2();

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

    .my-swipe {
        .swipe-item {
            padding: 0 12px;

            .top {
                height: 64px;
                padding: 8px 0 14px;

                [data-theme='black'] & {
                    border-bottom: 0.5px solid #242424;
                }

                [data-theme='white'] & {
                    border-bottom: 0.5px solid #efefef;
                }

                .name_area {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    .name {
                        max-width: 175px;
                        margin-right: 2px;
                        font-weight: bold;
                        font-size: 16px;
                        line-height: 22px;
                        #font_h1();
                    }

                    .count-down {
                        #font_theme();

                        padding: 0 4px;
                        font-weight: bold;
                        font-size: 10px;
                        line-height: 16px;
                        border-radius: 2px;

                        [data-theme='black'] & {
                            background: rgba(235, 85, 40, 0.1);
                        }

                        [data-theme='white'] & {
                            background: #ff69071a;
                        }

                        .icon_time {
                            width: 10px;
                            height: 10px;
                            margin-right: 2px;
                        }
                    }
                }

                .desc {
                    display: flex;
                    align-items: center;
                    margin-top: 4px;
                    font-size: 12px;
                    line-height: 16px;
                    #font_h3();

                    .seperator {
                        width: 1px;
                        height: 10px;
                        margin: 0 4px;
                        background-color: #b6b6b6;
                    }
                }
            }

            .bottom {
                margin-bottom: 32px;

                .flex-base {
                    display: flex;
                    align-items: first baseline;

                    .rate {
                        margin-right: 12px;
                        font-weight: bold;
                        font-size: 20px;
                        line-height: 48px;
                        #font_theme();
                    }

                    .text {
                        font-size: 12px;
                        line-height: 16px;
                        #font_h3();
                    }
                }

                .b_desc {
                    width: calc(100vw - 48px);
                    height: 28px;
                    padding: 0 10px;
                    font-size: 12px;
                    line-height: 16px;
                    border-radius: 4px;
                    #font_h1();

                    [data-theme='black'] & {
                        background: linear-gradient(90.05deg, #292929 20.72%, rgba(36, 36, 36, 0) 98.91%);
                    }

                    [data-theme='white'] & {
                        background: linear-gradient(90.05deg, #f7f7f7 20.72%, rgba(246, 246, 246, 0) 98.91%);
                    }

                    .comments {
                        width: 12px;
                        height: 10px;
                        margin-right: 8px;
                    }
                }
            }

            .single-item {
                margin-bottom: 20px;
            }
        }

        ::v-deep .van-swipe {
            &__indicators {
                bottom: 16px;
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
    }
}
</style>
