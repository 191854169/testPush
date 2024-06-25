// 跟投调仓页面
<template>
    <div class="rebalancing_page">
        <div v-if="isInAPP">
            <navigation-bar @back="goBack"></navigation-bar>
        </div>
        <div class="fixed_area border-bottom-1px" ref="fixedAreaRef">
            <assetDistributionPct class="asset_dist" :pctList="pctList"></assetDistributionPct>
        </div>
        <!-- 占位 -->
        <div :style="{ height: `${fixedAreaHeight}px` }"></div>

        <div class="group_container" v-for="(item, index) in holdList" :key="index">
            <div class="group_title">
                {{ item.marketType | marketFilter(isFund) }}
                <div class="group_ratio">{{ ratioMap[item.marketType] }}{{ '%' }}</div>
            </div>
            <div class="item_container" v-for="stock in item.holding" :key="stock.productCode">
                <portfolioStockInfoItem
                    :ref="stock.productCode"
                    :obj="stock"
                    :max="maxRatio"
                    @delete="deleteItme(stock)"
                    @changing="changingItmeRatio"
                ></portfolioStockInfoItem>
            </div>
            <div class="space" v-if="index != holdList.length - 1"></div>
        </div>
        <div v-if="showChangingPopup" class="sheetPlaceholder"></div>
        <div class="bottom_tool" ref="toolAreaRef">
            <div class="btn done" @click="onDoneClick">{{ $t('complete') }}</div>
            <div class="btn add" @click="showAddStock = true">
                <multi-img class="icon" name="icon_add_bold" directory="common"></multi-img>
                {{ $t(isFund ? 'rebalancing.addFund' : 'rebalancing.addStock') }}
            </div>
        </div>
        <!-- 占位 -->
        <div :style="{ height: `${toolAreaHeight}px` }"></div>
        <addStock
            v-model="showAddStock"
            :type="isFund ? 'fund' : 'stock'"
            :currency="obj.currency"
            :selectedList="selectedList"
            @confirm="confirmAddStock"
        ></addStock>
        <changingRatioPopup
            ref="popupRef"
            v-model="showChangingPopup"
            :max="maxRatio"
            :defaultValue="defaultValue"
            @confirm="confirmChanging"
            :min="0"
        />
    </div>
</template>
<script>
import assetDistributionPct from './components/assetDistributionPct'
import portfolioStockInfoItem from './components/portfolioStockInfoItem.vue'
import NavigationBar from '@/components/NavigationBar.vue'
import addStock from './components/addStock/addStock.vue'
import changingRatioPopup from './components/changingRatioPopup.vue'
import basicInfoMixin from './mixins/basicInfoMixin'
import portfolioAddProductMixin from './mixins/portfolioAddProductMixin'

import { isEmpty } from '../../../utils'
import { PORTFOLIO_TYPE_MAP, FUND_TYPE_MAP } from '../config/common'
import { i18n } from '@/i18n/fund/index.js'
import { floatToRatio } from '@/utils'
import NP from 'number-precision'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'

import { PortfolioHoldingAllocation, portfolioRebalance } from '@/apis/followInvest/index.js'

export default {
    name: 'rebalancingPage',
    components: {
        assetDistributionPct,
        portfolioStockInfoItem,
        addStock,
        changingRatioPopup,
        NavigationBar,
    },
    mixins: [basicInfoMixin, portfolioAddProductMixin, platformDifferenceMixin],
    data() {
        return {
            fixedAreaHeight: 0,
            toolAreaHeight: 0,
            portfolioType: PORTFOLIO_TYPE_MAP.keysMap.HK_STOCK,
            ratioMap: {},
            holdList: [],
            itemChanging: {},
            cashValue: 0,
            hasAnyChange: false,
            backNoAlert: false, // 发生281501错误时,用户返回不二次确认
            showAddStock: false,
            showChangingPopup: false,
            maxRatio: 0,
            defaultValue: 0,
            keySort: [],
            oldScrollTop: 0,
            snapshotId: '',
        }
    },
    filters: {
        marketFilter(i, isFund) {
            if (isFund) {
                return ['', i18n.t('stockType'), i18n.t('bondType'), i18n.t('mixedType'), i18n.t('currencyType'), i18n.t('stockRightType')][i] || '--'
            }
            return ['', i18n.t('HKDMarket'), i18n.t('USDMarket'), ''][i] || '--'
        },
    },
    computed: {
        pctList() {
            let list = []
            if (this.isFund) {
                list = [
                    {
                        key: 'stockFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.stock] || 0,
                        label: this.$t('stockType'),
                        groupID: FUND_TYPE_MAP.keysMap.stock,
                    },
                    {
                        key: 'bondFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.bond] || 0,
                        label: this.$t('bondType'),
                        groupID: FUND_TYPE_MAP.keysMap.bond,
                    },
                    {
                        key: 'mixtureFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.mixed] || 0,
                        label: this.$t('mixedType'),
                        groupID: FUND_TYPE_MAP.keysMap.mixed,
                    },
                    {
                        key: 'moneyFund',
                        pct: this.ratioMap[FUND_TYPE_MAP.keysMap.currency] || 0,
                        label: this.$t('currencyType'),
                        groupID: FUND_TYPE_MAP.keysMap.currency,
                    },
                ]
            } else {
                list = [
                    {
                        key: 'hkStock',
                        pct: this.ratioMap[1] || 0,
                        label: this.$t('HKDMarket'),
                        groupID: 1,
                    },
                    {
                        key: 'usStock',
                        pct: this.ratioMap[2] || 0,
                        label: this.$t('USDMarket'),
                        groupID: 2,
                    },
                ]
            }

            const real = []
            this.holdList.forEach(group => {
                real.push(
                    list.find(e => {
                        return group.marketType == e.groupID
                    })
                )
            })

            real.unshift({
                key: 'cash',
                pct: this.cashValue,
                label: this.$t('cash'),
            })
            return real
        },
        selectedList() {
            const list = []
            this.holdList?.forEach(item => {
                item.holding?.forEach(citem => {
                    const param = {
                        check: true,
                        cancelable: Number(citem.ratio) === 0,
                        mkt: citem.market,
                        name: citem.name,
                    }
                    if (this.isFund) {
                        param.ISIN = citem.productCode
                        param.currency = citem.currency
                        param.fundType = citem.industryCode
                    }
                    if (citem.RawSymbol) {
                        param.rawSymbol = citem.RawSymbol
                    }
                    if (citem.rawSymbol) {
                        param.rawSymbol = citem.rawSymbol
                    }

                    list.push(param)
                })
            })
            return list
        },
    },
    created() {
        this.getData()
        this.getHoldList()
    },
    mounted() {
        this.fixedAreaChangeHeight()
    },
    watch: {
        showChangingPopup: {
            handler(nv, ov) {
                if (nv != ov && ov) {
                    this.endChanging()
                }
            },
        },
    },
    methods: {
        async getHoldList() {
            try {
                const data = await PortfolioHoldingAllocation({
                    id: Number(this.$route.query.portfolioId),
                    queryType: 1,
                    createSnapshot: 1,
                })
                const { detail, snapshotId } = data.result
                this.portfolioType = detail?.portfolioType || this.portfolioType
                this.isFund = this.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
                this.snapshotId = snapshotId || ''
                if (this.isFund) {
                    this.holdList = detail && detail.holding
                    this.holdList.forEach(item => {
                        item.holding = item.industryHolding
                        item.marketType = item.industryCode
                    })
                } else {
                    this.holdList = detail && detail.marketHolding
                }

                this.updateGroupRatio()
                this.fixedAreaChangeHeight()
                console.log('data===>detail', snapshotId, this.holdList)
            } catch (e) {
                console.error('error', e)
            }
        },
        async portfolioRebalance(holdings) {
            const param = {
                portfolioId: Number(this.$route.query.portfolioId),
                holdings: holdings,
                snapshotId: this.snapshotId,
            }
            console.log(`portfolioRebalance param `, param)
            try {
                this.$loading.show = true
                const data = await portfolioRebalance(param)
                if (isEmpty(data.result)) {
                    this.$toast.success({
                        message: this.$t('rebalancing.success'),
                        forbidClick: true,
                        duration: 1000,
                        onClose: () => {
                            this.backPreviousPage()
                        },
                    })
                }
            } catch (error) {
                console.error(error?.error)
                if (error?.error?.code == 281501) {
                    this.backNoAlert = true
                    this.$toast(this.$t('rebalancing.changedRatioError'))
                } else {
                    this.$toast(this.$t('rebalancing.rebalancingFailed'))
                }
            } finally {
                this.$loading.show = false
            }
        },
        onDoneClick() {
            const holdings = []
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    const zero = parseFloat(citem.ratio) === 0
                    if (!zero) {
                        //持仓修改为0按删除处理
                        holdings.push({
                            productCode: citem.productCode,
                            productType: citem.productType,
                            ratio: citem.ratio,
                        })
                    }
                })
            })

            if (holdings.length == 0) {
                this.$toast(this.$t('rebalancing.minimumError'))
                return
            }
            this.portfolioRebalance(holdings)
        },
        isEmpty,
        confirmAddStock(list) {
            this.handleAddProduct(list)
            this.updateGroupRatio()
            this.fixedAreaChangeHeight()
        },
        deleteItme(deleteItem) {
            this.holdList.forEach(item => {
                const index = item.holding.findIndex(e => {
                    return e.productCode == deleteItem.productCode
                })
                if (index >= 0) {
                    item.holding.splice(index, 1)
                    this.hasAnyChange = true
                }
            })
            // 过滤没有股票的分组
            this.holdList = this.holdList.filter(item => {
                return !isEmpty(item.holding)
            })
            this.updateGroupRatio()
            this.fixedAreaChangeHeight()
        },
        changingItmeRatio(info) {
            const value = NP.plus(this.cashValue, info.ratio)
            if (value < 1) {
                this.$toast(this.$t('rebalancing.noCash'))
                return
            }

            if (this.itemChanging.productCode == info.productCode) {
                this.endChanging()
                return
            }

            this.itemChanging = info
            // 计算
            this.maxRatio = Math.floor(Number(NP.plus(info.ratio, this.cashValue)))
            this.defaultValue = Math.floor(Number(info.ratio))
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    citem.changingRatio = info.productCode === citem.productCode
                })
            })
            this.showChangingPopup = true
            this.refresh()

            /// 当前滚动的高度
            this.oldScrollTop = window.pageYOffset
            const [itemRef] = this.$refs[`${info.productCode}`]
            const itemTop = itemRef.$el.getBoundingClientRect().bottom
            const deviceHeight = document.body.clientHeight
            window.setTimeout(() => {
                const popupHeight = this.$refs.popupRef.$el.clientHeight + 24
                if (deviceHeight - itemTop < popupHeight) {
                    window.scrollTo(0, this.oldScrollTop + popupHeight - (deviceHeight - itemTop))
                }
            }, 100)
        },
        endChanging() {
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    citem.changingRatio = false
                })
            })
            this.showChangingPopup = false
            this.itemChanging = {}
            window.setTimeout(() => {
                window.scrollTo(0, this.oldScrollTop)
            }, 100)
        },
        confirmChanging(newRatio) {
            if (newRatio === 0) {
                this.$dialog
                    .confirm({
                        title: this.$t('prompt'),
                        message: this.$t('follow.rebalancingZeroHint'),
                        cancelButtonText: this.$t('cancel'),
                        confirmButtonText: this.$t('confirm'),
                        messageAlign: 'left',
                    })
                    .then(() => {
                        this.doChangeRatio(newRatio)
                    })
            } else {
                this.doChangeRatio(newRatio)
            }
        },
        doChangeRatio(newRatio) {
            this.holdList.forEach(item => {
                item.holding.forEach(citem => {
                    if (this.itemChanging.productCode === citem.productCode) {
                        this.hasAnyChange = citem.ratio != newRatio
                        citem.ratio = newRatio
                        citem.ratio_error = false
                    }
                })
            })
            this.endChanging()
            this.updateGroupRatio()
            this.fixedAreaChangeHeight()
        },
        groupRatio(item) {
            let total = 0
            item.holding?.forEach(citem => {
                total = NP.plus(citem.ratio, total)
            })
            return total
        },
        updateGroupRatio() {
            let total = 0
            this.ratioMap = {}
            this.holdList?.forEach(item => {
                const ratio = this.groupRatio(item)
                this.ratioMap[item.marketType] = floatToRatio(ratio, { rate: false, sign: false })
                total = NP.plus(ratio, total)
            })
            this.cashValue = 100 - total
        },
        fixedAreaChangeHeight() {
            this.$nextTick(() => {
                this.fixedAreaHeight = this.$refs.fixedAreaRef?.scrollHeight || 0
                this.toolAreaHeight = this.$refs.toolAreaRef?.scrollHeight || 0
            })
        },
        goBack() {
            if (this.hasAnyChange && !this.backNoAlert) {
                this.$titleDialog
                    .show({
                        title: this.$t('rebalancing.abandon'),
                    })
                    .then(() => {
                        this.backPreviousPage()
                    })
                    .catch(() => {})
            } else {
                this.backPreviousPage()
            }
        },
        refresh() {
            this.holdList = JSON.parse(JSON.stringify(this.holdList))
        },
    },
}
</script>
<style scoped lang="less">
.navi_bar {
    position: fixed;
    left: 0;
    z-index: 2000;
    font-weight: bold;
    font-size: 16px;
    background: #fff;
}

.rebalancing_page {
    position: relative;
    height: 100%;
    background: #fff;
}

.fixed_area {
    position: fixed;
    z-index: 100;
    width: 100vw;
    margin: 0;
    padding: 0 16px;
    background: #fff;

    .asset_dist {
        padding: 12px 0;
    }
}

.group_container {
    position: relative;
    padding: 12px 16px 0;
    background: #fff;

    .group_title {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 16px;
        line-height: 38px;
    }

    .item_container {
        height: 56px;
    }

    .space {
        height: 8px;
        margin: 0 -16px;
        background: #f9f9f9;
    }
}

.sheetPlaceholder {
    height: 400px;
    background: #fff;
}

.bottom_tool {
    position: fixed;
    bottom: 0;
    display: flex;
    width: 100%;
    padding-bottom: 34px;
    background: #fff;

    .btn {
        display: flex;
        align-items: center; // 上下居中
        justify-content: center;
        height: 44px;
        margin-top: 8px;
        margin-bottom: 4px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
        letter-spacing: 0;
        text-align: center;
        border-radius: 22px;
    }

    .add {
        flex-shrink: 3;
        width: 100%;
        margin-right: 28px;
        margin-left: 12px;
        color: #fff;
        background: #ff6907;

        .icon {
            width: 16px;
            height: 16px;
            margin-right: 4px;
        }
    }

    .done {
        flex-shrink: 0;
        width: 110px;
        margin-left: 28px;
        text-align: center;
        #border_all_1px(#9c9c9c, 22px);
    }
}
</style>
