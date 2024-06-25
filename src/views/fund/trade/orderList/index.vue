<template>
    <div class="details">
        <div class="tabs">
            <div v-for="tab in tabs" class="tab-item" :class="{ checked: activeTab === tab.key }" :key="tab.key" @click="changeTabhandler(tab.key)">
                {{ tab.label }}
            </div>
        </div>
        <tab-list ref="allList" v-show="activeTab === TABS_KEY_MAP.ALL" :activeTab="activeTab" @change-order="changeOrderHandler"></tab-list>
        <tab-list
            ref="doingList"
            v-show="activeTab === TABS_KEY_MAP.DOING"
            isDoing
            :activeTab="activeTab"
            @change-order="changeOrderHandler"
        ></tab-list>
    </div>
</template>
<script>
import tabList from './components/tabList.vue'
import { getQueryString } from '@/utils/tools.js'
const TABS_KEY_MAP = {
    ALL: 0,
    DOING: 1,
}

export default {
    name: 'orderList',
    components: { tabList },
    data() {
        return {
            TABS_KEY_MAP,
            needOnceRefresh: false, // 需要刷新
            tabs: [
                { label: this.$t('quanbu'), key: TABS_KEY_MAP.ALL },
                { label: this.$t('doing'), key: TABS_KEY_MAP.DOING },
            ],
            activeTab: getQueryString('haveDoing', true) === '1' ? TABS_KEY_MAP.DOING : TABS_KEY_MAP.ALL,
        }
    },
    methods: {
        // 刷新了订单
        changeOrderHandler() {
            this.needOnceRefresh = true
        },
        changeTabhandler(key) {
            if (this.activeTab !== key) {
                this.activeTab = key
                if (this.needOnceRefresh) {
                    // 如果需要刷新一次列表
                    const refList = this.$refs[key === TABS_KEY_MAP.ALL ? 'allList' : 'doingList']
                    this.$nextTick(() => {
                        if (!refList) return
                        refList.loadingRefresh && refList.loadingRefresh()
                    })
                    this.needOnceRefresh = false
                }
            }
        },
    },
}
</script>
<style scoped lang="less">
@tabsHeight: 36px;
@filterHeight: 32px;
@marginTop: 8px;

.tabs {
    display: flex;
    justify-content: center;
    height: 36px;
    color: #666;
    font-weight: 400;
    font-size: 15px;
    line-height: 36px;
    background-color: #fff;
    box-shadow: inset 0 -0.5px 0 #efefef;

    .tab-item {
        flex: 1;
        text-align: center;
    }

    .checked {
        color: #2f2f2f;
        font-weight: 700;
    }
}

.details {
    display: flex;
    flex-direction: column;
    height: 100vh;
}
</style>
