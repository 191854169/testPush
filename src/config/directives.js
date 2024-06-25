// import { h, render, Transition } from 'vue'
// import Loading from '@/components/Loading.vue'
// 注册全局指令
// import riseFall from "./directives/riseFall"

export default function (Vue) {
    const files = require.context('./directives', false, /.js$/)
    files.keys().forEach(key => {
        Vue.directive(key.replace(/(\.\/|\.js)/g, ''), files(key).default)
    })

    /*注册加载遮罩指令: v-loading 适用任何dom节点
    v-loading.fullscreen 指令参数fullscreen 是否全屏显示
    props:
    @loading-type icon类型 circular||spinner
    @loading-size icon大小
    @loading-color icon及文字颜色
    @loading-textsize 文字字号大小
    @loading-vertical Boolean icon及文字对齐方式
    @loading-background 遮罩背景色
    @loading-text 加载显示文字
    */
    // Vue.directive('loading', {
    //     mounted(el, binding, vnode) {
    //         el.loading = function(vnode){
    //             var get = (key) => vnode.props[`loading-${key}`]
    //             var _loading = h(Loading, { size: get('size'), color: get('color'), type: get('type'), textSize: get('textsize'), vertical: get('vertical'), bgColor: get('background'), fixed: binding.modifiers.fullscreen ? true : false }, { default: () => get('text') })
    //             return _loading
    //         }
    //         el.transition = (child) => h(Transition, {
    //             'enter-active-class': 'animated short fadeIn', 'leave-active-class': 'animated short fadeOut', onAfterLeave: () => {
    //                 var _classname = el.className.split(' ')
    //                 _classname.splice(_classname.indexOf("loading-parent--relative"), 1)
    //                 el.className = _classname.join(' ')
    //             }
    //         }, { default: () => child })
    //         if(binding.value){
    //             var _classname = el.className.split(' ')
    //             _classname.push('loading-parent--relative')
    //             el.className = _classname.join(' ')
    //             render(el.transition(el.loading(vnode)), el)
    //         }
    //     },
    //     updated(el, binding, vnode) {
    //         if(binding.value){
    //             var _classname = el.className.split(' ')
    //             _classname.push('loading-parent--relative')
    //             el.className = _classname.join(' ')
    //             render(el.transition(el.loading(vnode)), el)
    //         } else {
    //             render(el.transition(null), el)
    //         }
    //     },
    //     unmounted(el) {
    //         el.transition = null
    //         el.loading = null
    //     }
    // });
}
