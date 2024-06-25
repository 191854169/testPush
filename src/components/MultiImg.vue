<!-- 
    区分屏幕加载图片,支持多主题多语言,
    icon_a@2x.png 白肤简体
    icon_a_black@2x.png 黑肤简体
    icon_a_tc@2x.png 白肤繁体
    icon_a_black_tc@2x.png  黑肤繁体
    
 -->
<template>
    <img class="multi-img" :src="src" :alt="name" @click="onClick" />
</template>

<script>
import { getThemeType } from '@/utils/env'
import { getLangType } from '@/utils/tools'
export default {
    name: 'multi-img',
    props: {
        directory: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            required: true,
        },
        verifyTheme: {
            // 是否校验主题
            type: Boolean,
            default: false,
        },
        verifyLang: {
            // 是否校验简繁体
            type: Boolean,
            default: false,
        },
    },
    computed: {
        src() {
            const dpr = window.devicePixelRatio
            let name = this.name
            const DOUBLE = '@2x'
            const THREE = '@3x'
            const theme = this.verifyTheme ? (getThemeType() === 'white' ? '' : `_${getThemeType()}`) : ''
            const lang = this.verifyLang ? (getLangType() === 'zhCn' ? '' : `_tc`) : ''
            name += theme
            name += lang
            name += dpr >= 3 ? THREE : DOUBLE
            // 黑肤文件地址： @/assets/images-black/...
            return require('@/assets/images/' + this.directory + '/' + name + '.png')
        },
    },
    methods: {
        onClick(e) {
            this.$emit('click', e)
        },
    },
}
</script>
