import { getPhonePlatform, isMobileTerminal } from '@/utils'

/* 监测input 聚焦与失焦事件 */
export default function (onFocus, onBlur) {
    const platform = getPhonePlatform()
    let stopToggleListener
    if (platform == 'ios') {
        const focusin = () => {
            //软键盘弹出的事件处理
            if (isMobileTerminal) {
                typeof onFocus === 'function' && onFocus()
            }
        }
        const focusout = () => {
            //软键盘收起的事件处理
            if (isMobileTerminal) {
                typeof onBlur === 'function' && onBlur()
            }
        }
        document.body.addEventListener('focusin', focusin)
        document.body.addEventListener('focusout', focusout)
        stopToggleListener = () => {
            document.body.removeEventListener('focusin', focusin)
            document.body.removeEventListener('focusout', focusout)
        }
    } else {
        const originalHeight = document.documentElement.clientHeight || document.body.clientHeight
        const resizeFun = () => {
            //键盘弹起与隐藏都会引起窗口的高度发生变化
            var resizeHeight = document.documentElement.clientHeight || document.body.clientHeight
            if (resizeHeight - 0 < originalHeight - 0) {
                //当软键盘弹起，在此处操作
                if (isMobileTerminal) {
                    typeof onFocus === 'function' && onFocus()
                }
            } else {
                //当软键盘收起，在此处操作
                if (isMobileTerminal) {
                    typeof onBlur === 'function' && onBlur()
                }
            }
        }
        window.addEventListener('resize', resizeFun)
        stopToggleListener = () => {
            window.removeEventListener('resize', resizeFun)
        }
    }
    return stopToggleListener
}
