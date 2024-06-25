import { floatToRatio, isObj, milliFormat } from '@/utils'
import { variable as colors } from '@/assets/css/variable.js'
const classList = ['rise', 'fall', 'flat', 'normal']

export default (el, binding) => {
    let value = '',
        params = {},
        text = ''

    if (isObj(binding.value)) {
        // normal 平色是否使用常规文字色
        const {
            rate = true,
            toFixed = true,
            base = 2,
            sign = true,
            pow = 0,
            riseFall = true,
            thousand = true,
            hide = false,
            normal = false,
            hideObj = { text: '****', color: colors.fontLightColor },
        } = binding.value
        value = binding?.value?.value
        params = { rate, toFixed, base, sign, pow, thousand, hide, hideObj, riseFall, normal }
    } else {
        value = binding.value
        params = { riseFall: true }
    }

    // formatt text
    text = floatToRatio(value, params)
    if (params.thousand) {
        text = milliFormat(text)
    }
    if (params.hide) {
        text = params.hideObj?.text
    }
    el.innerText = text
    // add class
    let className = params.riseFall ? (value > 0 ? 'rise' : value < 0 ? 'fall' : params.normal ? 'normal' : 'flat') : ''

    if (params.hide) {
        className = ''
        el.style.color = params.hideObj?.color
    } else {
        el.style.color = ''

        // 在途字体颜色
        if (text === '--') {
            className = ''
            el.style.color = '#2f2f2f'
        }
    }

    classList.forEach(name => {
        el.classList.remove(name)
    })
    className && el.classList.add(className)
}
