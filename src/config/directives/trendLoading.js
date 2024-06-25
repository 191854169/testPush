// 对chart trend自动显示、隐藏loading
// NOTE: 需要给原始的trend元素增加一个父元素来最外层对象
import { i18n } from '@/i18n/common/index'

export default function (el, bindings) {
    const loadingDom = setLoadingDom(el, 'trend-loading')
    if (!loadingDom) return
    const loading = bindings?.value || false
    if (!loading) {
        loadingDom.style.zIndex = -999
    } else {
        loadingDom.style.zIndex = 888
    }
}

/**
 * 设置LoadingDom
 * @param {HTMLElement} parent 父元素
 * @param {String} className loadingDom对应的类名，注册在assets/css/global里面
 * @returns
 */
function setLoadingDom(parent, className) {
    if (!(parent && className)) return
    let loadingDom = parent.getElementsByClassName(className)?.[0]
    if (loadingDom) return loadingDom
    loadingDom = document.createElement('div')
    loadingDom.innerHTML = `${i18n.t('loading')}...`
    loadingDom.className = className
    parent.appendChild(loadingDom)
    return loadingDom
}
