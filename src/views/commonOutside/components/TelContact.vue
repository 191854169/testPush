<template>
    <div class="contact-container">
        <!-- 联系客服组件 -->
        <div>
            <div class="btn" @click="show = true">
                <multi-img name="icon_service" directory="commonOutside" class="icon"></multi-img>
                <div class="f14">{{ $t('concatUs') }}</div>
            </div>
        </div>
        <ClientServicePopup v-model="show"></ClientServicePopup>
    </div>
</template>

<script>
import ClientServicePopup from '@/components/ClientServicePopup.vue'

export default {
    components: {
        ClientServicePopup,
    },
    data() {
        return {
            show: false,
        }
    },
}
</script>

<style lang="less" scoped>
.contact-container {
    margin-top: 34px;
    margin-bottom: 24px;
    text-align: center;

    .btn {
        display: inline-flex;
        align-items: center;
        padding: 6px 20px;
        background: #fff;
        border-radius: 16px;
    }

    .icon {
        width: 12px;
        height: 12px;
        margin-right: 4px;
    }
}

.block {
    padding: 0 16px 28px;

    .row {
        font-size: 14px;

        .label {
            color: #2f2f2f;
        }

        a {
            color: #043799;
        }
    }
}
</style>
