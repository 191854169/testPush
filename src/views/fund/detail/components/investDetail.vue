// 投资模块
<template>
    <div v-show="!hidden" class="invest-detail">
        <h3 class="title">{{ $t('investDetail') }}</h3>
        <fosun-tabs v-model="activeTab" circle>
            <van-tab v-for="item in tabs" :key="item.key" :title="item.label">
                <p>{{ dataMap[item.key] }}</p>
            </van-tab>
        </fosun-tabs>
    </div>
</template>
<script>
import FosunTabs from '@/components/FosunTabs.vue'
import { Tab } from 'vant'

const keyMap = {
    STRATEGY: 'investStrategy',
    RANGE: 'investRange',
    TARGET: 'investTarget',
}
export default {
    name: 'invest-detail',
    components: {
        FosunTabs,
        [Tab.name]: Tab,
    },
    props: {
        briefInfo: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            activeTab: keyMap.STRATEGY,
            tabs: [
                {
                    label: this.$t('investStrategy'),
                    key: keyMap.STRATEGY,
                },
                {
                    label: this.$t('investRange'),
                    key: keyMap.RANGE,
                },
                {
                    label: this.$t('investTarget'),
                    key: keyMap.TARGET,
                },
            ],
        }
    },
    computed: {
        dataMap() {
            return {
                [keyMap.STRATEGY]: this.briefInfo[keyMap.STRATEGY],
                [keyMap.RANGE]: this.briefInfo[keyMap.RANGE],
                [keyMap.TARGET]: this.briefInfo[keyMap.TARGET],
            }
        },
        hidden() {
            return !this.dataMap[keyMap.STRATEGY] && !this.dataMap[keyMap.RANGE] && !this.dataMap[keyMap.TARGET]
        },
    },
}
</script>
<style scoped lang="less">
.invest-detail {
    margin: 12px;
    padding: 8px 12px 0;
    background: #fff;
    border-radius: 8px;

    .title {
        padding: 7px 0 15px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    p {
        padding: 12px 0 16px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;
        white-space: pre-wrap;
    }
}
</style>
