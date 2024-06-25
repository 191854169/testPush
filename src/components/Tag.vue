<template>
    <div class="tag-main flex-middle" :style="{ color: textColor, background: backgroundColor, ...customStyle }">
        <span class="text" :style="{ 'font-weight': fontWeight }">{{ text | textFilter }}</span>
    </div>
</template>

<script>
import { REBALANCE_OPT_TYPE } from '@/config/common'
export default {
    name: 'tag',
    props: {
        text: {
            type: [String, Number],
            default: '标签',
        },
        textColor: {
            type: String,
            default: '#FF6907',
        },
        backgroundColor: {
            type: String,
            default: 'rgba(255, 105, 7, 0.1)',
        },
        fontWeight: {
            type: String,
            default: 'bold',
        },
        customStyle: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    filters: {
        textFilter(v) {
            return REBALANCE_OPT_TYPE.options.findLabel(v, v)
        },
    },
}
</script>

<style lang="less" scoped>
.tag-main {
    width: 26px;
    border-radius: 2px;

    .text {
        font-size: 10px;
    }
}
</style>
