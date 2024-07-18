<template>
    <div class="file-up-load">
        <div v-if="previewImgSrc" class="preview">
            <img :src="previewImgSrc" @click="openUpfile" />
        </div>
        <div v-else>
            <img :src="defaultBG" @click="openUpfile" />
        </div>
        <div v-if="upStatus > 0" class="mask flex">
            <p v-if="upStatus == 1">上传中...</p>
            <template v-if="upStatus == 2">
                <p class="fsfont retry">&#xe61a;</p>
                <p @click="openUpfile">上传失败，请重试</p>
            </template>
        </div>
    </div>
</template>
<script>
// api
import { fileUpOss, fileDownOss } from '@/apis/openAccount'
import { lupuJsbridge as JSBridge, thsI18NJsBridge } from '@fs/jsbridge/dist/lib/lupu/jsBridge.js'
export default {
    props: {
        /** 默认背景 */
        defaultBG: {
            type: String,
            default: () => '',
        },
        /** 身份证方向 最后返回出去 */
        direction: {
            type: String,
            default: () => '',
        },
        data: {
            type: Object,
            default: () => {
                return null
            },
        },
    },
    data() {
        return {
            inputDom: null, // 创建的一个 input dom 节点
            previewImgSrc: '', //当前预览的图片
            upStatus: 0, //图片上传的状态，1: 上传中； 2：上传失败；0:不显示
            isUp: false, // 是否是上传模式下不去 OSS 获取图片展示，就本地选择展示即可
        }
    },
    mounted() {
        // this.creatInput()
    },
    methods: {
        /** 创建一个 input dom */
        creatInput() {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*' // 只能选择图片类型
            this.inputDom = input
            input.addEventListener('change', () => {
                this.changeFile()
            })
        },
        /** 触发文件上传 */
        openUpfile() {
            this.creatInput()
            if (this.inputDom) {
                this.inputDom.click()
                this.isUp = true
            }
        },
        /** 选择文件之后 开始上传文件并预览 */
        changeFile() {
            var reads = new FileReader()
            const files = this.inputDom.files[0]
            if (files) {
                reads.readAsDataURL(files)

                reads.onload = () => {
                    this.previewImgSrc = reads.result
                }
                this.upStatus = 1

                const self = this

                if (JSBridge) {
                    //自研 APP中上传
                    const reader = new FileReader()
                    reader.onload = function () {
                        /** 上传 OSS 系统 */
                        fileUpOss({
                            fileName: files.name,
                            fileData: reader.result.replace('data:image/jpeg;base64,', ''),
                        })
                            .then(res => {
                                if (res.data.result) {
                                    self.upStatus = 0
                                    self.$emit('upFile', res.data)
                                } else {
                                    // 上传失败
                                    self.upStatus = 2
                                }
                            })
                            .catch(() => {
                                // 上传失败
                                self.upStatus = 2
                            })
                    }
                    reader.readAsDataURL(files)
                } else {
                    /** 上传 OSS 系统 */
                    fileUpOss(this.inputDom.files[0])
                        .then(res => {
                            if (res.data.result) {
                                this.upStatus = 0
                                this.$emit('upFile', res.data)
                            } else {
                                // 上传失败
                                this.upStatus = 2
                            }
                        })
                        .catch(() => {
                            // 上传失败
                            this.upStatus = 2
                        })
                }
            } else {
                this.openUpfile()
            }
        },

        /** 获取OSS图片并展示 */
        getOSSimage(data) {
            if (data.ossId && this.isUp === false) {
                fileDownOss(data).then(({ data }) => {
                    this.previewImgSrc = JSBridge ? 'data:image/jpeg;base64,' + data : URL.createObjectURL(data)
                })
            }
        },
    },
    watch: {
        data(newData) {
            // console.log('newData:', newData)
            this.getOSSimage(newData)
        },
    },
}
</script>
<style lang="less" scoped>
.file-up-load {
    position: relative;
    width: 100%;
    height: 30vw;
    max-height: 260px;
    overflow: hidden;
    border-radius: 4px;

    img {
        width: auto;
        height: 30vw;
        max-height: 260px;
    }

    .preview {
        text-align: center;
    }

    .mask {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        text-align: center;
        background: rgba(0, 0, 0, 0.5);

        .retry {
            margin-bottom: 4px;
            font-size: 24px;
        }

        p {
            width: 100%;
        }
    }
}
</style>
