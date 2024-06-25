// 资产统计
<template>
    <div class="asset-total">
        <van-popover v-model="currencySwitch" :trigger="disableChange ? '' : 'click'" :get-container="getCurrencyPopoverContainer">
            <ul class="currency-list" @click="onChoose">
                <li class="item" :class="{ selected: item.value === currency }" :data-key="item.value" v-for="item in currencyList" :key="item.value">
                    {{ item.text }}
                </li>
            </ul>
            <template #reference>
                <h4>
                    <span>{{ assetMsg }}</span>
                    <span>·{{ currency | currencyFilter(currencyList) }}</span>
                    <template v-if="!disableChange">
                        <multi-img class="trigger" name="angle_trigger" directory="fund" alt="select"></multi-img>
                    </template>
                    <div ref="trigger" class="trigger-container"></div>
                    <multi-img v-if="showEye" class="arrow" @click.stop="triggerHandler" :name="iconEye" directory="fund"></multi-img>
                    <multi-img v-if="showPI" class="pi" :name="iconPI" directory="investmentMigration"></multi-img>
                </h4>
            </template>
        </van-popover>
        <h3>
            <span v-show="showAssets">
                <span v-show="showUpdate">{{ $t('updating') }}</span>
                <span
                    v-show="!showUpdate"
                    v-riseFall="{ value: amount, rate: false, sign: sign, thousand: true, riseFall: riseFall, normal: true }"
                ></span>
            </span>
            <span v-show="!showAssets">*****</span>
        </h3>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import { isInOutsideH5 } from '@/utils'
import { getValueFromLocalStorage } from '@/utils'
import { WEALTH_AMOUNT_STATUS_kEY } from '@/config/common'
const USD = 'USD'
const HKD = 'HKD'
const CNH = 'CNH'

export default {
    name: 'assetTotal',
    props: {
        showPI: {
            type: Boolean,
            default: false,
        },
        showEye: {
            type: Boolean,
            default: true,
        },
        // 描述信息
        assetMsg: {
            type: String,
            default: '',
        },
        // 展示人民币
        showCn: {
            type: Boolean,
            default: true,
        },
        // 金额
        amount: {
            type: [String, Number],
            default: '',
        },
        // 币种
        currency: {
            type: String,
            default: '',
        },
        // 带涨跌色
        riseFall: {
            type: Boolean,
            default: true,
        },
        // 带 + - 号
        sign: {
            type: Boolean,
            default: true,
        },
        // 是否显示更新中
        showUpdateIncome: {
            type: Boolean,
            default: false,
        },
        // 是否禁止掉货币选择功能
        disableChange: {
            type: Boolean,
            default: false,
        },
    },
    filters: {
        currencyFilter(v, list) {
            console.log('currencyFilter', v, list)
            return ((list || []).find(i => i.value === v) || {}).text
        },
    },
    data() {
        return {
            currencySwitch: false,
            showAssets: true,
            iconPI: 'icon_PI',
        }
    },
    computed: {
        // 睿银资产显示与隐藏状态
        ...mapState('user', ['showAsset']),

        // 判断是否在睿银
        isInOutside() {
            return isInOutsideH5()
        },
        iconEye() {
            return this.showAssets ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
        currencyList() {
            const base = [
                { value: HKD, text: this.$t('HKD') },
                { value: USD, text: this.$t('USD') },
            ]
            this.showCn && base.push({ value: CNH, text: this.$t('CNH') })
            return base
        },
        showUpdate() {
            return this.showUpdateIncome && !this.amount
        },
    },
    created() {
        if (this.showEye) {
            if (this.$jsBridge) {
                this.$jsBridge.getAssetsShowStatus().then(data => {
                    this.showAssets = data
                })
            } else if (this.isInOutside) {
                // 睿银项目中，星财宝与资产首页显示与隐藏状态保持一致
                this.showAssets = this.showAsset
            } else {
                this.showAssets = getValueFromLocalStorage(WEALTH_AMOUNT_STATUS_kEY, true, true)
                localStorage.setItem(WEALTH_AMOUNT_STATUS_kEY, this.showAssets)
            }
        }
    },
    methods: {
        triggerHandler() {
            this.showAssets = !this.showAssets
            if (this.$jsBridge) {
                this.$jsBridge.setAssetsShowStatus({ showAssets: this.showAssets })
            } else if (this.isInOutside) {
                // 睿银项目中，更改显示与隐藏状态
                this.$store.commit('user/updateShowAsset', this.showAssets)
            } else {
                localStorage.setItem(WEALTH_AMOUNT_STATUS_kEY, this.showAssets)
            }
            this.$emit('showAssetsHandler', this.showAssets)
        },

        onChoose(e) {
            const currency = e.target.dataset.key
            this.$emit('choose', currency)
        },

        getCurrencyPopoverContainer() {
            const triggerDom = this.$refs.trigger
            return triggerDom ? triggerDom : document.querySelector('body')
        },
    },
}
</script>
<style scoped lang="less">
.trigger-container {
    position: relative;

    /deep/ .van-popover {
        top: 0 !important;
        left: 0 !important;
        transform: translate3d(calc(-50% - 3px), 15px, 0) !important;

        .van-popover__content {
            box-shadow: 0 -1px 10px rgba(50, 50, 51, 0.15);
        }
    }
}

.currency-list {
    width: 94px;
    overflow: hidden;
    border-radius: 4px;

    .item {
        color: #2f2f2f;
        font-size: 14px;
        line-height: 36px;
        text-align: center;
        background: #fff;
        box-shadow: inset 0 -0.5px 0 #efefef;

        &.selected {
            color: #ff6307;
        }
    }
}

.asset-total {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0;
    text-align: center;
    background: #fff;
    border-radius: 8px;

    h4 {
        display: flex;
        align-items: center;
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 20px;

        .arrow {
            width: 16px;
            height: 16px;
            margin-left: 16px;
        }

        .trigger {
            width: 6px;
            height: 6px;
            margin-left: 4px;
        }

        .pi {
            width: 20px;
            height: 20px;
            margin-left: 12px;
        }
    }

    h3 {
        margin: 0;
        margin-top: 10px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 24px;
        line-height: 34px;
    }
}
</style>
