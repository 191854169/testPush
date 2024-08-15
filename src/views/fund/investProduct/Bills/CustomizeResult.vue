<!--定制票据订单结果-->
<template>
    <div class="align-c pad-rl12">
        <multi-img name="submit-success" directory="common" width="60" height="60" class="mar-t26"></multi-img>
        <h5 class="f18 lh-26 mar-t20">{{ $t('trade.tijiaochenggong') }}</h5>
        <p class="f14 c-gray lh-20 mar-t4">{{ $t('bills.submitTips') }}</p>
        <div class="bg-white pad-t8 pad-b8 pad-rl12 border-radius-8px mar-t32">
            <div class="pad-tb8 flex-s" v-for="item in list" :key="item.name">
                <span class="f14 c-gray lh-20 nowrap">{{ item.name }}</span>
                <span class="f14 c-main lh-20 align-r w-200">{{ item.value }}</span>
            </div>
        </div>
        <!-- 开通理财账户 -->
        <div class="bg-white pad-rl12 border-radius-8px mar-t12" v-if="!showOpenFundAccount">
            <div class="flex-s h-54">
                <div class="flex-c" @click="handleFundAccountTip">
                    <div class="f16 lh-22 mar-r8">{{ $t('openFundAccount') }}</div>
                    <multi-img name="icon_tips_big" directory="common" width="20" height="20"></multi-img>
                </div>

                <div class="activate-btn" @click="$root.nextAfterJudgeAccountStatus('fundAccount')">{{ $t('goOpen') }}</div>
            </div>
        </div>

        <!-- 开通衍生品权限 -->
        <div class="bg-white pad-rl12 border-radius-8px mar-t12" v-if="showOpenDerivative">
            <div class="flex-s h-54">
                <div class="flex-c" @click="handleDerivativesTip">
                    <div class="f16 lh-22 mar-r8">{{ $t('bills.openDerivativesPermissions') }}</div>
                    <multi-img name="icon_tips_big" directory="common" width="20" height="20"></multi-img>
                </div>

                <div class="activate-btn" @click="handleOpenDerivative">{{ $t('goOpen') }}</div>
            </div>
        </div>
        <!-- 自动换汇 -->
        <!-- <div class="bg-white pad-rl12 border-radius-8px mar-t12" v-if="!autoFxSettingStatus">
            <div class="flex-s h-54">
                <div class="flex-c" @click="handleAutoExchangeTip">
                    <div class="f16 lh-22 mar-r8">{{ $t('toOpenAutoExchange') }}</div>
                    <multi-img name="icon_tips_big" directory="common" width="20" height="20"></multi-img>
                </div>

                <div class="activate-btn" @click="goAutoExchange">{{ $t('goOpen') }}</div>
            </div>
        </div> -->
        <button class="button" @click="handleClick">{{ $t('complete') }}</button>
    </div>
</template>

<script>
import { noteCustomizationOrderDetail } from '@/apis/wealth/index'
import dayjs from 'dayjs'
import { thousandsFilter } from '@/config/filters'
import { CURRENCY_MAP, BILL_UNIT_MAP } from '@/views/fund/config/common'
import { FUND_ACCOUNT } from '@/entries/Fund.js'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
import { AutoFxSetting } from '@/apis/cash'
import pathnames from '@/config/H5Pathname.js'
import { OPEN_DERIVATIVE } from '@/config/common'
const { VUE_APP_DERIVATIVE_PAGE } = pathnames

export default {
    name: 'CustomizeResult',
    data() {
        return {
            list: [
                { name: this.$t('productName'), value: '', key: 'parentProductName' },
                { name: this.$t('bills.intendedPurchaseAmount'), value: '', key: 'applyAmount' },
                { name: this.$t('bills.sub'), value: '', key: 'parentYield' },
                { name: this.$t('bills.expectedInvestmentPeriod'), value: '', key: 'productPeriod' },
                { name: this.$t('bills.submitTime'), value: '', key: 'submitTime' },
                { name: this.$t('trade.orderNumber'), value: '', key: 'orderNumber' },
            ],
            orderId: Number(this.$route.query.orderId),
            CURRENCY_MAP,
            BILL_UNIT_MAP,
            autoFxSettingStatus: true, // 用户的自动换汇状态
            showOpenFundAccount: true, // 理财账户, 默认已开通
            showOpenDerivative: false, // 衍生品
        }
    },

    created() {
        this.init()
    },
    methods: {
        init() {
            this.getData()
            this.initAccountStatus()
            this.initAccountWatch()
        },

        // 初始化 理财账户，衍生品状态
        initAccountStatus() {
            this.showOpenFundAccount = this.$root.getAccountStatus(FUND_ACCOUNT)
            this.showOpenDerivative = this.showOpenFundAccount && !(this.$store.getters['user/getAccts']?.openDerivative == OPEN_DERIVATIVE)
        },

        // 注册监听函数
        initAccountWatch() {
            try {
                if (this.$jsBridge && this.$jsBridge.watchPageVisible) {
                    this.$jsBridge.watchPageVisible(async () => {
                        // 理财账户，衍生品 都已开通 则不需要进行后续逻辑
                        if (this.showOpenFundAccount && !this.showOpenDerivative) return
                        this.$store.dispatch('user/getUserInfo', false).then(() => {
                            this.initAccountStatus()
                        })
                    })
                }
            } catch (e) {
                console.error(e)
            }
        },

        // 自动换汇开通状态
        async getAutExchangeStatus() {
            try {
                // 如果用户已开通自动换汇则不需要提醒
                const { result } = await AutoFxSetting({ subAccountId: this.$store.state.user.subAccountId })
                // 0:未开通、1:已开通、2:已关闭
                const AUTO_EXCHANGE_OPENED = 1
                if (result?.status == AUTO_EXCHANGE_OPENED) {
                    this.autoFxSettingStatus = true
                    return
                }
                this.autoFxSettingStatus = false
            } catch (e) {
                console.error(`AutoFxSetting e ===> `, e)
            }
        },

        goAutoExchange() {
            const url = `${location.origin}/pages/autoExchange.html#/?sub=${this.$store.state.user.subAccountId}`

            location.href = url
        },

        // 自动换汇弹窗
        handleAutoExchangeTip() {
            this.$dialog.confirm({
                title: this.$t('autoExchange'),
                message: this.$t('autoExchangeDesc'),
                messageAlign: 'left',
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
            })
        },

        // 理财账户弹窗
        handleFundAccountTip() {
            this.$dialog.confirm({
                title: this.$t('fundAccount'),
                message: this.$t('bills.openFundAccountTips'),
                messageAlign: 'left',
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
            })
        },

        // 衍生品弹窗
        handleDerivativesTip() {
            this.$dialog.confirm({
                title: this.$t('bills.openDerivativesPermissions'),
                message: this.$t('bills.openDerivativesPermissionsTips'),
                messageAlign: 'left',
                showCancelButton: false,
                confirmButtonText: this.$t('iKnow'),
            })
        },

        // 跳转衍生品页面
        handleOpenDerivative() {
            this.$jsBridge
                ? this.$jsBridge.open({ url: encodeURIComponent(VUE_APP_DERIVATIVE_PAGE), title: '' })
                : (location.href = this.$addCurParamsForUrl(VUE_APP_DERIVATIVE_PAGE))
        },

        closePage() {
            JSBridge ? JSBridge.close() : this.$router.go(-1)
        },

        handleClick() {
            this.$router.replace({
                path: '/bill-customize-orders',
            })
        },

        // 获取数据
        async getData() {
            try {
                const { result } = await noteCustomizationOrderDetail({ orderId: this.orderId })
                this.form = result
                this.list.forEach(item => {
                    if (item.key === 'parentProductName' || item.key === 'orderNumber') {
                        item.value = this.form[item.key]
                    }
                    if (item.key === 'applyAmount') {
                        item.value = thousandsFilter(this.form[item.key]) + this.CURRENCY_MAP.keyValueMap[this.form['parentCurrency']]
                    }
                    if (item.key === 'parentYield') {
                        const isFixed = this.form.parentIsFixed == 1
                        item.value = isFixed ? this.form[item.key] + '%' : `${this.form['parentYieldMin']}% ~ ${this.form['parentYieldMax']}%`
                        // 1 ： 固定利率2 ： 浮动利率
                        item.name = isFixed ? item.name : this.$t('bills.floatRateText')
                    }
                    if (item.key === 'productPeriod') {
                        item.value =
                            this.form['productPeriodUnit'] == this.BILL_UNIT_MAP.keysMap.month
                                ? this.$t('orderDetailFields.months', { num: this.form['productPeriod'] })
                                : this.form['productPeriod'] + this.BILL_UNIT_MAP.keyValueMap[this.form['productPeriodUnit']]
                    }
                    if (item.key === 'submitTime') {
                        item.value = dayjs(this.form[item.key]).format('YYYY/MM/DD HH:mm:ss')
                    }
                })
                this.list = [...this.list]
            } catch (e) {
                console.log('noteCustomizationOrderDetail===>e:', e)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.w-200 {
    width: 200px;
}

.h-54 {
    height: 54px;
}

.button {
    display: block;
    width: 319px;
    margin: 36px auto;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 44px;
    background: #ff6907;
    border: none;
    border-radius: 31px;
    outline: none;
}

.activate-btn {
    display: block;
    width: 66px;
    color: #ff6907;
    font-weight: 700;
    font-size: 14px;
    line-height: 28px;
    text-align: center;
    background: rgba(255, 105, 7, 0.07);
    border: none;
    border-radius: 31px;
    outline: none;
}
</style>
