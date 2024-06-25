import { thsI18NJsBridge } from '@fs/jsbridge'
import { addCurParamsForUrl } from '@/utils/utils.js'

export default (url, title = '') => {
    if (thsI18NJsBridge.isTHSI18NApp()) {
        const newUrl = addCurParamsForUrl(url)
        console.log('newUrl:', newUrl, title)
        title ? thsI18NJsBridge.gotoCommonPage({ url: newUrl, title }) : thsI18NJsBridge.gotoCommonPage({ url: newUrl })
        return true
    }
    return false
}
