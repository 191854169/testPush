<template>
    <div class="invest-compose-chart">
        <div class="no-data" v-show="!show">
            <p>{{ $t('noData') }}</p>
        </div>
        <div v-show="show">
            <div class="update-time" v-if="updateTime">{{ $t('updateTime') }}{{ updateTime | updateTimeFilter }}</div>
            <div class="chart-container">
                <div class="center_text" v-if="centerText">
                    {{ centerText }}
                </div>
                <div ref="chart" class="chart"></div>
                <div class="mask top" v-if="isMoreThanFive && (isScrollIng || isScrollToTop)"></div>
                <ul class="list" :style="{ justifyContent: isMoreThanFive ? 'flex-start' : '' }" @scroll="onScroll">
                    <div class="empty-placeholder" v-if="isMoreThanFive"></div>
                    <li class="list-item" v-for="(item, idx) in list" :key="item.id">
                        <div class="circle" :style="{ backgroundColor: colors[idx] }"></div>
                        <span class="label line-elipsis">{{ item.name }}</span>
                        <span class="value">{{ item.value + '%' }}</span>
                    </li>
                    <div class="empty-placeholder" v-if="isMoreThanFive"></div>
                </ul>
                <div class="mask bottom" v-if="isMoreThanFive && (isScrollIng || !isScrollToTop)"></div>
            </div>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts/core'
import { GridComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

const plugins = [GridComponent, PieChart, CanvasRenderer, UniversalTransition]

echarts.use(plugins)

export default {
    name: 'invest-compose-chart',
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        updateTime: {
            type: String,
            default: '',
        },
        centerText: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            isScrollToTop: false,
            isScrollIng: false,
            colors_data: [
                '#5CCEFF',
                '#3B95FF',
                '#426BFF',
                '#A980FF',
                '#C548FF',
                '#8F4BE5',
                '#FFDD66',
                '#FFB466',
                '#FF8039',
                '#FF8039',
                '#36CFC9',
                '#16B1BD',
                '#B7EB8F',
                '#52C41A',
                '#409F1D',
                '#FF5BBE',
                '#FF5B8C',
                '#D70C55',
            ],
        }
    },
    computed: {
        isMoreThanFive() {
            const MAX_LEN = 5
            return this.list.length > MAX_LEN
        },
        colors() {
            const clist = []
            this.list.forEach(element => {
                if (element.color?.length > 0) {
                    clist.push(element.color)
                }
            })
            return clist.length > 0 ? clist : this.colors_data
        },
        show() {
            return this.list && this.list.length
        },
    },
    filters: {
        updateTimeFilter(v) {
            return v ? v.replace(/-/g, '/') : '--'
        },
    },
    watch: {
        list: {
            handler() {
                this.$nextTick(() => {
                    this.initChart(this.$refs.chart)
                })
            },
            deep: true,
        },
    },
    mounted() {
        this.initChart(this.$refs.chart)
    },
    methods: {
        initChart(chartDom) {
            if (!chartDom || !this.list.length) return
            const myChart = echarts.init(chartDom)
            this.chart = myChart
            const testData = [
                { value: 1048, name: 'Search Engine' },
                { value: 735, name: 'Direct' },
                { value: 580, name: 'Email' },
                { value: 484, name: 'Union Ads' },
                { value: 300, name: 'Video Ads' },
            ]
            let data = this.list

            const isTesting = false
            if (isTesting) {
                data = testData
            }

            const option = {
                color: this.colors,
                series: [
                    {
                        type: 'pie',
                        label: {
                            show: false,
                        },
                        data,
                        left: 0,
                        top: 0,
                        radius: [31.5, 52], // 内外圆的半径
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 1,
                        },
                        emphasis: {
                            disabled: true,
                        },
                    },
                ],
            }
            option && myChart.setOption(option)
        },

        onScroll(e) {
            e.stopPropagation()
            // 判断到顶部的办法
            const target = e.target
            if (/ul/i.test(target.tagName)) {
                const { scrollTop } = target
                const maxScrollLenght = target.scrollHeight - target.offsetHeight
                this.isScrollToTop = scrollTop === maxScrollLenght
                if (scrollTop > 2 && scrollTop < maxScrollLenght) {
                    this.isScrollIng = true
                }
            }
        },
    },
}
</script>

<style scoped lang="less">
.invest-compose-chart {
    margin: 8px 0;

    .no-data {
        p {
            color: #9c9c9c;
            font-size: 14px;
            line-height: 166px;
            text-align: center;
        }
    }

    .update-time {
        margin: 8px 0 0;
        padding: 9px 12px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
    }

    .chart-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .chart {
        width: 108px;
        height: 108px;
        margin-left: 24px;
    }

    .center_text {
        position: absolute;
        width: 108px;
        margin-left: 24px;
        color: #666;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
    }

    .list {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 163px;
        height: 132px;
        overflow: auto;

        &-item {
            display: flex;
            flex: 0 0 auto;
            align-items: center;
            margin-top: 8px;

            &:nth-of-type(1) {
                margin-top: 0;
            }

            .circle {
                flex-shrink: 0;
                align-self: center;
                width: 6px;
                height: 6px;
                margin-right: 6px;
                border-radius: 50%;
            }

            .label,
            .value {
                color: #2f2f2f;
                font-size: 12px;
                line-height: 16px;
            }

            .label {
                flex: 1 1 auto;
                width: 96px;
                margin-right: 11px;
            }
        }

        .empty-placeholder {
            flex: 0 0 auto;
            height: 22px;
        }
    }

    .mask {
        position: absolute;
        right: 0;
        width: 163px;
        height: 22px;

        &.top {
            top: 0;
            z-index: 1;
            margin-top: -1px;
            background: linear-gradient(180deg, #fff 0%, rgba(255, 255, 255, 0.4) 100%);
        }

        &.bottom {
            bottom: 0;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, #fff 100%);
        }
    }
}
</style>
