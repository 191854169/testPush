<!--
 * @Description: 投资集中度
-->

<template>
    <div class="pad-t12">
        <p class="lh-20 pad-l16 h2-white f12">{{ $t('follow.exampleRate') }}</p>
        <p class="lh-20 pad-l16 h2-white f12">{{ $t('follow.matchText') }}</p>
        <div class="pad-12">
            <div class="border-radius-8px bg-white pad-rl12 pad-t8 pad-b12 mar-b12" v-for="item in dataList" :key="item.symbol">
                <div class="f16 elipsis c-main lh-22 border-bottom-1px pad-b8">{{ item.name }}</div>
                <div
                    class="f12 pad-t12 c-gray"
                    v-html="$t('follow.productRate', { investFocusDegree: getInvestFocusDegree(item.investFocusDegree) })"
                ></div>
                <van-radio-group v-model="item.radio" direction="horizontal" class="flex-s pad-t12">
                    <van-radio v-for="i in investFocusDegreeList" :key="i.value" :name="i.value" :value="i.value" @click="changeRadio()">
                        <template v-slot:icon="{ checked }">
                            <multi-img
                                :name="checked ? 'icon_agreement_select' : 'icon_agreement_normal'"
                                directory="fund"
                                class="icon-check"
                            ></multi-img>
                        </template>
                        <span v-if="i.name < 61">&lt;&nbsp;{{ i.name }}%</span>
                        <span v-else>&gt;&nbsp;60%</span>
                    </van-radio>
                </van-radio-group>
                <p class="custips pad-t8 f12 c-red" v-if="item.radio > item.investFocusDegree">{{ $t('jzdtips') }}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'investmentConcentration',
    data() {
        return {
            investFocusDegreeList: [
                { name: 15, value: 1 },
                { name: 30, value: 2 },
                { name: 45, value: 3 },
                { name: 60, value: 4 },
                { name: 61, value: 5 },
            ],
            dataList: [],
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            this.dataList = JSON.parse(localStorage.getItem('investmentList') || '[]')
        },

        // 验证投资集中度
        changeRadio() {
            localStorage.setItem('investmentList', JSON.stringify(this.dataList))
        },

        getInvestFocusDegree(v) {
            let label = this.investFocusDegreeList.find(i => i.value === v)?.name
            if (v === 5) {
                label = `&gt;&nbsp;60%`
            } else {
                label = `&lt;&nbsp;${label}%`
            }
            return label
        },
    },
}
</script>

<style lang="less" scoped>
.van-radio--horizontal {
    flex: 1;
    margin-right: 0;
}

.icon-check {
    width: 16px;
    height: 16px;
}

/deep/ .van-radio__label {
    flex: 1;
    margin-left: 2px;
    color: @h1-white;
}
</style>
