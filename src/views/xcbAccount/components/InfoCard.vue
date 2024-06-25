<!-- 产品列表的信息卡 -->
<template>
    <div class="info-card" :class="{ hide: !isProfessional, 'about-card': isAbout, 'is-end': isEnd }" @click="$emit('goDetails')">
        <div v-if="!isAbout">
            <div v-if="onlyEnd && isProfessional">
                <div :style="{ height: '10px' }"></div>
                <div class="only-end-container">
                    <multi-img class="only-end-bg" name="bg-end-list-tips" directory="xcbAccount"></multi-img>
                    <span class="tips">{{ $t('list.onlyEndTips') }}</span>
                </div>
            </div>
            <div class="header border-bottom-1px">
                <div class="top">
                    <div class="left">
                        <p class="name">{{ item.productName }}</p>
                        <p :class="`currency-${item.currency || 'HKD'}`"></p>
                    </div>
                    <div v-if="isProfessional && !onlyEnd">
                        <div class="subscribe-ended" v-if="subscribeEnded">
                            {{ leftTimeText() }}
                        </div>
                        <div class="right" v-else>
                            <p class="left-time">{{ countDownText }}</p>
                            <p class="left-time-desc">{{ leftTimeText() }}</p>
                        </div>
                    </div>
                </div>
                <div class="bottom">
                    <span>{{ item.interestAccrualTime | dateFormmater }}{{ $t('startInterest') }}</span>
                    <div class="line"></div>
                    <span>{{ item.periodValue || '--' }}{{ $t('day') }}</span>
                    <div class="line"></div>
                    <span>{{ $t('list.fixedRisk') }}</span>
                </div>
            </div>
            <div class="card-body">
                <div class="rate">
                    <div class="flex1">
                        <p class="range">{{ item.actualInterestRate | formatterRateFilter }}</p>
                        <p class="desc">{{ $t('list.expectedAnnualInterestRate') }}</p>
                    </div>
                    <div class="flex1">
                        <p class="money">{{ item.minSubscriptionAmount | formatAmount }}</p>
                        <p class="desc">{{ $t('list.minInitial') }}</p>
                    </div>
                </div>
                <div class="feature" v-if="!!item.productAdvantage">{{ item.productAdvantage }}</div>
            </div>
        </div>
        <div v-else>
            <div class="about-header">
                <multi-img class="header-left" name="icon_what_is_left" directory="xcbAccount"></multi-img>
                <span>{{ $t('whatIsStarSpecial') }}</span>
                <multi-img class="header-right" name="icon_what_is_right" directory="xcbAccount"></multi-img>
            </div>
            <div class="about-body">
                {{ $t('list.whatIsStarSpecialDesc') }}
            </div>
            <div class="about-footer">
                {{ $t('capitalDetail.learnMore') }}
                <multi-img name="icon_right_arrow_16" directory="common"></multi-img>
            </div>
        </div>
        <div class="info-mask" v-if="!isProfessional">
            <svg-icon iconClass="lock" className="lock"></svg-icon>
            <p>
                {{ $t('verifyText1') }}
                <br />
                {{ $t('verifyText2') }}
            </p>
            <button @click.stop="$emit('willVerify')">
                <span class="skew_top1">{{ $t('willVerify') }}</span>
            </button>
            <div v-if="!isAbout">
                <div class="subscribe-ended" v-if="subscribeEnded">
                    {{ leftTimeText() }}
                </div>
                <div class="info-mask-time" v-else>
                    <p class="left-time">{{ countDownText }}</p>
                    <p class="left-time-desc">{{ leftTimeText() }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { floatToRatio, keepDecimals, humanNum, humanTime } from '@/utils'
import NP from 'number-precision'
import dayjs from 'dayjs'
import { i18n } from '@/i18n/common'
import { PRODUCT_SUBSCRIBE_STATUS_MAP } from '../config/common.js'

export default {
    name: 'InfoCard',
    props: {
        item: {
            type: Object,
            default() {
                return {}
            },
        },
        isProfessional: {
            type: Boolean,
            default: false,
        },
        isAbout: {
            type: Boolean,
            default: false,
        },
        isEnd: {
            type: Boolean,
            default: false,
        },
        onlyEnd: {
            type: Boolean,
            default: false,
        },
        serverTime: {
            type: String,
        },
    },
    data() {
        return {
            timerIDs: [],
            serverTimeUnix: 0,
        }
    },
    filters: {
        formatterRateFilter(v) {
            if (v) {
                const value = NP.times(v, 100)
                return floatToRatio(keepDecimals(value, 2), { sign: false })
            }
            return '--'
        },
        dateFormmater(v) {
            return v ? dayjs(v).format('MM-DD') : '--'
        },
        formatAmount(v) {
            return v ? humanNum(v, 0, true, i18n, { needQianWanUnit: true, needQianUnit: true }) : '--'
        },
    },
    computed: {
        subscribeEnded() {
            return this.item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.END_SUBSCRIBE
        },
        tobeSubscribe() {
            return this.item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.TO_BE_SUBSCRIBE
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
            const text = getTime(diff)
            console.log('infocard', `countDownText = ${JSON.stringify(text)}`)
            return text
        },
    },
    mounted() {
        this.startTimerIfNeeded()
    },
    watch: {
        serverTime(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.startTimerIfNeeded()
            }
        },
    },
    methods: {
        leftTimeText() {
            if (this.subscribeEnded) {
                return this.$t('list.subscribeEnded')
            } else if (this.tobeSubscribe) {
                return this.$t('upcomingSubscribe')
            }
            return `${this.$t('suffix')}${this.$t('finishSubscribe')}`
        },
        startTimerIfNeeded() {
            this.serverTimeUnix = dayjs(this.serverTime).unix()
            const diff = this.getItemDiff()
            console.log('infocard', `diff = ${JSON.stringify(diff)}`)
            if (Number(diff.days) === 0 && NP.plus(diff.hours, diff.minutes) > 0 && !this.isAbout) {
                this.startTimer()
            }
        },
        startTimer() {
            console.log('infocard', 'startTimer')
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
        getItemDiff() {
            let targetTime = this.item.collectEndTime
            if (this.tobeSubscribe) {
                targetTime = this.item.collectStartTime
            }
            if (dayjs(targetTime).unix() > this.serverTimeUnix) {
                return humanTime(NP.times(1000, NP.minus(dayjs(targetTime).unix(), this.serverTimeUnix)))
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
.info-card {
    position: relative;
    padding: 16px 12px;
    background: #fff;
    border-radius: 8px;
    overflow-y: visible;

    &.hide > * {
        filter: blur(3px);
    }

    .info-mask {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 20;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: rgba(241, 241, 241, 0.8);
        border-radius: 6px;
        filter: blur(0);

        .lock {
            width: 28px;
            height: 28px;
            color: #453d3d;
        }

        p {
            margin: 8px 0 16px;
            color: @h2-white;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
        }

        button {
            width: 114px;
            color: #fff;
            font-weight: @fontBold;
            font-size: 14px;
            line-height: 32px;
            text-align: center;
            background: #fa9c46;
            border: none;
            border-radius: 28px;
            outline: none;

            span {
                display: inline-block;
            }
        }

        .subscribe-ended {
            position: absolute;
            top: 10px;
            right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 18px;
            padding: 0 4px;
            color: @h2-white;
            font-size: 11px;
            line-height: 14px;
            text-align: left;
            background: #e9e9e9;
            border-radius: 2px;
        }

        .info-mask-time {
            position: absolute;
            top: 10px;
            right: 12px;
            display: flex;

            .left-time {
                color: #a34400;
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
    }
}

.is-end {
    padding: 16px 12px 32px;
}

.about-card {
    padding: 16px 0 20px;

    .about-header {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
        text-align: center;

        span {
            margin: 0 8px;
        }

        img {
            width: 87px;
            height: 6px;
        }
    }

    .about-body {
        margin-top: 12px;
        padding: 0 16px;
        color: @h2-white;
        font-size: 14px;
        line-height: 21px;
        text-align: justified;
    }

    .about-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 16px;
        color: @h2-white;
        font-size: 12px;
        line-height: 16px;
        text-align: justified;

        img {
            width: 12px;
            height: 12px;
        }
    }
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

        .subscribe-ended {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 18px;
            padding: 0 4px;
            color: @h2-white;
            font-size: 11px;
            line-height: 14px;
            text-align: left;
            background: #f3f3f3;
            border-radius: 2px;
        }

        .right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
        }

        .name {
            max-width: 176px;
            margin-right: 2px;
            overflow: hidden;
            color: @fontBlackColor;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .left-time {
            color: #a34400;
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
            font-weight: bold;
            font-size: 20px;
            line-height: 28px;
        }

        .money {
            color: @h1-white;
            font-weight: bold;
            font-size: 18px;
            line-height: 28px;
        }

        .desc {
            margin-top: 4px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .feature {
        margin-top: 10px;
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

.only-end-container {
    position: absolute;
    top: -3px;
    left: 50%;
    transform: translateX(-50%);
    width: 173px;
    height: 25px;
    .only-end-bg {
        position: relative;
        width: 173px;
        height: 25px;
    }
    .tips {
        position: absolute;
        top: 0;
        left: 0;
        font-size: 11px;
        width: 173px;
        line-height: 25px;
        text-align: center;
        color: @h2-white;
    }
}
</style>
