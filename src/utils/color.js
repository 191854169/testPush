import { getPriceColorType, getThemeType } from '@/utils/env.js'
const variables = require('../assets/css/variable')
// 涨跌色处理
const riseOrFallColors = {
    white: {
        // 橙涨绿跌
        1: {
            riseColor: '#FF3C3C',
            fallColor: '#29C277',
            flatColor: '#9C9C9C',
        },
        // 绿涨橙跌
        2: {
            riseColor: '#29C277',
            fallColor: '#FF6907',
            flatColor: '#9C9C9C',
        },
        // 红涨绿跌
        3: {
            riseColor: '#FF3C3C',
            fallColor: '#29C277',
            flatColor: '#9C9C9C',
        },
        // 绿涨红跌
        4: {
            riseColor: '#29C277',
            fallColor: '#FF3C3C',
            flatColor: '#9C9C9C',
        },
    },
    black: {
        // 橙涨绿跌
        1: {
            riseColor: '#FF3C3C',
            fallColor: '#20BF86',
            flatColor: '#858585',
        },
        // 绿涨橙跌
        2: {
            riseColor: '#20BF86',
            fallColor: '#EB5528',
            flatColor: '#858585',
        },
        // 红涨绿跌
        3: {
            riseColor: '#E74442',
            fallColor: '#20BF86',
            flatColor: '#858585',
        },
        // 绿涨红跌
        4: {
            riseColor: '#20BF86',
            fallColor: '#E74442',
            flatColor: '#858585',
        },
    },
}

const riseOrFallColor = riseOrFallColors[getThemeType()][getPriceColorType()]

export default {
    theme: variables.theme,
    ...variables.variable,
    ...riseOrFallColor,
}
