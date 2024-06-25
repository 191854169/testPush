<template>
    <div class="trade-tip">
        <van-dialog
            v-model="show"
            :title="$t('piGuide.warmTip')"
            :show-cancel-button="true"
            cancel-button-color="#2F2F2F"
            confirm-button-color="#FF6307"
            :confirm-button-text="$t('goonTrade')"
            @confirm="onConfirm"
            @closed="onClosed"
        >
            <div class="content">
                <!-- 1. 托管费校验 2. 交易时段校验 -->
                <template v-if="type === 'fee'">
                    <p
                        class="fee-tip"
                        v-html="$t(forCustomerFee <= 20 ? 'forCustomerFeeTipLessThan20' : 'forCustomerFeeTip', { forCustomerFee, currency })"
                    ></p>
                </template>
                <template v-if="type === 'withdrawalBalance'">
                    <p class="fee-tip">{{ $t('tradeFailedForDebt') }}</p>
                </template>
                <template v-if="type === 'date'">
                    <p>{{ $t('canTradeInCurrTimeTip') }}</p>
                    <div class="checkbox" @click="onCheck">
                        <multi-img v-show="checked" name="icon_agreement_select" directory="fund"></multi-img>
                        <multi-img v-show="!checked" name="icon_agreement_normal" directory="fund"></multi-img>
                        <span>{{ $t('notRemindNextTime') }}</span>
                    </div>
                </template>
            </div>
        </van-dialog>
    </div>
</template>

<script>
import { getExchangeDateStatus } from '@/apis/info.js'
import dayjs from 'dayjs'
import { milliFormat } from '@/utils'
export default {
    name: 'trade-tip',
    props: {
        currency: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            show: false,
            checked: false,
            type: '',
            fee: 0,
            localStorageKey: 'NOT_REMIND_TRADE_TIME',
        }
    },
    mounted() {
        const ret = localStorage.getItem(this.localStorageKey)
        if (ret) {
            try {
                this.checked = JSON.parse(ret) || false
            } catch (e) {
                console.error(e)
            }
        }
    },
    computed: {
        forCustomerFee() {
            const ret = Number.parseFloat(this.fee, 100)
            if (Number.isNaN(ret)) return undefined
            if (ret <= 20) return 20
            return milliFormat(ret)
        },
    },
    methods: {
        onConfirm() {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.checked))
            this.$emit('on-confirm', { checked: this.checked })
        },

        onCheck() {
            this.checked = !this.checked
        },

        checkFee(fee = 0) {
            this.fee = fee
            this.show = true
            this.type = 'fee'
        },
        async checkDate() {
            try {
                const params = {
                    market: 'hk',
                }
                const { result } = await getExchangeDateStatus(params)
                const [{ isTradingDay } = {}] = result?.list || []
                let { systemTime } = result || {}
                // 低系统的IOS 手机不支持 2023-07-13 03:15:44中的-
                systemTime = systemTime.replace(/-/g, '/')
                const checkDatetime = (begin = '09:00:00', end = '17:00:00') => {
                    const yearFormat = dayjs(systemTime).format('YYYY/MM/DD')
                    const curTimeStamp = new Date(systemTime).getTime()
                    const beginTimeStamp = new Date(`${yearFormat} ${begin}`).getTime()
                    const endTimeStamp = new Date(`${yearFormat} ${end}`).getTime()
                    return curTimeStamp >= beginTimeStamp && curTimeStamp <= endTimeStamp
                }
                if (isTradingDay !== undefined) {
                    console.log('checkDatetime() ==>', checkDatetime(), isTradingDay)
                    if (!(isTradingDay === '1' && checkDatetime())) {
                        if (!this.checked) {
                            this.show = true
                            this.type = 'date'
                            return false
                        }
                    }
                }
                return true
            } catch (e) {
                console.error(e)
                return false
            }
        },
        checkWithdrawalBalance() {
            this.show = true
            this.type = 'withdrawalBalance'
        },

        async check(type, data) {
            const list = ['fee', 'date', 'withdrawalBalance']
            if (type && list.includes(type)) {
                const handler = { fee: 'checkFee', date: 'checkDate', withdrawalBalance: 'checkWithdrawalBalance' }[type]
                let ret = true
                this[handler] && (ret = await this[handler](data))
                return ret
            }
            if (!this.checkFee()) return false
            if (!(await this.checkDate())) return false
        },

        onClosed() {
            this.show = false
            this.type = ''
        },
    },
}
</script>

<style scoped lang="less">
.trade-tip {
    /deep/ .content {
        margin: 0 16px;

        p {
            color: @fontBlackColor;
            font-size: 14px;
            line-height: 20px;

            &.fee-tip {
                margin-bottom: 28px;
            }

            .fee {
                color: @theme;
            }
        }

        .checkbox {
            display: flex;
            align-items: center;
            margin: 12px 0;

            img {
                width: 16px;
                margin-right: 4px;
            }

            span {
                color: #9c9c9c;
                font-size: 14px;
                line-height: 20px;
            }
        }
    }
}
</style>
