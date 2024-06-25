import Vue from 'vue'
import Trade from '@/components/TradeLogin.vue'

class TradeLogin {
    constructor(options = { propsData: {} }) {
        const Components = Vue.extend(Trade)
        this.vm = new Components({ ...options })
    }
    get show() {
        return this.vm.show
    }
    set show(v) {
        if (!this.element) {
            this.element = this.vm.$mount()
            document.body.appendChild(this.vm.$el)
        }
        this.vm.show = v
    }
    destory() {
        this.vm.$destroy()
        document.body.removeChild(this.vm.$el)
        this.vm = null
        this.element = null
    }
}

export default TradeLogin
