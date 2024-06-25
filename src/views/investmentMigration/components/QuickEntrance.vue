// 快捷入口卡片
<template>
    <div class="quick-entrance" @click="$emit('item-click')">
        <multi-img class="icon" :name="icon.name" :directory="icon.directory"></multi-img>
        <div class="name">{{ name }}</div>
        <multi-img class="arrow" :name="'icon-right-arrow'" directory="common"></multi-img>
    </div>
</template>

<script>
export default {
    name: 'quickEntrance',
    props: {
        name: {
            type: String,
            default: '',
        },
        icon: {
            type: Object,
            default: () => ({
                name: '',
                directory: '',
            }),
        },
    },
}
</script>

<style scoped lang="less">
.quick-entrance {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 56px;
    padding: 0 16px;
    background-color: #fff;
    border-radius: 12px;

    .icon {
        width: 20px;
        height: 20px;
    }

    .name {
        display: flex;
        flex-direction: row;
        width: 100%;
        margin-left: 12px;
        font-weight: 400;
        font-size: 16px;
        font-family: 'PingFang SC';
        font-style: normal;
        line-height: 16px;
    }

    .arrow {
        width: 12px;
        height: 12px;
    }
}
</style>
