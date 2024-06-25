import { milliFormat, isNumber } from '@/utils/tools'
// 显示或者隐藏数据过滤器
export default function (el, bindings) {
    // eslint-disable-next-line prefer-const
    let { value, hide = true, thousand = true, hideObj = { text: '****', color: '#666' } } = bindings.value || {}
    // 判断金额是否为空
    value = isNumber(value) ? value : value || '--'
    let innerText = value
    let hideColor = ''
    if (hide) {
        innerText = hideObj.text
        hideColor = hideObj.color
    }
    if (thousand) {
        innerText = milliFormat(innerText)
    }
    el.innerText = innerText
    el.style.color = hideColor
}
