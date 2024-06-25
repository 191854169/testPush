// 交易进度
<template>
    <div class="trade-process">
        <div v-for="(item, index) in listData" :key="index">
            <div v-if="isFold && showBtn && index >= 2 && index < Math.min(maturityObsDateIndex, currentTimeIndex)">
                <div></div>
            </div>
            <div class="step" :class="{ lastStep: index == listData.length - 1 }" v-else>
                <div class="left">
                    <div class="circle-success" v-if="index < currentTimeIndex"></div>
                    <div class="circle-pending" v-else-if="index === currentTimeIndex"></div>
                    <div class="circle-none" v-else></div>
                    <div v-if="index == listData.length - 1"></div>
                    <div class="line-success" :class="{ showMore: showBtn && index === 1 }" v-else-if="index < linePendingIndex"></div>
                    <div class="line-pending" :class="{ showMore: showBtn && index === 1 }" v-else-if="index === linePendingIndex"></div>
                    <div class="line-none" :class="{ showMore: showBtn && index === 1 }" v-else></div>
                </div>
                <div class="right">
                    <p class="title">{{ item.title }}</p>
                    <p class="message" v-if="index < currentTimeIndex">{{ item.value | dateFormat }}</p>
                    <p class="message" v-else>{{ $t('estimate') }}{{ item.value | dateFormat }}</p>
                    <p class="fold-btn" @click="onClick" v-if="showBtn && index === 1">{{ buttonText }}</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import { i18n } from '@/i18n/fund/index.js'

export default {
    name: 'observations-card',
    components: {},
    filters: {
        dateFormat(v) {
            return v ? dayjs(v).format('YYYY/MM/DD') : '--'
        },
    },
    props: {
        eventDate: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            isShowMore: true,
            isFold: true,
        }
    },
    computed: {
        showBtn() {
            return this.currentTimeIndex > 2 && this.obsAndCouponDateList.length >= 2
        },
        buttonText() {
            return this.isFold ? this.$t('follow.unfold') : this.$t('follow.fold')
        },
        currentTimeIndex() {
            for (let i = 1; i < this.listData.length; i++) {
                if (i === 1 && dayjs(this.eventDate.systemDate).unix() < dayjs(this.listData[i - 1].value).unix()) {
                    return 0
                } else if (
                    dayjs(this.eventDate.systemDate).unix() >= dayjs(this.listData[i - 1].value).unix() &&
                    dayjs(this.eventDate.systemDate).unix() < dayjs(this.listData[i].value).unix()
                ) {
                    return i
                } else if (i === this.listData.length - 1 && dayjs(this.eventDate.systemDate).unix() >= dayjs(this.listData[i].value).unix()) {
                    return this.listData.length - 1
                }
            }
            return 0
        },
        linePendingIndex() {
            if (this.currentTimeIndex === 0) {
                return 0
            }
            if (this.isFold && this.showBtn && this.currentTimeIndex < this.listData.length - 1) {
                return Math.min(this.currentTimeIndex - 1, 1)
            }
            return this.currentTimeIndex - 1
        },
        maturityObsDateIndex() {
            return this.listData.findIndex(item => item.title === this.$t('observationsDate.maturityObsDate')) || 2
        },
        obsAndCouponDateList() {
            let list = []
            if (this.eventDate.obsDateList) {
                const obsDateList = this.eventDate.obsDateList.map(val => {
                    return { title: this.$t('observationsDate.obsDate'), value: val }
                })
                list = [...list, ...obsDateList]
            }
            if (this.eventDate.couponPaymentDateList) {
                const couponPaymentDateList = this.eventDate.couponPaymentDateList.map(val => {
                    return { title: this.$t('observationsDate.couponPaymentDate'), value: val }
                })
                list = [...list, ...couponPaymentDateList]
            }
            return list
        },
        listData() {
            let list = []
            if (this.eventDate.tradingDate) {
                list.push({ title: this.$t('observationsDate.tradingDate'), value: this.eventDate.tradingDate })
            }
            if (this.eventDate.issueDate) {
                list.push({ title: this.$t('observationsDate.issueDate'), value: this.eventDate.issueDate })
            }
            list = [...list, ...this.obsAndCouponDateList]
            // if (this.eventDate.tradingDate) {
            //     list.push({ title: '敲出日', value: this.eventDate.tradingDate })
            // }
            if (this.eventDate.maturityObsDate) {
                list.push({ title: this.$t('observationsDate.maturityObsDate'), value: this.eventDate.maturityObsDate })
            }
            if (this.eventDate.settlementEventDate) {
                list.push({ title: this.$t('observationsDate.settlementEventDate'), value: this.eventDate.settlementEventDate })
            }
            list.sort(function (a, b) {
                return dayjs(a.value).unix() - dayjs(b.value).unix()
            })

            return list
        },
    },
    methods: {
        onClick() {
            this.isFold = !this.isFold
        },
    },
}
</script>
<style scoped lang="less">
.trade-process {
    display: flex;
    flex-direction: column;

    /deep/ .step {
        display: flex;
        margin-bottom: 20px;

        &.lastStep {
            margin-bottom: 0;
        }

        .left {
            position: relative;
            margin-top: 2px;

            .circle {
                width: 10px;
                height: 10px;
                background-color: #fff;
                border: 2px solid #ff6907;
                border-radius: 50%;
            }

            .circle-none {
                width: 16px;
                height: 16px;
                background-color: #fff;
                border: 1.5px solid #dcdcdc;
                border-radius: 50%;
            }

            .circle-pending {
                width: 16px;
                height: 16px;
                background-color: #ff6907;
                border: 4px solid #ffe1cd;
                border-radius: 50%;
            }

            .circle-success {
                width: 16px;
                height: 16px;
                background: url('~@/assets/images/common/process-success@3x.png') center no-repeat;
                background-size: 100%;
                border-radius: 50%;
            }

            .line-none {
                position: absolute;
                top: 20px;
                left: 7px;
                width: 2px;
                height: 36px;
                background-image: linear-gradient(to bottom, #dcdcdc 0%, #dcdcdc 50%, transparent 50%);
                background-repeat: repeat-y;
                background-size: 2px 8px;
                transform: scaleX(0.7);

                &.showMore {
                    height: 56px;
                }
            }

            .line-pending {
                position: absolute;
                top: 20px;
                left: 7px;
                width: 2px;
                height: 36px;
                background-image: linear-gradient(to bottom, #ff6907 0%, #ff6907 50%, transparent 50%);
                background-repeat: repeat-y;
                background-size: 2px 8px;
                transform: scaleX(0.7);

                &.showMore {
                    height: 56px;
                }
            }

            .line-success {
                position: absolute;
                top: 20px;
                left: 7px;
                width: 2px;
                height: 36px;
                background-color: #ff6907;
                transform: scaleX(0.7);

                &.showMore {
                    height: 56px;
                }
            }
        }

        .right {
            margin-left: 20px;

            .title {
                margin-bottom: 4px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 14px;
                line-height: 20px;
            }

            .message {
                margin-bottom: 4px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .fold-btn {
        margin-top: 4px;
        color: #ff6907;
        font-size: 11px;
        line-height: 16px;
    }
}
</style>
