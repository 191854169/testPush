import { get, post, path_version, ENCRYPT_TYPES } from '@/httpRequest/http.js'
const { VUE_APP_JIAOYI = '', NODE_ENV, VUE_APP_ENV } = process.env
import { isHLApp } from '@/utils'

let domain = ''
if (isHLApp() || NODE_ENV === 'production') domain = `${VUE_APP_JIAOYI}`

// 合并请求参数
const mergeOptions = (data, config) => {
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
    let defaultEncrypt = ENCRYPT_TYPES.LOGIN
    const login = !!localStorage.getItem('session')
    if (!login || VUE_APP_ENV === 'dev') {
        defaultEncrypt = ENCRYPT_TYPES.NO_ENCRYPT
    }
    if (!Object.prototype.hasOwnProperty.call(option, 'encrypt')) {
        option.encrypt = defaultEncrypt
    }
    return Object.assign(option, { data }, config)
}

/**
 * @name 客户主页
 * @link
 */
export const ClientOverview = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/ClientOverview`, mergeOptions(data, config))
}
/**
 * @name 投资大咖列表接口
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const investMasterList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/InvestStarList`, mergeOptions(data, config))
}
/**
 * @name 星选组合榜单-榜单列表
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const portfolioLabelList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioLabelList`, mergeOptions(data, config))
}
/**
 * @name 标签列表获取
 * @link
 */
export const TagList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/TagList`, mergeOptions(data, config))
}

/**
 * @name 获取客户详情信息
 * @link
 */
export const UserInfo = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/UserInfo`, mergeOptions(data, config))
}

/**
 * @name 获取客户粉丝列表
 * @link
 */
export const UserFollowerList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/UserFollowerList`, mergeOptions(data, config))
}

/**
 * @name 获取客户关注列表
 * @link
 */
export const UserFollowingList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/UserFollowingList`, mergeOptions(data, config))
}

/**
 * @name 用户关注其他用户
 * @link
 */
export const UserFollow = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/UserFollow`, mergeOptions(data, config))
}

/**
 * @name 用户取消关注其他用户
 * @link
 */
export const UserUnFollow = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/UserUnFollow`, mergeOptions(data, config))
}

/**
 * @name 更新客户信息
 * @link
 */
export const UserInfoUpdate = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/UserInfoUpdate`, mergeOptions(data, config))
}

/**
 * @name 用户的投资组合列表
 * @link
 */
export const UserPortfolioList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/UserPortfolioList`, mergeOptions(data, config))
}

/**
 * @name 投资组合列表
 * @link
 */
export const PortfolioList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioList`, mergeOptions(data, { ...config, encrypt: ENCRYPT_TYPES.NO_ENCRYPT }))
}

/**
 * @name 组合跟投订单记录
 * @link
 */
export const PortfolioOrderList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioOrderList`, mergeOptions(data, config))
}

/**
 * @name 组合基本信息
 * @link
 */
export const PortfolioBasicInfo = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioBasicInfo`, mergeOptions(data, { ...config, encrypt: ENCRYPT_TYPES.NO_ENCRYPT }))
}
/**
 * @name 关注/取关组合
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const portfolioFollow = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioFollow`, mergeOptions(data, config))
}

/**
 * @name 组合基本信息更新
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const portfolioInfoUpdate = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioInfoUpdate`, mergeOptions(data, config))
}

/**
 * @name 关停组合
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const portfolioClose = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioClose`, mergeOptions(data, config))
}

/**
 * @name 组合收益趋势
 * @link
 */
export const PortfolioReturnTrend = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioReturnTrend`, mergeOptions(data, { ...config, encrypt: ENCRYPT_TYPES.NO_ENCRYPT }))
}

/**
 * @name 发布组合点评
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const createPortfolioComment = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioCommentCreate`, mergeOptions(data, config))
}

/**
 * @name 组合点评
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const portfolioCommentList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioCommentList`, mergeOptions(data, config))
}

/**
 * @name 删除点评
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const portfolioCommentDelete = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioCommentDelete`, mergeOptions(data, config))
}

/**
 * @name 点评编辑
 * @link http://dev-local.xingyunplan.com/service-follow-invest.dev-trade/followInvest/swagger/index.html
 */
export const portfolioCommentEdit = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioCommentEdit`, mergeOptions(data, config))
}

/**
 * @name 组合持仓分布
 * @link
 */
export const PortfolioHoldingAllocation = (data = {}, config = {}) => {
    return get(
        `${domain}/followInvest/${path_version}/PortfolioHoldingAllocation`,
        mergeOptions(data, { ...config, encrypt: ENCRYPT_TYPES.NO_ENCRYPT })
    )
}
/**
 * @name 调仓操作
 * @link
 */
export const portfolioRebalance = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioRebalance`, mergeOptions(data, config))
}

/**
 * @name 创建组合
 * @link
 */
export const PortfolioCreate = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioCreate`, mergeOptions(data, config))
}

/**
 * @name 调仓操作历史
 * @link
 */
export const RebalanceHistory = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/RebalanceHistory`, mergeOptions(data, { ...config, encrypt: ENCRYPT_TYPES.NO_ENCRYPT }))
}

/**
 * @name 组合跟投下单
 * @link
 */
export const PortfolioOrderCreate = (data = {}, config = {}) => {
    return post(`${domain}/followInvest/${path_version}/PortfolioOrderCreate`, mergeOptions(data, config))
}

/**
 * @name 组合跟投白名单判断
 * @link
 */
export const IsWhiteList = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/IsWhiteList`, mergeOptions(data, config))
}

/**
 * @name 组合跟投订单记录
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001003248
 */
export const getPortfolioOrders = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioOrders`, mergeOptions(data, config))
}

/**
 * @name 组合跟投订单详情
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001003249
 */
export const getPortfolioOrderDetail = (data = {}, config = {}) => {
    return get(`${domain}/followInvest/${path_version}/PortfolioOrderDetail`, mergeOptions(data, config))
}
