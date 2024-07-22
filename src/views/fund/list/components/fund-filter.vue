<template>
    <div class="filter" v-show="filterShow">
        <div class="filter-overlay" @click="clearHandler"></div>
        <div class="fund-filter">
            <div class="filter-body">
                <div class="type-list" v-for="item in typeList" :key="item.type" v-show="!(!isAll && item.type === 'fundType')">
                    <div class="list-label">{{ item.typeName }}</div>
                    <div class="type-list__content">
                        <div class="type-item" v-for="(i, index) in item.items" :key="index" @click="clickHandler($event, item)">
                            <div
                                class="type-item__content"
                                :data-key="i.key"
                                :class="{ checked: filterNameMap[item.type] && filterNameMap[item.type].includes(i.key) }"
                            >
                                {{ i.name }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="filter-operation">
                <span @click="resetHandler">{{ $t('fundList.reset') }}</span>
                <span @click="successHandler">{{ $t('fundList.complete') }}</span>
            </div>
        </div>
    </div>
</template>
<script>
import { getFilterParam } from '@/apis/fund/fund.js'
import { cloneDeep } from 'lodash'

export default {
    name: 'fund-filter',
    props: {
        filterShow: {
            type: Boolean,
            default: false,
        },
        filterList: {
            type: Array,
            default: () => [],
        },
        isAll: {
            type: Boolean,
            default: true,
        },
        height: {
            type: String,
            default: '532px',
        },
    },
    data() {
        return {
            filterListCopy: [],
            typeList: [
                // item格式 { isMultiChoose: 是否多选 0/1,type,typeName, items: [{key,name}]}
                {
                    type: 'fundType',
                    typeName: this.$t('fundList.type'),
                    items: [
                        { key: 'stock', name: this.$t('fundList.stockType') },
                        { key: 'bond', name: this.$t('fundList.bondType') },
                        { key: 'mixed', name: this.$t('fundList.mixedType') },
                        { key: 'mmf', name: this.$t('cashBox') },
                        { key: 'other', name: this.$t('other') },
                    ],
                },
                {
                    type: 'currency',
                    typeName: this.$t('fundList.currency'),
                    items: [
                        { key: 'HKD', name: 'HKD' },
                        { key: 'USD', name: 'USD' },
                        { key: 'CNH', name: 'CNH' },
                        { key: 'EUR', name: 'EUR' },
                    ],
                },
                {
                    type: 'riskRating',
                    typeName: this.$t('fundList.riskLevel'),
                    items: [
                        { key: 'lowRisk', name: this.$t('fundList.lowRisk') },
                        { key: 'lowMidRisk', name: this.$t('fundList.lowMidRisk') },
                        { key: 'midRisk', name: this.$t('fundList.midRisk') },
                        { key: 'midHighRisk', name: this.$t('fundList.midHighRisk') },
                        { key: 'highRisk', name: this.$t('fundList.highRisk') },
                    ],
                },
                {
                    type: 'dividend',
                    typeName: this.$t('fundList.isDividend'),
                    items: [
                        { key: 'yes', name: this.$t('fundList.yesDividend') },
                        { key: 'no', name: this.$t('fundList.noDividend') },
                    ],
                },
                {
                    type: 'fundCompany',
                    typeName: this.$t('fundList.fundCompany'),
                    items: [],
                },
                {
                    type: 'theme',
                    typeName: this.$t('fundList.theme'),
                    items: [
                        { key: 'esg', name: this.$t('fundList.ESG') },
                        { key: 'shortBond', name: this.$t('fundList.shortBond') },
                        { key: 'realEstate', name: this.$t('fundList.realEstate') },
                        { key: 'highReturnBond', name: this.$t('fundList.highReturnBond') },
                        { key: 'health', name: this.$t('fundList.health') },
                        { key: 'financial', name: this.$t('fundList.financial') },
                        { key: 'tech', name: this.$t('fundList.tech') },
                        { key: 'energy', name: this.$t('fundList.energy') },
                        { key: 'investBond', name: this.$t('fundList.investBond') },
                        { key: 'consumer', name: this.$t('fundList.consumer') },
                        { key: 'smCompany', name: this.$t('fundList.smCompany') },
                        { key: 'resource', name: this.$t('fundList.resource') },
                    ],
                },
                {
                    type: 'area',
                    typeName: this.$t('fundList.area'),
                    items: [
                        { key: 'emerging', name: this.$t('fundList.emerging') },
                        { key: 'chinaA', name: this.$t('fundList.china') },
                        { key: 'greaterChina', name: this.$t('fundList.greaterChina') },
                        { key: 'developed', name: this.$t('fundList.developed') },
                        { key: 'europe', name: this.$t('fundList.europe') },
                        { key: 'asia', name: this.$t('fundList.asia') },
                        { key: 'global', name: this.$t('fundList.global') },
                        { key: 'india', name: this.$t('fundList.india') },
                        { key: 'meAfrica', name: this.$t('fundList.meAfrica') },
                        { key: 'usa', name: this.$t('fundList.usa') },
                        { key: 'japan', name: this.$t('fundList.japan') },
                        { key: 'hk', name: this.$t('fundList.hk') },
                    ],
                },
                {
                    type: 'style',
                    typeName: this.$t('fundList.investStyle'),
                    items: [
                        { key: 'largeValue', name: this.$t('fundList.largeValue') },
                        { key: 'largeBlend', name: this.$t('fundList.largeBlend') },
                        { key: 'largeGrowth', name: this.$t('fundList.largeGrowth') },
                        { key: 'midValue', name: this.$t('fundList.midValue') },
                        { key: 'midBlend', name: this.$t('fundList.midBlend') },
                        { key: 'midGrowth', name: this.$t('fundList.midGrowth') },
                        { key: 'smallValue', name: this.$t('fundList.smallValue') },
                        { key: 'smallBlend', name: this.$t('fundList.smallBlend') },
                        { key: 'smallGrowth', name: this.$t('fundList.smallGrowth') },
                    ],
                },
                // {
                //     type: 'mstarRating',
                //     typeName: this.$t('fundList.mstarRating'),
                //     items: [
                //         { key: 'three', name: this.$t('fundList.threeStar') },
                //         { key: 'four', name: this.$t('fundList.fourStar') },
                //         { key: 'five', name: this.$t('fundList.fiveStar') },
                //     ],
                // },
            ],
        }
    },
    computed: {
        filterNameMap() {
            const map = {}
            for (const filterItem of this.filterListCopy) {
                map[filterItem.type] = filterItem.items
            }
            return map
        },
    },
    watch: {
        filterShow(v) {
            if (v) {
                this.filterListCopy = cloneDeep(this.filterList)
            } else {
                this.filterListCopy = []
            }
        },
        filterList: {
            handler(v) {
                this.filterListCopy = cloneDeep(v)
            },
            deep: true,
            immediate: true,
        },
    },
    created() {
        // 基金公司目前写死
        this.getFilterParam()
    },
    methods: {
        async getFilterParam() {
            try {
                const res = await getFilterParam()
                const list = res.result?.list || []
                const fundCompany = this.typeList.find(item => item.type === 'fundCompany')
                fundCompany && (fundCompany.items = list[0]?.items)
            } catch (e) {
                console.log('getFilterParam=>e:', e)
            }
        },
        clickHandler(e, row) {
            const key = e.target.dataset.key
            for (const item of this.filterListCopy) {
                if (item.type === row.type) {
                    const index = item.items.indexOf(key)
                    index >= 0 ? item.items.splice(index, 1) : item.items.push(key)
                    return
                }
            }
            this.filterListCopy.push({
                type: row.type,
                items: [key],
            })
        },
        resetHandler() {
            this.filterListCopy = this.isAll
                ? []
                : this.filterListCopy.filter(item => {
                      return item.type === 'fundType'
                  })
        },
        successHandler() {
            this.$emit('search', this.filterListCopy)
        },
        clearHandler() {
            this.$emit('cancel')
        },
    },
}
</script>
<style lang="less" scoped>
.filter {
    position: absolute;
    left: 0;
    width: 100%;
    height: calc(100vh - 112px);
}

.fund-filter {
    position: relative;
    z-index: 1000;
    width: 100%;
    height: calc(100% - 106px);
    background-color: #fff;
    box-shadow: -0.5px 0 0 0 #efefef;

    .filter-body {
        position: absolute;
        top: 0;
        width: 100%;
        height: calc(100% - 49px);
        padding-top: 20px;
        overflow-y: scroll;
    }

    .type-list {
        padding: 0 12px;

        .list-label {
            height: 20px;
            color: #2f2f2f;
            font-weight: 400;
            font-size: 14px;
            font-style: normal;
            line-height: 20px;
        }

        .type-list__content {
            display: flex;
            flex-flow: row wrap;
            padding: 2px 0 24px;

            .type-item {
                width: 105px;
                height: 36px;
                margin: 6px 12px 6px 0;

                .type-item__content {
                    box-sizing: border-box;
                    color: #2f2f2f;
                    font-size: 14px;
                    line-height: 36px;
                    text-align: center;
                    background: #f8f8f8;
                    border-radius: 18px;
                }

                .checked {
                    color: @theme;
                    /* stylelint-disable-next-line number-max-precision */
                    background: @tabBackground;
                    /* stylelint-disable-next-line number-max-precision */
                }

                .disabled {
                    color: #9c9c9c;
                }
            }

            .type-item:nth-of-type(3n) {
                margin-right: 0;
            }
        }
    }

    .filter-operation {
        position: absolute;
        bottom: 0;
        display: flex;
        place-content: center space-around;
        align-items: center;
        width: 100%;
        height: 49px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 59px;
        background: #fff;
        box-shadow: inset 0 0.5px 0 #efefef;

        span:nth-of-type(2) {
            color: @theme;
        }
    }
}

.filter-overlay {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 1);
    opacity: 0.3;
}
</style>
