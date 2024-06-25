import NP from 'number-precision'

/**
 * @name 四舍五入
 * @param Number val 数字
 * @param Number places 保留位数
 * @return String
 */
export const keepDecimals = (val, places) => {
    let num = val + ''
    if (places > 0) {
        num = NP.round(val, places) + ''
        const numStart = num.split('.')[0]
        const numEnd = num.split('.')[1] || ''
        num = `${numStart}.${numEnd.padEnd(places, '0')}`
    } else {
        num = Math.round(num)
    }
    return num
}

/**
 * @name 浮点数转百分比
 * @param Number num
 * @param Object option
 */
export const floatToRatio = (num, options = {}) => {
    const {
        rate = true, // 是否展示百分比
        toFixed = true, // 是否保留小数
        base = 2, // 保留小数位数
        sign = true, // 正数是否带符号
        pow = 0, // 放大 10的指数幂
    } = options
    if (num === '' || Object.prototype.toString.call(+num).slice(8, -1) !== 'Number' || isNaN(+num)) return '--'
    if (toFixed) {
        num = +num * Math.pow(10, pow)
        num = keepDecimals(num, base)
    }
    return `${sign && num > 0 ? '+' : ''}${num}${rate ? '%' : ''}`
}

/**
 * @name 计算rem
 * @param Number num
 * @param Object option
 */
export const calcRem = (document, value) => {
    const fontSize = document.documentElement.style.fontSize.replace('px', '')
    return NP.times(NP.divide(value, 100), fontSize)
}
