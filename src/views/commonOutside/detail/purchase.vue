<template>
    <!-- 购买力 -->
    <div class="common-card">
        <div class="common-head flex-s">
            <div class="flex-c" @click="openPage">
                <div class="f16 c-main bold mar-r6">购买力</div>
                <multi-img name="icon_about" directory="commonOutside" class="icon-about"></multi-img>
            </div>
            <div class="f12 c-gray">{{ CURRENCY_MAP[currency] }}</div>
        </div>

        <div class="common-content">
            <!-- 最大购买力 -->
            <div class="item">
                <div>最大购买力</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.maxPurchasingPower[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 现金购买力 -->
            <div class="item">
                <div>现金购买力</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.cashPurchasingPower[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <div class="f12 c-gray mar-t8">以上购买力包括货币基金资产</div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { CURRENCY_MAP } from '../config/common.js'
import { getLangType } from '@/utils/tools'

export default {
    props: {
        assetsSummary: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            CURRENCY_MAP,
        }
    },
    computed: {
        ...mapState('user', ['currency', 'showAsset']),
    },
    methods: {
        openPage() {
            const url = 'https://h5.fotechwealth.com/faq/#/article/490711723021696000/1?langType=' + getLangType()
            this.$goPage(url)
        },
    },
}
</script>
