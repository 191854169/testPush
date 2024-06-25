import { path_version, get, post } from '@/httpRequest/http.js'
import { isHLApp } from '@/utils'
const { NODE_ENV, VUE_APP_OPERATION = '' } = process.env

let operationDomain = ''
if (isHLApp() || NODE_ENV === 'production') {
    operationDomain = `${VUE_APP_OPERATION}`
}

/**
 * @name 获取加息券列表
 * 卡券状态	status	否	int	数据字典入口 ，全部传-1
 * 柜台编号	subAccountId	是	string	新老系统都要有，app上必传
 * 开始页码	start	否	int	从第几条开始拿，默认为0
 * 每页大小	count	否	int	往后拿多少条，默认20
 * 排序	sort
 */
export const getFtdCouponList = () => {
    const subAccountId = localStorage.getItem('sub')
    const params = { status: 1, type: '7,10', subAccountId }
    return get(`${operationDomain}/operation/${path_version}/api/v2/UserCouponList`, { params })
}

// 使用加息券接口, 参数 couponId、productCode、productSymbol
export const useCouponForFtdProduct = data => {
    return post(`${operationDomain}/operation/${path_version}/UseCoupon`, { data })
}

/**
 * @name 订单加息券金额
 * @link https://www.tapd.cn/60236733/markdown_wikis/show/?jump_count=2#1160236733001004668@toc3
 */
export const getOrderAdditionalCouponFee = params => {
    return get(`${operationDomain}/operation/${path_version}/api/v1/RaiseFundDetail`, { params })
}
