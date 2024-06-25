import { set, del } from 'vue'

const state = () => ({
    downloadedImgMap: {},
})

const getters = {
    hadDownloadHeaderImg(state) {
        const downloadedImgMap = state.downloadedImgMap
        const allDownloaded = Object.values(downloadedImgMap).every(value => value === true)
        console.log('allDownloaded', allDownloaded)
        return allDownloaded
    },
    getHadDownImageCount(state) {
        return Object.keys(state.downloadedImgMap).length
    },
}

const mutations = {
    setDownloadSuccess(state, ossid) {
        set(state.downloadedImgMap, ossid, true)
        console.log('setDownloadSuccess ossid = ', state.downloadedImgMap)
    },
    setDownloadFailed(state, ossid) {
        set(state.downloadedImgMap, ossid, false)
        console.log('setDownloadFailed ossid = ', state.downloadedImgMap)
    },
    clearAll(state) {
        const downloadedImgMap = state.downloadedImgMap
        Object.keys(downloadedImgMap).forEach(key => del(downloadedImgMap, key))
        console.log('clear downloadHeaderImg, object = ', downloadedImgMap)
    },
}

export default {
    namespaced: true,
    getters,
    state,
    mutations,
}
