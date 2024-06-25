<template>
    <!-- 时间筛选 -->
    <div class="swipe-calendar">
        <div class="month-profit">
            <span>{{ monthYearProfitTitle }}</span>
            <span
                v-riseFall="{
                    value: currentProfit,
                    normal: false,
                    hide: !amountStatus,
                    rate: false,
                    hideObj: { text: '****', color: '#666666' },
                }"
            ></span>
        </div>
        <van-swipe
            class="swipe-content"
            :class="{ 'year-top': !isMonth }"
            :initial-swipe="calendarIndex"
            :show-indicators="false"
            :loop="false"
            :lazy-render="true"
            ref="swipe"
            @change="onChange"
        >
            <van-swipe-item class="swipe-item" v-for="(swipeItem, index) in calendarItems" :key="index">
                <div class="weeks" v-if="isMonth">
                    <span class="week-item" v-for="(item, index) in weekTitles" :key="index">{{ item }}</span>
                </div>
                <div class="days">
                    <div v-for="(item, index) in currentItems" :key="index" class="day-info" @click="selectDay(item)">
                        <div class="top" :class="{ select: item.index === selectIndex }">{{ item.day ?? '' }}</div>
                        <dynamic-font
                            class="bottom line-elipsis"
                            :class="{ hidden: !amountStatus, rise: isRise(item.value), fall: isFall(item.value), flat: isFlat(item.value) }"
                            :value="getDayValue(item.value, !amountStatus)"
                            :options="{ maxFontSize: 9, minFontSize: 7 }"
                        ></dynamic-font>
                    </div>
                </div>
            </van-swipe-item>
        </van-swipe>
        <swipeChart :datas="chartDatas" :selectIndex="selectIndex"></swipeChart>
    </div>
</template>

<script>
import dayjs from 'dayjs'
import { Swipe, SwipeItem } from 'vant'
import { totalMonths, dayProfit, getFirstDayOfWeek, getMonthDays, range, getPreMonthDate, totalYears } from '../utils/date-utils.js'
import DynamicFont from '@/components/FosunDynamicFont.vue'
import { profitLossCalendar } from '@/apis/portfolioFollow'
import swipeChart from './swipeCalendarChart'

export default {
    name: 'swipe-calendar',
    mixins: [],
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        DynamicFont,
        swipeChart,
    },
    props: {
        amountStatus: {
            type: Boolean,
            default: false,
        },
        isMonth: {
            type: Boolean,
            default: true,
        },
        currentDate: {
            type: Date,
            default: () => {
                return new Date()
            },
        },
        currency: {
            type: String,
            default: 'HKD',
        },
        maxDate: {
            type: Date,
            require: true,
        },
    },
    data() {
        return {
            calendarItems: [],
            calendarIndex: 0,
            weekTitles: ['日', '一', '二', '三', '四', '五', '六'], //简体繁体一样，不用写多语言
            yearMonthMap: {}, //每月 or 每年的数据
            currentItems: [],
            currentKey: '',
            selectIndex: -1,
            selectDate: new Date(),
            currentProfitLoss: {},
            subAccountId: this.$store.getters['user/getSubAccountId'],
            portfolioId: this.$route.query.tgID ?? '',
            applyAccountId: this.$route.query.tgAccID ?? '',
            chartDatas: [],
            needResize: true,
            latestTime: 0,
        }
    },
    computed: {
        monthYearProfitTitle() {
            if (this.selectIndex >= 0) {
                return this.isMonth ? this.$t('investAdvisory.currentDayProfit') : this.$t('investAdvisory.currentMonthProfit')
            }
            if (this.isMonth) {
                const month = this.selectDate.getMonth() + 1
                //月份
                return this.$t('investAdvisory.monthProfit', { month: '' + month })
            }
            return this.$t('investAdvisory.yearProfit', { year: this.currentYear })
        },

        currentProfit() {
            return this.currentProfitLoss?.[this.currency] ?? '--'
        },
    },
    watch: {
        currentDate: {
            async handler(v) {
                const oldKey = this.dateFormat(this.selectDate)
                const newKey = this.dateFormat(v)
                if (oldKey !== newKey) {
                    this.selectIndex = -1
                    this.selectDate = v
                    this.currentKey = newKey
                    this.initCurrentMonthOrYear(newKey)
                    if (!this.needResize) {
                        this.fetchData(newKey)
                        let index = this.calendarItems.length - 1
                        for (let i = 0; i < this.calendarItems.length - 1; i++) {
                            if (this.calendarItems[i].key === newKey) {
                                index = i
                                break
                            }
                        }
                        this.calendarIndex = index
                        this.$refs.swipe.swipeTo(this.calendarIndex)
                    }
                }
            },
        },
        currency: {
            async handler(v) {
                //币种变化重新赋值数据
                this.handleChartData()
            },
        },

        maxDate: {
            async handler(v) {
                //日期变化
                this.initCalendarItems()
            },
        },
    },
    created() {
        this.initCalendarItems()
    },
    mounted() {
        const key = this.dateFormat(this.selectDate)
        this.initCurrentMonthOrYear(key)
        //this.fetchData(key)
        if (this.isMonth) {
            this.resize()
        }
    },
    destroyed() {},
    filters: {},
    methods: {
        dateFormat(date) {
            if (this.isMonth) {
                return dayjs(date).format('YYYY-MM')
            }
            return date.getFullYear() + ''
        },

        resize() {
            if (!this.needResize) {
                return
            }
            this.needResize = false
            this.$nextTick(() => {
                this.$refs.swipe.swipeTo(this.calendarIndex)
                this.$refs.swipe.resize()
                this.$nextTick(() => {
                    const key = this.dateFormat(this.selectDate)
                    this.fetchData(key)
                })
            })
        },

        initCalendarItems() {
            if (this.isMonth) {
                const months = totalMonths(this.maxDate)
                this.calendarItems = months
                this.calendarIndex = months.length - 1
            } else {
                const years = totalYears(this.maxDate)
                this.calendarItems = years
                this.calendarIndex = years.length - 1
            }
            this.currentKey = this.calendarItems[this.calendarIndex].key
        },

        initCurrentMonthOrYear(key) {
            if (!this.yearMonthMap[key]) {
                this.getMonthOrYearDays(this.selectDate)
            }
            this.currentItems = this.yearMonthMap[key] ?? []
        },
        isRise(value) {
            return this.amountStatus && value?.[this.currency] && Number(value[this.currency]) > 0
        },
        isFall(value) {
            return this.amountStatus && value?.[this.currency] && Number(value[this.currency]) < 0
        },
        isFlat(value) {
            return this.amountStatus && value?.[this.currency] && Number(value[this.currency]) === 0
        },
        getMonthOrYearDays(date) {
            const key = this.dateFormat(date)
            if (this.isMonth) {
                //处理当月的每日显示
                const firstDay = getFirstDayOfWeek(date)
                const prevMonthDays = range(firstDay).map(() => ({}))
                const currentMonthDays = getMonthDays(date).map(day => ({
                    day: day,
                    key: key + '-' + (day < 10 ? '0' + day : day),
                    value: null,
                    index: day - 1,
                }))

                const days = [...prevMonthDays, ...currentMonthDays]
                this.yearMonthMap[key] = days
            } else {
                //处理当月月显示
                const months = []
                for (let i = 1; i <= 12; i++) {
                    months.push({
                        day: this.$t('investAdvisory.monthIndex', { month: i + '' }),
                        key: key + '-' + (i < 10 ? '0' + i : i + ''),
                        value: null,
                        index: i - 1,
                    })
                }
                this.yearMonthMap[key] = months
            }
        },

        getDayValue(value, isHidden) {
            return dayProfit(value?.[this.currency], isHidden)
        },
        onChange(index) {
            this.calendarIndex = index
            this.selectIndex = -1
            const currentKey = this.calendarItems[index].key
            this.currentKey = currentKey
            if (this.isMonth) {
                this.selectDate = new Date(currentKey.replace(new RegExp('-', 'g'), '/') + '/01')
            } else {
                this.selectDate = new Date(currentKey + '/01/01')
            }

            if (!this.yearMonthMap[currentKey]) {
                this.getMonthOrYearDays(this.selectDate)
            }

            this.currentItems = this.yearMonthMap[currentKey] ?? []
            this.$emit('change', this.selectDate, currentKey.replace(new RegExp('-', 'g'), '/'))
            //清空数据
            this.currentProfitLoss = {}
            this.fetchData(currentKey)
            this.handleChartData()

            if (this.isMonth) {
                //预加载上一个月的天数数据
                const preDate = getPreMonthDate(this.selectDate)
                const preMonthKey = this.dateFormat(preDate)
                if (!this.yearMonthMap[preMonthKey]) {
                    this.getMonthOrYearDays(preDate)
                }
            }
        },
        selectDay(item) {
            const hasKey = !!item.key
            const enable = !!item.value

            if (!hasKey || !enable) {
                return
            }

            if (this.selectIndex === item.index) {
                this.selectIndex = -1

                const key = this.dateFormat(this.selectDate)
                const list = this.yearMonthMap[key]
                if (list.length > 0) {
                    this.currentProfitLoss = list[0].profitLoss ?? {}
                } else {
                    this.currentProfitLoss = {}
                }
            } else {
                this.selectIndex = item.index
                this.currentProfitLoss = item.value ?? {}
            }
            this.handleChartData()
        },

        fetchData(key) {
            this.getCalendarData(key)
                .then(() => {
                    this.handleData()
                })
                .catch(e => {
                    console.error(e)
                })
        },

        //处理每日及图标数据
        handleData() {
            if (this.needResize) {
                //还没有布局好，不处理
                return
            }
            const key = this.dateFormat(this.selectDate)
            const list = this.yearMonthMap[key]
            if (list.length > 0) {
                this.currentProfitLoss = list[0].profitLoss ?? {}
                this.currentItems = list
                this.handleChartData()
            }
        },

        //处理图表数据
        handleChartData() {
            if (this.needResize) {
                //还没有布局好，不处理
                return
            }
            const values = this.currentItems
                .filter(item => {
                    return item.index >= 0
                })
                .map(item => {
                    return Number(item.value?.[this.currency] ?? '0')
                })
            this.chartDatas = values
        },

        async getCalendarData(key) {
            try {
                if (this.yearMonthMap[key] && this.yearMonthMap[key][0].isRequested) {
                    //有缓存取缓存数据
                    return {}
                }
                const params = {
                    subAcctId: this.subAccountId,
                    type: this.isMonth ? 'month' : 'year',
                    value: key,
                    applyAccountId: this.applyAccountId,
                    portfolioID: this.portfolioId,
                }
                console.log('getCalendarData params', params)
                const { result } = await profitLossCalendar(params)
                console.log('getCalendarData result', result)
                if (result) {
                    const list = this.yearMonthMap[key]
                    if (list.length > 0) {
                        //第一个元素记录是否请求过 和 该年份 or 月份的总收益
                        list[0].isRequested = true
                        list[0].profitLoss = result?.overview?.profitLoss ?? {}

                        if (result.record && result.record.length > 0) {
                            const dateMap = {}
                            result.record.forEach(item => {
                                if (item.date && item.profitLoss) {
                                    dateMap[item.date] = item.profitLoss
                                }
                            })
                            if (this.latestTime === 0) {
                                //1.在选中月 or 选中年的record.length > 0时
                                //2.选中月 or 选中年 要小于最近收益返回时间  => 最近收益返回时间 = 最近交易记录的最后一天 or 当前时间
                                //满足上面两个条件时，没有值的天or月要赋值0， 其他情况不赋值，不可点击

                                const nowFormat = this.isMonth ? dayjs(this.maxDate).format('YYYYMMDD') : dayjs(this.maxDate).format('YYYYMM')
                                this.latestTime = Number(nowFormat) ?? 0
                                if (key === this.calendarItems[this.calendarItems.length - 1].key) {
                                    const lastDate = result.record[result.record.length - 1].date
                                    if (lastDate.length > 0) {
                                        this.latestTime = Number(lastDate.replace(new RegExp('-', 'g'), '')) ?? 0
                                    }
                                }
                            }
                            const nowNumber = this.latestTime

                            list.forEach(item => {
                                if (item.key) {
                                    const zeroItem = {
                                        HKD: '0',
                                        USD: '0',
                                        CNH: '0',
                                    }
                                    const dateNumber = Number(item.key.replace(new RegExp('-', 'g'), ''))
                                    if (dateMap[item.key]) {
                                        item.value = dateMap[item.key] ?? zeroItem
                                    } else if (dateNumber <= nowNumber) {
                                        item.value = zeroItem
                                    } else {
                                        item.value = null
                                    }
                                }
                            })
                        }
                        this.yearMonthMap[key] = list
                    }
                }

                return {}
            } catch (e) {
                console.error('getCalendarData error', e)
                return {}
            }
        },
    },
}
</script>

<style lang="less" scoped>
.swipe-calendar {
    padding-top: 12px;
    background-color: #fff;

    .month-profit {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        height: 34px;
        margin-right: 6px;
        margin-left: 6px;
        padding: 0 12px;
        color: #2f2f2f;
        background-color: #f9f9f9;
        border-radius: 6px;

        span {
            margin-right: 6px;
            overflow: hidden;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            white-space: nowrap;
            text-align: left;
            text-overflow: ellipsis;
        }
    }

    .swipe-content {
        height: 100%;

        &.year-top {
            margin-top: 12px;
        }
    }

    .swipe-item {
        height: 100%;

        .weeks {
            display: flex;
            height: 44px;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            #font_h1();

            .week-item {
                box-sizing: border-box;
                width: 14.28%; //flex-grow: 1;
                height: 44px;
                padding: 12px 0;
            }
        }

        .days {
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            text-align: center;

            .day-info {
                display: flex;
                flex-direction: column;
                align-content: flex-start;
                align-items: center;
                justify-content: flex-start;
                box-sizing: border-box;
                width: 14.28%; //flex-grow: 1;
                height: 50px;
                margin-bottom: 16px;
                padding: 0 1px;

                .top {
                    width: 32px;
                    height: 32px;
                    color: @h1-white;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 32px;
                    border-radius: 16px;

                    &.select {
                        color: #ff6907;
                        background: rgba(255, 105, 7, 0.1);
                    }
                }

                .bottom {
                    width: 100%;
                    margin-top: 2px;
                    color: @h1-white;
                    font-weight: 400;
                    font-size: 9px;
                    line-height: 16px;

                    &.hidden {
                        color: #666;
                    }
                }
            }
        }
    }
}
</style>
