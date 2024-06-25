// 进度Step
<template>
    <div class="progress-step">
        <div
            class="step-item"
            v-for="(item, index) in stepList"
            :key="index"
            :class="{ 'first-item': index == 0, 'last-item': index == stepList.length - 1 }"
        >
            <div class="line-container">
                <div class="step-line" :class="{ active: item.active, 'clear-line-color': index == 0 }"></div>
                <div v-if="!item.hiddenCircle" class="step-circle" :class="{ active: item.active }"></div>
                <div
                    class="step-line"
                    :class="{ active: item.nextActive || item.halfActive, 'clear-line-color': index == stepList.length - 1 }"
                ></div>
            </div>
            <div class="step-label">
                <!-- message 高亮：当前active 且 下一个状态不active-->
                <span class="item-message" :class="{ 'item-message-bold': item.active && !item.nextActive }">{{ item.message }}</span>
                <span class="item-label">{{ item.label }}</span>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ProgressStep',
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

.progress-step {
    display: flex;
    width: 100%;
    height: 100%;
}

.step-item {
    display: flex;
    flex-direction: column;
    width: 100%;
    text-align: center;

    .line-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 10px;

        .step-line {
            position: relative;
            width: 100%;
            height: 1.5px;
            background-color: #dedede;
        }

        .step-circle {
            position: relative;
            flex-shrink: 0;
            width: 10px;
            height: 10px;
            margin: 0 2px;
            border: 1.5px solid #dedede;
            border-radius: 50%;
        }

        .active {
            background-color: #ff6907;
            border-color: #ff6907;
        }

        .clear-line-color {
            background-color: transparent;
        }
    }

    .step-label {
        display: flex;
        flex-direction: column;
        margin-top: 8px;

        .item-message {
            margin-bottom: 4px;
            color: @h3-white;
            font-weight: normal;
            font-size: 12px;
            line-height: 16px;
        }

        .item-message-bold {
            color: @h1-white;
            font-weight: bold;
        }

        .item-label {
            color: #9c9c9c;
            font-weight: normal;
            font-size: 10px;
            line-height: 14px;
        }
    }
}
</style>
