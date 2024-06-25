<template>
    <div class="create-step">
        <div
            v-for="(item, index) in stepList"
            :key="index"
            :class="{ 'step-item': index != stepList.length - 1, 'step-item-last': index == stepList.length - 1 }"
        >
            <div class="step-node">
                <div class="step-node-head">
                    <span
                        :class="{
                            'step-line-head-white': index == 0,
                            'step-line-head item-finish': index <= active,
                            'step-line-head-grey': index > active,
                        }"
                    ></span>
                    <div
                        class="item-label"
                        :class="{
                            'item-label-active': index == active,
                            'item-undo-label': index > active,
                            'item-label-active item-finish': index < active,
                        }"
                    >
                        {{ item.label }}
                    </div>
                    <span
                        :class="{
                            'step-line-head-white': index == stepList.length - 1,
                            'step-line-head item-finish': index < active,
                            'step-line-head-grey': index >= active,
                        }"
                    ></span>
                </div>
                <div :class="{ 'item-message': index == active, 'item-message-grey': index != active }">{{ item.message }}</div>
            </div>
            <span v-if="index != stepList.length - 1" :class="{ 'step-line item-finish': index < active, 'step-line-grey': index >= active }"></span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'createStep',
    props: {
        stepList: {
            type: Array,
            default: () => [],
        },
        active: {
            type: Number,
            default: 0,
        },
    },
}
</script>
<style lang="less" scoped>
.create-step {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
}

.step-item {
    display: flex;
    flex: 1;
    height: 48px;
}

.step-item-last {
    display: flex;
    width: auto;
    height: 48px;
}

.step-node {
    flex-direction: column;
    align-items: center;
    width: auto;
}

.step-node-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.item-label {
    display: flex;
    flex-shrink: 0;
    align-items: center; // 上下居中
    justify-content: center;
    width: 22px;
    height: 22px;
    margin-right: 5px;
    margin-left: 5px;
    font-weight: 400;
    font-size: 12px;
    text-align: center;
    border-radius: 50%;
}

.item-label-active {
    color: #fff;
    background-color: #ff6907;
}

.item-finish {
    opacity: 0.4;
}

.item-undo-label {
    color: #d9d9d9;
    background-color: #fff;
    border: 1.5px solid #d9d9d9;
}

.item-message {
    margin-top: 10px;
    color: #2f2f2f;
    font-weight: 500;
    font-size: 12px;
    font-style: normal;
    line-height: 16px;
}

.item-message-grey {
    margin-top: 10px;
    color: #9c9c9c;
    font-weight: 400;
    font-size: 12px;
    font-style: normal;
    line-height: 16px;
}

.step-line {
    flex: 1;
    height: 1.5px;
    margin-top: 10.25px;
    background-color: #ff6907;
}

.step-line-head {
    flex: 1;
    height: 1.5px;
    background-color: #ff6907;
}

.step-line-grey {
    flex: 1;
    height: 1.5px;
    margin-top: 10.25px;
    background-color: #d9d9d9;
}

.step-line-head-grey {
    flex: 1;
    height: 1.5px;
    background-color: #d9d9d9;
}

.step-line-head-white {
    flex: 1;
    height: 1.5px;
    background-color: transparent;
}
</style>
