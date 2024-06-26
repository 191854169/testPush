<template>
    <van-dialog class="pi-guide" v-model="visible" :show-confirm-button="false">
        <template v-slot:title>
            <header class="title">{{ $t('piGuide.warmTip') }}</header>
        </template>
        <!-- 未申请,资产未达到800万 -->
        <template v-if="piStatus === 0">
            <p class="pi-desc">{{ $t('piGuide.eightMillionTip') }}</p>
            <div class="to_deposit_money">
                <label for="">{{ 'HK' }}$</label>
                <template v-for="(item, idx) in toDepositMoneyList">
                    <span v-if="item.isNumber" :key="idx" :class="{ number: item.isNumber }">{{ item.value }}</span>
                    <div :key="idx" v-else>
                        <multi-img name="douhao" directory="fund"></multi-img>
                    </div>
                </template>
            </div>
            <p class="tip">{{ $t('piGuide.calcMaybeDelay') }}</p>
            <footer>
                <button class="btn" @click="toPIPage">{{ $t('piGuide.uploadAssetFile') }}</button>
                <button class="btn" @click="deposit">{{ $t('piGuide.depositNow') }}</button>
            </footer>
            <multi-img class="close-icon" name="icon_close" directory="fund" @click="hide"></multi-img>
        </template>
        <!-- 未申请,资产达到800万 -->
        <template v-if="piStatus === 1">
            <p class="pi-desc">{{ $t('piGuide.invitationAuthenticate') }}</p>
            <button class="btn confirm" @click="toPIPage">{{ $t('piGuide.authenticateNow') }}</button>
            <button class="btn cancel" @click="hide">{{ $t('piGuide.cancel') }}</button>
        </template>
        <!-- 已申请，未审核 -->
        <template v-if="piStatus === 3">
            <p class="pi-desc">{{ $t('piGuide.viewApplyProcessingTip') }}</p>
            <button class="btn confirm" @click="toPIPage">{{ $t('piGuide.viewApplyProcessing') }}</button>
            <button class="btn cancel" @click="hide">{{ $t('piGuide.cancel') }}</button>
        </template>
    </van-dialog>
</template>

<script>
import { thousandsFilter } from '@/config/filters.js'
import pathnames from '@/config/H5Pathname.js'
import { CLIENT_TYPE } from '../../config/common'
// const NEED_TOTAL_MONEY = 8000000 // 需要八百万的资产
export default {
    name: 'pi-guide',
    data() {
        return {
            visible: true,
            // 000 - 第一位表示是否符合 第二位表示是否申请通过 第三位表示是否申请通过 （倒序
            // PI 状态 - 000(0)：资产不符合 001(1)：符合但未申请 011(3)：符合未通过
            piStatus: -1,
            curAssets: 0,
        }
    },
    computed: {
        TO_DEPOSIT_MONEY() {
            // return NEED_TOTAL_MONEY - this.curAssets
            return this.curAssets
        },
        toDepositMoneyList() {
            return thousandsFilter(this.TO_DEPOSIT_MONEY + '')
                .split('')
                .map(i => ({
                    value: i,
                    isNumber: /\d/.test(i),
                }))
        },
    },
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
                    this.curAssets = result?.assetGap || 0
                } else {
                    // 满足800w起点
                    piStatus = 1
                }
            }
            this.piStatus = piStatus
            return true
        },

        goPageWithH5(url, title = '') {
            const newUrl = this.$addCurParamsForUrl(url)
            console.log('newUrl-----------:', newUrl)
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(newUrl), title })
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
        // 入金
        deposit() {
            const { VUE_APP_EDDA_H5_APP } = pathnames
            const url = VUE_APP_EDDA_H5_APP
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
        font-size: 14px;
        line-height: 22px;
    }

    .to_deposit_money {
        display: flex;
        align-items: center;
        height: 43px;
        margin-top: 16px;
        padding: 0 18px;
        background: #fff2cc;
        border-radius: 26px;

        label {
            margin-right: 10px;
            color: #505050;
            font-weight: 600;
            font-size: 12px;
            line-height: 22px;
        }

        div,
        span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 26px;
            color: #ff6907;
            font-weight: 700;
            font-size: 24px;
        }

        .number {
            background: #ffe5b3;
            border-radius: 2px;
        }

        .number + .number {
            margin-left: 6px;
        }

        img {
            align-self: flex-end;
            width: 4.5px;
        }
    }

    .tip {
        margin-top: 18px;
        color: #9c9c9c;
        font-size: 14px;
        line-height: 20px;
    }

    footer {
        display: flex;
        justify-content: space-between;
        margin-top: 14px;

        .btn {
            width: 116px;
            background: linear-gradient(90deg, #ff8d07 0%, #ff6907 100%);

            &:last-child {
                background: linear-gradient(90.28deg, #ffa724 0.29%, #ffba07 99.82%);
            }
        }
    }

    .close-icon {
        position: absolute;
        bottom: -57px; // 32 + 25
        left: 50%;
        width: 32px;
        transform: translateX(-50%);
    }

    /* stylelint-disable-next-line no-duplicate-selectors */
    .btn {
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
}
</style>
