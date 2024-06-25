<template>
    <div class="card invest-style-box">
        <h3 class="title">{{ $t('investStyleBox') }}</h3>
        <template v-if="info.currStyle">
            <p class="update-time">{{ $t('updateTime') }}{{ info.updateDate | timeFilter }}</p>
            <label class="cur-invest-style" for="">{{ $t('currentStyle') }}{{ info.currStyle || '--' }}</label>
            <div class="box">
                <ul class="yAxis">
                    <li class="axis-name">({{ $t('size') }})</li>
                    <li v-for="item in yAxisList" :key="item.key">{{ item.label }}</li>
                </ul>
                <ul class="values">
                    <li
                        class="value"
                        v-for="item in keys"
                        :key="item"
                        :style="{ backgroundColor: (firstThree.find(i => i.key === item) || {}).color || '' }"
                    >
                        {{ info[item] | valueFilter }}
                    </li>
                </ul>
                <ul class="xAxis">
                    <li v-for="item in xAxisList" :key="item.key">{{ item.label }}</li>
                    <li class="axis-name">({{ $t('style') }})</li>
                </ul>
            </div>
        </template>
        <template v-else>
            <div class="no-data">
                <p>{{ $t('noData') }}</p>
            </div>
        </template>
    </div>
</template>

<script>
import { getStyleBox } from '@/apis/fund/fund.js'
import { floatToRatio } from '@/utils'
export default {
    name: 'invest-style-box',
    data() {
        return {
            updateTime: '2022/04/08',
            investStyle: '1',
            yAxisList: [
                { label: this.$t('largeBoard'), key: 'large' },
                { label: this.$t('midBoard'), key: 'mid' },
                { label: this.$t('smallBoard'), key: 'small' },
            ],
            xAxisList: [
                { label: this.$t('valuation'), key: 'Value' },
                { label: this.$t('blend'), key: 'Blend' },
                { label: this.$t('growthStyle'), key: 'Growth' },
            ],
            info: {},
            firstThree: [
                { key: '', color: 'rgba(39, 138, 255, 1)' },
                { key: '', color: 'rgba(39, 138, 255, 0.3)' },
                { key: '', color: 'rgba(39, 138, 255, 0.3)' },
            ], // 前三设置重色背景
        }
    },
    computed: {
        keys() {
            return this.yAxisList.reduce((list, { key } = {}) => {
                this.xAxisList.forEach(item => {
                    list.push(`${key}${item.key}`)
                })
                return list
            }, [])
        },
    },
    filters: {
        timeFilter(v) {
            v = v || ''
            return v.replace(/-/g, '/') || '--'
        },

        valueFilter(v) {
            v = v || 0
            return floatToRatio(v, {
                rate: true, // 是否展示百分比
                sign: false, // 不展示+号
                toFixed: true, // 是否保留小数
                base: 2,
            })
        },
    },
    created() {
        this.getStyleBox()
    },
    methods: {
        async getStyleBox() {
            try {
                const params = {
                    symbol: this.$route.query.symbol,
                }
                let { result } = (await getStyleBox(params)) || {}
                result = result || {}
                this.info = result
                this.firstThree.forEach((i, idx) => {
                    const list = this.keys.map(k => ({ key: k, value: this.info[k] })).sort((a, b) => b.value - a.value)
                    i.key = list[idx].key
                })
                const testData = {
                    currStyle: '大盘价值型',
                    updateDate: '2022-03-31',
                    largeValue: 46.25,
                    largeBlend: 12.41,
                    largeGrowth: 19.92,
                    midValue: 3.68,
                    midBlend: 17.74,
                    midGrowth: 0,
                    smallValue: 0,
                    smallBlend: 0,
                    smallGrowth: 0,
                }
                const isTesting = false
                if (isTesting) {
                    this.info = testData
                }
                console.log(`Feng.chen:: 19:53:49 result ===> `, result)
            } catch (e) {
                console.error(e)
            }
        },
        floatToRatio,
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px;
    padding: 8px 0 24px;
    background: #fff;
    border-radius: 8px;
}

.invest-style-box {
    .no-data {
        p {
            margin: 96px 0 72px;
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }

    .title {
        padding: 0 12px;
        font-weight: 700;
        font-size: 16px;
        line-height: 36px;
    }

    .update-time {
        margin: 9px 0;
        padding: 0 12px;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;
    }

    .cur-invest-style {
        padding: 8px 12px;
        color: #2f2f2f;
        font-size: 12px;
        line-height: 16px;
    }

    .box {
        position: relative;
        margin: 24px 0;
        padding: 0 78px;

        ul {
            display: flex;
            justify-content: space-between;

            li {
                color: #666;
                font-size: 12px;
                line-height: 16px;
            }
        }

        .yAxis {
            position: absolute;
            flex-direction: column;
            height: 100%;
            transform: translateX(calc(-100% - 8px));

            li {
                display: flex;
                align-items: center;
                height: calc((100% - 3px) / 3);

                &.axis-name {
                    position: absolute;
                    height: auto;
                    color: #9c9c9c;
                    white-space: nowrap;
                    transform: translateY(-100%);
                }
            }
        }

        .xAxis {
            position: absolute;
            right: 78px;
            left: 78px;
            margin-top: 8px;
            color: #666;
            font-size: 12px;
            line-height: 16px;

            li {
                width: calc((100% - 3px) / 3);
                white-space: nowrap;
                text-align: center;

                &.axis-name {
                    position: absolute;
                    right: 0;
                    width: auto;
                    margin-top: -8px;
                    color: #9c9c9c;
                    white-space: nowrap;
                    transform: translateX(100%);
                }
            }
        }

        .values {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;

            .value {
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                justify-content: center;
                width: calc((100% - 2px) / 3);
                min-height: 64px;
                color: #2f2f2f;
                text-align: center;
                background: rgba(39, 138, 255, 0.1);

                &:nth-child(n + 4) {
                    margin-top: 1px;
                }
            }
        }
    }
}
</style>
