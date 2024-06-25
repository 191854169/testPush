import { generateMap } from '@/utils/tools'
import { i18n } from '@/i18n/fund'

const $t = v => i18n.t(v)

// 询价项支持选择
export const InquiryItemMap = generateMap([
    ['strikePrice', $t('fcn.strikePrice'), 1], //1: 执行价 2: 年化票息 3: 票面价格
    ['coupon', $t('fcn.coupon'), 2],
    ['notePrice', $t('fcn.notePrice'), 3],
])

// 询价类型支持选择
export const InquiryTypeMap = generateMap([
    ['normal', $t('fcn.normalInquiry'), 1], // 1: 普通询价 2: 下单询价
    ['trade', $t('fcn.tradeInquiry'), 2],
])

// 敲出方式支持选择
export const knockOutTypeMap = generateMap([
    ['periodEnd', $t('fcn.knockOutType1'), 1], //1-期末观察 2-期末观察（带记忆）3-每天观察 4-每天观察（带记忆
    ['periodEndMemory', $t('fcn.knockOutType2'), 2],
    ['daily', $t('fcn.knockOutType3'), 3],
    ['dailyMemory', $t('fcn.knockOutType4'), 4],
])

// 敲入方式支持选择
export const knockInTypeMap = generateMap([
    ['NONE', $t('fcn.knockInType1'), 1], //1-不适用 2-美式敲入 3-欧式敲入
    ['AKI', $t('fcn.knockInType2'), 2],
    ['EKI', $t('fcn.knockInType3'), 3],
])
