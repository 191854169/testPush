<!-- 
    跟着大咖投资页
 -->
<template>
    <div class="master-investment">
        <logo-ad class="logo" v-if="isNotInHLAndWTApp" :showDownloadBtn="true"></logo-ad>
        <multi-img class="bgimage" verifyLang name="master_big_bg" directory="fund"></multi-img>
        <div class="popover">
            <van-popover v-model="periodSwitch" trigger="click" placement="bottom-end" :get-container="getPopoverContainer" ref="periodList">
                <ul class="list" @click="onPeriodChoose">
                    <li class="item" :class="{ selected: item.value === period }" :data-key="item.value" v-for="item in periodList" :key="item.value">
                        {{ item.text }}
                    </li>
                </ul>
                <template #reference>
                    <label>
                        <span>{{ period | periodFilter(periodList) }}</span>
                        <multi-img name="angle_trigger_white" directory="fund" class="trigger" alt="select"></multi-img>
                        <div ref="trigger" class="trigger-container"></div>
                    </label>
                </template>
            </van-popover>
        </div>
        <!-- 大咖列表 -->
        <div class="master-list">
            <div class="master-item" v-for="item in masterList" :key="item.symbol">
                <masterTopInfoView :info="item" @followedSuccess="getMasterList" />
                <div class="combination" @click="gotoFollowDetail(item.portfolio[0].id)">
                    <div class="left">
                        <div class="flex-c">
                            <span class="group_name">{{ item.portfolio[0].name }}</span>
                            <portfolio-tag :portfolioType="item.portfolio[0].type"></portfolio-tag>
                        </div>
                        <remainingDayFollower
                            class="mar-t8"
                            :margin-style="'12px'"
                            :remainingDay="item.portfolio[0].foundDayNum"
                            :follower="item.portfolio[0].followersNum"
                        />
                    </div>
                    <div class="right">
                        <p class="income" v-riseFall="{ value: item.portfolio[0].profitReturn, base: 2, rate: true }"></p>
                        <p class="income_text">{{ item.portfolio[0].profitCycle | profitTitleFilter }}</p>
                    </div>
                </div>
            </div>
        </div>
        <!-- <div class="no-more-data" v-if="noMoreData">大咖名单持续更新中, 敬请期待</div> -->
        <loading :propsShow="true" :showLoading="showLoading" />
        <div class="share">
            <share-portfolio-master-investment
                :masterList="masterList"
                :shareLeadboradTitle="shareLeadboradTitle"
                :shareLeadboradPeriodText="shareLeadboradPeriodText"
                id="html2canvas"
            ></share-portfolio-master-investment>
        </div>
    </div>
</template>

<script>
import { debounce, isEmpty } from '@/utils'
import { throttle } from 'lodash'
import { investMasterList } from '@/apis/followInvest'
import { followerNumFilter, profitTitleFilter } from './utils/filters'
import masterTopInfoView from './components/masterTopInfoView'
import portfolioTag from './components/portfolioTag.vue'
import remainingDayFollower from './components/remainingDayFollower.vue'
import sharePortfolioMasterInvestment from './components/share/sharePortfolioMasterInvestment.vue'
import gotoFollowDetailsMixin from './mixins/gotoFollowDetailsMixin'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import html2canvas from 'html2canvas'
import dayjs from 'dayjs'
import { isHLApp, getAppVersion, compareVersion } from '@/utils'

export default {
    name: 'master-investment',
    props: {},
    mixins: [gotoFollowDetailsMixin, watchPageVisibleMixin],
    components: {
        masterTopInfoView,
        portfolioTag,
        remainingDayFollower,
        sharePortfolioMasterInvestment,
    },
    data() {
        return {
            period: 'w1',
            periodList: [
                { value: 'w1', text: this.$t('nearOneWeek') },
                { value: 'm1', text: this.$t('nearOneMonth') },
                { value: 'm3', text: this.$t('nearThreeMonth') },
                { value: 'm6', text: this.$t('nearSixMonth') },
                { value: 'y1', text: this.$t('nearOneYear') },
                { value: 'y3', text: this.$t('nearThreeYear') },
                { value: 'total', text: this.$t('accumulatedProfit') },
            ],
            bufferPool: {},
            periodSwitch: false,
            noMoreData: true,
            canLoadingMore: true,
            isLoadingMore: false,
            masterList: [],
            loadMoreHandler: throttle(this.triggerLoadMore, 1000, { leading: false }),
            showLoading: false,
            showShareDetail: false,
            periodTextMap: {
                w1: this.$t('weeklyLeaderboard'),
                m1: this.$t('monthlyLeaderboard'),
                m3: this.$t('quarterlyLeaderboard'),
                m6: this.$t('halfYearLeaderboard'),
                y1: this.$t('yearLeaderboard'),
                y3: this.$t('threeYearLeaderboard'),
                total: this.$t('totalLeaderboard'),
            },
            listStartTime: 0,
            listEndTime: 0,
        }
    },
    computed: {
        isNotInHLAndWTApp() {
            return !this.$env.isInApp
        },
        shareLeadboradTitle() {
            return `${this.$t('investmentIncome')}-${this.periodTextMap[this.period]}`
        },
        shareLeadboradPeriodText() {
            if (this.period === 'total') {
                return ``
            }
            if (this.listStartTime && this.listEndTime) {
                console.log('date', this.listStartTime)
                return dayjs(this.listStartTime).format('YYYY/MM/DD') + ' - ' + dayjs(this.listEndTime).format('YYYY/MM/DD')
            }
            return ''
        },
        hadDownloadHeaderImg() {
            return this.$store.getters['headerPortrait/hadDownloadHeaderImg']
        },
    },
    watch: {
        hadDownloadHeaderImg: {
            handler(v) {
                console.log('downloadedImgMap ==>', v)
                console.log('downloadedImgMap ==> this.showShareDetail = ', this.showShareDetail)
                if (v && this.showShareDetail) {
                    this.shareImage()
                }
            },
            // deep: true,
        },
    },
    filters: {
        profitTitleFilter,
        followerNumFilter,
        periodFilter(v, list) {
            return ((list || []).find(i => i.value === v) || {}).text
        },
    },
    created() {
        if (this.$route.query.period) {
            this.period = this.$route.query.period
        }
    },
    mounted() {
        this.registerShareButton()
        document.addEventListener('scroll', this.listenScroll, true)
        this.getMasterList()
        this.watch(() => {
            this.getMasterList()
        })
    },
    beforeDestroy() {
        this.unregisterShareButton()
        document.removeEventListener('scroll', this.listenScroll, true)
        this.$store.commit('headerPortrait/clearAll')
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
        async getMasterList() {
            try {
                if (isEmpty(this.bufferPool)) {
                    this.$loading.show = true
                }
                const { result } = (await investMasterList({ count: -1, profitCycle: this.period, start: 0 })) || {}
                const resultList = result.list || []
                this.masterList = resultList
                this.canLoadingMore = result.total > this.masterList.length
                this.listStartTime = result.listStartTime
                this.listEndTime = result.listEndTime
                if (!isEmpty(this.masterList) && !isEmpty(this.masterList[0].portfolio)) {
                    const key = this.masterList[0].portfolio[0].profitCycle
                    this.bufferPool[key] = this.masterList
                }
                this.$loading.show = false
            } catch (error) {
                this.$loading.show = false
                console.error('yinlong getMasterList', error)
            }
        },
        // 上拉加载成功后关闭加载状态
        async triggerLoadMore() {
            if (this.isLoadingMore) return
            this.isLoadingMore = true
            try {
                const { result } = (await investMasterList({ count: 20, profitCycle: this.period, start: this.masterList.length })) || {}
                this.masterList = this.masterList.concat(result.list)
                if (!isEmpty(this.masterList) && !isEmpty(this.masterList[0].portfolio)) {
                    const key = this.masterList[0].portfolio[0].profitCycle
                    this.bufferPool[key] = this.masterList
                }
                this.canLoadingMore = result.total > this.masterList.length
                this.listStartTime = result.listStartTime
                this.listEndTime = result.listEndTime
                console.log('yinlong triggerLoadMore', result)
                this.isLoadingMore = false
            } catch (error) {
                console.error('yinlong triggerLoadMore', error)
                this.isLoadingMore = false
            }
        },
        onPeriodChoose(e) {
            this.period = e.target.dataset.key
            this.getMasterList()
        },

        getPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },
        registerShareButton() {
            this.$jsBridge?.setButton('right1', { icon: 'share' }, this.share)
        },
        unregisterShareButton() {
            this.$jsBridge?.setButton('right1', { icon: null }, () => {})
        },
        share() {
            this.showLoading = true
            this.showShareDetail = true
            if (this.hadDownloadHeaderImg) {
                this.shareImage()
            }
        },
        shareImage() {
            const pageUrl = `${location.origin}/wealth/fund.html#/master-investment?period=${this.period}`
            console.log('share url = ', pageUrl)
            const title = this.$t('master.masterTitle')
            const desc = this.shareLeadboradTitle
            setTimeout(() => {
                try {
                    // 生成海报
                    html2canvas(document.querySelector('#html2canvas'), {
                        useCORS: true, // 开启跨域配置
                        backgroundColor: null,
                        dpi: window.devicePixelRatio * 2,
                        scale: 6,
                        allowTaint: true, // 允许跨域图片
                    }).then(async canvas => {
                        const shareImage = canvas.toDataURL()
                        // console.log('shareImage---------------2>', shareImage)
                        if (shareImage) {
                            this.showShareDetail = false
                            this.showLoading = false
                            if (isHLApp()) {
                                const curVersion = getAppVersion()
                                const moreThanVersion = compareVersion(curVersion, '2.15.0') >= 0
                                if (moreThanVersion) {
                                    setTimeout(() => {
                                        this.showShareDetail = false
                                        this.showLoading = false
                                        this.$jsBridge?.share({
                                            title: title,
                                            desc: desc,
                                            pageUrl: pageUrl,
                                            imageData: shareImage,
                                            chooseShareType: true,
                                        })
                                        console.log('shareImage---------------2>', 'has share image, call share')
                                    }, 100)
                                } else {
                                    this.$jsBridge?.share({
                                        title: title,
                                        desc: desc,
                                        imageData: shareImage,
                                    })
                                }
                            }
                        }
                    })
                } catch (error) {
                    console.log('shareImage---------------2>', error)
                    this.showShareDetail = false
                    this.showLoading = false
                } finally {
                    this.$store.commit('headerPortrait/clearAll')
                }
            }, 500)
        },
    },
}
</script>

<style scoped lang="less">
.master-investment {
    padding: 0;
    padding-bottom: calc(constant(safe-area-inset-bottom)); /* 兼容 iOS<11.2 */
    padding-bottom: calc(env(safe-area-inset-bottom)); /* 兼容iOS >= 11.2 */
    background: #f9f9f9;
}

.bgimage {
    position: relative;
    z-index: 1;
    height: 194px;
}

.popover {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: row;
    align-items: center; // 上下居中
    justify-content: flex-end;
    height: 40px;
    margin-top: -72px;
    padding: 0 12px;
    color: #fff;
    font-size: 12px;

    label {
        display: flex;
        align-items: center; // 上下居中
        min-width: 59px;
        height: 24px;
        padding: 0 10px;
        // justify-content: center; // 左右居中
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;

        & > span {
            flex: 1 0 auto;
        }

        img {
            width: 16px;
            margin-left: 16px;

            &.trigger {
                width: 6px;
                margin-left: 4px;
            }
        }

        .trigger-container {
            position: relative;
        }
    }

    .list {
        width: 94px;
        overflow: hidden;
        border-radius: 4px;

        .item {
            color: #2f2f2f;
            font-size: 14px;
            line-height: 36px;
            text-align: center;
            background-color: #fff;
            box-shadow: inset 0 -0.5px 0 #efefef;

            &.selected {
                color: #ff6907;
            }
        }
    }
}

.share-info {
    position: absolute;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: -60px;
    color: #fbd6b0;
    text-align: center;

    .title {
        font-weight: bold;
        font-size: 16px;
        line-height: 24px;
    }

    .subtitle {
        font-size: 12px;
        line-height: 18px;
    }
}

.master-list {
    height: auto;
    padding: 0 12px;
    background: #f9f9f9;

    .master-item {
        position: relative;
        z-index: 2;
        margin: 0 0 12px;
        padding: 16px 12px;
        background: #fff;
        border-radius: 8px;

        // 组合信息
        .combination {
            display: flex;
            align-items: center;
            height: 76px;
            margin-top: 16px;
            padding: 0 12px;
            background-color: #f9f9f9;
            border-radius: 4px;

            .left {
                display: inline-block;
                width: 70%;

                .group_name {
                    margin-right: 8px;
                    color: #2f2f2f;
                    font-weight: bold;
                    font-size: 14px;
                    line-height: 20px;
                }

                .icon {
                    width: 12px;
                    height: 12px;
                }

                .group_value {
                    margin-left: 4px;
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .right {
                width: 30%;
                text-align: right;

                .income {
                    font-weight: bold;
                    font-size: 16px;
                    line-height: 22px;
                }

                .income_text {
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }
    }
}

.no-more-data {
    display: flex;
    justify-content: center; // 左右居中
    width: 100%;
    padding: 15px 0 0;
    padding-bottom: calc(48px + constant(safe-area-inset-bottom)); // 兼容 iOS<11.2
    padding-bottom: calc(48px + env(safe-area-inset-bottom)); // 兼容iOS >= 11.2
}

.logo {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    width: 100%;
    height: 68px;
    padding-bottom: 18px;

    & + .bgimage {
        margin-top: 68px;
    }

    ::v-deep header {
        padding: 18px 12px;
    }
}

.share {
    position: fixed;
    bottom: -1000px;
    left: -1000px;
    z-index: -100;
    width: 100%;
}
</style>
