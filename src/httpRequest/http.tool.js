import { bytes_to_hex, HmacSha256, string_to_bytes } from 'asmcrypto.js'
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'

import proxyConfig from '../../proxy.json'
import { getRunEnv } from '@/utils/env.js'
import { FREEZE_ERROR_CODE, FREEZE_ERROR_CODE_APP } from '@/config/common'
import freezeService from '@/utils/freezeService/index'
import mylinkJsbridge from '@fs/jsbridge/dist/lib/mylinkJsBridge.js'
import { X_SOURCES_MAP } from './constants'
import { isDeviceMobile, isTHSApp, isTHSI18NApp } from '@/utils/tools'

// 从本地代理文件获取请求路由
const getLocalProxyHost = (config = {}, _proxyConfig) => {
    const isTradeInterface = path => {
        const JY_REG =
            /AssetsSummary|AssetsDetail|Holdings|OrderCreate|OrderCancel|OrderList|OrderDetail|ProfitLossList|HistoryHoldingList|CleanHoldings|HoldingsDetail|OrderStatistics|ProfitLossDetail|LatestProfitLossDetail/
        return JY_REG.test(path)
    }
    let backGroupName = ''
    if (isTradeInterface(config.url)) backGroupName = 'trade'
    let backServerName = config.url?.split('/')[1]
    backGroupName && (backServerName += `,${backGroupName}`)

    const { VUE_APP_ENV: mode } = process.env

    const defaultData = {
        common: `https://wealth-${mode}.fosunhanig.com`,
    }
    Object.assign(_proxyConfig, defaultData)
    return (_proxyConfig[backServerName] || '').replace(/\$\{mode\}/, mode).split('://')[1]
}

/**
 * @获取消息签名
 * 技术规范： https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000140@toc17
 */
export const getX_sign = (config = {}) => {
    try {
        const h = config.headers
        let schema, host, port, path

        // 区分是否设置baseUrl，当前未设置
        if (!config.baseURL || config.baseURL === '/') {
            // 请求协议 - 当前固定https
            // schema = location.protocol.split(':')[0]
            schema = 'https'

            // 本地调试环境、部署环境处理
            if (process.env.NODE_ENV === 'development') {
                host = getLocalProxyHost(config, proxyConfig)
            } else {
                host = config.url?.split('//')[1].split('/')[0]
            }

            // 请求端口 - 当前无需包含端口信息
            // port = schema === 'http' ? '80' : '443'
            port = ''

            // 请求uri
            path = (host ? config.url.split(host)[1] ?? config.url : config.url).split('?')[0]
        } else {
            schema = config.baseURL.split(':')[0]
            host = config.baseURL.split('//')[1].split(':')[0]
            port = config.baseURL.split('//')[1].split(':')[1] ?? ''
            path = config.url.split('?')[0]
        }

        // query参数处理
        const query = { ...config.params }
        const _queryArray = (config.url.split('?')[1] || '').split('&').filter(item => item)
        _queryArray.forEach(item => {
            query[item.split('=')[0]] = item.split('=')[1]
        })
        const _queryKeySorted = Object.keys(query).sort((a, b) => a.localeCompare(b))
        let query_string = ''
        for (const item of _queryKeySorted) {
            query_string += `&${item}=${query[item]}`
        }
        query_string = encodeURIComponent(decodeURIComponent(query_string.slice(1)))

        // 签名原文
        const headerKeys = [
            'X-uin',
            'X-request-id',
            'X-timestamp',
            'X-device-info',
            'X-lang',
            'X-product',
            'X-antispams',
            'X-session',
            'Content-Type:application/json',
            'X-source',
        ]
        let sign = `${config.method.toUpperCase()}${schema}${port ? host + ':' + port : host}${path}${query_string}${headerKeys
            .map(key => {
                const [k, defaultVal = ''] = key.split(':')
                return h[k] || defaultVal
            })
            .join('')}`
        process.env.NODE_ENV === 'development' && console.log('🚀 ~ sign:', sign)

        // 加密签名
        const hmacSha256 = new HmacSha256(string_to_bytes(localStorage.getItem('rndKey')))
        sign = bytes_to_hex(hmacSha256.process(string_to_bytes(sign)).finish().result)

        return sign
    } catch (err) {
        console.log('🚀 ~ x-sign err: ', err)
        return ''
    }
}

// //生成随机数代码
// const getArrayRound = (length = 12) => {
//     let arr = [];
//     for (let i = 0; i < length; i++) {
//         const randomNum6 = Math.round(Math.random() * 128)
//         arr.push(randomNum6)
//     }
//     return arr
// }

// /**
//  * //AES-GCM-256 加密函数
//  */
// export function Encrypt(word, key) {
//     let text = string_to_bytes(word, true)
//     let nonce = new Uint8Array(getArrayRound())

//     let encText = AES_GCM.encrypt(text, key, nonce)
//     console.log(text, nonce, key, encText)

//    // return bytes_to_base64(new Uint8Array(Array.from(nonce).concat(Array.from(encText))))
// }

/**
 * 是否是字符串
 * @param {*} o
 */
export const isString = o => {
    return Object.prototype.toString.call(o).slice(8, -1) === 'String'
}

/**
 * 转换公私钥为标准pem格式
 * @param {string} str
 * @returns string
 */
export const formatAsPem = str => {
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
export const createUUID = (uin = '') => {
    return uuidv5(uin + new Date().valueOf() + '', uuidv4())
        .split('-')
        .join('')
}

// 自研app只有下单相关窗口才展示冻结弹框
export const getFreezeErrorCode = () => {
    return getRunEnv() === 1 ? FREEZE_ERROR_CODE_APP : FREEZE_ERROR_CODE
}

export const checkFreeze = response => {
    const { data: resData, config } = response

    const { error } = resData
    const showFreeze = config.showFreeze === undefined ? true : config.showFreeze
    const freezeErrorCode = getFreezeErrorCode()

    if (showFreeze && freezeErrorCode.includes(error?.code)) {
        freezeService.show()

        // 原始Error, 方便抛出查看
        resData.originError = error

        const descriptor = {
            get() {
                throw Promise.reject({
                    errorCode: 'ACCOUNT_FREEZE',
                    responseData: resData,
                })
            },
        }
        // 避免执行接口调用出catch捕获异常并进行后续处理
        Object.defineProperty(resData, 'error', descriptor)

        return Promise.reject(resData)
    }
}

const inMylink = mylinkJsbridge.isInMylink()
/**
 * 根据环境来区分x-source值
 */
export function getXSource() {
    let ret = isDeviceMobile() ? X_SOURCES_MAP.HLAPP_MOBILE : X_SOURCES_MAP.HLAPP_WEB
    const runenv = getRunEnv()
    if (inMylink) {
        ret = X_SOURCES_MAP.MYLINK_APP
    } else if (runenv === 1) {
        ret = X_SOURCES_MAP.HLAPP
    } else if (isTHSApp()) {
        ret = X_SOURCES_MAP.THS_APP
    } else if (runenv === 2) {
        ret = X_SOURCES_MAP.WANG_TING
    } else if (isTHSI18NApp()) {
        ret = X_SOURCES_MAP.THS_I18N_APP
    }

    return ret
}

// 设置用户信息从本地localtemp/proxy/xxx.js文件到localstorage中
export function setUserInfoFromLocaltempFile(enabled = false, VUE_APP_ENV) {
    if (!enabled) return
    let proxy = {}
    try {
        proxy = require(`../../localhost/proxy/${VUE_APP_ENV}.js`)
        Object.entries(proxy).forEach(([k, v]) => {
            v && localStorage.setItem(k, v)
        })
        console.log(`Feng.chen:: 15:45:38 proxy ===> `, proxy)
    } catch (e) {
        console.log(`Feng.chen:: 15:07:17 proxy ===> `, e)
    }
    return proxy
}
