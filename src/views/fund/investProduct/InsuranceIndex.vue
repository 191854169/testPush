// 保险
<template>
    <div class="insurance">
        <div class="banner">
            <multi-img class="banner-img" name="insurance-banner" directory="fund"></multi-img>
            <div class="banner-content">
                <p>{{ $t('intro.insurance') }}</p>
                <p>{{ $t('intro.hedgeProtect') }}</p>
            </div>
        </div>
        <div class="content">
            <div class="insurance-desc">
                <div class="font-title1 blue-point">{{ $t('intro.outInsurance') }}</div>
                <div class="desc-text">{{ insuranceDesc.text }}</div>
                <ul class="desc-imgs">
                    <li class="img-item" v-for="(item, index) in insuranceDesc.imgList" :key="index" @click="goInsurance(item.key)">
                        <multi-img :name="item.imgName" directory="fund"></multi-img>
                        <span>{{ item.text }}</span>
                    </li>
                </ul>
            </div>
            <div class="insurance-flow">
                <div class="font-title1 blue-point">{{ $t('intro.insureProcess') }}</div>
                <div class="flow-content">
                    <div class="content-imgs">
                        <div class="img-item" v-for="(item, index) in insuranceFlow.imgList" :key="index">
                            <i class="item-point"></i>
                            <multi-img :name="item.imgName" directory="fund"></multi-img>
                            <span>{{ item.text }}</span>
                        </div>
                    </div>
                    <div class="content-background"></div>
                </div>
            </div>
            <div class="footer-msg">
                <span>{{ footerMsg.text1 }}</span>
                <span>{{ footerMsg.text2 }}</span>
            </div>
            <p class="insurance-relation-compayn-tip">{{ $t('intro.insuranceRelationCompanyTip') }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'insurance',
    data() {
        return {
            insuranceDesc: {
                text: this.$t('intro.insuranceDesc-text'),
                imgList: [
                    {
                        text: this.$t('intro.dividendInsurance'),
                        imgName: 'pic_baoxian_chuxu',
                        key: 'insurance-profit',
                    },
                    {
                        text: this.$t('intro.lifeInsurance'),
                        imgName: 'pic_baoxian_zhongshen',
                        key: 'insurance-life',
                    },
                    {
                        text: this.$t('intro.marginProduct'),
                        imgName: 'pic_baoxian_baofei',
                        key: 'insurance-margin',
                    },
                    {
                        text: this.$t('intro.illnessInsurance'),
                        imgName: 'pic_baoxian_zhongda',
                        key: 'insurance-sick',
                    },
                ],
            },
            insuranceFlow: {
                imgList: [
                    {
                        text: this.$t('intro.insuranceFlow-text1'),
                        imgName: 'pic_liucheng_1',
                    },
                    {
                        text: this.$t('intro.insuranceFlow-text2'),
                        imgName: 'pic_liucheng_2',
                    },
                    {
                        text: this.$t('intro.insuranceFlow-text3'),
                        imgName: 'pic_liucheng_3',
                    },
                    {
                        text: this.$t('intro.insuranceFlow-text6'),
                        imgName: 'pic_liucheng_6',
                    },
                    {
                        text: this.$t('intro.insuranceFlow-text5'),
                        imgName: 'pic_liucheng_5',
                    },
                    {
                        text: this.$t('intro.insuranceFlow-text4'),
                        imgName: 'pic_liucheng_4',
                    },
                ],
            },
            footerMsg: {
                text1: this.$t('intro.footerMsg-text1'),
                text2: this.$t('intro.footerMsg-text2'),
            },
        }
    },
    methods: {
        goInsurance(key) {
            this.$router.push(`/invest-product/${key}`)
        },
    },
}
</script>

<style scoped lang="less">
.insurance {
    width: 100%;
    background: linear-gradient(180deg, #eef6ff 0%, #cbe4ff 18.01%, #e4f1ff 22.42%, #e4f1ff 100%);
}

.font-title1 {
    color: #2f2f2f;
    font-weight: 700;
    font-size: 18px;
    line-height: 26px;
}

.font-title2 {
    color: #2f2f2f;
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
}

.font-title3 {
    color: #2f2f2f;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    text-align: justify;
}

.text-overflow-3 {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.blue-point {
    position: relative;
}

.blue-point::before {
    position: absolute;
    top: 0;
    left: -10px;
    width: 6px;
    height: 18px;
    margin: 4px 0;
    background-color: #1f85ee;
    border-radius: 2px;
    content: '';
}

.banner {
    position: relative;
    z-index: 10;
    width: 100%;

    .banner-img {
        width: 100%;
        height: 200px;
    }

    .banner-content {
        position: absolute;
        top: 42px;
        left: 24px;
        display: flex;
        flex-direction: column;

        p:nth-child(1) {
            margin-bottom: 6px;
            color: #0c62e9;
            font-weight: 600;
            font-size: 34px;
            line-height: 44px;
        }

        p:nth-child(2) {
            color: #0c62e9;
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
    margin-top: -59px;
    padding: 0 12px;
}

.content-box {
    margin-bottom: 12px;
    padding: 20px 22px 26px;
    background: #fff;
    border-radius: 8px;
    box-shadow: inset -0.5px 0.5px 0 #fff;
}

.insurance-desc {
    .content-box();

    z-index: 11;
    background: linear-gradient(180deg, #d7eaff 0%, #fff 15.86%, #fff 100%);

    .desc-text {
        .font-title3();

        margin-top: 10px;
    }

    .desc-imgs {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        margin-top: 14px;

        .img-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 150px;

            span {
                margin-top: 2px;
                color: #2f2f2f;
                font-weight: 600;
                font-size: 16px;
                line-height: 22px;
                text-align: center;
            }

            img {
                width: 70px;
            }
        }

        .img-item:nth-of-type(1) {
            margin-bottom: 14px;
        }
    }
}

.insurance-flow {
    .content-box();

    .flow-content {
        position: relative;
        width: 305px;
        height: 244px;
        margin-top: 10px;

        .content-background {
            position: absolute;
            top: 5px;
            left: 40px;
            z-index: 10;
            width: 270px;
            height: 131px;
            border: 2px solid #e7f0ff;
            border-left-width: 0;
            border-radius: 8px;
        }

        .content-imgs {
            position: absolute;
            z-index: 11;
            display: flex;
            flex-flow: row wrap;
            align-items: center;
            justify-content: space-between;
            width: 305px;
            height: 244px;

            .img-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 81px;
                height: 110px;

                i {
                    width: 8px;
                    height: 8px;
                    margin-bottom: 8px;
                    background: #1f85ee;
                    border-radius: 50%;
                }

                span {
                    height: 32px;
                    margin-top: 6px;
                    color: #666;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                    white-space: pre-line;
                    text-align: center;
                }

                img {
                    width: 56px;
                }
            }

            .img-item:nth-child(-n + 3) {
                margin-bottom: 14px;
            }
        }
    }
}

.alter-more {
    .content-box();

    display: flex;
    flex-direction: column;

    .more-header {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
        color: #666;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;

        img {
            margin-right: 22px;
        }

        &__text {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 36px;

            span {
                position: relative;
            }

            span:first-of-type::before {
                position: absolute;
                top: 4px;
                left: -14px;
                width: 8px;
                height: 8px;
                background-color: #17affe;
                border-radius: 50%;
                content: '';
            }

            span:last-of-type::before {
                position: absolute;
                top: 4px;
                left: -14px;
                width: 8px;
                height: 8px;
                background-color: #94daff;
                border-radius: 50%;
                content: '';
            }
        }
    }
}

.footer-msg {
    .content-box();
    .font-title3();

    padding-top: 22px;
    letter-spacing: -0.5px;

    span:first-of-type {
        display: inline-block;
        margin-bottom: 12px;
    }
}

.insurance-relation-compayn-tip {
    margin: 4px 0 0;
    color: #73a1cb;
    font-size: 12px;
    line-height: 18px;
}
</style>
