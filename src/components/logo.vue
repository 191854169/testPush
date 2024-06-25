<template>
    <div class="logo">
        <header>
            <div class="logo">
                <multi-img name="logo" directory="fund"></multi-img>
                <p>{{ $t('withUp') }}</p>
            </div>
            <div v-if="!showDownloadBtn" class="download-qrcode">
                <multi-img :name="appQrcode" directory="fund"></multi-img>
            </div>
            <button v-else class="dowload-btn" @click="downloadApp">{{ $t('download') }}</button>
        </header>
    </div>
</template>

<script>
import pathnames from '@/config/H5Pathname'
export default {
    name: 'LogoAd',
    props: {
        showDownloadBtn: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        appQrcode() {
            // return process.env.VUE_APP_ENV !== 'prod' ? 'qrcode-sit' : 'qrcode-prod'
            return 'qrcode-prod'
        },
    },

    methods: {
        isNotInHLAndWTApp() {
            return !this.$env.isInApp
        },
        downloadApp() {
            const { VUE_APP_FOSUN_DOWNLOAD_PAGE: fosunAppDownloadUrl } = pathnames
            this.$goPage(fosunAppDownloadUrl)
        },
    },
}
</script>

<style scoped lang="less">
.logo {
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 27px 12px 0;
        background: #f9f9f9;
        // height: 96px;
        .logo {
            img {
                width: 98px;
            }

            p {
                margin: 4px 0 0 5px;
                color: #666;
                font-size: 12px;
                line-height: 17px;
                letter-spacing: 0.35em;
            }
        }

        .download-qrcode {
            img {
                width: 52px;
            }
        }

        .dowload-btn {
            width: 52px;
            height: 28px;
            color: #fff;
            font-size: 14px;
            background-color: #ff6907;
            border: 1px solid;
            border-radius: 31px;
        }
    }
}
</style>
