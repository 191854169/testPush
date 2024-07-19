<template>
    <header v-if="isShowHeader">
        <div class="icon-group">
            <i v-if="showBack" class="fsfont back" @click="goCallback">&#xe609;</i>
            <i v-if="showCloseIcon" class="fsfont close" @click="handleClose">&#xe60d;</i>
        </div>
        <div class="title">{{ title }}</div>
    </header>
</template>
<script>
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
import { isDeviceMobile, isHLApp } from '../utils'

export default {
    props: {
        title: {
            type: String,
            default: () => {
                return '复星国际证券开户'
            },
        },
        showBack: {
            type: Boolean,
            default: () => {
                return true
            },
        },
        handleBackAction: {
            type: Boolean,
            default: false,
        },
        showClose: {
            type: Boolean,
            default: false,
        },
        isShowHeader: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {}
    },
    mounted() {},
    computed: {
        showCloseIcon() {
            return this.showClose && (!isDeviceMobile() || isHLApp())
        },
    },
    methods: {
        // 路由返回
        goCallback() {
            if (this.handleBackAction) {
                this.$emit('backAction')
                return
            }
            if (history.length > 0) {
                this.$router.back()
            } else {
                this.$router.push({ name: 'account' })
            }
        },
        handleClose() {
            if (JSBridge) {
                JSBridge.close()
            } else {
                window.close()
            }
        },
    },
}
</script>
<style lang="less" scoped>
header {
    position: relative;
    left: -16px;
    display: flex;
    align-items: center;
    width: 100vw;
    height: 44px;
    color: #2f2f2f;
    font-size: 18px;
    line-height: 44px;
    text-align: center;

    .icon-group {
        display: flex;
        flex: 0 0 auto;
        align-items: center;

        i {
            min-width: 50px;

            &.back {
                transform: rotate(180deg);
            }

            &.close {
                font-size: 40px;
            }
        }
    }

    .title {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }
}
</style>
