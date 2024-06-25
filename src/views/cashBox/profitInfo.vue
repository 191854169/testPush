<template>
    <div class="profit-info">
        <section class="header">
            <asset-total
                class="total"
                :asset-msg="headerMsg"
                :showEye="false"
                :currency="currency"
                @choose="currencyChooseHandler"
                :amount="dayProfitloss"
            ></asset-total>
        </section>
        <section class="content">
            <h3>{{ $t('profitInfo') }}</h3>
            <ul>
                <li v-for="(item, index) in list" :key="index">
                    <div class="left">
                        <p class="name">{{ item.fundName }}</p>
                        <div class="more-info">
                            <div class="currency" :class="[`currency-${item.currency}`]"></div>
                            <p class="isin">ISIN:{{ item.isin }}</p>
                        </div>
                    </div>
                    <div class="right" v-riseFall="{ value: item.profitloss, rate: false, thousand: true }"></div>
                </li>
            </ul>
        </section>
        <section class="footer">
            <h4>{{ $t('updateDataDeclare') }}</h4>
            <p>{{ $t('updateDataDecText') }}</p>
        </section>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import { currencyMap } from '@/config/common'
import { ecashProfitLossDetail } from '@/apis/wealth/index'
import AssetTotal from '@/components/AssetTotal.vue'

const currencyKeyMap = currencyMap.keyValueMap

export default {
    name: 'profit-info',
    components: {
        AssetTotal,
    },
    filters: {
        currencyFilter(v) {
            return currencyKeyMap[v] || ''
        },
        dateFilter(v) {
            return dayjs(v).format('YYYY/MM/DD')
        },
    },
    data() {
        return {
            date: this.$route.query.date || '',
            account: this.$route.query.accountType || '',
            currency: this.$route.query.currency || 'HKD',
            info: {
                cnh: {}, // dayProfitloss: '', list: []
                hkd: {},
                usd: {},
            },
        }
    },
    computed: {
        headerMsg() {
            return `${dayjs(this.date).format('YYYY/MM/DD')}收益`
        },
        dayProfitloss() {
            return this.info[`${this.currency.toLowerCase()}`].dayProfitloss || ''
        },
        list() {
            return this.info[`${this.currency.toLowerCase()}`].list || []
        },
    },
    created() {
        this.getDetail()
    },
    methods: {
        async getDetail() {
            try {
                const { result = {} } = await ecashProfitLossDetail({ date: this.date, account: this.account })
                this.info = result
            } catch (e) {
                console.log('===>e:', e)
            }
        },
        // 选择币种
        currencyChooseHandler(currency) {
            this.currency = currency
        },
    },
}
</script>
<style scoped lang="less">
.profit-info {
    min-height: 100%;
    padding: 12px;
    background-color: #f9f9f9;

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #fff;
        border-radius: 8px;

        &-top {
            display: flex;
            align-items: center;

            p {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }

            img {
                width: 16px;
                height: 16px;
                margin-left: 16px;
            }
        }

        &-bottom {
            margin-top: 6px;

            p {
                font-weight: 600;
                font-size: 24px;
                line-height: 34px;
            }
        }
    }

    .content {
        margin-top: 12px;
        padding: 12px 12px 0;
        background-color: #fff;
        border-radius: 8px;

        h3 {
            margin-bottom: 12px;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
            line-height: 22px;
        }

        ul {
            li {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 9px 0;
                border-bottom: 0.5px solid #efefef;

                & .left {
                    display: flex;
                    flex-direction: column;

                    .name {
                        margin-bottom: 2px;
                        color: #2f2f2f;
                        font-weight: 400;
                        font-size: 16px;
                        line-height: 22px;
                    }

                    .more-info {
                        display: flex;
                        align-items: center;

                        .currency {
                            margin-right: 5px;
                        }

                        .isin {
                            color: #9c9c9c;
                            font-weight: 400;
                            font-size: 10px;
                            line-height: 14px;
                        }
                    }
                }
            }

            li:last-of-type {
                border-bottom-width: 0;
            }
        }
    }

    .footer {
        padding-top: 32px;

        h4 {
            margin-bottom: 8px;
            color: #9c9c9c;
            font-weight: 500;
            font-size: 12px;
            line-height: 16px;
        }

        p {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 18px;
            text-align: justify;
        }
    }
}
</style>
