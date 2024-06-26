<template>
    <div class="details">
        <!-- <div class="account" @click="chooseFlag = true">
            <span>{{ curAccount }}</span>
            <multi-img name="icon-arrow" directory="fund" />
        </div> -->
        <section class="content">
            <asset-total
                class="total"
                :asset-msg="$t('newIncome')"
                :currency="currency"
                :showUpdateIncome="showUpdateIncome"
                :showEye="false"
                :amount="dayProfitloss"
                @choose="currencyChooseHandler"
            ></asset-total>

            <div class="content-list">
                <div class="content-title">
                    <p>{{ $t('shouyijilu') }}</p>
                    <!-- <div class="right">展示近1年数据</div> -->
                </div>
                <div class="list" v-show="list.length">
                    <div class="title_">
                        <div class="left">{{ $t('product') }}</div>
                        <div class="right">{{ $t('profit') }}</div>
                    </div>
                    <ul ref="list" v-show="list.length > 0">
                        <li v-for="(item, index) in list" :key="index">
                            <income-item :item="item" :index="index" @triggerDetail="triggerDetail"></income-item>
                        </li>
                    </ul>
                </div>
                <div class="noData" v-show="list.length === 0">
                    <multi-img class="noDataImg" name="noData" directory="common" alt="noData"></multi-img>
                    <span>{{ $t('noRecord') }}</span>
                </div>
            </div>
            <div class="descript">
                <p>{{ $t('updateDataDeclare') }}</p>
                <p>{{ $t('updateDataDecText') }}</p>
            </div>
        </section>
    </div>
</template>
<script>
import { getLatestIncome } from '@/apis/wealth'
import { accountMap } from '@/config/common'
import incomeItem from './incomeItem.vue'
import AssetTotal from '@/components/AssetTotal.vue'

const accountKeyMap = accountMap.keysMap
const accountKeyValueMap = accountMap.keyValueMap

export default {
    name: 'lastetIncome',
    components: {
        incomeItem,
        AssetTotal,
    },
    data() {
        return {
            showLoadingDown: false, // 加载中
            showLoadingOver: false,
            chooseFlag: false,
            accountType: this.$route.query.accountType || accountKeyMap.ALL,
            showUpdateIncome: this.$route.query.showUpdateIncome === '1',
            currency: accountKeyMap.HKD,
            accountListMap: accountKeyValueMap,
            allAccount: {
                cnh: {},
                hkd: {},
                usd: {},
            },
            hkdAccount: {
                cnh: {},
                hkd: {},
                usd: {},
            },
            usdAccount: {
                cnh: {},
                hkd: {},
                usd: {},
            },
        }
    },
    computed: {
        curAccount() {
            return this.accountListMap[this.accountType] || ''
        },
        accountTypeLower() {
            return this.accountType.toLowerCase()
        },
        currencyLowerCase() {
            return this.currency.toLowerCase()
        },
        list: {
            get() {
                return this[`${this.accountTypeLower}Account`][this.currencyLowerCase]?.list || []
            },
            set(v) {
                if (this[`${this.accountTypeLower}Account`][this.currencyLowerCase].list) {
                    this[`${this.accountTypeLower}Account`][this.currencyLowerCase].list = v
                }
            },
        },
        dayProfitloss() {
            return this[`${this.accountTypeLower}Account`][this.currencyLowerCase]?.dayProfitloss || ''
        },
    },
    async created() {
        if (this.accountType !== accountKeyMap.ALL) {
            this.currency = this.accountType
        }
        this.getList()
    },
    methods: {
        // 获取数据
        async getList() {
            try {
                const params = {
                    account: this.accountType,
                }
                const { result = {} } = await getLatestIncome(params)
                this.accountAssignAction('all', result)
                this.accountAssignAction('hkd', result)
                this.accountAssignAction('usd', result)
            } catch (e) {
                console.log('wealth-profitLossList===>e:', e)
            }
        },
        // 数据赋值
        accountAssignAction(key, result) {
            const account = this[`${key}Account`]
            const row = result
            account.cnh = row.cnh
            account.usd = row.usd
            account.hkd = row.hkd
        },
        // 选择币种
        currencyChooseHandler(currency) {
            this.currency = currency
        },
        triggerDetail(index) {
            const date = this.list[index].date
            const url = location.origin + `/wealth/cashBox.html#/profitInfo?date=${date}&accountType=${this.accountType}&currency=${this.currency}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/profitInfo',
                    query: {
                        date: date,
                        accountType: this.accountType,
                        currency: this.currency,
                    },
                })
            }
        },
    },
}
</script>
<style scoped lang="less">
.descript {
    padding: 32px 0;
    color: #9c9c9c;
    font-size: 12px;
    line-height: 18px;

    p {
        margin-bottom: 8px;
    }
}

.title_ {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    height: 24px;
    color: #9c9c9c;
    font-size: 12px;
    line-height: 24px;
    background: #fff;

    .left {
        width: 160px;
        font-weight: 500;
        line-height: 21px;
    }
    // .mid{
    //     flex: 1;
    // }

    .right {
        min-width: 90px;
        color: #9c9c9c;
        line-height: 16px;
        text-align: right;
    }
}

.details {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.account {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 12px 0 16px;
    line-height: 36px;
    background: #fff;
    box-shadow: inset 0 -0.5px 0 #efefef;

    span {
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
    }

    img {
        width: 12px;
        height: 12px;
        transform: rotateX(180deg);
    }
}

.content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 12px 12px 0;
    overflow: hidden;
    background: #f9f9f9;

    .total {
        flex: 0 0 auto;
    }

    .content-list {
        display: flex;
        flex-direction: column;
        margin-top: 12px;
        padding: 15px 12px 0;
        overflow: hidden;
        background: #fff;
        border-radius: 8px;
    }

    .content-title {
        margin-bottom: 16px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    .list {
        .title {
            display: flex;
            flex: 0 0 auto;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 8px;

            .left {
                font-weight: 500;
                font-size: 15px;
                line-height: 21px;
            }

            .right {
                color: #9c9c9c;
                font-size: 12px;
                line-height: 16px;
            }
        }

        ul {
            flex: 1;
            height: 100%;
            overflow-y: scroll;

            li {
                border-bottom: 0.5px solid #efefef;
            }
        }

        ul::-webkit-scrollbar {
            display: none;
        }
    }

    .noData {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 36px 0;

        .noDataImg {
            width: 104px;
            height: 104px;
            margin-bottom: 8px;
        }
    }
}

@keyframes circle {
    0% {
        transform: rotate(0deg);
    }

    25% {
        transform: rotate(90deg);
    }

    50% {
        transform: rotate(180deg);
    }

    75% {
        transform: rotate(270deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
