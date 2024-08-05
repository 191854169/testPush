<template>
    <div class="all-service-container">
        <div class="card" v-for="(service, index) in serviceList" :key="index">
            <div class="title">{{ service.title }}</div>
            <div class="content">
                <ul>
                    <li v-for="item in service.list" :key="item.key" @click="openPage(item)">
                        <multi-img :name="item.name" class="icon" directory="commonOutside"></multi-img>
                        <div class="label">{{ item.label }}</div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 联系客服 -->
        <TelContact />
    </div>
</template>

<script>
import TelContact from './components/TelContact.vue'
import { mapGetters, mapState } from 'vuex'
import { getLangType } from '@/utils/tools'
import pathnames from '@/config/H5Pathname.js'

export default {
    components: {
        TelContact,
    },
    data() {
        return {
            productTypes: [1, 4, 9], // 产品类型 1-公募 9-星财宝
        }
    },
    computed: {
        ...mapGetters({ accts: 'user/getAccts' }),
        ...mapState('user', ['currency']),
        serviceList() {
            const data = [
                {
                    title: this.$t('capital'),
                    list: [
                        {
                            key: 'deposit',
                            label: this.$t('saveCapital'),
                            name: 'icon_deposit_capital',
                            link: '/edda_app/?langType=' + getLangType(),
                        },
                        {
                            key: 'currencyExchange',
                            label: this.$t('currencyExchange'),
                            name: 'icon_currency_exchange',
                            link: '/edda_app/currency/exchange?langType=' + getLangType(),
                        },
                        {
                            key: 'transferOutFunds',
                            label: this.$t('extractCapital'),
                            name: 'icon_extract_capital',
                            link: '/edda_app/transferOutFunds/?langType=' + getLangType(),
                        },
                        {
                            key: 'bankCard',
                            label: this.$t('bankAccount'),
                            name: 'icon_bank_card',
                            link: '/edda_app/bankCard/?langType=' + getLangType(),
                        },
                        {
                            key: 'eddaRecord',
                            label: this.$t('capitalRecord'),
                            name: 'icon_capital_record',
                            link: '/edda_app/eddaRecord/?langType=' + getLangType(),
                        },
                        {
                            key: 'capitaFlow',
                            label: this.$t('capitaFlow'),
                            name: 'icon_capital_flow',
                            link: '/wealth/commonOutside.html#/flow',
                        },
                    ],
                },
                {
                    title: this.$t('account'),
                    list: [
                        {
                            key: 'accountDetail',
                            label: this.$t('accountDetail'),
                            name: 'icon_account_detail',
                            link: '/wealth/commonOutside.html#/detail',
                        },
                        {
                            key: 'riskAssessment',
                            label: this.$t('fxcp'),
                            name: 'icon_risk_assessment',
                            link: '/wealth/riskAssessment.html#/',
                        },
                        {
                            key: 'PICertification',
                            label: this.$t('PICertification'),
                            name: 'icon_pi_certification',
                            link: '/pages/PICertification.html#/',
                        },
                        {
                            key: 'derivative',
                            label: this.$t('derivative'),
                            name: 'icon_derivative',
                            link: '/pages/derivative.html#/',
                        },

                        {
                            key: 'userInformation',
                            label: this.$t('accountProfile'),
                            name: 'icon_trade_all_accountData',
                            link: '/pages/userInformation.html#/',
                        },
                        {
                            key: 'myStatement',
                            label: this.$t('myStatement'),
                            name: 'icon_trade_all_funds',
                            link: '/pages/tradeStatement.html#/', // todo 待开发
                        },
                    ],
                },
                {
                    title: this.$t('title'),
                    list: [
                        {
                            key: 'orderRecord',
                            label: this.$t('orderRecord'),
                            name: 'icon_order_record',
                            link: `/wealth/fund.html#/order-list?fromSource=commonOutside&productTypes=${encodeURIComponent(
                                JSON.stringify(this.productTypes)
                            )}`,
                        },
                        {
                            key: 'profitDetail',
                            label: this.$t('profitDetail'),
                            name: 'icon_profit_detail',
                            link: `/wealth/fund.html#/profit?accountType=ALL&currency=${this.currency}`,
                        },
                    ],
                },
            ]

            data.map((service, index) => {
                // 已开通衍生品才显示按钮
                if (index === 1 && this.accts.openDerivative === 1) {
                    const derivativeIndex = service.list.findIndex(item => item.key === 'derivative')
                    service.list.splice(derivativeIndex, 1)
                }
            })
            return data
        },
    },
    methods: {
        openPage(item) {
            const url1 = encodeURIComponent(this.$addCurParamsForUrl(pathnames.VUE_APP_WEALTH_COMMONOUTSIDE_PAGE + '?activeTab=1'))
            const url2 = encodeURIComponent(this.$addCurParamsForUrl(pathnames.VUE_APP_WEALTH_COMMONOUTSIDE_PAGE + '?activeTab=2'))
            if (item.key === 'riskAssessment') {
                this.$goPage(`${location.origin}${item.link}`)
            } else if (item.key === 'derivative') {
                this.$goPage(`${location.origin}${item.link}?url=${url2}`)
            } else {
                this.$goPage(`${location.origin}${item.link}`)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.all-service-container {
    position: relative;
    height: 100vh;
    padding: 16px 12px;
    overflow-y: auto;

    .card {
        margin-top: 12px;
        background: @white;
        border-radius: 8px;
    }

    .title {
        padding: 14px 0 0 12px;
        color: @fontBlackColor;
        font-weight: 500;
        font-size: 16px;
    }

    .content {
        padding-top: 16px;

        ul {
            display: flex;
            flex-wrap: wrap;
        }

        li {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 25%;
            margin-bottom: 20px;
        }

        .icon {
            display: block;
            max-width: 24px;
            height: 24px;
        }

        .label {
            display: block;
            margin-top: 8px;
            color: #1c1c1c;
            font-size: 12px;
            line-height: 16px;
            word-break: keep-all;
        }
    }

    .contact-container {
        position: absolute;
        bottom: 44px;
        width: calc(100% - 24px);
    }
}
</style>
