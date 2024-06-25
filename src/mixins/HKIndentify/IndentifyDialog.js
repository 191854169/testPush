import Vue from 'vue'
import HKIndentify from '@/components/HKIndentifyDialog.vue'

let vm,
    element,
    props = {}
const Components = Vue.extend(HKIndentify)

class IndentifyDialog {
    constructor() {
        vm = new Components({ propsData: {} })
        props = vm._props
    }
    get show() {
        return vm.show
    }
    set show(v) {
        console.log('set-show', v)
        if (!element) {
            element = vm.$mount()
            document.body.appendChild(vm.$el)
        }
        vm.show = v
    }

    get type() {
        return props.type
    }
    set type(v) {
        props.type = v
    }
}

export default IndentifyDialog
