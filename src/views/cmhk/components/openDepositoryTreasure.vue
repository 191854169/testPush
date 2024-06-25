<!-- 开通定存宝 -->
<template>
    <div class="open-account-guide bg-white border-radius-8px mar-t12" @click="goPage">
        <div class="left">
            <h3 class="title">{{ $t('openDepositAccount') }}</h3>
            <p class="tip">{{ $t('openDepositAccountTips') }}</p>
            <button class="btn">{{ $t('soonOpen') }}</button>
        </div>
        <div class="right">
            <multi-img name="img_dcb" directory="cmhk"></multi-img>
        </div>
    </div>
</template>

<script>
export default {
    name: 'openCashAccount',
    methods: {
        goPage() {
            this.$goPage(`${location.origin}/wealth/fixedDepositTreasure.html#/about?open=1`)
        },
    },
}
</script>
<style scoped lang="less">
.open-account-guide {
    display: flex;
    justify-content: space-between;

    .left {
        margin: 20px 0 20px 26px;

        .title {
            font-weight: 700;
            font-size: 18px;
            line-height: 22px;
            #font_h1();
        }

        .tip {
            margin-top: 5px;
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
        margin: 31px 26px 0 0;

        img {
            width: 96px;
            height: 64px;
        }
    }
}
</style>
