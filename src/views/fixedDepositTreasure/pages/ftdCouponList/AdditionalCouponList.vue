<template>
    <div class="coupon-category-wrapper" v-if="ifRenderList">
        <div class="list-title" :class="{ 'list-title-disabled': isDisabled }">
            <span class="left">{{ isDisabled ? $t('coupon.bkykq') : $t('coupon.kykq') }}</span>
            <span class="right">{{ isDisabled ? disabledCoupons.length : canUseCoupons.length }}{{ $t('coupon.zhang') }}</span>
        </div>
        <van-list :finished="true">
            <div class="van-item" v-for="(item, index) in list" :key="item.id" :title="item.id" @click="clickCard(item)">
                <div :class="['list-item', isDisabled ? 'list-item-dis' : '']">
                    <!-- 左边小标 -->
                    <p
                        v-if="
                            item.type === COUPON_TYPE_ENUM.PUB_INCRE &&
                            item.extInfos.raiseInterest &&
                            item.extInfos.raiseInterest.productType !== 'note'
                        "
                        class="left-tip"
                    >
                        {{ getLeftText(item.extInfos.raiseInterest.yieldPeriod, item.extInfos.raiseInterest.unusedNum) }}
                    </p>
                    <!-- 右边小标 -->
                    <p v-if="tabValue == 1 && item.effectDay < 7" class="right-tip f10">{{ $t('coupon.dueSoon') }}</p>
                    <div
                        :class="[
                            'card-left',
                            tabValue == 1 && item.type == 4 && (item.businessType == 8 || item.businessType == 16) ? 'hk' : '',
                            tabValue == 1 && item.type == 4 && item.businessType == 32 ? 'usa' : '',
                            tabValue != 1 && item.type == 3 ? 'mian' : '',
                        ]"
                    >
                        <!-- 基金券：type == 7 -->
                        <template v-if="item.type == 7">
                            <p v-if="item.extInfos.raiseInterest">
                                {{ `${item.extInfos.raiseInterest.yieldAnnual || 0}` }}
                                <span class="percent-marker">%</span>
                            </p>
                        </template>

                        <p v-else>
                            {{ nP(item.amount) || 0 }}
                            <span class="currency">{{ item.currency || 'HKD' }}</span>
                        </p>
                    </div>
                    <div :class="['card-right', isSmallScreen ? 'small-screen' : '']">
                        <p class="title">{{ item.name }}</p>
                        <div class="inner-content">
                            <p v-if="tabValue == 1" class="f10">{{ item.effectTime }} {{ $t('coupon.due') }}</p>

                            <template v-if="[1, 0].includes(tabValue) && item.useCondition != 0 && item.useCondition != 8">
                                <p class="f10 condition-text condition-text1">{{ item.useConditionText }}</p>
                            </template>
                            <template v-if="[1, 0].includes(tabValue) && item.useCondition != 0 && item.useCondition == 8">
                                <p class="f10 condition-text condition-text1">
                                    {{ `${item.useConditionText[0]} ${item.useConditionText[1]} ${item.useConditionText[2]}` }}
                                </p>
                            </template>
                        </div>
                        <multi-img
                            v-if="!isDisabled"
                            :name="item.id === selectedId ? 'icon_agreement_select' : 'icon_agreement_normal'"
                            directory="fund"
                            style="width: 16px"
                            class="item-checkbox"
                            @click="handleItemSelect(item)"
                        ></multi-img>
                        <span v-if="isDisabled" class="disable-container"></span>
                    </div>
                </div>
                <div class="rule-bar" @click="openRule(index)">
                    <p class="f10 rule-btn">
                        {{ $t('coupon.useRule') }}
                    </p>
                    <img :class="['expand-icon', item.showRule ? 'expand' : '']" src="@/assets/img/card/drop-down.png" />
                </div>
                <div v-show="item.showRule" class="rule-content">
                    <!-- 基金加息券专属规则 -->
                    <div v-if="item.type === COUPON_TYPE_ENUM.PUB_INCRE && item.extInfos.raiseInterest" class="rule-content-inner">
                        <!-- 使用范围 -->
                        <p v-if="[DING_CUN_BAO].includes(item.extInfos.raiseInterest.productType)" class="f10 rule-btn">
                            {{ `*${$t('coupon.useRange')}：` }}{{ item.extInfos.raiseInterest.productType | toSimu_piaojuTxt }}
                        </p>
                        <!-- 起用金额定存宝返回两种单位 -->
                        <p v-if="item.extInfos.raiseInterest.productType === DING_CUN_BAO" class="f10 rule-btn">
                            {{
                                `*${$t('coupon.orderAmount')}${item.extInfos.raiseInterest.minHoldingValue}HKD ${$t('coupon.huo')} ${
                                    item.extInfos.raiseInterest.minHoldingValueUSD
                                }USD${$t('coupon.amountLimit2')}`
                            }}
                        </p>
                        <!-- 最大可添利本金定存宝返回两种单位 -->
                        <p v-if="item.extInfos.raiseInterest.productType === DING_CUN_BAO" class="f10 rule-btn">
                            {{ `*${$t('coupon.maxMoney')}：`
                            }}{{
                                item.extInfos.raiseInterest.maxYieldPrincipal === -1
                                    ? $t('coupon.noLimit')
                                    : `${item.extInfos.raiseInterest.maxYieldPrincipal}HKD ${$t('coupon.huo')} ${
                                          item.extInfos.raiseInterest.maxYieldPrincipalUSD
                                      }USD`
                            }}
                        </p>
                    </div>
                    <p class="f10" v-for="(it, idx) in item.rule" :key="idx">{{ it }}</p>
                </div>
            </div>
        </van-list>
    </div>
</template>

<script>
import { isIos, getLangType, transOutJSON } from '@/utils/tools'
import { COUPON_TYPE_ENUM } from './constant'
import NP from 'number-precision'
import { i18n } from '@/i18n/fixedDepositTreasure'
import { cloneDeep } from 'lodash'
import { mapGetters, mapActions } from 'vuex'
const UNLIMIT = -1
const DING_CUN_BAO = 'ftd'
const $t = text => i18n.t(text)

export default {
    name: 'AdditionalCouponList',
    props: {
        isDisabled: {
            Boolean: false,
        },
    },
    data() {
        return {
            conditionList: [
                'coupon.condition6{t}',
                'coupon.condition1',
                'coupon.condition2',
                'coupon.condition3',
                'coupon.condition4',
                'coupon.condition5',
                'coupon.condition6{t}',
                'coupon.condition7{t}',
            ],
            tabValue: 1,
            list: [],
            isSmallScreen: false,
            langType: 'zhCn',
            hasError: false,
            expand: false,
            COUPON_TYPE_ENUM,
            targetsObj: {
                1: this.$t('coupon.actyText7'),
                2: this.$t('coupon.actyText8'),
                3: this.$t('coupon.actyText9'),
                4: this.$t('coupon.actyText10'),
                5: this.$t('coupon.actyText11'),
                6: this.$t('coupon.actyText12'),
                7: this.$t('coupon.actyText13'),
            },
            DING_CUN_BAO,
            additionAmountUseInCompSelf: 0, // 加息金额
            agreement: false,
            commitToStoreSelectedList: [],
        }
    },
    computed: {
        ...mapGetters([
            'all',
            'canUseCoupons',
            'disabledCoupons',
            'subscriptionAmount',
            'persistenceProductInfo',
            'additionAmount',
            'selectedCoupon',
        ]),
        // 兼容输入购买金额为0的情况
        calCulateSubscriptionAmount() {
            return +this.subscriptionAmount
        },
        ifRenderList() {
            return this.isDisabled ? this.disabledCoupons.length > 0 : this.canUseCoupons.length > 0
        },
        selectedId() {
            return this.commitToStoreSelectedList[0]?.id || 0
        },
    },
    mounted() {
        if (document.documentElement.clientWidth < 370) this.isSmallScreen = true
        this.langType = getLangType()
        if (isIos()) document.body.addEventListener('touchmove', this.scrollEvent, { passive: false })
        if (this.isDisabled) {
            this.list = this.dealAlreadyGetList(this.disabledCoupons)
        } else {
            this.list = this.dealAlreadyGetList(this.canUseCoupons)
            // 如果选中过进入页面初始化赋值，使卡券有选中效果
            this.commitToStoreSelectedList = this.selectedCoupon
            this.additionAmountUseInCompSelf = this.additionAmount
        }
    },
    filters: {
        toSimu_piaojuTxt(type) {
            return type === DING_CUN_BAO ? $t('coupon.actyText14') : ''
        },
    },
    beforeDestroy() {
        document.body.removeEventListener('touchmove', this.scrollEvent)
    },
    methods: {
        ...mapActions(['commitSelectedCoupon', 'commitAdditionalAmount']),
        // 最大保留两位小数
        nP(value) {
            return NP.round(value, 2)
        },
        judgeHasExtInfo(item) {
            return (
                (item.type === COUPON_TYPE_ENUM.PUB_INCRE && item.extInfos.raiseInterest) ||
                (item.type === COUPON_TYPE_ENUM.EXPE_CASH && item.extInfos.xpMoneyCoupon)
            )
        },

        scrollEvent(evt) {
            if (evt.touches[0].clientY == evt.touches[0].pageY) return
            // 阻止默认事件
            evt.preventDefault()
        },
        // 点击卡券
        clickCard(item) {
            this.$sensorsTrack('CardClick', {
                card_id: item.id,
                card_name: item.name,
            })
        },

        dealAlreadyGetList(list) {
            const newList = cloneDeep(list)
            newList.forEach(item => {
                let rule = item.ruleCn
                let name = item.nameCn
                let remark = item.remarkCn ? item.remarkCn.split('\n') : []
                if (this.langType === 'zhTc' || this.langType === 'zhTC') {
                    rule = item.ruleTc
                    name = item.nameTc
                    remark = item.remarkTc ? item.remarkTc.split('\n') : []
                }
                item.name = name
                item.useConditionText = this.getUseConditionText(item)
                item.rule = rule ? rule.split('\n') : []
                item.providedTime = item.providedTime ? item.providedTime.split(' ')[0] : ''
                const effectTime = item.effectTime ? item.effectTime.replace(/-/g, '.') : ''
                item.effectTime = effectTime ? effectTime.slice(0, effectTime.length - 3) : ''
                const discardTime = item.discardTime ? item.discardTime.replace(/-/g, '.') : ''
                item.discardTime = discardTime ? discardTime.slice(0, discardTime.length - 3) : ''
                item.remark = remark
                item.showRule = false

                // 错误原因重写 *********** start
                // eslint-disable-next-line consistent-this
                const that = this
                let errorContent = item.useConditionText,
                    // eslint-disable-next-line prefer-const
                    errorText = transOutJSON(item.useConditionContent)
                const getReason = function (useCondition, errorText) {
                    if (useCondition == 5) {
                        // 收到卡券后日均资产达标使用失败提示
                        const obj = errorText
                        const times = obj.date.split('-')
                        errorContent = that.$t('coupon.useTip17{t1}{t2}{n}', { t1: times[1], t2: times[2], n: obj.amount })
                    } else if (useCondition == 6) {
                        // 收到卡券后X天内未useConditionContent出资
                        const obj = errorText
                        const times = obj.date.split('-')
                        errorContent = that.$t('coupon.useTip18{t1}{t2}', { t1: times[1], t2: times[2] })
                    } else if (useCondition == 7) {
                        // 收到卡券后 n天未进行 m 笔交易
                        const obj = errorText
                        const times = obj.date.split('-'),
                            n = obj.count
                        errorContent = that.$t('coupon.useTip22{t1}{t2}{t3}', { t1: times[1], t2: times[2], t3: n })
                    }
                    return errorContent
                }

                if ([5, 6, 7].includes(item.useCondition)) {
                    errorContent = getReason(item.useCondition, errorText)
                } else if ([8].includes(item.useCondition)) {
                    console.log('xxxxxxx', item)
                    // 如果是复合条件，则用getReason方法替换掉要重写的原因
                    const reasonArray = []
                    errorContent.forEach((i, index) => {
                        let hasGet = false // 对比errorContent,errorText 两个数组，是否有匹配的值
                        // 复合条件为数组
                        errorText.condtions.forEach(j => {
                            if (i == j.text && [5, 6, 7].includes(j.useCondition)) {
                                reasonArray[index] = getReason(j.useCondition, j.useConditionContent)
                                hasGet = true
                            }
                            if (i == j.text && [12, 13].includes(j.useCondition)) {
                                const targets = j.useConditionContent.targets || []
                                let str = ''
                                targets.forEach((val, idx) => {
                                    str += that.targetsObj[val] + (idx + 1 < targets.length ? '、' : '')
                                })
                                reasonArray[index] = i + ' 交易范围包括：' + str
                                console.log('reasonArray', reasonArray)
                                hasGet = true
                            }
                        })
                        !hasGet && (reasonArray[index] = i)
                    })
                    reasonArray[1] = errorText.condType === 1 ? this.$t('coupon.qie') : this.$t('coupon.huo')
                    errorContent = reasonArray
                }
                item.errorContent = errorContent
                // 错误原因重写  **************  end
            })
            return newList
        },
        // 展开/收起规则
        openRule(index) {
            this.list[index].showRule = !this.list[index].showRule
        },
        handleItemSelect(item) {
            if (this.isDisabled) return
            console.log('selected item:', item)
            const {
                id,
                extInfos: { raiseInterest },
            } = item

            if (id === this.selectedId) {
                // 点击选中卡券本身
                this.commitToStoreSelectedList = []
                this.additionAmountUseInCompSelf = 0
            } else {
                // 选择未选择卡券
                this.commitToStoreSelectedList = [item]
                console.log('selected raiseInterest:', raiseInterest)
                // 最大可添利本金无上限时maxYieldPrincipal,maxYieldPrincipalUSD 均为-1
                const { maxYieldPrincipal, maxYieldPrincipalUSD, yieldAnnual, yieldPeriod } = raiseInterest
                const { currency, periodValue } = this.persistenceProductInfo
                let additonalPrincipal = 0 // 加息本金
                if (maxYieldPrincipal === UNLIMIT) {
                    additonalPrincipal = this.calCulateSubscriptionAmount
                } else {
                    if (currency === 'HKD') {
                        additonalPrincipal =
                            this.calCulateSubscriptionAmount < maxYieldPrincipal ? this.calCulateSubscriptionAmount : maxYieldPrincipal
                    } else if (currency === 'USD') {
                        additonalPrincipal =
                            this.calCulateSubscriptionAmount < maxYieldPrincipalUSD ? this.calCulateSubscriptionAmount : maxYieldPrincipalUSD
                    } else {
                        additonalPrincipal = 0
                    }
                }
                // 加息时长：无限制取产品时长，有限制对比加息券设置时长、产品时长，加息券时长比产品时长长，则取产品时长，否则取加息券时长
                const additionalPeriod = yieldPeriod === UNLIMIT ? periodValue : yieldPeriod > periodValue ? periodValue : yieldPeriod
                const additionalFeeSingleDay = +((additonalPrincipal * yieldAnnual) / 36500).toFixed(2)
                const additionalFeeTotal = additionalFeeSingleDay * additionalPeriod
                console.log(
                    'additonalPrincipal ,yieldAnnual ,additionalPeriod, additionalFeeSingleDay, additionalFeeTotal:',
                    additonalPrincipal,
                    yieldAnnual,
                    additionalPeriod,
                    additionalFeeSingleDay,
                    additionalFeeTotal
                )
                this.additionAmountUseInCompSelf = additionalFeeTotal
            }
            this.$emit('select-coupon', this.additionAmountUseInCompSelf)
        },
        // 加息券获取左上角文本，当前定存宝 yieldPeriod 可能返回-1
        getLeftText(yieldPeriod) {
            return yieldPeriod === -1 ? this.$t('coupon.actyText15') : yieldPeriod + this.$t('coupon.day')
        },
        // 获取使用条件文本
        getUseConditionText(item) {
            item.useConditionContent = transOutJSON(item.useConditionContent)
            console.log('item.useConditionContent', item.useConditionContent)
            // eslint-disable-next-line prefer-const
            let day = item.useConditionContent.day || item.useConditionContent.nday || item.useConditionContent || 0,
                // eslint-disable-next-line prefer-const
                count = item.useConditionContent.count || 0,
                useConditionText = ''
            const amount = item.useConditionContent.amount
            const times = item.useConditionContent.times
            if (item.useCondition == 8) {
                const content = item.useConditionContent
                content.condtions.forEach(i => {
                    i.text = this.getUseConditionText(i)
                })
                if (content.condType === 1) {
                    return [content.condtions[0].text, this.$t('coupon.qie'), content.condtions[1].text]
                } else if (content.condType === 0) {
                    return [content.condtions[0].text, this.$t('coupon.huo'), content.condtions[1].text]
                }
            }
            item.useCondition != 7 && (useConditionText = this.$t(this.conditionList[item.useCondition], { t: day }))
            item.useCondition == 7 && (useConditionText = this.$t(this.conditionList[item.useCondition], { t: count }))

            item.useCondition == 9 && (useConditionText = this.$t('coupon.actyText2'))
            item.useCondition == 10 && (useConditionText = this.$t('coupon.actyText1'))
            item.useCondition == 11 && (useConditionText = this.$t('coupon.condition11{t1}{t2}', { t1: day }))
            item.useCondition == 12 && (useConditionText = this.$t('coupon.useTip21') + '≥' + times + this.$t('coupon.ci'))
            item.useCondition == 13 && (useConditionText = this.$t('coupon.condition3') + '≥' + amount + 'HKD')
            if (
                item.useCondition != 0 &&
                item.useCondition != 5 &&
                item.useCondition != 6 &&
                item.useCondition != 7 &&
                item.useCondition != 9 &&
                item.useCondition != 10 &&
                item.useCondition != 11 &&
                item.useCondition != 12 &&
                item.useCondition != 13
            ) {
                return (
                    useConditionText +
                    '≥' +
                    item.useConditionContent +
                    (item.useCondition == 3 || item.useCondition == 4 ? 'HKD' : this.$t('coupon.ci'))
                )
            }
            return useConditionText
        },
        funcDefineForParentUse() {
            this.commitSelectedCoupon(this.commitToStoreSelectedList)
            this.commitAdditionalAmount(this.additionAmountUseInCompSelf)
        },
    },
}
</script>

<style lang="less" scoped>
@import url('./coupon-list.less');

.coupon-category-wrapper {
    margin-bottom: 24px;

    .list-title {
        margin: 0 0 8px 4px;
        color: #2f2f2f;
        font-weight: 500;
        font-size: 14px;

        .right {
            margin-left: 8px;
            font-weight: 400;
            font-size: 12px;
        }
    }
}
</style>
