<template>
    <div class="flow-wrapper">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh" style="min-height: 100vh">
            <van-list v-model="loading" :finished="finished" @load="onLoad" :immediate-check="false" finished-text="">
                <FlowItem v-for="(item, index) in list" :key="index" :options="item" />
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<script>
import FlowItem from './components/FlowItem.vue'
import { cashFlowList } from '@/apis/portfolio'
import dayjs from 'dayjs'
const PAGE_COUNT = 20
export default {
    name: 'Flow',
    components: { FlowItem },
    data: () => ({
        refreshing: false,
        loading: false,
        finished: false,
        list: [],
        start: 0,
    }),
    computed: {},
    mounted() {
        this.fetch()
    },
    methods: {
        onLoad() {
            this.fetch(this.start + PAGE_COUNT)
        },
        onRefresh() {
            this.finished = false
            this.loading = true
            this.fetch()
        },
        fetch(start = 0, count = PAGE_COUNT) {
            const params = { fromDate: '2022-01-01', toDate: dayjs().format('YYYY-MM-DD'), start, count, flowTypeList: null }
            cashFlowList(params)
                .then(res => {
                    if (res.result) {
                        const { start, count, total, list } = res.result
                        this.refreshing = false
                        this.finished = start + count >= total
                        this.loading = false
                        this.start = start
                        const lst = list ?? []
                        this.list = start === 0 ? lst : [...this.list, ...lst]
                    } else {
                        console.log('/portfolio/v3/CashFlowList error', JSON.stringify(res.error))
                    }
                })
                .catch(err => {
                    console.log('/portfolio/v3/CashFlowList err', err.message)
                })
        },
    },
}
</script>

<style lang="less" scoped>
.flow-wrapper {
    height: 100vh;
    overflow: auto;
    background-color: #f6f6f6;
}
</style>
