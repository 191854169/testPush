/* eslint-disable */

// 移动端适配
;(function (doc, win) {
    console.log(document.documentElement.clientWidth)
    function isIOS() {
        var i = 0
        var iOS = false
        var iDevice = ['iPad', 'iPhone', 'iPod']

        for (; i < iDevice.length; i++) {
            if (navigator.platform.indexOf(iDevice[i]) >= 0) {
                iOS = true
                break
            }
        }
        return iOS
    }

    function retFontSize() {
        // 针对部分安卓手机font-size bug
        if (isIOS()) return
        let clientWidth = docEl.clientWidth

        var computedFontSize = 100 * (clientWidth / uiWidth)
        var newFontSize = window.getComputedStyle(document.getElementsByTagName('html')[0]).fontSize.replace('px', '')
        var scale = newFontSize / computedFontSize
        docEl.style.fontSize = `${computedFontSize / scale}px`
    }

    var docEl = doc.documentElement
    var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize'
    var uiWidth = 375 // 设计稿宽度
    var maxClientWidth = 750 // 手机设备最大宽度
    console.log('docEl.clientWidth' + docEl.clientWidth)
    var recalc = function () {
        var clientWidth = docEl.clientWidth
        if (!clientWidth) {
            return
        }
        if (clientWidth >= maxClientWidth) {
            docEl.style.fontSize = `${100 * (maxClientWidth / uiWidth)}px`
        } else {
            docEl.style.fontSize = `${100 * (clientWidth / uiWidth)}px`
            retFontSize()
        }
    }
    if (!doc.addEventListener) {
        return
    }
    win.addEventListener(resizeEvt, recalc, false)
    doc.addEventListener('DOMContentLoaded', recalc, false)
})(document, window)
