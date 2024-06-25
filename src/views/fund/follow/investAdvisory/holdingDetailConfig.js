import { i18n } from '@/i18n/fund'

export const stockConfig = [
    {
        title: i18n.t('follow.nameCode'),
        key: 'name',
        fixed: true,
        slot: true,
        style: {
            width: `${0.87}rem`,
        },
    },
    {
        title: i18n.t('investAdvisory.szsl'),
        key: 'szsl',
        sort: true,
        slot: true,
        style: {
            width: `${0.83}rem`,
            'text-align': 'right',
            'padding-left': `${0.04}rem`,
        },
    },
    {
        title: i18n.t('investAdvisory.priceCosting'),
        key: 'price_cost',
        slot: true,
        sort: true,
        style: {
            width: `${0.79}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('investAdvisory.todayPL'),
        key: 'todayPL',
        slot: true,
        sort: true,
        style: {
            width: `${0.79}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('investAdvisory.holdingPL'),
        key: 'holdingPL',
        slot: true,
        sort: true,
        style: {
            width: `${0.79}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('investAdvisory.realizedPL'),
        key: 'realizedPL',
        slot: true,
        sort: true,
        style: {
            width: `${0.79}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('investAdvisory.unrealizedPL'),
        key: 'unrealizedPL',
        slot: true,
        sort: true,
        style: {
            width: `${0.79}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('fundSelectionByStock.cczb'),
        key: 'ratio',
        slot: true,
        sort: true,
        style: {
            width: `${0.79 + 0.01}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
            'padding-right': `${0.01}rem`,
        },
    },
]

export const fundConfig = [
    {
        title: i18n.t('follow.nameCode'),
        key: 'name',
        fixed: true,
        slot: true,
        style: {
            width: `${1.35}rem`,
        },
    },
    {
        title: i18n.t('holdlingAmount'),
        key: 'holdlingAmount',
        slot: true,
        sort: true,
        style: {
            width: `${0.98}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('yesterdayProfit'),
        key: 'latestProfit',
        slot: true,
        sort: true,
        style: {
            width: `${0.94}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('holdProfit'),
        key: 'holdProfit',
        slot: true,
        sort: true,
        style: {
            width: `${1}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('accumulatedProfit'),
        key: 'accumulatedProfit',
        slot: true,
        sort: true,
        style: {
            width: `${1}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('fundSelectionByStock.cczb'),
        key: 'ratio',
        slot: true,
        sort: true,
        style: {
            width: `${1 + 0.01}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
            'padding-right': `${0.01}rem`,
        },
    },
]

export const bondConfig = [
    {
        title: i18n.t('follow.nameCode'),
        key: 'name',
        fixed: true,
        slot: true,
        style: {
            width: `${1.35}rem`,
        },
    },
    {
        title: i18n.t('holdlingAmount'),
        key: 'holdlingAmount',
        slot: true,
        sort: true,
        style: {
            width: `${0.98}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('latestProfit'),
        key: 'latestProfit',
        slot: true,
        sort: true,
        style: {
            width: `${0.94}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
        },
    },
    {
        title: i18n.t('holdProfit'),
        key: 'holdProfit',
        slot: true,
        sort: true,
        style: {
            width: `${1 + 0.01}rem`,
            'text-align': 'right',
            'padding-left': `${0.08}rem`,
            'padding-right': `${0.01}rem`,
        },
    },
]
