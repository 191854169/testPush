// 阿里云监控服务ARMS https://help.aliyun.com/document_detail/58655.html

import * as BrowserLogger from 'alife-logger'

const { VUE_APP_ARMS_ENV = 'daily' } = process.env

const isDisabledArms = ['daily', 'local'].includes(VUE_APP_ARMS_ENV) // 禁止本地和sit环境arms日志的上报

let arms = null // arms实例

arms = initArms()

export const getArms = () => {
    return arms
}

/**
 * ARMS 初始化
 * @param {Object} options
 * @param {Object} config
 * @returns
 */
function initArms(options = {}, config = {}) {
    const __bl = BrowserLogger.singleton({
        pid: 'hvolair3j6@c1593183f42035d', // 项目唯一id, fosunhani-wealth
        appType: 'web',
        imgUrl: 'https://arms-retcode.aliyuncs.com/r.png?', // 上报地址
        // uid: getUin(), // 设置uid为uin
        disableHook: true, // 禁用自动上报API
        sendResource: true, // 上报静态资源
        enableLinkTrace: true, // 前后端链路追踪
        enableApiCors: true, // 允许跨域
        linkType: 'tracing', // 链路追踪类型：tracing与链路追踪的Tracing产品做前后端链路打通
        behavior: true, // 记录报错的用户行为
        enableSPA: true, // 监听页面的hashchange事件并重新上报PV，适用于单页面应用场景。
        useFmp: true, // 采集首屏FMP（First Meaningful Paint，首次有效渲染）数据
        environment: VUE_APP_ARMS_ENV, // 取值为：prod、gray、pre、daily和local
        sample: 1, // 对性能日志和成功API日志按照1/sample的比例采样
        release: '0.0.2', // 应用版本号
        disabled: isDisabledArms, // 是否禁用日志上报功能 - 全局上报、api上报等
        ...options,
    })

    // 设置用户名
    __bl.setConfig({
        setUsername: function () {
            return getUin()
        },
        // https://help.aliyun.com/document_detail/58655.html#sc-ignore
        ignore: {
            ignoreErrors: [
                // 'test error', // 字符串
                // 因为IOS APP重复调用已被清空的jsBridge callback，不影响具体逻辑，因此屏蔽。
                /^Can't find variable: s\d{13,21}([a-z_0-9]+)?$/, // 正则表达式
                function (str) {
                    // 方法
                    const reg = /^Script error\.?$/
                    const isUat = process.env.VUE_APP_ARMS_ENV === 'pre' // 保留UAT上报script error错误的能力
                    console.log('str ====> ', str)
                    if (reg.test(str) && !isUat) return true // 不上报
                    return false // 上报
                },
            ],
            /** h5Log 日志接口的错误不用上报 */
            ignoreApis: [/^\/h5Log\/v1/],
        },
        ...config,
    })
    return __bl
}

/**
 * 获取Uin
 */
function getUin() {
    return localStorage.getItem('uin') || ''
}

/**
 * 请求头设置traceid
 * @param {Object} header 请求头
 * @param {Object} __bl arms实例
 * @returns 返回对象，属性有traceId, uTraceId
 */
export function setTraceIdInHeader(header, __bl = getArms()) {
    const uberTraceIdObj = __bl?.getUberTraceId('uber-trace-id') || {}
    const uTraceId = uberTraceIdObj['uber-trace-id'] || ''
    const traceId = uberTraceIdObj['traceId'] || ''
    header['uber-trace-id'] = uTraceId
    header['X-timestamp'] = new Date().getTime() + ''
    return {
        uTraceId,
        traceId,
    }
}

/**
 * ARMS上报接口
 * @param {Object} res 接口响应体
 * @param {Object} __bl arms实例
 * @param {Object} err 错误
 */
export function sendApiArms(res, err, __bl = getArms()) {
    console.info('sendApiArms 参数信息', 'res:', res, 'err:', err)
    let success = true
    let code = res?.data?.error?.code ?? 0
    let msg = JSON.stringify(res?.data || {})
    let headers = res?.config?.headers || res?.config?.headerMap || {}
    const endTime = new Date().getTime()
    let startTime = headers['X-timestamp'] || endTime
    let url = res?.config?.url || res?.origin?.url || ''
    if (err) {
        success = false
        code = 'ERROR'
        msg = JSON.stringify(err?.data?.error || err?.message || err?.desc || {})
        headers = err?.config?.headers || err?.config?.headerMap || {}
        startTime = headers['X-timestamp'] || endTime
        url = err?.config?.url || err?.origin?.url || ''
    }
    const duration = endTime - startTime
    const uberTraceId = headers['uber-trace-id'] || ''
    const traceId = uberTraceId.split(':')[0]
    setTimeout(() => {
        if (code && url) {
            console.warn('ARMS API 发送信息', url, duration, code, msg, traceId)
            __bl?.api(url, success, duration, code, msg, startTime, traceId)
        }
    }, 3000)
}

// todo
// 1. 同花顺App中，获取用户信息
// 2. JS错误定位到具体文件，代码行 - 待sourcemap
