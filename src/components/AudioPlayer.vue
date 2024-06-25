<template>
    <div class="audio-player" v-if="currentSource">
        <div class="avatar">
            <img :src="avatar ? avatar : currentSource.avatar" alt="" />
        </div>
        <div class="main">
            <div class="text-content">
                <div class="title">{{ title ? title : `持牌代表：${currentSource.name}` }}</div>
                <div class="sub">{{ sub ? sub : `牌照号 ${currentSource.license}` }}</div>
            </div>
            <div class="controls">
                <van-popover v-model="rateSelectorVisible" trigger="click">
                    <ul class="rate-list">
                        <li v-for="item in rateOptions" :key="item.value">
                            <div class="list-item" :class="{ 'active-item': item.value === rate }" @click="handleRateSelect(item)">
                                {{ item.text }}
                            </div>
                        </li>
                    </ul>
                    <template #reference>
                        <div v-if="showRate" class="rate">倍速</div>
                    </template>
                </van-popover>
                <div v-if="showSource" class="source" @click="handleSourceChange">{{ currentSource.lang }}</div>
            </div>
        </div>
        <div class="extra">
            <div v-if="showControl" class="play-btn" @click="handlePlayBtnClick">
                <img :src="playStatus ? icon_suspend : icon_play" alt="" />
            </div>
            <div v-if="showRest" class="rest">{{ restTimeStr }}</div>
        </div>
    </div>
</template>
<script>
import { humanTime } from '@/utils'

import icon_play from '@/assets/images/openAccount/risk/icon_card_play.png'
import icon_suspend from '@/assets/images/openAccount/risk/icon_card_suspend.png'

export default {
    props: {
        source: {
            required: true,
            type: Array,
            default() {
                return []
            },
        },
        title: {
            type: String,
            default: '',
        },
        sub: {
            type: String,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        showRate: {
            type: Boolean,
            default: true,
        },
        showRest: {
            type: Boolean,
            default: true,
        },
        showControl: {
            type: Boolean,
            default: true,
        },
        showSource: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            audioDom: null,
            rate: 1,
            rateOptions: [
                {
                    text: '1X',
                    value: 1,
                },
                {
                    text: '1.25X',
                    value: 1.25,
                },
                {
                    text: '1.5X',
                    value: 1.5,
                },
            ],
            fullTime: 0,
            currentTime: 0,
            currentTrack: 0,
            playStatus: false,
            rateSelectorVisible: false,
            // pic - 这里不太清楚vue引入图片机制
            icon_play,
            icon_suspend,
        }
    },
    computed: {
        currentSource() {
            // 当前音轨 - audio src
            return this.source[this.currentTrack]
        },
        restTimeStr() {
            // 剩余时间
            const restTime = this.fullTime - this.currentTime
            const time = humanTime(restTime * 1000, { minutesLen: 1 })
            return restTime <= 0 ? `` : `约${time.minutes}分${time.second}秒`
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.initAudio()
        })
    },
    destroyed() {
        this.audioDom?.pause()
        this.audioDom = null
    },
    watch: {
        currentTrack() {
            // 换轨处理
            this.audioDom.src = this.currentSource.source
            this.resetAudio()
        },
        source() {
            this.initAudio()
            this.resetAudio()
        },
    },
    methods: {
        initAudio() {
            // 新建Audio音频对象
            this.audioDom = new Audio(this.currentSource?.source) ?? {}
            console.log('🚀 ~ initAudio ~ currentSource', this.currentSource)
            this.addAudioEvent()
            // 浏览器限制了自动播放，待后续解决
        },
        addAudioEvent() {
            // 音频基本信息
            this.audioDom.addEventListener('canplay', () => {
                console.log('audio ready')
                this.fullTime = this.audioDom.duration
                this.$emit('canplay', this.audioDom)
            })
            // 播放进度跟踪
            this.audioDom.addEventListener('timeupdate', () => {
                this.currentTime = Math.floor(this.audioDom.currentTime)
                this.$emit('timeupdate', this.audioDom.currentTime)
            })
            // 音频播放结束
            this.audioDom.addEventListener('ended', () => {
                console.log('audio ended')
                this.resetAudio(false)
                this.$emit('ended', this.audioDom)
            })
        },
        resetAudio(reload = true) {
            // 重置音频状态
            this.audioDom.pause()
            this.playStatus = false
            this.audioDom.currentTime = 0
            this.fullTime = 0
            this.currentTime = 0
            this.rate = 1
            reload && this.audioDom.load()
        },
        handleRateSelect(action) {
            // 切换倍速
            this.rate = action?.value ?? 1

            this.audioDom.playbackRate = this.rate

            this.rateSelectorVisible = false
        },
        handleSourceChange() {
            // 换轨 - 取下一个音轨
            this.currentTrack = this.currentTrack === this.source.length - 1 ? 0 : this.currentTrack + 1
            this.$nextTick(() => {
                this.$emit('changeSource', this.currentSource.key)
            })
        },
        handlePlayBtnClick() {
            // 控制
            if (this.playStatus) {
                this.audioDom?.pause()
            } else {
                this.audioDom?.play()
            }

            this.playStatus = !this.playStatus
        },
    },
}
</script>
<style lang="less" scoped>
.audio-player {
    display: flex;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 8px;

    .avatar {
        flex: 0 0 auto;
        width: 72px;
        height: 72px;
        margin-right: 12px;
        overflow: hidden;
        background: #fff;
        border-radius: 4px;
    }

    .main {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        justify-content: space-between;

        .text-content {
            .title {
                margin-bottom: 4px;
            }

            .sub {
                color: #666;
                font-size: 12px;
            }
        }

        .controls {
            display: flex;
            align-items: center;

            .rate {
                position: relative;
                box-sizing: border-box;
                width: 45px;
                height: 20px;
                margin-right: 16px;
                padding: 0 6px;
                color: #ff6907;
                font-size: 12px;
                line-height: 20px;
                white-space: nowrap;
                background: #fff;
                border: 0.5px solid rgba(255, 105, 7, 0.5);
                border-radius: 4px;

                &::after {
                    position: absolute;
                    top: 50%;
                    right: 6px;
                    width: 0;
                    height: 0;
                    border: 3px solid transparent;
                    border-top-color: #ff6907;
                    content: '';
                }
            }

            .source {
                width: 20px;
                height: 20px;
                overflow: hidden;
                color: #ff6907;
                font-size: 12px;
                line-height: 20px;
                text-align: center;
                background: #fff;
                border: 0.5px solid rgba(255, 105, 7, 0.5);
                border-radius: 50%;

                &:active {
                    color: #fff;
                    background: rgba(255, 105, 7, 0.4);
                }
            }
        }
    }

    .extra {
        display: flex;
        flex: 0 1 auto;
        flex-direction: column;
        align-items: flex-end;
        justify-content: space-between;
        margin-left: 12px;

        .play-btn {
            width: 28px;
            height: 28px;
        }

        .rest {
            color: #aaa;
            font-size: 12px;
        }
    }
}

.rate-list {
    width: 70px;
    text-align: center;

    li {
        border-bottom: 1px solid #efefef;

        &:last-child {
            border-bottom: none;
        }

        .list-item {
            height: 36px;
            padding: 0 8px;
            line-height: 36px;
            white-space: nowrap;
            border-bottom: 0.5px solid #f9f9f9;

            &.active-item {
                color: #ff6307;
            }
        }
    }
}
</style>
