import { throttle } from 'lodash'
export default {
    name: 'throttle',
    inserted: (el, binding) => {
        // leading：节流前执行(默认),trailing:节流后执行，all:节流前后都执行
        const { leading = true, trailing = false, all = false } = binding.modifiers || {}
        const shakeTime = el.getAttribute('time') || 1000 //防抖时间
        const func = throttle(binding.value, shakeTime, { leading: leading || all, trailing: trailing || all })
        el.addEventListener(
            'click',
            () => {
                func()
            },
            false
        )
    },
}
