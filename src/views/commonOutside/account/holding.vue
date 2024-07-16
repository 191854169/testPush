<template>
    <!-- 理财持仓 -->
    <div class="holding-container">
        <van-sticky class="sticky-container" :container="stickyContainer">
            <div class="flex-s mar-b16" @click="showMore = !showMore">
                <span class="f16 bold">{{ $t('wealthHolding') }} ({{ holdingsNum }})</span>
                <multi-img name="icon_arrow_up" directory="commonOutside" class="icon-arrow" :class="{ hide: !showMore }"></multi-img>
            </div>

            <van-tabs @click="changeTab">
                <van-tab v-for="tab in WEALTH_MAP.options" :key="tab.key" :title="tab.label"></van-tab>
            </van-tabs>
        </van-sticky>

        <!-- 持仓列表 -->
        <div v-for="item in holdingsGroup" :key="item.marketGroup">
            <div class="content" v-if="tab === 'Wealth-ALL' || tab === item.marketGroup">
                <!-- 港元、美元理财 -->
                <div class="block" :class="{ USD: item.currency === 'USD' }">
                    <div class="flex-c">
                        <multi-img :name="`icon_${item.currency}`" directory="commonOutside" class="icon-currency"></multi-img>
                        <span class="f16 bold">{{ CURRENCY_MAP[item.currency] }}{{ $t('wealthManage') }}</span>
                    </div>

                    <!-- 资产净值、昨日收益label -->
                    <div class="flex-s mar-t12 f12 h2-white">
                        <div class="flex-c">
                            {{ $t('assetValue') }}
                            <div class="icon-circle"></div>
                            {{ CURRENCY_MAP[item.currency] }}
                        </div>
                        <div>{{ $t('yesterdayProfit') }}({{ formatDate(item.yesterdayPLDate) }})</div>
                    </div>

                    <!-- 资产净值 -->
                    <div class="flex-s mar-t6 pad-b16">
                        <div
                            class="f22 lh-29 c-main"
                            v-riseFall="{
                                value: item.totalAssets,
                                hide: !showAsset,
                                hideObj: { color: '#2F2F2F', text: '*****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                            }"
                        ></div>

                        <!-- 昨日收益 -->
                        <div
                            class="f14 align-r"
                            v-riseFall="{
                                value: item.yesterdayProfitLoss,
                                hide: !showAsset,
                                hideObj: { color: '#666', text: '****' },
                                rate: false,
                            }"
                        ></div>
                    </div>

                    <!-- 分割线显示规则：买入待确认和卖出将到账为空 且 星财宝或票据有数据 -->
                    <div
                        v-if="showMore"
                        class="flex-s pad-b16"
                        :class="{
                            border: !item.buyOnWayAmount && !item.sellOnWayAmount && (item.starHolding.length > 0 || item.billHolding.length > 0),
                        }"
                    >
                        <!-- 持有收益 -->
                        <div class="flex1">
                            <div class="f12 h2-white mar-b4">{{ $t('holdingProfit') }}</div>
                            <div
                                class="f14 lh-20 c-main"
                                v-riseFall="{
                                    value: item.ProfitLoss,
                                    hide: !showAsset,
                                    hideObj: { color: '#666', text: '****' },
                                    rate: false,
                                }"
                            ></div>
                        </div>

                        <!-- 持有收益率 -->
                        <div class="align-c flex1">
                            <div class="f12 h2-white mar-b4">{{ $t('holdingProfitRate') }}</div>
                            <div
                                class="f14 lh-20 c-main"
                                v-riseFall="{
                                    value: item.profitLossPercentage,
                                    hide: !showAsset,
                                    hideObj: { color: '#666', text: '****' },
                                }"
                            ></div>
                        </div>

                        <!-- 累计收益 -->
                        <div class="align-r flex1">
                            <div class="f12 h2-white mar-b4">{{ $t('cumulativeEarnings') }}</div>
                            <div
                                class="f14 lh-20 c-main"
                                v-riseFall="{
                                    value: item.accumulatedProfitLoss,
                                    hide: !showAsset,
                                    hideObj: { color: '#666', text: '****' },
                                    rate: false,
                                }"
                            ></div>
                        </div>
                    </div>

                    <div
                        v-if="showMore && (item.buyOnWayAmount || item.sellOnWayAmount)"
                        class="order-info flex-s"
                        :class="{
                            'mar-b16': item.starHolding.length === 0 && item.billHolding.length === 0,
                        }"
                    >
                        <!-- 买入待确认 -->
                        <div class="flex-c" v-if="item.buyOnWayAmount">
                            <div class="c-gray mar-r8">{{ $t('buyWait') }}</div>
                            <div
                                class="c-main"
                                v-riseFall="{
                                    value: item.buyOnWayAmount,
                                    hide: !showAsset,
                                    hideObj: { color: '#666', text: '****' },
                                    sign: false,
                                    riseFall: false,
                                    rate: false,
                                }"
                            ></div>
                        </div>

                        <!-- 卖出将到账 -->
                        <div class="flex-c" v-if="item.sellOnWayAmount">
                            <div class="c-gray mar-r8">{{ $t('sellWait') }}</div>
                            <div
                                class="c-main"
                                v-riseFall="{
                                    value: item.sellOnWayAmount,
                                    hide: !showAsset,
                                    hideObj: { color: '#666', text: '****' },
                                    sign: false,
                                    riseFall: false,
                                    rate: false,
                                }"
                            ></div>
                        </div>
                    </div>
                </div>

                <!-- 星财宝 -->
                <StarList :holdDataList="item.starHolding" v-if="showMore" />

                <!-- 票据 -->
                <!-- <BillList :holdDataList="item.billHolding" v-if="showMore" /> -->
            </div>
        </div>
    </div>
</template>

<script>
import StarList from './starList.vue'
import BillList from './billList.vue'
import { Sticky, Tabs, Tab } from 'vant'
import { CURRENCY_MAP, WEALTH_MAP } from '../config/common.js'
import { mapState } from 'vuex'
import { getHolding } from '@/apis/portfolio/index.js'

const holdingsGroupSortMap = {
    'Wealth-USD': 10,
    'Wealth-HKD': 9,
}

export default {
    components: {
        StarList,
        BillList,
        [Sticky.name]: Sticky,
        [Tabs.name]: Tabs,
        [Tab.name]: Tab,
    },
    data() {
        return {
            CURRENCY_MAP,
            WEALTH_MAP,
            holdingsGroup: [], // 持仓概览
            holdingsNum: 0, // 持仓数量
            showMore: true, // 折叠与展开状态
            tab: 'Wealth-ALL', // 选中的tab
            stickyContainer: null,
        }
    },
    computed: {
        ...mapState('user', ['showAsset']),
    },
    methods: {
        // 持仓概览
        async getHolding() {
            try {
                this.$loading.show = true
                const res = await getHolding()
                const { holdingsGroup } = res.result || {}

                // 筛选持仓数据类型为 Wealth-HKD, Wealth-USD
                this.holdingsGroup = holdingsGroup.filter(item => {
                    if (['Wealth-HKD', 'Wealth-USD'].includes(item.marketGroup)) {
                        // 理财持仓数量 9-星财宝
                        item.starHolding = item.holdings.filter(val => val.productType === 9)
                        // 理财持仓数量 4-票据
                        item.billHolding = item.holdings.filter(val => val.productType === 4)

                        // 持仓数量 = 星财宝 + 票据
                        this.holdingsNum += item.starHolding?.length + item.billHolding?.length
                        return item
                    }
                })

                // 美元优先显示
                // this.holdingsGroup.sort((a, b) => (holdingsGroupSortMap[b.marketGroup] || 0) - (holdingsGroupSortMap[a.marketGroup] || 0))
            } catch (err) {
                err?.error?.message && this.$toast(err?.error?.message)
            } finally {
                this.$loading.show = false
            }
        },

        // 昨日收益日期处理
        formatDate(val) {
            val = val ? val.substring(5) : ''
            return val.replace(/-/g, '/') || '--'
        },

        // 切换Tab
        changeTab(index) {
            this.tab = this.WEALTH_MAP.options[index].key
        },
    },
    created() {
        this.getHolding()
    },
    mounted() {
        this.stickyContainer = this.$parent.$parent.$refs.stickyContainer
    },
}
</script>

<style lang="less" scoped>
.holding-container {
    margin-top: 16px;

    .icon-arrow {
        width: 24px;
        height: 24px;
        transition: all 0.3s;

        &.hide {
            transform: rotate(180deg);
        }
    }

    .content {
        margin-bottom: 12px;
        overflow: hidden;
        background: #fff;
        border: 1px solid #fff;
        border-radius: 8px;
    }

    .block {
        padding: 16px 12px 0;
        background: linear-gradient(179deg, #fcf5ff 0.72%, #fff 39.89%);

        &.USD {
            background: linear-gradient(179deg, #f2f7ff 1.1%, #fff 30.36%);
        }
    }

    .icon-currency {
        width: 16px;
        height: 16px;
        margin-right: 6px;
    }

    .icon-circle {
        width: 2px;
        height: 2px;
        margin: 0 4px;
        background: #666;
        border-radius: 39px;
    }

    .border {
        box-shadow: 0 -0.5px 0 0 #efefef inset;
    }

    .order-info {
        height: 32px;
        padding: 0 8px;
        font-size: 12px;
        line-height: 16px;
        background: #f9f9f9;
        border-radius: 4px;
    }

    :deep(.van-tabs) {
        .van-tabs__nav {
            background: @bgGreyColor;
        }

        .van-tabs__line {
            display: none;
        }

        .van-tab {
            flex: 0 0 fit-content;
            align-items: center;
            height: 28px;
            margin-right: 8px;
            padding: 0 14px;
            color: #666;
            font-size: 13px;
            background: #efefef;
            border-radius: 25px;

            &.van-tab--active {
                color: #2f2f2f;
                font-weight: bold;
                background: rgba(218, 184, 102, 0.2);
            }
        }
    }
}

.sticky-container {
    /deep/ .van-sticky--fixed {
        top: 0;
        z-index: 1000;
        // prettier-ignore
        max-width: 750PX;
        margin: 0 auto;
        padding: 0 12px;
        background: #f6f6f6;

        .van-tabs__wrap {
            height: 38px;
        }
    }
}
</style>
