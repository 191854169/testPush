<template>
    <div class="client-radar">
        <!-- <div class="account" @click="chooseFlag = true">
            <span>{{ curAccount }}</span>
            <multi-img name="icon-arrow" directory="fund" />
        </div> -->
        <div class="content">
            <radar-map class="content-item" @changeData="changeDataHandler"></radar-map>
            <invest-detail class="content-item" :userData="userData" :platformData="platformData"></invest-detail>
        </div>
        <!-- <account-choose :type="accountType" v-model="chooseFlag" @choose="chooseHandler"></account-choose> -->
    </div>
</template>
<script>
import InvestDetail from './components/investDetail'
import { accountMap } from '@/config/common'
import RadarMap from './components/radarMap.vue'

const accountKeyMap = accountMap.keysMap
const accountKeyValueMap = accountMap.keyValueMap
export default {
    name: 'clientRadar',
    components: {
        InvestDetail,
        RadarMap,
    },
    data() {
        return {
            accountType: accountKeyMap.ALL,
            accountListMap: accountKeyValueMap,
            userData: {},
            platformData: {},
        }
    },
    computed: {
        curAccount() {
            return this.accountListMap[this.accountType] || ''
        },
    },
    created() {},
    methods: {
        // 选择账户
        // chooseHandler(type) {
        //     this.accountType = type
        //     this.chooseFlag = false
        // },
        changeDataHandler(row) {
            this.userData = row.user || {}
            this.platformData = row.platform || {}
        },
    },
}
</script>
<style scoped lang="less">
.client-radar {
    width: 100%;
    min-height: 100%;
    background-color: #f9f9f9;

    .account {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0 12px 0 16px;
        line-height: 36px;
        background: #fff;
        box-shadow: inset 0 -0.5px 0 #efefef;

        span {
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
        }

        img {
            width: 12px;
            height: 12px;
            transform: rotateX(180deg);
        }
    }

    .content {
        padding: 12px;

        &-item {
            margin-bottom: 12px;
            background-color: #fff;
            border-radius: 8px;
        }
    }
}
</style>
