import { getRunEnv } from '@/utils/env.js'
import { getQueryString } from '../utils/tools'

// 同花顺则需要提前存入wtToken、sub、uin - 放在最前面，防止后续从localstorage取值异常
if (getRunEnv() === 2) {
    const wtToken = getQueryString('wtToken') || getQueryString('wtToken', true)
    const sub = getQueryString('sub') || getQueryString('sub', true)
    const uin = getQueryString('uin') || getQueryString('uin', true)
    localStorage.setItem('WTtoken', wtToken)
    localStorage.setItem('sub', sub)
    localStorage.setItem('uin', uin)
    sessionStorage.setItem('runEnv', '2') // 同花顺环境标识,首次进来必有wtToken, 后续依赖于session存储判断
}
