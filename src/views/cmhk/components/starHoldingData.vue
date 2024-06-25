<template>
    <div class="bg-white border-radius-8px pad-rl12 mar-t12">
        <div class="flex-s pad-t16 pad-b8">
            <div class="f16 font-bold">{{ $t('cashBox') }}({{ holdDataList.length }})</div>
            <div class="flex-c lh-16 f12" @click="goPage('autoDeal')">
                <multi-img name="icon_setup" directory="cmhk" width="16" height="16" class="mar-r6"></multi-img>
                <div class="c-main">{{ $t('autoTradeSetting') }}</div>
            </div>
        </div>
        <div class="flex-middle h-28 c-gray f12" v-if="holdDataList.length">
            <div class="align-l flex1">{{ $t('productName') }}</div>
            <div class="align-r w-78 nowrap titleItem" @click="sortHandler('marketValue')">
                <span>{{ $t('amount') }}/{{ $t('yesterdaysEarnings') }}</span>
                <div class="caret-wrapper">
                    <i class="sort-up" :class="{ 'sort-up__active': sortMap['marketValue'] === 'asc' }" />
                    <i class="sort-down" :class="{ 'sort-down__active': sortMap['marketValue'] === 'desc' }" />
                </div>
            </div>
            <div class="align-r w-96 titleItem" @click="sortHandler('profitloss')">
                <span>{{ $t('holdingProfit') }}</span>
                <div class="caret-wrapper">
                    <i class="sort-up" :class="{ 'sort-up__active': sortMap['profitloss'] === 'asc' }" />
                    <i class="sort-down" :class="{ 'sort-down__active': sortMap['profitloss'] === 'desc' }" />
                </div>
            </div>
        </div>
        <div class="holdings-list pad-b8">
            <div class="h-56 flex-middle" v-for="(item, index) in filterDataList" :key="index">
                <div class="align-l flex1">
                    <template v-if="showAssets">
                        <div class="w-146 elipsis f16 lh-22">{{ item.fundName }}</div>
                        <div class="fund-info">
                            <div class="fund-info_currency" :class="[`currency-${item.currency}`]"></div>
                            <span class="fund-info_isin">ISIN:{{ item.isin }}</span>
                        </div>
                    </template>
                    <template v-else>*****</template>
                </div>
                <div class="align-r w-78">
                    <div
                        class="f14 lh-20"
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
                    <div
                        class="f12 lh-16 mar-t2"
                        v-if="showAssets"
                        v-riseFall="{
                            value: item.yesterdayProfitloss,
                            rate: false,
                            thousand: true,
                            normal: true,
                            hide: !showAssets,
                            hideObj: { color: '#2F2F2F', text: '****' },
                        }"
                    ></div>
                </div>
                <div class="align-r w-96">
                    <div
                        class="f14"
                        v-riseFall="{
                            value: item.profitloss,
                            rate: false,
                            thousand: true,
                            normal: true,
                            hide: !showAssets,
                            hideObj: { color: '#2F2F2F', text: '****' },
                        }"
                    ></div>
                </div>
            </div>
            <div class="more" v-if="holdDataList.length > 5" @click="goPage('starOrderList')">{{ $t('loadingMore') }}</div>
        </div>
        <div class="empty-main align-c" v-if="!holdDataList.length">
            <multi-img name="noHold" directory="common" width="104" height="104" />
            <div class="f12 c-gray mar-t12">{{ $t('noHoldings') }}</div>
            <button class="btn mar-t12" @click="goPage('starPage')">{{ $t('checkItOut') }}</button>
        </div>
    </div>
</template>

<script>
import NP from 'number-precision'

export default {
    name: 'starHoldingData',
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
            filterDataList: [],
            sortMap: {
                marketValue: 'desc',
                profitloss: 'none',
            },
        }
    },
    watch: {
        holdDataList: {
            handler(val) {
                this.filterDataList = [...val].slice(0, 5)
                this.sortMap.marketValue = 'desc'
                this.sortMap.profitloss = 'none'
            },
            immediate: true,
        },
    },
    methods: {
        goPage(type) {
            this.$parent.goPage(type)
        },

        // 设置排序排序
        setSortMap(key, type) {
            if (key in this.sortMap && ['asc', 'desc', 'none'].includes(type)) {
                this.sortMap[key] = type
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

.h-56 {
    height: 56px;
}

.w-78 {
    width: 78px;
}

.w-96 {
    width: 96px;
}

.w-146 {
    width: 146px;
}

.pad-t16 {
    padding-top: 16px;
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
    height: 14px;
    margin-top: 2px;

    .fund-info_currency {
        margin-top: 2px;
        margin-right: 5px;
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
</style>
