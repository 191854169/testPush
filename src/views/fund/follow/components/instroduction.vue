<!--
 * @Description: 投资组合组合首页的跟着大咖投资组件
-->
<template>
    <div>
        <div class="card-login instroduction" @click="goToCustomerDetail" v-if="$root.isLogin">
            <headerPortrait class="avatar" :ossId="userInfo.avatarOSSID"></headerPortrait>
            <div class="fund-item-left">
                <p class="name">{{ userInfo.nickName }}</p>
                <div class="simple-info">
                    <span class="label">{{ $t('master.follow') }}</span>
                    <span class="value">{{ userInfo.followingNum | followerNumFilter }}</span>
                    <span class="label">{{ $t('master.fans') }}</span>
                    <span class="value">{{ userInfo.followersNum | followerNumFilter }}</span>
                </div>
            </div>
            <div class="fund-item-right">
                <h3 class="txt">{{ $t('follow.personalPage') }}</h3>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <div class="card instroduction" @click="toLogin" v-else>
            <multi-img class="avatar" name="default_avatar" directory="fund" />
            <div class="fund-item-left">
                <p class="name">{{ $t('follow.oneAccOneWorld') }}</p>
            </div>
            <div class="fund-item-right">
                <h3 class="txt">{{ $t('follow.loginRegister') }}</h3>
                <multi-img class="arrowicon" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
        </div>
        <div class="entrance-container" v-if="$root.isLogin">
            <div class="mar-lr12 border-top-1px"></div>
            <div class="entrance-list">
                <div class="entrance border-right-1px" @click="gotoOrderRecordPage">
                    <multi-img name="icon_trade_order" directory="fund/follow"></multi-img>
                    {{ $t('customerDetail.realOrderRecond') }}
                </div>
                <div class="entrance" :class="{ disabled: !isHLApp() }" @click="gotoInvestAsset">
                    <multi-img name="icon_invest_asset" directory="fund/follow"></multi-img>
                    {{ $t('customerDetail.myInvestAsset') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { UserInfo } from '@/apis/followInvest/index.js'
import headerPortrait from './headerPortrait'
import customerDetailMixin from '../mixins/customerDetailMixin'
import { followerNumFilter } from '../utils/filters'
import { isHLApp } from '@/utils'

// import store from '@/store/demo'
export default {
    name: 'instroduction',
    mixins: [customerDetailMixin],
    components: {
        headerPortrait,
    },
    filters: {
        followerNumFilter,
    },
    async created() {},
    data() {
        return {
            userInfo: {},
            avatarSrc: '',
            showAddStock: false,
            selectedList: [
                {
                    mkt: 'hk',
                    name: 'test',
                    rawSymbol: '00211',
                },
            ],
        }
    },
    watch: {
        showAddStock(v) {
            console.log('watch=v', v)
        },
        '$root.isLogin': {
            handler(v) {
                if (typeof v === 'boolean' && v) {
                    this.getData()
                }
            },
            immediate: true,
        },
    },
    methods: {
        isHLApp,
        // 获取数据
        async getData() {
            try {
                if (this.$root.isLogin) {
                    const { result = {} } = await UserInfo({})
                    this.userInfo = result
                }
            } catch (e) {
                console.log('getUserInfo-total===>e', e)
            }
        },
        goToCustomerDetail() {
            this.pushToCustomerDetail(0)
        },
        gotoOrderRecordPage() {
            if (this.$jsBridge) {
                const url = `${location.origin}${location.pathname}#/follow-order-records?type=${0}`
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                this.$router.push({
                    path: '/follow-order-records',
                    query: {
                        type: 0,
                    },
                })
            }
        },
        gotoInvestAsset() {
            if (isHLApp()) {
                this.$goPage('/invest-advisory/assets')
            } else {
                this.$toast(this.$t('investAdvisory.pleaseContactService'))
            }
        },
        toLogin() {
            this.$root.login()
        },
    },
}
</script>

<style lang="less" scoped>
.card {
    #foreground();

    margin-top: 12px;
    border-radius: 8px;

    &.shadow {
        background: linear-gradient(183.3deg, rgba(255, 255, 255, 0.62) -8.9%, #fff 79.84%);
        box-shadow: 0 0.5px 8px rgba(0, 0, 0, 0.04), inset -0.25px 0.25px 0 #fff;
        backdrop-filter: blur(27px);
    }
}

.card-login {
    #foreground();

    margin-top: 12px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
}

.instroduction {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    height: 68px;
    padding: 12px 8px 12px 12px;

    .avatar {
        width: 40px;
        height: 40px;
        margin-right: 12px;
        border-radius: 20px;
    }

    .name {
        color: #2f2f2f;
        font-weight: bold;
        font-size: 16px;
    }

    .simple-info {
        margin-top: 6px;
        font-weight: normal;
        font-size: 12px;

        .label {
            margin-right: 4px;
            color: #9c9c9c;
        }

        .value {
            margin-right: 12px;
            color: #666;
        }
    }

    .fund-item-right {
        display: flex;
        flex: auto;
        flex-direction: row;
        justify-content: flex-end;
        margin: auto;
        text-align: right;

        .txt {
            margin-right: 2px;
            color: #9c9c9c;
            font-weight: normal;
            font-size: 12px;
        }

        .arrowicon {
            align-items: center;
            width: 12px;
            height: 12px;
        }
    }
}

.entrance-container {
    #foreground();

    height: 48px;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;

    .entrance-list {
        display: flex;
        align-items: center;
        height: 100%;
        padding: 14px;

        .entrance {
            display: flex;
            flex: 1;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: @h1-white;
            font-size: 12px;
            line-height: 16px;
            text-align: center;

            img {
                width: 16px;
                height: 16px;
                margin-right: 4px;
            }
        }

        .disabled {
            opacity: 0.3;
        }
    }
}
</style>
