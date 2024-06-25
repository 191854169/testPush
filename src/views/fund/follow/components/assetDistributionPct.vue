<template>
    <div class="distr-pct">
        <div class="textContainer">
            <span v-for="(item, index) in pctList" :key="index" :class="{ textBox: item.pct > 0.0, zeroBox: item.pct == 0.0 }">
                <span v-if="item.pct > 0" class="pot" :style="{ backgroundColor: getBgColor(item) }"></span>
                <span v-if="item.pct > 0" class="label">{{ getLabel(item) }}</span>
            </span>
        </div>
        <div class="lineContainer">
            <span
                class="line"
                v-for="(item, index) in displayList"
                :key="index"
                :style="{ minWidth: '2px', width: getPctWidth(item), backgroundColor: getBgColor(item) }"
            ></span>
        </div>
    </div>
</template>
<script>
export default {
    name: 'distribution-pct',
    props: {
        pctList: {
            type: Array,
            default: () => [],
        },
        hiddenPct: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        displayList() {
            return this.pctList.filter(item => {
                return parseFloat(item.pct) > 0
            })
        },
    },
    methods: {
        getBgColor(item) {
            if (item.color) {
                return item.color
            }
            switch (item.key) {
                case 'cash':
                    return '#FF6907'
                case 'hkStock':
                    return '#8F4BE5'
                case 'usStock':
                    return '#3B95FF'
                case 'stockFund':
                    return '#3B95FF'
                case 'bondFund':
                    return '#C448FF'
                case 'mixtureFund':
                    return '#16B1BD'
                case 'moneyFund':
                    return '#FF5B8C'
                case 'publicFund':
                    return '#16B1BD'
                case 'bond':
                    return '#FF5B8C'
                case 'nationalBond':
                    return '#FF6907'
                case 'governmentBond':
                    return '#8F4BE5'
                case 'corporateBond':
                    return '#3B95FF'
                default:
                    return this.generateRandomColor()
            }
        },
        generateRandomColor() {
            // 生成随机RGB颜色值
            const red = Math.floor(Math.random() * 256)
            const green = Math.floor(Math.random() * 256)
            const blue = Math.floor(Math.random() * 256)

            // 将RGB颜色值转换成十六进制颜色值
            const hexColor = '#' + this.componentToHex(red) + this.componentToHex(green) + this.componentToHex(blue)

            return hexColor
        },
        componentToHex(c) {
            const hex = c.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        },
        getPctWidth(item) {
            return parseFloat(item.pct) && parseFloat(item.pct).toFixed(2).toString() + '%'
        },
        getLabel(item) {
            if (this.hiddenPct) {
                return item.label + ' ' + '**%'
            }
            return item.label + ' ' + this.getPctWidth(item)
        },
    },
}
</script>
<style lang="less" scoped>
.distr-pct {
    width: 100%;
    background-color: #fff;

    .textContainer {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        width: 100%;
        margin-bottom: 8px;
    }

    .textBox {
        display: flex;
        align-items: center;
        width: 33.33%;
    }

    .zeroBox {
        width: 0;
    }

    .pot {
        width: 6px;
        height: 6px;
        margin-right: 4px;
        border-radius: 50%;
    }

    .label {
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        font-style: normal;
        line-height: 16px;
    }

    .lineContainer {
        display: flex;
        justify-content: flex-start;
        width: 100%;
        height: 5px;
        overflow: hidden;
        border-radius: 3px;
    }

    .line {
        position: relative;
        height: 100%;
    }

    //解决position: relative时圆角底部会被截取掉的问题
    .line:first-of-type {
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
    }

    .line:last-of-type {
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
    }

    .line:not(:first-of-type)::after {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 111;
        display: block;
        width: 1px;
        height: 5px;
        background: #fff;
        content: '';
    }
}
</style>
