// 基金基础信息
<template>
    <div id="basic-info" class="basic-info">
        <div class="basic-info__header">
            <multi-img class="bg-img" name="pri-basic-bg" directory="fund"></multi-img>
            <div class="card">
                <div class="header">
                    <span class="name" ref="nameRef">{{ fundInfo.name }}</span>
                </div>
                <div class="content-center">
                    <ul>
                        <li v-for="(tab, index) in fundTabs" :key="index">{{ tab }}</li>
                    </ul>
                    <div class="fund-type" v-if="allShareType.length > 1" @click="showPopup = true">
                        <span class="type-name line-elipsis">{{ activeTypeName }}</span>
                        <multi-img name="icon-gold-triange" directory="fund"></multi-img>
                    </div>
                </div>
            </div>
        </div>
        <div class="body">
            <div class="quote" v-show="loadingFinish && !noNetWorth">
                <div class="rate">
                    <p class="value" v-riseFall="fundInfo.return1Y"></p>
                    <p class="label">{{ $t('yearChg') }}</p>
                </div>
                <div class="amount">
                    <p class="value">
                        <span class="nav">{{ fundInfo.latestNav | riseFallTatio }}</span>
                        <span class="return" v-riseFall="fundInfo.navChgPct"></span>
                    </p>
                    <p class="label">
                        {{ $t('latestNet') }}
                        <span v-if="fundInfo.navDate">({{ fundInfo.navDate | timeFilter }})</span>
                    </p>
                </div>
            </div>
            <div class="quote" v-show="loadingFinish && noNetWorth && haveExpectedRevenue">
                <div class="rate">
                    <p class="value" v-riseFall="fundInfo.expectedRevenue"></p>
                    <p class="label">{{ $t('expectedRevenue') }}</p>
                </div>
            </div>
            <div class="desc">{{ brief }}</div>
        </div>
        <van-popup v-model="showPopup" position="bottom">
            <div class="popup-content">
                <div class="header">
                    <multi-img name="icon-cancel" directory="common" @click="showPopup = false" />
                    <p>
                        <span>{{ $t('moreClassify') }}</span>
                        <multi-img @click="showMore" name="icon-tips" directory="common"></multi-img>
                    </p>
                </div>
                <ul @click="activeHandler($event)">
                    <li v-for="item in allShareType" :class="{ 'current-active': symbol === item.symbol }" :key="item.symbol" :data-key="item.symbol">
                        {{ item.shareType }}
                    </li>
                </ul>
            </div>
        </van-popup>
    </div>
</template>

<script>
import { floatToRatio } from '@/utils'
import { getFundQuote, getBrief } from '@/apis/fund/fund'
import { Overlay } from 'vant'
import { isNull, isUndefined, isTHSApp, isAndroid } from '@/utils/tools'
import { thousandsFilter } from '@/config/filters.js'
import { CURRENCY_MAP } from '../../config/common'

const currencyInteralKey = CURRENCY_MAP.keysMap
export default {
    name: 'basic-info',
    components: {
        [Overlay.name]: Overlay,
    },
    filters: {
        riseFallTatio(v) {
            return thousandsFilter(floatToRatio(v, { rate: false, toFixed: false, sign: false }))
        },
        timeFilter(v) {
            v = v || ''
            return v.replace(/-/g, '/') || '--'
        },
    },
    data() {
        return {
            loadingFinish: false,
            symbol: this.$route.query.symbol,
            showPopup: false,
            brief: '', // 基金简介
            allShareType: [],
            fundInfo: {
                name: '',
                symbol: '',
                ISIN: '',
                returnM3: '',
                return1Y: '',
                latestNav: '',
                shareType: '',
                morningStarRating: 0,
                currency: null, //
                riskRating: null, // 分险评级 1：低风险 2：中低风险 3：中风险 4：中高风险 5：高风险
                isDividend: null, // 是否分红 0：不分红 1：分红
                type: null, // 基金类型 1：股票型， 2：债券型， 3：混合型， 4：货币型
                investFocusDegree: '', // 投资集中度 only 公募
                otherShareType: null, // 其他份额类型
                isComplex: null, // 是否复杂产品
                navDate: '',
                navChgPct: '',
                isData: '', // 是否有净值
                expectedRevenue: '', // 目标回报
            },
            enumMap: {
                riskRating: {
                    1: this.$t('lowRisk'),
                    2: this.$t('middleLowRisk'),
                    3: this.$t('middleRisk'),
                    4: this.$t('middleHighRisk'),
                    5: this.$t('highRisk'),
                },
                isDividend: {
                    0: this.$t('noDividend'),
                    1: this.$t('dividend'),
                },
                type: {
                    1: this.$t('stockType'),
                    2: this.$t('bondType'),
                    3: this.$t('mixedType'),
                    4: this.$t('currencyType'),
                },
                isComplex: {
                    0: this.$t('riskWarning'),
                    1: this.$t('riskWarning'),
                },
                currency: currencyInteralKey,
            },
        }
    },
    computed: {
        isPublic() {
            return this.$route.query.type === 'public'
        },
        // 是否无净值 isData: 0: 没有净值没有目标回报 1: 有净值 2: 没有净值有目标回报
        noNetWorth() {
            return this.fundInfo.isData === 0 || this.fundInfo.isData === 2
        },

        // 是否有目标回报
        haveExpectedRevenue() {
            return this.fundInfo.isData === 2 && this.fundInfo.expectedRevenue && Number(this.fundInfo.expectedRevenue) > 0
        },

        activeTypeName() {
            const keyMap = {}
            this.allShareType.forEach(item => {
                keyMap[item.symbol] = item.shareType
            })
            return keyMap[this.symbol] || ''
        },
        fundTabs() {
            const keyList = ['currency', 'type', 'riskRating', 'isDividend', 'isComplex']
            const list = []
            keyList.forEach(key => {
                if (!isNull(this.fundInfo[key]) && !isUndefined(this.fundInfo[key]) && this.enumMap[key][this.fundInfo[key]]) {
                    let tab = ''
                    if (key === 'isComplex' && this.fundInfo[key] === 1) {
                        tab = this.$t('complexProduct')
                    } else {
                        tab = this.enumMap[key][this.fundInfo[key]]
                    }
                    list.push(tab)
                }
            })
            return list
        },
    },
    watch: {
        symbol: {
            handler(v) {
                console.log('symbol:', v, this.$route)
            },
            immediate: true,
        },
        noNetWorth(v) {
            this.$emit('checkNoNetWorth', v)
        },
    },
    async mounted() {
        await this.getBrief()
        await this.getQuote()
        this.loadingFinish = true
    },
    methods: {
        async getQuote() {
            try {
                const res = await getFundQuote({ symbol: this.symbol })
                const data = res.result.priQuote
                if (data) {
                    Object.keys(this.fundInfo).forEach(key => {
                        this.fundInfo[key] = data[key]
                    })
                }
                this.allShareType = this.fundInfo.otherShareType
                // 抛出 私募 其他类别字段
                this.$emit('getFundInfo', this.fundInfo)
            } catch (e) {
                console.log('getQuote===>e:', e)
            }
        },
        async getBrief() {
            try {
                const res = await getBrief({ symbol: this.symbol })
                const data = res.result.priBrief
                this.brief = data.brief
                this.$emit('getBriefData', data)
            } catch (e) {
                console.log(e)
            }
        },
        activeHandler(e) {
            const symbol = e.target.dataset.key
            if (symbol && symbol !== this.symbol) {
                this.showPopup = false

                if (isTHSApp() && isAndroid()) {
                    location.href = `${location.origin}${location.pathname}?t=${Date.now()}${location.hash.replace(
                        /symbol=([^&]+)/,
                        `symbol=${symbol}`
                    )}`
                } else {
                    this.$router.push({
                        path: this.$route.path,
                        query: {
                            ...this.$route.query,
                            symbol,
                        },
                    })
                }
            }
        },
        showMore() {
            this.$dialog.alert({
                closeOnClickOverlay: true,
                title: this.$t('tipTitle'),
                message: this.$t('classifyTip'),
                messageAlign: 'left',
                confirmButtonText: this.$t('iGet'),
            })
        },
    },
}
</script>

<style scoped lang="less">
.basic-info {
    /deep/ .van-popup--bottom {
        border-radius: 12px 12px 0 0;
    }

    .basic-info__header {
        position: relative;
        background: #080000;
        user-select: none;

        .bg-img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 112px;
        }
    }

    .card {
        position: relative;
        width: 100%;
        padding: 24px 12px 82px;
    }

    .header {
        margin-bottom: 8px;

        .name {
            color: #ffc3a6;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            vertical-align: bottom;
        }
    }

    .content-center {
        display: flex;
        align-items: center;
        justify-content: space-between;

        ul {
            display: flex;
            flex-wrap: wrap;

            li {
                margin-right: 6px;
                padding: 1px 4px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 10px;
                line-height: 1.2;
                background: #3a3840;
                border-radius: 2px;
            }
        }

        .fund-type {
            display: flex;
            align-items: center;
            max-width: 150px;
            height: 24px;
            padding: 0 8px;
            background: #3a3840;
            border-radius: 34px;

            .type-name {
                color: #ffc3a6;
                font-weight: 400;
                font-size: 10px;
                line-height: 24px;
            }

            img {
                width: 7px;
                height: 4px;
                margin-left: 6px;
            }
        }
    }
}

.body {
    position: relative;
    display: flex;
    flex-direction: column;
    margin: -70px 12px 0;
    padding: 16px 12px;
    background: #fff;
    border-radius: 8px;

    .quote {
        display: flex;
        align-items: flex-end;

        .value {
            color: #ff6907;
            font-weight: 700;
            font-size: 24px;
            line-height: 34px;
        }

        .label {
            margin-top: 4px;
            color: #666;
            font-size: 12px;
            line-height: 16px;
        }

        .amount {
            margin-left: 40px;

            .value {
                color: #2f2f2f;
                font-size: 16px;
                line-height: 22px;

                .return {
                    margin-left: 4px;
                    font-size: 12px;
                    line-height: 16px;
                }
            }

            .label {
                margin-top: 6px;
            }
        }
    }

    .desc {
        margin-top: 16px;
        padding: 10px 12px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;
        white-space: pre-wrap;
        text-align: justify;
        background: #f9f9f9;
        border-radius: 6px;
    }
}

.popup-content {
    max-height: 60vh;
    padding-bottom: 34px;
    overflow: scroll;
    background: #fff;

    .header {
        position: sticky;
        top: 0;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: #fff;

        img {
            position: absolute;
            top: 10px;
            left: 16px;
            width: 24px;
            height: 24px;
        }

        p {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                position: static;
                width: 16px;
                height: 16px;
                margin-left: 8px;
            }
        }
    }

    ul {
        display: flex;
        flex-direction: column;
        padding: 0 8px;

        li {
            height: 64px;
            padding-left: 16px;
            color: #000;
            font-weight: 400;
            font-size: 16px;
            line-height: 64px;
            background: #fff;
            border-radius: 8px;
        }

        .current-active {
            background-color: #fff5ef;
        }
    }
}
</style>
