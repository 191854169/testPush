/**
 * 使用说明: /doc/http.md
 * 使用案例: /views/Home.vue
 *
 * axios 参考文档
 * http://www.axios-js.com/zh-cn/docs/
 *
 */
import { getPathVersion, getRunEnv } from '@/utils/env'
import { ENCRYPT_TYPES as ENCRYPT_TYPES_TEMP, ERROR_COCES as ERROR_COCES_TEMP } from './constants'

import { setUserInfoFromLocaltempFile } from './http.tool'
// 按需引入
import { FSHttp } from '@fs/http'
import initInterceptors from './interceptors/index'

const { VUE_APP_ENV } = process.env

// eslint-disable-next-line
setUserInfoFromLocaltempFile(ISDEVELOPMENT, VUE_APP_ENV)

export const ENCRYPT_TYPES = ENCRYPT_TYPES_TEMP
// 错误代码
export const ERROR_COCES = ERROR_COCES_TEMP

let http = null

http = new FSHttp()
// 注册全局解密公共函数
http?.registerDecryptFunction?.({ VUE_APP_ENV })

initInterceptors(http)

export const get = (url, paramet) => {
    // 网厅内部打开默认为不加密，除此之外均默认加密
    const encrypt = getRunEnv() === 2 ? ENCRYPT_TYPES.NO_ENCRYPT : ENCRYPT_TYPES.LOGIN
    const config = Object.assign(
        {
            jsBridge: true,
            encrypt,
        },
        paramet
    )
    return http.request({ url, method: 'get', ...config })
}

export const post = (url, paramet) => {
    // 网厅内部打开默认为不加密，除此之外均默认加密
    const encrypt = getRunEnv() === 2 ? ENCRYPT_TYPES.NO_ENCRYPT : ENCRYPT_TYPES.LOGIN
    const postConfig = {
        jsonRpc: true, // post 默认开启 jsonRpc 2.0
        encrypt, // 1: 临时加密； 2 登录加密  0:所有状态不加密
        jsBridge: true,
    }
    const params = Object.assign({}, postConfig, paramet)
    return http.request({ url, method: 'post', ...params })
}

// APP 内使用 v1, 否则使用 v0
export const path_version = getPathVersion()

export default {
    get,
    post,
    path_version,
}
