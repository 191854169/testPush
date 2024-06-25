// 定期寿险
<template>
    <div class="insurance-life insurance-detail">
        <div class="banner">
            <multi-img class="banner-img" name="insurance-life-banner" directory="fund" />
            <span class="banner-text">{{ $t('insuranceLife.title') }}</span>
        </div>
        <div class="content">
            <div class="brief">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('brief') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceLife.biref-text1') }}</li>
                    <li>{{ $t('insuranceLife.biref-text2') }}</li>
                </ul>
            </div>
            <div class="special">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('specialAdvantage') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceLife.special-text1') }}</li>
                    <li>{{ $t('insuranceLife.special-text2') }}</li>
                    <li>{{ $t('insuranceLife.special-text3') }}</li>
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
    name: 'insuranceLife',
}
</script>
<style scoped lang="less">
@import './style.less';
</style>
