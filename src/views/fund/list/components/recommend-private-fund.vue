<template>
    <div class="recommend-private-fund">
        <van-swipe class="outter-van-swipe">
            <van-swipe-item v-for="item in list" :key="item.symbol" @click="onClick(item)">
                <div class="private-item">
                    <multi-img name="privateBg" directory="fund" class="private-bg"></multi-img>
                    <div class="recommend-tag">{{ $t('pointRefer') }}</div>
                    <div class="private-item-header">
                        <div class="header-top">
                            <div class="logo-box">
                                <img :src="item.companyLogo" alt="logo" />
                            </div>
                            <header class="title">{{ item.companyName }}</header>
                        </div>
                        <div class="header-bottom">
                            <p class="brief">{{ item.companyBrief }}</p>
                        </div>
                    </div>
                    <div class="private-item-body">
                        <header class="fund-slogan line-elipsis">
                            <multi-img v-if="!isProfessional" name="recommend-product" directory="fund"></multi-img>
                            <span :class="{ 'slogan-remind': !isProfessional }">{{ item.slogan }}</span>
                        </header>
                        <div class="content mask-container" :class="{ hide: !isProfessional }">
                            <div class="profit" v-if="showRevenue(item)">
                                <span class="value" v-riseFall="item.expectedRevenue"></span>
                                <span class="label">{{ $t('expectedRevenue') }}</span>
                            </div>
                            <div class="profit" v-else>
                                <span class="value" v-riseFall="item.returnY1"></span>
                                <span class="label">{{ $t('yearChg') }}</span>
                            </div>
                            <div class="comment">
                                <multi-img name="quote" directory="fund"></multi-img>
                                <span class="comment-content">{{ item.evaluation }}</span>
                            </div>
                            <div class="body-footer">
                                <button>{{ $t('toView') }}</button>
                            </div>
                            <div class="mask" v-if="!isProfessional">
                                <svg-icon iconClass="lock" className="lock"></svg-icon>
                                <p>
                                    {{ $t('verifyText1') }}
                                    <br />
                                    {{ $t('verifyText2') }}
                                </p>
                                <button>
                                    <span class="skew_top1">{{ $t('willVerify') }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </van-swipe-item>
        </van-swipe>
    </div>
</template>

<script>
import { Swipe, SwipeItem } from 'vant'
export default {
    name: 'recommend-private-fund',
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
    },
    props: {
        list: {
            type: Array,
            default: () => [],
        },
        isProfessional: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        onClick(data) {
            this.$emit('click', data)
        },
        /**
         * 检测是否有净值
         * 1、有净值 显示 近一年涨跌幅
         * 2、无净值&有目标回报 显示目标回报
         * 3、无净值&无目标回报 显示 近一年涨跌幅
         */
        showRevenue(item) {
            return item.isData === 2 && !!item.expectedRevenue
        },
    },
}
</script>

<style scoped lang="less">
.recommend-private-fund {
    .private-item {
        position: relative;
        margin: 0 16px;
        padding: 16px 12px;
        background: linear-gradient(180deg, #fff5e9 0%, #fdead3 100%);
        // border-right: 10px solid transparent;
        background-clip: padding-box;
        border-radius: 8px;

        .private-bg {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            z-index: 10;
            width: 100%;
            height: 103px;
        }

        .recommend-tag {
            position: absolute;
            top: -1px;
            right: 16px;
            min-width: 77px;
            height: 36px;
            padding: 7px 7px 0;
            color: #4d2621;
            font-weight: 700;
            font-size: 14px;
            line-height: 18px;
            text-align: center;
            background: url('~@/assets/images/fund/recommend-tag@2x.png');
            background-repeat: no-repeat;
            background-size: 100% 100%;

            @media screen and (min-aspect-ratio: 3) {
                background: url('~@/assets/images/fund/recommend-tag@3x.png');
            }
        }

        &-header {
            position: relative;
            z-index: 20;
            display: flex;
            flex-direction: column;

            .header-top {
                display: flex;
                align-items: center;

                .logo-box {
                    flex: 0 0 auto;
                    width: 40px;
                    height: 40px;
                    margin-right: 8px;
                    overflow: hidden;
                    border: 0.5px solid #f4f4f4;
                    border-radius: 50%;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                .title {
                    color: #050302;
                    font-weight: @fontBold;
                    font-size: 16px;
                    line-height: 22px;
                }
            }

            .header-bottom {
                padding-top: 8px;

                .brief {
                    color: @fontLightColor;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 18px;
                    text-align: justify;
                }
            }
        }

        &-body {
            margin: 12px 0 0;
            padding: 16px 12px 12px;
            background: #fff;
            border-radius: 6px;

            .fund-slogan {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 22px;
                color: #000;
                font-weight: @fontBold;
                font-size: 16px;
                line-height: 22px;
                text-align: center;

                img {
                    width: 18px;
                    height: 18px;
                    margin-right: 6px;
                }

                .slogan-remind {
                    color: #c06e0e;
                }
            }

            .mask-container {
                position: relative;

                &.hide > * {
                    filter: blur(4px);
                }

                .mask {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 20;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(241, 241, 241, 0.8);
                    border-radius: 6px;
                    filter: blur(0);

                    .lock {
                        width: 28px;
                        height: 28px;
                        color: #4c2620;
                    }

                    p {
                        margin: 8px 0 16px;
                        color: #4c2620;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;
                        text-align: center;
                    }

                    button {
                        width: 114px;
                        color: #4c2620;
                        font-weight: @fontBold;
                        font-size: 14px;
                        line-height: 32px;
                        text-align: center;
                        background: linear-gradient(272.87deg, #eca46a 0.6%, #ffc07e 118.57%);
                        border: none;
                        border-radius: 28px;
                        outline: none;

                        span {
                            display: inline-block;
                        }
                    }
                }
            }

            .content {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 8px;

                .profit {
                    display: flex;
                    flex-direction: column;
                    text-align: center;

                    .value {
                        color: @fontBlackColor;
                        font-weight: @fontBold;
                        font-size: 17px;
                        line-height: 24px;
                    }

                    .label {
                        margin-top: 8px;
                        color: @fontLightColor;
                        font-size: 12px;
                        line-height: 16px;
                    }
                }

                .comment {
                    margin-top: 12px;
                    padding: 8px;
                    background: linear-gradient(90deg, #fef5ec 0%, rgba(249, 243, 235, 0.1) 100%);
                    border-radius: 4px;

                    img {
                        width: 11px;
                        height: 8px;
                        margin-right: 4px;
                        vertical-align: top;
                    }

                    span {
                        color: @fontLightColor;
                        font-size: 12px;
                        line-height: 16px;
                    }
                }

                .body-footer {
                    text-align: center;

                    button {
                        width: 262px;
                        margin: 12px auto 4px;
                        color: #4c2620;
                        font-weight: @fontBold;
                        font-size: 16px;
                        line-height: 44px;
                        background: linear-gradient(272.87deg, #eca46a 0.6%, #ffc07e 118.57%);
                        border: none;
                        border-radius: 28px;
                        outline: none;
                    }
                }
            }
        }
    }

    /deep/ .outter-van-swipe {
        overflow: visible;
        // margin: 0 16px 0 0;
        // .van-swipe-item {
        //     margin: 0 16px;
        // }
        .van-swipe__indicators {
            bottom: -12px;

            .van-swipe__indicator {
                width: 4px;
                height: 4px;
                margin: 0 0 0 7px;
                background: #f2ae71;
                border-radius: 0;
                opacity: 0.4;

                &.van-swipe__indicator--active {
                    width: 8px;
                    margin: 0 -2px 0 5px;
                    background: #ffb38f;
                    opacity: 1;
                }
            }
        }
    }
}
</style>
