import { generateMap } from '@/utils/tools'
import { i18n } from '@/i18n/common'

const $t = v => i18n.t(v)

// 账户枚举
export const accountMap = generateMap([
    ['ALL', $t('fundAccountMap.ALL'), 'ALL'],
    ['HKD', $t('fundAccountMap.HKD'), 'HKD'],
    ['USD', $t('fundAccountMap.USD'), 'USD'],
])

// 账户类型枚举
export const accountTypeMap = generateMap([
    ['1', $t('accountTypeMap.cash'), 'cash'],
    ['2', $t('accountTypeMap.margin'), 'margin'],
    ['3', $t('accountTypeMap.cash'), 'organizationCash'],
])

// 币种枚举
export const currencyMap = generateMap([
    ['HKD', i18n.t('HKD'), 'HKD'],
    ['USD', i18n.t('USD'), 'USD'],
    ['CNH', i18n.t('CNH'), 'CNH'],
    ['CNY', i18n.t('CNY'), 'CNY'],
    ['EUR', i18n.t('EUR'), 'EUR'],
])

// 产品类型枚举
export const productTypeMap = generateMap([
    ['all', i18n.t('allProduct'), 'all'],
    ['1', i18n.t('publicFund'), 'publicFund'],
    ['2', i18n.t('privateFund'), 'privateFund'],
    ['3', i18n.t('bond'), 'bond'],
    ['4', i18n.t('alterInvestment'), 'alterInvestment'],
    ['9', i18n.t('cashBox'), 'cashBox'],
])

// 资产类型枚举
// 资产类型 1-公募，2-私募，3-债券，8-另类，9-现金宝 10-定存宝 11-现金宝专户 13-投顾
// 展示顺序 10, 11, 9, 1, 3, 8, 2, 13
export const assetTypeMap = generateMap([
    ['all', i18n.t('allProduct'), 'all'],
    ['1', i18n.t('publicFund'), 'publicFund'],
    ['2', i18n.t('privateFund'), 'privateFund'],
    ['3', i18n.t('bond'), 'bond'],
    ['8', i18n.t('alterInvestment'), 'alterInvestment'],
    ['9', i18n.t('cashBox'), 'cashBox'],
    ['10', i18n.t('fixedDepositAccount'), 'fixedDepositTreasure'],
    ['11', i18n.t('starSpecialAccount'), 'starSpecialAccount'],
    ['13', i18n.t('investAdvisoryAccount'), 'investAdvisory'],
])

// 理财账户枚举
export const WEALTH_ACCOUNT_MAP = generateMap([
    ['ALL', i18n.t('allAccount'), 'allAccount'],
    ['HKD', i18n.t('hkdAccount'), 'hkdAccount'],
    ['USD', i18n.t('usdAccount'), 'usdAccount'],
])

// 账户类型枚举
export const ACCOUNT_TYPE_MAP = generateMap([
    ['1', i18n.t('cashAccount'), 'cash'],
    ['2', i18n.t('marginAccount'), 'margin'],
])

// 币种类型
export const CURRENCY_MAP = generateMap([
    ['HKD', i18n.t('HKD'), 'HKD'],
    ['USD', i18n.t('USD'), 'USD'],
    ['CNH', i18n.t('CNH'), 'CNH'],
    ['CNY', i18n.t('CNY'), 'CNY'],
    ['EUR', i18n.t('EUR'), 'EUR'],
])
// 调仓操作类型
export const REBALANCE_OPT_TYPE = generateMap([
    [1, i18n.t('buy'), 'BUY'],
    [2, i18n.t('sell'), 'SELL'],
])

// 理财产品支持的买入方式
export const PRODUCT_BUY_TYPE = generateMap([
    [0, '现金', 'cash'],
    [1, '购买力', 'purchasingPower'],
])
export const FINANCE_ACCOUNT = 1 // 资金账户
export const FUND_ACCOUNT = 2 // 基金账户
export const OPEN_DERIVATIVE = 1 // 衍生品开通标识, 0 ：未开通； 1: 已开通
// NOTE：存储在localstorage中关于资产显示的KEY -- 需要全局统一
export const WEALTH_AMOUNT_STATUS_kEY = 'WEALTH_AMOUNT_STATUS'

// 现金转孖展的状态映射
export const CASH_TO_MARGIN_STATUS = {
    Processed: 200, // 处理完成	h5状态已通过
    Pending: 300, // 待审批(CS待审批)	h5状态审核中
    Rejected: 310, // 审批拒绝(已驳回)	h5状态审核审核驳回
    CSApproved: 320, // CS审核通过(RO待审批)	h5状态审核中
    ROApproved: 330, // RO审核通过	h5状态审核中
    Withdrawal: 340, // 用户撤回	h5状态已撤回
    PendingTransfer: 400, // 待资产内转	h5状态审核中
    AssetTransferred: 420, // 资产已内转	h5状态审核中
    AccountOpeningFailed: 440, // 开户失败	h5状态处理失败
}
// 个人账户类型
export const CLIENT_TYPE = {
    CLIENT_INDIVIDUAL: 1, // 个人户
    CLIENT_ESOP: 2, // esop账户
    CLIENT_JOIN: 3, // 联名户
    CLIENT_CORPORATE: 4, // 公司户
    CLIENT_INSTITUTIONAL: 5, // 机构户
}

// 后端冻结状态码
export const FREEZE_ERROR_CODE = [
    201020, // 柜台账号被冻结
    800002, // 财富校验接口中，UC 账号被冻结，错误
    111006, // 新接口统一冻结状态码,以上保持做历史兼容
]

// 自研app需要展示弹框的后端冻结状态码
export const FREEZE_ERROR_CODE_APP = [
    111006, // 新接口统一冻结状态码
]
// 公募列表筛选条件映射值
export const PUB_LIST_FILTER_MAP = {
    BUYABLE: 1, // 可申购
    UNBUYABLE: 2, // 不可申购
    SELLABLE: 1, // 可赎回
    UNSELLABLE: 2, // 不可赎回
}

// https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001003344
export const ClientSettingKey = {
    notRemindKey: 'NotRemindKey',
    KLineSetting: 'KLineSetting',
    TradeCommonQuantityKey: 'TradeCommonQuantityKey',
}
