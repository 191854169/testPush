<template>
    <div class="select-fund">
        <wrong-tips class="page-item" v-show="!isSameType"></wrong-tips>
        <fund-search class="page-item" :selectList="selectList" @searchCheck="checkAction"></fund-search>
        <ul class="tabs page-item" @click="tabAction($event)">
            <li
                v-for="item in tabList"
                :key="item.key"
                class="tabs-item"
                :class="{ 'tabs-item__active': acitveTab === item.key }"
                :data-key="item.key"
            >
                {{ item.label }}
            </li>
        </ul>
        <div class="fund-list" :class="{ 'expand-margin': selectList.length > 0 }">
            <div v-show="acitveTab === key" class="list-item" v-for="[key, list] in Object.entries(listMap)" :key="key">
                <div v-if="list.length > 0" class="list-item__table">
                    <fund-item v-for="(item, index) in list" :key="item.symbol + index" :fundInfo="item" @check="checkAction"></fund-item>
                </div>
                <div v-else class="list-item__empty">
                    <multi-img name="empty-status" directory="common" />
                    <span>{{ $t('fundList.noFund') }}</span>
                </div>
            </div>
        </div>
        <footer>
            <ul class="selected-list" v-show="selectList.length > 0">
                <li v-for="item in selectList" :key="item.symbol" @click="cancelSelectAction(item.symbol)">
                    <p class="line-elipsis_l2">{{ item.name }}</p>
                    <multi-img name="icon-close-opacity" directory="common" />
                </li>
            </ul>
            <div class="content" :class="{ 'pd-b12': !isIos }">
                <div class="fund-info">
                    <p class="selected" v-html="selectedDesc"></p>
                    <p class="limit">{{ $t('compare.selectLimit') }}</p>
                </div>
                <button :class="{ 'can-comparison__btn': canComparison }" @click="comparisonAction">{{ $t('compare.startCompare') }}</button>
            </div>
        </footer>
    </div>
</template>
<script>
import fundSearch from './search/index.vue'
import wrongTips from '../wrongTips.vue'
import fundItem from './fundItem'
import { getWatchlist } from '@/apis/fund/mystock.js'
import { getBasicInfo, getCategoryList } from '@/apis/fund/fund.js'
import { lightHoldings } from '@/apis/wealth/index.js'
import { getPubFundTrack } from '@/views/fund/config/fundTrack.js'
import { isIos } from '@/utils/tools.js'
const MAX_SELECT_NUM = 4

export default {
    name: 'selectFund',
    components: {
        fundSearch,
        wrongTips,
        fundItem,
    },
    data() {
        return {
            isIos: isIos(),
            acitveTab: 'track',
            listMap: {
                track: [],
                self: [],
                holding: [],
                same: [],
            },
            selectList: [],
        }
    },
    computed: {
        selectedDesc() {
            const lng = this.selectList.length
            return this.$t('compare.hadSelect', { num: `<span style="color: #FF6907;font-weight: 700;">${lng}</span>` })
        },
        // 传入页面的symbol需传JSON 数组
        symbols() {
            return this.$route.query.symbols ? JSON.parse(decodeURIComponent(this.$route.query.symbols)) : []
        },
        // 是否展示同类  只有单个基金存在时才展示同类tab
        showSame() {
            return this.symbols.length === 1
        },
        tabList() {
            const list = [
                { label: this.$t('compare.track'), key: 'track' },
                { label: this.$t('compare.self'), key: 'self' },
                { label: this.$t('compare.holding'), key: 'holding' },
            ]
            if (this.showSame) {
                list.push({ label: this.$t('compare.same'), key: 'same' })
            }
            return list
        },
        // 能否对比
        canComparison() {
            return this.selectList.length >= 2
        },
        // 不能继续添加
        noCanSelect() {
            return this.selectList.length >= MAX_SELECT_NUM
        },
        // 相同类型
        isSameType() {
            if (this.selectList.length > 0) {
                return this.selectList.every(item => item.type === this.selectList[0].type)
            }
            return true
        },
    },
    created() {
        this.getData()
    },
    methods: {
        async getData() {
            await this.getBasic()
            this.getTrack()
            this.getSelf()
            this.getHolding()
            this.getSame()
        },
        // 获取参数带过来的symbols
        async getBasic() {
            try {
                const { result } = await getBasicInfo({ symbol: this.symbols.join(',') })
                const list = result?.list || []
                const resultList = list.map(item => {
                    return {
                        symbol: item.symbol,
                        name: item.name,
                        ISIN: item.ISIN,
                        currency: item.currency,
                        type: item.type,
                        check: true,
                    }
                })
                resultList.forEach(this.initSyncCheckCb)
            } catch (e) {
                console.log('select-fund-getBasic===>e:', e)
            }
        },
        // 获取足迹
        async getTrack() {
            try {
                const trackList = getPubFundTrack()
                if (trackList.length > 0) {
                    const { result } = await getBasicInfo({ symbol: trackList.join(',') })
                    const list = result?.list || []
                    this.listMap.track = list.map(item => {
                        return {
                            symbol: item.symbol,
                            name: item.name,
                            ISIN: item.ISIN,
                            currency: item.currency,
                            type: item.type,
                            check: false,
                        }
                    })

                    // 进入页面的选择带入的基金
                    this.listMap.track.forEach(this.initSyncCheckCb)
                }
            } catch (e) {
                console.log('get_track===>e:', e)
            }
        },
        // 获取自选
        async getSelf() {
            try {
                const { result } = await getWatchlist({ version: 1 })
                const groups = result.groups ? JSON.parse(result.groups) : []
                const stocksList = groups.map(item => {
                    return item.stocks.map(obj => obj.symbol)
                })
                // 自选symbols
                let watchSymbols = Array.from(new Set(stocksList.flat()))
                watchSymbols = watchSymbols.filter(item => item.slice(0, 2) === 'mf')
                if (watchSymbols.length === 0) return
                // 自选股票详情
                const res = await getBasicInfo({ symbol: watchSymbols.join(',') })
                const list = res?.result?.list || []
                this.listMap.self = list.map(item => {
                    return {
                        symbol: item.symbol,
                        name: item.name,
                        ISIN: item.ISIN,
                        currency: item.currency,
                        type: item.type,
                        check: false,
                    }
                })
                // 进入页面的选择带入的基金
                this.listMap.self.forEach(this.initSyncCheckCb)
            } catch (e) {
                console.log('get_self===>e:', e)
            }
        },
        // 获取持仓
        async getHolding() {
            try {
                if (!this.$root.isLogin) return
                const { result } = await lightHoldings({
                    start: 0,
                    count: 999,
                })
                // productType 产品类型 1-公募，2-私募，3-债券，4-票据
                const list = (result?.list || []).filter(item => {
                    return item.productType === 1 && !!item.symbol
                })
                this.listMap.holding = list.map(item => {
                    return {
                        symbol: item.symbol,
                        name: item.productName,
                        ISIN: item.isin,
                        currency: item.currency,
                        type: item.fundType,
                        check: false,
                    }
                })

                // 进入页面的选择带入的基金
                this.listMap.holding.forEach(this.initSyncCheckCb)
            } catch (e) {
                console.log('get_holding===>e:', e)
            }
        },
        // 获取同类
        async getSame() {
            try {
                if (!this.showSame) return
                const { result } = await getCategoryList({
                    symbol: this.symbols[0],
                    start: 1,
                    count: 100,
                })
                const resList = []
                ;(result?.list || []).forEach(item => {
                    if (item.symbol !== this.symbols[0]) {
                        resList.push({
                            symbol: item.symbol,
                            name: item.name,
                            ISIN: item.ISIN,
                            currency: item.currency,
                            type: item.type,
                            check: false,
                        })
                    }
                })
                // 进入页面的选择带入的基金
                resList.forEach(this.initSyncCheckCb)
                this.listMap.same = resList
            } catch (e) {
                console.log('getSame===>e:', e)
            }
        },
        tabAction(e) {
            const key = e.target.dataset.key
            if (key) {
                this.acitveTab = key
            }
        },

        // 初始化同步选中
        initSyncCheckCb(item) {
            if (this.symbols.includes(item.symbol)) {
                this.checkAction({
                    value: true,
                    fundInfo: item,
                })
            }
        },

        // 选择基金
        checkAction(row = {}) {
            const { value, fundInfo = {} } = row
            if (value) {
                // 选择
                if (this.noCanSelect) {
                    this.$toast(this.$t('compare.selectLimit'))
                    return
                }
                const index = this.selectList.findIndex(item => item.symbol === fundInfo.symbol)
                if (index !== -1) {
                    this.selectList.splice(index, 1)
                }
                this.selectList.unshift(fundInfo)
            } else {
                //  取消选择
                const index = this.selectList.findIndex(item => item.symbol === fundInfo.symbol)
                if (index !== -1) {
                    this.selectList.splice(index, 1)
                }
            }
            this.syncCheckhandler(fundInfo.symbol, value)
        },

        // 同步更改选中与取消
        syncCheckhandler(symbol, check) {
            const keys = Object.keys(this.listMap)
            for (const key of keys) {
                const instance = this.listMap[key].find(item => item.symbol === symbol)
                instance && (instance.check = check)
            }
        },

        // 删除选择
        cancelSelectAction(symbol) {
            const index = this.selectList.findIndex(item => item.symbol === symbol)
            if (index > -1) {
                this.selectList.splice(index, 1)
            }
            this.syncCheckhandler(symbol, false)
        },

        // 开始对比
        comparisonAction() {
            if (!this.canComparison) return
            // 兜底 数量不能超过4条
            if (this.selectList.length > MAX_SELECT_NUM) {
                this.$toast(this.$t('compare.selectLimit'))
                return
            }
            const path = '/comparison-detail'
            const symbols = encodeURIComponent(JSON.stringify(this.selectList.map(item => item.symbol)))
            const url = location.origin + `/wealth/fund.html#${path}?symbols=${symbols}`
            if (this.$openPageInThs(url)) return
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: path,
                    query: {
                        symbols: symbols,
                    },
                })
            }
        },
    },
}
</script>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');

.select-fund {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #fff;
}

.page-item {
    flex: 0 0 auto;
}

.tabs {
    display: flex;
    width: 100%;
    padding: 7px 0;
    box-shadow: inset 0 -0.5px 0 #efefef;

    li {
        flex: 1;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 15px;
        line-height: 21px;
        text-align: center;
    }

    .tabs-item__active {
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
    }
}

.fund-list {
    flex: 1;
    height: 100%;
    margin-bottom: 48px;
    margin-bottom: calc(48px + constant(safe-area-inset-bottom));
    margin-bottom: calc(48px + env(safe-area-inset-bottom));
    overflow-y: scroll;

    .list-item {
        height: 100%;

        &__table {
            padding-left: 12px;
        }

        &__empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;

            img {
                width: 104px;
                height: 104px;
            }

            span {
                padding-top: 12px;
                color: #9c9c9c;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
            }
        }
    }
}

.expand-margin {
    margin-bottom: 120px;
    margin-bottom: calc(120px + constant(safe-area-inset-bottom));
    margin-bottom: calc(120px + env(safe-area-inset-bottom));
}

footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    background-color: #fff;
    box-shadow: inset 0 0.5px 0 #efefef;

    .selected-list {
        display: flex;
        padding: 10px 0;
        overflow-x: scroll;
        scrollbar-width: none; // 兼容firefox滚动条

        li {
            display: flex;
            flex: 0 0 auto;
            align-items: center;
            margin-right: 8px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 6px;

            p {
                flex: 0 0 auto;
                width: 81px;
                height: 32px;
                color: #2f2f2f;
                font-weight: 700;
                font-size: 12px;
                line-height: 16px;
            }

            img {
                width: 12px;
                height: 12px;
                margin-left: 10px;
            }
        }

        li:first-of-type {
            margin-left: 8px;
        }
    }

    .selected-list::-webkit-scrollbar {
        display: none;
    }

    .pd-b12 {
        padding-bottom: 12px !important;
    }

    .content {
        display: flex;
        place-content: center space-between;
        padding: 5px 12px;

        .fund-info {
            display: flex;
            flex-direction: column;

            .selected {
                color: #2f2f2f;
                font-weight: 400;
                font-size: 16px;
                line-height: 22px;
            }

            .limit {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 12px;
                line-height: 16px;
            }
        }

        button {
            padding: 7px 82px;
            color: #fff;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
            text-align: center;
            background: #ff6907;
            border-width: 0;
            border-radius: 38px;
            opacity: 0.3;
        }

        .can-comparison__btn {
            opacity: 1;
        }
    }
}
</style>
