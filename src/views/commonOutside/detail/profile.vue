<template>
    <!-- 资产总览 -->
    <div class="profile-container">
        <!-- 账户类型 -->
        <div class="head flex-c f14">
            <span class="mar-r12">{{ ACCOUNT_MAP[accts.type] }}</span>
            <span class="mar-r6">{{ showAsset ? accts.subAcctId : maskSubAccountId }}</span>
            <multi-img
                name="icon_copy"
                directory="commonOutside"
                class="icon-copy"
                :data-clipboard-text="accts.subAcctId"
                @click="onCopy"
            ></multi-img>
        </div>

        <!-- 资产净值label -->
        <div class="mar-t20">
            <div class="flex-c">
                <van-popover v-model="showPopover" trigger="click" :get-container="getCurrencyPopoverContainer">
                    <ul class="currency-card" @click.stop="updateCurrency">
                        <li
                            class="item"
                            :class="{ selected: item.value === currency }"
                            :data-key="item.value"
                            v-for="item in CURRENCY_LIST"
                            :key="item.value"
                        >
                            {{ item.text }}
                        </li>
                    </ul>
                    <template #reference>
                        <div class="flex-c">
                            <div class="flex-c f12 h2-white">
                                {{ $t('netAssetValue') }}
                                <div class="icon-circle"></div>
                                {{ CURRENCY_MAP[currency] }}
                            </div>
                            <multi-img name="icon_triggle" directory="commonOutside" class="icon-triggle"></multi-img>
                        </div>
                    </template>
                </van-popover>

                <multi-img
                    :name="showAsset ? 'icon_eye_open' : 'icon_eye_close'"
                    directory="commonOutside"
                    class="icon-eye"
                    @click="updateShowAsset"
                ></multi-img>
            </div>

            <!-- 资产净值-->
            <div
                class="f24 lh-34 c-main bold mar-t6"
                v-riseFall="{
                    value: assetsSummary.totalAssets[currency],
                    hide: !showAsset,
                    hideObj: { color: '#2F2F2F', text: '*****' },
                    sign: false,
                    riseFall: false,
                    rate: false,
                }"
            ></div>
        </div>
    </div>
</template>

<script>
import { Popover } from 'vant'
import { ACCOUNT_MAP, CURRENCY_MAP, CURRENCY_LIST } from '../config/common.js'
import { mapState } from 'vuex'
import Clipboard from 'clipboard'

export default {
    props: {
        assetsSummary: {
            type: Object,
            default: () => {},
        },
    },
    components: {
        [Popover.name]: Popover,
    },
    data() {
        return {
            ACCOUNT_MAP,
            CURRENCY_MAP,
            CURRENCY_LIST,
            showPopover: false, // 切换币种框显示与隐藏
        }
    },
    computed: {
        ...mapState('user', ['accts', 'currency', 'showAsset']),

        // 账户掩码
        maskSubAccountId() {
            const subAcctId = this.accts?.subAcctId
            const prefix = subAcctId.substring(0, 2)
            const suffix = subAcctId.substr(subAcctId.length - 4)
            return prefix + '***' + suffix
        },
    },
    methods: {
        // 指定切换货币下拉框挂载的节点
        getCurrencyPopoverContainer() {
            const dom = this.$refs.trigger
            return dom ? dom : document.querySelector('body')
        },

        // 复制账号
        onCopy() {
            const clipboard = new Clipboard('.icon-copy')
            clipboard.on('success', () => {
                this.$toast(this.$t('copySuccess'))
                clipboard.destroy()
            })
            clipboard.on('error', () => {
                clipboard.destroy()
            })
        },

        // 更新显示与隐藏的状态
        updateShowAsset() {
            this.$store.commit('user/updateShowAsset', !this.showAsset)
        },

        // 更新资产选择的币种
        updateCurrency(e) {
            this.showPopover = false
            this.$store.commit('user/updateCurrency', e.target.dataset.key)
        },
    },
}
</script>

<style lang="less" scoped>
.profile-container {
    margin-top: 12px;
    padding: 0 12px 16px;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;

    .head {
        height: 42px;
        box-shadow: 0 -0.5px 0 0 #efefef inset;
    }

    .icon-copy {
        width: 20px;
        height: 20px;
    }

    .icon-circle {
        width: 2px;
        height: 2px;
        margin: 0 4px;
        background: #666;
        border-radius: 39px;
    }

    .icon-triggle {
        width: 6px;
        height: 6px;
        margin-left: 5px;
    }

    .icon-eye {
        width: 16px;
        height: 16px;
        margin-left: 16px;
    }
}

.currency-card {
    width: 94px;
    overflow: hidden;
    border-radius: 4px;

    .item {
        font-size: 14px;
        line-height: 36px;
        text-align: center;

        #font_h1();
        #dialog_background();
        #box_shadow_2();

        &.selected {
            color: #ff6307;
        }
    }
}
</style>
