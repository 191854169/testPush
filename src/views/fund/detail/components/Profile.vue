<template>
    <div class="profile" id="profile">
        <div class="profile-title">{{ $t('fundProfile') }}</div>
        <div class="profile-body">
            <fosun-tabs v-model="active" circle>
                <van-tab :title="fundProfile.title">
                    <div class="tab-content" :class="{ 'tab-content__private': isPrivate }">
                        <div class="profile-info__item" v-for="(key, index) in Object.keys(fundProfile[priefKey])" :key="index">
                            <div class="label">{{ briefKeyMap[key]() }}</div>
                            <div class="text">{{ fundProfile[priefKey][key] }}</div>
                        </div>
                    </div>
                </van-tab>
                <van-tab :title="fundManager.title">
                    <div class="tab-content" :class="{ 'tab-content__private': isPrivate }" v-if="fundManager.list.length > 0">
                        <div class="content-head">
                            <div>{{ $t('name') }}</div>
                            <div>{{ $t('presidency') }}</div>
                        </div>
                        <div class="content-item" v-for="(item, index) in fundManager.list" :key="index">
                            <div class="label line-elipsis">{{ item.name }}</div>
                            <div class="text">{{ item.date }}</div>
                        </div>
                    </div>
                    <empty v-else class="tab-content" :class="{ 'tab-content__private': isPrivate }"></empty>
                </van-tab>
                <van-tab :title="fundFile.title" v-if="isPublic">
                    <div class="tab-content" :class="{ 'tab-content__private': isPrivate }" v-if="fundFile.list.length > 0">
                        <div class="content-head">
                            <div class="label">{{ $t('type') }}</div>
                            <div class="text">{{ $t('updateDate') }}</div>
                        </div>
                        <div class="content-item" v-for="(item, index) in fundFile.list" :key="index" @click="pdfClickHandler(item)">
                            <div class="label">
                                <multi-img width="20" height="20" name="icon_pdf" directory="fund"></multi-img>
                                <span>{{ item.fileType }}</span>
                            </div>
                            <div class="text">{{ item.Date | dateFormat }}</div>
                        </div>
                    </div>
                    <empty v-else class="tab-content" :class="{ 'tab-content__private': isPrivate }"></empty>
                </van-tab>
            </fosun-tabs>
        </div>
    </div>
</template>
<script>
import Empty from '@/components/Empty.vue'
import FosunTabs from '@/components/FosunTabs.vue'
import { Tab } from 'vant'
import { getBrief, getManager, getFile } from '@/apis/fund/fund'
import { isHLApp, isTHSI18NApp } from '@/utils/tools.js'
import { milliFormat } from '../../../../utils'

export default {
    name: 'profile',
    components: {
        Empty,
        FosunTabs,
        [Tab.name]: Tab,
    },
    filters: {
        dateFormat(v) {
            if (!v) return '--'
            const date = new Date(v)
            return isNaN(+date) ? '' : date.format('yyyy/MM/dd')
        },
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            active: 0,
            typeEnum: {
                1: this.$t('stockType'),
                2: this.$t('bondType'),
                3: this.$t('mixedType'),
                4: this.$t('currencyType'),
                5: this.$t('stockRightType'),
            },
            briefKeyMap: {
                name: () => this.$t('fundName'),
                ISIN: () => this.$t('isinCode'),
                shareType: () => this.$t('classOfShares'),
                type: () => this.$t('fundType'),
                inceptionRegion: () => this.$t('foundPosition'),
                inceptionDate: () => (this.isPublic ? this.$t('typeDate') : this.$t('foundDay')),
                custodianCompany: () => this.$t('custodianCompany'),
                currency: () => this.$t('baseCurrency'),
                tradingFrequency: () => this.$t('tradingFrequency'),
                minInitial: () => `${this.$t('minInitial')}`,
                // 'brief': () => this.$t('fundBrief'),
                lockPeriod: () => this.$t('lockPeriod'),
                riskRating: () => this.$t('riskLevel'),
            },
            riskRating: {
                1: this.$t('lowRisk'),
                2: this.$t('middleLowRisk'),
                3: this.$t('middleRisk'),
                4: this.$t('middleHighRisk'),
                5: this.$t('highRisk'),
            },
            fundProfile: {
                title: this.$t('fundProfile'),
                publicInfo: {
                    name: '',
                    ISIN: '',
                    shareType: '',
                    type: '',
                    inceptionRegion: '',
                    inceptionDate: '',
                },
                privateInfo: {
                    name: '',
                    custodianCompany: '',
                    currency: '',
                    type: '',
                    riskRating: '',
                    minInitial: '',
                    inceptionDate: '',
                    lockPeriod: '',
                    tradingFrequency: '',
                    // brief: ''
                },
            },
            fundManager: {
                title: this.$t('fundManager'),
                list: [],
            },
            fundFile: {
                title: this.$t('fundFile'),
                list: [],
            },
        }
    },
    computed: {
        isPublic() {
            return this.$route.query.type === 'public'
        },
        isPrivate() {
            return this.$route.query.type === 'private'
        },
        priefKey() {
            return `${this.isPublic ? 'public' : 'private'}Info`
        },
    },
    created() {
        this.getBrief()
        this.getManager()
        this.getFile()
    },
    methods: {
        async getBrief() {
            try {
                const res = await getBrief({ symbol: this.symbol })
                const resultKey = this.isPublic ? 'pubBrief' : 'priBrief'
                if (res.result && res.result[resultKey]) {
                    const brief = res.result[resultKey]
                    Object.keys(this.fundProfile[this.priefKey]).forEach(key => {
                        if (['type'].includes(key)) {
                            this.fundProfile[this.priefKey][key] = this[`${key}Enum`][brief[key]]
                        } else if (['inceptionDate'].includes(key)) {
                            this.fundProfile[this.priefKey][key] = this.$options.filters.dateFormat(brief[key])
                        } else if (['minInitial'].includes(key)) {
                            this.fundProfile[this.priefKey][key] = `${milliFormat(brief[key])} ${brief.shareCurrency || ''}`
                        } else if (['riskRating'].includes(key)) {
                            this.fundProfile[this.priefKey][key] = brief[key] ? `R${brief[key]}-${this.riskRating[brief[key]]}` : '--'
                        } else {
                            this.fundProfile[this.priefKey][key] = brief[key]
                        }
                    })
                    console.log(' this.fundProfile', this.fundProfile)
                }
            } catch (e) {
                console.log('getBrief=>e:', e)
            }
        },
        async getManager() {
            try {
                const res = await getManager({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    const list = res.result.list
                    this.fundManager.list = list.map(item => {
                        if (this.isPrivate) {
                            return {
                                name: item.name,
                                date: this.$t('fromFoundedToDay'),
                            }
                        }
                        const startDate = item.startDate.replace(/-/g, '/')
                        const endDate = item.endDate ? item.endDate.replace(/-/g, '/') : this.$t('soFar')
                        return {
                            name: item.name,
                            date: `${startDate} ${endDate}`,
                        }
                    })
                }
            } catch (e) {
                console.log('getManager=>e:', e)
            }
        },
        async getFile() {
            try {
                if (!this.isPublic) return
                const res = await getFile({ symbol: this.symbol })
                if (res.result && res.result.list) {
                    this.fundFile.list = res.result.list
                }
            } catch (e) {
                console.log('getFile=>e:', e)
            }
        },
        pdfClickHandler(item) {
            console.log('item----:', item)
            const { fileUrl: url, fileType: title } = item
            if (isHLApp() && this.$jsBridge) {
                this.$jsBridge.openPDF({ url, title })
            } else if (isTHSI18NApp()) {
                // 本地测试url，基金文件较大，打开过程添加 loading
                // const url = 'https://sit-hq-fund.oss-cn-shanghai.aliyuncs.com/fund/202401/8873b0fd285b5530a220150f20e7b617.pdf'
                // const successCallback = () => (this.$loading.show = false)
                // const failCallback = () => (this.$loading.show = true)
                // this.$thsI18NJsBridge.openPDF({ url, title, failCallback, successCallback })
                this.$thsI18NJsBridge.openPDF({ url, title })
            } else {
                window.open(url)
            }
        },
    },
}
</script>
<style scoped lang="less">
/deep/ .van-tabs__content {
    .van-tab__pane {
        position: relative;
        padding-bottom: 12px;
    }

    // .van-tab__pane::before{
    //     content: '';
    //     width: 100%;
    //     height: 22px;
    //     position: absolute;
    //     top: 0;
    //     background: linear-gradient(180deg,#fff,hsla(0,0%,100%,.4));;
    // }

    .van-tab__pane::after {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 22px;
        background: linear-gradient(180deg, hsla(0deg, 0%, 100%, 0.4), #fff);
        content: '';
    }
}

.profile {
    margin: 12px;
    padding: 8px 12px 0;
    background: #fff;
    border-radius: 8px;
}

.profile-title {
    padding: 7px 0 15px;
    color: #2f2f2f;
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
}

.tab-content {
    height: 205px;
    margin-top: 12px;
    overflow: hidden scroll;

    .profile-info__item {
        display: flex;
        flex-direction: row;
        margin-bottom: 12px;
        font-weight: 400;
        font-size: 12px;
        line-height: 20px;

        .label {
            width: 82px;
            height: 20px;
            padding-right: 16px;
            color: #666;
        }

        .text {
            max-width: calc(100% - 98px);
            overflow: hidden;
            color: #2f2f2f;
            white-space: pre-wrap;
        }
    }

    .profile-info__item:last-of-type {
        margin-bottom: 8px;
    }

    .content-head {
        position: sticky;
        top: 0;
        display: flex;
        justify-content: space-between;
        height: 24px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 24px;
        background-color: #fff;
    }

    .content-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 40px;
        color: #2f2f2f;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;

        .label {
            display: flex;
            align-items: center;
            max-width: 206px;

            img {
                margin-right: 8px;
            }
        }
    }
}

.tab-content__private {
    height: 340px;
}
</style>
