// 引导卡片
<template>
    <div class="guide-card">
        <multi-img class="icon" :name="icon.name" :directory="icon.directory"></multi-img>
        <div class="content">
            <div class="line1">{{ title }}</div>
            <div class="line2">{{ content }}</div>
        </div>
        <div class="button" @click="$emit('button-click')">{{ btnText }}</div>
    </div>
</template>

<script>
export default {
    name: 'guideCard',
    props: {
        title: {
            type: String,
            default: '',
        },
        content: {
            type: String,
            default: '',
        },
        btnText: {
            type: String,
            default: '',
        },
        icon: {
            type: Object,
            default: () => ({
                name: '',
                directory: '',
            }),
        },
    },
    data() {
        return {
            iconPI: 'icon_PI',
        }
    },
}
</script>

<style scoped lang="less">
.guide-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px 12px;
    background-color: #fff;
    border-radius: 8px;

    .icon {
        width: 32px;
        height: 32px;
    }

    .content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding: 0 12px;

        .line1 {
            color: #2f2f2f;
            font-weight: bold;
            font-size: 16px;
            font-family: 'PingFang SC';
            font-style: normal;
            line-height: 22px;
        }

        .line2 {
            margin-top: 4px;
            color: #666;
            font-weight: 400;
            font-size: 12px;
            font-family: 'PingFang SC';
            font-style: normal;
            line-height: 18px;
        }
    }

    .button {
        padding: 4px 12px;
        color: #ff6907;
        font-weight: bold;
        font-size: 14px;
        font-style: normal;
        line-height: 20px;
        text-align: center;
        background-color: rgba(255, 105, 7, 0.07);
        border-radius: 31px;
    }
}
</style>
