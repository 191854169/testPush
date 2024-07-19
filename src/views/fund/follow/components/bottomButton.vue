<template>
    <div class="button-main flex-c" v-if="!isNotInHlOrWt">
        <!-- <div class="tip" v-if="isStop">{{ $t('follow.portfolioStopTip') }}</div> -->
        <!-- 买入按钮 -->
        <div v-if="showInvestmentBtn" class="trade_button_container">
            <div class="portfolio half_btn" @click="onClickTrade">
                {{ tradeTitle }}
            </div>
            <div class="investment half_btn" @click="onInvestmentClick">
                {{ investmentBtnTitle }}
            </div>
        </div>
        <div v-else>
            <button class="trade_button" :class="{ short_button: toolButtonList.length == 4 }" @click="onClickTrade" v-if="!isStop">
                {{ tradeTitle }}
            </button>
        </div>
        <div class="share-main-container">
            <div class="share-main" v-for="item in toolButtonList" :key="item.key" @click="handleToolClick(item)">
                <div v-if="item.key == 'share'"><i class="fsfont f-a-share_huaban1 f24"></i></div>
                <div v-else>
                    <multi-img class="tool_icon" :name="iconUnit[item.key]" directory="fund" />
                </div>
                <div class="c-gray f10">{{ item.label }}</div>
            </div>
        </div>
        <van-action-sheet v-model="showManageSheet" :cancel-text="$t('cancel')" @click="handlerSheet($event)" title="" :closeable="false">
            <div class="filter-main">
                <div class="item border-bottom-1px" data-type="edit" :key="0">{{ $t('follow.modifyingPortfolioInfo') }}</div>
                <div class="item" data-type="close" :key="1">{{ $t('follow.stopPortfolio') }}</div>
            </div>
        </van-action-sheet>
        <van-action-sheet class="my-action-sheet" v-model="showMoreSheet" :cancel-text="$t('cancel')" title="" :closeable="false">
            <div class="filter_main_more">
                <div class="item_more" v-for="item in sheetBtnList" :data-type="item.key" :key="item.key" @click="handleToolClick(item)">
                    <multi-img v-if="item.key" class="tool_icon" :name="iconUnit[item.key]" directory="fund" />
                    <div>{{ item.label }}</div>
                </div>
            </div>
        </van-action-sheet>
        <van-action-sheet class="my-action-sheet" v-model="showInvestMoreSheet" :cancel-text="$t('cancel')" title="" :closeable="false">
            <div class="filter_main_more">
                <div class="item_more" v-for="item in investmentSheetBtnList" :data-type="item.key" :key="item.key" @click="handleToolClick(item)">
                    <div v-if="item.key === 'share'" class="tool_icon"><i class="fsfont f-a-share_huaban1 f24"></i></div>
                    <multi-img v-if="item.key" class="tool_icon" :name="iconUnit[item.key]" directory="fund" />
                    <div>{{ item.label }}</div>
                </div>
            </div>
        </van-action-sheet>
        <portfolioCloseDialog v-model="showCloseDialog" :obj="obj" @request="$emit('request')"></portfolioCloseDialog>
    </div>
</template>

<script>
import { isTenantApp, customerService, getQueryString } from '@/utils'
import { PORTFOLIO_TYPE_MAP, investmentSubAccountStatus } from '../../config/common'
import { ActionSheet } from 'vant'
import { portfolioFollow } from '@/apis/followInvest/index.js'
import portfolioCloseDialog from './portfolioCloseDialog.vue'
import portfolioTradePrecheckMixin from '../mixins/portfolioTradePrecheckMixin'
import { isEmpty, getProfessionalStatus } from '@/utils'
import { CUSTOMER_TYPE } from '../../config/common'
import { debounce } from 'lodash'
import pathnames from '@/config/H5Pathname'
import { getAccountStatus } from '@/apis/uc.js'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import { UserRiskInfo } from '@/apis/riskAssessment.js'
import { FINANCE_ACCOUNT } from '@/entries/Fund.js'

const Unit = {
    follow: 'follow',
    unfollow: 'unfollow',
    unfollow2: 'unfollow2',
    manage: 'manage',
    simulate: 'simulate',
    share: 'share',
    more: 'more',
    advisory: 'advisory',
    comment: 'comment',
    trade: 'trade',
    edit: 'edit',
    close: 'close',
}

export default {
    name: 'bottomButton',
    components: {
        [ActionSheet.name]: ActionSheet,
        portfolioCloseDialog,
    },
    mixins: [portfolioTradePrecheckMixin, watchPageVisibleMixin],
    props: {
        obj: {
            type: Object,
            default: () => ({}),
        },
        invesetmentPortfolioBasicInfo: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            // 展示管理
            showManageSheet: false,
            // 展示更多
            showMoreSheet: false,
            // 有关联投顾组合时的展示更多
            showInvestMoreSheet: false,
            // 关停组合
            showCloseDialog: false,
            iconUnit: {
                follow: 'icon_portfolio_navi_line_taoxin',
                unfollow: 'icon_portfolio_navi_fill_taoxin',
                unfollow2: 'icon_portfolio_navi_unfollow',
                manage: 'icon_portfolio_navi_guanli',
                simulate: 'icon_portfolio_navi_jisuan',
                more: 'icon_portfolio_navi_more',
                advisory: 'icon_portfolio_navi_advisory',
                comment: 'icon_portfolio_navi_comment',
                trade: 'icon_portfolio_navi_xiadan',
            },
            // 投顾账户开户中
            investmentAccountOpening: false,
            // 关联投顾子账户已开户
            isOpenInvestmentPortfolio: false,
            // 投顾子账户被取消或者删除
            openInvestmentCancelOrDelete: false,
        }
    },
    mounted() {
        this.initInvestmentInfo()
        this.watch(() => {
            this.initInvestmentInfo()
        })
    },
    computed: {
        // 当前登录用户是 Pi
        currentUserIsPi() {
            const acctObj = this.$store.getters['user/getAccts']
            const isProfessional = getProfessionalStatus(acctObj.professionalType)
            return isProfessional
        },
        // 有关联的投顾组合
        hasRelatedInvestmentPortfolio() {
            return !!this.obj.relatedPortfolioID
        },
        isInHlApp() {
            return isTenantApp()
        },
        // 不在恒利或网厅,站外
        isNotInHlOrWt() {
            return !this.$env.isInApp
        },
        isFund() {
            return this.obj.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        isHkStock() {
            return this.obj.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK
        },
        isStop() {
            const STOP_STATUS = 2 // 组合停止
            return this.obj?.runStatus === STOP_STATUS
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
        tradeTitle() {
            if (this.isCreater) {
                return this.$t('follow.rebalance')
            }
            if (this.createrIsPI) {
                return this.$t('follow.quitBuy')
            }
            return this.$t('follow.simulateCalculations')
        },
        showInvestmentBtn() {
            console.log(
                'showInvestmentBtn',
                `hasRelatedInvestmentPortfolio = ${this.hasRelatedInvestmentPortfolio},
                isOpenInvestmentPortfolio = ${this.isOpenInvestmentPortfolio},
                isStop = ${this.isStop}`
            )
            return this.hasRelatedInvestmentPortfolio && !this.isStop && this.isInHlApp
        },
        investmentBtnTitle() {
            if (this.isOpenInvestmentPortfolio) {
                return this.$t('follow.investmentAssets')
            }
            return this.$t('follow.upgradeInvestment')
        },
        toolButtonList() {
            if (this.hasRelatedInvestmentPortfolio) {
                return this.investToolBtnList
            }
            return this.commonToolButtonList
        },
        commonToolButtonList() {
            if (this.isCreater) {
                let list = [
                    { label: this.$t('follow.manager'), key: Unit.manage },
                    { label: this.$t('follow.comment'), key: Unit.comment },
                    { label: this.$t('share'), key: Unit.share },
                    { label: this.$t('more'), key: Unit.more },
                ]
                if (this.isStop && this.createrIsPI) {
                    list = [
                        { label: this.$t('follow.manager'), key: Unit.manage },
                        { label: this.$t('follow.followPortfolio'), key: Unit.follow },
                        { label: this.$t('follow.advisory'), key: Unit.advisory },
                        { label: this.$t('share'), key: Unit.share },
                    ]
                    if (this.obj.followed) {
                        list.splice(1, 1, { label: this.$t('follow.unfollowPortfolio'), key: Unit.unfollow })
                    }
                }
                if (this.isStop && !this.createrIsPI) {
                    list = [
                        { label: this.$t('follow.manager'), key: Unit.manage },
                        { label: this.$t('follow.followPortfolio'), key: Unit.follow },
                        { label: this.$t('share'), key: Unit.share },
                    ]
                    if (this.obj.followed) {
                        list.splice(1, 1, { label: this.$t('follow.unfollowPortfolio'), key: Unit.unfollow })
                    }
                }

                if (!this.isInHlApp) {
                    const index = list.findIndex(e => e.key === Unit.share)
                    if (index != -1) {
                        list.splice(index, 1)
                    }
                }

                return list
            }
            let list = []
            if (this.createrIsPI) {
                list = [
                    { label: this.$t('follow.followPortfolio'), key: Unit.follow },
                    { label: this.$t('follow.simulateCalculations'), key: Unit.simulate },
                    { label: this.$t('follow.advisory'), key: Unit.advisory },
                    { label: this.$t('share'), key: Unit.share },
                ]
                if (this.isStop) {
                    list.splice(1, 1)
                }
            } else {
                list = [
                    { label: this.$t('follow.followPortfolio'), key: Unit.follow },
                    { label: this.$t('share'), key: Unit.share },
                ]
            }
            if (this.obj.followed) {
                list.splice(0, 1, { label: this.$t('follow.unfollowPortfolio'), key: Unit.unfollow })
            }
            if (!this.isInHlApp) {
                const index = list.findIndex(e => e.key === Unit.share)
                if (index != -1) {
                    list.splice(index, 1)
                }
            }
            return list
        },
        investToolBtnList() {
            if (this.commonToolButtonList.length > 3 && this.hasRelatedInvestmentPortfolio) {
                const list = this.commonToolButtonList.slice(0, 2)
                list.push({ label: this.$t('more'), key: Unit.more })
                return list
            }
            return this.commonToolButtonList
        },
        sheetBtnList() {
            let list = []
            if (this.createrIsPI) {
                list = [
                    { label: this.$t('follow.simulateCalculations'), key: Unit.simulate },
                    { label: this.$t('follow.followPortfolio'), key: Unit.follow },
                    { label: this.$t('follow.trade'), key: Unit.trade },
                    { label: this.$t('follow.advisory'), key: Unit.advisory },
                ]
            } else {
                list = [
                    { label: this.$t('follow.simulateCalculations'), key: Unit.simulate },
                    { label: this.$t('follow.followPortfolio'), key: Unit.follow },
                    { label: '' },
                    { label: '' },
                ]
            }
            if (this.obj.followed) {
                list.splice(1, 1, { label: this.$t('follow.unfollowPortfolio'), key: Unit.unfollow2 })
            }
            return list
        },
        investmentSheetBtnList() {
            const list = this.commonToolButtonList.slice(2)
            if (list.length < 4) {
                for (let i = list.length; i < 4; i++) {
                    list.push({
                        label: '',
                    })
                }
            }
            return list
        },
    },
    methods: {
        handleToolClick: debounce(async function (item) {
            this.showManageSheet = false
            this.showMoreSheet = false
            this.showInvestMoreSheet = false
            const key = item.key
            if (key == Unit.follow) {
                const param = {
                    portfolioId: Number(this.$route.query.portfolioId),
                    enable: true,
                }
                try {
                    // 登录
                    if (!this.checkLogin()) return false
                    const { result } = await portfolioFollow(param)
                    if (isEmpty(result)) {
                        this.$emit('request')
                        this.$toast(this.$t('customerDetail.followed'))
                    }
                } catch (error) {
                    console.error(error)
                }
            } else if (key == Unit.unfollow || key == Unit.unfollow2) {
                const param = {
                    portfolioId: Number(this.$route.query.portfolioId),
                    enable: false,
                }
                try {
                    const { result } = await portfolioFollow(param)
                    if (isEmpty(result)) {
                        this.$emit('request')
                        this.$toast(this.$t('customerDetail.unFollowed'))
                    }
                } catch (error) {
                    console.error(error)
                }
            } else if (key == Unit.manage) {
                if (this.isStop) {
                    this.goto('/edit-portfolio-info', true)
                } else {
                    this.showManageSheet = true
                }
            } else if (key == Unit.simulate) {
                try {
                    if (!this.checkLogin()) return false
                    this.goto('/simulation-calculator', true)
                } catch (error) {
                    console.log(error)
                }
            } else if (key == Unit.advisory) {
                try {
                    if (!this.checkLogin()) return false
                    this.gotoOnlineService()
                } catch (error) {
                    console.log(error)
                }
            } else if (key == Unit.more) {
                if (this.hasRelatedInvestmentPortfolio) {
                    this.showInvestMoreSheet = true
                } else {
                    this.showMoreSheet = true
                }
            } else if (key == Unit.comment) {
                this.goto('/create-portfolio-comment')
            } else if (key == Unit.trade) {
                this.handleTrade()
            } else {
                const { portfolioName, portfolioBrief } = this.obj
                const pageUrl = location.href
                this.$emit('share', { portfolioName, portfolioBrief, pageUrl })
            }
        }, 300),
        handlerSheet: debounce(function (e) {
            const { type: key } = e.target.dataset || {}
            this.showManageSheet = false
            this.showMoreSheet = false
            this.showInvestMoreSheet = false
            if (key == Unit.edit) {
                this.goto('/edit-portfolio-info', true)
            } else if (key == Unit.close) {
                this.showCloseDialog = true
            }
        }, 300),
        // 初始化投顾相关请求
        initInvestmentInfo() {
            // 同花顺、网厅不支持
            if (this.$root.isLogin && this.isInHlApp) {
                // this.getInvesetmentAccountStatus()
                this.requestInvestmentOpenStatus()
            }
        },
        // 投资组合
        async handleTrade() {
            try {
                if (!(await this.check(this.obj))) return
                this.goto('/follow-order')
            } catch (e) {
                console.error(e)
            }
        },
        // 投顾组合
        async handelInvestment() {
            try {
                // 前置检查
                if (!(await this.checkInvestment(this.obj))) return
                // 投顾信息合适性匹配
                if (!(await this.checkSuitabilityLevel())) return

                // 已开户跳投顾资产，
                if (!this.isOpenInvestmentPortfolio) {
                    if (this.investmentAccountOpening) {
                        // 开户中去开户页面
                        const { VUE_APP_INVESTMENT_V2_OPEN_ACCOUNT_PAGE: investmentOpenAccountUrl } = pathnames
                        const url = `${investmentOpenAccountUrl}?productId=${this.obj.relatedPortfolioID}&portfolioId=${this.obj.portfolioId}`
                        this.$goPage(url)
                    } else {
                        // 升级投顾组合页面
                        this.$goPage('/upgrade-investment-service', {
                            portfolioId: this.obj.portfolioId,
                            investAdvisorId: this.obj.relatedPortfolioID,
                        })
                    }
                } else {
                    // 投顾资产
                    this.$goPage('/invest-advisory/assets')
                }
            } catch (e) {
                console.error(e)
            }
        },
        onInvestmentClick() {
            this.handelInvestment()
        },
        onClickTrade() {
            // 调仓
            if (this.isCreater) {
                this.goto('/rebalancing', true)
            } else if (this.createrIsPI) {
                this.handleTrade()
            } else {
                this.handleToolClick({ key: Unit.simulate })
            }
        },
        goto(path, immersive) {
            immersive = immersive || false
            const url = `${location.origin}${location.pathname}#${path}?portfolioId=${this.$route.query.portfolioId}`

            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '', mode: immersive ? 'immersive' : '', inapp: isTenantApp() })
            } else {
                this.$router.push({
                    path: path,
                    query: {
                        portfolioId: this.$route.query.portfolioId,
                    },
                })
            }
        },
        gotoOnlineService() {
            let link = customerService({
                url: true,
            })
            if (this.$jsBridge) {
                this.$jsBridge
                    .getUserinfo()
                    .then(data => {
                        const subAcctId = (((data?.clientInfo || {}).accts || [])[0] || {}).subAcctId || ''
                        const hlid = data?.clientInfo?.hlId || ''
                        link = customerService({
                            url: true,
                            userid: subAcctId,
                            hlid: hlid,
                        })
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
                    .catch(() => {
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
            } else {
                window.open(link)
            }
        },

        // /**
        //  * 获取投顾账户状态
        //  */
        // async getInvesetmentAccountStatus() {
        //     try {
        //         const status = await this.$root.getInvesetmentAccountStatus()
        //         this.isOpenInvestmentPortfolio = status
        //         console.log('getInvesetmentAccountStatus-res:', status)
        //     } catch (e) {
        //         console.error('getInvesetmentAccountStatus===>e:', e)
        //     }
        // },
        async requestInvestmentOpenStatus() {
            if (!this.obj.relatedPortfolioID || !this.$root.getAccountStatus(FINANCE_ACCOUNT)) return
            const getUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const cltId = getUserInfo?.clientInfo?.accts?.[0]?.cltId || ''
            const subAccountId = getQueryString('sub', true) || localStorage.getItem('sub')
            const subAcct2Type = 60 // 投顾专户
            const parmas = {
                cltId: cltId,
                subAcctId: subAccountId,
                subAcct2Type: subAcct2Type,
                productId: this.obj.relatedPortfolioID,
            }
            console.log('requestInvestmentOpenStatus, parms', parmas)
            try {
                const { result } = await getAccountStatus(parmas)
                if (result) {
                    const tgSubAcctStatus = result.clientInfo?.tgSubAcctStatus
                    this.isOpenInvestmentPortfolio = tgSubAcctStatus != 0 // 表示已开投顾子账户
                    const hadApplyInfo = !!result.applyInfo // 不为空表示上一次提交申请的信息。
                    // 开户异常
                    this.openInvestmentCancelOrDelete =
                        result.applyInfo?.status === investmentSubAccountStatus.TgApplyStatusCancel ||
                        result.applyInfo?.status === investmentSubAccountStatus.TgApplyStatusDelete
                    // 开户中的判断：没有开户 && 有提交信息 && 没有取消或删除
                    this.investmentAccountOpening = !this.isOpenInvestmentPortfolio && hadApplyInfo && !this.openInvestmentCancelOrDelete
                    console.log(
                        'requestInvestmentOpenStatus, investmentAccountOpening = ',
                        `${this.investmentAccountOpening}, isOpenInvestmentPortfolio = ${this.isOpenInvestmentPortfolio}, hadApplyInfo = ${hadApplyInfo}`
                    )
                }
            } catch (e) {
                console.error('requestInvestmentOpenStatus===>e:', e)
            }
        },
        async checkSuitabilityLevel() {
            try {
                if (!this.invesetmentPortfolioBasicInfo) return true
                const isMatch = await this.checkSuitability({ forceRefresh: this.forceRefresh })
                if (!isMatch) {
                    // 风险等级不匹配 弹框提示 + 跳转到风险不匹配页面
                    const message = ` <div>
                    <p>${this.$t('noMatchDes')}</p><br/>
                    <p>${this.$t('noMatchDes_')}</p>
                    </div>`
                    this.$dialog
                        .confirm({
                            title: this.$t('tzhsxpp'),
                            message,
                            showCancelButton: true,
                            allowHtml: true,
                            confirmButtonText: this.$t('learnReason'),
                            theme: 'round-button',
                            cancelButtonText: this.$t('cancelUpgrade'),
                            className: 'init-btn-dialog',
                            // getContainer: '.footer-content',
                        })
                        .then(() => {
                            const symbol = this.obj.relatedPortfolioID
                            const investFocusDegree = this.invesetmentPortfolioBasicInfo.investmentFocusDegree || 1
                            if (this.$jsBridge) {
                                const url = `${location.origin}/wealth/fund.html#/no-matched-risk?symbol=${symbol}&user=1&investFocusDegree=${investFocusDegree}&type=investmentPortfolio`
                                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                            } else {
                                this.$router.push(
                                    `/no-matched-risk?symbol=${symbol}&user=1&investFocusDegree=${investFocusDegree}&type=investmentPortfolio`
                                )
                            }
                        })
                    return false
                }
                return true
            } catch (e) {
                console.error(e)
            }
        },
        // 合适性匹配
        async checkSuitability() {
            await this.getUserRiskInfo({ forceRefresh: true })
            if (this.currentUserIsPi) {
                this.userRiskInfo.userIsPi = 1
            } else {
                this.userRiskInfo.userIsPi = 0
            }
            const { match, list = [] } = this.match(this.userRiskInfo, this.invesetmentPortfolioBasicInfo)
            return match
        },
        async getUserRiskInfo({ subAcctId = this.$store.getters['user/getSubAccountId'], forceRefresh = false } = {}) {
            try {
                if (!forceRefresh) {
                    let info = null
                    if ((info = this.userRiskInfo)) return info
                }
                const ops = { params: { subAcctId } }
                const { result } = await UserRiskInfo(ops)
                this.userRiskInfo = result
                return this.userRiskInfo
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * @description 合适性匹配函数
         * @param { Object } user 用户信息
         * @param { Object }  info 投顾信息
         * @returns { Object } res => { match, list }
         */
        match: (user = {}, info = {}) => {
            console.log('match', `user = ${JSON.stringify(user)}, info = ${JSON.stringify(info)}`)
            const matchDerivative = user?.openDerivative === 1 || info.isDerivativeProduct === 2 // 衍生品权限对比
            const matchRisk = user?.riskLevel >= info.riskOverall // 风测等级
            const matchInvestObjective = user?.investmentObjective >= info.investmentObjective // 投资目标
            const matchInvestmentExperience = user?.investmentExperience >= info.investmentYear // 投资经验
            const matchIsPi = user?.userIsPi === 1 || info.isPI === 2
            const list = [matchDerivative, matchRisk, matchInvestObjective, matchInvestmentExperience, matchIsPi]
            console.log('match result', list)
            return { match: list.every(i => i), list: list }
        },
    },
}
</script>

<style lang="less" scoped>
.button-main {
    position: relative;
    height: 50px;
    padding: 0 12px;

    .tip {
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        padding: 8px 0;
        color: #9d252a;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
        background: #ffe5e7;
        transform: translateY(-100%);
    }

    .trade_button_container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 180px;
        height: 36px;

        .portfolio {
            background: linear-gradient(to right, #ff8d07 0%, #ff6907 50%, #ff6907 100%);
            background-size: 100% 100%;
            border-top-left-radius: 18px;
            border-bottom-left-radius: 18px;
        }

        .investment {
            background: linear-gradient(to right, #ffa724 0%, #ffba07 100%);
            background-size: 100% 100%;
            border-top-right-radius: 18px;
            border-bottom-right-radius: 18px;
        }

        .half_btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 90px;
            height: 36px;
            color: #fff;
            font-weight: 500;
            font-size: 15px;
            line-height: 22px;
            text-align: center;
        }
    }

    .trade_button {
        width: 180px;
        margin-right: 22px;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
        background: #ff6907;
        border: none;
        border-radius: 18px;
        outline: none;
    }

    .short_button {
        width: 124px;
        margin-right: 7px;
    }

    .share-main-container {
        display: flex;
        flex: 1;
        justify-content: space-evenly;

        .share-main {
            display: flex;
            flex: 1;
            flex-direction: column;
            align-items: center;

            .tool_icon {
                width: 24px;
                height: 24px;
            }
        }
    }
}

.filter-main {
    display: flex;
    flex-direction: column;
    place-items: center center;
    color: #2f2f2f;
    font-size: 15px;
    line-height: 50px;
    text-align: center;

    .item {
        width: 100%;
    }
}

.filter_main_more {
    display: flex;
    flex: 4;
    align-items: center;
    height: 121px;
    color: #2f2f2f;
    font-size: 14px;
    line-height: 20px;
    text-align: center;

    .item_more {
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;

        .tool_icon {
            width: 24px;
            height: 24px;
            margin-bottom: 8px;
        }
    }
}
</style>

<style lang="less" scoped>
/deep/.van-action-sheet__cancel {
    color: #2f2f2f;
    font-size: 15px;
}

.my-action-sheet /deep/.van-action-sheet__gap {
    height: 1px;
}
</style>
<style lang="less">
.init-btn-dialog {
    .van-dialog__footer {
        display: flex;
        flex-direction: column-reverse !important;

        .van-dialog__confirm {
            height: 44px;
            color: #fff;
            background: #ff6907;
            border-radius: 22px;

            .van-button__text {
                font-weight: 500;
                font-size: 16px;
            }
        }

        .van-dialog__cancel {
            margin-top: 12px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            background: #fff;
        }

        .van-dialog__cancel::before {
            background-color: transparent !important;
        }
    }

    .van-dialog__message {
        white-space: normal;

        .cusspan {
            color: #ff6907;
        }
    }

    button {
        width: 100%;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
        background: #ff6907;
        border-radius: 18px;
    }
}
</style>
