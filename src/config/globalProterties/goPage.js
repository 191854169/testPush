import openPageInThs from './openPageInThs'
import openPageInWT from './openPageInWT'
import { isObj } from '@/utils'
import mylinkJsbridge from '@fs/jsbridge/dist/lib/mylinkJsBridge.js'
import openPageInI18NThs from './openPageInI18NThs'

const inMyLink = mylinkJsbridge.isInMylink()

const goPage = (path, params, options = {}) => {
    let query = ''
    const { origin = location.origin, pathname = location.pathname } = options
    if (isObj(params)) {
        query = Object.entries(params)
            .reduce((str, [k, v]) => {
                str += `${k}=${v}&`
                return str
            }, '?')
            .replace(/&$/, '')
            .replace(/^\?$/, '')
    }
    const url = !/^http(s)?:\/\//.test(path) ? `${origin}${pathname}#${path}${query}` : path
    if (inMyLink) {
        mylinkJsbridge.openH5InWebview(url)
        return
    }
    // 同花顺
    if (openPageInThs(url)) return
    // 网厅 - 因为网厅判断包含了THS因此将同花顺前置
    if (openPageInWT(url)) return
    // 同花顺国际版
    if (openPageInI18NThs(url)) return
    // 自研
    if (window.JSBridge) {
        return window.JSBridge.open({ url: encodeURIComponent(url), title: '' })
    }
    location.href = url
}

export default goPage
