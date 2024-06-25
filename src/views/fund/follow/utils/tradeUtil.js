import { getDecimalCount, keepDecimals } from '@/utils'
import NP from 'number-precision'

/**
 * 计算股票下单价,默认使用最新价
 *
 * 美股股价大于1时,最多支持两位小数,多余的小数位买入时进位,卖出时舍弃
 * @param {*} item 产品对象集合
 * @param {*} item.market 产品市场
 * @param {*} item.latestPrice 产品当前价格
 * @returns { Number|String } 校正后的下单价格
 */
export function calcTradePrice(item) {
    // console.log(`calcTradePrice item=`, item)
    return alignPrice(item.latestPrice || 0, item.market, true)
}

/**
 * 下单价对齐
 * @param {string | number} originPrice 原始价格
 * @param {string} quote 股票市场
 * @param {boolean} isBuy 是否为买入
 */
export function alignPrice(originPrice, market, isBuy) {
    const originPriceF = originPriceToFloat(originPrice)
    const isUsStock = market.toUpperCase() === 'US'
    let result = originPriceF
    if (isUsStock && originPriceF > 1 && getDecimalCount(originPriceF) > 2) {
        //美股下单价大于1时只支持两位小数
        result = toFixedTradeStockPrice(originPriceF, 2, isBuy)
    }
    // console.log(`alignPrice originPrice=${originPrice};result=${result};isBuy=${isBuy}`)
    return result
}

/**
 * 价格传参转浮点数
 */
function originPriceToFloat(originPrice) {
    // 数据类型校验
    if (typeof originPrice !== 'string' && typeof originPrice !== 'number') {
        throw new TypeError('originPrice must be a string or number')
    }

    const originPriceF = parseFloat(originPrice)
    // 处理NaN和Infinity的情况
    if (isNaN(originPriceF) || !isFinite(originPriceF)) {
        throw new Error('originPrice must be a finite number')
    }
    return originPriceF
}

/**
 * 好易投-股票下单价格式化
 * @param {string | number} price 下单价
 * @param {number} decimalCount 要保留的小数位
 * @param {boolean} isBuy 是否为买入
 * @returns
 */
function toFixedTradeStockPrice(price, decimalCount, isBuy) {
    let result = NP.times(price, Math.pow(10, decimalCount))
    if (isBuy) {
        //多余的小数位-买入时进位
        result = Math.ceil(Number(result))
    } else {
        //多余的小数位-卖出时舍弃
        result = Math.floor(Number(result))
    }
    result = NP.divide(result, Math.pow(10, decimalCount))
    return Number(keepDecimals(result, decimalCount))
}
