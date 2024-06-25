<!--
 * @Description: 调仓记录
-->

<template>
    <div class="pad-12">
        <van-list :loading="loading" :finished="finished" @load="getRebalancingList">
            <div class="bg-white pad-tb8 border-radius-8px mar-b12" v-for="(item, index) in records" :key="index">
                <van-sticky class="outter-sticky">
                    <div class="time f14">{{ item.date }}</div>
                </van-sticky>
                <rebalancingItem
                    v-for="(citem, index) in item.operations"
                    :key="index"
                    :rebalance="citem"
                    :borderBottomFlag="true && index !== item.operations.length - 1"
                ></rebalancingItem>
            </div>
            <div class="mar-t24 f12 c-gray line-height-18" v-show="hasInit && records.length">
                <p class="bold">{{ $t('follow.explain') }}</p>
                <p class="mar-t8">{{ $t('follow.rebalancingRecordsExplain') }}</p>
            </div>
        </van-list>

        <div class="noData" v-show="hasInit && records.length == 0">
            <multi-img class="noDataImg" name="noData" directory="common" alt="noData"></multi-img>
            <span>{{ $t('noRecord') }}</span>
        </div>
    </div>
</template>

<script>
import rebalancingItem from './components/rebalancingItem.vue'
import { RebalanceHistory } from '@/apis/followInvest/index.js'
import { Sticky } from 'vant'

export default {
    name: 'rebalancingRecords',
    components: {
        rebalancingItem,
        [Sticky.name]: Sticky,
    },
    data() {
        return {
            records: [],
            start: 0,
            count: 10,
            loading: false,
            finished: false,
            hasInit: false,
        }
    },
    methods: {
        async getRebalancingList() {
            try {
                this.loading = true
                const { result } = await RebalanceHistory({ id: Number(this.$route.query.portfolioId), start: this.start, count: this.count })
                const records = result?.records || []
                this.records = this.records.concat(records)
                if (records.length < this.count) {
                    this.finished = true
                } else {
                    this.start += this.count
                }
            } catch (e) {
                console.log('error', e)
                this.finished = true
            } finally {
                this.loading = false
                this.hasInit = true
            }
        },
    },
}
</script>

<style lang="less" scoped>
.pad-tb8 {
    padding: 8px 0;
}

.line-height-18 {
    line-height: 18px;
}

.bold {
    font-weight: 700;
}

/deep/ .outter-sticky {
    .van-sticky {
        background: #fff;

        &--fixed {
            box-shadow: 0 0.5px 0 #efefef;
        }
    }
}

.time {
    padding-left: 12px;
    color: #666;
    line-height: 40px;
}

.noData {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 56px 0;

    img {
        width: 104px;
        height: 104px;
        margin-bottom: 12px;
    }

    span {
        color: #9c9c9c;
        font-size: 14px;
        line-height: 20px;
    }
}
</style>
