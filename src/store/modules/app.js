const state = () => ({
    theme: localStorage.getItem('theme') || 'light',
    lang: localStorage.getItem('lang') || 'zhCN', // 简体：zhCN，繁体：zhTC
    nav: false, // 是否显示头部的导航
    showLoading: false, // 显示loading
})

const getters = {
    getNav(state) {
        let showNav = state.nav
        if (!showNav) {
            showNav = localStorage.getItem('showNav')
        }
        return showNav
    },
}

const mutations = {
    updateLang(state, lang) {
        state.lang = lang
    },
    updateTheme(state, theme) {
        state.theme = theme
    },
    updateNav(state, nav) {
        state.nav = nav
    },
    updateShowLoading(state, value) {
        state.showLoading = value || false
    },
}

const actions = {
    setTheme({ commit, state }, theme) {
        theme = theme || state.theme
        // setTheme(theme)
        localStorage.setItem('theme', theme)
        commit('updateTheme', theme)
    },

    setLang({ commit, state }, local) {
        local = local || state.lang
        localStorage.setItem('lang', local)
        commit('updateLang', local)
    },
    setNav({ commit }, nav) {
        localStorage.setItem('showNav', nav)
        commit('updateNav', nav)
    },
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
    actions,
}
