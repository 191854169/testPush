// 储蓄分红保险
<template>
    <div class="insurance-profit insurance-detail">
        <div class="banner">
            <multi-img class="banner-img" name="insurance-profit-banner" directory="fund" />
            <span class="banner-text">{{ $t('insuranceProfit.title') }}</span>
        </div>
        <div class="content">
            <div class="brief">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('brief') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceProfit.biref-text1') }}</li>
                </ul>
            </div>
            <div class="special">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('specialAdvantage') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceProfit.special-text1') }}</li>
                    <li>{{ $t('insuranceProfit.special-text2') }}</li>
                    <li>{{ $t('insuranceProfit.special-text3') }}</li>
                    <li>{{ $t('insuranceProfit.special-text4') }}</li>
                    <li>{{ $t('insuranceProfit.special-text5') }}</li>
                    <li>{{ $t('insuranceProfit.special-text6') }}</li>
                    <li>{{ $t('insuranceProfit.special-text7') }}</li>
                    <li>{{ $t('insuranceProfit.special-text8') }}</li>
                </ul>
            </div>
            <div class="remark">
                {{ $t('intro.insuranceRelationCompanyTip') }}
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'insuranceProfit',
}
</script>
<style scoped lang="less">
@import './style.less';
</style>
