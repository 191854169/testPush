<!-- 组合点评 -->
<template>
    <div class="portfolio_comment_card border-radius-8px">
        <div class="title" @click="toMorePage()">
            <div class="commentTitle">{{ $t('follow.portfolioComment') }}</div>
            <div v-if="!hideFlag" class="right_arrow">
                <span class="txt">{{ $t('loadingMore') }}</span>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <div v-if="isSingleData" class="comment_body margin_t_8" @click="toMorePage()">
            <div class="comment_txt line-elipsis_l2 margin_b_8">
                {{ firstData.comment }}
            </div>
            <div class="comment_footer flex-row">
                <tag
                    :text="firstData.tag"
                    :fontWeight="'normal'"
                    :textColor="firstData.textColor"
                    :backgroundColor="firstData.backgroundColor"
                    class="mar-r8"
                ></tag>
                <span>{{ firstData.publishTime | dateFormat }}</span>
            </div>
        </div>
        <div v-else class="comment_swipe_body margin_t_2">
            <van-swipe class="comment_swipe" autoplay="3000">
                <van-swipe-item v-for="(item, index) in displayList" :key="index" @click="toMorePage()">
                    <div class="comment_container">
                        <div class="comment_txt line-elipsis_l2 margin_b_8">
                            {{ item.comment }}
                        </div>
                        <div class="comment_footer flex-row">
                            <tag
                                :text="item.tag"
                                :textColor="item.textColor"
                                :fontWeight="'normal'"
                                :backgroundColor="item.backgroundColor"
                                class="mar-r8"
                            ></tag>
                            <span>{{ item.publishTime | dateFormat }}</span>
                        </div>
                    </div>
                </van-swipe-item>
            </van-swipe>
        </div>
    </div>
</template>

<script>
import { isEmpty } from '@/utils'
import tag from '@/components/Tag.vue'
import { SwipeItem, Swipe } from 'vant'
export default {
    name: 'PortfolioCommentCard',
    props: {
        dataList: {
            type: Array,
            default() {
                return []
            },
        },
        top: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
        tag,
    },
    data() {
        return {
            hideFlag: true,
        }
    },
    computed: {
        isSingleData() {
            if (isEmpty(this.top)) {
                return true
            }
            const other = this.dataList.filter(e => e.id != this.top.id)
            return isEmpty(other)
        },
        firstData() {
            if (isEmpty(this.top)) {
                const data = this.dataList[0]
                data['tag'] = this.$t('follow.newest')
                data['textColor'] = '#0569FF'
                data['backgroundColor'] = '#EAF2FF'
                return data
            }
            const data = this.top
            data['tag'] = this.$t('follow.top')
            data['textColor'] = '#FF6907'
            data['backgroundColor'] = '#FF690714'
            return data
        },
        lastData() {
            const other = this.dataList.filter(e => e.id != this.top.id)
            const data = other[0]
            data['tag'] = this.$t('follow.newest')
            data['textColor'] = '#0569FF'
            data['backgroundColor'] = '#EAF2FF'
            return data
        },
        displayList() {
            return [this.firstData, this.lastData]
        },
    },
    watch: {
        '$root.isLogin': {
            handler(v) {
                if (typeof v === 'boolean') {
                    this.hideFlag = !this.$root.isLogin
                }
            },
            immediate: true,
        },
    },
    filters: {
        dateFormat(v) {
            if (!v) return '--'
            const date = new Date(v)
            return isNaN(+date) ? '--' : date.format('yyyy/MM/dd HH:mm')
        },
    },
    created() {},
    mounted() {},
    methods: {
        toMorePage() {
            if (!this.$root.isLogin) {
                this.$root.login()
                return
            }

            const portfolioId = this.$route.query.portfolioId
            const url = `${location.origin}/wealth/fund.html#/portfolio-comment?portfolioId=${portfolioId}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(`${url}`), title: '' })
            } else {
                this.$router.push({
                    path: `/portfolio-comment`,
                    query: {
                        portfolioId: portfolioId,
                    },
                })
            }
        },
    },
}
</script>

<style scoped lang="less">
.margin_b_8 {
    margin-bottom: 8px;
}

.margin_t_8 {
    margin-top: 8px;
}

.margin_t_2 {
    margin-top: 2px;
}

.padding_b_4 {
    padding: 8px 12px 4px;
}

.portfolio_comment_card {
    padding: 8px 12px 12px;
    background-color: #fff;

    .title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        height: 36px;
        overflow: hidden;
        font-weight: bold;
        font-size: 16px;
        line-height: 36px;
        white-space: nowrap;
        text-overflow: ellipsis;
        #font_h1();

        .right_arrow {
            display: flex;
            align-items: center;
            font-weight: 400;
            font-size: 12px;
            line-height: 22px;
            #font_h2();

            .arrowicon {
                width: 12px;
                height: 12px;
                vertical-align: middle;
            }

            .txt {
                margin-right: 3px;
                color: @h3-white;
                vertical-align: middle;
            }
        }
    }

    .comment_body {
        height: 70px;
        color: #2f2f2f;
    }

    .comment_txt {
        height: 44px;
        font-size: 14px;
        line-height: 22px;
    }

    .comment_footer {
        span {
            color: #9c9c9c;
            font-size: 12px;
            line-height: 18px;
        }
    }
}

.comment_swipe_body {
    .comment_swipe {
        .van-swipe-item {
            height: 106px;

            .comment_container {
                height: 94px;
                padding: 12px 8px;
                background: #f9f9f9;
                border-radius: 4px;
            }
        }
    }

    /deep/ .van-swipe {
        &__indicators {
            bottom: 0;
        }

        &__indicator {
            width: 4px;
            height: 4px;
            border-radius: 0;
            #swipe_background();

            &:not(:last-child) {
                margin-right: 5px;
            }
        }

        &__indicator--active {
            #swipe_active_background();

            width: 8px;
        }
    }
}
</style>
