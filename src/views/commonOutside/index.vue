<template>
    <div class="ry-index" ref="stickyContainer" :key="$route.path" :class="{ clip: tradeLoginDialog && tradeLoginDialog.show }">
        <!-- pi年审提示 -->
        <p class="risk-tool-tip" id="pi-tool-tip" v-if="showPITooltip">
            <span>{{ cptPITooltipText }}</span>
            <span class="go-risk" @click="jumpToPI">{{ cptPTupdateText }}</span>
        </p>
        <div class="content-wrapper">
            <Account @onChange="changeActive" v-if="active === 'account'"></Account>
            <Wealth v-if="active === 'wealth'"></Wealth>
            <Mine v-if="active === 'mine'"></Mine>
        </div>
        <van-dialog
            width="280px"
            class="pi-dialog"
            v-model="showPIDialog"
            :title="$t('sweetTip')"
            confirm-button-color="#2f2f2f"
            :confirm-button-text="$t('cancel')"
            @confirm="cancelPI"
        >
            <div class="pi-dialog-content">
                <p class="content-msg">{{ cptPIDialogText }}</p>
                <button class="pi-btn" block round @click="jumpToPI">{{ $t('PIuploadText') }}</button>
            </div>
        </van-dialog>

        <!-- 退出登录 -->
        <Logout :show="showLogout" @cancel="showLogout = false" />
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { Sticky, Dialog } from 'vant'
import { TRADE_PWD_STATUS, FUND_ACCOUNT_STATUS } from '@/utils/user'
import TradeLogin from '@/config/globalProterties/tradeLogin'
import { getPageVisibleSupportProperty, customerService } from '@/utils/utils'
import { getLangType } from '@/utils/tools'
// import { FROM_RUI_YIN_STR, isInRyH5 } from '@/utils'
import Account from './account/index.vue'
import Wealth from './wealth/index.vue'
import Mine from './mine/index.vue'
import { ACTIVE_TAB_STR } from './config/common'
import Logout from './mine/logout'
import pathnames from '@/config/H5Pathname.js'
import { getPiApplyDetail } from '@/apis/client.js'
import { FINANCE_ACCOUNT } from '@/entries/commonOutside'

export default {
    name: 'CommonOutsideIndex',
    // mixins: [riskAssessmentMixin, HKindentify],
    components: {
        [Sticky.name]: Sticky,
        Account,
        Wealth,
        Mine,
        Logout,
    },
    data() {
        return {
            tradeLoginDialog: null,
            isUnsetTradePwd: true, // 未设置交易密码
            propertyData: {},
            active: '',
            showLogout: false, // 显示与隐藏退出登录弹窗
            PIkey: 'showPIDialog',
            showPIDialog: false, //pi年审弹框控制
            showPITooltip: false, //pi小黄条显示
            clientType: '',
            auditType: 1, //审核类型
            showPistatus: [100, 110, 500], //小黄条显示的状态  // 100待提交、550待PI年审 110驳回待提交、500已驳回
            // Riskcounter: 0, //初始化次数
            Personcounter: 0,
        }
    },
    computed: {
        ...mapState('user', ['accts', 'userInfo']),
        ...mapGetters({ getSubAccountId: 'user/getSubAccountId' }),
        // 是否显示新手引导
        showNoobGuide() {
            return this.showCashBoxNoobGuide || this.showFollowNoobGuide
        },
        // 是否个人账户/公司户
        cptIsneedPI() {
            const PERSONCOR_FLAG = [1, 4] // 个人账户/公司户
            return PERSONCOR_FLAG.includes(this.clientType)
        },
        cptIsStatus() {
            return this.status == 550
        },
        // 是否需要pi年审
        cptIsPIexpire() {
            return this.cptIsneedPI && (this.cptIsStatus || (this.auditType == 2 && this.showPistatus.includes(this.status)))
        },
        //是否在6/12月份
        cptIsInmonth() {
            return [6, 12].includes(new Date().getMonth() + 1)
        },
        // pi截至日期
        cptDateText() {
            const month = new Date().getMonth() + 1
            const strs = ['6月27日 12:00', '12月27日 12:00']
            return this.cptIsInmonth ? ([3].includes(month) ? strs[0] : strs[1]) : '--'
        },
        // pi年审小黄条信息
        cptPITooltipText() {
            let text = ''
            if (this.cptIsneedPI) {
                if ([100, 550].includes(this.status)) {
                    if (this.clientType === 1) text = 'PITooltipPersonText'
                    else text = 'PITooltipComText'
                } else if ([110, 500].includes(this.status)) {
                    if (this.clientType === 1) text = 'PIReTooltipPersonText'
                    else text = 'PIReTooltipComText'
                } else {
                    text = ''
                }
            }
            return this.$t(text, { date: this.cptDateText })
        },
        cptPTupdateText() {
            return [110, 500].includes(this.status) ? this.$t('PIupdateText') : this.$t('PIuploadText')
        },
        // pi年审弹框信息
        cptPIDialogText() {
            const key = this.cptIsneedPI ? (this.clientType === 1 ? 'PIDialogPersonText' : 'PIDialogComText') : ''
            return this.$t(key, { date: this.cptDateText })
        },
    },
    watch: {
        userInfo: {
            handler(val) {
                if (val) {
                    this.init()
                }
            },
            immediate: true,
        },
    },
    mounted() {
        this.active = this.$route.path.replace(/\//, '')
        this.setTitle()
        this.pageShow()

        // 监听浏览器回退
        // this.handleListener()
    },
    beforeDestroy() {
        // 移除浏览器回退监听
        window.removeEventListener('popstate', this.goBack, false)
        document.removeEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
    },
    methods: {
        async init() {
            // this.isUnsetTradePwd = this.userInfo?.clientInfo?.pwdStatus === TRADE_PWD_STATUS.PWD_UNSET
            // if (this.isUnsetTradePwd) {
            //     this.goSetPasswordPage()
            // }
            this.getPersonType()
            // this.getPersonType.watch()
        },

        // initTradePwd() {
        //     // 若无用户信息则延迟3秒处理
        //     if (!this.userInfo) {
        //         setTimeout(() => {
        //             this.initTradePwd()
        //         }, 3000)
        //         return
        //     }

        //     if (!this.isUnsetTradePwd) {
        //         this.validateIsFirstTime()
        //     }
        // },
        pageShow() {
            this.propertyData = getPageVisibleSupportProperty()
            // 买入，卖出，开通星财宝返回时，刷新页面
            document.addEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
        },

        handlePageShow() {
            !document[this.propertyData.hidden] && this.init()
        },
        // 校验是否第一次进来的
        // validateIsFirstTime() {
        //     const firstTimeFlag = sessionStorage.getItem('firstTimeFlag')
        //     // 修改交易密码后，需重新校验密码 showTradeLoginDialog 1-是 0-否
        //     const showTradeLoginDialog = sessionStorage.getItem('showTradeLoginDialog')
        //     if (!firstTimeFlag || showTradeLoginDialog === '1') {
        //         this.tradeLoginDialog =
        //             this.tradeLoginDialog ||
        //             new TradeLogin({ propsData: { subAcctId: this.accts.subAcctId, showCloseIcon: false, callBack: this.handleTradeConfirm } })
        //         this.tradeLoginDialog.show = true
        //         // 在资产页未输入交易密码时页面所有资产数据应该隐藏
        //         this.$store.commit('user/updateShowAsset', false)
        //     }
        // },
        // 去设置交易密码页
        goSetPasswordPage() {
            Dialog.confirm({
                title: this.$t('setPasswordBtn'),
                message: this.$t('setPasswordDialogMessage', { subAcctId: ` <span class="c-theme">${this.accts.subAcctId}</span> ` }),
                width: '75%',
                className: 'custom-dialog',
                overlayClass: 'custom-overlay',
                showCancelButton: false,
                confirmButtonText: this.$t('goSet'),
            })
                .then(() => {
                    const path = encodeURIComponent(location.href)
                    // 去设置交易密码页
                    window.location.href = `${location.origin}/pages/initTradePassword.html#/?reset=0&langType=${getLangType()}&path=${path}`
                })
                .catch(() => {})
        },
        // 输入交易密码后回调
        handleTradeConfirm() {
            sessionStorage.setItem('firstTimeFlag', 1)
            // 输入交易密码后回调，不需重新校验密码 showTradeLoginDialog 1-是 0-否
            sessionStorage.setItem('showTradeLoginDialog', '0')
            // 出现输入密码框，页面滚动条距离顶部应该是0
            window.scrollTo(0, 0)
            // 交易密码验证成功之后再显示资产信息
            this.$store.commit('user/updateShowAsset', true)
        },
        changeTab(item) {
            this.active = item.key
            sessionStorage.setItem(ACTIVE_TAB_STR, item.key)
            this.setTitle()
        },
        toCustomerServicePage() {
            const url = customerService({
                url: true,
                userid: this.getSubAccountId,
            })
            window.open(url)
        },
        // 接收资产去看看按钮传递的参数
        changeActive(val) {
            this.active = val
        },
        // 设置标题
        setTitle() {
            window.document.title = this.active === '1' ? '复星财富' : this.$t('title')
        },
        // 浏览器回退监听
        handleListener() {
            window.addEventListener('popstate', this.goBack, false)
        },
        // 回退时执行
        goBack() {
            // 阻止回退
            window.history.replaceState(null, null, document.URL)
            // 回退时显示退出登录弹窗
            this.showLogout = true
        },
        getPersonType() {
            try {
                if (this.$root.isLogin && this.$root.getAccountStatus(FINANCE_ACCOUNT) && !this.showNoobGuide) {
                    // 3月9月年审
                    // if (!this.cptIsInmonth) {
                    //     this.initRiskTooltip()
                    //     this.initRiskTooltip.watch()
                    //     return
                    // }
                    // 判断用户是否是个人账户 1个人户/2Esop/3联名户/4公司户/5机构户
                    const subAcctId = this.$store.getters['user/getSubAccountId']
                    const params = { data: { subAcctId: subAcctId || undefined } }
                    getPiApplyDetail(params)
                        .then(data => {
                            const { status, clientType, auditType } = data?.result
                            this.status = status || ''
                            this.clientType = clientType || ''
                            this.auditType = auditType
                            // 弹框提示
                            const showPIDialog = localStorage.getItem(this.PIkey)
                            if (this.cptIsPIexpire) {
                                if (!showPIDialog) {
                                    this.showPIDialog = true
                                } else {
                                    this.showPITooltip = true
                                }
                            } else {
                                // this.initRiskTooltip()
                                // this.initRiskTooltip.watch()
                            }
                        })
                        .catch(() => {})
                }
            } finally {
                // 页面显示的时候同步用户信息在获取PI状态
                this.getPersonType.watch = () => {
                    if (!this.Personcounter) {
                        this.$jsBridge &&
                            this.$jsBridge.watchPageVisible(() => {
                                this.$store.dispatch('user/getUserInfo', false).then(() => {
                                    this.getPersonType()
                                })
                            })
                        this.Personcounter++
                    }
                }
            }
        },
        cancelPI() {
            localStorage.setItem(this.PIkey, true)
            this.showPIDialog = false
            this.showPITooltip = true
        },
        //跳转pi年审
        jumpToPI() {
            localStorage.setItem(this.PIkey, true)
            this.showPIDialog = false
            this.showPITooltip = false
            const url = `${pathnames.VUE_APP_PI_APPLY}index?auditType=2`
            this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(url), title: '' }) : (location.href = this.$addCurParamsForUrl(url))
        },
    },
}
</script>

<style scoped lang="less">
.ry-index {
    position: relative;
    // height: 100vh;
    // overflow: hidden;
    // overflow-y: scroll;
    background: @bgGreyColor;

    .risk-tool-tip {
        position: relative;
        // margin-top: -12px;
        margin-bottom: 12px;
        padding: 8px 12px;
        color: @theme;
        font-size: 12px;
        line-height: 18px;
        background-color: @tabBackground;

        &::before,
        &::after {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 12px;
            content: '';
            #warn_bg();
        }

        &::before {
            left: -12px;
        }

        &::after {
            right: -12px;
        }

        .go-risk {
            margin-left: 8px;
            color: #ee884a;
            background: none;
            border: none;
            outline: none;
        }
    }

    .nav-wrapper {
        position: absolute;
        // fill: linear-gradient(182deg, #FFF0E6 1.66%, rgba(255, 237, 225, 0.00) 65.39%);
        top: 0;
        left: 0;
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 44px;
        padding: 9px 12px;
        color: #666;
        font-size: 18px;
        background: #f6f6f6;

        .nav-left {
            display: flex;
            align-items: center;

            .tabs-item {
                margin-right: 28px;
            }

            .is-active {
                color: #2f2f2f;
                font-weight: 600;
            }
        }

        .nav-right {
            img {
                width: 24px;
                height: 24px;
            }
        }
    }

    .zhanwei-container {
        width: 100%;
        height: 44px;
    }

    .content-wrapper {
        height: calc(100% - 52px);
        padding-top: 8px;
    }

    .tab-main {
        height: 36px;
        color: #666;
        font-size: 15px;

        .active {
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
        }
    }

    .account-info {
        position: relative;
        padding: 16px 12px 12px;

        .bg-account {
            position: absolute;
            top: 0;
            right: 0;
            width: 98px;
            height: 98px;
        }
    }

    .link-main {
        .item {
            display: inline-block;
            vertical-align: middle;
        }

        .divider {
            width: 0;
            height: 12px;
            margin: 0 16px;
            border-right: 0.5px solid #e0dfdf;
        }
    }

    .features {
        display: flex;
        flex-wrap: nowrap;
        width: 100%;
        padding-top: 16px;
        padding-bottom: 26px;
        overflow: auto;
        background: #fff;
        border-radius: 8px;

        &-item {
            display: flex;
            flex: 0 0 auto;
            flex-direction: column;
            align-items: center;
            width: calc(100% / 4);

            .img-box {
                width: 24px;
                height: 24px;
                overflow: hidden;
            }

            span {
                margin-top: 8px;
                color: @fontBlackColor;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }
}

.list {
    width: 94px;
    overflow: hidden;
    border-radius: 4px;

    .item {
        font-size: 14px;
        line-height: 36px;
        text-align: center;
        #font_h1();
        #dialog_background();
        #box_shadow_2();

        &.selected {
            color: #ff6307;
        }
    }
}

.risk-dialog__content {
    padding: 0 16px 28px;
    color: #2f2f2f;
    font-size: 14px;
    line-height: 20px;
}

.auto-tips {
    margin: 14px auto 4px;
    padding-left: 8px;
    color: #666;
    line-height: 38px;
    background: #f9f9f9;
    border-radius: 4px;
}

.sticky-container {
    /deep/ .van-sticky--fixed {
        z-index: 1000;
        // prettier-ignore
        max-width: 750PX;
        margin: 0 auto;
        background: #f6f6f6;
    }
}
</style>
/* PI年审 */
<style lang="less" scoped>
.pi-dialog {
    /deep/ .van-dialog__header {
        font-weight: 500;
    }

    /deep/ .van-button__content {
        font-weight: 400;
        font-size: 14px;
    }

    .pi-dialog-content {
        padding: 0 16px;
        font-size: 14px;

        .content-msg {
            line-height: 22px;
        }

        .pi-btn {
            width: 100%;
            margin-top: 28px;
            padding: 0 15px;
            font-weight: 500;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            border: none;
            border-radius: 35px;
            outline: none;
            #bg_theme();
            #button_font();
        }
    }

    /deep/ .van-hairline--top::after {
        border: none;
    }
}
</style>
