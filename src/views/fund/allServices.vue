// 全部服务
<template>
    <div class="main">
        <!-- 功能排列卡片 -->
        <div class="card mar-t12">
            <div class="title">{{ $t('wealth') }}</div>
            <div class="features">
                <ul @click="onFeaturesClick">
                    <template v-for="item in features.slice(0, 4)">
                        <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                            <multi-img :name="item.name" class="icon" directory="fund"></multi-img>
                            <label class="text">{{ item.label }}</label>
                        </li>
                    </template>
                </ul>
                <ul @click="onFeaturesClick">
                    <template v-for="item in features.slice(4, 8)">
                        <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                            <multi-img :name="item.name" class="icon" directory="fund"></multi-img>
                            <label class="text">{{ item.label }}</label>
                        </li>
                    </template>
                </ul>
                <ul @click="onFeaturesClick">
                    <template v-for="item in features.slice(8)">
                        <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                            <multi-img :name="item.name" class="icon" directory="fund"></multi-img>
                            <label class="text">{{ item.label }}</label>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
        <div class="card mar-t12">
            <div class="title">{{ $t('tools') }}</div>
            <div class="features">
                <ul @click="onFeaturesClick">
                    <template v-for="item in toolList">
                        <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                            <multi-img :name="item.name" class="icon" directory="fund"></multi-img>
                            <label class="text">{{ item.label }}</label>
                        </li>
                    </template>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </div>
        <div class="card mar-t12">
            <div class="title">{{ $t('orderRecord') }}</div>
            <div class="features">
                <ul @click="onFeaturesClick">
                    <template v-for="item in orderRecordList">
                        <li class="mask" :key="item.key" :data-key="item.key" :data-link="item.link" :data-label="item.label">
                            <multi-img :name="item.name" class="icon" directory="fund"></multi-img>
                            <label class="text">{{ item.label }}</label>
                        </li>
                    </template>
                    <li></li>
                    <li></li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import { FINANCE_ACCOUNT, FUND_ACCOUNT } from '@/entries/Fund.js'
import isInitedTradePwd from '@/mixins/initTradePwd'

export default {
    name: 'allServices',
    data() {
        return {
            otherList: [
                {
                    key: 'fundComparison',
                    label: this.$t('fundComparison'),
                    name: 'icon_trade_all_duibi',
                    link: '/wealth/fund.html#/select-fund',
                },
                {
                    key: 'fundSelection',
                    label: this.$t('fundSelectionByStock.title'),
                    name: 'icon_trade_gpxjj',
                    link: '/wealth/fund.html#/fund-selection-by-stock',
                },
            ],
            features: [
                {
                    key: 'cash',
                    label: this.$t('cashBox'),
                    name: 'icon_trade_all_xcb',
                    link: '/wealth/cashBox.html#/',
                },
                {
                    key: 'cashManage',
                    label: this.$t('cashManage'),
                    name: 'icon_trade_all_xianjin',
                    link: '/wealth/fund.html#/list?activeTab=mmf',
                },
                {
                    key: 'advancedInvest',
                    label: this.$t('advancedInvest'),
                    name: 'icon_trade_all_zqxjj',
                    link: '/wealth/fund.html#/list?activeTab=stock',
                },
                {
                    key: 'invest',
                    label: this.$t('stableInvest'),
                    name: 'icon_trade_all_gpxjj',
                    link: '/wealth/fund.html#/list?activeTab=bond',
                },
                {
                    key: 'privatePlacement',
                    label: this.$t('privateFund'),
                    name: 'icon_trade_all_simu',
                    link: '/wealth/fund.html#/private-list',
                },
                {
                    key: 'bond',
                    label: this.$t('bond'),
                    name: 'icon_trade_all_zhaiquan',
                    link: '/wealth/fund.html#/bond',
                },
                {
                    key: 'insurance',
                    label: this.$t('insurance'),
                    name: 'icon_trade_all_baoxian',
                    link: '/wealth/fund.html#/invest-product/insurance',
                },
                {
                    key: 'alterInvestment',
                    label: this.$t('alterInvestment'),
                    name: 'icon_trade_all_linglei',
                    link: '/wealth/fund.html#/invest-product/alter-investments',
                },
                {
                    key: 'fixedDepositAccount',
                    label: this.$t('fixedDepositAccount'),
                    name: 'icon_trade_all_star_treasure_special',
                    link: '/wealth/fixedDepositTreasure.html#/list',
                },
            ],
        }
    },
    computed: {
        toolList() {
            return this.otherList
        },
        orderRecordList() {
            return [
                {
                    key: 'wealthOrder',
                    label: this.$t('wealthRrderRecordTitle'),
                    name: 'icon_wealth_order',
                    link: '/wealth/fund.html#/order-list?accountType=ALL&currency=HKD',
                },
                {
                    key: 'followOrder',
                    label: this.$t('followRrderRecordTitle'),
                    name: 'icon_follow_order',
                    link: '/wealth/fund.html#/follow-order-records',
                },
            ]
        },
    },
    methods: {
        onFeaturesClick(e) {
            const { link, key, label } = e.target.dataset
            if (!link) return

            if (key === 'cash') {
                if (!this.$root.isLogin) {
                    this.$root.login()
                    return
                }
                if (!this.$root.getAccountStatus(FINANCE_ACCOUNT)) {
                    this.$root.nextAfterJudgeAccountStatus('openAccount')
                    return
                }
                if (!this.$root.getAccountStatus(FUND_ACCOUNT)) {
                    this.$root.nextAfterJudgeAccountStatus('fundAccount')
                    return
                }
                // 交易密码校验
                if (!isInitedTradePwd({ store: this.$store })) return
            }
            const url = `${location.origin}${link}`
            console.log(`onFeaturesClick ===> ${url}`)
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                location.href = this.$addCurParamsForUrl(url)
            }
        },
    },
}
</script>

<style scoped lang="less">
.main {
    padding: 16px 12px;

    .card {
        .title {
            padding: 14px 0 0 12px;
            color: @fontBlackColor;
            font-weight: 500;
            font-size: 16px;
        }

        background: @white;
        border-radius: 8px;
    }
}
</style>

/* 功能卡片 */
<style lang="less" scoped>
.features {
    position: relative;
    padding: 16px 28px;

    &.card {
        margin-top: 0;
    }

    ul {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        li {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 32px;

            &:nth-child(4n + 1),
            &:nth-child(4n + 2),
            &:nth-child(4n + 3) {
                margin-right: 50px;
            }

            &.mask {
                position: relative;

                &::after {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 1;
                    content: '';
                }
            }

            .icon {
                display: block;
                width: 24px;
            }

            .text {
                display: block;
                margin-top: 6px;
                color: #1f1f1f;
                font-size: 12px;
                line-height: 16px;
                text-align: center;
                word-break: keep-all;
            }
        }
    }

    ul:not(:first-child) {
        margin-top: 20px;
    }
}
</style>
