<template>
    <div class="fosun-tabs" :class="{ 'circle-tabs': circle }">
        <van-tabs v-model="v" v-bind="$attrs" v-on="$listeners">
            <slot />
        </van-tabs>
    </div>
</template>
<script>
/**
 * 参考 1.src\views\fund\detail\pages\Rule.vue
 * 2.src\views\fund\detail\components\Profile.vue
 */
//
import { Tabs } from 'vant'
export default {
    name: 'fosun-tabs',
    props: {
        value: {
            type: [Number, String],
            default: 0,
        },
        // 圆角tab头
        circle: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        [Tabs.name]: Tabs,
    },
    computed: {
        v: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
    },
}
</script>
<style scoped lang="less">
@tabs-line-height: 50px;

.fosun-tabs {
    /deep/ .van-tabs__wrap {
        .van-tabs__nav {
            background-color: #f9f9f9;
        }

        .van-tabs__line {
            width: 0;
            height: 0;
        }

        .van-tab__text {
            align-items: center;
            color: #666;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
        }

        .van-tab--active {
            .van-tab__text {
                color: #1f1f1f;
                font-weight: 700;
                font-size: 16px;
                line-height: 22px;
            }
        }
    }
}

.circle-tabs {
    background-color: #fff;

    /deep/ .van-tabs__wrap {
        display: flex;
        justify-content: center;
        height: 32px;

        .van-tabs__nav {
            background: #f8f8f8;
            border-radius: 37px;
        }

        .van-tabs__line {
            width: 0;
            height: 0;
        }

        .van-tabs__nav--line {
            display: flex;
            align-items: center;
            box-sizing: border-box !important;
            height: 32px;
            padding: 2px;
        }

        .van-tab {
            width: 80px;
            height: 28px;

            .van-tab__text {
                color: #9c9c9c;
                font-weight: 400;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
            }
        }

        .van-tab--active {
            background-color: #fff;
            border-radius: 14px;

            .van-tab__text {
                color: #2f2f2f;
                font-weight: 700;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
            }
        }
    }
}
</style>
