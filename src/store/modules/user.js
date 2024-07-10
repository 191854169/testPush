import { getUserDetail, getSubAcctDetail, getIpoQuestionnaireStatus } from '@/apis/uc.js'
import { ecashUserStatus } from '@/apis/wealth/index.js'
import JSBridge from '@fs/jsbridge/dist/lib/jsBridge.js'
import { env } from '@/config/globalProterties/env'
import { getQueryString, isEmpty, isUndefined } from '@/utils'

// import {isDeviceMobile} from '@/utils/tools.js'
const LASTLOGIN_KEY = 'lastLogin'
const USERINFO_KEY = 'userInfo'
const RND_KEY = 'rndKey'
const RND_KEY_2 = 'rndKey2'
const SESSION = 'session'
const SESSION_2 = 'session2'
const UIN = 'uin'
const SUB = 'sub'
// function setTempData(){
// 	localStorage.setItem(SESSION,'3177ae5fb0054d85a497dd429b367d2d')
// 	localStorage.setItem(UIN,1002367)
// 	localStorage.setItem('userInfo',JSON.stringify({cltId:165,acctId:162,subAcctId:'886611044',clientInfo:{accts:[{"acctId": "162","subAcctId": "886611044","cltId": 165}]}}))
// 	localStorage.setItem('rndKey','5fe1b4c5fb415e9be5abe4f56555e262')
// }
//浏览器本地测试时手动设置信息使用
// if(!isDeviceMobile()&&process.env.NODE_ENV=='development'){
// 	setTempData()
// }
const userInfo = JSON.parse(localStorage.getItem(USERINFO_KEY) || '{}')
const lastLogin = JSON.parse(localStorage.getItem(LASTLOGIN_KEY) || '{}')

const state = () => ({
    session: localStorage.getItem(SESSION) || '',
    session2: localStorage.getItem(SESSION_2) || '',
    uin: Number(localStorage.getItem(UIN)) || '',
    rndKey: localStorage.getItem(RND_KEY) || '',
    rndKey2: localStorage.getItem(RND_KEY_2) || '',
    userInfo,
    lastLogin,
    WTtoken: '', // 从旧版网厅调过来带的 token
    WTuserName: '', // 从网厅带过来的用户名
    subAccountId: '', // 临时登陆账号
    accts: userInfo?.clientInfo ? userInfo.clientInfo?.accts?.[0] || {} : {}, //登录账号信息
    hlId: '',
    ecashStatusInfo: {}, // 星财宝信息； openStatus：int，开通状态 0-未开通，1-已开通,openTime：int,开通时间 "YY-MM-DD HH:MM:SS"，effectiveStatus: int,生效状态 0-未生效 1-已生效  timesteamp: 当前服务器时间
    ftdAccountInfo: undefined, // 定存宝信息； undefined - 未获取接口 null - 表示未开通 {} - 表示已开通
    starSpecialAccountInfo: undefined, // 星财宝专户信息； undefined - 未获取接口 null - 表示未开通 {} - 表示已开通
    investmentAccountInfo: undefined, // 投顾组合信息； undefined - 未获取接口 null - 表示未开通 {} - 表示已开通
    tzymAccountInfo: undefined, // 投资移居专户信息； undefined - 未获取接口 null - 表示未开通 {} - 表示已开通

    // 资产相关字段
    currency: localStorage.getItem('currency') || 'USD', // 资产净值默认为美元
    showAsset: JSON.parse(localStorage.getItem('showAsset') || 'true'), // 显示与隐藏资产

    // 虚拟资产ETF IPO问卷评估状态
    etfIpoQuestionnaireStatusInfo: undefined,
})

const getters = {
    getServerTime(state) {
        return new Date().getTime() - state.localTime + state.serverTime
    },
    getWTtoken(state) {
        return state.WTtoken || localStorage.getItem('WTtoken') || ''
    },
    getWTuserName(state) {
        return state.WTuserName || localStorage.getItem('WTuserName') || ''
    },
    getSubAccountId(state) {
        return state.subAccountId || localStorage.getItem('sub')
    },
    getWTEddaWhite(state) {
        return state.WTEddaWhite || sessionStorage.getItem('WTEddaWhite') || ''
    },
    getAccts(state) {
        return state.accts
    },
    getTzymAccountInfo(state) {
        return state.tzymAccountInfo
    },
    getEtfIpoQuestionnaireStatusInfo(state) {
        return state.etfIpoQuestionnaireStatusInfo
    },
}

const mutations = {
    updateSession(state, { uin = '', rndKey = '', session = '' } = {}) {
        state.uin = uin
        state.rndKey = rndKey
        state.session = session
        localStorage.setItem(UIN, uin)
        localStorage.setItem(SESSION, session)
        localStorage.setItem(RND_KEY, rndKey)
    },
    updateSession2(state, { rndKey2 = '', session2 = '' } = {}) {
        state.rndKey2 = rndKey2
        state.session2 = session2
        localStorage.setItem(SESSION_2, session2)
        localStorage.setItem(RND_KEY_2, rndKey2)
    },
    updateUserInfo(state, userInfo) {
        localStorage.setItem(USERINFO_KEY, JSON.stringify(userInfo))
        state.userInfo = userInfo || {}
    },
    updateLastLogin(state, { areaCode = '+86', username = '' } = {}) {
        const lastLogin = { areaCode, username }
        localStorage.setItem(LASTLOGIN_KEY, JSON.stringify(lastLogin))
        state.lastLogin = lastLogin
    },
    updateServerTime(state, time) {
        state.serverTime = time
        state.localTime = Math.floor(new Date().getTime())
    },
    updateWTtoken(state, wtToken) {
        localStorage.setItem('WTtoken', wtToken)
        state.WTtoken = wtToken
    },
    updateWTuserName(state, WTuserName) {
        localStorage.setItem('WTuserName', WTuserName)
        state.WTuserName = WTuserName
    },
    updateSubAccountId(state, sub) {
        localStorage.setItem('sub', sub)
        sessionStorage.setItem('sub', sub) // 存储在 sessionStorage 里面是为了给客服的时候使用，页面关闭自动清除，避免用错
        state.subAccountId = sub
    },
    updateHlId(state, hlId) {
        sessionStorage.setItem('hlId', hlId) // 存储在 sessionStorage 里面是为了给客服的时候使用，页面关闭自动清除，避免用错
        state.hlId = hlId
    },
    updateAccts(state, sub) {
        state.accts = sub
        localStorage.setItem('accts', JSON.stringify(sub))
    },
    updateTzymAccountInfo(state, info) {
        state.tzymAccountInfo = info
    },
    updateEcashStatus(state, sub) {
        state.ecashStatusInfo = sub
    },
    updateFtdAccountInfo(state, info) {
        state.ftdAccountInfo = info
    },
    updateStarSpecialAccountInfo(state, info) {
        state.starSpecialAccountInfo = info
    },
    updateInvestmentAccountInfo(state, info) {
        state.investmentAccountInfo = info
    },

    // 更新资产选择的货币类型
    updateCurrency(state, currency) {
        state.currency = currency
        localStorage.setItem('currency', currency)
    },
    // 更新资产显示与隐藏状态
    updateShowAsset(state, showAsset) {
        state.showAsset = showAsset
        localStorage.setItem('showAsset', showAsset)
    },
    updateEtfIpoQuestionnaireStatusInfo(state, info) {
        state.etfIpoQuestionnaireStatusInfo = info
    },
}

const actions = {
    //同步app用户信息
    // forceClose - 如果关闭登录就强制关闭当前webview
    login({ dispatch, commit }, forceClose = true) {
        return new Promise(resolve => {
            if (JSBridge) {
                JSBridge.login()
                    .then(async res => {
                        commit('updateSession', {
                            uin: res.uin + '',
                            rndKey: res.rndkey,
                            session: res.senssion,
                        })

                        await dispatch('getUserInfo')
                        resolve(res)
                    })
                    .catch(() => {
                        if (forceClose) {
                            JSBridge.close()
                        }
                    })
            } else {
                resolve()
            }
        })
    },
    setUserInfo({ commit }, userInfo) {
        if (userInfo) {
            localStorage.setItem(USERINFO_KEY, JSON.stringify(userInfo))
        } else {
            localStorage.removeItem(USERINFO_KEY)
        }
        commit('updateUserInfo', userInfo)
    },
    /**
     * 获取用户信息
     * @param {*} param0
     * @param {*} toLogin 默认是Boolean值，支持传入对象{toLogin: Boolean, isRefresh: Boolean}
     * @returns { Object | false | undefined } Object说明登录态拿到了信息、false代表未登录、undefined说明不在App内部
     */
    async getUserInfo({ dispatch, commit }, toLogin = true) {
        const isToLogin = typeof toLogin === 'boolean' ? toLogin : toLogin.toLogin
        const isRefresh = typeof toLogin === 'object' ? toLogin.isRefresh : false
        return new Promise((resolve, reject) => {
            if (JSBridge) {
                JSBridge.getUserinfo({ refresh: isRefresh })
                    .then(res => {
                        commit('updateSession', {
                            uin: res.uin + '',
                            rndKey: res.rndkey,
                            session: res.session,
                        })
                        commit('updateWTuserName', res.clientInfo?.accts?.[0]['englishName'] || '')
                        commit('updateSubAccountId', res.clientInfo?.accts?.[0]['subAcctId'] || '')
                        commit('updateHlId', res.hlId || '')
                        commit('updateAccts', res.clientInfo?.accts?.[0] || '')
                        commit('updateUserInfo', res)
                        // 兼容app版本低没有定存宝开户状态的情况
                        if (res.clientInfo?.accts[0]?.ftdInfo) {
                            commit('updateFtdAccountInfo', res.clientInfo?.accts[0]?.ftdInfo)
                        }
                        // 兼容app版本低没有星财宝专户开户状态的情况
                        if (res.clientInfo?.accts[0]?.xjbInfo) {
                            commit('updateStarSpecialAccountInfo', res.clientInfo?.accts[0]?.xjbInfo)
                        }

                        // 兼容app版本低没有投顾开户状态的情况
                        if (res.clientInfo?.accts[0]?.tgInfo) {
                            commit('updateInvestmentAccountInfo', res.clientInfo?.accts[0]?.tgInfo)
                        }
                        // 兼容app版本低没有投资移居专户开户状态的情况
                        if (res.clientInfo?.accts[0]?.tzymInfo) {
                            commit('updateTzymAccountInfo', res.clientInfo?.accts[0]?.tzymInfo)
                        }

                        dispatch('setUserInfo', res)
                        resolve(res)
                    })
                    .catch(() => {
                        if (isToLogin) {
                            dispatch('login').then(res => {
                                resolve(res)
                            })
                        } else {
                            reject(false)
                            // 获取用户信息失败就说明登录失效，清空用户信息
                            ;[SESSION, UIN, 'userInfo', 'WTtoken', 'WTuserName', SUB, 'WTEddaWhite', 'accts'].forEach(k => {
                                localStorage.removeItem(k)
                            })
                        }
                    })
            } else {
                // 3站外、4中移动、5同花顺国际版
                if ([3, 4, 5].includes(env)) {
                    getUserDetail()
                        .then(data => {
                            const res = data.result || {}
                            commit('updateWTuserName', res.clientInfo?.accts[0]['englishName'] || '')
                            commit('updateSubAccountId', res.clientInfo?.accts[0]['subAcctId'] || '')
                            commit('updateHlId', res.hlId || '')
                            commit('updateAccts', res.clientInfo?.accts[0] || '')
                            dispatch('setUserInfo', res)
                            commit('updateFtdAccountInfo', res.clientInfo?.accts[0]?.ftdInfo)
                            commit('updateStarSpecialAccountInfo', res.clientInfo?.accts[0]?.xjbInfo)
                            commit('updateInvestmentAccountInfo', res.clientInfo?.accts[0]?.tgInfo)
                            commit('updateTzymAccountInfo', res.clientInfo?.accts[0]?.tzymInfo)
                            resolve(res)
                        })
                        .catch(() => {
                            dispatch('clearUserInfo')
                            reject(false)
                        })
                } else if (env === 2) {
                    const subAccountId = getQueryString('sub', true) || localStorage.getItem('sub')
                    getSubAcctDetail({ params: { subAccountId } })
                        .then(data => {
                            // eslint-disable-next-line prefer-const
                            let { userInfo = {}, clientInfo = {} } = data.result || {}
                            commit('updateWTuserName', clientInfo?.chineseName || '')
                            commit('updateSubAccountId', clientInfo.subAcctId || '')
                            commit('updateHlId', userInfo.hlId || '')
                            commit('updateAccts', clientInfo || {})
                            commit('updateSession', {
                                uin: userInfo.uin ? userInfo.uin + '' : '',
                            })
                            userInfo = { ...userInfo, clientStatus: 31 /* 证券账户已经开通 */, clientInfo: { accts: [clientInfo] } }
                            dispatch('setUserInfo', userInfo)
                            commit('updateFtdAccountInfo', clientInfo?.ftdInfo)
                            commit('updateStarSpecialAccountInfo', clientInfo?.xjbInfo)
                            commit('updateInvestmentAccountInfo', clientInfo?.tgInfo)
                            commit('updateTzymAccountInfo', clientInfo?.tzymInfo)
                            resolve(data.result)
                        })
                        .catch(() => {
                            reject(false)
                        })
                } else {
                    resolve()
                }
            }
        })
    },

    // 清空用户数据
    clearUserInfo({ dispatch, commit }) {
        commit('updateSession')
        dispatch('setUserInfo', {})
        localStorage.removeItem(SESSION)
        localStorage.removeItem(UIN)
        localStorage.removeItem(SUB)
        localStorage.removeItem(RND_KEY)
    },

    logout({ dispatch, commit }) {
        commit('updateSession')
        dispatch('setUserInfo', null)
        localStorage.removeItem(SESSION)
        localStorage.removeItem(UIN)
        dispatch('getUserInfo')
    },

    setWTToken({ commit }, wtToken) {
        commit('updateWTtoken', wtToken)
    },
    setWTuserName({ commit }, WTuserName) {
        commit('updateWTuserName', WTuserName)
    },
    setSubAccountId({ commit }, sub) {
        commit('updateSubAccountId', sub)
    },
    updateAccts({ commit }, sub) {
        commit('updateAccts', sub)
    },
    setSession({ commit }, res) {
        commit('updateSession', {
            uin: res.uin + '',
            rndKey: res.rndkey,
            session: res.session,
        })
    },
    setSession2({ commit }, res) {
        commit('updateSession2', {
            rndKey2: res.rndkey2,
            session2: res.session2,
        })
    },
    // 获取星财宝开通信息  force:是否强制刷新重新获取信息
    getEcashStatus({ commit, state }, force = false) {
        return new Promise((resolve, reject) => {
            if (!isEmpty(state.ecashStatusInfo) && !force) {
                resolve(state.ecashStatusInfo)
            } else {
                ecashUserStatus()
                    .then(response => {
                        const { result = {} } = response
                        commit('updateEcashStatus', result)
                        resolve(state.ecashStatusInfo)
                    })
                    .catch(err => {
                        commit('updateEcashStatus', {})
                        reject(err)
                    })
            }
        })
    },
    /**
     * NOTE: 主要是为了兼容APP内低版本的UserInfo接口不会返回专户信息字段 - 尽量都使用该action来判断
     * 获取专户的开通信息（包含定存宝、星财宝专户、投顾组合）第一次会更新全部专户的信息到本地
     * @param {*} param0
     * @param {*} param1
     * @param {*} param1.force 是否强制刷新重新获取信息
     * @param {*} param1.type 专户类型 ftd | xcb | investment
     * @returns
     */
    async getSpecialAccountStatus({ commit, state }, { force = false, type = '' } = {}) {
        const fetchSpecialAccountInfo = async function (resFnc, rejFnc) {
            let info = null
            switch (type) {
                case 'ftd':
                    info = state.ftdAccountInfo
                    break
                case 'xcb':
                    info = state.starSpecialAccountInfo
                    break
                case 'investment':
                    info = state.investmentAccountInfo
                    break
                case 'tzym':
                    info = state.tzymAccountInfo
                    break
                default:
                    break
            }
            // 是否已经获取到专户信息，如果已经返回则直接返回
            if (!isUndefined(info) && !force) {
                return resFnc(info)
            }

            try {
                let ftdInfo = null
                let xjbInfo = null
                let tgInfo = null
                let tzymInfo = null
                if (env === 2) {
                    const subAccountId = getQueryString('sub', true) || localStorage.getItem('sub')
                    const { result } = await getSubAcctDetail({ params: { subAccountId } })
                    ftdInfo = result?.clientInfo?.ftdInfo
                    xjbInfo = result?.clientInfo?.xjbInfo
                    tgInfo = result?.clientInfo?.tgInfo
                    tzymInfo = result?.clientInfo?.tzymInfo
                } else {
                    const { result } = await getUserDetail()
                    ftdInfo = result?.clientInfo?.accts?.[0]?.ftdInfo
                    xjbInfo = result?.clientInfo?.accts?.[0]?.xjbInfo
                    tgInfo = result?.clientInfo?.accts?.[0]?.tgInfo
                    tzymInfo = result?.clientInfo?.accts?.[0]?.tzymInfo
                }
                commit('updateFtdAccountInfo', ftdInfo)
                commit('updateStarSpecialAccountInfo', xjbInfo)
                commit('updateInvestmentAccountInfo', tgInfo)
                commit('updateTzymAccountInfo', tzymInfo)

                switch (type) {
                    case 'ftd':
                        info = ftdInfo
                        break
                    case 'xcb':
                        info = xjbInfo
                        break
                    case 'investment':
                        info = tgInfo
                        break
                    case 'tzym':
                        info = tzymInfo
                        break
                    default:
                        break
                }
                resFnc(info)
            } catch (e) {
                commit('updateFtdAccountInfo', undefined)
                commit('updateStarSpecialAccountInfo', undefined)
                commit('updateInvestmentAccountInfo', undefined)
                commit('updateTzymAccountInfo', undefined)
                rejFnc(e)
            }
        }

        const retPromise = new Promise((resolve, reject) => {
            fetchSpecialAccountInfo(resolve, reject)
        })

        return retPromise
    },
    // 获取定存宝开通信息  force:是否强制刷新重新获取信息
    // NOTE：主要是为了兼容APP内低版本的UserInfo接口不会返回ftdInfo字段 - 尽量都使用改action来判断
    async getftdAccountStatus({ commit, state }, force = false) {
        const fetchFtdAccountInfo = async function (resFnc, rejFnc) {
            if (!isUndefined(state.ftdAccountInfo) && !force) {
                resFnc(state.ftdAccountInfo)
            } else {
                try {
                    let ftdInfo = null
                    if (env === 2) {
                        const subAccountId = getQueryString('sub', true) || localStorage.getItem('sub')
                        const { result } = await getSubAcctDetail({ params: { subAccountId } })
                        ftdInfo = result?.clientInfo?.ftdInfo
                    } else {
                        const { result } = await getUserDetail()
                        ftdInfo = result?.clientInfo?.accts?.[0]?.ftdInfo
                    }
                    commit('updateFtdAccountInfo', ftdInfo)
                    resFnc(ftdInfo)
                } catch (e) {
                    commit('updateFtdAccountInfo', undefined)
                    rejFnc(e)
                }
            }
        }
        const retPromise = new Promise((resolve, reject) => {
            fetchFtdAccountInfo(resolve, reject)
        })

        return retPromise
    },
    // 获取星财宝专户开通信息  force:是否强制刷新重新获取信息
    // NOTE：主要是为了兼容APP内低版本的UserInfo接口不会返回ftdInfo字段 - 尽量都使用改action来判断
    async getStarSpecialAccountStatus({ commit, state }, force = false) {
        const fetchStarSpecialAccountInfo = async function (resFnc, rejFnc) {
            if (!isUndefined(state.StarSpecialAccountInfo) && !force) {
                resFnc(state.StarSpecialAccountInfo)
            } else {
                try {
                    let xjbInfo = null
                    if (env === 2) {
                        const subAccountId = getQueryString('sub', true) || localStorage.getItem('sub')
                        const { result } = await getSubAcctDetail({ params: { subAccountId } })
                        xjbInfo = result?.clientInfo?.xjbInfo
                    } else {
                        const { result } = await getUserDetail()
                        xjbInfo = result?.clientInfo?.accts?.[0]?.xjbInfo
                    }
                    commit('updateStarSpecialAccountInfo', xjbInfo)
                    resFnc(xjbInfo)
                } catch (e) {
                    commit('updateStarSpecialAccountInfo', undefined)
                    rejFnc(e)
                }
            }
        }
        const retPromise = new Promise((resolve, reject) => {
            fetchStarSpecialAccountInfo(resolve, reject)
        })

        return retPromise
    },
    // 获取虚拟资产ETF的IPO问卷评估状态  force:是否强制刷新重新获取信息
    async getEtfIpoQuestionnaireStatus({ commit, state }, force = false) {
        return new Promise((resolve, reject) => {
            if (!isEmpty(state.etfIpoQuestionnaireStatusInfo) && !force) {
                resolve(state.etfIpoQuestionnaireStatusInfo)
            } else {
                const cltId = state.accts?.cltId || 0
                getIpoQuestionnaireStatus({ cltId: cltId })
                    .then(response => {
                        const { result = {} } = response
                        commit('updateEtfIpoQuestionnaireStatusInfo', result)
                        resolve(state.etfIpoQuestionnaireStatusInfo)
                    })
                    .catch(err => {
                        commit('updateEtfIpoQuestionnaireStatusInfo', {})
                        reject(err)
                    })
            }
        })
    },
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions,
}
