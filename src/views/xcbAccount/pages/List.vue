// 产品列表页
<template>
    <van-pull-refresh
        class="refresh-content"
        v-model="isLoading"
        @refresh="onRefresh"
        :pulling-text="$t('pullRefresh')"
        :loosing-text="$t('relessRefresh')"
        :loading-text="`${$t('loading')}...`"
    >
        <template slot="loading">
            <div class="loading-text">
                <multi-img class="loading-icon" width="20" height="20" name="icon-footer-loading" directory="fund" />
                <span>{{ `${$t('loading')}...` }}</span>
            </div>
        </template>
        <div class="page">
            <div class="banner">
                <multi-img class="banner-img" name="ssa_list_bg" directory="xcbAccount"></multi-img>
                <div class="banner-content">
                    <p>{{ $t('starSpecial') }}</p>
                    <p>{{ $t('list.starSpecialDesc') }}</p>
                </div>
                <div class="banner-bottom-desc" :class="{ hide: !isProfessional }">
                    <div class="banner-bottom-desc-item" v-for="item in bottomItems" :key="item.imgName">
                        <multi-img :name="item.imgName" directory="xcbAccount"></multi-img>
                        <div>{{ item.label }}</div>
                    </div>
                </div>

                <div class="guide mg-b12" @click="goOrderList()">
                    <div class="left">
                        <span>{{ $t('viewOrders') }}</span>
                    </div>
                    <div class="right">
                        <multi-img class="next" name="icon_right_arrow_16" directory="common" />
                    </div>
                </div>
            </div>
            <div class="page-body">
                <div class="card-title">
                    <div>{{ $t('list.featuredServices') }}</div>
                </div>
                <section v-if="list.length !== 0">
                    <div class="list-card" v-for="(item, index) in list" :key="`${index}_${item.productCode}_tag_3`">
                        <InfoCard
                            class="info-card"
                            :item="item"
                            :serverTime="item.serverTime"
                            :isProfessional="isProfessional"
                            @willVerify="gotoVerify()"
                            @goDetails="goDetails(item)"
                        ></InfoCard>
                    </div>
                </section>

                <div v-if="endList.length !== 0" class="mar-lr12 mar-t12">
                    <van-swipe v-if="isProfessional" class="my-swipe" :autoplay="0">
                        <van-swipe-item v-for="item in endList" :key="item.productCode">
                            <InfoCard
                                isEnd
                                :item="item"
                                :isProfessional="isProfessional"
                                :only-end="onlyEndList"
                                @willVerify="gotoVerify()"
                                @goDetails="goDetails(item)"
                            ></InfoCard>
                        </van-swipe-item>
                    </van-swipe>

                    <div v-else>
                        <InfoCard
                            isEnd
                            :item="endList[0]"
                            :isProfessional="isProfessional"
                            :only-end="onlyEndList"
                            @willVerify="gotoVerify()"
                            @goDetails="goDetails(item)"
                        ></InfoCard>
                    </div>
                </div>

                <div class="no-data" v-if="list.length === 0 && endList.length === 0">
                    <Empty :showImg="true" :tip-text="$t('list.nodata')" imgName="empty-status" height="auto" />
                </div>
                <div class="mar-lr12 mar-t12">
                    <InfoCard class="info-card" isAbout :isProfessional="isProfessional" @willVerify="gotoVerify()" @goDetails="goAbout"></InfoCard>
                </div>
            </div>
        </div>
    </van-pull-refresh>
</template>

<script>
import InfoCard from '../components/InfoCard.vue'
import { SwipeItem, Swipe, PullRefresh } from 'vant'
import Empty from '@/components/Empty.vue'
import { ssaProductList } from '@/apis/xjb'
import { PRODUCT_SUBSCRIBE_STATUS_MAP, PRODUCT_TAG_MAP } from '../config/common.js'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import PrivateMixin from '../mixin/privateMixin.js'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'

export default {
    name: 'list',
    components: {
        InfoCard,
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        [PullRefresh.name]: PullRefresh,
        Empty,
    },
    mixins: [PrivateMixin, checkPIMixin, watchPageVisibleMixin],
    data() {
        return {
            list: [],
            endList: [],
            isLoading: false,
            bottomItems: [
                {
                    imgName: 'icon_bottom_desc1',
                    label: this.$t('list.bottomDesc1'),
                },
                {
                    imgName: 'icon_bottom_desc2',
                    label: this.$t('list.bottomDesc2'),
                },
                {
                    imgName: 'icon_bottom_desc3',
                    label: this.$t('list.bottomDesc3'),
                },
            ],
        }
    },
    mounted() {},
    created() {
        this.getListResult()
        this.watch(() => {
            this.getListResult()
        })
    },
    computed: {
        hotList() {
            // 热门认购
            return this.list.filter(
                item => item.tags.includes(PRODUCT_TAG_MAP.Hot) && item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.SUBSCRIBING
            )
        },
        featuredList() {
            // 精选认购
            return this.list.filter(
                item => item.tags.includes(PRODUCT_TAG_MAP.Choiceness) && item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.SUBSCRIBING
            )
        },
        upcomingList() {
            // 即将认购
            return this.list.filter(item => item.subscriptionStatus === PRODUCT_SUBSCRIBE_STATUS_MAP.TO_BE_SUBSCRIBE)
        },

        showFeaturedTitle() {
            // 认购列表，精选列表模块展示自己的标题
            if (this.hotList.length !== 0) {
                return true
            }
            return false
        },
        showUpcomingTitle() {
            // 认购列表或者精选列表不为空，即将认购模块展示自己的标题
            if (this.hotList.length !== 0 || this.featuredList.length !== 0) {
                return true
            }
            return false
        },
        onlyEndList() {
            return this.list.length === 0 && this.endList.length > 0
        },
    },
    methods: {
        goIntroductionPage() {
            this.$goPage('/about')
        },
        goOrderList() {
            if (!this.isProfessional) {
                this.gotoVerify()
                return
            }
            this.$goPage('/order-list')
        },
        goDetails(item) {
            if (!this.isProfessional) return
            this.$goPage('/detail', { productCode: item.productCode })
        },
        goAbout() {
            if (!this.isProfessional) return
            this.$goPage('/about')
        },
        async getListResult() {
            // tab类型，2：即将认购，3：认购中，4：认购结束，支持多选，
            Promise.all([ssaProductList({ subscriptionStatus: '2,3' }), ssaProductList({ subscriptionStatus: '4', sortFlag: 1, count: 3 })])
                .then(([resp, endResp]) => {
                    this.list = resp.result?.list || []
                    this.endList = endResp.result?.list || []
                    console.log('getListResult', resp.result, endResp.result)
                })
                .catch(e => {
                    this.list = []
                    console.error('eror', e)
                })
                .finally(() => {
                    this.isLoading = false
                })
        },

        onRefresh() {
            this.isLoading = true
            this.getListResult()
        },
    },
}
</script>

<style scoped lang="less">
.page {
    min-height: 100vh;
    background: #f3e1c6;
    user-select: none;
    #iosBottom(42px);
}

.refresh-content {
    // 下面两属性修复，下拉刷新组件在 iOS 上出现上拉卡顿的问题
    min-height: 100vh;
    overflow: hidden;

    /deep/ .loading-text {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        min-height: 20px;

        .loading-icon {
            margin-right: 12px;
            animation: circle 1.5s infinite linear;
        }

        span {
            display: inline-block;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }
    }

    @keyframes circle {
        0% {
            transform: rotate(0deg);
        }

        25% {
            transform: rotate(90deg);
        }

        50% {
            transform: rotate(180deg);
        }

        75% {
            transform: rotate(270deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
}

.banner {
    position: relative;
    z-index: 10;
    width: 100%;

    .banner-img {
        width: 100%;
        height: 200px;
    }

    .zhaiquan {
        position: absolute;
        top: 3px;
        right: 17px;
        width: 189px;
        height: 130px;
    }

    .banner-content {
        position: absolute;
        top: 42px;
        left: 24px;
        display: flex;
        flex-direction: column;

        p:nth-child(1) {
            margin-bottom: 6px;
            color: #a34400;
            font-weight: bold;
            font-size: 34px;
            line-height: 44px;
        }

        p:nth-child(2) {
            color: #a34400;
            font-weight: 400;
            font-size: 15px;
            line-height: 21px;
        }
    }

    .banner-bottom-desc {
        position: absolute;
        bottom: 39px;
        left: 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 48px);

        .banner-bottom-desc-item {
            display: flex;
            align-items: center;
            color: #a34400;
            font-size: 11px;
            line-height: 16px;
            text-align: left;

            img {
                width: 12px;
                height: 12px;
                margin-right: 4px;
            }
        }

        &.hide > * {
            filter: blur(3px);
        }
    }

    .guide {
        position: absolute;
        bottom: -24px;
        z-index: 11;
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - 32px);
        height: 48px;
        margin: 0 16px;
        padding: 0 12px;
        font-weight: 400;
        font-size: 14px;
        line-height: 48px;
        background: linear-gradient(180deg, #f7e9d4 0%, #fff 51.04%, #fff 100%);
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #fff;
        backdrop-filter: blur(27.1828px);

        .left {
            display: flex;
            align-items: center;
            color: #2f2f2f;
        }

        .right {
            display: flex;
            align-items: center;
            height: 20px;
            color: #ff6907;
            font-weight: 400;

            span:first-of-type {
                margin-right: 4px;
                font-size: 14px;
                line-height: 20px;
            }

            .next {
                width: 12px;
                height: 12px;
            }
        }
    }
}

.card-title {
    margin: 45px 16px 12px 18px;
    font-weight: bold;
    font-size: 16px;
    line-height: 22px;
}

.list-card {
    margin: 0 12px;

    .info-card {
        margin-bottom: 12px;
    }
}

.my-swipe {
    background: #f3e1c6;
    overflow-y: visible;
    padding-top: 3px;
}

/deep/ .van-swipe {
    &__indicators {
        bottom: 16px;
    }

    &__indicator {
        width: 4px;
        height: 4px;
        border-radius: 0;
        #swipe_background();

        &:not(:last-child) {
            margin-right: 5px;
        }
    }

    &__indicator--active {
        #swipe_active_background();

        width: 8px;
    }
}

.no-data {
    margin: 0 12px;
    padding: 97px 0 129px;
    background-color: #fff;
    border-radius: 8px;
}
</style>
