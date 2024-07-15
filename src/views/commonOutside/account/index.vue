<template>
    <div class="account-container">
        <!-- 资产总览 -->
        <Profile @success="$emit('getAssetSummarySuccess')" />

        <!-- 引导栏 -->
        <Guide @onChange="changeTab" />

        <!-- 功能栏 -->
        <Service />
        <!-- 已开通理财账户 持仓 -->
        <Holding v-if="accts.openFundTrade === 1" />

        <!-- 未开通理财账户 -->
        <OpenFundAccount v-else />

        <!-- 理财收益说明 -->
        <Statement />
    </div>
</template>

<script>
import { mapState } from 'vuex'
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
        return {}
    },
    computed: {
        ...mapState('user', ['accts']),
    },
    methods: {
        // 切换至理财tab
        changeTab(val) {
            this.$emit('onChange', val)
        },
    },
}
</script>

<style lang="less" scoped>
.account-container {
    height: 100%;
    padding: 0 12px;
}
</style>
