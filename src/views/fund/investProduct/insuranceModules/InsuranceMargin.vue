// 保费融资产品
<template>
    <div class="insurance-margin insurance-detail">
        <div class="banner">
            <multi-img class="banner-img" name="insurance-margin-banner" directory="fund" />
            <span class="banner-text">{{ $t('insuranceMargin.title') }}</span>
        </div>
        <div class="content">
            <div class="brief">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('brief') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceMargin.biref-text1') }}</li>
                    <li>{{ $t('insuranceMargin.biref-text2') }}</li>
                </ul>
            </div>
            <div class="special">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('specialAdvantage') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceMargin.special-text1') }}</li>
                    <li>{{ $t('insuranceMargin.special-text2') }}</li>
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
    name: 'insuranceMargin',
}
</script>
<style scoped lang="less">
@import './style.less';
</style>
