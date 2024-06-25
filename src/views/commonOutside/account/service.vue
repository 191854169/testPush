<template>
    <!-- 资产首页服务组件 -->
    <div class="service-container">
        <div class="item flex-middle" v-for="item in serviceList" :key="item.key" @click="openPage(item.link)">
            <multi-img :name="item.name" class="icon" directory="commonOutside"></multi-img>
            <span class="f14 c-main">{{ item.label }}</span>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getLangType } from '@/utils/tools'

export default {
    data() {
        return {
            productTypes: [1, 4, 9], // 产品类型 1-公募 4-票据 9-星财宝
        }
    },
    computed: {
        ...mapState('user', ['currency']),

        serviceList() {
            return [
                {
                    key: 'allService',
                    label: this.$t('allService'),
                    name: 'icon_asset_all_service',
                    link: '/wealth/commonOutside.html#/all-service',
                },
                {
                    key: 'deposit',
                    label: this.$t('saveCapital'),
                    name: 'icon_asset_deposit_capital',
                    link: '/edda_app/?langType=' + getLangType(),
                },
                {
                    key: 'currencyExchange',
                    label: this.$t('currencyExchange'),
                    name: 'icon_asset_currency_exchange',
                    link: '/edda_app/currency/exchange?langType=' + getLangType(),
                },
                {
                    key: 'profitDetail',
                    label: this.$t('profitDetail'),
                    name: 'icon_asset_profit_detail',
                    link: `/wealth/fund.html#/profit?accountType=ALL&currency=${this.currency}`,
                },
                {
                    key: 'orderRecord',
                    label: this.$t('orderRecord'),
                    name: 'icon_asset_order_record',
                    link: `/wealth/fund.html#/order-list?fromSource=commonOutside&productTypes=${encodeURIComponent(
                        JSON.stringify(this.productTypes)
                    )}`,
                },
                {
                    key: 'extractCapital',
                    label: this.$t('extractCapital'),
                    name: 'icon_asset_extract_capital',
                    link: '/edda_app/transferOutFunds/?langType=' + getLangType(),
                },
            ]
        },
    },
    methods: {
        openPage(url) {
            this.$goPage(`${location.origin}${url}`)
        },
    },
}
</script>

<style lang="less" scoped>
.service-container {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;

    .item {
        width: calc(33.3% - 6px);
        height: 36px;
        margin-bottom: 12px;
        background: #fff;
        border: 0.5px solid #ebebeb;
        border-radius: 37px;

        &:not(:nth-child(3n)) {
            margin-right: 8px;
        }
    }

    .icon {
        width: 20px;
        height: 20px;
        margin-right: 6px;
    }
}
</style>
