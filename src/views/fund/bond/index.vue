// 债券
<template>
    <div class="bond" :class="{ ios: isIos }">
        <div class="banner">
            <multi-img class="banner-img" name="bond-banner" directory="fund"></multi-img>
            <div class="banner-content">
                <p>{{ $t('intro.bond') }}</p>
                <p>{{ $t('intro.incomeBack') }}</p>
            </div>
        </div>
        <div class="guide mg-b12" @click="goBondInfo">
            <div class="left">
                <multi-img name="icon-bond" directory="bond" />
                <span>{{ $t('whatIsBond') }}</span>
            </div>
            <div class="right">
                <span>{{ $t('toSee') }}</span>
                <multi-img class="next" name="icon_arrow_left" directory="bond" />
            </div>
        </div>
        <div class="content">
            <ul class="tabs" @click="onTabChange" :type="activeTab">
                <li
                    class="tab"
                    :class="{ choose: item.key === activeTab, [item.key]: true }"
                    v-for="item in tabs"
                    :key="item.key"
                    :data-type="item.key"
                >
                    {{ item.label }}
                </li>
            </ul>
            <div v-show="activeTab === USA_BOND" class="usa_bond-content">
                <ul class="usa_bond-list">
                    <li v-for="(item, idx) in usaBondList" :key="idx" class="usa_bond-list_item">
                        <h3 class="title">{{ item.label }}</h3>
                        <ul>
                            <li v-for="i in item.list" :key="i.symbol" class="usa_bond-base-info" @click="goBondDetail(i)">
                                <div class="header">
                                    <div class="left">
                                        <p class="name">{{ i.name }}</p>
                                        <p :class="`currency-${i.currency}`"></p>
                                    </div>
                                    <div class="right">
                                        <span>{{ $t('zeroCommission') }}</span>
                                        <div class="line"></div>
                                        <span>{{ i.minInitial | minInitialFilter(i.currency, transform) }}</span>
                                    </div>
                                </div>
                                <div class="body">
                                    <ul>
                                        <li>
                                            <span class="value" v-riseFall="{ value: i.MAY, base: 3 }"></span>
                                            <span class="label">{{ $t('expireIncome') }}</span>
                                        </li>
                                        <li>
                                            <span class="value">{{ (i || {}).remainingDate | remainingDateFilter }}</span>
                                            <span class="label">{{ $t('residueDate') }}</span>
                                        </li>
                                        <li>
                                            <span class="value">{{ (i || {}).creditRating }}</span>
                                            <span class="label">{{ $t('bondLevel') }}</span>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div
                v-show="activeTab === PI_BOND"
                class="content-item mg-b12"
                :class="{ hide: !isProfessional }"
                v-for="(item, index) in piBondList"
                :key="index"
                @click="goBondDetail(item)"
            >
                <div class="blur" v-if="!isProfessional"></div>
                <div class="item-title">
                    <span class="name">{{ item.name }}</span>
                    <div class="currency" :class="[`currency-${item.currency}`]"></div>
                </div>
                <div class="item-quote">
                    <div class="row left">
                        <span class="value" v-riseFall="{ value: item.MAY, base: 3 }"></span>
                        <span class="label">{{ $t('expireIncome') }}</span>
                    </div>
                    <div class="row center">
                        <span class="value">{{ item.remainingDate | remainingDateFilter(item) }}</span>
                        <span class="label">{{ $t('residueDate') }}</span>
                    </div>
                    <div class="row right">
                        <span class="value">{{ item.creditRating }}</span>
                        <span class="label">{{ $t('bondLevel') }}</span>
                    </div>
                </div>
                <div class="mask" v-if="!isProfessional">
                    <div class="mask-content">
                        <svg-icon iconClass="lock" className="lock"></svg-icon>
                        <p>{{ $t('verifyText1') }}，{{ $t('verifyText2') }}</p>
                        <button>
                            <span class="skew_top1">{{ $t('willVerify') }}</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="desc">
                {{ $t('intro.tradeChance') }}
            </div>
        </div>
    </div>
</template>

<script>
import { getList, getUsaBondList } from '@/apis/bond/index.js'
import { isIos } from '@/utils/tools'
import PrivateMixin from '../list/mixins/private'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import { CURRENCY_MAP } from '../config/common'
import { thousandsFilter } from '@/config/filters.js'
import { BOND_TYPE_MAP } from '@/views/fund/config/common'

const bondTypeKeysMap = BOND_TYPE_MAP.keysMap
const USA_BOND = 'USA'
const PI_BOND = 'PI'
// 后台映射值
const BACKEND_MAP = {
    [USA_BOND]: bondTypeKeysMap.usaBond,
    [PI_BOND]: bondTypeKeysMap.piBond,
}
export default {
    name: 'bond',
    mixins: [PrivateMixin, checkPIMixin],
    data() {
        return {
            isIos: isIos(),
            USA_BOND,
            PI_BOND,
            listMap: {
                [USA_BOND]: [],
                [PI_BOND]: [],
            },
            activeTab: USA_BOND,
            usaBondList: [],
            piBondList: [],
        }
    },
    computed: {
        tabs() {
            const list = [
                {
                    key: USA_BOND,
                    label: this.$t('usaNationalDebt'),
                },
                {
                    key: PI_BOND,
                    label: this.$t('piBond'),
                },
            ]
            return list
        },

        list() {
            return this.listMap[this.activeTab]
        },
    },
    filters: {
        currencyFilter(v) {
            return CURRENCY_MAP.options.findLabel(v, '--')
        },
        // 剩余天数
        remainingDateFilter(v = {}, info = {}) {
            if (info.expired) {
                // 是否过期
                return '0'
            }
            if (info.perpetual) {
                // 是否永续债券
                return '--'
            }
            const year = v?.year ? v?.year + 'Y+' : ''
            const day = v?.day ? v?.day + 'D' : ''
            return `${year}${day}`
        },
        minInitialFilter(v, currency, $t) {
            currency = CURRENCY_MAP.options.findLabel(currency, '--')
            const amount = thousandsFilter(v)
            return $t('startAmountForBond', { amount, currency })
        },
    },
    created() {
        // this.checkPI()
        this.getList()
    },
    methods: {
        async getList() {
            try {
                this.$loading.show = true
                if (this.activeTab === USA_BOND) {
                    if (this.usaBondList.length) return
                    const { result } = await getUsaBondList({
                        start: 1,
                        count: 50,
                    })
                    console.log('result ===>', result)
                    const { longList, shortList } = result || {}
                    this.usaBondList = [
                        { key: 'short', label: this.$t('usaShortNationalDebt'), list: shortList } || [],
                        { key: 'long', label: this.$t('usaLongNationalDebt'), list: longList || [] },
                    ]
                    return
                }
                if (this.activeTab === PI_BOND) {
                    if (this.piBondList.length) return
                    const {
                        result: { list = [] },
                    } = await getList({
                        start: 1,
                        count: 50,
                        type: BACKEND_MAP[this.activeTab],
                    })
                    this.piBondList = list
                }
            } catch (e) {
                console.log(e)
            } finally {
                this.$loading.show = false
            }
        },
        goBondInfo() {
            const url = `${location.origin}/wealth/fund.html#/invest-product/bond`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                location.href = url
            }
        },
        goBondDetail(item) {
            if (this.activeTab === USA_BOND) {
                const url = `${location.origin}${location.pathname}#/bond-detail?symbol=${item.symbol}`

                if (this.$jsBridge) {
                    return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
                }
                this.$router.push({
                    path: '/bond-detail',
                    query: {
                        symbol: item.symbol,
                    },
                })
                return
            }
            if (this.activeTab === PI_BOND) {
                this.viewDetailHnader(item, 'bond')
                return
            }
        },

        onTabChange(e) {
            const { type } = e.target.dataset || {}
            if (!type) return
            if (this.activeTab === type) return
            this.activeTab = type
            this.getList()
        },

        transform() {
            return this.$t.call(this, ...arguments)
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
<style lang="less" scoped>
@import url('~@/assets/css/mixins.less');

.bond {
    width: 100%;
    background: #fff4ed;

    &.ios {
        .content {
            #iosBottom(32px);
        }
    }
}

.mg-b12 {
    margin-bottom: 12px;
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

.guide {
    position: relative;
    z-index: 11;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -40px 16px 0;
    padding: 12px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    background: linear-gradient(180deg, #ffecdf 0%, #fffcfb 51.04%, #fff 100%);
    border-radius: 8px;
    box-shadow: inset -0.5px 0.5px 0 #fff;
    backdrop-filter: blur(27.1828px);

    .left {
        display: flex;
        align-items: center;
        color: #2f2f2f;

        img {
            width: 24px;
            height: 24px;
            margin-right: 8px;
        }
    }

    .right {
        display: flex;
        align-items: center;
        height: 20px;
        color: #ff6907;
        font-weight: 400;

        span:first-of-type {
            margin-right: 4px;
            font-size: 14px;
            line-height: 20px;
        }

        .next {
            width: 12px;
            height: 12px;
        }
    }
}

.content {
    display: flex;
    flex-direction: column;
    margin-top: 24px;
    padding: 16px 16px 32px;
    background: linear-gradient(180.02deg, #fff 0.02%, #f9f9f9 17.31%);
    border-radius: 20px 20px 0 0;
    box-shadow: inset 0 1px 0 #fff;

    .tabs {
        position: relative;
        display: flex;
        padding: 7px 0;
        background: #fff;

        &::before {
            position: absolute;
            right: -12px;
            bottom: 0;
            left: -12px;
            height: 1px;
            background: #efefef;
            transform: scaleY(0.5);
            content: '';
        }

        .tab {
            color: @fontLightColor;
            font-size: 16px;
            line-height: 22px;

            &.choose {
                color: @fontBlackColor;
                font-weight: 700;
            }

            &.PI {
                margin-left: 34px;
            }
        }

        &::after {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 32px;
            height: 2px;
            background: @theme;
            border-radius: 8px;
            transform: translateX(0);
            transition: ease-in 0.3s;
            content: '';
        }

        &[type='USA'] {
            &::after {
                transform: translateX(16px);
            }
        }

        &[type='PI'] {
            &::after {
                transform: translateX(111px);
            }
        }
    }

    .usa_bond-content {
        .usa_bond-list {
            .title {
                margin: 20px 0 12px 6px;
                color: @fontBlackColor;
                font-weight: 700;
                font-size: 14px;
                line-height: 21px;
            }

            &_item {
                .usa_bond-base-info {
                    margin-bottom: 12px;
                    padding: 16px 12px;
                    background: #fff;
                    border-radius: 8px;

                    .header {
                        margin-bottom: 21px;

                        .left {
                            display: flex;
                            align-items: center;

                            .name {
                                margin-right: 9px;
                                color: @fontBlackColor;
                                font-weight: 700;
                                font-size: 16px;
                                line-height: 22px;
                            }
                        }

                        .right {
                            display: flex;
                            align-items: center;
                            margin-top: 6px;

                            span {
                                color: #9c9c9c;
                                font-size: 12px;
                                line-height: 16px;
                            }

                            .line {
                                width: 1px;
                                height: 10px;
                                margin: 0 4px;
                                background: #b6b6b6;
                            }
                        }
                    }

                    .body {
                        & > ul {
                            display: flex;
                            justify-content: space-between;

                            li {
                                position: relative;
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                                width: 84px;
                                height: 50px;

                                .label {
                                    position: absolute;
                                    bottom: 0;
                                    color: @fontLightColor;
                                    font-size: 12px;
                                    line-height: 16px;
                                    word-break: keep-all;
                                }

                                .value {
                                    position: absolute;
                                    font-weight: 600;
                                    font-size: 20px;
                                    line-height: 28px;
                                }

                                &:last-child {
                                    .value {
                                        font-size: 18px;
                                        line-height: 26px;
                                    }
                                }

                                &:nth-child(2) {
                                    text-align: center;

                                    .value,
                                    .label {
                                        left: 50%;
                                        transform: translateX(-50%);
                                    }
                                }

                                &:nth-child(3) {
                                    text-align: right;

                                    .value,
                                    .label {
                                        right: 0;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    .content-item {
        position: relative;
        width: 100%;
        padding: 16px 12px;
        background: #fff;
        border-radius: 8px;

        &:nth-of-type(2) {
            margin-top: 21px;
        }

        &.hide {
            padding: 22px 12px;
        }

        &.hide > * {
            filter: blur(7px);
        }

        .blur {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 10;
            width: 100%;
            height: 100%;
            background-color: #fff;
            opacity: 0.6;
        }

        .item-title {
            margin-bottom: 21px;

            .name {
                color: #2f2f2f;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

            .currency {
                display: inline-block;
                margin-left: 9px;
            }
        }

        .item-quote {
            display: flex;
            justify-content: space-between;

            .row {
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 84px;
                height: 50px;

                .value {
                    position: absolute;
                    margin-bottom: 8px;
                    color: #2f2f2f;
                    font-weight: 700;
                    font-size: 20px;
                    line-height: 28px;
                }

                .label {
                    position: absolute;
                    bottom: 0;
                    color: #666;
                    font-weight: 400;
                    font-size: 12px;
                    line-height: 16px;
                    word-break: keep-all;
                }
            }

            .left {
                text-align: left;
            }

            .center {
                text-align: center;

                .value,
                .label {
                    left: 50%;
                    transform: translateX(-50%);
                }
            }

            .right {
                text-align: right;

                .value,
                .label {
                    right: 0;
                }
            }
        }

        .mask {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 20;
            width: 100%;
            height: 100%;
            filter: blur(0);

            .mask-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px 0;

                .lock {
                    width: 28px;
                    height: 28px;
                    color: #453d3d;
                }

                p {
                    padding: 8px 0 16px;
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
                    background-color: #ff6442;
                    border: none;
                    border-radius: 28px;
                    outline: none;

                    span {
                        display: inline-block;
                    }
                }
            }
        }
    }

    .desc {
        padding-top: 20px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;
        text-align: justify;
    }
}
</style>
