<!-- 标准产品 -->
<template>
    <div class="list-ctandard">
        <van-pull-refresh class="refresh-content" v-model="isLoading" @refresh="onRefresh">
            <div v-for="(item, index) in sectionList" :key="index">
                <template>
                    <div v-if="item.totalList.length" class="section pad-t12">
                        <div class="section-header">
                            <span class="section-header-title line-elipsis">{{ item.title }}</span>
                            <multi-img
                                class="section-header-img"
                                v-if="item.totalList.length > item.limitCount"
                                :name="item.list.length > item.limitCount ? '12_icon_arrow_up' : '12_icon_arrow_down'"
                                directory="common"
                                @click="headerClickAction(item)"
                            />
                        </div>
                        <specialCustomBills v-if="item.key === 'specialCustomBill'" :list="item.list"></specialCustomBills>
                        <interestFloatBills v-else-if="item.key === 'floatInterestBill'" :list="item.list"></interestFloatBills>
                        <fcnBills v-else-if="item.key === 'fcnBills'" :list="item.list" :bestItem="bestItem" @handlerSort="handlerSort"></fcnBills>
                        <interestBills v-else :list="item.list" :isLinkedBill="item.isLinkedBill"></interestBills>
                    </div>
                </template>
            </div>
            <!-- <div style="height: 20px"></div> -->
            <div v-show="isEmpty()" class="list-empty">
                <multi-img name="empty-status" directory="common" />
                <span>{{ $t('follow.noDataText') }}</span>
            </div>
        </van-pull-refresh>
    </div>
</template>

<script>
import { getBillsList, getCustomProductList, getBillsMarketingList } from '@/apis/fund/note'
import { NoteInquiryDaily } from '@/apis/fund/noteApi'
import { Sticky } from 'vant'
import interestBills from './components/interestBills.vue'
import interestFloatBills from './components/interestFloatBills.vue'
import specialCustomBills from './components/specialCustomBills.vue'
import fcnBills from './components/fcnBills.vue'

export default {
    name: 'ListStandard',
    mixins: [],
    components: {
        specialCustomBills,
        interestBills,
        interestFloatBills,
        fcnBills,
        [Sticky.name]: Sticky,
    },
    props: {},
    data() {
        return {
            isLoading: false,
            bestItem: {},
            customSection: {
                title: this.$t('fcn.specialCustomBill'),
                totalList: [],
                list: [],
                key: 'specialCustomBill',
                limitCount: 2,
                isLinkedBill: false,
            },
            kmh1Section: {
                title: this.$t('fcn.kmhBill1'),
                totalList: [],
                list: [],
                key: 'kmhBill1',
                limitCount: 5,
                isLinkedBill: false,
            },
            kmh2Section: {
                title: this.$t('fcn.kmhBill2'),
                totalList: [],
                list: [],
                key: 'kmhBill2',
                limitCount: 5,
                isLinkedBill: false,
            },
            kmh3Section: {
                title: this.$t('fcn.kmhBill3'),
                totalList: [],
                list: [],
                key: 'kmhBill3',
                limitCount: 5,
                isLinkedBill: false,
            },
            fixSection: {
                title: this.$t('fcn.fixInterestBill'),
                totalList: [],
                list: [],
                key: 'fixInterestBill',
                limitCount: 5,
                isLinkedBill: false,
            },
            floatSection: {
                title: this.$t('fcn.floatInterestBill'),
                totalList: [],
                list: [],
                key: 'floatInterestBill',
                limitCount: 5,
                isLinkedBill: false,
            },
            fcnSection: {
                title: this.$t('fcn.FCNBills'),
                totalList: [],
                list: [],
                key: 'fcnBills',
                limitCount: 5,
                isLinkedBill: false,
            },
            marketingSections: [],
        }
    },
    computed: {
        sectionList() {
            return [
                this.customSection,
                ...this.marketingSections,
                this.kmh1Section,
                this.kmh2Section,
                this.kmh3Section,
                this.fixSection,
                this.floatSection,
                this.fcnSection,
            ]
        },
    },
    watch: {
        '$root.isLogin': {
            handler(v) {
                if (typeof v === 'boolean' && v) {
                    this.onRefresh()
                }
            },
        },
    },
    created() {
        this.onRefresh()
    },
    mounted() {},
    destroyed() {},
    filters: {},
    methods: {
        isEmpty() {
            return (
                this.sectionList.reduce((prev, cur) => {
                    return prev + cur.totalList.length
                }, 0) === 0
            )
        },
        //展开折叠列表
        headerClickAction(item) {
            const limitCount = item.limitCount
            if (item.totalList.length > limitCount) {
                if (item.list.length > limitCount) {
                    item.list = item.totalList.slice(0, limitCount)
                } else {
                    item.list = item.totalList
                }
            }
        },

        async onRefresh() {
            this.getFloatListData()
            this.getFixListData()
            this.getCustomListData()
            this.getFcnListData()
            this.getKmh1ListData()
            this.getKmh2ListData()
            this.getKmh3ListData()
            this.getMarketingListData()
            this.isLoading = false
        },

        handleShowList(item) {
            if (item.totalList.length > item.limitCount) {
                item.list = item.totalList.slice(0, item.limitCount)
            } else {
                item.list = item.totalList
            }
        },
        //获取开门红1号票据
        async getKmh1ListData() {
            try {
                const params = {
                    start: 0,
                    count: 50,
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                    type: 3,
                    newYearType: 1,
                }
                const { result } = await getBillsList(params)
                console.log('ListStand -- getKmh1ListData =>', result)
                this.kmh1Section.totalList = result.list ?? []
                this.handleShowList(this.kmh1Section)
            } catch (e) {
                console.error(e)
            }
        },
        //获取开门红2号票据
        async getKmh2ListData() {
            try {
                const params = {
                    start: 0,
                    count: 50,
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                    type: 3,
                    newYearType: 2,
                }
                const { result } = await getBillsList(params)
                console.log('ListStand -- getKmh2ListData =>', result)
                this.kmh2Section.totalList = result.list ?? []
                this.handleShowList(this.kmh2Section)
            } catch (e) {
                console.error(e)
            }
        },
        //获取开门红3号票据
        async getKmh3ListData() {
            try {
                const params = {
                    start: 0,
                    count: 50,
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                    type: 3,
                    newYearType: 3,
                }
                const { result } = await getBillsList(params)
                console.log('ListStand -- getKmh3ListData =>', result)
                this.kmh3Section.totalList = result.list ?? []
                this.handleShowList(this.kmh3Section)
            } catch (e) {
                console.error(e)
            }
        },
        // 查询浮动利率列表
        async getFloatListData() {
            try {
                const params = {
                    start: 0,
                    count: 50,
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                    type: 2,
                }
                const { result } = await getBillsList(params)
                console.log('ListStand -- getFloatListData =>', result)
                this.floatSection.totalList = result.list ?? []
                this.handleShowList(this.floatSection)
            } catch (e) {
                console.error(e)
            }
        },

        // 查询浮动利率列表
        async getFixListData() {
            try {
                const params = {
                    start: 0,
                    count: 50,
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                    type: 1,
                }
                const { result } = await getBillsList(params)
                console.log('ListStand -- getFixListData =>', result)
                this.fixSection.totalList = result.list ?? []
                this.handleShowList(this.fixSection)
            } catch (e) {
                console.error(e)
            }
        },

        // 查询专属定制列表
        async getCustomListData() {
            if (!this.$root.isLogin) {
                return
            }
            try {
                const params = {
                    start: 0,
                    count: 50,
                    includesExpired: 0,
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                }
                const { result } = await getCustomProductList(params)
                console.log('ListStand -- getCustomListData =>', result)
                this.customSection.totalList = result.list ?? []
                this.handleShowList(this.customSection)
            } catch (e) {
                console.error(e)
            }
        },

        handlerSort(key, type) {
            this.getFcnListData(key, type)
        },

        async getFcnListData(key = 'coupon', type = 'desc') {
            if (!this.$root.isLogin) {
                return
            }
            try {
                const params = {
                    start: 0,
                    count: 99,
                    field: key,
                    sort: type === 'desc' ? 0 : -1,
                }
                const { result = {} } = (await NoteInquiryDaily(params)) ?? {}
                console.log('ListStand -- getFcnListData =>', result)
                this.fcnSection.totalList = result.list ?? []
                this.handleShowList(this.fcnSection)
                if (this.fcnSection.totalList.length > 0 && type === 'desc') {
                    this.bestItem = this.fcnSection.totalList[0]
                }
            } catch (e) {
                console.error(e)
            }
        },

        // 票据产品营销列表
        async getMarketingListData() {
            try {
                const params = {
                    subAccountId: this.$store.getters['user/getSubAccountId'],
                }
                const { result } = await getBillsMarketingList(params)
                console.log('ListStand -- getMarketingListData =>', result)
                const sections = []
                let index = 0
                if (result.list?.length) {
                    for (const item of result.list) {
                        sections.push({
                            title: item.marketingType ?? this.$t('fcn.markentingBill'),
                            totalList: item.productList ?? [],
                            list: [],
                            key: 'marketingBill' + index,
                            limitCount: 5,
                            isLinkedBill: true,
                        })
                        index += 1
                    }
                }
                sections.forEach(item => {
                    this.handleShowList(item)
                })
                this.marketingSections = sections
            } catch (e) {
                console.error(e)
            }
        },
    },
}
</script>

<style scoped lang="less">
.list-ctandard {
    width: 100%;
    height: 100%;
    background-color: @background-white;

    .refresh-content {
        z-index: 1;
        width: 100%;
        height: 100%;
        overflow-y: scroll;

        &::-webkit-scrollbar {
            display: none;
        }

        .section {
            .section-header {
                position: sticky;
                top: 0;
                z-index: 5;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                height: 40px;
                padding: 0 12px;
                background-color: @background-white;

                &-img {
                    width: 36px;
                    height: 36px;
                    padding: 12px 0 12px 24px;
                }

                &-title {
                    color: #2f2f2f;
                    font-weight: 700;
                    font-size: 16px;
                    line-height: 22px;
                    text-align: center;
                }
            }
        }
    }

    .list-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80%;

        img {
            width: 104px;
            height: 104px;
        }

        span {
            padding-top: 12px;
            color: #9c9c9c;
            font-weight: 400;
            font-size: 14px;
            line-height: 20px;
            text-align: center;
        }
    }
}
</style>
