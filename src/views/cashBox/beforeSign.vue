<template>
    <div class="autoDeal">
        <!-- <header>自动申赎</header> -->
        <div class="card">
            <multi-img class="bgImg" name="autoDeal" directory="cashBox"></multi-img>
            <h3 class="notice">
                <!-- <span class="point">{{$t('zdss')}}</span> -->
                <!-- <span>{{$t('cashBox')}}</span> -->
                <p v-riseFall="{ value: returnD7ToY1, base: 4, rate: true }"></p>
                <div class="des">{{ $t('heighestAnnual') }}</div>
            </h3>
            <ul class="details">
                <li>
                    <multi-img class="icon" name="icon_trade_buy" directory="cashBox" alt="icon_trade_buy"></multi-img>
                    <div class="divide"></div>
                    <div class="right">
                        <div class="title">{{ $t('idleCash') }}</div>
                        <div class="info">{{ $t('flexInvest') }}</div>
                    </div>
                </li>
                <li>
                    <multi-img class="icon" name="icon_trade_auto" directory="cashBox" alt="icon_trade_auto"></multi-img>
                    <div class="divide"></div>
                    <div class="right">
                        <div class="title">{{ $t('zdss') }}</div>
                        <div class="info">{{ $t('canBuyStock') }}</div>
                    </div>
                </li>
                <li>
                    <multi-img class="icon" name="icon_trade_adva" directory="cashBox" alt="icon_trade_adva"></multi-img>
                    <div class="divide"></div>
                    <div class="right">
                        <div class="title">0{{ $t('serviceCharge') }}</div>
                        <div class="info">{{ $t('immediateOpen') }}</div>
                    </div>
                </li>
            </ul>
            <p class="open-slogan" v-if="!isOpen">{{ openExperienceText }}</p>
            <div class="button" @click="goSign">{{ buttonTest }}</div>
        </div>
        <div class="tips" @click="goxcbExplain">
            <div class="des">
                <multi-img class="icon" name="cash" directory="fund" alt="cash"></multi-img>
                <span class="special-color">{{ $t('smsxcb') }}？</span>
            </div>
            <div class="tolook">
                <div class="qk">{{ $t('toSee') }}</div>
            </div>
        </div>
        <div class="desc">
            <div class="desc-title">{{ $t('openStatement') }}</div>
            <p class="desc-text">{{ $t('riskDescText1') }}</p>
            <p class="desc-text">{{ $t('riskDescText2') }}</p>
        </div>
        <div class="product">
            <div class="left" @click="onRemind">{{ $t('commonQuestion') }}</div>
            <div class="right" @click="goProduct">{{ $t('productDetail') }}</div>
        </div>
    </div>
</template>
<script>
import { FINANCE_ACCOUNT, FUND_ACCOUNT } from '@/entries/cashBox.js'

import { i18n } from '@/i18n/cashBox'
import verifyMixin from '@/mixins/business/verifyMixins.js'
import pathnames from '@/config/H5Pathname.js'
import { addCurParamsForUrl } from '@/utils'
import { getPubList } from '@/apis/fund/fund'
import { PUB_LIST_FILTER_MAP } from '@/config/common'

export default {
    name: 'beforeSign',
    mixins: [verifyMixin],
    data() {
        return {
            icon1: '',
            returnD7ToY1: '',
            openStatusMap: {
                // 开户状态
                finance: false, // 证券账户
                fund: false, // 理财账户
            },
        }
    },
    computed: {
        // 是否开户
        isOpen() {
            return this.openStatusMap.finance && this.openStatusMap.fund
        },
        buttonTest() {
            return this.isOpen ? i18n.t('openCashNow') : i18n.t('openAccountNow')
        },
        openExperienceText() {
            if (!this.isOpen) {
                return !this.openStatusMap.finance ? this.$t('openExperienceCash') : this.$t('openFundExperienceCash')
            }
            return ''
        },
    },
    created() {
        this.initAccountStatus()
        this.getList()
        this.$jsBridge &&
            this.$jsBridge.watchPageVisible(() => {
                window.location.reload()
            })
    },
    methods: {
        initAccountStatus() {
            this.openStatusMap.finance = this.$root.getAccountStatus(FINANCE_ACCOUNT)
            this.openStatusMap.fund = this.$root.getAccountStatus(FUND_ACCOUNT)
        },
        async goSign() {
            // 账户校验
            if (!(await this.accountVerify(false))) return

            const url = `${location.origin}${location.pathname}#/sign`
            location.replace(addCurParamsForUrl(url))
        },
        async getList() {
            try {
                const { result } = await getPubList({
                    start: 0,
                    count: 99,
                    sort: 'desc',
                    f: 'returnD7ToY1',
                    filter: [
                        {
                            type: 'fundType',
                            items: ['mmf'],
                        },
                    ],
                    buyable: PUB_LIST_FILTER_MAP.BUYABLE, // 只筛选可买的现金宝
                })
                const list = result?.list || []
                if (list.length) {
                    this.returnD7ToY1 = Math.max.apply(
                        Math,
                        list.map(item => {
                            return item.returnD7ToY1
                        })
                    )
                }
            } catch (e) {
                console.log('getPubList===>e:', e)
            }
        },
        goxcbExplain() {
            this.$router.push({ path: '/xcbExplain' })
        },
        onRemind() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=COMMONPROBLEM-ST`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
        goProduct() {
            this.$router.push({ path: '/productDetails' })
        },
    },
}
</script>
<style lang="less" scoped>
.des {
    margin-top: 8px;
    color: #666;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
}

.autoDeal {
    min-height: 100vh;
    padding: 12px;
    background: #f9f9f9;

    .card {
        position: relative;
        padding: 40px 0 46px;
        overflow: hidden;
        background-color: #fff;
        border-radius: 8px;
    }

    .bgImg {
        position: absolute;
        top: 0;
        right: 0;
        width: 163px;
        height: 174px;
    }

    header {
        height: 48px;
        color: #666;
        line-height: 48px;
        text-align: center;
    }

    .notice {
        margin-top: 8px;
        padding-left: 32px;
        font-weight: 600;
        font-size: 32px;
        line-height: 45px;

        .point {
            color: @theme;
        }
    }

    .details {
        margin-top: 52px;
        padding-bottom: 22px;
        padding-left: 32px;

        li {
            display: flex;
            flex-direction: row;
            align-items: center;
            margin-bottom: 36px;

            .icon {
                width: 44px;
                height: 44px;
                margin-right: 12px;
            }

            .divide {
                width: 0;
                height: 36px;
                margin-top: -8px;
                border-right: 1px dashed #c4c4c4;
                transform: scaleX(0.5);
            }

            .right {
                margin-left: 2px;
                padding-left: 16px;

                .title {
                    margin-bottom: 5px;
                    color: #2f2f2f;
                    font-weight: 500;
                    font-size: 18px;
                    line-height: 22px;
                }

                .info {
                    color: #9c9c9c;
                    font-weight: 400;
                    font-size: 14px;
                    line-height: 22px;
                }
            }
        }
    }

    .open-slogan {
        padding: 8px 0;
        color: #666;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        text-align: center;
    }

    .button {
        margin: 0 16px;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: @theme;
        border-radius: 22px;
    }

    .tips {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 56px;
        margin-top: 10px;
        padding: 0 16px;
        background: linear-gradient(90.12deg, #fff5ea 0.11%, #fffefd 61.07%, #fff 99.9%);
        border-radius: 8px;
        box-shadow: inset 0.5px -0.5px 0 #fff, inset 0.5px 0.5px 0 #fff;

        .des {
            display: flex;
            align-items: center;
            margin-top: 0;

            .icon {
                width: 32px;
                height: 32px;
                margin-right: 14px;
            }

            .special-color {
                color: #2f2f2f;
            }
        }

        .tolook {
            .qk {
                padding: 4px 12px;
                color: #fff;
                font-size: 14px;
                line-height: 20px;
                background: @theme;
                border-radius: 31px;
            }
        }
    }

    .desc {
        padding-top: 32px;

        .desc-title {
            color: #9c9c9c;
            font-weight: 700;
            font-size: 12px;
            line-height: 16px;
        }

        .desc-text {
            margin-top: 8px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 18px;
            text-align: justify;
        }
    }

    .product {
        display: flex;
        justify-content: center;
        padding-top: 32px;
        padding-bottom: 50px;

        div {
            padding: 0 16px;
            color: @theme;
            font-weight: 400;
            font-size: 14px;
            line-height: 14px;
        }

        .left {
            border-right: 0.5px solid #9c9c9c;
        }
    }
}
</style>
