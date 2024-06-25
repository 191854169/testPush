<!-- 产品简介 -->
<template>
    <div class="container">
        <div class="text" :class="{ 'line-elipsis_l3': isFold && showBtn }" ref="textRef">
            <span v-if="!!boldText" class="bold">{{ boldText }}</span>
            <span v-html="text"></span>
        </div>
        <div v-if="showBtn" class="fold-btn" @click="onClick">{{ buttonText }}</div>
    </div>
</template>

<script>
import { calcRem } from '@/utils'
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
            isFold: true,
        }
    },
    computed: {
        buttonText() {
            return this.isFold ? this.$t('follow.unfold') : this.$t('follow.fold')
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.showBtn = this.$refs.textRef.scrollHeight > calcRem(document, 66)
        })
    },
    watch: {
        text(newValue, oldValue) {
            if (newValue !== oldValue) {
                this.$nextTick(() => {
                    this.showBtn = this.$refs.textRef.scrollHeight > calcRem(document, 66)
                })
            }
        },
    },
    methods: {
        onClick() {
            this.isFold = !this.isFold
        },
    },
}
</script>

<style scoped lang="less">
.text {
    color: @h1-white;
    font-size: 14px;
    line-height: 24px;
    white-space: pre-line;
    text-overflow: clip;
    word-break: break-all;
}

.fold-btn {
    margin-top: 4px;
    color: #ff6907;
    font-size: 11px;
    line-height: 16px;
}
</style>
