<template>
    <div class="account-container">
        <!-- 资产总览 -->
        <Profile @success="$emit('getAssetSummarySuccess')" />

        <!-- 引导栏 -->
        <Guide :user="user" @onChange="changeTab" />

        <!-- 功能栏 -->
        <Service />

        <!-- 已开通理财账户 持仓 -->
        <Holding v-if="user.openFundTrade === 1" />

        <!-- 未开通理财账户 -->
        <OpenFundAccount v-else />

        <!-- 理财收益说明 -->
        <Statement />
    </div>
</template>

<script>
import Profile from './profile.vue'
import Guide from './guide.vue'
import Service from './service.vue'
import Holding from './holding.vue'
import Statement from './statement.vue'
import OpenFundAccount from '../components/openFundAccount.vue'

export default {
    components: {
        Profile,
        Guide,
        Service,
        Holding,
        Statement,
        OpenFundAccount,
    },
    data() {
        return {
            user: {
                cashInStatus: '', // 是否入金过 0-未标记 1-已标记
                openFundTrade: '', // 是否开通理财产品 0-未开通 1-已开通
                wealthProductSubStatus: '', // 是否认购过理财产品 0-未购买 1-购买过
            },
        }
    },
    methods: {
        // 获取用户信息
        async getUserDetail() {
            try {
                const res = await this.$store.dispatch('user/getUserInfo', false)
                const userInfo = res?.clientInfo?.accts?.[0] || {}
                this.user = { ...userInfo }
            } catch (err) {
                err?.error?.data?.tips && this.$toast(err?.error?.data?.tips)
            }
        },

        // 切换至理财tab
        changeTab(val) {
            this.$emit('onChange', val)
        },
    },
    created() {
        this.getUserDetail()
    },
}
</script>

<style lang="less" scoped>
.account-container {
    height: 100%;
    padding: 0 12px;
}
</style>
