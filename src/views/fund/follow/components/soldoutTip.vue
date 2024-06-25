<template>
    <div class="soldout-box">
        <div class="content">
            {{ tip }}
            <span class="contact" v-if="isCreater" @click="handleContact">{{ contact }}</span>
        </div>
    </div>
</template>

<script>
import { gotoOnlineService } from '../utils/dialogUtil'
export default {
    props: {
        isCreater: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        tip() {
            console.log('soldoutTip', 'isCreater', this.isCreater)
            if (this.isCreater) {
                return this.$t('customServiceOutageContactTip')
            }
            return this.$t('attention.customOutageBrief')
        },
        contact() {
            return this.$t('concatUs')
        },
    },
    methods: {
        handleContact() {
            gotoOnlineService(this)
        },
    },
}
</script>

<style lang="less" scoped>
.soldout-box {
    padding: 8px 12px;
    background: #fff6e8;
    border-radius: 6px;

    .content {
        color: #af7213;
        font-size: 12px;
        line-height: 18px;
    }

    .contact {
        color: #ff6907;
    }
}
</style>
