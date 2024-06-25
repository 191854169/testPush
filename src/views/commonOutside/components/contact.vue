<template>
    <!-- 联系客服组件 -->
    <div class="contact-container">
        <div class="btn" @click="openPage">
            <multi-img name="icon_service" directory="commonOutside" class="icon"></multi-img>
            <div class="f14">联系客服</div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { customerService } from '@/utils/utils'

export default {
    computed: {
        ...mapGetters({ getSubAccountId: 'user/getSubAccountId' }),
    },
    methods: {
        // 跳转至联系客服
        openPage() {
            const url = customerService({
                url: true,
                userid: this.getSubAccountId,
            })
            window.open(url)
        },
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
</style>
