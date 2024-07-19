// 客户资料编辑页
<template>
    <div class="edit-customer-info">
        <navigation-bar :color="'#ffffff'" :magicColor="'#f9f9f9'" @back="goBack"></navigation-bar>
        <div class="content">
            <section class="head">
                <div v-for="(item, index) in headerList" :key="index" class="head-cell" @click="clickCellAction(index)">
                    <div class="head-cell-container">
                        <div class="title">
                            {{ item.label }}
                            <span v-if="index == 1" class="required_field">*</span>
                        </div>
                        <span class="head-cell-right">
                            <span v-show="(index == 0 && resTagsList.length == 0) || index == 1" class="description">
                                {{ getCellSubTitle(item, index) }}
                            </span>
                            <multi-img class="arrowIcon" name="icon_right_arrow_16" directory="common"></multi-img>
                        </span>
                    </div>
                    <div v-show="index == 0 && resTagsList.length" class="tagBox">
                        <div class="tag" v-for="(item, index) in resTagsList" :key="index">{{ getTagText(item) }}</div>
                    </div>
                    <div v-if="index == 0" class="line"></div>
                </div>
                <van-popup v-model="showExpDialog" round position="bottom" class="expDialog">
                    <div
                        v-for="(item, index) in expsList"
                        :key="index"
                        class="expCell"
                        @click="clickExpsCell(index, item)"
                        :class="{ 'expCell-sel': index == investExpSelIndex - 1 }"
                    >
                        {{ item }}
                    </div>
                </van-popup>
            </section>
            <div class="briefCard">
                <div class="brief">
                    <div class="card_title">{{ $t('editCustomerInfo.brief') }}</div>
                    <textLimitedBox
                        class="brief-content"
                        v-model="brief"
                        :maxTextLength="200"
                        :boxHeight="212"
                        :placeholder="$t('editCustomerInfo.briefTips')"
                        @input="(t, v) => onInput(t, v, 0)"
                    ></textLimitedBox>
                    <div v-show="isShowBriefError || isBriefOverLimits" class="errorMsg">{{ getErrorMsg(0) }}</div>
                </div>
                <div v-show="isProfessional" class="investIdea">
                    <div class="card_title">
                        {{ $t('editCustomerInfo.investIdea') }}
                        <span class="required_field">*</span>
                    </div>
                    <textLimitedBox
                        class="investIdea-content"
                        v-model="investIdea"
                        :isOneLine="true"
                        :boxHeight="48"
                        :maxTextLength="10"
                        :placeholder="$t('editCustomerInfo.investIdeaTips')"
                        @input="(t, v) => onInput(t, v, 1)"
                    ></textLimitedBox>
                    <div v-show="isShowInvestIdeaError || isInvestIdeaOverLimits" class="errorMsg">{{ getErrorMsg(1) }}</div>
                </div>
                <div v-show="isProfessional" class="investIdea">
                    <div class="card_title">
                        {{ $t('editCustomerInfo.advantage') }}
                        <span class="required_field">*</span>
                    </div>
                    <textLimitedBox
                        class="investIdea-content"
                        v-model="advantage"
                        :isOneLine="true"
                        :boxHeight="48"
                        :maxTextLength="10"
                        :placeholder="$t('editCustomerInfo.advantageTips')"
                        @input="(t, v) => onInput(t, v, 2)"
                    ></textLimitedBox>
                    <div v-show="isShowAdvantageError || isAdvantageOverLimits" class="errorMsg">{{ getErrorMsg(2) }}</div>
                </div>
            </div>
            <section class="cardBottom"></section>
        </div>
        <div class="foot">
            <van-button :disabled="editBtnDisable" class="btn" @click="clickEditBtn">{{ $t('editCustomerInfo.editConfirm') }}</van-button>
        </div>
    </div>
</template>

<script>
import { i18n } from '@/i18n/fund/index.js'
import textLimitedBox from './components/textLimitedBox.vue'
import customerDetailMixin from './mixins/customerDetailMixin.js'
import { isNull, isUndefined, isTenantApp } from '@/utils'
import { UserInfo, UserInfoUpdate } from '@/apis/followInvest/index.js'
import { isEmpty, cloneDeep } from 'lodash'
import NavigationBar from '@/components/NavigationBar.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
let EditUnit = {
    oldTagsList: [],
    investExpSelIndex: 0,
    brief: '',
    investIdea: '',
    advantage: '',
    isGotoTagsPage: false,
}
const kEditUnitCacheKey = 'kEditUnitCacheKey'

export default {
    name: 'edit-customer-info',
    components: { textLimitedBox, NavigationBar },
    mixins: [customerDetailMixin, platformDifferenceMixin],
    data() {
        return {
            isProfessional: this.$route.query.isProfessional === '1',
            investExps: '',
            headerList: [
                {
                    label: i18n.t('editCustomerInfo.personalTags'),
                    msg: i18n.t('editCustomerInfo.tagTips'),
                },
                {
                    label: i18n.t('editCustomerInfo.investExps'),
                    msg: i18n.t('editCustomerInfo.investExpsTips'),
                },
            ],
            expsList: [
                i18n.t('editCustomerInfo.lessOneYear'),
                i18n.t('editCustomerInfo.lessSixYears'),
                i18n.t('editCustomerInfo.lessElevenYears'),
                i18n.t('editCustomerInfo.moreThanTenYears'),
            ],
            investExpSelIndex: 0, //1：1年以下，2：1至5年，3：6至10年，4：10年以上;
            investExpSubTitle: '',
            editBtnDisable: true,
            resTagsList: [],
            // 个人简介
            brief: '',
            // 投资理念
            investIdea: '',
            // 擅长赛道
            advantage: '',
            // 个人简介 敏感词
            isShowBriefError: false,
            // 投资理念 敏感词
            isShowInvestIdeaError: false,
            // 擅长赛道 敏感词
            isShowAdvantageError: false,
            // 个人简介 超出限制
            isBriefOverLimits: false,
            // 投资理念 超出限制
            isInvestIdeaOverLimits: false,
            // 擅长赛道 超出限制
            isAdvantageOverLimits: false,
            showExpDialog: false,
            dataModel: {},
        }
    },
    computed: {
        //筛除被下架标签
        getTags() {
            if (this.dataModel.tags) {
                const list = this.dataModel.tags.filter(item => item.Status === 1)
                return list
            }
            return []
        },
        isInAPP() {
            return isTenantApp()
        },
    },
    created() {},
    mounted() {
        this.getUserInfo()
    },
    destroyed() {},
    methods: {
        async getUserInfo() {
            try {
                const params = {}
                const { result } = await UserInfo(params)
                console.log(`result ===> `, result)
                const valueString = localStorage.getItem('resList')
                const cache = localStorage.getItem(kEditUnitCacheKey)
                localStorage.removeItem('resList')
                localStorage.removeItem(kEditUnitCacheKey)
                if (!isEmpty(cache)) {
                    EditUnit = JSON.parse(cache)
                }
                // 从标签返回
                if (!isEmpty(valueString)) {
                    EditUnit.isGotoTagsPage = false
                    const tagsList = JSON.parse(valueString)
                    const newTags = tagsList.map(item => {
                        return item.id
                    })
                    const oldTags = EditUnit.oldTagsList.map(item => {
                        return item.id
                    })
                    this.resTagsList = tagsList
                    this.investExpSelIndex = EditUnit.investExpSelIndex
                    this.investExpSubTitle = this.expsList[EditUnit.investExpSelIndex - 1]
                    this.brief = EditUnit.brief
                    this.investIdea = EditUnit.investIdea
                    this.advantage = EditUnit.advantage
                    if (JSON.stringify(newTags) !== JSON.stringify(oldTags)) {
                        this.editBtnStatusChange()
                    }
                    EditUnit.oldTagsList = cloneDeep(this.resTagsList)
                } else if (EditUnit.isGotoTagsPage) {
                    EditUnit.isGotoTagsPage = false
                    this.resTagsList = EditUnit.oldTagsList
                    this.investExpSelIndex = EditUnit.investExpSelIndex
                    this.investExpSubTitle = this.expsList[EditUnit.investExpSelIndex - 1]
                    this.brief = EditUnit.brief
                    this.investIdea = EditUnit.investIdea
                    this.advantage = EditUnit.advantage
                } else {
                    // 正常进入
                    this.dataModel = result
                    this.investExpSelIndex = result.investExp
                    this.investExpSubTitle = this.expsList[result.investExp - 1]
                    this.brief = result.brief
                    this.investIdea = result.investmentPhilosophy
                    this.advantage = result.favoredCourses
                    this.resTagsList = this.getTags
                    EditUnit.oldTagsList = cloneDeep(this.resTagsList)
                    EditUnit.investExpSelIndex = this.investExpSelIndex
                    EditUnit.brief = this.brief
                    EditUnit.investIdea = this.investIdea
                    EditUnit.advantage = this.advantage
                }
            } catch (e) {
                console.error(e)
            }
        },
        clickCellAction(index) {
            if (index == 0) {
                EditUnit.isGotoTagsPage = true
                localStorage.setItem(kEditUnitCacheKey, JSON.stringify(EditUnit))
                const tagidStr = this.resTagsList
                    .map(tag => {
                        return tag.id
                    })
                    .join(',')
                this.$router.push({
                    path: '/add-personal-tags',
                    query: {
                        tags: tagidStr,
                    },
                })
            } else if (index == 1) {
                this.showExpDialog = true
            }
        },

        clickExpsCell(index, item) {
            this.investExpSelIndex = index + 1
            this.investExpSubTitle = item
            this.showExpDialog = false
            this.editBtnStatusChange()
        },

        getCellSubTitle(item, index) {
            if (index == 0) {
                return item.msg
            } else if (index == 1) {
                if (this.investExpSubTitle != '') {
                    return this.investExpSubTitle
                }
                return item.msg
            }
        },

        getErrorMsg(errorIndex) {
            switch (errorIndex) {
                case 0:
                    if (this.isBriefOverLimits) {
                        return this.$t('follow.overLimitsError', { count: '200' })
                    }
                    return i18n.t('editCustomerInfo.brief') + i18n.t('editCustomerInfo.errorMsg')
                case 1:
                    if (this.isInvestIdeaOverLimits) {
                        return this.$t('follow.overLimitsError', { count: '10' })
                    }
                    return i18n.t('editCustomerInfo.investIdea') + i18n.t('editCustomerInfo.errorMsg')
                case 2:
                    if (this.isAdvantageOverLimits) {
                        return this.$t('follow.overLimitsError', { count: '10' })
                    }
                    return i18n.t('editCustomerInfo.advantage') + i18n.t('editCustomerInfo.errorMsg')
                default:
                    return ''
            }
        },

        editBtnStatusChange() {
            if (this.isBriefOverLimits || this.isInvestIdeaOverLimits || this.isAdvantageOverLimits) {
                this.editBtnDisable = true
                return
            }

            EditUnit.investExpSelIndex = this.investExpSelIndex
            EditUnit.brief = this.brief
            EditUnit.investIdea = this.investIdea
            EditUnit.advantage = this.advantage

            if (!this.isProfessional) {
                this.editBtnDisable = this.investExpSelIndex == 0
            } else {
                if (!isEmpty(this.investIdea) && !isEmpty(this.advantage) && this.investExpSelIndex > 0) {
                    this.editBtnDisable = false
                } else {
                    this.editBtnDisable = true
                }
            }
        },

        clickEditBtn() {
            this.updateCustomerInfo()
        },

        async updateCustomerInfo() {
            try {
                this.$loading.show = true
                const params = {
                    favoredCourses: this.advantage,
                    investmentPhilosophy: this.investIdea,
                    investExp: this.investExpSelIndex,
                }

                if (!isNull(this.brief) && !isUndefined(this.brief) && this.brief != '') {
                    params['brief'] = this.brief
                }

                if (this.resTagsList.length > 0) {
                    const tags = this.resTagsList.map(item => item.id)
                    params['tags'] = tags
                }
                const { result } = await UserInfoUpdate(params)
                console.log(`Xiaopei Jin:: result ===> `, result)
                if (result.releaseStatus && result.releaseStatus == 1) {
                    this.$toast.success({
                        message: this.$t('editPortfolioInfo.success'),
                        onClose: () => {
                            this.editBtnDisable = true
                            this.backPreviousPage()
                        },
                    })
                }
            } catch (e) {
                console.error(e)
                if (e?.error?.code == 281403 && e?.error?.data) {
                    const badWords = e.error.data.badWords
                    console.log(`Xiaopei Jin:: badWords ===> `, badWords)
                    const fav = badWords.filter(item => item.key === 'favoredCourses')
                    if (fav.length > 0) {
                        this.isShowAdvantageError = true
                    }
                    const brief = badWords.filter(item => item.key === 'brief')
                    if (brief.length > 0) {
                        this.isShowBriefError = true
                    }
                    const inv = badWords.filter(item => item.key === 'investmentPhilosophy')
                    if (inv.length > 0) {
                        this.isShowInvestIdeaError = true
                    }
                }
            } finally {
                this.$loading.show = false
            }
        },
        onInput(text, isOver, type) {
            // 个人简介
            if (type === 0) {
                this.isBriefOverLimits = isOver
            } else if (type === 1) {
                // 投资理念
                this.isInvestIdeaOverLimits = isOver
            } else if (type === 2) {
                // 擅长赛道
                this.isAdvantageOverLimits = isOver
            }

            this.editBtnStatusChange()
        },
        goBack() {
            if (this.editBtnDisable) {
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
    watch: {
        brief: {
            handler() {
                this.isShowBriefError = false
            },
        },
        investIdea: {
            handler() {
                this.isShowInvestIdeaError = false
            },
        },
        advantage: {
            handler() {
                this.isShowAdvantageError = false
            },
        },
    },
}
</script>

<style scoped lang="less">
.edit-customer-info {
    display: flex;
    flex-direction: column;
    width: 100vw;
    padding-bottom: 120px;
    background-color: #f9f9f9;

    .content {
        background-color: #f9f9f9;

        .head {
            display: flex;
            flex-direction: column;
            margin: 12px;
            background-color: #fff;
            border-radius: 12px;

            &-cell {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            .line {
                height: 0.5px;
                margin: 0 16px;
                background-color: #efefef;
            }

            &-cell-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                height: 51.5px;
                color: #000;
            }

            &-cell-right {
                display: flex;
                align-items: center;
                margin-right: 16px;
            }

            .title {
                margin-left: 16px;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 16px;
                font-style: normal;
                line-height: 20px;
            }

            .description {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 14px;
                font-style: normal;
                line-height: 20px;
            }

            .arrowIcon {
                width: 12px;
                height: 12px;
            }

            .tagBox {
                display: flex;
                flex-flow: row wrap;
                width: 100%;
                margin-bottom: 6px;
                margin-left: 4px;
            }

            .tag {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 20px;
                margin-bottom: 8px;
                margin-left: 8px;
                padding: 2px 6px;
                color: @h2-white;
                font-weight: 400;
                font-size: 12px;
                font-style: normal;
                line-height: 20px;
                border: 1px solid #efefef;
                border-radius: 4px;
            }
        }

        .briefCard {
            display: flex;
            flex-direction: column;
            margin-right: 12px;
            margin-left: 12px;
            background-color: #fff;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;

            .card_title {
                margin-top: 16px;
                margin-right: 12px;
                margin-left: 12px;
                color: #666;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }

            .brief {
                .brief-content {
                    margin: 12px 12px 0;
                }
            }

            .investIdea {
                .investIdea-content {
                    height: 48px;
                    margin: 12px 12px 0;
                }
            }

            .errorMsg {
                margin-top: 4px;
                padding: 0 12px;
                color: #f31414;
                font-weight: 400;
                font-size: 12px;
                line-height: 14px;
            }
        }

        .cardBottom {
            display: flex;
            height: 24px;
            margin-right: 12px;
            margin-left: 12px;
            background-color: #fff;
            border-bottom-right-radius: 8px;
            border-bottom-left-radius: 8px;
        }
    }

    .foot {
        position: fixed;
        bottom: 0;
        width: 100vw;
        height: 90px;
        padding: 8px 28px 34px;
        background-color: #fff;

        .btn {
            width: 100%;
            height: 44px;
            color: #fff;
            font-weight: 500;
            font-size: 16px;
            font-style: normal;
            line-height: 22px;
            background: #ff6907;
            border: none;
            border-radius: 22px;
        }
    }

    .expDialog {
        padding: 12px 8px 34px;

        .expCell {
            height: 64px;
            padding: 21px 24px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 16px;
            line-height: 22px;
        }

        .expCell-sel {
            background-color: #fff5ef;
            border-radius: 8px;
        }
    }

    .required_field {
        color: @error-white;
    }
}
</style>
