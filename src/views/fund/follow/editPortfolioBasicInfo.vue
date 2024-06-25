<!-- 编辑组合基础信息页-->
<template>
    <div class="container">
        <navigation-bar :color="'#ffffff'" :magicColor="'#f9f9f9'" @back="goBack"></navigation-bar>
        <div class="input_container">
            <div class="f14 c_666 padding-t-16">
                <div class="f14">{{ $t('follow.combinationName') }}</div>
                <textLimitedBox
                    class="name_text mar-t12"
                    v-model="name"
                    clearable
                    :isOneLine="true"
                    :showCount="false"
                    :boxHeight="48"
                    :maxTextLength="10"
                    :placeholder="$t('editPortfolioInfo.namePlaceholder')"
                    :overBehaviour="'cutOff'"
                    @input="onNameInput"
                ></textLimitedBox>
                <div v-if="!!nameError" class="error_msg mar-t4">{{ nameError }}</div>
            </div>

            <div class="f14 c_666 padding-t-16">
                <div class="f14">{{ $t('editPortfolioInfo.brief') }}</div>
                <textLimitedBox
                    class="text_input"
                    v-model="brief"
                    :boxHeight="212"
                    :placeholder="$t('editPortfolioInfo.briefPlaceholder')"
                    @input="onBriefInput"
                ></textLimitedBox>
                <div v-if="!!briefError" class="error_msg mar-t4">{{ briefError }}</div>
            </div>
        </div>

        <div class="flex-middle full-width">
            <button class="create_button" :class="{ disable_button: name === '' || isBriefOverLimits || !hasAnyChanged }" @click="handleEdit()">
                {{ $t('editPortfolioInfo.confirmEdit') }}
            </button>
        </div>
    </div>
</template>

<script>
import { portfolioInfoUpdate } from '@/apis/followInvest/index.js'
import basicInfoMixin from './mixins/basicInfoMixin'
import textLimitedBox from './components/textLimitedBox'
import { isEmpty } from '@/utils'
import NavigationBar from '@/components/NavigationBar.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'

export default {
    name: 'edit-portfolio-basic-info',
    mixins: [basicInfoMixin, platformDifferenceMixin],
    data() {
        return {
            brief: '',
            name: '',
            nameError: '',
            briefError: '',
            maxNameLength: 10,
            oldName: '',
            isBriefOverLimits: false,
            hasAnyChanged: false,
        }
    },
    components: { textLimitedBox, NavigationBar },
    computed: {},
    created() {
        this.getData()
    },
    mounted() {},
    beforeDestroy() {},
    watch: {
        obj: {
            handler(v) {
                this.brief = v.portfolioBrief
                this.name = v.portfolioName
                this.oldName = v.portfolioName
            },
        },
    },
    methods: {
        async portfolioInfoUpdate() {
            const param = {
                portfolioId: Number(this.$route.query.portfolioId),
                name: this.name,
                brief: this.brief || '',
            }
            this.$loading.show = true
            portfolioInfoUpdate(param)
                .then(result => {
                    if (isEmpty(result.result)) {
                        this.$toast.success({
                            message: this.$t('editPortfolioInfo.success'),
                            forbidClick: true,
                            onClose: () => {
                                this.backPreviousPage()
                            },
                        })
                    }
                })
                .catch(e => {
                    console.error(e.error)
                    if (e?.error?.code == 281403) {
                        if (e.error.data.name) {
                            this.nameError = this.$t('editPortfolioInfo.name_certain')
                        }
                        if (e.error.data.brief) {
                            this.briefError = this.$t('editPortfolioInfo.brief_certain')
                        }
                    } else {
                        this.$toast(this.$t('submitError'))
                    }
                })
                .finally(() => {
                    this.$loading.show = false
                })
        },
        handleEdit() {
            if (this.name === '') {
                this.$toast(this.$t('editPortfolioInfo.nameOneWord'))
                return
            }
            if (this.isBriefOverLimits) {
                return
            }
            if (!this.hasAnyChanged) {
                return
            }
            // if (this.brief === '') {
            //     this.$toast(this.$t('editPortfolioInfo.briefEmpty'))
            //     return
            // }
            this.portfolioInfoUpdate()
        },
        onNameInput() {
            this.hasAnyChanged = true
        },
        onBriefInput(text, isOver) {
            this.hasAnyChanged = true
            this.isBriefOverLimits = isOver
            if (isOver) {
                this.briefError = this.$t('follow.overLimitsError', { count: '200' })
            } else {
                this.briefError = ''
            }
        },
        goBack() {
            if (!this.hasAnyChanged) {
                this.backPreviousPage()
            } else {
                this.$titleDialog
                    .show({
                        title: this.$t('editPortfolioInfo.confirmGoBack'),
                    })
                    .then(() => {
                        this.backPreviousPage()
                    })
                    .catch(() => {})
            }
        },
    },
}
</script>

<style lang="less" scoped>
.container {
    padding: 12px;
}

.c_666 {
    color: #666;
}

.padding-t-16 {
    padding-top: 16px;
}

.input_container {
    margin-bottom: 32px;
    padding: 0 12px 24px;
    background: #fff;
    border-radius: 8px;

    .text_input {
        margin: 12px 0 0;
    }

    .error_msg {
        color: #f31414;
        font-size: 12px;
        line-height: 14px;
    }

    .name_text {
        position: relative;
        width: 100%;
        height: 48px;
        background-color: #f9f9f9;
        border-radius: 8px;
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
