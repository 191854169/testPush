import { thousandsFilter } from '@/config/filters.js'
import { i18n } from '@/i18n/fund'

export const dealAssetValToString = v => {
    const val1 = 10000
    const val2 = 100000000
    const newVal = +v
    if (newVal < val1) {
        return thousandsFilter(v)
    } else if (newVal >= val1 && newVal < val2) {
        return `${thousandsFilter((newVal / val1).toFixed(2))}${i18n.t('wan')}`
    }
    return `${thousandsFilter((newVal / val2).toFixed(2))}${i18n.t('yi')}`
}
