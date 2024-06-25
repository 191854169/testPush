<template>
    <div class="history-profit">
        <h3 class="title">{{ $t('historyProfit') }}</h3>
        <div class="content">
            <div class="shadow-line"></div>
            <Table
                ref="table"
                class="table"
                @dispatchScroll="dispatchScrollHandler"
                :data="list"
                :columns="columns"
                :showEmptyTip="false"
                :canPullDown="false"
                :rowStyle="rowStyle"
                titleClass="line-elipsis"
            >
                <template v-slot:fixTitle>
                    <div ref="fixedTitle" class="table-fixed__title">{{ $t('fundName') }}</div>
                </template>
                <template v-slot:label="props">
                    <div class="table-label">{{ props.item.label }}</div>
                </template>
                <template v-slot:[key]="props" v-for="key in symbols">
                    <div class="scoll-content" :key="key" v-riseFall="props.item[key]"></div>
                </template>
            </Table>
        </div>
    </div>
</template>
<script>
import { getCompareHistoryReturn } from '@/apis/fund/fund.js'
import Table from '@/components/Table.vue'
// import { i18n } from '@/i18n/fund'
// const $t = (text) => i18n.t(text)

export default {
    name: 'historyProfit',
    props: {
        symbols: {
            type: Array,
            default: () => [],
        },
        fundList: {
            type: Array,
            default: () => [],
        },
    },
    components: {
        Table,
    },
    data() {
        return {
            list: [],
            profitKeyMap: {
                returnD1: this.$t('nearOneDay'),
                returnW1: this.$t('nearOneWeek'),
                returnM1: this.$t('nearOneMonth'),
                returnM3: this.$t('nearThreeMonth'),
                returnM6: this.$t('nearSixMonth'),
                returnY1: this.$t('nearOneYear'),
                returnY3: this.$t('nearThreeYear'),
                returnY5: this.$t('nearFiveYear'),
                returnYTD: this.$t('yearToDay'),
                returnFounded: this.$t('fromFoundedToDay'),
            },
            rowStyle: {
                height: '0.36rem',
                'font-weight': 400,
                'font-size': '0.12rem',
                'line-height': '0.16rem',
                color: '#666666',
            },
        }
    },
    computed: {
        headSymbols() {
            return this.symbols.map(symbol => `scroll-head-${symbol}`)
        },
        columns() {
            const columns = [
                {
                    title: this.$t('fundName'),
                    key: 'label',
                    fixed: true,
                    headSlot: true,
                },
            ]
            this.fundList.forEach(item => {
                columns.push({
                    title: item.name,
                    key: item.symbol,
                    slot: true,
                    style: {
                        width: '0.92rem',
                        'text-align': 'left',
                        'margin-left': '0.2rem',
                    },
                })
            })
            return columns
        },
    },
    created() {
        this.getHistoryReturn()
    },
    mounted() {
        this.table = this.$refs.table
        const scrollBody = this.table?.$refs?.scollBody || null
        if (scrollBody) {
            this.collectContext(this.table)
            const scrollHandler = () => {
                if (this.$refs.fixedTitle) {
                    const scrollLeft = scrollBody.scrollLeft
                    if (scrollLeft) {
                        this.$refs.fixedTitle.style.boxShadow = `2px 0px 8px rgba(0, 0, 0, 0.05)`
                    } else {
                        this.$refs.fixedTitle.style.boxShadow = `none`
                    }
                }
            }
            scrollBody.addEventListener('scroll', scrollHandler)
            this.$once('hook:beforeDestroy', () => {
                scrollBody.removeEventListener('scroll', scrollHandler)
            })
        }
    },
    methods: {
        async getHistoryReturn() {
            try {
                const { result } = await getCompareHistoryReturn({ symbols: this.symbols })
                const list = result?.list || []
                const resultMap = list.reduce((pre, cur) => {
                    pre[cur.symbol] = cur.data
                    return pre
                }, {})
                Object.keys(this.profitKeyMap).forEach(key => {
                    const item = {}
                    item.label = this.profitKeyMap[key]
                    for (const symbol of this.symbols) {
                        item[symbol] = resultMap[symbol] ? resultMap[symbol][key] : ''
                    }
                    this.list.push(item)
                })
            } catch (e) {
                console.log('getHistoryReturn===>e:', e)
            }
        },
        collectContext(context) {
            this.$emit('collectContext', context)
        },
        dispatchScrollHandler(v) {
            this.$emit('dispatchScroll', v)
        },
    },
}
</script>
<style scoped lang="less">
.history-profit {
    .title {
        padding: 0 12px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }
}

.content {
    position: relative;
    padding: 9px 0 0;

    .shadow-line {
        position: absolute;
        top: 41px;
        z-index: 2000;
        width: 100%;
        height: 1px;
        box-shadow: inset 0 -0.5px 0 #efefef;
    }

    /deep/.box {
        .scrollElement {
            padding-top: 33px;
        }

        .fixed {
            width: 96px;
            padding-left: 12px;
        }

        .scroll-title-container {
            top: 9px;
            left: 96px;

            .scrollTitle {
                .titleItem {
                    position: relative;

                    span {
                        display: inline-block;
                        width: 100%;
                        overflow: hidden;
                        color: #2f2f2f;
                        font-weight: 700;
                        font-size: 12px;
                        line-height: 16px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }

                .titleItem::before {
                    position: absolute;
                    top: 6px;
                    left: -8px;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    content: '';
                }

                .titleItem:nth-child(1)::before {
                    background-color: #278aff;
                }

                .titleItem:nth-child(2)::before {
                    background-color: #ffa800;
                }

                .titleItem:nth-child(3)::before {
                    background-color: #8f4be5;
                }

                .titleItem:nth-child(4)::before {
                    background-color: #ff7875;
                }
            }
        }
    }

    .table-fixed__title {
        position: absolute;
        top: 0;
        z-index: 2000;
        width: 84px;
        height: 100%;
        padding-top: 9px;
        color: #666;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        // box-shadow: 2px 0px 8px rgba(0, 0, 0, 0.05);
    }

    .scoll-content {
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
    }
}
</style>
