export default {
    inserted(el, bindings, vNode) {
        const vm = vNode.context
        // eslint-disable-next-line prefer-const
        let { value, arg } = bindings
        value = value || {}
        const eventName = arg || value.params?.eventName
        const params = arg ? value : value.params || {}
        // 手动注册
        el.addEventListener('click', () => {
            vm.$sensorsTrack(eventName, params || {})
        })
    },
}
