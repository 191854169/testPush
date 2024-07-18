import { LogNew } from '@/apis/h5Log'
import UAParser from 'ua-parser-js'
import { lupuJsbridge as JSBridge } from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
import { getLangType } from '@/utils/tools'

const UA = new UAParser().getResult()

export const sendH5Log = async function (level, desc = '', params) {
    try {
        if (!level || !['FATAL', 'ERROR', 'INFO', 'DEBUG'].includes(level)) {
            console.log('send h5 log level error')
            return
        }

        // 用户标识
        const uin = localStorage.getItem('uin') || ''
        // 页面url
        const pageUrl = window.location.href
        // 页面名称
        const pageTitle = window.document.title
        // 日志类型 - H5、App
        const type = JSBridge ? 'App' : 'H5'
        // 平台类型
        const platform = UA.os.name
        // 系统版本
        const osver = UA.os.version
        // 设备型号
        const deviceModel = UA.device.model
        // 浏览器名字
        const browserName = UA.browser.name
        // 语言
        const lang = getLangType()
        // 产品类型
        const product = 'app-pages'
        // 产品版本
        const version = '0.0.1'

        const postData = {
            // 日志级别：FATAL、ERROR、INFO、DEBUG
            level,
            // 日志描述
            desc,

            uin,
            pageUrl,
            pageTitle,
            type,
            platform,
            osver,
            deviceModel,
            browserName,
            lang,
            product,
            version,

            ...params,
        }

        console.log('send h5 log data: ', postData)

        const { data = {} } = await LogNew(postData)

        if (data.result) {
            console.log('send h5 log success')
        } else {
            console.log('send h5 log failed: ', JSON.stringify(data, undefined, 2))
        }
    } catch (error) {
        console.log('send h5 log error: ', error)
    }
}

export const initErrorLoggerHandler = function () {
    window.addEventListener('error', function (event) {
        if (event.origin !== window.location.origin && origin !== window.location.origin) return
        sendH5Log('ERROR', event.message)
    })
}
