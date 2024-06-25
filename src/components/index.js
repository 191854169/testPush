// import { camelize, capitalize } from 'vue'
import Page from './Page.vue'

//批量注册自定义通用公共组件
export default function (Vue) {
    const components = [Page]
    components.forEach(item => {
        Vue.component('page', item)
    })
}
