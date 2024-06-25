<template>
    <div class="hold-card mask" :class="{ border: showBorder }">
        <div class="base-info">
            <span :class="`currency-${data.productCurrency}`"></span>
            <span class="name line-elipsis">{{ data.productName }}</span>
            <span class="order-count" v-if="showDoingOrder">{{ $t('doingOrder', { num: data.numOfOrdersInProcessing }) }}</span>
        </div>
        <div class="hold-detail">
            <ul>
                <li v-for="item in columns" :key="item.key">
                    <template>
                        <p v-if="item.key === 'yesterdayProfitloss'" class="label">
                            {{ item.label }}
                            {{ item.yesterdayProfitlossDate | lossDateFilter }}
                        </p>
                        <p v-else class="label">{{ item.label }}</p>
                    </template>
                    <p class="value profit-with-rate" v-if="item.profitWithRate">
                        <span
                            class="profit"
                            v-riseFall="{ value: item.profitloss, thousand: true, normal: false, rate: false, hide: showAmountStatus }"
                        ></span>
                        <span
                            class="rate"
                            v-riseFall="{ value: item.profitlossRate, thousand: true, normal: false, rate: true, hide: showAmountStatus }"
                        ></span>
                    </p>
                    <p
                        class="value"
                        v-else-if="item.riseFall"
                        v-riseFall="{ value: item.value, thousand: true, normal: false, ...item.riseFall, hide: showAmountStatus }"
                    ></p>
                    <p class="value" :hide="showAmountStatus" v-else-if="item.normal">{{ showAmountStatus ? '****' : item.value }}</p>
                    <p class="value" v-else v-hide="{ value: item.value, normal: true, hide: showAmountStatus }"></p>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import dayjs from 'dayjs'
export default {
    name: 'hold-card',
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        // 是否展示金额数据
        showAmountStatus: {
            type: Boolean,
            default: false,
        },
        // 是否展示border
        showBorder: {
            type: Boolean,
            default: false,
        },
        // 是否展示进行中订单数量
        showOrdering: {
            type: Boolean,
            default: false,
        },
        assetType: {
            type: String,
            required: true,
        },
        // 是否是清仓产品页
        isNoHolding: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        fundColumns() {
            let res = []
            res = [
                {
                    key: 'assets',
                    label: this.$t('holdlingAmount'),
                },
                {
                    key: 'yesterdayProfitloss',
                    label: this.$t('yesterdayProfit'), // 最新收益
                    riseFall: {
                        rate: false,
                    },
                },
                {
                    key: 'profitloss',
                    label: this.$t('holdProfitWithRate'),
                    profitWithRate: true,
                },
            ]

            res.forEach(i => {
                if (i.profitWithRate) {
                    i.profitloss = this.data.profitloss
                    i.profitlossRate = this.data.profitlossRate
                }
                if (i.key === 'yesterdayProfitloss') {
                    i.value = this.data[i.key] || '--'
                    i.yesterdayProfitloss = this.data.yesterdayProfitloss
                    i.yesterdayProfitlossDate = this.data.yesterdayProfitlossDate
                } else {
                    i.value = this.data[i.key] || '--'
                }
            })
            return res
        },
        bondColumns() {
            const res = [
                {
                    key: 'assets',
                    label: this.$t('holdlingAmount'),
                },
                {
                    key: 'yesterdayProfitloss',
                    label: this.$t('yesterdayProfit'), // 最新收益
                    riseFall: {
                        rate: false,
                    },
                },
                {
                    key: 'profitloss',
                    label: this.$t('holdProfitWithRate'),
                    riseFall: {
                        rate: false,
                    },
                    profitWithRate: true,
                },
            ]
            res.forEach(i => {
                if (i.profitWithRate) {
                    i.profitloss = this.data.profitloss
                    i.profitlossRate = this.data.profitlossRate
                }
                if (i.key === 'yesterdayProfitloss') {
                    i.value = this.data[i.key] || '--'
                    i.yesterdayProfitloss = this.data.yesterdayProfitloss
                    i.yesterdayProfitlossDate = this.data.yesterdayProfitlossDate
                } else {
                    i.value = this.data[i.key] || '--'
                }
            })
            return res
        },
        alterInvestmentColumns() {
            let res = []
            if (this.isNoHolding) {
                res = [
                    // {
                    //     key: 'assets',
                    //     label: this.$t('holdlingAmount'), // 持有金额
                    // },
                    {
                        key: 'productMaturityDate',
                        label: this.$t('maturityDate'), // 到期日期
                        format: v => (v ? dayjs(v).format('YYYY/MM/DD') : '--'),
                        normal: true,
                    },
                    {
                        key: 'accumulatedProfitloss',
                        label: this.$t('accumulatedProfit'), // 累计收益
                    },
                ]
            } else {
                res = [
                    {
                        key: 'assets',
                        label: this.$t('holdlingAmount'), // 持有金额
                    },
                    {
                        key: 'leftDays',
                        label: this.$t('leftDays'), // 距离到期
                        format: v => {
                            if (v) {
                                if (Number(v) <= 0) {
                                    return `0${this.$t('day')}`
                                }
                                return `${v}${this.$t('day')}`
                            }
                            return '--'
                        },
                    },
                ]
                if (!this.isFCN && !this.isMarketingBill) {
                    res.push({
                        key: 'estimateProfitloss',
                        label: this.$t('estimateProfitloss'), // 估算收益
                        riseFall: {
                            rate: false,
                        },
                    })
                }
            }
            res.forEach(i => {
                let value = this.data?.[i.key] || ''
                if (i.format) {
                    value = i.format(value)
                }
                i.value = value || '--'
            })
            return res
        },
        columns() {
            if (this.assetType === 'bond') return this.bondColumns
            if (this.assetType === 'alterInvestment') return this.alterInvestmentColumns
            return this.fundColumns
        },

        showDoingOrder() {
            return this.showOrdering && !!Number(this.data.numOfOrdersInProcessing)
        },

        isFCN() {
            return this.data.noteProperty === 3
        },

        isMarketingBill() {
            return this.data.noteProperty === 4
        },
    },
    filters: {
        lossDateFilter(v) {
            return v ? `(${dayjs(v).format('MM/DD')})` : ''
        },
    },
}
</script>

<style scoped lang="less">
.hold-card {
    position: relative;
    padding: 16px 12px 12px;
    background: #fff;

    .base-info {
        display: flex;
        align-items: center;

        .name {
            flex: 1 0 211px;
            margin: 0 0 0 5px;
            color: @fontBlackColor;
            font-weight: 600;
            font-size: 16px;
            line-height: 22px;
        }

        .order-count {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: flex-end;
            padding: 2px 4px;
            color: @fontLightColor;
            font-size: 10px;
            line-height: 16px;
            background: #f9f9f9;
            border-radius: 4px;
        }
    }

    .hold-detail {
        ul {
            display: flex;
            padding: 12px 0 40px;

            li {
                position: relative;
                flex: 0 0 98px;

                &:nth-of-type(1) {
                    text-align: left;
                }

                &:nth-of-type(2) {
                    margin-left: 17px;
                    text-align: center;

                    .value {
                        left: 50%;
                        transform: translateX(-50%);
                    }
                }

                &:nth-of-type(3) {
                    margin-left: 17px;
                    text-align: right;

                    .value {
                        right: 0;
                    }
                }

                .label {
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }

                .value {
                    position: absolute;
                    margin-top: 12px;
                    color: @fontBlackColor;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 20px;

                    &.profit-with-rate {
                        display: flex;
                        flex-direction: column;
                        margin-top: 4px;
                        font-weight: 700;

                        .rate {
                            font-size: 12px;
                            line-height: 16px;
                        }
                    }
                }

                .value[hide] {
                    color: rgb(102, 102, 102);
                }
            }
        }
    }

    &.border {
        position: relative;

        &::before {
            position: absolute;
            right: 12px;
            bottom: 0;
            left: 12px;
            height: 1px;
            background: #efefef;
            transform: scaleY(0.5);
            content: '';
        }
    }
}
</style>
