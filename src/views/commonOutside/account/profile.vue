<template>
    <!-- 资产总览 -->
    <div class="profile-container">
        <div class="head flex-s">
            <!-- 保证金账户 -->
            <div class="flex-c">
                <span class="mar-r12">{{ $t('wealthAccount') }}</span>
                <span class="mar-r6">{{ showAsset ? accts.subAcctId : maskSubAccountId }}</span>
                <multi-img
                    name="icon_copy"
                    directory="commonOutside"
                    class="icon-copy"
                    :data-clipboard-text="accts.subAcctId"
                    @click="onCopy"
                ></multi-img>
            </div>

            <!-- 查看明细 -->
            <div class="flex-c f-12 c-gray" @click="goDetail">
                <span>{{ $t('seeDetail') }}</span>
                <multi-img name="icon-right-arrow" directory="common" class="icon-right"></multi-img>
            </div>
        </div>

        <div class="flex-s mar-t20">
            <!-- 资产净值 label -->
            <div class="flex-c">
                <van-popover v-model="showPopover" trigger="click" :get-container="getCurrencyPopoverContainer">
                    <ul class="currency-card" @click.stop="updateCurrency">
                        <li
                            class="item"
                            :class="{ selected: item.value === currency }"
                            :data-key="item.value"
                            v-for="item in CURRENCY_LIST"
                            :key="item.value"
                        >
                            {{ item.text }}
                        </li>
                    </ul>
                    <template #reference>
                        <div class="flex-c">
                            <div class="flex-c f12 h2-white">
                                {{ $t('assetValue') }}
                                <div class="icon-circle"></div>
                                {{ CURRENCY_MAP[currency] }}
                            </div>
                            <multi-img name="icon_triggle" directory="commonOutside" class="icon-triggle"></multi-img>
                        </div>
                    </template>
                </van-popover>

                <multi-img
                    :name="showAsset ? 'icon_eye_open' : 'icon_eye_close'"
                    directory="commonOutside"
                    class="icon-eye"
                    @click="updateShowAsset"
                ></multi-img>
            </div>

            <!-- 昨日收益 label -->
            <div class="flex-c align-r f12 h2-white" @click="openPage">
                <span>{{ $t('yesterdayProfit') }}({{ formatDate(assetsSummary.yesterdayPLDate) }})</span>
                <multi-img name="icon_about" directory="commonOutside" class="icon-about"></multi-img>
            </div>
        </div>

        <div class="flex-s mar-t6 bold">
            <!-- 资产净值 -->
            <div
                ref="totalAssets"
                class="amount line-elipsis"
                v-riseFall="{
                    value: assetsSummary.totalAssets[currency],
                    hide: !showAsset,
                    hideObj: { color: '#2F2F2F', text: '*****' },
                    sign: false,
                    riseFall: false,
                    rate: false,
                }"
            ></div>

            <!-- 昨日收益 -->
            <div
                class="profit align-r"
                v-riseFall="{
                    value: assetsSummary.yesterdayProfitLoss[currency],
                    hide: !showAsset,
                    hideObj: { color: '#666', text: '****' },
                    rate: false,
                }"
            ></div>
        </div>

        <div class="flex-s mar-t16">
            <!-- 现金 -->
            <div class="flex1">
                <div class="f12 h2-white mar-b4">{{ $t('cash') }}</div>
                <div
                    class="f14 lh-20 c-main"
                    v-riseFall="{
                        value: assetsSummary.availableBalance[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 最大购买力 -->
            <div class="align-c flex1">
                <!-- <div class="f12 h2-white mar-b4">最大购买力</div>
                <div
                    class="f14 lh-20 c-main"
                    v-riseFall="{
                        value: assetsSummary.maxPurchasingPower[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div> -->
            </div>

            <!-- 风险状态 -->
            <div class="align-r flex1">
                <div class="f12 h2-white mar-b4">{{ $t('riskStatus') }}</div>
                <div class="f14 lh-20" :style="{ color: showAsset ? RISK_COLOR[assetsSummary.riskStatus] : '#666' }">
                    {{ showAsset ? RISK_LEVEL[assetsSummary.riskStatus] || '--' : '****' }}
                </div>
            </div>
        </div>

        <!-- X笔基金交易订单进行中 -->
        <div class="foot flex-s" v-if="orderNum > 0" @click="goOrder">
            <div class="flex-c">
                <multi-img name="icon_volume" directory="commonOutside" class="icon-volume"></multi-img>
                <div class="f12 lh-16 h2-white">
                    {{ $t('orderingTips1') }}
                    <span :class="{ primary: showAsset }">{{ showAsset ? orderNum : '*' }}</span>
                    {{ $t('orderingTips2') }}
                </div>
            </div>
            <multi-img name="icon-right-arrow" directory="common" class="icon-right"></multi-img>
        </div>
    </div>
</template>

<script>
import { Popover } from 'vant'
import { ACCOUNT_MAP, CURRENCY_MAP, CURRENCY_LIST, RISK_LEVEL, RISK_COLOR } from '../config/common.js'
import { mapState } from 'vuex'
import { getAssetSummary } from '@/apis/portfolio/index.js'
import { getOrderData } from '@/apis/wealth/index.js'
import { getLangType } from '@/utils/tools'
import { dynamicFontSize } from '@/utils/utils'
import Clipboard from 'clipboard'
import pageUrl from '@/config/pageUrl'

export default {
    components: {
        [Popover.name]: Popover,
    },
    data() {
        return {
            ACCOUNT_MAP,
            CURRENCY_MAP,
            CURRENCY_LIST,
            RISK_LEVEL,
            RISK_COLOR,
            // 资产总览
            assetsSummary: {
                totalAssets: {}, // 总资产净值
                yesterdayProfitLoss: {}, // 昨日收益
                yesterdayPLDate: '', // 昨日收益日期
                availableBalance: {}, // 总现金
                marketValue: {}, // 	账号持仓市值
                totalProfitLoss: {}, // 总持仓盈亏
                totalProfitLossPercentage: '', // 总持仓盈亏比
                maxPurchasingPower: {}, // 最大购买力
                cashPurchasingPower: {}, // 现金购买力
                marginableValue: {}, // 可按仓股票价值
                marginPurchasingPower: {}, // 可融资金额
                useMarginValue: {}, // 已借金额
                interestAmount: {}, // 	计息金额
                surplusMarginValue: {}, // 剩余可借
                accruedInterest: {}, // 应记利息
                marginRatio: '', // 保证金比例
                marginCallAmount: {}, // 追收保证金额
                riskStatus: '', // 	风险状态
                creditLimit: {}, // 最大借贷额
            },
            orderNum: 0, // 正在进行中的订单
            productTypes: [1, 4, 9], // 产品类型 1-公募 9-现金宝 4-票据
            showPopover: false, // 切换币种框显示与隐藏
        }
    },
    computed: {
        ...mapState('user', ['accts', 'currency', 'showAsset']),

        // 账户掩码
        maskSubAccountId() {
            const subAcctId = this.accts?.subAcctId
            const prefix = subAcctId.substring(0, 2)
            const suffix = subAcctId.substr(subAcctId.length - 4)
            return prefix + '***' + suffix
        },
    },
    watch: {
        showAsset: {
            handler() {
                // 显示与隐藏状态更改时, 重新设置资产净值字体
                this.dynamicFontSizeFn()
            },
            immediate: true,
        },
    },
    methods: {
        // 首页资产概览
        async getAssetSummary() {
            try {
                const res = await getAssetSummary()
                this.$emit('success')
                const { assetsSummary } = res.result || {}
                this.assetsSummary = { ...this.assetsSummary, ...assetsSummary }
            } catch (err) {
                err?.error?.message && this.$toast(err?.error?.message)
            }
        },

        /**
         * 查询进行中订单
         * account 账户类型 ALL-所有账户 HKD-港元账户 USD-美元账户
         * productTypes 产品类型 1-公募 9-现金宝
         **/
        async getOrderData() {
            try {
                const res = await getOrderData({
                    account: 'ALL',
                    productTypes: this.productTypes,
                })
                const { numOfOrdersInProceessing } = res.result || {}
                this.orderNum = numOfOrdersInProceessing?.all
            } catch (err) {
                err?.error?.message && this.$toast(err?.error?.message)
            }
        },

        // 指定切换货币下拉框挂载的节点
        getCurrencyPopoverContainer() {
            const dom = this.$refs.trigger
            return dom ? dom : document.querySelector('body')
        },

        // 复制账号
        onCopy() {
            const clipboard = new Clipboard('.icon-copy')
            clipboard.on('success', () => {
                this.$toast(this.$t('copySuccess'))
                clipboard.destroy()
            })
            clipboard.on('error', () => {
                clipboard.destroy()
            })
        },

        // 昨日收益日期处理
        formatDate(val) {
            val = val ? val.substring(5) : ''
            return val.replace(/-/g, '/') || '--'
        },

        // 更新显示与隐藏的状态
        updateShowAsset() {
            this.$store.commit('user/updateShowAsset', !this.showAsset)
        },

        // 更新资产选择的币种
        updateCurrency(e) {
            this.showPopover = false
            this.$store.commit('user/updateCurrency', e.target.dataset.key)
        },

        // 查看明细
        goDetail() {
            this.$goPage('/detail')
        },

        /**
         * 查看进行中的订单
         * haveDoing 1-进行中
         * productTypes 产品类型 1-公募 9-现金宝 4-票据
         **/
        goOrder() {
            const productTypes = encodeURIComponent(JSON.stringify(this.productTypes))
            this.$goPage('/order-list', { haveDoing: 1, productTypes }, { pathname: '/wealth/fund.html' })
        },

        // 查看昨日收益
        openPage() {
            const url = `${pageUrl.FAQ_PROFIT_DESC}?langType=` + getLangType()
            this.$goPage(url)
        },

        // 动态设置资产净值字体
        dynamicFontSizeFn() {
            this.$nextTick(() => {
                dynamicFontSize({ dom: this.$refs.totalAssets, minFontSize: 20, interval: 2 })
            })
        },
    },
    mounted() {
        this.getAssetSummary().then(() => {
            // 动态设置资产净值字体
            this.dynamicFontSizeFn()
        })
        this.getOrderData()
    },
}
</script>

<style lang="less" scoped>
.profile-container {
    padding: 0 12px 16px;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;

    .head {
        height: 42px;
        font-size: 14px;
        line-height: 20px;
        box-shadow: 0 -0.5px 0 0 #efefef inset;
    }

    .amount {
        flex: 1 0 223px;
        color: #2f2f2f;
        font-size: 28px;
        line-height: 38px;
    }

    .profit {
        flex: 0 0 85px;
        margin-left: 19px;
        font-size: 18px;
    }

    .icon-copy {
        width: 20px;
        height: 20px;
    }

    .icon-right {
        width: 12px;
        height: 12px;
        margin-left: 4px;
    }

    .icon-circle {
        width: 2px;
        height: 2px;
        margin: 0 4px;
        background: #666;
        border-radius: 39px;
    }

    .icon-triggle {
        width: 6px;
        height: 6px;
        margin-left: 5px;
    }

    .icon-eye {
        width: 16px;
        height: 16px;
        margin-left: 16px;
    }

    .icon-about {
        width: 16px;
        height: 16px;
        margin-left: 4px;
    }

    .foot {
        height: 36px;
        margin-top: 12px;
        padding: 0 12px;
        background: #fff9f1;
        border-radius: 4px;

        .primary {
            color: @theme;
        }
    }

    .icon-volume {
        width: 16px;
        height: 16px;
        margin-right: 4px;
    }
}

.currency-card {
    width: 94px;
    overflow: hidden;
    border-radius: 4px;

    .item {
        font-size: 14px;
        line-height: 36px;
        text-align: center;

        #font_h1();
        #dialog_background();
        #box_shadow_2();

        &.selected {
            color: @theme;
        }
    }
}
</style>
