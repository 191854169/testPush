<template>
    <div class="risk">
        <div class="risk-title">
            <span>{{ isPublic ? '' : $t('profit') }}{{ $t('riskIndicator') }}</span>
            <multi-img v-if="!isPublic" name="icon-tips" directory="common" @click="showTips"></multi-img>
        </div>
        <div class="risk-content">
            <Table class="risk-table" :data="list" :columns="columns" :rowStyle="rowStyle" :showEmptyTip="false" :canPullDown="false">
                <template v-slot:indicator="props">
                    <span class="indicator-font">{{ props.item.indicator }}</span>
                </template>
            </Table>
        </div>
        <empty v-if="finished && list.length === 0"></empty>
        <p v-if="isPublic" class="risk-remark">{{ $t('riskRemark') }}</p>
    </div>
</template>
<script>
import Empty from '@/components/Empty.vue'
import Table from '@/components/Table.vue'
import { getRiskIndicator } from '@/apis/fund/fund'
export default {
    name: 'risk',
    components: {
        Empty,
        Table,
    },
    data() {
        return {
            symbol: this.$route.query.symbol,
            type: this.$route.query.type,
            finished: false,
            list: [],
            rowStyle: {
                height: '0.4rem',
                'font-size': '14px',
                color: '#2F2F2F',
            },
        }
    },
    computed: {
        isPublic() {
            return this.type === 'public'
        },
        keyMap() {
            return this.isPublic
                ? {
                      returnYear: this.$t('averageReturnYear'),
                      maxDrawDown: this.$t('maxDrawDown'),
                      stdDeviationYear: this.$t('deviationYear'),
                      sharpRatio: this.$t('sharpRate'),
                      alpha: 'α',
                      beta: 'β',
                      rSquare: this.$t('rSquare'),
                  }
                : {
                      returnYear: this.$t('returnYear'),
                      stdDeviationYear: this.$t('stdDeviationYear'),
                      maxDrawDown: this.$t('maxDrawDown'),
                      sharpRatio: this.$t('sharpRate'),
                      alpha: 'α',
                      rSquare: this.$t('rSquare'),
                      calmarRatio: this.$t('calmarRate'),
                      sortinoRatio: this.$t('sortinoRate'),
                  }
        },
        columns() {
            return this.isPublic
                ? [
                      {
                          title: this.$t('indicator'),
                          key: 'indicator',
                          slot: true,
                      },
                      {
                          title: this.$t('nearOneYear'),
                          key: 'y1',
                      },
                      {
                          title: this.$t('nearThreeYear'),
                          key: 'y3',
                      },
                      {
                          title: this.$t('nearFiveYear'),
                          key: 'y5',
                      },
                  ]
                : [
                      {
                          title: this.$t('indicator'),
                          key: 'indicator',
                          slot: true,
                      },
                      {
                          title: '1' + this.$t('year'),
                          key: 'y1',
                      },
                      {
                          title: '3' + this.$t('year'),
                          key: 'y3',
                      },
                      {
                          title: this.$t('fromFoundedToDay'),
                          key: 'founded',
                      },
                  ]
        },
    },
    created() {
        this.getRiskIndicator()
    },
    methods: {
        indicatorFilter(v, sign = true) {
            return v ? `${v}${sign ? '%' : ''}` : '--'
        },
        async getRiskIndicator() {
            try {
                const { result = {} } = await getRiskIndicator({ symbol: this.symbol })
                // const list = result[`${this.isPublic ? 'pubFund' : 'priFund'}`] || []
                const list = result?.list || []
                Object.keys(this.keyMap).forEach(key => {
                    const sign = !['beta', 'rSquare', 'sharpRatio'].includes(key)
                    this.list.push({
                        indicator: this.keyMap[key],
                        y1: list[0] ? this.indicatorFilter(list[0][key], sign) : '--',
                        y3: list[1] ? this.indicatorFilter(list[1][key], sign) : '--',
                        y5: list[2] ? this.indicatorFilter(list[2][key], sign) : '--',
                        founded: list[2] ? this.indicatorFilter(list[2][key], sign) : '--',
                    })
                })
            } catch (e) {
                console.log('getRiskIndicator=>e:', e)
            } finally {
                this.finished = true
            }
        },
        showTips() {
            const url = `${location.origin}/wealth/fund.html#/static/indicator-declare`
            console.log('url:', url)
            if (this.$jsBridge) {
                this.$jsBridge.open({ url: encodeURIComponent(url), title: '' })
            } else {
                window.open(decodeURIComponent(url), '_blank')
            }
        },
    },
}
</script>
<style lang="less" scoped>
.risk {
    /deep/ .box {
        .fixed {
            width: 112px;
        }

        .scroll {
            .scroll-title-container {
                left: 112px;
            }

            .titleItem {
                justify-content: flex-end;
                width: 72px;
                text-align: right;
            }

            .row {
                .item {
                    width: 72px;
                    text-align: right;
                }
            }
        }
    }
}
</style>
<style scoped lang="less">
.risk {
    margin: 12px 12px 0;
    overflow: hidden;
    background: #fff;
    border-radius: 8px;

    .risk-title {
        display: flex;
        align-items: center;
        margin: 8px 0;
        padding: 7px 12px;
        color: #2f2f2f;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;

        img {
            width: 16px;
            height: 16px;
            margin-left: 8px;
        }
    }

    .risk-content {
        padding: 0 11px 0 12px;

        .indicator-font {
            color: #666;
        }

        .risk-table {
            min-height: 0;
        }
    }

    .risk-remark {
        padding: 8px 12px 16px;
        color: #9c9c9c;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
    }
}
</style>
