<template>
    <div class="flex-shrink0">
        <van-image
            v-if="emptyOSSID"
            width="100%"
            height="100%"
            round
            fit="cover"
            :src="require(`@/assets/images/fund/placeholder_avatar${ratio}.png`)"
        ></van-image>
        <van-image v-else width="100%" height="100%" round fit="cover" :src="imgSrc">
            <template v-slot:error>
                <van-image
                    round
                    width="100%"
                    height="100%"
                    fit="cover"
                    :src="require(`@/assets/images/fund/placeholder_avatar${ratio}.png`)"
                ></van-image>
            </template>
        </van-image>
    </div>
</template>

<script>
import { Image } from 'vant'
import { ossDownloadURL, fileDownload } from '@/apis/modules/oss'
import { isEmpty, dataURLtoBlob } from '@/utils'

export default {
    name: 'headerPortrait',
    props: {
        ossId: {
            type: String,
            default() {
                return ''
            },
        },
        needDownloadImg: {
            type: Boolean,
            default: false,
        },
        // 列表中，区分多个相同的ossid
        markTag: {
            type: [String, Number],
            default() {
                return ''
            },
        },
    },
    components: {
        [Image.name]: Image,
    },
    data() {
        return {
            imageDataUrl: '',
        }
    },
    computed: {
        imgSrc() {
            if (this.needDownloadImg) {
                return this.imageDataUrl
            }
            return ossDownloadURL(this.ossId)
        },
        emptyOSSID() {
            return this.ossId === '' || isEmpty(this.ossId)
        },
        ratio() {
            const dpr = window.devicePixelRatio
            const DOUBLE = '@2x'
            const THREE = '@3x'
            return dpr >= 3 ? THREE : DOUBLE
        },
        markOssid() {
            return `${this.ossId}-${this.markTag}`
        },
    },
    mounted() {
        if (this.needDownloadImg && !this.emptyOSSID) {
            this.downloadImg()
        }
    },
    beforeUnmount() {
        URL.revokeObjectURL(this.url)
    },
    methods: {
        async downloadImg() {
            console.log('image src ossid', this.ossId)
            try {
                this.$store.commit('headerPortrait/setDownloadFailed', this.markOssid)
                const response = await fileDownload(this.ossId)
                const imageBase64 = `data:image/jpeg;base64,${response.data}`
                const imageDataBlob = dataURLtoBlob(imageBase64)
                // 创建 URL
                this.imageDataUrl = URL.createObjectURL(imageDataBlob) // 将 Blob 对象转换为 URL
                console.log('image url', this.imageDataUrl)
                this.$store.commit('headerPortrait/setDownloadSuccess', this.markOssid)
            } catch (e) {
                console.log(e)
            }
        },
    },
    watch: {
        ossId: {
            handler(v) {
                if (this.needDownloadImg && !this.emptyOSSID) {
                    this.downloadImg(v)
                }
            },
        },
    },
}
</script>
<style lang="less" scoped></style>
