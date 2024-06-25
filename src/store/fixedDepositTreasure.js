import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import app from './modules/app'
import { xorBy } from 'lodash'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        app,
        user,
    },
    state: {
        allCoupons: [], // 后端接口获取到的所有卡券
        canUseCouponsAfterFilter: [], // 输入认购金额后筛选key卡券，从allCoupons中筛选
        isSelectedCoupon: [], // 选择使用的卡券，长度为1
        subscriptionAmount: '', // 计入卡券列表页把认购金额保存起来，从列表返回认购页把值回填
        persistenceProductInfo: {}, // 计入卡券列表页把认购金额保存起来，用于计算额外加息等
        additionAmount: 0,
    },
    getters: {
        all: state => state.allCoupons,
        canUseCoupons: state => state.canUseCouponsAfterFilter,
        selectedCoupon: state => state.isSelectedCoupon,
        disabledCoupons: state => xorBy(state.allCoupons, state.canUseCouponsAfterFilter, item => item.id),
        subscriptionAmount: state => state.subscriptionAmount,
        persistenceProductInfo: state => state.persistenceProductInfo,
        additionAmount: state => state.additionAmount,
        selectedCouponId: state => state.isSelectedCoupon[0]?.id || 0,
    },
    mutations: {
        updateAllCoupons(state, list) {
            state.allCoupons = list
        },
        updateCanUseCoupons(state, list) {
            state.canUseCouponsAfterFilter = list
        },
        updateIsSelectedCoupons(state, payload) {
            state.isSelectedCoupon = payload
        },
        updateSubscriptionAmount(state, amount) {
            state.subscriptionAmount = amount
        },
        updateProductInfo(state, info) {
            state.persistenceProductInfo = info
        },
        updateAdditionalAmount(state, amount) {
            state.additionAmount = amount
        },
    },
    actions: {
        commitAllCoupons({ commit }, list) {
            commit(
                'updateAllCoupons',
                list.filter(i => i.extInfos?.raiseInterest?.productType === 'ftd')
            )
        },
        commitCanUseCoupons({ commit, state }, { subscriptionAmount, minSubscriptionAmount, currency }) {
            const allCoupons = state.allCoupons
            let newList
            if (subscriptionAmount < minSubscriptionAmount) {
                newList = []
            } else {
                if (currency === 'HKD') {
                    newList = allCoupons.filter(i => i.isCanUse === 1 && subscriptionAmount >= i.extInfos?.raiseInterest?.minHoldingValue)
                } else if (currency === 'USD') {
                    newList = allCoupons.filter(i => i.isCanUse === 1 && subscriptionAmount >= i.extInfos?.raiseInterest?.minHoldingValueUSD)
                } else {
                    newList = []
                }
            }
            console.log('newList:', newList)
            commit('updateCanUseCoupons', newList)
        },
        commitSelectedCoupon({ commit }, list) {
            commit('updateIsSelectedCoupons', list)
        },
        commitSubscriptionAmount({ commit }, amount) {
            commit('updateSubscriptionAmount', amount)
        },
        commitProductInfo({ commit }, info) {
            commit('updateProductInfo', info)
        },
        commitAdditionalAmount({ commit }, amount) {
            commit('updateAdditionalAmount', amount)
        },
        // 非卡券列表页进入，vuex卡券相关的选中态恢复初始值
        commitBeginStatus({ commit }) {
            commit('updateCanUseCoupons', [])
            commit('updateIsSelectedCoupons', [])
            commit('updateSubscriptionAmount', '')
            commit('updateAdditionalAmount', 0)
        },
    },
})

export default store
