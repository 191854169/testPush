<template>
    <div class="bond-basic-info">
        <div class="info-name">{{ info.name }}</div>
        <fosun-tags class="tabs" :tags="tabs"></fosun-tags>
        <div class="quote">
            <div class="row left">
                <span class="value">{{ info.price }}</span>
                <span class="label">{{ $t('closingPrice') }}{{ info.date ? `(${info.date.slice(5)})` : '' }}</span>
            </div>
            <div class="row center">
                <span class="value" v-riseFall="{ value: info.MAY, base: base }"></span>
                <span class="label">{{ $t('expireIncome') }}</span>
            </div>
            <div class="row right">
                <span class="value">{{ info.remainingDate | remainingDateFilter(info) }}</span>
                <span class="label">{{ $t('residueDate') }}</span>
            </div>
        </div>
        <ul class="other-info">
            <li class="item" v-for="item in otherInfo" :key="item.key">
                <div class="label">{{ item.label }}</div>
                <div class="value">{{ item.value }}</div>
            </li>
        </ul>
    </div>
</template>
<script>
import { getQuote } from '@/apis/bond'
import FosunTags from '@/components/FosunTags.vue'
import { keepDecimals } from '@/utils'
import { CURRENCY_MAP } from '../../config/common'
import { milliFormat } from '../../../../utils'
export default {
    name: 'bondBasicInfo',
    components: {
        FosunTags,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            info: {
                symbol: '',
                productCode: '',
                ISIN: '',
                name: '',
                currency: '',
                couponRate: '',
                maturityDate: '',
                dividendFrq: '',
                price: '',
                date: '',
                riskOverall: '',
                creditRating: '',
                remainingYear: '',
                MAY: '',
                minInitial: '',
            },
        }
    },
    computed: {
        tabs() {
            const riskRating = {
                1: this.$t('lowRisk'),
                2: this.$t('middleLowRisk'),
                3: this.$t('middleRisk'),
                4: this.$t('middleHighRisk'),
                5: this.$t('highRisk'),
            }
            const keys = [
                {
                    key: 'currency',
                },
                {
                    key: 'riskOverall',
                    filter(v) {
                        return riskRating[v] || '--'
                    },
                },
                {
                    key: 'creditRating',
                },
            ]
            return keys.map(({ key, filter }) => {
                let val = this.info[key]
                if (filter) {
                    val = filter(val, this.info)
                }
                return val
            })
        },
        otherInfo() {
            const labelMap = {
                couponRate: {
                    label: this.$t('couponRate'),
                    filter: value => (value ? `${value}%` : '--'),
                },
                maturityDate: {
                    label: this.$t('maturityDate'),
                    filter: (value, info = {}) => {
                        if (info.perpetual) {
                            // 是否永续债券
                            return this.$t('perpetual')
                        }
                        return value || '--'
                    },
                },
                dividendFrq: {
                    label: this.$t('dividendFrq'),
                },
                accrualInterest: {
                    label: this.$t('accruedInterest'),
                    filter: value => (value ? keepDecimals(value, 4) : '--'),
                },
                currency: {
                    label: this.$t('tradeCurrency'),
                    filter: value => CURRENCY_MAP.options.findLabel(value, '--'),
                },
                minInitial: {
                    label: this.$t('minimumFaceValue'),
                    filter: value => (value ? milliFormat(keepDecimals(value, 2)) : '--'),
                },
            }
            return Object.keys(labelMap).map(key => {
                let value = this.info[key]
                const { label, filter } = labelMap[key]
                if (filter) {
                    value = filter(value, this.info)
                }
                return { key, label, value }
            })
        },
        // 小数位展示：美国国债：3 企业债券：3
        base() {
            return (this.info.MAY + '').split('.')[1]?.length || 3
        },
    },
    filters: {
        // 剩余天数
        remainingDateFilter(v = {}, info = {}) {
            if (info.expired) {
                // 是否过期
                return '0'
            }
            if (info.perpetual) {
                // 是否永续债券
                return '--'
            }
            const year = v?.year ? v?.year + 'Y+' : ''
            const day = v?.day ? v?.day + 'D' : ''
            return `${year}${day}`
        },
    },
    created() {
        this.getQuote()
    },
    methods: {
        async getQuote() {
            try {
                const { result = {} } = await getQuote({ symbol: this.symbol })
                this.$emit('quote-loaded', result)
                this.info = result
            } catch (e) {
                console.log(e)
            }
        },
    },
}
</script>
<style scoped lang="less">
.bond-basic-info {
    margin: 0 12px 12px;
    padding: 16px 12px 0;
    background: #fff;
    border-radius: 8px;

    .info-name {
        margin-bottom: 10px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    .tabs {
        margin-bottom: 16px;
    }

    .quote {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;

        .row {
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .value {
                margin-bottom: 8px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 20px;
                line-height: 28px;
            }

            .label {
                color: #666;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        .left {
            text-align: left;
        }

        .center {
            text-align: center;
        }

        .right {
            text-align: right;
        }
    }

    .other-info {
        display: flex;
        flex-flow: row wrap;
        padding: 12px 0 8px;
        box-shadow: inset 0 0.5px 0 #efefef;

        .item {
            display: flex;
            justify-content: space-between;
            width: 50%;
            margin-bottom: 8px;

            .label {
                color: #666;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }

            .value {
                color: #2f2f2f;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        .item:nth-child(2n) {
            padding-left: 10px;
        }

        .item:nth-child(2n + 1) {
            padding-right: 10px;
        }
    }
}
</style>
