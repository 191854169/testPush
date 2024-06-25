import { generateMap } from '@/utils/tools'
import { i18n } from '@/i18n/cashBox'
const $t = v => i18n.t(v)
// 账户枚举
export const accountMap = generateMap([
    ['ALL', 'ALL', 'ALL'],
    ['HKD', 'HKD', 'HKD'],
    ['USD', 'USD', 'USD'],
])

// 币种枚举
export const currencyMap = generateMap([
    ['HKD', i18n.t('HKD'), 'HKD'],
    ['USD', i18n.t('USD'), 'USD'],
    ['CNH', i18n.t('CNH'), 'CNH'],
    ['CNY', i18n.t('CNY'), 'CNY'],
    ['EUR', i18n.t('EUR'), 'EUR'],
])

// 自动申赎日期选项
const week = $t('week')
export const selectDateMap = {
    DAY: ['每日（交易日）'],
    WEEK: [`${week}一`, `${week}二`, `${week}三`, `${week}四`, `${week}五`],
    MONTH: [
        '1日',
        '2日',
        '3日',
        '4日',
        '5日',
        '6日',
        '7日',
        '8日',
        '9日',
        '10日',
        '11日',
        '12日',
        '13日',
        '14日',
        '15日',
        '16日',
        '17日',
        '18日',
        '19日',
        '20日',
        '21日',
        '22日',
        '23日',
        '24日',
        '25日',
        '26日',
        '27日',
        '28日',
    ],
}

// 设置选择时间范围
export const rangeMap = generateMap([
    ['DAY', '每日', '0'],
    ['WEEK', `每${week}`, '1'],
    ['MONTH', '每月', '2'],
])

export const CASHBOXINPUTINFO = 'cashBoxInputInfo'
