<template>
    <div class="concat-us">
        <van-popup
            v-model="visible"
            position="bottom"
            :overlay-style="{ backgroundColor: 'rgba(0, 0, 0, 0.43)' }"
            class="service-popup"
            :safe-area-inset-bottom="false"
        >
            <ul>
                <li class="item">
                    <a href="tel:400 812 0922">
                        <span>{{ $t('mainlandService') }} 400 812 0922</span>
                    </a>
                </li>
                <li class="item">
                    <a href="tel:+852 2979 6988">
                        <span>{{ $t('hkService') }} +852 2979 6988</span>
                    </a>
                </li>
                <li class="item btn" @click="hide">{{ $t('cancel') }}</li>
            </ul>
        </van-popup>
    </div>
</template>

<script>
export default {
    name: 'concat-us',
    data() {
        return {
            visible: false,
        }
    },
    methods: {
        show() {
            this.visible = true
        },
        hide() {
            this.visible = false
        },
    },
}
</script>

<style scoped lang="less">
.concat-us {
    .service-popup {
        border-radius: 12px 12px 0 0;

        &.van-popup.van-popup--bottom {
            min-height: initial;
        }

        ul {
            padding: 12px 0 30px;

            .item {
                font-size: 15px;
                line-height: 50px;
                text-align: center;
                background: #fff;

                a {
                    display: block;
                    color: #2f2f2f;
                }

                &:not(:last-child) {
                    box-shadow: inset 16px 0 0 #fff, inset 0 -0.5px 0 #efefef;
                }
            }
        }
    }
}
</style>
