<template>
    <div class="more-page">
        <div class="timg">
            <img class="arrowicon" v-if="lang == 'zhCn'" src="~@/assets/images/fund/bdtitle.png" />
            <img class="arrowicon" v-else src="~@/assets/images/fund/bdtitletc.png" />
        </div>
        <div class="tab_">
            <div class="tabs" ref="tabs">
                <div :class="['tab', activeTab == 1 ? 'active' : '']" @click="checkitem(1)">
                    <div v-if="activeTab == 1" class="activesty"></div>
                    <div class="content">
                        <div class="bdicon">
                            <multi-img class="arrowicon" name="sl" directory="fund" />
                        </div>
                        <p>{{ $t('fundText27') }}</p>
                    </div>
                </div>
                <div :class="['tab', activeTab == 2 ? 'active' : '']" @click="checkitem(2)">
                    <div v-if="activeTab == 2" class="activesty"></div>
                    <div class="content">
                        <div class="bdicon">
                            <multi-img class="arrowicon" name="gsy" directory="fund" />
                        </div>
                        <p>{{ $t('fundText21') }}</p>
                    </div>
                </div>
                <div :class="['tab', activeTab == 3 ? 'active' : '']" @click="checkitem(3)">
                    <div v-if="activeTab == 3" class="activesty"></div>
                    <div class="content">
                        <div class="bdicon">
                            <multi-img class="arrowicon" name="jylj" directory="fund" />
                        </div>
                        <p>{{ $t('fundText24') }}</p>
                    </div>
                </div>
                <div :class="['tab', activeTab == 4 ? 'active' : '']" @click="checkitem(4)">
                    <div v-if="activeTab == 4" class="activesty"></div>
                    <div class="content">
                        <div class="bdicon">
                            <multi-img class="arrowicon" name="pxjj" directory="fund" />
                        </div>
                        <p>{{ $t('fundText11') }}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="card tjlist">
            <div class="rule">
                <span v-if="activeTab == 1">
                    <i>{{ $t('fundText10') }}：</i>
                    {{ $t('fundText9') }}
                </span>
                <span v-if="activeTab == 2">
                    <i>{{ $t('fundText10') }}：</i>
                    {{ $t('fundText8') }}
                </span>
                <span v-if="activeTab == 3">
                    <i>{{ $t('fundText10') }}：</i>
                    {{ $t('fundText7') }}
                </span>
                <span v-if="activeTab == 4">
                    <i>{{ $t('fundText10') }}：</i>
                    {{ $t('fundText6') }}
                </span>
            </div>
            <div class="select" v-if="activeTab == 1">
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
                    <!-- <van-skeleton row="4" :loading="loading"> -->
                    <div class="fund-item-top">
                        <multi-img
                            v-if="idx == 0 || idx == 1 || idx == 2 ? true : false"
                            :name="idx == 0 ? 'pm1' : idx == 1 ? 'pm2' : idx == 2 ? 'pm3' : ''"
                            directory="fund"
                            :alt="idx == 0 ? 'pm1' : idx == 1 ? 'pm2' : idx == 2 ? 'pm3' : ''"
                        ></multi-img>
                        <p v-else>{{ idx + 1 }}</p>
                        <h3 class="title_">{{ item.name }}</h3>
                        <!-- <span :class="[item.currency=='USD'?'usdsty':'hkdsty']">{{item.currency}}</span> -->
                        <div :class="`currency-${item.currency}`"></div>
                    </div>
                    <div class="fund-item-bottom" v-if="activeTab == 3">
                        <div class="left">
                            <div class="rate">{{ item.establishmentYear || '--' }}</div>
                            <p class="type">{{ $t('fundText5') }}</p>
                        </div>
                        <div class="descript">
                            <p class="rate" v-riseFall="item.avgYieldY10"></p>
                            <div class="type" v-if="activeTab == 3">{{ $t('fundText4') }}</div>
                        </div>
                        <div class="zxicon" v-if="isApp" @click.stop="selfHandler(item)">
                            <multi-img v-if="item.zxflag" name="active-taoxin" directory="fund" alt="active-taoxin"></multi-img>
                            <multi-img v-else name="taoxin" directory="fund" alt="taoxin"></multi-img>
                        </div>
                    </div>
                    <div class="fund-item-bottom" v-else>
                        <div class="left">
                            <p class="rate" v-riseFall="item.dividendRatio" v-if="activeTab == 4"></p>
                            <p class="rate" v-riseFall="item.returnY3" v-if="activeTab == 2"></p>
                            <p
                                class="rate"
                                v-riseFall="
                                    optionTrue == 'm3'
                                        ? item.returnM3
                                        : optionTrue == 'm6'
                                        ? item.returnM6
                                        : optionTrue == 'y3'
                                        ? item.returnY3
                                        : item.returnY5
                                "
                                v-if="activeTab == 1"
                            ></p>
                            <p class="type" v-if="activeTab == 4">{{ $t('fundText3') }}</p>
                            <p class="type" v-else>
                                近{{
                                    optionTrue == 'm3'
                                        ? '3月'
                                        : optionTrue == 'm6'
                                        ? '6月'
                                        : optionTrue == 'y3'
                                        ? '3年'
                                        : optionTrue == 'y5'
                                        ? '5年'
                                        : ''
                                }}{{ $t('priceChange') }}
                            </p>
                        </div>
                        <div class="descript">
                            <div class="rate numjg" v-if="activeTab == 1">
                                {{ item.fundRank }}
                                <i>/</i>
                                {{ item.categorySize }}
                            </div>
                            <div class="rate" v-if="activeTab == 2">
                                {{ item.sharpeRatios }}
                            </div>
                            <div class="type" v-if="activeTab == 1">{{ $t('fundText2') }}</div>
                            <div class="type" v-if="activeTab == 2">{{ $t('fundList.sharpeRatioY1') }}</div>
                        </div>
                        <div class="zxicon" v-if="isApp" @click.stop="selfHandler(item)">
                            <multi-img v-if="item.zxflag" name="active-taoxin" directory="fund" alt="active-taoxin"></multi-img>
                            <multi-img v-else name="taoxin" directory="fund" alt="taoxin"></multi-img>
                        </div>
                    </div>
                    <!-- </van-skeleton> -->
                </div>
            </van-list>
            <!-- <loading :propsShow="true" :showLoading="loading"/> -->
            <div class="btdis">
                {{ $t('fundText1') }}
            </div>
        </div>
    </div>
</template>
<script>
import { Skeleton } from 'vant'
import { getRecommendList } from '@/apis/fund/fund.js'
import { isHLApp } from '@/utils/tools'
// import pm1 from '@/assets/images/fund/pm1.png'
// import pm2 from '@/assets/images/fund/pm2.png'
// import pm3 from '@/assets/images/fund/pm3.png'
import { getLangType } from '@/utils/tools.js'
export default {
    name: 'StrengthPage',
    components: {
        [Skeleton.name]: Skeleton,
    },
    data() {
        return {
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
            return isHLApp() && !!this.$jsBridge
        },
    },
    mounted() {
        this.activeTab = this.$route.query.id
    },
    watch: {
        activeTab: {
            handler(v) {
                const desObj = this.$refs.tabs
                if (v == 1) {
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
                let fundParams = 5 // 业绩实力榜
                if (this.activeTab == 1) {
                    fundParams = 5
                } else if (this.activeTab == 2) {
                    fundParams = 6
                } else if (this.activeTab == 3) {
                    fundParams = 7
                } else if (this.activeTab == 4) {
                    fundParams = 8
                }
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
            if (this.$openPageInThs(url.replace(/http(s)?/, 'https'))) return
            if (this.$openPageInI18NThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push(`/detail?type=${type}&symbol=${item.symbol}`)
            }
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
                width: 60px;
                height: 20px;
                color: #9c9c9c;
                font-size: 12px;
                line-height: 20px;

                span {
                    display: inline-block;
                    height: 100%;
                }

                img {
                    width: 6px;
                    height: 6px;
                    margin: 5px 5px 0;
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
                    color: #ff6907;
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
