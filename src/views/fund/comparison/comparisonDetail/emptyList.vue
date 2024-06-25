<template>
    <div class="empty-list">
        <div class="content">
            <multi-img name="empty-status" directory="common" />
            <p>{{ $t('compare.noSelectFund') }}</p>
            <button class="btn" @click="goSelect">{{ $t('compare.selectFund') }}</button>
        </div>
    </div>
</template>
<script>
import { isTHSApp } from '@/utils/tools.js'
export default {
    name: 'emptyList',
    methods: {
        goSelect() {
            if (this.$jsBridge) {
                this.$jsBridge.close()
            } else if (isTHSApp()) {
                // eslint-disable-next-line no-undef
                callNativeHandler('goback', { type: 'component' })
            } else if (this.$thsI18NJsBridge.isTHSI18NApp()) {
                this.$thsI18NJsBridge.goBack()
            } else {
                // TODO: 目前基金对比无站外环境 返回到选择基金页站外还需确认调整
                this.$router.push({
                    path: '/select-fund',
                })
            }
        },
    },
}
</script>
<style scoped lang="less">
.empty-list {
    height: 100%;
    padding-top: 144px;
    background-color: #fff;

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        img {
            width: 104px;
            height: 104px;
        }

        p {
            padding: 12px 0 16px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        button {
            height: 32px;
            padding: 0 27px;
            color: #ff6907;
            font-weight: 400;
            font-size: 14px;
            line-height: 32px;
            text-align: center;
            background: rgba(255, 105, 7, 0.1);
            border-width: 0;
            border-radius: 32px;
        }
    }
}
</style>
