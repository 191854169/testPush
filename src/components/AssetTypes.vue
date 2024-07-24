<template>
    <van-popup class="outter-popup" v-model="showPopup" position="bottom">
        <div class="outter-popup-content">
            <div class="header">
                <multi-img name="icon-cancel" directory="common" @click="showPopup = false" />
                <span>{{ $t('chooseAsset') }}</span>
            </div>
            <ul @click="activeHandler($event)" class="list">
                <li class="list-item" v-for="item in list" :class="{ 'current-active': item.key === type }" :key="item.key" :data-key="item.key">
                    <multi-img :name="`icon_${item.icon}`" directory="fund/order-list" />
                    <p>{{ item.label }}</p>
                </li>
            </ul>
        </div>
    </van-popup>
</template>

<script>
import { i18n } from '@/i18n/fund/index.js'
export default {
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        typeKey: {
            type: String,
            default: 'all',
        },
        isAssetType: {
            // 区分资产类别还是产品类别 另类(票据)：资产类别=>8,产品类别=>4
            type: Boolean,
            default: false,
        },
    },
    computed: {
        showPopup: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        type: {
            get() {
                return this.typeKey
            },
            set(v) {
                this.$emit('on-change', v)
                this.close()
            },
        },
        list() {
            return [
                {
                    label: i18n.t('allProduct'),
                    key: 'all',
                    icon: 'all',
                },
                {
                    label: i18n.t('cashBox'),
                    key: '9',
                    icon: 'cashbox',
                },
                {
                    label: i18n.t('publicFund'),
                    key: '1',
                    icon: 'publicFund',
                },
                // {
                //     label: i18n.t('privateFund'),
                //     key: '2',
                //     icon: 'privateFund',
                // },
                // {
                //     label: i18n.t('bond'),
                //     key: '3',
                //     icon: 'bond',
                // },
                // {
                //     label: i18n.t('alterInvestment'),
                //     key: this.isAssetType ? '8' : '4',
                //     icon: 'alterinvestment',
                // },
            ]
        },
    },
    methods: {
        activeHandler(e) {
            const key = e.target.dataset.key
            if (!key) return
            this.type = key
        },

        open() {
            this.showPopup = true
        },

        close() {
            this.showPopup = false
        },
    },
}
</script>

<style lang="less" scoped>
.outter-popup {
    border-radius: 12px 12px 0 0;
}

/deep/ .outter-popup-content {
    .header {
        display: flex;
        align-items: center;
        padding: 11px 16px 9px;

        img {
            width: 24px;
            margin-right: 116px;
        }

        span {
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
        }
    }

    .list {
        padding: 0 8px 98px;

        &-item {
            display: flex;
            align-items: center;
            padding: 20px 16px;

            &.current-active {
                background: @tabBackground;
                border-radius: 8px;
            }

            img {
                width: 24px;
                margin-right: 12px;
                pointer-events: none;
            }

            p {
                color: #000;
                font-size: 16px;
                line-height: 22px;
                pointer-events: none;
            }
        }
    }
}
</style>
