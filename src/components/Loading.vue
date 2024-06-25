<template>
    <div
        v-if="show"
        @click.prevent
        @touch.prevent
        @touchmove.prevent
        class="loading-toast"
        :class="[mask ? 'loading-mask' : '', `loading-toast-${position}`]"
    >
        <div class="loading-toast-content">
            <img src="@/assets/images/common/loading.png" />
            <p>{{ msg }}</p>
        </div>
    </div>
</template>

<script>
import { getOrigin } from '@/utils/env'
import { i18n } from '@/i18n/fund'
const $t = text => i18n.t(text)

export default {
    name: 'loading',
    props: {
        msg: {
            //loading文案
            type: String,
            default: `${$t('loading')}...`,
        },
        position: {
            // 位置
            type: String,
            default: 'center',
        },
        showLoading: {
            // props控制展示
            type: Boolean,
            default: false,
        },
        propsShow: {
            // 是否props控制
            type: Boolean,
            default: false,
        },
        mask: {
            // 是否覆盖遮罩
            type: Boolean,
            default: false,
        },
    },
    computed: {
        show() {
            return this.propsShow ? this.showLoading : this.$store.state.app.showLoading
        },
    },
    watch: {
        show(val) {
            if (getOrigin() == 3) {
                // 兼容pc端禁止滚动
                const m = function (e) {
                    e.preventDefault()
                }
                if (val) {
                    document.body.style.overflow = 'hidden'
                    document.addEventListener('touchmove', m, false) //禁止页面滑动
                } else {
                    document.body.style.overflow = 'auto' //出现滚动条
                    document.removeEventListener('touchmove', m, false)
                }
            }
        },
    },
}
</script>

<style lang="less" scoped>
.loading-toast {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 6666;
    width: 100%;
    height: 100%;
    background: rgba(256, 256, 256, 0);

    .loading-toast-content {
        position: absolute;
        left: 50%;
        width: 100px;
        height: 100px;
        margin-left: -50px;
        text-align: center;
        background: rgba(119, 119, 119, 0.9);
        border-radius: 4px;

        img {
            width: 36px;
            height: 36px;
            margin-top: 16px;
            animation: r 1s infinite linear;
        }

        @keyframes r {
            0% {
                transform: rotate(0deg);
            }

            25% {
                transform: rotate(90deg);
            }

            50% {
                transform: rotate(180deg);
            }

            75% {
                transform: rotate(270deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }

        p {
            margin: 0;
            padding: 0;
            padding-top: 10px;
            color: #fff;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }
    }
}

.loading-toast-center {
    .loading-toast-content {
        top: 50%;
        margin-top: -50px;
    }
}

.loading-toast-top {
    .loading-toast-content {
        top: 10px;
    }
}

.loading-toast-bottom {
    .loading-toast-content {
        bottom: 10px;
    }
}

.loading-mask {
    background-color: #f9f9f9;
}
</style>
