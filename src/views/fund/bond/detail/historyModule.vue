<template>
    <div class="bond-history">
        <header>
            <span :class="{ 'henader-checker': activeHeader === 1 }" @click="activeHeader = 1">{{ $t('historyTrend') }}</span>
            <span :class="{ 'henader-checker': activeHeader === 2 }" @click="activeHeader = 2">{{ $t('historyPrice') }}</span>
        </header>
        <div class="content" v-show="activeHeader === 1">
            <history-trend ref="historyTrendRef"></history-trend>
        </div>
        <div class="content" v-show="activeHeader === 2">
            <history-price></history-price>
        </div>
    </div>
</template>
<script>
import historyTrend from './components/historyTrend.vue'
import historyPrice from './components/historyPrice.vue'
import { Skeleton } from 'vant'
export default {
    name: 'history-module',
    components: {
        historyTrend,
        historyPrice,
        [Skeleton.name]: Skeleton,
    },
    data() {
        return {
            activeHeader: 1,
        }
    },
    methods: {
        initHistoryTrend(data) {
            this.$refs.historyTrendRef.init(data)
        },
    },
}
</script>
<style scoped lang="less">
.bond-history {
    margin: 0 12px 12px;
    padding: 8px 12px 16px;
    background: #fff;
    border-radius: 8px;
}

header {
    display: flex;
    align-items: center;
    padding: 7px 0;
    color: #666;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;

    .henader-checker {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
    }

    span {
        margin-right: 28px;
    }
}
</style>
