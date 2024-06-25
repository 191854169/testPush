import { i18n } from '@/i18n/fund/index.js'
export function getStepsList() {
    return [
        {
            message: i18n.t('createPortfolio.selMarket'),
            label: '1',
        },
        {
            message: i18n.t('createPortfolio.addPortfolio'),
            label: '2',
        },
        {
            message: i18n.t('createPortfolio.finishCreate'),
            label: '3',
        },
    ]
}
