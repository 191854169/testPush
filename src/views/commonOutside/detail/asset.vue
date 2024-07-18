<template>
    <!-- 资产 -->
    <div class="asset-container common-card">
        <div class="common-head flex-s">
            <div class="flex-c" @click="openPage">
                <div class="f16 c-main bold mar-r6">{{ $t('assets') }}</div>
                <multi-img name="icon_about" directory="commonOutside" class="icon-about"></multi-img>
            </div>
        </div>

        <van-swipe ref="swipe">
            <!-- 首屏 -->
            <van-swipe-item>
                <div class="swiper-container flex-s" v-if="filterDataList && filterDataList.length > 0">
                    <div class="container" v-for="item in filterDataList.slice(0, 1)" :key="item.currency">
                        <div class="block" @click="handleClick(item.currency)">
                            <!-- 资产类型 -->
                            <div class="flex-s pad-t4">
                                <div class="flex-c">
                                    <multi-img :name="`icon_${item.currency}`" directory="commonOutside" class="icon"></multi-img>
                                    <div class="f14 c-main bold">{{ CURRENCY_MAP[item.currency] }}{{ $t('assets') }}</div>
                                </div>
                                <div class="f12 c-gray">{{ CURRENCY_MAP[item.currency] }}</div>
                            </div>

                            <!-- 理财持仓 -->
                            <div class="item">
                                <div>{{ $t('wealthHolding') }}</div>
                                <div
                                    v-riseFall="{
                                        value: item.wealthMarketValue,
                                        hide: !showAsset,
                                        hideObj: { color: '#666', text: '****' },
                                        sign: false,
                                        riseFall: false,
                                        rate: false,
                                    }"
                                ></div>
                            </div>

                            <!-- 现金 -->
                            <div class="item">
                                <div>{{ $t('cash') }}</div>
                                <div
                                    v-riseFall="{
                                        value: item.availableBalance,
                                        hide: !showAsset,
                                        hideObj: { color: '#666', text: '****' },
                                        sign: false,
                                        riseFall: false,
                                        rate: false,
                                    }"
                                ></div>
                            </div>

                            <!-- 在途资金 -->
                            <div class="item">
                                <div class="c-gray">{{ $t('onWayMoney') }}</div>
                                <div
                                    class="c-gray"
                                    v-riseFall="{
                                        value: item.onWayBalance,
                                        hide: !showAsset,
                                        hideObj: { color: '#666', text: '****' },
                                        sign: false,
                                        riseFall: false,
                                        rate: false,
                                    }"
                                ></div>
                            </div>

                            <!-- 现金可提 -->
                            <div class="item">
                                <div class="c-gray">{{ $t('canUseCash') }}</div>
                                <div
                                    class="c-gray"
                                    v-riseFall="{
                                        value: item.availableWithdrawBalance,
                                        hide: !showAsset,
                                        hideObj: { color: '#666', text: '****' },
                                        sign: false,
                                        riseFall: false,
                                        rate: false,
                                    }"
                                ></div>
                            </div>

                            <!-- 冻结资金 -->
                            <div class="item">
                                <div class="c-gray">{{ $t('freezeCash') }}</div>
                                <div
                                    class="c-gray"
                                    v-riseFall="{
                                        value: item.frozenBalance,
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

                    <div class="container">
                        <div
                            class="block mini"
                            :class="{ 'mar-b8': index === 0 }"
                            v-for="(item, index) in filterDataList.slice(1)"
                            :key="item.currency"
                            @click="handleClick(item.currency)"
                        >
                            <!-- 资产类型 -->
                            <div class="flex-s pad-t4">
                                <div class="flex-c">
                                    <multi-img :name="`icon_${item.currency}`" directory="commonOutside" class="icon"></multi-img>
                                    <div class="f14 c-main bold">{{ CURRENCY_MAP[item.currency] }}{{ $t('assets') }}</div>
                                </div>
                                <div class="f12 c-gray">{{ CURRENCY_MAP[item.currency] }}</div>
                            </div>

                            <!-- 理财持仓 -->
                            <div class="item">
                                <div>{{ $t('wealthHolding') }}</div>
                                <div
                                    v-riseFall="{
                                        value: item.wealthMarketValue,
                                        hide: !showAsset,
                                        hideObj: { color: '#666', text: '****' },
                                        sign: false,
                                        riseFall: false,
                                        rate: false,
                                    }"
                                ></div>
                            </div>

                            <!-- 现金 -->
                            <div class="item">
                                <div>{{ $t('cash') }}</div>
                                <div
                                    v-riseFall="{
                                        value: item.availableBalance,
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
                </div>
            </van-swipe-item>

            <!-- 港元、美元、人民币依次展示 -->
            <van-swipe-item v-for="item in CURRENCY_LIST" :key="item.value">
                <div class="common-swipe">
                    <!-- 资产类型 -->
                    <div class="flex-s pad-t4">
                        <div class="flex-c">
                            <multi-img :name="`icon_${item.value}`" directory="commonOutside" class="icon"></multi-img>
                            <div class="f14 c-main bold">{{ item.text }}资产</div>
                        </div>
                        <div class="f12 c-gray">{{ item.text }}</div>
                    </div>

                    <!-- 理财持仓 -->
                    <div class="item">
                        <div>{{ $t('wealthHolding') }}</div>
                        <div
                            v-riseFall="{
                                value: assetsBreakdown[item.value].wealthMarketValue,
                                hide: !showAsset,
                                hideObj: { color: '#666', text: '****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                            }"
                        ></div>
                    </div>

                    <!-- 现金 -->
                    <div class="item">
                        <div>{{ $t('cash') }}</div>
                        <div
                            v-riseFall="{
                                value: assetsBreakdown[item.value].availableBalance,
                                hide: !showAsset,
                                hideObj: { color: '#666', text: '****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                            }"
                        ></div>
                    </div>

                    <!-- 在途资金 -->
                    <div class="item">
                        <div class="c-gray">{{ $t('onWayMoney') }}</div>
                        <div
                            class="c-gray"
                            v-riseFall="{
                                value: assetsBreakdown[item.value].onWayBalance,
                                hide: !showAsset,
                                hideObj: { color: '#666', text: '****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                            }"
                        ></div>
                    </div>

                    <!-- 现金可提 -->
                    <div class="item">
                        <div class="c-gray">{{ $t('canUseCash') }}</div>
                        <div
                            class="c-gray"
                            v-riseFall="{
                                value: assetsBreakdown[item.value].availableWithdrawBalance,
                                hide: !showAsset,
                                hideObj: { color: '#666', text: '****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                            }"
                        ></div>
                    </div>

                    <!-- 冻结资金 -->
                    <div class="item">
                        <div class="c-gray">{{ $t('freezeCash') }}</div>
                        <div
                            class="c-gray"
                            v-riseFall="{
                                value: assetsBreakdown[item.value].frozenBalance,
                                hide: !showAsset,
                                hideObj: { color: '#666', text: '****' },
                                sign: false,
                                riseFall: false,
                                rate: false,
                            }"
                        ></div>
                    </div>
                </div>
            </van-swipe-item>
        </van-swipe>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { Swipe, SwipeItem } from 'vant'
import { CURRENCY_MAP, CURRENCY_LIST, SWIPE_MAP } from '../config/common.js'
import { getLangType } from '@/utils/tools'

export default {
    props: {
        assetsBreakdown: {
            type: Object,
            default: () => {},
        },
        filterDataList: {
            type: Array,
            default: () => [],
        },
    },
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
    },
    data() {
        return {
            CURRENCY_MAP,
            CURRENCY_LIST,
            SWIPE_MAP,
        }
    },
    computed: {
        ...mapState('user', ['showAsset']),
    },
    methods: {
        // 点击首屏swipe资产小卡片滑动到对应的swipe
        handleClick(currency) {
            const index = this.SWIPE_MAP[currency]
            this.$refs.swipe.swipeTo(index)
        },
        openPage() {
            const url = 'https://h5.fotechwealth.com/faq/#/article/490702228690304000/1?langType=' + getLangType()
            this.$goPage(url)
        },
    },
}
</script>

<style lang="less" scoped>
.asset-container {
    padding: 8px 0;

    .common-head {
        padding: 0 12px;
    }
}

.common-swipe {
    height: 188px;
    margin: 6px 12px 0;
    padding: 6px 12px;
    background: #f9f9f9;
    border-radius: 6px;

    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 10px;
        color: #2f2f2f;
        font-size: 14px;
        line-height: 20px;
    }

    .icon {
        width: 16px;
        height: 16px;
        margin-right: 4px;
    }
}

.swiper-container {
    height: 188px;
    margin: 6px 12px 0;

    .container {
        width: calc(50% - 4px);
        height: 100%;
    }

    .block {
        height: 100%;
        padding: 6px 8px;
        background: #f9f9f9;
        border-radius: 6px;

        &.mini {
            height: calc(50% - 4px);

            .item {
                padding-top: 12px;
            }
        }
    }

    .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 14px;
        color: #2f2f2f;
        font-size: 12px;
        line-height: 16px;
    }

    .icon {
        width: 16px;
        height: 16px;
        margin-right: 5px;
    }
}

:deep(.van-swipe) {
    padding-bottom: 20px;

    .van-swipe__indicators {
        bottom: 4px;

        .van-swipe__indicator {
            width: 8px;
            height: 2px;
            background: #9c9c9c;
            border-radius: 0;
            opacity: 0.4;

            &:not(:last-child) {
                margin-right: 4px;
            }

            &.van-swipe__indicator--active {
                background: #2f2f2f;
                opacity: 1;
            }
        }
    }
}
</style>
