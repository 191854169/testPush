import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import app from './modules/app'
import headerPortrait from './modules/headerPortrait'

Vue.use(Vuex)

const _store = new Vuex.Store({
    modules: {
        app,
        user,
        headerPortrait,
    },
})

export default _store
