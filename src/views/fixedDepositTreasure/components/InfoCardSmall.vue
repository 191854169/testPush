<!-- 产品列表的信息卡 -->
<template>
    <div class="card" @click="() => $emit('click')">
        <div class="info-container">
            <p class="name">{{ productName }}</p>
            <p :class="`currency-${currency || 'HKD'}`"></p>
        </div>
        <div class="info-container mar-b12 mar-t4">
            <p class="time">{{ countDownText() }}</p>
            <p class="time-desc">{{ $t('upcomingSubscribe') }}</p>
        </div>
        <div class="info-container pad-t12 border-top-1px">
            <p class="range rise">{{ rangeValue1 | formatterfilter }}~{{ rangeValue2 | formatterfilter }}</p>
            <p class="desc">{{ $t('expectedAnnualInterestRate') }}</p>
        </div>
    </div>
</template>

<script>
import { floatToRatio, keepDecimals, humanTime } from '@/utils'
import NP from 'number-precision'
import dayjs from 'dayjs'
import { i18n } from '@/i18n/common'

export default {
    name: 'info-card-small',
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
    },
    data() {
        return {
            timerIDs: [],
            serverTimeUnix: 0,
        }
    },
    filters: {
        formatterfilter(v) {
            if (v) {
                const value = NP.times(v, 100)
                return floatToRatio(keepDecimals(value, 2), { sign: false })
            }
            return '--'
        },
    },
    mounted() {
        this.serverTimeUnix = dayjs(this.serverTime).unix()
        console.log('mounted', `productName = ${this.productName}, serverTime = ${this.serverTime}, serverTimeUnix = ${this.serverTimeUnix}`)
        const diff = this.getItemDiff()
        if (Number(diff.days) == 0) {
            console.log('mounted', 'startTimer')
            this.startTimer()
        }
    },
    methods: {
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

            console.log('countDownText', `productName = ${this.productName}, diff = ${JSON.stringify(diff)}`)
            return getTime(diff)
        },
        getItemDiff() {
            if (dayjs(this.collectStartTime).unix() > this.serverTimeUnix) {
                return humanTime(NP.times(1000, NP.minus(dayjs(this.collectStartTime).unix(), this.serverTimeUnix)))
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
    display: flex;
    flex-direction: column;
    padding: 16px 12px;
    background: #fff;
    border-radius: 8px;
}

.info-container {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
}

.name {
    max-width: 215px;
    margin-right: 4px;
    overflow: hidden;
    color: @fontBlackColor;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.time {
    color: #925fec;
    font-weight: 600;
    font-size: 11px;
    line-height: 15px;
}

.time-desc {
    margin-left: 4px;
    color: #666;
    font-size: 11px;
    line-height: 15px;
}

.range {
    color: #ff6907;
    font-weight: 600;
    font-size: 18px;
    line-height: 28px;
}

.desc {
    margin-top: 2px;
    margin-left: 12px;
    color: #9c9c9c;
    font-size: 12px;
    line-height: 16px;
}
</style>
