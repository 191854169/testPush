<template>
    <div class="fund-list" ref="container">
        <div class="label" ref="label" :class="{ 'label-shadow': showShadow }">{{ $t('fundName') }}</div>
        <ul class="list" ref="list">
            <li class="list-item" v-for="(item, index) in list" :key="item.symbol" @click="onClick(index)">
                <div class="top">
                    <div class="cake" :style="{ 'background-color': fundColors[index] }"></div>
                    <multi-img name="icon-close-opacity" directory="common" />
                </div>
                <div class="name line-elipsis_l2">{{ item.name }}</div>
                <div class="tags">
                    <div class="tags-item">{{ item.type | fundTypeFilter }}</div>
                    <div class="tags-item">{{ item.riskRating | riskRatingFilter }}</div>
                </div>
            </li>
        </ul>
        <!-- <div class="add" v-show="list.length < 4" @click="goSelectFund">
            <multi-img name="icon-add" directory="common" />
        </div> -->
    </div>
</template>
<script>
import { FUND_TYPE_MAP, RISK_RATING_MAP } from '@/views/fund/config/common.js'
import { fundColors } from '@/views/fund/comparison/config/common.js'

const fundTypeKeyMap = FUND_TYPE_MAP.keyValueMap
const riskRatingKeyMap = RISK_RATING_MAP.keyValueMap
export default {
    name: 'fundList',
    props: {
        list: {
            type: Array,
            default: () => [],
        },
    },
    filters: {
        fundTypeFilter(v) {
            return fundTypeKeyMap[v] || ''
        },
        riskRatingFilter(v) {
            return riskRatingKeyMap[v] || ''
        },
    },
    data() {
        return {
            fundColors,
            showShadow: false,
        }
    },
    mounted() {
        this.collectContext()
        const container = this.$refs.container
        const label = this.$refs.label
        const list = this.$refs.list
        if (!container || !list) return
        const { width } = label.getBoundingClientRect()
        const scrollHnadler = () => {
            const { x } = list.getBoundingClientRect()
            this.showShadow = x < width
            this.dispatchScroll(container.scrollLeft)
        }
        container.addEventListener('scroll', scrollHnadler)
        this.$once('hook:beforeDestroy', () => {
            container.removeEventListener('scroll', scrollHnadler)
        })
    },
    methods: {
        onClick(index) {
            this.$emit('subtract', index)
        },
        goSelectFund() {
            // TODO: 暂时去掉 +
            this.$router.push({
                path: '/select-fund',
                query: {
                    symbols: JSON.stringify(this.list.map(item => item.symbol)),
                },
            })
        },
        collectContext() {
            this.$emit('collectContext', this)
        },
        // 分发事件
        dispatchScroll(v) {
            this.$emit('dispatchScroll', v)
        },
        // 触发
        launchScroll(v) {
            this.$refs.container && (this.$refs.container.scrollLeft = v)
        },
    },
}
</script>
<style scoped lang="less">
.fund-list::-webkit-scrollbar {
    display: none;
}

.fund-list {
    display: flex;
    height: 100px;
    padding: 10px 0;
    overflow: scroll hidden;
    background-color: #fff;
    scrollbar-width: none;

    .label {
        position: sticky;
        left: 0;
        z-index: 1000;
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        width: 108px;
        height: calc(100% + 20px);
        margin-top: -10px;
        color: #666;
        font-weight: 400;
        font-size: 12px;
        background-color: #fff;
    }

    .list {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        height: 100%;
        padding-right: 12px;

        .list-item {
            display: flex;
            flex-direction: column;
            width: 106px;
            height: 100%;
            margin-left: 6px;
            background: #f9f9f9;
            border-radius: 6px;

            .top {
                position: relative;
                display: flex;
                justify-content: flex-end;
                padding: 6px 6px 0 0;

                img {
                    right: 0;
                    bottom: 0;
                    width: 12px;
                    height: 12px;
                }

                .cake {
                    position: absolute;
                    bottom: 3px;
                    left: 8px;
                    width: 12px;
                    height: 3px;
                    background-color: #278aff;
                    border-radius: 2px;
                }
            }

            .name {
                height: 32px;
                margin: 0 8px 6px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;
            }

            .tags {
                display: flex;
                align-items: center;
                padding: 0 8px 8px;

                &-item {
                    padding: 0 4px;
                    color: #278aff;
                    font-weight: 400;
                    font-size: 10px;
                    line-height: 16px;
                    background: #e6f2ff;
                    border-radius: 2px;
                }

                &-item:first-of-type {
                    margin-right: 4px;
                }
            }
        }
    }

    .add {
        display: flex;
        flex: 0 0 auto;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 100%;
        border: 1px dashed #dbdbdb;
        border-radius: 4px;

        img {
            width: 20px;
            height: 20px;
        }
    }
}
</style>
<style scoped lang="less">
.label-shadow {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}
</style>
