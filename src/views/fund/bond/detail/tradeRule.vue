<template>
    <div class="bond-trade-rule">
        <header>{{ $t('tradeRule') }}</header>
        <ul class="content">
            <li v-for="(item, index) in list" :key="index">
                <span class="label">{{ item.label }}</span>
                <span class="value">{{ item.value }}</span>
            </li>
        </ul>
    </div>
</template>
<script>
import { getTradeInfo } from '@/apis/bond'
import { thousandsFilter } from '@/config/filters.js'
import { floatToRatio } from '@/utils'
import { CURRENCY_MAP } from '../../config/common'
export default {
    name: 'bondTradeRule',
    data() {
        return {
            symbol: this.$route.query.symbol,
            info: {
                minInitial: '',
                unitAmount: '',
                buyFee: '',
                interest: '',
                custodion: '',
                currency: '',
            },
        }
    },
    computed: {
        list() {
            const keyMap = {
                tradeTime: this.$t('bondTradeTimeLabel'),
                minInitial: this.$t('minTradeFaceValue'),
                buyFee: this.$t('tradeFee'),
                settlementTime: this.$t('settlementTime'),
                custodion: this.$t('settlementCustodyFees'),
                interest: this.$t('interest'),
                dividend: this.$t('dividend'),
                maturityPay: this.$t('paymentDue'),
            }
            return Object.keys(keyMap).map(key => {
                let value = this.info[key]
                if ('tradeTime' === key) {
                    value = this.$t('bondTradeTimeValue')
                } else if (['minInitial', 'unitAmount'].includes(key)) {
                    value = `${thousandsFilter(floatToRatio(this.info[key], { sign: false, rate: false }))}${
                        this.info.currency ? CURRENCY_MAP.options.findLabel(this.info.currency, '') : ''
                    }`
                } else if (['buyFee'].includes(key)) {
                    value = value ? floatToRatio(value, { sign: false }) : ''
                }
                return { label: keyMap[key], value }
            })
        },
    },
    created() {
        this.getTradeInfo()
    },
    methods: {
        async getTradeInfo() {
            try {
                const { result = {} } = await getTradeInfo({ symbol: this.symbol })
                this.info = result
            } catch (e) {
                console.log('bond-getTradeInfo==>error:', e)
            }
        },
    },
}
</script>
<style scoped lang="less">
.bond-trade-rule {
    margin: 0 12px 24px;
    padding: 8px 12px 16px;
    background: #fff;
    border-radius: 8px;

    header {
        margin-bottom: 12px;
        padding: 7px 0;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
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
                text-align: justify;
            }
        }

        li:last-of-type {
            margin-bottom: 0;
        }
    }
}
</style>
