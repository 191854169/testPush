<template>
    <div v-if="requestFinish">
        <van-pull-refresh
            v-model="isPullLoading"
            @refresh="getMarketBreakDown"
            style="min-height: 100vh"
            :pulling-text="$t('pullRefresh')"
            :loosing-text="$t('relessRefresh')"
            :loading-text="`${$t('loading')}...`"
        >
            <logo-ad id="logo" class="share logo-ad"></logo-ad>
            <holdingDetail
                id="html2canvas"
                :forShare="forShare"
                :amountStatus="amountStatus"
                @switchAmountStatus="switchAmountStatus"
                :showHoldingList="showHoldingList"
                @switchHoldingListStatus="showHoldingList = !showHoldingList"
                :currencyMap="currencyMap"
                @updateCurrencyMap="updateCurrencyMap"
                :totalAsset="totalAsset"
                :portfolioInfo="portfolioInfo"
                :marketAssetBreakDown="marketAssetBreakDown"
                :disableChange="isInvestmentMigration"
            ></holdingDetail>
        </van-pull-refresh>
    </div>
</template>

<script>
import holdingDetail from './holdingDetail.vue'
import html2canvas from 'html2canvas'
import LogoAd from '@/components/logo.vue'

import { isTenantApp } from '@/utils'
import { WEALTH_AMOUNT_STATUS_kEY } from '@/config/common.js'
import { marketBreakDown } from '@/apis/portfolioFollow'
import { mapState } from 'vuex'

// const USD = 'USD'
const HKD = 'HKD'
// const CNH = 'CNH'

export default {
    mixins: [],
    components: { holdingDetail, LogoAd },
    props: {},
    data() {
        return {
            useUSPre: true,
            useUSPost: true,
            forShare: false,
            requestFinish: false,
            isRequesting: false,
            isPullLoading: false,
            amountStatus: true, // true - 展示资金内容 false - 隐藏资金内容
            showHoldingList: true,
            portfolioInfo: {},
            marketAssetBreakDown: {},
            totalAsset: {},
            currencyMap: {
                group: HKD,
                cash: HKD,
                fund: HKD,
                bond: HKD,
            },
        }
    },
    computed: {
        ...mapState('user', ['accts']),
        tgID() {
            return this.$route.query.tgID // 投顾ID
        },
        tgAccID() {
            return this.$route.query.tgAccID
        },
        isInvestmentMigration() {
            return this.$route.query.isInvestmentMigration == 1
        },
    },
    watch: {},
    async created() {
        this.requestFinish = false
        this.$loading.show = true
        this.fetchIgnoreState()
        await this.getMarketBreakDown()
        this.$loading.show = false
    },
    async mounted() {
        this.registerShareButton()
        await this.setAmountStatus()
    },
    beforeDestroy() {
        this.unregisterShareButton()
    },
    destroyed() {},
    filters: {},
    methods: {
        async getMarketBreakDown() {
            if (this.isRequesting) {
                this.isPullLoading = false
                return
            }
            this.isRequesting = true
            const subAcctId = this.accts.subAcctId || localStorage.getItem('sub') || undefined
            const assetsType = this.isInvestmentMigration ? 14 : undefined
            const params = {
                portfolioID: this.tgID,
                subAccountID: subAcctId,
                queryAccountID: this.tgAccID,
                useUsPre: this.useUSPre ? 1 : 0,
                useUsPost: this.useUSPost ? 1 : 0,
                assetsType: assetsType,
            }
            try {
                const { result = {} } = await marketBreakDown(params)
                this.portfolioInfo = result.portfolioInfo || {}
                this.marketAssetBreakDown = result.marketAssetBreakDown || {}
                this.totalAsset = result.totalAsset || {}
                console.log('getMarketBreakDown totalAsset ==>', result.totalAsset, params)
                console.log('getMarketBreakDown portfolioInfo ==>', this.portfolioInfo)
                console.log('getMarketBreakDown marketAssetBreakDown ==>', this.marketAssetBreakDown)
            } catch (e) {
                console.error('getMarketBreakDown error', e, params)
            } finally {
                this.requestFinish = true
                this.isRequesting = false
                this.isPullLoading = false
                // setTimeout(() => {
                //     this.getMarketBreakDown()
                // }, 3000)
            }
        },
        async setAmountStatus() {
            if (this.$jsBridge) {
                const data = await this.$jsBridge.getAssetsShowStatus()
                this.amountStatus = data
            } else {
                try {
                    this.amountStatus = JSON.parse(localStorage.getItem(WEALTH_AMOUNT_STATUS_kEY))
                } catch (e) {
                    this.amountStatus = true
                    localStorage.setItem(WEALTH_AMOUNT_STATUS_kEY, JSON.stringify(this.amountStatus))
                }
            }
        },
        fetchIgnoreState() {
            this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            if (this.userInfo.clientSetting) {
                try {
                    const clientSetting = JSON.parse(this.userInfo.clientSetting)
                    this.useUSPre = clientSetting?.usePreMarketPrice ?? true
                    this.useUSPost = clientSetting?.useAfterHoursPrice ?? true
                    console.log(`yinlong useUSPre ${this.useUSPre} useUSPost ${this.useUSPost}`)
                } catch (error) {
                    console.error(error)
                }
            }
        },
        switchAmountStatus() {
            this.amountStatus = !this.amountStatus
            if (this.$jsBridge) {
                this.$jsBridge.setAssetsShowStatus({ showAssets: this.amountStatus })
            } else {
                localStorage.setItem(WEALTH_AMOUNT_STATUS_kEY, JSON.stringify(this.amountStatus))
            }
        },
        updateCurrencyMap({ id, currency }) {
            this.currencyMap[id] = currency
        },
        // 分享逻辑
        registerShareButton() {
            this.$jsBridge?.setButton('right1', { icon: 'share' }, this.share)
        },
        unregisterShareButton() {
            this.$jsBridge?.setButton('right1', { icon: null }, () => {})
        },
        share() {
            if (!isTenantApp()) return
            const options = {
                useCORS: true, // 开启跨域配置
                backgroundColor: '#f9f9f9',
                dpi: window.devicePixelRatio * 2,
                scale: window.devicePixelRatio,
                allowTaint: true, // 允许跨域图片
                async: true,
            }
            this.$loading.show = true
            this.forShare = true
            const logoElement = new Image()
            const shareElement = new Image()
            // 延时0.1s
            new Promise(resolve => setTimeout(resolve, 100))
                .then(() => {
                    // 生成海报
                    return html2canvas(document.querySelector('#logo'), options)
                })
                .then(logoCanvas => {
                    logoElement.src = logoCanvas.toDataURL()
                })
                .then(() => {
                    // 使用 html2canvas 截取第二张图
                    return html2canvas(document.querySelector('#html2canvas'), options)
                })
                .then(canvas => {
                    shareElement.src = canvas.toDataURL()
                    // 延时 0.1s
                    return new Promise(resolve => setTimeout(resolve, 100))
                })
                .then(() => {
                    // 创建画布元素
                    const combinedCanvas = document.createElement('canvas')
                    combinedCanvas.width = Math.max(logoElement.width, shareElement.width)
                    combinedCanvas.height = logoElement.height + shareElement.height

                    // 获取画布上下文
                    const context = combinedCanvas.getContext('2d')

                    // 将第一张图绘制到画布上
                    context.drawImage(logoElement, 0, 0)
                    // 将第二张图绘制到画布上
                    context.drawImage(shareElement, 0, logoElement.height)
                    const combinedURL = combinedCanvas.toDataURL()
                    if (combinedURL) {
                        this.$jsBridge?.share({ imageData: combinedURL })
                    }
                })
                .catch(error => {
                    console.error(`shareImage error`, error)
                })
                .finally(() => {
                    this.forShare = false
                    this.$loading.show = false
                })
        },
    },
}
</script>

<style scoped lang="less">
.share {
    position: fixed;
    bottom: -1000px;
    left: -1000px;
    z-index: -100;
    width: 100%;
}

.logo-ad {
    padding-bottom: 5px;
    background: #f9f9f9;
}
</style>
