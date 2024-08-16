import { i18n } from '@/i18n/fund/index.js'
import { generateMap } from '@/utils/tools'

// 订单状态 - 映射集合
export const ORDER_STATUS_MAP = generateMap([
    [-1, i18n.t('trade.creating'), 'CREATING'], // 未提交	未提交（内部订单状态）
    [0, i18n.t('trade.weitijiao'), 'UNSUBMIT'], // 未提交	未提交（内部订单状态）
    [1, i18n.t('trade.daishouli'), 'SUBMITTED'], // 待受理 -	U - Submitted
    [2, i18n.t('trade.yichedan'), 'CANCELLED'], // 已撤单 -	N –  Cancelled by Client
    [3, i18n.t('trade.yishouli'), 'PROCESSING'], // 等待处理	O – Processing
    [4, i18n.t('trade.yishouli'), 'DEDUCTED'], // 已受理	D – Deducted
    [5, i18n.t('trade.yiquerenfene'), 'PRICED'], // 已确认份额	P – Priced
    [6, i18n.t('trade.yizhongzhi'), 'REJECTED'], //	已终止	R – Rejected
    [7, i18n.t('trade.yiwancheng'), 'SETTLED'], // 已完成	S – Settled
    [8, i18n.t('trade.xiadanshibai'), 'FAILED'], // 下单失败	下单失败（内部订单状态）
])

Object.defineProperty(ORDER_STATUS_MAP, 'DOING_STATUS_LIST', {
    writable: false,
    enumerable: true,
    value: [
        ORDER_STATUS_MAP.keysMap.CREATING,
        ORDER_STATUS_MAP.keysMap.SUBMITTED,
        ORDER_STATUS_MAP.keysMap.PROCESSING,
        ORDER_STATUS_MAP.keysMap.DEDUCTED,
        ORDER_STATUS_MAP.keysMap.PRICED,
    ],
})

// 订单类型
export const ORDER_DIRECTION_MAP = generateMap([
    [1, i18n.t('subscribe'), 'SUBSCRIBE'],
    [2, i18n.t('redeem'), 'REDEEM'],
    [5, i18n.t('trade.autoRollIn'), 'AUTO_SUBSCRIBE'],
    [6, i18n.t('trade.autoRollOut'), 'AUTO_REDEEM'],
])

// 币种类型
export const CURRENCY_MAP = generateMap([
    ['HKD', i18n.t('HKD'), 'HKD'],
    ['CNH', i18n.t('CNH'), 'CNH'],
    ['CNY', i18n.t('CNY'), 'CNY'],
    ['EUR', i18n.t('EUR'), 'EUR'],
    ['USD', i18n.t('USD'), 'USD'],
])

// 产品类型 1-公募，2-私募，3-债券，4-票据，9-现金宝
export const PRODUCT_TYPE_MAP = generateMap([
    [1, i18n.t('publicFund'), 'PUBLIC'],
    [2, i18n.t('privateFund'), 'PRIVATE'],
    [3, i18n.t('bond'), 'BOND'],
    [4, i18n.t('note'), 'BILL'],
    [8, i18n.t('alterInvestment'), 'OHTER'],
    [9, i18n.t('cashBox'), 'CASHBOX'],
])

// 基金类型 1-股票，2-债券，3-混合，4-货币，5-股权
export const FUND_TYPE_MAP = generateMap([
    [1, i18n.t('stockType'), 'stock'],
    [2, i18n.t('bondType'), 'bond'],
    [3, i18n.t('mixedType'), 'mixed'],
    [4, i18n.t('currencyType'), 'currency'],
    [5, i18n.t('stockRightType'), 'stockRight'],
])

// fundMode 枚举 0-公募，1-私募，2-债券，3-票据
export const FUND_MODE_MAP = generateMap([
    [0, i18n.t('publicFund'), 'PUBLIC'],
    [1, i18n.t('privateFund'), 'PRIVATE'],
    [2, i18n.t('bond'), 'BOND'],
    [3, i18n.t('note'), 'BILL'],
])

// 风险等级 1-低风险，2-中低风险，3-中风险，4-中高风向，5-高风险
export const RISK_RATING_MAP = generateMap([
    [1, i18n.t('lowRisk'), 'lowRisk'],
    [2, i18n.t('middleLowRisk'), 'middleLowRisk'],
    [3, i18n.t('middleRisk'), 'middleRisk'],
    [4, i18n.t('middleHighRisk'), 'middleHighRisk'],
    [5, i18n.t('highRisk'), 'highRisk'],
])

// 基金雷达图 键-值 映射
export const FUND_RADAR_MAP = generateMap([
    ['yield', i18n.t('radar.yield'), 'yield'],
    ['upCapture', i18n.t('radar.upCapture'), 'upCapture'],
    ['maxDrawown', i18n.t('radar.maxDrawown'), 'maxDrawown'],
    ['stdDev', i18n.t('radar.stdDev'), 'stdDev'],
    ['downCapture', i18n.t('radar.downCapture'), 'downCapture'],
    ['battingAvg', i18n.t('radar.battingAvg'), 'battingAvg'],
])

// 客户雷达图 键-值 映射
export const CLIENT_RADAR_MAP = generateMap([
    ['yield', i18n.t('radar.yield'), 'yield'],
    ['upCapture', i18n.t('radar.upCapture'), 'upCapture'],
    ['drawDown', i18n.t('radar.maxDrawown'), 'drawDown'],
    ['volatility', i18n.t('radar.stdDev'), 'volatility'],
    ['downCapture', i18n.t('radar.downCapture'), 'downCapture'],
    ['beyondMkt', i18n.t('radar.battingAvg'), 'beyondMkt'],
])

// 派息枚举
export const DIVIDEND_MAP = generateMap([
    [0, i18n.t('noDividend'), 'NO_DIVIDEND'],
    [1, i18n.t('dividend'), 'DIVIDEND'],
])

export const PERIOD_MAP = generateMap([
    ['m1', i18n.t('nearOneMonth'), 'm1'],
    ['m3', i18n.t('nearThreeMonth'), 'm3'],
    ['m6', i18n.t('nearSixMonth'), 'm6'],
    ['y1', i18n.t('nearOneYear'), 'y1'],
    ['y3', i18n.t('nearThreeYear'), 'y3'],
    ['y5', i18n.t('nearFiveYear'), 'y5'],
])

// 订单 来源类型 0 客户下单 1 系统下单
export const SOURCE_TYPE_MAP = generateMap([
    ['0', i18n.t('customOrder'), 'USER'],
    ['1', i18n.t('systemOrder'), 'AUTO'],
])

// 只包含年份的列表
PERIOD_MAP.YEAR_OPTIONS = PERIOD_MAP.options.slice(3)

// 债券订单有效期时间
export const BOND_ORDER_VALID_TIME_MAP = generateMap([
    [1, i18n.t('oneDayValid'), 'oneDay'],
    [2, i18n.t('twoDaysValid'), 'twoDays'],
    [3, i18n.t('threeDaysValid'), 'threeDays'],
])
// 债券类型
export const BOND_TYPE_MAP = generateMap([
    [0, i18n.t('piBond'), 'piBond'],
    [1, i18n.t('usaNationalDebt'), 'usaBond'],
])

// 投资集中度映射
export const INVEST_FOCUS_DEGREE_MAP = generateMap([
    [1, 15, 'fifteen'],
    [2, 30, 'thirty'],
    [3, 45, 'forty-five'],
    [4, 60, 'sixty'],
    [128, 61, 'moreThanSixty'],
])
// 资产类型 1-公募，2-私募，3-债券，8-另类，9-现金宝 10-定存宝 11-现金宝专户 13-投顾
// 展示顺序 10, 11, 9, 1, 3, 8, 2, 13
export const ASSET_TYPE_MAP = generateMap([
    ['all', i18n.t('allAssets'), 'all'],
    ['1', i18n.t('publicFund'), 'publicFund'],
    ['2', i18n.t('privateFund'), 'privateFund'],
    ['3', i18n.t('bond'), 'bond'],
    ['8', i18n.t('alterInvestment'), 'alterInvestment'],
    ['9', i18n.t('cashBox'), 'cashBox'],
    ['10', i18n.t('fixedDepositAccount'), 'fixedDepositTreasure'],
    ['11', i18n.t('starSpecialAccount'), 'starSpecialAccount'],
    ['13', i18n.t('investAdvisoryAccount'), 'investAdvisory'],
])

// 用户投资年限映射
export const INVEST_EXP_MAP = generateMap([
    [1, i18n.t('follow.lessOneYear'), 'lessOneYear'],
    [2, i18n.t('follow.oneToFiveYear'), 'oneToFiveYear'],
    [3, i18n.t('follow.sixToTenYear'), 'sixToTenYear'],
    [4, i18n.t('follow.moreTenYear'), 'moreTenYear'],
])

// 投资组合类型映射
export const PORTFOLIO_TYPE_MAP = generateMap([
    [1, 'HK', 'HK_STOCK'],
    [2, 'US', 'US_STOCK'],
    [3, 'PUBLIC_FUND', 'PUBLIC_FUND'],
    [4, 'mixin', 'mixin'],
])

// 跟投交易状态
export const FOLLOW_TRADE_STATUS_MAP = generateMap([
    [10, i18n.t('trade.weiwancheng'), 'wait'],
    [20, i18n.t('trade.yiwancheng'), 'success'],
    [30, i18n.t('trade.yichedan'), 'cancel'],
    [90, i18n.t('trade.xiadanshibai'), 'error'], // 下单失败(股票)/已终止(基金)
])

// 投顾交易状态
export const INVEST_ADVISORY_TRADE_STATUS_MAP = generateMap([
    [1, i18n.t('investAdvisory.unbuild'), 'unbuild'],
    [2, i18n.t('investAdvisory.builded'), 'builded'],
    [3, i18n.t('trade.weiwancheng'), 'wait'],
    [4, i18n.t('trade.yiwancheng'), 'success'],
    [5, i18n.t('follow.cancelFail'), 'fail'],
])

// 股票订单状态
export const STOCK_ORDER_STATUS_MAP = generateMap([
    [10, i18n.t('follow.waitText'), 'queuing'], // 未报
    [20, i18n.t('follow.waitText'), 'waiting'], // 待报
    [40, i18n.t('follow.waitText'), 'inMarket'], // 已报
    [50, i18n.t('follow.successText'), 'filled'], // 全成
    [60, i18n.t('follow.partSuccess'), 'partFilled'], // 部成
    [70, i18n.t('trade.yichedan'), 'cancel'], // 已撤
    [80, i18n.t('follow.partCancel'), 'partCancel'], // 部撤
    [90, i18n.t('trade.xiadanshibai'), 'reject'], // 废单
])

// 票据定制单状态 - 映射集合
export const BILL_CUSTOMIZE_STATUS_MAP = generateMap([
    [100, i18n.t('bills.pending'), 'pending'], // 待处理 -	U - Submitted
    [200, i18n.t('trade.yishouli'), 'accepted'], // 已受理 -	N –  Cancelled by Client
    [300, i18n.t('trade.daiqueren'), 'unconfirm'], // 待确认	O – Processing
    [400, i18n.t('bills.declined'), 'declined'], // 客户拒绝 - 已拒绝	D – Deducted
    [450, i18n.t('bills.rejected'), 'rejected'], // 平台拒绝 - 已驳回	P – Priced
    [500, i18n.t('bills.canceled'), 'canceled'], // 已取消	R – Canceled
    [600, i18n.t('trade.yiwancheng'), 'completed'], // 已完成	S – Settled
])

// 期望投资期限单位  1-天 2-月 3-年
export const BILL_UNIT_MAP = generateMap([
    [1, i18n.t('day'), 'day'],
    [2, i18n.t('yue'), 'month'],
    [3, i18n.t('nian'), 'year'],
])

// 是否复杂产品  0 否 1是
export const BILL_COMPLEX_MAP = generateMap([
    [0, i18n.t('no')],
    [1, i18n.t('yes')],
])

// 1确认过，2没确认过
export const BILL_CHECKED = 1

// 个人账户类型
export const CLIENT_TYPE = {
    CLIENT_INDIVIDUAL: 1, // 个人户
    CLIENT_ESOP: 2, // esop账户
    CLIENT_JOIN: 3, // 联名户
    CLIENT_CORPORATE: 4, // 公司户
    CLIENT_INSTITUTIONAL: 5, // 机构户
}

// 产品买卖状态 0: 不可交易 1: 可买卖 3: 可卖不可买 4: 可买不可卖
export const TRADE_STATUS_MAP = {
    NO_BUY_SELL: 0,
    CAN_BUY_SELL: 1,
    ONLY_CAN_SELL: 3,
    ONLY_CAN_BUY: 4,
}

// 股票订单类型
export const STOCK_ORDER_TYPE_MAP = generateMap([
    [1, i18n.t('follow.orderType1')],
    [2, i18n.t('follow.orderType2')],
    [3, i18n.t('follow.orderType3')],
    [4, i18n.t('follow.orderType4')],
    [5, i18n.t('follow.orderType5')],
    [6, i18n.t('follow.orderType6')],
    [7, i18n.t('follow.orderType7')],
    [8, i18n.t('follow.orderType8')],
    [31, i18n.t('follow.orderType31')],
    [32, i18n.t('follow.orderType32')],
    [33, i18n.t('follow.orderType33')],
])
// 状态 0：未知 1:普通用户， 2:持牌用户, 3:路人(未创建组合,未编辑信息)
export const CUSTOMER_TYPE = {
    unknow: 0,
    normal: 1,
    professional: 2,
    stranger: 3,
}

// 手动设置对立币种
export const opposeCurrencyMap = {
    HKD: 'USD',
    USD: 'HKD',
}

// 下单类型
// 1-竞价限价盘,2-竞价盘,3-限价盘,4-增强限价,5-特殊限价盘,6-暗盘订单,7-市价(目前仅用于数字货币),股票订单里是手工单,8-碎股单,31-条件单-追踪止损单,32-条件单-止盈限价单,33-条件单-追踪止损单
export const stockOrderTypeMap = {
    limitOrder: 3,
    strongLimitOrder: 4,
}

// 用户类型
export const PORTFOLIO_USER_TYPE = generateMap([
    [1, '普通客户', 'usualCustomer'],
    [2, '持牌人', 'professionCustomer'],
])

// 跟投下单页 选择的输入方式
export const FOLLOW_BUY_TYPE = generateMap([
    [1, '份数', 'number'],
    [2, '金额', 'amount'],
])

// 下单路径 1 - 模拟下单, 10 - 真实下单
export const ORDER_PATH_TYPE = generateMap([
    [1, '模拟下单', 'simulated'],
    [10, '真实下单', 'order'],
])
// 基金趋势图类型
export const CURRENCY_FUND_TREND_TYPE = generateMap([
    [1, i18n.t('jqrnh'), 'DAY7_ANNUAL'], // 七日年化
    [2, i18n.t('wfIncome'), 'INCOME_10K'], // 万份收益
    [3, i18n.t('worthTrend'), 'PERFORMANCE_TREND'], // 净值走势
])

// 页面跳转来源
export const sourcePageMap = {
    default: '',
    upgradeInvestService: 'upgradeInvestService',
}

// TgApplyStatusRepending       = TgApplyStatus(ApplyStatusRepending)      //1900 被驳回
// TgApplyStatusSubmit          = TgApplyStatus(ApplyStatusSubmit)         //2000 签署完成等待审核
// TgApplyStatusAuditedCS       = TgApplyStatus(ApplyStatusAudited1)       //2010 CS通过CS复审
// TgApplyStatusAuditedCS2      = TgApplyStatus(ApplyStatusAudited2)       //2030 CS复审通过
// TgApplyStatusAuditedLicensed = TgApplyStatus(ApplyStatusAuditedWitness) //2025 持牌代表审通过待资管RO审
// TgApplyStatusAuditedROAM     = TgApplyStatus(ApplyStatusAuditedRO)      //2040 资管RO审通过待证券RO审
// TgApplyStatusAuditedROSM     = TgApplyStatus(ApplyStatusAuditedROSM)    //2045 证券RO审通过
// TgApplyStatusOpenAcctFail    = TgApplyStatus(ApplyStatusOpenAcctFail)   //3010 开通账户失败
// TgApplyStatusOpenAcctSubmit  = TgApplyStatus(ApplyStatusOpenAcctSubmit) //3015 已提交柜台开户
// TgApplyStatusOpenAcct        = TgApplyStatus(ApplyStatusOpenAcct)       //3020 开通账户成功
// TgApplyStatusSetPwd          = TgApplyStatus(ApplyStatusSetPwd)         //3030 设置密码成功
// TgApplyStatusSetPwdFail      = TgApplyStatus(ApplyStatusSetPwdFail)     //3031 设置密码失败
// TgApplyStatusNotifyFail      = TgApplyStatus(ApplyStatusNotifyFail)     //3051 发送通知失败
// TgApplyStatusSuccess         = TgApplyStatus(ApplyStatusSuccess)        //4000 开通账户成功
// TgApplyStatusReject          = TgApplyStatus(ApplyStatusReject)         //5000 审核被拒绝
// TgApplyStatusDelete          = TgApplyStatus(ApplyStatusDelete)         //6000 被删除
// TgApplyStatusCancel          = TgApplyStatus(ApplyStatusCancel)         //7000 被取消
// 投顾子账号开通状态
export const investmentSubAccountStatus = {
    TgApplyStatusDelete: 6000,
    TgApplyStatusCancel: 7000,
}

export const TG_ORDER_STATUS_MAP = generateMap([
    [1, i18n.t('follow.waitText'), 'unsubmit'], //待提交
    [2, i18n.t('follow.waitText'), 'submitting'], //待成交
    [3, i18n.t('follow.successText'), 'allDone'], // 全成
    [4, i18n.t('follow.partSuccess'), 'partDone'], // 部成
    [5, i18n.t('follow.partCancel'), 'partCancel'], // 部撤
    [6, i18n.t('trade.yichedan'), 'cancel'], // 已撤
    [7, i18n.t('fcn.expired'), 'unvalid'], //已失效
    [8, i18n.t('trade.xiadanshibai'), 'fail'], //下单失败
    [9, i18n.t('trade.yishouli'), 'handling'], //处理中
    [10, i18n.t('trade.daishouli'), 'unAccept'], // 待受理
    [11, i18n.t('trade.yishouli'), 'accepted'], // 已受理
    [12, i18n.t('trade.yiquerenfene'), 'confirmShare'], // 已确认份额
    [13, i18n.t('trade.yiquerenfene'), 'unchannel'], // 渠道未入账
    [14, i18n.t('trade.yiwancheng'), 'finish'], // 已完成
    [15, i18n.t('trade.xiadanshibai'), 'platfromReject'], // 平台已拒绝
    [16, i18n.t('trade.xiadanshibai'), 'reject'], // 上手已拒绝
    [17, i18n.t('follow.successText'), 'complete'], // 已成交
    [18, i18n.t('trade.yiwancheng'), 'settlement'], // 已完成结算
    [19, i18n.t('trade.xiadanshibai'), 'expired'], // 过期失效
    [20, i18n.t('trade.weitijiao'), 'nosubmit'], // 未提交
])
