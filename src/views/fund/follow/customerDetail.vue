// 客户详情页
<template>
    <div class="customer-detail">
        <div v-if="isInAPP">
            <multi-img v-if="isProfessional" class="customer-bg" name="img_customer_detail_PI" directory="fund"></multi-img>
            <multi-img v-else class="customer-bg" name="img_customer_detail_normal" directory="fund"></multi-img>
            <navigation-bar @updateNaviHeight="v => (naviHeight = v)" :color="'transparent'" :shadePixel="260" @back="goBack"></navigation-bar>
        </div>
        <customerDetailHead
            :data-model="dataModel"
            :is-professional="isProfessional"
            :is-self="isSelf"
            :other-uin="otherUin"
            @followedSuccess="getUserInfo()"
        ></customerDetailHead>
        <!-- 投资理念和擅长赛道没有值时隐藏模块 -->
        <div v-show="isProfessional && dataModel.investmentPhilosophy && dataModel.favoredCourses" class="investCard">
            <div class="investCard-content">
                <span v-for="(item, index) in investCardList" :key="index" class="investCard-item">
                    <span class="investCard-textBox">
                        <div class="investCard-titleBox">
                            <multi-img class="investCard-icon" :name="item.iconName" directory="fund"></multi-img>
                            <span class="investCard-title">{{ item.label }}</span>
                        </div>
                        <div class="investCard-description">{{ dataModel[item.key] ? dataModel[item.key] : '--' }}</div>
                    </span>
                    <span v-show="index == 0" class="investCard-line"></span>
                </span>
            </div>
        </div>
        <customerPortfolioList
            :class="{ 'mar-t8 pad-t8': !isSelf, list: isSelf }"
            :naviHeight="naviHeight"
            :search-uin="getSearchUin()"
        ></customerPortfolioList>
        <createPortfolioBtn v-show="isSelf" :is-professional="isProfessional" :userInfo="dataModel" class="createBtn"></createPortfolioBtn>
    </div>
</template>

<script>
import customerDetailHead from './components/customerDetailHead.vue'
import customerPortfolioList from './components/customerPortfolioList.vue'
import platformDifferenceMixin from '@/mixins/platformDifferenceMixin'
import { i18n } from '@/i18n/fund/index.js'
import { UserInfo } from '@/apis/followInvest/index.js'
import { isNull, isUndefined } from '@/utils/tools'
import createPortfolioBtn from './components/createPortfolioBtn'
import { isTenantApp } from '@/utils'
import NavigationBar from '@/components/NavigationBar.vue'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
export default {
    name: 'customer-detail',
    mixins: [watchPageVisibleMixin, platformDifferenceMixin],
    components: {
        customerDetailHead,
        customerPortfolioList,
        createPortfolioBtn,
        NavigationBar,
    },
    data() {
        return {
            naviHeight: 0,
            isProfessional: false, //是否专业投资者
            isSelf: false, //是否本人查看
            otherUin: this.$route.query.otherUin,
            dataModel: {},
            investCardList: [
                {
                    key: 'investmentPhilosophy',
                    label: i18n.t('editCustomerInfo.investIdea'),
                    iconName: 'icon_invest_idea',
                },
                {
                    key: 'favoredCourses',
                    label: i18n.t('editCustomerInfo.advantage'),
                    iconName: 'icon_invest_advantage',
                },
            ],
        }
    },

    created() {
        this.getUserInfo()
    },

    computed: {
        getPortfolioType(item) {
            switch (item.portfolioType) {
                case 1:
                    return i18n.t('customerDetail.hk')
                case 2:
                    return i18n.t('customerDetail.us')
                case 3:
                    return i18n.t('customerDetail.fund')
                case 4:
                    return i18n.t('customerDetail.mixture')
                default:
                    return i18n.t('customerDetail.hk')
            }
        },

        isInAPP() {
            return isTenantApp()
        },
    },

    mounted() {
        const uin = localStorage.getItem('uin') || ''
        if (!isNull(this.otherUin) && !isUndefined(this.otherUin) && this.otherUin != '' && uin != this.otherUin && this.otherUin != '0') {
            this.isSelf = false
        } else {
            this.isSelf = true
        }
        console.log('yinlong', uin, this.otherUin, this.isSelf)
        this.watch(() => {
            this.getUserInfo()
        })
    },
    beforeDestroy() {},
    methods: {
        async getUserInfo() {
            try {
                const params = {}
                if (this.otherUin != '' && this.otherUin != '0') {
                    params['otherUin'] = this.otherUin
                }
                const config = {}
                const { result } = await UserInfo(params, config)
                console.log(`Xiaopei Jin:: getUserInfo result ===> `, result)
                this.dataModel = result
                //clientType  用户类型  (状态 0：未知 1:普通用户， 2:持牌用户, 3:路人(未创建组合,未编辑信息)
                this.isProfessional = this.dataModel.clientType == 2
            } catch (e) {
                console.error(e)
            }
        },

        getSearchUin() {
            const uin = localStorage.getItem('uin') || ''
            if (!isNull(this.otherUin) && !isUndefined(this.otherUin) && this.otherUin != '' && uin != this.otherUin && this.otherUin != '0') {
                return parseInt(this.otherUin)
            }
            return parseInt(uin)
        },
        // 跳转投资组合订单记录
        toCurrentRecords() {
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
        goBack() {
            this.backPreviousPage()
        },
    },
}
</script>

<style scoped lang="less">
.customer-detail {
    position: relative;
    z-index: auto;
    width: 100%;
    height: 100%;
    #iosBottom();

    .customer-bg {
        position: absolute;
        width: 100vw;
        height: 260px;
    }

    .investCard {
        position: relative;
        width: 100%;
        height: 72px;
        margin-top: 12px;
        padding: 0 12px;

        &-content {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            height: 100%;
            background-color: #fff;
            border-radius: 8px;
        }

        &-item {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            width: 50%;
            height: 100%;
        }

        &-textBox {
            align-items: center;
            justify-content: center;
            width: 100%;
            text-align: center;
        }

        &-titleBox {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
        }

        &-title {
            color: #9c9c9c;
            font-weight: 400;
            font-size: 12px;
            line-height: 16px;
        }

        &-description {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            line-height: 22px;
        }

        &-icon {
            width: 12px;
            height: 12px;
            margin-right: 4px;
        }

        &-line {
            width: 0.5px;
            height: 36px;
            background-color: #efefef;
        }
    }

    .customer-asset {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 44px;
        margin: 12px;
        padding: 0 12px;
        color: @h1-white;
        font-weight: bold;
        font-size: 16px;
        background-color: #fff;
        border-radius: 8px;

        .arrow {
            width: 12px;
            height: 12px;
        }
    }

    .record {
        position: relative;
        margin-top: 12px;
        margin-right: 12px;
        margin-left: 12px;
    }

    .list {
        width: 100%;
        padding: 16px 0;
    }

    .createBtn {
        right: 24px;
        bottom: calc(118px + 34px);
    }
}

.navi_bar {
    position: fixed;
    left: 0;
    z-index: 1000;
    font-weight: bold;
    font-size: 16px;
}
</style>
