import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { Locale } from 'vant'
// import enUS from 'vant/lib/locale/lang/en-US'
import zhCN from 'vant/lib/locale/lang/zh-CN'
import zhHK from 'vant/lib/locale/lang/zh-HK' //vant 自带国际化繁体包
// import enLocale from './en_us'
import commonZhLocale from './common/zh_cn'
import commonTcLocale from './common/zh_tc'
import { getLangType } from '@/utils/tools.js'

Vue.use(VueI18n)

/**
 * 实例化i18n
 * @param {*} options
 * @param {Object} options.zhLocale 项目的简体语言
 * @param {Object} options.tcLocale 项目的繁体语言
 * @param {Object} options.enLocale 项目的英文语言（暂时不支持
 * @param {Object} options.zhCn 项目的简体语言 - 需要自己传入公共语言库
 * @param {Object} options.zhTc 项目的繁体语言 - 需要自己传入公共语言库
 * @param {Object} options.zhTc 项目的英文语言 - 需要自己传入公共语言库（暂不支持
 * @returns { Object } i18n实例
 */
export default function initI18n(options = {}) {
    // eslint-disable-next-line prefer-const
    let { zhLocale = {}, tcLocale = {}, zhCn, zhTc } = options
    // 支持外部整体传入
    zhCn = zhCn || {
        ...zhLocale,
        ...commonZhLocale,
    }
    zhTc = zhTc || {
        ...tcLocale,
        ...commonTcLocale,
    }
    // const en = options.en || {
    //   ...enUS,
    //   ...(enLocale || {})
    // }
    const messages = {
        zhCn,
        zhTc,
        // en
    }
    const i18n = new VueI18n({
        locale: getLangType(), // 设置默认语言
        messages: messages, // 设置资源文件对象
        fallbackLocale: 'zhCn',
    })

    // 更新vant组件库本身的语言变化，支持国际化
    function vantLocales(lang = getLangType()) {
        // if (lang === 'enUs') {
        //   Locale.use(lang, enUS)
        // } else
        if (lang === 'zhCn') {
            Locale.use('zh-CN', zhCN)
        } else if (lang === 'zhTc') {
            Locale.use('zh-HK', zhHK)
        }
    }
    // 初始化vant组件多语言
    vantLocales()

    return i18n
}
