<template>
    <div class="content" @click="onClick">
        <div class="stock-item">
            <div class="stock-info__symbol" v-html="changeColor(itemInfo.rawSymbol, value)"></div>
            <div class="stock-name line-elipsis" v-html="changeColor(itemInfo.name, value)"></div>
        </div>
        <van-checkbox class="check-box" icon-size="16" checked-color="#2F2F2F" v-model="check">
            <template v-slot:icon="{ checked }">
                <multi-img :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'" directory="fund"></multi-img>
            </template>
        </van-checkbox>
    </div>
</template>
<script>
import { FUND_TYPE_MAP } from '@/views/fund/config/common.js'
import { strColorChange } from '@/utils/tools'

const fundTypeMap = FUND_TYPE_MAP.keyValueMap

export default {
    name: 'fund-item',
    props: {
        itemInfo: {
            type: Object,
            default: () => ({}),
        },
        value: {
            // 搜索字段
            type: String,
            default: '',
        },
    },
    filters: {
        typeFiter: function (v) {
            return fundTypeMap[v] || ''
        },
    },
    data() {
        return {}
    },
    computed: {
        check: {
            get() {
                return this.itemInfo.check
            },
            set(v) {
                if (this.itemInfo.check === v) return

                this.itemInfo.check = v
                this.$emit('check', {
                    value: v,
                    itemInfo: this.itemInfo,
                })
            },
        },
    },
    methods: {
        onClick() {
            this.check = !this.check
        },

        // 修改颜色
        changeColor(origin, match) {
            return strColorChange(origin, match)
        },
    },
}
</script>
<style scoped lang="less">
.content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;

    /deep/ .check-box {
        .van-checkbox__icon {
            font-size: 16px !important;
        }
    }

    img {
        width: 16px;
        height: 16px;
    }

    .stock-item {
        display: flex;
        align-items: center;
        color: @h1-white;
        font-size: 14px;
        line-height: 20px;

        .stock-info__symbol {
            margin-right: 4px;
        }
    }
}
</style>
