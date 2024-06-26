// tools.js已提取至@fs/utils，后续移除，无需在项目单独调整。
/* eslint-disable prettier/prettier */
/* eslint-disable */
export * from '@/utils/calc.js'
export * from '@fs/utils'
import { isObj, isIos, getAppVersion, compareVersion, getValueForGlobalKey } from '@fs/utils'

/*
 * 获取语言类型
 * zhCn - 简体
 * zhTc - 繁体
 * enUs - 英文
 */
export const getLangType = () => {
    const DEFAULT_LANG_TYPE = 'zhCn'
    const KEY = 'langType'
    // 从navigator.language获取 - 需要做一个映射
    const getFormNavigator = () => {
        const lang = navigator.language || ''
        const map = {
            'zh-CN': 'zhCn',
            'zh-TW': 'zhTc',
            'zh-HK': 'zhTc',
            'zh-MO': 'zhTc',
            en: 'enUs',
        }
        return map[lang]
    }
    let langType = getValueForGlobalKey(KEY, '') || getFormNavigator() || localStorage.getItem('lang') || DEFAULT_LANG_TYPE

    if (langType === 'enUs') {
        langType = 'zhTc'
    }
    return langType
}

/**
 * @name route对象转url字符串
 * @param { Object } route
 * @returns string
 */
export function route2Url(route = {}) {
    let query = ''
    isObj(route.query) &&
        Object.keys(route.query).forEach(key => {
            query += `&${key}=${route.query[key]}`
        })
    query && (query = query.replace('&', '?'))
    return route.path + query
}

/**
 * 是否安卓
 */
export const isAndroid = () => {
    var u = navigator.userAgent
    if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
        //安卓手机
        return true
    }
    return false
}

/* @name 是否兼容IOS本地存储 readLocalStorage
 * @return { Boolean } true: 兼容|非IOS, false 不兼容|查询不到version
 */
export const compatIOSLocalStorage = () => {
    if (isIos()) {
        const appVersion = getAppVersion()
        console.log('getAppVersion:', appVersion)
        if (!appVersion) return false
        // IOS 1.1.0 才有本地存储
        if (compareVersion(appVersion, '1.1.0') === -1) {
            console.warn('检查是否兼容IOS本地存储：ios版本低于1.1.0, version:', appVersion)
            return false
        }
    }
    return true
}

/**
 * 生成映射对象
 * @param {*} arr
 * @returns {{ options: [{ key, label, value }], optionsWithAll: [{}, ...options], keyValueMap: { key: label  }, valueKeyMap: { label: key }, KeyInteralMap: { key: interalKey }, keysMap: { interalKey: key }  }}
 */
export const generateMap = arr => {
    const options = [] // { label, value }
    const keyValueMap = {} // 键 - 值
    const valueKeyMap = {} // 值 - 键
    const KeyInteralMap = {} // 值 - interalKey
    const keysMap = {} // 内部使用 方便追溯 example: ALL -> 0/all
    const interalLabelMap = {} // interalKey: label
    arr.forEach(([key, label, interalKey]) => {
        options.push({ key, value: label, label })
        keyValueMap[key] = label
        valueKeyMap[label] = key
        KeyInteralMap[key] = interalKey
        interalKey && (keysMap[interalKey] = key)
        interalKey && (interalLabelMap[interalKey] = label)
    })
    options.findLabel = function (val, defaultValue) {
        return (this.find(item => item.key === val) || {}).value || defaultValue || '--'
    }
    return {
        options,
        optionsWithAll: [{ key: '', value: '全部' }, ...options],
        keyValueMap,
        valueKeyMap,
        keysMap,
        KeyInteralMap,
        interalLabelMap,
    }
}

/**
 *
 * @param {string} key 属性
 * @param {string} value 属性值
 * @param {string} type 操作类型 replaceState：不刷新，location：刷新
 */
export const addOrUpdateQuery = (key, value, type = 'replaceState') => {
    let url = type === 'location' ? location.href : location.hash

    if (!url.includes('?')) {
        url = `${url}?${key}=${value}`
    } else {
        if (!url.includes(key)) {
            url = `${url}&${key}=${value}`
        } else {
            // eslint-disable-next-line no-useless-escape
            const re = `(\\?|&|\#)${key}([^&|^#]*)(&|$|#)`
            url = url.replace(new RegExp(re), '$1' + key + '=' + value + '$3')
        }
    }
    if (type === 'location') {
        location.href = url
    }
    if (type === 'replaceState') {
        history.replaceState({}, '', url)
    }
}

/**
 * url参数拼接
 * @param {*} url 原始链接
 * @param {*} data 参数对象
 * @returns 新链接
 */
export const addQueryStr = (url, data = {}) => {
    const query = Object.keys(data)
        .map(key => `${key}=${data[key]}`)
        .join('&')

    if (!query) return url

    return `${url}${url.includes('?') ? '&' : '?'}${query}`
}
