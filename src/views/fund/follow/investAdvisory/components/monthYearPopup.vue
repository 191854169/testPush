<template>
    <!-- 时间筛选 -->
    <van-popup class="list-popup" v-model="datePopup" round position="bottom">
        <div class="header">
            <multi-img class="cancel-btn" name="icon-cancel" directory="common" @click="clickCancel" />
            <span>{{ getTitle() }}</span>
            <span class="confirm-btn" @click="confirmHandle">{{ $t('confirm') }}</span>
        </div>
        <van-datetime-picker
            v-model="currentDate"
            v-show="isMonth"
            :show-toolbar="false"
            type="year-month"
            title=""
            :min-date="minDate"
            :max-date="maxDate"
            :formatter="formatter"
            @change="changeDate"
        />
        <van-picker
            v-show="!isMonth && years.length > 0"
            :show-toolbar="false"
            :columns="yearColumns"
            :default-index="defaultIndex"
            :swipe-duration="300"
            @change="yearChange"
        ></van-picker>
    </van-popup>
</template>

<script>
import dayjs from 'dayjs'

const monthDateFormat = date => dayjs(date).format('YYYY/MM')
const yearDateFormat = date => dayjs(date).format('YYYY')

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
        isMonth: {
            type: Boolean,
            require: true,
            default: true, // month-day datehour
        },
        inputDate: {
            type: Date,
            require: true,
        },
    },
    data() {
        return {
            currentDate: new Date(),
            closeIcon: require('@/assets/images/common/closePopup.png'),
            selectDateString: '',
            years: [],
            yearColumns: [],
            currentYear: '',
            defaultIndex: 0,
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
                    this.currentDate = this.inputDate
                }
            },
        },
        maxDate: {
            async handler(v) {
                this.init()
            },
        },
    },
    created() {},
    mounted() {
        this.init()
    },
    destroyed() {},
    filters: {},
    methods: {
        init() {
            const maxYear = this.maxDate.getFullYear()
            const minYear = this.minDate.getFullYear()
            if (maxYear - minYear > 0) {
                const arr = []
                const columns = []
                for (let i = minYear; i <= maxYear; i++) {
                    arr.push(i + '')
                    columns.push(i + this.$t('nian'))
                }
                this.years = arr
                this.yearColumns = columns
                this.defaultIndex = arr.length - 1
                this.currentYear = this.years[this.defaultIndex]
            }
        },

        changeDate() {},

        getTitle() {
            return this.isMonth ? this.$t('investAdvisory.selectMonth') : this.$t('investAdvisory.selectYear')
        },

        async confirmHandle() {
            let date = this.currentDate
            if (this.isMonth) {
                this.selectDateString = monthDateFormat(this.currentDate)
            } else {
                this.selectDateString = this.currentYear
                date = new Date(this.selectDateString + '/01/01')
                this.defaultIndex = this.years.indexOf(this.currentYear) ?? 0
            }

            this.$emit('click', date, this.selectDateString)
            this.datePopup = false
        },

        clickCancel() {
            this.datePopup = false
        },

        getDay(date) {
            if (this.isMonth) {
                return `${date.getFullYear()}/${this.addO(date.getMonth() + 1)}`
            }
            return `${date.getFullYear()}`
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

        yearChange(picker, value, index) {
            if (index < this.years.length) {
                this.currentYear = this.years[index]
            }
        },
    },
}
</script>

<style lang="less" scoped>
.list-popup {
    padding-bottom: 40px;

    .header {
        position: sticky;
        top: 0;
        height: 88px;
        margin-bottom: 20px;
        padding: 0 12px;
        color: #2f2f2f;
        font-weight: bold;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #fff;

        .cancel-btn {
            position: absolute;
            top: 10px;
            left: 16px;
            width: 24px;
            height: 24px;
        }

        .confirm-btn {
            position: absolute;
            right: 16px;
            color: #ff6907;
            font-weight: normal;
            font-size: 14px;

            &.disabled {
                opacity: 0.3;
            }
        }
    }
}
</style>
