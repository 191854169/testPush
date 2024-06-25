<template>
    <div class="status_bar" v-if="isInAPP">
        <div :style="{ height: `${statusBarHeight}px` }"></div>
    </div>
</template>

<script>
import { getValueForGlobalKey, isHLApp } from '@/utils'

export default {
    name: 'statusBar',
    props: {
        value: {
            type: [Number, String],
            default() {
                return 0
            },
        },
    },
    computed: {
        isInAPP() {
            return isHLApp()
        },
        statusBarHeight: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
    components: {},
    data() {
        return {}
    },
    filters: {},
    created() {},
    mounted() {
        if (this.$jsBridge && navigator.userAgent) {
            this.statusBarHeight = getValueForGlobalKey('statusBarHeight') || this.statusBarHeight
        }
    },
    methods: {},
}
</script>

<style scoped lang="less">
.status_bar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
    background: #fff;
}
</style>
