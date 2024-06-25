<!-- 组合点评详情页 -->

<template>
    <div class="container">
        <div class="input_container">
            <div class="flex-c">
                <h5 class="f16 bold mar-r8">{{ obj.portfolioName }}</h5>
                <portfolio-tag :portfolioType="obj.portfolioType"></portfolio-tag>
            </div>
            <textLimitedBox
                class="text_input"
                v-model="comment"
                :boxHeight="212"
                :placeholder="$t('follow.createCommentplaceholder')"
                @input="onInput"
            ></textLimitedBox>
            <div v-if="!!error_msg" class="error_msg">{{ error_msg }}</div>
        </div>
        <div class="flex-middle full-width">
            <button class="create_button" :class="{ disable_button: comment === '' || isOverLimits }" @click="handleCreate()">
                {{ $t('follow.confirmCreate') }}
            </button>
        </div>
    </div>
</template>

<script>
import { createPortfolioComment } from '@/apis/followInvest/index.js'
import basicInfoMixin from './mixins/basicInfoMixin'
import textLimitedBox from './components/textLimitedBox'
import portfolioTag from './components/portfolioTag.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'

export default {
    name: 'createCommentPage',
    mixins: [basicInfoMixin, platformDifferenceMixin],
    data() {
        return { comment: '', error_msg: '', isOverLimits: false }
    },
    components: { textLimitedBox, portfolioTag },
    computed: {},
    created() {
        this.getData()
    },
    mounted() {},
    beforeDestroy() {},
    methods: {
        async createPortfolioComment() {
            const param = {
                portfolioId: Number(this.$route.query.portfolioId),
                comment: this.comment,
            }
            this.$loading.show = true
            createPortfolioComment(param)
                .then(() => {
                    this.$toast.success({
                        message: this.$t('follow.createSuccess'),
                        forbidClick: true,
                        duration: 1000,
                        onClose: () => {
                            this.backPreviousPage()
                        },
                    })
                })
                .catch(e => {
                    console.error('yinlong', e)
                    if (e?.error?.code == 281403) {
                        this.error_msg = this.$t('createComment.error3')
                    } else {
                        this.error_msg = this.$t('submitError')
                    }
                })
                .finally(() => {
                    this.$loading.show = false
                })
        },
        handleCreate() {
            if (this.comment.length == 0) {
                this.$toast(this.$t('createComment.error1'))
                return
            } else if (this.comment.length < 2) {
                this.$toast(this.$t('createComment.error2'))
                return
            } else if (this.isOverLimits) {
                return
            }
            this.createPortfolioComment()
        },
        onInput(text, isOver) {
            this.isOverLimits = isOver
            if (isOver) {
                this.error_msg = this.$t('follow.overLimitsError', { count: '200' })
            } else {
                this.error_msg = ''
            }
        },
    },
}
</script>

<style lang="less" scoped>
.container {
    padding: 12px;
}

.input_container {
    margin-bottom: 32px;
    padding: 12px 12px 24px;
    background: #fff;
    border-radius: 8px;

    .text_input {
        margin: 12px 0 0;
    }

    .error_msg {
        margin-top: 4px;
        color: #f31414;
        font-size: 12px;
        line-height: 14px;
    }
}

.create_button {
    width: 299px;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    line-height: 44px;
    background: #ff6907;
    border: none;
    border-radius: 22px;
    outline: none;
}

.disable_button {
    background: rgba(255, 105, 7, 0.3);
}
</style>
