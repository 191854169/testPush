<template>
    <div class="page" :class="{ wrap: $route.meta.nav }">
        <div class="header" :style="navbg">
            <van-nav-bar
                class="custom"
                v-if="showNavbar"
                :title="title"
                :left-arrow="leftArrow"
                :left-text="leftText"
                :border="border"
                @click-left="onClickLeft"
                @click-right="onClickRight"
            >
                <template>
                    <slot name="title"></slot>
                </template>
                <template>
                    <slot name="left">
                        <van-icon name="arrow-left" />
                    </slot>
                </template>
                <template>
                    <slot name="right"></slot>
                </template>
            </van-nav-bar>
        </div>
        <div class="page-main" :class="{ 'no-navbar': !showNavbar }">
            <template><slot></slot></template>
        </div>
    </div>
</template>

<script>
import { isMobileTerminal } from '../utils'
import store from '../store/purchasing'

export default {
    name: 'page',
    props: {
        title: {
            //头部导航栏标题
            type: String,
            default: '',
        },
        navbg: {
            //头部导航栏背景样式
            type: Object,
            default: () => ({}),
        },
        leftArrow: {
            //是否显示头部导航左侧栏箭头图标
            type: Boolean,
            default: true,
        },
        leftText: String, //头部导航左侧栏文字
        border: {
            //是否显示头部导航栏底部边框线
            type: Boolean,
            default: false,
        },
        navbar: {
            //是否显示头部导航栏
            type: Boolean,
            default: false,
        },
    },

    computed: {
        showNavbar() {
            // 优先使用组件传递的是否显示头部
            const navbar = this.navbar || store.getters['app/getNav'] == 'hide' ? false : true
            return navbar
        },
        isMobile() {
            return isMobileTerminal
        },
    },

    methods: {
        onClickLeft() {
            if (!this.leftArrow) {
                return
            }
            if (this.$listeners['clickLeft']) {
                this.$emit('clickLeft')
            } else {
                if (history.length > 1) {
                    this.$router.back()
                } else {
                    this.$router.push({ name: 'home' })
                }
            }
        },

        onClickRight() {
            if (this.$listeners['clickRight']) {
                this.$emit('clickRight')
            }
        },
    },
}
</script>

<style lang="less" scoped>
.header {
    background-color: #fff;
    background-position: center bottom;
}

.page {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow-y: hidden;
    background-color: #fff;

    &.wrap {
        height: calc(100% - 46px);
    }
}

.page-main {
    position: absolute;
    inset: 48px 0 0;
    overflow-y: auto;

    &.min-height {
        min-height: calc(100vw * 1.75 - 48px);
    }

    &.no-navbar {
        top: 0;
    }
}
</style>
