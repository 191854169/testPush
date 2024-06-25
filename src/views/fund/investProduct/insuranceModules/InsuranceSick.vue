// 重大疾病保险
<template>
    <div class="insurance-sick insurance-detail">
        <div class="banner">
            <multi-img class="banner-img" name="insurance-sick-banner" directory="fund" />
            <span class="banner-text">{{ $t('insuranceSick.title') }}</span>
        </div>
        <div class="content">
            <div class="brief">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('brief') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceSick.biref-text1') }}</li>
                    <li>{{ $t('insuranceSick.biref-text2') }}</li>
                </ul>
            </div>
            <div class="special">
                <div class="tip-contain">
                    <div class="tip-header">{{ $t('specialAdvantage') }}</div>
                </div>
                <ul>
                    <li>{{ $t('insuranceSick.special-text1') }}</li>
                    <li>{{ $t('insuranceSick.special-text2') }}</li>
                    <li>{{ $t('insuranceSick.special-text3') }}</li>
                    <li>{{ $t('insuranceSick.special-text4') }}</li>
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
    name: 'insuranceSick',
}
</script>
<style scoped lang="less">
@import './style.less';
</style>
