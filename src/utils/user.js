export const FINANCE_ACCOUNT = 1 // 资金账户
export const FUND_ACCOUNT = 2 // 基金账户

// 交易账户状态
export const TRADE_ACCOUNT_STATUS = {
    ACCOUNT_UNOPEN: 30, // 未开启账户
    ACCOUNT_OPENED: 31, // 账户开启
    ACCOUNT_CLOSED: 32, // 账户关闭
    ACCOUNT_OPENING: 33, // 开户中
}
// 基金账户状态
export const FUND_ACCOUNT_STATUS = {
    FUND_ACCOUNT_UNOPEN: 0, // 未开启
    FUND_ACCOUNT_OPENED: 1, // 已开启
}

// 交易密码状态
export const TRADE_PWD_STATUS = {
    PWD_UNSET: 20, // 未设置交易密码
    PWD_NORMAL: 21, // 密码正常
    PWD_LOCKED: 22, // 密码已锁定
    PWD_NEED_CHECK: 23, // 密码需要校验
}

/**
 * 获取账户状态
 * @param { Number } accountType 资金账户 基金账户
 * @returns { Boolean } 是否开户 开户 - true 未开户 - false
 */
export function getAccountStatus({ accountType, store } = {}) {
    accountType = accountType || FINANCE_ACCOUNT
    let { userInfo } = store.state.user
    userInfo = userInfo || {}
    const openFundType = userInfo?.clientInfo?.accts?.[0]?.openFundTrade // 是否开通基金交易标记：0-不开通；1-开通
    switch (accountType) {
        // 现在默认 证券账户和基金户是绑定开通
        case FINANCE_ACCOUNT:
            if (
                [TRADE_ACCOUNT_STATUS.ACCOUNT_UNOPEN, TRADE_ACCOUNT_STATUS.ACCOUNT_CLOSED, TRADE_ACCOUNT_STATUS.ACCOUNT_OPENING].includes(
                    userInfo.clientStatus
                )
            ) {
                return false
            }
            if ([TRADE_ACCOUNT_STATUS.ACCOUNT_OPENED].includes(userInfo.clientStatus)) {
                return true
            }
            return false
        case FUND_ACCOUNT:
            if (openFundType === FUND_ACCOUNT_STATUS.FUND_ACCOUNT_UNOPEN) return false
            if (openFundType === FUND_ACCOUNT_STATUS.FUND_ACCOUNT_OPENED) return true
            return false
        default:
            return false
    }
}
