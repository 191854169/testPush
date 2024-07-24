<template>
    <div class="fosun-step">
        <div
            class="step-item"
            v-for="(item, index) in stepList"
            :key="index"
            :class="{ 'first-item': index == 0, 'last-item': index == stepList.length - 1 }"
        >
            <div class="step-line"></div>
            <div class="step-label">
                <span class="item-message">{{ item.message }}</span>
                <span class="item-label">{{ item.label }}</span>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'fosunStep',
    props: {
        stepList: {
            type: Array,
            default: () => [],
        },
    },
}
</script>
<style lang="less" scoped>
@circleBorder: 1.5px;
@circleDia: 10px;

.fosun-step {
    display: flex;
    width: 100%;
    height: 100%;
    padding: 6.5px 6.5px 0;
}

.step-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    color: #1f1f1f;
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
    text-align: center;

    .step-line {
        position: relative;
        width: 100%;
        height: 1.5px;
        background-color: @theme;
    }

    .step-line::before {
        position: absolute;
        top: -7px;
        width: 14px;
        height: 14px;
        background-color: #fff;
        border: 2px solid #fff;
        border-radius: 50%;
        transform: translateX(-50%);
        content: '';
    }

    .step-line::after {
        position: absolute;
        top: -5px;
        width: 10px;
        height: 10px;
        background-color: #fff;
        border: @circleBorder solid @theme;
        border-radius: 50%;
        transform: translateX(-50%);
        content: '';
    }

    .step-label {
        display: flex;
        flex-direction: column;
        margin-top: 17px;

        .item-message {
            margin-bottom: 4px;
            color: #666;
            font-weight: 700;
            font-size: 11px;
            line-height: 16px;
        }

        .item-label {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 12px;
            line-height: 16px;
        }
    }
}

.first-item {
    text-align: left;

    .step-label {
        margin-left: -6.5px;
    }
}

.last-item {
    text-align: right;

    .step-label {
        margin-right: -6.5px;
    }
}
</style>
