export function setPageTitle(title) {
    document.title = title
    if (/hexin/gi.test(navigator.userAgent)) {
        if (navigator.userAgent.toLowerCase().indexOf('android') > 0) {
            window.callNativeHandler('changeWebViewTitle', { title, url: '' })
        } else {
            window.callNativeHandler('updateTitleAutomatically')
        }
    }
}
