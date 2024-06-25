// 小数计算精度问题
//加法
export function accAdd(arg1, arg2) {
    let r1, r2
    try {
        r1 = arg1.toString().split('.')[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg2.toString().split('.')[1].length
    } catch (e) {
        r2 = 0
    }
    const m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
}

//减法
export function accSub(arg1, arg2) {
    let r1, r2
    try {
        r1 = arg1.toString().split('.')[1].length
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg2.toString().split('.')[1].length
    } catch (e) {
        r2 = 0
    }
    const m = Math.pow(10, Math.max(r1, r2))
    const n = r1 >= r2 ? r1 : r2
    return ((arg1 * m - arg2 * m) / m).toFixed(n)
}

// 乘法
export function accMul(arg1, arg2) {
    let m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString()
    try {
        m += s1.split('.')[1].length
    } catch (e) {} // eslint-disable-line
    try {
        m += s2.split('.')[1].length
    } catch (e) {} // eslint-disable-line
    s1 = Number(s1.replace('.', ''))
    s2 = Number(s2.replace('.', ''))
    return (s1 * s2) / Math.pow(10, m)
}

// 除法
export function accDiv(arg1, arg2) {
    let t1 = 0,
        t2 = 0
    try {
        t1 = arg1.toString().split('.')[1].length
    } catch (e) {} // eslint-disable-line
    try {
        t2 = arg2.toString().split('.')[1].length
    } catch (e) {} // eslint-disable-line
    const r1 = Number(arg1.toString().replace('.', ''))
    const r2 = Number(arg2.toString().replace('.', ''))
    return accMul(r1 / r2, Math.pow(10, t2 - t1))
}
