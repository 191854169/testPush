<template>
    <div class="guide-container">
        <!-- 是否入金过 0-未标记 1-已标记 -->
        <div class="guide-card flex-s" v-if="accts.cashInStatus === 0">
            <!-- 即刻开始您的财富乘长之旅 -->
            <div class="flex-c">
                <multi-img name="icon_welcome" directory="commonOutside" class="icon"></multi-img>
                <div class="f14 c-main">{{ $t('guideDeposit') }}</div>
            </div>

            <!-- 存入资金 -->
            <div class="btn flex-c" @click="goDeposit">{{ $t('saveCapital') }}</div>
        </div>

        <!-- 引导只显示一个，优先级：存入资金 > 理财引导; 是否认购过理财产品 0-未购买 1-购买过 -->
        <div class="guide-card flex-s" v-else-if="accts.wealthProductSubStatus === 0">
            <!-- 精选全球理财产品 助您省心投资 -->
            <div class="flex-c">
                <multi-img name="icon_wealth" directory="commonOutside" class="icon"></multi-img>
                <div class="f14 c-main">{{ $t('guideNotBuyProduct') }}</div>
            </div>

            <!-- 去看看 -->
            <div class="btn flex-c" @click="goWealth">{{ $t('gotoSee') }}</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getLangType } from '@/utils/tools'

export default {
    computed: {
        ...mapState('user', ['accts']),
    },
    methods: {
        goDeposit() {
            const url = '/edda_app/?langType=' + getLangType()
            const origin = process.env.NODE_ENV === 'development' ? 'https://sit.mfosunhani.com' : location.origin
            this.$goPage(`${origin}${url}`)
        },

        // 跳转至理财页
        goWealth() {
            this.$emit('onChange', '2')
        },
    },
}
</script>

<style lang="less" scoped>
.guide-card {
    height: 56px;
    margin-top: 12px;
    padding: 0 12px;
    background: linear-gradient(90.12deg, #fff6e0 0.11%, #fffefd 61.07%, #fff 99.9%);
    border-radius: 8px;
    box-shadow: 0.5px 0.5px 0 0 #fff inset, 0.5px -0.5px 0 0 #fff inset;

    .icon {
        width: 32px;
        height: 32px;
        margin-right: 8px;
    }

    .btn {
        padding: 4px 12px;
        color: #fff;
        font-size: 14px;
        background: @theme;
        border-radius: 31px;
    }
}
</style>
