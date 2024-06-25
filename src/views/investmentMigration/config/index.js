import { i18n } from '@/i18n/investmentMigration/index.js'
import { generateMap } from '@/utils/tools'

export const features = [
    {
        key: 'deposit',
        label: i18n.t('features.saveCapital'),
        imgName: 'icon_trade_cunru',
        imgDirectory: 'investmentMigration/features',
        link: '/edda_app/fundAllocation/',
    },
    {
        key: 'capitalRecord',
        label: i18n.t('features.capitalRecord'),
        imgName: 'icon_trade_zjjl',
        imgDirectory: 'investmentMigration/features',
        link: '/edda_app/eddaRecord/migrate-record-list?type=4&migrate=1',
    },
    {
        key: 'productSection',
        label: i18n.t('features.productSection'),
        imgName: 'icon_product_section',
        imgDirectory: 'investmentMigration/features',
        link: '/wealth/fund.html#/investment-migrate-zone',
    },
]
