<template>
    <div class="details" :class="{ noScroll: show }">
        <div class="selectBox" @click="showSelect">
            <div class="asset-type mask" data-type="asset">
                <div class="left">{{ assetType | assetTypeFilter }}</div>
                <multi-img v-if="!isInMyLink" :name="'drop-down-solid'" directory="common" class="icon"></multi-img>
            </div>
            <div class="account-type mask" data-type="account">
                <div class="left">{{ accountType | accountTypeFilter }}</div>
                <multi-img :name="'drop-down-solid'" directory="common" class="icon"></multi-img>
            </div>
            <div class="date-range mask" data-type="date">
                <div class="left">{{ dateText }}</div>
                <multi-img :name="'drop-down-solid'" directory="common" class="icon"></multi-img>
            </div>
        </div>
        <div class="hide" v-show="show" @click="show = false"></div>
        <div class="total">
            <h4>
                <currency-choose v-model="showCurrencyChoose" :default-currency="currency" @on-currency-chage="onCurrencyChange">
                    <span slot="prefix">{{ $t('profitLossAmount') }}({{ totalProfitLoss.currency | currencyFilter }})</span>
                    <multi-img slot="suffix" :name="iconEye" directory="fund" @click.stop="onHideAmountClick"></multi-img>
                </currency-choose>
            </h4>
            <h3>
                <span
                    v-riseFall="{
                        value: totalProfitLoss.amount,
                        rate: false,
                        thousand: true,
                        hide: !amountStatus,
                        hideObj: { text: '*****', color: '#2f2f2f' },
                    }"
                ></span>
            </h3>
            <h5 class="summary-date-range">{{ `${$t('staticDate')}${startDate}-${endDate}` }}</h5>
        </div>
        <div class="list">
            <div class="title">
                <div class="left">{{ $t('shouyijilu') }}</div>
            </div>
            <empty v-show="!list.length" showImg></empty>
            <Table
                v-show="list.length"
                ref="table"
                :data="list"
                :columns="columns"
                @refresh="refresh"
                @pullUpLoad="getList"
                :canPullUp="canPullUp"
                :showLoadingOver="false"
                :showEmptyTip="true"
                border
                @sort="onSort"
            >
                <template v-slot:detail="{ item }">
                    <div class="detail">
                        <div class="top">
                            <div class="name line-elipsis">{{ item.productName }}</div>
                        </div>
                        <div class="bottom">
                            <div :class="`currency-${item.productCurrency}`"></div>
                            <div class="isin">{{ item.isin }}</div>
                        </div>
                    </div>
                </template>
                <template v-slot:profitloss="{ item }">
                    <div v-riseFall="{ value: item.profitloss, rate: false, thousand: true, hide: !amountStatus }"></div>
                </template>
                <template v-slot:profitlossRate="{ item }">
                    <div v-riseFall="{ value: item.profitlossRate || '--', thousand: true, hide: !amountStatus }"></div>
                </template>
            </Table>
        </div>

        <account-choose v-model="showAccountChoose" :type="accountType" @choose="onAccountChoose"></account-choose>
        <asset-types v-model="showAssetType" isAssetType :typeKey="assetType" @on-change="onAssetTypeChange"></asset-types>
        <date-picker
            ref="datePickerRef"
            :i18n="$t"
            :init-range-start="$route.query.startDate"
            :init-range-end="$route.query.endDate"
            :initial-shortcuts="dateType"
            @on-change="onDateChange"
        ></date-picker>
    </div>
</template>
<script>
import { getProfitLossDetail } from '@/apis/wealth/index.js'
import * as dayjs from 'dayjs'
import Table from '@/components/Table.vue'
import AccountChoose from '@/components/AccountChoose.vue'
import AssetTypes from '@/components/AssetTypes.vue'
import { WEALTH_ACCOUNT_MAP, WEALTH_AMOUNT_STATUS_kEY } from '@/config/common'
import DatePicker from '@/components/DatePicker/Index.vue'
import Empty from '@/components/Empty.vue'
import { ASSET_TYPE_MAP, CURRENCY_MAP } from '@/views/fund/config/common'
import CurrencyChoose from '@/components/CurrencyChoose.vue'
import { throttle } from 'lodash'
import { isInOutsideH5 } from '@/utils'
import { mapState } from 'vuex'

const currencyFilter = v => {
    return CURRENCY_MAP.options.findLabel(v, '--')
}
const sortWayMap = {
    // 排序方式：1-升序, 2-倒序
    asc: 1,
    desc: 2,
}
const sortByMap = {
    // 排序字段： 1-收益 2-收益率
    profitloss: 1,
    profitlossRate: 2,
}
export default {
    components: { Table, AssetTypes, AccountChoose, DatePicker, Empty, CurrencyChoose },
    data() {
        return {
            loading: false,
            finished: false,
            show: false,
            list: [],
            totalProfitLoss: { amount: '', currency: '' },
            getList: throttle(this.getListHandler, 800, { leading: false, trailing: true }),
            hasInit: false,
            accountType: this.$route.query.accountType || WEALTH_ACCOUNT_MAP.keysMap.allAccount,
            assetType: this.$route.query.assetType || ASSET_TYPE_MAP.keysMap.ALL,
            showDate: false,
            showAccountChoose: false,
            showAssetType: false,
            amountStatus: true, // true - 展示资金内容 false - 隐藏资金内容
            amountStatusKey: WEALTH_AMOUNT_STATUS_kEY,
            startDate: '',
            endDate: '',
            sortWay: 'desc',
            sortBy: 'profitloss',
            currentPage: 1,
            pageSize: 10,
            canPullUp: true,
            currency: CURRENCY_MAP.keysMap.HKD,
            showCurrencyChoose: false,
            dateText: '',
            isInMyLink: this.$mylinkJsbridge.isInMylink(),
        }
    },
    computed: {
        columns() {
            return [
                {
                    key: 'detail',
                    title: this.$t('product'),
                    slot: true,
                },
                {
                    key: 'profitloss',
                    title: `${this.$t('rangeProfit')}`,
                    slot: true,
                    sort: true,
                },
                // {
                //     key: 'profitlossRate',
                //     title: this.$t('rangeProfitRate'),
                //     slot: true,
                //     sort: true,
                // },
            ]
        },
        iconEye() {
            return this.amountStatus ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },

        dateType() {
            return this.$route.query.dateType ? +this.$route.query.dateType : undefined
        },
        ...mapState('user', ['showAsset']),
    },
    filters: {
        assetTypeFilter(v) {
            return ASSET_TYPE_MAP.options.findLabel(v, '--')
        },

        accountTypeFilter(v) {
            console.log(`Feng.chen:: 16:16:50 v ===> `, v)
            return WEALTH_ACCOUNT_MAP.options.findLabel(v, '--')
        },
        currencyFilter,
    },
    created() {
        this.currency =
            this.accountType === WEALTH_ACCOUNT_MAP.keysMap.allAccount ? this.$route.query.currency || CURRENCY_MAP.keysMap.HKD : this.accountType
        if (isInOutsideH5()) this.currency = this.$route.query.currency || CURRENCY_MAP.keysMap.HKD
    },
    mounted() {
        this.setAmountStatus()
        this.assetType = ASSET_TYPE_MAP.keysMap[this.$route.query.assetType] || ASSET_TYPE_MAP.keysMap.all
        this.getList()
        this.$nextTick(() => {
            const table = this.$refs.table
            if (table) {
                table.setSortMap(this.sortBy, this.sortWay)
            }
        })
    },
    methods: {
        async setAmountStatus() {
            if (this.$jsBridge) {
                const data = await this.$jsBridge.getAssetsShowStatus()
                this.amountStatus = data
            } else if (isInOutsideH5()) {
                this.amountStatus = this.showAsset
            } else {
                try {
                    this.amountStatus = JSON.parse(localStorage.getItem(this.amountStatusKey))
                } catch (e) {
                    this.amountStatus = true
                    localStorage.setItem(this.amountStatusKey, JSON.stringify(this.amountStatus))
                }
            }
        },
        formateDay(date) {
            return dayjs(date).format('YYYY/MM/DD')
        },
        showSelect(e, data) {
            try {
                const { type } = e.target.dataset || {}
                if (!type) return
                if (type === 'asset' && this.isInMyLink) return // mylink只展示星财宝，无需显示弹出下拉框
                const methodName = `${type}Selector`
                this[methodName] && this[methodName](data)
            } catch (e) {
                console.error(e)
            }
        },
        assetSelector() {
            this.showAssetType = true
        },
        accountSelector() {
            this.showAccountChoose = true
        },
        dateSelector() {
            this.$refs.datePickerRef.show()
        },
        async getListHandler(cb, refresh = false) {
            try {
                this.$store.commit('app/updateShowLoading', true)
                const dateFilter = (v = '') => v.replace(/\//g, '-')
                const count = this.pageSize
                const start = (this.currentPage - 1) * this.pageSize
                const params = {
                    start,
                    count,
                    toCurrency: this.currency,
                    account: this.accountType,
                    assetsType: this.assetType === 'all' ? undefined : this.assetType,
                    startDate: dateFilter(this.startDate),
                    endDate: dateFilter(this.endDate),
                    sortWay: sortWayMap[this.sortWay],
                    sortBy: sortByMap[this.sortBy],
                }
                console.log('getProfitLossDetail===>params:', params)
                let { result: res } = await getProfitLossDetail(params)
                res = res || {}
                this.$store.commit('app/updateShowLoading', false)
                Object.assign(this.totalProfitLoss, { amount: res?.profitlossSum || '--', currency: res?.currency })
                const list = res.list || []
                if (refresh) {
                    // 是否刷新
                    this.list = []
                }
                this.list = this.list.concat(list)
                if (list.length < this.pageSize || this.list.length >= res.total) {
                    this.canPullUp = false
                } else {
                    this.canPullUp = true
                    this.currentPage += 1
                }
                this.hasInit = true
                cb && cb()
            } catch (e) {
                console.error('error ===> ', e)
                this.canPullUp = false
                this.hasInit = true
                this.$store.commit('app/updateShowLoading', false)
            }
        },
        refresh() {
            this.currentPage = 1
            this.pageSize = 10
            this.getList(null, true)
        },

        onAccountChoose(value) {
            this.accountType = value
            this.refresh()
        },

        onAssetTypeChange(value) {
            this.assetType = value
            this.refresh()
        },

        onDateChange(data) {
            console.log(`Feng.chen:: 14:33:42 data ===> `, data)
            this.startDate = data?.rangeStart
            this.endDate = data?.rangeEnd
            this.dateText = data?.label || this.$t('customDate')
            this.refresh()
        },

        onHideAmountClick() {
            this.amountStatus = !this.amountStatus
            if (this.$jsBridge) {
                this.$jsBridge.setAssetsShowStatus({ showAssets: this.amountStatus })
            } else if (isInOutsideH5()) {
                this.$store.commit('user/updateShowAsset', !this.showAsset)
            } else {
                localStorage.setItem(this.amountStatusKey, JSON.stringify(this.amountStatus))
            }
        },

        onSort(key, sortWay) {
            this.sortBy = key
            this.sortWay = sortWay
            this.refresh()
        },

        onCurrencyChange(currency) {
            this.list = []
            this.currency = currency
            this.currentPage = 1
            this.getList()
        },
    },
}
</script>
<style lang="less">
// body {
//     background: #f9f9f9;
// }
</style>
<style scoped lang="less">
.details {
    padding-bottom: 12px;
    background: #f9f9f9;

    header {
        height: 48px;
        color: #666;
        line-height: 48px;
        text-align: center;
    }

    .selectBox {
        position: relative;
        z-index: 100;
        display: flex;
        padding: 8px 0;
        background: #fff;

        & > div {
            display: flex;
            flex: 0 0 calc(100% / 3);
            align-items: center;
            justify-content: center;
        }

        .left {
            color: @fontBlackColor;
            font-size: 14px;
            line-height: 20px;
        }

        .icon {
            width: 12px;
            height: 12px;
            margin-left: 2px;
        }
    }

    .hide {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1000;
        background: #000;
        opacity: 0.3;
    }

    .total {
        margin: 12px;
        padding: 16px 0;
        text-align: center;
        background: #fff;
        border-radius: 8px;

        h4 {
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;

            img {
                width: 16px;
                height: 16px;
                margin-left: 16px;
            }
        }

        h3 {
            margin: 0;
            margin-top: 4px;
            color: #000;
            font-weight: 700;
            font-size: 24px;
            line-height: 34px;
        }

        .summary-date-range {
            margin-top: 6px;
            color: @fontGreyColor;
            font-size: 11px;
            line-height: 16px;
        }
    }

    .list {
        margin: 12px;
        padding: 15px 12px 0;
        background: #fff;
        border-radius: 8px;

        .title {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 15px;

            .left {
                font-weight: 700;
                font-size: 15px;
                line-height: 21px;
            }

            .right {
                color: #9c9c9c;
                font-size: 12px;
                line-height: 16px;
            }
        }

        ::v-deep .box {
            height: calc(100vh - 248px);

            .fixed .title {
                width: 100%;
            }
        }

        /deep/ .content {
            .fixed {
                flex: 0 0 205px;
                width: auto;

                &-body {
                    .item:last-child {
                        &::after {
                            display: none;
                        }
                    }
                }
            }

            .scroll {
                .body {
                    .row:last-child {
                        .item {
                            &::after {
                                display: none;
                            }
                        }
                    }
                }
            }
        }

        /deep/ .detail {
            width: 205px;

            .name {
                color: @fontBlackColor;
                font-size: 16px;
                line-height: 22px;
            }

            .bottom {
                display: flex;
                align-items: center;
                margin-top: 2px;

                .isin {
                    margin-left: 4px;
                    color: #9c9c9c;
                    font-size: 10px;
                    line-height: 14px;
                }
            }
        }

        /deep/ .scroll-title-container {
            left: 205px;

            .titleItem {
                &:nth-child(1) {
                    flex: 1;
                }

                &:nth-child(2) {
                    flex: 0 0 82px;
                }
            }
        }

        /deep/ .body {
            .item {
                justify-content: space-between;

                &:nth-child(1) {
                    flex: 1;
                    align-items: flex-end;
                    justify-content: center;

                    & > div {
                        text-align: right;
                    }
                }

                &:nth-child(2) {
                    flex: 0 0 82px;
                    align-items: flex-end;
                    justify-content: center;
                }
            }
        }
    }

    .noData {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 87px 0;

        .noDataImg {
            width: 104px;
            height: 104px;
            margin-bottom: 8px;
        }
    }
}
</style>
