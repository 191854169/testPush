<!-- 关停组合 dialog -->
<template>
    <div class="portfolio_close_dialog">
        <van-dialog
            v-model="visible"
            :title="$t('closePortfolio.confirmClose')"
            width="280"
            show-cancel-button
            show-confirm-button
            :cancel-button-text="$t('cancel')"
            :confirm-button-text="$t('confirm')"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6907"
            :before-close="onBeforeClose"
            @confirm="onConfirm"
            @open="onOpen"
        >
            <div class="body">
                <div class="describe">
                    <div v-html="$t('closePortfolio.closeDescribe')"></div>
                </div>
                <textLimitedBox
                    v-if="createrIsPI"
                    class="text_input"
                    v-model="closeReason"
                    :maxTextLength="50"
                    :boxHeight="116"
                    :placeholder="$t('closePortfolio.inputCloseReason')"
                    @input="onInput"
                ></textLimitedBox>
                <div v-if="!!error_msg" class="error_msg">{{ error_msg }}</div>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import { Dialog } from 'vant'
import { portfolioClose } from '@/apis/followInvest/index.js'
import { isEmpty } from '@/utils'
import textLimitedBox from './textLimitedBox'
import { CUSTOMER_TYPE } from '../../config/common'

export default {
    name: 'portfolio_close_dialog',
    components: {
        [Dialog.name]: Dialog,
        textLimitedBox,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        obj: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    computed: {
        visible: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        // 当前组合创建者是持牌用户
        createrIsPI() {
            return this.obj?.creator?.type === CUSTOMER_TYPE.professional
        },
    },
    data() {
        return {
            closeReason: '',
            error_msg: '',
            closeable: true,
            isOverLimits: false,
        }
    },
    methods: {
        isEmpty,
        onBeforeClose(action, done) {
            if (action == 'confirm' && this.createrIsPI && !this.closeable) {
                done(false)
                return
            }
            done()
        },
        onOpen() {
            this.closeReason = ''
            this.error_msg = ''
            this.isOverLimits = false
        },
        async onConfirm() {
            this.closeable = false
            if (this.createrIsPI && this.closeReason === '') {
                this.$toast(this.$t('closePortfolio.reasonEmptyError'))
                return
            }
            if (this.createrIsPI && this.isOverLimits) {
                return
            }

            const param = {
                portfolioId: parseInt(this.$route.query.portfolioId),
                closeReason: this.closeReason,
            }
            this.$loading.show = true
            portfolioClose(param)
                .then(data => {
                    const code = data.result?.code
                    console.info('yinlong portfolioClose', data.result)
                    if (isEmpty(data.result)) {
                        this.$toast(this.$t('closePortfolio.closeSuccess'))
                        this.closeable = true
                        this.visible = false
                        this.$emit('request')
                    } else if (code == 281403) {
                        this.error_msg = this.$t('closePortfolio.reason_certain')
                    } else {
                        this.$toast(this.$t('closePortfolio.closeError'))
                    }
                })
                .catch(e => {
                    this.$toast(this.$t('closePortfolio.closeError'))
                    console.error('yinlong', e)
                })
                .finally(() => {
                    this.$loading.show = false
                })
        },
        onInput(text, isOver) {
            this.isOverLimits = isOver
            if (isOver) {
                this.error_msg = this.$t('follow.overLimitsError', { count: '50' })
            } else {
                this.error_msg = ''
            }
        },
    },
}
</script>

<style scoped lang="less">
.body {
    padding-bottom: 28px;

    .describe {
        padding: 0 16px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;
        white-space: pre-wrap;
    }

    .text_input {
        margin: 10px 12px 0;
    }

    .error_msg {
        margin-top: 4px;
        padding: 0 16px;
        color: #f31414;
        font-size: 12px;
        line-height: 14px;
    }
}
</style>
