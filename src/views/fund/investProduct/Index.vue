// 各种投资产品类型介绍页 - 债券、保险、另类
<template>
    <div class="invest-product">
        <div class="invest-product__body">
            <component :is="componentId" ref="alterInvestments"></component>
        </div>
        <footer v-if="showContanctUs" :class="{ 'ios-bottom': isIos, 'andriod-bottom': !isIos }">
            <div class="footer-content" @click="callHandler">{{ $t('intro.callMe') }}</div>
        </footer>
    </div>
</template>

<script>
import { i18n } from '@/i18n/fund/index.js'
import { isIos } from '@/utils/tools'
import { isInOutsideH5 } from '@/utils'
const BILL_ACTIVE_TAB = 'billListActiveTab'

// 产品名称
const titleMap = {
    bond: i18n.t('intro.bond'),
    insurance: i18n.t('intro.insurance'),
    'alter-investments': i18n.t('alterInvestment'),
    'insurance-profit': i18n.t('insuranceDetail'),
    'insurance-life': i18n.t('insuranceDetail'),
    'insurance-margin': i18n.t('insuranceDetail'),
    'insurance-sick': i18n.t('insuranceDetail'),
}
Object.defineProperty(titleMap, '_getTitle', {
    value: function (type) {
        const keys = Object.keys(this)
        const DEFAULT_VALUE = 'bond'
        if (!keys.includes(type) && process.env.NODE_ENV === 'development') {
            console.error(`${type} is not in *${keys}*`)
        }
        return this[keys.includes(type) ? type : DEFAULT_VALUE]
    },
    writable: false,
})
export default {
    name: 'invest-product',
    components: {
        Bond: () => import(/* webpackChunkName: "bond" */ './Bond.vue'),
        Insurance: () => import(/* webpackChunkName: "InsuranceIndex" */ './InsuranceIndex.vue'),
        AlterInvestments: () => import(/* webpackChunkName: "alterInvestments" */ './Bills/List.vue'),
        InsuranceProfit: () => import(/* webpackChunkName: "InsuranceProfit" */ './insuranceModules/InsuranceProfit.vue'),
        InsuranceLife: () => import(/* webpackChunkName: "InsuranceLife" */ './insuranceModules/InsuranceLife.vue'),
        InsuranceMargin: () => import(/* webpackChunkName: "InsuranceMargin" */ './insuranceModules/InsuranceMargin.vue'),
        InsuranceSick: () => import(/* webpackChunkName: "InsuranceSick" */ './insuranceModules/InsuranceSick.vue'),
    },
    data() {
        return {
            isIos: isIos(),
        }
    },
    beforeRouteEnter(to, from, next) {
        console.log('from:****************', from)
        const { type } = to.params || {}
        const title = titleMap._getTitle(type)
        document.title = title

        if (isInOutsideH5() && !from.name) {
            sessionStorage.removeItem(BILL_ACTIVE_TAB)
        }
        next()
    },
    beforeRouteLeave(to, from, next) {
        console.log('beforeRouteLeave', to, from)
        if (to.name === 'bills-detail' || to.name === 'billEnquiryDetail' || to.name === 'billAddEnquiry' || to.name === 'billCustomizeOrders') {
            this.$refs.alterInvestments.saveBillsActiveTab()
        } else {
            sessionStorage.removeItem(BILL_ACTIVE_TAB)
        }
        next()
    },
    watch: {
        '$route.params.type': {
            handler(v) {
                document.title = titleMap._getTitle(v)
            },
        },
    },
    computed: {
        componentId() {
            return this.$route.params.type
        },
        showContanctUs() {
            if (this.componentId === 'alter-investments') return false
            return true
        },
    },
    methods: {
        // 联系我们
        callHandler() {
            this.$router.push({
                path: '/services',
            })
        },
    },
}
</script>

<style scoped lang="less">
@import url('~@/assets/css/mixins.less');
@footer_height: 44px;

.invest-product {
    &__body {
        & > div:not([class='alter-investments']) {
            padding-bottom: @footer_height;
            #iosBottom(@footer_height);

            /deep/ .content {
                padding-bottom: 35px;
            }
        }
    }

    footer {
        position: fixed;
        right: 32px;
        bottom: 0;
        left: 32px;
        z-index: 20;
        box-sizing: content-box;
        height: @footer_height;
        background: transparent;

        .footer-content {
            width: 100%;
            height: 44px;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background: #ff6907;
            border-radius: 49px;
        }
    }

    .andriod-bottom {
        #iosBottom();
    }

    .ios-bottom {
        #iosBottom();
    }
}
</style>
