<template>
    <div v-if="loaded" class="main">
        <div class="module">
            <div class="result-text">{{ $t('riskResult') }}</div>
            <h3 class="type-title">{{ typeText }}{{ $t('type') }}({{ resultData.riskLevel }}{{ $t('level') }})</h3>
            <multi-img
                class="icon-result"
                :name="`icon${resultData.riskLevel}`"
                :alt="`icon${resultData.riskLevel}`"
                directory="riskAssessment"
            ></multi-img>
            <p class="description">{{ description }}</p>
        </div>
        <ul class="list">
            <li class="header">
                <span class="item">{{ $t('specificCategories') }}</span>
                <span class="item">{{ $t('description') }}</span>
            </li>
            <li class="content" v-for="(item, key) in riskData" :key="key">
                <span class="item">{{ riskData[key]['text'] }}</span>
                <span class="item" v-if="key !== 'riskLevel'">{{ riskData[key][resultData[key]] || $t('notHave') }}</span>
                <span class="item" v-else>{{ typeText }}</span>
            </li>
        </ul>
        <van-button type="primary" class="btn btn-confirm" block size="normal" @click="handleComplete" v-if="showComplete">
            {{ $t('complete') }}
        </van-button>
        <van-button type="primary" class="btn btn-restart" block plain size="normal" @click="reEvaluate">{{ $t('reEvaluate') }}</van-button>
    </div>
</template>

<script>
import { UserRiskInfo } from '@/apis/riskAssessment.js'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { riskData } from './utils.js'
import { getQueryString } from '@/utils'
import { getRunEnv } from '@/utils/env.js'
import { Toast } from 'vant'
import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js'
import mixin from './mixin.js'
import { isInOutsideH5 } from '@/utils'
import pathnames from '@/config/H5Pathname'

export default {
    name: 'riskAssessment',
    mixins: [mixin, riskAssessmentMixin],
    data() {
        return {
            env: getRunEnv(), // 判断是否是网厅 1.自研App 2.网厅 3.站外H5 网厅不展示完成按钮

            riskData: Object.freeze(riskData),
            loaded: false,
            resultData: {},
        }
    },
    computed: {
        showComplete() {
            return this.env === 1 || this.isFromStarStock || isInOutsideH5()
        },
        typeText() {
            return this.riskData['riskLevel'][this.resultData?.riskLevel]?.type
        },
        description() {
            return this.riskData['riskLevel'][this.resultData?.riskLevel]?.description
        },
        subAcctId() {
            return this.$route.query.sub || this.$store.getters['user/getSubAccountId']
        },
        isFromStarStock() {
            // 来源是星股宝开户,同时携带url 展示按钮
            return ['starStock'].includes(this.$route.query.origin) && !!this.$route.query.url
        },
    },
    mounted() {
        console.log(getRunEnv(), 'env=>', this.$route.query)
        this.init()
    },
    methods: {
        init() {
            this.$store.commit('app/updateShowLoading', true)
            this.getUserRiskInfo()
        },

        // 获取测评结果数据
        getUserRiskInfo() {
            UserRiskInfo({
                params: {
                    subAcctId: this.subAcctId,
                },
            })
                .then(res => {
                    this.$store.commit('app/updateShowLoading', false)
                    this.loaded = true
                    this.resultData = res?.result
                })
                .catch(res => Toast(res?.error?.message))
        },

        // 点击完成
        handleComplete() {
            const url = getQueryString('url', true)
            const title = getQueryString('title', true)
            console.log('***risk-result****url*******=>', url)
            if (!url && isInOutsideH5()) {
                // 睿银h5正常情况都到url参数，防止意外，双保险
                this.$goPage(pathnames.VUE_APP_WEALTH_COMMONOUTSIDE_PAGE + '?activeTab=1')
                return
            }
            url ? this.goPage(url, title) : this.closePage(title)
        },
        closePage() {
            JSBridge ? JSBridge.close() : window.close()
        },
        reEvaluate() {
            console.log('8678676767676768')
            if (isInOutsideH5()) {
                const { VUE_APP_RISK_PAGE } = pathnames
                const queryObj = this.$route.query
                const newQueryStr = Object.entries(queryObj)
                    .map(item => item.join('='))
                    .join('&')
                const newUrl = `${VUE_APP_RISK_PAGE}start?${newQueryStr}`
                console.log('*************newUrl:', newUrl, newQueryStr)
                this.handleEvaluate(newUrl, { replace: true })
            } else {
                this.handleEvaluate()
            }
        },
    },
}
</script>

<style lang="less" scoped>
.main {
    height: 100%;
    padding-bottom: 32px;
    overflow: auto;
}

.module {
    margin: 16px;
    padding: 28px 12px;
    text-align: center;
    background: #fff;
    border-radius: 8px;

    .result-text {
        color: #666;
        font-size: 14px;
        line-height: 20px;
    }

    .type-title {
        margin-top: 4px;
        margin-bottom: -6px;
        color: @fontBlackColor;
        font-weight: 500;
        font-size: 32px;
        line-height: 45px;
    }

    .description {
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 23px;
        text-align: justify;
    }

    .icon-result {
        width: 136px;
        height: 136px;
        margin: -10px auto;
    }
}

.list {
    margin: 12px 16px 16px;
    padding: 12px 12px 0;
    background: #fff;
    border-radius: 8px;

    .header {
        height: 24px;
        line-height: 24px;

        .item {
            color: #9c9c9c;
            font-size: 12px;
        }
    }

    .content {
        height: 40px;
        line-height: 40px;

        .item {
            font-size: 14px;
        }
    }

    .header,
    .content {
        font-size: 0;

        .item {
            display: inline-block;
            width: 50%;
        }
    }
}

.btn {
    &:active::before {
        opacity: 0;
    }
}

.btn-confirm {
    width: 303px;
    height: 44px;
    margin: 40px auto 0;
    font-size: 16px;
    background-color: @theme;
    border: 0;
    border-radius: 22.5px;
}

.btn-restart {
    height: 52px;
    color: @theme;
    background: none;
    border: 0;
}
</style>
