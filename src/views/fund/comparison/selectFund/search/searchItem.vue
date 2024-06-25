<template>
    <div class="search-item">
        <van-checkbox class="check-box" checked-color="#2F2F2F" v-model="check">
            <template v-slot:icon="{ checked }">
                <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund"></multi-img>
            </template>
        </van-checkbox>
        <div class="item-desc" @click="onClick">
            <div class="item-name line-elipsis" v-html="colorName(item.name)"></div>
            <div class="item-info">
                <div class="item-info__currency" :class="[`currency-${item.currency}`]"></div>
                <span class="item-info__symbol" v-html="colorName(item.ISIN)"></span>
                <span class="item-info__type">{{ item.type | fundTypeFilter }}</span>
            </div>
        </div>
    </div>
</template>
<script>
import { FUND_TYPE_MAP } from '@/views/fund/config/common.js'

const FUND_TYPE_ENUM = FUND_TYPE_MAP.keyValueMap
export default {
    name: 'searchItem',
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        value: {
            // 搜索字段
            type: String,
            default: '',
        },
    },
    filters: {
        fundTypeFilter(key) {
            return FUND_TYPE_ENUM[key] || ''
        },
    },
    computed: {
        check: {
            get() {
                return this.item.check
            },
            set(v) {
                this.$emit('check', v, this.item)
            },
        },
    },
    methods: {
        onClick() {
            this.check = !this.check
        },
        // 搜索文字
        colorName(name) {
            const upperName = name ? name.toLocaleUpperCase() : ''
            if (upperName && upperName.includes(this.value.toLocaleUpperCase())) {
                const startIndex = upperName.indexOf(this.value.toLocaleUpperCase())
                const endIndex = startIndex + this.value.length
                const fragment = name.slice(startIndex, endIndex)
                const list = name.split(fragment)
                const result = list.join(`<span style="color: #FF6907;">${fragment}</span>`)
                return result
            }
            return `<span>${name}</span>`
        },
        clickHander(item) {
            const symbol = item.symbol
            if (this.$jsBridge) {
                const url = `${location.origin}/wealth/fund.html#/detail?type=public&symbol=${symbol}`
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: `/detail`,
                    query: {
                        type: 'public',
                        symbol,
                    },
                })
            }
        },
    },
}
</script>
<style scoped lang="less">
.search-item {
    img {
        width: 16px;
        height: 16px;
    }

    /deep/ .check-box {
        .van-checkbox__icon {
            font-size: 16px !important;
        }
    }

    .item-desc {
        flex: 1;
        width: 100%;
        padding-left: 12px;

        .item-name {
            flex: 0 0;
            max-width: 310px;
            height: 22px;
            overflow: hidden;
            color: #1f1f1f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            white-space: nowrap;
            text-overflow: ellipsis;
        }

        .item-info {
            display: flex;
            align-items: center;
            height: 12px;
            margin-top: 2px;
            font-weight: 400;
            font-size: 10px;
            line-height: 12px;

            .item-info__currency {
                margin-right: 5px;
            }

            .item-info__symbol {
                display: inline-block;
                color: #9c9c9c;
            }

            .item-info__type {
                position: relative;
                z-index: 1;
                margin-left: 9px;
                color: #9c9c9c;
            }

            .item-info__type::after {
                position: absolute;
                top: 2px;
                left: -5px;
                width: 1px;
                height: 8px;
                background-color: #9c9c9c;
                transform: scaleX(0.5);
                content: '';
            }
        }
    }

    .next {
        color: #d8d8d8;
        font-size: 16px;
    }
}
</style>
