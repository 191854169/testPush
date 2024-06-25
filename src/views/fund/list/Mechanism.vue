<template>
    <div class="mechanism">
        <div class="mechanism-bg">
            <multi-img name="mechanism-bg" directory="fund"></multi-img>
            <h4>{{ $t('fusunProduct') }}</h4>
            <h2>{{ $t('chooseMechanism') }}</h2>
        </div>
        <p class="brief">{{ $t('mechanismBrief') }}</p>
        <div class="card invest-scope">
            <header>
                <multi-img class="left-img" name="pic_title_left" directory="fund"></multi-img>
                {{ $t('globalCover') }}
                <multi-img class="right-img" name="pic_title_right" directory="fund"></multi-img>
            </header>
            <p class="desc">{{ $t('mechanismDesc') }}</p>
            <div class="table" v-for="(item, idx) in investScope" :key="idx">
                <div class="table-header">{{ item.header }}</div>
                <div class="table-content">
                    <div class="col" v-for="(item, idx) in item.list" :key="idx">{{ item }}</div>
                </div>
            </div>
        </div>
        <div class="card choice">
            <header>
                <multi-img class="left-img" name="pic_title_left" directory="fund"></multi-img>
                {{ $t('strictChoose') }}
                <multi-img class="right-img" name="pic_title_right" directory="fund"></multi-img>
            </header>
            <p class="desc">{{ $t('chooseDesc') }}</p>
            <multi-img class="choice-img" :name="`pic_zhenxuan_${langType}`" directory="fund"></multi-img>
        </div>
        <div class="card config">
            <header>
                <multi-img class="left-img" name="pic_title_left" directory="fund"></multi-img>
                {{ $t('chooseSetting') }}
                <multi-img class="right-img" name="pic_title_right" directory="fund"></multi-img>
            </header>
            <p class="desc">{{ $t('chooseSettingDesc') }}</p>
            <div class="table" v-for="(item, idx) in config" :key="idx">
                <div class="table-header">{{ item.header }}</div>
                <div class="table-content">
                    <div class="col" v-for="(item, idx) in item.list" :key="idx">{{ item }}</div>
                </div>
            </div>
        </div>
        <disclaimer></disclaimer>
    </div>
</template>

<script>
import Disclaimer from './components/disclaimer.vue'
import { getLangType } from '@/utils/tools'
export default {
    name: 'mechanism',
    components: {
        Disclaimer,
    },
    data() {
        return {
            investScope: [
                {
                    header: this.$t('investScope.productLine'),
                    list: [
                        this.$t('investScope.privateStock'),
                        this.$t('investScope.structProduct'),
                        this.$t('investScope.privateCredit'),
                        this.$t('investScope.bondTactics'),
                        this.$t('investScope.realBase'),
                        this.$t('investScope.productTactics'),
                        this.$t('investScope.stockTactics'),
                        this.$t('investScope.cashManage'),
                    ],
                },
                {
                    header: this.$t('investScope.newService'),
                    list: [
                        'ESOP',
                        this.$t('investScope.overseasIns'),
                        this.$t('investScope.trust'),
                        this.$t('investScope.immigrants'),
                        this.$t('investScope.educ'),
                    ],
                },
            ],
            config: [
                {
                    header: this.$t('chooseConfig.macroscopic'),
                    list: [
                        this.$t('chooseConfig.style'),
                        this.$t('chooseConfig.financial'),
                        this.$t('chooseConfig.rate'),
                        this.$t('chooseConfig.credit'),
                    ],
                },
                {
                    header: this.$t('chooseConfig.industry'),
                    list: [
                        this.$t('chooseConfig.industryPolicy'),
                        this.$t('chooseConfig.boom'),
                        this.$t('chooseConfig.productionCycle'),
                        this.$t('chooseConfig.productionRule'),
                    ],
                },
                {
                    header: this.$t('chooseConfig.style'),
                    list: [
                        this.$t('chooseConfig.cost'),
                        this.$t('chooseConfig.growUp'),
                        this.$t('chooseConfig.marketValue'),
                        this.$t('chooseConfig.industry'),
                    ],
                },
            ],
        }
    },
    computed: {
        langType() {
            return getLangType()
        },
    },
}
</script>

<style scoped lang="less">
.mechanism {
    position: relative;
    padding-bottom: 68px;
    overflow: auto;
    background: #080000;

    .mechanism-bg {
        position: absolute;
        width: 100%;
        height: 246px;

        & > img {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        h2 {
            position: relative;
            margin: 8px 0 0 24px;
            font-weight: @fontBold;
            font-size: 28px;
            line-height: 34px;
            background: linear-gradient(324.22deg, #ffb28e 31.78%, #ffe1ce 105.79%);
            background-clip: text;
            -webkit-text-fill-color: transparent;
            /* stylelint-disable-next-line property-no-unknown */
            text-fill-color: transparent;
        }

        h4 {
            position: relative;
            margin: 56px 0 0 24px;
            color: #ffb694;
            font-size: 12px;
            line-height: 16px;
        }
    }

    .brief {
        margin: 171px 12px 12px;
        padding: 18px 22px;
        color: #2f2f2f;
        font-size: 12px;
        line-height: 21px;
        background: linear-gradient(180deg, #ffecdf 0%, #fffcfb 18.75%, #fff 100%);
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #fff;
        backdrop-filter: blur(27.1828px);
    }

    .card {
        margin: 12px;
        padding-bottom: 26px;
        overflow: hidden;
        background: #fff;
        border-radius: 8px;
        box-shadow: inset -0.5px 0.5px 0 #fff;
        backdrop-filter: blur(27.1828px);

        header {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 46px;
            color: #4c2620;
            font-weight: @fontBold;
            font-size: 17px;
            background: #fff2e3;

            img {
                width: 74px;
                height: 12px;
            }

            .left-img {
                margin-right: 12px;
            }

            .right-img {
                margin-left: 12px;
            }
        }

        .desc {
            margin: 16px 75px 14px;
            color: @fontLightColor;
            font-size: 12px;
            line-height: 20px;
            text-align: center;
        }

        .table {
            margin: 8px 22px 0;

            &-header {
                color: #4c2620;
                font-size: 14px;
                line-height: 36px;
                text-align: center;
                border-radius: 2px;
            }

            &:nth-of-type(1) {
                .table-header {
                    background: #fcba7d;
                }
            }

            &:nth-of-type(2) {
                .table-header {
                    background: #ffdfb9;
                }
            }

            &:nth-of-type(3) {
                .table-header {
                    background: #fff2e3;
                }
            }

            &-content {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;

                .col {
                    width: calc((100% - 6px) / 2);
                    margin-top: 4px;
                    color: #4c2620;
                    font-size: 12px;
                    line-height: 26px;
                    text-align: center;
                    background: #fffcf9;
                    border: 1px solid #fcba7d;
                    border-radius: 2px;
                }
            }
        }
    }

    .choice {
        text-align: center;

        .choice-img {
            width: 315px;
            height: 215px;
            margin: 2px 0 0;
        }
    }
}
</style>
