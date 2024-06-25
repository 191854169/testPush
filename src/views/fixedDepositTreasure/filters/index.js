import { i18n } from '@/i18n/fixedDepositTreasure'

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
