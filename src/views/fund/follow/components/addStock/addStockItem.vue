<template>
    <div class="content" @click="onClick">
        <div class="stock-item" v-if="type === 'stock'">
            <!-- <p class="name line-elipsis">{{ itemInfo.name }}</p>
                <p class="detail">
                    <span class="mkt" :class="[`currency-${itemInfo.currency}`]">{{ itemInfo.mkt }}</span>
                    <span class="rawSymbol">{{ itemInfo.rawSymbol }}</span>
                </p> -->
            <div class="stock-name line-elipsis" v-html="changeColor(itemInfo.name, value)"></div>
            <div class="stock-info">
                <div class="stock-info__market" :class="[`market-${itemInfo.mkt.toLocaleUpperCase()}`]"></div>
                <div class="stock-info__symbol" v-html="changeColor(itemInfo.rawSymbol, value)"></div>
            </div>
        </div>
        <div class="fund-info" v-else>
            <p class="name line-elipsis">{{ itemInfo.name }}</p>
            <p class="detail">
                <span class="currency" :class="[`currency-${itemInfo.currency}`]"></span>
                <span class="ISIN">{{ itemInfo.ISIN }}</span>
                <span class="fund-type-divide"></span>
                <span class="fund-type">{{ itemInfo.fundType | typeFiter }}</span>
            </p>
        </div>
        <van-checkbox class="check-box" icon-size="16" checked-color="#2F2F2F" v-model="check">
            <template v-slot:icon="{ checked }">
                <multi-img
                    :name="!itemInfo.cancelable ? 'icon_agreement_unable' : checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                    directory="fund"
                ></multi-img>
            </template>
        </van-checkbox>
    </div>
</template>
<script>
import { FUND_TYPE_MAP } from '@/views/fund/config/common.js'
import { strColorChange } from '@/utils/tools'
import { Toast } from 'vant'

const fundTypeMap = FUND_TYPE_MAP.keyValueMap

export default {
    name: 'fund-item',
    props: {
        type: {
            type: String,
            default: 'stock',
        },
        itemInfo: {
            type: Object,
            default: () => ({}),
        },
        noCanSelect: {
            type: Boolean,
            default: false,
        },
        value: {
            // 搜索字段
            type: String,
            default: '',
        },
    },
    filters: {
        typeFiter: function (v) {
            return fundTypeMap[v] || ''
        },
    },
    data() {
        return {}
    },
    computed: {
        check: {
            get() {
                return this.itemInfo.check
            },
            set(v) {
                if (!this.itemInfo.cancelable) {
                    Toast(this.$t('follow.cannotDelete'))
                } else {
                    // this.check = !this.check
                    this.itemInfo.check = v
                    this.$emit('check', {
                        value: v,
                        itemInfo: this.itemInfo,
                    })
                }
            },
        },
    },
    methods: {
        onClick() {
            this.check = !this.check
        },

        // 修改颜色
        changeColor(origin, match) {
            return strColorChange(origin, match)
        },
    },
}
</script>
<style scoped lang="less">
.content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    box-shadow: inset 0 -0.5px 0 #efefef;

    /deep/ .check-box {
        .van-checkbox__icon {
            font-size: 16px !important;
        }
    }

    img {
        width: 16px;
        height: 16px;
    }

    .name {
        width: 310px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }

    .stock-item {
        display: flex;
        flex-direction: column;

        .stock-name {
            margin-bottom: 2px;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
            line-height: 22px;
        }

        .stock-info {
            display: flex;
            align-items: center;

            &__market {
                width: 14px;
                height: 12px;
            }

            &__symbol {
                margin-left: 4px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 10px;
                line-height: 12px;
            }
        }
    }

    .fund-info {
        display: flex;
        flex-direction: column;

        .detail {
            display: flex;
            align-items: center;
            padding-top: 4px;

            .currency {
                display: inline-block;
            }

            .ISIN {
                padding: 0 4px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 10px;
                line-height: 24px;
            }

            .fund-type-divide {
                width: 0.5px;
                height: 8px;
                background-color: #9c9c9c;
            }

            .fund-type {
                margin-left: 5px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 10px;
                line-height: 24px;
            }
        }
    }

    .next {
        color: #d8d8d8;
        font-size: 16px;
    }
}
</style>
