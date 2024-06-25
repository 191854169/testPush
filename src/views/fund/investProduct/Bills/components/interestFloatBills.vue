<!-- 固定or浮动利息列表 -->
<template>
    <div class="interest-float-bills">
        <InterestBills :list="list"></InterestBills>
    </div>
</template>

<script>
import InterestBills from './interestBills.vue'

export default {
    name: '',
    mixins: [],
    components: { InterestBills },
    props: {
        list: {
            type: Array,
            default: () => {
                return []
            },
        },
    },
    data() {
        return {}
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {},
}
</script>

<style scoped lang="less">
.interest-float-bills {
    width: 100%;
    padding: 0;
}
</style>
