import {
    CommonHeaderIntercepotr,
    LOGINEncryptInterceptor,
    LOGINDecryptInterceptor,
    VconsoleRequestInterceptor,
    VconsoleResponseInterceptor,
    ArmsRquestInterceptor,
    ArmsResponseInterceptor,
    CommonErrorInterceptor,
} from '@fs/http'
import handleResponseInterceptor from './handleResponseInterceptor'
import MRErrorTip from '@/config/MRErrorTip'
import { Toast } from 'vant'
import { getLangType, isTHSApp } from '@/utils/tools'
import { getXSource } from '../http.tool'
import { getRunEnv } from '@/utils/env'
import freezeError from './freezeError'
import RYLogout from './RYLogout'
import THSI18nLogout from '@fs/http/dist/lib/http/common/thsI18nLogoutInterceptor'

const { VUE_APP_ENV, VUE_APP_ARMS_ENV, NODE_ENV } = process.env

export default function (http) {
    try {
        http.registerInterceptor(
            'request',
            LOGINEncryptInterceptor({
                VUE_APP_ENV: VUE_APP_ENV,
            })
        )

        const armsOptions = {
            pid: 'hvolair3j6@c1593183f42035d',
            environment: VUE_APP_ARMS_ENV,
            // disabled: false,
            // ignore: {
            //     ignoreErrors: [],
            //     ignoreApis: [/^\/h5Log\/v1/],
            // },
        }

        http.registerInterceptor('request', ArmsRquestInterceptor(armsOptions))
        console.log(`Feng.chen:: 16:09:38 VconsoleRequestInterceptor ===> `, VconsoleRequestInterceptor)
        http.registerInterceptor('request', VconsoleRequestInterceptor())
        // defaultOptions必须要传入的值
        // uin、session、lang、xSource、rndKey
        const sessionKey = isTHSApp() || getRunEnv() === 2 ? 'WTtoken' : 'session'
        const session = () => localStorage.getItem(sessionKey) || ''
        const uin = () => localStorage.getItem('uin') || ''
        const rndKey = () => localStorage.getItem('rndKey') || ''
        http.registerInterceptor(
            'request',
            CommonHeaderIntercepotr({
                uin,
                session,
                rndKey,
                lang: getLangType(),
                xSource: getXSource(),
                product: 'wealth',
                NODE_ENV,
                channel: 'H5',
            })
        )

        http.registerInterceptor('request', config => {
            console.log('registerInterceptor config', config)
            return config
        })

        http.registerInterceptor('response', LOGINDecryptInterceptor({ NODE_ENV }))
        http.registerInterceptor('response', ArmsResponseInterceptor())
        http.registerInterceptor('response', VconsoleResponseInterceptor())
        // 冻结账户拦截处理
        freezeError(http)
        // 瑞银项目登出错误处理
        RYLogout(http)

        http.registerInterceptor('response', CommonErrorInterceptor({ MRErrorTip, Toast }))
        http.registerInterceptor('response', THSI18nLogout({ Toast: Toast }))
        http.registerInterceptor('response', handleResponseInterceptor())
    } catch (e) {
        console.log(`Feng.chen:: 16:20:43 e ===> `, e)
    }
}
