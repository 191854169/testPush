<template>
    <div class="asset-hold" v-show="!isLoading">
        <!-- 账户基本信息卡片 -->
        <div class="card account"></div>
        <account-card
            ref="accountCard"
            class="account-info"
            list
            :canJump="false"
            @assetsStatus="onAssetsStatus"
            :isProfessional="isProfessional"
            :inAccountHold="true"
            @on-doing-orderNum-change="onDoingOrderNumChange"
            @on-account-change="onAccountChange"
            @init-currency="initCurrency"
            @on-currency-change="onCurrencyChange"
        ></account-card>
        <!-- 功能展示 -->
        <feature-card :assetType="assetType" :haveDoingOrder="haveDoingOrder" :currency="currency"></feature-card>
        <!-- 我的持仓 -->
        <div class="holding">
            <div class="header">
                <h2 class="title">{{ isAlterInvestment ? $t('myHoldings1') : $t('myHoldings') }}{{ productList.length | textFilter }}</h2>
                <div v-if="showSort" class="sort-area">
                    <div class="content" @click="onTrigger">
                        <span class="text">{{ sortKey | sortTextFilter }}</span>
                        <multi-img name="down" directory="common"></multi-img>
                        <div class="dashed-border"></div>
                    </div>
                    <div class="sort-status" @click="onSort">
                        <img v-if="sort === 1" src="@/assets/images/common/sort-up__active.png" alt="up" />
                        <img v-else src="@/assets/images/common/sort-up.png" alt="up" />
                        <img v-if="sort === 2" src="@/assets/images/common/sort-down__active.png" alt="down" />
                        <img v-else src="@/assets/images/common/sort-down.png" alt="down" />
                    </div>
                </div>
            </div>
            <div class="holding-content">
                <div class="empty" v-if="!productList.length">
                    <multi-img name="noHold" directory="common"></multi-img>
                    <p class="text">{{ $t('noHold') }}</p>
                    <button class="view" @click.stop="goView">{{ $t('toView') }}</button>
                </div>
                <template v-else>
                    <div class="hold-products" @click="onHoldingContentClick">
                        <hold-card
                            v-for="(i, idx) in productList"
                            :key="idx"
                            :showBorder="idx + 1 !== productList.length"
                            :data="i"
                            :data-currency="i.productCurrency"
                            :data-symbol="i.symbol"
                            :data-billsymbol="i.productParentSymbol"
                            :showAmountStatus="!assetsStatus"
                            :assetType="assetType"
                            :showOrdering="true"
                        ></hold-card>
                    </div>
                </template>
                <div class="no-hold-products" @click.stop="goNoHoldProductPage" v-if="!!numOfCleanHoldings">
                    <span class="label">{{ $t('clearanceProduct') }}</span>
                    <span class="value">{{ numOfCleanHoldings }}{{ $t('zhi') }}</span>
                    <multi-img name="icon_right_arrow_16" directory="common"></multi-img>
                </div>
            </div>
            <fosun-popup
                v-model="showPopup"
                :columns="sortColumns"
                :typeKey="sortKey"
                @on-change="onSortChange"
                :title="$t('chooseSort')"
            ></fosun-popup>
        </div>

        <ProfitDesc></ProfitDesc>

        <van-dialog
            class="custom-dialog ecash-dialog"
            v-model="cashBoxDialog"
            :show-cancel-button="!cashBoxOpenStatus"
            :confirm-button-text="!!cashBoxOpenStatus ? $t('iGet') : $t('starBanner.open')"
            :cancel-button-text="$t('nextTalk')"
            @confirm="ecashConfirmHandler"
        >
            <template v-if="cashBoxOpenStatus">
                <header slot:title>
                    <p class="header-title">{{ $t('cashBox') }}</p>
                    <div class="header-desc">
                        <p>{{ $t('wealthProfessor') }}</p>
                    </div>
                </header>
                <div class="ecash-dialog__content">
                    <div class="text-part">
                        <p>{{ $t('ecashOpenDialog.suggestTransform') }}</p>
                        <p>{{ $t('ecashOpenDialog.suggest1') }}</p>
                        <p>{{ $t('ecashOpenDialog.suggest2') }}</p>
                    </div>
                    <p class="topic-part">{{ $t('ecashOpenDialog.tradeScene') }}</p>
                    <ul class="icon-list">
                        <li>
                            <multi-img name="stock-trade" directory="fund" />
                            <p>{{ $t('ecashOpenDialog.stockTrade') }}</p>
                        </li>
                        <li>
                            <multi-img name="repay" directory="fund" />
                            <p>{{ $t('ecashOpenDialog.repay') }}</p>
                        </li>
                        <li>
                            <multi-img name="IPO" directory="fund" />
                            <p>{{ $t('ecashOpenDialog.IPO') }}</p>
                        </li>
                    </ul>
                </div>
            </template>
            <template v-else>
                <header slot:title>
                    <p>{{ $t('openEcashService') }}</p>
                </header>
                <div class="ecash-dialog__content">
                    <div class="text-part">
                        <p>{{ $t('ecashOpenDialog.openSlogan1') }}</p>
                        <p>{{ $t('ecashOpenDialog.openSlogan2') }}</p>
                    </div>
                    <p class="topic-part">{{ $t('ecashOpenDialog.openSuggest') }}</p>
                    <div class="text-part">
                        <p>{{ $t('ecashOpenDialog.suggest1') }}</p>
                        <p>{{ $t('ecashOpenDialog.suggest2') }}</p>
                    </div>
                </div>
            </template>
        </van-dialog>
    </div>
</template>

<script>
import { Overlay } from 'vant'
import AccountCard from './components/AccountCard.vue'
import { getHoldings, getSwitchStatus } from '@/apis/wealth/index.js'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import { floatToRatio, addOrUpdateQuery } from '@/utils'
import { FUND_MODE_MAP, FUND_TYPE_MAP } from '@/views/fund/config/common'
import checkPIMixin from '@/mixins/business/checkPIMixin'
import HoldCard from './components/HoldCard.vue'
import FosunPopup from '@/components/FosunPopup.vue'
import { ASSET_TYPE_MAP } from './config/common'
import FeatureCard from './components/FeatureCard.vue'
import { i18n } from '@/i18n/fund'
import dayjs from 'dayjs'
import ProfitDesc from './components/ProfitDesc.vue'

const $t = text => i18n.t(text)
const fundModeKeysMap = FUND_MODE_MAP.keysMap
const fundTypeKeysMap = FUND_TYPE_MAP.keysMap
const assetTypeKeysMap = ASSET_TYPE_MAP.keysMap
const sortColumns = [
    {
        key: 1,
        label: $t('sortByAmount'),
        icon: '',
        directory: '',
        actualKey: 'assets',
    },
    {
        key: 2,
        label: $t('sortByYesterdayProfit'),
        icon: '',
        directory: '',
        actualKey: 'yesterdayProfitloss',
    },
    {
        key: 3,
        label: $t('sortByHoldingProfit'),
        icon: '',
        directory: '',
        actualKey: 'profitloss',
    },
    {
        key: 4,
        label: $t('sortByProfitRate'),
        icon: '',
        directory: '',
        actualKey: 'profitlossRate',
    },
]
const sortMap = {
    // 排序方式 1-升序 2-倒序
    asc: 1,
    desc: 2,
}

export default {
    name: 'asset-hold',
    components: {
        [Overlay.name]: Overlay,
        AccountCard,
        HoldCard,
        FosunPopup,
        FeatureCard,
        ProfitDesc,
    },
    filters: {
        floatToRatioFilter(v, rate) {
            return floatToRatio(v, { rate })
        },
        textFilter(v) {
            return v ? `(${v})` : ''
        },
        sortTextFilter(v) {
            const item = sortColumns.find(item => item.key === v)
            if (item) {
                return item.label
            }
            return '--'
        },
    },
    mixins: [riskAssessmentMixin, checkPIMixin],
    data() {
        return {
            isLoading: false,
            modeTypeMap: {
                [fundModeKeysMap.PUBLIC]: 'public',
                [fundModeKeysMap.PRIVATE]: 'private',
                [fundModeKeysMap.BOND]: 'bond',
                [fundModeKeysMap.BILL]: 'bill',
            },
            currency: 'HKD',
            assetsStatus: true,
            publicFund: 0, // 公募
            privateFund: 1, // 私募
            expandIndex: 0, // 展开的行数
            productList: [],
            sort: sortMap.desc, // 1-升序 2-倒序
            showPopup: false,
            sortKey: sortColumns[0].key, // 默认按持有金额
            numOfCleanHoldings: 0, // 零持仓产品
            sortColumns,
            sortMap,
            haveDoingOrder: false,
            account: this.$route.query.accountType || 'ALL',
            cashBoxOpenStatus: 1, // 开通状态(Number) 0-未开通，1-已开通
            cashBoxDialog: false,
            cashOpenSuggest: 'ASSET-CASH-OPEN-SUGGEST', // 资产页开通现金宝建议
            cashTransSuggest: 'ASSET-CASH-TRANS-SUGGEST', // 资产页货基转到现金宝建议
            publicSwitchStatus: {
                // 开关状态 (持有货基但未开通现金宝的弹窗)
                dialogHaveButNotOpenEcash: false, // 持有货基但未开通现金宝的弹窗：true 开启，false 关闭
                dialogHaveButNotOpenEcashInterval: 0, // 持有货基但未开通现金宝的弹窗间隔(自然日，单位：天)
            },
        }
    },
    computed: {
        assetType() {
            return this.$route.query.assetType
        },
        showSort() {
            return ['publicFund', 'privateFund'].includes(this.assetType)
        },
        isPublic() {
            return this.assetType === 'publicFund'
        },
        // 另类
        isAlterInvestment() {
            return this.assetType === 'alterInvestment'
        },
        // 是否有货基持仓
        haveCurrencyFund() {
            if (this.isPublic && this.productList.length) {
                return this.productList.some(item => item.fundType === fundTypeKeysMap.currency)
            }
            return false
        },
    },
    watch: {
        currency: {
            handler(v) {
                v && this.getHoldingsList()
            },
        },
    },
    created() {},
    async mounted() {
        if (this.$jsBridge) {
            this.$jsBridge?.enabelPageRefreshFunction()
            // TODO: 接口较慢暂时关闭返回刷新
            // this.$jsBridge?.watchPageVisible(this.initHolding)
        }
    },
    beforeRouteEnter(to, from, next) {
        next(vm => {
            vm.setTitle()
        })
    },
    methods: {
        initCurrency(currency) {
            this.currency = currency
            this.initHolding()
        },
        async getEcashUserStatus() {
            try {
                const result = await this.$store.dispatch('user/getEcashStatus')
                this.cashBoxOpenStatus = result?.openStatus || 0
            } catch (e) {
                console.error('ecashUserStatus===>e:', e)
            }
        },
        async initHolding() {
            this.isLoading = true
            this.$loading.show = true
            await this.getEcashUserStatus()
            await this.getHoldings()
            // 是否有货币基金持仓
            const hadCurrencyFund = this.productList.some(item => item.fundType === 4)
            if (this.isPublic && hadCurrencyFund) {
                // 公募判断是否旧货基持仓
                await this.getSwitchStatus()
                this.verifyCurrencyFundTrade()
            }
            this.isLoading = false
            this.$loading.show = false
        },
        onAssetsStatus(status) {
            this.assetsStatus = status
        },
        async getHoldings() {
            try {
                const params = {
                    assetsType: assetTypeKeysMap[this.assetType],
                    sortBy: this.sortKey,
                    sortWay: this.sort,
                    start: 0,
                    count: 999,
                    account: this.account,
                }
                console.log('getHoldings-->params:', params)
                let { result } = await getHoldings(params)
                result = result || {}
                const list = result.list || []
                this.productList = list
                this.numOfCleanHoldings = result?.numOfCleanHoldings || 0
            } catch (e) {
                console.log('getHoldings===>e:', e)
            }
        },

        onSort() {
            this.sort = this.sort === sortMap.asc ? sortMap.desc : sortMap.asc
            this.getHoldingsList()
            // this.sortByKey(this.sortKey, this.sort)
        },

        async getHoldingsList() {
            try {
                await this.getHoldings()
            } catch (e) {
                console.error(e)
            }
        },

        onTrigger() {
            this.showPopup = true
        },

        onSortChange(type) {
            if (type !== this.sortKey) {
                this.sortKey = Number(type)
                this.getHoldingsList()
                // 本地排序 - 如果需要实时收益率才需要后台排序
                // this.sortByKey(this.sortKey, this.sort)
            }
        },
        /**
         * @param {String} key 排序key
         * @param {String} sort 排序类型
         */
        sortByKey(key, sort) {
            this.productList.sort((a, b) => {
                const actualKey = sortColumns.find(i => i.key === key)?.actualKey
                const aValue = +a[actualKey]
                const bValue = +b[actualKey]
                // 升序
                if (sort === sortMap.asc) {
                    return aValue - bValue
                }
                // 降序
                if (sort === sortMap.desc) {
                    return bValue - aValue
                }
                return 0
            })
        },

        onHoldingContentClick(e) {
            try {
                const { symbol, billsymbol, currency } = e.target.dataset || {}
                console.warn('onHoldingContentClick - 1:', symbol, billsymbol, currency)
                if (!symbol) {
                    this.$toast({
                        message: this.$t('offlineOrderServer'),
                        className: 'offline-order-toast',
                    })
                    return
                }
                const query = {
                    assetType: this.$route.query.assetType,
                    symbol: encodeURIComponent(symbol),
                    currency: currency,
                }
                billsymbol && (query.billsymbol = billsymbol)
                this.$goPage('/product-detail-hold', query)
            } catch (e) {
                console.error(e)
            }
        },

        setTitle() {
            const { assetType } = this.$route.query
            const prefixTitle = this.$t(assetType)
            const title = prefixTitle + this.$t('assets')

            document.title = title
        },

        goNoHoldProductPage() {
            this.$goPage('/no-hold-product', {
                assetType: this.$route.query.assetType,
                accountType: this.account,
            })
        },

        onDoingOrderNumChange(v) {
            this.haveDoingOrder = v
        },

        onAccountChange({ value } = {}) {
            this.account = value
            addOrUpdateQuery('accountType', value)
            this.getHoldings()
        },

        goView() {
            try {
                const type = this.$route.query.assetType
                if (!type) return
                const exec = {
                    publicFund: () => {
                        // 跳转到基金列表页（全部）
                        this.$goPage('/list', {
                            activeTab: 'all',
                        })
                    },
                    privateFund: () => {
                        // 跳转到私募列表页
                        this.$goPage('/private-list')
                    },
                    bond: () => {
                        // 跳转到债券列表页
                        this.$goPage('/bond')
                    },
                    alterInvestment: () => {
                        // 跳转到票据列表页
                        this.$goPage('/invest-product/alter-investments')
                    },
                }

                exec[type] && exec[type]()
            } catch (e) {
                console.error(e)
            }
        },

        // 开关状态 (持有货基但未开通现金宝的弹窗)
        async getSwitchStatus() {
            try {
                const { result = {} } = await getSwitchStatus()
                this.publicSwitchStatus = result
                console.warn('getSwitchStatus-result:', result)
            } catch (e) {
                console.log('getSwitchStatus===>e:', e)
            }
        },

        // 持有货基现金宝相关提醒
        async verifyCurrencyFundTrade() {
            // 持有货基但未开通现金宝的弹窗
            if (!this.publicSwitchStatus.dialogHaveButNotOpenEcash) return
            // 时间间隙
            const intervalDay = this.publicSwitchStatus.dialogHaveButNotOpenEcashInterval ?? 0
            const key = this.cashBoxOpenStatus ? this.cashTransSuggest : this.cashOpenSuggest
            const time = await this.getCashCache(key)
            console.log('key-time:', key, time)
            if (!time) {
                this.cashBoxDialog = true
                this.setCashCache(key, String(new Date().valueOf()))
            } else {
                // 判断缓存时间是否超过7天, 超过7天才显示
                const beforeSeven = dayjs().subtract(intervalDay, 'day')
                if (beforeSeven.valueOf() > Number(time)) {
                    this.cashBoxDialog = true
                    this.setCashCache(key, String(new Date().valueOf()))
                }
            }
        },

        /**
         * @name 设置缓存时间
         * @param {String} key
         * @param {String} times
         */
        setCashCache(key, times) {
            if (this.$jsBridge) {
                this.$jsBridge.writeLocalStorage(key, times)
            } else {
                return localStorage.setItem(key, times)
            }
        },
        // 获取缓存时间
        async getCashCache(key) {
            if (this.$jsBridge) {
                const cache = await this.$jsBridge.readLocalStorage(key)
                return cache?.value ?? ''
            }
            return localStorage.getItem(key)
        },

        // 确认dialog 跳转开通现金宝
        ecashConfirmHandler() {
            if (!this.cashBoxOpenStatus) {
                // 未开通前往开通现金宝
                this.$goPage(
                    '/beforeSign',
                    {},
                    {
                        pathname: '/wealth/cashBox.html',
                    }
                )
            }
        },
        onCurrencyChange(v) {
            this.currency = v
        },
    },
}
</script>

<style lang="less">
html {
    background: #f9f9f9;
}

.offline-order-toast {
    width: 284px;
    max-width: 284px;
}
</style>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');
@black: #1f1f1f;
@white: #fff;

.asset-hold {
    padding-bottom: 20px;
    overflow: auto;
    background: #f9f9f9;

    .card {
        margin-top: 12px;
        background: @white;
        border-radius: 8px;
    }

    .mask {
        position: relative;

        &::after {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1;
            display: block;
            content: '';
        }
    }

    .features {
        margin-right: 12px;
        margin-left: 12px;

        &-list {
            display: flex;
            justify-content: space-between;
            height: 80px;
            padding: 16px 0;

            &-item {
                position: relative;
                flex: 1 1 auto;
                text-align: center;

                .icon {
                    width: 24px;
                }

                h4 {
                    position: absolute;
                    // 设置居中
                    left: 50%;
                    margin-top: 8px;
                    color: #1f1f1f;
                    font-size: 12px;
                    line-height: 16px;
                    word-break: keep-all;
                    transform: translateX(-50%);
                }
            }
        }
    }

    .holding {
        margin: 12px;

        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 20px 0 4px;

            .title {
                padding: 7px 0;
                color: @fontBlackColor;
                font-weight: 500;
                font-size: 16px;
                line-height: 22px;
            }

            .sort-area {
                display: flex;
                align-items: center;

                .content {
                    position: relative;
                    display: flex;
                    align-items: center;
                    margin-right: 12px;

                    .dashed-border {
                        width: 0;
                        height: 14px;
                        border-right: 1px dashed #9c9c9c;
                        transform: scaleX(0.5);
                    }

                    .text {
                        color: @fontLightColor;
                        font-size: 14px;
                        line-height: 20px;
                    }

                    img {
                        width: 12px;
                        margin: 0 12px 0 4px;
                    }
                }

                .sort-status {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: space-between;
                    width: 10px;
                    height: 10px;

                    img {
                        position: relative;
                        width: 5px;
                        font-size: 0;

                        &::after {
                            position: absolute;
                            inset: -5px 0 0 -5px;
                            content: '';
                        }

                        &:last-child {
                            margin-top: 2px;

                            &::after {
                                top: 0;
                                bottom: -5px;
                            }
                        }

                        img {
                            width: 100%;
                        }
                    }
                }
            }
        }

        .no-border {
            &::after {
                display: none;
            }
        }

        .holding-content {
            overflow: hidden;
            border-radius: 8px;
        }

        .empty {
            padding: 40px 0;
            font-size: 0;
            text-align: center;
            background: @white;
            border-radius: 8px;

            img {
                width: 104px;
                height: 104px;
            }

            .text {
                margin-top: 12px;
                color: @fontGreyColor;
                font-size: 12px;
                line-height: 16px;
            }

            .view {
                width: 96px;
                margin-top: 16px;
                color: @theme;
                font-size: 14px;
                line-height: 32px;
                text-align: center;
                background: rgba(255, 105, 7, 0.07);
                border: none;
                border-radius: 32px;
            }
        }

        .hold-products {
            overflow: hidden;
            border-radius: 8px;
        }

        .no-hold-products {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 52px;
            margin-top: 12px;
            padding: 0 12px;
            background: @white;
            border-radius: 8px;

            .label {
                flex: 1 0 auto;
                color: @fontBlackColor;
                font-size: 16px;
                line-height: 22px;
            }

            .value {
                color: @fontGreyColor;
                font-size: 14px;
                line-height: 16px;
            }

            img {
                width: 16px;
                margin-left: 2px;
            }
        }
    }

    .ecash-dialog {
        header {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 17px 16px;

            .header-title {
                color: #1f1f1f;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }

            .header-desc {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                margin-top: 2px;
                color: @fontLightColor;
                font-weight: 400;
                font-size: 13px;
                line-height: 22px;
                text-align: center;

                p {
                    z-index: 2;
                    padding: 0 8px;
                    background-color: @white;
                }

                &::before {
                    position: absolute;
                    top: 50%;
                    width: 100%;
                    height: 0;
                    border-top: 0.5px solid #eaeaea;
                    content: '';
                }
            }
        }

        .ecash-dialog__content {
            padding: 0 16px 28px;

            .text-part {
                color: @fontBlackColor;
                font-weight: 400;
                font-size: 14px;
                line-height: 22px;
            }

            .topic-part {
                padding-top: 14px;
                color: #1f1f1f;
                font-weight: 700;
                font-size: 14px;
                line-height: 22px;
            }

            .icon-list {
                display: flex;
                align-items: center;
                justify-content: center;
                padding-top: 12px;

                li {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 93px;
                    padding: 7px 0 3px;

                    img {
                        width: 28px;
                        height: 28px;
                    }

                    p {
                        margin-top: 6px;
                        color: @fontBlackColor;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;
                    }
                }
            }
        }
    }
}
</style>
