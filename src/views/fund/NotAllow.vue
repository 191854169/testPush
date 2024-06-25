<template>
    <div class="not-allow-page">
        <div class="tips">
            <multi-img width="103" height="103" :name="currentTipsData.imgName" directory="common" />
            <div class="tips-msg">
                {{ currentTipsData.message }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'not-allow',
    data() {
        return {
            tipsMap: {
                inactive: {
                    imgName: 'noData',
                    message: this.$t('inActiveMsg'),
                },
            },
        }
    },
    computed: {
        type() {
            return this.$route.query.type || 'inactive'
        },
        currentTipsData() {
            return this.tipsMap[this.type] || {}
        },
    },
}
</script>

<style scoped lang="less">
.not-allow-page {
    .tips {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 206px;

        .tips-msg {
            margin-top: 12px;
            color: #000;
            font-size: 12px;
        }
    }
}
</style>
