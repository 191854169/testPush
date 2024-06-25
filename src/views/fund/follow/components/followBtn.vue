<template>
    <div
        class="follow-btn"
        :style="{ backgroundColor: followed ? followedBgColor : bgColor, color: followed ? followedTitleColor : titleColor }"
        @click.stop="clickFollowBtn"
    >
        <div class="content">
            <multi-img v-show="!followed && !tintColor" class="icon" name="icon_add_bold" directory="common"></multi-img>
            <multi-img v-show="!followed && tintColor" class="icon" name="icon_add_orange" directory="common"></multi-img>
            <div v-show="!followed" class="title">{{ $t('customerDetail.follow') }}</div>
            <multi-img v-show="followed" class="icon" name="icon_tick_grey" directory="common"></multi-img>
            <div v-show="followed" class="title">{{ $t('customerDetail.followed') }}</div>
        </div>
    </div>
</template>

<script>
import { UserFollow, UserUnFollow } from '@/apis/followInvest/index.js'
import { i18n } from '@/i18n/fund/index.js'
import { Toast } from 'vant'
import { checkReleaseStatus } from '../utils/dialogUtil'
export default {
    name: 'followBtn',
    props: {
        value: {
            type: Boolean,
            default: false,
        },
        otherUin: {
            type: [String, Number],
            default: '',
        },
        tintColor: {
            type: Boolean,
            default: false,
        },
        isCreater: {
            type: Boolean,
            default: false,
        },
        releaseStatus: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        followed: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        bgColor() {
            if (this.followed) {
                return this.followedBgColor
            }
            return this.tintColor ? this.tintBgColor : this.normalBgColor
        },
        titleColor() {
            if (this.followed) {
                return this.followedTitleColor
            }
            return this.tintColor ? this.tintTitleColor : this.normalTitleColor
        },
    },

    data() {
        return {
            normalTitleColor: '#fff',
            normalBgColor: '#ff6907',
            followedBgColor: '#f4f4f4', //已关注状态的背景色
            followedTitleColor: '#9c9c9c', //已关注状态的标题颜色

            tintTitleColor: '#ff6907',
            tintBgColor: '#FF69071A',
        }
    },
    methods: {
        async followAction() {
            if (checkReleaseStatus(this, this.isCreater, this.releaseStatus)) return
            if (this.otherUin == '') {
                return
            }
            try {
                const params = {
                    otherUin: parseInt(this.otherUin),
                }
                const { result } = await UserFollow(params)
                if (result.status == 1) {
                    Toast(i18n.t('customerDetail.followed'))
                    this.followed = true
                    this.$emit('followedSuccess')
                }
            } catch (e) {
                console.error(e)
            }
        },

        async unFollowAction() {
            if (this.otherUin == '') {
                return
            }
            try {
                const params = {
                    otherUin: parseInt(this.otherUin),
                }
                const { result } = await UserUnFollow(params)
                if (result.status == 2) {
                    Toast(i18n.t('customerDetail.unFollowed'))
                    this.followed = false
                    this.$emit('followedSuccess')
                }
            } catch (e) {
                console.error(e)
            }
        },
        clickFollowBtn() {
            if (!this.$root.isLogin) {
                return this.$root.login()
            }
            if (this.followed) {
                this.unFollowAction()
            } else {
                this.followAction()
            }
        },
    },
}
</script>

<style lang="less" scoped>
.follow-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    .content {
        display: flex;
        flex-direction: row;
        align-items: center;

        .icon {
            width: 12px;
            height: 12px;
            margin-right: 2px;
        }

        .title {
            font-weight: 500;
            font-size: 14px;
            font-style: normal;
            line-height: 20px;
        }
    }
}
</style>
