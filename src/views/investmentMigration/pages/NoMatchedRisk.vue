<template>
    <div class="no-matched-risk">
        <div class="header">
            <div class="name row">
                <span class="label">{{ $t('noMatchTitle') }}</span>
                <span class="value">{{ $t('noMatchTitleValue') }}</span>
            </div>
            <div class="match-status row">
                <span class="label">{{ $t('matchRes') }}</span>
                <span :class="{ 'match-sty': matchStatus, red: !matchStatus }">{{ matchStatus | matchStatusFilter(transform) }}</span>
            </div>
        </div>
        <div class="body">
            <div class="table">
                <!-- 类型名称 -->
                <ul class="examine-title col">
                    <li>{{ $t('suitabilityCheck') }}</li>
                    <li v-for="(item, idx) in examineTitle" :key="idx">{{ item.label }}</li>
                </ul>
                <!-- 目标需求 -->
                <ul class="product-result col">
                    <li>{{ $t('service') }}</li>
                    <li v-for="(item, idx) in examineTitle" :key="idx">{{ fund[item.fundKey] | fundKeyFilter(item.fundKey, transform) }}</li>
                </ul>
                <!-- 我的状况 -->
                <ul class="user col">
                    <li>{{ $t('me') }}</li>
                    <li v-for="(item, idx) in examineTitle" :key="idx">{{ user[item.userKey] | userKeyFilter(item.userKey, transform) }}</li>
                </ul>
                <!-- 匹配情况 -->
                <ul class="match-res col">
                    <li>{{ $t('isMatch') }}</li>
                    <li v-for="(item, idx) in examineTitle" :style="{ color: !matchRes[idx] ? '#F31414' : '' }" :key="idx">
                        {{ matchRes[idx] ? $t('yes') : $t('no') }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="footer">
            <button class="restart" @click="onRestart">{{ $t('restartRiskAssessment') }}</button>
        </div>
    </div>
</template>

<script>
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { UserRiskInfo } from '@/apis/riskAssessment.js'
import pathnames from '@/config/H5Pathname.js'
import { getProfessionalStatus } from '@/utils'
import { i18n } from '@/i18n/common'
import { isInOutsideH5 } from '@/utils'
// import Vue from 'vue'
export default {
    name: 'no-matched-risk',
    mixins: [riskAssessmentMixin],
    data() {
        return {
            fund: {
                // 需要衍生品
                isDerivative: 1,
                // 高风险
                riskRating: 5,
                // 投资目标 暂无
                investObjective: 0,
                // 投资年限 >=6年
                investYear: 3,
                // 专业投资者
                isPi: 1,
                // 虚拟资产知识
                virtualAssetKnowledge: 1,
            },
            user: {
                // openDerivative: 1,
                // riskLevel: 2,
                // investmentObjective: 3,
                // investmentExperience: 4
            },
            examineTitle: [
                { label: this.$t('derivativeInfo'), fundKey: 'isDerivative', userKey: 'openDerivative' },
                { label: this.$t('riskLevel'), fundKey: 'riskRating', userKey: 'riskLevel' },
                { label: this.$t('investTarget'), fundKey: 'investObjective', userKey: 'investmentObjective' },
                { label: this.$t('investExperience'), fundKey: 'investYear', userKey: 'investmentExperience' },
                { label: this.$t('typeOfInvestor'), fundKey: 'isPi', userKey: 'userIsPi' },
                { label: this.$t('virtualAssetKnowledge'), fundKey: 'virtualAssetKnowledge', userKey: 'virtualAssetKnowledge' },
            ],
            matchRes: [true, true, true, true],
        }
    },
    computed: {
        matchStatus() {
            return !this.matchRes.some(i => !i)
        },
    },
    filters: {
        matchStatusFilter(v, $t) {
            // return v ? Vue.prototype.$t('match') : Vue.prototype.$t('noMatch')
            return v ? $t('match') : $t('noMatch')
        },
        fundKeyFilter(v, key, $t) {
            // const $t = Vue.prototype.$t.bind(Vue.prototype)
            if (!key) return
            // 1：低风险，2：中低风险，3：中风险，4：中高风险，5：高风险
            // 1：保本为主， 2：收入为主，3：收入及增长，4：增长主导，5：积极增长
            // 浮点数，单位为年
            // 是否了解
            const filter = {
                isDerivative: () => {
                    return [$t('noNeed'), $t('need')][v]
                },
                riskRating: () => {
                    return ['', $t('lowRisk'), $t('middleLowRisk'), $t('middleRisk'), $t('middleHighRisk'), $t('highRisk')][v]
                },
                investObjective: () => {
                    return ['', $t('dominate'), $t('mainlyForIncome'), $t('incomeAndGrowth'), $t('growthDominance'), $t('aggressiveGrowth')][v]
                },
                investYear: () => {
                    return ['', $t('lessOneYear'), $t('oneToFiveYear'), $t('sixToTenYear'), $t('eveToTwenty'), $t('moreTwentyYear')][v]
                },
                // investFocusDegree: () => {
                //     return [i18n.t('none'), '<15%', '<30%', '<45%', '<60%', '>60%'][v]
                // },
                isPi: () => {
                    return [$t('ordinary'), $t('specialty')][v]
                },
                virtualAssetKnowledge: () => {
                    return [$t('noNeed'), $t('need')][v]
                },
            }
            return filter[key]() || '--'
        },
        userKeyFilter(v, key, $t) {
            console.log('vvvvvv', v)
            // const $t = Vue.prototype.$t.bind(Vue.prototype)
            if (!key) return
            // 1-了解\2-不了解
            // 1-稳健/2-中度/3-均衡/4-增长/5-进取
            // 1- （少于1年）;2-(1-5年);3-（6-10年）；4-（11-20年）；5- (20年以上)
            // 1-保本为主/2-收入为主/3-收入及增长/4-增长主导/5-积极增长
            const filter = {
                openDerivative: () => {
                    return ['', $t('know'), $t('unKnow')][v] || $t('unKnow')
                },
                riskLevel: () => {
                    return ['', $t('steady'), $t('moderate'), $t('isostasy'), $t('growth'), $t('aggressive')][v]
                },
                investmentObjective: () => {
                    return ['', $t('dominate'), $t('mainlyForIncome'), $t('incomeAndGrowth'), $t('growthDominance'), $t('aggressiveGrowth')][v]
                },
                investmentExperience: () => {
                    return ['', $t('lessOneYear'), $t('oneToFiveYear'), $t('sixToTenYear'), $t('eveToTwenty'), $t('moreTwentyYear')][v]
                },
                // investFocusDegree: () => {
                //     return ['', '<15%', '<30%', '<45%', '<60%', '>60%'][v]
                // },
                userIsPi: () => {
                    return [$t('ordinary'), $t('specialty')][v]
                },
                virtualAssetKnowledge: () => {
                    return ['', $t('know'), $t('unKnow')][v] || $t('unKnow')
                },
            }
            return filter[key]() || '--'
        },
    },
    created() {
        this.init()
    },
    methods: {
        async init() {
            // eslint-disable-next-line prefer-const
            let { user, virtualAssetKnowledge } = this.$route.query
            const AUTO_GET_USER = 1 // 手动获取用户信息
            if (user == AUTO_GET_USER) {
                user =
                    (
                        (await UserRiskInfo({
                            params: {
                                subAcctId: this.$store.getters['user/getSubAccountId'],
                            },
                        })) || {}
                    ).result || {}
            }
            this.user = user || {}
            const acctObj = this.$store.getters['user/getAccts']
            const isProfessional = getProfessionalStatus(acctObj.professionalType)
            if (isProfessional) {
                this.user.userIsPi = 1
            } else {
                this.user.userIsPi = 0
            }
            this.user.virtualAssetKnowledge = virtualAssetKnowledge
            console.log('init', 'virtualAssetKnowledge', virtualAssetKnowledge, this.user.virtualAssetKnowledge)
            this.match(user, this.fund)
        },

        onRestart() {
            this.initRiskAssessmentWatch()
            let addParams = '?isToResult=2'
            if (isInOutsideH5()) {
                // 睿银等站外H5加url参数测评完成后跳回原来页面
                const fundDetailPage = `${pathnames.VUE_APP_WEALTH_FUND_PAGE}detail`
                const fundNoMatchPage = `${pathnames.VUE_APP_WEALTH_FUND_PAGE}no-matched-risk`
                const url = this.$route.query.type === 'bills' ? fundNoMatchPage : fundDetailPage
                const urlParams = encodeURIComponent(this.$addCurParamsForUrl(url))
                addParams = `?isToResult=2&url=${urlParams}`
            }
            // isToResult 1 跳 2 不跳转
            this.handleEvaluate(this.$addCurParamsForUrl(pathnames.VUE_APP_RISK_PAGE + addParams), { replace: false })
        },

        match() {
            const res = this.user
            const fRes = this.fund
            const matchDerivative = res?.openDerivative === 1 && fRes.isDerivative === 1
            const matchRisk = res?.riskLevel >= fRes.riskRating
            const matchInvestObjective = res?.investmentObjective >= fRes.investObjective
            const matchInvestmentExperience = res?.investmentExperience >= fRes.investYear
            const matchIsPi = res?.userIsPi === 1 && fRes.isPi === 1
            const virtualAssetKnowledge = res?.virtualAssetKnowledge == 1 && fRes.virtualAssetKnowledge == 1
            this.matchRes = [matchDerivative, matchRisk, matchInvestObjective, matchInvestmentExperience, matchIsPi, virtualAssetKnowledge]
        },

        transform(key) {
            return this.$t(key)
        },

        initRiskAssessmentWatch() {
            if (this.$jsBridge) {
                this.$jsBridge.watchPageVisible(() => {
                    if (this.isDestoryWatch) return
                    this.init(true)
                })
            }
        },
        initRiskAssessmentWatchDestroy() {
            console.log('to destory riskassessment watch')
            this.isDestoryWatch = true
        },
    },

    beforeDestroy() {
        this.initRiskAssessmentWatchDestroy()
    },
}
</script>

<style scoped lang="less">
.no-matched-risk {
    min-height: 100vh;
    overflow: hidden;
    background-color: #f9f9f9;

    .header,
    .body {
        margin: 12px 12px 0;
        padding: 8px 12px;
        background: #fff;
        border-radius: 8px;
    }

    .row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        font-size: 14px;
        line-height: 20px;

        .label {
            color: #666;
        }

        .value {
            color: #2f2f2f;
        }

        .match-sty {
            color: green;
        }

        .red {
            color: #f31414;
        }
    }

    .body {
        padding-bottom: 0;
    }

    .table {
        display: flex;

        .col {
            li {
                padding: 10px 0;
                color: #2f2f2f;
                font-size: 14px;
                line-height: 20px;

                &:first-child {
                    padding: 4px 0;
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }

        .examine-title {
            flex: 1 0 90px;
        }

        .product-result {
            flex: 1 0 76px;
            margin-left: 16px;
        }

        .user {
            flex: 1 0 76px;
            margin-left: 12px;
        }

        .match-res {
            flex: 1 0 auto;
            margin-left: 9px;
            text-align: center;
        }
    }

    .footer {
        padding: 33px 28px 0;
    }

    .restart {
        width: 100%;
        padding: 0;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #ff6307;
        border: none;
        border-radius: 22.5px;
        outline: none;
    }
}
</style>
