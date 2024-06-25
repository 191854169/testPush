<template>
    <div class="navigation_bar" v-if="isInAPP">
        <statusBar class="status_bar" v-model="statusBarHeight" :style="{ background: statusNaviColor }"></statusBar>
        <Header
            ref="headerRef"
            class="navi_bar"
            isShowHeader
            handleBackAction
            @backAction="back"
            :title="title"
            :style="{ top: `${statusBarHeight}px`, background: statusNaviColor }"
        ></Header>
        <div :style="{ height: `${naviHeight}px`, background: magicBGColor }"></div>
        <div class="magic_view" :style="{ background: magicBGColor }"></div>
    </div>
</template>

<script>
import { isHLApp } from '@/utils'
import statusBar from './statusBar.vue'
import Header from './Header.vue'
import NP from 'number-precision'

export default {
    name: 'NavigationBar',
    components: {
        Header,
        statusBar,
    },
    props: {
        title: {
            type: String,
            default() {
                return this.$route.meta.title
            },
        },
        // 渐变前
        color: {
            type: String,
            default() {
                return '#fff'
            },
        },
        // 渐变后
        shadeColor: {
            type: String,
            default() {
                return '#fff'
            },
        },
        // 默认0 不渐变
        shadePixel: {
            type: [Number, String],
            default() {
                return 0
            },
        },
        magicColor: {
            type: String,
            default() {
                return ''
            },
        },
    },
    computed: {
        isInAPP() {
            return isHLApp()
        },
        statusNaviColor() {
            let after = this.shadeColor
            if (this.shadePixel !== 0) {
                after = this.getOpacityColor(this.shadeColor, this.statusNaviBarOpacity)
            }
            const before = this.color
            const color = `linear-gradient(${after}, ${after}), linear-gradient(${before}, ${before})`
            return color
        },
        headerHeight() {
            return this.$refs.headerRef.$el.getBoundingClientRect().height
        },
        magicBGColor() {
            if (this.magicColor === '') {
                return this.statusNaviColor
            }
            return this.magicColor
        },
    },
    data() {
        return {
            statusBarHeight: 36,
            statusNaviBarOpacity: 0,
            naviHeight: 0,
        }
    },
    watch: {
        statusBarHeight(v) {
            if (v) {
                this.naviHeight = NP.plus(v, this.headerHeight)
                this.$emit('updateNaviHeight', this.naviHeight)
            }
        },
    },
    filters: {},
    created() {},
    mounted() {
        if (this.shadePixel !== 0) {
            document.addEventListener('scroll', this.listenScroll, true)
        }
    },
    beforeDestroy() {
        if (this.shadePixel !== 0) {
            document.removeEventListener('scroll', this.listenScroll, true)
        }
    },
    methods: {
        listenScroll(event) {
            // 滚动的距离
            const scrollTop =
                window.pageYOffset ||
                (event.srcElement ? event.srcElement.scrollTop : false) ||
                (event.srcElement?.body ? event.srcElement.body.scrollTop : 0)
            const opacity = NP.divide(scrollTop, this.shadePixel)
            this.statusNaviBarOpacity = Math.min(1, Math.max(0, opacity))
        },
        getOpacityColor(thisColor, thisOpacity) {
            let theColor = thisColor.toLowerCase()
            //十六进制颜色值的正则表达式
            const r = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
            // 如果是16进制颜色
            if (theColor && r.test(theColor)) {
                if (theColor.length === 4) {
                    let sColorNew = '#'
                    for (let i = 1; i < 4; i += 1) {
                        sColorNew += theColor.slice(i, i + 1).concat(theColor.slice(i, i + 1))
                    }
                    theColor = sColorNew
                }
                //处理六位的颜色值
                const sColorChange = []
                for (let j = 1; j < 7; j += 2) {
                    sColorChange.push(parseInt('0x' + theColor.slice(j, j + 2)))
                }
                return 'rgba(' + sColorChange.join(',') + ',' + thisOpacity + ')'
            }
            // 如果是rgba或者rgb
            if (theColor.startsWith('rgb')) {
                let numbers = theColor.match(/(\d(\.\d+)?)+/g)
                numbers = numbers.slice(0, 3).concat(thisOpacity)
                return 'rgba(' + numbers.join(',') + ')'
            }

            return theColor
        },
        back() {
            this.$emit('back')
        },
    },
}
</script>

<style scoped lang="less">
.status_bar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
    background: #fff;
}

.magic_view {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100vw;
    height: 400px;
}

.navi_bar {
    position: fixed;
    left: 0;
    z-index: 1000;
    font-weight: bold;
    font-size: 16px;
}
</style>
