<template>
    <div class="top-list-item-bottom">
        <div
            v-for="item in config"
            :key="item.label"
            class="item"
            :class="{
                horizontal: item.isHorizontal,
                'not-bold': item.notBold,
            }"
        >
            <div v-if="item.isRiseFall" v-riseFall="item.value" class="value"></div>
            <div v-else class="value">{{ item.value }}</div>
            <div class="label">{{ item.label }}</div>
        </div>
    </div>
</template>

<script>
export default {
    components: {},
    props: {
        config: () => [],
    },
    data() {
        return {}
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    methods: {},
}
</script>
<style scoped lang="less">
.top-list-item-bottom {
    display: flex;
    margin-top: 8px;
    padding-left: 29px;

    .item {
        &.horizontal {
            display: flex;

            .value {
                margin-right: 6px;
            }
        }

        &.not-bold .value {
            font-weight: 400;
        }

        .value {
            color: #1f1f1f;
            font-weight: 600;
            font-size: 16px;
            line-height: 22px;
        }

        .label {
            margin-top: 4px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        & + .item {
            margin-left: 56px;
        }
    }
}
</style>
