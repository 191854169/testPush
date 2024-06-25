import ConcatUs from './index.vue'
import Vue from 'vue'
import { i18n } from '@/i18n/fund'

let instance = null
if (!instance) {
    const Comp = Vue.extend(ConcatUs)
    instance = new Comp({
        i18n,
    })
    instance.$mount(document.createElement('div'))
    document.body.appendChild(instance.$el)
}

export const concatUs = () => {
    instance.show()
}
