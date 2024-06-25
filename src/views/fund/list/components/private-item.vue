<template>
    <div class="fund-item" :class="{ hide: !isProfessional }" @click="onClick">
        <div class="blur-mask" v-if="!isProfessional"></div>
        <div class="fund-item-header">
            <div class="company">
                <div class="logo-box">
                    <img :src="fundInfo.companyLogo" alt="logo" />
                </div>
                <span class="name">{{ fundInfo.companyName }}</span>
            </div>
        </div>
        <div class="content" v-if="isProfessional">
            <p class="fund-name">{{ fundInfo.name }}</p>
            <div class="items">
                <div class="profit" v-if="showRevenue">
                    <div class="value" v-riseFall="fundInfo.expectedRevenue"></div>
                    <div class="label">{{ $t('expectedRevenue') }}</div>
                </div>
                <div class="profit" v-else>
                    <div class="value" v-riseFall="fundInfo.returnY1"></div>
                    <div class="label">{{ $t('yearChg') }}</div>
                </div>
                <div class="summary">
                    <div class="summary-title">{{ fundInfo.label }}</div>
                    <div class="tags">
                        <span class="tag" v-if="fundInfo.lockPeriod">{{ fundInfo.lockPeriod }}</span>
                        <span class="tag" v-if="fundInfo.type">{{ fundInfo.type | fundTypeFilter($t.bind(this)) }}</span>
                        <span class="tag" v-if="fundInfo.riskRating">{{ fundInfo.riskRating | riskRatingFilter($t.bind(this)) }}</span>
                    </div>
                </div>
            </div>
            <p class="recommend-comment">
                <multi-img name="quote" directory="fund"></multi-img>
                <span>{{ fundInfo.evaluation }}</span>
            </p>
        </div>
        <div class="content hide" v-else>
            <div class="hide-body">
                <div class="header">
                    <multi-img name="recommend-product" directory="fund"></multi-img>
                    <div class="label">{{ fundInfo.label }}</div>
                </div>
                <div class="profit" v-if="showRevenue">
                    <div class="value" v-riseFall="fundInfo.expectedRevenue"></div>
                    <div class="label">{{ $t('expectedRevenue') }}</div>
                </div>
                <div class="profit" v-else>
                    <div class="value" v-riseFall="fundInfo.returnY1"></div>
                    <div class="label">{{ $t('yearChg') }}</div>
                </div>
            </div>
            <div class="hide-footer">
                <p class="left">完成专业投资者认证即可查看</p>
                <div class="right">
                    <span>我要认证</span>
                    <span class="fsfont next">&#xe609;</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { floatToRatio } from '@/utils'
import MultiImg from '@/components/MultiImg'

export default {
    name: 'fund-item',
    components: { MultiImg },
    props: {
        fundInfo: {
            type: Object,
            default: () => ({}),
        },
        isProfessional: {
            type: Boolean,
            default: false,
        },
    },
    filters: {
        ratioFilter(v) {
            return floatToRatio(v)
        },
        fundTypeFilter(v, $t) {
            return (
                {
                    1: $t('stockType'),
                    2: $t('bondType'),
                    3: $t('mixedType'),
                    4: $t('currencyType'),
                    5: $t('stockRightType'),
                }[v] || ''
            )
        },
        riskRatingFilter(v, $t) {
            return (
                {
                    1: $t('fundList.lowRisk'),
                    2: $t('fundList.lowMidRisk'),
                    3: $t('fundList.midRisk'),
                    4: $t('fundList.midHighRisk'),
                    5: $t('fundList.highRisk'),
                }[v] || ''
            )
        },
    },
    data() {
        return {}
    },
    computed: {
        /**
         * 检测是否有净值
         * 1、有净值 显示 近一年涨跌幅
         * 2、无净值&有目标回报 显示目标回报
         * 3、无净值&无目标回报 显示 近一年涨跌幅
         * isData:0: 没有净值没有目标回报 1: 有净值 2: 没有净值有目标回报
         */
        showRevenue() {
            return this.fundInfo.isData === 2 && !!this.fundInfo.expectedRevenue
        },
    },
    methods: {
        onClick() {
            this.$emit('click', this.fundInfo)
        },
    },
}
</script>
<style scoped lang="less">
.fund-item {
    position: relative;
    padding: 12px;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;

    &-header {
        margin-bottom: 12px;

        .company {
            display: flex;
            align-items: center;

            .logo-box {
                width: 32px;
                height: 32px;
                margin-right: 8px;
                overflow: hidden;
                border: 0.5px solid #f4f4f4;
                border-radius: 50%;

                img {
                    width: 32px;
                    height: 32px;
                    object-fit: cover;
                }
            }

            .name {
                color: #2f2f2f;
                font-weight: 700;
                font-size: 14px;
                line-height: 16px;
            }
        }
    }

    .content {
        .fund-name {
            margin-bottom: 12px;
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        .items {
            display: flex;

            .profit {
                width: 120px;

                .value {
                    color: #ff6907;
                    font-weight: @fontBold;
                    font-size: 20px;
                    line-height: 28px;
                }

                .label {
                    margin-top: 6px;
                    color: #666;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .summary {
                text-align: left;

                .summary-title {
                    color: @fontBlackColor;
                    font-weight: @fontBold;
                    font-size: 17px;
                    line-height: 1.41;
                }

                .tags {
                    display: flex;
                    justify-content: flex-start;
                    margin-top: 8px;
                    margin-right: -7px;

                    .tag {
                        position: relative;
                        padding: 0 7px 0 6px;
                        color: @fontLightColor;
                        font-size: 12px;
                        line-height: 16px;
                        text-align: right;

                        &:not(:last-child)::after {
                            position: absolute;
                            top: 50%;
                            right: 0;
                            width: 2px;
                            height: 20px;
                            background: @fontLightColor;
                            transform: translateY(-50%) scale(0.5);
                            content: '';
                        }
                    }

                    .tag:first-of-type {
                        padding-left: 0;
                    }
                }
            }
        }

        .recommend-comment {
            margin-top: 12px;
            margin-bottom: 4px;
            padding: 8px;
            color: @fontLightColor;
            font-size: 12px;
            line-height: 1.4;
            background: linear-gradient(90deg, #fef5ec 0%, rgba(249, 243, 235, 0.1) 100%);
            border-radius: 4px;

            img {
                width: 11px;
                height: 8px;
                margin-right: 4px;
                vertical-align: top;
            }
        }
    }

    .hide {
        display: flex;
        flex-direction: column;

        &-body {
            margin-bottom: 12px;
            padding: 12px 12px 16px;
            background-color: rgba(255, 241, 226, 0.8);
            border-radius: 6px;

            .header {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                color: #c06e0e;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;

                img {
                    width: 18px;
                    height: 18px;
                    margin-right: 6px;
                }
            }

            .profit {
                .value {
                    color: #ff6907;
                    font-weight: @fontBold;
                    font-size: 20px;
                    line-height: 28px;
                    filter: blur(6px);
                }

                .label {
                    margin-top: 6px;
                    color: #666;
                    font-size: 12px;
                    line-height: 16px;
                }
            }
        }

        &-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .left {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }

            .right {
                display: flex;
                color: #aa703d;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;

                .next {
                    margin-left: 4px;
                    font-size: 12px;
                }
            }
        }
    }
}
</style>
