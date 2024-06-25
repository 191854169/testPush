<template>
    <!-- 风险水平 -->
    <div class="common-card">
        <div class="common-head flex-s">
            <div class="flex-c" @click="openPage">
                <div class="f16 c-main bold mar-r6">风险水平</div>
                <multi-img name="icon_about" directory="commonOutside" class="icon-about"></multi-img>
            </div>
            <div class="f12 c-gray">{{ CURRENCY_MAP[currency] }}</div>
        </div>

        <div class="common-content">
            <!-- 风险状态 -->
            <div class="item">
                <div>风险状态</div>
                <div :style="{ color: showAsset ? RISK_COLOR[assetsSummary.riskStatus] : '#2f2f2f' }">
                    {{ showAsset ? RISK_LEVEL[assetsSummary.riskStatus] || '--' : '****' }}
                </div>
            </div>

            <!-- 保证金比例 -->
            <div class="item">
                <div>保证金比例</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.marginRatio,
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                    }"
                ></div>
            </div>

            <!-- 追收保证金额 -->
            <div class="item">
                <div>追收保证金额</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.marginCallAmount[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 应收利息 -->
            <div class="item">
                <div>应收利息</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.accruedInterest[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { CURRENCY_MAP, RISK_LEVEL, RISK_COLOR } from '../config/common.js'
import { getLangType } from '@/utils/tools'

export default {
    props: {
        assetsSummary: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            CURRENCY_MAP,
            RISK_LEVEL,
            RISK_COLOR,
        }
    },
    computed: {
        ...mapState('user', ['currency', 'showAsset']),
    },
    methods: {
        openPage() {
            const url = 'https://h5.fotechwealth.com/faq/#/article/490712493934771200/1?langType=' + getLangType()
            this.$goPage(url)
        },
    },
}
</script>
