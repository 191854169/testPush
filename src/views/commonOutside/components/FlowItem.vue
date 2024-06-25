<template>
    <div class="flow-item">
        <div class="left">
            <multi-img :name="`icon_liushui_${flowType2Icon[options.flowType] ?? 'qt'}`" directory="ruiyin" class="icon" />
            <div class="type-stock">
                <p class="type">{{ options.businessTypeStr }}</p>
                <div class="stock">
                    <div class="stock-code">{{ options.stockCode }}</div>
                    <div class="stock-name">
                        {{ options.stockName }}
                    </div>
                </div>
            </div>
            <div class="placer" />
        </div>
        <div class="right">
            <div class="amount-currency">
                <div class="amount">{{ amountFormatter(options.amount) }}</div>
                <div class="currency">{{ options.currency }}</div>
            </div>
            <p class="trade-date">{{ tradeDateFormatter(options.tradeDate) }}</p>
        </div>
    </div>
</template>

<script>
import { flowType2Icon } from '../config/common'
export default {
    name: 'FlowItem',
    props: {
        options: { type: Object, default: () => ({}) },
    },
    data: () => ({ flowType2Icon }),
    methods: {
        amountFormatter(amount) {
            const [int, fraction] = `${amount}`.split('.')
            const value = `${int.replace(/(\d)(?=(\d{3})+$)/g, '$1,')}${fraction ? '.' + fraction : ''}`
            if (!/^-/.test(value)) return `+${value}`
            return value
        },
        tradeDateFormatter(date) {
            return date.replace(/-/g, '/')
        },
    },
}
</script>

<style lang="less" scoped>
.layout {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.flow-item {
    padding: 16px 12px;
    background-color: #fff;
    box-shadow: 0 -0.5px 0 0 #efefef inset, 12px 0 0 0 #fff inset, -12px 0 0 0 #fff inset;

    .layout();

    .left {
        .layout();

        flex: 1;
        align-items: flex-start;
        justify-content: flex-start;

        .placer {
            min-width: 24px;
        }

        .icon {
            width: 20px;
            height: 20px;
            margin-right: 8px;
        }

        .type-stock {
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .type {
                margin-bottom: 4px;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
                font-family: 'PingFang SC';
                line-height: 20px;
            }

            .stock {
                display: flex;
                min-height: 16px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                font-family: 'PingFang SC';
                line-height: 16px;

                &-code {
                    display: -webkit-box;
                    margin-right: 4px;
                    overflow: hidden;
                    overflow-wrap: break-word;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }

                &-name {
                    display: -webkit-box;
                    overflow: hidden;
                    overflow-wrap: break-word;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }
            }
        }
    }

    .right {
        .amount-currency {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 4px;

            .amount {
                margin-right: 4px;
                color: #2f2f2f;
                font-weight: 500;
                font-size: 14px;
                font-family: 'Helvetica Neue';
                line-height: 20px;
            }

            .currency {
                color: #2f2f2f;
                font-weight: 400;
                font-size: 12px;
                font-family: 'Helvetica Neue';
                line-height: 20px;
            }
        }

        .trade-date {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            font-family: 'PingFang SC';
            line-height: 16px;
            text-align: right;
        }
    }
}
</style>
