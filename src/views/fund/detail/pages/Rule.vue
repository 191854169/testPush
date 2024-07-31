<!-- 基金交易规则 -->
<template>
    <div class="rule">
        <div class="rule-tabs">
            <fosun-tabs v-model="active">
                <van-tab class="tab-content" v-for="item in tabs" :key="item.key" :title="item.label" :name="item.key">
                    <div class="content-item" v-for="(i, index) in contentList[`${item.key}List`]" :key="index" v-show="i.hidden !== true">
                        <div class="content-item__main">
                            <div class="label">{{ i.label }}</div>
                            <div class="value">{{ i.config ? i.config() : i.value }}</div>
                        </div>
                        <div v-if="i.desc" class="value-desc">
                            <multi-img class="arrow" name="rule_desc_top" directory="fund" />
                            <div v-for="text in i.desc" :key="text">{{ text }}</div>
                        </div>
                    </div>
                </van-tab>
            </fosun-tabs>
            <div class="rule-desc" v-show="isBuy || isSell">
                <div class="desc-title">{{ descTitle }}</div>
                <fosun-step class="desc-step" :stepList="stepList"></fosun-step>
                <div class="desc-text">
                    <p>{{ desc.text1 }}</p>
                    <p>{{ desc.text2 }}</p>
                    <p>{{ $t('tradeRuleDescTest3') }}</p>
                </div>
            </div>
            <div class="explain" v-if="isPublic">
                {{ $t('ruleDescript') }}
            </div>
        </div>
    </div>
</template>
<script>
import { orderCalendar } from '@/apis/fund/fund.js'
import { getFundTradingRule } from '@/apis/fund/fund'
import fosunStep from '@/components/fosunStep.vue'
import FosunTabs from '@/components/FosunTabs.vue'
import { Tab } from 'vant'
import { milliFormat, getTradeRuleCalendar } from '@/utils'
import { currencyFilter } from '@/config/filters'

const thousandFilter = v => {
    return v ? milliFormat(v) : '--'
}
export default {
    name: 'rule',
    components: {
        FosunTabs,
        fosunStep,
        [Tab.name]: Tab,
    },
    filters: {
        currencyFilter,
    },
    data() {
        return {
            active: this.$route.query.active ?? 'buy',
            ruleInfo: {
                minInitial: '', // 起投金额
                buyRate: '', // 买入费率
                minRedemption: '', // 最小赎回金额
                minRedemptionShare: '', // 最小赎回份额
                sellRate: '', // 赎回费率
                managerFee: '', // 管理费
                storageFee: '', // 托管费 !仅公募
                performanceFee: '', // 表现费
                otherFee: '', // 其他费用
                currency: '',
                sellDisplayType: 1, // 1 份额 2 金额
            },
            tabs: [
                {
                    label: this.$t('subscribe'),
                    key: 'buy',
                },
                {
                    label: this.$t('redeem'),
                    key: 'sell',
                },
                {
                    label: this.$t('cost'),
                    key: 'cost',
                },
            ],
            buyCalendar: {
                systemTime: '', // 系统当前时间
                latestTradingDay: '', // 最近工作日
                confirmTime: '', // 确认时间
                profitLossTime: '', // 查看盈亏日期
                arrivalTime: '', // 到账日期
                settlementDay: '', // 用户结算日
                redeemSettlementDay: '', // 赎回结算日
                cutOffTime: '', // cutofftime截止日期
                redeemCutOffTime: '', // 赎回截止日期
            },
            sellCalendar: {
                systemTime: '', // 系统当前时间
                latestTradingDay: '', // 最近工作日
                confirmTime: '', // 确认时间
                profitLossTime: '', // 查看盈亏日期
                arrivalTime: '', // 到账日期
                settlementDay: '', // 用户结算日
                redeemSettlementDay: '', // 赎回结算日
                cutOffTime: '', // cutofftime截止日期
                redeemCutOffTime: '', // 赎回截止日期
            },
        }
    },
    computed: {
        isCurrency() {
            return this.$route.query.fundType === '4'
        },
        isPublic() {
            return this.$route.query.type === 'public'
        },
        isPrivate() {
            return this.$route.query.type === 'private'
        },
        isBuy() {
            return this.active === 'buy'
        },
        isSell() {
            return this.active === 'sell'
        },
        symbol() {
            return this.$route.query.symbol
        },
        calendar() {
            const direction = this.isBuy ? 'buy' : 'sell'
            const key = `${direction}Calendar`
            return this[key] || {}
        },
        stepList() {
            const direction = this.isBuy ? 'buy' : 'sell'
            const key = `${direction}Calendar`
            const buyTime = this.calendar?.cutOffTime || '09:45'
            const redeemTime = this.calendar?.redeemCutOffTime || '13:00'
            const time = this.isBuy ? buyTime : redeemTime
            return getTradeRuleCalendar(this[key], direction, this.$t.bind(this), {
                isCurrency: this.isCurrency,
                showTradeDate: true,
                freezeSuffix: true,
                redeemMoney: this.isSellDisplayMoney,
                time: time,
            })
        },
        descTitle() {
            return this.isBuy ? this.$t('subscribeProcess') : this.$t('redeemProcess')
        },
        // 卖出金额
        isSellDisplayMoney() {
            return this.ruleInfo.sellDisplayType === 2
        },
        desc() {
            const time = this.calendar?.cutOffTime || '09:45'
            const redeemTime = this.calendar?.redeemCutOffTime || '13:00'
            if (this.isBuy) {
                return {
                    text1: this.$t('subscribeDescText1', { time: time }),
                    text2: this.$t('subscribeDescText2', { time: time }),
                }
            }
            return {
                text1: this.$t('redeemDescText1', { time: redeemTime }),
                text2: this.$t('redeemDescText2', { time: redeemTime }),
            }
        },
        contentList() {
            const minRedemption = this.isSellDisplayMoney ? this.ruleInfo.minRedemption : this.ruleInfo.minRedemptionShare
            const sellUnit = this.isSellDisplayMoney ? currencyFilter(this.ruleInfo.currency) : this.$t('trade.part')
            return {
                buyList: [
                    {
                        label: this.$t('startAmount'),
                        value: this.ruleInfo.minInitial || '--',
                        config: () => `${thousandFilter(this.ruleInfo.minInitial || '')}${currencyFilter(this.ruleInfo.currency) || ''}`,
                    },
                    {
                        label: this.$t('subscribeFee'),
                        config: () => this.ruleInfo.buyRate,
                        desc: [this.$t('subscribeFeeDesc1'), this.$t('subscribeFeeDesc2')],
                    },
                    // { label: this.$t('subscribeStatus'), value: this.$t('canSubscribe') },
                ],
                sellList: [
                    {
                        label: this.$t('minRedeem'),
                        value: minRedemption,
                        config: () => `${thousandFilter(minRedemption || '')}${sellUnit || ''}`,
                    },
                    { label: this.$t('redeemFee'), config: () => this.ruleInfo.sellRate },
                    // { label: this.$t('redeemStatus'), value: this.$t('canRedeem') },
                ],
                costList: [
                    { label: this.$t('managerFee'), value: this.ruleInfo.managerFee || '--' },
                    { label: this.$t('storageFee'), value: this.ruleInfo.storageFee, hidden: this.isPrivate || '--' },
                    { label: this.$t('buyRate'), value: this.ruleInfo.buyRate, hidden: this.isPublic || '--' },
                    { label: this.$t('performanceFee'), value: this.ruleInfo.performanceFee || '--' },
                    { label: this.$t('otherFee'), value: this.ruleInfo.otherFee || '--' },
                ],
            }
        },
    },
    created() {
        this.getFundTradingRule()
        this.getOrderCalendar(1)
        this.getOrderCalendar(2)
    },
    methods: {
        async getFundTradingRule() {
            try {
                const res = await getFundTradingRule({ symbol: this.symbol })
                if (res.result && res.result.tradingRule) {
                    Object.keys(this.ruleInfo).forEach(key => {
                        this.ruleInfo[key] = res.result.tradingRule[key]
                    })
                }
            } catch (e) {
                console.log('getFundTradingRule=>e:', e)
            }
        },

        // 公募基金订单日历接口
        async getOrderCalendar(type = 1) {
            try {
                const { result = {} } = await orderCalendar({
                    symbol: this.symbol,
                    direction: type, // 1： 买入， 2： 卖出
                })
                const direction = type === 1 ? 'buy' : 'sell'
                this[`${direction}Calendar`].systemTime = result?.systemTime ?? ''
                this[`${direction}Calendar`].latestTradingDay = result?.latestTradingDay ?? ''
                this[`${direction}Calendar`].confirmTime = result?.confirmTime ?? ''
                this[`${direction}Calendar`].profitLossTime = result?.profitLossTime ?? ''
                this[`${direction}Calendar`].arrivalTime = result?.arrivalTime ?? ''
                this[`${direction}Calendar`].settlementDay = result?.settlementDay ?? ''
                this[`${direction}Calendar`].redeemSettlementDay = result?.redeemSettlementDay ?? ''
                this[`${direction}Calendar`].cutOffTime = result?.cutOffTime ?? ''
                this[`${direction}Calendar`].redeemCutOffTime = result?.redeemCutOffTime ?? ''
            } catch (e) {
                console.error('orderCalendar===>error:', e)
            }
        },
    },
}
</script>
<style scoped lang="less">
/deep/ .van-tabs__wrap {
    .van-tabs__nav {
        background-color: #f9f9f9;
    }

    .van-tabs__line {
        width: 0;
        height: 0;
    }

    .van-tab__text {
        align-items: center;
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }

    .van-tab--active {
        .van-tab__text {
            color: #1f1f1f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }
    }
}
</style>
<style lang="less" scoped>
.rule {
    width: 100%;
    height: 100%;
}

.rule-tabs {
    padding: 0 12px;
}

.tab-content {
    padding: 8px 0;
    background: #fff;
    border-radius: 8px;

    .content-item {
        padding: 10px 12px;

        &__main {
            display: flex;
            justify-content: space-between;
        }

        & .label {
            color: #666;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        & .value {
            max-width: 177px;
            color: #1f1f1f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: right;
        }
    }

    .value-desc {
        position: relative;
        margin-top: 10px;
        padding: 12px;
        color: @fontBlackColor;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        text-align: left;
        background-color: @bgGreyColor;
        border-radius: 8px;

        .arrow {
            position: absolute;
            top: -8px;
            left: 20px;
            width: 16px;
            height: 8px;
        }
    }
}

.rule-desc {
    margin-top: 12px;
    padding: 15px 12px 24px;
    background: #fff;
    border-radius: 8px;

    .desc-title {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    .desc-step {
        padding: 32px 6px 24px;
    }

    .desc-text {
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
    }
}

.explain {
    margin-top: 24px;
    padding: 0 4px 24px;
    color: #666;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
}
</style>
