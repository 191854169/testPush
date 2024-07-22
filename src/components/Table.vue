<template>
    <div class="box">
        <div class="scrollElement" ref="scrollElement">
            <div class="loadingTop" v-if="canPullDown" v-show="refreshing">
                <div class="loadingText">
                    <multi-img class="loading-icon" width="20" height="20" name="icon-footer-loading" directory="fund" />
                    <span>{{ noLoading ? (moveState === 0 ? $t('pullRefresh') : $t('relessRefresh')) : `${$t('loading')}...` }}</span>
                </div>
            </div>
            <div class="content" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
                <!-- 左边固定(表头+表格) -->
                <div class="fixed" :style="titleStyle" :class="titleClass">
                    <div class="title" v-if="!columns[0].headSlot" :style="columns[0].style" :class="columns[0].className">
                        {{ columns[0].title }}
                    </div>
                    <slot name="fixTitle"></slot>
                    <div class="fixed-body" ref="fixedBody">
                        <div
                            class="item"
                            v-for="(item, index) in data"
                            :key="index"
                            :style="rowStyle"
                            :class="[rowClass, { 'border-bottom-1px': border && (hiddenLastBorder ? index < data.length - 1 : true) }]"
                            @click="rowClick(item)"
                        >
                            <span v-if="!columns[0].slot">{{ item[columns[0].key] }}</span>
                            <slot v-else :name="columns[0].key" :item="item"></slot>
                        </div>
                    </div>
                </div>
                <!-- 右边滚动(表头+表格) -->
                <div class="scroll" ref="scollBody">
                    <div class="scroll-title-container">
                        <div class="title scrollTitle" ref="scrollTitle" :style="scrollTitleStyle" @touchstart="onTitleTouchstart">
                            <div
                                class="titleItem"
                                v-for="item in scrollColumns"
                                :key="item.key"
                                :style="[item.style, item.titleItemStyle]"
                                :class="item.className"
                                @click="sortHandler(item.key)"
                            >
                                <span>{{ item.title }}</span>
                                <div v-if="sortMap[item.key]" class="caret-wrapper">
                                    <i class="sort-up" :class="{ 'sort-up__active': sortMap[item.key] === 'asc' }" />
                                    <i class="sort-down" :class="{ 'sort-down__active': sortMap[item.key] === 'desc' }" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="body" @touchstart="onBodyTouchstart">
                        <div class="row" v-for="(item, index) in data" :key="index" :style="rowStyle" :class="rowClass" @click="rowClick(item)">
                            <div
                                class="item"
                                v-for="(colItem, colIndex) in scrollColumns"
                                :key="colIndex"
                                :style="colItem.style"
                                :class="[colItem.className, { 'border-bottom-1px': border && (hiddenLastBorder ? index < data.length - 1 : true) }]"
                            >
                                <span v-if="!colItem.slot">{{ colItem.filter ? colItem.filter(item) : item[colItem.key] }}</span>
                                <slot v-else :name="colItem.key" :item="item"></slot>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- <div v-if="data.length == 0" class="noData">
                    <img src="@/assets/images/common/noData.png" alt="" />
                    <h4>{{ emptyPlaceholder }}</h4>
                </div> -->
            </div>
            <div class="loading-down" v-show="canPullUp && showPullUpLoading && reLoading">
                <div class="loadingText">
                    <multi-img class="loading-icon" width="20" height="20" name="icon-footer-loading" directory="fund" />
                    <span>{{ `${$t('loading')}...` }}</span>
                </div>
            </div>
            <div class="loading-over" v-show="showLoadingOver">
                <span>{{ loadingOverMsg }}</span>
            </div>
        </div>
        <template v-if="data.length == 0 && showEmptyTip">
            <slot name="noData">
                <div class="noData">
                    <multi-img width="103" height="103" name="noData" directory="common" />
                    <h4>{{ emptyPlaceholder }}</h4>
                </div>
            </slot>
        </template>
    </div>
</template>
<script>
import { i18n } from '@/i18n/fund'

import { debounce } from '@/utils/utils.js'
//组件使用参考views/cashBox/orderHistory.vue
export default {
    props: {
        titleStyle: {},
        scrollTitleStyle: {},
        rowStyle: {},
        titleClass: {
            type: String,
            default: '',
        },
        rowClass: {
            type: String,
            default: '',
        },
        emptyPlaceholder: {
            type: String,
            default: i18n.t('noData'),
        },
        showEmptyTip: {
            type: Boolean,
            default: true,
        },
        columns: {
            required: true,
            type: Array,
            default() {
                return []
            },
        },
        data: {
            required: true,
            type: Array,
            default() {
                return []
            },
        },
        exclusiveSort: {
            // 排序是否互斥
            type: Boolean,
            default: true,
        },
        // 能否上拉加载
        canPullUp: {
            type: Boolean,
            default: true,
        },
        // 是否展示上拉加载动画
        showPullUpLoading: {
            type: Boolean,
            default: false,
        },
        // 能否下拉刷新
        canPullDown: {
            type: Boolean,
            default: true,
        },
        // 数据改动初始化滚动区域水平轴位置
        initScrollHorizon: {
            type: Boolean,
            default: false,
        },
        // 是否展示加载结束底部
        showLoadingOver: {
            type: Boolean,
            default: false,
        },
        // 加载结束底部文案
        loadingOverMsg: {
            type: String,
            default: i18n.t('noMore'),
        },
        border: {
            type: Boolean,
            default: false,
        },
        hiddenLastBorder: {
            type: Boolean,
            default: false,
        },
        isInRy: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        noLoading() {
            return this.moveState < 2
        },
        scrollColumns() {
            const m = this.columns.slice(0)
            m.splice(0, 1)
            return m.filter(i => {
                return !i.fixed
            })
        },
    },
    data() {
        return {
            sortMap: {},
            listHeight: '500px',
            refreshing: false,
            reLoading: false,
            finished: true,
            isLoading: false,
            startY: '',
            moveDistance: 0,
            moveState: 0,
            duration: 0,
            scrollLeft: 0,
            isIntitle: false,
            isInBody: false, // 滑动时手指是否处于列表内部
        }
    },
    created() {},
    watch: {
        columns: {
            // 收集列表中需要排序的项
            handler(newV, oldV) {
                if (newV) {
                    this.sortMap = {}
                    newV.forEach(item => {
                        if (item.key == 'returnD7ToY1') {
                            if (item.sort) {
                                this.isInRy ? this.$set(this.sortMap, item.key, 'none') : this.$set(this.sortMap, item.key, 'desc') //  睿银站外h5默认根据资产规模排序
                            }
                        } else {
                            if (item.sort) {
                                if (oldV && oldV.length > newV.length && item.key == 'returnM1') {
                                    this.$set(this.sortMap, item.key, 'desc')
                                } else {
                                    this.$set(this.sortMap, item.key, 'none')
                                }
                            }
                        }
                    })
                }
            },
            deep: true,
            immediate: true,
        },
    },
    mounted() {
        this.dom = this.$refs['scrollElement']
        this.scollBody = this.$refs['scollBody']
        this.scrollTitle = this.$refs.scrollTitle
        this.dom.addEventListener('scroll', this.listen1)
        this.scollBody.addEventListener('scroll', this.listen2)
        this.scrollTitle.addEventListener('scroll', this.listen3)
    },
    beforeDestroy() {
        this.dom.removeEventListener('scroll', this.listen1)
        this.scollBody.removeEventListener('scroll', this.listen2)
        this.scrollTitle.removeEventListener('scroll', this.listen3)
    },
    methods: {
        listen1() {
            const clientHeight = this.dom.clientHeight
            //const clientHeight = table.offsetHeight
            const scrollTop = this.dom.scrollTop
            const scrollHeight = this.dom.scrollHeight
            if (parseInt(clientHeight + scrollTop) + 2 >= parseInt(scrollHeight)) {
                debounce(this.loadMore(), 500)
            }
        },
        listen2() {
            if (this.initScrollHorizon && this.scollBody.scrollLeft === 0) {
                this.scrollTitle.scrollLeft = 0
                this.dispatchScroll(0)
                this.$emit('body-scroll-left', { scrollLeft: 0 })
                return
            }
            if (this.isInTitle) return
            this.scrollLeft = this.scollBody.scrollLeft
            this.scrollTitle.scrollLeft = this.scollBody.scrollLeft
            this.dispatchScroll(this.scollBody.scrollLeft)
            this.$emit('body-scroll-left', { scrollLeft: this.scrollLeft })
        },
        listen3() {
            if (this.isInBody) return
            const scrollLeft = this.scrollTitle.scrollLeft
            const offsetWidth = this.scrollTitle.offsetWidth
            const scrollWidth = this.scrollTitle.scrollWidth
            let scrollValue = 0
            if (scrollLeft + offsetWidth >= scrollWidth) {
                scrollValue = scrollLeft
            } else {
                scrollValue = this.scrollTitle.scrollLeft
            }
            this.scollBody.scrollLeft = scrollValue
            this.dispatchScroll(scrollValue)
        },
        // 分发事件
        dispatchScroll(v) {
            this.$emit('dispatchScroll', v)
        },
        // 触发
        launchScroll(v) {
            this.scollBody && (this.scollBody.scrollLeft = v)
            this.scrollTitle && (this.scrollTitle.scrollLeft = v)
        },
        // 上拉加载成功后关闭加载状态
        loadMore() {
            if (!this.canPullUp) return
            this.reLoading = true
            this.$emit('pullUpLoad', () => {
                this.reLoading = false
            })
        },
        // 下拉刷新成功后关闭顶部刷新状态
        onRefresh() {
            this.$emit('refresh', () => {
                //这里就是成功后的回调了，如果该函数被调用，那就以为着加载数据完成，所以状态要回到0，当然需要在父组件调用。
                this.moveState = 0
                this.refreshing = false
            })
        },
        touchStart(e) {
            this.duration = 0 // 关闭动画
            this.moveDistance = 0 // 滑动距离归0
            this.startY = e.targetTouches[0].clientY // 获得开始Y坐标
        },
        touchMove(e) {
            //这里是整个下拉刷新的核心
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
            //首先判断我们有没有滚动条，如果有，我们下拉刷新就不能启用。
            if (scrollTop > 0) return
            const move = e.changedTouches[0].clientY - this.startY
            //判断手指滑动的距离，只有为正数 && 位于顶部 才代表用户下拉了。
            if (move > 50 && this.dom.scrollTop === 0) {
                this.refreshing = true
                //阻止默认事件，在微信浏览器中尤为有用，至于为什么，你去试就知道了。
                //e.preventDefault()
                //增加滑动阻力的感觉
                this.moveDistance = Math.pow(move, 0.8)
                if (this.moveDistance > 50) {
                    //如果滑动距离大于50 那我就告诉你，释放即可刷新
                    if (this.moveState === 1) return
                    this.moveState = 1
                } else {
                    //否则 恢复原样
                    if (this.moveState === 0) return
                    this.moveState = 0
                }
            }
        },
        touchEnd() {
            // 只要手指拿开，我都需要加上结束时的动画，这里为300ms
            this.duration = 300
            if (this.moveDistance > 50) {
                //这里逻辑跟touchMove一样，但是需要真的加载数据了，那moveState变为2 所以加载动画在这出现
                this.moveState = 2
                //因为还没加载完，我得让加载动画显示着，所以这里移动距离为50
                this.moveDistance = 50
                this.onRefresh()
                //刷新时间限定两秒
                setTimeout(() => {
                    this.moveState = 0
                    this.refreshing = false
                }, 1000)
            } else {
                //否则 给我老老实实恢复原样
                this.moveDistance = 0
                this.refreshing = false
            }
        },
        //每行点击事件
        rowClick(item) {
            this.$emit('rowClick', item)
        },
        // 设置排序排序
        setSortMap(key, type) {
            if (key in this.sortMap && ['asc', 'desc', 'none'].includes(type)) {
                this.sortMap[key] = type
            }
        },
        sortHandler(key) {
            if (!this.sortMap[key]) return
            let type = ''
            switch (this.sortMap[key]) {
                case 'none':
                    type = 'asc'
                    break
                case 'asc':
                    type = 'desc'
                    break
                default:
                    type = 'none'
                    break
            }
            this.exclusiveSort &&
                Object.keys(this.sortMap).forEach(k => {
                    this.sortMap[k] = 'none'
                })
            this.setSortMap(key, type)
            this.$emit('sort', key, type)
        },
        onTitleTouchstart() {
            this.isInTitle = true
            this.isInBody = false
        },
        onBodyTouchstart() {
            this.isInBody = true
            this.isInTitle = false
        },
    },
}
</script>
<style></style>
<style lang="less" scoped>
.box {
    position: relative;
    display: flex;
    flex-direction: row;
    overflow: hidden;

    .scrollElement {
        width: 100%;
        height: 100%;
        // -webkit-overflow-scrolling: touch;
        padding-top: 24px;
        overflow-y: scroll;
    }

    .content {
        display: flex;
        flex-direction: row;
    }

    .loadingTop {
        width: 100%;

        .loadingText {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 20px;

            .loading-icon {
                margin-right: 12px;
                animation: circle 1.5s infinite linear;
            }

            span {
                display: inline-block;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        .text {
            margin-left: 5px;
        }
    }

    .loading-down {
        width: 100%;

        .loadingText {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 56px;

            .loading-icon {
                margin-right: 12px;
                animation: circle 1.5s infinite linear;
            }

            span {
                display: inline-block;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        .text {
            margin-left: 5px;
        }
    }

    .loading-over {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 56px;

        span {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
        }
    }

    .title {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 999;
        display: flex;
        flex-direction: row;
        padding: 4px 0;
        overflow: hidden;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
        background: #fff;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .scroll-title-container {
        position: absolute;
        top: 0;
        right: 0;
        left: 184px;
        z-index: 999;
        height: 24px;
        overflow: hidden;

        .title {
            right: 0;
            padding: 0;
            padding-bottom: 14px;
            overflow: auto hidden;
            line-height: 24px;
        }
    }

    .fixed {
        width: 184px;

        .title {
            width: inherit;
        }

        .item {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 56px;
            color: #1f1f1f;
            font-weight: 400;
            font-size: 16px;
        }
    }

    .scroll {
        flex: 1;
        overflow: scroll hidden;

        // -webkit-overflow-scrolling: touch;
        .titleItem {
            display: flex;
            flex-shrink: 0;
            align-items: center;
            justify-content: flex-end;

            .caret-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 6px;
                margin-left: 4px;

                .sort-box {
                    background-repeat: no-repeat;
                    background-position: center;
                    background-size: 100%;
                }

                .sort-up {
                    .sort-box();

                    width: 5px;
                    height: 3.5px;
                    margin-bottom: 1px;
                    background-image: url('~@/assets/images/common/sort-up.png');
                }

                .sort-up__active {
                    background-image: url('~@/assets/images/common/sort-up__active.png');
                }

                .sort-down {
                    .sort-box();

                    width: 5px;
                    height: 3.5px;
                    margin-top: 1px;
                    background-image: url('~@/assets/images/common/sort-down.png');
                }

                .sort-down__active {
                    background-image: url('~@/assets/images/common/sort-down__active.png');
                }
            }
        }

        // .titleItem:last-child{
        //     justify-content: flex-end;
        // }
        .row {
            display: flex;
            flex-direction: row;
            flex-shrink: 0;
            align-items: center;
        }

        .item {
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            justify-content: center;
            height: 56px;
        }
    }

    .scroll::-webkit-scrollbar {
        display: none;
    }

    .noData {
        position: absolute;
        top: 178px;
        right: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 auto;

        img {
            width: 104px;
            height: 104px;
            margin-bottom: 12px;
        }

        h4 {
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }
}

@keyframes circle {
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
</style>
