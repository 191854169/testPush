<template>
    <van-dialog width="2.8rem" v-model="show" :title="title" showCancelButton :confirmButtonText="$t('confirm')" @confirm="$emit('confirm')">
        <div class="content">
            <div class="item flex-s flex-c" v-for="(item, index) in list" :key="index">
                <div class="label" :style="item.labelStyle || {}">{{ item.label }}</div>
                <div class="value" :style="item.valueStyle || {}">{{ item.value }}</div>
            </div>
            <div class="tips item flex-c">
                <multi-img name="icon_prompt" directory="common" width="16" height="16"></multi-img>
                <span>{{ $t('subscribe.cantCancel') }}</span>
            </div>
        </div>
    </van-dialog>
</template>

<script>
export default {
    name: 'SubscribeConfimDialog',
    mixins: [],
    components: {},
    props: {
        value: {
            type: Boolean,
            required: true,
        },
        list: {
            type: Array,
            required: true,
        },
        title: {
            type: String,
            default() {
                return this.$t('subscribe.subscribeAffirm')
            },
        },
    },
    data() {
        return {}
    },
    computed: {
        show: {
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
    methods: {},
}
</script>

<style scoped lang="less">
.content {
    padding: 0 16px 24px;

    .item {
        height: 32px;

        .label {
            color: @h3-white;
            font-size: 14px;
            line-height: 20px;
        }

        .value {
            color: @h1-white;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .tips {
        color: @theme-white;
        font-size: 12px;
        line-height: 17px;

        img {
            margin-right: 4px;
        }
    }
}
</style>
