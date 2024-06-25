<template>
    <div class="product-item">
        <section class="header" @click="gotoFundDetail(item)">
            <div class="header-left">
                <div class="name">
                    {{ item.fundName || '' }}
                </div>
                <div class="currency">
                    <div :class="`currency-${item.currency}`"></div>
                    <span class="isin">ISIN:{{ item.isin || '' }}</span>
                </div>
            </div>
            <div class="header-right">
                <span v-riseFall="{ value: item.profitloss, rate: false, thousand: true }"></span>
            </div>
        </section>
    </div>
</template>
<script>
export default {
    name: 'incomeItem',
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        index: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            active: false,
        }
    },
    computed: {
        date() {
            return this.item.date || ''
        },
        profitLoss() {
            return this.item.profitLoss || ''
        },
        list() {
            return this.item.list || []
        },
    },
    methods: {
        gotoFundDetail(item, type) {
            type =
                type ||
                {
                    0: 'public',
                    1: 'private',
                }[0]
            if (!(type && item.symbol)) return
            const url = `${location.origin}/wealth/fund.html#/detail?type=${type}&symbol=${item.symbol}`
            if (this.$openPageInThs(url.replace(/http(s)?/, 'https'))) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push(`/detail?type=${type}&symbol=${item.symbol}`)
            }
        },
    },
}
</script>
<style scoped lang="less">
.product-item {
    background: #fff;

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 0;

        &-left {
            width: 320px;

            .name {
                overflow: hidden;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 16px;
                line-height: 22px;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .currency {
                display: flex;
                flex-direction: row;
                align-items: center;
                margin-top: 2px;
            }

            .isin {
                margin-left: 5px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 10px;
                line-height: 14px;
            }
        }

        &-right {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 90px;
        }
        // &-mid{
        //         flex: 1;
        // }
    }
}
</style>
