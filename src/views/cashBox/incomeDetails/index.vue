<template>
    <div class="details">
        <div class="account" @click="chooseFlag = true">
            <span>{{ curAccount }}</span>
            <multi-img name="icon-arrow" directory="fund" />
        </div>
        <section class="content" v-show="initSuccess">
            <asset-total
                class="total"
                :asset-msg="$t('leijishouyi')"
                :showEye="false"
                :currency="currency"
                @choose="currencyChooseHandler"
                :amount="accmulatedProfitLoss"
            ></asset-total>
            <div class="list">
                <div class="title">
                    <div class="left">{{ $t('shouyijilu') }}</div>
                    <div class="right">{{ $t('showOneYearData') }}</div>
                </div>
                <ul ref="list" v-show="list.length > 0">
                    <li v-for="(item, index) in list" :key="index">
                        <income-item :item="item" :index="index" @triggerDetail="triggerDetail"></income-item>
                    </li>
                    <!-- 加载 -->
                    <div class="loading-down" v-show="showLoadingDown">
                        <div class="loading-content">
                            <multi-img class="loading-icon" name="icon-footer-loading" directory="fund" />
                            <span>{{ `${$t('loading')}...` }}</span>
                        </div>
                    </div>
                    <div class="loading-over" v-show="showLoadingOver">
                        <span>{{ $t('noHaveMoreData') }}</span>
                    </div>
                </ul>
                <!-- 无数据 -->
                <div class="noData" v-show="list.length == 0">
                    <multi-img class="noDataImg" name="noData" directory="common" alt="noData"></multi-img>
                    <span>{{ $t('noRecord') }}</span>
                </div>
            </div>
        </section>
        <account-choose :type="accountType" v-model="chooseFlag" @choose="chooseHandler"></account-choose>
    </div>
</template>
<script>
import { profitLossList } from '@/apis/wealth'
import { accountMap } from '@/config/common'
import AccountChoose from '@/components/AccountChoose.vue'
import incomeItem from './incomeItem.vue'
import { throttle } from 'lodash'
import AssetTotal from '@/components/AssetTotal.vue'

const accountKeyMap = accountMap.keysMap
const accountKeyValueMap = accountMap.keyValueMap

export default {
    name: 'incomeDetails',
    components: {
        AccountChoose,
        incomeItem,
        AssetTotal,
    },
    data() {
        return {
            initSuccess: false,
            finished: false,
            showLoadingDown: false, // 加载中
            showLoadingOver: false,
            chooseFlag: false,
            accountType: this.$route.query.accountType || accountKeyMap.ALL,
            currency: accountKeyMap.HKD,
            loadHandler: throttle(this.getList, 500, { leading: false }),
            accountListMap: accountKeyValueMap,
            allAccount: {
                count: 20,
                total: 0,
                start: 0,
                cnh: {},
                hkd: {},
                usd: {},
            },
            hkdAccount: {
                count: 20,
                total: 0,
                start: 0,
                cnh: {},
                hkd: {},
                usd: {},
            },
            usdAccount: {
                count: 20,
                total: 0,
                start: 0,
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
        profitData() {
            return this.profitMap[`${this.accountType.toLowerCase()}Account`] || {}
        },
        accountTypeLower() {
            return this.accountType.toLowerCase()
        },
        start: {
            get() {
                return this[`${this.accountTypeLower}Account`].start
            },
            set(v) {
                this[`${this.accountTypeLower}Account`].start = v
            },
        },
        count: {
            get() {
                return this[`${this.accountTypeLower}Account`].count
            },
            set(v) {
                this[`${this.accountTypeLower}Account`].count = v
            },
        },
        total: {
            get() {
                return this[`${this.accountTypeLower}Account`].total
            },
            set(v) {
                this[`${this.accountTypeLower}Account`].total = v
            },
        },
        list: {
            get() {
                return this[`${this.accountTypeLower}Account`][this.currency.toLowerCase()]?.list || []
            },
            set(v) {
                if (this[`${this.accountTypeLower}Account`][this.currency.toLowerCase()].list) {
                    this[`${this.accountTypeLower}Account`][this.currency.toLowerCase()].list = v
                }
            },
        },
        accmulatedProfitLoss() {
            return this[`${this.accountTypeLower}Account`][this.currency.toLowerCase()]?.accmulatedProfitLoss || ''
        },
    },
    async created() {
        if (this.accountType !== accountKeyMap.ALL) {
            this.currency = this.accountType
        }
    },
    async mounted() {
        this.$loading.show = true
        await this.getList(true)
        this.initSuccess = true
        this.$loading.show = false
        const list = this.$refs.list
        const scrollHandler = e => {
            if (this.showLoadingDown || this.showLoadingOver) return
            const { scrollTop, clientHeight, scrollHeight } = e.target
            if (parseInt(clientHeight + scrollTop) + 2 >= parseInt(scrollHeight)) {
                this.loadHandler()
            }
        }
        list.addEventListener('scroll', scrollHandler)
        this.$once('hook:beforeDestroy', () => {
            list.removeEventListener('scroll', scrollHandler)
        })
    },
    methods: {
        // 获取数据 refresh: 是否刷新
        async getList(refresh = false) {
            try {
                if (!refresh && this.start >= this.total) {
                    this.showLoadingOver = true
                    return
                }
                this.showLoadingDown = true
                const params = {
                    start: this.start,
                    count: this.count,
                }
                const { result = {} } = await profitLossList(params)

                this.accountAssignAction('all', result, refresh)
                this.accountAssignAction('hkd', result, refresh)
                this.accountAssignAction('usd', result, refresh)
            } catch (e) {
                console.log('wealth-profitLossList===>e:', e)
            } finally {
                this.showLoadingDown = false
            }
        },
        // 数据赋值
        accountAssignAction(key, result, refresh = true) {
            const account = this[`${key}Account`]
            const row = result[`${key}Account`]
            account.total = row.total
            account.start = row.start + row.count
            if (refresh) {
                account.cnh = row.cnh
                account.usd = row.usd
                account.hkd = row.hkd
            } else {
                const keys = ['cnh', 'usd', 'hkd']
                keys.forEach(key => {
                    account[key].accmulatedProfitLoss = row[key].accmulatedProfitLoss
                    row[key].list && (account[key].list = account[key].list.concat(...row[key].list))
                })
            }
        },

        // 选择账户
        chooseHandler(type) {
            this.accountType = type
            // 选择账户的时候切换币种
            if ([accountKeyMap.HKD, accountKeyMap.USD].includes(type)) {
                this.currency = type
            }
            this.chooseFlag = false
            this.getList()
        },

        // 选择币种
        currencyChooseHandler(currency) {
            this.currency = currency
        },

        triggerDetail(index) {
            const date = this.list[index].date
            const url = location.origin + `/wealth/cashBox.html#/profitInfo?date=${date}&accountType=${this.accountType}&currency=${this.currency}`
            if (this.$openPageInThs(url)) return
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

    .list {
        display: flex;
        flex: 1;
        flex-direction: column;
        margin-top: 12px;
        padding: 15px 12px 0;
        overflow: hidden;
        background: #fff;
        border-radius: 8px 8px 0 0;

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

        .loading-down {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 56px;

            .loading-content {
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                    width: 20px;
                    height: 20px;
                    margin-right: 12px;
                    animation: circle 1.5s infinite linear;
                }

                span {
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }

        .loading-over {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 56px;

            span {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .noData {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 87px 0;

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
