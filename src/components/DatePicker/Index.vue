<template>
    <div class="data-picker">
        <van-popup v-model="datePopup" closeable :close-icon="closeIcon" close-icon-position="top-left" round position="bottom">
            <div class="popuptitle">{{ $t('trade.riqishaixuan') }}</div>
            <div class="dateSelect">
                <span
                    class="select-item"
                    v-for="(item, index) in shortcuts"
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
    </div>
</template>

<script>
import { getNearWeek, getNearMonth, getNearThreeMonth } from '@/utils/utils.js'
import dayjs from 'dayjs'

const dateFormat = date => dayjs(date).format('YYYY/MM/DD')
export default {
    name: 'data-picker',
    props: {
        i18n: {
            type: Function,
        },
        initialShortcuts: {
            type: [Number, String],
            default: 2,
        },
        initRangeStart: {
            type: [Date, String],
        },
        initRangeEnd: {
            type: [Date, String],
        },
    },
    data() {
        return {
            datePopup: false,
            selectValue: 0,
            selectType: 'rangeStart',
            minDate: new Date(2022, 0, 1),
            maxDate: new Date(),
            rangeStart: new Date(),
            rangeEnd: new Date(),
            currentDate: new Date(),
        }
    },
    computed: {
        closeIcon() {
            return require('@/assets/images/common/closePopup.png')
        },
        shortcuts() {
            return [
                { label: this.$t('quanbu'), value: 0 },
                { label: this.$t('jinri'), value: 1 },
                { label: this.$t('jinyizhou'), value: 2 },
                { label: this.$t('jinyiyue'), value: 3 },
                { label: this.$t('jinsanyue'), value: 4 },
            ]
        },
        $t() {
            return this.i18n
        },
    },
    mounted() {
        // 自定义起始时间
        if (this.initRangeStart && this.initRangeEnd) {
            this.rangeStart = dateFormat(this.initRangeStart)
            this.rangeEnd = dateFormat(this.initRangeEnd)
            this.selectValue = null
        } else {
            this.selectDate(this.shortcuts.find(i => i.value === this.initialShortcuts))
        }

        this.finish()
    },
    methods: {
        show() {
            this.datePopup = true
        },

        hide() {
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

        selectDate(item) {
            if (!item) return
            this.selectValue = item.value
            this.selectItem = item
            const handlerMap = {
                0: () => {
                    this.rangeStart = dateFormat(new Date(2022, 0, 1))
                    this.rangeEnd = dateFormat(new Date())
                },
                1: () => {
                    this.rangeStart = this.rangeEnd = this.getDay(new Date())
                },
                2: () => {
                    this.rangeStart = getNearWeek().start
                    this.rangeEnd = getNearWeek().end
                },
                3: () => {
                    this.rangeStart = getNearMonth().start
                    this.rangeEnd = getNearMonth().end
                },
                4: () => {
                    this.rangeStart = getNearThreeMonth().start
                    this.rangeEnd = getNearThreeMonth().end
                },
            }
            const handler = handlerMap[this.selectValue]
            handler && handler()
            this.changeType(this.selectType) // 重新计算最大最小值
            // 设置时间组件展示当前选择的开始|结束日期时间
            this.selectType && (this.currentDate = new Date(this[this.selectType]))
        },
        changeType(type) {
            if (type == 'rangeStart') {
                this.minDate = new Date(2022, 0, 1)
                this.maxDate = dayjs(this.rangeEnd).toDate()
                setTimeout(() => {
                    this.currentDate = new Date(this.rangeStart)
                }, 0)
            } else if (type == 'rangeEnd') {
                this.minDate = dayjs(this.rangeStart).toDate()
                this.maxDate = new Date()
                setTimeout(() => {
                    this.currentDate = new Date(this.rangeEnd)
                }, 0)
            }
            this.selectType = type
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

        reset() {
            this.selectValue = ''
            this.rangeStart = getNearThreeMonth().start
            this.rangeEnd = getNearThreeMonth().end
            if (this.selectType == 'rangeStart') {
                this.currentDate = new Date(this.rangeStart)
            } else if (this.selectType == 'rangeEnd') {
                this.currentDate = new Date(this.rangeEnd)
            }
        },
        finish() {
            this.rangeStartSelect = this.rangeStart
            this.rangeEndSelect = this.rangeEnd
            this.datePopup = false
            this.$emit('on-change', {
                rangeStart: this.rangeStartSelect,
                rangeEnd: this.rangeEndSelect,
                type: this.selectValue, // 快捷键类型
                label: (this.shortcuts.find(i => i.value === this.selectValue) || {}).label, // 快捷键类型对应文本
            })
        },

        changeDate() {
            if (this.selectType == 'rangeStart') {
                this.rangeStart = this.getDay(this.currentDate)
            } else if (this.selectType == 'rangeEnd') {
                this.rangeEnd = this.getDay(this.currentDate)
            }
            this.selectValue = null
        },
    },
}
</script>

<style scoped lang="less">
.data-picker {
    .popuptitle {
        padding: 11px 0;
        color: @fontBlackColor;
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
            box-sizing: border-box;
            width: 63px;
            height: 36px;
            margin: 0 4px;
            color: @fontBlackColor;
            line-height: 36px;
            text-align: center;
            background: #f9f9f9;
            border: 0.5px solid transparent;
            border-radius: 122px;

            &.select {
                box-sizing: border-box;
                color: @theme;
                /* stylelint-disable-next-line number-max-precision */
                background: rgba(255, 99, 7, 0.0698703);
                border: 0.5px solid rgba(255, 99, 7, 0.6);
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
            color: @fontBlackColor;
            font-size: 18px;
            line-height: 40px;
            text-align: center;
            background: #f9f9f9;
            border-radius: 4px;

            &.active {
                color: @theme;
                background: #fff5ef;
            }
        }

        .center {
            height: 40px;
            margin: 0 12px;
            color: rgba(0, 0, 0, 0.3);
            line-height: 40px;
        }
    }

    .bottom {
        display: flex;
        flex-direction: row;
        place-content: center space-between;
        margin-top: 20px;
        margin-bottom: 34px;
        background: rgba(255, 255, 255, 0.84);
        box-shadow: inset 0 0.5px 0 #efefef;

        .reset,
        .finish {
            flex: 1;
            padding: 14px 0 13px;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
        }

        .reset {
            color: @fontBlackColor;
        }

        .finish {
            color: @theme;
            font-weight: 500;
        }
    }
}
</style>
