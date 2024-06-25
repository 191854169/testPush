<template>
    <tag class="tag flex-shrink0" fontWeight="normal" :text="getTagVal()" :textColor="textColor" :backgroundColor="'rgba(189, 152, 98, 0.1)'"></tag>
</template>

<script>
import tag from '@/components/Tag.vue'
import NP from 'number-precision'
import { getThemeType } from '@/utils/env'
import { i18n } from '@/i18n/fund'

export default {
    name: 'portfolioTag',
    props: {
        portfolioType: {
            type: Number,
            default: 1,
        },
        verifyTheme: {
            type: Boolean,
            default: false,
        },
        tagObj: {
            type: Object,
            default: () => {
                return { 1: i18n.t('follow.hkStock'), 2: i18n.t('follow.usStock'), 3: i18n.t('follow.fundName'), 4: i18n.t('mixed') }
            },
        },
    },
    components: {
        tag,
    },
    data() {
        return {}
    },
    computed: {
        borderInfo() {
            return { 'border-width': `${this.device1px}px`, 'border-style': 'solid', 'border-color': `${this.textColor}` }
        },
        device1px() {
            return NP.divide(1, window.devicePixelRatio).toFixed(2)
        },
        isWhite() {
            return getThemeType() === 'white'
        },
        textColor() {
            // if (this.verifyTheme) {
            //     return this.isWhite ? '#9C9C9C' : '#858585'
            // }
            return '#BD9862'
        },
    },
    methods: {
        getTagVal() {
            return this.tagObj[this.portfolioType || 1]
        },
    },
}
</script>

<style lang="less" scoped>
.tag {
    padding: 1px 0;
    // width: 30px;

    /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
    :v-deep .tag-main {
        .text {
            font-size: 10px;
            line-height: 14px;
        }
    }
}

.border_all {
    #border_all_1px();
}

.theme_border_all {
    #tm_border_all_1px();
}
</style>
