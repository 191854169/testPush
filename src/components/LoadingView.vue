<template>
    <div v-if="showLoading" @click.prevent @touch.prevent @touchmove.prevent class="loading-toast">
        <img src="@/assets/images/common/loading-gray.png" />
    </div>
</template>

<script>
export default {
    name: 'loading',
    props: {
        showLoading: {
            type: Boolean,
            default: false,
        },
    },
    computed: {},
    watch: {},
}
</script>

<style lang="less" scoped>
.loading-toast {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    img {
        width: 16px;
        height: 16px;
        animation: r 1s infinite linear;
    }

    @keyframes r {
        0% {
            transform: rotate(0deg);
        }

        25% {
            transform: rotate(90deg);
        }

        50% {
            transform: rotate(180deg);
        }

        75% {
            transform: rotate(270deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }
}
</style>
