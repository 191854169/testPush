// 基金详情页

<template>
    <div class="fund-detail">
        <component :is="componentId" ref="detailRef"></component>
        <template v-if="isInApp || isInOutside">
            <div class="footer-box fixed-bottom">
                <div ref="footerTemp"></div>
            </div>
        </template>
        <SellCashBox v-model="sellCashBoxVisible" @choose="onChooseAccount" />
    </div>
</template>

<script>
import PublicDetail from '@/views/fund/detail/PublicDetail.vue'
import PrivateDetail from '@/views/fund/detail/PrivateDetail.vue'
import riskAssessmentMixin from '@/mixins/business/riskAssessmentMixin.js'
import initButtonMixin from '../mixins/initButton/index'
import { getProfessionalStatus } from '@/utils'
import SellCashBox from '@/components/SellCashBox.vue'
export default {
    name: 'fund-detail',
    components: {
        PublicDetail,
        PrivateDetail,
        SellCashBox,
    },
    mixins: [riskAssessmentMixin, initButtonMixin],
    data() {
        return {
            isFundPage: true, // initButtonMixin内会用
            sellCashBoxVisible: false,
        }
    },
    computed: {
        // 公募
        isPublic() {
            return this.$route.query.type === 'public'
        },
        componentId() {
            return this.isPublic ? 'PublicDetail' : 'PrivateDetail'
        },
    },
    beforeRouteEnter(to, from, next) {
        if (to.query.type === 'private') {
            next(vm => {
                if (!vm.$root.isLogin) {
                    vm.$root.login()
                } else {
                    // 已登录
                    const acctObj = vm.$store.getters['user/getAccts']
                    const isProfessional = getProfessionalStatus(acctObj.professionalType)
                    console.warn('isProfessional', isProfessional)
                    if (!isProfessional) {
                        // 非PI用户
                        vm.$dialog.alert({
                            message: vm.$t('piTip'),
                            messageAlign: 'left',
                            confirmButtonText: vm.$t('iKnow'),
                        })
                        next('/')
                    }
                }
            })
        }
        next()
    },
    async created() {
        this.$sensorsTrack('FundDetailView', {
            forward_page: this.$sensors.getPresetProperties().$referrer,
        })
    },
    methods: {
        onChooseAccount({ type, goTransferOutPage }) {
            const { symbol } = this.$route.query
            if (type === 'stock') {
                this.$router.push(`/redeem/${symbol}`)
            }

            if (type === 'bank') {
                const { currency, name } = this.$refs.detailRef.$data.fundInfo
                goTransferOutPage({
                    currency,
                    symbol,
                    fundName: encodeURIComponent(name),
                })
            }
        },
    },
}
</script>
<style lang="less">
@import url('../mixins/initButton/dialog.less');
</style>
<style scoped lang="less">
@import url('~@/assets/css/mixins.less');
@import (once) url('../mixins/initButton/index.less');

.fund-detail {
    background: #f9f9f9;
    user-select: none;
    #iosBottom(16px);
    // 模拟底部模块的高度
    &::after {
        display: block;
        height: 50px;
        content: '';
    }

    .footer-box {
        #iosBottom();

        z-index: 1000;
        background: #fff;
        box-shadow: inset 0 0.5px 0 #efefef;
    }
}
</style>
