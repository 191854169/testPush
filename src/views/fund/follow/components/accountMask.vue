<template>
    <div class="mask" :class="isAllMask ? 'align-12' : ''" @click.stop="openAccount">
        <div class="flex-s main">
            <div>
                <div class="f14 mar-b4 c-main">{{ $t('follow.openCat') }}</div>
                <div class="f18 c-theme lh-26">{{ $t('follow.advantageInvest') }}</div>
            </div>
            <button class="button" @click="openAccount">{{ $t('follow.openText') }}</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'accountMask',
    props: {
        isAllMask: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        openAccount() {
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            if (!this.$root.getAccountStatus()) {
                return this.$root.nextAfterJudgeAccountStatus('openAccount')
            }
        },
    },
}
</script>

<style lang="less" scoped>
.lh-26 {
    line-height: 26px;
}

.mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.6);
    filter: blur(0);

    .main {
        width: 304px;
    }

    .button {
        width: 96px;
        height: 32px;
        color: #fff;
        font-weight: 500;
        font-size: 14px;
        line-height: 32px;
        background: #ff6907;
        border: none;
        border-radius: 31px;
        outline: none;
    }
}

.align-12 {
    right: -12px;
    left: -12px;
}
</style>
