import { milliFormat, floatToRatio } from '@/utils'
import { currencyMap } from '@/config/common'
// 千分位
export const thousandsFilter = function (v) {
    return v ? milliFormat(v) : v
}

// 金额过滤器
export const amountFilter = function (v, options = {}) {
    const baseOptions = { rate: false, thousand: true, emptyText: '--' }
    const { rate = false, thousand = true, emptyText = '--' } = { ...baseOptions, ...options }
    if (!v) return emptyText
    if (rate) {
        v = floatToRatio(v, { sign: false })
    }
    if (thousand) {
        v = milliFormat(v)
    }
    return v
}

// 金额过滤器
export const amountFormatter = function (v, options = {}) {
    // 默认不展示百分比、+-号
    const baseOptions = { sign: false, rate: false, thousand: true, emptyText: '--' }
    const mergedOptions = { ...baseOptions, ...options }
    const { thousand = true, emptyText = '--' } = mergedOptions
    if (['', undefined, null].includes(v) || Number.isNaN(v)) return emptyText
    v = floatToRatio(v, { ...mergedOptions })
    if (thousand) {
        v = milliFormat(v)
    }
    return v
}

// 币种过滤器
export const currencyFilter = v => {
    return v ? currencyMap.keyValueMap[v] || v : ''
}
