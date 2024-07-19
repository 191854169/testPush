import { get, post } from '@/httpRequest/http.js'
const { VUE_APP_WEALTH = '', NODE_ENV } = process.env
import { isTenantApp } from '@/utils'

let domain = ''
if (isTenantApp() || NODE_ENV === 'production') domain = `${VUE_APP_WEALTH}`

const commonConfig = {
    encrypt: 0, // 1: 临时加密； 2 登录加密  0:所有状态不加密
    origin: false,
}
// 合并请求参数
const marginOptions = (data, config) => {
    return Object.assign({}, commonConfig, { data }, config)
}
/**
 * @name 公募基金列表&筛选
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001168
 */
export const getPubList = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/pub_list`, marginOptions(data, config))
}
/**
 * @name 推荐基金列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001217
 */
export const getRecommendList = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/recommend_list`, marginOptions(data, config))
}
/**
 * @name 基金筛选参数列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001233
 */
export const getFilterParam = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/filter_param`, marginOptions(data, config))
}

/**
 * @name 私募基金列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001289
 */
export const getPriList = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/pri_list`, marginOptions(data, config))
}

/**
 * @name 基金收益趋势数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001816
 */
export const getPerfTrend = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/perf_trend`, marginOptions(data, config))
}

/**
 * @name 基金收益趋势数据v2
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001814
 */
export const getPerfTrendV2 = (data = {}, config = {}) => {
    return get(`${domain}/fund/v2/perf_trend`, marginOptions(data, config))
}

/**
 * @name 基金动态回撤
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001896
 */
export const getDrawdownTrend = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/drawdown_trend`, marginOptions(data, config))
}

/**
 * @name 基金持仓
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001213
 */
export const getHolding = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/holding`, marginOptions(data, config))
}
/**
 * @name 基金资产规模
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001214
 */
export const getAssets = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/asset_size`, marginOptions(data, config))
}
/**
 * @name 基金风格箱
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001232
 */
export const getStyleBox = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/style_box`, marginOptions(data, config))
}
/**
 * @name 基金报价
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001170
 */
export const getQuote = (config = {}) => {
    return get(`${domain}/fund/v1/quote`, config)
}
/**
 * @name 获取基金报价，支持公募和私募
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001170
 */
export const getTradingRule = (config = {}) => {
    return get(`${domain}/fund/v1/trading_rule`, config)
}

/**
 * @name 基金报价
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001170
 */
export const getFundQuote = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/quote`, marginOptions(data, config))
}
/**
 * @name 获取基金交易规则
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001321
 */
export const getFundTradingRule = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/trading_rule`, marginOptions(data, config))
}

/**
 * @name 历史净值
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001178
 */
export const getHistoryNav = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/history_nav`, marginOptions(data, config))
}

/**
 * @name 历史收益
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001179
 */
export const getHistoryReturn = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/history_return`, marginOptions(data, config))
}

/**
 * @name 历史收益v2
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001895
 */
export const getHistoryReturnV2 = (data = {}, config = {}) => {
    return get(`${domain}/fund/v2/history_return`, marginOptions(data, config))
}

/**
 * @name 基金经理
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001265
 */
export const getManager = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/manager`, marginOptions(data, config))
}

/**
 * @name 基金概况
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001269
 */
export const getBrief = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/brief`, marginOptions(data, config))
}

/**
 * @name 基金文件
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001266
 */
export const getFile = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/file`, marginOptions(data, config))
}

/**
 * @name 基金构成
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001190
 */
export const getCompose = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/compose`, marginOptions(data, config))
}

/**
 * @name 基金风险指标
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001194
 */
export const getRiskIndicator = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/risk_indicator`, marginOptions(data, config))
}

/*
 * @name 基金风险指标v2
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001930
 */
export const getRiskIndicatorV2 = (data = {}, config = {}) => {
    return get(`${domain}/fund/v2/risk_indicator`, marginOptions(data, config))
}

/*
 * @name 基金基础信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001187
 */
export const getBasicInfo = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/basic_info`, marginOptions(data, config))
}

/*
 * @name 私募列表V2版本
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001903
 * @param {Object} data = { label - 标签, start, count } 参数
 */
export const getPrivateListV2 = (data = {}, config = {}) => {
    return get(`${domain}/fund/v2/pri_list`, marginOptions(data, config))
}
/*
 * @name 私募推荐列表V1版本
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001892
 * @param {String} data = { type } 支持多个，以逗号分割 1：重磅精选 2：精选推荐
 */
export const getRecommendListV1 = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/pri_recommend_list`, marginOptions(data, config))
}
/**
 * @name 货币型基金历史走势
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002106
 */
export const getCurrencyTrend = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/currency_his_trend`, marginOptions(data, config))
}

/**
 * @name 私募协议文件
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002102
 */
export const getPriDocument = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/pri_document`, marginOptions(data, config))
}

/**
 * @name 获取基金热门持股数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002320
 */
export const getTopHolder = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/finder/top_holder`, marginOptions(data, config))
}

/**
 * @name 获取基金持仓信息
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002321
 */
export const getFundHolding = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/finder/fund_holding`, marginOptions(data, config))
}

/* *
 * @name 获取基金对比-基金标签数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002057
 */
export const getCompareLabel = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/compare/label`, marginOptions(data, config))
}

/**
 * @name 获取基金对比-业绩走势数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002058
 */
export const getComparePerfTrend = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/compare/perf_trend`, marginOptions(data, config))
}

/**
 * @name 获取基金对比-历史走势数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002059
 */
export const getCompareHistoryReturn = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/compare/history_return`, marginOptions(data, config))
}

/**
 * @name 获取基金对比-风险指标数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002059
 */
export const getCompareRiskIndicator = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/compare/risk_indicator`, marginOptions(data, config))
}

/**
 * @name 获取基金雷达图数据（包含同类对比）
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002338
 */
export const getRadarData = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/radar`, marginOptions(data, config))
}
/**
 * @name 获取多个基金的雷达图数据
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002344
 */
export const getCompareRadarData = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/compare/radar`, marginOptions(data, config))
}
/**
 * @name 雷达图详情排行
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002355
 */
export const getRadarRank = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/radar_rank`, marginOptions(data, config))
}
/**
 * @name 相似雷达图
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002355
 */
export const getRadarSimilar = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/radar_similar`, marginOptions(data, config))
}
/*
 * @name 同类基金列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002413
 */
export const getCategoryList = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/category_list`, marginOptions(data, config))
}
/*
 * @name 获取基金用户推荐列表
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001002330@toc0
 */
export const getUserRecommendList = (data = {}, config = {}) => {
    return get(`${domain}/fund/v1/user_recommend`, marginOptions(data, config))
}

/**
 * @name 批量基金文件
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001266
 */
export const getFiles = (data = {}, config = {}) => {
    return get(`${domain}/fund/v2/file`, marginOptions(data, config))
}

/**
 * @name 公募基金订单日历接口
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001003906
 */
export const orderCalendar = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/order_calendar`, marginOptions(data, config))
}

/**
 * @name 批量获取基金报价
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001001342
 */
export const getFundInfo = (data = {}, config = {}) => {
    return post(`${domain}/fund/v1/batch_quote`, marginOptions(data, config))
}

/**
 * 批量获取基金信息
 * @doc https://www.tapd.cn/60236733/markdown_wikis/show/#1160236733001005383
 */
export const batchPubInfo = option => {
    return post(`${domain}/fund/v1/pub_info`, marginOptions(option))
}
