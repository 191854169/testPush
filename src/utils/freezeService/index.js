import FreezeDialog from './FreezeDialog.vue'
import Vue from 'vue'

let instance = null

const freezeService = {
    initInstance() {
        const component = Vue.extend(FreezeDialog)
        instance = new component()
        const dom = document.createElement('div')
        document.body.appendChild(dom)
        instance.$mount(dom)
    },

    show() {
        if (!instance) {
            this.initInstance()
        }

        instance.show = true
    },
}

export default freezeService
