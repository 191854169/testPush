import { debounce } from 'lodash'
export default {
    name: 'debounce',
    inserted: (el, binding) => {
        // leading：抖动前执行(默认),trailing:抖动后执行，all:抖动前后都执行
        const { leading = true, trailing = false, all = false } = binding.modifiers || {}
        const shakeTime = el.getAttribute('time') || 1000 //防抖时间
        const func = debounce(binding.value, shakeTime, { leading: leading || all, trailing: trailing || all })
        el.addEventListener(
            'click',
            () => {
                func()
            },
            false
        )
    },
}
