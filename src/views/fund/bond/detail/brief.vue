<template>
    <div class="bond-brief">
        <header>
            <span :class="{ 'henader-checker': activeHeader === 1 }" @click="activeHeader = 1">{{ $t('baseBrief') }}</span>
            <span :class="{ 'henader-checker': activeHeader === 2 }" @click="activeHeader = 2">{{ $t('companyBrief') }}</span>
        </header>
        <ul class="content" v-show="activeHeader === 1">
            <li v-for="(item, index) in basicList" :key="index">
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ item.value }}</span>
            </li>
        </ul>
        <ul class="content" v-show="activeHeader === 2">
            <li v-for="(item, index) in personList" :key="index">
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ item.value }}</span>
            </li>
        </ul>
    </div>
</template>
<script>
import { getBrief, getCompanyInfo } from '@/apis/bond/index.js'
import { thousandsFilter } from '@/config/filters.js'
import { floatToRatio } from '@/utils'
import { CURRENCY_MAP } from '../../config/common'
export default {
    name: 'bondBrief',
    data() {
        return {
            symbol: this.$route.query.symbol,
            activeHeader: 1,
            basicInfo: {
                name: '',
                ISIN: '',
                prority: '',
                bondType: '',
                category: '',
                currency: '',
                couponRate: '',
                publishDate: '',
                maturityDate: '',
                dividendFrq: '',
                offeringSize: '',
                minInitial: '',
            },
            companyInfo: {
                name: '',
                introduce: '',
                address: '',
            },
        }
    },
    computed: {
        basicList() {
            const keyMap = {
                name: this.$t('bondName'),
                ISIN: 'ISIN',
                prority: this.$t('priority'),
                bondType: this.$t('bondMold'),
                category: this.$t('bondCategory'),
                currency: this.$t('tradeCurrency'),
                couponRate: this.$t('couponRate'),
                publishDate: this.$t('publishDate'),
                maturityDate: this.$t('maturityDate'),
                dividendFrq: this.$t('dividendFrq'),
                offeringSize: this.$t('offeringSize'),
            }
            return Object.keys(keyMap).map(key => {
                const label = keyMap[key]
                let value = this.basicInfo[key]
                if (['offeringSize'].includes(key)) {
                    value = `${thousandsFilter(floatToRatio(value, { sign: false, rate: false }))}${
                        this.basicInfo.currency ? CURRENCY_MAP.options.findLabel(this.basicInfo.currency, '') : ''
                    }`
                } else if (key === 'currency') {
                    value = CURRENCY_MAP.options.findLabel(this.basicInfo.currency, '')
                } else if (key === 'couponRate') {
                    value = floatToRatio(value, { sign: false, base: 3 })
                } else if (key === 'maturityDate') {
                    if (this.basicInfo.perpetual) {
                        value = this.$t('perpetual')
                    }
                    value = value || '--'
                }
                return { label, value }
            })
        },
        personList() {
            const keyMap = {
                name: this.$t('publisher'),
                introduce: this.$t('mainBusiness'),
                address: this.$t('businessAddr'),
            }
            return Object.keys(keyMap).map(key => {
                return {
                    label: keyMap[key],
                    value: this.companyInfo[key],
                }
            })
        },
    },
    created() {
        this.getBrief()
        this.getCompanyInfo()
    },
    methods: {
        async getBrief() {
            try {
                const { result = {} } = await getBrief({ symbol: this.symbol })
                this.basicInfo = result
            } catch (e) {
                console.log('bond-getBrief===>error:', e)
            }
        },
        async getCompanyInfo() {
            try {
                const { result = {} } = await getCompanyInfo({ symbol: this.symbol })
                this.companyInfo = result
            } catch (e) {
                console.log('bond-getCompanyInfo===>error:', e)
            }
        },
    },
}
</script>
<style scoped lang="less">
.bond-brief {
    margin: 0 12px 12px;
    padding: 8px 12px 16px;
    background: #fff;
    border-radius: 8px;
}

header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 7px 0;
    color: #666;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;

    .henader-checker {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
    }

    span {
        margin-right: 28px;
    }
}

.content {
    display: flex;
    flex-direction: column;

    li {
        display: flex;
        align-items: flex-start;
        margin-bottom: 12px;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;

        .label {
            flex: 0 0 82px;
            color: #666;
        }

        .value {
            color: #2f2f2f;
            white-space: pre-wrap;
        }
    }

    li:last-of-type {
        margin-bottom: 0;
    }
}
</style>
