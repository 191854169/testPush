<template>
    <div class="profile" id="profile">
        <div class="profile-title">{{ $t('fundProfile') }}</div>
        <div class="profile-body">
            <div class="tab-content">
                <div class="profile-info__item" v-for="(key, index) in Object.keys(fundProfile)" :key="index">
                    <div class="label">{{ briefKeyMap[key]() }}</div>
                    <div class="text">{{ fundProfile[key] }}</div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { getBrief } from '@/apis/fund/fund'
import { milliFormat } from '../../../../utils'

export default {
    name: 'profile',
    components: {},
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
                brief: () => this.$t('fundBrief'),
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
                name: '',
                custodianCompany: '',
                currency: '',
                type: '',
                riskRating: '',
                minInitial: '',
                inceptionDate: '',
                lockPeriod: '',
                tradingFrequency: '',
                brief: '',
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
    computed: {},
    created() {
        this.getBrief()
    },
    methods: {
        async getBrief() {
            try {
                const res = await getBrief({ symbol: this.symbol })
                const resultKey = this.isPublic ? 'pubBrief' : 'priBrief'
                if (res.result && res.result[resultKey]) {
                    const brief = res.result[resultKey]
                    Object.keys(this.fundProfile).forEach(key => {
                        if (['type'].includes(key)) {
                            this.fundProfile[key] = this[`${key}Enum`][brief[key]]
                        } else if (['inceptionDate'].includes(key)) {
                            this.fundProfile[key] = this.$options.filters.dateFormat(brief[key])
                        } else if (['minInitial'].includes(key)) {
                            this.fundProfile[key] = `${milliFormat(brief[key])} ${brief.shareCurrency || ''}`
                        } else if (['riskRating'].includes(key)) {
                            this.fundProfile[key] = brief[key] ? `R${brief[key]}-${this.riskRating[brief[key]]}` : '--'
                        } else {
                            this.fundProfile[key] = brief[key]
                        }
                    })
                }
            } catch (e) {
                console.log('getBrief=>e:', e)
            }
        },
    },
}
</script>
<style scoped lang="less">
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
</style>
