<template>
    <div class="index">
        <router-view></router-view>
        <loading />
    </div>
</template>

<script>
export default {
    name: 'index',
}
</script>
<style scoped lang="less">
.index {
    height: 100vh;
    overflow: hidden;
    background: #f9f9f9;
}
</style>
