<template>
    <div class="steps">
        <div class="bg-line">
            <p class="flex bg"></p>
            <p class="active-bg" :style="{ width: `${speed}%` }"></p>
            <div class="flex ico">
                <i v-for="(item, index) in steps_total" :key="index" :class="steps >= item.index ? 'active' : ''"></i>
            </div>
            <div class="flex s_text info">
                <p v-for="(item, index) in steps_total" :key="index">
                    <a>
                        <span :class="{ active: item.index == steps }">{{ item.text }}</span>
                        <span v-if="item.index == steps">{{ (speed - (steps - 1) * 50) / 10 }}/5</span>
                    </a>
                </p>
            </div>
        </div>
    </div>
</template>
<script>
// 开户步骤图,不通用
export default {
    props: {
        steps: {
            //进度到了第几步
            type: Number,
            default() {
                return 1 // 选项 1、2、3
            },
        },
        speed: {
            // 某个步骤的百分比 ，在显示的时候依赖 steps 参数 ， 百分比 max:100; min:0
            type: Number,
            default() {
                return 10 // 0 - 100
            },
        },
    },
    data() {
        return {
            steps_total: [
                {
                    index: 1,
                    text: '信息验证',
                },
                {
                    index: 2,
                    text: '风险披露',
                },
                {
                    index: 3,
                    text: '人脸验证',
                },
            ],
        }
    },
}
</script>
<style lang="less" scoped>
@import '../assets/less/openAccount/theme.less';

.steps {
    height: 60px;
    padding: 8px 38px 0;

    .bg-line {
        position: relative;
        right: 0;
        left: 0;
        display: block;

        & .bg,
        & .ico,
        & .s_text,
        & .active-bg {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            justify-content: space-between;
            height: 0;
            background: @theme;
        }

        .bg,
        .active-bg {
            top: 2px;
            height: 2px;
            background: #efefef;
            border-radius: 4px;
        }

        .bg {
            width: 100%;
        }

        .active-bg {
            background: @theme;
        }

        .ico {
            i {
                width: 6px;
                height: 6px;
                background: #efefef;
                border-radius: 50%;
            }

            .active {
                background: @theme;
            }
        }

        .s_text {
            top: 14px;

            p {
                position: relative;

                a {
                    position: absolute;
                    top: 0;
                    left: -15vw;
                    min-width: 30vw;
                    font-size: 12px;
                    text-align: center;

                    span.active {
                        margin-right: 5px;
                        color: #1f1f1f;
                    }
                }
            }
        }
    }
}
</style>
