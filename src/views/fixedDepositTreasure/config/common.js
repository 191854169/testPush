import { i18n } from '@/i18n/fixedDepositTreasure/index.js'
import { generateMap } from '@/utils/tools'

// 订单状态 - 映射集合
export const ORDER_STATUS_MAP = generateMap([
    [0, i18n.t('status.all'), 'all'], // 全部
    [200, i18n.t('status.submitted'), 'submitted'], // 已提交
    [402, i18n.t('status.submitFailure'), 'submitFailure'], // 提交失败
    [500, i18n.t('status.subscribe'), 'subscribe'], // 已认购
    [501, i18n.t('status.interest'), 'interest'], // 已起息
    [600, i18n.t('status.expired'), 'expired'], // 已到期
    [700, i18n.t('status.receivedMoney'), 'receivedMoney'], // 已回款
    [401, i18n.t('status.subscribeFailure'), 'subscribeFailure'], // 认购失败
    [701, i18n.t('status.refunded'), 'refunded'], // 已退款
])

// 产品状态
export const PRODUCT_SUBSCRIBE_STATUS_MAP = {
    TO_BE_SUBSCRIBE: 2, // 即将认购
    SUBSCRIBING: 3, // 认购中
    END_SUBSCRIBE: 4, // 认购结束
}

// 产品标签，1:精选，2:热门
export const PRODUCT_TAG_MAP = {
    Choiceness: 1,
    Hot: 2,
}

// 产品流转状态, 100-待提交, 200-已提交, 300-即将认购, 320-认购中, 340-认购结束, 400-募集成功, 401-募集失败, 410-已起息, 500-已到期
export const PRODUCT_TURNOVER_STATUS = {
    PendingSubmission: 100,
    Submitted: 200,
    UpcomingSubscription: 300,
    InSubscription: 320,
    SubscriptionEnded: 340,
    SuccessfulFundraising: 400,
    FailedFundraising: 401,
    InterestStarted: 410,
    Expired: 500,
}

// 募集状态, 0-待公布, 1-募集成功, 2-募集失败
export const PRODUCT_COLLECT_RESULT = {
    TO_BE_ANNOUNCED: 0,
    SUCCEED: 1,
    FAILED: 2,
}
