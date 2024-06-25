// 债券
<template>
    <div class="bond">
        <div class="banner">
            <multi-img class="banner-img" name="bond-banner" directory="fund"></multi-img>
            <div class="banner-content">
                <p>{{ $t('intro.bond') }}</p>
                <p>{{ $t('intro.incomeBack') }}</p>
            </div>
        </div>
        <div class="content">
            <div class="bond-desc">
                <div class="font-title1 red-point">{{ contentMap.bondDesc.title }}</div>
                <div class="font-title3 margin-top-10">{{ contentMap.bondDesc.content }}</div>
            </div>
            <div class="bond-margin">
                <div class="font-title1 red-point">{{ contentMap.bondMargin.title }}</div>
                <div class="font-title3 margin-top-10">{{ contentMap.bondMargin.content }}</div>
            </div>
            <div class="bond-specific">
                <div class="font-title1 red-point">{{ contentMap.bondSpecific.title }}</div>
                <div class="bond-specific__content">
                    <div class="content-item" v-for="item in contentMap.bondSpecific.content" :key="item.title">
                        <div class="item-img">
                            <multi-img height="60" width="60" :name="item.imgName" :directory="item.imgDirectory"></multi-img>
                        </div>
                        <div class="item-body">
                            <div class="font-title2">{{ item.title }}</div>
                            <div class="font-title3">{{ item.content }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fosun">
                {{ $t('intro.tradeChance') }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'bond',
    data() {
        return {
            contentMap: {
                bondDesc: {
                    title: this.$t('intro.bondDesc-title'),
                    content: this.$t('intro.bondDesc-content'),
                },
                bondMargin: {
                    title: this.$t('intro.bondMargin-title'),
                    content: this.$t('intro.bondMargin-content'),
                },
                bondSpecific: {
                    title: this.$t('intro.bondSpecific-title'),
                    content: [
                        {
                            title: this.$t('intro.splitRisk'),
                            content: this.$t('intro.bondSpecific-content-content1'),
                            imgName: 'bond-risk',
                            imgDirectory: 'fund',
                        },
                        {
                            title: this.$t('intro.regularDividend'),
                            content: this.$t('intro.bondSpecific-content-content2'),
                            imgName: 'bond-payout',
                            imgDirectory: 'fund',
                        },
                        {
                            title: this.$t('intro.backCash'),
                            content: this.$t('intro.bondSpecific-content-content3'),
                            imgName: 'bond-repay',
                            imgDirectory: 'fund',
                        },
                    ],
                },
            },
        }
    },
}
</script>
<style lang="less" scoped>
.bond {
    width: 100%;
    background: #feefe9;
}

.font-title1 {
    color: #1f1f1f;
    font-weight: 700;
    font-size: 18px;
    line-height: 26px;
}

.font-title2 {
    color: #1f1f1f;
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
}

.font-title3 {
    color: #1f1f1f;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    text-align: justify;
}

.margin-top-10 {
    margin-top: 10px;
}

.red-point {
    position: relative;
}

.red-point::before {
    position: absolute;
    top: 0;
    left: -10px;
    width: 6px;
    height: 18px;
    margin: 4px 0;
    background-color: #ff6907;
    border-radius: 2px;
    content: '';
}
</style>
<style scoped lang="less">
.banner {
    position: relative;
    z-index: 10;
    width: 100%;
    /* stylelint-disable-next-line number-max-precision */
    background: linear-gradient(180deg, #fff9f4 0%, rgba(255, 220, 205, 0.782851) 74.42%, #feefe9 97.03%);

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
            color: #ec2b05;
            font-weight: 600;
            font-size: 34px;
            line-height: 44px;
        }

        p:nth-child(2) {
            color: #ff4c28;
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
    background-color: #feefe9;
}

.content-box {
    margin-bottom: 12px;
    padding: 20px 22px 26px;
    background: #fff;
    border-radius: 8px;
    box-shadow: inset -0.5px 0.5px 0 #fff;
}

.bond-desc {
    .content-box();

    z-index: 11;
    background: linear-gradient(180deg, #ffecdf 0%, #fffcfb 18.75%, #fff 100%);
    box-shadow: inset -0.5px 0.5px 0 #fff;
    backdrop-filter: blur(27.1828px);
}

.bond-margin {
    .content-box();
}

.bond-specific {
    .content-box();

    .bond-specific__content {
        display: flex;
        flex-direction: column;

        .content-item {
            display: flex;
            flex-direction: row;
            margin-top: 20px;

            .item-img {
                flex: 0 0 60px;
                width: 60px;
                height: 60px;
                margin-right: 19px;
            }

            .item-body {
                display: flex;
                flex-direction: column;

                & > div:first-of-type {
                    margin-bottom: 2px;
                }
            }
        }
    }
}

.fosun {
    width: 100%;
    margin-top: 6px;
    color: #9c9c9c;
    font-weight: 400;
    font-size: 12px;
    line-height: 21px;
}
</style>
