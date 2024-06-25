<template>
    <div class="trade-rule">
        <header>{{ $t('tradeRule') }}</header>
        <ul class="content">
            <li v-for="(item, index) in ruleList" :key="index">
                <span class="label">{{ item.title }}</span>
                <span v-html="item.desc"></span>
            </li>
        </ul>
    </div>
</template>
<script>
export default {
    name: 'CashTradeRule',
    props: {
        ruleList: {
            required: true,
            type: Array,
            default() {
                return []
            },
        },
    },
    computed: {},
    created() {},
    methods: {},
}
</script>
<style scoped lang="less">
.trade-rule {
    margin: 12px 0 0;
    padding: 8px 12px 16px;
    background: #fff;
    border-radius: 8px;

    header {
        margin-bottom: 12px;
        padding: 7px 0;
        color: #2f2f2f;
        font-weight: 500;
        font-size: 16px;
        line-height: 22px;
    }

    .content {
        display: flex;
        flex-direction: column;

        li {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;

            .label {
                flex: 0 0 82px;
                color: #666;
            }

            .value {
                margin-left: 16px;
                color: #2f2f2f;
                white-space: pre-wrap;
                text-align: justify;
            }
        }

        li:last-of-type {
            margin-bottom: 0;
        }

        ::v-deep .highlight {
            color: @theme-white;
        }
    }
}
</style>
