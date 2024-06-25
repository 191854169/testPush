<!--定制订单记录-->
<template>
    <div class="main-wrapper">
        <div class="pad-12 order-list" v-if="list.length">
            <OrderList :list="list" @refresh="onRefresh"></OrderList>
        </div>
        <div class="nodata-wrapper">
            <Empty v-if="!list.length && loaded" :showImg="true" :tipText="$t('bills.noOrdersText')" imgName="noRecord">
                <div>
                    <p class="text">{{ $t('bills.noOrdersText') }}</p>
                    <button class="add btn" @click.stop="handleClick">
                        <multi-img directory="fund" name="icon_optional_add"></multi-img>
                        {{ $t('bills.addCustomizeProduct') }}
                    </button>
                </div>
            </Empty>
        </div>
        <BottomButton v-if="list.length"></BottomButton>
    </div>
</template>

<script>
import BottomButton from './components/BottomButton.vue'
import OrderList from './components/OrderList.vue'
import Empty from '@/components/Empty.vue'
import { noteCustomizationOrderList } from '@/apis/wealth/index'
import watchPageVisibleMixin from '@/mixins/watchPageVisibleMixin'

export default {
    name: 'CustomizeOrders',
    mixins: [watchPageVisibleMixin],
    components: {
        BottomButton,
        OrderList,
        Empty,
    },
    data() {
        return {
            list: [],
            loaded: false,
        }
    },
    created() {
        this.getData()
    },
    mounted() {
        this.watch(() => {
            this.getData()
        })
    },
    methods: {
        // 刷新
        async onRefresh(callBack) {
            await this.getData()
            callBack && callBack()
        },

        // 获取数据
        async getData() {
            try {
                const { result } = await noteCustomizationOrderList({ count: 9999, start: 0 })
                this.list = result?.list || []
                this.loaded = true
            } catch (e) {
                console.log('noteCustomizationOrderList===>e:', e)
                // 报错清空列表
                this.list = []
                this.loaded = true
            }
        },
        handleClick() {
            this.$goPage('/bill-customize-add')
        },
    },
}
</script>

<style lang="less" scoped>
.main-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;

    .order-list {
        height: calc(100vh - 72px);
    }

    .nodata-wrapper {
        height: 100%;
        padding-top: 1.1rem;
        background: #fff;
    }

    .text {
        margin-top: 4px;
        text-align: center;
    }

    .btn.add {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 140px;
        height: 32px;
        margin-top: 16px;
        color: @theme;
        font-weight: 400;
        font-size: 14px;
        background: rgba(255, 105, 7, 0.07);
        border: none;
        border-radius: 32px;
        box-shadow: none;

        img {
            width: 12px;
            height: 12px;
            margin: 0 4px 0 0;
        }
    }
}
</style>
