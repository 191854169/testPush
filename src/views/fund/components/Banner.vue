<template>
    <div class="banner" v-if="!loading && bannerList.length">
        <van-swipe class="my-swipe" :autoplay="2000">
            <van-swipe-item v-for="item in loading ? getTempList(1) : bannerList" :key="item.id" @click="clickBanner(item)">
                <div class="image-box">
                    <img :src="item.image[lang]" :alt="item.title" />
                </div>
            </van-swipe-item>
        </van-swipe>
    </div>
</template>

<script>
import { SwipeItem, Swipe } from 'vant'
import { getBannerList } from '@/apis/ad.js'
import { getLangType, isTHSApp } from '@/utils'
import { ENCRYPT_TYPES } from '@/httpRequest/http'

// banner跳转方式
const Native = 1
const H5 = 2
export default {
    name: 'banner',
    components: {
        [Swipe.name]: Swipe,
        [SwipeItem.name]: SwipeItem,
    },
    props: {
        position: {
            type: Number,
            default: 7,
        },
    },
    data() {
        return {
            loading: false,
            bannerList: [], // banner列表
        }
    },
    computed: {
        lang() {
            return {
                zhcn: 'cn',
                zhtc: 'tc',
                enus: 'en',
            }[(getLangType() || '').toLowerCase()]
        },
    },
    async created() {
        await this.$store.dispatch('user/getUserInfo', false).catch(() => {})
    },
    async mounted() {
        this.getBannerList()
    },
    methods: {
        async getBannerList() {
            try {
                this.loading = true
                const { result = {} } = await getBannerList({ position: this.position, start: 0, count: 3 }, { encrypt: ENCRYPT_TYPES.NO_ENCRYPT })
                const bannerList = result.records || []
                console.log(`Feng.chen:: 13:58:13 result ===> `, bannerList)
                // NOTE: 星财宝专户 不在同花顺banner展示
                if (isTHSApp() && this.position === 7) {
                    this.bannerList = bannerList.filter(item => {
                        const jumpURL = item.jumpURL || ''
                        return jumpURL.includes('starTreasureAccount') === false
                    })
                } else {
                    this.bannerList = bannerList
                }
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
            }
        },
        // 点击banner
        clickBanner(item) {
            // eslint-disable-next-line prefer-const
            let { jumpType, jumpURL } = item || {}
            switch (jumpType) {
                case H5:
                    if (this.$openPageInThs(jumpURL)) return
                    if (this.$openPageInI18NThs(jumpURL)) return
                    this.$jsBridge ? this.$jsBridge.open({ url: encodeURIComponent(jumpURL), title: '' }) : window.open(jumpURL, '_blank')
                    break
                case Native:
                    if (this.$jsBridge) {
                        const schemeReg = /fosunhani:\/\/stock.goto\//
                        if (schemeReg.test(jumpURL)) {
                            jumpURL = jumpURL.replace(schemeReg, '')
                        }
                        this.$jsBridge.goPage(jumpURL)
                    }
                    break
                default:
            }
        },
        getTempList(length) {
            return Array.from({ length }).map(() => ({}))
        },
    },
}
</script>

<style scoped lang="less">
.banner {
    margin-top: 12px;
    overflow: hidden;
    border-radius: 8px;

    .image-box {
        height: 74px;
        overflow: hidden;
        border-radius: 8px;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .my-swipe {
        border-radius: 8px;
    }

    /deep/ .van-swipe {
        &__indicators {
            bottom: 6px;
        }

        &__indicator {
            width: 8px;
            height: 2px;
            background: #fff;
            border-radius: 23px;
            opacity: 0.4;

            &:not(:last-child) {
                margin-right: 2px;
            }
        }

        &__indicator--active {
            width: 8px;
            opacity: 1;
        }
    }
}
</style>
