/*
    调仓和创建组合 过程中,添加股票逻辑 mix
*/

import { getFundInfo } from '@/apis/fund/fund.js'
import { quote } from '@/apis/market.js'
import { isHLApp, floatToRatio } from '@/utils'
import { isEmpty } from '@/utils'
import NP from 'number-precision'

export default {
    data() {
        return {
            holdList: [],
            isFund: false,
        }
    },
    mixins: [],
    created() {},
    computed: {
        isInAPP() {
            return isHLApp()
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
                        rawSymbol: citem.rawSymbol || citem.RawSymbol,
                        ratio: citem.ratio,
                    }
                    if (this.isFund) {
                        param.ISIN = citem.productCode
                        param.currency = citem.currency
                        param.fundType = citem.industryCode
                    }
                    list.push(param)
                })
            })
            return list
        },
    },
    methods: {
        async getQuote(list) {
            if (this.isFund) {
                // 获取基金报价成功
                const symbols = list.map(item => item.mkt + item.rawSymbol)
                try {
                    const result = await getFundInfo({
                        symbols,
                        fields: ['latestNav', 'chgPct', 'ISIN'],
                    })
                    console.log('yinlong', result.result.list)
                    result.result.list.forEach(ritem => {
                        this.holdList.forEach(group => {
                            group.holding.forEach(citem => {
                                if (ritem.ISIN == citem.productCode) {
                                    console.log('yinlong', citem)
                                    citem.latestPrice = floatToRatio(ritem.latestNav, { rate: false, sign: false, base: 3 })
                                    citem.day1Return = floatToRatio(ritem.chgPct, { rate: false, sign: false })
                                }
                            })
                        })
                    })
                } catch (e) {
                    console.log('quote===>e:', e)
                }
            } else {
                // 获取股票报价
                const codes = list.map(item => item.mkt + item.rawSymbol)
                try {
                    const result = await quote({
                        codes,
                        fields: ['price', 'chgPct', 'power', 'mkt', 'rawSymbol'],
                    })
                    result.result.forEach(ritem => {
                        this.holdList.forEach(group => {
                            group.holding.forEach(citem => {
                                if (ritem.mkt + ritem.rawSymbol == citem.market + citem.productCode) {
                                    citem.latestPrice = floatToRatio(NP.divide(ritem.price, Math.pow(10, ritem.power)), {
                                        rate: false,
                                        sign: false,
                                        base: 3,
                                    })
                                    citem.day1Return = floatToRatio(NP.divide(ritem.chgPct, 100), { rate: false, sign: false })
                                }
                            })
                        })
                    })
                } catch (e) {
                    console.log('quote===>e:', e)
                }
            }
            this.refresh()
        },
        refresh() {
            this.holdList = JSON.parse(JSON.stringify(this.holdList))
        },
        removeNoRatioItem() {
            this.holdList.forEach(item => {
                item.holding = item.holding.filter(citem => {
                    return Number(citem.ratio) > 0
                })
            })
        },
        handleAddProduct(list) {
            this.removeNoRatioItem()
            const oldList = this.selectedList.map(item => item.mkt + item.rawSymbol) || []
            const addlist = list.filter(item => {
                if (!oldList.includes(item.mkt + item.rawSymbol)) {
                    item.market = item.mkt
                    item.ratio = '0.00'
                    item.productCode = item.rawSymbol
                    item.productType = item.mkt == 'hk' ? 1 : 2

                    if (this.isFund) {
                        item.productType = 3
                        item.industryCode = item.fundType
                        item.productCode = item.ISIN
                    }
                    return true
                }
                return false
            })
            this.getQuote(addlist)
            const map = {
                1: [],
                2: [],
                3: [],
                4: [],
                5: [],
            }
            if (this.isFund) {
                // 行业编码; 基金("1"：股票型， "2"：债券型， "3"：混合型， "4"：货币型，"5"：股权型)
                for (const newStock of addlist) {
                    map[newStock.industryCode].push(newStock)
                }
            } else {
                for (const newStock of addlist) {
                    if (newStock.market == 'hk') {
                        map[1].push(newStock)
                    } else {
                        map[2].push(newStock)
                    }
                }
            }

            for (const key in map) {
                const value = map[key]
                if (!isEmpty(value)) {
                    const group = this.holdList.find(group => {
                        return group.marketType == key
                    })
                    if (!isEmpty(group)) {
                        group.holding = group.holding?.concat(value)
                    } else {
                        this.holdList.push({
                            marketType: key,
                            holding: value,
                        })
                    }
                }
            }
            this.refresh()
        },
    },
}
