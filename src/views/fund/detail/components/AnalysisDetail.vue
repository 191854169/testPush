// 分析明细
<template>
    <div class="analysis-detail card">
        <header>
            <h3 class="title">{{ $t('radar.analysisDetail') }}</h3>
            <button class="view-detail" @click="viewMore">
                <span>{{ $t('radar.viewDetail') }}</span>
                <multi-img name="icon_arrow_left" directory="fund"></multi-img>
            </button>
        </header>
        <fosun-table class="outter-table" :data="list" :columns="columns" :showEmptyTip="false" :canPullDown="false">
            <template v-slot:label="props">
                <span class="label-column">{{ props.item.label }}</span>
            </template>
            <template v-slot:value="props">
                <span v-if="props.item.needRiseFall && props.item.value" v-riseFall="{ value: props.item.value }"></span>
                <span v-else>{{ props.item.value | floatToRatioFilter(props.item.filterOptions) }}</span>
            </template>
            <template v-slot:average="props">
                <span v-if="props.item.needRiseFall && props.item.average" v-riseFall="{ value: props.item.average }"></span>
                <span v-else>{{ props.item.average | floatToRatioFilter(props.item.filterOptions) }}</span>
            </template>
            <template v-slot:ranking="props">
                <span>{{ props.item.ranking }}</span>
            </template>
        </fosun-table>
    </div>
</template>

<script>
import FosunTable from '@/components/Table.vue'
import { FUND_RADAR_MAP } from '../../config/common'
import { floatToRatio } from '@/utils'
export default {
    name: 'analysis-detail',
    props: {
        period: {
            type: String,
            default: 'y1',
        },
    },
    components: {
        FosunTable,
    },
    data() {
        return {
            list: FUND_RADAR_MAP.options.map(({ key, value }) => {
                return {
                    key,
                    label: value,
                    needRiseFall: [FUND_RADAR_MAP.keysMap.yield, FUND_RADAR_MAP.keysMap.upCapture, FUND_RADAR_MAP.keysMap.downCapture].includes(key),
                    filterOptions: { sign: false },
                }
            }),
            columns: [
                {
                    title: this.$t('radar.dimension'),
                    key: 'label',
                    fixed: true,
                    slot: true,
                    className: 'fixed-column',
                },
                {
                    title: this.$t('selfFund'),
                    key: 'value',
                    slot: true,
                    className: 'ayalysis-detail right-column',
                },
                {
                    title: this.$t('sameAverage'),
                    key: 'average',
                    slot: true,
                    className: 'ayalysis-detail right-column',
                },
                {
                    title: this.$t('radar.ranking'),
                    key: 'ranking',
                    slot: true,
                    className: 'ayalysis-detail right-column',
                },
            ],
        }
    },
    watch: {
        period: {
            handler(v) {
                this.getDetail(v)
            },
            immediate: true,
        },
        periodMap: {
            handler() {
                this.getDetail()
            },
            deep: true,
        },
    },
    computed: {
        periodMap() {
            return this.$parent?.$refs?.radarMapRef?.periodMap
        },
        radarData() {
            return this.periodMap?.[this.period] || {}
        },
    },
    filters: {
        floatToRatioFilter(v, options = {}) {
            return floatToRatio(v, options)
        },
    },
    methods: {
        getDetail() {
            try {
                const { radarData = {}, categoryRadarData = {} } = this.radarData
                this.list = this.list.map(i =>
                    Object.assign({}, i, {
                        value: radarData[i.key]?.value || undefined, // '' => undefined是为了兼容floatToRatio中判断number包含了''
                        average: categoryRadarData[i.key]?.value || undefined,
                        ranking:
                            radarData[i.key]?.rank && categoryRadarData[i.key]?.size
                                ? `${radarData[i.key]?.rank}/${categoryRadarData[i.key]?.size}`
                                : '--',
                    })
                )
            } catch (e) {
                console.error(e)
            }
        },

        viewMore() {
            const categoryId = this.radarData?.categoryRadarData?.symbol
            const period = this.period
            const url = `${location.origin}${location.pathname}#/analysis-detail?categoryId=${categoryId}&period=${period}`
            const THSurl = `${location.origin}${location.pathname}#/analysis-detail?categoryId=${categoryId}`
            if (this.$openPageInThs(THSurl)) return
            if (this.$jsBridge) {
                return this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            }
            this.$router.push(`/analysis-detail?categoryId=${categoryId}&period=${period}`)
        },
    },
}
</script>

<style scoped lang="less">
.card {
    margin: 12px 12px 0;
    padding: 15px 12px 12px;
    background: #fff;
    border-radius: 8px;
    user-select: none;
}

.analysis-detail {
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 7px;

        .title {
            color: #2f2f2f;
            font-weight: 700;
            font-size: 16px;
            line-height: 22px;
        }

        .view-detail {
            display: flex;
            align-items: center;
            background: none;
            border: none;
            outline: none;

            span {
                margin-right: 4px;
                color: #666;
                font-size: 12px;
                line-height: 16px;
            }

            img {
                width: 12px;
            }
        }
    }

    /deep/ .outter-table {
        .fixed {
            width: 85px;

            .title {
                padding: 0;
                line-height: 24px;
            }
        }

        .fixed-body {
            .label-column {
                color: #666;
                font-size: 14px;
                line-height: 20px;
            }
        }

        .scroll {
            flex: 1 0 auto;

            .title .titleItem {
                color: #9c9c9c;
            }

            &-title-container {
                left: 85px;

                .title {
                    height: 24px;
                    padding-bottom: 0;
                }
            }
        }

        .fixed-column,
        .right-column {
            color: #9c9c9c;
            font-size: 12px;
            line-height: 16px;
        }

        .right-column {
            flex: 1 0 77px;
            margin-left: 6px;
            color: #2f2f2f;
            text-align: right;

            &:first-child {
                flex: 1 0 67px;
                margin-left: 6px;
            }
        }

        .item {
            height: 40px;
            font-size: 14px;
        }
    }
}
</style>
