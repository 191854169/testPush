// 星财宝专户首页
<template>
    <div>
        <component :is="componentId" :open-btn="true"></component>
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
        async init() {
            if (!(await this.$root.getFtdAccountStatus())) {
                this.componentId = 'about'
            } else {
                this.componentId = 'assets'
            }
        },
    },
}
</script>

<style scoped lang="less"></style>
