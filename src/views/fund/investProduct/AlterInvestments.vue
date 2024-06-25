<!-- 另类投资 - 票据列表 -->
<template>
    <div class="alter-investments">
        <div class="banner">
            <multi-img class="banner-img" name="alter-banner" directory="fund"></multi-img>
            <div class="banner-content">
                <p>{{ $t('intro.otherType') }}</p>
                <p>{{ $t('intro.investGroup') }}</p>
            </div>
            <div class="customize-main flex-s" v-if="loginedAndisPI">
                <div class="flex-c">
                    <multi-img width="26" height="26" name="customize" directory="fund" class="mar-r6"></multi-img>
                    <div class="f16 bold">{{ $t('bills.customProducts') }}</div>
                </div>
                <div>
                    <van-button
                        block
                        round
                        color="#4B95F7"
                        class="btn"
                        @click="goToCustomize"
                        v-if="customProductListTotal == 0 && customOrderCount == 0"
                    >
                        {{ $t('bills.goToCustomize') }}
                    </van-button>
                    <van-button
                        block
                        round
                        color="#4B95F7"
                        class="btn"
                        @click="goToCustomize"
                        v-if="customProductListTotal == 0 && customOrderCount > 0"
                    >
                        {{ $t('bills.myCustomize') }}
                    </van-button>
                    <van-button block round color="#4B95F7" class="btn" @click="goToCustomize" v-if="customProductListTotal > 0">
                        {{ $t('bills.customizeProduct') }}
                    </van-button>
                </div>
            </div>
        </div>
        <div class="alter-desc">
            <div class="desc-1">{{ alterDesc.desc1 }}</div>
            <div class="desc-2" v-show="alterInfoFlag">{{ alterDesc.desc2 }}</div>
            <div class="align-c" @click="handleAlterToggle">
                <multi-img class="icon-arrow" name="arrow_blue_down" directory="fund" v-if="!alterInfoFlag"></multi-img>
                <multi-img class="icon-arrow" name="arrow_blue_up" directory="fund" v-else></multi-img>
            </div>
        </div>
        <div class="content">
            <div v-for="item in billsList" :key="item.key" class="alter-bills">
                <template>
                    <div class="bills-main" :class="{ locked: isNotPI }" @click="handleBillsClick(item)">
                        <div v-if="isNotPI" class="bills-blur"></div>
                        <div class="bills-title">{{ item.name }}</div>
                        <div class="bills-desc">
                            <div class="desc" v-for="label in item.label.split(',')" :key="label">{{ label }}</div>
                        </div>
                        <div class="bills-rate">
                            <div class="rate">
                                <div>{{ getYield(item) }}</div>
                            </div>
                            <div class="sub">{{ $t('bills.sub') }}</div>
                        </div>
                        <div class="bills-btn">
                            <van-button block round color="#2697FF">{{ $t('bills.btn') }}</van-button>
                        </div>
                    </div>

                    <div v-if="isNotPI" class="bills-lock" @click="handleLockClick(item)">
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
                </template>
            </div>
            <div class="alter-more">
                <div class="more-header">
                    <multi-img width="42" height="40" name="alter-up" directory="fund"></multi-img>
                    <div class="more-header__text">
                        <span>{{ alterMore.header.text1 }}</span>
                        <span>{{ alterMore.header.text2 }}</span>
                    </div>
                </div>
                <div class="more-content">
                    <span>{{ alterMore.content.text1 }}</span>
                    <span>{{ alterMore.content.text2 }}</span>
                    <span>{{ alterMore.content.text3 }}</span>
                    <span>{{ alterMore.content.text4 }}</span>
                </div>
            </div>
            <div class="alter-msg">{{ alterMsg }}</div>
            <div class="legal-tip">
                {{ $t('billListLegalTip') }}
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { getBillsList, getCustomProductList } from '@/apis/fund/note'
import { noteCustomizationOrderCount } from '@/apis/wealth/index'
import { floatToRatio, getProfessionalStatus } from '@/utils'
import PrivateMixin from '../list/mixins/private'
import checkPIMixin from '@/mixins/business/checkPIMixin'

export default {
    name: 'alter-investments',
    mixins: [PrivateMixin, checkPIMixin],
    data() {
        return {
            alterDesc: {
                desc1: this.$t('intro.alterDesc-desc1'),
                desc2: this.$t('intro.alterDesc-desc2'),
            },
            alterMore: {
                header: {
                    text1: this.$t('intro.alterMore-header-text1'),
                    text2: this.$t('intro.alterMore-header-text2'),
                },
                content: {
                    text1: this.$t('intro.alterMore-coentent-text1'),
                    text2: this.$t('intro.alterMore-coentent-text2'),
                    text3: this.$t('intro.alterMore-coentent-text3'),
                    text4: this.$t('intro.alterMore-coentent-text4'),
                },
            },
            alterMsg: this.$t('intro.alterMsg'),

            // 票据列表
            billsList: [],
            start: 1,
            count: 10,
            alterInfoFlag: false,
            customProductListTotal: 0, // 票据可见产品列表数量
            customOrderCount: 0, // 客户定制单数量
        }
    },
    computed: {
        ...mapState('user', ['userInfo']),
        // activeBills() {
        //     return this.billsList.filter(item => !!item.isActive)
        // },
        isNotPI() {
            const acctObj = this.$store.getters['user/getAccts']

            return !getProfessionalStatus(acctObj.professionalType)
        },
        // 已登录且为PI
        loginedAndisPI() {
            return this.$root.isLogin && !this.isNotPI
        },
        subAcctId() {
            return this.$store.getters['user/getSubAccountId']
        },

        showMyCustomizeFlag() {
            return this.customProductListTotal > 0 || this.customOrderCount > 0
        },
    },
    mounted() {
        this.init()
    },
    methods: {
        getYield(item) {
            if (item.maxYield) {
                return `${floatToRatio(item.yield)} ~ ${floatToRatio(item.maxYield)}`
            }
            return floatToRatio(item.yield)
        },

        goToCustomize() {
            this.showMyCustomizeFlag ? this.$goPage('/bill-customize-index') : this.$goPage('/bill-customize-add')
        },

        init() {
            this.fetchList()
            this.getCustomProductListData()
            this.getNoteCustomizationOrderCount()
        },

        // 获取票据列表
        async fetchList() {
            try {
                const { result = {} } =
                    (await getBillsList({
                        start: this.start,
                        count: this.count,
                        subAccountId: this.subAcctId,
                    })) ?? {}

                this.billsList = [...result.list]
            } catch (err) {
                console.log('🚀 ~ fetchList ~ err', err)
                this.billsList = []
            }
        },

        // 获取票据可见产品列表
        async getCustomProductListData() {
            try {
                const { result = {} } =
                    (await getCustomProductList({
                        start: this.start,
                        count: 1,
                        subAccountId: this.subAcctId,
                    })) ?? {}

                this.customProductListTotal = result?.total || 0
            } catch (err) {
                console.log('err', err)
            }
        },

        // 获取客户定制单数量
        async getNoteCustomizationOrderCount() {
            try {
                const { result = {} } = (await noteCustomizationOrderCount({})) ?? {}
                this.customOrderCount = result?.count || 0
            } catch (err) {
                console.log('err', err)
            }
        },

        // 跳转详情
        handleBillsClick({ symbol }) {
            if (this.isNotPI) {
                return
            }
            this.$goPage('/bills/detail', {
                symbol: symbol,
            })
        },
        handleLockClick(item) {
            this.viewDetailHnader(item, 'bill')
        },
        handleAlterToggle() {
            this.alterInfoFlag = !this.alterInfoFlag
        },
    },
}
</script>

<style lang="less">
.bond-tip {
    .van-dialog__message {
        span {
            span {
                display: inline;
                color: #ff6907;
            }
        }
    }
}
</style>
<style scoped lang="less">
.alter-investments {
    width: 100%;
    background: linear-gradient(180deg, #f0faff 0%, #bee9ff 19.91%, #def4ff 23.95%, #def4ff 100%);
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

.text-overflow-3 {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
}

.margin-top-12 {
    margin-top: 12px;
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
    background-color: #17affe;
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
            color: #007cef;
            font-weight: 600;
            font-size: 34px;
            line-height: 44px;
        }

        p:nth-child(2) {
            color: #0073fa;
            font-weight: 400;
            font-size: 15px;
            line-height: 21px;
        }
    }

    .customize-main {
        position: absolute;
        right: 12px;
        bottom: 0;
        left: 12px;
        width: 351px;
        height: 56px;
        padding: 0 16px 0 12px;
        background: linear-gradient(180deg, #e7f8ff 0%, #fff 100%);
        border-radius: 8px;
        box-shadow: 0 1px 0 0 #fff inset;

        .btn {
            width: 86px;
            height: 28px;
            font-weight: 500;
            font-size: 14px;
            white-space: nowrap;
            background: #4b95f7;
            border-radius: 31px;
        }
    }
}

.content {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 12px;
}

.content-box {
    margin-bottom: 12px;
    padding: 20px 22px 26px;
    background: #fff;
    border-radius: 8px;
    box-shadow: inset -0.5px 0.5px 0 #fff;
}

.alter-bills {
    position: relative;
    .content-box();

    z-index: 11;

    &:first-child {
        background: linear-gradient(180deg, #f2fbff 0%, #fff 100%);
    }

    .full {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 8px;
    }

    .bills-lock {
        .full();

        z-index: 21;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .lock {
            width: 28px;
            height: 28px;
            color: #453d3d;
        }

        p {
            margin: 8px 0 16px;
            color: #666;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
            text-align: center;
        }

        button {
            width: 114px;
            color: #fff;
            font-weight: @fontBold;
            font-size: 14px;
            line-height: 32px;
            text-align: center;
            background-color: #2697ff;
            border: none;
            border-radius: 28px;
            outline: none;

            span {
                display: inline-block;
            }
        }
    }

    .bills-main {
        &.locked {
            filter: blur(4px);
        }

        .bills-blur {
            .full();

            z-index: 20;
            background-color: #fff;
            opacity: 0.8;
        }

        .bills-title {
            margin-bottom: 12px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
        }

        .bills-desc {
            display: flex;
            justify-content: center;
            margin-bottom: 18px;

            .desc {
                margin-right: 4px;
                padding: 0 8px;
                color: #0c71cd;
                font-size: 12px;
                line-height: 22px;
                text-align: center;
                background: #eaf5ff;
                border-radius: 3px;
            }
        }

        .bills-rate {
            margin-bottom: 20px;
            text-align: center;

            .rate {
                display: flex;
                justify-content: center;
                margin-bottom: 8px;
                color: #ff6907;
                font-weight: bold;
                font-size: 20px;

                div {
                    line-height: 28px;
                }

                .rate-or {
                    margin: 0 4px;
                    font-size: 14px;
                }
            }

            .sub {
                color: #9c9c9c;
                font-size: 12px;
            }
        }

        .bills-btn {
            padding: 0 22px;

            :deep(.van-button--normal) {
                font-weight: bold;
                font-size: 16px;
            }
        }
    }
}

.alter-desc {
    z-index: 11;
    width: 351px;
    margin: 12px;
    padding: 12px 16px 0;
    color: #2d5970;
    font-size: 12px;
    line-height: 18px;
    text-align: justify;
    background: linear-gradient(90deg, #fff 0%, rgba(255, 255, 255, 0.22) 100%);
    border-radius: 8px;

    .desc-2 {
        margin-top: 6px;
    }

    .icon-arrow {
        width: 12px;
        height: 12px;
        text-align: center;
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
            height: 46px;

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

    .more-content {
        display: flex;
        flex-direction: column;
        align-items: center;

        span {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 309px;
            height: 50px;
            margin-bottom: 10px;
            color: #fff;
            font-weight: 700;
            font-size: 12px;
            line-height: 21px;
            white-space: pre;
            text-align: center;
            border: 2px solid #c2ecff;
            border-radius: 8px;
        }

        span:nth-of-type(1) {
            background: #17affe;
        }

        span:nth-of-type(2) {
            background: #4ac1ff;
        }

        span:nth-of-type(3) {
            background: #6ed0ff;
        }

        span:nth-of-type(4) {
            margin-bottom: 0;
            background: #94daff;
        }
    }
}

.alter-msg {
    .content-box();
    .font-title3();
}

.fosun {
    width: 100%;
    margin: 6px 0 21px;
    color: #9c9c9c;
    font-weight: 400;
    font-size: 12px;
    line-height: 21px;
    text-align: center;
}

.legal-tip {
    margin-bottom: 24px;
    color: @fontGreyColor;
    font-weight: 400;
    font-size: 12px;
    line-height: 18px;
}
</style>
