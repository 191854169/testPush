<template>
    <div class="select-stock">
        <header>
            <span class="bold">{{ $t('fundSelectionByStock.chosenStock') }}</span>
            <span>（{{ symbols.length }}/4）</span>
        </header>
        <section class="content">
            <Table
                ref="table"
                class="content-table mar-t16"
                rowStyle="height: .4rem"
                initScrollHorizon
                :data="list"
                :columns="columns"
                :canPullDown="false"
                :showEmptyTip="false"
                :canPullUp="false"
            >
                <template v-slot:name="props">
                    <div class="flex-content">
                        <div class="flex-c" @click="deleteHandler(props.item)">
                            <multi-img width="16" class="mar-r12" height="16" name="icon_dot_del" directory="fund"></multi-img>
                            <div class="line-elipsis stock-name" :class="'active' + props.item.index">{{ props.item.name }}</div>
                        </div>
                    </div>
                </template>
                <!-- 滚动列：基金其他信息 -->
                <template v-slot:[key]="props" v-for="key in slotScollColumnKeys">
                    <div class="scoll-content" :key="key">
                        <div class="f14" v-if="key === 'holderRatio'">{{ props.item[key] }}</div>
                        <div class="f14" v-else v-riseFall="props.item[key]"></div>
                    </div>
                </template>
            </Table>
        </section>
        <div class="add-btn-wrapper" @click="searchHandler">
            <div class="flex-c add-btn-main" :class="{ disabled: disabled }">
                <multi-img width="12" class="icon-add" height="12" name="icon_optional_add" directory="fund"></multi-img>
                <span class="mar-14 f14 theme">{{ $t('fundSelectionByStock.addStock') }}</span>
            </div>
        </div>
    </div>
</template>
<script>
import Table from '@/components/Table.vue'
import { i18n } from '@/i18n/fund/index.js'
import { hisQuoteChg } from '@/apis/market.js'
import NP from 'number-precision'

export default {
    name: 'selectStock',
    components: {
        Table,
    },
    props: {
        holderType: {
            type: Number,
        },
    },
    data() {
        return {
            symbols: this.$route.query.symbols ? JSON.parse(decodeURIComponent(this.$route.query.symbols)) : [],
            columns: [
                {
                    title: i18n.t('fundSelectionByStock.stockName'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                },

                {
                    title: i18n.t('nearOneWeek'),
                    key: 'chgPctWeek',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.54rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnM1'),
                    key: 'chgPct1M',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.7rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnM3'),
                    key: 'chgPct3M',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.7rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnM6'),
                    key: 'chgPct6M',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },
                {
                    title: i18n.t('fundList.returnY1'),
                    key: 'chgPct1Y',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                    },
                },

                {
                    title: i18n.t('fundList.returnYTD'),
                    key: 'chgPctInYear',
                    sort: false,
                    slot: true,
                    style: {
                        width: '0.87rem',
                        'text-align': 'right',
                        'padding-right': '0.12rem',
                    },
                },
            ],
            list: [],
            disableFlag: true,
        }
    },
    computed: {
        slotScollColumnKeys() {
            return this.columns.filter(item => item.slot && !item.fixed).map(item => item.key)
        },
        disabled() {
            return this.symbols.length >= 4 && this.disableFlag
        },
    },
    mounted() {
        this.getHisQuoteChg()
    },
    methods: {
        // 获取股票数据
        async getHisQuoteChg() {
            try {
                const res = await hisQuoteChg({ codes: this.symbols })
                this.list = res?.result?.list
                this.list.forEach((item, index) => {
                    item.index = index
                    item.chgPctWeek = NP.divide(item.chgPctWeek, Math.pow(10, 2))
                    item.chgPct1M = NP.divide(item.chgPct1M, Math.pow(10, 2))
                    item.chgPct3M = NP.divide(item.chgPct3M, Math.pow(10, 2))
                    item.chgPct6M = NP.divide(item.chgPct6M, Math.pow(10, 2))
                    item.chgPct1Y = NP.divide(item.chgPct1Y, Math.pow(10, 2))
                    item.chgPctInYear = NP.divide(item.chgPctInYear, Math.pow(10, 2))
                })
            } catch (e) {
                console.log('jsBridge.getHisQuoteChg=>e:', e)
            }
        },
        // 跳搜索页
        searchHandler() {
            if (this.disabled) {
                return false
            }
            this.$router.replace({
                path: '/fund-selection-by-stock-search',
                query: {
                    symbols: encodeURIComponent(JSON.stringify(this.symbols)),
                    holderType: this.holderType,
                },
            })
        },
        // 删除股票
        deleteStock(item) {
            const code = item.market + '' + item.rawSymbol
            this.symbols = this.symbols.filter(item => item != code)
        },
        // 删除
        deleteHandler(item) {
            this.list.splice(item.index, 1)
            this.list.forEach((item, index) => {
                item.index = index
            })
            this.deleteStock(item)
            this.disableFlag = false
            this.$emit('delete', item)
            if (this.list.length == 0) {
                this.$router.go(-1)
            }
        },
    },
}
</script>
<style scoped lang="less">
/deep/ .box {
    .fixed {
        width: 174px;
    }

    .scroll-title-container {
        left: 174px;
    }
}

.content {
    padding-left: 12px;
}

.select-stock {
    padding: 16px 0;
    background-color: #fff;
}

header {
    display: flex;
    align-items: center;
    padding-left: 12px;

    span:first-of-type {
        color: #2f2f2f;
        font-size: 16px;
        line-height: 20px;
    }

    span:last-of-type {
        margin-left: 4px;
        color: #666;
        font-weight: 400;
        font-size: 14px;
        line-height: 16px;
    }
}

.stock-name {
    position: relative;
    width: 132px;
    padding-left: 8px;
    color: #1f1f1f;
    font-weight: 400;
    font-size: 15px;
    line-height: 22px;

    &::after {
        position: absolute;
        top: 50%;
        left: 0;
        display: block;
        width: 2px;
        height: 12px;
        margin-top: -6px;
        border-radius: 12px;
        content: '';
    }

    &.active0 {
        &::after {
            background: #278aff;
        }
    }

    &.active1 {
        &::after {
            background: #9471ff;
        }
    }

    &.active2 {
        &::after {
            background: #ff7875;
        }
    }

    &.active3 {
        &::after {
            background: #ffad10;
        }
    }
}

.add-btn-wrapper {
    margin-top: 10px;
    background-color: @white;

    .add-btn-main {
        justify-content: center;
        width: 112px;
        height: 32px;
        margin: 0 auto;
        color: #ff6907;
        background: rgba(255, 105, 7, 0.07);
        border-radius: 32px;

        .icon-add {
            margin-top: -2px;
        }

        &.disabled {
            opacity: 0.5;
        }
    }
}

footer {
    display: flex;
    justify-content: center;

    .button {
        box-sizing: border-box;
        width: 112px;
        height: 32px;
        margin-top: 10px;
        padding: 6px 10px;
        background: rgba(255, 105, 7, 0.07);
        border-width: 0;
        border-radius: 32px;

        &.disabled {
            opacity: 0.5;
        }

        .add {
            margin-right: 4px;
            padding-top: 2px;
            font-size: 16px;
        }

        span {
            color: #ff6907;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            user-select: none;
        }
    }
}
</style>
