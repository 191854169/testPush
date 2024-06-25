<template>
    <div class="rule" id="trade-rule">
        <h3 class="title">{{ $t('tradeRule') }}</h3>
        <div class="rule-tabs">
            <fosun-tabs v-model="active" circle>
                <van-tab class="tab-content" v-for="item in tabs" :key="item.key" :title="item.label" :name="item.key">
                    <div class="content-item" v-for="(i, index) in contentList[`${item.key}List`]" :key="index" v-show="i.hidden !== true">
                        <div class="label">{{ i.label }}</div>
                        <div class="value">{{ i.config ? i.config() : i.value }}</div>
                    </div>
                </van-tab>
            </fosun-tabs>
        </div>
    </div>
</template>
<script>
import { getFundTradingRule } from '@/apis/fund/fund'
import FosunTabs from '@/components/FosunTabs.vue'
import { Tab } from 'vant'
import { milliFormat } from '../../../../utils'
import { currencyFilter } from '@/config/filters'
export default {
    name: 'rule',
    components: {
        FosunTabs,
        [Tab.name]: Tab,
    },
    data() {
        return {
            active: 'buy',
            ruleInfo: {
                minInitial: '', // 起投金额
                buyRate: '', // 买入费率
                minRedemption: '', // 最小赎回
                sellRate: '', // 赎回费率
                managerFee: '', // 管理费
                storageFee: '', // 托管费 !仅公募
                performanceFee: '', // 表现费
                otherFee: '', // 其他费用
                currency: '',
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
        }
    },
    filters: {
        currencyFilter,
    },
    computed: {
        isPublic() {
            return this.$route.query.type === 'public'
        },
        isPrivate() {
            return this.$route.query.type === 'private'
        },
        symbol() {
            return this.$route.query.symbol
        },
        stepList() {
            if (this.isBuy) {
                return [
                    { key: '1', label: this.$t('subscribeSubmit') },
                    { key: '2', label: this.$t('confirmShare') },
                    { key: '3', label: this.$t('firstProfitCome') },
                ]
            }
            return [
                { key: '1', label: this.$t('redeemSubmit') },
                { key: '2', label: this.$t('confirmShare') },
                { key: '3', label: this.$t('redeemCome') },
            ]
        },
        contentList() {
            return {
                buyList: [
                    {
                        label: this.$t('startAmount'),
                        value: this.ruleInfo.minInitial,
                        config: () => `${milliFormat(this.ruleInfo.minInitial || '')}${currencyFilter(this.ruleInfo.currency)}`,
                    },
                    { label: this.$t('subscribeFee'), config: () => this.ruleInfo.buyRate },
                    // { label: this.$t('subscribeStatus'), value: this.$t('canSubscribe') },
                ],
                sellList: [
                    {
                        label: this.$t('minRedeem'),
                        value: this.ruleInfo.minRedemption,
                        config: () => `${milliFormat(this.ruleInfo.minRedemption || '')}${currencyFilter(this.ruleInfo.currency)}`,
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
    margin: 12px 12px 24px;
    padding: 8px 12px 0;
    background: #fff;
    border-radius: 8px;

    .title {
        padding: 7px 0 15px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }
}

.tab-content {
    padding-bottom: 12px;
    background: #fff;
    border-radius: 8px;

    .content-item {
        display: flex;
        padding-top: 12px;

        & .label {
            flex: 0 0 auto;
            width: 82px;
            margin-right: 16px;
            color: #666;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
        }

        & .value {
            color: #1f1f1f;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            text-align: left;
        }
    }
}
</style>
