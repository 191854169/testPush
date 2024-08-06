<!-- TODO: 待定 -->
<template>
    <div class="content">
        <div class="icon-xcb">
            <multi-img name="cash" class="icon" directory="fund"></multi-img>
            <p>{{ $t('cashBox') }}</p>
        </div>
        <div class="info">
            <div class="item">
                <span class="left">当前状态</span>
                <span>{{ isSigned ? '已开通' : '未开通' }}</span>
            </div>
            <div class="item">
                <span class="left">签约账户</span>
                <span>保证金账户</span>
            </div>
            <div class="item">
                <span class="left">开通日期</span>
                <span>{{ signBeginTime }}</span>
            </div>
            <div class="item">
                <span class="left">协议文件</span>
                <span>查看</span>
            </div>
        </div>
        <div class="footer">
            <van-button type="primary" class="close" @click="closeEvent">关闭星财宝</van-button>
        </div>
    </div>
</template>
<script>
import { ecashClose } from '@/apis/wealth/index.js'
import { Toast } from 'vant'
import { lupuJsBridge as JSBridge } from '@fs/jsbridge'
export default {
    name: 'closeService',
    components: {},
    data() {
        return {}
    },
    computed: {
        isSigned() {
            return this.$route.query.isSigned || ''
        },
        signBeginTime() {
            return this.$route.query.signBeginTime || '--'
        },
    },
    created() {},
    mounted() {},
    methods: {
        async closeEvent() {
            if (JSBridge) {
                try {
                    await this.$jsBridge.tradeLogin()
                } catch (e) {
                    console.log('bond-tradeLogin===>error:', e)
                    return
                }
            }
            try {
                const { result } = await ecashClose()
                console.log(result)
                if (result.success) {
                    Toast('关闭成功')
                    const url = `${location.origin}/wealth/fund.html`
                    if (this.$jsBridge) {
                        this.$jsBridge.open({ url: encodeURIComponent(url) })
                    } else {
                        window.location.href = url
                    }
                }
            } catch (e) {
                console.log(e)
                Toast(e?.error?.message)
            } finally {
                this.$loading.show = false
            }
        },
    },
}
</script>
<style scoped lang="less">
.content {
    .icon-xcb {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 72px 0 20px;

        .icon {
            width: 60px;
            height: 60px;
        }

        p {
            margin-top: 16px;
            color: #2f2f2f;
            font-weight: 500;
            font-size: 18px;
            line-height: 26px;
        }
    }

    .info {
        margin: 12px;
        padding: 16px 12px;
        background: #fff;
        border-radius: 8px;

        .item {
            display: flex;
            justify-content: space-between;
            padding: 12px;

            .left {
                color: #666;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
            }
        }
    }

    .footer {
        margin-top: 25px;
        padding: 15px;

        button {
            width: 100%;
            height: 44px;
            color: #fff;
            font-weight: 500;
            font-size: 16px;
            line-height: 44px;
            text-align: center;
            background-color: #ff6307;
            border-width: 0;
            border-radius: 22px;
        }
    }
}
</style>
