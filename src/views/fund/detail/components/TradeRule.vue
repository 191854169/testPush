<template>
    <div class="trade-rule" id="trade-rule">
        <div class="rule-head">
            <div class="head__title">{{ $t('tradeRule') }}</div>
            <div class="head__info" v-if="showMore" @click="moreClickHander">
                <span>{{ $t('tradeProcess') }}、{{ $t('fee') }}</span>
                <span class="fsfont next">&#xe609;</span>
            </div>
        </div>
        <div class="rule-content">
            <fosun-step :stepList="stepList"></fosun-step>
        </div>
    </div>
</template>
<script>
import { orderCalendar } from '@/apis/fund/fund.js'
import fosunStep from '@/components/fosunStep.vue'
import { getTradeRuleCalendar } from '@/utils'
export default {
    name: 'tradeRule',
    components: {
        fosunStep,
    },
    props: {
        showMore: {
            type: Boolean,
            default: true,
        },
        fundType: {
            type: Number,
            default: 4,
        },
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            tradeCalendar: {
                systemTime: '', // 系统当前时间
                latestTradingDay: '', // 最近工作日
                confirmTime: '', // 确认时间
                profitLossTime: '', // 查看盈亏日期
                arrivalTime: '', // 到账日期
                cutOffTime: '', // 截止时间
            },
        }
    },
    computed: {
        stepList() {
            const time = this.tradeCalendar.cutOffTime || '09:45'
            return getTradeRuleCalendar(this.tradeCalendar, 'buy', this.$t.bind(this), { isCurrency: this.fundType === 4, time: time })
        },
    },
    created() {
        this.getOrderCalendar()
    },
    methods: {
        moreClickHander() {
            const url = `${location.origin}/wealth/fund.html#/trade-rule?symbol=${this.symbol}&type=${this.$route.query.type}&fundType=${this.fundType}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/trade-rule',
                    query: {
                        symbol: this.symbol,
                        type: this.$route.query.type,
                        fundType: this.fundType,
                    },
                })
            }
        },
        // 公募基金订单日历接口
        async getOrderCalendar() {
            try {
                const { result = {} } = await orderCalendar({
                    symbol: this.symbol,
                    direction: 1,
                })
                this.tradeCalendar.systemTime = result?.systemTime ?? ''
                this.tradeCalendar.latestTradingDay = result?.latestTradingDay ?? ''
                this.tradeCalendar.confirmTime = result?.confirmTime ?? ''
                this.tradeCalendar.profitLossTime = result?.profitLossTime ?? ''
                this.tradeCalendar.arrivalTime = result?.profitLossTime ?? ''
                this.tradeCalendar.cutOffTime = result?.cutOffTime ?? ''
            } catch (e) {
                console.log('orderCalendar===>error:', e)
            }
        },
    },
}
</script>
<style scoped lang="less">
.trade-rule {
    margin: 12px 12px 24px;
    padding: 8px 12px 0;
    background-color: #fff;
    border-radius: 8px;
}
</style>
<style lang="less" scoped>
.rule-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 20px;
    padding-top: 7px;

    .head__title {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        text-align: right;
    }

    .head__info {
        display: flex;
        align-items: center;
        color: #666;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        text-align: right;

        & > span:first-of-type {
            margin-right: 4px;
        }

        .next {
            font-size: 12px;
        }
    }
}

.rule-content {
    padding-bottom: 24px;
}
</style>
