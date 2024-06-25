<template>
    <div :class="['wealth-activity-card-page', all.length == 0 ? 'wealth-activity-card-page-empty' : '']">
        <div v-if="all.length" class="has-coupon-wrapper">
            <div class="has-coupon-inner-wrapper">
                <div class="scroll-cards-wrapper">
                    <AdditionalCouponList @select-coupon="handleCouponSelect" ref="canUseList"></AdditionalCouponList>
                    <AdditionalCouponList :is-disabled="true"></AdditionalCouponList>
                </div>
            </div>
            <div class="back-btn-wrapper">
                <div class="box-shadow-wrapper">
                    <span class="btn-left">
                        <span v-if="!subscriptionAmount">{{ $t('coupon.srjehkxzkyyhq') }}</span>
                        <span v-if="subscriptionAmount" class="has-additonal-amount-wrapper">
                            <span>
                                {{ $t('coupon.yujiewaijiaxi') }}
                            </span>
                            <span class="additional-amount">{{ formatterShowAmount }} {{ currencyEn2Cn }}</span>
                        </span>
                    </span>
                    <span class="btn-right" :class="{ 'is-unselected': isDisabledConfirmClick }" @click="handleConfirmClick">
                        {{ $t('coupon.queren') }}
                    </span>
                </div>
            </div>
        </div>
        <div v-if="!all.length" class="empty-page">
            <multi-img class="arrow" name="empty-status" directory="common" />
            <p>{{ $t('coupon.nodata') }}</p>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { thousandsFilter } from '@/config/filters.js'
import { toFixed } from '@/utils'
import AdditionalCouponList from './AdditionalCouponList.vue'
import BScroll from '@better-scroll/core'

const formatterFilter = v => thousandsFilter(toFixed(v, 2))

export default {
    name: 'CouponIndex',
    components: { AdditionalCouponList },
    data() {
        return {
            additionAmountFromChild: 0, // 加息金额
        }
    },
    computed: {
        ...mapGetters(['all', 'subscriptionAmount', 'persistenceProductInfo', 'additionAmount', 'canUseCoupons']),
        currencyEn2Cn() {
            return this.persistenceProductInfo.currency === 'HKD' ? '港元' : '美元'
        },
        formatterShowAmount() {
            return formatterFilter(this.additionAmountFromChild)
        },
        isDisabledConfirmClick() {
            return !this.canUseCoupons.length
        },
    },
    methods: {
        handleConfirmClick() {
            if (this.isDisabledConfirmClick) return
            this.$refs.canUseList.funcDefineForParentUse()
            this.$router.back()
        },
        handleCouponSelect(v) {
            this.additionAmountFromChild = v
        },
    },
    mounted() {
        // 选中过后进入页面赋值展示
        this.additionAmountFromChild = this.additionAmount
        if (this.all.length) {
            this.bs = new BScroll('.has-coupon-inner-wrapper', { click: true, probeType: 3 })
            this.$nextTick(() => {
                this.bs.refresh()
            })
        }
    },
}
</script>

<style lang="less" scoped>
@import url('./coupon-list.less');

.wealth-activity-card-page {
    .has-coupon-wrapper {
        padding: 12px;
        padding-bottom: 132px;
        overflow: hidden;

        .has-coupon-inner-wrapper {
            height: 100%;
        }
    }

    .back-btn-wrapper {
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 1000;
        width: 100%;
        padding: 0.03rem 0.28rem 0.34rem;

        .box-shadow-wrapper {
            display: flex;
            background: #fff;
            border-radius: 26px;
        }

        .btn-left {
            display: inline-block;
            flex: 0 0 203px;
            width: 203px;
            height: 44px;
            color: #666;
            font-size: 12px;
            line-height: 44px;
            text-align: center;
            background: #fff;
            border-top-left-radius: 26px;
            border-bottom-left-radius: 26px;
            box-shadow: 0 1px 15px 0 #00000014;

            .has-additonal-amount-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;

                span {
                    &:first-child {
                        margin-right: 4px;
                    }
                }
            }

            .additional-amount {
                color: #ff6907;
                font-weight: 600;
                font-size: 14px;
            }
        }

        .btn-right {
            flex: 1;
            color: #fff;
            font-weight: 600;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background: #ff6907;
            border-top-right-radius: 26px;
            border-bottom-right-radius: 26px;
            box-shadow: 0 1px 15px 0 #00000014;

            &.is-unselected {
                opacity: 0.3;
            }
        }
    }
}
</style>
