<template>
    <van-popup class="popup" v-model="showPopup" position="bottom" overlay-class="cr_popupoverlay" @open="onOpen">
        <div class="popup-content">
            <van-picker
                show-toolbar
                :columns="columns"
                :default-index="columns.indexOf(defaultValue)"
                :item-height="'36px'"
                :visible-item-count="5"
                :title="$t('rebalancing.selectRatio')"
                :confirm-button-text="$t('confirm')"
                @confirm="onConfirm"
            >
                <template v-slot:cancel>
                    <multi-img class="cancel-btn" name="icon-cancel" directory="common" @click="showPopup = false" />
                </template>
            </van-picker>

            <div class="safe_footer"></div>
        </div>
    </van-popup>
</template>
<script>
import { Picker } from 'vant'

export default {
    name: 'changingRatioPopup',
    components: {
        [Picker.name]: Picker,
    },
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        defaultValue: {
            type: Number,
            default: 1,
        },
        max: {
            type: Number,
            default: 1,
        },
        min: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {}
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
        columns() {
            return Array.from({ length: this.max - this.min + 1 }, (_, i) => this.min + i)
        },
    },
    watch: {},
    methods: {
        onConfirm(value) {
            this.$emit('confirm', value)
        },
        onOpen() {},
    },
}
</script>
<style lang="less">
.cr_popupoverlay {
    background: rgba(0, 0, 0, 0.01);
}
</style>
<style scoped lang="less">
.popup {
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -4px 8px 0 #0000000d;
}

.popup-content {
    overflow: hidden;
    background: transparent;
    border-radius: 12px 12px 0 0;

    .cancel-btn {
        position: relative;
        width: 24px;
        height: 24px;
    }

    ::v-deep .van-picker__toolbar {
        margin-bottom: 20px;

        .van-picker__title {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
        }

        .van-picker__confirm {
            color: #ff6907;
            font-size: 14px;
            line-height: 20px;
        }
    }

    ::v-deep .van-picker__columns {
        position: relative;
        z-index: 1;
        background: #fff;

        .van-picker-column__item {
            color: #2f2f2f;
        }

        .van-picker__frame {
            z-index: -1;
            background: #f9f9f9;
            border-radius: 4px;
        }

        .van-hairline--top-bottom::after,
        .van-hairline-unset--top-bottom::after {
            border: none;
        }
    }

    .safe_footer {
        height: calc(36px + constant(safe-area-inset-bottom)); /* 兼容 iOS<11.2 */
        height: calc(36px + env(safe-area-inset-bottom)); /* 兼容iOS >= 11.2 */
        background: #fff;
    }
}
</style>
