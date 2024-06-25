<template>
    <div class="no-hoold-product">
        <div class="selectBox" @click="showSelect">
            <div class="account-type mask" data-type="account">
                <div class="left">{{ accountType | accountTypeFilter }}</div>
                <multi-img :name="'down'" directory="common" class="icon"></multi-img>
            </div>
        </div>
        <div class="total">
            <h4>
                <currency-choose v-model="showCurrencyChoose" @on-currency-chage="onCurrencyChange">
                    <span slot="prefix">{{ $t('accumulatedProfit') }}({{ currency | currencyFilter }})</span>
                    <multi-img slot="suffix" :name="iconEye" directory="fund" @click.stop="onHideAmountClick"></multi-img>
                </currency-choose>
            </h4>
            <h3>
                <span
                    v-riseFall="{
                        value: totalProfitLoss.amount || '--',
                        rate: false,
                        thousand: true,
                        normal: true,
                        hide: !amountStatus,
                        hideObj: { text: '*****', color: '#2f2f2f' },
                    }"
                ></span>
            </h3>
        </div>
        <div class="list">
            <div class="title">
                <div class="left">{{ $t('alreadyClearance') }}{{ list.length ? `(${list.length})` : '' }}</div>
            </div>
            <empty v-if="!list.length" showImg class="outter-empty"></empty>
            <template v-else>
                <div v-if="isFundOrBond" class="public-bond">
                    <header>
                        <span>{{ $t('productName') }}</span>
                        <span>{{ $t('accumulatedProfit') }}</span>
                    </header>
                    <ul class="public-bond__list" @click="onHoldingContentClick">
                        <li
                            v-for="(item, idx) in list"
                            :key="idx"
                            :data-currency="item.productCurrency"
                            :data-symbol="item.symbol"
                            :data-billsymbol="item.productParentSymbol"
                        >
                            <span :class="`currency-${item.productCurrency}`"></span>
                            <span class="name line-elipsis">{{ item.productName }}</span>
                            <span
                                class="profit-loss"
                                v-riseFall="{
                                    value: item.accumulatedProfitloss,
                                    thousand: true,
                                    normal: true,
                                    normal: true,
                                    rate: false,
                                    hide: !amountStatus,
                                }"
                            ></span>
                        </li>
                    </ul>
                </div>
                <div v-else @click="onHoldingContentClick">
                    <hold-card
                        v-for="(item, idx) in list"
                        :key="idx"
                        class="outter-hold-card"
                        isNoHolding
                        :showAmountStatus="!amountStatus"
                        :assetType="assetType"
                        :data="item"
                        :data-currency="item.productCurrency"
                        :data-symbol="item.symbol"
                        :data-billsymbol="item.productParentSymbol"
                    ></hold-card>
                </div>
            </template>
        </div>
        <account-choose v-model="showAccountChoose" :type="accountType" @choose="onAccountChoose"></account-choose>
    </div>
</template>
<script>
import { getCleanHoldings } from '@/apis/wealth/index.js'
import dayjs from 'dayjs'
import Empty from '@/components/Empty.vue'
import HoldCard from './components/HoldCard.vue'
import AccountChoose from '@/components/AccountChoose.vue'
import { WEALTH_ACCOUNT_MAP } from '@/config/common'
import { ASSET_TYPE_MAP, CURRENCY_MAP } from './config/common'
import CurrencyChoose from '@/components/CurrencyChoose.vue'
export default {
    name: 'no-hoold-product',
    components: { Empty, HoldCard, AccountChoose, CurrencyChoose },
    data() {
        return {
            loading: false,
            finished: false,
            show: false,
            fundArr: [],
            list: [],
            totalProfitLoss: { amount: '', currency: '' },
            hasInit: false,
            amountStatus: true, // 是否显示资产
            showAccountChoose: false,
            accountType: this.$route.query.accountType || WEALTH_ACCOUNT_MAP.keysMap.allAccount,
            currency: 'HKD',
            showCurrencyChoose: false,
        }
    },
    computed: {
        isFundOrBond() {
            return ['publicFund', 'privateFund', 'bond'].includes(this.assetType)
        },
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
                {
                    key: 'status',
                    title: this.$t('updateStatus'),
                    slot: true,
                },
            ]
        },
        iconEye() {
            return this.amountStatus ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },

        assetType() {
            return this.$route.query.assetType
        },
    },
    filters: {
        accountTypeFilter(v) {
            return WEALTH_ACCOUNT_MAP.options.findLabel(v, '--')
        },
        currencyFilter(v) {
            return CURRENCY_MAP.options.findLabel(v, '--')
        },
    },
    created() {
        this.currency = this.accountType === WEALTH_ACCOUNT_MAP.keysMap.allAccount ? CURRENCY_MAP.keysMap.HKD : this.accountType
    },
    async mounted() {
        this.getList()
        await this.setAmountStatus()
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
        async getList() {
            try {
                this.$store.commit('app/updateShowLoading', true)
                const assetsType = ASSET_TYPE_MAP.keysMap[this.$route.query.assetType]
                const { result } = await getCleanHoldings({
                    offset: 0,
                    count: 999,
                    assetsType,
                    account: this.accountType,
                    toCurrency: this.currency,
                })
                this.$store.commit('app/updateShowLoading', false)
                // eslint-disable-next-line prefer-const
                let { list, accumulatedProfitloss } = result || {}
                list = list || []
                this.list = list
                Object.assign(this.totalProfitLoss, { amount: accumulatedProfitloss || '--', currency: this.currency })
            } catch (e) {
                console.error(e)
            } finally {
                this.$store.commit('app/updateShowLoading', false)
                this.hasInit = true
            }
        },
        rowClick() {},
        refresh() {},

        onAccountChoose(value) {
            this.accountType = value
            this.currency = this.accountType === 'ALL' ? 'HKD' : this.accountType
            this.getList()
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

        onHoldingContentClick(e) {
            try {
                const { symbol, billsymbol, currency } = e.target.dataset || {}
                console.warn('onHoldingContentClick - 1:', symbol, billsymbol, currency)
                if (!symbol) {
                    this.$toast({
                        message: this.$t('offlineOrderServer'),
                        className: 'offline-order-toast',
                    })
                    return
                }
                const query = {
                    assetType: this.$route.query.assetType,
                    symbol: encodeURIComponent(symbol),
                    currency: currency,
                }
                billsymbol && (query.billsymbol = billsymbol)
                this.$goPage('/product-detail-hold', query)
            } catch (e) {
                console.error(e)
            }
        },
    },
}
</script>
<style lang="less">
body {
    background: #f9f9f9;
}

.offline-order-toast {
    width: 284px;
    max-width: 284px;
}
</style>
<style scoped lang="less">
.no-hoold-product {
    padding-bottom: 12px;
    background: #f9f9f9;

    .selectBox {
        position: relative;
        z-index: 100;
        display: flex;
        padding: 8px 16px;
        background: #fff;

        & > div {
            display: flex;
            flex: 1 0 100%;
            align-items: center;
            justify-content: space-between;
        }

        .left {
            color: @fontBlackColor;
            font-size: 14px;
            line-height: 20px;
        }

        .icon {
            width: 12px;
            height: 12px;
            margin-left: 2px;
        }
    }

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
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;

            img {
                width: 16px;
                margin-left: 16px;
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
        background-color: #fff;
        border-radius: 8px;

        .title {
            padding: 12px 12px 4px;

            .left {
                font-weight: 700;
                font-size: 15px;
                line-height: 21px;
            }
        }

        .outter-empty {
            padding: 40px 0;
            background: #fff;
            border-radius: 8px;
        }

        .outter-hold-card {
            background: #fff;
            box-shadow: inset 12px 0 0 #fff, inset 0 -0.5px 0 #efefef;
        }

        .public-bond {
            display: flex;
            flex-direction: column;
            padding: 12px 12px 0;
            background-color: #fff;
            border-radius: 8px;

            header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }

            .public-bond__list {
                li {
                    display: flex;
                    align-items: center;
                    padding: 17px 0;
                    box-shadow: inset 0 0 0 #fff, inset 0 0 0 #fff, inset 0 -0.5px 0 #efefef;

                    span {
                        pointer-events: none;
                    }

                    .name {
                        flex: 0 0 199px;
                        width: 199px;
                        margin: 0 6px 0 5px;
                        color: #2f2f2f;
                        font-weight: 400;
                        font-size: 14px;
                        line-height: 20px;
                    }

                    .profit-loss {
                        flex: 0 0 98px;
                        max-width: 98px;
                        font-weight: 500;
                        font-size: 14px;
                        line-height: 20px;
                        text-align: right;
                    }
                }

                li:nth-last-of-type(1) {
                    box-shadow: none;
                }
            }
        }
    }
}
</style>
