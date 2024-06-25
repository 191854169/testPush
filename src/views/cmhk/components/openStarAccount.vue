<!-- 开通星财宝 -->
<template>
    <div class="open-account-guide bg-white border-radius-8px mar-t12" @click="goPage">
        <div class="left">
            <h3 class="title">{{ $t('openStarTreasure') }}</h3>
            <p class="tip">{{ $t('openStarTreasureTips') }}</p>
            <button class="btn">{{ $t('soonOpen') }}</button>
        </div>
        <div class="right">
            <multi-img name="img_xcb" directory="cmhk"></multi-img>
        </div>
    </div>
</template>

<script>
export default {
    name: 'openStarAccount',
    methods: {
        // 去开通理财账户页
        goPage() {
            this.$goPage(`${location.origin}/wealth/cashBox.html#/beforeSign`)
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
        margin: 22px 23px 0 0;

        img {
            width: 100px;
            height: 80px;
        }
    }
}
</style>
