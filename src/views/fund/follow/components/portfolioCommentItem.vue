<!-- 组合点评详情页 cell -->

<template>
    <div class="cell_details bg_fff">
        <div class="title flex-s border-bottom-1px" @click="openAll">
            <div class="flex-c">
                <tag
                    v-if="isTop"
                    :text="$t('follow.top')"
                    :textColor="'#FF6907'"
                    :fontWeight="'normal'"
                    :backgroundColor="'#FF690714'"
                    class="mar-r8"
                ></tag>
                <tag
                    v-else-if="isNewest"
                    :text="$t('follow.newest')"
                    :textColor="'#0569FF'"
                    :fontWeight="'normal'"
                    :backgroundColor="'#EAF2FF'"
                    class="mar-r8"
                ></tag>
                <span>{{ item.publishTime | dateFormat }}</span>
            </div>
            <multi-img
                v-if="showBtn"
                class="arrowicon"
                :class="{ arrow_open: displayAll }"
                name="icon_arrow_left"
                directory="fund"
                alt="icon_arrow_left"
            ></multi-img>
        </div>
        <div class="text" ref="textRef">
            <span :class="{ 'line-elipsis_l2': showBtn && !displayAll }" v-html="item.comment"></span>
        </div>
    </div>
</template>

<script>
import tag from '@/components/Tag.vue'
import NP from 'number-precision'

export default {
    name: 'portfolioCommentItem',
    mixins: [],
    components: {
        tag,
    },
    props: {
        item: {
            type: Object,
            default() {
                return {}
            },
        },
        isTop: {
            type: Boolean,
            default() {
                return false
            },
        },
        isNewest: {
            type: Boolean,
            default() {
                return false
            },
        },
    },
    data() {
        return { displayAll: false, showBtn: false }
    },
    filters: {
        dateFormat(v) {
            if (!v) return '--'
            const date = new Date(v)
            return isNaN(+date) ? '--' : date.format('yyyy/MM/dd HH:mm')
        },
    },
    computed: {},
    created() {},
    destroyed() {
        this.$emit('changeHeight')
    },
    mounted() {
        this.$nextTick(() => {
            this.updateShowBtn()
        })
    },
    watch: {
        item: {
            handler() {
                this.$nextTick(() => {
                    this.updateShowBtn()
                })
            },
        },
    },
    methods: {
        openAll() {
            this.displayAll = !this.displayAll
            this.$emit('changeHeight')
        },
        updateShowBtn() {
            const fontSize = document.documentElement.style.fontSize.replace('px', '')
            this.showBtn = this.$refs.textRef.scrollHeight > NP.times(NP.divide(44, 100), fontSize)
            this.$emit('changeHeight')
        },
    },
}
</script>

<style lang="less" scoped>
.bg_fff {
    background: #fff;
}

.bg_f9 {
    background: #f9f9f9;
}

.cell_details {
    padding: 0 12px 12px;
    border-radius: 8px;

    .title {
        height: 40px;
        margin-bottom: 8px;
        color: #666;
        font-size: 12px;
        line-height: 16px;

        .arrowicon {
            width: 12px;
            height: 12px;
            transform: rotate(90deg);
        }

        .arrow_open {
            transform: rotate(-90deg);
        }
    }

    .text {
        color: #2f2f2f;
        font-size: 14px;
        line-height: 22px;
        // min-height: 40px;
    }

    .max_height {
        height: 44px;
    }
}
</style>
