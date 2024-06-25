<template>
    <!-- 时间筛选 -->
    <van-popup class="list-popup" v-model="datePopup" closeable :close-icon="closeIcon" close-icon-position="top-left" round position="bottom">
        <div class="popuptitle">{{ $t('trade.riqishaixuan') }}</div>
        <div class="dateSelect">
            <span
                class="select-item"
                v-for="(item, index) in dateTypes"
                :key="index"
                :class="{ select: item.value === dateTypeSelectValue }"
                @click="selectDate(item)"
            >
                {{ item.label }}
            </span>
        </div>
        <div class="dateRange">
            <div class="range rangeStart" :class="{ active: selectRangeType == 'rangeStart' }" @click="changeType('rangeStart')">
                {{ rangeStart }}
            </div>
            <div class="center">—</div>
            <div class="range rangeEnd" :class="{ active: selectRangeType == 'rangeEnd' }" @click="changeType('rangeEnd')">{{ rangeEnd }}</div>
        </div>
        <van-datetime-picker
            v-model="currentDate"
            :show-toolbar="false"
            type="date"
            title=""
            :min-date="minDate"
            :max-date="maxDate"
            :formatter="formatter"
            @change="changeDate"
        />
        <div class="tips" v-if="showTip">{{ $t('fundList.earliestDate') }}</div>
        <div class="bottom" :class="{ 'tip-top': showTip }">
            <div class="reset" @click="reset">{{ $t('fundList.reset') }}</div>
            <div class="finish" @click="finish">{{ $t('fundList.complete') }}</div>
        </div>
    </van-popup>
</template>

<script>
import dayjs from 'dayjs'
import { getNearWeek, getNearMonth, getNearThreeMonth, getNearNMonth } from '@/utils/utils.js'
import { i18n } from '@/i18n/fund'

const dateFormat = date => dayjs(date).format('YYYY/MM/DD')

const dateTypeMap = {
    All: i18n.t('fundList.all'),
    D1: i18n.t('jinri'),
    W1: i18n.t('nearOneWeek'),
    M1: i18n.t('nearOneMonth'),
    M3: i18n.t('nearThreeMonth'),
    M6: i18n.t('nearSixMonth'),
    Y1: i18n.t('nearOneYear'),
}

export default {
    name: 'datePopup',
    mixins: [],
    components: {},
    props: {
        value: {
            type: Boolean,
            default: () => {
                return ''
            },
            require: true,
        },
        minDate: {
            type: Date,
            require: true,
        },
        maxDate: {
            type: Date,
            require: true,
        },
        limitDate: {
            type: Date,
            require: true,
        },
        types: {
            type: Array,
            require: true,
            default: () => {
                return ['All', 'M1', 'M3', 'Y1']
            },
        },
        showTip: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            dateTypes: [],
            currentDate: new Date(), //开始时间 or 结束时间
            rangeStart: '', //开始时间
            rangeEnd: '', //结束时间
            selectRangeType: 'rangeStart', //当前选中的是开始时间 还是结束时间
            closeIcon: require('@/assets/images/common/closePopup.png'),
            dateTypeSelectValue: 'All', //选中的全部、近三月等数据，数据没有点击完成时 可能一直在变
            dateTypeFinishValue: 'All', //点击完成时，选中的日期类型
            rangeStartFinish: '', //点击完成时，是开始日期
            rangeEndFinish: '', //点击完成时，是结束日期
        }
    },
    computed: {
        datePopup: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
    watch: {
        value: {
            async handler(v) {
                if (v) {
                    this.openDatePopup()
                }
            },
        },
        maxDate: {
            async handler(v) {
                if (v) {
                    this.rangeEnd = dateFormat(this.maxDate)
                    this.rangeEndFinish = this.rangeEnd
                }
            },
            immediate: true,
        },
    },
    created() {
        this.dateTypes = []
        this.types.forEach(type => {
            if (dateTypeMap[type]) {
                this.dateTypes.push({ label: dateTypeMap[type], value: type })
            }
        })
        this.init()
    },
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        init() {
            this.rangeStart = dateFormat(this.limitDate)
            this.rangeEnd = dateFormat(this.maxDate)
            this.currentDate = new Date(this.rangeStart)
            this.rangeStartFinish = this.rangeStart
            this.rangeEndFinish = this.rangeEnd
        },

        openDatePopup() {
            this.rangeStart = this.rangeStartFinish
            this.rangeEnd = this.rangeEndFinish
            this.dateTypeSelectValue = this.dateTypeFinishValue
            if (this.selectRangeType === 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (this.selectRangeType === 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
        },

        changeType(type) {
            if (type === 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (type === 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
            this.selectRangeType = type
        },

        changeDate() {
            const setRange = () => {
                if (this.selectRangeType === 'rangeStart') {
                    this.rangeStart = this.getDay(this.currentDate)
                } else if (this.selectRangeType === 'rangeEnd') {
                    this.rangeEnd = this.getDay(this.currentDate)
                }
            }

            const startUnix = this.currentDate.getTime()
            const endUnix = this.maxDate.getTime()
            if (startUnix > endUnix) {
                this.$nextTick(() => {
                    this.currentDate = this.maxDate
                    setRange()
                })
            } else {
                setRange()
            }

            this.dateTypeSelectValue = ''
        },

        reset() {
            this.dateTypeSelectValue = 'All'
            this.rangeStart = dateFormat(this.limitDate)
            this.rangeEnd = dateFormat(this.maxDate)
            if (this.selectRangeType === 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (this.selectRangeType === 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
        },

        finish() {
            const startDate = new Date(this.rangeStart)
            const endDate = new Date(this.rangeEnd)
            const startUnix = startDate.getTime()
            const endUnix = endDate.getTime()

            if (startUnix > endUnix) {
                this.$toast(this.$t('fundList.endDateLowStart'), { duration: 2000 })
                return
            }

            this.rangeStartFinish = this.rangeStart
            this.rangeEndFinish = this.rangeEnd
            this.dateTypeFinishValue = this.dateTypeSelectValue
            const label = this.dateTypeFinishValue.length > 0 ? dateTypeMap[this.dateTypeFinishValue] : this.$t('customDate')
            const item = {
                rangeStart: this.rangeStartFinish,
                rangeEnd: this.rangeEndFinish,
                dateType: this.dateTypeFinishValue,
                label: label,
            }
            this.$emit('click', item)
            this.datePopup = false
        },

        getDay(date) {
            return `${date.getFullYear()}/${this.addO(date.getMonth() + 1)}/${this.addO(date.getDate())}`
        },

        addO(date) {
            if (date < 10) {
                return '0' + date
            }
            return date
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

        selectDate(item) {
            this.dateTypeSelectValue = item.value
            this.rangeEnd = dateFormat(this.maxDate)
            if (item.value === 'All') {
                this.rangeStart = dateFormat(this.limitDate)
            } else if (item.value === 'D1') {
                this.rangeStart = dateFormat(this.maxDate)
            } else if (item.value === 'W1') {
                this.rangeStart = getNearWeek(this.maxDate).start
            } else if (item.value === 'M1') {
                this.rangeStart = getNearMonth(this.maxDate).start
            } else if (item.value === 'M3') {
                this.rangeStart = getNearThreeMonth(this.maxDate).start
            } else if (item.value === 'M6') {
                this.rangeStart = getNearNMonth(6, this.maxDate).start
            } else if (item.value === 'Y1') {
                const currentDate = new Date(this.rangeEnd)
                const lastYearDate = currentDate.setFullYear(currentDate.getFullYear() - 1)
                this.rangeStart = dateFormat(lastYearDate)
            }
            if (this.selectRangeType === 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (this.selectRangeType === 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.list-popup {
    /deep/ .van-popup__close-icon--top-left {
        top: 11px;
    }

    .popuptitle {
        padding: 11px 0;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
    }

    .dateSelect {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        margin: 20px 0;
        padding: 0 12px;

        .select-item {
            display: inline-block;
            flex-grow: 1;
            box-sizing: border-box;
            height: 36px;
            margin: 0 4px;
            line-height: 36px;
            text-align: center;
            background: #f9f9f9;
            border-radius: 18px;

            &.select {
                box-sizing: border-box;
                color: #ff6907;
                /* stylelint-disable-next-line number-max-precision */
                background: rgba(255, 99, 7, 0.0698703);
                //border: 0.5px solid rgba(255, 99, 7, 0.6);
                border-radius: 32px;
            }
        }
    }

    .dateRange {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 30px;
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

    .tips {
        margin-top: 20px;
        color: #1f1f1f;
        font-weight: 400;
        font-size: 11px;
        line-height: 16px;
        text-align: center;
    }

    .bottom {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin-top: 20px;
        margin-bottom: 34px;
        box-shadow: inset 0 0.5px 0 #efefef;

        .tip-top {
            margin-top: 14px;
        }

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
}
</style>
