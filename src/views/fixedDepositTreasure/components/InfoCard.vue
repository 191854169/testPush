<!-- 产品列表的信息卡 -->
<template>
    <div class="card" @click="() => $emit('click')">
        <div class="header border-bottom-1px">
            <div class="top">
                <div class="left">
                    <p class="name">{{ productName }}</p>
                    <p :class="`currency-${currency || 'HKD'}`"></p>
                </div>
                <div class="right">
                    <p class="left-time">{{ countDownText() }}</p>
                    <p class="left-time-desc">{{ leftTimeText() }}</p>
                </div>
            </div>
            <div class="bottom" v-if="!isUpcoming">
                <span>{{ interestAccrualTime | dateFormmater }}{{ $t('startInterest') }}</span>
                <div class="line"></div>
                <span>{{ periodValue || '--' }}{{ $t('day') }}</span>
                <div class="line"></div>
                <span>{{ minSubscriptionAmount | formatAmount }}{{ currency | currencyFilter }}{{ $t('minimumPurchase') }}</span>
            </div>
        </div>
        <div class="card-body">
            <div class="rate">
                <p class="range rise">{{ rangeValue1 | formatterRateFilter }}~{{ rangeValue2 | formatterRateFilter }}</p>
                <p class="desc">{{ $t('expectedAnnualInterestRate') }}</p>
            </div>
            <div class="feature" v-if="productAdvantage && !isUpcoming">{{ $t('productAdvantage') }}：{{ productAdvantage }}</div>
        </div>
    </div>
</template>

<script>
import { floatToRatio, keepDecimals, humanNum, humanTime } from '@/utils'
import { PRODUCT_SUBSCRIBE_STATUS_MAP } from '../config/common.js'
import NP from 'number-precision'
import dayjs from 'dayjs'
import { i18n } from '@/i18n/common'
import { currencyFilter } from '@/config/filters'

export default {
    name: 'InfoCard',
    props: {
        productName: {
            type: String,
            default: '--',
        },
        currency: {
            type: String,
            default: 'HKD',
        },
        collectStartTime: {
            type: String,
            default: '',
        },
        collectEndTime: {
            type: String,
            default: '',
        },
        serverTime: {
            type: String,
            default: '',
        },
        rangeValue1: {
            type: String,
            default: '--',
        },
        rangeValue2: {
            type: String,
            default: '--',
        },
        minSubscriptionAmount: {
            type: String,
            default: '--',
        },
        interestAccrualTime: {
            type: String,
            default: '--',
        },
        periodValue: {
            type: Number,
            default: 0,
        },
        productAdvantage: {
            type: String,
            default: '',
        },
        // 是否在即将认购中使用，是则不展示起息一栏，产品优势一栏
        isUpcoming: {
            type: Boolean,
            default: false,
        },
        subscribeStatus: {
            type: Number,
        },
    },
    data() {
        return {
            timerIDs: [],
            serverTimeUnix: 0,
        }
    },
    filters: {
        currencyFilter,
        formatterRateFilter(v) {
            if (v) {
                const value = NP.times(v, 100)
                return floatToRatio(keepDecimals(value, 2), { sign: false })
            }
            return '--'
        },
        dateFormmater(v) {
            return v ? dayjs(v).format('MM/DD') : '--'
        },
        formatAmount(v) {
            return v ? humanNum(v, 0, true, i18n, { needQianWanUnit: true, needQianUnit: true }) : '--'
        },
    },
    mounted() {
        this.serverTimeUnix = dayjs(this.serverTime).unix()
        const diff = this.getItemDiff()
        console.log('infocard', `diff = ${JSON.stringify(diff)}`)
        if (Number(diff.days) == 0) {
            console.log('infocard', 'startTimer')
            this.startTimer()
        }
    },
    methods: {
        leftTimeText() {
            if (this.isUpcoming || this.subscribeStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.TO_BE_SUBSCRIBE) {
                return this.$t('upcomingSubscribe')
            }
            return `${this.$t('suffix')}${this.$t('finishSubscribe')}`
        },
        startTimer() {
            this.stopTimer()
            const id = setInterval(() => {
                this.serverTimeUnix += 60
            }, 1000 * 60)
            this.timerIDs.push(id)
        },
        stopTimer() {
            this.timerIDs.forEach(id => {
                clearInterval(id)
            })
            this.timerIDs = []
        },
        countDownText() {
            const getTime = param => {
                if (NP.minus(param.days, 0) > 0) {
                    return Number(param.days) + i18n.t('day')
                } else if (NP.minus(param.hours, 0) > 0) {
                    return Number(param.hours) + i18n.t('hour') + param.minutes + i18n.t('minute')
                }
                return param.minutes + i18n.t('minute')
            }
            const diff = this.getItemDiff()
            const countDownText = getTime(diff)
            console.log('infocard', `countDownText = ${JSON.stringify(countDownText)}`)
            return countDownText
        },
        getItemDiff() {
            if (this.isUpcoming || this.subscribeStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.TO_BE_SUBSCRIBE) {
                if (dayjs(this.collectStartTime).unix() > this.serverTimeUnix) {
                    return humanTime(NP.times(1000, NP.minus(dayjs(this.collectStartTime).unix(), this.serverTimeUnix)))
                }
            } else {
                if (dayjs(this.collectEndTime).unix() > this.serverTimeUnix) {
                    return humanTime(NP.times(1000, NP.minus(dayjs(this.collectEndTime).unix(), this.serverTimeUnix)))
                }
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
.card {
    padding: 16px 12px;
    background: #fff;
    border-radius: 8px;
}

.header {
    padding-bottom: 14px;

    .top {
        display: flex;
        flex-wrap: nowrap;
        justify-content: space-between;

        .left {
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }

        .right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }

        .name {
            max-width: 176px;
            margin-right: 4px;
            overflow: hidden;
            color: @fontBlackColor;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .left-time {
            color: #925fec;
            font-weight: 600;
            font-size: 11px;
            line-height: 16px;
        }

        .left-time-desc {
            margin-left: 4px;
            color: #666;
            font-size: 11px;
            line-height: 16px;
        }
    }

    .bottom {
        display: flex;
        align-items: center;
        margin-top: 6px;

        span {
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }

        .line {
            width: 1px;
            height: 10px;
            margin: 0 4px;
            background: #b6b6b6;
        }
    }
}

.card-body {
    flex-direction: column;
    margin-top: 12px;

    .rate {
        display: flex;
        align-items: center;

        .range {
            color: #ff6907;
            font-weight: 600;
            font-size: 20px;
            line-height: 28px;
        }

        .desc {
            margin-left: 12px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .feature {
        margin-top: 8px;
        padding: 6px 10px;
        overflow: hidden;
        color: #2f2f2f;
        font-size: 12px;
        line-height: 16px;
        white-space: nowrap;
        text-overflow: ellipsis;
        background: linear-gradient(90.05deg, #f6f6f6 20.72%, rgba(246, 246, 246, 0) 98.91%);
        border-radius: 4px;
    }
}
</style>
