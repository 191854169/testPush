<template>
    <div class="main">
        <multi-img class="assessment-pic" name="assessment_pic" alt="assessment_pic" directory="riskAssessment"></multi-img>
        <h5 class="sub-title">{{ $t('riskAssessemnt') }}</h5>
        <p class="description">{{ $t('riskDescripiton') }}</p>
        <van-button type="primary" class="button" block size="normal" @click="handleStart">{{ $t('riskStartBtn') }}</van-button>
    </div>
</template>

<script>
import mixin from './mixin.js'
import { getQueryString } from '@/utils'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { getRunEnv } from '@/utils/env.js'

export default {
    name: 'riskAssessment',
    mixins: [mixin, riskAssessmentMixin],
    mounted() {},
    beforeRouteEnter(to, from, next) {
        next(async function (vm) {
            // isToResult:是否需要根据测评状态跳结果页。选填，1为跳，2为不跳
            const isToResult = getQueryString('isToResult', true)
            if (isToResult == 2) {
                return
            }
            const data = await vm.getAssessStatus()
            const { isAssessed, isExpired } = data?.result
            // 判断是否是网厅 1.自研App 2.网厅 3.站外H5
            const isApp = getRunEnv() === 1
            // isAssessed是否已经评测，1，是，2，否
            // isExpired是否评测过期，1，是，2，否
            // 已测评未过期，跳至结果页
            if (isAssessed == 1 && isExpired == 2) {
                const url = getQueryString('url', true)
                const title = getQueryString('title', true)
                const origin = getQueryString('origin', true)
                console.log('****risk-index***url*******=>', url)
                url ? vm.$router.replace({ name: 'result', query: { url, title, origin } }) : vm.$router.replace({ name: 'result' })
            }
        })
    },
    methods: {
        handleStart() {
            const url = getQueryString('url', true)
            const title = getQueryString('title', true)
            const origin = getQueryString('origin', true)
            // type、symbol 瑞银站外测评完成后返回产品详情用
            const type = getQueryString('type', true)
            const symbol = getQueryString('symbol', true)
            console.log('****risk-handleStart***url*******=>', url)
            url
                ? this.$router.replace({ name: 'start', query: { url, title, origin } })
                : this.$router.replace({ name: 'start', query: { type, symbol } })
        },
    },
}
</script>

<style lang="less" scoped>
.main {
    margin: 16px;
    padding: 34px 12px 32px;
    text-align: center;
    background: #fff;
    border-radius: 8px;

    .sub-title {
        margin: 10px 0 12px;
        color: @fontBlackColor;
        font-weight: 500;
        font-size: 24px;
    }

    .description {
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 23px;
        text-align: justify;
    }

    .assessment-pic {
        width: 110px;
        height: 110px;
    }

    .button {
        width: 303px;
        height: 44px;
        margin: 36px auto 0;
        font-size: 16px;
        background-color: @theme;
        border: 0;
        border-radius: 22.5px;
    }
}
</style>
