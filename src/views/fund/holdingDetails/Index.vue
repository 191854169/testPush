<template>
    <div class="holding-detail">
        <div class="sticky">
            <header>
                <h4>{{ pubQuote.name }}</h4>
                <div class="info">
                    <p>
                        <span class="currency">{{ pubQuote.currency }}</span>
                        <span>ISIN:{{ pubQuote.ISIN }}</span>
                    </p>
                    <span>更新：{{ updateTime }}</span>
                </div>
            </header>
            <ul>
                <li class="head">
                    <span>名称</span>
                    <span>持仓数</span>
                    <span>持仓比例</span>
                </li>
            </ul>
        </div>
        <ul>
            <li v-for="(item, index) in pageList" :key="index" class="list-item">
                <span>{{ item.name }}</span>
                <span>{{ item.holdingNum | toTenThousand }}</span>
                <span>{{ item.rate }}%</span>
            </li>
        </ul>
        <footer>{{ $t('noMore') }}</footer>
    </div>
</template>
<script>
// apis
import { getHolding } from '@/apis/fund/fund.js'
import { getFundQuote } from '@/apis/fund/fund'

import NP from 'number-precision'
export default {
    data() {
        return {
            pageList: [], // 列表信息
            updateTime: '', // 更新时间
            symbol: '', //

            pubQuote: {}, //详情信息
        }
    },
    mounted() {
        this.symbol = this.$route.query.symbol
        this.initPage()
        this.getFundInfo()
    },
    filters: {
        toTenThousand(val) {
            if (val) {
                if (val >= 10000) {
                    return NP.round(val / 10000, 4).toFixed(2) + '万'
                }
                return val
            }
            return '--'
        },
    },
    methods: {
        async initPage() {
            const { result } = await getHolding({
                symbol: this.symbol,
                type: 'all',
                top: 9999,
            }).catch(() => {})

            this.pageList = result?.list || []
            this.updateTime = result?.updateTime || ''
        },
        /** 获取基金的信息 */
        async getFundInfo() {
            const { result } = await getFundQuote({
                symbol: this.symbol,
            }).catch(() => {})

            this.pubQuote = result?.pubQuote || {}
        },
    },
}
</script>
<style lang="less" scoped>
.holding-detail {
    min-height: 100vh;
    padding: 0 12px;
    background: #fff;
}

header {
    padding: 12px 0 14px;
    border-bottom: 0.5px solid #efefef;

    h4 {
        color: #2f2f2f;
        font-size: 16px;
        line-height: 22px;
    }

    .info {
        display: flex;
        justify-content: space-between;

        p,
        span {
            color: #9c9c9c;
            font-size: 12px;
        }

        p {
            padding-top: 2px;

            span {
                font-size: 10px;
                line-height: 12px;
            }
        }

        .currency {
            margin-right: 4px;
            padding: 1px 2px;
            color: #7933d9;
            font-weight: 500;
            font-size: 8px;
            background: #f6efff;
            border-radius: 2px;
            transform: scale(0.5);
        }
    }
}

.sticky {
    position: sticky;
    top: 0;
    z-index: 9999;
    background: #fff;
}

ul {
    li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-height: 56px;
        list-style: none;

        span {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin: 18px 0;
            font-weight: 400;
            font-size: 14px;
            text-align: right;

            &:first-child {
                justify-content: flex-start;
                min-width: 147px;
                max-width: 147px;
                text-align: left;
            }

            &:nth-child(2) {
                min-width: 92px;
                max-width: 92px;
            }
        }
    }

    .list-item {
        min-height: 56px;
        border-bottom: 0.5px solid #efefef;

        span {
            &:first-child {
                display: -webkit-box;
                overflow: hidden;
                font-size: 14px;
                line-height: 20px;
                white-space: normal;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                // @supports(-webkit-line-clamp:2) or (line-clamp:2){
                //     font-size: 12px;
                // }
            }
        }
    }

    .head {
        max-height: 28px;

        span {
            min-height: 28px;
            max-height: 28px;
            color: #9c9c9c;
            font-size: 12px;
        }
    }
}

footer {
    padding: 20px 0;
    color: #9c9c9c;
    font-size: 12px;
    text-align: center;
}
</style>
