<template>
    <div class="income-item">
        <section class="header" @click="clickHandler">
            <div class="header-left">
                <p class="title">{{ $t('profit') }}</p>
                <p class="date">{{ date | dateFilter }}</p>
            </div>
            <div class="header-right">
                <p class="profit" v-riseFall="{ value: profitLoss, rate: false, thousand: true }"></p>
            </div>
        </section>
    </div>
</template>
<script>
import dayjs from 'dayjs'
export default {
    name: 'incomeItem',
    filters: {
        dateFilter(v) {
            return dayjs(v).format('YYYY/MM/DD')
        },
    },
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
        clickHandler() {
            this.$emit('triggerDetail', this.index)
        },
    },
}
</script>
<style scoped lang="less">
.income-item {
    background: #fff;

    .header {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;

        &-left {
            display: flex;
            flex-direction: column;

            .title {
                padding-bottom: 4px;
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }

            .date {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        &-right {
            display: flex;
            align-items: center;

            .profit {
                font-weight: 400;
                font-size: 16px;
                line-height: 22px;
            }
        }
    }
}
</style>
