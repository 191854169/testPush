import Vue from 'vue'
import LoadingVue from '@/components/Loading.vue'
import store from '@/store/demo'
import { cloneDeep } from 'lodash'

let vm, element
const Components = Vue.extend(LoadingVue)
let props = {},
    originProps = {}
class Loading {
    constructor(options = {}) {
        vm = new Components({ store, propsData: { propsShow: true } })
        props = vm._props
        originProps = cloneDeep(props)
        this.setProps(options)
    }

    get show() {
        return props.showLoading
    }
    set show(v) {
        let show = false,
            options = {}
        if (!element) {
            element = vm.$mount()
            document.body.appendChild(vm.$el)
        }
        if (typeof v === 'object') {
            show = v.show
            options = v.options
        } else {
            this.initProps()
            show = !!v
        }
        this.setProps(options)
        props.showLoading = show
    }

    initProps() {
        this.setProps(originProps)
    }

    setProps(options = {}) {
        Object.entries(options).forEach(([key, value]) => {
            key in props && (props[key] = value)
        })
    }
}

export default Loading
