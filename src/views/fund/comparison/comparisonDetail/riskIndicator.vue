<template>
    <div class="risk-indicator">
        <h3 class="title">{{ $t('riskIndicator') }}</h3>
        <div class="content">
            <div class="shadow-line"></div>
            <Table
                ref="table"
                class="table"
                @dispatchScroll="dispatchScrollHandler"
                :data="listMap[activeTab] || emptyList"
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
                    <div class="scoll-content" :key="key">{{ props.item[key] }}</div>
                </template>
            </Table>
        </div>
        <ul class="btns" @click="onBtnClick">
            <li class="btn mask" :class="{ selected: item.key === activeTab }" v-for="item in btns" :key="item.key" :data-key="item.key">
                <button>{{ item.label }}</button>
            </li>
        </ul>
    </div>
</template>
<script>
import { getCompareRiskIndicator } from '@/apis/fund/fund.js'
import Table from '@/components/Table.vue'
import { i18n } from '@/i18n/fund'

const $t = text => i18n.t(text)

const indicatorKeyMap = {
    returnYear: $t('averageReturnYear'),
    maxDrawDown: $t('maxDrawDown'),
    stdDeviationYear: $t('deviationYear'),
    sharpRatio: $t('sharpRate'),
    alpha: 'α',
    beta: 'β',
    rSquare: $t('rSquare'),
}

export default {
    name: 'riskIndicator',
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
    filters: {},
    data() {
        return {
            listMap: {
                y1: null,
                y3: null,
                y5: null,
            },
            rowStyle: {
                height: '0.36rem',
                'font-weight': 400,
                'font-size': '0.12rem',
                'line-height': '0.16rem',
                color: '#2F2F2F',
            },
            activeTab: 'y1',
            btns: [
                {
                    key: 'y1',
                    label: this.$t('nearOneYear'),
                },
                {
                    key: 'y3',
                    label: this.$t('nearThreeYear'),
                },
                {
                    key: 'y5',
                    label: this.$t('nearFiveYear'),
                },
            ],
        }
    },
    computed: {
        emptyList() {
            return Object.keys(indicatorKeyMap).map(key => {
                const item = {}
                const sign = !['beta', 'rSquare', 'sharpRatio'].includes(key)
                item.label = indicatorKeyMap[key]
                for (const symbol of this.symbols) {
                    item[symbol] = this.indicatorFilter('', sign)
                }
                return item
            })
        },
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
                        'margin-left': '20px',
                    },
                })
            })
            return columns
        },
    },
    created() {
        this.getRiskIndicator()
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
        indicatorFilter(v, sign = true) {
            return v ? `${v}${sign ? '%' : ''}` : '--'
        },
        async getRiskIndicator() {
            try {
                if (this.listMap[this.activeTab]) return
                const { result } = await getCompareRiskIndicator({ symbols: this.symbols, period: this.activeTab })
                const list = result?.list || []
                const resultMap = list.reduce((pre, cur) => {
                    pre[cur.symbol] = cur
                    return pre
                }, {})
                this.listMap[this.activeTab] = Object.keys(indicatorKeyMap).map(key => {
                    const item = {}
                    const sign = !['beta', 'rSquare', 'sharpRatio'].includes(key)
                    item.label = indicatorKeyMap[key]
                    for (const symbol of this.symbols) {
                        const value = resultMap[symbol] ? resultMap[symbol][key] : ''
                        item[symbol] = this.indicatorFilter(value, sign)
                    }
                    return item
                })
            } catch (e) {
                console.log('getCompareRiskIndicator===>e:', e)
            }
        },

        onBtnClick(e) {
            const key = e.target.dataset.key
            if (!key) return
            this.activeTab = key
            this.getRiskIndicator()
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
.risk-indicator {
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

.btns {
    display: flex;
    margin-top: 6px;
    padding: 6px 8px;
    user-select: none;

    .btn {
        flex: 1 1 auto;
        text-align: center;

        &.mask {
            position: relative;

            &::after {
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                z-index: 1;
                content: '';
            }
        }

        &.selected {
            background: rgba(255, 99, 7, 0.1);
            border-radius: 18px;

            button {
                color: #ff6907;
                font-weight: 700;
            }
        }

        button {
            color: #666;
            font-size: 12px;
            line-height: 24px;
            text-align: center;
            background: transparent;
            border: none;
            outline: none;
            user-select: none;
        }
    }
}
</style>
