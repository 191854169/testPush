<template>
    <div class="page">
        <div class="card">
            <div class="title">
                <div class="type">{{ record.businessTypeStr }}</div>
                <div class="amount">{{ record.amount }}</div>
            </div>

            <div v-for="item in rowData" :key="item.key" class="row">
                <div class="name">{{ item.name }}</div>
                <div class="value">{{ item.value }}</div>
            </div>

            <div class="flow-number">
                <div class="name">{{ $t('flow') }}</div>
                <div class="value">{{ record.flowId }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { CURRENCY_MAP } from '../config/common'
import { i18n } from '@/i18n/commonOutside/index.js'

const rowConfig = [
    {
        name: i18n.t('createTime'),
        key: 'tradeDate',
    },
    {
        name: i18n.t('nameAndCode2'),
        key: 'stock',
    },
    {
        name: i18n.t('currency'),
        key: 'currency',
    },
    {
        name: i18n.t('wealthAccount'),
        key: 'subAccountId',
    },
    {
        name: i18n.t('businessType'),
        key: 'businessTypeStr',
    },
    {
        name: i18n.t('remark'),
        key: 'remark',
    },
]

export default {
    components: {},
    props: {},
    data() {
        return {
            record: {},
            rowData: [],
        }
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {
        this.initData()
    },
    methods: {
        initData() {
            if (!this.$route.params.flowDetail) {
                this.$router.replace('/flow')
            } else {
                this.record = {
                    ...this.$route.params.flowDetail,
                    amount: this.amountFormatter(this.$route.params.flowDetail.amount),
                }
                const rowData = []
                const { stockCode, stockName } = this.record
                if (stockCode || stockName) {
                    this.$set(this.record, 'stock', `${this.record.stockCode} ${this.record.stockName}(待产品确认：是否需要跳转)`)
                }

                rowConfig.forEach(item => {
                    if (!this.record[item.key]) return

                    let value = this.record[item.key]

                    if (item.key === 'currency') {
                        value = CURRENCY_MAP[this.record.currency]
                    }

                    rowData.push({
                        name: item.name,
                        value,
                    })
                })
                this.rowData = rowData
            }
        },

        amountFormatter(amount) {
            const [int, fraction] = `${amount}`.split('.')
            const value = `${int.replace(/(\d)(?=(\d{3})+$)/g, '$1,')}${fraction ? '.' + fraction : ''}`
            if (!/^-/.test(value)) return `+${value}`
            return value
        },
    },
}
</script>
<style scoped lang="less">
.page {
    padding: 12px;
}

.card {
    width: 351px;
    padding: 33px 12px 12px;
    background-color: #fff;
    border-radius: 5px;

    .title {
        margin-bottom: 28px;
        text-align: center;

        .type {
            color: @fontLightColor;
            font-size: 14px;
            line-height: 20px;
        }

        .amount {
            margin-top: 4px;
            color: @fontBlackColor;
            font-size: 32px;
            line-height: 44px;
        }
    }

    .flow-number,
    .row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        line-height: 20px;

        .name {
            flex-shrink: 0;
            color: @fontLightColor;
        }

        .value {
            width: 196px;
            color: @fontBlackColor;
            text-align: right;
        }
    }

    .flow-number {
        padding-top: 12px;
        border-top: 1px #efefef solid;
    }
}
</style>
