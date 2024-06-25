<!--
 * @Description: 投资组合组合首页
-->
<template>
    <div class="follow">
        <instroduction ref="instroductionRef"></instroduction>
        <banner :position="12"></banner>
        <masterSwipe @followedChange="onFollowChange()"></masterSwipe>
        <follow-star-selection></follow-star-selection>
        <findFollow></findFollow>

        <div class="risk">
            <p class="risk-tip-title">{{ $t('riskWarning') }}：</p>
            <p>{{ $t('follow.riskTip') }}</p>
        </div>
    </div>
</template>

<script>
import findFollow from './components/findFollow.vue'
import instroduction from './components/instroduction.vue'
import masterSwipe from './components/masterSwipe.vue'
import followStarSelection from './components/followStarSelection.vue'
import Banner from '../../fund/components/Banner.vue'
import customerDetailMixin from './mixins/customerDetailMixin'
import { isHLApp, isTHSApp, getAppVersion, compareVersion } from '@/utils/tools.js'

function generateWatch() {
    return function fn(context) {
        if (fn.loaded) return
        console.error(`yinlong sdfasdfadfasdf`)
        if (context.$jsBridge) {
            const onVisible = () => {
                // 校验用户是否已经退出登录了 - 只用处理在app内部的
                context.$store
                    .dispatch('user/getUserInfo', false)
                    .then(() => {
                        // 未登录 -> 登录
                        if (!context.$root.isLogin) {
                            location.reload()
                        }
                    })
                    .catch(() => {
                        // 登录 -> 未登录
                        if (context.$root.isLogin) {
                            location.reload()
                        }
                    }) // 登录失效会触发页面刷新
            }
            context.$jsBridge.watchPageVisible(onVisible)
        }
        fn.loaded = true
    }
}

const watchInstance = generateWatch()
export default {
    name: 'followIndex',
    mixins: [customerDetailMixin],
    components: {
        instroduction,
        findFollow,
        followStarSelection,
        masterSwipe,
        Banner,
    },
    data() {
        return {
            total: 0,
            hotFundList: [],
        }
    },

    created() {
        watchInstance(this)
    },
    mounted() {
        this.registerSearchButton()
    },

    methods: {
        goToRecord() {
            this.$router.push('/follow-order-records')
        },
        goToCustomerDetail() {
            this.pushToCustomerDetail(0)
        },
        gotoPortfolioList() {
            this.$router.push('/portfolio-list')
        },
        onFollowChange() {
            console.log('onFollowChange')
            this.$refs.instroductionRef.getData()
        },
        registerSearchButton() {
            const inTHS = isTHSApp()
            const inHL = isHLApp()
            const isInMylink = this.$mylinkJsbridge.isInMylink()
            // 在同花顺 || mylink
            if (inTHS || isInMylink || this.$thsI18NJsBridge.isTHSI18NApp()) return
            if (inHL) {
                // app版本号大于2.15展示
                const curVersion = getAppVersion()
                const moreThanVersion = compareVersion(curVersion, '2.15.0') >= 0
                if (moreThanVersion) {
                    this.$jsBridge?.setButton('right1', { icon: 'search' }, this.goSearch)
                }
            }
        },
        unregisterSearchButton() {
            this.$jsBridge?.setButton('right1', { icon: null }, () => {})
        },
        goSearch() {
            this.$jsBridge?.goPage('search')
        },
    },
    beforeDestroy() {
        this.unregisterSearchButton()
    },
}
</script>

<style scoped lang="less">
@black: #1f1f1f;
@white: #fff;

.follow {
    padding: 0 12px 32px;
    #background();

    .risk {
        color: #9c9c9c;
        font-weight: normal;
        font-size: 12px;
        line-height: 19px;
        white-space: pre-line;
    }

    .risk-tip-title {
        margin: 24px 0 8px;
        font-weight: normal;
    }
}
</style>
