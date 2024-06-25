import { i18n } from '@/i18n/xcbAccount'
import { humanNum } from '@/utils'

export const periodUnitFilter = function (unit, v) {
    v = v || 0
    // 期限单位，d-按日, w-按周, m-按月, y-按年
    if (unit === 'd') {
        return `${v}${i18n.t('day')}`
    } else if (unit === 'w') {
        return `${v}${i18n.t('week')}`
    } else if (unit === 'm') {
        return `${v}${i18n.t('yue')}`
    } else if (unit === 'y') {
        return `${v}${i18n.t('year')}`
    }
    return v
}

export const manageFeeFilter = function (v) {
    v = v || 0
    if (v < 1000) {
        return v
    }
    const str = humanNum(v, 1, true, i18n, { relax: true, needQianWanUnit: true, needQianUnit: true })
    const unit = str.replace(/[\d.]/g, '')
    const num = str.replace(/[^\d.]/g, '')
    return parseFloat(num) + unit
}
