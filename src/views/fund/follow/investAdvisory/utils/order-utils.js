import { i18n } from '@/i18n/fund'
import dayjs from 'dayjs'
import { CURRENCY_MAP } from '../../../config/common'
import { amountFormatter } from '@/config/filters.js'

import { TG_ORDER_STATUS_MAP, STOCK_ORDER_TYPE_MAP } from '@/views/fund/config/common'
const orderStatusMap = TG_ORDER_STATUS_MAP.keyValueMap
const stockOrderTypeMap = STOCK_ORDER_TYPE_MAP.keyValueMap

export const orderRowList = (type, amountFilter, options = {}) => {
    const { isConfigOrder = true, currency = 'HKD', orderType = 1 } = { ...options }
    if (type === 1) {
        //股票
        return [
            {
                label: i18n.t('follow.orderType'),
                key: 'stockOrderType',
                filter: v => {
                    return v ? stockOrderTypeMap[v] || '--' : '--'
                },
            },
            {
                label: i18n.t('orderDetailCols.orderStatus'),
                key: 'orderStatus',
                filter: v => {
                    return v ? orderStatusMap[v] || '--' : '--'
                },
            },
            {
                label: i18n.t('trade.tradeDirection'),
                key: 'orderType',
                filter: v => {
                    const optTypeMap = {
                        1: i18n.t('subscribe'),
                        2: i18n.t('redeem'),
                    }
                    return v ? optTypeMap[v] || '--' : '--'
                },
            },
            {
                label: i18n.t('trade.transactDate'),
                key: 'confirmTime',
                filter: v => {
                    return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
                },
            },
            {
                key: 'divide',
            },
            {
                label: i18n.t('trade.entrustQuantity'),
                key: 'number',
                filter: v => {
                    return v ? amountFilter(v) : '--'
                },
            },
            {
                label: i18n.t('trade.entrustPrice'),
                key: 'price',
                filter: v => {
                    return v ? amountFilter(v, 3) : '--'
                },
            },
            {
                key: 'divide',
            },
            {
                label: i18n.t('trade.transactQuantity'),
                key: 'transactionQuantity',
                filter: v => {
                    return v ? amountFilter(v) : '--'
                },
            },
            {
                label: i18n.t('trade.transactAverage'),
                key: 'transactionPrice',
                filter: v => {
                    return v ? amountFilter(v, 3) : '--'
                },
            },
            {
                key: 'divide',
            },
            {
                label: i18n.t('trade.entrustAmount'),
                key: 'orderAmount',
                filter: v => {
                    return v ? `${amountFilter(v, 2)}${currency}` : '--'
                },
            },
            {
                label: i18n.t('trade.transactAmount'),
                key: 'transactionAmount',
                filter: v => {
                    return v ? `${amountFilter(v, 2)}${currency}` : '--'
                },
            },
        ]
    } else if (type === 2) {
        //基金
        return [
            {
                label: i18n.t('orderDetailCols.orderStatus'),
                key: 'orderStatus',
                filter: v => {
                    return v ? orderStatusMap[v] || '--' : '--'
                },
            },
            {
                label: i18n.t('orderDetailCols.filledGrossAmount'),
                key: 'confirmAmount',
                filter: v => {
                    return v ? `${amountFilter(v, 2)}${currency}` : '--'
                },
                hidden: !isConfigOrder,
            },
            {
                label: i18n.t('confirmShare'),
                key: 'confirmShare',
                filter: v => {
                    return v ? `${amountFilter(v, 4)}${i18n.t('trade.part')}` : '--'
                },
                hidden: !isConfigOrder,
            },
            {
                label: i18n.t('trade.confirmPrice'),
                key: 'confirmNetValue',
                filter: v => {
                    return v ? amountFilter(v, 4) : '--'
                },
                hidden: !isConfigOrder,
            },
            {
                label: i18n.t('trade.confirmCash'),
                key: 'confirmExpenses',
                filter: v => {
                    return v ? `${amountFilter(v, 2)}${currency}` : '--'
                },
                hidden: !isConfigOrder,
            },
            {
                label: i18n.t('orderDetailCols.settleDate'),
                key: 'confirmTime',
                filter: v => {
                    return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
                },
                hidden: !isConfigOrder,
            },
            {
                label: i18n.t('trade.weituoleixing'),
                key: 'orderType',
                filter: v => {
                    const optTypeMap = {
                        1: i18n.t('subscribe'),
                        2: i18n.t('redeem'),
                    }
                    return v ? optTypeMap[v] || '--' : '--'
                },
            },
            {
                label: orderType === 2 ? i18n.t('trade.sellQuantity') : i18n.t('trade.applyAmount'),
                key: orderType === 2 ? 'quantity' : 'subscriptionAmount',
                filter: v => {
                    if (orderType === 2) {
                        return `${amountFilter(v, 4)}${i18n.t('trade.part')}`
                    }
                    return v ? `${amountFilter(v, 2)}${currency}` : '--'
                },
            },
            {
                label: i18n.t('trade.tradeAccount'),
                key: 'applyAccountId',
                filter: v => {
                    return v ? v : '--'
                },
            },
            {
                label: i18n.t('trade.orderNumber'),
                key: 'orderNumber',
                filter: v => {
                    return v ? v : '--'
                },
            },
        ]
    } else if (type === 4) {
        return [
            {
                label: i18n.t('createPortfolio.cash'),
                key: 'orderAmount',
                filter: v => {
                    return v ? `${amountFilter(v, 2)}${currency}` : '--'
                },
            },
        ]
    }
    return [
        {
            label: i18n.t('orderDetailCols.orderStatus'),
            key: 'orderStatus',
            filter: v => {
                return v ? orderStatusMap[v] || '--' : '--'
            },
        },
        {
            label: i18n.t('trade.weituoleixing'),
            key: 'orderType',
            filter: v => {
                const optTypeMap = {
                    1: i18n.t('subscribe'),
                    2: i18n.t('redeem'),
                }
                return v ? optTypeMap[v] || '--' : '--'
            },
        },
        {
            label: i18n.t('trade.tradeAmount'),
            key: 'transactionAmount',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
            hidden: !isConfigOrder,
        },
        {
            label: i18n.t('orderDetailCols.filledPrice'),
            key: 'confirmPrice',
            filter: v => {
                return v ? `${amountFilter(v, 3)}${currency}` : '--'
            },
            hidden: !isConfigOrder,
        },
        {
            label: i18n.t('trade.intentPrice'),
            key: 'intendedPrice',
            filter: v => {
                return v ? `${amountFilter(v, 3)}${currency}` : '--'
            },
            hidden: isConfigOrder,
        },
        {
            label: i18n.t('trade.parAmount'),
            key: 'faceValue',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
        },
        {
            label: i18n.t('orderDetailCols.accruedInterest'),
            key: 'accruedInterest',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
            hidden: !isConfigOrder,
        },
        {
            label: i18n.t('trade.confirmCash'),
            key: 'confirmExpenses',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
            hidden: !isConfigOrder,
        },
        {
            label: i18n.t('orderDetailCols.settleDate'),
            key: 'confirmTime',
            filter: v => {
                return v ? dayjs(v).format('YYYY/MM/DD') : '--'
            },
            hidden: !isConfigOrder,
        },
        {
            label: i18n.t('trade.estInterest'),
            key: 'applyAccruedInterest',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
            hidden: isConfigOrder,
        },
        {
            label: i18n.t('trade.estPrice'),
            key: orderType === 2 ? 'estimatedRedemptionFee' : 'estimatedPurchaseCost',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
            hidden: isConfigOrder,
        },
        {
            label: i18n.t('ygAmount'),
            key: 'estimatedTransactionAmount',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
            hidden: isConfigOrder,
        },
        {
            label: i18n.t('ygjfAmount'),
            key: 'estimatedDeliveryAmount',
            filter: v => {
                return v ? `${amountFilter(v, 2)}${currency}` : '--'
            },
            hidden: isConfigOrder,
        },
        {
            label: i18n.t('trade.tradeAccount'),
            key: 'applyAccountId',
            filter: v => {
                return v ? v : '--'
            },
            hidden: isConfigOrder,
        },
        {
            label: i18n.t('trade.xdsj'),
            key: 'orderTime',
            filter: v => {
                return v ? dayjs(v).format('YYYY/MM/DD HH:mm:ss') : '--'
            },
            hidden: isConfigOrder,
        },
        {
            label: i18n.t('trade.orderNumber'),
            key: 'orderNumber',
            filter: v => {
                return v ? v : '--'
            },
            hidden: isConfigOrder,
        },
    ]
}

export const getAmountItems = item => {
    const result = []
    if (item.orderAmountHKD && item.orderAmountHKD.length > 0) {
        result.push({ amount: item.orderAmountHKD, currency: 'HKD' })
    }
    if (item.orderAmountUSD && item.orderAmountUSD.length > 0) {
        result.push({ amount: item.orderAmountUSD, currency: 'USD' })
    }
    if (item.orderAmountCNH && item.orderAmountCNH.length > 0) {
        result.push({ amount: item.orderAmountCNH, currency: 'CNH' })
    }
    if (result.length === 0) {
        result.push({ amount: null, currency: null })
    }
    return result
}

export const handleAmountWithCurrency = (amount, currency) => {
    const formattedAmount = amountFormatter(amount, { base: 2 })
    if (amount) {
        const currencyStr = CURRENCY_MAP.keyValueMap[currency] || ''
        return `${formattedAmount}${currencyStr}`
    }
    return '--'
}
