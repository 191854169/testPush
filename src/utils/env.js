// 运行环境相关
// 2022-04-14

import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js'
import { getQueryString, isDeviceMobile, getRunEnv as _getRunEnv } from '@/utils/tools'

export const getRunEnv = _getRunEnv

/**
 * 获取当前接口版本
 * @returns // v0: 网厅接口版本， v1\v2: 自研接口版本
 */
export const getPathVersion = (version = 'v1') => {
    const runEnv = getRunEnv()
    // 网厅v0接口，自研与站外v1接口
    return runEnv === 2 ? 'v0' : version
}

/*
 * 获取页面来源
 */
export const getOrigin = () => {
    // 1：同花顺公版 2：同花顺OEM 3：Web网厅 4：移动网厅 5：利通天下 6：自研APP
    if (JSBridge) {
        // app
        return 6
    }
    //网厅
    const isMobile = isDeviceMobile()
    return isMobile ? 4 : 3
}

/*
 * 获取颜色类型
 * 1 - // 橙涨绿跌 2 -// 绿涨橙跌 3 - // 红涨绿跌 4 - // 绿涨红跌
 */
export const getPriceColorType = () => {
    const DEFAULT_PRICE_COLOR_TYPE = 1
    const KEY = 'priceColorType'
    const reg = new RegExp(`(?:${KEY})/([^\\s]+)`)
    return (
        (window.navigator.userAgent.match(reg) || [])[1] ||
        getQueryString(KEY) ||
        getQueryString(KEY, true) ||
        localStorage.getItem(KEY) ||
        DEFAULT_PRICE_COLOR_TYPE
    )
}

/*
 * 获取皮肤颜色
 * white - 白皮肤 black - 黑皮肤
 * 同花顺通过 getCssStyle()获取皮肤属性值  (white - 白皮肤 black - 黑皮肤)
 */
export const getThemeType = () => {
    const DEFAULT_SKIN_TYPE = 'white'

    const KEY = 'skinType'
    const reg = new RegExp(`(?:${KEY})/([^\\s]+)`)
    return (
        (window.navigator.userAgent.match(reg) || [])[1] ||
        getQueryString(KEY) ||
        getQueryString(KEY, true) ||
        localStorage.getItem(KEY) ||
        DEFAULT_SKIN_TYPE
    )
}

// 设置主题
export const setTheme = () => {
    // TODO: 初始化主题 white - 白皮肤 black - 黑皮肤
    const theme = getThemeType()
    console.log('---theme---:', theme)
    document.documentElement.setAttribute('data-theme', theme)
    // TODO: 清除强制颜色
    if (theme === 'black') {
        if (!document.documentElement.classList.contains('dark_background')) {
            document.documentElement.classList.add('dark_background')
            document.body.classList.add('dark_background')
        }
    } else {
        if (!document.documentElement.classList.contains('white_background')) {
            document.documentElement.classList.add('white_background')
            document.body.classList.add('white_background')
        }
    }
}

// 移除主题
export const removeTheme = () => {
    document.documentElement.setAttribute('data-theme', 'white')
    // TODO: 非首页设置白色背景色
    document.documentElement.classList.remove('dark_background')
    document.body.classList.remove('dark_background')

    if (!document.documentElement.classList.contains('white_background')) {
        document.documentElement.classList.add('white_background')
        document.body.classList.add('white_background')
    }
}
