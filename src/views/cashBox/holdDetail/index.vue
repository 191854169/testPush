<template>
    <div class="hold-detail">
        <div class="account" @click="chooseAccountFlag = true">
            <span>{{ curAccount }}</span>
            <multi-img name="icon-arrow" directory="fund" />
        </div>
        <section class="content" v-show="initSuccess">
            <asset-total
                class="total"
                :asset-msg="$t('amountTotal')"
                :showEye="false"
                :currency="currency"
                :riseFall="false"
                :sign="false"
                :amount="amount"
                @choose="currencyChooseHandler"
            ></asset-total>
            <p class="holding-text">
                <span>{{ $t('myHolding') }}(</span>
                <span>{{ holdingTotal }}</span>
                <span>)</span>
            </p>
            <div class="holding-list">
                <list
                    class="holding-list__item"
                    :canShowEmpty="canShowEmpty(index)"
                    v-for="(item, index) in tableList"
                    :key="item.accountType"
                    :accountType="item.accountType"
                    :list="item.list"
                    :summary="summary"
                ></list>
            </div>
        </section>

        <account-choose :type="accountType" v-model="chooseAccountFlag" @choose="chooseHandler"></account-choose>
    </div>
</template>
<script>
import { accountMap } from '@/config/common'
import { ecashHoldingsSummary } from '@/apis/wealth/index'
import AccountChoose from '@/components/AccountChoose.vue'
import AssetTotal from '@/components/AssetTotal.vue'
import list from './list.vue'
import { throttle } from 'lodash'

const accountKeyMap = accountMap.keysMap
const accountKeyValueMap = accountMap.keyValueMap
export default {
    name: 'holdDetail',
    components: {
        AccountChoose,
        AssetTotal,
        list,
    },
    data() {
        return {
            initSuccess: false,
            chooseAccountFlag: false,
            accountType: this.$route.query.accountType || accountKeyMap.ALL,
            currency: 'HKD',
            amount: '',
            summary: {},
            accountListMap: accountKeyValueMap,
            getListHandler: throttle(this.getList, 300, { leading: false, trailing: true }),
            listMap: {
                HKDlist: [],
                USDlist: [],
            },
        }
    },
    computed: {
        curAccount() {
            return this.accountListMap[this.accountType] || ''
        },
        holdingTotal() {
            if (this.accountType === accountKeyMap.ALL) {
                return this.listMap.HKDlist.length + this.listMap.USDlist.length
            }
            return this.listMap[`${this.accountType}list`].length
        },
        allTableEmpty() {
            return this.tableList.map(item => item.list.length === 0).every(item => item)
        },
        tableList() {
            const list = []
            if (this.accountType === accountKeyMap.ALL) {
                list.push(
                    {
                        accountType: 'HKD',
                        list: this.listMap.HKDlist,
                    },
                    {
                        accountType: 'USD',
                        list: this.listMap.USDlist,
                    }
                )
            } else {
                const type = this.accountType.toUpperCase()
                list.push({
                    accountType: type,
                    list: this.listMap[`${type}list`],
                })
            }
            return list
        },
    },
    async created() {
        if (this.accountType !== accountKeyMap.ALL) {
            this.currency = this.accountType
        }
    },
    async mounted() {
        this.$loading.show = true
        await this.getList()
        this.initSuccess = true
        this.$loading.show = false
    },
    methods: {
        async getList() {
            try {
                let holdings = {}
                let summary = {}
                const params = { account: this.accountType, toCurrency: this.currency }
                console.log('ecashHoldingsSummary==>params:', params)
                const { result } = await ecashHoldingsSummary(params)
                holdings = result.holdings || {}
                summary = result.summary || {}

                this.listMap.HKDlist = []
                this.listMap.USDlist = []
                this.currency = summary.currency || ''
                this.amount = summary.totalMarketValue || ''
                this.summary = summary
                this.listMap.HKDlist = holdings.HKD || []
                this.listMap.USDlist = holdings.USD || []
            } catch (e) {
                console.log('ecashHoldingsSummary===>e:', e)
            }
        },
        // 选择账户
        chooseHandler(type) {
            this.chooseAccountFlag = false
            if (type !== this.accountType) {
                this.accountType = type
                if (type !== accountKeyMap.ALL) {
                    this.currencyChooseHandler(type)
                }
            }
            this.getListHandler()
        },

        // 选择币种
        currencyChooseHandler(currency) {
            this.currency = currency
            this.getListHandler()
        },
        // 可以显示空
        canShowEmpty(index) {
            if (this.accountType !== accountKeyMap.ALL) {
                return true
            }
            return this.allTableEmpty && index === 0
        },
    },
}
</script>
<style scoped lang="less">
.hold-detail {
    height: 100%;
    overflow: auto;
    background-color: #f9f9f9;
}

.account {
    display: flex;
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
    flex-direction: column;
    padding: 12px 12px 0;
    overflow: auto;

    .holding-text {
        margin: 20px 0 4px;
        padding: 7px 0;
        color: #2f2f2f;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
    }

    .holding-list {
        .holding-list__item {
            margin-bottom: 13px;
        }
    }
}
</style>
