import { sensorsInit, autoTrackSinglePage as T } from '@fs/utils'
import Vue from 'vue'

export default function () {
    sensorsInit({
        Vue2: Vue,
        env: process.env.VUE_APP_ENV,
        initOptions: {
            show_log: ['local', 'dev', 'sit'].includes(process.env.VUE_APP_ENV), // 是否打开log
        },
    })
}

export const autoTrackSinglePage = T
