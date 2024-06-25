// import { i18n } from '@/i18n/fund/index.js'
// import { generateMap } from '@/utils/tools'
import { FOLLOW_TRADE_STATUS_MAP, INVEST_ADVISORY_TRADE_STATUS_MAP } from '@/views/fund/config/common'

export const tradeStatusKeyValueMap = FOLLOW_TRADE_STATUS_MAP.keyValueMap
export const tradeStatusTextCommonMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.wait],
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: tradeStatusKeyValueMap[FOLLOW_TRADE_STATUS_MAP.keysMap.success],
}
export const tradeStatusIconMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: 'icon-wait',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: 'icon-success',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: 'icon-error',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: 'icon-error',
}

export const investAdvisoryStatusIconMap = {
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.unbuild]: 'icon-wait',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.builded]: 'icon-success',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.wait]: 'icon-wait',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.success]: 'icon-success',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.fail]: 'icon-error',
}

export const tradeStatusClassTextMap = {
    [FOLLOW_TRADE_STATUS_MAP.keysMap.wait]: 'status_text_wait',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.success]: 'status_text_success',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.cancel]: 'status_text_error',
    [FOLLOW_TRADE_STATUS_MAP.keysMap.error]: 'status_text_error',
}

export const investAdvisoryStatusClassTextMap = {
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.unbuild]: 'status_text_wait',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.builded]: 'status_text_success',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.wait]: 'status_text_wait',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.success]: 'status_text_success',
    [INVEST_ADVISORY_TRADE_STATUS_MAP.keysMap.fail]: 'status_text_error',
}
