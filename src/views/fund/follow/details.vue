<!--
 * @Description:产品详情页
-->

<template>
    <div class="details">
        <div v-if="isNotInHLAndWTApp" class="bg_image_not_in_app"></div>
        <logo-ad class="logo" v-if="isNotInHLAndWTApp" :showDownloadBtn="true"></logo-ad>
        <div v-if="isInAPP && compatibility === '1'">
            <div v-if="!isEmpty(obj)" class="bg_image" :class="{ bg_image_close: !runStatusNormal }"></div>
            <navigation-bar
                :color="isEmpty(obj) ? '#ffffff' : runStatusNormal ? '#d4e8ff' : '#d1d1d1'"
                :shadePixel="123"
                @back="goBack"
            ></navigation-bar>
        </div>
        <div v-if="isNotInHLAndWTApp" class="space"></div>
        <!-- 已下架用户提示 -->
        <div class="pos-r pad-12 mar-b-12 index10" v-if="isSoldOut">
            <soldoutTip :isCreater="isCreater" />
        </div>
        <!-- 组合基本信息 -->
        <div class="pos-r pad-12 mar-b-12 index10">
            <basic-info :obj="obj" :isSoldOut="isSoldOut" />
        </div>
        <!-- 组合收益率走势 -->
        <performance-trend ref="chartRef" :obj="obj" />
        <!-- 组合点评 -->
        <div v-if="commentResult.list.length > 0" class="pad-12 mar-b-12">
            <PortfolioCommentCard :dataList="commentResult.list" :top="commentResult.top" />
        </div>
        <!-- 组合仓位 -->
        <div class="pad-12 mar-b-12">
            <position-distribution ref="positionRef" />
        </div>
        <!-- 调仓记录 -->
        <div class="pad-12 pad-b32">
            <rebalancing-records ref="rebalancingRef" />
        </div>

        <risk-statement></risk-statement>
        <!-- 投资组合及分享按钮 -->
        <template v-if="!isSoldOut && !isNotInHLAndWTApp && !isEmpty(obj)">
            <div class="footer-box">
                <bottomButton :obj="obj" :invesetmentPortfolioBasicInfo="invesetmentPortfolioBasicInfo" @request="getData" @share="share" />
            </div>
        </template>
        <loading :propsShow="true" :showLoading="showLoading" />
        <div class="share">
            <share-portfolio-detail :data="obj" id="html2canvas"></share-portfolio-detail>
        </div>
    </div>
</template>

<script>
import NavigationBar from '@/components/NavigationBar.vue'
import PerformanceTrend from './components/PerformanceTrend.vue'
import positionDistribution from './components/positionDistribution.vue'
import bottomButton from './components/bottomButton.vue'
import rebalancingRecords from './components/rebalancingRecords.vue'
import basicInfo from './components/basicInfo.vue'
import basicInfoMixin from './mixins/basicInfoMixin'
import riskStatement from './components/riskStatement.vue'
import PortfolioCommentCard from './components/portfolioCommentCard.vue'
import soldoutTip from './components/soldoutTip.vue'
import SharePortfolioDetail from './components/share/sharePortfolioDetail.vue'
import { portfolioCommentList } from '@/apis/followInvest/index.js'
import { isHLApp, getAppVersion, compareVersion } from '@/utils'
import { CUSTOMER_TYPE } from '../config/common'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import { isEmpty } from '@/utils'
import html2canvas from 'html2canvas'

export default {
    name: 'followDetails',
    mixins: [basicInfoMixin, watchPageVisibleMixin],
    data() {
        return {
            commentResult: {
                list: [],
                total: 0,
            },
            showLoading: false,
            showShareDetail: false,
            shareData: {},
        }
    },
    components: {
        basicInfo,
        NavigationBar,
        PerformanceTrend,
        positionDistribution,
        rebalancingRecords,
        bottomButton,
        riskStatement,
        PortfolioCommentCard,
        soldoutTip,
        SharePortfolioDetail,
    },
    computed: {
        isNotInHLAndWTApp() {
            return !this.$env.isInApp
        },
        isInAPP() {
            return isHLApp()
        },
        compatibility() {
            return this.$route.query.compatibility
        },
        // 当前用户是当前组合创建者
        isCreater() {
            return Number(localStorage.getItem('uin')) == this.obj?.creator?.uin
        },
        // 当前组合创建者是持牌用户
        createrIsPI() {
            return this.obj?.creator?.type === CUSTOMER_TYPE.professional
        },
        runStatusNormal() {
            return this.obj?.runStatus === 1
        },
        // 当前用户是否已下架
        isSoldOut() {
            return this.obj?.creator?.releaseStatus === 2
        },
        hadDownloadHeaderImg() {
            return this.$store.getters['headerPortrait/hadDownloadHeaderImg']
        },
    },
    created() {
        this.getData()
        this.getPortfolioCommentList()
    },
    mounted() {
        this.watch(() => {
            this.getData()
            this.getPortfolioCommentList()
            this.$refs.chartRef.init(false, true)
            if (this.$root.isLogin) {
                this.$refs.positionRef.getData()
                this.$refs.rebalancingRef.getData()
            }
        })
    },
    beforeDestroy() {
        this.$store.commit('headerPortrait/clearAll')
    },
    methods: {
        isEmpty,
        // 获取数据
        async getPortfolioCommentList() {
            try {
                const { result } = await portfolioCommentList({
                    portfolioId: Number(this.$route.query.portfolioId),
                    start: 0,
                    count: 2,
                })
                this.commentResult = result
            } catch (e) {
                console.log('error', e)
            }
        },

        goBack() {
            if (this.$jsBridge) {
                this.$jsBridge.close()
            } else {
                window.close()
            }
        },

        share(data) {
            this.showLoading = true
            this.showShareDetail = true
            this.shareData = data
            if (this.hadDownloadHeaderImg) {
                this.shareImage()
            }
        },

        shareImage() {
            const { portfolioName, portfolioBrief, pageUrl } = this.shareData
            setTimeout(() => {
                try {
                    // 生成海报
                    html2canvas(document.querySelector('#html2canvas'), {
                        useCORS: true, // 开启跨域配置
                        backgroundColor: null,
                        // scale: 2, // 处理模糊
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
                                        this.$jsBridge?.share({
                                            title: portfolioName,
                                            desc: `策略解读：${portfolioBrief}`,
                                            pageUrl: pageUrl,
                                            imageData: shareImage,
                                            chooseShareType: true,
                                        })
                                        console.log('shareImage---------------2>', 'has share image, call share')
                                    }, 100)
                                } else {
                                    this.$jsBridge?.share({
                                        title: portfolioName,
                                        desc: `策略解读：${portfolioBrief}`,
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

<style lang="less" scoped>
.mar-b-12 {
    margin-bottom: -12px;
}

.space {
    width: 100vw;
    height: 12px;
}

.details {
    position: relative;
    z-index: auto;
    background: #f9f9f9;
    user-select: none;
    #iosBottom(14px);

    // 模拟底部模块的高度
    &::after {
        display: block;
        height: 50px;
        content: '';
    }

    .footer-box {
        #iosBottom(14px);

        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        max-width: 375px;
        margin: 0 auto;
        background: #fff;
        box-shadow: inset 0 0.5px 0 #efefef;
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

    & + div {
        margin-top: 68px;
    }

    ::v-deep header {
        padding: 18px 12px;
    }
}

.index10 {
    z-index: 10;
}

.bg_image {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100vw;
    height: 211px;
    margin: 0;
    background: linear-gradient(to bottom, #d4e8ff 150px, #d4e8ff00 100%);
}

.bg_image_not_in_app {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: 100vw;
    height: 122px;
    margin: 0;
    background: linear-gradient(to bottom, #d4e8ff, #d4e8ff00 100%);
}

.bg_image_close {
    background: linear-gradient(to bottom, #d1d1d1 150px, #d1d1d100 100%);
}

.navi_bar {
    // background: green;
    position: fixed;
    left: 0;
    z-index: 1000;
    font-weight: bold;
    font-size: 16px;
}

.share {
    position: fixed;
    bottom: -1000px;
    left: -1000px;
    width: 100%;
}
</style>
