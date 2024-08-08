<template>
    <div class="more-page">
        <div class="timg">
            <img class="arrowicon" v-if="lang == 'zhCn'" src="~@/assets/images/fund/bdtitle.png" />
            <img class="arrowicon" v-else src="~@/assets/images/fund/bdtitletc.png" />
        </div>
        <div class="tab_">
            <div class="tabs" ref="tabs">
                <div v-for="item in topList" :key="item.id" :class="['tab', activeTab == item.id ? 'active' : '']" @click="checkitem(item.id)">
                    <div v-if="activeTab == item.id" class="activesty"></div>
                    <div class="content">
                        <div class="bdicon">
                            <multi-img class="arrowicon" :name="item.iconName" directory="fund" />
                        </div>
                        <p>{{ item.name }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="card tjlist">
            <div class="rule">
                <span>
                    <i>{{ $t('fundText10') }}：</i>
                    {{ ruleDesc }}
                </span>
            </div>
            <div class="select" v-if="activeTab == 3">
                <div class="top" @click="openSelect">
                    <span v-if="optionTrue == 'm3'">近3月</span>
                    <span v-if="optionTrue == 'm6'">近6月</span>
                    <span v-if="optionTrue == 'y3'">近3年</span>
                    <span v-if="optionTrue == 'y5'">近5年</span>
                    <img class="arrowicon" src="~@/assets/images/fund/icon_xl.png" />
                </div>
                <div class="date" v-if="showSelect">
                    <div class="tip-trangle-top"></div>
                    <div :class="['item', optionTrue == 'm3' ? 'active' : '']" @click="optionDate('m3')">近3月</div>
                    <div :class="['item', optionTrue == 'm6' ? 'active' : '']" @click="optionDate('m6')">近6月</div>
                    <div :class="['item', optionTrue == 'y3' ? 'active' : '']" @click="optionDate('y3')">近3年</div>
                    <div :class="['item', optionTrue == 'y5' ? 'active' : '']" @click="optionDate('y5')">近5年</div>
                </div>
            </div>
            <van-list v-model="vanloading" :finished="finished" finished-text="" :loading-text="$t('loading')" @load="onLoad">
                <div class="fund-item" v-for="(item, idx) in fundList" :key="item.symbol" @click="gotoFundDetail(item)">
                    <div class="fund-item-top">
                        <multi-img v-if="idx < 3" :name="`pm${idx + 1}`" directory="fund"></multi-img>
                        <p v-else>{{ idx + 1 }}</p>
                        <h3 class="title_">{{ item.name }}</h3>
                        <div :class="`currency-${item.currency}`" style="flex-shrink: 0"></div>
                    </div>

                    <!-- 陆浦香港、货基排行榜 -->
                    <template v-if="[1, 2].includes(+activeTab)">
                        <!-- 非货币基金展示近一年涨跌幅和最新净值 -->
                        <TopListItemBottom
                            v-if="item.fundType !== fundTypeKeysMap.currency"
                            :config="[
                                { label: $t('nearOneYearChg'), value: item.returnY1, isRiseFall: true },
                                { label: `${$t('latestNet')}(${formatDate(item.latestNavDate)})`, value: item.latestNav, notBold: true },
                            ]"
                        ></TopListItemBottom>

                        <!-- 货币基金展示近七日年化和日均万元收益 -->
                        <TopListItemBottom
                            v-if="item.fundType === fundTypeKeysMap.currency"
                            :config="[
                                { label: $t('jqrnh'), value: item.returnD7ToY1, isRiseFall: true },
                                { label: $t('wfIncome'), value: item.returnD7ToY1, notBold: true },
                            ]"
                        ></TopListItemBottom>
                    </template>

                    <!-- 业绩实力榜 -->
                    <TopListItemBottom
                        v-if="activeTab === 3"
                        :config="[
                            { label: `近${optionTrueText}${$t('priceChange')}`, value: item[optionTrueKey], isRiseFall: true },
                            {
                                label: $t('fundText2'),
                                value: item.fundRank && item.categorySize ? `${item.fundRank}/${item.categorySize}` : '--',
                                notBold: true,
                            },
                        ]"
                    ></TopListItemBottom>

                    <!-- 高收益风险比榜 -->
                    <TopListItemBottom
                        v-if="activeTab === 4"
                        :config="[
                            { label: `近${optionTrueText}${$t('priceChange')}`, value: item.returnY3, isRiseFall: true },
                            { label: $t('fundList.sharpeRatioY1'), value: item.sharpeRatios || '--' },
                        ]"
                    ></TopListItemBottom>

                    <!-- 派息榜 -->
                    <TopListItemBottom
                        v-if="activeTab === 5"
                        :config="[{ label: $t('fundText3'), value: item.dividendRatio, isRiseFall: true, isHorizontal: true }]"
                    ></TopListItemBottom>
                </div>
            </van-list>
            <div class="btdis">
                {{ $t('fundText1') }}
            </div>
        </div>
    </div>
</template>
<script>
import { Skeleton } from 'vant'
import { getRecommendList } from '@/apis/fund/fund.js'
import { isTenantApp } from '@/utils/tools'
// import pm1 from '@/assets/images/fund/pm1.png'
// import pm2 from '@/assets/images/fund/pm2.png'
// import pm3 from '@/assets/images/fund/pm3.png'
import { getLangType } from '@/utils/tools.js'
import TopListItemBottom from './components/TopListItemBottom.vue'
import { FUND_MODE_MAP, FUND_TYPE_MAP } from '@/views/fund/config/common'

const fundTypeKeysMap = FUND_TYPE_MAP.keysMap
console.log('🚀 ~liujinhao~ ~ fundTypeKeysMap:', fundTypeKeysMap)

export default {
    name: 'StrengthPage',
    components: {
        [Skeleton.name]: Skeleton,
        TopListItemBottom,
    },
    data() {
        return {
            fundTypeKeysMap,
            loading: true,
            symbol: this.$route.query.symbol,
            type: this.$route.query.type,
            showLoading: false,
            start: 1,
            count: 0,
            list: [],
            rowClass: 'history-page__row',
            titleClass: 'history-page__title',

            activeTab: 1,
            optionTrue: this.$route.query.period || 'y3',
            showSelect: false,
            fundList: [],
            // pm1,
            // pm2,
            // pm3,
            lang: getLangType(),
            vanloading: false,
            finished: false,

            topList: [
                {
                    id: 1,
                    name: this.$t('topList1'),
                    tips: this.$t('topList1Tips'),
                    desc: this.$t('topList1Desc'),
                    iconName: 'sl',
                },
                {
                    id: 2,
                    name: this.$t('topList2'),
                    tips: this.$t('topList2Tips'),
                    desc: this.$t('topList2Desc'),
                    iconName: 'top-list_cash',
                },
                {
                    id: 3,
                    name: this.$t('fundText27'),
                    tips: this.$t('fundText26'),
                    desc: this.$t('fundText9'),
                    iconName: 'jylj',
                },
                {
                    id: 4,
                    name: this.$t('fundText21'),
                    tips: this.$t('fundText28'),
                    desc: this.$t('fundText8'),
                    iconName: 'gsy',
                },
                {
                    id: 5,
                    name: this.$t('fundText22'),
                    tips: this.$t('fundText23'),
                    desc: this.$t('fundText6'),
                    iconName: 'pxjj',
                },
            ],
        }
    },
    computed: {
        isCurrencyHistory() {
            if (this.$route.query.currencyHistory == 1) {
                document.title = this.$t('hisDay7Annual')
                return true
            }
            document.title = this.$t('historyNet')
            return false
        },
        isMore() {
            return this.$route.query.isMore == 1
        },
        isApp() {
            return isTenantApp() && !!this.$jsBridge
        },

        ruleDesc() {
            const topItem = this.topList.find(el => el.id == +this.activeTab)
            return topItem?.desc
        },

        optionTrueText() {
            const map = {
                m3: '3月',
                m6: '6月',
                y3: '3年',
                y5: '5年',
            }

            return map[this.optionTrue]
        },

        optionTrueKey() {
            const map = {
                m3: 'returnM3',
                m6: 'returnM6',
                y3: 'returnY3',
                y5: 'returnY5',
            }
            return map[this.optionTrue]
        },
    },
    mounted() {
        this.activeTab = this.$route.query.id
    },
    watch: {
        activeTab: {
            handler(v) {
                const desObj = this.$refs.tabs
                if (v == 3 || v == 4) {
                    this.optionTrue = this.$route.query.period || 'y3'
                    if (desObj) {
                        desObj.scrollLeft = 0
                    }
                }
                if (v == 4) {
                    if (desObj) {
                        desObj.scrollLeft = desObj.scrollWidth
                    }
                }
            },
            immediate: true,
        },
    },
    methods: {
        async onLoad() {
            await this.getRecommendList()
        },
        //tab选项
        checkitem(v) {
            if (v == this.activeTab) return
            this.finished = false
            this.activeTab = v
            //切换时需重置状态
            this.count = 0
            this.onLoad()
        },
        //时间点击每一项
        optionDate(v) {
            this.optionTrue = v
            this.showSelect = false
            this.getRecommendList()
        },
        openSelect() {
            this.showSelect = !this.showSelect
        },
        checkZx(v) {
            this.zxflag = !this.zxflag
            console.log(v)
        },
        getTempList(length) {
            return Array.from({ length }).map(() => ({}))
        },
        async getRecommendList() {
            try {
                this.loading = true
                this.count += 10
                const fundMap = {
                    1: 21,
                    2: 22,
                    3: 5,
                    4: 6,
                    5: 8,
                }
                const fundParams = fundMap[this.activeTab]
                let paramsData = {}
                paramsData = { type: fundParams, start: this.start, count: this.count }
                if (fundParams == 5) {
                    paramsData = { type: fundParams, start: this.start, count: this.count, period: this.optionTrue }
                }
                let { result } = (await getRecommendList(paramsData)) || {}
                result = result || {}
                const list = result.list || []
                // this.fundList = []
                const arr = list.length ? list[0].info : []
                if (this.isApp) {
                    const checkList = []
                    arr.forEach(item => {
                        checkList.push(
                            new Promise((resolve, reject) => {
                                this.checkFavstock(item.symbol)
                                    .then(res => {
                                        item.zxflag = res
                                        resolve()
                                    })
                                    .catch(err => {
                                        item.zxflag = err
                                        reject()
                                    })
                            })
                        )
                    })
                    await Promise.all(checkList)
                }
                this.fundList = arr
            } catch (e) {
                console.error(e)
                this.fundList = []
            } finally {
                this.loading = false
                this.vanloading = false
                // 数据全部加载完成
                if (this.fundList.length < this.count) {
                    this.finished = true
                }
            }
        },
        gotoFundDetail(item, type) {
            type =
                type ||
                {
                    0: 'public',
                    1: 'private',
                }[item.fundMode]
            if (!(type && item.symbol)) return
            const url = `${location.origin}/wealth/fund.html#/detail?type=${type}&symbol=${item.symbol}`

            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push(`/detail?type=${type}&symbol=${item.symbol}`)
            }
        },
        formatDate(val) {
            return val.replace(/-/g, '/') || '--'
        },
        // 检查自选
        async checkFavstock(symbol) {
            if (!this.isApp) return
            try {
                const data = await this.$jsBridge.checkFavstock(symbol)
                return data.isFavStock
            } catch (e) {
                console.log('jsBridge.checkFavstock=>e:', e)
                return false
            }
        },
        // 添加\删除 自选
        async selfHandler(item) {
            if (!this.isApp) return
            const symbol = item.symbol
            try {
                const isFavStock = await this.checkFavstock(symbol)
                if (isFavStock) {
                    await this.$jsBridge.removeFavstock(symbol)
                    item.zxflag = false
                } else {
                    await this.$jsBridge.addFavstock(symbol)
                    item.zxflag = true
                }
            } catch (e) {
                console.log('selfHandler=>e:', e)
            }
        },
    },
}
</script>
<style lang="less">
.history-page__row {
    height: 40px !important;
    color: #2f2f2f;
    font-size: 14px !important;
}

.history-page__title {
    width: 157px !important;
}

.history-page__columns__fixed {
    width: 157px !important;
    text-align: left;
}

.history-page__columns__scroll {
    width: 85px !important;
}
</style>
<style lang="less" scoped>
/deep/ .box {
    .scroll {
        .scroll-title-container {
            left: 157px;
        }
    }
}
</style>
<style scoped lang="less">
@white: #fff;

.more-page {
    // padding: 8px 0 8px 0;
    display: inline-block;
    // width: calc(100% - 24px);
    width: 100%;
    height: 100%;
    overflow: auto;
    // margin: 12px;
    // border-radius: 8px;
    .btdis {
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;
    }

    .tips {
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }

    .table-content {
        height: 100%;
    }

    .card {
        margin-top: 12px;
        border-radius: 8px;

        &.shadow {
            background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
            box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
            backdrop-filter: blur(27px);
        }
    }

    .tab_ {
        position: relative;
        height: 50px;
    }

    .tabs {
        position: relative;
        position: absolute;
        top: -42px;
        left: 0;
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: 20px 0;
        overflow-y: auto;

        .tab {
            position: relative;
            flex-shrink: 0;
            width: 105px;
            height: 72px;
            margin-right: 8px;
            background: #fff;
            border-radius: 6px;
            box-shadow: 0 1px 20px rgba(0, 0, 0, 0.08);

            .activesty {
                position: absolute;
                bottom: -9.5px;
                left: 44px;
                width: 18px;
                height: 18px;
                background: #fff6e7;
                border-right: 1px solid #f4d2ae;
                border-bottom: 1px solid #f4d2ae;
                border-top-left-radius: 10px;
                border-bottom-right-radius: 3px;

                /* Internet Explorer */

                /* Firefox */

                /* Safari 和 Chrome */
                transform: rotate(45deg); /* Opera */
            }

            .content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;

                .bdicon {
                    img {
                        width: 34px;
                        height: 34px;
                    }
                }

                p {
                    color: #2f2f2f;
                    font-weight: 700;
                }
            }
        }

        .active {
            background: linear-gradient(359.21deg, #fff1db -72.31%, #fffdf8 102.28%);
            border: 1px solid #f4d2ae;
        }

        .tab:first-child {
            margin-left: 12px;
        }

        .tab:last-child {
            position: relative;
        }

        .tab:last-child::after {
            position: absolute;
            top: 0;
            right: -12px;
            display: block;
            width: 12px;
            height: 48px;
            content: '';
        }

        .tabimg {
            background: url('~@/assets/images/fund/Union.png');
            background-repeat: no-repeat;
            background-size: 100% 90px;
            // background-position-y: top;
        }
    }

    .tabs::-webkit-scrollbar {
        display: none; /* Chrome Safari */
    }

    /* stylelint-disable-next-line no-duplicate-selectors */
    .tabs::-webkit-scrollbar {
        width: 0 !important;
    }

    .tjlist {
        margin: 12px;
        padding: 8px 0 12px;

        .rule {
            margin-bottom: 14px;
            padding: 12px;
            color: #ca741c;
            line-height: 18px;
            background: linear-gradient(180.33deg, #fff7ea -4.99%, #fff1db 9.5%, #fffdf8 110.13%);
            border: 1px solid #ffe2c3;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(184, 142, 103, 0.1);

            i {
                font-weight: 700;
                font-style: normal;
            }
        }

        .select {
            position: relative;
            margin-top: 15px;

            .top {
                display: flex;
                flex-direction: row;
                align-items: center;
                width: 60px;
                height: 24px;
                color: #9c9c9c;
                font-size: 12px;
                line-height: 24px;

                span {
                    display: inline-block;
                    height: 100%;
                }

                img {
                    width: 6px;
                    height: 6px;
                    margin-left: 5px;
                }
            }

            .date {
                position: absolute;
                top: 32px;
                width: 70px;
                background: #fff;
                border-radius: 5px;
                box-shadow: 1px 2px 20px rgba(0, 0, 0, 0.17);

                .item {
                    height: 36px;
                    line-height: 36px;
                    text-align: center;
                    border-bottom: 0.5px solid rgb(241, 241, 241);
                }

                .item:last-child {
                    border-bottom: none;
                }

                .active {
                    color: @theme;
                }

                .tip-trangle-top {
                    position: absolute;
                    top: -8px;
                    left: 10px;
                    width: 0;
                    height: 0;
                    border-right: 8px solid transparent;
                    border-bottom: 8px solid #fff;
                    border-left: 8px solid transparent;
                }
            }
        }

        .title {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-bottom: 12px;
            padding: 12px 12px 0;
            overflow: hidden;
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            white-space: nowrap;
            text-overflow: ellipsis;

            .right {
                color: #666;
                font-weight: 400;
                font-size: 12px;
                font-family: 'PingFang SC';
                line-height: 22px;

                .arrowicon {
                    width: 12px;
                    height: 12px;
                    vertical-align: middle;
                }
            }
        }

        .fund-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 12px;
            padding: 16px 12px;
            background: @white;
            border-radius: 8px;

            .fund-item-top {
                display: flex;
                flex-direction: row;
                align-items: center;
                min-width: 60px;
                margin-right: 15px;

                .title_ {
                    margin-right: 4px;
                    padding-left: 5px;
                    color: #2f2f2f;
                    font-weight: 500;
                    font-size: 15px;
                    line-height: 20px;
                }

                img {
                    width: 24px;
                    height: 24px;
                }

                span {
                    padding: 1px 2px;
                    font-weight: 500;
                    font-size: 8px;
                    line-height: 10px;
                    background: #f6efff;
                    border-radius: 1.5px;
                }

                .hkdsty {
                    color: #7933d9;
                }

                .usdsty {
                    color: #0569ff;
                }

                p {
                    width: 24px;
                    height: 24px;
                    color: #9c9c9c;
                    font-weight: 600;
                    font-size: 17px;
                    line-height: 24px;
                    text-align: center;
                }
            }

            .fund-item-bottom {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                padding-left: 29px;

                .descript {
                    .rate {
                        color: #2f2f2f;
                        font-weight: 600;
                        font-size: 16px;
                        line-height: 22px;
                    }

                    .type {
                        margin-top: 4px;
                        color: #9c9c9c;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;
                    }

                    .numjg {
                        font-weight: 400;

                        i {
                            margin: 0 1px;
                            font-style: normal;
                        }
                    }
                }

                .left {
                    .rate {
                        color: #1f1f1f;
                        font-weight: 600;
                        font-size: 16px;
                        line-height: 22px;
                    }

                    .type {
                        margin-top: 4px;
                        color: #9c9c9c;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;
                    }
                }

                .zxicon {
                    img {
                        width: 24px;
                        height: 24px;
                    }
                }
            }

            .bot {
                display: flex;
                flex-direction: row;
                margin-top: 14px;
                padding: 6px 12px;
                color: #666;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
                background: #f9f9f9;
                border-radius: 4px;

                img {
                    width: 16px;
                    height: 16px;
                    margin-right: 8px;
                }
            }
        }
    }
}
</style>
