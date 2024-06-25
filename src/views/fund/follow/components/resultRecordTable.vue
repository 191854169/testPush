<template>
    <div class="table">
        <div class="row head">
            <div class="width-70">{{ $t('follow.directionStatus') }}</div>
            <div class="width-110">{{ $t('follow.nameCode') }}</div>
            <div class="text-right width-60" v-if="isFund">{{ $t('follow.quantityAmount') }}</div>
            <div class="text-right width-60" v-else>{{ $t('follow.quantityPrice') }}</div>
            <div class="text-right width-80">{{ $t('trade.xdsj') }}</div>
        </div>
        <div
            class="row-item"
            :class="cindex === order.length - 1 && order.length < 5 ? 'pb-12' : 'border-bottom-1px'"
            v-for="(item, cindex) in showList"
            :key="cindex"
            @click="toAppRecords"
        >
            <div class="grid1">
                <span class="buy width-70">{{ item.optType === 2 ? $t('redeem') : $t('subscribe') }}</span>
                <span class="width-110 text-ellipsis">{{ item.productName }}</span>
                <span class="text-right width-50">{{ item.quantity }}</span>
                <span class="text-right width-80">{{ item.orderTime.split(' ')[0].slice(2).replace(/-/g, '/') }}</span>
            </div>
            <div class="grid2">
                <div class="grid-bottom flex-c width-70" v-if="!isFund">
                    <multi-img
                        width="12"
                        height="12"
                        v-if="item.orderStatus !== 70 && statusMap[item.orderStatus]"
                        :name="statusMap[item.orderStatus]"
                        directory="common/orderStatus"
                    ></multi-img>
                    {{ statusText[item.orderStatus] || '--' }}
                </div>
                <div class="grid-bottom flex-c width-70" v-if="isFund">
                    <multi-img
                        width="12"
                        height="12"
                        v-if="![2, 6].includes(item.orderStatus) && fundStatusMap[item.orderStatus]"
                        :name="fundStatusMap[item.orderStatus]"
                        directory="common/orderStatus"
                    ></multi-img>
                    {{ fundStatusText[item.orderStatus] || '--' }}
                </div>
                <div class="flex-c width-110">
                    <div :class="`market currency-${currency}`" v-if="isFund"></div>

                    <div :class="`market market-${marketMap[portfolioType]}`" v-else />
                    <div class="stock-code">{{ item.productCode }}</div>
                </div>
                <div class="grid-bottom width-50 text-right" v-if="isFund">{{ item.amount }}</div>
                <div class="grid-bottom width-50 text-right" v-else>{{ item.price }}</div>
                <div class="grid-bottom width-80 text-right">{{ item.orderTime.split(' ')[1] }}</div>
            </div>
        </div>
        <div class="operator-btn" v-if="order.length > 4" @click="isShowAll = !isShowAll">
            <multi-img
                :class="!isShowAll ? 'arrow-bottom' : 'arrow-top'"
                width="12"
                height="12"
                name="icon_arrow_left"
                directory="fund"
                alt="icon_arrow_left"
                verifyTheme
            ></multi-img>
        </div>
    </div>
</template>

<script>
import { PORTFOLIO_TYPE_MAP } from '../../config/common'
export default {
    props: {
        order: {
            type: Array,
            default() {
                return []
            },
        },
        currency: {
            type: String,
            default: 'HKD',
        },
        portfolioType: {
            type: Number,
            default: 1,
        },
    },
    computed: {
        isFund() {
            return this.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        showList() {
            return this.order.length > 4 && !this.isShowAll ? this.order.slice(0, 4) : this.order
        },
    },
    data() {
        return {
            isShowAll: false,
            statusMap: {
                10: 'icon-wait',
                20: 'icon-wait',
                40: 'icon-wait',
                50: 'icon-success',
                60: 'icon-success',
                70: this.$t('trade.yichedan'),
                80: 'icon-success',
                90: 'icon-error',
            },
            statusText: {
                10: this.$t('follow.waitText'),
                20: this.$t('follow.waitText'),
                40: this.$t('follow.waitText'),
                50: this.$t('follow.successText'),
                60: this.$t('follow.successText'),
                70: this.$t('trade.yichedan'),
                80: this.$t('follow.successText'),
                90: this.$t('trade.xiadanshibai'),
            },
            fundStatusText: {
                1: this.$t('trade.daishouli'),
                2: this.$t('trade.yichedan'),
                3: this.$t('trade.yishouli'),
                5: this.$t('trade.querenjine'),
                6: this.$t('trade.yizhongzhi'),
                7: this.$t('trade.yiwancheng'),
            },
            fundStatusMap: {
                1: 'icon-queuing',
                2: this.$t('trade.yichedan'),
                3: 'icon-success',
                5: 'icon-wait',
                6: '已终止',
                7: 'icon-success',
            },
            marketMap: {
                1: 'HK',
                2: 'US',
            },
        }
    },
    methods: {
        toAppRecords() {
            if (this.isFund) {
                this.$router.push('/order-list')
            } else {
                if (this.$jsBridge) {
                    this.$jsBridge.goPage('orderRecord')
                }
            }
        },
    },
}
</script>

<style lang="less" scoped>
.record-page {
    .pb-12 {
        margin-bottom: 12px;
    }

    .record-content {
        padding: 0 12px;

        .com-item {
            margin-top: 12px;
            padding: 0 12px;
            background: #fff;
            border-radius: 8px;

            .title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                // padding-bottom: 12px;
                height: 48px;

                .title-left {
                    display: flex;
                    align-items: center;

                    .name {
                        margin-left: 6px;
                        color: #2f2f2f;
                        font-size: 15px;
                    }
                }
            }

            .row {
                display: flex;
                justify-content: space-between;
            }

            .head {
                color: #9c9c9c;
                // padding-top: 12px;
                font-weight: 400;
                font-size: 12px;
                line-height: 28px;
            }

            .text-right {
                display: inline-block;
                text-align: right;
            }

            .text-ellipsis {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .width-50 {
                width: 50px;
            }

            .width-60 {
                width: 60px;
            }

            .width-70 {
                width: 70px;
            }

            .width-80 {
                width: 80px;
            }

            .width-110 {
                width: 110px;
            }

            .row-item {
                display: flex;
                flex-direction: column;
                justify-content: center;
                // margin-top: 16px;
                // padding-bottom: 12px;
                height: 60px;

                .grid1,
                .grid2 {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .grid2 {
                    margin-top: 4px;
                }

                span {
                    display: inline-block;
                    margin-bottom: 4px;
                    color: #2f2f2f;
                    font-size: 14px;
                }

                .grid-bottom {
                    color: #9c9c9c;
                    font-size: 12px;

                    img {
                        margin-right: 4px;
                    }
                }

                .market {
                    margin-right: 4px;
                }

                .stock-code {
                    color: #9c9c9c;
                    // padding-top: 4px;
                    font-size: 12px;
                }

                .buy {
                    display: inline-block;
                    color: #ff6907;
                    font-weight: 400;
                    font-style: normal;
                }
            }
        }

        .operator-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 40px;
        }

        .arrow-bottom {
            transform: rotate(90deg);
        }

        .arrow-top {
            transform: rotate(-90deg);
        }
    }

    .empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 351px;
        height: 244px;
        margin: 0 auto;
        margin-top: 12px;
        background: #fff;
        border-radius: 8px;

        img {
            width: 103px;
            height: 103px;
            margin-bottom: 8px;
        }

        .text {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
        }
    }
}
</style>
