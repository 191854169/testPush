import { generateMap } from '@/utils/tools'
import { i18n } from '@/i18n/fund'
import { humanNum } from '@/utils'
/** 投资经验及年期的通用列表 */
export const investmentExpFilter = function (v) {
    const tagObj = {
        1: i18n.t('master.lessOneYear'),
        2: i18n.t('master.oneToFiveYear'),
        3: i18n.t('master.sixToTenYear'),
        4: i18n.t('master.moreTenYear'),
    }
    return tagObj[v] || '--'
}

/**  */
export const followerNumFilter = function (v) {
    v = v || 0
    if (v < 10000) {
        return v
    }
    const str = humanNum(v, 2, true, i18n, { relax: true })
    const unit = str.substr(-1)
    const num = str.substring(0, str.length - 1)
    return parseFloat(num) + unit
}

// 投资组合类型
export const groupTypeFilter = function (v) {
    const tagObj = {
        1: i18n.t('follow.hkStock'),
        2: i18n.t('follow.usStock'),
        3: i18n.t('follow.fundName'),
        4: i18n.t('mixed'),
    }
    return tagObj[v] || '--'
}
// 收益周期title
export const profitTitleFilter = function (v) {
    const map = {
        w1: i18n.t('master.nearOneWeekProfit'),
        m1: i18n.t('master.nearOneMonthProfit'),
        m3: i18n.t('master.nearThreeMonthProfit'),
        m6: i18n.t('master.nearSixMonthProfit'),
        y1: i18n.t('master.nearOneYearProfit'),
        y3: i18n.t('master.nearThreeYearProfit'),
        total: i18n.t('accumulatedProfit'),
        follower: i18n.t('starSel.follower'),
    }
    return map[v] || '--'
}

export const tgProductTypeMap = generateMap([
    [1, i18n.t('follow.stockName')],
    [2, i18n.t('publicFund')],
    [3, i18n.t('bond')],
    [4, i18n.t('mixed')],
])
