<template>
    <div class="page">
        <div class="card top-card">
            <div class="group-name-container border-bottom-1px flex-c">
                <span class="group-name">{{ portfolioInfo.portfolioName }}</span>
                <portfolioTag :portfolioType="portfolioInfo.portfolioType" :tagObj="tagObj"></portfolioTag>
            </div>

            <div class="total-assets">
                <van-popover
                    class="popover"
                    v-model="currencySwitch"
                    :trigger="disableChange ? '' : 'click'"
                    :get-container="
                        () => {
                            getCurrencyPopoverContainer('trigger')
                        }
                    "
                >
                    <ul class="popover-list" @click="e => $emit('updateCurrencyMap', { id: 'group', currency: e.target.dataset.key })">
                        <li
                            class="item"
                            :class="{ selected: item.value === currencyMap.group }"
                            :data-key="item.value"
                            v-for="item in currencyList"
                            :key="item.value"
                        >
                            {{ item.text }}
                        </li>
                    </ul>
                    <template #reference>
                        <label class="popover-label" for="">
                            <span>{{ $t('holdlingAmount') }}·</span>
                            <span>{{ currencyMap.group | currencyFilter }}</span>
                            <template v-if="!disableChange">
                                <multi-img v-if="!forShare" name="angle_trigger" directory="fund" class="trigger"></multi-img>
                            </template>
                            <div ref="trigger" class="trigger-container"></div>
                            <multi-img v-if="!forShare" @click.stop="$emit('switchAmountStatus')" :name="iconEye" directory="fund"></multi-img>
                        </label>
                    </template>
                </van-popover>
                <h3
                    class="amount elipsis"
                    id="amountAssets"
                    v-riseFall="{
                        value: totalAsset[`Assets${currencyMap.group}`],
                        hide: !amountStatus,
                        sign: false,
                        riseFall: false,
                        rate: false,
                        hideObj: { text: '*****', color: '#2F2F2F' },
                    }"
                ></h3>
            </div>

            <!-- 进行中资产展示区（未确认认购、赎回订单） -->
            <template v-if="showonLineAssets">
                <div class="unshow-assets-tip">
                    <ul>
                        <li v-if="!!buyAmountOnWay">
                            <span class="label">{{ $t('buyOnWay') }}</span>
                            <span
                                class="value"
                                ref="buyOnWay"
                                v-riseFall="{
                                    value: buyAmountOnWay,
                                    riseFall: false,
                                    rate: false,
                                    sign: false,
                                    hide: !amountStatus,
                                    hideObj: { text: '****', color: '#666' },
                                }"
                            ></span>
                        </li>
                        <li v-if="!!sellAmountOnWay">
                            <span class="label">{{ $t('sellOnWay') }}</span>
                            <span
                                class="value"
                                ref="sellOnWay"
                                v-riseFall="{
                                    value: sellAmountOnWay,
                                    riseFall: false,
                                    rate: false,
                                    sign: false,
                                    hide: !amountStatus,
                                    hideObj: { text: '****', color: '#666' },
                                }"
                            ></span>
                        </li>
                    </ul>
                </div>
            </template>
            <div class="income-area">
                <div class="income-item" v-for="item in incomeInfoList" :key="item.id" :class="item.id">
                    <div>{{ item.label }}</div>
                    <div
                        class="income-value elipsis"
                        v-riseFall="{
                            value: item.value,
                            hide: !amountStatus,
                            rate: item.rate || false,
                            hideObj: { text: '****', color: '#666' },
                        }"
                    ></div>
                </div>
            </div>
        </div>

        <div class="market-distribution">
            <div class="flex-s h-36" @click="$emit('switchHoldingListStatus')">
                <span class="title">{{ $t('marketDistribute') }}</span>
                <multi-img
                    v-if="!forShare && holdingGroupList.length"
                    :name="showHoldingList ? '24_icon_arrow_up' : '24_icon_arrow_down'"
                    directory="common"
                />
            </div>
            <assetDistributionPct class="asset-pct" :pctList="pctList" :hiddenPct="!amountStatus"></assetDistributionPct>
        </div>

        <div class="card market-card" v-for="holdingGroup in holdingGroupList" :key="holdingGroup.id">
            <div class="flex-s mar-b16">
                <div class="flex-c title">
                    <multi-img :name="holdingGroup.icon" :directory="holdingGroup.directory || 'fund/follow'" />
                    {{ $t(holdingGroup.title) }}
                </div>

                <span class="holding-ratio">
                    {{ $t('fundSelectionByStock.cczb') }}
                    <span
                        :style="{ marginLeft: '-4px' }"
                        v-riseFall="{
                            value: holdingGroup.holdingRatio,
                            hide: !amountStatus,
                            sign: false,
                            riseFall: false,
                            hideObj: { text: '**%', color: '#666666' },
                        }"
                    ></span>
                </span>
            </div>

            <div class="flex-s profit-area" :class="showHoldingList && holdingGroup.list && holdingGroup.list.length ? ['pad-b16'] : ['pad-b8']">
                <div class="profit-item">
                    <van-popover
                        v-if="holdingGroup.cansSwithch"
                        class="popover"
                        v-model="currencySwitchMap[holdingGroup.id]"
                        :trigger="disableChange ? '' : 'click'"
                        :get-container="
                            () => {
                                getCurrencyPopoverContainer(holdingGroup.id)
                            }
                        "
                    >
                        <ul class="popover-list" @click="e => $emit('updateCurrencyMap', { id: holdingGroup.id, currency: e.target.dataset.key })">
                            <li
                                class="item"
                                :class="{ selected: item.value === holdingGroup.currency }"
                                :data-key="item.value"
                                v-for="item in currencyList"
                                :key="item.value"
                            >
                                {{ item.text }}
                            </li>
                        </ul>
                        <template #reference>
                            <label class="popover-label" for="">
                                <span>{{ $t('holdlingAmount') }}·{{ holdingGroup.currency | currencyFilter }}</span>
                                <template v-if="!disableChange">
                                    <multi-img v-if="!forShare" name="angle_trigger" directory="fund" class="trigger"></multi-img>
                                </template>
                                <div :ref="holdingGroup.id" class="trigger-container"></div>
                            </label>
                        </template>
                    </van-popover>
                    <span v-else>{{ $t('holdlingAmount') }}·{{ holdingGroup.currency | currencyFilter }}</span>
                    <h3
                        class="amount elipsis"
                        id="amountAssets"
                        v-riseFall="{
                            value: holdingGroup.marketValue,
                            hide: !amountStatus,
                            sign: false,
                            riseFall: false,
                            rate: false,
                            hideObj: { text: '*****', color: '#2F2F2F' },
                        }"
                    ></h3>
                </div>
                <div v-if="['cash'].includes(holdingGroup.id)"></div>
                <div class="profit-item align-r" v-else-if="['hk', 'us'].includes(holdingGroup.id)">
                    <div>{{ $t('investAdvisory.todayPL') }}</div>
                    <div
                        class="today-profit-ratio"
                        v-riseFall="{
                            value: holdingGroup.todayPL,
                            hide: !amountStatus,
                            rate: false,
                            hideObj: { text: '****', color: '#666' },
                        }"
                    ></div>
                    <div
                        class="today-profit-value"
                        v-riseFall="{
                            value: holdingGroup.todayPLRatio,
                            hide: !amountStatus,
                            hideObj: { text: '****', color: '#666' },
                        }"
                    ></div>
                </div>
                <div class="profit-item align-r" v-else>
                    <div class="flex-c" @click.stop="goProfitDescPage">
                        <div>{{ $t('yesterdayProfit') }}</div>
                        <multi-img v-if="!forShare" class="mar-l2" name="icon_tip_12" directory="common" width="12" height="12" />
                    </div>
                    <div
                        class="latest-profit"
                        v-riseFall="{
                            value: holdingGroup.latestProfit,
                            hide: !amountStatus,
                            rate: false,
                            hideObj: { text: '****', color: '#666' },
                        }"
                    ></div>
                </div>
            </div>
            <div v-if="showHoldingList && holdingGroup.list && holdingGroup.list.length" class="holding-list">
                <assetDistributionPct
                    v-if="holdingGroup.pctList && holdingGroup.pctList.length"
                    class="holding-pct"
                    :pctList="holdingGroup.pctList"
                    :hiddenPct="!amountStatus"
                ></assetDistributionPct>

                <div class="line border-bottom-1px"></div>
                <div class="table-wrapper pos-r">
                    <Table
                        :ref="`${holdingGroup.id}TableRef`"
                        class="content-table"
                        :class="`${holdingGroup.id}-content-table`"
                        :rowClass="'dist_table__row'"
                        :border="false"
                        :data="holdingGroup.list"
                        :columns="holdingGroup.columns"
                        :canPullDown="false"
                        :showEmptyTip="false"
                        :canPullUp="false"
                        @sort="(k, s) => onSort(k, s, holdingGroup.id)"
                        @rowClick="
                            data => {
                                listClickHander(holdingGroup.id, data)
                            }
                        "
                    >
                        <!-- 固定列：基金名 -->
                        <template v-slot:name="props">
                            <div class="flex-content">
                                <template v-if="amountStatus">
                                    <div class="fund-name line-elipsis">{{ props.item.name }}</div>
                                    <div class="flex-c mar-t2">
                                        <div
                                            v-if="['fund', 'bond'].includes(holdingGroup.id)"
                                            class="fund-info_currency mar-r4"
                                            :class="[`currency-${props.item.currency}`]"
                                        ></div>
                                        <span class="c-gray f12">{{ props.item.stockCode }}</span>
                                    </div>
                                </template>
                                <div v-else class="item-hidden">****</div>
                            </div>
                        </template>
                        <!-- 滚动列：基金其他信息 -->
                        <template v-slot:[key]="props" v-for="key in holdingGroup.slotScollColumnKeys">
                            <div class="scoll-content" :key="key">
                                <!-- 股票 -->
                                <!-- 市值/数量 -->
                                <template v-if="key === 'szsl'">
                                    <div v-if="amountStatus" class="flex-column">
                                        <dynamic-font
                                            class="item-amount line-elipsis"
                                            :value="props.item[`marketValue${holdingGroup.id === 'hk' ? 'HKD' : 'USD'}`]"
                                            :options="{ maxFontSize: 16, minFontSize: 12 }"
                                            v-riseFall="{
                                                value: props.item[`marketValue${holdingGroup.id === 'hk' ? 'HKD' : 'USD'}`],
                                                rate: false,
                                                riseFall: false,
                                                sign: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></dynamic-font>
                                        <div
                                            class="item-ratio mar-t2"
                                            v-riseFall="{
                                                value: props.item.quantity,
                                                base: 0,
                                                rate: false,
                                                riseFall: false,
                                                sign: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></div>
                                    </div>
                                    <div v-else class="item-hidden">****</div>
                                </template>
                                <!-- 现价/成本 -->
                                <template v-else-if="key === 'price_cost'">
                                    <div v-if="amountStatus" class="flex-column">
                                        <div
                                            class="item-amount"
                                            v-riseFall="{
                                                value: props.item.closePrice,
                                                base: 3,
                                                rate: false,
                                                riseFall: false,
                                                sign: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></div>
                                        <div
                                            class="item-ratio mar-t2"
                                            v-riseFall="{
                                                value: costFilter(props.item),
                                                base: 3,
                                                rate: false,
                                                riseFall: false,
                                                sign: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></div>
                                    </div>
                                    <div v-else class="item-hidden">****</div>
                                </template>
                                <!-- 今日盈亏 -->
                                <template v-else-if="key === 'todayPL'">
                                    <div v-if="amountStatus" class="flex-column">
                                        <dynamic-font
                                            class="item-amount line-elipsis"
                                            :value="props.item[`todayPl${props.item.currency}`]"
                                            :options="{ maxFontSize: 16, minFontSize: 12 }"
                                            v-riseFall="{
                                                value: props.item[`todayPl${props.item.currency}`],
                                                rate: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></dynamic-font>
                                        <div
                                            class="item-ratio mar-t2"
                                            v-riseFall="{
                                                value: props.item.todayPlRatio,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></div>
                                    </div>
                                    <div v-else class="item-hidden">****</div>
                                </template>
                                <!-- 持仓盈亏 -->
                                <template v-else-if="key === 'holdingPL'">
                                    <div v-if="amountStatus" class="flex-column">
                                        <dynamic-font
                                            class="item-amount line-elipsis"
                                            :value="props.item[`holdingPl${props.item.currency}`]"
                                            :options="{ maxFontSize: 16, minFontSize: 12 }"
                                            v-riseFall="{
                                                value: props.item[`holdingPl${props.item.currency}`],
                                                rate: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></dynamic-font>
                                    </div>
                                    <div v-else class="item-hidden">****</div>
                                </template>
                                <!-- 已实现盈亏 -->
                                <template v-else-if="key === 'realizedPL'">
                                    <dynamic-font
                                        class="item-amount line-elipsis"
                                        :value="props.item[`realizedPl${props.item.currency}`]"
                                        :options="{ maxFontSize: 16, minFontSize: 12 }"
                                        v-riseFall="{
                                            value: props.item[`realizedPl${props.item.currency}`],
                                            rate: false,
                                            hide: !amountStatus,
                                            hideObj: { text: '****', color: '#666' },
                                        }"
                                    ></dynamic-font>
                                </template>
                                <!-- 未实现盈亏 -->
                                <template v-else-if="key === 'unrealizedPL'">
                                    <div v-if="amountStatus" class="flex-column">
                                        <dynamic-font
                                            class="item-amount line-elipsis"
                                            :value="props.item[`unrealizedPl${props.item.currency}`]"
                                            :options="{ maxFontSize: 16, minFontSize: 12 }"
                                            v-riseFall="{
                                                value: props.item[`unrealizedPl${props.item.currency}`],
                                                rate: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></dynamic-font>
                                        <div
                                            class="item-ratio mar-t2"
                                            v-riseFall="{
                                                value: props.item.unrealizedPlRatio,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></div>
                                    </div>
                                    <div v-else class="item-hidden">****</div>
                                </template>
                                <!-- 非股票 -->
                                <!-- 持有金额 -->
                                <template v-else-if="key === 'holdlingAmount'">
                                    <dynamic-font
                                        class="item-amount line-elipsis"
                                        :value="props.item.marketValue"
                                        :options="{ maxFontSize: 16, minFontSize: 12 }"
                                        v-riseFall="{
                                            value: props.item.marketValue,
                                            rate: false,
                                            riseFall: false,
                                            sign: false,
                                            hide: !amountStatus,
                                            hideObj: { text: '****', color: '#666' },
                                        }"
                                    ></dynamic-font>
                                </template>
                                <!-- 最新收益 -->
                                <template v-else-if="key === 'latestProfit'">
                                    <dynamic-font
                                        class="item-amount line-elipsis"
                                        :value="props.item.latestProfit"
                                        :options="{ maxFontSize: 16, minFontSize: 12 }"
                                        v-riseFall="{
                                            value: props.item.latestProfit,
                                            rate: false,
                                            hide: !amountStatus,
                                            hideObj: { text: '****', color: '#666' },
                                        }"
                                    ></dynamic-font>
                                </template>
                                <!-- 持有收益 -->
                                <template v-else-if="key === 'holdProfit'">
                                    <div v-if="amountStatus" class="flex-column">
                                        <dynamic-font
                                            class="item-amount line-elipsis"
                                            :value="props.item.holdProfit"
                                            :options="{ maxFontSize: 16, minFontSize: 12 }"
                                            v-riseFall="{
                                                value: props.item.holdProfit,
                                                rate: false,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></dynamic-font>
                                        <div
                                            class="item-ratio"
                                            v-riseFall="{
                                                value: props.item.unrealizedPlRatio,
                                                hide: !amountStatus,
                                                hideObj: { text: '****', color: '#666' },
                                            }"
                                        ></div>
                                    </div>
                                    <div v-else class="item-hidden">****</div>
                                </template>
                                <!-- 累计收益 -->
                                <template v-else-if="key === 'accumulatedProfit'">
                                    <dynamic-font
                                        class="item-amount line-elipsis"
                                        :value="props.item.accumulatedProfit"
                                        :options="{ maxFontSize: 16, minFontSize: 12 }"
                                        v-riseFall="{
                                            value: props.item.accumulatedProfit,
                                            rate: false,
                                            hide: !amountStatus,
                                            hideObj: { text: '****', color: '#666' },
                                        }"
                                    ></dynamic-font>
                                </template>
                                <div
                                    v-else
                                    class="item-amount"
                                    v-riseFall="{
                                        value: props.item[key],
                                        riseFall: false,
                                        sign: false,
                                        hide: !amountStatus,
                                        hideObj: { text: '****', color: '#666' },
                                    }"
                                ></div>
                            </div>
                        </template>
                    </Table>
                </div>
            </div>
        </div>
        <div class="empty" v-if="!holdingGroupList.length">
            <multi-img name="noHold" directory="common"></multi-img>
            <p class="text">{{ $t('noMarketDistribute') }}</p>
        </div>
    </div>
</template>

<script>
import Table from '@/components/Table.vue'
import portfolioTag from '@/views/fund/follow/components/portfolioTag.vue'
import assetDistributionPct from '@/views/fund/follow/components/assetDistributionPct.vue'
import DynamicFont from '@/components/FosunDynamicFont.vue'

import dayjs from 'dayjs'
import NP from 'number-precision'
import pageUrl from '@/config/pageUrl'

import { stockConfig, fundConfig } from './holdingDetailConfig'
import { currencyFilter, amountFormatter } from '@/config/filters'
import { cloneDeep } from 'lodash'
import { dynamicFontSize } from '@/utils'

const USD = 'USD'
const HKD = 'HKD'
const CNH = 'CNH'

const latestProfitDateFilter = v => {
    return v ? `(${dayjs(v).format('MM/DD')})` : ''
}

export default {
    name: 'holding-detail',
    mixins: [],
    components: { portfolioTag, Table, assetDistributionPct, DynamicFont },
    props: {
        forShare: {
            type: Boolean,
            default: false,
        },
        amountStatus: {
            type: Boolean,
        },
        showHoldingList: {
            type: Boolean,
        },
        currencyMap: {
            type: Object,
        },
        totalAsset: {
            type: Object,
        },
        portfolioInfo: {
            type: Object,
        },
        marketAssetBreakDown: {
            type: Object,
        },
        // 是否禁止掉货币选择功能
        disableChange: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            userInfo: {},
            costPriceType: 1, // 1 摊薄成本价 2 平均成本价
            currencySwitch: false,
            currencyList: [
                { value: HKD, text: this.$t('HKD') },
                { value: USD, text: this.$t('USD') },
                { value: CNH, text: this.$t('CNH') },
            ],
            currencySwitchMap: {
                cash: false,
                fund: false,
                bond: false,
            },
            cashValue: 100,
            ratioMap: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
            },
            sortMap: {
                hk: { key: 'szsl', sort: 'desc' },
                us: { key: 'szsl', sort: 'desc' },
                fund: { key: 'holdlingAmount', sort: 'desc' },
                bond: { key: 'holdlingAmount', sort: 'desc' },
            },
            tagObj: { 1: this.$t('follow.stockName'), 2: this.$t('publicFund'), 3: this.$t('bond'), 4: this.$t('mixed') },
        }
    },
    computed: {
        iconEye() {
            return this.amountStatus ? 'icon_trade_eye_open' : 'icon_trade_eye_close'
        },
        incomeInfoList() {
            return [
                {
                    id: 'holding-income',
                    label: this.$t('holdProfit'),
                    value: this.totalAsset[`profitLoss${this.currencyMap.group}`],
                },
                {
                    id: 'holding-period',
                    label: this.$t('holdProfitRate'),
                    value: this.totalAsset.profitLossRate,
                    rate: true,
                },
            ]
        },
        holdingGroupList() {
            const list = []
            const cash = this.marketAssetBreakDown.cash
            const hk = this.marketAssetBreakDown.hk
            const us = this.marketAssetBreakDown.us
            const fund = this.marketAssetBreakDown.fund
            const bond = this.marketAssetBreakDown.bond

            if (cash && Number.parseFloat(cash.balance[this.currencyMap.cash], 0) !== 0) {
                list.push({
                    id: 'cash',
                    title: 'cash',
                    icon: 'icon_type_cash',
                    currency: this.currencyMap.cash,
                    cansSwithch: true,
                    marketValue: cash.balance[this.currencyMap.cash],
                    holdingRatio: cash.ratio,
                })
            }
            if (hk) {
                list.push({
                    id: 'hk',
                    title: 'HKDMarket',
                    icon: 'account-type__HKD',
                    directory: 'common',
                    currency: HKD,
                    marketValue: hk.asset.marketValueHKD,
                    holdingRatio: hk.ratio,
                    todayPL: hk.asset.todayPlHKD || 0,
                    todayPLRatio: hk.asset.todayPlRatio || 0,
                    list: hk.holding,
                    columns: stockConfig,
                    slotScollColumnKeys: stockConfig.filter(item => item.slot && !item.fixed).map(item => item.key),
                })
            }
            if (us) {
                list.push({
                    id: 'us',
                    title: 'USDMarket',
                    icon: 'account-type__USD',
                    directory: 'common',
                    currency: USD,
                    marketValue: us.asset.marketValueUSD,
                    holdingRatio: us.ratio,
                    todayPL: us.asset.todayPlUSD || 0,
                    todayPLRatio: us.asset.todayPlRatio || 0,
                    list: us.holding,
                    columns: stockConfig,
                    slotScollColumnKeys: stockConfig.filter(item => item.slot && !item.fixed).map(item => item.key),
                })
            }
            if (fund) {
                const map = { HKD: fund.asset.marketValueHKD, USD: fund.asset.marketValueUSD, CNH: fund.asset.marketValueCNH }
                const last = { HKD: fund.asset.lastPlHKD, USD: fund.asset.lastPlUSD, CNH: fund.asset.lastPlCNH }
                const holding = cloneDeep(fund.holding).map(item => {
                    item.marketValue = item[`marketValue${this.currencyMap.fund}`]
                    item.latestProfit = item[`lastPl${this.currencyMap.fund}`]
                    item.holdProfit = item[`unrealizedPl${this.currencyMap.fund}`]
                    item.accumulatedProfit = item[`accumHoldingPl${this.currencyMap.fund}`]
                    return item
                })

                list.push({
                    id: 'fund',
                    title: 'publicFund',
                    icon: 'icon_type_fund',
                    currency: this.currencyMap.fund,
                    cansSwithch: true,
                    marketValue: map[this.currencyMap.fund],
                    holdingRatio: fund.ratio,
                    latestProfit: last[this.currencyMap.fund] || 0,
                    list: holding,
                    columns: fundConfig,
                    slotScollColumnKeys: fundConfig.filter(item => item.slot && !item.fixed).map(item => item.key),
                    pctList: this.fundPctList,
                })
            }
            if (bond) {
                const map = { HKD: bond.asset.marketValueHKD, USD: bond.asset.marketValueUSD, CNH: bond.asset.marketValueCNH }
                const last = { HKD: bond.asset.lastPlHKD, USD: bond.asset.lastPlUSD, CNH: bond.asset.lastPlCNH }
                const holding = cloneDeep(bond.holding).map(item => {
                    item.marketValue = item[`marketValue${this.currencyMap.bond}`]
                    item.latestProfit = item[`lastPl${this.currencyMap.bond}`]
                    item.holdProfit = item[`unrealizedPl${this.currencyMap.bond}`]
                    item.accumulatedProfit = item[`accumHoldingPl${this.currencyMap.bond}`]
                    return item
                })
                list.push({
                    id: 'bond',
                    title: 'bond',
                    icon: 'icon_type_bond',
                    currency: this.currencyMap.bond,
                    cansSwithch: true,
                    marketValue: map[this.currencyMap.bond],
                    holdingRatio: bond.ratio,
                    latestProfit: last[this.currencyMap.bond] || 0,
                    list: holding,
                    columns: fundConfig,
                    slotScollColumnKeys: fundConfig.filter(item => item.slot && !item.fixed).map(item => item.key),
                    pctList: this.bondPctList,
                })
            }
            return list
        },
        pctList() {
            const list = []
            const cash = this.marketAssetBreakDown.cash
            const hk = this.marketAssetBreakDown.hk
            const us = this.marketAssetBreakDown.us
            const fund = this.marketAssetBreakDown.fund
            const bond = this.marketAssetBreakDown.bond
            if (cash) {
                list.push({
                    key: 'cash',
                    pct: cash.ratio || 0,
                    label: this.$t('cash'),
                    groupID: 'cash',
                })
            }

            if (hk) {
                list.push({
                    key: 'hkStock',
                    pct: hk.ratio || 0,
                    label: this.$t('HKDMarket'),
                    groupID: 'hkStock',
                })
            }

            if (us) {
                list.push({
                    key: 'usStock',
                    pct: us.ratio || 0,
                    label: this.$t('USDMarket'),
                    groupID: 'usStock',
                })
            }

            if (fund) {
                list.push({
                    key: 'publicFund',
                    pct: fund.ratio || 0,
                    label: this.$t('publicFund'),
                    groupID: 'publicFund',
                })
            }

            if (bond) {
                list.push({
                    key: 'bond',
                    pct: bond.ratio || 0,
                    label: this.$t('bond'),
                    groupID: 'bond',
                })
            }

            return list
        },
        fundPctList() {
            // stockFund: 股票型基金 bondFund: 债券型基金 mixedFund: 混合型基金 currencyFund: 货币型基金
            const bnOrder = ['stockFund', 'bondFund', 'mixedFund', 'currencyFund']
            const fnOrder = {
                stockFund: { key: 'stockFund', label: this.$t('stockType'), color: '#FF6907' },
                bondFund: { key: 'bondFund', label: this.$t('bondType'), color: '#8F4BE5' },
                mixedFund: { key: 'mixtureFund', label: this.$t('mixedType'), color: '#3B95FF' },
                currencyFund: { key: 'moneyFund', label: this.$t('currencyType'), color: '#16B1BD' },
            }
            const map = {}
            this.marketAssetBreakDown.fund?.distributions?.forEach(item => {
                map[item.type] = item
            })
            const list = bnOrder
                .map(type => {
                    const item = map[type]
                    if (!item) return null
                    item.key = fnOrder[item.type].key
                    item.pct = item.ratio
                    item.groupID = item.key
                    item.label = fnOrder[item.type].label
                    item.color = fnOrder[item.type].color
                    return item
                })
                .filter(item => item)
            return list
        },
        bondPctList() {
            // nationalBond: 国债 governmentBond: 政府债 corporateBond: 企业债
            const bnOrder = ['nationalBond', 'governmentBond', 'corporateBond']
            const map = {}
            this.marketAssetBreakDown.bond?.distributions?.forEach(item => {
                map[item.type] = item
            })
            const list = bnOrder
                .map(type => {
                    const item = map[type]
                    if (!item) return null
                    item.key = item.type
                    item.pct = item.ratio
                    item.groupID = item.key
                    item.label = this.$t(item.key)
                    return item
                })
                .filter(item => item)
            return list
        },
        buyAmountOnWay() {
            return this.totalAsset[`buyAmountOnWay${this.currencyMap.group}`]
        },
        sellAmountOnWay() {
            return this.totalAsset[`sellAmountOnWay${this.currencyMap.group}`]
        },
        // 是否展示在资产提示
        showonLineAssets() {
            return this.buyAmountOnWay || this.sellAmountOnWay
        },
    },
    created() {
        this.fetchIgnoreState()
    },
    destroyed() {},
    filters: {
        currencyFilter,
        amountFormatter,
    },
    watch: {
        showHoldingList: {
            handler(newV, oldV) {
                if (!oldV && !!newV) {
                    this.initTabelSort()
                }
            },
            immediate: true,
        },
        marketAssetBreakDown: {
            handler() {
                if (this.showHoldingList) {
                    this.initTabelSort()
                }
            },
            immediate: true,
        },
        buyOnWay() {
            this.resetFontSize()
        },
        sellOnWay() {
            this.resetFontSize()
        },
    },
    mounted() {},
    methods: {
        fetchIgnoreState() {
            this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
            if (this.userInfo.clientSetting) {
                try {
                    const clientSetting = JSON.parse(this.userInfo.clientSetting)
                    this.costPriceType = clientSetting?.costPriceType ?? 1 // 默认 摊薄成本价
                } catch (error) {
                    console.error(error)
                }
            }
        },
        getCurrencyPopoverContainer(trigger) {
            const triggerDom = this.$refs[trigger]
            return triggerDom ? triggerDom : document.querySelector('body')
        },
        // 收益说明
        goProfitDescPage() {
            this.$goPage(pageUrl.FAQ_PROFIT_DESC)
        },
        // 点击事件
        listClickHander(type, item) {
            console.log(`yinlong`, type, item)
            if (type === 'fund') {
                this.$goPage('/detail', {
                    symbol: item.symbol,
                    type: 'public',
                })
            } else if (type === 'bond') {
                this.$goPage('/bond-detail', {
                    symbol: item.symbol,
                })
            } else {
                this.$jsBridge?.goPage(`stockQuote?stockId=${item.marketCode}${item.stockCode}`)
            }
        },
        async initTabelSort() {
            await this.$nextTick()
            Object.keys(this.sortMap).forEach(key => {
                const table = this.getTable(key)
                table && table.setSortMap(this.sortMap[key].key, this.sortMap[key].sort)
                table && this.onSort(this.sortMap[key].key, this.sortMap[key].sort, key)
            })
        },
        getTable(refKey) {
            let dom = this.$refs[`${refKey}TableRef`]
            if (Array.isArray(dom) && dom.length > 0) {
                dom = dom[0]
            }
            return dom
        },
        /**
         * 排序算法
         * @param {String} key  需要排序的字段
         * @param {String} sort  排序方式
         * @param {String} refKey  需要排序的tabel
         */
        onSort(key, sort, refKey) {
            const talbe = this.getTable(refKey)
            if (sort === 'none') {
                // 此处不能展示为 none 排序
                sort = 'asc'
                talbe && talbe.setSortMap(key, sort)
            }
            const list = this.marketAssetBreakDown[refKey].holding
            let currency = ''
            if (['hk', 'us'].includes(refKey)) {
                currency = refKey === 'hk' ? 'HKD' : 'USD'
            } else {
                currency = this.currencyMap[refKey]
            }

            const sortKeyMap = {
                szsl: `marketValue${currency}`,
                price_cost: 'closePrice',
                todayPL: `todayPl${currency}`,
                // holdingPL: this.costPriceType === 1 ? `dilutedHoldingPl${currency}` : `holdingPl${currency}`,
                holdingPL: `holdingPl${currency}`,
                unrealizedPL: `unrealizedPl${currency}`,
                realizedPL: `realizedPl${currency}`,
                ratio: 'ratio',
                holdlingAmount: `marketValue${currency}`,
                latestProfit: `lastPl${currency}`,
                holdProfit: `unrealizedPl${currency}`,
                accumulatedProfit: `accumHoldingPl${currency}`,
            }

            list.sort((a, b) => {
                const realKey = sortKeyMap[key]
                if (sort === 'asc') {
                    return this.sortByAsc(a, b, realKey)
                }
                if (sort === 'desc') {
                    return this.sortByDesc(a, b, realKey)
                }
            })

            this.sortMap[refKey].key = key
            this.sortMap[refKey].sort = sort
        },
        /**
         * 升序算法
         */
        sortByAsc(a, b, key) {
            const aV = a[key]
            const bV = b[key]
            // 如果按照升序排列，需要将数据值为''的 放到最后列.
            // 如果两个都为''的情况下,会按照initIndex来排序
            if (!(aV || bV)) return a.initIndex - b.initIndex
            if (!aV) return 1
            if (!bV) return 1
            // 如果两个数值相同的情况下，会按照原始排序来放置
            const ret = NP.minus(aV, bV)
            if (ret === 0) return a.initIndex - b.initIndex
            return ret
        },
        /**
         * 降序算法
         */
        sortByDesc(a, b, key) {
            const aV = a[key]
            const bV = b[key]
            // 如果按照升序排列，需要将数据值为''的 放到最后列.
            // 如果两个都为''的情况下,会按照initIndex来反排序
            if (!(aV || bV)) {
                const index = b.initIndex - a.initIndex
                if (index > 0) return -1
                if (index < 0) return 1
            }
            if (!aV) return 1
            if (!bV) return -1
            // 如果两个数值相同的情况下，会按照原始排序相反方向来放置
            const ret = NP.minus(bV, aV)
            if (ret === 0) {
                const index = b.initIndex - a.initIndex
                if (index > 0) return -1
                if (index < 0) return 1
            }
            return ret
        },
        holdingPLFilter(item) {
            // return this.costPriceType === 1 ? item[`dilutedHoldingPl${item.currency}`] : item[`holdingPl${item.currency}`]
            return item[`unrealizedPl${item.currency}`]
        },
        holdingPLRatioFilter(item) {
            // return this.costPriceType === 1 ? item.dilutedHoldingPlRatio : item.holdingPlRatio
            return item.unrealizedPlRatio
        },
        costFilter(item) {
            // return this.costPriceType === 1 ? item.dilutedCost : item.cost
            return item.cost
        },
        resetFontSize() {
            this.$nextTick(() => {
                if (this.showonLineAssets) {
                    if (this.buyAmountOnWay) {
                        dynamicFontSize({ dom: 'buyOnWay', minFontSize: 9, context: this })
                    }
                    if (this.sellAmountOnWay) {
                        dynamicFontSize({ dom: 'sellOnWay', minFontSize: 9, context: this })
                    }
                }
            })
        },
    },
}
</script>

<style scoped lang="less">
.page {
    padding: 12px 12px 84px;
    background-color: #f9f9f9;
}

.logo {
    margin-top: -14px;
    padding-bottom: 14px;
}

.card {
    min-height: 100px;
    background-color: #fff;
    border-radius: 8px;

    + .card {
        margin-top: 12px;
    }
}
// 市场分布
.market-distribution {
    height: auto;
    margin: 16px 0;

    .h-36 {
        height: 36px;
        margin-bottom: 8px;

        .title {
            color: @h1-white;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }

        img {
            width: 24px;
            height: 24px;
        }
    }

    .asset-pct {
        padding: 0 4px;
        background-color: #f9f9f9;
    }
}

.mar-l2 {
    margin-left: 2px;
}

.mar-r4 {
    margin-right: 4px;
}
</style>
<!-- popover -->
<style scoped lang="less">
.popover {
    .popover-label {
        display: flex;
        align-items: center;

        & > span {
            flex: 1 0 auto;
        }

        img {
            width: 16px;
            margin-left: 16px;

            &.trigger {
                width: 6px;
                margin-left: 4px;
            }
        }

        .trigger-container {
            position: relative;
        }
    }

    .trigger-container {
        /deep/ .van-popover {
            top: 0 !important;
            left: 0 !important;
            transform: translate3d(calc(-50% - 36px), 15px, 0) !important;

            .van-popover__arrow {
                color: @dialog-white;
            }

            .van-popover__content {
                background-color: unset;
                box-shadow: 0 -1px 10px rgba(50, 50, 51, 0.15);
            }
        }
    }

    .popover-list {
        width: 94px;
        overflow: hidden;
        border-radius: 4px;

        .item {
            color: @h1-white;
            font-size: 14px;
            line-height: 36px;
            text-align: center;
            background-color: @dialog-white;
            box-shadow: inset 0 -0.5px 0 @divider-white;

            &.selected {
                color: #ff6307;
            }
        }
    }
}
</style>
<!-- 顶部卡片信息 -->
<style scoped lang="less">
.top-card {
    padding: 0 12px 20px;

    .group-name-container {
        padding: 16px 0;

        .group-name {
            margin-right: 8px;
            color: @h1-white;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }
    }

    .total-assets {
        flex: 0 1 auto;
        width: 196px;
        margin: 20px auto 0;
        color: @h2-white;
        font-size: 14px;
        line-height: 20px;
        text-align: center;

        .amount {
            margin: 8px 0 0;
            color: @h1-white;
            font-weight: bold;
            font-size: 28px;
            line-height: 38px;
        }
    }

    .unshow-assets-tip {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
        padding-top: 6px;

        ul {
            position: relative;
            z-index: 111;
            display: flex;
            padding: 8px 12px;
            background: #f6f6f6;
            border-radius: 44px;

            &::after {
                position: absolute;
                top: 0;
                left: 50%;
                z-index: 111;
                width: 0;
                height: 0;
                border-right: 5px solid;
                border-right-color: transparent;
                border-bottom: 5px solid;
                border-bottom-color: #f6f6f6;
                border-left: 5px solid;
                border-left-color: transparent;
                transform: translate(-50%, -100%);
                content: '';
            }

            li {
                #font_h2();

                display: flex;
                max-width: 144px;
                font-size: 12px;
                line-height: 16px;
                white-space: nowrap;

                span {
                    flex: 1 0 auto;
                }

                .value {
                    max-width: 72px;
                    overflow: hidden;
                    font-weight: bold;
                    text-overflow: ellipsis;
                }

                & + li {
                    margin-left: 16px;
                }
            }
        }
    }

    .income-area {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;

        .income-item {
            flex: 1;
            color: @h3-white;
            font-size: 12px;
            line-height: 16px;
            text-align: center;

            + .income-item {
                margin-left: 12px;
            }

            .income-value {
                margin-top: 4px;
                font-weight: bold;
                font-size: 14px;
                line-height: 20px;
            }
        }

        .yestoday {
            // text-align: left;
        }

        .holding-income {
            // text-align: center;
        }

        .holding-period {
            // text-align: right;
        }
    }
}
</style>
<!-- 持仓 -->
<style scoped lang="less">
.market-card {
    padding: 20px 12px 8px;

    .title {
        color: @h1-white;
        font-weight: bold;
        font-size: 16px;
        line-height: 22px;

        img {
            width: 16px;
            height: 16px;
            margin-right: 6px;
        }
    }

    .holding-ratio {
        color: @h2-white;
        font-size: 12px;
        line-height: 16px;
        text-align: right;
    }

    .profit-area {
        align-items: flex-start;

        .profit-item {
            color: @h2-white;
            font-size: 12px;
            line-height: 16px;

            .amount {
                margin-top: 5px;
                color: @h1-white;
                font-size: 22px;
                line-height: 36px;
            }

            .today-profit-ratio {
                margin-top: 2px;
                font-size: 12px;
                line-height: 16px;
            }

            .today-profit-value {
                margin-top: 2px;
                font-size: 12px;
                line-height: 16px;
            }

            .latest-profit {
                margin-top: 2px;
                line-height: 36px;
            }
        }
    }

    .holding-list {
        .line {
            height: 1px;
            margin-bottom: 4px;
        }

        .holding-pct {
            padding: 12px 0 16px;
        }

        .content-table {
            .flex-content {
                .fund-name {
                    color: @h1-white;
                    font-size: 16px;
                    line-height: 22px;
                }
            }

            .scoll-content {
                .item-amount {
                    color: @h1-white;
                    font-size: 16px;
                    line-height: 22px;
                    text-align: right;
                }

                .item-ratio {
                    color: @h3-white;
                    font-size: 12px;
                    line-height: 16px;
                    text-align: right;
                }
            }

            .item-hidden {
                color: @h2-white;
                font-size: 16px;
                line-height: 22px;
            }
        }

        ::v-deep .content-table.box {
            /* stylelint-disable-next-line selector-class-pattern */
            .scrollElement {
                padding-top: 28px;
            }

            .title {
                font-size: 12px;
                line-height: 16px;
                background: #fff;
            }
            @fixedW: 135px;

            .fixed {
                width: @fixedW !important;

                .item {
                    height: 60px;
                }
            }

            .scroll {
                .scroll-title-container {
                    left: @fixedW !important;
                    z-index: 0;
                    height: 24px;
                    padding-top: 4px;

                    .title {
                        padding-bottom: 0;
                        font-weight: 400;
                        font-size: 12px;
                        line-height: 16px;
                    }
                }

                .item {
                    height: 60px;
                }
            }
        }

        ::v-deep .hk-content-table.box,
        ::v-deep .us-content-table.box {
            @fixedW: 87px;

            .fixed {
                width: @fixedW !important;
            }

            .scroll {
                .scroll-title-container {
                    left: @fixedW !important;
                }
            }
        }
    }
}

.empty {
    margin-top: -16px;
    padding: 72px 0;
    font-size: 0;
    text-align: center;
    background: @white;
    border-radius: 8px;

    img {
        width: 104px;
        height: 104px;
    }

    .text {
        margin-top: 10px;
        color: @fontGreyColor;
        font-size: 12px;
        line-height: 16px;
    }
}
</style>
