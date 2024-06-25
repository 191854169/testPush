// 提交结果页
<template>
    <div class="subscribe-result">
        <div class="container-top">
            <div class="content-top" v-if="isSuccess">
                <multi-img name="submit-success" width="60" height="60" directory="common"></multi-img>
                <div class="text1">{{ $t('subscribe.submitSuccess') }}</div>
                <div class="desc">{{ $t('subscribe.announcementTime', { date: dateFormat(result.announcedTime) }) }}</div>
            </div>
            <div class="content-top" v-else>
                <multi-img name="submit-failed" width="60" height="60" directory="common"></multi-img>
                <div class="text1">{{ $t('subscribe.submitFailure') }}</div>
                <div class="desc">{{ $t('subscribe.failureReason', { reason: result.failReason }) }}</div>
            </div>
            <div v-if="isSuccess && isFromActive && activeStatus < ActiveStatusMap.notChoiceIphone" class="active-card border-8">
                <div v-if="activeStatus == ActiveStatusMap.processing" class="text-align-center" v-html="$t('subscribe.activeResult4')"></div>
                <div v-else-if="activeStatus == ActiveStatusMap.notStandard" class="text-align-center" v-html="$t('subscribe.activeResult1')"></div>
                <div v-else-if="activeStatus == ActiveStatusMap.notReceivePhone" class="text-align-left" v-html="$t('subscribe.activeResult2')"></div>
                <div v-else>
                    <div class="active-status-3">
                        {{ $t('subscribe.activeResult3') }}
                        <div class="go-fill-btn" @click="goFillAddress">{{ $t('subscribe.goFillIt') }}</div>
                    </div>
                </div>
            </div>
            <div class="content-center border-8">
                <div class="form-item" v-for="(item, index) in productInfoList" :key="index">
                    <span class="key">{{ item.title }}</span>
                    <span class="value">{{ item.value }}</span>
                </div>
            </div>
        </div>
        <div
            v-if="isSuccess && isFromActive && activeStatus > ActiveStatusMap.notStandard"
            class="flex-c border-8 join-community"
            @click="showJoinCommunityPopup = true"
        >
            <div class="flex-c">
                <multi-img name="icon_gift" width="13" height="14" directory="common"></multi-img>
                <span class="txt">{{ $t('subscribe.joinCommunity') }}</span>
            </div>
            <multi-img name="icon-right-arrow" width="16" height="16" directory="common"></multi-img>
        </div>
        <button class="done btn" @click="doneClick">{{ $t(isSuccess ? 'complete' : 'subscribe.resubscribe') }}</button>
        <button class="record btn" v-if="isSuccess" @click="recordClick">{{ $t('subscribe.record') }}</button>

        <van-popup v-model="showJoinCommunityPopup" :close-on-click-overlay="false">
            <div class="join-community-popup">
                <div class="content">
                    <div class="f19">{{ $t('subscribe.activityAssistant') }}</div>
                    <div class="f16" :style="{ marginTop: '9px' }">{{ $t('subscribe.joinCommunity') }}</div>
                    <multi-img
                        :style="{ marginTop: '17.5px' }"
                        name="join_community_QR_code"
                        width="129"
                        height="129"
                        directory="fixedDepositTreasure"
                    ></multi-img>
                    <div class="f19 highlight" :style="{ marginTop: '33.5px' }">{{ $t('subscribe.saveImg') }}</div>
                    <div class="f15" :style="{ marginTop: '13px' }">{{ $t('subscribe.openWeChat') }}</div>
                </div>
                <multi-img
                    name="icon_popup_close_w"
                    width="26"
                    height="26"
                    directory="fixedDepositTreasure"
                    @click="showJoinCommunityPopup = false"
                ></multi-img>
            </div>
        </van-popup>
    </div>
</template>

<script>
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import { periodUnitFilter } from '../filters'
import NP from 'number-precision'
import { ftdOrderDetail, getFtdOrderActiveResult } from '@/apis/ftd'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'

const formatterFilter = v => {
    return v ? thousandsFilter(toFixed(v, 2)) : '0.00'
}
const dateFormat = v => {
    return v ? dayjs(v).format('YYYY/MM/DD') : '--'
}
const ActiveChoice = {
    iphone: 1,
}
const ActiveStatusMap = {
    processing: -1, //处理中
    notStandard: 1, // 未达标
    notReceivePhone: 2, // 未领取到手机
    receivePhone: 3, // 领取到手机
    notChoiceIphone: 4, // 未选择手机
}
const NotStandard = 0 // 未达标
const Processing = 2 // 处理中

export default {
    name: 'subscribe-result',
    mixins: [platformDifferenceMixin],
    components: {},
    props: {},
    data() {
        return {
            showJoinCommunityPopup: false,
            ActiveStatusMap,
            activityResult: {
                requestSuccess: false, // 非接口返回,
                status: 0, // 定存宝订单达标, 0:未达标, 1:达标, 2:处理中
                receive: false, // 是否领取到iphone
                choice: 0, // 选择类型: 0:到本付息; 1:iphone
            },
            result: {
                orderNumber: '', //	订单编号
                orderStatus: 0, //	订单状态 200-已提交、400-认购失败，402-提交失败、 500-已认购、 501-已起息、 600-已到期、 700-已回款、701-已退款
                productCode: '', //	产品代码
                productName: '', //	产品名称
                currency: '', //	币种
                applyAmount: '', //	认购金额
                actualInterest: '', //	到期利息
                estimateActualInterestMin: '', //	到期利息min
                estimateActualInterestMax: '', //	到期利息max
                periodValue: 0, //	投资期限
                periodUnit: 'd', //	投资期限单位 d-按日, w-按周, m-按月, y-按年'
                actualInterestRate: '', //	年利率
                estimateInterestRateMin: '', // 最小预计年利率, 去除百分号, /100 的数据
                estimateInterestRateMax: '', // 最大预计年利率, 去除百分号, /100 的数据
                annualManageFeeRate: '', //	管理费率
                serviceFeeRate: '', //	服务费率
                periodLock: 0, //		产品锁定期
                failReason: '', // 失败原因（已处理语言）
                subAccountId: '', //	交易账户
                submittedTime: '', //	下单时间
                cashStatus: 0, //		资金状态
                collectStartTime: '', //	开始认购时间
                announcedTime: '', //	公布结果时间
                interestAccrualTime: '', //	起息时间
                maturityTime: '', //	到期时间
                settledTime: '', //	回款时间
                refundTime: '', //	退款时间
                settlementDays: 0, //		T+n回款日
            },
        }
    },
    computed: {
        productInfoList() {
            const currency = currencyFilter(this.result.currency)
            return [
                { title: this.$t('subscribe.serviceName'), value: this.result.productName },
                { title: this.$t('subscribe.code'), value: this.result.productCode },
                { title: this.$t('subscribe.subscribeAmount'), value: formatterFilter(this.result.applyAmount) + currency },
                { title: this.$t('subscribe.annualRateAfter'), value: this.minMaxRate },
                { title: this.$t('subscribe.investmentPeriod'), value: this.periodValueUnit },
                { title: this.$t('subscribe.valueDate'), value: dateFormat(this.result.interestAccrualTime) },
                { title: this.$t('subscribe.expiryDate'), value: dateFormat(this.result.maturityTime) },
            ]
        },
        orderNumber() {
            return this.$route.query.orderNumber
        },
        activityID() {
            return this.$route.query.activityID
        },
        periodValueUnit() {
            return periodUnitFilter(this.result.periodUnit, this.result.periodValue)
        },
        minMaxRate() {
            const min = formatterFilter(NP.times(this.result.estimateInterestRateMin || 0, 100))
            const max = formatterFilter(NP.times(this.result.estimateInterestRateMax || 0, 100))
            return `${min}%~${max}%`
        },
        isSuccess() {
            return isEmpty(this.result.failReason)
        },
        isSelPhone() {
            return this.activityResult.choice == ActiveChoice.iphone
        },
        isFromActive() {
            return !isEmpty(this.activityID) && this.activityResult.requestSuccess
        },
        activeStatus() {
            // 未达标
            if (this.activityResult.status == NotStandard) {
                return ActiveStatusMap.notStandard
            } else if (this.activityResult.status == Processing) {
                return ActiveStatusMap.processing
            } else if (this.isSelPhone) {
                // 达标
                if (this.activityResult.receive) {
                    return ActiveStatusMap.receivePhone
                }
                // 手机无库存
                return ActiveStatusMap.notReceivePhone
            }
            return ActiveStatusMap.notChoiceIphone
        },
    },
    watch: {},
    created() {
        this.getOrderInfo()
    },
    mounted() {},
    destroyed() {},
    filters: {
        currencyFilter,
        formatterFilter,
    },
    methods: {
        dateFormat,
        isEmpty,
        async getOrderInfo() {
            const params = {
                orderNumber: this.orderNumber,
            }
            ftdOrderDetail(params)
                .then(({ result }) => {
                    console.log(`yinlong getOrderInfo`, result)
                    this.result = result
                    setTimeout(() => {
                        // 订单详情请求成功后再请求活动结果
                        if (!isEmpty(this.activityID)) {
                            this.getFtdOrderActiveResult()
                        }
                    }, 100)
                })
                .catch(() => {})
        },
        async getFtdOrderActiveResult() {
            const params = {
                activity_id: Number(this.activityID),
                order_id: this.orderNumber,
            }
            getFtdOrderActiveResult(params)
                .then(({ result }) => {
                    console.log(`yinlong getFtdOrderActiveResult`, result)
                    this.activityResult = result || {}
                    this.activityResult.requestSuccess = true
                    // 如果是处理中,延时1s 再次请求一次
                    if (result.status == Processing) {
                        setTimeout(() => {
                            this.getFtdOrderActiveResult()
                        }, 1000)
                    }
                })
                .catch(() => {})
        },
        doneClick() {
            if (this.isSuccess) {
                this.backPreviousPage()
            } else {
                this.$router.replace({
                    path: '/subscribe',
                    query: {
                        productCode: this.result.productCode,
                    },
                })
            }
        },
        recordClick() {
            this.$goPage('/order-list')
        },
        goFillAddress() {
            this.$goPage('/consignInfo', { receive: 1, openType: 1 }, { pathname: '/activity/depositReserve.html' })
        },
    },
}
</script>

<style lang="less" scoped>
@import url('~@/assets/css/mixins.less');

.subscribe-result {
    display: flex;
    flex-direction: column;
    #iosBottom(18);

    .container-top {
        overflow: auto;
    }

    .content-top {
        display: flex;
        flex-direction: column;
        align-items: center;

        img {
            margin-top: 37px;
            margin-bottom: 20px;
        }

        .text1 {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 18px;
        }

        .desc {
            margin-top: 4px;
            margin-bottom: 32px;
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .border-8 {
        border-radius: 8px;
    }

    .active-card {
        margin: -13px 12px 14px;
        padding: 12px;
        color: @error-white;
        font-size: 12px;
        line-height: 17px;
        background-color: #fff;

        .text-align-center {
            text-align: center;
        }

        .text-align-left {
            text-align: left;
        }

        ::v-deep .tel-num {
            color: #015bff;
        }

        .active-status-3 {
            display: flex;
            align-items: center; // 上下居中
            color: @h1-white;
            font-size: 14px;
            line-height: 19px;

            .go-fill-btn {
                flex-shrink: 0;
                width: 54px;
                height: 26px;
                margin-left: 8px;
                color: #ff6907;
                font-size: 12px;
                line-height: 26px;
                text-align: center;
                background-color: rgba(255, 105, 7, 0.1);
                border-radius: 13px;
            }
        }
    }

    .content-center {
        margin: 0 12px;
        padding: 8px 12px;
        background: #fff;

        .title {
            height: 36px;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
            line-height: 36px;
        }

        .form-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 36px;

            .key {
                color: #666;
                font-weight: 400;
                font-size: 14px;
            }

            .value {
                color: #2f2f2f;
                font-weight: 400;
                font-size: 14px;
            }
        }
    }

    .join-community {
        display: flex;
        justify-content: space-between;
        margin: 14px 12px 10px;
        padding: 12px 16px;
        background-color: #fff;

        .txt {
            margin-left: 6px;
            color: #333;
            font-size: 12px;
            line-height: 17px;
        }
    }

    .btn {
        height: 44px;
        margin: 30px 15px 0;
        border: none;
        border-radius: 22px;
    }

    .done {
        color: #fff;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;
        background-color: @theme-white;
    }

    .record {
        margin: 0 15px;
        color: @theme-white;
        font-size: 14px;
        line-height: 20px;
        background-color: transparent;
    }
}

::v-deep .van-popup.van-popup--center {
    background: transparent;
}

.join-community-popup {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(0, 0, 0, 0);

    .content {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: calc(100vw - 70px);
        margin-bottom: 40px;
        padding: 50px 0;
        color: #333;
        font-weight: bold;
        background-color: #fff;
        border-radius: 10px;

        .f19 {
            font-size: 19px;
            line-height: 18px;
        }

        .f16 {
            font-size: 16px;
            line-height: 16px;
        }

        .f15 {
            color: #666;
            font-size: 15px;
            line-height: 15px;
        }

        .highlight {
            color: #ff6907;
        }
    }
}
</style>
