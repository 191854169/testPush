<template>
    <div class="jsbridge-test">
        <button @click="onTest('onNativeBackClick')">测试nativeBackClick</button>
        <button @click="onTest('getLocationHandlerName')">测试getLocationHandlerName</button>
        <button @click="onTest('getAppMode')">测试getAppMode</button>
        <button @click="onTest('getDeviceInfoWithCallback')">测试getDeviceInfoWithCallback</button>
        <button @click="onTest('login', 'http://10.36.11.10:8080/wealth/cmhk.html#/')">测试login</button>
        <button @click="onTest('openH5InBrowser', 'https://sit.mfosunhani.com/pages/login.html')">测试openH5InBrowser</button>
        <button @click="onTest('closeWebview')">测试closeWebview</button>
        <button @click="onTest('backToHomePage')">backToHomePage</button>
        <button @click="onTestClose('backToHomePage')">cmcchkh5action://close</button>
        <button @click="onPush">增加路由</button>
    </div>
</template>

<script>
export default {
    name: 'jsbridge-test',
    beforeCreate() {
        this.$mylinkJsbridge.setNavigationButtons({
            backVisible: true,
            right1icon: 'btn_ol_close',
            right1link: 'closeAll',
            right2icon: 'btn_ol_close',
            right2link: 'close',
        })
    },
    watch: {
        '$route.query.t': {
            handler() {
                this.$mylinkJsbridge.setNavigationButtons({
                    backVisible: true,
                    right1icon: 'btn_ol_close',
                    right1link: 'closeAll',
                    right2icon: 'btn_ol_close',
                    right2link: 'close',
                })
            },
        },
    },
    methods: {
        onTest(key, value) {
            console.log(`Feng.chen:: 17:34:06 value ===> `, value)
            this.$mylinkJsbridge?.[key]()
        },

        onTestClose() {
            location.href = 'cmcchkh5action://close'
        },

        onPush() {
            this.$router.push({
                path: 'jsBridge',
                query: {
                    t: Date.now(),
                },
            })
        },
    },
}
</script>

<style scoped lang="less">
.jsbridge-test {
    button {
        display: block;
        width: 320px;
        margin: 16px auto;
        padding: 8px;
        background: #fff;
        border: none;
        border-radius: 8px;
    }
}
</style>
