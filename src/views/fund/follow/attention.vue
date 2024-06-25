// 关注页 包含关注的人及 粉丝
<template>
    <div class="attention-list">
        <div class="attention-head">
            <div class="attention-head-item" v-for="item in pages" :key="item.key" @click="headClickAction($event)">
                <span :class="{ label: activeTab === item.key }" :data-key="item.key">{{ item.label + getPeopleNumberText(item) }}</span>
            </div>
        </div>
        <div class="placeholder"></div>
        <van-pull-refresh
            v-model="isLoading"
            @refresh="onRefresh"
            style="min-height: 100vh"
            :pulling-text="$t('pullRefresh')"
            :loosing-text="$t('relessRefresh')"
            :loading-text="`${$t('loading')}...`"
        >
            <div :style="{ height: '12px' }"></div>
            <div class="empty_bg" v-show="showEmpty">
                <empty showImg height="134px"></empty>
            </div>
            <van-list
                class="list"
                v-show="dataList.length"
                v-model="loading"
                :finished="finished"
                @load="loadHandler"
                @click.native="gotoOtherUserDetail($event)"
            >
                <div>
                    <div class="list-item mask" v-for="(item, idx) in dataList" :key="idx" :data-type="JSON.stringify(item)">
                        <div class="list-item-content">
                            <div v-if="item.releaseStatus === 1" class="textBox" :class="{ 'border-bottom-1px': idx != dataList.length - 1 }">
                                <div class="title line-elipsis">{{ item.nickName }}</div>
                                <div class="descript line-elipsis">
                                    {{ getBriefText(item) }}
                                </div>
                            </div>
                            <div v-else class="textBox" :class="{ 'border-bottom-1px': idx != dataList.length - 1 }">
                                <div class="title line-elipsis">{{ item.nickName }}</div>
                                <div class="descript line-elipsis" v-if="item.releaseStatus === 2">
                                    {{ $t('attention.customOutageBrief') }}
                                </div>
                                <div class="descript line-elipsis" v-else>
                                    {{ $t('attention.defaultBrief') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </van-list>
        </van-pull-refresh>
    </div>
</template>

<script>
import { i18n } from '@/i18n/fund/index.js'
import { UserFollowerList, UserFollowingList } from '@/apis/followInvest/index.js'
import { isNull } from '@/utils/tools'
import Empty from '@/components/Empty.vue'
import { throttle } from 'lodash'
import customerDetailMixin from './mixins/customerDetailMixin'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import { followerNumFilter } from './utils/filters'
import { PullRefresh } from 'vant'

export default {
    name: 'attention',
    mixins: [customerDetailMixin, watchPageVisibleMixin],
    components: { Empty, [PullRefresh.name]: PullRefresh },

    data() {
        return {
            pages: [
                { label: i18n.t('attention.myAttention'), key: 'following' },
                { label: i18n.t('attention.myFans'), key: 'follower' },
            ],
            otherUin: this.$route.query.otherUin,
            loading: false,
            finished: false,
            activeTab: this.$route.query.pageType, // 活动的tab
            followersNum: 0, //粉丝数量
            followingNum: 0, //关注数量
            dataList: [],
            // 上拉加载
            loadHandler: throttle(this.onLoad, 1000, { leading: false, trailing: true }),
            start: 0,
            currentPage: 1,
            count: 10,
            isLoading: false,
            showEmpty: false,
        }
    },
    filters: {},
    created() {
        this.loading = true
        this.getFollowerListData()
        this.getFollowingListData()
        this.watch(() => {
            this.getList({ reset: true })
        })
    },

    methods: {
        async onRefresh() {
            await this.getList({ pull: true })
            this.isLoading = false
        },
        headClickAction(e) {
            if (e.target.nodeName !== 'SPAN') return
            this.activeTab = e.target.dataset.key
            this.getList({ reset: true })
        },

        async onLoad() {
            await this.getList()
        },

        getBriefText(item) {
            return isNull(item.brief) || item.brief === '' || undefined ? i18n.t('attention.defaultBrief') : item.brief
        },

        getPeopleNumberText(item) {
            if (item.label == i18n.t('attention.myAttention')) {
                return `(${followerNumFilter(this.followingNum)})`
            }
            return `(${followerNumFilter(this.followersNum)})`
        },

        getList(options = {}) {
            const { reset = false, pull = false } = options
            console.log(`yinlong options`, options)
            if (reset) {
                // 重置
                this.start = 0
                this.dataList = []
            } else if (pull) {
                // 下拉刷新
                this.start = 0
            } else {
                this.start = (this.currentPage - 1) * this.count + 1
            }
            this.loading = true
            if (this.activeTab == 'follower') {
                this.getFollowerListData(options)
            } else {
                this.getFollowingListData(options)
            }
        },
        //粉丝数据
        async getFollowerListData(options = {}) {
            const { pull = false } = options
            try {
                const uin = parseInt(this.otherUin) && parseInt(this.otherUin) > 0 ? parseInt(this.otherUin) : ''
                const params = {
                    start: this.start,
                    count: this.count,
                    otherUin: uin,
                }
                const { result } = await UserFollowerList(params)
                this.followersNum = result.total
                console.log(`Xiaopei Jin:: result ===> `, result)
                if (this.activeTab === 'follower') {
                    if (pull) {
                        this.dataList = result?.list || []
                    } else {
                        this.dataList = (this.dataList || []).concat(result?.list || [])
                    }

                    if (this.dataList.length >= result.total || result.list.length == 0) {
                        this.finished = true
                    } else {
                        this.currentPage += 1
                    }
                }
                this.loading = false
            } catch (e) {
                console.error(e)
                this.finished = true
            } finally {
                this.loading = false
                this.showEmpty = this.dataList.length === 0
            }
        },

        //关注数据
        async getFollowingListData(options = {}) {
            const { pull = false } = options
            try {
                const uin = parseInt(this.otherUin) && parseInt(this.otherUin) > 0 ? parseInt(this.otherUin) : ''
                const params = {
                    start: this.start,
                    count: this.count,
                    otherUin: uin,
                }
                const { result } = await UserFollowingList(params)
                this.followingNum = result.total
                console.log(`Xiaopei Jin:: result ===> `, result)
                if (this.activeTab === 'following') {
                    if (pull) {
                        this.dataList = result?.list || []
                    } else {
                        this.dataList = (this.dataList || []).concat(result?.list || [])
                    }
                    if (this.dataList.length >= result.total || result.list.length == 0) {
                        this.finished = true
                    } else {
                        this.currentPage += 1
                    }
                }
                this.loading = false
            } catch (e) {
                console.error(e)
                this.finished = true
            } finally {
                this.loading = false
                this.showEmpty = this.dataList.length === 0
            }
        },
        gotoOtherUserDetail(e) {
            const type = e.target.dataset?.type
            const item = JSON.parse(type)
            // if (item.releaseStatus === 1) {
            this.pushToCustomerDetail(item.uin)
            // }
        },
    },
}
</script>

<style scoped lang="less">
.attention-list {
    width: 100%;
    height: 100%;
    background-color: #f9f9f9;
    #iosBottom();
}

.placeholder {
    height: 36px;
}

.empty_bg {
    position: relative;
    top: -12px;
    height: calc(100vh - 36px);
    padding-top: 108px;
    background-color: #fff;
}

.attention-head {
    position: fixed;
    z-index: 10;
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 36px;
    padding: 0;
    background-color: #fff;

    &-item {
        margin-right: 16px;
        margin-left: 12px;
        font-weight: 400;
        font-size: 15px;
        font-style: normal;
        line-height: 22px;

        .label {
            font-weight: 500;
            font-size: 16px;
            font-style: normal;
            line-height: 22px;
        }
    }
}

.list {
    padding: 0 12px;
}

.list-item {
    background-color: #fff;

    &:first-of-type {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    &:last-of-type {
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;
    }

    &-content {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;

        .textBox {
            margin: 11px 12px 0;
            padding: 0 0 11px;

            .title {
                color: #2f2f2f;
                font-weight: bold;
                font-size: 14px;
                font-style: normal;
                line-height: 20px;
            }

            .descript {
                width: calc(100vw - 48px);
                margin-top: 4px;
                color: #9c9c9c;
                font-size: 12px;
                font-style: normal;
                line-height: 18px;
            }
        }
    }

    .hor-line {
        height: 0.5px;
        margin: 0 12px 0.5px;
        margin-bottom: 0.5;
        background-color: #f8f8f8;
    }
}
// .all_border_radius {
//     border-radius: 8px;
// }
</style>
