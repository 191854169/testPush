<template>
    <div class="base" v-if="loaded">
        <div class="main" :key="currentQuestion.content">
            <div class="index">
                <span class="current">{{ currentQuestion.field }}</span>
                <span class="total">/{{ questionList.length }}</span>
            </div>
            <h5 class="title">{{ currentQuestion.content }}</h5>
            <div class="list">
                <a
                    class="item"
                    :class="{ active: item.activeFlag }"
                    v-for="(item, index) in currentQuestion.choices"
                    :key="item.value"
                    @click="handleItemClick(item, index)"
                >
                    {{ item.label }}
                </a>
            </div>
            <div class="flex">
                <van-button class="button" plain type="primary" block size="normal" v-if="currentQuestion.field !== 1" @click="handlePrev">
                    {{ $t('prevQuestion') }}
                </van-button>
                <van-button class="button active" plain type="primary" block size="normal" @click="handleNext" v-if="!showConfirmBtn">
                    {{ $t('nextQuestion') }}
                </van-button>
            </div>
        </div>
        <div class="confirm-btn-wrapper">
            <van-button
                class="confirm-btn"
                :class="{ disable: diableFlag }"
                type="primary"
                block
                size="normal"
                v-if="showConfirmBtn"
                @click="handleConfirm"
            >
                {{ $t('confirmSubmit') }}
            </van-button>
        </div>
    </div>
</template>

<script>
import { RiskQuestionnaire, RiskAssessSubmit } from '@/apis/riskAssessment.js'
import { Toast } from 'vant'
import { debounce } from '@/utils/utils'
import { sum, max, isObj } from '@/utils/tools.js'
import { riskData } from './utils.js'
import { getQueryString } from '@/utils'
import mixin from './mixin.js'

export default {
    name: 'riskAssessment',
    mixins: [mixin],
    data() {
        return {
            questionList: [], // 题目列表
            questionId: '',
            currentIndex: 0, // 当前题目索引
            currentQuestion: {}, // 当前题目信息
            answerData: [], // 已选答案
            scoreData: [], // 已选分数
            checkboxData: [],
            checkboxChosen: [], // 多选选中选项
            diableFlag: true, //未选答案
            loaded: false,
            disableSubmit: false,
            clickItemFlag: false,
        }
    },
    computed: {
        showConfirmBtn() {
            return this.currentQuestion.field === this.questionList.length
        },
        subAcctId() {
            return this.$route.query.sub || this.$store.getters['user/getSubAccountId']
        },
    },
    mounted() {
        this.init()
    },
    methods: {
        init() {
            this.$store.commit('app/updateShowLoading', true)
            RiskQuestionnaire({
                params: {
                    subAcctId: this.subAcctId,
                },
            })
                .then(res => {
                    this.$store.commit('app/updateShowLoading', false)
                    this.loaded = true
                    const itemList = res?.result?.itemList && JSON.parse(res.result.itemList)
                    this.questionList = itemList?.questionList
                    this.questionId = res?.result?.questionId
                    const arr = this.questionList[this.currentIndex]
                    arr?.choices.forEach(item => {
                        item.activeFlag = false
                    })
                    this.currentQuestion = arr
                })
                .catch(res => {
                    this.$store.commit('app/updateShowLoading', false)
                    Toast(res?.error?.message)
                })
        },
        // 处理单选
        handleRadio(item, index, field) {
            // 点击一次之后，渲染了第二题才可以点击
            if (this.clickItemFlag) {
                return
            }
            this.clickItemFlag = true
            this.setRadioActive(item, index, field)
            if (this.currentQuestion.field === this.questionList.length) {
                this.diableFlag = false
                this.clickItemFlag = false
                return
            }
            setTimeout(() => {
                this.$nextTick(() => {
                    this.currentIndex++
                    this.currentQuestion = this.questionList[this.currentIndex]
                    this.checkboxChosen =
                        this.currentQuestion.type === 'checkbox' ? this.currentQuestion.choices.filter(item => item?.activeFlag && !item.type) : []
                    this.clickItemFlag = false
                })
            }, 400)
            // console.log('handleRadio---scoreData=>', this.scoreData, 'answerData=>', this.answerData)
        },

        // 设置单选选中
        setRadioActive(item, index, field) {
            this.currentQuestion.choices.forEach((i, j) => {
                this.$set(this.currentQuestion.choices, j, { ...i, ...{ activeFlag: index === j } })
            })
            this.answerData.splice(field - 1, 1, item?.value)
            this.scoreData.splice(field - 1, 1, item?.score)
        },

        // 处理多选
        handleCheckbox(item, index, field) {
            if (item?.type === 'radio') {
                // 当前选项是单选
                this.setRadioActive(item, index, field)
                this.checkboxChosen = []
            } else {
                const chosenIndex = this.checkboxChosen.indexOf(item)
                // 当前选项是多选，之前没被选中
                if (chosenIndex === -1 && !item.activeFlag) {
                    const chosenObj = { ...item, ...{ activeFlag: true } }
                    this.currentQuestion.choices.forEach((i, j) => {
                        // 单选选项
                        i?.type === 'radio' && this.$set(this.currentQuestion.choices, j, { ...i, ...{ activeFlag: false } })
                        // 当前选项
                        index === j && this.$set(this.currentQuestion.choices, j, chosenObj)
                    })
                    this.checkboxChosen.push(chosenObj)
                    this.handleCheckboxData()
                } else {
                    // 之前选中,
                    // 当前只有一项选中，则不让取消
                    if (this.checkboxChosen.length == 1) {
                        return
                    }
                    this.checkboxChosen.splice(chosenIndex, 1)
                    this.currentQuestion.choices.forEach((i, j) => {
                        // 当前选项
                        index === j && this.$set(this.currentQuestion.choices, j, { ...i, ...{ activeFlag: false } })
                    })
                }
            }
            // console.log('handleCheckbox---scoreData=>', this.scoreData, 'answerData=>', this.answerData)
        },

        // 点击选项
        handleItemClick(item, index) {
            const { type, field } = this.currentQuestion
            switch (type) {
                case 'radio':
                    this.handleRadio(item, index, field)
                    break
                case 'checkbox':
                    this.handleCheckbox(item, index, field)
                    break
                default:
                    break
            }
        },

        // 点击上一题
        handlePrev: debounce(function () {
            this.clickItemFlag = false
            if (this.currentIndex === 0) return
            if (this.currentQuestion.type === 'checkbox' && this.checkboxChosen.length) {
                this.handleCheckboxData()
            }
            this.checkboxChosen = []
            this.currentIndex--
            this.currentQuestion = this.questionList[this.currentIndex]
            this.checkboxChosen =
                this.currentQuestion.type === 'checkbox' ? this.currentQuestion.choices.filter(item => item?.activeFlag && !item.type) : []
        }, 300),

        // 处理多选题数据
        handleCheckboxData() {
            // 多选题中选的单选，不需要走后面的流程
            if (!this.checkboxChosen.length) {
                return
            }
            const answerData = this.checkboxChosen.map(item => item.value).join('')
            const scoreData = max(this.checkboxChosen.map(item => item.score))
            if (this.checkboxData.length) {
                let index = -1
                this.checkboxData.forEach((item, i) => {
                    if (item.content === this.currentQuestion.content && item.field === this.currentQuestion.field) {
                        index = i
                    }
                })
                if (index === -1) {
                    this.checkboxData.push(this.currentQuestion)
                    this.answerData.push(answerData)
                    this.scoreData.push(scoreData)
                } else {
                    const field = this.currentQuestion.field - 1
                    this.checkboxData.splice(index, 1, this.currentQuestion)
                    this.answerData.splice(field, 1, answerData)
                    this.scoreData.splice(field, 1, scoreData)
                }
            } else {
                this.checkboxData.push(this.currentQuestion)
                this.answerData.push(answerData)
                this.scoreData.push(scoreData)
            }
        },

        // 点击下一题
        handleNext: debounce(function () {
            if (this.clickItemFlag) {
                return
            }
            this.clickItemFlag = false
            const flag = this.answerData.length < this.currentQuestion.field
            if (flag) {
                Toast(this.$t('noAnswerSelected'))
                return
            }
            if (this.currentQuestion.type === 'checkbox') {
                if (!this.checkboxChosen.length && flag) {
                    Toast(this.$t('noAnswerSelected'))
                    return
                }
                this.handleCheckboxData()
            }

            this.checkboxChosen = []
            this.currentIndex++
            this.currentQuestion = this.questionList[this.currentIndex]
            this.checkboxChosen =
                this.currentQuestion.type === 'checkbox' ? this.currentQuestion.choices.filter(item => item?.activeFlag && !item.type) : []
            // console.log('handleNext---scoreData=>', this.scoreData, 'answerData=>', this.answerData)
        }, 500),

        // 确认无误，提交
        handleConfirm: debounce(function () {
            if (this.diableFlag) {
                Toast(this.$t('noAnswerSelected'))
                return
            }
            // 提交成功后，不可再点击
            if (this.disableSubmit) {
                return
            }
            this.$store.commit('app/updateShowLoading', true)
            this.disableSubmit = true
            const riskLevelData = riskData?.riskLevel
            const riskScore = sum(this.scoreData)
            let riskLevel = 1
            for (const key in riskLevelData) {
                const obj = riskLevelData[key]
                if (isObj(obj) && obj.min <= riskScore && obj.max >= riskScore) {
                    riskLevel = parseInt(key)
                }
            }
            const params = {
                riskScore,
                riskLevel,
                subAcctId: this.subAcctId,
                questionId: this.questionId,
                answer: this.answerData.join(','),
            }
            console.log('params=>', params, 'scoreData=>', this.scoreData)
            RiskAssessSubmit({
                data: params,
            })
                .then(res => {
                    if (res?.result?.id) {
                        this.$store.commit('app/updateShowLoading', false)
                        const { title, origin = '' } = this.$route.query
                        // fix 同花顺里面被encode两次
                        const url = getQueryString('url', true)

                        url ? this.$router.replace({ name: 'result', query: { url, title, origin } }) : this.$router.replace({ name: 'result' })
                    }
                })
                .catch(res => {
                    this.$store.commit('app/updateShowLoading', false)
                    this.disableSubmit = false
                    Toast(res?.error?.message)
                })
        }, 300),
    },
}
</script>

<style lang="less" scoped>
@import url('~@/assets/css/mixins.less');

.base {
    height: 100%;
    padding: 16px 12px 32px;
    overflow: auto;
}

.main {
    padding: 16px 12px 0;
    background: #fff;
    border-radius: 8px;

    .current {
        color: @theme;
        font-weight: 500;
        font-size: 28px;
    }

    .total {
        color: @fontGreyColor;
        font-size: 12px;
    }

    .title {
        margin: 4px 0 20px;
        color: @fontBlackColor;
        font-weight: 500;
        font-size: 22px;
        line-height: 31px;
    }

    .list {
        .item {
            display: block;
            margin-bottom: 12px;
            padding: 17px 12px;
            color: @fontBlackColor;
            font-weight: 400;
            font-size: 16px;
            line-height: 22px;
            text-align: justify;
            background: #f9f9f9;
            border-radius: 4px;

            &:last-child {
                margin-bottom: 0;
            }

            &.active {
                color: @theme;
                background: @tabBackground;
            }
        }
    }

    .flex {
        display: flex;
        margin-top: 12px;

        .button {
            height: 52px;
            color: #666;
            border: 0;

            &.active {
                color: @theme;
            }

            &:active::before {
                opacity: 0;
            }
        }
    }
}

.confirm-btn-wrapper {
    #iosBottom();
}

.confirm-btn {
    width: 303px;
    height: 44px;
    margin: 16px auto 0;
    font-size: 16px;
    background-color: @theme;
    border: 0;
    border-radius: 22.5px;

    &:active::before {
        opacity: 0;
    }

    &.disable {
        opacity: 0.3;
    }
}
</style>
