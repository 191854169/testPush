import H5CommonHeaderIntercepotr from '@fs/http/dist/lib/http/FSH5Http/commonHeaders'
import H5CommonErrorInterceptor from '@fs/http/dist/lib/http/FSH5Http/commonErrorInterceptor'

// app 通用interceptor
import AppCommonErrortInterceptor from '@fs/http/dist/lib/http/FSAppHttp/commonErrortInterceptor'
import vconsoleInterceptor from '@fs/http/dist/lib/http/FSAppHttp/vconsoleInterceptor'

// arms interceptor
import ArmsInterceptor from '@fs/http/dist/lib/http/arms'
// 通用数据结构组装
import handleCommnResponseInterceptor from '@fs/http/dist/lib/http/common/handleCommnResponseInterceptor'
// 加密
import H5ECDHEncryptInterceptor from '@fs/http/dist/lib/http/FSH5Http/encryptInterceptors/ECDHEncryptInterceptor'
// 解密
import H5ECDHDecryptInterceptor from '@fs/http/dist/lib/http/FSH5Http/decryptInterceptors/ECDHDecryptInterceptor'

// 加密
import H5LOGINEncryptInterceptor from '@fs/http/dist/lib/http/FSH5Http/encryptInterceptors/LOGINEncryptInterceptor'
// 解密
import H5LOGINDecryptInterceptor from '@fs/http/dist/lib/http/FSH5Http/decryptInterceptors/LOGINDecryptInterceptor'
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge'

const emptyInterceptor = res => Promise.resolve(res)

const arms = new ArmsInterceptor()

// 设置默认interceptor
let CommonHeaderIntercepotr = emptyInterceptor,
    CommonErrorInterceptor = emptyInterceptor,
    VconsoleRequestInterceptor = emptyInterceptor,
    VconsoleResponseInterceptor = emptyInterceptor,
    ECDHEncryptInterceptor = emptyInterceptor,
    ECDHDecryptInterceptor = emptyInterceptor,
    LOGINEncryptInterceptor = emptyInterceptor,
    LOGINDecryptInterceptor = emptyInterceptor

const ArmsRquestInterceptor = arms.getArmsRequestInterceptor.bind(arms)
const ArmsResponseInterceptor = arms.getArmsResponseInterceptor.bind(arms)

// 根据环境设置interceptor
if (JSBridge) {
    CommonErrorInterceptor = AppCommonErrortInterceptor
    const vconsoleItp = vconsoleInterceptor()
    VconsoleRequestInterceptor = vconsoleItp.requestInterceptor
    VconsoleResponseInterceptor = vconsoleItp.responseInterceptor
} else {
    CommonHeaderIntercepotr = H5CommonHeaderIntercepotr
    CommonErrorInterceptor = H5CommonErrorInterceptor
    ECDHEncryptInterceptor = H5ECDHEncryptInterceptor
    ECDHDecryptInterceptor = H5ECDHDecryptInterceptor
    LOGINEncryptInterceptor = H5LOGINEncryptInterceptor
    LOGINDecryptInterceptor = H5LOGINDecryptInterceptor
}

export {
    CommonHeaderIntercepotr,
    CommonErrorInterceptor,
    VconsoleRequestInterceptor,
    VconsoleResponseInterceptor,
    ArmsRquestInterceptor,
    ArmsResponseInterceptor,
    handleCommnResponseInterceptor,
    ECDHEncryptInterceptor,
    ECDHDecryptInterceptor,
    LOGINEncryptInterceptor,
    LOGINDecryptInterceptor,
}
