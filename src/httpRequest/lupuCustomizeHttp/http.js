import { FSH5Http } from '@fs/http'
import { FSAppHttp } from '@fs/http/dist/lib/http/FSAppHttp/FSAppHttp'
import JSBridge from '@fs/jsbridge/dist/lib/lupu/jsBridge'
import axios from 'axios'

export function FSHttp(options) {
    if (JSBridge) {
        return new FSAppHttp({ defaultOptions: options, adapter: JSBridge.request })
    }
    return new FSH5Http({ defaultOptions: options, adapter: axios })
}
