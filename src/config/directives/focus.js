//注册全局聚焦指令: v-focus
const focus = {
    inserted(el) {
        el.focus()
    },
}

export default focus
