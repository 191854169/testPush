<template>
    <div class="trade-account">
        <ul>
            <li @click="chooseAccountFlag = true">
                <div class="left">{{ orientText }}{{ $t('account') }}</div>
                <div class="right">
                    <multi-img :name="`account-type__${account}`" directory="common"></multi-img>
                    <p>{{ outAccount }}</p>
                    <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                </div>
            </li>
            <li v-if="isRollOut">
                <div class="left">{{ $t('buyIn') }}</div>
                <div class="right">
                    <multi-img :name="`account-type__${account}`" directory="common"></multi-img>
                    <p>{{ inAccount }}</p>
                </div>
            </li>
            <li @click="chooseProductAction">
                <div class="left">{{ orientText }}{{ $t('product') }}</div>
                <div class="right">
                    <p>{{ productName }}</p>
                    <multi-img class="next" name="icon-right-arrow" directory="common"></multi-img>
                </div>
            </li>
        </ul>
        <account-choose :type="account" v-model="chooseAccountFlag" @choose="chooseAccountHandler" :symbolList="symbolList"></account-choose>
        <choose-product
            :currency="account"
            v-model="chooseProductFlag"
            :holding="holding"
            :orient="orient"
            :symbol="symbol"
            @choose="chooseProductHandler"
            @getProduct="getProductHandler"
            ref="chooseProduct"
        ></choose-product>
    </div>
</template>
<script>
import { accountMap } from '../config/common'
import { accountTypeMap } from '@/config/common'
import AccountChoose from '@/components/AccountChoose.vue'
import chooseProduct from './chooseProduct.vue'
import { i18n } from '@/i18n/cashBox'
import { mapState } from 'vuex'

const accountKeyMap = accountMap.keyValueMap
const accountTypeKeyMap = accountTypeMap.keyValueMap
const currencyMap = {
    HKD: i18n.t('gangyuan'),
    USD: i18n.t('USD'),
    CNH: i18n.t('yuan'),
    CNY: i18n.t('yuan'),
    EUR: i18n.t('EUR'),
}
export default {
    name: 'tradeAccount',
    components: {
        AccountChoose,
        chooseProduct,
    },
    props: {
        // 交易方向
        orient: {
            type: String,
            default: 'rollIn', // rollIn:买入 rollOut: 卖出
        },
        // 账户类型
        type: {
            type: String,
            default: accountKeyMap.HKD,
        },
        // 选择的产品
        symbol: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            productName: i18n.t('smartTactics'),
            symbolList: [accountKeyMap.HKD, accountKeyMap.USD],
            chooseAccountFlag: false,
            chooseProductFlag: false,
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        account: {
            get() {
                return this.type
            },
            set(v) {
                this.$emit('changeType', v)
            },
        },
        isRollIn() {
            return this.orient === 'rollIn'
        },
        isRollOut() {
            return this.orient === 'rollOut'
        },
        // 产品列表查询持仓
        holding() {
            return this.isRollOut
        },
        orientText() {
            const map = {
                rollIn: i18n.t('rollIn'),
                rollOut: i18n.t('rollOut'),
            }
            return map[this.orient]
        },
        outAccount() {
            return `${currencyMap[this.account]}${this.$t('fundAccount')}`
        },
        inAccount() {
            return `${currencyMap[this.account]}${accountTypeKeyMap[this.accts.type]}`
        },
    },
    watch: {
        '$route.query.chooseProduct': {
            handler(v) {
                if (v) {
                    this.chooseProductFlag = true
                } else {
                    this.chooseProductFlag = false
                }
            },
            deep: true,
            immediate: true,
        },
        symbol: {
            handler(v) {
                if (!v) {
                    this.productName = this.$options.data().productName
                }
            },
            immediate: true,
        },
    },
    methods: {
        chooseAccountHandler(type) {
            this.account = type
            this.chooseAccountFlag = false
        },
        chooseProductHandler(row) {
            this.$emit('changeProduct', row)
            this.productName = row ? row.name : this.$t('smartTactics')
            this.$router.go(-1)
        },
        chooseProductAction() {
            this.$router.push({
                ...this.$route,
                query: {
                    ...this.$route.query,
                    chooseProduct: 1,
                    tipsPage: 1,
                },
            })
        },
        getProductHandler(list) {
            this.$emit('getProduct', list)
        },
    },
}
</script>
<style scoped lang="less">
.trade-account {
    ul {
        li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 52px;
            border-bottom: 0.5px solid #efefef;

            .left {
                color: #666;
                font-size: 14px;
                line-height: 22px;
            }

            .right {
                display: flex;
                align-items: center;

                img {
                    width: 16px;
                    height: 16px;
                }

                p {
                    padding: 0 6px;
                    color: #2f2f2f;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 20px;
                }

                .next {
                    width: 12px;
                    height: 12px;
                }
            }
        }

        li:last-of-type {
            border-bottom-width: 0;
        }
    }
}
</style>
