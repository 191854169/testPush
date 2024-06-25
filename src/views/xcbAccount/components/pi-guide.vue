<template>
    <van-dialog class="pi-guide" v-model="visible" :show-confirm-button="false">
        <template v-slot:title>
            <header class="title">{{ $t('sweetTip') }}</header>
        </template>
        <!-- 未申请,资产达到800万 -->
        <!-- 未申请,资产未达到800万 -->
        <template v-if="piStatus === 0 || piStatus === 1">
            <p class="pi-desc">{{ $t('piGuide.eightMillionTip') }}</p>
            <button class="btn confirm" @click="toPIPage">{{ $t('piGuide.authenticateNow') }}</button>
            <button class="btn cancel" @click="hide">{{ $t('cancel') }}</button>
        </template>
        <!-- 已申请，未审核 -->
        <template v-if="piStatus === 3">
            <p class="pi-desc">{{ $t('piGuide.viewApplyProcessingTip') }}</p>
            <button class="btn confirm" @click="toPIPage">{{ $t('piGuide.viewApplyProcessing') }}</button>
            <button class="btn cancel" @click="hide">{{ $t('cancel') }}</button>
        </template>
    </van-dialog>
</template>

<script>
import pathnames from '@/config/H5Pathname.js'
import { CLIENT_TYPE } from '@/config/common.js'

export default {
    name: 'pi-guide',
    data() {
        return {
            visible: true,
            // 000 - 第一位表示是否符合 第二位表示是否申请通过 第三位表示是否申请通过 （倒序
            // PI 状态 - 000(0)：资产不符合 001(1)：符合但未申请 011(3)：符合未通过
            piStatus: -1,
        }
    },
    computed: {},
    created() {},
    methods: {
        show(result) {
            // 每次打开都应再次请求
            if (!this.getPiStatus(result)) return
            // 先处理数据再打开弹框
            this.visible = true
        },

        hide() {
            this.visible = false
        },

        getPiStatus(result) {
            let piStatus = undefined
            const { status } = result
            // 大于0已提交过申请，600.终止，700.过期,100,待提交，需要重新申请
            if (status > 0 && !(status == 600 || status == 700 || status == 100)) {
                piStatus = 3
            } else {
                const ASSET_MATCH_EIGHT_MILLION = 1 // 资产是否达到800万
                const isMatchEightMillion = result?.assetFlag === ASSET_MATCH_EIGHT_MILLION
                const isCorporate = [CLIENT_TYPE.CLIENT_CORPORATE].includes(result?.clientType)
                if (isCorporate) {
                    this.toPIPage()
                    return false
                }
                if (!isMatchEightMillion) {
                    // 资产没达到pi的800起点
                    piStatus = 0
                } else {
                    // 满足800w起点
                    piStatus = 1
                }
            }
            this.piStatus = piStatus
            return true
        },

        goPageWithH5(url, title = '') {
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title })
            } else {
                location.href = url
            }
        },
        // 查看进度, 立即认证,上传证明
        toPIPage() {
            const url = pathnames.VUE_APP_PI_APPLY
            this.hide()
            this.goPageWithH5(url)
        },
    },
}
</script>

<style lang="less">
.pi-guide {
    width: 280px;
    padding: 17px 16px 24px;
    overflow: initial;
}
</style>

<style scoped lang="less">
.pi-guide {
    .btn {
        display: block;
        width: 100%;
        color: #fff;
        font-weight: 500;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        border: none;
        border-radius: 22px;
        outline: none;

        &.confirm {
            margin-top: 28px;
            background: #ff6907;
        }

        &.cancel {
            margin-top: 12px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
            background: #fff;
        }
    }

    .title {
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        text-align: center;
    }

    .pi-desc {
        margin-top: 17px;
        color: #2f2f2f;
        line-height: 22px;
    }
}
</style>
