import { addCurParamsForUrl } from '@/utils/utils.js'
import { isTHSApp } from '@/utils/tools.js'

export default (url, options = {}) => {
    if (isTHSApp()) {
        // eslint-disable-line
        const protocol = 'client.html' // 同花顺新页面的协议
        const connector = '^' // 同花顺参数连接符
        const baseOptions = {
            action: 'ymtz',
            webid: '2804', // ios和Android通用
            mode: 'new', // 同花顺打开新的webview
        }
        options = Object.assign(baseOptions, options, { url: addCurParamsForUrl(url.replace(/http(s)?/, 'https')) })
        const href =
            protocol +
            '?' +
            Object.entries(options)
                .reduce((str, [k, v]) => {
                    if (v) {
                        str += `${k}=${v}${connector}`
                    }
                    return str
                }, '')
                .slice(0, -1)
        location.href = href
        return true
    }
    return false
}
