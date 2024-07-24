<template>
    <div
        class="table-sticky-header"
        @touchmove.prevent="
            e => {
                e.stopPropagation()
            }
        "
    >
        <div class="sticky-fixed" v-for="item in fixedData" :key="item.key">
            <div :class="item.key" :style="item.style || {}">
                {{ item.title }}
            </div>
        </div>
        <div class="sticky-scroll" ref="scrollarea">
            <div
                class="sticky-scroll-item"
                :class="item.key"
                :style="[item.style, item.titleItemStyle]"
                v-for="item in scrollData"
                :key="item.key"
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
</template>

<script>
export default {
    name: 'tableStickyHeader',
    mixins: [],
    components: {},
    props: {
        config: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            sortMap: {},
        }
    },
    computed: {
        fixedData() {
            return this.config.filter(i => {
                return i.fixed
            })
        },
        scrollData() {
            return this.config.filter(i => {
                return !i.fixed
            })
        },
    },
    watch: {
        config: {
            // 收集列表中需要排序的项
            handler(newV, oldV) {
                if (newV) {
                    this.sortMap = {}
                    newV.forEach(item => {
                        if (item.sort) {
                            if (oldV && oldV.length > newV.length) {
                                this.$set(this.sortMap, item.key, 'desc')
                            } else {
                                this.$set(this.sortMap, item.key, 'none')
                            }
                        }
                    })
                }
            },
            deep: true,
            immediate: true,
        },
    },
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        updateScrollarea(v) {
            this.$refs.scrollarea.scrollLeft = v
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
    },
}
</script>

<style scoped lang="less">
.table-sticky-header {
    display: flex;
    align-items: center;
    min-width: 100vw;
    height: 24px;
    padding-left: 12px;
    color: @h3-white;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    background: #fff;

    .sticky-fixed {
        background: #fff;
    }

    .sticky-scroll {
        display: flex;
        overflow: scroll hidden;

        .sticky-scroll-item {
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

        &::-webkit-scrollbar {
            display: none;
        }
    }
}
</style>
