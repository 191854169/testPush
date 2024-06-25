<template>
    <div class="androis-download-channel">
        <van-popup class="popup" v-model="showPopup" position="bottom">
            <div class="popup-content">
                <ul @click="activeHandler($event)" class="list">
                    <li v-for="item in list" class="mask list-item" :key="item.key" :data-key="item.key">
                        <multi-img :name="item.icon" directory="fixedDepositTreasure" />
                        <p>{{ item.label }}</p>
                    </li>
                </ul>
            </div>
        </van-popup>
    </div>
</template>

<script>
export default {
    name: 'androis-download-channel',
    props: {
        value: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {}
    },
    computed: {
        showPopup: {
            get() {
                return this.value
            },
            set(v) {
                this.$emit('input', v)
            },
        },
        list() {
            const ret = [
                {
                    key: 'google',
                    label: this.$t('googleDownload'),
                    icon: 'google',
                    link: 'https://play.google.com/store/apps/details?id=com.ChinaMobile&feature=search_result&hl=zh_TW',
                },
                {
                    key: 'huawei',
                    label: this.$t('huaweiDownload'),
                    icon: 'huawei',
                    link: 'https://appgallery.huawei.com/app/C101603919?appId=C101603919&source=appshare&subsource=C101603919',
                },
            ]
            return ret
        },
    },
    methods: {
        activeHandler(e) {
            const { key } = e.target.dataset
            if (!key) return
            setTimeout(() => {
                const { link } = this.list.find(i => i.key === key)
                location.href = link
            }, 100)
        },
    },
}
</script>

<style scoped lang="less">
.androis-download-channel {
    .van-popup {
        overflow: hidden;
        border-radius: 8px 8px 0 0;
    }

    .list {
        padding: 13px 8px 44px;

        &-item {
            display: flex;
            align-items: center;
            height: 64px;
            padding: 17px 13px;
            font-size: 0;
            border-radius: 8px;

            img {
                width: 30px;
                height: 30px;
                margin-right: 10px;
            }

            p {
                color: @fontBlackColor;
                font-size: 16px;
                line-height: 22px;
            }

            &:active {
                background: #fff5ef;
            }
        }
    }
}
</style>
