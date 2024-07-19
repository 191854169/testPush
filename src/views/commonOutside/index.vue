<template>
    <div class="ry-index" ref="stickyContainer" :key="$route.path" :class="{ clip: tradeLoginDialog && tradeLoginDialog.show }">
        <div class="content-wrapper">
            <Account @onChange="changeActive" @getAssetSummarySuccess="initTradePwd" v-if="active === 'account'"></Account>
            <Wealth v-if="active === 'wealth'"></Wealth>
            <Mine v-if="active === 'mine'"></Mine>
        </div>

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
        }
    },
    computed: {
        ...mapState('user', ['accts', 'userInfo']),
        ...mapGetters({ getSubAccountId: 'user/getSubAccountId' }),
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
            this.isUnsetTradePwd = this.userInfo?.clientInfo?.pwdStatus === TRADE_PWD_STATUS.PWD_UNSET
            if (this.isUnsetTradePwd) {
                this.goSetPasswordPage()
            }
        },

        initTradePwd() {
            // 若无用户信息则延迟3秒处理
            if (!this.userInfo) {
                setTimeout(() => {
                    this.initTradePwd()
                }, 3000)
                return
            }

            if (!this.isUnsetTradePwd) {
                this.validateIsFirstTime()
            }
        },
        pageShow() {
            this.propertyData = getPageVisibleSupportProperty()
            // 买入，卖出，开通星财宝返回时，刷新页面
            document.addEventListener(this.propertyData.visibilityChange, this.handlePageShow, false)
        },

        handlePageShow() {
            !document[this.propertyData.hidden] && this.init()
        },
        // 校验是否第一次进来的
        validateIsFirstTime() {
            const firstTimeFlag = sessionStorage.getItem('firstTimeFlag')
            // 修改交易密码后，需重新校验密码 showTradeLoginDialog 1-是 0-否
            const showTradeLoginDialog = sessionStorage.getItem('showTradeLoginDialog')
            if (!firstTimeFlag || showTradeLoginDialog === '1') {
                this.tradeLoginDialog =
                    this.tradeLoginDialog ||
                    new TradeLogin({ propsData: { subAcctId: this.accts.subAcctId, showCloseIcon: false, callBack: this.handleTradeConfirm } })
                this.tradeLoginDialog.show = true
                // 在资产页未输入交易密码时页面所有资产数据应该隐藏
                this.$store.commit('user/updateShowAsset', false)
            }
        },
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
