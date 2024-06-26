<template>
    <div class="similar-fund card">
        <header>
            <h3 class="title">{{ $t('radar.similarFund') }}</h3>
        </header>
        <div class="content">
            <van-list :loading="loading" :finished="finished" @load="getData">
                <ul class="fund-list" v-if="list.length" @click="goFundDetail">
                    <li class="fund-list-item mask" v-for="item in list" :key="item.symbol" :data-symbol="item.symbol">
                        <div class="left">
                            <div class="top">
                                <h3 class="fund-name">{{ item.name }}</h3>
                            </div>
                            <div class="bottom">
                                <ul class="tags">
                                    <li :class="`currency-${item.currency} currency`"></li>
                                    <li class="tag">{{ item.fundType | fundTypeFilter }}</li>
                                    <li class="tag">{{ item.riskRating | riskRatingFilter }}</li>
                                    <li class="tag">
                                        {{ item.minInitial | thousandsFilter }}{{ item.currency | currencyFilter }}{{ $t('radar.startAmount') }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="right">
                            <div class="value" v-riseFall="{ value: item.returnY3, base: 2 }"></div>
                            <div class="label">{{ $t('radar.nearThreeYearRiseFall') }}</div>
                        </div>
                    </li>
                </ul>
                <f-empty v-else></f-empty>
            </van-list>
        </div>
    </div>
</template>

<script>
import { getRadarSimilar } from '@/apis/fund/fund'
import FEmpty from '@/components/Empty.vue'
import { FUND_TYPE_MAP, RISK_RATING_MAP, CURRENCY_MAP } from '../../config/common'
import {} from 'vant'
export default {
    name: 'similar-fund',
    components: { FEmpty },
    props: {
        period: {
            type: String,
            defaut: 'y3',
        },
    },
    data() {
        return {
            list: [],
            loading: false,
            finished: false,
            currentPage: 1,
            count: 10,
        }
    },
    watch: {
        period() {
            console.log('period', this.period)
            this.currentPage = 1
            this.finished = false
            this.list = []
            this.getData()
        },
    },
    filters: {
        fundTypeFilter(v) {
            return FUND_TYPE_MAP.options.findLabel(v, '')
        },
        riskRatingFilter(v) {
            return RISK_RATING_MAP.options.findLabel(v, '')
        },
        currencyFilter(v) {
            return CURRENCY_MAP.options.findLabel(v, '')
        },
    },
    methods: {
        async getData() {
            this.loading = true
            this.$loading.show = true
            try {
                const params = {
                    symbol: this.$route.query.symbol,
                    period: this.period,
                    start: (this.currentPage - 1) * this.count + 1,
                    count: this.count,
                }
                const { result } = await getRadarSimilar(params)
                this.list = (this.list || []).concat(result?.list || [])
                if (result.list.length < this.count) {
                    this.finished = true
                } else {
                    this.currentPage += 1
                }
            } catch (e) {
                console.error(e)
                this.finished = true
            } finally {
                this.loading = false

                this.$loading.show = false
            }
        },
        goFundDetail(e) {
            const { symbol } = e.target.dataset
            if (!symbol) return
            const url = `${location.origin}${location.pathname}#/detail?symbol=${symbol}&type=public`
            if (this.$jsBridge) {
                return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            }
            this.$router.push(`/detail?symbol=${symbol}&type=public`)
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px 12px 0;
    padding: 15px 12px 12px;
    background: #fff;
    border-radius: 8px;
    user-select: none;
}

.similar-fund {
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }
    }

    .content {
        .fund-list {
            &-item {
                position: relative;
                display: flex;
                justify-content: space-between;
                padding: 9px 0;
                box-shadow: inset 0 0 0 #fff, inset 0 0 0 #fff, inset 0 -0.5px 0 #efefef;

                &.mask::after {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 11;
                    content: '';
                }

                .left {
                    .top {
                        .fund-name {
                            color: #2f2f2f;
                            font-size: 16px;
                            line-height: 22px;
                        }
                    }

                    .bottom {
                        margin-top: 3px;

                        .tags {
                            display: flex;
                            align-items: center;

                            .currency {
                                margin-right: 4px;
                            }

                            .tag {
                                position: relative;
                                margin-right: 8px;
                                color: #9c9c9c;
                                font-size: 10px;
                                line-height: 12px;

                                &:not(:last-child) {
                                    &::after {
                                        position: absolute;
                                        top: 50%;
                                        right: -4px;
                                        width: 1px;
                                        height: 8px;
                                        background: #9c9c9c;
                                        transform: scaleX(0.5) translateY(-50%);
                                        content: '';
                                    }
                                }
                            }
                        }
                    }
                }

                .right {
                    text-align: right;

                    .value {
                        color: #ff6907;
                        font-size: 14px;
                        line-height: 20px;
                    }

                    .label {
                        margin-right: 2px;
                        color: #9c9c9c;
                        font-size: 12px;
                        line-height: 16px;
                    }
                }
            }
        }
    }
}
</style>
