<template>
    <div class="card tjlist">
        <div class="title">
            <div class="left">
                <span>{{ $t('follow.rebalancingRecords') }}</span>
                <span class="date">{{ date && `(${date})` }}</span>
            </div>
            <div class="right" @click="toMorePage()" v-if="!hideFlag && total">
                <span class="txt">{{ $t('loadingMore') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <div class="pos-r">
            <template v-if="total">
                <div v-if="!hideFlag" class="f12 lh-32 pad-l12 sub-title">{{ $t('follow.rebalanceText', { total: total }) }}</div>
                <div class="pos-r">
                    <div :class="{ hide: hideFlag }">
                        <rebalancing-item
                            v-for="(citem, index) in list"
                            :key="index"
                            :rebalance="citem"
                            :borderBottomFlag="true && index !== list.length - 1"
                        ></rebalancing-item>
                    </div>
                    <account-mask v-if="hideFlag" />
                </div>
            </template>
            <div class="no-data" v-else>
                <Empty :showImg="true" :tipText="$t('fundList.noRecord')" height="auto" />
            </div>
        </div>
    </div>
</template>

<script>
import rebalancingItem from './rebalancingItem.vue'
import accountMask from './accountMask.vue'
import Empty from '@/components/Empty.vue'
import { RebalanceHistory } from '@/apis/followInvest/index.js'

export default {
    name: 'rebalancingRecords',
    components: {
        rebalancingItem,
        accountMask,
        Empty,
    },
    data() {
        return {
            list: [{ currency: 'HKD' }, { currency: 'HKD' }, { currency: 'USD' }],
            hideFlag: true,
            total: 0,
            date: '',
        }
    },
    watch: {
        '$root.isLogin': {
            handler(v) {
                if (typeof v === 'boolean') {
                    this.hideFlag = !this.$root.isLogin
                    if (this.hideFlag) {
                        this.getMockData()
                    } else {
                        this.getData()
                    }
                }
            },
            immediate: true,
        },
    },
    created() {
        this.hideFlag = !this.$root.isLogin
        if (this.hideFlag) {
            this.getMockData()
        } else {
            this.getData()
        }
    },
    methods: {
        toMorePage() {
            const url = `${location.origin}${location.pathname}#/follow-rebalancing-records?portfolioId=${this.$route.query.portfolioId}`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/follow-rebalancing-records',
                    query: {
                        portfolioId: this.$route.query.portfolioId,
                    },
                })
            }
        },
        getMockData() {
            this.list = Array.from({ length: 3 }).map((_, idx) => ({ productName: '高腾', productCode: 'hhddss', currency: idx > 3 ? 'HKD' : 'USD' }))
            this.total = 3
        },
        // 调仓操作历史，接口无数据，待处理
        async getData() {
            try {
                const { result } = await RebalanceHistory({
                    id: this.$route.query.portfolioId,
                    start: 0,
                    count: 5,
                })
                const records = result?.records || []
                this.list = records.map(i => i.operations).flat()
                if (this.list.length > 5) {
                    this.list = this.list.slice(0, 5)
                }
                this.total = result?.total
                this.date = records?.[0]?.date
                console.log('RebalanceHistory', result)
            } catch (e) {
                console.log('eror', e)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.sub-title {
    padding-left: 12px;
    line-height: 32px;
    #font_h2();
}

.card {
    #foreground();

    border-radius: 8px;

    &.shadow {
        background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
        box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
        backdrop-filter: blur(27px);
    }
}

.hide {
    filter: blur(6px);
}

.no-data {
    padding: 36px 0 12px;
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
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        white-space: nowrap;
        text-overflow: ellipsis;
        #font_h1();

        .left {
            display: flex;
            align-items: center;

            .date {
                margin-left: 8px;
                color: @fontLightColor;
                color: @h3-white;
                font-weight: normal;
                font-size: 12px;
                line-height: 16px;
                text-align: right;
            }
        }

        .right {
            display: flex;
            align-items: center;
            color: @h3-white;
            font-weight: 400;
            font-size: 12px;
            font-family: 'PingFang SC';
            line-height: 22px;

            .arrowicon {
                width: 12px;
                height: 12px;
                vertical-align: middle;
            }

            .txt {
                margin-right: 3px;
                vertical-align: middle;
            }
        }
    }
}
</style>
