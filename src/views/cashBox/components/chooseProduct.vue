<template>
    <van-popup class="choose-product" duration="0" v-model="show">
        <div class="smart">
            <div class="check-box" @click="triggerSmartHandler">
                <div class="check-box__icon">
                    <multi-img
                        class="check-img"
                        :name="smartCheck ? 'icon_agreement_select' : 'icon_agreement_normal'"
                        directory="common"
                    ></multi-img>
                </div>
                <div class="check-box__label smart-slogan">
                    <div class="slogan-top">
                        <p>{{ $t('smartTactics') }}</p>
                        <div class="slogan__commend">
                            <span class="skew_top1">{{ $t('recommend') }}</span>
                        </div>
                    </div>
                    <p class="slogan-bottom">{{ rollText }}</p>
                </div>
            </div>
        </div>
        <div class="list">
            <ul>
                <li
                    class="check-box"
                    v-for="item in currnecyList"
                    :key="item.symbol"
                    @click="triggerItemHandler(item)"
                    :class="{ disabled: isRollOut && !sellAmountMap[item.symbol]?.sellable }"
                >
                    <div class="check-box__icon">
                        <multi-img
                            class="check-img"
                            :name="
                                isRollOut && !sellAmountMap[item.symbol]?.sellable
                                    ? 'icon_agreement_normal--disabled'
                                    : item.check
                                    ? 'icon_agreement_select'
                                    : 'icon_agreement_normal'
                            "
                            directory="common"
                        ></multi-img>
                    </div>
                    <div class="check-box__label item-content">
                        <div class="top">
                            <p class="fund-name line-elipsis">{{ item.name }}</p>
                            <div class="currency" :class="`currency-${item.currency}`"></div>
                        </div>
                        <div class="bottom">
                            <div class="left" v-if="holding">
                                <p class="top-text">{{ sellAmountMap[item.symbol]?.sellableAmount | thousandsFilter }}</p>
                                <p class="bottom-text">{{ $t('canSellAmount') }}</p>
                            </div>
                            <div class="right" :class="{ 'not-holding': !holding }">
                                <p class="top-text" v-if="holding" v-riseFall="{ value: item.returnD7ToY1 || '', base: 4, rate: true }"></p>
                                <p class="top-text" v-else v-riseFall="{ value: item.returnD7ToY1 || '', base: 4, rate: true }"></p>
                                <p class="bottom-text">{{ $t('jqrnh') }}({{ (item.latestNavDate || '').replace(/-/g, '/') }})</p>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </van-popup>
</template>
<script>
import { floatToRatio } from '@/utils'
import { thousandsFilter } from '@/config/filters'
import { HoldingsTradeableV3 } from '@/apis/wealth/index.js'
import { getPubList, batchPubInfo } from '@/apis/fund/fund'
import { PUB_LIST_FILTER_MAP } from '@/config/common'
import NP from 'number-precision'

export default {
    name: 'chooseProduct',
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        orient: {
            type: String,
            default: 'rollIn',
        },
        holding: {
            // 是否显示持仓可卖金额
            type: Boolean,
            default: false,
        },
        currency: {
            type: String,
            default: '',
        },
        // 选择的产品
        symbol: {
            type: String,
            default: '',
        },
    },
    filters: {
        profitFilter(v) {
            return floatToRatio(v, { sign: false, base: 4, rate: false })
        },
        thousandsFilter(v) {
            return v ? thousandsFilter(v) : '0.00'
        },
    },
    data() {
        return {
            smartCheck: false,
            list: [],
            sellAmountMap: {},
        }
    },
    computed: {
        show: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        rollText() {
            return {
                rollIn: this.$t('rollInTacticsDesc'),
                rollOut: this.$t('rollOutTacticsDesc'),
            }[this.orient]
        },
        isRollIn() {
            return this.orient === 'rollIn'
        },
        isRollOut() {
            return this.orient === 'rollOut'
        },
        currnecyList() {
            let list = this.list
            if (this.currency) {
                list = list.filter(item => {
                    let ret = item.currency === this.currency
                    // 卖出时，只显示可卖金额大于0的产品
                    if (this.isRollOut) {
                        ret = ret && NP.minus(this.sellAmountMap[item.symbol]?.sellableAmount || 0, 0)
                    }
                    return ret
                })
            }
            // 卖出页的额外排序
            if (this.isRollOut) {
                list.sort((a, b) => {
                    // 可卖金额倒序排列
                    return Number(this.sellAmountMap[b.symbol]?.sellableAmount) - Number(this.sellAmountMap[a.symbol]?.sellableAmount)
                }).sort((a, b) => {
                    // 可卖状态倒序排列
                    return Number(this.sellAmountMap[b.symbol]?.sellable) - Number(this.sellAmountMap[a.symbol]?.sellable)
                })
            }
            return list
        },
    },
    watch: {
        symbol: {
            handler(v) {
                this.initCheckBySymbol(v)
            },
            deep: true,
            immediate: true,
        },
        currnecyList: {
            handler(v) {
                if (v.length) {
                    this.$emit('getProduct', v)
                }
            },
            deep: true,
        },
        list: {
            handler(v) {
                if (v.length) {
                    this.$emit('getProductList', v)
                }
            },
            deep: true,
        },
    },
    async created() {
        // 初始化选择需要等获取到list
        // await this.getList()
        // if (this.holding) this.getProductsHoldingAble()
        // this.initCheckBySymbol(this.symbol)

        // 持仓卖出时，根据持仓单独获取基金信息（getPubList接口无法获取仅持仓可见数据）
        if (this.holding && this.isRollOut) {
            await this.getHoldingList()
        } else {
            await this.getList()
        }
        this.initCheckBySymbol(this.symbol)
    },
    methods: {
        // 根据symbol 初始化选择
        initCheckBySymbol(v) {
            if (v) {
                const instance = this.list.find(item => item.symbol === v)
                if (instance) {
                    this.triggerItemHandler(instance, false)
                }
            } else {
                this.list.forEach(item => {
                    item.check = false
                })
                this.smartCheck = true
            }
        },
        async getList() {
            try {
                const param = {
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
                }
                if (this.isRollIn) {
                    param.buyable = PUB_LIST_FILTER_MAP.BUYABLE
                }
                const { result } = await getPubList(param)
                const list = result?.list || []
                this.list = list.map(item => {
                    return {
                        ...item,
                        check: false,
                    }
                })
            } catch (e) {
                console.log('choose-getPubList===>e:', e)
            }
        },
        async getHoldingList() {
            try {
                const holdings = await this.getSymbolHoldingAble()
                const { result } = await batchPubInfo({
                    symbols: holdings.map(el => el.productSymbol),
                })
                const pubInfoList = result?.list || []
                this.list = pubInfoList.map((el, index) => ({
                    ...(el || {}),
                    ...holdings[index],
                    check: false,
                }))
                console.error('🚀 ~liujinhao~ ~ this.list=res.map ~ this.list :', this.list)
            } catch (e) {
                console.log('getSymbolHoldingAble===>symbol-e:', e)
            }
        },
        async getSymbolHoldingAble() {
            const { result } = await HoldingsTradeableV3({
                mmf: 1,
            })
            const { holdings = [] } = result || {}
            holdings.forEach(item => {
                this.$set(this.sellAmountMap, item.productSymbol, { ...item })
            })
            return holdings
        },
        triggerSmartHandler() {
            if (!this.smartCheck) {
                this.smartCheck = true
                this.list.forEach(item => {
                    item.check = false
                })
                this.$emit('choose')
            }
        },
        triggerItemHandler(item, emit = true) {
            // 不可卖
            if (this.isRollOut && emit && !this.sellAmountMap[item.symbol]?.sellable) {
                this.$toast(this.$t('unsellableTip'))
                return
            }
            if (!item.check) {
                this.smartCheck = false
                this.list.forEach(i => {
                    i.check = false
                })
                item.check = true
                emit && this.$emit('choose', item)
            }
        },
    },
}
</script>
<style scoped lang="less">
.choose-product {
    width: 100%;
    height: 100%;
    padding: 12px;
    overflow: auto;
    background-color: #f9f9f9;

    .check-box {
        display: flex;
        align-items: center;

        &__icon {
            flex: 0 0 auto;

            img {
                width: 16px;
                height: 16px;
            }
        }

        &__label {
            flex: 1;
            margin-left: 12px;
        }
    }

    .smart {
        padding: 12px;
        background-color: #fff;
        border-radius: 8px;

        .smart-slogan {
            display: flex;
            flex-direction: column;
            margin-left: 12px;

            .slogan-top {
                display: flex;
                align-items: center;
                // justify-content: space-between;
                margin-bottom: 5px;

                p {
                    align-items: center;
                    color: @fontBlackColor;
                    font-weight: 500;
                    font-size: 16px;
                    line-height: 22px;
                }

                .slogan__commend {
                    height: 15px;
                    margin-left: 8px;
                    padding: 1px 8px;
                    color: #fff;
                    font-weight: 600;
                    font-size: 9px;
                    line-height: 13px;
                    background-image: linear-gradient(90deg, #ffab07 0%, #ff6b00 104.92%), linear-gradient(86.7deg, #44d2ff -19.89%, #278aff 101.62%),
                        linear-gradient(90deg, #ffab07 0%, #ff6b00 104.92%);
                    border-radius: 2px;

                    span {
                        display: inline-block;
                    }
                }
            }

            .slogan-bottom {
                color: @fontLightColor;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }
    }

    .list {
        margin-top: 12px;
        padding-left: 12px;
        background-color: #fff;
        border-radius: 8px;

        ul {
            li {
                padding: 16px 0;
                border-bottom: 0.5px solid #efefef;

                .check-box__icon {
                    display: flex;
                    align-items: center;
                    align-self: flex-start;
                    height: 22px;
                }

                .item-content {
                    display: flex;
                    flex-direction: column;

                    .top {
                        display: flex;
                        align-items: center;
                        max-width: 311px;
                        padding-right: 12px;

                        .fund-name {
                            padding-right: 5px;
                            color: @fontBlackColor;
                            font-weight: 400;
                            font-size: 16px;
                            line-height: 22px;
                        }

                        .currency {
                            flex: 0 0 auto;
                        }
                    }

                    .bottom {
                        display: flex;
                        align-items: center;
                        padding-top: 10px;

                        .left,
                        .right {
                            width: 50%;
                        }

                        .right {
                            &.not-holding {
                                display: flex;
                                align-items: center;
                                width: auto;
                                margin-top: -4px;

                                .top-text {
                                    margin-bottom: 0;
                                    font-weight: 500;
                                }

                                .bottom-text {
                                    margin-left: 8px;
                                }
                            }
                        }

                        .top-text {
                            margin-bottom: 2px;
                            color: @fontBlackColor;
                            font-weight: 400;
                            font-size: 14px;
                            line-height: 20px;
                        }

                        .bottom-text {
                            color: @fontGreyColor;
                            font-weight: 400;
                            font-size: 12px;
                            line-height: 16px;
                        }
                    }
                }

                &.disabled {
                    .fund-name,
                    .top-text {
                        color: @fontGreyColor !important;
                    }
                }
            }
        }
    }
}
</style>
