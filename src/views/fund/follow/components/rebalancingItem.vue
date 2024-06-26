<template>
    <div class="pad-rl12" @click.stop="goDetail">
        <div class="rebalancing-item pad-tb12 flex c-main" :class="{ 'border-bottom-1px': borderBottomFlag }">
            <div class="flex1 flex-c">
                <div class="flex1">
                    <div class="f14 mar-b6 flex-c" :style="{ width: width }">
                        <tag :text="rebalance.optType" class="outter-tag" :textColor="textColor" :backgroundColor="backgroundColor" />
                        <div class="elipsis" :style="{ width: '1.55rem' }">{{ rebalance.productName }}</div>
                    </div>
                    <div class="flex-c bottom">
                        <span :class="currencyClass"></span>
                        <span class="code c-gray f12 mar-l2">{{ rebalance.productCode }}</span>
                    </div>
                </div>
                <div>
                    <div class="flex-c f14 mar-b6" style="justify-content: flex-end">
                        <span>{{ rebalance.ratioBeforeOpt }}</span>
                        <multi-img class="icon" name="icon_adjustment" directory="common" alt=""></multi-img>
                        <span>{{ rebalance.ratioAfterOpt }}</span>
                    </div>
                    <div class="f12 c-gray" style="text-align: right">
                        {{ referenceLabel }}
                        <span
                            v-if="rebalance.status === 10"
                            v-riseFall="{ value: rebalance.refPrice, sign: false, base: 3, rate: false, riseFall: false }"
                        ></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import tag from '@/components/Tag.vue'

export default {
    name: 'rebalancingItem',
    components: {
        tag,
    },
    props: {
        borderBottomFlag: {
            type: Boolean,
            default: false,
        },
        width: {
            type: String,
            default: '1.87rem',
        },
        rebalance: {
            type: Object,
            default: () => {
                return {}
            },
        },
    },
    data() {
        return {
            hk: 'HK',
        }
    },
    computed: {
        textColor() {
            return (
                {
                    1: '#FF6907',
                    2: '#29C277',
                }[this.rebalance.optType] || ''
            )
        },
        backgroundColor() {
            return (
                {
                    1: 'rgba(255, 105, 7, 0.1)',
                    2: 'rgba(41, 194, 119, 0.1)',
                }[this.rebalance.optType] || ''
            )
        },
        isFund() {
            return this.rebalance.productType === 3
        },
        currencyClass() {
            if (this.isFund) {
                return `currency-${this.rebalance?.currency?.toLocaleUpperCase()}`
            }
            return `market-${this.rebalance?.market?.toLocaleUpperCase()}`
        },
        referenceLabel() {
            // 1-预调仓(中台), 5-预调仓(H5), 10-调仓完成, 20-已取消
            if (this.rebalance.status === 5) {
                return this.$t('follow.waitText')
            } else if (this.rebalance.status === 20) {
                return this.$t('follow.canceled')
            }
            return this.isFund ? this.$t('follow.recommondPureNumber') : this.$t('follow.recommondPrice')
        },
    },
    methods: {
        goDetail() {
            console.log('rebalance ==>', this.rebalance)
            if (this.rebalance.productType === 3) {
                const url = `${location.origin}/wealth/fund.html#/detail?symbol=${this.rebalance.fundID}&type=public`
                if (this.$jsBridge) {
                    this.$jsBridge.open({ url: encodeURIComponent(`${url}`), title: '' })
                } else {
                    this.$router.push({
                        path: `/detail`,
                        query: {
                            portfolioId: this.rebalance.fundID,
                            type: 'public',
                        },
                    })
                }
                return
            }
            this.$jsBridge?.goPage(`stockQuote?stockId=${this.rebalance.market}${this.rebalance.productCode}`)
        },
    },
}
</script>

<style lang="less" scoped>
.rebalancing-item {
    height: 60px;

    .outter-tag {
        flex-shrink: 0;
        margin-right: 4px;
        padding: 2px 0;
    }

    .bottom {
        margin-left: 32px;

        .code {
            line-height: 16px;
        }
    }
}

.icon {
    width: 14px;
    height: 14px;
    margin: 0 4px;
}

.mar-l2 {
    margin-left: 2px;
}
</style>
