<!-- 组合点评详情页 -->

<template>
    <div class="details">
        <div v-if="isNotEmpty(commentResult.top)" class="list">
            <van-swipe-cell class="list_comment_item">
                <portfolioCommentItem :item="commentResult.top" :is-top="true" @changeHeight="topChangeHeight" />
                <template #right>
                    <div v-if="editable" class="icon_container">
                        <multi-img
                            class="t_icon"
                            name="icon_comment_top_cancel"
                            directory="fund"
                            @click="cancelTopComment(commentResult.top)"
                        ></multi-img>
                        <multi-img
                            class="t_icon"
                            name="icon_comment_delet"
                            directory="fund"
                            @click="showConfirmDeleteMethod(commentResult.top)"
                        ></multi-img>
                    </div>
                </template>
            </van-swipe-cell>
        </div>
        <div class="list">
            <div class="list_comment_item" v-for="(item, index) in commentResult.list" :key="item.id">
                <van-swipe-cell v-if="item.id != commentResult.top.id" :key="item.id">
                    <portfolioCommentItem :item="item" :is-newest="itemNewest(item, index)" />
                    <template #right>
                        <div v-if="editable" class="icon_container">
                            <multi-img
                                v-if="item.id == commentResult.top.id"
                                class="t_icon"
                                name="icon_comment_top_cancel"
                                directory="fund"
                                @click="cancelTopComment(commentResult.top)"
                            ></multi-img>
                            <multi-img v-else class="t_icon" name="icon_comment_top" directory="fund" @click="topComment(item)"></multi-img>
                            <multi-img class="t_icon" name="icon_comment_delet" directory="fund" @click="showConfirmDeleteMethod(item)"></multi-img>
                        </div>
                    </template>
                </van-swipe-cell>
            </div>
        </div>

        <van-dialog v-model="showConfirmDelete" :title="$t('follow.confirmDeleteMessage')" show-cancel-button @confirm="deletComment"></van-dialog>
    </div>
</template>

<script>
import { debounce, isEmpty } from '@/utils/utils.js'
import { throttle } from 'lodash'
import { portfolioCommentList, portfolioCommentDelete, portfolioCommentEdit } from '@/apis/followInvest/index.js'
import { SwipeCell } from 'vant'
import portfolioCommentItem from './components/portfolioCommentItem.vue'

export default {
    name: 'portfolioCommentPage',
    mixins: [],
    data() {
        return {
            loadMoreHandler: throttle(this.triggerLoadMore, 1000, { leading: false }),
            canLoadingMore: true,
            isLoadingMore: false,
            topAreaHeight: 0,
            showConfirmDelete: false,
            prepareDeleteItem: {},
            commentResult: {
                list: [],
                top: {},
                total: 0,
                uin: 0,
            },
        }
    },
    components: {
        [SwipeCell.name]: SwipeCell,
        portfolioCommentItem,
    },
    computed: {
        editable() {
            return Number(localStorage.getItem('uin')) == this.commentResult.uin
        },
    },
    created() {
        this.getPortfolioCommentList()
    },
    mounted() {
        document.addEventListener('scroll', this.listenScroll, true)
    },
    beforeDestroy() {
        document.removeEventListener('scroll', this.listenScroll, true)
    },
    methods: {
        listenScroll(event) {
            // 滚动的高度
            const scrollTop =
                (event.srcElement ? event.srcElement.scrollTop : false) ||
                window.pageYOffset ||
                (event.srcElement?.body ? event.srcElement.body.scrollTop : 0)
            // 视窗高度
            const clientHeight = (event.srcElement && event.srcElement.clientHeight) || document.body.clientHeight
            // 页面高度
            const scrollHeight = (event.srcElement && event.srcElement.scrollHeight) || document.body.scrollHeight
            // 距离页面底部的高度
            const height = scrollHeight - scrollTop - clientHeight

            if (height < -10 && this.canLoadingMore) {
                debounce(this.loadMoreHandler(), 500)
            }
        },
        // 获取数据
        async getPortfolioCommentList() {
            try {
                const param = {
                    portfolioId: Number(this.$route.query.portfolioId),
                    start: 0,
                    count: 99,
                }
                const { result } = await portfolioCommentList(param)
                this.commentResult.list = result.list || []
                this.commentResult.total = result.total || 0
                this.commentResult.top = result.top || {}
                this.commentResult.uin = result.uin || 0

                this.canLoadingMore = result.total > result.list.length
            } catch (e) {
                console.log('error', e)
            }
        },
        // 上拉加载成功后关闭加载状态
        async triggerLoadMore() {
            if (this.isLoadingMore) return
            this.isLoadingMore = true
            try {
                const param = {
                    portfolioId: Number(this.$route.query.portfolioId),
                    start: this.commentResult.list.length,
                    count: 99,
                }
                const { result } = (await portfolioCommentList(param)) || {}
                this.commentResult.list = this.commentResult.list.concat(result.list)
                this.canLoadingMore = result.total > this.commentResult.list.length
                console.log('triggerLoadMore', result)
                this.isLoadingMore = false
            } catch (error) {
                console.error('triggerLoadMore', error)
                this.isLoadingMore = false
            }
        },
        isNotEmpty(v) {
            return !isEmpty(v)
        },
        itemNewest(item, index) {
            const topIndex = this.commentResult.list.findIndex(e => e.id === this.commentResult.top.id)
            if (index == 0) {
                return topIndex !== 0
            } else if (index == 1) {
                return topIndex === 0
            }
            return false
        },
        topChangeHeight() {},
        async topComment(item) {
            portfolioCommentEdit({ id: item.id, top: true })
                .then(() => {
                    this.commentResult.top = item
                })
                .then(() => {
                    // 置顶成功提示 置顶成功
                    this.$toast.success({
                        message: this.$t('follow.topSuccess'),
                    })
                })
                .catch(e => {
                    console.log('error', e)
                })
        },
        showConfirmDeleteMethod(item) {
            this.prepareDeleteItem = item
            this.showConfirmDelete = true
        },
        async cancelTopComment(item) {
            await portfolioCommentEdit({ id: item.id, top: false })
            this.commentResult.top = {}
        },
        async deletComment() {
            portfolioCommentDelete({ id: this.prepareDeleteItem.id })
                .then(() => {
                    return this.getPortfolioCommentList()
                })
                .then(() => {
                    this.$toast(this.$t('follow.deleted'))
                })
                .catch(e => {
                    console.log('error', e)
                })
        },
    },
}
</script>

<style lang="less" scoped>
.details {
    padding-top: 12px;
    #iosBottom();
}

.fixed {
    position: fixed;
    z-index: 1000;
    width: 100%;
}

.top {
    padding: 12px;
    background: #fff;
    border-bottom: 1px solid #efefef;
}

.list {
    padding: 0 12px;

    .list_comment_item {
        &:not(:first-child) {
            margin-top: 12px;
        }

        &:last-child {
            margin-bottom: 12px;
        }
    }
}

.icon_container {
    display: flex;
    align-items: center;
    justify-content: left;
    width: 152px;
    height: 100%;
    background: #f9f9f9;

    .t_icon {
        width: 64px;
        height: 64px;

        &:first-child {
            margin: 0 8px 0 16px;
        }
    }
}

.van-dialog {
    width: 280px;

    /deep/ .van-dialog__header {
        padding: 0 !important;
        font-size: 16px;
        line-height: 78px;
    }
}
</style>
