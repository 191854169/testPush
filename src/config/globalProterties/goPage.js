import { isObj } from '@/utils'

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

    // 自研
    if (window.JSBridge) {
        return window.JSBridge.open({ url: encodeURIComponent(url), title: '' })
    }
    location.href = url
}

export default goPage
