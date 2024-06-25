<template>
    <div class="follow-order-list">
        <header class="list-header">
            <ul class="list-header__column">
                <li>{{ $t('productName') }}</li>
                <li>{{ $t('follow.amountCurrency') }}</li>
                <li>{{ $t('bills.submitTime') }}</li>
            </ul>
        </header>
        <ul class="list-content">
            <van-pull-refresh
                class="refresh-content"
                v-model="isLoading"
                @refresh="onRefresh"
                :pulling-text="$t('pullRefresh')"
                :loosing-text="$t('relessRefresh')"
                :loading-text="`${$t('loading')}...`"
            >
                <template slot="loading">
                    <div class="loading-text">
                        <multi-img class="loading-icon" width="20" height="20" name="icon-footer-loading" directory="fund" />
                        <span>{{ `${$t('loading')}...` }}</span>
                    </div>
                </template>
                <div class="container">
                    <div>
                        <li
                            class="list-content__item"
                            :class="{ 'border-bottom-1px': index != list.length - 1 }"
                            v-for="(item, index) in list"
                            :key="index"
                            @click="onClickList(item.orderId)"
                        >
                            <div class="row-col">
                                <p class="opt-type elipsis">{{ item.parentProductName }}</p>
                                <p class="order-status">
                                    <multi-img :name="tradeStatusIconMap[item.orderStatus]" directory="common/orderStatus"></multi-img>
                                    <span>{{ item.orderStatus | tradeStatusTextFilter }}</span>
                                </p>
                            </div>
                            <div class="row-col align-r">
                                <p class="f14 lh-20 mar-b4">{{ item.applyAmount | amountFilter }}</p>
                                <p class="f12 lh-16 c-gray">{{ item.currency | currencyFilter }}</p>
                            </div>
                            <div class="row-col align-r">
                                <p class="f14 lh-20 mar-b4">{{ item.submitTime | dateFilter }}</p>
                                <p class="f12 lh-16 c-gray">{{ item.submitTime | timeFilter }}</p>
                            </div>
                        </li>
                    </div>
                    <div class="legal-tip">{{ $t('customBillListLegalTip') }}</div>
                </div>
            </van-pull-refresh>
        </ul>
    </div>
</template>
<script>
import { PullRefresh } from 'vant'
// import { i18n } from '@/i18n/fund'
import dayjs from 'dayjs'
import { CURRENCY_MAP, BILL_CUSTOMIZE_STATUS_MAP } from '@/views/fund/config/common'
import { thousandsFilter } from '@/config/filters'

// const $t = text => i18n.t(text)

const tradeStatusKeyValueMap = BILL_CUSTOMIZE_STATUS_MAP.keyValueMap

const tradeStatusIconMap = {
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.pending]: 'icon-queuing',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.accepted]: 'icon-wait',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.unconfirm]: 'icon-unconfirm',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.declined]: 'icon-fail',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.rejected]: 'icon-error',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.canceled]: 'icon-canceled',
    [BILL_CUSTOMIZE_STATUS_MAP.keysMap.completed]: 'icon-success',
}
export default {
    name: 'orderList',
    components: {
        [PullRefresh.name]: PullRefresh,
    },
    props: {
        list: {
            type: Array,
            required: true,
        },
    },
    filters: {
        tradeStatusTextFilter(v) {
            return tradeStatusKeyValueMap[v] || '--'
        },
        currencyFilter(v) {
            return CURRENCY_MAP.keyValueMap[v] || '--'
        },
        dateFilter(v) {
            return v ? dayjs(v).format('YY/MM/DD') : ''
        },
        timeFilter(v) {
            return v ? dayjs(v).format('HH:mm:ss') : ''
        },
        amountFilter(v) {
            return v ? thousandsFilter(v) : '--'
        },
    },
    data() {
        return {
            isLoading: false,
            tradeStatusIconMap,
        }
    },
    mounted() {},
    methods: {
        onClickList(orderId) {
            this.$router.push({
                path: '/bill-customize-detail',
                query: {
                    orderId,
                },
            })
        },
        onRefresh() {
            this.isLoading = true
            this.$emit('refresh', () => {
                this.isLoading = false
            })
        },
    },
}
</script>
<style scoped lang="less">
.follow-order-list {
    position: relative;
    height: 100%;
    border-radius: 8px;

    .list-header {
        padding: 0 12px;
        background: #fff;
        border-radius: 8px 8px 0 0;

        &__column {
            display: flex;
            justify-content: flex-start;
            padding: 12px 0 0;

            & > li {
                height: 16px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
            }

            li:nth-of-type(1) {
                width: 160px;
            }

            li:nth-of-type(2) {
                width: 98px;
                text-align: right;
            }

            li:nth-of-type(3) {
                width: 90px;
                text-align: right;
            }
        }
    }

    .list-content {
        height: calc(100% - 28px);

        .refresh-content {
            height: 100%;
            overflow-y: scroll;

            /deep/ .loading-text {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                min-height: 20px;

                .loading-icon {
                    margin-right: 12px;
                    animation: circle 1.5s infinite linear;
                }

                span {
                    display: inline-block;
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            @keyframes circle {
                0% {
                    transform: rotate(0deg);
                }

                25% {
                    transform: rotate(90deg);
                }

                50% {
                    transform: rotate(180deg);
                }

                75% {
                    transform: rotate(270deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }
        }

        li {
            display: flex;
            padding: 12px;
            background: #fff;

            &:last-child {
                border-radius: 0 0 8px 8px;
            }
        }

        .row-col {
            display: flex;
            flex-direction: column;
            justify-content: center;

            &:nth-of-type(1) {
                width: 160px;
            }

            &:nth-of-type(2) {
                width: 98px;
                text-align: right;
            }

            &:nth-of-type(3) {
                width: 90px;
                text-align: right;
            }

            & > p {
                width: 100%;
            }

            .opt-type {
                width: 156px;
                margin-bottom: 4px;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }

            .order-status {
                display: flex;
                align-items: center;
                color: #9c9c9c;
                font-weight: 500;
                font-size: 12px;
                line-height: 16px;

                img {
                    width: 12px;
                    height: 12px;
                    margin-right: 3px;
                }
            }
        }

        .row-col:nth-of-type(1),
        .row-col:nth-of-type(2) {
            align-items: flex-end;
        }
    }

    .container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 100%;
    }

    .legal-tip {
        right: 0;
        bottom: 0;
        left: 0;
        flex: 0 0 auto;
        height: 42px;
        padding: 12px 0;
        color: @fontGreyColor;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
    }
}
</style>
