<template>
    <div ref="chart"></div>
</template>
<script>
import * as echarts from 'echarts/core'
import { GridComponent, DatasetComponent, RadarComponent } from 'echarts/components'
import { RadarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { CLIENT_RADAR_MAP } from '@/views/fund/config/common'
import { colorToRGB } from '@/utils/tools.js'
import { isTHSApp } from '@/utils'
import { accMul, accDiv } from '@/utils/accurate'
import { getThemeType } from '@/utils/env'

const plugins = [GridComponent, RadarChart, CanvasRenderer, UniversalTransition, DatasetComponent, RadarComponent]
echarts.use(plugins)

export default {
    name: 'chient-radar-chart',
    props: {
        shrink: {
            type: Boolean,
            default: false,
        },
        userData: {
            type: Object,
            default: () => ({}),
        },
        platformData: {
            type: Object,
            default: () => ({}),
        },
        checkTheme: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            chart: null,
            theme: 'white',
            colorMap: {
                white: {
                    lineColor: '#eeeeee',
                    color1: '#FFA800',
                    color2: '#278AFF',
                },
                black: {
                    lineColor: '#2E2E2E',
                    color1: '#EB5528',
                    color2: '#398BEB',
                },
            },
        }
    },
    computed: {
        themeColors() {
            return this.colorMap[this.theme] || {}
        },
    },
    methods: {
        async initChart() {
            if (this.checkTheme) {
                this.theme = getThemeType()
            }
            const { lineColor, color1, color2 } = this.themeColors
            const colors = [color1, color2]
            const areaColors = colors.map(color => colorToRGB(color, { opa: 0.1 }))
            const selfData = []
            const platformData = []
            let tabList = []
            // 非空数据处理
            tabList = CLIENT_RADAR_MAP.options
                .map((i, idx) => {
                    const res = {
                        key: i.key,
                        label: i.value,
                        rich: ['text'].map(i => `${i}${idx + 1}`),
                        cur: '',
                        average: '',
                    }

                    const radar = this.userData[i.key] || {}
                    const platformRadar = this.platformData[i.key] || {}
                    selfData.push((res.cur = radar.score))
                    platformData.push((res.average = platformRadar.score))
                    if (!(res.cur && res.average)) {
                        this.$emit('setEmpty')
                    }
                    return res
                })
                .reverse()
            // 跟tabList的顺序保持一致
            selfData.reverse()
            platformData.reverse()

            const chartDom = this.$refs.chart
            const myChart = this.chart || echarts.init(chartDom)
            const textClass = { color: '#9c9c9c', fontSize: this.getRemFontSize(12), lineHeight: 17, align: 'center' }
            const option = {
                color: colors,
                radar: {
                    radius: this.shrink ? '100%' : [0, this.getRemFontSize(80)],
                    startAngle: 120,
                    splitNumber: 5,
                    splitArea: { show: false },
                    axisLine: {
                        lineStyle: {
                            color: lineColor,
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: lineColor,
                        },
                    },
                    indicator: tabList.map(item => {
                        return { name: this.shrink ? '' : { ...item }, max: 5 }
                    }),
                    nameGap: 12,
                    axisName: {
                        fontFamily:
                            'DIN2014, -apple-system, BlinkMacSystemFont, "PingFang SC","Helvetica Neue",STHeiti,"Microsoft Yahei",Tahoma,Simsun,sans-serif',
                        formatter: value => {
                            if (this.shrink) {
                                return ''
                            }
                            const { label, rich } = value
                            const [text] = rich
                            return `{${text}|${label}}`
                        },
                        rich: {
                            // 收益明细
                            text1: {
                                padding: [0, 0, 6, 5],
                                ...textClass,
                            },
                            // 市场上行表现
                            text2: {
                                padding: [0, 0, 0, 0],
                                ...textClass,
                            },
                            // 回撤管理
                            text3: {
                                padding: [15, 0, 0, 6],
                                ...textClass,
                            },
                            // 波幅管理
                            text4: {
                                padding: [15, 6, 0, 0],
                                ...textClass,
                            },
                            // 市场下行表现
                            text5: {
                                padding: [0, 0, 0, 0],
                                ...textClass,
                            },
                            // 超越市场能力
                            text6: {
                                padding: [0, 5, 6, 0],
                                ...textClass,
                            },
                        },
                    },
                },
                series: [
                    {
                        name: 'Budget vs spending',
                        type: 'radar',
                        lineStyle: {
                            width: 1,
                        },
                        data: [
                            {
                                value: platformData,
                                name: 'similar-fund',
                                areaStyle: {
                                    color: areaColors[0],
                                },
                                symbol: 'none',
                            },
                            {
                                value: selfData,
                                name: 'self-fund',
                                areaStyle: {
                                    color: areaColors[1],
                                },
                                symbol: 'none',
                            },
                        ],
                    },
                ],
            }

            myChart.setOption(option)
            this.chart = myChart
        },

        getRemFontSize(fontSize) {
            var docEl = document.documentElement
            var uiWidth = 375 // 设计稿宽度
            var maxClientWidth = 750 // 手机设备最大宽度
            var clientWidth = docEl.clientWidth
            if (isTHSApp()) {
                clientWidth = window.screen.width
            }
            if (!clientWidth) {
                return
            }
            let scale = 1
            if (clientWidth >= maxClientWidth) {
                scale = accDiv(maxClientWidth, uiWidth)
            } else {
                scale = accDiv(clientWidth, uiWidth)
            }
            return Math.floor(accMul(fontSize, scale))
        },
    },
}
</script>
<style scoped lang="less"></style>
