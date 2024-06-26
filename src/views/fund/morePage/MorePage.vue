<template>
    <div class="more-page">
        <div class="tips">
            <p v-if="isMore">{{ $t('fundText12') }}</p>
            <div v-else>
                {{ $t('fundText13') }}
                <p>・{{ $t('fundText14') }}</p>
                <p>・{{ $t('fundText15') }}</p>
            </div>
        </div>
        <div class="card tjlist">
            <van-list
                v-model="vanloading"
                :finished="finished"
                finished-text=""
                :immediate-check="false"
                :loading-text="$t('loading')"
                @load="onLoad"
            >
                <div class="fund-item" v-for="(item, idx) in advancedInvestList" :key="idx" @click="gotoFundDetail(item)">
                    <!-- <van-skeleton row="4" :loading="loading"> -->
                    <div class="content">
                        <div class="fund-item-left">
                            <p class="rate" v-riseFall="item.returnY3"></p>
                            <p class="type">近3年{{ $t('priceChange') }}</p>
                        </div>
                        <div class="fund-item-right">
                            <h3 class="title_">{{ item.name }}</h3>
                            <div class="descript">
                                <span>{{ item.currency }}</span>
                                <span>{{ fundObj[item.fundType] }}</span>
                                <span>{{ riskRatingObj[item.riskRating] }}</span>
                                <span>{{ item.minInitial | thousandsFilter }}{{ item.currency | currencyFilter }}起投</span>
                            </div>
                        </div>
                    </div>
                    <div class="bot" v-if="isMore">
                        <img class="arrowicon" src="~@/assets/images/fund/likes.png" />
                        <p>{{ $t('fundText18') }}谷歌、亚马逊、联合健康</p>
                    </div>
                    <!-- </van-skeleton> -->
                </div>
            </van-list>
        </div>
        <!-- <loading :propsShow="true" :showLoading="showLoading"/> -->
    </div>
</template>
<script>
import { getRecommendList } from '@/apis/fund/fund.js'
import { Skeleton } from 'vant'
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
export default {
    name: 'MorePage',
    components: {
        [Skeleton.name]: Skeleton,
    },
    data() {
        return {
            loading: true,
            symbol: this.$route.query.symbol,
            type: this.$route.query.type,
            showLoading: false,
            canPullUp: true,
            start: 1,
            count: 0,
            list: [],
            rowClass: 'history-page__row',
            titleClass: 'history-page__title',
            advancedInvestList: [],
            fundObj: {
                1: this.$t('stockType'),
                2: this.$t('bondType'),
                3: this.$t('mixedType'),
                4: this.$t('currencyType'),
            },
            riskRatingObj: {
                1: this.$t('lowRisk'),
                2: this.$t('middleLowRisk'),
                3: this.$t('middleRisk'),
                4: this.$t('middleHighRisk'),
                5: this.$t('highRisk'),
            },
            vanloading: false,
            finished: false,
        }
    },
    filters: {
        currencyFilter,
    },
    computed: {
        isCurrencyHistory() {
            if (this.$route.query.currencyHistory == 1) {
                document.title = this.$t('hisDay7Annual')
                return true
            }
            document.title = this.$t('historyNet')
            return false
        },
        isMore() {
            return this.$route.query.isMore == 1
        },
    },
    mounted() {
        this.getRecommendList()
    },
    methods: {
        async onLoad() {
            await this.getRecommendList()
        },
        //千分位显示
        setThousand(num) {
            return thousandsFilter(num)
        },
        async getRecommendList() {
            try {
                this.count += 10
                const HOT_FUND = 1 // 热门基金
                const ADVANCED_FUND = 2 // 进取型基金
                const STEADY_FUND = 3 // 稳健型基金
                const SPARE_FUND = 4 // 闲钱理财
                // const SREENGTH_FUND = 5 // 业绩实力榜
                // const HIGH_FUND = 6 // 高收益风险比榜
                // const OLD_FUND = 7 // 绩优老基榜
                // const PAYOUT_FUND = 8 // 派息基金榜
                // const types = [HOT_FUND, ADVANCED_FUND, STEADY_FUND, SPARE_FUND, SREENGTH_FUND, HIGH_FUND, OLD_FUND, PAYOUT_FUND]
                let { result } = (await getRecommendList({ type: ADVANCED_FUND, start: this.start, count: this.count })) || {}
                result = result || {}
                const list = result.list || []
                list.forEach(i => {
                    // eslint-disable-next-line default-case
                    switch (i.type) {
                        case HOT_FUND:
                            this.hotFundList.push(...i.info)
                            break
                        case ADVANCED_FUND:
                            this.advancedInvestList = [...i.info]
                            break
                        case STEADY_FUND:
                            this.steadyFundList.push(...i.info)
                            break
                        case SPARE_FUND:
                            this.spareFundList.push(...i.info)
                            break
                    }
                })
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
                this.vanloading = false
                // 数据全部加载完成
                if (this.advancedInvestList.length < this.count) {
                    this.finished = true
                }
            }
        },
        getTempList(length) {
            return Array.from({ length }).map(() => ({}))
        },
        gotoFundDetail(item, type) {
            type =
                type ||
                {
                    0: 'public',
                    1: 'private',
                }[item.fundMode]
            if (!(type && item.symbol)) return
            const url = `${location.origin}/wealth/fund.html#/detail?type=${type}&symbol=${item.symbol}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push(`/detail?type=${type}&symbol=${item.symbol}`)
            }
        },
    },
}
</script>
<style lang="less">
.history-page__row {
    height: 40px !important;
    color: #2f2f2f;
    font-size: 14px !important;
}

.history-page__title {
    width: 157px !important;
}

.history-page__columns__fixed {
    width: 157px !important;
    text-align: left;
}

.history-page__columns__scroll {
    width: 85px !important;
}
</style>
<style lang="less" scoped>
/deep/ .box {
    .scroll {
        .scroll-title-container {
            left: 157px;
        }
    }
}
</style>
<style scoped lang="less">
@white: #fff;

.more-page {
    display: inline-block;
    width: calc(100% - 24px);
    height: calc(100% - 24px);
    margin: 12px;
    padding: 8px 0;
    overflow: auto;
    border-radius: 8px;

    .tips {
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;

        div,
        p {
            line-height: 18px;
        }
    }

    .table-content {
        height: 100%;
    }

    .card {
        margin-top: 12px;
        border-radius: 8px;

        &.shadow {
            background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
            box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
            backdrop-filter: blur(27px);
        }
    }

    .tjlist {
        padding: 8px 0 12px;

        .title {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 12px 12px 0;
            overflow: hidden;
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            white-space: nowrap;
            text-overflow: ellipsis;

            .right {
                color: #666;
                font-weight: 400;
                font-size: 12px;
                font-family: 'PingFang SC';
                line-height: 22px;

                .arrowicon {
                    width: 12px;
                    height: 12px;
                    vertical-align: middle;
                }
            }
        }

        .fund-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 12px;
            padding: 16px 12px;
            overflow: hidden;
            background: @white;
            border-radius: 8px;

            .content {
                display: flex;
                flex-direction: row;

                .fund-item-left {
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    min-width: 60px;
                    margin-right: 15px;

                    .rate {
                        color: #1f1f1f;
                        font-weight: 600;
                        font-size: 16px;
                        line-height: 22px;
                    }

                    .type {
                        margin-top: 4px;
                        color: #9c9c9c;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;
                    }
                }

                .fund-item-right {
                    .title_ {
                        padding-left: 5px;
                        color: #2f2f2f;
                        font-weight: 500;
                        font-size: 15px;
                        line-height: 23px;
                    }

                    .descript {
                        display: flex;
                        margin-top: 6px;

                        span {
                            display: inline-block;
                            flex-shrink: 0;
                            height: 11px;
                            padding: 0 4px;
                            color: #9c9c9c;
                            font-weight: 400;
                            font-size: 12px;
                            line-height: 12px;
                            border-right: 0.5px solid #b6b6b6;
                        }

                        span:last-child {
                            flex: 1;
                            height: 12px;
                            padding: 0 0 0 5px;
                            line-height: 12px;
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            border-right: none;
                        }
                    }
                }
            }

            .bot {
                display: flex;
                flex-direction: row;
                margin-top: 14px;
                padding: 6px 12px;
                color: #666;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
                background: #f9f9f9;
                border-radius: 4px;

                img {
                    width: 16px;
                    height: 16px;
                    margin-right: 8px;
                }
            }
        }
    }
}
</style>
