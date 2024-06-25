// 发现投资组合页
<template>
    <div class="portfolio-list">
        <div class="fix">
            <div>
                <followSearch></followSearch>
            </div>
            <div class="header">
                <div
                    class="market"
                    v-for="(item, index) in typeList"
                    :key="item"
                    :class="{ sel: index == selIndex }"
                    @click="marketTypeClickAction(index)"
                >
                    <span>{{ item }}</span>
                </div>
            </div>
        </div>

        <div class="box"></div>
        <section class="list">
            <follow :sort="true" :groupType="selIndex"></follow>
        </section>
    </div>
</template>

<script>
import { i18n } from '@/i18n/fund/index.js'
import follow from './components/follow.vue'
import followSearch from './components/followSearch.vue'

export default {
    name: 'portfolio-list',
    components: {
        follow,
        followSearch,
    },
    props: {},
    data() {
        return {
            typeList: [
                i18n.t('customerDetail.all'),
                i18n.t('customerDetail.hk'),
                i18n.t('customerDetail.us'),
                i18n.t('customerDetail.fund'),
                i18n.t('customerDetail.mixture'),
            ],
            selIndex: 0,
        }
    },
    computed: {},
    filters: {},
    mounted() {},
    beforeDestroy() {},
    methods: {
        marketTypeClickAction(index) {
            this.selIndex = index
        },
    },
}
</script>

<style lang="less" scoped>
.portfolio-list {
    .box {
        width: 100%;
        height: 76px;
    }

    .list {
        height: calc(100vh - 45px);
        margin: 12px;
        overflow: clip;
        background-color: #fff;
        border-radius: 8px;
    }
}

.fix {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    width: 100%;
}

.header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 36px;
    background-color: #fff;

    .market {
        color: #666;
        font-weight: 400;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
    }

    .sel {
        color: #2f2f2f;
        font-weight: 500;
    }
}
</style>
