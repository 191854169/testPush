import { i18n } from '@/i18n/cmhk/index.js'
import { generateMap } from '@/utils/tools'

// 订单状态 - 映射集合
export const ORDER_STATUS_MAP = generateMap([
    [200, i18n.t('status.submitted'), 'submitted'], // 已提交
    [500, i18n.t('status.subscribe'), 'subscribe'], // 已认购
    [501, i18n.t('status.interest'), 'interest'], // 已起息
    [600, i18n.t('status.expired'), 'expired'], // 已到期
])
