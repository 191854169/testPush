<template>
    <div class="bg-white border-radius-8px pad-rl12 mar-t12">
        <div class="flex-s pad-t16 pad-b8">
            <div class="f16 font-bold">{{ $t('depositoryTreasureName') }}({{ holdDataList.length }})</div>
        </div>
        <div class="flex-middle h-28 c-gray f12" v-if="holdDataList.length">
            <div class="align-l flex1">{{ $t('productExpirationDate') }}</div>
            <div class="align-r w-78 nowrap titleItem" @click="sortHandler('marketValue')">
                <span>{{ $t('holdPrincipal') }}</span>
                <div class="caret-wrapper">
                    <i class="sort-up" :class="{ 'sort-up__active': sortMap['marketValue'] === 'asc' }" />
                    <i class="sort-down" :class="{ 'sort-down__active': sortMap['marketValue'] === 'desc' }" />
                </div>
            </div>
            <div class="align-r w-102 titleItem" @click="sortHandler('actualInterest')">
                <span>{{ $t('interestDue') }}</span>
                <div class="caret-wrapper">
                    <i class="sort-up" :class="{ 'sort-up__active': sortMap['actualInterest'] === 'asc' }" />
                    <i class="sort-down" :class="{ 'sort-down__active': sortMap['actualInterest'] === 'desc' }" />
                </div>
            </div>
        </div>
        <div class="holdings-list pad-b8">
            <div class="h-60 item flex-middle" v-for="item in filterDataList" :key="item.orderNumber" @click="handleClick(item)">
                <div class="align-l flex1">
                    <template v-if="showAssets">
                        <div class="w-146 elipsis f16 lh-22">{{ item.productName }}</div>
                        <div class="fund-info">
                            <div class="fund-info_currency" :class="[`currency-${item.currency}`]"></div>
                            <span class="fund-info_isin">{{ $t('expirationDate') }}{{ item.maturityTime | fulleDateFilter }}</span>
                        </div>
                    </template>
                    <template v-else>*****</template>
                </div>
                <div class="align-r w-78">
                    <div
                        class="f14 w-78 line-elipsis"
                        :class="{ 'lh-20': showAssets }"
                        ref="marketValueDom"
                        v-riseFall="{
                            value: item.marketValue,
                            sign: false,
                            riseFall: false,
                            rate: false,
                            thousand: true,
                            normal: true,
                            hide: !showAssets,
                            hideObj: { color: '#2F2F2F', text: '****' },
                        }"
                    ></div>
                    <div class="lh-16 f12 c-gray mar-t2" v-if="showAssets"></div>
                </div>
                <div class="align-r w-102">
                    <div class="f14 lh-22" v-if="showAssets">
                        <!-- 订单已提交，显示利息确认中 -->
                        <span v-if="item.orderStatus == statusKeys.submitted">{{ $t('interestConfirmation') }}</span>
                        <span
                            v-else
                            v-riseFall="{
                                value: item.actualInterest,
                                sign: false,
                                riseFall: false,
                                rate: false,
                                thousand: true,
                                normal: true,
                                hide: !showAssets,
                                hideObj: { color: '#2F2F2F', text: '****' },
                            }"
                        ></span>
                    </div>
                    <div class="f14" v-else>{{ '****' }}</div>
                    <div class="lh-16 f12 c-gray mar-t2" v-if="showAssets">{{ statusKeyValue[item.orderStatus] }}</div>
                </div>
            </div>
            <div class="more" v-if="holdDataList.length > 5" @click="goPage('depositTreasurePage')">{{ $t('loadingMore') }}</div>
        </div>
        <div class="empty-main align-c" v-if="!holdDataList.length">
            <multi-img name="noHold" directory="common" width="104" height="104" />
            <div class="f12 c-gray mar-t12">{{ $t('notHeld') }}</div>
            <button class="btn mar-t12" @click="goPage('depositTreasurePage')">{{ $t('checkItOut') }}</button>
        </div>
    </div>
</template>

<script>
import NP from 'number-precision'
import dayjs from 'dayjs'
import { ORDER_STATUS_MAP } from '@/views/cmhk/config/common.js'
import { dynamicFontSize } from '@/utils/utils'
const statusKeyValue = ORDER_STATUS_MAP.keyValueMap

export default {
    name: 'cashHoldingData',
    props: {
        holdDataList: {
            type: Array,
            default: () => [],
        },
        showAssets: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            filterDataList: [...this.holdDataList],
            sortMap: {
                marketValue: 'desc',
                actualInterest: 'none',
            },
            statusKeyValue,
            statusKeys: ORDER_STATUS_MAP.keysMap,
        }
    },
    filters: {
        fulleDateFilter(v) {
            return v ? dayjs(v).format('YYYY/MM/DD') : ''
        },
    },
    watch: {
        holdDataList: {
            handler(val) {
                this.filterDataList = [...val].slice(0, 5)
                this.sortMap.marketValue = 'desc'
                this.sortMap.actualInterest = 'none'
            },
            immediate: true,
        },
        showAssets: {
            handler(val) {
                const options = val ? { reduce: true, increase: false, minFontSize: 8 } : { reduce: false, increase: true, minFontSize: 14 }
                this.dynamicFontSizeFn(options)
            },
            immediate: true,
        },
    },
    methods: {
        dynamicFontSizeFn(options = { minFontSize: 8 }) {
            this.$nextTick(() => {
                this.$refs.marketValueDom &&
                    this.$refs.marketValueDom.forEach(item => {
                        dynamicFontSize({ ...options, maxFontSize: 14, dom: item, context: this })
                    })
            })
        },
        goPage(type) {
            this.$parent.goPage(type)
        },

        handleClick(item) {
            this.$goPage(`${location.origin}/wealth/fixedDepositTreasure.html#/holding-detail?orderNumber=${item.orderNumber}`)
        },

        // 设置排序排序
        setSortMap(key, type) {
            if (key in this.sortMap && ['asc', 'desc', 'none'].includes(type)) {
                this.sortMap[key] = type
                this.filterDataList = [...this.holdDataList].slice(0, 5)
                //  利息都为确认中，则按默认接口返回的顺序排
                const isAll = this.filterDataList.every(item => item.orderStatus == this.statusKeys.submitted)
                if (key == 'actualInterest' && isAll) {
                    return
                }
                // 个别利息确认中，放最后;
                const isSome = this.filterDataList.some(item => item.orderStatus == this.statusKeys.submitted)
                if (key == 'actualInterest' && !isAll && isSome) {
                    const arr1 = []
                    const arr2 = []
                    this.filterDataList.forEach(item => {
                        if (item.orderStatus == this.statusKeys.submitted || [null, undefined, '', NaN].includes(item.actualInterest)) {
                            arr1.push(item)
                        } else {
                            arr2.push(item)
                        }
                    })
                    arr2.sort((a, b) => {
                        const i = a[key]
                        const j = b[key]
                        return type === 'asc' ? NP.minus(i - j) : NP.minus(j - i)
                    })
                    this.filterDataList = [...arr2, ...arr1]
                    return
                }

                this.filterDataList.sort((a, b) => {
                    const i = a[key]
                    const j = b[key]
                    return type === 'asc' ? NP.minus(i - j) : NP.minus(j - i)
                })
            }
        },
        sortHandler(key) {
            if (!this.sortMap[key]) return
            let type = ''
            switch (this.sortMap[key]) {
                case 'none':
                    type = 'desc'
                    break
                case 'desc':
                    type = 'asc'
                    break
                case 'asc':
                    type = 'desc'
                    break
                default:
                    type = 'none'
                    break
            }
            Object.keys(this.sortMap).forEach(k => {
                this.sortMap[k] = 'none'
            })
            this.setSortMap(key, type)
            this.$emit('sort', key, type)
        },
    },
}
</script>

<style lang="less" scoped>
.h-28 {
    height: 28px;
}

.h-60 {
    height: 60px;
}

.w-78 {
    width: 78px;
}

.w-102 {
    width: 102px;
}

.w-124 {
    width: 124px;
}

.w-146 {
    width: 146px;
}

.pad-t16 {
    padding-top: 16px;
}

.mar-t2 {
    margin-top: 2px;
}

.font-bold {
    font-weight: 500;
}

.more {
    box-sizing: content-box;
    height: 20px;
    padding: 10px 0 2px;
    color: #666;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
}

.empty-main {
    padding: 32px 0;

    .btn {
        padding: 0 20px;
        color: #ff6907;
        font-weight: 500;
        font-size: 14px;
        line-height: 32px;
        text-align: center;
        background: rgba(255, 105, 7, 0.07);
        border: none;
        border-radius: 32px;
        outline: none;
    }
}

.fund-info {
    display: flex;
    align-items: center;
    height: 16px;
    margin-top: 2px;

    .fund-info_currency {
        margin-right: 5px;
        // margin-top: 2px;
    }

    .fund-info_isin {
        display: flex;
        flex-direction: row;
        align-items: center;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 14px;

        .isSelfSelect {
            width: 8px;
            height: 8px;
            margin-left: 5px;
        }
    }
}

.titleItem {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;

    .caret-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 6px;
        margin-left: 4px;

        .sort-box {
            background-repeat: no-repeat;
            background-position: center;
            background-size: 100%;
        }

        .sort-up {
            .sort-box();

            width: 6px;
            height: 5px;
            margin-bottom: 1px;
            background-image: url('~@/assets/images/common/sort-up.png');
        }

        .sort-up__active {
            background-image: url('~@/assets/images/common/sort-up__active.png');
        }

        .sort-down {
            .sort-box();

            width: 6px;
            height: 5px;
            margin-top: 1px;
            background-image: url('~@/assets/images/common/sort-down.png');
        }

        .sort-down__active {
            background-image: url('~@/assets/images/common/sort-down__active.png');
        }
    }
}

.holdings-list {
    .item {
        align-items: flex-start;
        box-sizing: border-box;
        padding-top: 10px;
    }
}
</style>
