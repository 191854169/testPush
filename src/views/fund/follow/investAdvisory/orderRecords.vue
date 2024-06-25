<!--
 * @Description: 投资组合订单记录页
-->
<template>
    <div class="follow-record">
        <!-- <div>
            <order-recordSearch></order-recordSearch>
        </div> -->
        <!-- <tab :list="tabList" v-model="currentIndex" @tabClick="tabClick" class="top-tap" /> -->
        <order-records-item
            v-for="item in tabList"
            :key="item.value"
            v-show="item.value === currentIndex"
            :pageType="item.value"
            :currentPage="currentIndex"
        ></order-records-item>
    </div>
</template>

<script>
import orderRecordsItem from './components/orderRecordItem.vue'
import Tab from '../components/tab.vue'
import orderRecordSearch from './components/orderSearch.vue'

export default {
    components: {
        Tab,
        orderRecordsItem,
        orderRecordSearch,
    },
    data() {
        return {
            currentIndex: this.$route.query.type ? Number(this.$route.query.type) : 0,
            tabList: [
                {
                    label: this.$t('quanbu'),
                    value: 0,
                },
                {
                    label: this.$t('follow.stockName'),
                    value: 1,
                },
                {
                    label: this.$t('publicFund'),
                    value: 2,
                },
                {
                    label: this.$t('bond'),
                    value: 3,
                },
                {
                    label: this.$t('mixed'),
                    value: 4,
                },
            ],
        }
    },
    methods: {
        tabClick(item) {
            this.currentIndex = item.value
        },
    },
}
</script>

<style lang="less" scoped>
.follow-record {
    min-height: 100vh;
    background-color: #fff;
}
</style>
