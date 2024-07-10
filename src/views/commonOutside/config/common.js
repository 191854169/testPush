import { i18n } from '@/i18n/commonOutside/index.js'
import { generateMap } from '@/utils/tools'

// 订单状态 - 映射集合
export const ORDER_STATUS_MAP = generateMap([
    [200, i18n.t('status.submitted'), 'submitted'], // 已提交
    [500, i18n.t('status.subscribe'), 'subscribe'], // 已认购
    [501, i18n.t('status.interest'), 'interest'], // 已起息
    [600, i18n.t('status.expired'), 'expired'], // 已到期
])

// 账户类型枚举
export const ACCOUNT_MAP = {
    1: i18n.t('accountTypeMap.cash'),
    2: i18n.t('accountTypeMap.margin'),
    3: i18n.t('accountTypeMap.cash'),
}

// 风险状态
export const RISK_LEVEL = {
    1: '安全',
    2: '中等',
    3: '追保',
    4: '危险',
}

// 风险状态颜色
export const RISK_COLOR = {
    1: '#29C277',
    2: '#157AEE',
    3: '#FF8717',
    4: '#FC3213',
}

// 币种
export const CURRENCY_LIST = [
    { value: 'USD', text: i18n.t('USD') },
    { value: 'HKD', text: i18n.t('HKD') },
    { value: 'CNH', text: i18n.t('CNH') },
]

// 币种
export const CURRENCY_MAP = {
    HKD: i18n.t('HKD'),
    USD: i18n.t('USD'),
    CNH: i18n.t('CNH'),
}

// 账户明细swipe币种对应的卡片值
export const SWIPE_MAP = {
    HKD: 1,
    USD: 2,
    CNH: 3,
}

//  理财类型
export const WEALTH_MAP = generateMap([
    ['Wealth-ALL', '全部', ''],
    ['Wealth-USD', '美元理财', 'USD'],
    ['Wealth-HKD', '港元理财', 'HKD'],
])

/**
 * https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001000410@toc3
 * 资金流水一级分类
 */
export const flowType2Icon = {
    1 /* 其他 */: 'qt',
    2 /* 基金 */: 'jj',
    3 /* 债券 */: 'zq',
    4 /* 新股及配售 */: 'ipo',
    5 /* 公司行动 */: 'gs',
    6 /* 出入金 */: 'crj',
    7 /* 货币兑换 */: 'hbdh',
    8 /* 资金调拨 */: 'zjdb',
    22 /* 定存宝*/: 'dcb',
    23 /* 迎新宝 */: 'xingcaibaozh',
}

export const ACTIVE_TAB_STR = 'activeTab'
