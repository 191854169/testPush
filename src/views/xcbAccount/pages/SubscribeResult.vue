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
            <div class="content-center border-8">
                <div class="form-item" v-for="(item, index) in productInfoList" :key="index">
                    <span class="key">{{ item.title }}</span>
                    <span class="value">{{ item.value }}</span>
                </div>
            </div>
        </div>
        <button class="done btn" @click="doneClick">{{ $t(isSuccess ? 'complete' : 'subscribe.resubscribe') }}</button>
        <button class="record btn" v-if="isSuccess" @click="recordClick">{{ $t('subscribe.record') }}</button>
    </div>
</template>

<script>
import { thousandsFilter, currencyFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import { periodUnitFilter } from '../filters'
import NP from 'number-precision'
import { ssaOrderDetail, ssaProductTotalApplyAmount } from '@/apis/xjb'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'

const formatterFilter = v => {
    return v ? thousandsFilter(toFixed(v, 2)) : '0.00'
}
const dateFormat = v => {
    return v ? dayjs(v).format('YYYY/MM/DD') : '--'
}
export default {
    name: 'subscribe-result',
    mixins: [platformDifferenceMixin],
    components: {},
    props: {},
    data() {
        return {
            showJoinCommunityPopup: false,
            totalApplyAmount: '0',
            result: {
                orderNumber: '', //	订单编号
                orderStatus: 0, //	订单状态 100-已保存, 200-已提交（待受理）, 300-已受理（预留）, 400-已取消（预留）, 401-已拒绝(已终止), 402-下单失败（提交失败）,500-已确认（已受理）, 501-已起息, 600-已到期, 700-已回款,701-已退款;
                productCode: '', //	产品代码
                productName: '', //	产品名称
                currency: '', //	币种
                applyAmount: '', //	认购金额
                actualInterest: '', //	到期利息
                periodValue: 0, //	投资期限
                periodUnit: '', //	投资期限单位 d-按日, w-按周, m-按月, y-按年'
                actualInterestRate: '', //	年利率（费后）
                fqActualInterestRate: '', //	年利率（费前）
                periodLock: 0, //	产品锁定期
                failReason: '', //	失败原因（已处理语言）
                subAccountId: '', //	交易账户
                submittedTime: '', //	下单时间
                cashStatus: 0, //	资金状态
                collectStartTime: '', //	开始认购时间
                announcedTime: '', //	公布结果时间
                interestAccrualTime: '', //	起息时间
                maturityTime: '', //	到期时间
                settledTime: '', //	回款时间
                refundTime: '', //	退款时间
                settlementDays: 0, //	T+n回款日
                annualManageFeeRate: [], //	管理费, 去除百分号, 梯度费率
            },
        }
    },
    computed: {
        productInfoList() {
            const currency = currencyFilter(this.result.currency)
            return [
                { title: this.$t('subscribe.serviceName'), value: this.result.productName },
                { title: this.$t('subscribe.code'), value: this.result.productCode },
                { title: this.$t('subscribe.amountOfCurrentPeriod'), value: formatterFilter(this.totalApplyAmount) + currency },
                { title: this.$t('subscribe.subscribeAmount'), value: formatterFilter(this.result.applyAmount) + currency },
                { title: this.$t('detail.annualisedRate'), value: `${formatterFilter(NP.times(this.result.actualInterestRate, 100))}%` },
                { title: this.$t('subscribe.investmentPeriod'), value: this.periodValueUnit },
                { title: this.$t('subscribe.valueDate'), value: dateFormat(this.result.interestAccrualTime) },
                { title: this.$t('subscribe.expiryDate'), value: dateFormat(this.result.maturityTime) },
            ]
        },

        orderNumber() {
            return this.$route.query.orderNumber
        },
        productCode() {
            return this.$route.query.productCode
        },
        periodValueUnit() {
            return periodUnitFilter(this.result.periodUnit, this.result.periodValue)
        },
        isSuccess() {
            return isEmpty(this.result.failReason)
        },
    },
    watch: {},
    created() {
        this.getOrderInfo()
        this.getProductTotalApplyAmount()
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
            ssaOrderDetail(params)
                .then(({ result }) => {
                    console.log(`yinlong getOrderInfo`, result)
                    this.result = result
                })
                .catch(() => {})
        },
        async getProductTotalApplyAmount() {
            const params = {
                productCode: this.productCode,
            }
            ssaProductTotalApplyAmount(params)
                .then(({ result }) => {
                    this.totalApplyAmount = result.totalApplyAmount || ''
                    console.log(`yinlong getProductTotalApplyAmount`, params, result)
                })
                .catch(err => {
                    console.error(`yinlong getProductTotalApplyAmount`, err)
                })
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
