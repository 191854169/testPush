<!-- 
    大咖信息 上部分
 -->
<template>
    <div class="master-top-info">
        <div class="top" @click="gotoMasterDetail">
            <headerPortrait class="master-header" :ossId="info.avatarOSSID" :markTag="info.uin" :needDownloadImg="isFromShare"></headerPortrait>
            <div class="name-info">
                <div class="master-name">{{ info.nickName }}</div>
                <div class="years-wrapper">
                    <div class="info">
                        {{ $t('master.investmentExp') }}
                        <span>{{ info.investExp | investmentExpFilter }}</span>
                    </div>
                    <div class="info">
                        {{ $t('master.fans') }}
                        <span>{{ info.followersNum | followerNumFilter }}</span>
                    </div>
                </div>
            </div>
            <followBtn
                v-if="!isInvestmentMigration && !isSelf && !isFromShare"
                class="follow"
                :value="info.followed"
                tintColor
                :otherUin="info.uin"
                @followedSuccess="$emit('followedSuccess')"
            ></followBtn>
        </div>
        <div class="bottom" v-if="!hiddenSkilled">
            <div class="bottom_info line-elipsis" v-if="info.investmentPhilosophy">
                {{ `${$t('master.investmentPhilosophy')} ${investmentPhilosophyText}` }}
            </div>
            <div class="bottom_info line-elipsis" v-if="info.favoredCourses">{{ `${$t('master.racetrack')} ${favoredCoursesText}` }}</div>
        </div>
    </div>
</template>

<script>
import { followerNumFilter, investmentExpFilter } from '../utils/filters'
import headerPortrait from './headerPortrait'
import followBtn from './followBtn.vue'
import customerDetailMixin from '../mixins/customerDetailMixin'

export default {
    name: 'master-top-info',
    mixins: [customerDetailMixin],
    props: {
        info: {
            type: Object,
            default: () => ({}),
        },
        isFromShare: {
            type: Boolean,
            default: false,
        },
        // 隐藏 投资理念 和 擅长赛道
        hiddenSkilled: {
            type: Boolean,
            default: false,
        },
        // 是否来自投资移民首页
        isInvestmentMigration: {
            type: Boolean,
            default: false,
        },
    },
    components: { headerPortrait, followBtn },
    data() {
        return {}
    },
    computed: {
        isSelf() {
            const uin = localStorage.getItem('uin') || ''
            return parseInt(uin) === parseInt(this.info.uin)
        },
        investmentPhilosophyText() {
            let shareText
            if (this.info.investmentPhilosophy.length > 6) {
                shareText = `${this.info.investmentPhilosophy.substring(0, 6)}...`
            } else {
                shareText = this.info.investmentPhilosophy
            }
            return this.isFromShare ? shareText : this.info.investmentPhilosophy
        },
        favoredCoursesText() {
            let shareText
            if (this.info.favoredCourses.length > 6) {
                shareText = `${this.info.favoredCourses.substring(0, 6)}...`
            } else {
                shareText = this.info.favoredCourses
            }
            return this.isFromShare ? shareText : this.info.favoredCourses
        },
    },
    watch: {},
    filters: {
        followerNumFilter,
        investmentExpFilter,
    },
    created() {},
    mounted() {},
    methods: {
        gotoMasterDetail() {
            if (this.isStatic || this.isInvestmentMigration) return
            this.pushToCustomerDetail(this.info.uin)
        },
    },
}
</script>

<style scoped lang="less">
.master-top-info {
    .top {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        // justify-content: space-between;

        .master-header {
            width: 40px;
            height: 40px;
            margin-right: 8px;
            border-radius: 20px;
        }

        .name-info {
            margin-right: 8px;

            .master-name {
                color: #2f2f2f;
                font-weight: bold;
                font-size: 16px;
            }

            .years-wrapper {
                display: flex;
                margin-top: 6px;
                color: #9c9c9c;
                font-size: 12px;

                .info {
                    span {
                        color: #666;
                    }

                    &:last-child {
                        margin-left: 8px;
                    }
                }
            }
        }

        .follow {
            position: absolute;
            right: 12px;
            width: 72px;
            height: 28px;
            color: #ff6907;
            font-weight: bold;
            font-size: 14;
            background: rgba(255, 105, 7, 0.1);
            border-radius: 31px;
        }
    }

    .bottom {
        display: flex;
        color: #9c9c9c;
        font-size: 12px;
        line-height: 16px;

        .bottom_info {
            flex: 1;
            height: 20px;
            padding: 2px 8px;
            background: #f9f9f9;
            border-radius: 14px;

            &:last-child {
                margin-left: 12px;
            }

            &:only-child {
                margin-left: 0;
            }
        }
    }
}
</style>
