// 了解现金宝 + 开通
<template>
    <div class="about">
        <div class="banner">
            <multi-img class="banner-img" name="fdt-banner" directory="fixedDepositTreasure"></multi-img>
            <div class="banner-content">
                <p>{{ $t('depositTreasure') }}</p>
                <p>{{ $t('depositTreasureDesc') }}</p>
            </div>
        </div>
        <div class="content">
            <div class="fixed-deposit-desc">
                <div class="font-title1 red-point">{{ contentMap.fixedDepositDesc.title }}</div>
                <div class="font-title3 margin-top-10">
                    {{ contentMap.fixedDepositDesc.content }}
                </div>
            </div>
            <div class="fixed-deposit-margin">
                <div class="font-title1 red-point">{{ contentMap.fixedDepositMargin.title }}</div>
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
                </ul>
            </div>
            <div class="fixed-deposit-specific">
                <div class="font-title1 red-point">{{ contentMap.fixedDepositSpecific.title }}</div>
                <div class="fixed-deposit-specific__content">
                    <div class="content-item" v-for="item in contentMap.fixedDepositSpecific.content" :key="item.title">
                        <div class="item-img">
                            <multi-img :name="item.imgName" :directory="item.imgDirectory"></multi-img>
                        </div>
                        <div class="item-body">
                            <multi-img :name="item.orderIcon" directory="fixedDepositTreasure"></multi-img>
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
        <android-download-channel v-model="showAndroidDownload"></android-download-channel>
    </div>
</template>

<script>
import { FINANCE_ACCOUNT } from '@/config/common'
import pathnames from '@/config/H5Pathname'
import { isIos } from '@/utils'
import AndroidDownloadChannel from '@/views/fixedDepositTreasure/components/AndroidDownloadChannel'
export default {
    name: 'about',
    components: {
        AndroidDownloadChannel,
    },
    props: {
        openBtn: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            contentMap: {
                fixedDepositDesc: {
                    title: this.$t('whatIsDepositTreasure'),
                    content: this.$t('about.fixedDepositDesc'),
                },
                fixedDepositMargin: {
                    title: this.$t('about.fixedDepositSubscribeProcessTitle'),
                },
                fixedDepositSpecific: {
                    title: this.$t('about.fixedDepositPriceTitle'),
                    content: [
                        {
                            title: this.$t('about.fixedDepositPrice.title1'),
                            imgName: 'ad_one',
                            imgDirectory: 'fixedDepositTreasure',
                            orderIcon: 'one',
                        },
                        {
                            title: this.$t('about.fixedDepositPrice.title2'),
                            imgName: 'ad_two',
                            imgDirectory: 'fixedDepositTreasure',
                            orderIcon: 'two',
                        },
                        {
                            title: this.$t('about.fixedDepositPrice.title3'),
                            imgName: 'ad_three',
                            imgDirectory: 'fixedDepositTreasure',
                            orderIcon: 'three',
                        },
                    ],
                },
            },
            ftdAccountStatus: true,
            showAndroidDownload: false,
        }
    },
    computed: {
        needOpenBtn() {
            return this.$route.query.open === '1' || this.openBtn
        },
        showOpenBtn() {
            return this.needOpenBtn && !this.ftdAccountStatus
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
            // TODO 是否需要参数
            this.$goPage(fixedDepositTreasureOpenAccountUrl)
        },

        async fetchFtdAccountStatus() {
            try {
                this.ftdAccountStatus = await this.$root.getFtdAccountStatus()
            } catch (e) {
                this.ftdAccountStatus = false
            }
        },

        downloadApp() {
            const ios = isIos()
            if (ios) {
                location.href = 'https://itunes.apple.com/hk/app/id483513425 '
            } else {
                this.showAndroidDownload = true
            }
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
        background: linear-gradient(180deg, #f0e8ff 0%, #dfceff 70.18%, #f3edff 100%);

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
                margin-bottom: 6px;
                color: #7533e9;
                font-weight: 600;
                font-size: 34px;
                line-height: 44px;
            }

            p:nth-child(2) {
                color: #7533e9;
                font-weight: 400;
                font-size: 15px;
                line-height: 21px;
            }
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-top: -44px;
        padding: 0 12px calc(44px + 24px);
        background: #f3edff;

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
                background-color: #925fec;
                border-radius: 2px;
                content: '';
            }
        }

        .steps {
            display: flex;
            margin-top: 20px;

            &-item {
                display: flex;
                flex-direction: column;

                &__text {
                    #title_style(12px, 16px, 400, @fontBlackColor);

                    margin-bottom: 4px;
                }

                &__line {
                    width: 2px;
                    height: 18px;
                    background: #ddcaff;
                }

                &__block {
                    height: 16px;
                    background: #ddcaff;
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
                        color: #7533e9;
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

    .fixed-deposit-desc {
        .content-box();

        z-index: 11;
        background: linear-gradient(180deg, #ede3ff 0%, #fffcfb 20.1%, #fff 107.19%);
        box-shadow: inset -0.5px 0.5px 0 #fff;
        backdrop-filter: blur(27.1828px);
    }

    .fixed-deposit-margin {
        .content-box();
    }

    .fixed-deposit-specific {
        .content-box();

        .fixed-deposit-specific__content {
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
                    background: #f3edff;
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
                    .item-body img {
                        width: 11px;
                        height: 14px;
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
