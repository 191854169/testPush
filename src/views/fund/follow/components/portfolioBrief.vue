<!-- 策略解读 -->
<template>
    <div class="container flex-s" @click="onClick">
        <div class="text" :class="{ 'line-elipsis_l2': showBtn }" ref="textRef">
            <span v-if="!!boldText" class="bold">{{ boldText }}</span>
            <span v-html="text"></span>
        </div>
        <multi-img v-if="showBtn" class="footer_arrow_icon" directory="fund" name="icon_arrow_left"></multi-img>
    </div>
</template>

<script>
import NP from 'number-precision'
export default {
    name: 'portfolioBrief',
    props: {
        text: {
            type: String,
            default: '',
        },
        boldText: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            showBtn: false,
        }
    },
    mounted() {
        this.$nextTick(() => {
            const fontSize = document.documentElement.style.fontSize.replace('px', '')
            this.showBtn = this.$refs.textRef.scrollHeight > NP.times(NP.divide(36, 100), fontSize)
        })
    },
    watch: {
        text(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.$nextTick(() => {
                    const fontSize = document.documentElement.style.fontSize.replace('px', '')
                    this.showBtn = this.$refs.textRef.scrollHeight > NP.times(NP.divide(36, 100), fontSize)
                })
            }
        },
    },
    methods: {
        onClick() {
            if (this.showBtn) {
                this.$emit('onClick')
            }
        },
    },
}
</script>

<style scoped lang="less">
.text {
    overflow: hidden;
    color: #9c9c9c;
    font-size: 12px;
    line-height: 18px;
}

.footer_arrow_icon {
    width: 12px;
    height: 12px;
}
</style>
