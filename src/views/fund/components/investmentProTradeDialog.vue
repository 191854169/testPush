<template>
    <van-dialog width="2.8rem" v-model="display" :title="$t('prompt')" :show-confirm-button="false">
        <div class="dialog-content">
            <div class="text">{{ $t('investmentProDialog') }}</div>
            <!-- <div class="checkbox" @click="checked = !checked">
                <multi-img v-show="checked" name="icon_agreement_select" directory="fund"></multi-img>
                <multi-img v-show="!checked" name="icon_agreement_normal" directory="fund"></multi-img>
                <span>{{ $t('notRemindNextTime') }}</span>
            </div> -->
            <div class="i-know" @click="onClick">{{ $t('iKnow') }}</div>
        </div>
    </van-dialog>
</template>

<script>
// import { ClientSettingKey } from '@/config/common.js'
import ClientSettingMixin from '@/mixins/ClientSettingMixin.js'

// const notRemindKey = ClientSettingKey.notRemindKey

export default {
    name: '',
    mixins: [ClientSettingMixin],
    components: {},
    props: {
        value: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            checked: false,
            notRemind: {},
        }
    },
    computed: {
        display: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
    watch: {},
    created() {},
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        onClick() {
            // if (this.checked) {
            //     const v = { ...this.notRemind, InvestmentProKey: 1 }
            //     this.setClientSetting(notRemindKey, v)
            // }
            this.display = false
        },
    },
}
</script>

<style scoped lang="less">
.dialog-content {
    padding: 0 16px 24px;

    .text {
        color: @h1-white;
        font-size: 14px;
        line-height: 22px;
    }

    .checkbox {
        display: flex;
        align-items: center;
        height: 44px;

        img {
            width: 16px;
            margin-right: 4px;
        }

        span {
            color: #9c9c9c;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .i-know {
        height: 44px;
        margin-top: 8px;
        color: #fff;
        font-weight: bold;
        font-size: 16px;
        line-height: 44px;
        text-align: center;
        background: @theme;
        border-radius: 22px;
    }
}
</style>
