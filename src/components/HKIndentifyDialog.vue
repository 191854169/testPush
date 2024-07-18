<template>
    <van-dialog
        width="2.8rem"
        v-model="show"
        :title="type === 1 ? i18n('identifyTitle') : i18n('sweetTip')"
        :show-confirm-button="false"
        closeOnClickOverlay
    >
        <div class="hk-indentify-content">
            <span>{{ type === 1 ? i18n('identifyText1') : i18n('identifyText2') }}</span>
            <span v-if="type === 1">{{ i18n('questText') }}</span>
            <span v-if="type === 1" class="contact-customer" @click="contactCustomerService">{{ i18n('concatUs') }}</span>
        </div>
        <div class="van-hairline--top van-dialog__footer">
            <van-button v-if="type !== 1" size="large" class="van-dialog__cancel" @click="show = false">{{ i18n('cancel') }}</van-button>
            <van-button size="large" class="van-dialog__confirm van-hairline--left" @click="handleConfirm">
                {{ type === 1 ? i18n('toSign') : i18n('toView') }}
            </van-button>
        </div>
    </van-dialog>
</template>

<script>
import { customerService } from '@/utils/utils.js'
import { lupuJsbridge as JSBridge } from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
import { i18n } from '@/i18n/common'
export default {
    name: 'HkIndentifyDialog',
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        type: {
            // 1:未签署，2:已签署未拿到BCAN码，0：已签署已拿到BCAN码
            type: Number,
            default: 1,
        },
        testValue: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            show: false,
        }
    },
    watch: {
        value: {
            handler(v) {
                this.show = v
            },
            immediate: true,
        },
        show(v) {
            v !== this.value && this.$emit('input', v)
        },
    },
    methods: {
        i18n: text => i18n.t(text),
        // 立即签署/查看详情
        handleConfirm() {
            this.show = false
            if (this.type == 1) {
                // 立即签署
                this.toPage(`/pages/identifierGuide.html?t=${new Date().getTime()}`)
            }
            if (this.type == 2) {
                // 查看详情
                this.toPage(`/pages/identifierGuide.html?t=${new Date().getTime()}#/result`)
            }
        },
        // 联系客服
        contactCustomerService() {
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
                        console.log(link) // test
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
                    .catch(() => {
                        console.log(link) // test
                        this.$jsBridge.open({ url: encodeURIComponent(link), title: '' })
                    })
            } else {
                window.open(link)
            }
        },
        // 跳转对应页面
        toPage(pageSrc, title = '') {
            if (JSBridge) {
                JSBridge.open({
                    url: encodeURIComponent(`${location.origin}${pageSrc}`),
                    title: title,
                })
            } else {
                window.location.href = `${location.origin}${pageSrc}`
            }
        },
    },
}
</script>

<style scoped lang="less">
.hk-indentify-content {
    padding: 0 16px 28px;
    color: #1f1f1f;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    text-align: justify;

    .contact-customer {
        color: #ff6907;
    }
}

.van-button {
    font-weight: bold;
}
</style>
