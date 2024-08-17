<template>
    <div class="analysis-detail" :class="{ 'has-selected': selectedFundList.length }">
        <div class="tabs-box">
            <ul class="tabs" @click="onTabChange">
                <li class="tab" :class="{ selected: item.key === activeTab }" v-for="item in tabList" :key="item.key" :data-key="item.key">
                    {{ item.label }}
                </li>
            </ul>
        </div>
        <fosun-table
            class="outter-table"
            :data="list"
            :columns="columns"
            :showEmptyTip="true"
            :canPullDown="false"
            @sort="onSort"
            @rowClick="onSelected"
            ref="tableRef"
        >
            <template v-slot:name="{ item }">
                <div class="basic-column">
                    <!-- <div class="select">
                        <multi-img v-show="!item.selected" name="icon_agreement_normal" directory="fund"></multi-img>
                        <multi-img v-show="item.selected" name="icon_agreement_select" directory="fund"></multi-img>
                    </div> -->
                    <div class="basic-info">
                        <div class="fund-name line-elipsis">{{ item.name }}</div>
                        <ul class="tags">
                            <li :class="`currency-${item.currency}`"></li>
                            <li class="isin">{{ item.ISIN }}</li>
                            <li class="fund-type">{{ item.fundType | fundTypeFilter }}</li>
                        </ul>
                    </div>
                </div>
            </template>
            <template v-slot:changeKey="props">
                <span
                    v-if="['yield', 'upCapture', 'downCapture'].includes(activeTab) && props.item[activeTab]"
                    v-riseFall="{ value: props.item[activeTab] || undefined, base: 2 }"
                ></span>
                <span v-else>{{ props.item[activeTab] | floatToRatioFilter({ sign: false }) }}</span>
            </template>
            <template v-slot:rank="props">
                <span>{{ props.item.rank }}</span>
            </template>
        </fosun-table>
        <!-- <footer>
            <div class="tabs-box fund" v-show="selectedFundList.length">
                <ul class="tabs" @click="onFundClick">
                    <li class="tab" :class="{ selected: item.key === activeTab }" v-for="item in selectedFundList" :key="item.symbol">
                        <h3 class="fund_name line-elipsis_l2">{{ item.name }}</h3>
                        <multi-img name="close _gray" directory="fund" :data-symbol="item.symbol"></multi-img>
                    </li>
                </ul>
            </div>
            <div class="operation" v-if="isHlApp">
                <div class="result">
                    <p class="cur-length">
                        {{ $t('compare.hadSelect', { num: selectedFundList.length }) }}
                    </p>
                    <p class="max-length">{{ MAX_LENGTH_TIP }}</p>
                </div>
                <button class="btn" :class="{ disabled: isDisabled }" @click="goFundComparison">{{ $t('compare.startCompare') }}</button>
            </div>
        </footer> -->
    </div>
</template>

<script>
import FosunTable from '@/components/Table.vue'
import { floatToRatio } from '@/utils'
import { getRadarRank } from '@/apis/fund/fund'
import { FUND_RADAR_MAP, PERIOD_MAP, FUND_TYPE_MAP } from '../../config/common'
import { getRunEnv } from '@/utils/env'
export default {
    name: 'analysis-detail',
    components: {
        FosunTable,
    },
    data() {
        return {
            list: [],
            activeTab: 'yield',
            tabList: [
                {
                    key: 'yield',
                    label: this.$t('radar.yield'),
                    rateLabel: this.$t('radar.riseFall'),
                },
                {
                    key: 'upCapture',
                    label: this.$t('radar.upCapture'),
                    rateLabel: this.$t('radar.upCaptureRate'),
                },
                {
                    key: 'maxDrawown',
                    label: this.$t('radar.maxDrawown'),
                    rateLabel: this.$t('radar.maxDrawownRate'),
                },
                {
                    key: 'stdDev',
                    label: this.$t('radar.stdDev'),
                    rateLabel: this.$t('radar.stdDevRate'),
                },
                {
                    key: 'downCapture',
                    label: this.$t('radar.downCapture'),
                    rateLabel: this.$t('radar.downCaptureRate'),
                },
                {
                    key: 'battingAvg',
                    label: this.$t('radar.battingAvg'),
                    rateLabel: this.$t('radar.battingAvg'),
                },
            ],
            selectedFundList: [],
            MAX_LENGTH: 4, // 最多可选基金
            selectedFundMap: {},
        }
    },
    computed: {
        isDisabled() {
            return this.selectedFundList.length <= 1
        },
        MAX_LENGTH_TIP() {
            return this.$t('compare.selectLimit')
        },
        yearLabel() {
            const period = this.$route.query.period || 1
            return PERIOD_MAP.keyValueMap[period]
        },
        columns() {
            const map = this.tabList.reduce((obj, { key, rateLabel }) => {
                obj[key] = rateLabel
                return obj
            }, {})
            return [
                {
                    title: this.$t('fundName'),
                    key: 'name',
                    fixed: true,
                    slot: true,
                    className: 'fixed-column',
                },
                {
                    title: map[this.activeTab],
                    key: 'changeKey',
                    slot: true,
                    sort: true,
                    className: 'ayalysis-detail right-column',
                },
                {
                    title: this.$t('radar.ranking'),
                    key: 'rank',
                    slot: true,
                    sort: true,
                    className: 'ayalysis-detail right-column',
                },
            ]
        },
        isHlApp() {
            return true || getRunEnv() === 1
        },
    },
    filters: {
        fundTypeFilter(v) {
            return FUND_TYPE_MAP.options.findLabel(v, '')
        },
        floatToRatioFilter(v, options = {}) {
            return floatToRatio(v, options)
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.tableRef.setSortMap('rank', 'asc')
        })
        this.getDetail()
        this.setTitlte()
    },
    methods: {
        setTitlte() {
            const title = this.yearLabel + this.$t('radar.analysisDetail')
            if (this.$jsBridge) {
                this.$jsBridge.setTitle(title)
            } else {
                document.title = title
            }
        },
        async getDetail(options = {}) {
            try {
                const baseParams = {
                    categoryId: this.$route.query.categoryId,
                    key: FUND_RADAR_MAP.keysMap.yield, // 默认值为收益表现
                    period: this.$route.query.period,
                    f: 'rank',
                }
                const params = {
                    ...baseParams,
                    ...options,
                }
                const exec = getRadarRank
                const { result } = await exec(params)
                if (this.list.length) {
                    const list = result?.list || []
                    list.forEach((item, idx) => {
                        const o = this.list.find(i => i.symbol === item.symbol)
                        const index = this.list.findIndex(i => i.symbol === item.symbol)
                        const idxItem = this.list[idx]
                        this.list.splice(idx, 1, o)
                        this.list.splice(index, 1, idxItem)
                        o.rank = item?.rank && result?.categorySize ? `${item?.rank}/${result.categorySize}` : '--'
                        o[this.activeTab] = item[this.activeTab]
                    })
                } else {
                    const getSelected = symbol => this.list.find(i => i.symbol === symbol)?.selected
                    this.list = (result?.list || []).map(i => ({
                        ...i,
                        rank: i?.rank && result?.categorySize ? `${i?.rank}/${result.categorySize}` : '--',
                        selected: getSelected(i.symbol),
                    }))
                }
            } catch (e) {
                console.error(e)
            }
        },
        onSelected(data) {
            if (!data.selected) {
                if (this.selectedFundList.length >= this.MAX_LENGTH) {
                    this.$toast.clear()
                    this.$toast(this.MAX_LENGTH_TIP)
                    return
                }
            }
            data.selected = !data.selected
            if (this.selectedFundList.findIndex(i => i.symbol === data.symbol) >= 0) {
                if (!data.selected) {
                    this.deleteSomeFund(data.symbol)
                }
            } else {
                if (data.selected) {
                    this.addSomeFund(data)
                }
            }
        },
        onTabChange(e) {
            const { key } = e.target.dataset
            if (!key) return
            this.activeTab = key
            e.target?.scrollIntoView()
            this.$nextTick(() => {
                this.$refs.tableRef.setSortMap('rank', 'asc')
            })
            this.getDetail({ key: this.activeTab, sort: 'asc' })
        },
        onFundClick(e) {
            const { symbol } = e.target.dataset
            if (!symbol) return
            this.deleteSomeFund(symbol)
        },

        deleteSomeFund(symbol) {
            const index = this.selectedFundList.findIndex(i => i.symbol === symbol)
            if (index < 0) return
            this.selectedFundList.splice(index, 1)
            const fund = this.list.find(i => i.symbol === symbol)
            if (fund) {
                fund.selected = false
            }
        },

        addSomeFund(data) {
            this.selectedFundList.push(data)
        },

        onSort(key, sort) {
            console.log(`Feng.chen:: 15:44:11   ===> `, key, sort)
            this.getDetail({ key: this.activeTab, f: key === 'changeKey' ? this.activeTab : key, sort: sort !== 'none' ? sort : undefined })
        },

        goFundComparison() {
            if (this.isDisabled) return
            const symbols = JSON.stringify(this.selectedFundList.map(i => i.symbol))
            const url = `${location.origin}${location.pathname}#/comparison-detail?symbols=${encodeURIComponent(symbols)}`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            this.$router.push({
                path: '/comparison-detail',
                query: {
                    symbols,
                },
            })
        },
    },
}
</script>

<style scoped lang="less">
@import (reference) '~@/assets/css/mixins.less';

.analysis-detail {
    min-height: 100vh;
    background: #fff;
    #iosBottom(61px);

    &.has-selected {
        #iosBottom(129px);
    }

    .tabs-box {
        height: 36px;
        margin-bottom: 8px;
        overflow: hidden;

        .tabs {
            display: flex;
            padding-bottom: 12px;
            padding-left: 12px;
            overflow: auto;

            .tab {
                flex: 1 0 auto;
                margin-right: 32px;
                padding: 7px 0;
                color: #666;
                font-size: 15px;
                line-height: 21px;

                &.selected {
                    color: @fontBlackColor;
                    font-weight: 700;
                }
            }
        }

        &.fund {
            height: 48px;
            margin: 10px 0 10px 12px;

            .tabs {
                padding-left: 0;

                .tab {
                    display: flex;
                    flex: 0 0 auto;
                    align-items: center;
                    justify-content: space-between;
                    box-sizing: border-box;
                    width: 121px;
                    height: 48px;
                    margin-right: 8px;
                    padding: 8px 10px;
                    background: #f9f9f9;
                    border-radius: 6px;

                    .fund_name {
                        color: #2f2f2f;
                        font-weight: 700;
                        font-size: 12px;
                        line-height: 16px;
                    }

                    img {
                        width: 10px;
                        margin-left: 10px;
                    }

                    &.mask {
                        position: relative;

                        &::after {
                            position: absolute;
                            top: 0;
                            right: 0;
                            bottom: 0;
                            left: 0;
                            z-index: 111;
                            content: '';
                        }
                    }
                }
            }
        }
    }

    /deep/ .outter-table {
        margin: 0 12px;
        overflow: visible;

        .fixed {
            width: 189px;

            .title {
                padding: 0;
                line-height: 24px;
            }
        }

        .fixed-body {
            .label-column {
                color: #666;
                font-size: 14px;
                line-height: 20px;
            }

            // 用来模拟底层border
            .item {
                position: relative;

                &::after {
                    position: absolute;
                    right: -162px; // 86 + 76 = 162
                    bottom: 0;
                    left: 0;
                    height: 1px;
                    background: #efefef;
                    transform: scaleY(0.5);
                    content: '';
                }
            }
        }

        .scroll {
            flex: 1 0 auto;

            .title {
                justify-content: flex-end;

                .titleItem {
                    color: #9c9c9c;
                }
            }

            .row {
                justify-content: flex-end;
            }

            &-title-container {
                left: 189px;

                .title {
                    height: 24px;
                    padding-bottom: 0;
                }
            }
        }

        .basic-column {
            position: relative;

            .select {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);

                img {
                    width: 16px;
                }
            }

            .basic-info {
                margin-left: 28px;

                .fund-name {
                    color: #2f2f2f;
                    font-weight: 700;
                    font-size: 16px;
                    line-height: 22px;
                }

                .tags {
                    display: flex;
                    align-items: center;
                    margin-top: 4px;

                    .isin,
                    .fund-type {
                        color: #9c9c9c;
                        font-size: 10px;
                        line-height: 12px;
                    }

                    .isin {
                        position: relative;
                        margin: 0 8px 0 3px;

                        &::after {
                            position: absolute;
                            top: 50%;
                            width: 1px;
                            height: 8px;
                            margin-left: 4px;
                            background: #9c9c9c;
                            transform: scaleX(0.5) translateY(-50%);
                            content: '';
                        }
                    }
                }
            }
        }

        .fixed-column,
        .right-column {
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }

        .right-column {
            flex: 0 0 auto;
            color: #2f2f2f;
            text-align: right;

            &:first-child {
                flex-basis: 88px;
                margin-left: 8px;
            }

            &:nth-child(2) {
                flex-basis: 61px;
                margin-left: 15px;
            }
        }

        .item {
            height: 56px;
            font-size: 14px;
        }
    }

    footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        background: #fff;
        box-shadow: inset 0 0.5px 0 #efefef;
        #iosBottom();

        .operation {
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 49px;
            padding: 0 12px;

            .result {
                .cur-length {
                    color: #2f2f2f;
                    font-size: 16px;
                    line-height: 22px;

                    span {
                        color: @theme;
                    }
                }

                .max-length {
                    margin-top: 2px;
                    color: #9c9c9c;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .btn {
                width: 229px;
                color: #fff;
                font-weight: 500;
                font-size: 16px;
                line-height: 36px;
                background: @theme;
                border: none;
                border-radius: 18px;
                outline: none;

                &.disabled {
                    opacity: 0.3;
                }
            }
        }
    }
}
</style>
