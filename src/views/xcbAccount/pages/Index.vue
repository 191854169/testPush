// 现金宝首页
<template>
    <div>
        <component :is="componentId"></component>
    </div>
</template>

<script>
import Assets from './Assets.vue'
import About from './About.vue'

export default {
    components: { Assets, About },
    data() {
        return {
            componentId: '',
        }
    },
    created() {
        this.init()
    },
    methods: {
        init() {
            this.componentId = 'assets'
        },
    },
}
</script>

<style scoped lang="less"></style>
