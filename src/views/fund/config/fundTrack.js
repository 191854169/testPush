// 公募基金足迹KEY
const pubFundTrackKey = 'PUB_FUND_TRACK'

// 公募足迹最大存储位数
const pubMaxTrack = 10

// 获取公募基金足迹
export const getPubFundTrack = () => {
    return localStorage.getItem(pubFundTrackKey) ? JSON.parse(localStorage.getItem(pubFundTrackKey)) : []
}

// 添加公募基金足迹 (存储 symbol)
export const setPubFundTrack = symbol => {
    const list = getPubFundTrack()
    const index = list.findIndex(item => item === symbol)
    if (index !== -1) {
        list.splice(index, 1)
    }
    list.unshift(symbol)
    // 存储数量限制
    if (list.length > pubMaxTrack) {
        list.length = pubMaxTrack
    }
    localStorage.setItem(pubFundTrackKey, JSON.stringify(list))
}
