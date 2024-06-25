<template>
    <div class="latest-profit">
        <div class="total">
            <h4>
                <currency-choose v-model="showCurrencyChoose" @on-currency-chage="onCurrencyChange">
                    <span slot="prefix">
                        {{ profitlossDate | profitlossDateFilter }}{{ $t('latestProfit') }}({{ totalProfitLoss.currency | currencyFilter }})
                    </span>
                    <multi-img slot="suffix" :name="iconEye" directory="fund" @click.stop="onHideAmountClick"></multi-img>
                </currency-choose>
            </h4>
            <h3>
                <span v-riseFall="{ value: totalProfitLoss.amount || '--', rate: false, thousand: true, normal: true, hide: !amountStatus }"></span>
            </h3>
        </div>
        <div class="list">
            <div class="title">
                <div class="left">{{ $t('shouyijilu') }}</div>
            </div>
            <empty v-if="!list.length" showImg></empty>
            <Table
                v-else
                :data="list"
                :columns="columns"
                @rowClick="rowClick"
                @refresh="refresh"
                :canPullUp="false"
                :showLoadingOver="false"
                :showEmptyTip="false"
                border
            >
                <template v-slot:detail="{ item }">
                    <div class="detail">
                        <div class="top">
                            <div class="name line-elipsis">{{ item.productName }}</div>
                        </div>
                        <div class="bottom">
                            <div :class="`currency-${item.productCurrency}`"></div>
                            <div class="isin">{{ item.isin }}</div>
                        </div>
                    </div>
                </template>
                <template v-slot:profit="{ item }">
                    <div v-riseFall="{ value: item.profitloss, rate: false, thousand: true, hide: !amountStatus }"></div>
                </template>
            </Table>
        </div>

        <div class="data-source-tip">
            <p class="title">{{ $t('updateDataDeclare') }}</p>
            <p class="content">{{ $t('updateDataDecText') }}</p>
        </div>
    </div>
</template>
<script>
import { getLatestProfitLossDetail } from '@/apis/wealth/index.js'
import dayjs from 'dayjs'
import Table from '@/components/Table.vue'
import Empty from '@/components/Empty.vue'
import CurrencyChoose from '@/components/CurrencyChoose.vue'
import { CURRENCY_MAP, WEALTH_AMOUNT_STATUS_kEY } from '@/config/common'

export default {
    name: 'latest-profit',
    components: { Table, Empty, CurrencyChoose },
    data() {
        return {
            loading: false,
            finished: false,
            show: false,
            fundName: '',
            fundArr: [],
            list: [],
            products: [],
            totalProfitLoss: { amount: '', currency: '' },
            hasInit: false,
            amountStatus: true, // 是否显示资产
            amountStatusKey: WEALTH_AMOUNT_STATUS_kEY,
            profitlossDate: '',
            showCurrencyChoose: false,
            currency: 'HKD',
            accountType: this.$route.query.accountType || 'ALL',
        }
    },
    computed: {
        columns() {
            return [
                {
                    key: 'detail',
                    title: this.$t('detailText'),
                    slot: true,
                },
                {
                    key: 'profit',
                    title: this.$t('profit'),
                    slot: true,
                },
            ]
        },
        iconEye() {
            return this.amountStatus ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
    },
    filters: {
        profitlossDateFilter(v) {
            return v ? v.replace(/-/g, '/') : ''
        },
        currencyFilter(v) {
            return CURRENCY_MAP.options.findLabel(v, '--')
        },
    },
    created() {
        this.currency = this.accountType === 'ALL' ? 'HKD' : this.accountType
    },
    async mounted() {
        if (this.$route.query && this.$route.query.productCode) {
            this.products = [this.$route.query.productCode]
            this.fundName = this.$route.query.fundName
        } else {
            this.fundName = this.$t('allFund')
        }
        this.getList()
        this.setAmountStatus()
    },
    methods: {
        async setAmountStatus() {
            if (this.$jsBridge) {
                const data = await this.$jsBridge.getAssetsShowStatus()
                this.amountStatus = data
            } else {
                try {
                    this.amountStatus = JSON.parse(localStorage.getItem(this.amountStatusKey))
                } catch (e) {
                    this.amountStatus = true
                    localStorage.setItem(this.amountStatusKey, JSON.stringify(this.amountStatus))
                }
            }
        },
        formateDay(date) {
            return dayjs(date).format('YYYY/MM/DD')
        },
        showSelect(e, data) {
            try {
                const { type } = e.target.dataset || {}
                if (!type) return
                const methodName = `${type}Selector`
                this[methodName] && this[methodName](data)
            } catch (e) {
                console.error(e)
            }
        },
        assetSelector() {
            this.showAssetType = true
        },
        accountSelector() {
            this.showAccountChoose = true
        },
        dateSelector() {
            this.$refs.datePickerRef.show()
        },
        select(item) {
            if (item.productCode) {
                this.fundName = item.name
                this.products = [item.productCode]
                this.$router.replace({
                    name: 'profit',
                    query: {
                        productCode: item.productCode,
                        fundName: item.name,
                    },
                })
            } else {
                this.fundName = this.$t('allFund')
                this.products = []
                this.$router.replace({
                    name: 'profit',
                })
            }
            this.getList()
        },
        async getList() {
            try {
                this.$store.commit('app/updateShowLoading', true)
                const { result: res } = await getLatestProfitLossDetail({
                    offset: 0,
                    count: 999,
                    toCurrency: this.currency,
                    account: this.accountType,
                })
                this.$store.commit('app/updateShowLoading', false)
                let { list } = res || {}
                list = list || []
                this.list = list
                Object.assign(this.totalProfitLoss, { amount: res?.profitloss || '--', currency: res?.currency })
                this.profitlossDate = res?.profitlossDate
            } catch (e) {
                this.$store.commit('app/updateShowLoading', false)
                console.error(e)
            } finally {
                this.hasInit = true
            }
        },
        rowClick() {},
        refresh() {},

        onAccountChoose(value) {
            this.accountType = value
        },

        onAssetTypeChange(value) {
            this.assetType = value
        },

        onDateChange(data) {
            console.log(`Feng.chen:: 14:33:42 data ===> `, data)
        },

        onHideAmountClick() {
            this.amountStatus = !this.amountStatus
            if (this.$jsBridge) {
                this.$jsBridge.setAssetsShowStatus({ showAssets: this.amountStatus })
            } else {
                localStorage.setItem(this.amountStatusKey, JSON.stringify(this.amountStatus))
            }
        },

        onCurrencyChange(currency) {
            this.list = []
            this.currency = currency
            this.getList()
        },
    },
}
</script>
<style lang="less">
body {
    background: #f9f9f9;
}
</style>
<style scoped lang="less">
.latest-profit {
    padding-bottom: 12px;
    overflow: auto;
    background: #f9f9f9;

    .total {
        margin: 12px;
        padding: 16px 0;
        text-align: center;
        background: #fff;
        border-radius: 8px;

        h4 {
            display: flex;
            align-items: center;
            justify-content: center;
            color: @fontLightColor;
            font-size: 14px;
            line-height: 20px;

            img {
                width: 16px;
                margin-left: 16px;
            }

            .trigger {
                width: 6px;
                height: 4px;
                margin-left: 4px;
            }
        }

        h3 {
            margin: 0;
            margin-top: 4px;
            color: #000;
            font-weight: 700;
            font-size: 24px;
            line-height: 34px;
        }
    }

    .list {
        margin: 12px;
        padding: 15px 12px 0;
        background: #fff;
        border-radius: 8px;

        .title {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 15px;

            .left {
                font-weight: 700;
                font-size: 15px;
                line-height: 21px;
            }

            .right {
                color: #9c9c9c;
                font-size: 12px;
                line-height: 16px;
            }
        }

        /deep/ .content {
            .fixed {
                flex: 0 0 168px;
                width: auto;

                &-body {
                    .item:last-child {
                        &::after {
                            display: none;
                        }
                    }
                }
            }

            .scroll {
                .body {
                    .row:last-child {
                        .item {
                            &::after {
                                display: none;
                            }
                        }
                    }
                }
            }
        }

        /deep/ .detail {
            width: 168px;

            .name {
                color: @fontBlackColor;
                font-size: 16px;
                line-height: 22px;
            }

            .bottom {
                display: flex;
                align-items: center;
                margin-top: 2px;

                .isin {
                    margin-left: 4px;
                    color: #9c9c9c;
                    font-size: 10px;
                    line-height: 14px;
                }
            }
        }

        /deep/ .scroll-title-container {
            left: 168px;

            .titleItem {
                &:nth-child(1) {
                    flex: 1 0 70px;
                }

                &:nth-child(2) {
                    flex: 0 0 77px;
                }
            }
        }

        /deep/ .body {
            .item {
                justify-content: space-between;

                &:nth-child(1) {
                    flex: 1 0 70px;
                    align-items: flex-end;
                    justify-content: center;

                    & > div {
                        width: 70px;
                        text-align: right;
                    }
                }

                &:nth-child(2) {
                    flex: 0 0 77px;
                    align-items: flex-end;
                    justify-content: center;
                    color: @fontLightColor;
                }
            }
        }
    }

    .data-source-tip {
        margin: 32px 16px 16px;

        .title {
            color: #9c9c9c;
            font-weight: 500;
            font-size: 12px;
            line-height: 16px;
        }

        .content {
            margin-top: 8px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 18px;
        }
    }
}
</style>
