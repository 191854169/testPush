<template>
    <div class="create-btn">
        <div class="content">
            <div class="bg-icon"></div>
            <div class="front" @click="gotoCreateProtfolio">
                <div class="icon-box">
                    <multi-img class="icon" name="icon_createP" directory="fund"></multi-img>
                </div>
                <p class="title">{{ $t('customerDetail.toCreatePortfolio') }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { isTenantApp } from '@/utils'
import { checkReleaseStatus } from '../utils/dialogUtil'
export default {
    name: 'create-protfolio-btn',

    data() {
        return {}
    },
    props: {
        isProfessional: {
            type: Boolean,
            default: false,
        },
        userInfo: {
            type: Object,
            default() {
                return {}
            },
        },
    },
    computed: {
        // 当前用户是当前组合创建者
        isCreater() {
            return Number(localStorage.getItem('uin')) == this.userInfo.uin
        },
        releaseStatus() {
            return this.userInfo.releaseStatus
        },
    },
    methods: {
        gotoCreateProtfolio() {
            if (checkReleaseStatus(this, this.isCreater, this.releaseStatus)) return
            const url = `${location.origin}/wealth/fund.html#/create-portfolio?isProfessional=${this.isProfessional}`
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(`${url}`), title: '', mode: 'immersive', inapp: isTenantApp() })
            } else {
                this.$router.push({
                    path: `/create-portfolio`,
                    query: {
                        isProfessional: this.isProfessional,
                    },
                })
            }
        },
    },
}
</script>

<style scoped lang="less">
.create-btn {
    position: fixed;
    width: 56px;
    height: 56px;

    .content {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .bg-icon {
        position: absolute;
        display: flex;
        width: 100%;
        height: 100%;
        background-color: #ff6907;
        border-radius: 50%;
        box-shadow: 0 4px 10px 0 #ee6a0033;
    }

    .front {
        position: absolute;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .icon-box {
        width: 16px;
        height: 18px;
        margin-top: 11px;
    }

    .icon {
        width: 100%;
        height: 100%;
    }

    .title {
        margin-top: 2px;
        color: #fff;
        font-weight: 500;
        font-size: 10px;
        line-height: 14px;
        text-align: center;
    }
}
</style>
