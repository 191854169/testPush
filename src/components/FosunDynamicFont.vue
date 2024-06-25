<template>
    <div class="dynamic-font" ref="container">
        <span v-if="!htmlMode">{{ value }}</span>
        <span v-else v-html="value"></span>
    </div>
</template>
<script>
// reference: src\views\fund\list\components\fund-search.vue
import { dynamicFontSize } from '@/utils/utils.js'
export default {
    name: 'dynamicFont',
    props: {
        value: {
            type: String,
            default: '',
        },
        htmlMode: {
            type: Boolean,
            default: false,
        },
        options: {
            type: Object,
            default: () => {
                return {
                    minFontSize: 12,
                    maxFontSize: 16,
                }
            },
        },
    },
    watch: {
        value: {
            handler() {
                if (this._isMounted) {
                    dynamicFontSize({ ...this.options, dom: 'container', context: this })
                }
            },
        },
    },
    mounted() {
        dynamicFontSize({ ...this.options, dom: 'container', context: this })
    },
}
</script>
<style scoped lang="less">
.dynamic-font {
    width: 100%;
}
</style>
