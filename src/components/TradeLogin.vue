<template>
    <!-- 输入交易密码弹窗 -->
    <div v-show="show" class="trade-login-wrapper" :style="{ 'z-index': zIndex }">
        <div class="bg-shadow"></div>
        <div class="trade-login-main" ref="tradeLoginMainRef">
            <div class="pos-r header">
                <img v-show="showCloseIcon" src="@/assets/images/common/closePopup.png" class="icon-close" @click="handleClose" />
                <!-- <multi-img v-show="showCloseIcon" name="icon-cancel" directory="common" class="icon-close" @click="handleClose"></multi-img> -->
                <span class="">{{ i18n('tradeDialog.passwordVerification') }}</span>
            </div>

            <div class="pad-l16 pad-r16">
                <div class="f14 h2-white lh-22 mar-t12">
                    <div>
                        {{ i18n('tradeDialog.accountNumber') }}：
                        <span class="c-theme">{{ showSubAcctId }}</span>
                    </div>
                    <div>{{ i18n('tradeDialog.passwordVerificationTips') }}</div>
                </div>
                <van-field
                    class="input-field"
                    v-model="password"
                    type="password"
                    clearable
                    :placeholder="i18n('tradeDialog.tip')"
                    autofocus
                    ref="inputField"
                    @focus="handleFocus"
                    @blur="handleBlur"
                    @click="handleFocus"
                />
                <!-- <div class="mar-t16 c-gray f14">
                    {{ i18n('tradeDialog.customerServiceTips') }}：
                    <a class="c-blue" href="tel:852 2979 6988">+852 2979 6988</a>
                </div> -->
                <div class="footer-btn">
                    <van-button block :disabled="!this.password" class="btn" @click="confirm">{{ i18n('tradeDialog.sure') }}</van-button>
                </div>
                <div class="mar-t20 align-c c-theme f16" @click="reset">{{ i18n('tradeDialog.forgotPassword') }}</div>
            </div>
        </div>
        <van-dialog width="2.8rem" v-model="shownotice" :title="i18n('prompt')" confirm-button-text="已了解" closeOnClickOverlay>
            <div class="pad-rl16 f14 pad-b28">
                <p class="lh-24">{{ i18n('tradeDialog.noticeText') }}</p>
                <div class="mar-t12">
                    {{ i18n('mainlandService') }}：
                    <a class="c-link" href="tel:400 812 0922">400 812 0922</a>
                </div>
                <div class="mar-t12">
                    {{ i18n('hkService') }}：
                    <a class="c-link" href="tel:+852 2979 6988">+852 2979 6988</a>
                </div>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import { TradeLogin } from '@/apis/uc'
import { loginEncrypt } from '@/utils/crypto'
import { Toast, Dialog } from 'vant'
import { isAndroid, getLangType } from '@/utils/tools'
import { i18n } from '@/i18n/common'
import { ERROR_CODE_MAP } from '@/httpRequest/constants'

export default {
    data() {
        return {
            show: false,
            password: '',
            isLoading: false,
            shownotice: false,
        }
    },
    props: {
        value: {
            type: Boolean,
            default: () => false,
        },
        subAcctId: {
            type: String,
        },
        showCloseIcon: {
            type: Boolean,
            default: true,
        },
        callBack: {
            type: Function,
            default: null,
        },
        zIndex: {
            type: Number,
            default: 2000,
        },
    },
    computed: {
        showSubAcctId() {
            return this.maskSubAccountId(this.subAcctId)
        },
    },
    watch: {
        value: {
            handler(val) {
                this.show = val
            },
            immediate: true,
        },
        show(val) {
            this.$emit('input', val)
            if (val) {
                this.autoFocus()
            } else {
                this.password = ''
                this.$emit('input', val)
            }
        },
    },
    methods: {
        i18n: text => i18n.t(text),
        handleFocus() {
            if (!isAndroid()) {
                // fix  ios下，点击灰色背景处，再聚焦，键盘遮挡弹窗问题
                const scrollEl = document.getElementsByTagName('body')[0]
                const windowHeight = window.innerHeight
                const keyboardHeight = window.screen.height - windowHeight
                const domHeight = this.$refs.tradeLoginMainRef.clientHeight
                console.log('键盘高度：' + keyboardHeight, scrollEl.scrollHeight)
                console.log('window.screen.height：', window.screen.height)
                console.log('windowHeight：', windowHeight)
                console.log('domHeight：', domHeight)
                window.setTimeout(() => {
                    // window.scrollTo(0, scrollEl.scrollHeight)
                    const scrollHeight = window.screen.height - keyboardHeight - domHeight
                    window.scrollTo(0, scrollHeight)
                }, 100)
                document.body.addEventListener('touchmove', this.stopScroll, { passive: false })
            }
        },
        handleBlur() {
            window.setTimeout(() => {
                window.scrollTo(0, 0)
            }, 100)
            document.body.removeEventListener('touchmove', this.stopScroll, { passive: false })
        },
        stopScroll(e) {
            e.preventDefault() //阻止默认的处理方式(阻止下拉滑动的效果)
        },
        autoFocus() {
            this.$nextTick(() => {
                this.$refs.inputField?.focus()
            })
        },
        handleClose() {
            this.show = false
            this.$emit('cancel')
        },
        reset() {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const { cltType, suspendStatus } = userInfo?.clientInfo.accts?.[0] ?? {}
            if (suspendStatus === 1) return Toast(this.i18n('tradeDialog.freezeText'))
            const url = `${location.origin}/pages/initTradePassword.html#/Auth?needreset=1&langType=${getLangType()}`
            //仅支持个人户、联名户重置交易密码
            if ([4, 5].includes(cltType)) {
                this.shownotice = true
            } else {
                window.location.href = url
            }
        },
        async confirm() {
            if (this.isLoading) return
            this.isLoading = true
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            const { salt, crId, accts = [] } = userInfo?.clientInfo || { salt: '', crId: '' }
            const { A1, rndkey } = loginEncrypt(crId, this.password, salt)
            const data = {
                uin: userInfo.uin,
                cltId: accts && accts.length > 0 ? accts[0].cltId : null,
                type: 10,
                ticket: A1,
            }
            try {
                const res = await TradeLogin(data)
                this.isLoading = false
                this.show = false
                // 涉及输入交易密码需要用session2跟rndKey2
                localStorage.setItem('session2', res.result.session2)
                localStorage.setItem('rndKey2', rndkey)
                this.$emit('ok')
                this.callBack && this.callBack()
            } catch ({ error }) {
                this.isLoading = false

                // 睿银项目 201004 100008 100031 100033 100034 错误 公共请求已处理
                if (
                    [
                        ERROR_CODE_MAP.ERR_SESSION_REJECTED,
                        ERROR_CODE_MAP.ERROR_SESSION,
                        ERROR_CODE_MAP.IASIA_UNVALID_SESSION,
                        ERROR_CODE_MAP.ERROR_SESSION_EXPIRE,
                        ERROR_CODE_MAP.ERROR_UIN,
                    ].includes(error.code)
                ) {
                    return
                }
                // 错误密码提示
                Dialog.confirm({
                    title: '',
                    message: this.i18n('tradeDialog.wrongPasswordTips'),
                    messageAlign: 'center',
                    showCancelButton: false,
                    width: '75%',
                    className: 'custom-dialog',
                    overlayClass: 'custom-overlay',
                    confirmButtonText: this.i18n('retry'),
                })
                    .then(() => {})
                    .catch(() => {})
            }
        },
        maskSubAccountId(id) {
            const prefix = id.substring(0, 2)
            const suffix = id.substr(id.length - 4)
            return prefix + '***' + suffix
        },
    },
}
</script>

<style lang="less" scoped>
.bg-shadow {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2000;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.3);
}

.trade-login-wrapper {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 2000;
    width: 100%;
    overflow: hidden;
}

.trade-login-main {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2000;
    height: 3.2rem;
    background: #fff;
    border-radius: 12px 12px 0 0;

    .header {
        color: #2f2f2f;
        font-weight: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
    }
}

.input-field {
    width: 100%;
    margin-top: 20px;
    padding: 0 12px;
    line-height: 56px;
    background: #f8f8f8;
    border-radius: 6px;

    /deep/.van-field__control {
        font-weight: normal;
        font-size: 16px;
    }

    &::after {
        border-bottom: 0;
    }
}

.c-blue {
    color: #043799;
}

.footer-btn {
    padding-top: 18px;

    .btn {
        width: 100%;
        height: 44px;
        margin: 0 auto;
        background: @theme;
        border: 0;
        border-radius: 41px;
    }

    .van-button__text {
        color: #fff;
        font-weight: bold;
        font-size: 16px;
    }

    .van-button--disabled {
        opacity: 0.3;
    }
}

.icon-close {
    position: absolute;
    top: 10px;
    left: 16px;
    width: 24px;
    height: 24px;
}
</style>
