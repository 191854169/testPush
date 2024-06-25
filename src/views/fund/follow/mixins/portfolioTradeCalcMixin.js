/*
    模拟计算/一键跟单 股票组合买入计算逻辑
*/

import { getExchangeRate } from '@/apis/trade'
import { PORTFOLIO_TYPE_MAP } from '../../config/common'
import basicInfoMixin from './basicInfoMixin'
import NP from 'number-precision'
import { amountFilter } from '@/config/filters.js'
import { keepDecimals } from '@/utils'
import { calcTradePrice } from '../utils/tradeUtil'
export default {
    data() {
        return {
            toHKDRate: 0,
            toUSDRate: 0,
            period: 'HKD',
            holdingList: [],
            periodList: [
                { value: 'HKD', text: this.$t('HKD') },
                { value: 'USD', text: this.$t('USD') },
            ],
            // 用户输入基金最小起投金额时,对应每支基金的金额
            fundProductMap: {},
        }
    },
    mixins: [basicInfoMixin],
    created() {
        this.getData()
    },
    computed: {
        isFund() {
            return this.obj.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.PUBLIC_FUND
        },
        // 是否是股票
        isStock() {
            return [1, 2, 4].includes(this.obj.portfolioType)
        },
        isMixinType() {
            return this.obj.portfolioType === PORTFOLIO_TYPE_MAP.keysMap.mixin
        },
        currency() {
            if (this.isMixinType) {
                return this.period
            }
            return this.obj.currency
        },
        currentRate() {
            if (this.isMixinType) {
                if (this.currency === 'HKD') {
                    return this.toHKDRate
                }
                return this.toUSDRate
            }
            return 1
        },
        opposeCurrentRate() {
            if (this.isMixinType) {
                if (this.currency === 'HKD') {
                    return this.toUSDRate
                }
                return this.toHKDRate
            }
            return 1
        },
        leadHoldingList() {
            const holding = this.holdingList
                ?.reduce((l, group) => {
                    l.push(...group.holding)
                    return l
                }, [])
                .sort((a, b) => +b.ratio - +a.ratio)

            return holding || []
        },
        startFundAmount() {
            // 抽象的起投金额（包含现金部分）
            let absStartAmount = Math.max(
                ...this.leadHoldingList.map(i => {
                    if (i.ratio && Number(i.ratio) !== 0) {
                        return NP.divide(i.minInitial, NP.divide(i.ratio, 100))
                    }
                    return 0
                })
            )
            // 防止除不尽被截断
            absStartAmount = NP.plus(0.001, absStartAmount)
            return absStartAmount
        },
        // 基金组合的最小投资金额
        fundMinInitial() {
            const checkedList = this.leadHoldingList
            const absStartAmount = this.startFundAmount
            const calcLatestPrice = i => {
                const ret = keepDecimals(NP.times(absStartAmount, NP.divide(i.ratio, 100)), 2)
                this.fundProductMap[i.productCode] = keepDecimals(ret, 2)
                return ret
            }
            const ret = checkedList.reduce((amt, c) => ((amt = NP.plus(amt, calcLatestPrice(c))), amt), 0)
            console.log(`yinlong fundMinInitial: ${ret} startFundAmount: ${this.startFundAmount}`)
            return ret.toString()
        },
        startStockAmount() {
            let absStartAmount = Math.max(
                ...this.leadHoldingList.map(i => {
                    if (i.ratio && Number(i.ratio) !== 0) {
                        return NP.divide(NP.times(i.minTradeUnit, this.calcPrice(i)), NP.divide(i.ratio, 100))
                    }
                    return 0.0
                })
            )
            // 抽象的起投金额（包含现金部分）
            // 防止除不尽被截断
            absStartAmount = NP.plus(0.001, absStartAmount)
            return absStartAmount
        },
        // 股票组合的最优买入金额, 用于实际计算
        stockBestAmount() {
            const calcLatestPrice = i => {
                // 整手股数
                const ret = this.calcNumberOfStock(this.startStockAmount, i)
                // 整手股数总价格
                return NP.times(ret, this.calcPrice(i))
            }
            const ret = this.leadHoldingList.reduce((amt, c) => ((amt = NP.plus(amt, calcLatestPrice(c))), amt), 0)
            console.log(`yinlong stockBestAmount: ${ret} startStockAmount: ${this.startStockAmount}`)
            return ret.toString()
        },
        // 股票组合的最优买入金额,根据股票手数取整, 用于展示
        stockBestAmountFixed() {
            return amountFilter(keepDecimals(this.stockBestAmount, 2))
        },
    },
    methods: {
        async getExchangeRate() {
            try {
                const { result } = await getExchangeRate()
                this.toHKDRate = result.list.filter(item => {
                    return item.fromCurrency === 'USD' && item.toCurrency === 'HKD'
                })[0].rate
                this.toUSDRate = result.list.filter(item => {
                    return item.fromCurrency === 'HKD' && item.toCurrency === 'USD'
                })[0].rate
                console.log('data===>getExchangeRate', result.list, `toHKDRate:${this.toHKDRate}`, `toUSDRate: ${this.toUSDRate}`)
                //console.log(`stock Best Amount ${this.startStockAmount} Fixed: ${this.stockBestAmountFixed} fund ${this.fundMinInitial}`)
            } catch (e) {
                console.error('getExchangeRate error', e)
            }
        },
        /**
         * 计算汇率换算后的价格
         * NOTE：股票才需要使用
         * @param {*} item 产品对象集合
         * @param {*} item.currency 产品币种
         * @param {*} item.latestPrice 产品当前价格
         * @returns { Number|String } 根据汇率计算后的价格
         */
        calcPrice(item) {
            const price = this.isStock ? calcTradePrice(item) : item.latestPrice
            if (this.isMixinType && item.currency !== this.period && this.currentRate) {
                return NP.times(price, this.currentRate)
            }
            return price
        },
        // 计算可买入股数
        calcNumberOfStock(amount, item) {
            let number = NP.times(amount, NP.divide(item.ratio, 100))
            //console.log('   yinlong 1 计算买入价钱', number, item.ratio, NP.divide(item.ratio, 100), item.name)
            // 换算汇率价格
            const price = this.calcPrice(item)
            // 计算股数
            number = NP.divide(number, price)
            //console.log('   yinlong 2 计算股数', number, item.name)
            // 向下取整
            number = Math.trunc(NP.divide(number, item.minTradeUnit))
            //console.log('   yinlong 3 计算手数', number, item.name)
            // 算出来最终结果 整手股数
            number = NP.times(number, item.minTradeUnit)
            //console.log('   yinlong 4 计算股数', number, item.name)
            return number
        },
    },
}
