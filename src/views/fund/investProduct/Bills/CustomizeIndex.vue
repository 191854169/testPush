<!--
 * @Description: 定制票据产品
-->
<template>
    <div class="main-wrapper">
        <div class="pad-12">
            <div class="records flex-s" @click="goToRecord">
                <div>{{ $t('bills.customProductRecords') }} ({{ customOrderCount }}）</div>
                <multi-img width="12" height="12" name="icon_arrow_left" directory="fund" alt="icon_arrow_left" verifyTheme></multi-img>
            </div>
            <div class="container">
                <CustomizeProducts></CustomizeProducts>
            </div>
        </div>
        <BottomButton v-if="customProductListTotal" :tip="$t('customBillListLegalTip')"></BottomButton>
    </div>
</template>

<script>
import CustomizeProducts from './components/CustomizeProducts.vue'
import BottomButton from './components/BottomButton.vue'
import { noteCustomizationOrderCount } from '@/apis/wealth/index'
import { getCustomProductList } from '@/apis/fund/note'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'
import { isTenantApp } from '@/utils'

export default {
    name: 'CustomizeIndex',
    mixins: [watchPageVisibleMixin],
    components: {
        CustomizeProducts,
        BottomButton,
    },
    data() {
        return {
            customOrderCount: 0,
            start: 1,
            customProductListTotal: 0, // 票据可见产品列表数量
        }
    },
    computed: {},
    mounted() {
        this.getNoteCustomizationOrderCount()
        this.getCustomProductListData()
        // 站外不能添加该属性，否则影响页面滚动
        if (isTenantApp()) {
            document.body.style.overflow = 'hidden'
        }
        this.watch(() => {
            this.getNoteCustomizationOrderCount()
        })
    },
    methods: {
        goToRecord() {
            this.$goPage('/bill-customize-orders')
        },

        // 获取票据可见产品列表
        async getCustomProductListData() {
            try {
                const { result = {} } =
                    (await getCustomProductList({
                        start: this.start,
                        count: 1,
                        includesExpired: 1,
                        subAccountId: this.$store.getters['user/getSubAccountId'],
                    })) ?? {}

                this.customProductListTotal = result?.total || 0
            } catch (err) {
                console.log('err', err)
            }
        },

        // 获取客户定制单数量
        async getNoteCustomizationOrderCount() {
            try {
                const { result = {} } = (await noteCustomizationOrderCount({})) ?? {}
                this.customOrderCount = result?.count || 0
            } catch (err) {
                console.log('err', err)
            }
        },
    },
}
</script>

<style lang="less" scoped>
.main-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background-color: @background-white;

    .records {
        height: 48px;
        margin-bottom: 12px;
        padding: 14px 12px 14px 15px;
        background: #fff;
        border-radius: 8px;
    }
}
</style>
