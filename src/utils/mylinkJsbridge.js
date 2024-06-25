// MYLINK的JSBridge

function system() {
    const name = window.navigator.userAgent.match(/hshhk\/([^/]+)\//)?.[1]
    if (!name) throw new Error('system name is undefined')
    return name
}

function callAndroidJsbridge(event, obj) {
    !event && (event = obj.event)
    obj && typeof obj === 'object' && (obj = JSON.stringify(obj))
    return [undefined, null].includes(obj) ? window?.HkAndroid?.[event]() : window?.HkAndroid?.[event](obj)
}
function callIosJsbridge(event, obj) {
    !event && (event = obj.event)
    obj && typeof obj === 'object' && (obj = JSON.stringify(obj))
    return [undefined, null].includes(obj)
        ? window?.webkit?.messageHandlers?.[event]?.postMessage()
        : window?.webkit?.messageHandlers?.[event]?.postMessage(obj)
}

const MYLINK_JSBRIDGE = {
    isInMylink: function () {
        return /hshhk/.test(window.navigator.userAgent)
    },
    registerCallback: function (callback = '', success = () => {}, failure = () => {}) {
        if (!callback) {
            const EXPAND_TIMES = 10000
            callback = `mylink_${Date.now()}${Math.floor(Math.random() * EXPAND_TIMES)}`
        }
        console.log(`Feng.chen:: 11:03:55 callback ===> `, callback)
        window[callback] = (data, err) => {
            console.log(`Feng.chen:: 10:58:30 data ===> `, data)
            success(data)
            if (err) {
                return failure(err)
            }
        }
        return callback
    },
    /**
     * 调用app的事件
     * @param {String} event 调用的jsbridge的事件名
     * @param {Object} obj 参数对象
     * @returns { Promise }
     */
    callApp: function (event, options) {
        let resolve = null
        let reject = null
        const retPromise = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })
        try {
            const name = system()
            const isAndroid = name === 'android' // android终端
            const isiOS = name === 'ios' // ios终端
            // 由于安卓和IOS存在差异性 - 仅需要的jsBridge会传入callbackName
            if (options?.needCallback) {
                delete options.needCallback // 删除多余的参数
                // 注册回调
                options.callbackName = this.registerCallback(options.callbackName, resolve, reject)
            } else {
                // 不需要回调的事件，直接完成promise
                resolve()
            }
            let ret = null
            if (isAndroid) {
                ret = callAndroidJsbridge(event, options)
            }
            if (isiOS) {
                ret = callIosJsbridge(event, options)
            }
            console.log(event, ' ====> ', ret)
            ret?.then(d => {
                console.log(d)
            })
        } catch (error) {
            reject(error)
        }
        return retPromise
    },
    getLocationHandlerName: function () {
        return this.callApp('getLocationHandlerName')
    },
    isIos() {
        return system() === 'ios'
    },
    isAndroid() {
        return system() === 'android'
    },
    backToHomePage: function () {
        let ops = ''
        if (this.isAndroid()) {
            ops = undefined
        } else if (this.isIos()) {
            ops = {}
        }
        return this.callApp('backToHomePage', ops)
    },
    changeThemeColor: function () {},
    closeWebview: function () {
        let opt = ''
        if (this.isAndroid()) {
            // TODO 需要mylink 在五月上旬的版本才支持，因此需要此功能的安卓需暂时采用backToHomePage
            opt = 'closeAll'
        } else if (this.isIos()) {
            opt = ''
        }
        return this.callApp('closeWebview', opt)
    },
    createDotsWithCustomActions: function () {},
    enterLiveRoom: function () {},
    fetchContacts: function () {},
    fetchCurrentUserRandkingData: function () {},
    fetchRandkingDatas: function () {},
    getAdAuthJsonWithCallback: function () {},
    getAppMode: function () {
        return this.callApp('getAppMode')
    },
    getBossInfoWithCallback: function () {},
    getCurrentThemeColor: function () {},
    getAndroidApiVersionMap() {
        return {
            33: '13',
            32: '12',
            31: '12',
            30: '11',
            29: '10',
            28: '9',
            27: '8',
            26: '7',
        }
    },
    getDeviceInfoWithCallback: function () {
        return this.callApp('getDeviceInfoWithCallback', { needCallback: true }).then(res => {
            let osVersion = res.osVersion

            const name = system()
            const isAndroid = name === 'android' // android终端

            osVersion = res.os?.toLowerCase().split(name)[1]?.replace(/\s/g, '')

            if (isAndroid) {
                const AndroidApiVersionMap = this.getAndroidApiVersionMap()
                osVersion = AndroidApiVersionMap[osVersion]
            }

            return {
                osVersion: osVersion ?? '',
                ...res,
            }
        })
    },
    getH5Cache: function () {},
    getIDCamera: function () {},
    getRoamingSubAccount: function () {},
    getVersionInfoWithCallback: function () {},
    getWeatherIcon: function () {},
    h5Cache: function () {},
    initShare: function () {},
    logEventStatistics: function () {},
    onNativeBackClick: function (opt) {
        if (!opt) {
            if (this.isAndroid()) {
                opt = undefined
            } else if (this.isIos()) {
                opt = ''
            }
        }
        return this.callApp('onNativeBackClick', opt)
    },
    openThirdPartyApp: function () {},
    pageViewStatistics: function () {},
    registerAsMyLinkMember: function () {},
    requestContactPermission: function () {},
    saveInviteUserPosterToAlbum: function () {},
    savePhotoToAlbum: function () {},
    sendMessages: function () {},
    setEmergencyButton: function () {},
    setNavibarAlpha: function () {},
    setNavibarTintColor: function () {},
    /**
     *
     * @param {Object} obj 参数对象
     * @param {Boolean} obj.backVisible 是否展示返回按钮
     * @param {String} obj.right1icon 右上角第一个按钮类型 已知：btn_ol_close - 关闭
     * @param {String} obj.right1link 右上角第一个按钮操作 已知：closeAll -> 1、cmcchkh5action://close - 关闭所有webview close -> 2、cmcchkh5action://callJSfunction?function=onNativeBackClick()
     * @param {String} obj.right2icon 右上角第二个按钮类型 已知：btn_ol_close - 关闭
     * @param {String} obj.right2link 右上角第二个按钮操作 已知：cmcchkh5action://close - 关闭所有webview
     * @returns
     */
    setNavigationButtons: function (obj = {}) {
        const { right1link = '', right2link = '' } = obj
        // 注册全局onNativeBackClick函数
        const registerCloseCurrentWebview = context => {
            window.onNativeBackClick = () => {
                context.onNativeBackClick()
            }
        }
        // Android关闭全部webvie需要注册全局closeWebview函数
        const registerCloseAllWebviewForAndroid = context => {
            window.closeWebview = () => {
                context.closeWebview()
            }
        }
        // 格式化key
        const normarlizeKey = (key = 'close') => {
            let ret = ''
            switch (key) {
                case 'closeAll':
                    if (this.isAndroid()) {
                        ret = 'cmcchkh5action://callJSfunction?function=closeWebview()'
                    } else {
                        ret = 'cmcchkh5action://close'
                    }
                    break
                case 'close':
                    ret = 'cmcchkh5action://callJSfunction?function=onNativeBackClick()'
                    break
                default:
                    break
            }
            return ret
        }
        // close 的情况下需要注册全局函数来处理事件
        if (right1link === 'close' || right2link === 'close') {
            registerCloseCurrentWebview(this)
        }
        // closeALL && system为Android 的情况下需要注册全局函数来处理事件
        if ((right1link === 'closeAll' || right2link === 'closeAll') && this.isAndroid()) {
            registerCloseAllWebviewForAndroid(this)
        }
        // 格式化right1|2link
        const needNormalizeKeys = ['right1link', 'right2link']
        needNormalizeKeys.forEach(k => {
            if (k in obj) {
                obj[k] = normarlizeKey(obj[k])
            }
        })

        return this.callApp('setNavigationButtons', obj)
    },
    setPandaCamera: function () {},
    shakeEnd: function () {},
    shakeStart: function () {},
    sharePicTo: function () {},
    shareTo: function () {},
    stepCountStatusCallBack: function () {},
    tokenInvalidAction: function () {},
    updateUserInfo: function () {},
    /**
     * 打开新的webview
     * @param {String} link 网站链接包含完整的协议
     * @returns
     */
    openH5InWebview: function (link) {
        return (location.href = `openurl-modal://${link}`)
    },
    /**
     * 打开站外浏览器
     * @param {String} link 网站链接包含完整的协议
     * @returns
     */
    openH5InBrowser: function (link = '') {
        return (location.href = `openurl-extern-silent://${link}`)
    },
    login: function (link = '') {
        return (location.href = `openhkhshlogin://${link}`)
    },
}

export default MYLINK_JSBRIDGE
