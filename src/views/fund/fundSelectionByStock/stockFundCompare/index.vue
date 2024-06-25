<template>
    <div class="stock-fund-compare flex-column">
        <select-stock @delete="handleDelete" :holderType="holderType"></select-stock>
        <filter-fund class="flex1 flex-column overflow-hidden-y" ref="filterFund" @handleFilter="handleFilter"></filter-fund>
    </div>
</template>
<script>
import selectStock from './selectStock.vue'
import filterFund from './filterFund.vue'
export default {
    name: 'stockFundCompare',
    components: {
        selectStock,
        filterFund,
    },
    data() {
        return {
            holderType: Number(this.$route.query.holderType),
        }
    },
    methods: {
        // 删除股票
        handleDelete(item) {
            this.$refs.filterFund.deleteFn(item)
            this.$refs.filterFund.getPubList()
        },
        // 筛选
        handleFilter(key) {
            this.holderType = Number(key)
        },
    },
}
</script>
<style scoped lang="less">
.stock-fund-compare {
    height: 100vh;
    overflow-y: hidden;
}
</style>
