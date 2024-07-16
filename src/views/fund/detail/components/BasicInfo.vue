// 基金基础信息
<template>
    <div class="card basic-info" id="basic-info">
        <div class="header">
            <div class="identification">
                <h3 class="name" ref="nameRef">{{ fundInfo.name }}</h3>
            </div>
            <div class="bottom" ref="bottomRef">
                <p class="code">
                    <span class="value" v-if="isPublic">{{ fundInfo.ISIN }}</span>
                    <fosun-tags class="tags" :tags="tagIcons"></fosun-tags>
                </p>
            </div>
        </div>
        <template v-if="!isOnlyBasicInfo">
            <div class="body" v-if="fundInfo.type === 4">
                <div class="rate">
                    <p class="value" v-riseFall="{ value: fundInfo.returnD7ToY1, base: 4 }"></p>
                    <div class="remind7">
                        <p class="label">
                            {{ $t('jqrnh') }}
                            <span v-if="isPublic && fundInfo.latestNavDate">({{ $t(fundInfo.currency) }})</span>
                        </p>
                        <multi-img name="icon-remind" directory="fund" @click="onRemind"></multi-img>
                    </div>
                </div>
                <div class="amount">
                    <p class="value" v-riseFall="{ value: fundInfo.returnY1, base: 2 }"></p>
                    <div class="remind7">
                        <p class="label">
                            {{ $t('nearOneYearChg') }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="body" v-else>
                <div class="rate">
                    <p class="value" v-riseFall="fundInfo.returnM3"></p>
                    <p class="label">{{ $t('nearThreeChg') }}</p>
                </div>
                <div class="amount">
                    <div class="cusp">
                        <p class="value">{{ fundInfo.latestNav | riseFallTatio }}</p>
                        <p class="value cusp_" v-riseFall="fundInfo.returnLastDay"></p>
                    </div>
                    <p class="label">
                        {{ $t('latestNet') }}
                        <span v-if="isPublic && fundInfo.latestNavDate">({{ fundInfo.latestNavDate | timeFilter }})</span>
                    </p>
                </div>
            </div>
            <!-- <div class="footer" v-if="isPublic && fundInfo.morningStarRating > 0">
                <div class="stars">
                    <label for="" class="label">{{ fundInfo.morningStarRating == 0 ? $t('noStar') : $t('starRating') }}</label>
                    <multi-img name="star" directory="fund" alt="star" class="star" v-for="i in fundInfo.morningStarRating" :key="i"></multi-img>
                    <multi-img
                        name="star_gray"
                        directory="fund"
                        alt="star_gray"
                        class="star"
                        v-for="i in 5 - fundInfo.morningStarRating"
                        :key="i + 5"
                    ></multi-img>
                </div>
            </div> -->
        </template>
    </div>
</template>

<script>
import FosunTags from '@/components/FosunTags.vue'
import { floatToRatio } from '@/utils'
import { getFundQuote } from '@/apis/fund/fund'
import { isNull, isUndefined } from '@/utils/tools'
import { thousandsFilter } from '@/config/filters.js'
import { CURRENCY_MAP, RISK_RATING_MAP, DIVIDEND_MAP, FUND_TYPE_MAP } from '../../config/common'
import pathnames from '@/config/H5Pathname.js'

const currencyMap = CURRENCY_MAP.keysMap
const riskRatingMap = RISK_RATING_MAP.keyValueMap
const dividendMap = DIVIDEND_MAP.keyValueMap
const typeMap = FUND_TYPE_MAP.keyValueMap
import { setPubFundTrack } from '@/views/fund/config/fundTrack.js'
export default {
    name: 'basic-info',
    props: {
        // 是否只展示基础信息
        isOnlyBasicInfo: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        FosunTags,
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
            symbol: this.$route.query.symbol,
            fundInfo: {
                name: '',
                symbol: '',
                ISIN: '',
                returnY1: '',
                returnM3: '',
                latestNav: '',
                income10k: '',
                returnD7ToY1: '',
                returnLastDay: '',
                morningStarRating: 0,
                currency: null, //
                riskRating: null, // 分险评级 1：低风险 2：中低风险 3：中风险 4：中高风险 5：高风险
                isDividend: null, // 是否分红 0：不分红 1：分红
                type: null, // 基金类型 1：股票型， 2：债券型， 3：混合型， 4：货币型
                investFocusDegree: '', // 投资集中度 only 公募
                otherShareType: null, // 其他份额类型
                isComplex: null, // 是否复杂产品
                latestNavDate: '',
            },
            enumMap: {
                currency: currencyMap,
                riskRating: riskRatingMap,
                isDividend: dividendMap,
                type: typeMap,
                isComplex: {
                    1: this.$t('complexProduct'), // 复杂产品
                },
            },
        }
    },
    computed: {
        isPublic() {
            return this.$route.query.type === 'public'
        },
        isPrivate() {
            return this.$route.query.type === 'private'
        },
        tagIcons() {
            const keyList = ['currency', 'type', 'riskRating', 'isDividend', 'isComplex']
            const list = []
            keyList.forEach(key => {
                if (!isNull(this.fundInfo[key]) && !isUndefined(this.fundInfo[key]) && this.enumMap[key][this.fundInfo[key]]) {
                    list.push(this.enumMap[key][this.fundInfo[key]])
                }
            })
            return list
        },
        currency() {
            return (this.fundInfo.currency || '').toUpperCase()
        },
    },
    mounted() {
        this.getQuote()
    },
    methods: {
        async getQuote() {
            try {
                const res = await getFundQuote({ symbol: this.symbol })
                const resultKey = this.isPublic ? 'pubQuote' : 'priQuote'
                if (res.result && res.result[resultKey]) {
                    Object.keys(this.fundInfo).forEach(key => {
                        this.fundInfo[key] = res.result[resultKey][key]
                    })
                }
                // 抛出 私募 其他类别字段
                this.$emit('getFundInfo', this.fundInfo)
                // 公募存储足迹
                if (this.isPublic) {
                    setPubFundTrack(this.fundInfo.symbol)
                }
            } catch (e) {
                console.log('getQuote===>e:', e)
            }
        },
        onRemind() {
            const { VUE_APP_BUILDER_PAGE } = pathnames
            const url = `${VUE_APP_BUILDER_PAGE}?key=CURRENCY-ZBSM`
            if (this.$jsBridge) return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            location.href = url
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 0 12px;
    padding: 16px 12px 12px;
    background: #fff;
    border-radius: 8px;
    user-select: none;
}

.basic-info {
    .header {
        .identification {
            .name {
                color: #1f1f1f;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }
        }

        .bottom {
            display: flex;
            // justify-content: space-between;
            align-items: center;
            margin-top: 8px;

            .code {
                display: flex;
                align-items: center;
                margin-right: 4px;

                .value {
                    color: #666;
                    font-size: 11px;
                    line-height: 14px;
                }

                .tags {
                    margin-left: 4px;
                }
            }
        }
    }

    .body {
        display: flex;
        align-items: flex-end;
        margin-top: 12px;

        .remind7 {
            display: flex;
            flex-direction: row;

            img {
                width: 16px;
                height: 16px;
                margin-top: 4px;
                margin-left: 6px;
            }
        }

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

            .remind7 {
                display: flex;
                flex-direction: row;

                img {
                    width: 16px;
                    height: 16px;
                    margin-top: 6px;
                    margin-left: 6px;
                }
            }

            .cusp {
                display: flex;
                flex-direction: row;

                .cusp_ {
                    margin-left: 8px;
                    font-size: 14px;
                }
            }

            .value {
                color: #2f2f2f;
                font-size: 16px;
                line-height: 22px;
            }

            .label {
                margin-top: 6px;
            }
        }
    }

    .footer {
        margin-top: 12px;
    }

    .stars {
        padding-top: 12px;
        font-size: 0;
        box-shadow: inset 0 0 0 #fff, inset 0 0 0 #fff, inset 0 0.5px 0 #efefef;

        .label {
            margin-right: 8px;
            color: #9c9c9c;
            font-size: 13px;
            line-height: 16px;
            vertical-align: middle;
        }

        .star {
            width: 18px;
            margin-right: 2px;
            vertical-align: middle;
        }
    }
}
</style>
