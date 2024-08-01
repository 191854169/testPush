import * as tools from '@/utils/tools'

Object.defineProperty(
    window.navigator,
    'userAgent',
    (value => ({
        get() {
            return value
        },
        set(v) {
            value = v
        },
        configurable: true,
    }))(window.navigator.userAgent)
)

test('计算整数添加小数点后两位', () => {
    expect(tools.getFloatStr(100)).toBe('100.00')
    expect(tools.getFloatStr('100')).toBe('100.00')
    expect(tools.getFloatStr('test')).toBe('test')
    expect(tools.getFloatStr('0001')).toBe('1.00')
    expect(tools.getFloatStr('.1')).toBe('0.10')
    expect(tools.getFloatStr('.112')).toBe('0.11')
    expect(tools.getFloatStr(100.345)).toBe('100.34')
})

test('取银行卡的后四位', () => {
    expect(tools.substring(100, 4)).toBe('100')
    expect(tools.substring('100', 4)).toBe('100')
    expect(tools.substring('10011', 4)).toBe('0011')
})

test('获取URL中参数', () => {
    delete window.location
    Object.defineProperty(window, 'location', {
        value: {
            href: 'https://www.baidu.com',
            search: '?a=1&b=2',
            hash: '#/?c=3&d=4',
        },
        configurable: true,
    })

    expect(tools.getQueryString('a')).toBe('1')
    expect(tools.getQueryString('a', false)).toBe('1')
    expect(tools.getQueryString('a', true)).toBe(false)
    expect(tools.getQueryString('b', false)).toBe('2')
    expect(tools.getQueryString('b', true)).toBe(false)
    expect(tools.getQueryString('c', false)).toBe(false)
    expect(tools.getQueryString('c', true)).toBe('3')
    expect(tools.getQueryString('d', false)).toBe(false)
    expect(tools.getQueryString('d', true)).toBe('4')
    expect(tools.getQueryString('e', true)).toBe(false)
    expect(tools.getQueryString('e', false)).toBe(false)
})

test('处理文字多余省略', () => {
    expect(tools.txtHandle('abcde', 2)).toBe('ab...')
    expect(tools.txtHandle('abcde', 5)).toBe('abcde')
})

test('添加千位分隔符', () => {
    expect(tools.milliFormat(false)).toBe(false)
    expect(tools.milliFormat(1)).toBe('1')
    expect(tools.milliFormat(12345)).toBe('12,345')
    expect(tools.milliFormat(12345.11)).toBe('12,345.11')
})

test('判断电话号码', () => {
    expect(tools.isPhone('0595-8866543')).toBe(true)
    expect(tools.isPhone('059-8866543')).toBe(true)
    expect(tools.isPhone('05-8866543')).toBe(false)
    expect(tools.isPhone('059-886654')).toBe(false)
})

test('是否url地址', () => {
    expect(tools.isURL('http://abc.com')).toBe(true)
    expect(tools.isURL('https://abc.com')).toBe(true)
    expect(tools.isURL('http2s://abc.com')).toBe(false)
})

test('是否是字符串', () => {
    expect(tools.isString('str')).toBe(true)
    expect(tools.isURL(1)).toBe(false)
    expect(tools.isURL()).toBe(false)
})

test('是否数字', () => {
    expect(tools.isNumber('str')).toBe(false)
    expect(tools.isNumber(1)).toBe(true)
    expect(tools.isNumber()).toBe(false)
})

test('是否是布尔值', () => {
    expect(tools.isBoolean('str')).toBe(false)
    expect(tools.isBoolean(1)).toBe(false)
    expect(tools.isBoolean(true)).toBe(true)
})

test('是否是函数', () => {
    expect(tools.isFunction('str')).toBe(false)
    expect(tools.isFunction(1)).toBe(false)
    const fn = () => {}
    expect(tools.isFunction(fn)).toBe(true)
})

test('是否为null', () => {
    expect(tools.isNull('str')).toBe(false)
    expect(tools.isNull(1)).toBe(false)
    expect(tools.isNull(null)).toBe(true)
})

test('是否为undefined', () => {
    expect(tools.isUndefined(undefined)).toBe(true)
    expect(tools.isUndefined('undefined')).toBe(false)
    expect(tools.isUndefined(null)).toBe(false)
    expect(tools.isUndefined(0)).toBe(false)
})

test('是否是对象', () => {
    const obj1 = {}
    const obj2 = new Object()
    const obj3 = {
        q: 1,
        f: () => {},
    }
    const obj4 = [1, 2, 3]
    const obj5 = function () {}

    expect(tools.isObj(obj1)).toBe(true)
    expect(tools.isObj(obj2)).toBe(true)
    expect(tools.isObj(obj3)).toBe(true)
    expect(tools.isObj(obj4)).toBe(false)
    expect(tools.isObj(obj5)).toBe(false)
})

test('是否是数组', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [...new Set(arr1)]
    const arr3 = { 1: 'a', 2: 'b' }
    const arr4 = '[1, 2, 3]'
    expect(tools.isArray(arr1)).toBe(true)
    expect(tools.isArray(arr2)).toBe(true)
    expect(tools.isArray(arr3)).toBe(false)
    expect(tools.isArray(arr4)).toBe(false)
})

test('是否是时间', () => {
    const t1 = new Date()
    const t2 = new Date('2022-12-10 12:12:12')
    const t3 = '2022-12-10 12:12:12'
    expect(tools.isDate(t1)).toBe(true)
    expect(tools.isDate(t2)).toBe(true)
    expect(tools.isDate(t3)).toBe(false)
})

test('是否是正则', () => {
    const r1 = /^[0-9]*$/
    const r2 = new RegExp('^[0-9]*$')
    const r3 = '/^[0-9]*$/'
    expect(tools.isRegExp(r1)).toBe(true)
    expect(tools.isRegExp(r2)).toBe(true)
    expect(tools.isRegExp(r3)).toBe(false)
})

test('是否错误对象', () => {
    expect(tools.isError(Error('test error'))).toBe(true)
    expect(tools.isError(Error())).toBe(true)
    expect(tools.isError(EvalError())).toBe(true)
    expect(tools.isError(RangeError())).toBe(true)
    expect(tools.isError(ReferenceError())).toBe(true)
    expect(tools.isError(SyntaxError())).toBe(true)
    expect(tools.isError(TypeError())).toBe(true)
    expect(tools.isError(URIError())).toBe(true)
    expect(tools.isError(new Array())).toBe(false)
    expect(tools.isError(new Set())).toBe(false)
})

test('是否Symbol函数', () => {
    expect(tools.isSymbol(Symbol('foo'))).toBe(true)
    expect(tools.isSymbol(Symbol())).toBe(true)
    expect(tools.isSymbol({ [Symbol.toStringTag]: 'Symbol' })).toBe(true)
    expect(tools.isSymbol('[object Symbol]')).toBe(false)
    expect(tools.isSymbol('abc')).toBe(false)
    expect(tools.isSymbol('124')).toBe(false)
    expect(tools.isSymbol(1234)).toBe(false)
})

test('是否Promise对象', () => {
    const promise = new Promise(function (resolve) {
        resolve()
    })
    const obj = {
        then: function () {
            console.log('then')
        },
    }
    expect(tools.isPromise(promise)).toBe(true)
    expect(tools.isPromise(obj)).toBe(false)
    expect(tools.isPromise('123test')).toBe(false)
    expect(tools.isPromise([1, 2, 3])).toBe(false)
})

test('是否Set对象', () => {
    const set = new Set()
    const weakSet = new WeakSet()
    const map = new Map()
    const weakMap = new WeakMap()
    const obj = { aa: 11 }
    expect(tools.isSet(set)).toBe(true)
    expect(tools.isSet(weakSet)).toBe(false)
    expect(tools.isSet(map)).toBe(false)
    expect(tools.isSet(weakMap)).toBe(false)
    expect(tools.isSet(obj)).toBe(false)
})

test('是否是微信浏览器', () => {
    expect(tools.isWeiXin()).toBe(false)
})

test('是否是移动端  ', () => {
    expect(tools.isDeviceMobile()).toBe(false)
})
test('isQQBrowser  ', () => {
    expect(tools.isQQBrowser()).toBe(false)

    navigator.userAgent = 'xxxx qqbrowser  xxx'
    expect(tools.isQQBrowser()).toBe(true)
})

test('是否是钉钉浏览器', () => {
    expect(tools.isDingtalk()).toBe(false)
})

test('是否是恒利证券App中', () => {
    expect(tools.isTenantApp()).toBe(false)
})

test('是否是同花顺App中', () => {
    expect(tools.isTHSApp()).toBe(false)
})

test('是否是爬虫', () => {
    expect(tools.isSpider()).toBe(false)
})

test('是否ios', () => {
    navigator.userAgent = 'Windows Phone'
    expect(tools.isIos()).toBe(false)

    navigator.userAgent = 'Android'
    expect(tools.isIos()).toBe(false)

    navigator.userAgent = 'Linux'
    expect(tools.isIos()).toBe(false)

    navigator.userAgent = 'iPhone'
    expect(tools.isIos()).toBe(true)

    navigator.userAgent = 'iPad'
    expect(tools.isIos()).toBe(true)

    navigator.userAgent = ''
    expect(tools.isIos()).toBe(false)
})

test('是否为PC端', () => {
    navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    expect(tools.isPC()).toBe(true)

    navigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
    expect(tools.isPC()).toBe(false)
})

test('判断类型集合', () => {
    expect(tools.checkStr('13409801234', 'phone')).toBe(true)
    expect(tools.checkStr('13409801235', 'phone')).toBe(true)
    expect(tools.checkStr('11409801235', 'phone')).toBe(false)
    expect(tools.checkStr('0755-29796988', 'tel')).toBe(true)
    expect(tools.checkStr('0755-29796999', 'tel')).toBe(true)
    expect(tools.checkStr('441422199909091111', 'card')).toBe(true)
    expect(tools.checkStr('44142219990909111X', 'card')).toBe(true)
    expect(tools.checkStr('qwe123', 'pwd')).toBe(true)
    expect(tools.checkStr('qwe123qwe', 'pwd')).toBe(true)
    expect(tools.checkStr('518000', 'postal')).toBe(true)
    expect(tools.checkStr('1047789179', 'QQ')).toBe(true)
    expect(tools.checkStr('1047789179@qq.com', 'email')).toBe(true)
    expect(tools.checkStr('11.00', 'money')).toBe(true)
    expect(tools.checkStr('http://www.baidu.com', 'URL')).toBe(true)
    expect(tools.checkStr('https://www.baidu.com', 'URL')).toBe(true)
    expect(tools.checkStr('192.168.10.21', 'IP')).toBe(true)
    expect(tools.checkStr('2022-12-12', 'date')).toBe(true)
    expect(tools.checkStr('123', 'number')).toBe(true)
    expect(tools.checkStr('abc', 'english')).toBe(true)
    expect(tools.checkStr('ABC', 'english')).toBe(true)
    expect(tools.checkStr('你', 'chinese')).toBe(true)
    expect(tools.checkStr('hello', 'lower')).toBe(true)
    expect(tools.checkStr('HELLO', 'upper')).toBe(true)
    expect(tools.checkStr('<div>123</div>', 'HTML')).toBe(true)
    expect(tools.checkStr('<div>123</div>')).toBe(true)
})

test('严格的大陆身份证校验', () => {
    expect(tools.isCardID('')).toBe(false)
    expect(tools.isCardID('161422199401011311')).toBe(false)
    expect(tools.isCardID('101222199909091111')).toBe(false)
    expect(tools.isCardID('01122219990909111')).toBe(false)
    expect(tools.isCardID('441422199416011311')).toBe(false)
    expect(tools.isCardID('441422199401011312')).toBe(false)
    expect(tools.isCardID('441422199401011311')).toBe(true)
    expect(tools.isCardID('12142219940304151X')).toBe(true)
})

test('判断邮箱', () => {
    expect(tools.isEmail('123@qq.com')).toBe(true)
    expect(tools.isEmail('123@163.com')).toBe(true)
    expect(tools.isEmail('123@haninet.com')).toBe(true)
    expect(tools.isEmail('123@haninet.con')).toBe(false)
    expect(tools.isEmail('123@haninet.cn')).toBe(true)
})

test('判断手机号码', () => {
    expect(tools.isMobile('13612345678')).toBe(true)
    expect(tools.isMobile('17012345678')).toBe(true)
    expect(tools.isMobile('17012345678', '+86')).toBe(true)
    expect(tools.isMobile('51234567', '+852')).toBe(true)
    expect(tools.isMobile('6612345', '+853')).toBe(true)
    expect(tools.isMobile('0923456789', '+886')).toBe(true)
})

test('判断一个元素是否在数组中', () => {
    expect(tools.contains([1, 2, 3], 3)).toBe(true)
    expect(tools.contains([1, 2, 3], 0)).toBe(false)
    expect(tools.contains(['a', 'b', 'c'], 1)).toBe(false)
    expect(tools.contains(['a', 'b', 'c'], 'c')).toBe(true)
    expect(tools.contains(['a', 'b', 'c'], 'C')).toBe(false)
    expect(tools.contains([{}, null, undefined, ''], 'C')).toBe(false)
    expect(tools.contains([{}, null, undefined, ''], '')).toBe(true)
    expect(tools.contains([{}, null, undefined, ''], undefined)).toBe(true)
    expect(tools.contains([{}, null, undefined, ''], null)).toBe(true)
    expect(tools.contains([{}, null, undefined, ''], NaN)).toBe(false)
    expect(tools.contains([{ a: 1 }, null, undefined, ''], {})).toBe(false)
})

test('数组的排序', () => {
    expect(tools.sort([5, 1, 2, 3])).toStrictEqual([1, 2, 3, 5])
    expect(tools.sort([5, 1, 2, 3], 1)).toStrictEqual([1, 2, 3, 5])
    expect(tools.sort([5, 1, 2, 3], 2)).toStrictEqual([5, 3, 2, 1])
    expect(tools.sort([5, 1, 2, 3], 3)).not.toStrictEqual([1, 2, 3, 5, 6])
    expect(tools.sort([5, 1, 2, 3], 4)).toStrictEqual([5, 1, 2, 3])
})

test('数组去重', () => {
    expect(tools.unique([5, 5, 1, 2, 2, 3])).toStrictEqual([5, 1, 2, 3])
    expect(tools.unique([5, 5, 1, 2, 2, 3])).not.toStrictEqual([5, 5, 1, 2, 2, 3])
    expect(tools.unique([])).toStrictEqual([])
    expect(tools.unique('')).toStrictEqual([])
    expect(tools.unique(['aa', 'bb', 'cc', 'dd', 'aa'])).toStrictEqual(['aa', 'bb', 'cc', 'dd'])
})

test('数组删除其中一个元素', () => {
    expect(tools.remove([1, 2, 3], 2)).toStrictEqual([1, 3])
    expect(tools.remove(['a', 'b', 'c'], 'a')).toStrictEqual(['b', 'c'])
    expect(tools.remove(['a', 'b', 'c'], 'e')).toStrictEqual(['a', 'b', 'c'])
    expect(tools.remove(['a', 'b', {}], {})).toStrictEqual(['a', 'b', {}])
    expect(tools.remove(['a', null, 'c'], null)).toStrictEqual(['a', 'c'])
    expect(tools.remove(['a', '', 'c'], '')).toStrictEqual(['a', 'c'])
    expect(tools.remove(['a', undefined, 'c'], undefined)).toStrictEqual(['a', 'c'])
    expect(tools.remove(['a', undefined, 'c'], undefined)).not.toStrictEqual(['a', undefined, 'c'])
    expect(tools.remove(['a', 'b', 'c'], 'b')).not.toStrictEqual(['a', 'b', 'c'])
})

test('将类数组转换为数组', () => {
    const obj = {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        length: 4,
        push: Array.prototype.push,
        splice: Array.prototype.splice,
    }
    // console.log('typeof obj :', typeof obj)
    expect(tools.formArray(obj)).toStrictEqual([1, 2, 3, 4])
    expect(tools.formArray([1, 2, 3, 4])).toStrictEqual([1, 2, 3, 4])
})

test('求最大值', () => {
    expect(tools.max([1, 2, 3])).toStrictEqual(3)
    expect(tools.max([1, 2, 3, 'a'])).toStrictEqual(NaN)
})

describe('函数方法待完善的一些场景', () => {
    test('Err - 判断一个元素是否在数组中 -- 没有做深度比较 ', () => {
        expect(tools.contains([{}, null, undefined, ''], {})).toBe(false)
        // 示例
        expect({ a: 1 }).toEqual({ a: 1 })
    })
    test('Err - 数组中删除一个元素 -- 对象无法删除 ', () => {
        expect(tools.remove(['a', 'b', {}], {})).toStrictEqual(['a', 'b', {}])
    })
    test('Err - 获取数组最大值 -- 没有处理异常 ', () => {
        expect(tools.max([1, 2, 3, 'a'])).toStrictEqual(NaN)
    })
})

describe('被测函数异常的test', () => {
    test('求两个数组的并集并去重', () => {
        expect(tools.union([1, 2, 3], [2, 3, 4])).toStrictEqual([1, 2, 3, 4])
    })
    test('求两个集合的交集', () => {
        expect(tools.intersect([1, 2, 3], [2, 3, 4])).toStrictEqual([2, 3])
    })
})
// ---- 汪佳 start ----

test('获取滚动的坐标', () => {
    expect(tools.getScrollPosition()).toEqual({ x: 0, y: 0 })
    let el = {
        pageXOffset: undefined,
        pageYOffset: undefined,
        scrollLeft: 100,
        scrollTop: 200,
    }
    expect(tools.getScrollPosition(el)).toEqual({ x: 100, y: 200 })

    el = {
        pageXOffset: 50,
        pageYOffset: 60,
        scrollLeft: 100,
        scrollTop: 200,
    }
    expect(tools.getScrollPosition(el)).toEqual({ x: 50, y: 60 })
})

test('滚动到顶部', async () => {
    // 模拟滚动函数
    window.scrollTo = jest.fn(() => {})

    delete document.documentElement.scrollTop
    Object.defineProperty(document.documentElement, 'scrollTop', {
        value: 20,
        configurable: true,
    })
    expect(document.documentElement.scrollTop).toBe(20)
    tools.scrollToTop()

    Object.defineProperty(document.documentElement, 'scrollTop', {
        value: 0,
        configurable: true,
    })
    expect(document.documentElement.scrollTop).toBe(0)
    tools.scrollToTop()
})

test('el是否在视口范围内', () => {
    expect(tools.elementIsVisibleInViewport(document.body)).toBe(true)
    expect(tools.elementIsVisibleInViewport(document.body, false)).toBe(true)
    expect(tools.elementIsVisibleInViewport(document.body, true)).toBe(false)
    let el = {
        getBoundingClientRect: () => {
            return {
                top: 1,
                left: 2,
                bottom: 0,
                right: 0,
            }
        },
    }
    expect(tools.elementIsVisibleInViewport(el, false)).toBe(true)
    expect(tools.elementIsVisibleInViewport(el, true)).toBe(true)

    el = {
        getBoundingClientRect: () => {
            return {
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
            }
        },
    }
    expect(tools.elementIsVisibleInViewport(el, false)).toBe(true)
    expect(tools.elementIsVisibleInViewport(el, true)).toBe(false)

    el = {
        getBoundingClientRect: () => {
            return {
                top: 2000,
                left: 2000,
                bottom: 500,
                right: 500,
            }
        },
    }
    expect(tools.elementIsVisibleInViewport(el, false)).toBe(true)
    expect(tools.elementIsVisibleInViewport(el, true)).toBe(true)
})

test('洗牌算法随机', () => {
    let flag = true
    const diff = 0.01 // 洗牌误差
    const sign = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
    //验证
    const result = Array(sign.length).fill(0)
    for (let i = 0; i < 100000; i++) {
        const c = tools.shuffle(JSON.parse(JSON.stringify(sign)))
        for (let j = 0; j < sign.length; j++) {
            result[j] += c[j]
        }
    }
    const min = result[0] - result[0] * diff
    const max = result[0] + result[0] * diff
    result.forEach(ele => {
        if (ele > max || ele < min) {
            flag = false
        }
    })
    expect(flag).toBe(true)
})

test('随机数范围', () => {
    const test = (min, max) => {
        for (let i = 0; i < 100; i++) {
            const num = tools.random(min, max)
            if (!(num >= min && num <= max)) {
                return false
            }
        }
        return true
    }
    expect(test(1, 2)).toBe(true)
    expect(test(1, 10)).toBe(true)
    expect(test(2, 20)).toBe(true)
    expect(test(0, 10)).toBe(true)
    expect(test(-1, 2)).toBe(true)
})

test('将阿拉伯数字翻译成中文的大写数字', () => {
    expect(tools.numberToChinese('')).toBe('')
    expect(tools.numberToChinese(0)).toBe('')
    expect(tools.numberToChinese(1)).toBe('一')
    expect(tools.numberToChinese(2)).toBe('二')
    expect(tools.numberToChinese(3)).toBe('三')
    expect(tools.numberToChinese(4)).toBe('四')
    expect(tools.numberToChinese(5)).toBe('五')
    expect(tools.numberToChinese(6)).toBe('六')
    expect(tools.numberToChinese(7)).toBe('七')
    expect(tools.numberToChinese(8)).toBe('八')
    expect(tools.numberToChinese(9)).toBe('九')
    expect(tools.numberToChinese(10)).toBe('十')
    expect(tools.numberToChinese(15)).toBe('十五')
    expect(tools.numberToChinese(40)).toBe('四十')
    expect(tools.numberToChinese(80)).toBe('八十')
    expect(tools.numberToChinese(100)).toBe('一百')
    expect(tools.numberToChinese(100000000)).toBe('億萬')
    expect(tools.numberToChinese(123456789)).toBe('一億二仟三百四十五萬六仟七百八十九')
    expect(tools.numberToChinese(2236090600)).toBe('二十二億三仟六百零九萬六百')
    expect(tools.numberToChinese(1.95)).toBe('一点九五')
    expect(tools.numberToChinese(10000)).toBe('一萬')
    expect(tools.numberToChinese(10010)).toBe('一萬一十')
    expect(tools.numberToChinese(100010)).toBe('一十萬一十')
    expect(tools.numberToChinese(1000010)).toBe('一百萬一十')
    expect(tools.numberToChinese(10000010)).toBe('一仟萬一十')
    expect(tools.numberToChinese(1000)).toBe('一仟')
})

test('将数字转换为大写金额', () => {
    expect(tools.changeToChinese(0)).toBe('元整')
    expect(tools.changeToChinese(0.88)).toBe('元捌角捌分')
    expect(tools.changeToChinese(1)).toBe('壹元整')
    expect(tools.changeToChinese(2)).toBe('贰元整')
    expect(tools.changeToChinese(0.99)).toBe('元玖角玖分')
    expect(tools.changeToChinese(3)).toBe('叁元整')
    expect(tools.changeToChinese(4)).toBe('肆元整')
    expect(tools.changeToChinese(5)).toBe('伍元整')
    expect(tools.changeToChinese(6)).toBe('陆元整')
    expect(tools.changeToChinese(7)).toBe('柒元整')
    expect(tools.changeToChinese(8)).toBe('捌元整')
    expect(tools.changeToChinese(9)).toBe('玖元整')
    expect(tools.changeToChinese(1.99)).toBe('壹元玖角玖分')
    expect(tools.changeToChinese(20000000.55)).toBe('贰仟万元伍角伍分')
    expect(tools.changeToChinese('aa')).toBe('')
    expect(tools.changeToChinese(10000.1)).toBe('壹万元壹角')
    expect(tools.changeToChinese(10000.2)).toBe('壹万元贰角')
    expect(tools.changeToChinese(10000.3)).toBe('壹万元叁角')
    expect(tools.changeToChinese(10000.4)).toBe('壹万元肆角')
    expect(tools.changeToChinese(10000.5)).toBe('壹万元伍角')
    expect(tools.changeToChinese(10000.6)).toBe('壹万元陆角')
    expect(tools.changeToChinese(10000.7)).toBe('壹万元柒角')
    expect(tools.changeToChinese(10000.8)).toBe('壹万元捌角')
    expect(tools.changeToChinese(10000.9)).toBe('壹万元玖角')
    expect(tools.changeToChinese(1000000000.1)).toBe('壹拾亿万元壹角')
    expect(tools.changeToChinese(1.21)).toBe('壹元贰角壹分')
    expect(tools.changeToChinese(10)).toBe('壹拾元整')
    expect(tools.changeToChinese(100)).toBe('壹佰元整')
    expect(tools.changeToChinese(1000)).toBe('壹仟元整')
    expect(tools.changeToChinese(10000)).toBe('壹万元整')
    expect(tools.changeToChinese(100000)).toBe('壹拾万元整')
    expect(tools.changeToChinese(1000000)).toBe('壹佰万元整')
    expect(tools.changeToChinese(10000000)).toBe('壹仟万元整')
    expect(tools.changeToChinese(1.965)).toBe('壹元玖角陆分')
    expect(tools.changeToChinese(1)).toBe('壹元整')
    expect(tools.changeToChinese(0.01)).toBe('元壹分')
    expect(tools.changeToChinese(0.1)).toBe('元壹角')
    expect(tools.changeToChinese(20000000000)).toBe('')
    expect(tools.changeToChinese(200000000)).toBe('贰亿万元整')
})
// ---- 汪佳 end ----
// ---- 陈锋 start ----

test('验证香港身份证是否合法', () => {
    // /^[A-Z]\d{6}\([\dA]\)$/
    expect(tools.isHKCard('123456')).toEqual(false) // 首位不包含大写字母
    expect(tools.isHKCard('A(A)')).toEqual(false) // 中间包含0位数字
    expect(tools.isHKCard('A1(A)')).toEqual(false) // 中间包含1位数字
    expect(tools.isHKCard('A12(A)')).toEqual(false) // 中间包含2位数字
    expect(tools.isHKCard('A123(A)')).toEqual(false) // 中间包含3位数字
    expect(tools.isHKCard('A1234(A)')).toEqual(false) // 中间包含4位数字
    expect(tools.isHKCard('A12345(A)')).toEqual(false) // 中间包含5位数字
    expect(tools.isHKCard('A123456(A)')).toEqual(true) // 中间包含6位数字
    expect(tools.isHKCard('A123456(1)')).toEqual(true) // 末尾包含为1
    expect(tools.isHKCard('A123456(A')).toEqual(false) // 不包含右括号
    expect(tools.isHKCard('A123456()')).toEqual(false) // 不包含中间值
    expect(tools.isHKCard('A123456A)')).toEqual(false) // 不包含左括号
    expect(tools.isHKCard('A123456A')).toEqual(false) // 不包含括号
})

test('字符串中匹配文字变色', () => {
    const defaultColor = '#FF6907'
    const matchStr = (str, color) => `<span style="color: ${color};">${str}</span>`
    const noMatchStr = str => `<span>${str}</span>`
    expect(tools.strColorChange()).toBe(noMatchStr(''))
    expect(tools.strColorChange('', '')).toBe(noMatchStr(''))
    expect(tools.strColorChange('', 'eee')).toBe(noMatchStr(''))
    expect(tools.strColorChange('abcdefg', 'e')).toBe(`abcd${matchStr('e', defaultColor)}fg`)
    expect(tools.strColorChange('abcdefg', '')).toBe(noMatchStr(`abcdefg`))
    expect(tools.strColorChange('让人', 'eee')).toBe(noMatchStr('让人'))
    expect(tools.strColorChange('证券入金', '证券')).toBe(`${matchStr('证券', defaultColor)}入金`)
    expect(tools.strColorChange('证券入金', '金')).toBe(`证券入${matchStr('金', defaultColor)}`)
    expect(tools.strColorChange('证券入金', '入')).toBe(`证券${matchStr('入', defaultColor)}金`)
    expect(tools.strColorChange('证券入金', '证券入金')).toBe(`${matchStr('证券入金', defaultColor)}`)
    expect(tools.strColorChange('证券入金', '证券入金', { color: 'red' })).toBe(`${matchStr('证券入金', 'red')}`)
})

test('获取设备屏幕宽', () => {
    expect(tools.deviceWidth().clientWidth).toBe(0)
    expect(tools.deviceWidth().offsetWidth).toBe(0)
    expect(tools.deviceWidth().screenWidth).toBe(0)
    expect(tools.deviceWidth().allWidth).toBe(0)

    Object.defineProperty(document.body, 'clientWidth', {
        get() {
            return 200
        },
    })
    Object.defineProperty(document.body, 'offsetWidth', {
        get() {
            return 250
        },
    })
    Object.defineProperty(window.screen, 'width', {
        get() {
            return 200
        },
    })
    Object.defineProperty(window, 'devicePixelRatio', {
        get() {
            return 3
        },
    })
    expect(tools.deviceWidth().clientWidth).toBe(200)
    expect(tools.deviceWidth().offsetWidth).toBe(250)
    expect(tools.deviceWidth().screenWidth).toBe(200)
    expect(tools.deviceWidth().allWidth).toBe(600)
})

test('获取语言类型', () => {
    expect(tools.getLangType()).toBe('zhCn')
    let value = ''
    Object.defineProperty(navigator, 'language', {
        get() {
            return value
        },
        configurable: true,
        set(v) {
            value = v
        },
    })
    expect(tools.getLangType()).toBe('zhCn')
    navigator.language = 'zh-TW'
    expect(tools.getLangType()).toBe('zhTc')
    navigator.language = 'zh-TT'
    expect(tools.getLangType()).toBe('zhCn')

    navigator.userAgent = 'langType/black'
    expect(tools.getLangType()).toBe('black')
})

test('对比app版本号', () => {
    expect(tools.compareVersion('1.0.0', '2.0.0')).toBe(-1)
    expect(tools.compareVersion('1.0.0', '1.0.0')).toBe(0)
    expect(tools.compareVersion('2.0.0', '1.0.0')).toBe(1)
    expect(tools.compareVersion('2.0', '1.0.0')).toBe(1)
    expect(tools.compareVersion()).toBe(0)
})

// ---- 陈锋 end  ----

// ---- 欧阳康 start ----
test('银行卡号', () => {
    expect(tools.isBankID('')).toBe(false)
    expect(tools.isBankID('1')).toBe(false)
    expect(tools.isBankID('01111 11111 111 a1111')).toBe(false)
    expect(tools.isBankID('01111 11111 111 11111')).toBe(false)
    expect(tools.isBankID('11111 11111 111 a1111')).toBe(false)
    expect(tools.isBankID('11111 11111 111 01111')).toBe(true)
    expect(tools.isBankID('11111 11111 111 11111')).toBe(true)
})

test('日期格式', () => {
    expect(tools.toISODateString('')).toBe('')
    expect(tools.toISODateString('1981-01-01')).toBe('1981-01-01')
    expect(tools.toISODateString('19810101')).toBe('1981/01/01')
})

test('验证护照号码是否合法', () => {
    // /^1[45][0-9]{7}$|(^[P|p|S|s]\d{7}$)|(^[S|s|G|g|E|e]\d{8}$)|(^[Gg|Tt|Ss|Ll|Qq|Dd|Aa|Ff]\d{8}$)|(^[H|h|M|m]\d{8,10}$)/
    expect(tools.isPassport(1)).toBe(false)
    expect(tools.isPassport('141234567')).toBe(true)
    expect(tools.isPassport('P1234567')).toBe(true)
    expect(tools.isPassport('S12345678')).toBe(true)
    expect(tools.isPassport('Gg12345678')).toBe(false)
    expect(tools.isPassport('G12345678')).toBe(true)
    expect(tools.isPassport('g12345678')).toBe(true)
    expect(tools.isPassport('H12345678')).toBe(true)
})

test('验证港澳通行证是否合法', () => {
    //  /^[CW]\d{8}$/
    expect(tools.isGATXZ('')).toBe(false)
    expect(tools.isGATXZ('C12345678')).toBe(true)
    expect(tools.isGATXZ('W12345678')).toBe(true)
})
// ---- 欧阳康 end ----

// ----易桂辉 start ----
test('16进制颜色转RGBRGBA字符串', () => {
    expect(tools.colorToRGB('#333333')).toBe('rgb(51,51,51)')
    expect(tools.colorToRGB('#33333')).toBe('')
    expect(tools.colorToRGB('#333333', { opa: 50 })).toStrictEqual('rgba(51,51,51,50)')
    expect(tools.colorToRGB('#333333', { opa: 0.5, string: false })).toStrictEqual({ B: 51, G: 51, R: 51 })
})

test('判断两个对象是否键值相同', () => {
    const obj = { name: 'jerry' }
    expect(tools.isObjectEqual({ B: 7, G: 105, R: 255 }, { B: 7, G: 105, R: 255 })).toBeTruthy()
    expect(tools.isObjectEqual({ B: 7, G: 105, R: 255 }, { B: 7, G: 105, R: 265 })).toBeFalsy()
    expect(tools.isObjectEqual(obj, obj)).toBe(true)
    expect(tools.isObjectEqual(obj, { name: 'jerry', age: 18 })).toBe(false)
})

test('在字符串中插入新字符串', () => {
    expect(tools.insertStr('abcdefg', 2, 'ww')).toBe('abwwcdefg')
})

// ---- 易桂辉 end ----

// ---- 创胜 start ----
test('去空格', () => {
    expect(tools.trim(' 12 3 4 ', 1)).toBe('1234')
    expect(tools.trim(' 12 3 4 ', 2)).toBe('12 3 4')
    expect(tools.trim(' 12 3 4 ', 3)).toBe('12 3 4 ')
    expect(tools.trim(' 12 3 4 ', 4)).toBe(' 12 3 4')
    expect(tools.trim(' 12 3 4 ')).toBe('1234')
    expect(tools.trim(' 12 3 4 ', 5)).toBe(' 12 3 4 ')
})
test('字符串转换', () => {
    expect(tools.changeCase('abc', 1)).toBe('Abc')
    expect(tools.changeCase('Abc', 2)).toBe('aBC')
    expect(tools.changeCase('Abc', 3)).toBe('aBC')
    expect(tools.changeCase('Abc', 4)).toBe('ABC')
    expect(tools.changeCase('Abc', 5)).toBe('abc')
    expect(tools.changeCase('Abc')).toBe('ABC')
    expect(tools.changeCase('Abc', 7)).toBe('Abc')
})
test('检测密码强度', () => {
    expect(tools.checkPwd('122')).toBe(0)
    expect(tools.checkPwd('1223333333')).toBe(1)
    expect(tools.checkPwd('abcdefjgsegs')).toBe(1)
    expect(tools.checkPwd('ABCDEFGHGS')).toBe(1)
    expect(tools.checkPwd('12233333e')).toBe(2)
    expect(tools.checkPwd('12233333-3_3.')).toBe(2)
    expect(tools.checkPwd('12233333E')).toBe(2)
    expect(tools.checkPwd('abcdefjgsegsE')).toBe(2)
    expect(tools.checkPwd('abcdefjgsegs.')).toBe(2)
    expect(tools.checkPwd('ABCDEFGHGS.')).toBe(2)
    expect(tools.checkPwd('ABCDEFGHGSa.')).toBe(3)
    expect(tools.checkPwd('1ABCDEFGHGSa.')).toBe(4)
    expect(tools.checkPwd('')).toBe(0)
})
// ---- 创胜 end ----

// ---- 万亮 start ----
test('获取数组最小值', () => {
    expect(tools.min([12, 3, 4])).toBe(3)
})

test('数组求和', () => {
    expect(tools.sum([3, 4])).toBe(7)
})

test('数组平均值', () => {
    expect(tools.average([3, 4])).toBe(3.5)
})

test('获取全局键值', () => {
    expect(tools.getValueForGlobalKey()).toBe()

    delete window.location
    Object.defineProperty(window, 'location', {
        value: {
            href: 'https://www.baidu.com',
            search: '?a=1&b=2&appVersion=2.0.0',
            hash: '#/?c=3&d=4&appVersion=2.0.0',
        },
        configurable: true,
    })
    expect(tools.getValueForGlobalKey('appVersion')).toBe('2.0.0')

    delete window.location
    Object.defineProperty(window, 'location', {
        value: {
            href: 'https://www.baidu.com',
            search: '?a=1&b=2',
            hash: '#/?c=3&d=4',
        },
        configurable: true,
    })
    expect(tools.getValueForGlobalKey('appVersion', '1.0.0')).toBe('1.0.0')
})

test('获取app版本号', () => {
    expect(tools.getAppVersion()).toBe('')

    navigator.userAgent =
        'appVersion/2.0.0 softwareVersion/325 platform/fosunhani-iOS model/iPhone uuid/B6F31FD8-B634-4996-B67A-2E270B1AD76F appId/com.fosunhani.stock.debug nt/5G systemVersion/15.4.1 sp/CMCC channelId/applestore langType/zhCn skinType/black priceColorType/1 insidePage/false debuggale/false statusBarHeight/47.0'

    expect(tools.getAppVersion()).toBe('2.0.0')
})
// ---- 万亮 end ----

// ---- 明宇 start ----
test('去除html标签', () => {
    expect(tools.removeHtmltag('<div class="class-str">')).toBe('')
})

test('url编码', () => {
    expect(tools.urlEncode({ testq: '123' }, 'a')).toBe('a.testq=123')
    expect(tools.urlEncode({ testq: '123' }, undefined)).toBe('testq=123')
    expect(tools.urlEncode(['123'], 'a')).toBe('a[0]=123')
    expect(tools.urlEncode('123', 'testq', false)).toBe('testq=123')
    expect(tools.urlEncode('%123', 'testq', true)).toBe('testq=%25123')
    expect(tools.urlEncode(null)).toBe('')
})

test('追加url参数', () => {
    expect(tools.appendQuery('/pages/openAccount.html#/?langType=zhCn', 'testq', '123')).toBe('/pages/openAccount.html#/?langType=zhCn&testq=123')
    expect(tools.appendQuery('/pages/openAccount.html#/', 'testq', '123')).toBe('/pages/openAccount.html#/?testq=123')
})

test('动态引入js', () => {
    // 先判断是否有script dom
    const scriptDom = document.getElementsByTagName('script')[0]
    if (!scriptDom) {
        const s = document.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        s.src = 'root'
        const t = document.getElementsByTagName('html')[0]
        t.appendChild(s)
    }

    tools.injectScript('https://www.baidu.com/')

    expect(document.getElementsByTagName('script')[0].src).toBe('https://www.baidu.com/')
})

test('根据url地址下载', () => {
    let openParams = ''
    window.open = function (url, target) {
        openParams = `${url}|${target}`
    }

    const originUserAgent = navigator.userAgent

    // chrome环境
    navigator.userAgent = `${originUserAgent};chrome`
    const result1 = tools.download('https://www.baidu.com/')
    expect(result1).toBe(true)

    // 其他环境
    navigator.userAgent = originUserAgent
    const result2 = tools.download('https://www.baidu.com/')
    expect(result2).toBe(true)
    expect(openParams).toBe('https://www.baidu.com/?download|_self')
})

test('el是否包含某个class', () => {
    expect(tools.hasClass({ className: 'testClassName' }, '123')).toBe(false)
    expect(tools.hasClass({ className: 'testClassName' }, 'testClassName')).toBe(true)
})

test('el添加某个class', () => {
    const el = { className: 'testClassName' }

    tools.addClass(el, 'testClassName')
    expect(el.className).toBe('testClassName')

    tools.addClass(el, 'testClassName1')
    expect(el.className).toBe('testClassName testClassName1')
})

test('el去除某个class', () => {
    const el = { className: 'testClassName testClassName1' }

    tools.removeClass(el, 'testClassName2')
    expect(el.className).toBe('testClassName testClassName1')

    tools.removeClass(el, 'testClassName1')
    expect(el.className).toBe('testClassName ')
})
// ---- 明宇 end ----

test('控制 输入浮点数限制', () => {
    const e = {
        target: {
            value: '111.11',
        },
    }

    tools.noFixed(e)
    expect(e.target.value).toBe('111.1')

    e.target.value = 'xxx'
    tools.noFixed(e)
    expect(e.target.value).toBe(null)

    e.target.value = '11.'
    tools.noFixed(e)
    expect(e.target.value).toBe('11.')

    e.target.value = '.22'
    tools.noFixed(e)
    expect(e.target.value).toBe('.2')

    e.target.value = '22.1xx'
    tools.noFixed(e)
    expect(e.target.value).toBe('22.1')
})

test('检查是否有这个字符', () => {
    expect(tools.indexOf('111', '1')).toBe(true)
    expect(tools.indexOf()).toBe(true)
    expect(tools.indexOf('1')).toBe(false)
    expect(tools.indexOf('', '1')).toBe(false)
    expect(tools.indexOf('', 1)).toBe(false)
})

test('函数节流器', () => {
    jest.useFakeTimers()
    // 定义一个Mock函数
    const mockFn = jest.fn(a => {
        console.log(a)
    })

    // 封装为节流方法
    const fn = tools.throttle(mockFn, 100)

    // 同步调用两次
    fn(1)
    fn(2)

    const calls1 = mockFn.mock.calls

    // 断言 mock方法只调用一次
    expect(calls1.length).toBe(1)
    // 根据参数判断以第一次调用为准
    expect(calls1[0][0]).toBe(1)

    // Fast-forward until all timers have been executed
    jest.advanceTimersByTime(110)
    fn(3)
    const calls2 = mockFn.mock.calls

    // 断言 mock方法只调用一次
    expect(calls2.length).toBe(2)
    // 根据参数判断以第一次调用为准
    expect(calls2[0][0]).toBe(1)
})

test('route对象转url字符串', () => {
    const query = {}
    const route = {
        path: '',
    }
    expect(tools.route2Url()).toBe('undefined') // 无参数
    expect(tools.route2Url(route)).toBe('') // 无query属性

    route.query = query
    expect(tools.route2Url(route)).toBe('') // query为空对象
    query.a = 1
    query.b = 2
    expect(tools.route2Url(route)).toBe('?a=1&b=2')

    route.path = 'wealth/fund.html'
    expect(tools.route2Url(route)).toBe('wealth/fund.html?a=1&b=2')
})

test('是否安卓', () => {
    expect(tools.isAndroid()).toBe(false)

    navigator.userAgent = 'aaa Android xxx'
    expect(tools.isAndroid()).toBe(true)

    navigator.userAgent = 'aaa Linux xxx'
    expect(tools.isAndroid()).toBe(true)

    navigator.userAgent = 'aaa linux xxx'
    expect(tools.isAndroid()).toBe(false)
})

test('生成映射对象', () => {
    let arr = []
    let result = tools.generateMap(arr)
    const emptyObject = JSON.stringify({})
    expect(result.options.length).toBe(0)
    expect(result.optionsWithAll.length).toBe(1)
    expect(JSON.stringify(result.keyValueMap)).toBe(emptyObject)
    expect(JSON.stringify(result.valueKeyMap)).toBe(emptyObject)
    expect(JSON.stringify(result.keysMap)).toBe(emptyObject)
    expect(JSON.stringify(result.KeyInteralMap)).toBe(emptyObject)

    arr = [
        ['hk', '港元', 'HK'],
        ['us', '美元', 'HK'],
        ['cnh', '人民币', 'CNH'],
    ]
    result = tools.generateMap(arr)
    expect(result.options.findLabel('hk', '')).toBe('港元')
    expect(result.options.findLabel('EUR', '')).toBe('--')
})

test('url参数拼接', () => {
    expect(tools.addQueryStr('/list')).toBe('/list')
    expect(
        tools.addQueryStr('/list', {
            name: 123,
        })
    ).toBe('/list?name=123')
    expect(
        tools.addQueryStr('/list', {
            name: 123,
            a: 1,
            b: 2,
        })
    ).toBe('/list?name=123&a=1&b=2')
    expect(
        tools.addQueryStr('/list?name=123', {
            type: 456,
        })
    ).toBe('/list?name=123&type=456')
    expect(
        tools.addQueryStr('/list?name=123', {
            type: 456,
            a: 1,
            b: 2,
        })
    ).toBe('/list?name=123&type=456&a=1&b=2')
})
