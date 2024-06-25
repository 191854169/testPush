<template>
    <div class="fund-item">
        <div class="content">
            <van-checkbox class="check-box" icon-size="16" checked-color="#2F2F2F" v-model="check">
                <template v-slot:icon="{ checked }">
                    <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund"></multi-img>
                </template>
            </van-checkbox>
            <div class="fund-info" @click="onClick">
                <p class="name line-elipsis">{{ fundInfo.name }}</p>
                <p class="detail">
                    <span class="currency" :class="[`currency-${fundInfo.currency}`]"></span>
                    <span class="ISIN">{{ fundInfo.ISIN }}</span>
                    <span class="fund-type">{{ fundInfo.type | typeFiter }}</span>
                </p>
            </div>
        </div>
        <!-- <span class="fsfont next" @click="goDetail">&#xe609;</span> -->
    </div>
</template>
<script>
import { FUND_TYPE_MAP } from '@/views/fund/config/common.js'

const fundTypeMap = FUND_TYPE_MAP.keyValueMap

export default {
    name: 'fund-item',
    props: {
        fundInfo: {
            type: Object,
            default: () => ({}),
        },
        noCanSelect: {
            type: Boolean,
            default: false,
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
                return this.fundInfo.check
            },
            set(v) {
                this.$emit('check', {
                    value: v,
                    fundInfo: this.fundInfo,
                })
            },
        },
    },
    methods: {
        onClick() {
            this.check = !this.check
        },
        goDetail() {
            const symbol = this.fundInfo.symbol
            if (this.$jsBridge) {
                const url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${symbol}`
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `/detail`,
                    query: {
                        type: 'public',
                        symbol: symbol,
                    },
                })
            }
        },
    },
}
</script>
<style scoped lang="less">
.fund-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px 10px 0;
    box-shadow: inset 0 -0.5px 0 #efefef;

    .content {
        display: flex;
        align-items: center;

        /deep/ .check-box {
            .van-checkbox__icon {
                font-size: 16px !important;
            }
        }

        img {
            width: 16px;
            height: 16px;
        }

        .fund-info {
            display: flex;
            flex-direction: column;
            padding-left: 12px;

            .name {
                width: 310px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

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

                .fund-type {
                    position: relative;
                    margin-left: 5px;
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 10px;
                    line-height: 24px;
                }

                .fund-type::after {
                    position: absolute;
                    top: 8px;
                    left: -5px;
                    width: 1px;
                    height: 8px;
                    background-color: #9c9c9c;
                    transform: scaleX(0.5);
                    content: '';
                }
            }
        }
    }

    .next {
        color: #d8d8d8;
        font-size: 16px;
    }
}
</style>
