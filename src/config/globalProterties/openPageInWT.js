import { addCurParamsForUrl } from '@/utils/utils.js'
import { getRunEnv } from '@/utils/env.js'

export default url => {
    if (getRunEnv() === 2) {
        const href = addCurParamsForUrl(url.replace(/http(s)?/, 'https'))
        location.href = href
        return true
    }
    return false
}
