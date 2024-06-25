<template>
    <div class="radio-card">
        <div class="card-main">
            <div class="title">{{ $t('trade.investAssetRatio') }}</div>
            <div class="t-tips">{{ $t('productDemand') }}{{ $t(`bills.payRate.${investFocusDegree}`) }}</div>
            <div class="radio">
                <van-radio-group v-model="radio" direction="horizontal" @change="handleRadioChange">
                    <van-radio v-for="i in investFocusDegreeList" :key="i" :name="i">
                        <template v-slot:icon="{ checked }">
                            <multi-img
                                :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                directory="fund"
                                style="width: 16px"
                            ></multi-img>
                        </template>
                        <span>{{ $t(`bills.payRate.${i}`) }}</span>
                    </van-radio>
                </van-radio-group>
                <p class="custips" v-if="showTips">
                    {{ $t('jzdtips') }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
import { RadioGroup, Radio } from 'vant'

export default {
    name: 'invest-asset-ratio',
    props: {
        investFocusDegree: {
            type: Number,
            default: 1,
        },
    },
    components: {
        [RadioGroup.name]: RadioGroup,
        [Radio.name]: Radio,
    },
    watch: {
        investFocusDegree: {
            handler(v) {
                this.handleRadioChange(this.ratio)
            },
        },
    },
    data() {
        return {
            investFocusDegreeList: [1, 2, 3, 4, 5],
            radio: 0,
            showTips: false,
            quoteInfo: {},
        }
    },
    computed: {},
    methods: {
        // 处理资产占比
        handleRadioChange(value) {
            // fix切换票据产品，未选投资集中度，可以认购的问题
            if (!value) {
                return false
            }
            if (this.investFocusDegree > 0 && value > this.investFocusDegree) {
                this.showTips = true
            } else {
                this.showTips = false
            }
            this.$emit('ratioChange', value)
        },
    },
}
</script>

<style lang="less" scoped>
.radio-card {
    display: flex;
    flex-direction: column;
    padding: 20px 12px;
    color: #2f2f2f;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;

    .card-main {
        .radio {
            margin-top: 12px;

            ::v-deep .van-radio-group--horizontal {
                justify-content: space-between;

                .van-radio--horizontal {
                    margin-right: 6px;

                    .van-radio__label {
                        margin-left: 6px;
                    }
                }
            }
        }

        .t-tips {
            margin-top: 6px;
            margin-bottom: 14px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
        }

        .custips {
            margin-top: 8px;
            color: #f31414;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }
    }
}
</style>
