<!-- 开通理财账户 -->
<template>
    <div class="open-account-guide bg-white border-radius-8px mar-t12" @click="goPage">
        <div class="left">
            <h3 class="title">{{ $t(isToUpdateFundAccount ? 'updateFundAccount' : 'openFundAccount') }}</h3>
            <p class="tip">{{ $t(isToUpdateFundAccount ? 'updateManagerAssets' : 'openManagerAssets') }}</p>
            <button class="btn">{{ $t('openBtn') }}</button>
        </div>
        <div class="right">
            <multi-img name="img_fund_account" directory="commonOutside"></multi-img>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    name: 'openFundAccount',
    computed: {
        ...mapState('user', ['accts']),
        isToUpdateFundAccount() {
            // 开通理财产品操作类型： 1：需开通； 2：升级 3：已开通
            const NEED_TO_UPDATE = 2
            return this.accts?.openWealthMarketAction === NEED_TO_UPDATE
        },
    },
    methods: {
        // 去开通理财账户页
        goPage() {
            this.$goPage('/', { path: encodeURIComponent(location.href) }, { pathname: '/pages/fundAccount.html' })
        },
    },
}
</script>
<style scoped lang="less">
.open-account-guide {
    display: flex;
    justify-content: space-between;

    .left {
        margin: 20px 0 16px 26px;

        .title {
            font-weight: 700;
            font-size: 18px;
            line-height: 22px;
            #font_h1();
        }

        .tip {
            margin-top: 6px;
            font-size: 12px;
            line-height: 18px;
            #font_h2();
        }

        .btn {
            margin-top: 12px;
            padding: 0 15px;
            font-weight: 700;
            font-size: 14px;
            line-height: 28px;
            text-align: center;
            border: none;
            border-radius: 35px;
            outline: none;
            #bg_theme();
            #button_font();
        }
    }

    .right {
        margin: 26px 24px 0 0;

        img {
            width: 109px;
            height: 82px;
        }
    }
}
</style>
