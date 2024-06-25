import Vue from 'vue'

import CMHKLogout from './index.vue'

import { i18n } from './tools'

export let instance = null

const init = function (propsData = {}) {
    if (!instance) {
        const VueComp = Vue.extend(CMHKLogout)
        const comp = new VueComp({
            propsData: {
                close,
                ...propsData,
            },
            i18n,
        })

        const _instance = comp.$mount()
        document.body.appendChild(_instance.$el)

        instance = _instance
    }
}

export const open = function (propsData = {}) {
    init(propsData)

    instance.show = true
}

export const hide = function () {
    if (instance) {
        instance.show = false
    }
}

export const close = function (duration = 300) {
    hide()

    setTimeout(() => {
        if (instance) {
            document.body.removeChild(instance.$el)
            instance.$destroy()

            instance = null
        }
    }, duration)
}

export default {
    install(Vue) {
        if (typeof window !== 'undefined' && window.Vue) {
            Vue = window.Vue
        }

        Vue.component('CMHKLogoutDialog', CMHKLogout)

        init()

        Vue.prototype.$CMHKLogout = {
            open,
            hide,
            close,
        }
    },
    open,
    hide,
    close,
}
