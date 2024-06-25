<template>
    <div class="follow-trade-description">
        <div class="desc card">
            <p class="desc-title">{{ $t('follow.tradeAmountDescTitle') }}</p>
            <p class="desc-content">{{ $t('follow.tradeAmountDescContent') }}</p>
        </div>
        <p class="tip">{{ $t('follow.tradeAccountTip') }}</p>

        <ul class="fund-list card" @click="goRulePage">
            <li class="fund-list_item relative-mask" v-for="item in investmentList" :key="item.symbol" :data-symbol="item.fundID">
                {{ item.name }}
                <multi-img name="icon_arrow_left_black" directory="fund"></multi-img>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'follow-trade-description',
    data() {
        return {
            investmentList: [],
        }
    },
    mounted() {
        let investmentList = localStorage.getItem('investmentList')
        investmentList = JSON.parse(investmentList || '[]')
        this.investmentList = investmentList
    },
    methods: {
        goRulePage(e) {
            const { symbol } = e.target.dataset || {}
            if (!symbol) return
            this.$router.push({
                path: '/trade-rule',
                query: {
                    symbol,
                    type: 'public',
                },
            })
        },
    },
}
</script>

<style scoped lang="less">
.follow-trade-description {
    padding: 12px;

    .card {
        overflow: hidden;
        background-color: #fff;
        border-radius: 8px;
    }

    .desc {
        padding: 16px 24px;
        background: #fff;

        &-title {
            color: @fontBlackColor;
            font-weight: 700;
            font-size: 16px;
            line-height: 16px;
        }

        &-content {
            margin-top: 12px;
            color: @fontBlackColor;
            font-size: 14px;
            line-height: 16px;
        }
    }

    .tip {
        padding: 16px 16px 8px;
        color: @fontGreyColor;
        font-size: 12px;
        line-height: 18px;
    }

    .fund-list {
        &_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 17px 24px;
            color: @fontBlackColor;
            font-size: 16px;
            line-height: 16px;
            background: #fff;
            box-shadow: inset -16px 0 0 #fff, inset 16px 0 0 #fff, inset 0 -0.5px 0 #efefef;

            img {
                width: 16px;
                height: 16px;
            }
        }

        &_item:last-of-type {
            box-shadow: none;
        }
    }
}
</style>
