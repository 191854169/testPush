<!-- 星选组合页 -->
<template>
    <div class="star-selection">
        <logo-ad class="logo" v-if="isNotInHLAndWTApp" :showDownloadBtn="true"></logo-ad>
        <multi-img class="bgimage" verifyLang name="star_selection_big_bg" directory="fund"></multi-img>
        <van-tabs
            class="outer_tabs"
            :class="{
                outer_tabs_c: groupTypeList.length <= 3,
            }"
            v-model="outerActiveTab"
            swipe-threshold="2"
            @click="outerTabClickAction"
        >
            <van-tab v-for="item in groupTypeList" :key="item.id" :title="item.name">
                <van-tabs class="inner_tabs" v-model="innerActiveTab" swipe-threshold="2" @click="innerTabClickAction">
                    <van-tab v-for="innerItem in periodList" :key="innerItem.key" :title="innerItem.label">
                        <div class="tab-page">
                            <div class="star_select_item_bg">
                                <starSelectItem
                                    class="star_select_item"
                                    v-for="dataItem in dataList"
                                    :key="dataItem.portfolioId"
                                    :item="dataItem"
                                    :period="periodTab"
                                    :showHeader="item.license == 10"
                                />
                            </div>
                        </div>
                    </van-tab>
                </van-tabs>
            </van-tab>
        </van-tabs>
        <loading :propsShow="true" :showLoading="showLoading" />
        <div class="share">
            <share-portfolio-star-selection
                :dataList="dataList"
                :shareLeadboradTitle="shareLeadboradTitle"
                :shareLeadboradPeriodText="shareLeadboradPeriodText"
                :periodTab="periodTab"
                :showHeader="showHeader"
                id="html2canvas"
            ></share-portfolio-star-selection>
        </div>
    </div>
</template>

<script>
import { i18n } from '@/i18n/fund/index.js'
import { Tab, Tabs, Toast } from 'vant'
import { portfolioLabelList, PortfolioList } from '@/apis/followInvest'
import { debounce, isEmpty } from '@/utils'
import { throttle } from 'lodash'
import starSelectItem from './components/starSelectionItem.vue'
import sharePortfolioStarSelection from './components/share/sharePortfolioStarSelection.vue'
import html2canvas from 'html2canvas'
import dayjs from 'dayjs'
import { isTenantApp, getAppVersion, compareVersion } from '@/utils/tools.js'

const periodUnit = {
    week: 'w1',
    month: 'm1',
    quarter: 'm3',
    year: 'y1',
    count: 'follower',
}
export default {
    name: 'star-selection',
    components: {
        starSelectItem,
        [Tab.name]: Tab,
        [Tabs.name]: Tabs,
        [Toast.name]: Toast,
        sharePortfolioStarSelection,
    },
    data() {
        return {
            list: [],
            outerActiveID: '', // 活动的tab
            outerActiveTab: 0,
            outerActiveName: '',
            innerActiveTab: 0,
            groupTypeList: [],
            periodTab: periodUnit.week,
            periodList: [
                { label: i18n.t('starSel.w1Profit'), key: periodUnit.week },
                { label: i18n.t('starSel.m1Profit'), key: periodUnit.month },
                { label: i18n.t('starSel.m3Profit'), key: periodUnit.quarter },
                { label: i18n.t('starSel.y1Profit'), key: periodUnit.year },
                { label: i18n.t('starSel.follower'), key: periodUnit.count },
            ],
            canLoadingMore: true,
            isLoadingMore: false,
            dataList: [],
            loadMoreHandler: throttle(this.triggerLoadMore, 1000, { leading: false }),
            showLoading: false,
            showShareDetail: false,
            periodTextMap: {
                [periodUnit.week]: this.$t('weeklyLeaderboard'),
                [periodUnit.month]: this.$t('monthlyLeaderboard'),
                [periodUnit.quarter]: this.$t('quarterlyLeaderboard'),
                [periodUnit.year]: this.$t('halfYearLeaderboard'),
                [periodUnit.count]: this.$t('followLeaderboard'),
            },
            showHeader: false,
            listStartTime: 0,
            listEndTime: 0,
        }
    },
    computed: {
        isNotInHLAndWTApp() {
            return !this.$env.isInApp
        },
        shareLeadboradTitle() {
            return `${this.outerActiveName}-${this.periodTextMap[this.periodTab]}`
        },
        shareLeadboradPeriodText() {
            if (this.innerActiveTab === periodUnit.count) {
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
    created() {},
    mounted() {
        this.registerShareButton()
        document.addEventListener('scroll', this.listenScroll, true)
        this.portfolioLabelList()
            .then(() => {
                this.setOutActiveTab()
                this.setInnerActiveTab()
                return this.portfolioList()
            })
            .catch(err => {
                console.error('yinlong catch', err)
            })
    },
    beforeDestroy() {
        this.unregisterShareButton()
        document.removeEventListener('scroll', this.listenScroll, true)
        this.$store.commit('headerPortrait/clearAll')
    },
    methods: {
        setOutActiveTab() {
            if (this.$route.query.outerActiveTab) {
                this.outerActiveTab = Number(this.$route.query.outerActiveTab)
                this.outerActiveID = this.groupTypeList[this.outerActiveTab].id
                console.log('created route', `outerActiveTab = ${this.outerActiveTab}, outerActiveID = ${this.outerActiveID}`)
            }
        },
        setInnerActiveTab() {
            if (this.$route.query.innerActiveTab) {
                this.innerActiveTab = Number(this.$route.query.innerActiveTab)
                this.periodTab = this.periodList[this.innerActiveTab].key
                console.log('created route', `innerActiveTab = ${this.innerActiveTab}, periodTab = ${this.periodTab}`)
            }
        },
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
        async portfolioLabelList() {
            const { result } = (await portfolioLabelList()) || {}
            console.log('yinlong portfolioLabelList', result)
            this.groupTypeList = result.list
            if (!isEmpty(this.groupTypeList)) {
                this.outerActiveID = this.groupTypeList[0].id
                this.outerActiveName = this.groupTypeList[0].name || '--'
                this.showHeader = this.groupTypeList[0]?.license == 10
            }
        },
        async portfolioList() {
            if (isEmpty(this.outerActiveID)) {
                return
            }
            try {
                const params = {
                    count: 50,
                    field: this.periodTab,
                    labelId: this.outerActiveID,
                    order: 'desc',
                    start: 0,
                    type: 0,
                }
                this.$loading.show = true
                this.dataList = []
                const { result } = (await PortfolioList(params)) || {}
                const resultList = result.records || []
                this.dataList = resultList
                this.canLoadingMore = result.total > this.dataList.length
                this.listStartTime = result.listStartTime
                this.listEndTime = result.listEndTime
                console.log('yinlong portfolioList', result)
                this.$loading.show = false
            } catch (error) {
                this.$loading.show = false
                console.error('yinlong portfolioList', error)
            }
        },
        // 上拉加载成功后关闭加载状态
        async triggerLoadMore() {
            if (this.isLoadingMore) return
            this.isLoadingMore = true
            if (isEmpty(this.outerActiveID)) {
                return
            }
            try {
                const params = {
                    count: 50,
                    field: this.periodTab,
                    labelId: this.outerActiveID,
                    order: 'desc',
                    start: this.dataList.length,
                    type: 0,
                }
                const { result } = (await PortfolioList(params)) || {}
                this.dataList = this.dataList.concat(result.records)
                this.canLoadingMore = result.total > this.dataList.length
                this.listStartTime = result.listStartTime
                this.listEndTime = result.listEndTime
            } catch (error) {
                this.$loading.show = false
            }
        },
        outerTabClickAction(index, title) {
            const newID = this.groupTypeList[index].id
            this.outerActiveName = this.groupTypeList[index].name || '--'
            this.showHeader = this.groupTypeList[index]?.license == 10
            if (this.outerActiveID == newID) return

            this.outerActiveID = newID
            this.portfolioList()
            console.log(index, title, this.outerActiveID)
        },
        innerTabClickAction(index, title) {
            console.log(index, title)
            this.periodTab = this.periodList[index].key
            this.portfolioList()
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
                console.log('direct share hadDownloadHeaderImg = ', this.hadDownloadHeaderImg)
                this.shareImage()
            }
        },
        shareImage() {
            const pageUrl = `${location.origin}/wealth/fund.html#/star-selection?outerActiveTab=${this.outerActiveTab}&innerActiveTab=${this.innerActiveTab}`
            console.log('share pageUrl = ', pageUrl)
            const title = this.$t('starSel.starSelTitle')
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
                            if (isTenantApp()) {
                                const curVersion = getAppVersion()
                                const moreThanVersion = compareVersion(curVersion, '2.15.0') >= 0
                                if (moreThanVersion) {
                                    setTimeout(() => {
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
                    this.showShareDetail = false
                    this.showLoading = false
                    console.log('shareImage---------------2>', error)
                } finally {
                    this.$store.commit('headerPortrait/clearAll')
                }
            }, 500)
        },
    },
    watch: {
        hadDownloadHeaderImg: {
            handler(v) {
                console.log('downloadedImgMap ==>', v)
                if (v && this.showShareDetail) {
                    this.shareImage()
                }
            },
            // deep: true,
        },
    },
}
</script>

<!-- tabs -->
<style scoped lang="less">
.star-selection {
    background: #f9f9f9;
}

.bgimage {
    position: relative;
    z-index: 1;
    height: 194px;
}

.outer_tabs /deep/.van-tabs__wrap {
    position: relative;
    z-index: 2;
    height: 40px;
    margin: -54px 0 11px;

    .van-tab {
        flex: 0 0 fit-content;
        align-items: flex-start;
        margin: 0;
        padding: 0 10px;

        &:first-child {
            padding-left: 16px;
        }
    }

    .van-tabs__nav {
        background: transparent; // 透明色
    }

    .van-tabs__line {
        bottom: 17px;
        width: 16px;
        height: 16px;
        background-color: transparent;
        background-image: url('~@/assets/images/fund/star_selection_active_indicator@3x.png');
        background-repeat: no-repeat;
        background-size: contain;
        border-radius: 0;
        transition-duration: 0s !important;
    }

    .van-tab__text {
        align-items: center;
        padding: 5px 10px;
        color: #fff;
        font-weight: bold;
        font-size: 15px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 4px;
    }

    .van-tab--active .van-tab__text {
        padding: 5px 10px;
        color: #2f2f2f;
        font-weight: bold;
        font-size: 15px;
        background: linear-gradient(to bottom, #fff0e0 0%, #ffdab5 70%);
    }
}

.outer_tabs_c /deep/.van-tabs__wrap {
    .van-tabs__nav {
        justify-content: center;
    }
}

.outer_tabs_l /deep/.van-tabs__wrap {
    .van-tab {
        flex: 0 0 fit-content;
    }
}

.inner_tabs /deep/ .van-tabs__wrap {
    height: 44px;
    margin: 0;

    .van-tab {
        flex: 1 0 fit-content;
        align-items: center;
        margin: 0;
        padding: 0 6px;
        border: none;

        &:first-child {
            padding-left: 12px;
        }

        &:last-child {
            padding-right: 12px;
        }
    }

    .van-tabs__nav {
        justify-content: flex-start;
        padding: 0;
        background: transparent;
        // background: red;
    }

    .van-tabs__line {
        width: 0;
        height: 0;
    }

    .van-tab__text {
        align-items: center;
        padding: 4px 12px;
        color: #666;
        font-weight: normal;
        font-size: 14px;
        background: #fff;
        border-radius: 14px;
    }

    .van-tab--active .van-tab__text {
        padding: 4px 12px;
        color: #2f2f2f;
        font-weight: bold;
        font-size: 14px;
        background: rgba(255, 105, 7, 0.1);
    }
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
<!-- 列表 -->
<style scoped lang="less">
.tab-page {
    padding-bottom: calc(constant(safe-area-inset-bottom)); /* 兼容 iOS<11.2 */
    padding-bottom: calc(env(safe-area-inset-bottom)); /* 兼容iOS >= 11.2 */
    background-color: transparent;

    .star_select_item_bg {
        padding: 0 12px;
        background-color: #f9f9f9;

        .star_select_item {
            margin: 12px 0;
            border-radius: 8px;

            &:first-child {
                margin: 8px 0;
            }
        }
    }
}
</style>
