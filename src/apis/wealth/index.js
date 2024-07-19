import { get, post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', NODE_ENV } = process.env
import { isTenantApp } from '@/utils'
import { getPathVersion } from '@/utils/env.js'

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_JIAOYI}`

// 合并请求参数
const marginOptions = (data, config) => {
    const option = {
        origin: false,
    }
    const accts = JSON.parse(localStorage.getItem('userInfo') || '{}').clientInfo?.accts?.[0] || {}
    const subAcctId = accts.subAcctId || localStorage.getItem('sub') || undefined
    data = Object.assign(data, {
        uin: Number(localStorage.getItem('uin')) || undefined,
        clientId: accts.cltId || undefined,
        accountId: Number(accts.acctId) || undefined,
        subAccountId: subAcctId,
    })
    const defaultEncrypt = ENCRYPT_TYPES.LOGIN

    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    return Object.assign(option, { data }, config)
}

const path_version_v2 = getPathVersion('v2')
const path_version_v3 = getPathVersion('v3')

/**
 * @name 财富买入
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001972
 */
export const productBuy = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version_v2}/ProductBuy`, marginOptions(data, config))
}

/**
 * @name 财富新订单列表接口 - 包括基金、债券、票据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc3
 */
export const orderList = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/OrderList`, marginOptions(data, config))
}
/**
 * @name 财富新订单详情接口 - 可以查询基金、债券、票据的信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc4
 */
export const orderDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/OrderDetail`, marginOptions(data, config))
}
/**
 * @name (轻型)持仓信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc5
 */
export const lightHoldings = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/light/Holdings`, marginOptions(data, config))
}
/**
 * @name 查询用户收益明细列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc7
 */
export const profitLossList = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/ProfitLossList`, marginOptions(data, config))
}
/**
 * @name 查询用户资产详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415
 * @description !!! 错误码 250002 标识未开通 !!!
 */
export const ecashAssetsDetailInfo = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/AssetsDetail`, marginOptions(data, config))
}

/**
 * @name 查询用户现金宝信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc2
 */
export const ecashUserSetting = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/UserSetting`, marginOptions(data, config))
}
/**
 * @name 星财宝开通
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc2
 */
export const ecashOpen = (data = {}, config = { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC }) => {
    return post(`${domain}/wealth/${path_version}/ecash/Open`, marginOptions(data, config))
}
/**
 * @name 查询收益明细详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?left_tree=1#1160236733001002415@toc6
 */
export const ecashProfitLossDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/ProfitLossDetail`, marginOptions(data, config))
}

/**
 * @name 查询用户持仓
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?left_tree=1#1160236733001002415
 */
export const ecashHoldings = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/Holdings`, marginOptions(data, config))
}

/**
 * @name 查询用户持仓(明细)
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc7
 */
export const ecashHoldingsSummary = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/HoldingsSummary`, marginOptions(data, config))
}

/**
 * @name 申购
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc7
 */
export const ecashSubscribe = (data = {}, config = { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC }) => {
    return post(`${domain}/wealth/${path_version_v2}/ecash/Subscribe`, marginOptions(data, config))
}

/**
 * @name 赎回
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc7
 */
export const ecashRedeem = (data = {}, config = { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC }) => {
    return post(`${domain}/wealth/${path_version_v2}/ecash/Redeem`, marginOptions(data, config))
}

/**
 * @name 产品列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001003795@toc1
 */
export const ecashProductList = (data = {}, config = { encrypt: ENCRYPT_TYPES.NO_ENCRYPT }) => {
    return get(`${domain}/wealth/${path_version}/ecash/ProductList`, marginOptions(data, config))
}
/**
 * @name 更新用户配置
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc3
 */
export const userSettingUpdate = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/UserSettingUpdate`, marginOptions(data, config))
}

/**
 * @name 公募基金申购
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc6
 */
export const FundSubscribe = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version_v2}/FundSubscribe`, marginOptions(data, config))
}

/**
 * @name 公募基金赎回
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc9
 */
export const FundRedeem = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version_v2}/FundRedeem`, marginOptions(data, config))
}

/**
 * @name 公募基金撤单
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc9
 */
export const OrderCancel = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/OrderCancel`, marginOptions(data, config))
}
/**
 * @name 关闭
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc7
 */
export const ecashClose = (data = {}, config = { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC }) => {
    return post(`${domain}/wealth/${path_version}/ecash/Close`, marginOptions(data, config))
}
/**
 * @name 查询最新收益详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc7
 */
export const getLatestIncome = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/LatestProfitLossDetail`, marginOptions(data, config))
}
/**
 * @name  债券认购 - 新版包含美国国债和企业债券
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc12
 */
export const bondSubscribe = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version_v2}/BondSubscribe`, marginOptions(data, config))
}
/**
 * @name  债券赎回 - 新版包含美国国债和企业债券
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc13
 */
export const boedRedeem = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version_v2}/BondRedeem`, marginOptions(data, config))
}
/**
 * @name  查询用户持仓可交易信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc12
 */
export const holdingsTradeable = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/HoldingsTradeable`, marginOptions(data, config))
}
/**
 * @name  客户雷达图数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc19
 */
export const userRadar = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/UserRadar`, marginOptions(data, config))
}
/**
 * @name 查询用户资产
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc11
 */
export const getAssetsSummary = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/AssetsSummary`, marginOptions(data, config))
}
/**
 * @name 查询资产明细
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc12
 */
export const getAssetsDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/AssetsDetail`, marginOptions(data, config))
}
/**
 * @name 查询用户持仓列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc13
 */
export const getHoldings = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/Holdings`, marginOptions(data, config))
}
/**
 * @name 查询用户零持仓列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc14
 */
export const getCleanHoldings = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/CleanHoldings`, marginOptions(data, config))
}
/**
 * @name 查询用户持仓详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc15
 */
export const getHoldingsDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/HoldingsDetail`, marginOptions(data, config))
}
/**
 * @name 订单统计信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc16
 */
export const getOrderStatistics = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/OrderStatistics`, marginOptions(data, config))
}
/**
 * @name 查询收益明细
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc17
 */
export const getProfitLossDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ProfitLossDetail`, marginOptions(data, config))
}
/**
 * @name 查询最新收益详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc18
 */
export const getLatestProfitLossDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/LatestProfitLossDetail`, marginOptions(data, config))
}

/** TODO: 兼容之前的版本 星财宝开通状态用v2接口
 * @name  查询用户状态 (开通状态）
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc3
 */
export const ecashUserStatus = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/ecash/UserStatus`, marginOptions(data, config))
}

/**
 * @name  开关状态 (持有货基但未开通星财宝的弹窗)
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc2
 */
export const getSwitchStatus = (data = {}, config = {}) => {
    return get(`${domain}/wealth/${path_version}/ecash/SwitchStatus`, marginOptions(data, config))
}

/**
 * @name 申购并开通
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002415@toc17
 */
export const ecashSubscribeWithOpen = (data = {}, config = { encrypt: ENCRYPT_TYPES.APP_TRADE_ENC }) => {
    return post(`${domain}/wealth/${path_version}/ecash/SubscribeWithOpen`, marginOptions(data, config))
}

/**
 * @name 票据买入
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc21
 */
export const noteSubscribe = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version_v2}/NoteSubscribe`, marginOptions(data, config))
}

/**
 * @name 定制单提交
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc0
 */
export const noteCustomizationOrderCreate = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderCreate`, marginOptions(data, config))
}

/**
 * @name 定制单修改
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc1
 */
export const noteCustomizationOrderModify = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderModify`, marginOptions(data, config))
}

/**
 * @name 定制单详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc2
 */
export const noteCustomizationOrderDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderDetail`, marginOptions(data, config))
}

/**
 * @name 定制单列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc3
 */
export const noteCustomizationOrderList = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderList`, marginOptions(data, config))
}

/**
 * @name 定制单确认
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc4
 */
export const noteCustomizationOrderConfirm = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderConfirm`, marginOptions(data, config))
}

/**
 * @name 定制单拒绝
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc5
 */
export const noteCustomizationOrderReject = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderReject`, marginOptions(data, config))
}

/**
 * @name 客户定制单数量查询
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc5
 */
export const noteCustomizationOrderCount = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderCount`, marginOptions(data, config))
}

/**
 * @name 定制单取消
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc5
 */
export const noteCustomizationOrderCancel = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteCustomizationOrderCancel`, marginOptions(data, config))
}

/**
 * @name 票据订单信息更新
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004253@toc1
 */
export const noteOrderModify = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteOrderModify`, marginOptions(data, config))
}

/**
 * @name 票据交易信息查询
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004251@toc8
 */
export const noteTradeInfo = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/NoteTradeInfo`, marginOptions(data, config))
}

/**
 * @name MyLink 资产首页接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004774
 */
export const mylinkAssetsDetail = (data = {}, config = {}) => {
    return post(`${domain}/wealth/mylink/${path_version}/AssetsDetail`, marginOptions(data, config))
}

/**
 * @name 获取下单指令
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004960
 */
export const instructionCreate = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/InstructionCreate`, marginOptions(data, config))
}

/**
 * @name 根据instructionId查询订单状态
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001004960
 */
export const instructionStatus = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/InstructionStatus`, marginOptions(data, config))
}

/**
 * @name 查询进行中订单
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001928@toc16
 */
export const getOrderData = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version}/OrderStatistics`, marginOptions(data, config))
}

/**
 * @name 基金可卖出金额查询(v3版本)
 * @link 待补充
 */
export const HoldingsTradeableV3 = (data = {}, config = {}) => {
    return post(`${domain}/wealth/${path_version_v3}/HoldingsTradeable`, marginOptions(data, config))
}
