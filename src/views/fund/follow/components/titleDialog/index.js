import titleDialogConfig from './titleDialog.vue'
import Vue from 'vue'
import vantInit from '@/config/vant.components'

vantInit(Vue)

class TitleDialog {
    props = {}
    instance = null
    container = null

    resolve = () => {}
    reject = () => {}
    constructor(Vue, config) {
        const TitleDialogComp = Vue.extend(config)

        const instance = new TitleDialogComp({ propsData: {} })

        instance.$mount(document.createElement('div'))

        instance.$on('confirm', () => this.resolve())

        instance.$on('cancel', () => this.reject())

        this.instance = instance

        this.mount(document.body)

        this.props = instance._props
    }

    show(options = {}) {
        const baseOptions = { showClose: true }
        if (options.dom) {
            this.mount(options.dom, options.forceToBody)
        }
        Object.assign(this.props, { ...baseOptions, ...options })
        this.instance.show = true

        return new Promise((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
    }

    mount(dom, forceToBody) {
        dom = dom instanceof HTMLElement ? dom : document.body.querySelector(dom)
        if (!dom && forceToBody) {
            dom = document.body
        }
        if (dom === document.body) {
            this.instance.appendToBody = true
        }
        const container = dom
        if (this.container) {
            this.container?.removeChild(this.instance.$el)
        }

        container.appendChild(this.instance.$el)
        this.container = container
    }
}

const map = {
    instace: null,
}

export default function getTitleDialog(Vue) {
    if (!map.instace) {
        map.instace = new TitleDialog(Vue, titleDialogConfig)
    }
    return map.instace
}
export const titleDialog = getTitleDialog(Vue)
