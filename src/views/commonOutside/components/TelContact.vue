<template>
    <div class="contact-container">
        <!-- 联系客服组件 -->
        <div>
            <div class="btn" @click="showDialog = true">
                <multi-img name="icon_service" directory="commonOutside" class="icon"></multi-img>
                <div class="f14">联系客服</div>
            </div>
        </div>
        <van-dialog v-model="showDialog" width="2.8rem" title="联系我们" confirm-button-text="已了解" @confirm="onConfirm">
            <div class="block">
                <div class="row">
                    <span class="label">内地客服：</span>
                    <a href="tel:400 812 0922">400 812 0922</a>
                </div>

                <div class="row mar-t12">
                    <span class="label">香港客服：</span>
                    <a href="tel:+852 2979 6988">+852 2979 6988</a>
                </div>
            </div>
        </van-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            showDialog: false,
        }
    },
    methods: {
        onConfirm() {
            this.showDialog = false
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
