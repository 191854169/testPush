<template>
    <van-popup class="popup" v-model="showPopup" position="bottom" @closed="onClosed">
        <div class="popup-content">
            <div class="header">
                <multi-img class="cancel-btn" name="icon-cancel" directory="common" @click="clickCancel" />
                <span>{{ $t('followOrder.selectOrderTypeTitle') }}</span>
            </div>

            <div class="content">
                <van-radio-group v-model="type">
                    <div class="item" @click.stop="type = 1">
                        <p>{{ $t('followOrder.selectNum') }}</p>
                        <van-radio class="check-box" icon-size="14" checked-color="#2F2F2F" :name="1" value="">
                            <template v-slot:icon="{ checked }">
                                <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund"></multi-img>
                            </template>
                        </van-radio>
                    </div>
                    <div class="item" @click.stop="type = 2">
                        <p>{{ $t('followOrder.inputAmount') }}</p>
                        <van-radio class="check-box" icon-size="14" checked-color="#2F2F2F" :name="2" value="">
                            <template v-slot:icon="{ checked }">
                                <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund"></multi-img>
                            </template>
                        </van-radio>
                    </div>
                </van-radio-group>

                <p class="btn" @click="confirmHandle">{{ $t('followOrder.confirm') }}</p>
            </div>
        </div>
    </van-popup>
</template>
<script>
export default {
    name: 'orderTypeSwitch',
    components: {},
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        buyType: {
            type: Number,
            default: 1,
        },
    },
    data() {
        return {
            type: 1,
        }
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
        checkNum: {
            get() {
                return this.buyType == 1
            },
            set(v) {
                if (v) {
                    this.$emit('update:buyType', 1)
                }
            },
        },
        checkAmount: {
            get() {
                return this.buyType == 2
            },
            set(v) {
                if (v) {
                    this.$emit('update:buyType', 2)
                }
            },
        },
    },
    created() {
        this.type = this.buyType
    },
    methods: {
        confirmHandle() {
            this.$emit('confirm', this.type)
            this.showPopup = false
        },
        clickCancel() {
            this.showPopup = false
        },

        onClosed() {
            this.type = this.buyType
        },
    },
}
</script>
<style scoped lang="less">
.popup {
    border-radius: 12px 12px 0 0;
}

.popup-content {
    height: 361px;
    overflow: hidden;
    background: #fff;
    border-radius: 12px 12px 0 0;

    .header {
        position: sticky;
        top: 0;
        padding: 0 12px;
        padding-bottom: 8px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;

        .cancel-btn {
            position: absolute;
            top: 10px;
            left: 17px;
            width: 24px;
            height: 24px;
        }
    }

    .content {
        .item {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            height: 70px;
            margin: 20px 12px 0;
            padding: 0 16px;
            color: #000;
            font-weight: bold;
            font-size: 16px;
            border: 1px solid #e8e8e8;
            border-radius: 8px;

            /deep/ .check-box {
                .van-radio__icon {
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }

    .btn {
        align-content: center;
        height: 44px;
        margin: 45px 28px;
        padding-top: 12px;
        color: #fff;
        font-weight: bold;
        font-size: 16px;
        text-align: center;
        background-color: #ff6907;
        border-radius: 31px;
    }
}
</style>
