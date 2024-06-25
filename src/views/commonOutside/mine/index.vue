<template>
    <div class="mine-container">
        <div class="profile-card flex-c">
            <div class="avatar">
                <van-image :src="url + user.profile.avatar" width="100%" height="100%">
                    <template v-slot:error>
                        <multi-img name="avatar" directory="commonOutside"></multi-img>
                    </template>
                </van-image>
            </div>
            <div class="info">
                <div class="nick">{{ user.profile.nickName }}</div>
                <div class="num">星财号：{{ user.hlId }}</div>
            </div>
        </div>

        <div class="cell-card">
            <div class="cell flex-s" @click="goPhone">
                <div class="label">手机号</div>
                <div class="flex-c">
                    <span class="value">{{ formatPhone(user.phone) }}</span>
                    <multi-img name="icon_right" directory="commonOutside" class="arrow"></multi-img>
                </div>
            </div>
            <div class="cell flex-s" @click="goEmail">
                <div class="label">邮箱</div>
                <div class="flex-c">
                    <span class="value">{{ formatEmail(user.email) || '未认证' }}</span>
                    <multi-img name="icon_right" directory="commonOutside" class="arrow"></multi-img>
                </div>
            </div>
            <div class="cell flex-s" @click="goTradePassword">
                <div class="label">交易密码</div>
                <div class="flex-c">
                    <span class="value">{{ user.clientInfo.pwdStatus === 20 ? '未设置' : '已设置' }}</span>
                    <multi-img name="icon_right" directory="commonOutside" class="arrow"></multi-img>
                </div>
            </div>
        </div>

        <div class="cell-card">
            <div class="cell flex-s" @click="goService">
                <div class="label">在线客服</div>
                <multi-img name="icon_right" directory="commonOutside" class="arrow"></multi-img>
            </div>
            <div class="cell flex-s" @click="showContact = true">
                <div class="label">电话咨询</div>
                <multi-img name="icon_right" directory="commonOutside" class="arrow"></multi-img>
            </div>
        </div>

        <div v-if="!isInRyH5()" class="cell-card">
            <div class="cell flex-s" @click="goDownloadApp">
                <div class="label">APP下载</div>
                <multi-img name="icon_right" directory="commonOutside" class="arrow"></multi-img>
            </div>
        </div>

        <div class="logout flex-middle" @click="showLogout = true">退出登录</div>

        <!-- 电话咨询 -->
        <Contact :show="showContact" @confirm="showContact = false" />

        <!-- 退出登录 -->
        <Logout :show="showLogout" @cancel="showLogout = false" />
    </div>
</template>

<script>
import Contact from './contact'
import Logout from './logout'
import { customerService } from '@/utils/utils'
import pathnames from '@/config/H5Pathname'
import { isInRyH5 } from '@/utils'

export default {
    components: {
        Contact,
        Logout,
    },
    data() {
        return {
            user: {
                profile: {},
                clientInfo: {},
                hlId: '',
                phone: '',
                email: '',
            },
            showContact: false, // 显示与隐藏电话咨询弹窗
            showLogout: false, // 显示与隐藏退出登录弹窗
        }
    },
    computed: {
        url() {
            return `${process.env.VUE_APP_OSS}/oss/v1/Download?preview=1&ossid=` // OSS地址
        },
    },
    methods: {
        isInRyH5,
        // 获取用户信息
        async getUserDetail() {
            try {
                const res = await this.$store.dispatch('user/getUserInfo', false)
                this.user = { ...this.user, ...res }
            } catch (err) {
                err?.error?.data?.tips && this.$toast(err?.error?.data?.tips)
            }
        },

        // 手机号掩码 - 后4位显示 往前推4位隐藏 其余显示
        formatPhone(val) {
            if (!val) return
            return val.substring(0, val.length - 8) + '****' + val.substring(val.length - 4)
        },

        // 邮箱掩码 - @前四位
        formatEmail(val) {
            if (!val) return
            const index = val.indexOf('@')
            return val.substring(0, index - 4) + '****' + val.substring(index)
        },

        // 跳转至修改手机号页面
        goPhone() {
            this.$goPage(`${location.origin}/pages/changePhone.html#/`)
        },

        // 跳转邮箱页面
        goEmail() {
            const key = this.user.email ? 'changeEmail' : 'bindEmail'
            // 邮箱存在, 则修改邮箱; 邮箱不存在, 则绑定邮箱
            this.$goPage(`${location.origin}/pages/${key}.html#/`)
        },

        // 跳转至修改交易密码页面
        goTradePassword() {
            this.$goPage(`${location.origin}/pages/changeTradePassword.html#/verify`)
        },

        // 跳转至在线客服
        goService() {
            const url = customerService({
                url: true,
                userid: this.user.subAcctId,
            })
            window.open(url)
        },

        goDownloadApp() {
            const { VUE_APP_FOSUN_DOWNLOAD_PAGE: fosunAppDownloadUrl } = pathnames
            this.$goPage(fosunAppDownloadUrl)
        },
    },
    created() {
        this.getUserDetail()
    },
}
</script>

<style lang="less" scoped>
.mine-container {
    height: 100vh;
    padding: 0 12px;
    overflow-y: auto;
}

.profile-card {
    height: 72px;
    padding: 0 16px;
    background: #fff;
    border-radius: 12px;

    .avatar {
        width: 48px;
        height: 48px;
        overflow: hidden;
        border-radius: 50%;
    }

    .info {
        margin-left: 8px;

        .nick {
            height: 22px;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 16px;
            line-height: 22px;
        }

        .num {
            margin-top: 6px;
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }
    }
}

.cell-card {
    margin-top: 16px;
    padding: 0 16px;
    background: #fff;
    border-radius: 12px;

    .cell {
        height: 52px;

        &:not(:last-child) {
            box-shadow: 0 -0.5px 0 0 #efefef inset, 16px 0 0 0 #fff inset, -16px 0 0 0 #fff inset;
        }
    }

    .label {
        color: #2f2f2f;
        font-size: 16px;
    }

    .value {
        margin-right: 4px;
        color: #666;
        font-size: 14px;
    }

    .arrow {
        width: 12px;
        height: 12px;
    }
}

.logout {
    height: 52px;
    margin-top: 24px;
    color: #f31414;
    font-size: 16px;
    background: #fff;
    border-radius: 12px;
}
</style>
