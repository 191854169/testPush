<template>
    <div class="product-item">
        <section class="header" @click="gotoFundDetail(item)">
            <div class="header-left">
                <div class="name">
                    {{ item.name || '' }}
                </div>
                <div class="currency">
                    <div :class="`currency-${item.currency}`"></div>
                    <span class="isin">ISIN:{{ item.ISIN || '' }}</span>
                </div>
            </div>
            <div class="header-right">
                <span v-riseFall="{ value: item.returnD7ToY1, base: 4, rate: true }"></span>
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
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                location.href = url
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
            width: 160px;

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
            font-weight: 500;
        }
        // &-mid{
        //         flex: 1;
        // }
    }
}
</style>
