<template>
    <div class="tab">
        <div class="tab-item" :class="currentIndex === tab.value ? 'active' : ''" v-for="tab in list" :key="tab.value" @click="tabClick(tab)">
            {{ tab.label }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            default: 1,
        },
        list: {
            type: Array,
            default() {
                return []
            },
        },
    },
    computed: {
        currentIndex: {
            get() {
                return this.value
            },
            set(val) {
                this.$emit('input', val)
            },
        },
    },
    methods: {
        tabClick(item) {
            this.currentIndex = item.value
            this.$emit('tabClick', item)
        },
    },
}
</script>

<style lang="less" scoped>
.tab {
    display: flex;
    align-items: center;
    justify-content: space-around;
    width: 100%;
    height: 36px;
    color: #666;
    font-size: 15px;
    background: #fff;

    .active {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
    }
}
</style>
