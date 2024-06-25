// 了解现金宝 + 开通
<template>
    <div class="about">
        <div class="banner">
            <multi-img class="banner-img" name="xcb-banner" directory="xcbAccount"></multi-img>
            <div class="banner-content">
                <p>{{ $t('starSpecial') }}</p>
                <p>{{ $t('about.starTreasureAccountPriceTitle') }}</p>
            </div>
        </div>
        <div class="content">
            <div class="star-treasure-account-desc">
                <div class="font-title1 red-point">{{ contentMap.starTreasureAccount.title }}</div>
                <div class="font-title3 margin-top-10">
                    {{ contentMap.starTreasureAccount.content }}
                </div>
            </div>
            <div class="star-treasure-account-margin">
                <div class="font-title1 red-point">{{ contentMap.starTreasureAccountMargin.title }}</div>
                <ul class="steps">
                    <li class="steps-item">
                        <div class="steps-item__text">{{ $t('about.start') }}</div>
                        <div class="steps-item__line"></div>
                        <div class="steps-item__block"></div>
                    </li>
                    <li class="steps-item">
                        <div class="steps-item__text">{{ $t('about.stop') }}</div>
                        <div class="steps-item__line"></div>
                        <div class="steps-item__block"></div>
                    </li>
                    <li class="steps-item">
                        <div class="steps-item__text">{{ $t('about.startActualInterest') }}</div>
                        <div class="steps-item__line"></div>
                        <div class="steps-item__block"></div>
                    </li>
                    <li class="steps-item">
                        <div class="steps-item__text">{{ $t('about.finsh') }}</div>
                        <div class="steps-item__line"></div>
                        <div class="steps-item__block"></div>
                    </li>
                    <li class="steps-item">
                        <div class="steps-item__text">{{ $t('about.payment') }}</div>
                        <div class="steps-item__line"></div>
                        <div class="steps-item__block"></div>
                    </li>
                </ul>
                <ul class="fee-list">
                    <li class="fee-list__item">
                        <div class="label">{{ $t('about.feeList.label1') }}</div>
                        <div class="value">{{ $t('about.feeList.value1') }}</div>
                    </li>
                    <li class="fee-list__item">
                        <div class="label">{{ $t('about.feeList.label2') }}</div>
                        <div class="value">{{ $t('about.feeList.value2') }}</div>
                    </li>
                    <li class="fee-list__item">
                        <div class="label">{{ $t('about.feeList.label3') }}</div>
                        <div class="value" v-html="$t('about.feeList.value3')"></div>
                    </li>
                    <li class="fee-list__item tip">
                        <p>{{ $t('about.feeList.value4') }}</p>
                    </li>
                    <li class="fee-list__item">
                        <div class="label">{{ $t('about.feeList.label5') }}</div>
                        <div class="value" v-html="$t('about.feeList.value5', { delay: 2 })"></div>
                    </li>
                    <li class="fee-list__item">
                        <div class="label">{{ $t('about.feeList.label6') }}</div>
                        <div class="value" v-html="$t('about.feeList.value6')"></div>
                    </li>
                </ul>
            </div>
            <div class="star-treasure-account-specific">
                <div class="font-title1 red-point">{{ contentMap.starTreasureAccountSpecific.title }}</div>
                <div class="star-treasure-account-specific__content">
                    <div class="content-item" v-for="item in contentMap.starTreasureAccountSpecific.content" :key="item.title">
                        <div class="item-img">
                            <multi-img :name="item.imgName" :directory="item.imgDirectory"></multi-img>
                        </div>
                        <div class="item-body">
                            <multi-img :name="item.orderIcon" :directory="item.imgDirectory"></multi-img>
                            <div>{{ item.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <footer v-if="showOpenBtn || showDownload">
            <button v-if="showDownload" class="btn open" @click="downloadApp">{{ $t('goApp') }}</button>
            <button v-else class="btn open" @click="open">{{ $t('soonOpen') }}</button>
        </footer>
    </div>
</template>

<script>
import { FINANCE_ACCOUNT } from '@/config/common'
import pathnames from '@/config/H5Pathname'
export default {
    name: 'about',
    props: {
        openBtn: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            contentMap: {
                starTreasureAccount: {
                    title: this.$t('whatIsStarSpecial') + '?',
                    content: this.$t('about.starTreasureAccountDesc'),
                },
                starTreasureAccountMargin: {
                    title: this.$t('about.starTreasureAccountSubscribeProcessTitle'),
                },
                starTreasureAccountSpecific: {
                    title: this.$t('about.starTreasureAccountPriceTitle'),
                    content: [
                        {
                            title: this.$t('about.starTreasureAccountPrice.title1'),
                            imgName: 'ad_one',
                            imgDirectory: 'xcbAccount',
                            orderIcon: 'one',
                        },
                        {
                            title: this.$t('about.starTreasureAccountPrice.title2'),
                            imgName: 'ad_two',
                            imgDirectory: 'xcbAccount',
                            orderIcon: 'two',
                        },
                        {
                            title: this.$t('about.starTreasureAccountPrice.title3'),
                            imgName: 'ad_three',
                            imgDirectory: 'xcbAccount',
                            orderIcon: 'three',
                        },
                    ],
                },
            },
            starSpecialAccountStatus: true,
            showAndroidDownload: false,
        }
    },
    computed: {
        needOpenBtn() {
            return this.$route.query.open === '1' || this.openBtn
        },
        showOpenBtn() {
            return this.needOpenBtn && !this.starSpecialAccountStatus
        },
        showDownload() {
            return this.$route.query.source === 'activity'
        },
    },
    created() {
        if (this.needOpenBtn) {
            this.fetchFtdAccountStatus()
        }
    },
    methods: {
        /**
         * 开通定存宝账户
         * @Note 需要登录、证券户
         */
        open() {
            if (!this.$root.isLogin) {
                this.$root.login()
                return
            }
            if (!this.$root.getAccountStatus(FINANCE_ACCOUNT)) {
                return this.$root.nextAfterJudgeAccountStatus('openAccount')
            }
            const { VUE_APP_FIXEDDEPOSIT_OPEN_ACCOUNT_PAGE: fixedDepositTreasureOpenAccountUrl } = pathnames
            // 是否需要参数
            this.$goPage(fixedDepositTreasureOpenAccountUrl)
        },

        async fetchFtdAccountStatus() {
            try {
                this.starSpecialAccountStatus = await this.$root.getStarSpecialAccountStatus()
            } catch (e) {
                this.starSpecialAccountStatus = false
            }
        },

        downloadApp() {
            const { VUE_APP_FOSUN_DOWNLOAD_PAGE } = pathnames
            location.href = VUE_APP_FOSUN_DOWNLOAD_PAGE
        },
    },
}
</script>

<style scoped lang="less">
// 基础标题样式mixin
#title_style(@fontSize, @lineHeight, @fontWeight: 700, @color: @fontBlackColor) {
    color: @color;
    font-weight: @fontWeight;
    font-size: @fontSize;
    line-height: @lineHeight;
}

.about {
    .banner {
        position: relative;
        z-index: 10;
        width: 100%;
        background: linear-gradient(180deg, #faf3e8 0.23%, #ffe8c5 41.41%, #f0d8b4 63.45%, #f0e1c9 99.77%);

        .banner-img {
            width: 100%;
        }

        .banner-content {
            position: absolute;
            top: 42px;
            left: 24px;
            display: flex;
            flex-direction: column;

            p:nth-child(1) {
                margin-bottom: 4px;
                color: #a34400;
                font-weight: 600;
                font-size: 34px;
                line-height: 44px;
            }

            p:nth-child(2) {
                color: #a34400;
                font-weight: 400;
                font-size: 15px;
                line-height: 21px;
                white-space: pre-wrap;
            }
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-top: -44px;
        padding: 0 12px calc(44px + 24px);
        background: #f3e1c6;

        .font-title1 {
            #title_style(18px, 26px);
        }

        .font-title2 {
            #title_style(16px, 22px);
        }

        .font-title3 {
            #title_style(14px, 21px, 400);

            text-align: justify;
        }

        .margin-top-10 {
            margin-top: 10px;
        }

        .red-point {
            position: relative;

            &::before {
                position: absolute;
                top: 0;
                left: -10px;
                width: 6px;
                height: 18px;
                margin: 4px 0;
                background-color: #ecad37;
                border-radius: 2px;
                content: '';
            }
        }

        .steps {
            position: relative;
            display: flex;
            margin-top: 20px;

            &::after {
                position: absolute;
                right: 0;
                bottom: 0;
                left: 0;
                height: 16px;
                // 通过两层渐变，第一层为透明+白色，第二层为正常渐变色。
                background: linear-gradient(
                        to right,
                        transparent 0 41px,
                        white 41px 43px,
                        transparent 43px 90px,
                        white 90px 92px,
                        transparent 92px 223px,
                        white 223px 225px,
                        transparent 225px 100%
                    ),
                    linear-gradient(90deg, #ffedd2 0.01%, #ffdaa3 100%);
                content: '';
            }

            &-item {
                display: flex;
                flex-direction: column;

                &__text {
                    #title_style(12px, 16px, 400, @fontBlackColor);

                    margin-bottom: 4px;
                }

                &__line {
                    width: 1px;
                    height: 18px;
                    background: #ffe1b2;
                }

                &__block {
                    height: 16px;
                }

                &:nth-of-type(1) {
                    flex: 0 0 41px;
                }

                &:nth-of-type(2) {
                    flex: 0 0 47px;
                    margin-left: 2px;
                }

                &:nth-of-type(3) {
                    flex: 0 0 131px;
                    margin-left: 2px;
                }

                &:nth-of-type(4) {
                    flex: 0 0 30px;
                    margin-left: 2px;
                }

                &:nth-of-type(5) {
                    flex: 0 0 54px;

                    .steps-item__text {
                        align-self: flex-end;
                    }

                    .steps-item__line {
                        align-self: flex-end;
                        margin-right: 2px;
                    }
                }
            }
        }

        .fee-list {
            &__item {
                display: flex;
                margin-top: 16px;

                .label {
                    flex: 0 0 108px;
                    #title_style(14px, 21px, 400, @fontLightColor);
                }

                .value {
                    flex: 1 1 auto;
                    #title_style(14px, 21px, 400);

                    ::v-deep(.bold-content) {
                        color: #d36007;
                        font-weight: 700;
                    }
                }

                &.tip {
                    #title_style(12px, 19px, 400, @fontGreyColor);

                    margin-top: 4px;
                }
            }
        }
    }

    .content-box {
        margin-bottom: 12px;
        padding: 20px 22px 26px;
        background: #fff;
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #fff;
    }

    .star-treasure-account-desc {
        .content-box();

        z-index: 11;
        background: linear-gradient(180deg, #efe5d5 0%, #fffcfb 19.14%, #fff 102.05%);
        box-shadow: -0.5px 0.5px 0 0 #fff inset;
        backdrop-filter: blur(13.591408729553223px);
    }

    .star-treasure-account-margin {
        .content-box();
    }

    .star-treasure-account-specific {
        .content-box();

        .star-treasure-account-specific__content {
            display: flex;
            flex-direction: column;

            .content-item {
                display: flex;
                align-items: center;
                margin-top: 16px;

                .item-img {
                    flex: 0 0 38px;
                    margin-right: 12px;
                    font-size: 0;

                    img {
                        width: 38px;
                        height: 38px;
                    }
                }

                .item-body {
                    display: flex;
                    align-items: center;
                    padding: 8px 16px;
                    background: #fff3e1;
                    border-radius: 28px;
                    #title_style(14px, 22px, 400, @fontBlackColor);

                    img {
                        margin-right: 10px;
                    }
                }

                &:nth-of-type(1) {
                    margin-top: 20px;

                    .item-body img {
                        width: 7px;
                        height: 14px;
                    }
                }

                &:nth-of-type(2) {
                    .item-body {
                        border-radius: 44px;

                        img {
                            width: 11px;
                            height: 14px;
                        }
                    }
                }

                &:nth-of-type(3) {
                    .item-body img {
                        width: 10px;
                        height: 14px;
                    }
                }
            }
        }
    }

    .fosun {
        width: 100%;
        margin-top: 6px;
        margin-bottom: 24px;
        color: @fontGreyColor;
        font-weight: 400;
        font-size: 12px;
        line-height: 21px;
    }

    footer {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 3px 0;
        text-align: center;
        background: @white;
        #iosBottom(16);

        .btn {
            width: calc(100% - 56px);
            height: 44px;
            margin: 0 auto;
            color: @white;
            line-height: 44px;
            background: #8143ee;
            border-radius: 31px;
            #title_style(16px, 22px, 700, @white);
        }
    }
}
</style>
