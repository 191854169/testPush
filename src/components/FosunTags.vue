<template>
    <ul class="tags">
        <li class="tag" v-for="(i, index) in tags" :key="index">
            <span>{{ i }}</span>
        </li>
    </ul>
</template>
<script>
export default {
    name: 'tags',
    props: {
        tags: {
            type: Array,
            default: () => [],
        },
    },
}
</script>
<style scoped lang="less">
.tags {
    display: flex;
    flex-wrap: wrap;

    .tag {
        display: flex;
        align-items: center;
        margin-right: 4px;
        padding: 1px 4px;
        font-weight: normal;
        font-size: 10px;
        line-height: 1.2;
        background: #e7f2ff;
        border-radius: 2px;

        span {
            color: #278aff;
        }
    }

    .tag:last-of-type {
        margin-right: 0;
    }
}
</style>
