<template>
    <div class="holding card" id="holding">
        <header @click="goHoldingDetail">
            <h3 class="title">{{ $t('fundHolding') }}</h3>
            <multi-img name="icon_arrow_left" directory="fund"></multi-img>
        </header>

        <ul class="list" v-if="holdingList.length">
            <p class="update-time">{{ $t('updateTime') }}{{ updateTime | timeFilter }}</p>
            <p class="total-percentage">{{ $t('top10holdings') }}：{{ totalPercentage }}%</p>
            <li class="list-item" v-for="(item, index) in holdingList" :key="item.id" @click="gotoStock(item)">
                <h4 class="name">{{ `${item.name}${item.rawCode ? ' (' + item.rawCode + ')' : ''}` }}</h4>
                <div class="percentage">
                    <div class="line" :style="{ width: getWidthPercent(item.rate, holdingList), backgroundColor: bgColors[index] }"></div>
                    <div class="rate">{{ item.rate + '%' }}</div>
                </div>
            </li>
        </ul>
        <div class="no-data" v-else>
            <p>{{ $t('noData') }}</p>
        </div>
    </div>
</template>

<script>
import { getHolding } from '@/apis/fund/fund.js'
export default {
    name: 'holding',
    data() {
        return {
            updateTime: '',
            totalPercentage: 0,
            holdingList: [],
        }
    },
    computed: {
        bgColors() {
            const deepBlue = '#004DB3'
            const blue = '#3E92FF'
            const lightBlue = '#A8CBFF'
            return Array.from({ length: 10 }).map((_, index) => {
                if (index <= 0) return deepBlue
                if (index <= 3) return blue
                return lightBlue
            })
        },
    },
    filters: {
        timeFilter(v) {
            v = v || ''
            return v.replace(/-/g, '/') || '--'
        },
    },
    created() {
        this.init()
    },
    methods: {
        getWidthPercent(data, list) {
            const [first] = list
            const dealer = Number.parseFloat(data, 10) / Number.parseFloat(first.rate)
            const res = dealer * 100 + '%'
            const htmlFontSize = Number.parseFloat(document.getElementsByTagName('html')[0]?.style?.fontSize)
            if (!Number.isNaN(htmlFontSize)) {
                const width = window.screen.width - (0.48 + 0.43) * htmlFontSize
                const curWidth = width * dealer
                return curWidth < 16 ? '0.16rem' : res
            }
            return res
        },

        async init() {
            try {
                const params = {
                    symbol: this.$route.query.symbol,
                    type: 'top',
                }
                let { result } = (await getHolding(params)) || {}
                result = result || {}
                const list = result.list || []
                this.updateTime = result.updateTime
                this.holdingList = list
                this.totalPercentage = result.totalRate
            } catch (e) {
                console.error(e)
            }
        },

        gotoStock(data = {}) {
            if (this.$jsBridge) {
                if (data.isVisible) {
                    if (data.rawCode) {
                        this.$jsBridge.goPage(`stockQuote?stockId=${data.market}${data.rawCode}`)
                    }
                } else {
                    this.$toast(this.$t('noQuoteData'))
                }
            }
        },

        /** 跳转到全部持仓 */
        goHoldingDetail() {
            if (this.$jsBridge) {
                const url = `${location.origin}/wealth/fund.html#holdingDetails?symbol=${this.$route.query.symbol}`
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: 'holdingDetails',
                    query: {
                        symbol: this.$route.query.symbol,
                    },
                })
            }
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px;
    padding: 8px 0 24px;
    background: #fff;
    border-radius: 8px;
}

.holding {
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        img {
            width: 36px; // 12
            height: 16px;
            padding: 2px 12px;
        }
    }

    .title {
        padding: 0 12px;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    .update-time {
        margin: 9px 0;
        padding: 0 12px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
    }

    .total-percentage {
        margin: 16px 0 12px;
        padding: 0 12px;
        font-weight: 500;
        font-size: 12px;
    }

    .list {
        &-item {
            padding: 4px 12px;

            &:active {
                background: rgba(62, 146, 255, 0.08);
            }

            &:not(:first-child) {
                margin-top: 8px;
            }

            .name {
                color: #2f2f2f;
                font-size: 12px;
                line-height: 16px;
            }

            .percentage {
                display: flex;
                align-items: center;
                margin-top: 2px;

                .line {
                    flex: 0 1 auto;
                    height: 8px;
                    background: #3e92ff;
                    border-radius: 0 4px 4px 0;
                }

                .rate {
                    flex: 0 0 auto;
                    width: 43px;
                    margin-left: 4px;
                    color: #2f2f2f;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }
    }

    .no-data {
        p {
            margin: 96px 0 72px;
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }
}
</style>
