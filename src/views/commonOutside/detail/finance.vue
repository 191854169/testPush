<template>
    <!-- 融资 -->
    <div class="common-card">
        <div class="common-head flex-s">
            <div class="flex-c" @click="openPage">
                <div class="f16 c-main bold mar-r6">融资</div>
                <multi-img name="icon_about" directory="commonOutside" class="icon-about"></multi-img>
            </div>
            <div class="f12 c-gray">{{ CURRENCY_MAP[currency] }}</div>
        </div>

        <div class="common-content">
            <!-- 最大借贷额 -->
            <div class="item">
                <div>最大借贷额</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.creditLimit[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 可按仓股票价值 -->
            <div class="item">
                <div>可按仓股票价值</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.marginableValue[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 可融资金额 -->
            <div class="item">
                <div>可融资金额</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.marginPurchasingPower[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 已借金额 -->
            <div class="item">
                <div>已借金额</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.useMarginValue[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 剩余可借 -->
            <div class="item">
                <div>剩余可借</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.surplusMarginValue[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>

            <!-- 计息金额 -->
            <div class="item">
                <div>计息金额</div>
                <div
                    v-riseFall="{
                        value: assetsSummary.interestAmount[currency],
                        hide: !showAsset,
                        hideObj: { color: '#666', text: '****' },
                        sign: false,
                        riseFall: false,
                        rate: false,
                    }"
                ></div>
            </div>
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
            const url = 'https://h5.fotechwealth.com/faq/#/article/490712063657901056/1?langType=' + getLangType()
            this.$goPage(url)
        },
    },
}
</script>
