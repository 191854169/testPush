<template>
    <div class="create-sel-card">
        <div
            v-show="!isFundSel"
            v-for="(item, index) in itemList"
            :key="index"
            class="item itemBottomPadding"
            :class="{ sel: index == selIndex }"
            @click="selCardAction(index)"
        >
            <span class="textBox">
                <div class="label">{{ item.label }}</div>
                <div class="msg">{{ item.message }}</div>
            </span>
            <multi-img class="icon" :name="item.iconImg" directory="fund"></multi-img>
        </div>
        <div
            v-show="isFundSel"
            v-for="(item, idx) in fundItemList"
            :key="item.key"
            class="fund_item"
            :class="{ sel: idx == fundSelIndex }"
            @click="selFundAction(idx)"
        >
            <div class="fund_label">{{ item.label }}</div>
            <multi-img class="fund_icon" :name="item.iconImg" directory="fund"></multi-img>
        </div>
    </div>
</template>
<script>
import { i18n } from '@/i18n/fund/index.js'
export default {
    name: 'create-sel-card',
    data() {
        return {
            itemList: [
                {
                    label: i18n.t('createPortfolio.stockTitle'),
                    message: i18n.t('createPortfolio.stockSubTitle'),
                    iconImg: 'icon_stock_portfolio',
                },
                {
                    label: i18n.t('createPortfolio.fundTitle'),
                    message: i18n.t('createPortfolio.fundSubTitle'),
                    iconImg: 'icon_fund_portfolio',
                },
            ],
            fundItemList: [
                {
                    label: i18n.t('createPortfolio.hkFund'),
                    iconImg: 'icon_hk_fond',
                    key: 'hkFund',
                },
                {
                    label: i18n.t('createPortfolio.usFund'),
                    iconImg: 'icon_us_fond',
                    key: 'usFund',
                },
            ],
            selIndex: 0,
            fundSelIndex: 0,
        }
    },
    props: {
        isFundSel: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        selCardAction(index) {
            console.log('index ==>', index)
            this.selIndex = index
            this.$emit('input', index)
        },
        selFundAction(idx) {
            this.fundSelIndex = idx
            this.$emit('input', idx + 100)
        },
    },
}
</script>
<style lang="less" scoped>
.create-sel-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    justify-content: space-between;
    width: 100%;
    background-color: #fff;

    .item {
        display: flex;
        flex-direction: row;
        width: 100%;
        height: 96px;
        padding: 28px 15px 0 20px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
    }

    .itemBottomPadding {
        align-items: center;
        height: 106px;
        padding-bottom: 28px;
    }

    .icon {
        width: 97px;
        height: 68px;
    }

    .textBox {
        flex: 1;
        height: 50px;
    }

    .label {
        margin-bottom: 4px;
        color: #2f2f2f;
        font-weight: 500;
        font-size: 18px;
        font-style: normal;
        line-height: 26px;
    }

    .msg {
        color: #666;
        font-weight: 400;
        font-size: 14px;
        font-style: normal;
        line-height: 20px;
    }

    .fund_item {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        height: 96px;
        padding: 0 20px;
        border: 1px solid #e8e8e8;
        border-radius: 8px;

        .fund_label {
            color: @h1-white;
            font-weight: 500;
            font-size: 18px;
            line-height: 96px;
        }

        .fund_icon {
            width: 87px;
            height: 86px;
            margin-top: 10px;
        }
    }

    .sel {
        border: 1px solid #ff6907;
    }
}
</style>
