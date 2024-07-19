/* eslint-disable no-prototype-builtins */
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import Vue from 'vue'
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
import { getRunEnv } from './env'
import dayjs from 'dayjs'
import NP from 'number-precision'
import { ENCRYPT_TYPES } from '@/httpRequest/encrypt'

window.logger = (...arg) => {
    if (process.env.VUE_APP_ENV !== 'prod') {
        console.log.call(null, ...arg)
    }
}

String.prototype.format = function () {
    var args = arguments
    return this.replace(/{(\d+)}/g, function (m, i) {
        return args[i] || ''
    })
}

String.prototype.toMoney = function () {
    return (
        this &&
        this.toString().replace(/\d+/, function (s) {
            return s.replace(/(\d)(?=(\d{3})+$)/g, '$1,')
        })
    )
}

String.prototype.bean = function (digit = 4, sep = ' ') {
    const reg = new RegExp(`(\\d{${digit}})(?=\\d)`, 'g')
    return this.replace(reg, '$1' + sep)
}

Array.prototype.remove = function (val) {
    var index = this.indexOf(val)
    if (index > -1) {
        this.splice(index, 1)
    }
}

Date.prototype.format = function (format) {
    format = format || 'yyyy-MM-dd HH:mm:ss'
    const f = function (m) {
        return m < 10 ? `0${m}` : m
    }
    let str = format.replace('yyyy', this.getFullYear())
    str = str.replace('MM', f(this.getMonth() + 1))
    str = str.replace('dd', f(this.getDate()))
    str = str.replace('HH', f(this.getHours()))
    str = str.replace('mm', f(this.getMinutes()))
    str = str.replace('ss', f(this.getSeconds()))
    return str
}

const isMobileTerminal = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent)

// 64 位随机字符串
// const randomString = () => {
//   const str = '!@#*&%())#'
//   const date = new Date().getTime() + ''
//   const _str = md5(str + date) + md5(date)
//   return _str
// }

/**
 * 保留小数位，非四舍五入
 * @param {*} data 输入的值
 * @param {*} num   保留几位
 * @param {*} relax   可选 Boolean 不严格保留小数位数   如：输入 234.2,3,true 输出234.2 ｜ 输入234.555555,3,true 输出 234.555
 * @returns
 */
// const toFixed = function (data, num, relax) {
//   let dataLength = `${data}`.length
//   data = Number(data).toFixed(10)
//   let _digit = num ? data.lastIndexOf('.') + num + 1 : data.lastIndexOf('.')
//   if (data.lastIndexOf('.') + num + 1 < dataLength) {
//     dataLength = data.lastIndexOf('.') + num + 1
//   }
//   data = relax ? data.substring(0, dataLength) : data.substring(0, _digit)
//   return data
// }
const toFixed = function (data, num, relax) {
    let dataLength = `${data}`.length
    data = data.toString()
    if (data.lastIndexOf('.') === -1) data = data + '.000000000'
    // 整数只到10位，含小数时，整数只能是9位
    if (data.lastIndexOf('.') >= 10 && relax) return data.substring(0, 10)
    const _digit = num ? data.lastIndexOf('.') + num + 1 : data.lastIndexOf('.')
    if (data.lastIndexOf('.') + num + 1 < dataLength) {
        dataLength = data.lastIndexOf('.') + num + 1
    }
    // 补充小数位
    const dataArr = data.split('.')
    if (num && dataArr[1].length < num) {
        dataArr[1] = dataArr[1] + '000000000'
    }
    data = dataArr.join('.')
    data = relax ? data.substring(0, dataLength) : data.substring(0, _digit)
    return data
}
//部分密文显示
const ciphertext = function (value, start, end) {
    value = value + ''
    const _s = value.substring(0, start || 3)
    const _e = value.substring(value.length - end || 3, value.length)
    return `${_s}****${_e}`
}

// 密文只显示最后4位
const ciphertextLast4 = (value = '', rep = '*') => {
    let ico = '**** **** ****'
    if (rep && rep != '*') {
        ico = ico.replace(/\*/g, rep)
    }
    const sliceNum = value ? value.slice(value.length - 4, value.length) : value
    return `${ico} ${sliceNum}`
}

/**
 * //银行卡号、金额 指定分割
 * @param {*} value
 * @param {*} len 分割长度
 * @param {*} placeholder 占位符
 * 示例：637878397839 =》 6378 7839 7839
 */
const cardNumberDivision = (value = '', len = 4, placeholder = ' ') => {
    if (!value) return value
    const times = Math.ceil(value.length / len)
    const newArr = []
    for (let i = 0; i <= times; i++) {
        if (i * len >= value.length) {
            break
        }
        newArr.push(value.slice(i * len, (i + 1) * len))
    }
    return newArr.join(placeholder)
}

//获取客户端类型
const getPhonePlatform = () => {
    let _platform = 'h5'
    const isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Linux') > -1
    if (isAndroid) {
        _platform = 'android'
    }
    const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
    if (isiOS) {
        _platform = 'ios'
    }
    return _platform
}

// 移除结尾0
const removeEndZero = function (str) {
    // str = Number(str)
    str = str.toString().split('.')
    if (str[1]) {
        str[1] = str[1].replace(/[0]+$/, '')
    }
    return str[1] && str[1].length ? str.join('.') : str.join('')
}

// 如果是 '' 默认为 0.00 显示
const defaultZero = function (value) {
    return value === '' ? '0.00' : value
}

/*倒计时
t 倒计时长，单位秒
opt 参数
callback Function 带当前倒计时时间参数回调
format  String 倒计时模板
finished Function 倒计时完毕回调执行函数
 */
const countDown = function (t, opt) {
    const format = opt.format || 'dd HH:mm:ss'
    var f = function (m) {
        return m < 10 ? '0' + m : m
    }

    function a() {
        t = Math.max(t - 1, 0)
        if (t <= 0) {
            clearInterval(interval)
            typeof opt.finished === 'function' && opt.finished()
        }
        let str = format
        str = str.replace('dd', f(Math.floor(t / (60 * 60 * 24))))
        str = str.replace('HH', f(Math.floor(t / (60 * 60))))
        str = str.replace('mm', f(Math.floor(t / 60)))
        str = str.replace('ss', f(Math.floor(t % 60)))
        if (typeof opt.callback === 'function') {
            opt.callback(str)
        }
    }
    a()
    const interval = setInterval(a, 1000)
    return interval
}

//固定显示长度不足补0
const fitLen = function (num, length) {
    num = '0'.repeat(length) + num
    return num.slice(num.length - length)
}

//检测颜色值是否为亮色
const isLightColor = function (hexString) {
    if (hexString.charAt(0) !== '#') {
        hexString = '#' + hexString
    }
    if (hexString.length === 4) {
        const split = hexString.split('')
        hexString = '#' + split[1] + split[1] + split[2] + split[2] + split[3] + split[3]
    }

    hexString = hexString.substring(hexString.length - 6, hexString.length)
    const _r = parseInt('0x' + hexString.slice(0, 2))
    const _g = parseInt('0x' + hexString.slice(2, 4))
    const _b = parseInt('0x' + hexString.slice(4, 6))
    const _light = _r * 0.299 + _g * 0.587 + _b * 0.114
    return _light >= 192 ? true : false
}

// 数字人性化显示
// eslint-disable-next-line max-params
const humanNum = function (number, digit = 2, edgeCase = false, i18n, params = {}) {
    try {
        const { needQianWanUnit = false, needQianUnit = false, relax = false } = params
        // eslint-disable-next-line prefer-const
        let _n = parseFloat(number),
            rst,
            unit = ''
        if (edgeCase ? _n / 100000000 >= 1 : _n / 100000000 > 1) {
            rst = _n / 100000000
            unit = i18n ? i18n.t('yi') : '亿'
        } else if (needQianWanUnit && (edgeCase ? _n / 10000000 >= 1 : _n / 10000000 > 1)) {
            rst = _n / 10000000
            unit = i18n ? i18n.t('qianwan') : '千万'
        } else if (edgeCase ? _n / 10000 >= 1 : _n / 10000 > 1) {
            rst = _n / 10000
            unit = i18n ? i18n.t('wan') : '万'
        } else if (needQianUnit && (edgeCase ? _n / 1000 >= 1 : _n / 1000 > 1)) {
            rst = _n / 1000
            unit = i18n ? i18n.t('qian') : '千'
        } else {
            rst = _n
        }
        return toFixed(rst, digit, relax) + unit
    } catch (e) {
        console.log('🚀 ~ humanNum ~ e', e)
        return number
    }
}

//时间格式人性化
const humanTime = function (msec, options = {}) {
    const { minutesLen = 2 } = options

    var days = parseInt(msec / 1000 / 60 / 60 / 24, 10) //计算剩余的天数
    var hours = parseInt((msec / 1000 / 60 / 60) % 24, 10) //计算剩余的小时
    var minutes = parseInt((msec / 1000 / 60) % 60, 10) //计算剩余的分钟
    var second = parseInt((msec / 1000) % 60, 10) //计算剩余的分钟
    days = fitLen(days, 2)
    hours = fitLen(hours, 2)
    minutes = fitLen(minutes, minutesLen)
    second = fitLen(second, 2)
    return {
        days,
        hours,
        minutes,
        second,
    }
}

//判断是否为空对象、空数组
const isEmpty = function (obj) {
    //检验null和undefined
    if (!obj && obj !== 0 && obj !== '') {
        return true
    }
    //检验数组
    if (Array.prototype.isPrototypeOf(obj) && obj.length === 0) {
        return true
    }
    //检验对象
    if (Object.prototype.isPrototypeOf(obj) && Object.keys(obj).length === 0) {
        return true
    }
    return false
}

/**
 * 如果target(也就是FirstOBJ[key])存在，
 * 且是对象的话再去调用deepObjectMerge，
 * 否则就是FirstOBJ[key]里面没这个对象，需要与SecondOBJ[key]合并
 */
const deepObjectMerge = function (FirstOBJ, SecondOBJ) {
    // 深度合并对象
    for (const key in SecondOBJ) {
        FirstOBJ[key] =
            FirstOBJ[key] && FirstOBJ[key].toString() === '[object Object]'
                ? deepObjectMerge(FirstOBJ[key], SecondOBJ[key])
                : (FirstOBJ[key] = SecondOBJ[key])
    }
    return FirstOBJ
}

// 函数防抖：
const debounce = function (func, wait, immediate = false) {
    let timer = null,
        result
    return function () {
        const self = this
        const args = arguments
        if (timer) {
            clearTimeout(timer)
            timer = null
        }

        if (immediate) {
            const callNow = !timer
            timer = setTimeout(function () {
                timer = null
            }, wait)
            if (callNow) result = func.apply(self, args)
        } else {
            timer = setTimeout(function () {
                func.apply(self, args)
            }, wait)
        }
        return result
    }
}

/*
连按五次打开\关闭调试
@skip 是否跳过5次点击动作直接显示调试器
 */
let vConsole = null,
    vi = 0
const toggleDebug = function (skip) {
    vi++
    if (vi % 5 === 0 || skip) {
        if (vConsole) {
            vConsole.destroy()
            vConsole = null
        } else {
            import('vconsole').then(({ default: vconsole }) => {
                vConsole = new vconsole()
            })
        }
    }
}

//兼容H5 与App 打开网址或pdf文件
// const openURL = ({url='', title='', text='', navbar=true}={}, newWindow=false)=>{
//   const pdfBase = 'https://m.youyu.cn/c/hybrid/pdf/'
//   const htmlBase = 'https://m.youyu.cn/c/hybrid/html/'
//   const BaseUrl = {pdf:pdfBase, html:htmlBase}
//   const type = text?'text':(url.toLowerCase().includes('.pdf')?'pdf':'html')
//   let path = url.includes('http')?url:BaseUrl[type]+url
//   if(type=='text'){
//     VM.$router.push({name:'iframe', params:{title, text}})
//   } else {
//     if(Bridge.isInApp){
//       if(type=='pdf'){
//         Bridge.previewDocument({
//           url: path,
//           title,
//           type,
//         })
//       } else {
//         Bridge.jumpWithPrivateURL({
//           url:`yystock://webView?url=${encodeURIComponent(path)}`
//         })
//       }
//     } else {
//       if(type=='pdf'){
//         window.open(path)
//       } else {
//         if(newWindow){
//           window.open(path)
//         } else {
//           VM.$router.push({name:'iframe', params:{title, url:path, navbar}})
//         }
//       }
//     }
//   }

// }

//调用腾讯云滑块验证
// const captchaQQ = callback=>{
//   const captcha_qq = new TencentCaptcha('2040163076', res=>{
//     callback && callback(res)
//   }, {
//     enableDarkMode: localStorage.getItem('theme')=='dark'?'force':false,
//     needFeedBack:false
//   })
//   return captcha_qq
// }

//密码设置规则验证，密码长度8-20位且至少包含大写字母、小写字母、数字或特殊符号中的任意三种
const isPassword = val => {
    const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_]+$)(?![a-z0-9]+$)(?![a-z\\W_]+$)(?![0-9\\W_]+$)[a-zA-Z0-9\\W_]{8,20}$')
    return reg.test(val)
}

/**
 * 转换公私钥为标准pem格式
 * @param {string} str
 * @returns string
 */
const formatAsPem = str => {
    var typeString = 'PUBLIC KEY'
    var finalString = '-----BEGIN ' + typeString + '-----\n'
    while (str.length > 0) {
        finalString += str.substring(0, 64) + '\n'
        str = str.substring(64)
    }
    finalString = finalString + '-----END ' + typeString + '-----'
    return finalString
}

/**
 * 创建uuid5
 * @param {string} uin
 * @returns string
 */
const generateUUID = (uin = '') => {
    return uuidv5(uin + new Date().valueOf() + '', uuidv4())
        .split('-')
        .join('')
}

const blobToDataURL = blob => {
    return new Promise(resolve => {
        const a = new FileReader()
        a.onload = function (e) {
            resolve(e.target.result)
        }
        a.readAsDataURL(blob)
    })
}

// 是否竖屏
const isPortrait = () => {
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight
    return width < height
}

// 是否横屏
const isLandscape = () => {
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight
    return width >= height
}

const dataURLtoBlob = (dataurl, { toFile = false, filename = 'unknown', type = 'image/jpeg' } = {}) => {
    // 获取到base64编码
    const arr = dataurl.split(',')
    // 将base64编码转为字符串
    const bstr = window.atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n) // 创建初始化为0的，包含length个元素的无符号整型数组
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    if (toFile) {
        return new File([u8arr], filename, {
            type,
        })
    }
    return new Blob([u8arr], {
        type,
    })
}
/**
 * 获取指定长度的字符串(数字+字母)
 * @param n 长度
 * @returns 字符串
 */
const getRndStr = (n, ishex = false) => {
    let str = ''
    // 若是16进制，则取前6个字母
    const letterNum = ishex ? 6 : 26
    const total = ishex ? 22 : 62
    const upperNum = ishex ? 16 : 36
    for (let i = 0; i < n; i++) {
        const tmp = Math.floor(getSafeRandom() * total)
        if (tmp < 10) {
            // 数字
            str += Math.floor(getSafeRandom() * 10)
        } else if (tmp < upperNum) {
            // 大写字母
            str += String.fromCharCode(Math.floor(65 + getSafeRandom() * letterNum))
        } else {
            // 小写字母
            str += String.fromCharCode(Math.floor(97 + getSafeRandom() * letterNum))
        }
    }
    return str
}

/**
 * 获取安全的随机数(0-1)
 * @returns {Number}
 */
const getSafeRandom = () => {
    return crypto.getRandomValues(new Uint8Array(1))[0] / 256
}

/**
 * 动态设置元素字体
 * @returns Function
 */
function generateDynamicFontSize() {
    /**
     * reduce: 字体递减
     * increase: 字体递增
     * dom: 需要设置字体的dom
     * minFontSize: 最低字体
     * maxFontSize: 最大字体
     * context: 上下文 ==> vm
     */
    function resetReduceCount(dom) {
        dom.reduceCount = 0
    }
    const baseOptions = {
        reduce: true,
        increase: false,
        dom: 'dynamic',
        maxReduceCount: 20,
        minFontSize: 10,
        maxFontSize: 24,
        context: (() => new Vue())(),
        interval: 2,
    }
    function calcFontSize(options = {}) {
        options = { ...baseOptions, ...options }
        Vue.nextTick(() => {
            // const MIN_FONT_SIZE = 10
            // const MAX_FONT_SIZE = 24
            const dom = options.dom
            const dynamicDom = dom instanceof HTMLElement ? dom : options.context.$refs[options.dom] || document.getElementById(options.dom)
            if (!(dynamicDom instanceof HTMLElement)) {
                console.warn('没拿到dom就表示数据未渲染')
                return // 没拿到dom就表示数据未渲染
            }
            // 先获取内容
            if (dynamicDom?.reduceCount === undefined) {
                dynamicDom.reduceCount = 0
            }
            dynamicDom.reduceCount++
            if (dynamicDom.reduceCount > options.maxReduceCount) {
                console.warn('---字体超出浏览器限制阈值,可在浏览器设置字体限制---')
                resetReduceCount(dynamicDom)
                return
            }
            const dynamicDomComputedStyle = getComputedStyle(dynamicDom)
            const dynamicDomWidth = Number.parseFloat(dynamicDomComputedStyle.width, 10) // 190px ==> 190
            const dynamicFontsize = Number.parseFloat(dynamicDomComputedStyle.fontSize, 10) // 18px ==> 18
            // debugger // eslint-disable-line
            // console.log('dynamicDomWidth ====> ', dynamicDomWidth)
            let copyDom = options.copyDom
            if (!copyDom) {
                copyDom = dynamicDom.cloneNode(true)
                const style = {
                    display: 'inline-block',
                    'text-overflow': 'auto',
                    width: 'auto',
                    visibility: 'hidden',
                    'font-weight': dynamicDomComputedStyle.fontWeight,
                }
                if (options.increase) {
                    style.width = dynamicDomWidth + 'px' //递增字体则需要设置宽度
                }
                copyDom.style = Object.entries(style).reduce((str, [key, val]) => ((str += `${str}${key}: ${val};`), str), '')
                document.body.appendChild(copyDom)
            }
            copyDom.style.fontSize = dynamicFontsize + 'px'
            copyDom.textContent = dynamicDom.textContent
            const copyDomComputedStyle = getComputedStyle(copyDom)
            const copyDomWidth = Number.parseFloat(copyDomComputedStyle.width, 10)
            // cacheDom = copyDom
            // console.log('copyDomWidth====> ', copyDomWidth)
            // 递增和递减只能同时支持一种
            if (options.reduce) {
                if (dynamicFontsize > options.minFontSize && copyDomWidth > dynamicDomWidth) {
                    dynamicDom.style.fontSize = dynamicFontsize - options.interval + 'px'
                    dynamicFontSize({ ...options, copyDom })
                } else {
                    resetReduceCount(dynamicDom)
                    document.body.removeChild(copyDom)
                }
            } else {
                if (options.increase && copyDomWidth >= dynamicDomWidth && dynamicFontsize < options.maxFontSize) {
                    dynamicDom.style.fontSize = dynamicFontsize + options.interval + 'px'
                    dynamicFontSize({ ...options, copyDom })
                } else {
                    resetReduceCount(dynamicDom)
                    document.body.removeChild(copyDom)
                }
            }
        })
    }
    calcFontSize.clear = () => {
        // cacheDom = null
    }

    return calcFontSize
}
/**
 * 自动补0
 * @returns '0'+date
 */
function addO(date) {
    if (date < 10) {
        return '0' + date
    }
    return date
}
/**
 * 获取近一周时间
 * @returns Object {start:开始时间,end:结束日期}
 */
const getNearWeek = (endDate = new Date(), options = {}) => {
    const end = endDate
    const { gap = '/' } = { ...options }
    const year = end.getFullYear()
    const month = end.getMonth() + 1 //0-11表示1-12月
    const day = end.getDate()
    const dateObj = {}
    dateObj.end = year + gap + addO(month) + gap + addO(day)
    if (day - 7 <= 0) {
        //如果在当月7日之前
        const startMonthDay = new Date(year, parseInt(month) - 1, 0).getDate() //1周前所在月的总天数
        if (month - 1 <= 0) {
            //如果在当年的1月份
            dateObj.start = year - 1 + gap + 12 + gap + addO(31 - (7 - day))
        } else {
            dateObj.start = year + gap + addO(month - 1) + gap + addO(startMonthDay - (7 - day))
        }
    } else {
        dateObj.start = year + gap + addO(month) + gap + addO(day - 7)
    }
    return dateObj
}
/**
 * 获取近一月时间
 * @returns Object {start:开始时间,end:结束日期}
 */
const getNearMonth = (endDate = new Date(), options = {}) => {
    const end = endDate
    const { gap = '/' } = { ...options }
    const year = end.getFullYear()
    const month = end.getMonth() + 1 //0-11表示1-12月
    const day = end.getDate()
    const dateObj = {}
    dateObj.end = year + gap + addO(month) + gap + addO(day)
    const endMonthDay = new Date(year, month, 0).getDate() //当前月的总天数
    if (month - 1 <= 0) {
        //如果是1月，年数往前推一年
        dateObj.start = year - 1 + gap + 12 + gap + day
    } else {
        const startMonthDay = new Date(year, parseInt(month) - 1, 0).getDate()
        if (startMonthDay < day) {
            //1个月前所在月的总天数小于现在的天日期
            if (day < endMonthDay) {
                //当前天日期小于当前月总天数
                dateObj.start = year + gap + addO(month - 1) + gap + addO(startMonthDay - (endMonthDay - day))
            } else {
                dateObj.start = year + gap + addO(month - 1) + gap + addO(startMonthDay)
            }
        } else {
            dateObj.start = year + gap + addO(month - 1) + gap + addO(day)
        }
    }
    return dateObj
}
/**
 * 获取近三月时间
 * @returns Object {start:开始时间,end:结束日期}
 */
const getNearThreeMonth = (endDate = new Date(), options = {}) => {
    const end = endDate
    const { gap = '/' } = { ...options }
    const year = end.getFullYear()
    const month = end.getMonth() + 1 //0-11表示1-12月
    const day = end.getDate()
    const dateObj = {}
    dateObj.end = year + gap + addO(month) + gap + addO(day)
    const endMonthDay = new Date(year, month, 0).getDate() //当前月的总天数
    if (month - 3 <= 0) {
        //如果是1、2、3月，年数往前推一年
        const start3MonthDay = new Date(year - 1, 12 - (3 - parseInt(month)), 0).getDate() //3个月前所在月的总天数
        if (start3MonthDay < day) {
            //3个月前所在月的总天数小于现在的天日期
            dateObj.start = year - 1 + gap + addO(12 - (3 - month)) + gap + addO(start3MonthDay)
        } else {
            dateObj.start = year - 1 + gap + addO(12 - (3 - month)) + gap + addO(day)
        }
    } else {
        const start3MonthDay = new Date(year, parseInt(month) - 3, 0).getDate() //3个月前所在月的总天数
        if (start3MonthDay < day) {
            //3个月前所在月的总天数小于现在的天日期
            if (day < endMonthDay) {
                //当前天日期小于当前月总天数,2月份比较特殊的月份
                dateObj.start = year + gap + addO(month - 3) + gap + addO(start3MonthDay - (endMonthDay - day))
            } else {
                dateObj.start = year + gap + addO(month - 3) + gap + addO(start3MonthDay)
            }
        } else {
            dateObj.start = year + gap + addO(month - 3) + gap + addO(day)
        }
    }
    return dateObj
}

/**
 * 获取近N月时间
 * params: monthGap 间隔的月数
 * @returns Object {start:开始时间,end:结束日期}
 */
const getNearNMonth = (monthGap, endDate = new Date(), options = {}) => {
    const end = endDate
    const { gap = '/' } = options
    const year = end.getFullYear()
    const month = end.getMonth() + 1 //0-11表示1-12月
    const day = end.getDate()
    const dateObj = {}
    dateObj.end = year + gap + addO(month) + gap + addO(day)
    const endMonthDay = new Date(year, month, 0).getDate() //当前月的总天数
    if (month - monthGap <= 0) {
        //如果是1、2、3月，年数往前推一年
        const start3MonthDay = new Date(year - 1, 12 - (monthGap - parseInt(month)), 0).getDate() //3个月前所在月的总天数
        if (start3MonthDay < day) {
            //3个月前所在月的总天数小于现在的天日期
            dateObj.start = year - 1 + gap + addO(12 - (monthGap - month)) + gap + addO(start3MonthDay)
        } else {
            dateObj.start = year - 1 + gap + addO(12 - (monthGap - month)) + gap + addO(day)
        }
    } else {
        const start3MonthDay = new Date(year, parseInt(month) - monthGap, 0).getDate() //3个月前所在月的总天数
        if (start3MonthDay < day) {
            //3个月前所在月的总天数小于现在的天日期
            if (day < endMonthDay) {
                //当前天日期小于当前月总天数,2月份比较特殊的月份
                dateObj.start = year + gap + addO(month - monthGap) + gap + addO(start3MonthDay - (endMonthDay - day))
            } else {
                dateObj.start = year + gap + addO(month - monthGap) + gap + addO(start3MonthDay)
            }
        } else {
            dateObj.start = year + gap + addO(month - monthGap) + gap + addO(day)
        }
    }
    return dateObj
}

const dynamicFontSize = generateDynamicFontSize()

/**
 * 文字复制
 * @param {HTMLElement|String} dom dom元素
 */
const copyText = dom => {
    dom = dom instanceof HTMLElement ? dom : document.querySelector(dom)
    const rect = dom.getBoundingClientRect()
    const input = document.createElement('input')
    input.setAttribute('readonly', 'readonly')
    input.setAttribute('value', dom.textContent)
    input.style = `position: fixed; opacity: 0; top: ${rect.top}; left: ${rect.left}`
    // input.style = 'visibility: hidden;'
    document.body.appendChild(input)
    // input.select() // 有说在ios会出现失效问题
    input.focus()
    input.setSelectionRange(0, input.value.length) // 暂时无法生效
    const res = document.execCommand('copy') // 虽然规范说会弃置，但浏览器大概率不会
    document.body.removeChild(input)
    return res
}

// 将当前页面的链接参数附加到给定的链接，返回完整的链接
/*
example1:
    url: 'http://h5-sit.xingyunplan.com/pages/fund.html#/'
    location.href: 'https://h5-sit.xingyunplan.com/wealth/fund.html#/?wtToken=222&sub=123456'
    return: http://h5-sit.xingyunplan.com/pages/fund.html#/?wtToken=222&sub=123456
example2:
    url: '/wealth/fund.html?test=111'
    location.href: 'https://h5-sit.xingyunplan.com/wealth/fund.html#/?wtToken=222&sub=123456'
    return: 'https://h5-sit.xingyunplan.com/wealth/fund.html?test=111?wtToken=222&sub=123456'
*/
export const addCurParamsForUrl = (url = '', options = {}) => {
    options = Object.assign({}, { needAddProtocol: true }, options)
    const getUrlQuerys = (url = '') => {
        const reg = /\?([^?#])+/g
        const queryStrings = []
        const matchs = url.match(reg) || []
        matchs.reduce((o, str) => {
            str = str.replace(/^\?/, '')
            str.split('&').forEach(i => {
                const res = i.split('=')
                o.push(res)
            })
            return o
        }, queryStrings)
        return queryStrings
    }

    const addQuerys = (url = '', querys) => {
        const newQuerys = getUrlQuerys(url)
        const resObj = {}
        const querysList = [...querys, ...newQuerys]
        querysList.forEach(([k, v]) => {
            resObj[k] = v
        })

        querys = Object.entries(resObj)
        let queryString = querys.reduce((str, [k, v]) => ((str += `${k}=${v}&`), str), '').replace(/&$/, '')
        if (!queryString) return url

        queryString = '?' + queryString
        if (/\?/.test(url)) {
            const end = url.indexOf('?')
            url = url.slice(0, end)
        }

        return `${url}${queryString}`
    }

    const urlQuerys = getUrlQuerys(location.href)
    if (options.needAddProtocol) {
        if (!/^http(s?)/.test(url)) {
            url = `${location.origin}${url}`
        }
    }
    return addQuerys(url, urlQuerys)
}

/**
 * 客服系统链接拼接获取及相应处理
 * 五个参数：
 * userid = subAccountId
 * hlid = hlid
 * entry_type = 一级来源,如： 来源是app、官网、同花顺
 * channel = 二级渠道来源，暂时预留，与一级来源并用，如app的开户模块、app的出入金模块
 *
 * phone 客户手机号 ！注：手机号仅在 subAccountId、hlId、clientId 都没有的时候才上传
 * clientId 客户号
 *
 * url = false   //true:只返回获取拼接好的 url 而不做客服跳转处理, false: 不返回处理好的url,直接做客服跳转
 */
const customerService = ({ userid = '', hlid = '', entry_type = '', channel = '', phone = '', clientId = '', url = false } = {}) => {
    const EntryType = entry_type || (getRunEnv() == 2 ? 'wt' : 'xcf') // 星财富APP或者站外H5: xcf; 官网:gw; 公众号:gzh; 同花顺版:oem; 星财富PC版:pc; 网厅:wt
    const getUserid = userid || sessionStorage.getItem('sub') || ''
    const getHlid = hlid || sessionStorage.getItem('hlId') || ''
    const getUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    let getPhone = phone || getUserInfo.phone || ''
    const getClientId = clientId || getUserInfo?.clientInfo?.accts[0]?.cltId || ''

    /** 注：手机号仅在 subAccountId、hlId、clientId 都没有的时候才上传 */
    if (getUserid || getHlid || getClientId) {
        getPhone = ''
    }
    const cs_url =
        process.env.VUE_APP_CUSTOMER_SERVICE +
        `?subAccountId=${getUserid}&hlId=${getHlid}&entry_type=${EntryType}&channel=${channel}&phone=${getPhone}&clientId=${getClientId}`

    if (url === true) {
        // 如果在业务场景中只是需要克服的链接则在此返回
        return cs_url
    }
    if (JSBridge) {
        JSBridge.contactUs()
    } else {
        window.open(cs_url)
    }
}

/**
 * @name 获取浏览器页面显示支持属性
 */
const getPageVisibleSupportProperty = () => {
    let hidden, state, visibilityChange
    if (typeof document.hidden !== 'undefined') {
        // 默认
        hidden = 'hidden'
        visibilityChange = 'visibilitychange'
        state = 'visibilityState'
    } else if (typeof document.mozHidden !== 'undefined') {
        // 火狐
        hidden = 'mozHidden'
        visibilityChange = 'mozvisibilitychange'
        state = 'mozVisibilityState'
    } else if (typeof document.msHidden !== 'undefined') {
        // IE
        hidden = 'msHidden'
        visibilityChange = 'msvisibilitychange'
        state = 'msVisibilityState'
    } else if (typeof document.webkitHidden !== 'undefined') {
        // google
        hidden = 'webkitHidden'
        visibilityChange = 'webkitvisibilitychange'
        state = 'webkitVisibilityState'
    }
    return {
        hidden,
        state,
        visibilityChange,
    }
}

/**
 * @name 获取交易规则日历节点
 * @param {Object} map 时间映射
 * @param {String} direction 方向 buy/sell
 * @param {Function} _t 多语言
 * @param {Object} options 参数
 * @param {Boolean} isCurrency 是否货币型基金
 * @param {Boolean} showTradeDate 是否显示交易日期 T
 * @param {Boolean} freezeSuffix 冻结后缀  冻结则固定显示`前`
 * @return {Array}
 */
// eslint-disable-next-line max-params
export const getTradeRuleCalendar = (map = {}, direction = 'buy', _t = () => {}, options = {}) => {
    const defaultOptions = {
        isCurrency: false,
        showTradeDate: false,
        freezeSuffix: false,
        redeemMoney: true,
    }

    const { isCurrency, showTradeDate, freezeSuffix, redeemMoney, time } = { ...defaultOptions, ...options }
    const isBuy = direction === 'buy'
    let cutoffTimeHour = '13'
    let cutoffTimeMinute = '00'
    if (time) {
        const arr = time.split(':')
        cutoffTimeHour = arr[0]
        cutoffTimeMinute = arr[1]
    } else if (isCurrency) {
        cutoffTimeHour = '9'
        cutoffTimeMinute = '45'
    } else {
        // eslint-disable-next-line
        ;[cutoffTimeHour, cutoffTimeMinute] = (map?.cutOffTime || '').split(':')
    }
    const cutoffTime = `${cutoffTimeHour}:${cutoffTimeMinute}`
    let submitPrefix = ''
    let submitSuffix = ''

    let confirmTime = ''
    let profitLossTime = ''

    const submitTime = map.latestTradingDay || ''
    const systemTime = map.systemTime || ''
    if (!submitTime || !systemTime) return []

    const isSameDay = systemTime.slice(0, 10) === submitTime.slice(0, 10)
    if (isSameDay) {
        // 同一天
        submitPrefix = `${_t('jinri')} ${cutoffTime}`
        const nowTime = dayjs(systemTime).valueOf()
        const startTime = dayjs(systemTime).hour(Number(cutoffTimeHour)).minute(Number(cutoffTimeMinute)).second(0).valueOf()
        submitSuffix = freezeSuffix ? _t('prefix') : nowTime >= startTime ? _t('suffix') : _t('prefix')
    } else {
        // 不同天 顺延下个交易日
        submitSuffix = _t('prefix')
        const weekIndexs = ['日', '一', '二', '三', '四', '五', '六']
        const serveWeekIndex = dayjs(systemTime).day()
        const submitWeekIndex = dayjs(submitTime).day()
        if (submitWeekIndex <= serveWeekIndex) {
            // 小于等于的情况必定是下周
            submitPrefix = `${_t('nextWeek')}${weekIndexs[submitWeekIndex]} ${cutoffTime}`
        } else {
            // 大于的场景分 这周几后的日期，和环比下周几的后几天
            // 比如  serveWeekIndex === 5
            /**
             * 大于的场景分 这周几后的日期，和环比下周几的后几天
             * eg: 今天周四, serveWeekIndex === 5,
             *    可能是本周五, 也可能是下周五
             * 如果submitTime - 7day 还是比服务器时间大， 则认为是下周
             */
            const moreThanSeven = dayjs(submitTime).subtract(7, 'day').valueOf() >= dayjs(systemTime).valueOf()
            submitPrefix = `${moreThanSeven ? _t('next') : ''}${_t('week')}${weekIndexs[submitWeekIndex]} ${cutoffTime}`
        }
    }
    if (showTradeDate) {
        if (isBuy) {
            confirmTime = ` T${map.settlementDay ? `+${map.settlementDay}` : ''} 日`
            profitLossTime = ` T+${map.settlementDay + 1} 日`
        } else {
            confirmTime = ` T${map.redeemSettlementDay ? `+${map.redeemSettlementDay}` : ''} 日`
            profitLossTime = isCurrency ? ` T${map.redeemSettlementDay ? `+${map.redeemSettlementDay}` : ''} 日` : `${_t('numInWeekday', { num: 7 })}`
        }
    } else {
        if (isBuy) {
            confirmTime = map.confirmTime ? dayjs(map.confirmTime).format('MM-DD') : '--'
            profitLossTime = map.profitLossTime ? dayjs(map.profitLossTime).format('MM-DD') : '--'
        } else {
            confirmTime = map.confirmTime ? dayjs(map.confirmTime).format('MM-DD') : '--'
            profitLossTime = map.arrivalTime ? dayjs(map.arrivalTime).format('MM-DD') : '--'
        }
    }

    return [
        { key: '1', label: _t(isBuy ? 'subscribeSubmit' : 'redeemSubmit'), message: `${submitPrefix} ${submitSuffix}` },
        {
            key: '2',
            label: _t(isBuy || !redeemMoney ? 'confirmShare' : 'querenjine'),
            message: `${_t('estimate')}${!showTradeDate ? ' ' : ''}${confirmTime}`,
        },
        {
            key: '3',
            label: _t(isBuy ? 'viewProfitAndLoss' : 'redeemCome'),
            message: `${_t('estimate')}${!showTradeDate ? ' ' : ''}${profitLossTime}`,
        },
    ]
}

/**
 * 是否为专业投资者
 * @param {String} professionType 用户专业投资者类型
 * @params {Array} professionTypeList // A、B 是个人PI，P、R是公司PI
 * @returns {Boolean} true - 是 false - 否
 */
export const getProfessionalStatus = function (professionType) {
    const professionTypeList = ['A', 'B', 'P', 'R']
    return professionTypeList.includes(professionType)
}

/**
 * @name 获取股票价格小数位数
 * @param {String} market 市场 hk/us
 * @param {String} price 价格
 * @return {Number}
 */
export const getStockLimitDecimal = function (market, price) {
    let len = 2
    if (market.toUpperCase() === 'US') {
        len = NP.minus(price, 1) >= 0 ? 2 : 4
    }
    if (market.toUpperCase() === 'HK') {
        len = 3
    }
    return len
}

/**
 * 拼接参数 返回一个字符串
 * @param {*} params [['needRisk', 1],['matchRes', 222]]
 * @returns {String} ?needRisk=1&matchRes=2222
 */
const composeParams = function (params = []) {
    const queryString = params.reduce((s, [k, v], index) => {
        const isLast = index === params.length - 1
        s += `${k}=${v}${isLast ? '' : '&'}`
        return s
    }, '?')
    return queryString
}
/**
 * 从localStorage中获取键值，可支持parse
 * @param {String} key 想要获取的Key
 * @param {Boolean} needParse 是否需要JSON.parse localstorage的值
 * @param {*} defaultValue 如果不存在的情况下，需要返回的默认值
 * @returns localstorage里的值|defaultValue
 */
export const getValueFromLocalStorage = (key, needParse = false, defaultValue) => {
    let ret = null
    try {
        ret = localStorage.getItem(key)
        if (needParse) {
            ret = JSON.parse(ret)
        }
        // null|undefined才会采用默认值
        return ret ?? defaultValue
    } catch (e) {
        console.error(e)
        return ret
    }
}

/**
 * 获取小数点位数
 * @param {string | number} value
 * @returns
 */
export function getDecimalCount(value) {
    const valueS = String(value)
    const splits = valueS.split('.')
    if (splits.length === 1) {
        return 0
    }

    return splits[1].length
}

/**
 * 合并
 * @param {Object} basicOption 基础参数
 * @params {Number} basicOption.defaultEncrypt 加密类型 - 默认为ENCRYPT_TYPES.LOGIN
 * @params {Boolean} basicOption.needCommonParam 是否需要 UI你、sub、cltId、acctId等基础用户信息混入
 */
export class Merge {
    constructor(basicOption = {}) {
        this.defaultEncrypt = basicOption.defaultEncrypt ?? ENCRYPT_TYPES.LOGIN
        const needCommonParam = typeof basicOption.needCommonParam === 'boolean' ? basicOption.needCommonParam : true
        this.commonParam = needCommonParam ? this.initCommonParam() : {}
    }
    /**
     * 执行合并
     * @param {Object} data 用户传入的接口参数
     * @param {Object} config axios对应的配置及一些新定义的配置
     * @returns {Object} 接口参数+配置
     */
    exec(data, config = {}) {
        const option = {
            origin: false,
        }

        // 合并参数
        data = Object.assign({}, data, this.commonParam)

        // 当前为交易接口，因此默认为登录加密
        this.setEncryptType(option)
        return Object.assign({}, option, { data }, config)
    }

    /**
     * 获取初始化参数，包含uin、sub、accountId、clientId
     * @returns {Object}
     */
    initCommonParam() {
        // 获取本地内容 - 因为可能在其它同域名页面登录过，这种情况下store下无，但是localStorage有
        const userInfo = getValueFromLocalStorage('userInfo', true, {})
        const uin = getValueFromLocalStorage('uin')
        const sub = getValueFromLocalStorage('sub')

        // eslint-disable-next-line prefer-const
        let { subAcctId, cltId, acctId } = userInfo.clientInfo?.accts?.[0] || {}
        // 是字符串类型
        subAcctId = subAcctId || sub || undefined

        const params = {
            uin: this.filterValue(uin, 'number'),
            clientId: this.filterValue(cltId),
            accountId: this.filterValue(acctId, 'number'),
            subAccountId: this.filterValue(subAcctId),
        }
        return params
    }

    /**
     *  设置encryptType
     * @param {Object} params 参数对象
     */
    setEncryptType(params = {}) {
        const defaultEncrypt = this.defaultEncrypt

        const isHasEncryptInOption = Object.prototype.hasOwnProperty.call(params, 'encrypt')
        if (!isHasEncryptInOption) {
            params.encrypt = defaultEncrypt
        }
    }

    /**
     *  过滤数据值，如果为空则赋值为undefined，http传输会筛掉
     * @param {*} v 数值
     * @param {String} type 数值需要的类型【'number'】
     * @returns {Number|String|undefined}
     **/
    filterValue(v, type) {
        if (type === 'number') {
            v = Number(v)
        }
        return v ?? undefined
    }
}

export {
    isMobileTerminal,
    toFixed,
    defaultZero,
    ciphertext,
    ciphertextLast4,
    cardNumberDivision,
    getPhonePlatform,
    removeEndZero,
    countDown,
    fitLen,
    isLightColor,
    // randomString,
    humanNum,
    humanTime,
    isEmpty,
    deepObjectMerge,
    debounce,
    toggleDebug,
    // openURL,
    // captchaQQ,
    isPassword,
    formatAsPem,
    generateUUID,
    blobToDataURL,
    isPortrait,
    isLandscape,
    dataURLtoBlob,
    getRndStr,
    dynamicFontSize,
    getNearWeek,
    getNearMonth,
    getNearThreeMonth,
    getNearNMonth,
    copyText,
    customerService,
    getPageVisibleSupportProperty,
    composeParams,
}
